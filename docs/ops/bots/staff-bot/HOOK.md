# Hook for the live Code.gs («Place TG Bridge»): staff commands v2

09.10.2026 ICT. **v2 replaces the contents of the existing file StaffCommands.gs** (the v1 backup is `StaffCommands.gs.bak-20261009-v1`). poll() is **not** edited again: the line that's already live stays exactly as it is.

## Live order in `poll()` (must stay like this)
```
photoHook_ … → if (!text) continue; → handleStaffCommand_(m, tok, edited) → tuyaHookSafe_(u, m, tok) → email / queue / Ops
```
- `handleStaffCommand_` returns **true** only for staff messages it understood: slash `/help /prices /office /renewals /bookings /hours /book`, or a short plain RU/EN/TH phrase (DM: always; group: only with @PlaceLeadBot or as a reply to the bot), or a booking request `бронь …`. It replies, logs to `staff-cmd`, and poll() `continue`s.
- Light / AC / lamp / shower words (and `/light`, `/ac`, `статус`) → **false**, so `tuyaHookSafe_` gets them. v1's own `/light` `/ac` Tuya code was **removed**: Tuya.gs is the only device handler now.
- Everything else → false → normal flow.
- The existing guard line (`typeof handleStaffCommand_ === 'function'` + try/catch) remains, so a missing or broken file is a no-op.

## Install (human, in the editor; not deployed by Lead)
1. Open StaffCommands.gs, select all, paste the new file from the deploy page `staff.html`, then Save. If Save shows a syntax error, undo and report.
2. Make sure the file **BookingsToday** (`docs/ops/handover/bookings-today.gs`) is in the project. It's needed for `брони сегодня` and for checking overlaps with the grids. Without it, bookings are still saved, with the note "grid not checked".
3. Run `staffDryRun` → the log should end with `STAFF_DRYRUN 91/91 ok, failures=0`. It sends nothing and writes nothing.
4. The first `бронь …` creates the tab «Брони бот» in «Events and booking». The project's account needs edit access to that spreadsheet (Apps Script asks for the Sheets scope once if it's new).
5. No new deployment, no new trigger, no `setWebhook`.

## Script Properties
- `STAFF_IDS` (optional): extra Telegram user ids, comma-separated.
- v1's `TUYA_GROUPS` / `DEVICE_IDS` are no longer used by this file.

## Rollback
Paste `StaffCommands.gs.bak-20261009-v1` back (or delete the file: the `typeof` guard makes the hook line a no-op).
