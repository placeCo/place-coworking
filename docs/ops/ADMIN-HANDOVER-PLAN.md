# Handover of the Ops Manager role (Aiz Botchakorn.R, last day 30.09.2026)

Mode: every new automation starts as a TEST (report only to George and Lena in @PlaceLeadBot). It goes to the PLACE Team group only after George's OK.

| Stage | Item (job description) | What we do | Who / which bot | Access needed | Status |
|---|---|---|---|---|---|
| 0 | Handover from Aiz | 7 questions in the bot, answers into kb | Lead, @PlaceLeadBot | Aiz presses Start | waiting for Start (reminder 30.09 10:00) |
| 1 | 5.1.6 Unpaid orders | Check ❌ orders in PLACE Team every day at 21:00 | Lead + bridge + Loyverse | have it | TEST since 29.09; 21:00 TEST digest to George + Lena only |
| 2 | 5.1.7 / 5.1.8 Cash reconciliation | Cash, transfers and card totals from Loyverse vs cash in the drawer | Lead + Loyverse | have it; the shift needs to post the cash count | in progress |
| 3 | 6.1.3 Orders sheet | Bridge writes every order and its edits into the Google sheet «Заказы» | Ops (bridge Apps Script) | edit access to the bridge script | George OK 29.09; **deployed by Ops** (30.09) |
| 4 | 7.1.7 / 2.2 Open/close checklist | Checklist drafted together with George and Lena; then bot sends it, admin replies done + photo | @PlaceLeadBot | have it | drafting |
| 5 | 7.1.14 Timesheet | Method to be agreed with accounting/Lena; Aiz asked how she prepares it (bot msg 81) | Lead + Ops | info@ access to Schedule 26, accounting contact | discussing |
| 6 | 2.1.9 / 2.1.10 / 5.1.5 Offices | Contract and deposit reminders at 30/7 days, occupancy | Ops (Apps Script renewals) | tenants sheet | next |
| 7 | 2.1.5 / 10.1 Breakdowns | Issue log; morning list of what is open and what we close today (in the 10:07 run), evening report on what got done | Lead + Ops | Aiz's list of contractors | after stage 0 |
| 8 | 9.1 / 9.2 Purchases | Daily reconciliation: KA TE order (in the group) vs Makro receipt. The shift admin receives the delivery; ask that admin for the receipt after the Makro delivery photo, or at the 13:00 check (part of the existing midday run) | Lead | shift schedule (who is on shift) | next |
| 9 | 4.2 Customer requests | TG/email/LINE requests go to a queue, reply drafts go to George | Lead + Ops | LINE OA (not connected) | partly done |

Stays with a person on site (the on-site senior admin still needs to be chosen): floor rounds, keys, taking cash to the bank, kitchen, guests/conflicts, emergencies.
Not ours: Wi-Fi/routers (Lena), events/meeting room prep.

Principle (George 29.09): save energy. No separate new runs; fold the checks into the existing 10:07 / 13:00 / 21:00 / 23:10 runs.

## Rules and decisions 29–30.09.2026
- **Unpaid orders (Lena 29.09):** only orders marked ❌ count as unpaid. Unmarked = paid but not marked, or covered by a membership. Guests often pay in the evening. The 21:00 digest runs in TEST to George + Lena only.
- **Cash to bank:** done by George's Thai business partner. Nobody messages the partner without George's OK.
- **Accounting questions:** only with George's OK.

## Loyverse reconciliation 29.09.2026
- Transfers: Loyverse 13 890 ฿ vs bank 8 390 ฿ → diff 5 500 ฿.
- Cause: two receipts «Monthly pass 2nd floor» for Iurii Kurdiumov: 5-34458 at 16:06, 5 500 ฿ (50% discount, not cancelled) and 5-34459 at 16:35, 6 000 ฿. Lena asked to verify / cancel the duplicate.
- Card diff: 5 ฿.
- Net sales 29.09: 18 232 ฿.
- Note: Loyverse reports exclude voided receipts.

## Handover status (30.09.2026)
- Aiz: **last day 30.09**.
- Schedule 26: still owned by Aiz's personal Gmail; transfer to info@ requested; a backup copy exists on info@.
- Asked Aiz for emergency contacts (electrician, plumber, building security, ISP, elevator, building owner) and the fingerprint-scanner admin — pending.
- Asked Lena: fingerprint-scanner DB access; who collects Makro receipts — pending.
- Lena's tasks paused while duties are being reworked.
- Stage 3 «Заказы» sheet: deployed by Ops.

## Contacts (accounting)
| Who | Role | Contact | Status |
|---|---|---|---|
| Pat | New accountant | email / LINE requested from Aiz | pending |
| Khun Sak (Somsak) | Director (George 30.09.2026) | somsak.khumbaan@gmail.com | — |
| Namtan (Sirikanya) | former accountant | — | no longer works with Place (George 30.09) |

Accounting questions only with George's OK. No bank numbers or salary sheets in the repo.
