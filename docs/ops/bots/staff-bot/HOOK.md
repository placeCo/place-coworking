# Hook for the live Code.gs («Place TG Bridge»): staff commands

09.10.2026 ICT. Add **StaffCommands.gs** as a new file (paste it unchanged) and make **1 edit to Code.gs**. Don't replace Code.gs. Don't touch TOKEN / OPS_URL / OPS_AUTH, Photo.gs, Line.gs, Renewals.gs or the triggers.

## Important: there's no Telegram `doPost` in the bridge
@PlaceLeadBot is read by **`poll()`** (time trigger every minute, `getUpdates`). The only `doPost` in the project is the **LINE** webhook (Line.gs). So the hook goes into the `poll()` loop, not into a doPost. **Don't** call `setWebhook` for @PlaceLeadBot: it would stop `getUpdates` and break the bridge.

The anchor below occurs **exactly once** in the live backup (`/workspace/backup/bridge-Code.gs.20261001-110825`), the repo template (`docs/ops/tg-bridge/Code.template.gs`) and the photo-hooked working copy (`/workspace/tg-bridge-photo/Code.gs`). Same for `var tok = props.getProperty('TOKEN') || TOKEN;` (the `tok` variable used below). If the anchor isn't found verbatim, stop and report. Don't improvise.

## Hook 1: staff commands first (ADD AFTER)
Find (exact, existing line inside `poll()`):
```js
      if (!text) continue; // service messages (joins etc.)
```
Add **immediately after** it:
```js
      try { if (typeof handleStaffCommand_ === 'function' && handleStaffCommand_(m, tok, !!(u.edited_message || u.edited_channel_post))) continue; } catch (e) { Logger.log('STAFF_ERR ' + e); }
```

What it does:
- `handleStaffCommand_` returns **true** only for `/help /prices /renewals /bookings /light /ac` sent by staff (Tangmo, Leena, George, or the TEAM usernames from Code.gs, plus Script Property `STAFF_IDS`). The script answers in the same chat and writes one row to the Place Inbox tab **`staff-cmd`**. `continue` then skips the email, the queue row and the Ops wake for that message only.
- In every other case it returns **false** and poll() runs exactly as today: `/start` WELCOME, email, queue, photo, orders, `opsNeeded_` → Ops wake. That covers any other text, unknown commands, non-staff senders, commands addressed `@otherbot`, and a command that hits an error (the user gets "failed, passed to Ops").
- An edited command is swallowed (true) and not re-run.
- The `typeof` guard plus try/catch mean that if StaffCommands.gs is missing or broken, poll() behaves as before.

## Optional: bookings source
`/bookings` uses `bookingsToday_()` from **`docs/ops/handover/bookings-today.gs`**, a read-only reader of «Events and booking» (`1BSwm4sY-ksXjFNEEsAdyiWmUDzgbQlJpL_dh9JIdZAc`, tested in the handover test project). To enable it, add that file unchanged as a new file `BookingsToday` (its globals are `BK_*`/`bk*`, no clashes). Without it, `/bookings` answers "not installed yet". Known data gap: on 29.09 the «Meeting room» grid ended at 30.09.2026, so the reply may show `⚠️ Meeting room: grid ends …` until the sheet gets October columns.

## Script Properties to add (Project Settings → Script properties)
| Key | Value |
| --- | --- |
| `TUYA_ACCESS_ID`, `TUYA_ACCESS_SECRET`, `TUYA_ENDPOINT` | same three values as `~/.config/place/tuya.env` on the box. A human pastes them into the editor; never put them in chat, code or the repo |
| `TUYA_GROUPS` | JSON device map, see STAFF-COMMANDS.md. Until it's set, `/light` and `/ac` answer with an error and fall through to Ops |
| `STAFF_IDS` | optional, extra Telegram user ids (comma-separated) |
| `DEVICE_IDS` | optional; if set, only these user ids may use `/light` and `/ac` |

## After the edit (in the editor)
1. Save. If Save shows a syntax error, undo and report.
2. Run `staffDryRun` → the log shows the help text, prices, renewals (or the "not installed" note), bookings, `stranger handled=false` and `unknown /foo handled=false`. It sends nothing to Telegram and writes nothing.
3. After setting the Tuya properties, run `staffTuyaDevices` → the log lists the devices (read-only) and `TUYA_DEVICES 13`. Approve the external-request scope if asked.
4. No new deployment and no new trigger: `poll` picks up the saved code.
5. Test from your own account in a private chat with @PlaceLeadBot: `/help`, `/prices`, `/renewals`, `/light status`.

## Rollback
Delete the added line (or StaffCommands.gs: the `typeof` guard turns the line into a no-op).
