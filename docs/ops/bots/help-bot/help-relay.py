#!/usr/bin/env python3
"""Place Help Bot relay: Telegram long-polling -> Apps Script /exec.

Apps Script answers POST /exec with 302 (the script has already run on the
initial POST), which Telegram webhooks treat as an error. This relay calls
getUpdates and POSTs each update to the /exec URL itself, without following
the redirect (302 == success).

Config (no secrets in code): /home/box/secrets/tg-help-bot.env
  TG_HELP_BOT_TOKEN=...      bot token
  HELP_BOT_RELAY_URL=...     full /exec URL incl. ?k=<WEBHOOK_SECRET>
Log: /home/box/place-bots/help-relay.log (rotating, no secrets).
"""
import json, logging, os, sys, time
from logging.handlers import RotatingFileHandler
import requests

ENV_FILE = os.environ.get("HELP_RELAY_ENV", "/home/box/secrets/tg-help-bot.env")
LOG_FILE = os.environ.get("HELP_RELAY_LOG", "/home/box/place-bots/help-relay.log")
STATE_FILE = os.path.join(os.path.dirname(LOG_FILE), "help-relay.offset")
POLL_TIMEOUT = 50
ALLOWED = ["message", "callback_query"]


def load_env(path):
    env = {}
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return env


log = logging.getLogger("help-relay")
log.setLevel(logging.INFO)
h = RotatingFileHandler(LOG_FILE, maxBytes=512 * 1024, backupCount=2)
h.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
log.addHandler(h)
logging.getLogger("urllib3").setLevel(logging.WARNING)  # urllib3 would log URLs with token


def read_offset():
    try:
        return int(open(STATE_FILE).read().strip())
    except Exception:
        return None


def write_offset(o):
    tmp = STATE_FILE + ".tmp"
    with open(tmp, "w") as f:
        f.write(str(o))
    os.replace(tmp, STATE_FILE)


def forward(sess, url, upd):
    """POST update to /exec; 2xx or 3xx = delivered. Retries a few times."""
    body = json.dumps(upd).encode()
    for attempt in range(1, 6):
        t0 = time.monotonic()
        try:
            r = sess.post(url, data=body, headers={"Content-Type": "application/json"},
                          allow_redirects=False, timeout=60)
            dt = time.monotonic() - t0
            if r.status_code < 400:
                return r.status_code, dt
            log.warning("update %s: HTTP %s (attempt %d)", upd.get("update_id"), r.status_code, attempt)
        except requests.RequestException as e:
            log.warning("update %s: %s (attempt %d)", upd.get("update_id"), type(e).__name__, attempt)
        time.sleep(min(2 ** attempt, 30))
    return None, time.monotonic() - t0


def main():
    env = load_env(ENV_FILE)
    token, relay = env["TG_HELP_BOT_TOKEN"], env["HELP_BOT_RELAY_URL"]
    api = "https://api.telegram.org/bot%s/" % token
    sess = requests.Session()
    offset = read_offset()
    log.info("relay started pid=%d offset=%s", os.getpid(), offset)
    while True:
        try:
            params = {"timeout": POLL_TIMEOUT, "allowed_updates": json.dumps(ALLOWED)}
            if offset is not None:
                params["offset"] = offset
            r = sess.get(api + "getUpdates", params=params, timeout=POLL_TIMEOUT + 15)
            data = r.json()
            if not data.get("ok"):
                log.error("getUpdates error %s: %s", data.get("error_code"), data.get("description"))
                time.sleep(10 if data.get("error_code") == 409 else 5)
                continue
            for upd in data["result"]:
                t_recv = time.monotonic()
                kind = "callback_query" if "callback_query" in upd else ("message" if "message" in upd else "other")
                status, dt_post = forward(sess, relay, upd)
                total = time.monotonic() - t_recv
                if status is None:
                    log.error("update %s (%s) NOT delivered after retries, skipping", upd["update_id"], kind)
                else:
                    log.info("update %s (%s) -> HTTP %s post=%.2fs total=%.2fs",
                             upd["update_id"], kind, status, dt_post, total)
                offset = upd["update_id"] + 1
                write_offset(offset)
        except requests.RequestException as e:
            log.warning("getUpdates network error: %s", type(e).__name__)
            time.sleep(3)
        except Exception as e:
            log.exception("unexpected error: %s", type(e).__name__)
            time.sleep(5)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(0)
