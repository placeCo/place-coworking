# Renewals.gs: install in «Place TG Bridge»

09.10.2026 ICT. Nothing has been deployed. These are the steps for pasting it in the browser (Apps Script editor, account info@placecoworking.com, project `1b6HRWG7y33yeGUwAkc5zaibuV-4TXCtpghU5Go-nQy65Pjpz6LAGIf7_`).

## What it does
- Runs daily at ~10:15 ICT. It reads Resident info (`1Rzz9CKQYHwgZ8BPtrTxxUwFdphphSivSJkkTwFC8wo4`, tab «Лист1», A:J) and picks rows where **Finish** is:
  - **today+3**: WhatsApp text from §3 «за 3 дня» (month / 3 months). Week passes get no text here; they get the §2 step 5 text the next day.
  - **tomorrow**: the reception phrase «Завтра ваш последний день. Продлеваем?». For a week pass it's the §2 step 5 WhatsApp text.
  - **today**: WhatsApp «Сегодня последний день вашего пасса…». From 01.11.2026 the day price is 500 ฿ automatically.
  - **today−7 with H empty**: no client text («Ещё сообщений не слать»). The admin replies «продлил / нет + причина».
- **Offices** (5th-floor «OFFICE RENT» block, «Office room», Max/Maksim team, Renat, Igor Gomon, Bamboo) get an internal reminder line only, with no client text.
- **Special passes** (2nd-floor rooms such as Iurii's room 16, «10 days (flex)», «+reserved», anything that isn't month / 3 months / week / day on the 1st or 3rd floor) get text without prices plus «условия — у Лены».
- Price guard: a client text may only contain the canon amounts (50, 400, 500, 1 800, 6 000, 15 000, and office 30 000 / 20 000 from the verbatim §3 text). «24/7» is never allowed. Anything else stops the run with an error.
- If column G has a phone number (starts with + or has ≥10 digits; a Thai 0XXXXXXXXX becomes 66…), the message adds a link `https://wa.me/<digits>?text=<urlencoded text>`. If not, it shows the contact and says «найдите в WhatsApp / Loyverse».
- Delivery: the composed message is appended to Place Inbox (`1uMHYp6d-…`) tab **outbox** as one row per admin (`chat_id | '' | text | '' | '' | ''`). `outboxFlush_()` in Photo.gs sends it within a minute. If the message is over ~3800 chars, it's split into parts marked (1/N). Rows are written only between 09:00 and 21:00 ICT and only once per day (Script Property `RN_LAST_SENT_DATE`). If every bucket is empty, nothing is written.
- Recipients: Tangmo `7486466296` and Leena `8944262207`, by DM from @PlaceLeadBot. Admins reply to the bot, and the private-chat reply goes through `opsNeeded_` into the queue and Ops wake. Ops then writes column H.

## Dates
The Start/Finish cells in «Лист1» are **real date cells** (all 271 data rows, checked 09.10.2026). The `dd.MM` display hides the year, but the stored year is correct (for example, Jhom 10.10 is 2025 and Andrey Simoilov 10.10 is 2024). That's why `RN_TRUST_CELL_YEAR = true` by default: the code uses the stored year and, if Finish < Start, moves Finish +1 year. The «closest to today» year is inferred only for text cells (`9.10`, `09.10`, `9/10`, `9 Oct`, `10.9.26`). If you set the flag to `false`, the code ignores stored years. On 09.10 that would have put two false guests into «tomorrow» (2024/2025 rows) and Bamboo/Igor Gomon into offices.

## Prerequisites
- Photo.gs and its Hook 1 (`outboxFlush_` in `poll()`) are installed, see `/workspace/tg-bridge-photo/HOOK.md`. The tab `outbox` already exists in Place Inbox (header checked 09.10, no rows yet). **If Hook 1 isn't live, the rows will sit in outbox unsent.**
- Tangmo and Leena have /start-ed @PlaceLeadBot (03.10.2026, docs/ops/admin-feedback-TEST.md).

## Steps
1. Open the project → Files **+** → Script → name it `Renewals` → paste the whole of `Renewals.gs` → Save. If there's a syntax error, stop and report. Don't touch Code.gs, Line.gs, Photo.gs or Script Properties.
2. Pick `renewalsDryRun` → Run. Approve the scopes if asked (Sheets, and Script triggers later). The log should show `RN today=2026-10-.. rows=274 …` and the composed message(s), or `RN_NOTHING_TO_SEND`. This writes nothing.
   - Optional: to test another day, run `renewalsDryRunFor('2026-10-11')` from a scratch function (for example `function t(){renewalsDryRunFor('2026-10-11')}`, then delete it). On 11.10 it should list Saif, Youssef and Ismail in «через 3 дня».
3. Pick `installRenewalsTrigger` → Run. It first removes any existing `renewalsDaily` triggers, then creates one daily trigger at 10:00–10:30 ICT (`atHour(10).nearMinute(15)`, `inTimezone('Asia/Bangkok')`). The log shows `RN_TRIGGER_OK removed=N now=1`. Check under Triggers (alarm-clock icon) that there's exactly one `renewalsDaily`.
4. Optional: run `renewalsDaily` once by hand. It writes to outbox right away (in daytime) and marks today as sent, so the 10:15 trigger won't send a second time today.
5. To turn it off, run `removeRenewalsTrigger`.

## Check after the first run
- Place Inbox → outbox: new rows for both chat_ids, with `status` changing to `sent` and `result` showing `message_id …`. An `error` + `Forbidden` result means that admin blocked the bot or never /start-ed it.
- Apps Script → Executions → `renewalsDaily`: the log has `RN_OUTBOX_ROWS 2` (or `RN_NOTHING_TO_SEND`).

## Known limits / for George
- Texts are Russian only, verbatim from §3 (Marketing's file says the texts were drafts until George's «да»). Many guests are foreigners, so English versions would need George's wording.
- The «за 3 дня» text says «Ваш месяц» for 3-month passes too (kept verbatim).
- The «today» text has no name placeholder in §3. The code adds «Здравствуйте, <имя>.» at the start.
- The «tomorrow» step is a reception phrase in §3. The code also shows a wa.me link with the same phrase when there's a phone.
- 10 days (flex) is treated as special (no price, «условия — у Лены»), even though canon has 10 days 2 500 / 3 500. George decides what to offer (§3 questions).
- Rows where H is a note rather than a renewal result (for example Igor Stukalov 02.10, «Need to discount more 270…») count as «H filled» and are skipped in today−7.
- The sheet says Max team ends 30.09 (October isn't recorded), so the 3-day reminder before 01.11 won't fire unless the row is updated. Office start dates (Bamboo 10.10, Igor Gomon 13.10) aren't reminded, because only Finish is tracked.
- Office detection by name (`Max/Maksim`, `Renat`, `Igor Gomon`, `Bamboo`) would also catch a future guest named Max. Edit `RN_OFFICE_NAME_RE` if needed.
- Most rows have no phone in column G (emails/@handles), so wa.me links will be rare until reception writes phone numbers.
