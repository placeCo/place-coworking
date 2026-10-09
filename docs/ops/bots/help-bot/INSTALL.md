# Place Help Bot: install

09.10.2026 ICT. This is a new client-facing Telegram bot, a separate Apps Script project. Nothing is deployed yet.
**Don't** touch «Place TG Bridge» or @PlaceLeadBot. The staff bot runs on `getUpdates` polling, so a `setWebhook` call with its token would break the bridge.

## 0. Bot
1. In Telegram, @BotFather → `/newbot`. Pick a name (e.g. *PLACE Coworking Help*) and a username ending in `bot`. Keep the token private: it goes only into Script Properties (step 2), never into code, chat or the repo.
2. Optional in BotFather: `/setdescription`, `/setabouttext` (hours 08:00–23:00 daily, WhatsApp +66 95 117 0481), `/setuserpic`.

## 1. Project
1. https://script.google.com → **New project**, account **info@placecoworking.com** → rename it to **`Place Help Bot`**.
2. Delete the default `Code.gs` content and paste the whole of `HelpBot.gs` → Save.
3. Project Settings → **Time zone `Asia/Bangkok`**.

## 2. Script Properties (Project Settings → Script properties)
| Key | Value |
| --- | --- |
| `HELP_BOT_TOKEN` | the token from BotFather (new bot only) |
| `INBOX_SHEET_ID` | `1uMHYp6d-Ji9VQj5xtESiXummBNX9bC8vTruPRQLs8jw` (Place Inbox). The tab `help-bot` is created at the end of the spreadsheet |
| `WEBHOOK_SECRET` | optional, recommended: any random string of 20+ letters/digits. It's added to the webhook URL as `?k=…` and checked in doPost |
| `MAPS_URL` | optional: overrides the built-in Google Maps link; `-` hides the map button |
| `WEBHOOK_URL` | filled in at step 4 |

## 3. Checks (no messages sent)
1. Choose `helpBotSelfTest` → Run → the log shows `SELFTEST_OK`.
2. Choose `setupHelpBot` → Run → approve the scopes (Sheets, external requests) → the log shows `TAB help-bot OK` and `SETUP_HELP_BOT_OK`. This creates the tab `help-bot` (`ts | chat_id | username | lang | text | status`) and the bot's command menu. It sends no messages.

## 4. Deploy the web app
1. **Deploy → New deployment → Web app**. Execute as **Me (info@placecoworking.com)**, Who has access **Anyone** → Deploy → copy the URL ending in `/exec`.
2. Script Properties → `WEBHOOK_URL` = that URL.
3. *(Superseded by the box relay, see below; don't run it now.)* Choose `setWebhook` → Run → the log shows `SET_WEBHOOK ok=true` and `WEBHOOK url=…/exec?k=*** pending=0 last_error=-`.
4. After a code change: **Deploy → Manage deployments → Edit → Version: New version**. The URL stays the same, so there's no need to run setWebhook again.

## 5. Test
Write `/start` to the bot, pick a language, then press every menu button and type `price`, `офис`, `เปิดกี่โมง` and `hello`. `hello` should get "we'll answer soon" plus a new row with `status=new` in `help-bot`.
`webhookInfo` → Run shows any delivery errors. Apps Script answers with a redirect, so Telegram can sometimes show a 302 in `last_error`. The bot drops repeated `update_id`s, so a retry never answers twice.

## Relay on the box (live since 09.10.2026 16:29 ICT)
Apps Script answers every POST to `/exec` with `302`. Telegram counts that as a webhook error and backs off, so replies came 1–2 minutes late. The fix: **there's no webhook now**. A small relay on the box (the persistent Linux machine) does the delivery instead:
- `/home/box/place-bots/help-relay.py` (copy: `help-relay.py` next to this file) long-polls `getUpdates` (timeout 50, `message` + `callback_query`). It POSTs each update as JSON to the `/exec?k=…` URL **without following the redirect**: the script already ran on the POST, so `302` counts as success. Then it advances the offset (saved in `help-relay.offset`). A failed POST is retried 5 times.
- Secrets live only in `/home/box/secrets/tg-help-bot.env` (chmod 600): `TG_HELP_BOT_TOKEN` and `HELP_BOT_RELAY_URL` (the full `/exec?k=<WEBHOOK_SECRET>` URL). The code holds none.
- Log: `/home/box/place-bots/help-relay.log` (rotating 512 KB × 3, no tokens). It records the HTTP status and timing for each update. A POST takes about 1.5–3 s.
- Keep-alive: `crontab` (user `box`) runs `* * * * *` and `@reboot` → `/home/box/place-bots/help-relay-ensure.sh`, which uses `flock -n help-relay.lock` so only one copy runs. The box has no init (tini), so cron itself is started from the top of `~/.bashrc` if it isn't running.
- Check: `pgrep -af help-relay`, `tail /home/box/place-bots/help-relay.log`, and `getWebhookInfo` should show `url=""`.
- ⚠️ **Do not run `setWebhook`** while the relay is up. Telegram refuses `getUpdates` while a webhook is set (409 in the log), and the 302 delays come back. A new deployment version keeps the same `/exec` URL, so the relay needs no change. If the deployment URL or `WEBHOOK_SECRET` changes, update `HELP_BOT_RELAY_URL` in the env file and kill the relay; cron restarts it within a minute.

## Who answers the handoffs
The rows in `help-bot` with `status=new` are the human queue. For now there's no notification: Ops is meant to read the tab, and the wake webhook will be wired later. Until then someone has to check the tab, or George picks a notification (see "Open questions" in the repo README).
To reply to a guest, write from the bot (Ops / outbox pattern, still to be built) or contact them via WhatsApp if they left a number. Afterwards, set `status` to `answered`.

## Editing texts
All texts are in `TEXTS` (en / ru / th) at the top of `HelpBot.gs`. Prices switch automatically on 01.11.2026 (day 400→500, 10 days 2 500→3 500). After any edit: Save → `helpBotSelfTest` → new deployment version.

## Turning it off
Relay mode: comment out the crontab lines and `pkill -f help-relay.py`. Webhook mode (old): run `deleteWebhook`, or archive the deployment.
