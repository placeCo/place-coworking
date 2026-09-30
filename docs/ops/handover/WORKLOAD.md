# WORKLOAD — admin and manager time per task (estimates)

Built 30.09.2026 from DUTY-MAP.md, CHECKLISTS-OPEN-CLOSE.md (opening / closing / rounds), STAGES-5-6.md, STATUS.md,
AUTOMATION-NEXT.md, Loyverse receipts 30.08–29.09 and Events and booking (September).
Purpose: a shared factual base for George and Lena to discuss workload. **Every minute value is an estimate**, rounded to
5 min; the basis is in each row. Where there is no data it says «no data». Please correct the numbers that look wrong —
the totals recalculate (`python3 workload/build_workload.py`).

Files: [`workload/WORKLOAD.csv`](workload/WORKLOAD.csv) (comma) · [`workload/WORKLOAD.tsv`](workload/WORKLOAD.tsv)
(tab — open it, select all, paste into cell A1 of a Google Sheet) · generator `workload/build_workload.py`.

## How to read it

- **Roles:** morning admin = shift A 08:00–17:00 (tasks of mid shift B 11–20 before 17:00 are counted here);
  evening admin = shift C 14:00–23:00; manager = Lena (approved roles + proposals marked PROPOSAL).
  Admin figures are per shift (the role, whoever works it); manager figures are per week.
- **Before** = everything done by hand (no bot, no removals). **After** = after go-live of the automations already built
  (bot already live + TEST modules deployed), removed items gone. New work that comes with automation (answering the TG
  checklist) is included in «after».
- **Status:** manual · automated by bot (already live) · automated after go-live (built/tested, not yet live) · removed ·
  paused (rounds, paused by George 29.09: shown, **not counted** in totals).
- Front desk (sales, bar, messages) is demand-driven; it is based on Loyverse counts × minutes per item.
- Not included (other owners): utilities and cash deposit (George's Thai partner), timesheet/payroll (Place Ops → Pat),
  accounting and bank (George), cleaners, cook, Som.

## Totals

| role | before | after go-live | if rounds resume | shift length |
|---|---|---|---|---|
| morning admin | **≈ 5.1 h per shift** (304 min) | **≈ 4.8 h per shift** (290 min) | +0.5 h | 9 h |
| evening admin | **≈ 5.6 h per shift** (335 min) | **≈ 5.3 h per shift** (318 min) | +0.3 h | 9 h |
| manager (Lena) | **≈ 10 h per week** (598 min) | **≈ 7.4 h per week** (443 min) | — | — |

What is in the admin totals:
- Front desk (sales + bar + messages): ≈ 2.3 h per shift for each role, the same before and after (not automated).
- Checklists, kitchen, events, cleaning: ≈ 2.7 h (morning) / ≈ 3.3 h (evening) before; after go-live about 15–20 min
  less per shift. Automation saves little admin time, because most of it is physical work (floors, cash, cleaning).
- The rest of a 9 h shift is not listed: waiting for guests, breaks, unplanned requests. This file does not measure
  those; a one-week time log per shift would.
- Manager: most of the saving (≈ 2.6 h/week) comes from coverage checks, leave, issues follow-up and checklist control.
  The largest manager item, «senior on site» (3.5 h/week), is an estimate with no data behind it.

## 5 biggest time items (before, both admin roles together)

| # | item | ≈ time | status | what would shrink it |
|---|---|---|---|---|
| 1 | Guest service: sales, payments, Loyverse (MA12, EA12) | ≈ 110 min/day | manual | Order-and-pay without the counter (the orders bridge already carries orders), more prepaid passes instead of single payments |
| 2 | Bar drinks (MA13, EA13) | ≈ 105 min/day (~31 drinks/day) | manual | First confirm who actually makes drinks; shorter drink menu / pre-batched cold drinks; if a barista covers the 17–21 peak, this moves off the admins |
| 3 | Guest/lead messages and calls (MA14, EA14) | ≈ 60 min/day (no data) | manual | Ready answers / pinned price list and FAQ; later a bot auto-reply for prices and hours (not built) |
| 4 | Cleaning: hourly tidy-up + closing trash/kitchen (MA18, EA18, EA09) | ≈ 60 min/day | manual | Cleaners' hours extended into the evening, or a dishwasher; a fixed «clean as you go» rule already exists |
| 5 | Meeting room / event setup and cleanup (MA16, EA15) | ≈ 45 min/day (~16 bookings/week) | manual | Standard layouts with a photo, organiser does part of the setup, setup fee for large events; Lena's event prep (MG07) gets a reminder after go-live |

Also visible: batch entry of ~15 free drinks per evening in Loyverse (EA07, ≈ 15 min/day) — would disappear if free
drinks were entered at the moment they are made. Manager's biggest item: senior on site (MG08, ≈ 30 min/day, no data).

## Open assumptions to check with Lena

1. Admins make the bar drinks (MA13/EA13) — if not, admin time drops by ≈ 45–60 min per shift.
2. Number of offices for electricity bills (6 assumed; Office rent registry is empty).
3. Makro: 3 orders/deliveries per week assumed.
4. Leave requests: 2 per week assumed; floor events: 3 per week assumed.
5. Minutes per receipt (2) and per drink (3) — a one-day stopwatch check would replace these.

## Morning admin (per shift)

| id | task | freq | occ/wk | min/occ before → after | min/wk before → after | status | basis (all = estimate) |
|---|---|---|---|---|---|---|---|
| MA01 | Lights, AC/fans, windows, TV/music, mosquito devices (O1, O2, O4, O13, O14) | shift | 7 | 15 → 15 | 105 → 105 | manual | estimate: 5 floors, ~3 min per floor |
| MA02 | Toilets, floor 3, corridors, reception check (O5-O8) | shift | 7 | 20 → 20 | 140 → 140 | manual | estimate: 5 floors, ~4 min per floor |
| MA03 | Count change float + open Loyverse shift (O9, O10) | shift | 7 | 10 → 10 | 70 → 70 | manual | estimate |
| MA04 | Showcase: light, expiry dates, 50% labels, photo, dessert count (O11, K1-K3) | shift | 7 | 10 → 10 | 70 → 70 | manual | estimate |
| MA05 | Showcase order to the cook (O12) | shift | 7 | 5 → 1 | 35 → 7 | automated after go-live | estimate; draft order by Loyverse worker (not deployed), admin only checks |
| MA06 | Locker dates (O15) | shift | 7 | 5 → 5 | 35 → 35 | manual | estimate |
| MA07 | Check today's events and bookings (O16) | shift | 7 | 5 → 1 | 35 → 7 | automated after go-live | estimate; bookings-today in the 10:07 summary (B, tested) |
| MA08 | Passes expiring today/tomorrow, renewal reminders, resident messages (O17, K4, Z3) | shift | 7 | 15 → 10 | 105 → 70 | automated by bot | estimate; renewal reminders already sent by checkAndSendReminder (live) |
| MA09 | Report breakdowns to «Тех вопросы» (O18) | shift | 7 | 5 → 5 | 35 → 35 | manual | estimate |
| MA10 | Makro delivery: check goods against the receipt, photos (O19, D1-D4) | per event | 3 | 15 → 15 | 45 → 45 | manual | estimate; deliveries per week unknown, assumed 3 |
| MA11 | Dessert order before 12:00 (Z1, Z2) | shift | 7 | 5 → 5 | 35 → 35 | manual | estimate |
| MA12 | Guest service: sales, payments, Loyverse (≈30 receipts 08-17) | shift | 7 | 60 → 60 | 420 → 420 | manual | estimate: ~2 min per receipt; count from Loyverse 30.08-29.09 (~30 receipts/day 08:00-16:59) |
| MA13 | Bar drinks (coffee, smoothies) ≈15 per shift | shift | 7 | 45 → 45 | 315 → 315 | manual | estimate: ~3 min per drink; Loyverse ~31 bar drinks/day, split by time; ASSUMES admins make drinks (confirm with Lena) |
| MA14 | Guest/lead messages and calls (TG, IG, phone) | shift | 7 | 30 → 30 | 210 → 210 | manual | estimate, no data |
| MA15 | Unpaid ❌ orders follow-up (daytime part) | shift | 7 | 5 → 5 | 35 → 35 | manual | estimate |
| MA16 | Meeting room / event setup and cleanup (E1-E5), daytime share | per event | 8 | 20 → 20 | 160 → 160 | manual | estimate: ~20 min per booking; Events and booking Sept: 69 bookings/30 days ≈ 16/week, half in the day |
| MA17 | Handover to the next shift: cash together, ❌, bookings, open issues (H1-H7) | shift | 7 | 10 → 10 | 70 → 70 | manual | estimate |
| MA18 | Hourly tidy-up / dishes (oral rule) | shift | 7 | 20 → 20 | 140 → 140 | manual | estimate, no data |
| MA19 | Weekly tasks: power banks, storage, drinks stock, cables, broken lamps (W1-W5) | week | 1 | 30 → 30 | 30 → 30 | manual | estimate |
| MA20 | Answer the bot checklist in TG (ticks + photos) for opening | shift | 7 | 0 → 5 | 0 → 35 | automated after go-live | estimate; NEW work that comes with the TG checklist |
| MA21 | Day rounds 11:00 / 13:00 / 15:00 (R1-R6, S1-S2) | shift | 7 | 30 → 30 | 0 → 0 | paused | estimate: 3 × 10 min; paused by George 29.09, not in totals |
| MA22 | Wi-Fi speedtest floors 1 and 3 (O3, R5) | shift | 7 | 5 → 0 | 35 → 0 | removed | estimate; removed 29.09: internet is monitored automatically |

## Evening admin (per shift)

| id | task | freq | occ/wk | min/occ before → after | min/wk before → after | status | basis (all = estimate) |
|---|---|---|---|---|---|---|---|
| EA01 | 16:00 cook stock list, vegetables, drinks/ice-cream check (P1-P4) | shift | 7 | 15 → 15 | 105 → 105 | manual | estimate |
| EA02 | Makro order for tomorrow (C16) when needed | per event | 3 | 15 → 15 | 45 → 45 | manual | estimate; assumed 3 orders/week, otherwise «не нужно» |
| EA03 | Chairs in, plants watered (C1, V1, V3) | shift | 7 | 20 → 20 | 140 → 140 | manual | estimate |
| EA04 | Showcase photo, 22:45 closing announcement (C2, C3) | shift | 7 | 5 → 5 | 35 → 35 | manual | estimate |
| EA05 | Close unpaid ❌ orders of the day (C4, U1-U3) | shift | 7 | 10 → 5 | 70 → 35 | automated after go-live | estimate; 21:00 unpaid-orders check by the bot (5.1.6, in TEST) |
| EA06 | Cash count 23:00, Loyverse cash/transfer/card check, close shift, note differences (C5-C7) | shift | 7 | 20 → 15 | 140 → 105 | automated by bot | estimate; Loyverse reconciliation by the worker (A), counting stays manual |
| EA07 | Batch entry of free drinks for staff/owner/friends in Loyverse (≈15 zero-price receipts/day) | shift | 7 | 15 → 15 | 105 → 105 | manual | estimate: ~1 min per receipt; Loyverse: 455 «Discount 100%» receipts in 30 days, 96% entered 17-22h |
| EA08 | 24/7 residents still inside (C8) | shift | 7 | 3 → 2 | 21 → 14 | automated after go-live | estimate; 24/7 list from Resident info K:M (columns added 30.09) |
| EA09 | Trash all floors, kitchen clean, dishes (C9) | shift | 7 | 20 → 20 | 140 → 140 | manual | estimate |
| EA10 | Windows, AC, lights/TV/music, charging, lock door (C10-C14) | shift | 7 | 15 → 15 | 105 → 105 | manual | estimate: 5 floors |
| EA11 | Incident log of the day (C15) | shift | 7 | 5 → 3 | 35 → 21 | automated after go-live | estimate; issues-log keeps open issues |
| EA12 | Guest service: sales, payments, Loyverse (≈24 paid receipts 14-23) | shift | 7 | 50 → 50 | 350 → 350 | manual | estimate: ~2 min per receipt; Loyverse ~39 receipts/day from 14:00 minus ~15 zero-price batch entries |
| EA13 | Bar drinks ≈20 per shift | shift | 7 | 60 → 60 | 420 → 420 | manual | estimate: ~3 min per drink; Loyverse ~25 bar drinks/day after 14:00; ASSUMES admins make drinks |
| EA14 | Guest/lead messages and calls | shift | 7 | 30 → 30 | 210 → 210 | manual | estimate, no data |
| EA15 | Meeting room / event setup and cleanup (E1-E5), evening share | per event | 8 | 20 → 20 | 160 → 160 | manual | estimate: ~20 min per booking, ≈16 bookings/week |
| EA16 | Receive handover (H1-H7) | shift | 7 | 5 → 5 | 35 → 35 | manual | estimate |
| EA17 | Prepare cash + count sheet for the Thai partner (every 3 days) | per event | 2.33 | 10 → 10 | 23 → 23 | manual | estimate; reminder by the bot after go-live, counting stays manual |
| EA18 | Hourly tidy-up / dishes (oral rule) | shift | 7 | 20 → 20 | 140 → 140 | manual | estimate, no data |
| EA19 | Answer the bot checklist in TG (ticks + photos) for closing | shift | 7 | 0 → 5 | 0 → 35 | automated after go-live | estimate; NEW work that comes with the TG checklist |
| EA20 | Rounds 19:00 / 21:00 (R1-R6) | shift | 7 | 20 → 20 | 0 → 0 | paused | estimate: 2 × 10 min; paused by George 29.09, not in totals |
| EA21 | Toilets round 16:30 (T1-T3) | shift | 7 | 10 → 0 | 70 → 0 | removed | estimate; removed 29.09 (cleaners until ~17:00) |

## Manager — Lena (per week)

| id | task | freq | occ/wk | min/occ before → after | min/wk before → after | status | basis (all = estimate) |
|---|---|---|---|---|---|---|---|
| MG01 | Next month schedule in Schedule 26 (with Place Ops) | month | 0.23 | 120 → 120 | 28 → 28 | manual | estimate: 10 staff × 30 days |
| MG02 | Weekly swaps and corrections | week | 1 | 30 → 30 | 30 → 30 | manual | estimate |
| MG03 | Coverage check: hours without an admin, two on leave the same day | week | 1 | 30 → 5 | 30 → 5 | automated after go-live | estimate; schedule-coverage digest (draft) |
| MG04 | Leave requests: decide, check coverage, mark in the schedule (with George) | per event | 2 | 10 → 2 | 20 → 4 | automated after go-live | estimate; ~2 requests/week assumed; bot request/approve/mark (TEST) |
| MG05 | Electricity bills to office tenants (approved role) | month | 0.23 | 90 → 70 | 21 → 16 | automated after go-live | estimate: ~6 offices × 15 min (number of offices to confirm; Office rent registry empty); bot creates the task on the day |
| MG06 | Office rent reminders, deposits, registry (PROPOSAL for Lena; owner Place Ops) | month | 0.23 | 60 → 20 | 14 → 5 | automated after go-live | estimate; stage6 drafts, human reviews |
| MG07 | Event preparation: organiser, room, equipment (approved 30.09) | per event | 3 | 20 → 15 | 60 → 45 | automated after go-live | estimate; ~3 floor events/week assumed; reminder from bookings (spec only) |
| MG08 | Senior on site: staff questions, guest escalations, coordination | day | 7 | 30 → 30 | 210 → 210 | manual | estimate, no data; the largest uncertainty |
| MG09 | Breakdowns: follow up with Som, contractors | day | 7 | 10 → 5 | 70 → 35 | automated after go-live | estimate; issues-log digest 10:07/23:10 |
| MG10 | Check who missed opening/closing items | day | 7 | 10 → 5 | 70 → 35 | automated after go-live | estimate; bot summary 23:10 / 10:07 after go-live |
| MG11 | Accounts: Wi-Fi/router, Deskimo, work phone (shared with George) | week | 1 | 30 → 20 | 30 → 20 | automated after go-live | estimate; internet monitoring after go-live (waiting for Vitya) |
| MG12 | 24/7 key register: new/expired holders, deposits | week | 1 | 15 → 10 | 15 → 10 | automated after go-live | estimate; keyholders list 22:30 after go-live |
