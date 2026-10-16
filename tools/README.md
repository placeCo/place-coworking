# tools/ — box-only scripts backed up 16.10.2026

Copied from the bot box (`/workspace/...`, `/tmp/livesrv`, `~/.config/place`) so nothing lives only on one machine.
**The repo is PUBLIC.** On copy the files were sanitized: Telegram user/chat IDs → `<TG_USER_ID>` / `<TG_CHAT_ID>`,
Tuya device IDs → `<TUYA_DEVICE_ID>`, personal e-mails → `<EMAIL>`, phones → `<PHONE>`, 3BB account numbers → last 4 digits.
To redeploy, put the real values back (get them from the live Apps Script project, Tuya app / `tuya-bot` discovery, Telegram `getUpdates`).
No tokens are in any file: scripts read them from Script Properties or from files on the box (paths below).

| Path | Source on box | What |
|---|---|---|
| `apps-script/place-tg-bridge/Code.gs` | `/tmp/livesrv/code-pay.txt` (live, 16.10) | «Place TG Bridge» main: `poll()` every 1 min, Telegram → info@ (label TG-inbox) + Place Inbox `queue`, café orders, Payments Place receipts → Drive + `Payments` tab, Ops wake |
| `apps-script/place-tg-bridge/StaffCommands.gs` | `/tmp/livesrv/sc-1016d.txt` | /help /prices /office /renewals /bookings /hours for staff |
| `apps-script/place-tg-bridge/Renewals.gs` | `/tmp/livesrv/rn-1016c.txt` | daily Pass renewal reminders (`renewalsDaily`, 10:15 ICT) |
| `apps-script/place-tg-bridge/Tuya.gs` | `/workspace/tuya.gs` | floor-4 lights/AC/shower + podcast plugs via @PlaceLeadBot |
| `apps-script/place-tg-bridge/Line.gs` | `/workspace/line-webhook/Line.gs` | LINE OA @294bqkju webhook → Place Inbox «LINE» tab + TG notice |
| `apps-script/place-automations-test/` | `/workspace/clasp-test` | «PLACE automations TEST» bundle (stage6, coverage, bookings, issues, timesheet, cash, payment reminders) |
| `apps-script/place-help-bot/` | `/workspace/place-bots/help-bot` | client help bot draft (not live) |
| `loyverse/` | `/workspace/loyverse/*.py` | Loyverse API read-only pulls, daily report, chef order. Token: `/home/box/secrets/loyverse_token` |
| `accounting/` | `/workspace/accounting/**.py` | monthly Loyverse export, invoice numbering, payment vouchers, Payments Place scan |
| `line/set_webhook.sh` | `/workspace/line-webhook` | sets LINE webhook. Token: `/home/box/secrets/line.env` |
| `tuya/tuya.py` | `~/.config/place/tuya.py` | Tuya Cloud signing helper. Keys: `~/.config/place/tuya.env` |
| `place-reports/` | (already in git) | unpaid café orders report |
