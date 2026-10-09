# @PlaceLeadBot: staff commands without waking Ops

09.10.2026 ICT. Design plus code (`StaffCommands.gs`) for the existing project «Place TG Bridge». Nothing is deployed. Installation is one line in `poll()`, see `HOOK.md`.

## Why
Every DM to the bot, and every message from TEAM, currently wakes Ops (batched every 15 min). Routine questions such as "what's the price", "who renews today", "what's booked" or "turn off the light" don't need the AI. The script answers them in seconds at zero cost. Everything else goes to Ops as before.

## Who can use them
Tangmo `7486466296`, Leena `8944262207`, George `8503184147` (user ids), and the TEAM usernames from Code.gs (`yasozidayu`, `rufasstyle`, `dftnsss`). Script Property `STAFF_IDS` adds more. `DEVICE_IDS` (optional) limits `/light` and `/ac` to those ids only.
A command from anyone else isn't answered by the script. It goes to the queue / Ops like a normal message.
The commands work in a DM and in groups (`/prices` or `/prices@PlaceLeadBot`). A command addressed to another bot (`@otherbot`) is ignored.

## Commands
| Command | Answer | Source | Writes |
| --- | --- | --- | --- |
| `/help` | command list | in code | log row only |
| `/prices` | canon prices: Place Pass (50 / day 400 until 31.10, then 500 / week 1 800 / 10 days 2 500 → 3 500 / month 6 000 / 3 months 15 000), Office 30 000 or 20 000 on a year (address only on the annual), floors 5 and 2, up to 6 people, monitor 200 / 10 h or 1 500 / month, residents −20% meeting rooms, partner promo (code only), banned phrases. The day and 10-day prices switch automatically on 01.11.2026 | PLACE-BRIEF 09.10 + DECISIONS-LOG 09.10 | log row only |
| `/renewals` · `/renewals 2026-10-11` | today's (or that date's) renewal list, the same text admins get at 10:15: −3 days / tomorrow / today / −7 days without H, offices as an internal note | `rnBuild_()` from **Renewals.gs** (reads Resident info «Лист1») | **nothing**: doesn't write outbox and doesn't touch `RN_LAST_SENT_DATE`, so the 10:15 run is unaffected |
| `/bookings` · `/bookings tomorrow` · `/bookings 2026-10-12` | bookings for the day, one line per room, plus a warning when a grid ends | `bookingsToday_()` from **docs/ops/handover/bookings-today.gs** (Events and booking `1BSwm4sY-…`). If that file isn't in the project: "not installed yet" (TODO stub) | nothing |
| `/light` | list of light groups | `TUYA_GROUPS.light` | — |
| `/light on <group>` · `/light off <group>` | switches every device in the group, then "✅ 3/3 done" or names the failed device | Tuya Cloud `POST /v1.0/iot-03/devices/{id}/commands` | device state + log row |
| `/light status [group]` | ON/off per device (last 4 characters of the id), watts for plugs | Tuya `GET …/status` | — |
| `/ac`, `/ac on <group>`, `/ac off <group>`, `/ac status` | same, for `TUYA_GROUPS.ac` | Tuya | device state + log row |

A group name is **required** for on/off: there's no "everything at once" by default. If George wants one, add a group `all` to the JSON.
Errors (Tuya not configured, network, sheet unavailable) reply "⚠️ failed, passed to Ops" and the message goes into the normal queue / Ops wake.
Every handled command adds a row to Place Inbox → **`staff-cmd`**: `ts | chat | chat_id | from | command | result`. Handled commands are **not** emailed to info@ and **don't** get a `queue` row. That's the point: no Ops wake.

## Tuya
- Signing is ported from `~/.config/place/tuya.py`: `sign = HMAC-SHA256(secret, client_id + access_token + t + METHOD\nsha256(body)\n\npath).hex().upper()` via `Utilities.computeHmacSha256Signature`. The token is cached in `CacheService` (~2 h).
- Checked 09.10.2026 ~16:20 ICT: the JS port gives the same signature as the Python on test vectors. A **read-only** live run of the port (token + status of 3 devices, GET only, no commands) succeeded.
- On/off code: bulbs (category `dj`) use `switch_led`, plugs and the switch (`cz`, `kg`) use `switch_1`. It's detected automatically from the status and cached for 6 h.
- Keys live only in Script Properties `TUYA_ACCESS_ID` / `TUYA_ACCESS_SECRET` / `TUYA_ENDPOINT`.

### Devices in the Tuya project (read-only listing, 09.10.2026 ~16:15 ICT, all online)
| Name in Smart Life | id | type | state at check |
| --- | --- | --- | --- |
| WiFi Smart Bulb | `a3cb8e865539ec7920ukga` | bulb (dj) | off |
| WiFi Smart Bulb 2 | `a31502349b34bf10d2qz2d` | bulb (dj) | off |
| WiFi Smart Bulb 3 | `a3e22777badf41554cscny` | bulb (dj) | off |
| СВЕТОДИОДНАЯ ЛАМПОЧКА | `a34a3c8e126c71411fxrdl` | bulb (dj) | off |
| СВЕТОДИОДНАЯ ЛАМПОЧКА 3 | `a36bfbc7007a71cf07tcwm` | bulb (dj) | off |
| СВЕТОДИОДНАЯ ЛАМПОЧКА 4 | `a3600dbb053126b99d0mis` | bulb (dj) | off |
| Wifi smart1CH switch | `a3c50bdac37641e287q2a7` | 1-channel relay (kg) | off |
| Умный переключатель | `a3966222681457f2a3hk5k` | metered plug (cz) | on, 0 W |
| Умный переключатель 2 | `a3f30c23c8f1fcae05azsp` | metered plug (cz) | on, 0 W |
| Умный переключатель 3 | `a35e589185a83526ea7nty` | metered plug (cz) | off |
| Умный переключатель 4 | `a3c63ed123e402907dbuyh` | metered plug (cz) | on, 0 W |
| Умный переключатель 5 | `a332db454cf710cfd2bsw3` | metered plug (cz) | on, 0 W |
| Умный переключатель 6 | `a3ee973359939fa990papv` | metered plug (cz) | **on, ~1 250 W** (AC-sized load) |

There's **no** device called AC / air conditioner / IR remote. Neither the repo nor the box says which room each device is in, so `TUYA_GROUPS` can't be filled in honestly without George or Sasha.

### `TUYA_GROUPS` template (fill in rooms and ids, paste as one line into the Script Property)
```json
{"light":{"<room>":["<bulb id>","<bulb id>"],"<room2>":["a3c50bdac37641e287q2a7"]},
 "ac":{"<room>":["<plug id>"]}}
```
Example (assumption only, **not** confirmed): `{"light":{"bulbs":["a3cb8e865539ec7920ukga","a31502349b34bf10d2qz2d","a3e22777badf41554cscny","a34a3c8e126c71411fxrdl","a36bfbc7007a71cf07tcwm","a3600dbb053126b99d0mis"]},"ac":{"plug6":["a3ee973359939fa990papv"]}}`

⚠️ If an AC is wired through a plug, `/ac off` cuts its power at the socket instead of using the remote. For some inverter units that's a bad way to switch off. George decides whether to allow it. A proper alternative is an IR blaster (Tuya category `infrared_ac`), which needs a different API (`/v2.0/infrareds/...`) and isn't in this design.

## Not done (on purpose)
- Nothing is deployed, the live project isn't touched, no messages were sent, and no device was switched.
- `/bookings` works only after `bookings-today.gs` is added to the project.
