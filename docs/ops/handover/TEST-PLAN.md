# TEST-PLAN: five B automations (test mode only)

George OK 30.09.2026 09:19 ICT, **only as tests/drafts**. Nothing goes live until George signs off each item in the go-live checklist below.
Prepared 30.09.2026 by Place Lead (bot).

## 1. Sandbox

Folder **PLACE TEST sandbox** (info@ Drive): https://drive.google.com/drive/folders/12oWMzl_hybDIYuLnNQB7k9Zd9w_bikby

| TEST copy | id | What was changed in the copy |
|---|---|---|
| Resident info TEST | `1THjNTF1S0Gu3aHeAD4vxK0Ylcf5BDhTqsL2GMaq8cH4` | «Office rent»: fixtures A–F in rows 2–7 (fake tenants, `@example.invalid`). «Лист1»: K1:M1 = `24/7 (Y/N)`, `Key # / card #`, `Key deposit paid (date, ฿)` + fake rows 303–305 (TEST Keyholder 1–3). |
| Schedule 26 TEST | `13viAmqT1XMQ99twJw-u5AaTtHWSGPki0zzEX7PleYYg` | unchanged copy |
| Events and booking TEST | `1kkVOqLqVMpwpZtYpshx3zvH5_EGJ7wYp69sKJJQw3Rk` | Meeting room 01.10: «TEST booking 10:00-11:00 (Place Ops)» |
| Place Inbox TEST (orders bridge sheet) | `1fwjPnLM4JcBH8HnqayWMLdRznU2U7saJX3PQLa9-6GU` | new tabs **Issues** and **Log** |
| Code bundle (text) | `1xiFe9Av_cBxy8grYjdUnudJh_WFiDgHt` | `PLACE automations TEST — code bundle (paste into Apps Script).gs.txt` |

Production sheets (Resident info, Schedule 26, Events and booking, Place Inbox) and the live bridge deployment were **not touched**.

Known issues in the copies:
- Resident info TEST «Лист1» O303:Q305 holds stray values left by a misplaced append (duplicates of K:M). They are harmless: the scripts read only K:M. Delete them by hand if you want.
- Copies of the sheets may carry their bound scripts. Simple `onEdit`/`onOpen` triggers run in the copies; time triggers are not copied. Do not deploy anything from the copies.

## 2. Test project «PLACE automations TEST»

Code: [`test-project/`](test-project/). `build-test-project.sh` wraps each production script (`stage6-office-reminders.gs`, `issues-log.gs`, `bookings-today.gs`, `keyholders-247.gs`, `stage5-timesheet.gs`) in a module with **test stubs**:
- `T_SS.openById` opens only the TEST ids and throws on production ids;
- `GmailApp.createDraft` only writes to the log (no draft is created); `sendEmail`, `MailApp`, `UrlFetchApp` (Telegram) and `ScriptApp.newTrigger` throw `TEST GUARD`;
- config is in `00-TestConfig.gs` (`T_IDS`, `T_PROPS`). Script Properties with the `T_<MOD>_` prefix override it;
- every test writes one row to **Place Inbox TEST › Log**. George's DM is not wired (the test project has no bot token), so output is **log only**;
- the manifest asks only for the `spreadsheets` and `script.scriptapp` scopes. No Gmail or external-request scopes.

**I could not create the project automatically.** The Drive connector rejects creating an Apps Script file with content, and the Apps Script API (and minting tokens) was not used. Setup takes about 5 minutes:
1. Signed in as info@, go to script.google.com → New project → rename it to **PLACE automations TEST**. Optionally move it into the sandbox folder.
2. Project Settings → Time zone **Asia/Bangkok**. Tick «Show appsscript.json», then paste `test-project/appsscript.json`.
3. Delete `Code.gs`. Then either (a) create one file and paste the whole bundle (Drive file above, or `test-project/PLACE-automations-TEST.bundle.gs`), or (b) create files 00-TestConfig, 10-Stage6, 20-IssuesLog, 30-Bookings, 40-Keyholders, 50-Timesheet, 90-Tests in that order.
4. Optional: clear **Place Inbox TEST › Issues** A2:M and **Log** A2:F. They hold the harness results from 30.09 (see §3).
5. Run `test_guard` → authorize (Sheets only). Then run `test_all`. Open **Place Inbox TEST › Log**: every row must read `PASS`/`OK`.
6. **Do not add triggers** (Triggers ▸ empty). The guard blocks `newTrigger` from code anyway.

To re-run stage 6 on the same day, run `test_stage6Reset` first. It clears the sent-log, so the electricity task is created again.

## 2b. Scheduled TEST mode (George OK 30.09.2026 10:02)

Project: **PLACE automations TEST**, https://script.google.com/home/projects/1MoGliVK3faV1h78dS8nsN975sO7cQ0U_WbbB_2oya8XtoZGj2wcGZ8wu/edit
Code: `test-project/PLACE-automations-TEST.bundle.gs` (one file, replaces the whole Code.gs) + `test-project/appsscript.json` (adds the `script.external_request` scope).

**What the mode does**
- Production sheets are **read-only**:
  - Resident info, Schedule 26, Events and booking, Place Inbox `queue`;
  - reads go through a Proxy that allows only `get…/is…/has…`; any write throws `TEST GUARD`.
- Writes go only to **Place Inbox TEST**: Issues and Log.
- **No message reaches its real target.** Everything is relayed to George's private chat with @PlaceLeadBot as:
  `🧪 TEST, would be sent to: <recipient> via <channel>, at <time>` + the exact text.
  Channels:
  - TG group PLACE Team;
  - TG DM Lena;
  - TG DM evening admin;
  - email to tenant X (Gmail draft);
  - email draft to accountant;
  - email draft (info@).
- The relay sends only to Script Property `GEORGE_CHAT_ID`, and only if it is a private chat id (positive number). Without `TG_TOKEN` or `GEORGE_CHAT_ID` it is **log only**.
- Issues: the live bridge is not changed. New «Тех вопросы» rows are copied read-only from the production `queue` into TEST Issues. They open issues only, because the queue has no reply link.
- `job_stage6`: production «Office rent» is empty now, so the job logs «nothing to check» until the registry is filled.

**Setup (once)**
1. Paste the new bundle into Code.gs (replace everything) and the new `appsscript.json`. Save.
2. Project Settings ▸ Script properties ▸ add **`TG_TOKEN`** = the @PlaceLeadBot token.
   - **Done by George by hand**, e.g. copied from @BotFather or the «Place TG Bridge» project properties.
   - The token is never in code, the repo, the Log or chat.
   - Apps Script cannot read box env or box files, so no function can pull it from the box.
   - Optional properties: `GEORGE_CHAT_ID`, `GEORGE_TG_USERNAME`, `CASH_ANCHOR_DATE` (yyyy-mm-dd).
3. George presses **/start** in @PlaceLeadBot. The live bridge logs it to the production `queue` as «личка боту» with the chat_id.
4. Run `setupTestProperties()`:
   - authorize the scopes (Sheets, triggers, external requests);
   - it checks the token (`getMe`, only the bot name is logged);
   - it finds `GEORGE_CHAT_ID` in the queue (read-only) by `GEORGE_TG_USERNAME` or the name «George/Geo»;
   - it sets `CASH_ANCHOR_DATE`.
5. Run `sendTestPing()`. George gets «🧪 TEST ping …».
6. Run `test_all()` (fixture tests, log only). Optionally run `runAllJobsOnce()`: every job runs once now, and George gets the relayed messages.
7. Run `installTestTriggers()`. To stop everything, run `removeTestTriggers()`.

**Triggers** (Asia/Bangkok; Apps Script fires within about ±15 min of `nearMinute`)

| Handler | When | What |
|---|---|---|
| `job_stage6` | daily 09:05 | stage 6 offices (production Resident info read-only). Tenant drafts and the digest are relayed; electricity tasks go to TEST Issues and are relayed as «TG DM Lena». |
| `job_coverage` | daily 09:10 | schedule-coverage (production Schedule 26, 14 days). The info@ draft is relayed. |
| `job_bookings` | daily 10:07 | bookings-today (production Events and booking), relayed as «TG group PLACE Team». |
| `job_issuesMorning` | daily 10:07 | queue → TEST Issues sync + morning issues digest, relayed |
| `job_issuesEvening` | daily 23:10 | same, evening digest (closed today + open) |
| `job_timesheet` | **28th** of each month, 09:30 | timesheet for the current calendar month, counted to the 28th; days 29..end = «after cutoff → next month adjustments»; previous month 29..end = adjustments. The accountant draft is relayed. |
| `job_cashReminder` | every 3 days, 20:00 | cash for the Thai partner. Recipients are evening admins from Schedule 26 (shift to 23:00); the reminder is relayed as «TG DM evening admin». |

**Harness check 30.09** (node, snapshots, fake token/chat):
- all 9 functions OK;
- 12 `sendMessage` calls, **all to GEORGE_CHAT_ID**;
- 0 writes to production;
- without a chat_id: 12 × «relay LOG ONLY».

## 6. Staged for George's OK (30.09, open D items)

### 6a. 24/7 key columns in the production Resident info (C8): DONE 30.09 (George OK 10:40)
- Tested on Resident info TEST: `test_keyholders` PASS.
- **Applied to production Resident info «Лист1» on 30.09.2026:**
  - K1 `24/7 (Y/N)` with a Y/N dropdown on K2:K1205 (warning only, not strict);
  - L1 `Key # / card #`;
  - M1 `Key deposit paid (date, ฿)`.
- K:M were re-checked right before the change: empty, apart from 3 cells that contain only spaces (K131, K1204, K1205). Those were left untouched. Nothing else was changed.
- **Next:**
  1. Lena or the admins fill in the current 24/7 residents, keys and deposits.
  2. After that, `KH.keyholders247_` in the 22:30 run (read-only), after a separate OK.

### 6b. Leave requests through the bot (G-13): scheme George 30.09 10:40, TEST only
- **Scheme:**
  1. The employee sends the bot `/leave vacation|dayoff dd.mm[-dd.mm] [reason]` (also отпуск / выходной / พักร้อน / หยุด).
  2. The bot forwards the request to **both Lena and George** (`LEAVE_APPROVERS`, default `George,Lena`).
  3. **Either** of them answers `/approve L…` or `/reject L… reason`. The first decision wins; anyone else is refused.
  4. The bot notifies the employee and tells the other approver it is already decided.
  5. On approve, the bot marks Schedule 26 (TEST only): vacation → «Annual leave», day off → «off». A cell that already has a shift is not overwritten; it is reported as a conflict.
- **Code:** `leave-requests.gs` → TEST module `70-Leave.gs` (`LV`), test `test_leave` (part of `test_all`).
- **Where it writes:** tab **Leave** in Place Inbox TEST and **Schedule 26 TEST** only.
- **Scenario:**

| Step | Input | Expected result |
|---|---|---|
| 1 | `/leave holiday tomorrow` | format error; nothing is written |
| 2 | Tangmo sends `/leave vacation 11.10-12.10 TEST family` | `pending` row; 2 cards, **to George and to Lena** |
| 3 | Kate tries `/approve` | `not allowed` |
| 4 | **Lena** approves | 11.10 (`off`) becomes «Annual leave» in Schedule 26 TEST. 12.10 (`8:00-17:00`) is a conflict and is not overwritten. Tangmo gets «✅ … (Lena)»; George gets «already decided by Lena». |
| 5 | George tries `/reject` afterwards | `already approved by Lena`; nothing changes |
| 6 | Kate sends `/leave выходной 14.10`, **George** rejects with a reason | `rejected`; Kate gets «❌ … (George): reason» |

- **Harness 30.09:** PASS. Exactly one write to Schedule 26 TEST (Oct!M2 = «Annual leave», Tangmo 11.10); nothing written to production.
- **Go-live checklist:**
  - [ ] George OK on live.
  - [ ] The whole team, Lena and George all in @PlaceLeadBot.
  - [ ] Hook `/leave`, `/approve`, `/reject` into the bridge: a new bridge version, only after OK. Check the approver by Telegram chat_id, not only by name.
  - [ ] `LEAVE_SHEET_ID` = production Place Inbox (new tab Leave), `SCHEDULE_SHEET_ID` = production Schedule 26, after it moves to info@.
  - [ ] Test with 1 real request.

### 6c. Fuel receipts (G-12): closed 30.09 10:40
Accountant format, no template of our own. `FUEL-RECEIPT-TEMPLATE.md` was removed.

## 3. Test run 30.09.2026 (node harness)

Apps Script could not be run from the bot. So on 30.09 the **same generated code** was run in a node `vm` harness (`test-project/harness/`) against snapshots of the TEST copies, with a simulated time of 30.09.2026 10:07 ICT. The harness results were then written to the real TEST sheets: **Log** rows 2–8 (runner `node-harness`) and **Issues** rows 2–5.
Harness bugs fixed along the way: the `'T'` literal in formatDate, and Date objects across the vm context. There were no bugs in the scripts themselves.

| # | Automation | Test | Result 30.09 |
|---|---|---|---|
| 0 | safety layer | `test_guard` | PASS |
| 1 | stage 6 offices + electricity for Lena | `test_stage6` | PASS |
| 2 | issues-log + bridge hook | `test_issues`, `test_issuesBridgeHook` | PASS / PASS |
| 3 | bookings-today (10:07) | `test_bookings` | PASS |
| 4 | 24/7 columns (C8) | `test_keyholders` | PASS |
| 5 | stage 5 timesheet | `test_timesheet` | PASS |

The live Apps Script run (step 5 in §2) is still **pending: George**.

## 4. Scenarios (inputs → expected output → pass/fail)

### 1. Stage 6: office reminders + electricity tasks for Lena
- **Config:** `MODE=draft` (drafts are stubs), `ELEC_TASK_MODE=issues`, `ISSUES_SHEET_ID`=Place Inbox TEST, `TODAY_OVERRIDE=2026-09-30`.
- **Inputs:** Resident info TEST › Office rent rows 2–7:

| Row | Tenant | Case |
|---|---|---|
| 2 | A | payment 07.10 (in 7 d) |
| 3 | B «like Igor» | Room 3, payment 03.10, deposit not paid |
| 4 | C «like Renat» | Room 3 (overlap with B), payment today |
| 5 | D | no email, contract ends 30.10, electricity day 30 |
| 6 | E | ended 20.09, status not Ended |
| 7 | F | Ended |

- **Expected:**
  - reminders for A (7 d), B (3 d), C (today), all as `[STUB createDraft — NOT created]`;
  - the digest lists 5 items: A, B, deposit B, C, contract end D;
  - 3 warnings: D has no email; E ended but status is not Ended; Room 3 overlap B/C;
  - F is skipped;
  - one Issues row `elec:5:2026-09`, «выставить счёт за электричество: 2 эт. Room 16, TEST Tenant D», assignee **Lena**, type `task`, tag `fixture`;
  - no email or TG is sent.
- **Pass if:** all of the above, and the Log row reads `PASS`. A second run the same day does not duplicate the reminders or the task (sent-log).
- **30.09:** PASS (items 5, warnings 3, drafts 3 stub + digest stub).

### Issues rows: type and tag (30.09, after George's remark on the 14:08 summary)
- Issues has two more columns: `type` (`issue` = breakdown, `task` = e.g. electricity bill; old rows: `elec:…` → task) and `tag` (`fixture` = written by a test_*).
- The PLACE Team summaries (job_issuesMorning / job_issuesEvening) list only `type=issue` and skip `tag=fixture`. Tasks stay in the Issues log only (Lena gets the electricity DM from job_stage6).
- `test_all()` ends with `cleanupTestFixtures()`: deletes fixture rows (and old untagged test rows) from Issues in Place Inbox TEST. It can also be run by hand.
- Format: `🛠 Поломки: открыто N (не взято X, в работе Y)`, then per item `🔴/🟡[⏰] <floor> — <what>` and `с dd.MM HH:mm (age) · в работе: <last note> | не взято, сообщил(а) <who>`; not taken first, oldest first; evening adds «Закрыто сегодня».

### 2. Issues-log: Issues tab + bridge hook
- **Inputs:** synthetic TG updates from chat «Тех вопросы TEST» (id −1009990001):
  - new issue «кондиционер на 3 этаже течёт» (Som);
  - new issue «ชั้น 1 ไฟดับ 2 ดวง» (Tangmo);
  - reply «смотрю, нужна деталь» → in_progress;
  - reply «готово» → closed;
  - a message from the bot → skip.

  Hook test: a message in «Тех вопросы TEST» → open; in «PLACE Team TEST» → skipped; an edited message → skipped.
- **Expected:** rows in Issues with floor, reporter, status, last_note and closed_at/closed_by.
  - Morning digest: «Поломки: открыто 2 …»;
  - evening digest: «открыто 2, закрыто сегодня 1 ✅ …».
  - Digests go to the log only. No TG.
- **Pass if:** the statuses are open, open, in_progress, closed, skip-bot; the hook result is open / skipped / skipped; the Log reads `PASS`.
- **30.09:** PASS. The Issues tab has 4 rows: the elec task, AC in_progress, light closed, 4th floor leak (via the hook).

### 3. Bookings-today in the 10:07 summary
- **Inputs:** Events and booking TEST, 5 tabs; dates 01.10.2026 and 20.12.2026.
- **Expected:**
  - 01.10: «Meeting room: 10:00 TEST booking (Place Ops)», «4 floor: 8:00 Yoga 08:30–11:00»;
  - 20.12: «нет» plus a ⚠️ warning that the grids end 31.12.2026.
- **Pass if:** the text matches and the Log reads `PASS`. The text is not sent anywhere.
- **30.09:** PASS.

### 4. 24/7 columns in Resident info
- **Inputs:** Resident info TEST › Лист1 K:M, rows 303–305:
  - Keyholder 1: to 30.10, key K-T01, deposit paid;
  - Keyholder 2: to 14.10, key K-T02, no deposit;
  - Keyholder 3: expired 31.08, key K-T03.
- **Expected:**
  - «Ключи 24/7: активных 2»;
  - ⚠️ K-T02 has no deposit;
  - ⚠️ row 305 is expired but the key is not returned.
- **Pass if:** the text matches and the Log reads `PASS`.
- **30.09:** PASS.

### 5. Stage 5 timesheet (period rules changed 30.09: Aiz Q5)
- **Config:** Schedule 26 TEST, `DRAFT_ENABLED=true`, `ACCOUNTANT_TO=test-accountant@example.invalid`, `PERIOD_MODE=month` (default), `CUTOFF_DAY=28`.
- **Rules:** payroll period = calendar month (1st–last day); the timesheet is sent on the 28th; leave after the 28th is deducted next month.
- **Inputs:** run on 30.09.2026, tabs Aug and Sep.
- **Expected:**
  - period 01.09–30.09.2026, table counted to 28.09;
  - block «After cutoff 29.09–30.09 (not yet worked → next month adjustments)»: planned shifts and leave, e.g. «Kate: unpaid 1»;
  - block «Adjustments from previous month 29.08–31.08»: e.g. «Tangmo: doctor 1», «First: sick 1», «Kate: doctor 1»;
  - 0 warnings;
  - the draft is a stub;
  - greeting «Dear Khun Pat,».
- **Pass if:** the table covers 1–28 only, both blocks are present, and the numbers match a hand check.
- **Harness 30.09 (after the change):** PASS. 8 people, 0 warnings, both blocks as above.
  - A scheduled run simulated for 28.10.2026 gives period 01.10–31.10, after-cutoff 29–31.10, adjustments 29–30.09 («Kate: unpaid 1»).
  - The trigger is `onMonthDay(28)` 09:30.
- **Before (21–20 scheme, 30.09 morning):** PASS (for reference only).

## 5. Go-live checklist (per item, only after George's written OK)

Common rules for every item:
- use a separate live project or config, never the TEST project with its guards removed;
- set the ids to production;
- remove `TODAY_OVERRIDE`;
- test first in draft mode on production data (read-only), and only then turn on the trigger;
- record the date and the OK in STATUS.md.

**1. Stage 6 offices + electricity**
- [ ] Place Ops fills the real registry «Office rent» (it is empty in production): Room 3 Renat/Igor, Igor's deposit.
- [ ] Config: `RESIDENT_SHEET_ID`=production, `ISSUES_SHEET_ID`=production Place Inbox (after the Issues tab exists there), `MODE=draft`, `ELEC_TASK_MODE=issues`, no `TODAY_OVERRIDE`.
- [ ] One `dryRun` on production. George reviews the list.
- [ ] Daily trigger 09:00. Tenant emails stay as Gmail **drafts**; `MODE=send` only with a separate OK.
- [ ] Tell Lena that her electricity tasks arrive in Issues / the summary.

**2. Issues-log + bridge hook**
- [ ] George OK to add the **Issues** tab to the production Place Inbox (same header as in TEST).
- [ ] George OK to change the live bridge: a one-line hook in `doPost` (`issues-log.gs`), which fires only for chat «Тех вопросы». New deployment **version**; keep the previous version for rollback.
- [ ] Test with one real message in «Тех вопросы», then the reply «готово».
- [ ] Add the digests to the 10:07 / 22:30 runs.
- [ ] Tell Som and the admins: «готово» in a reply closes the issue.

**3. Bookings-today**
- [ ] `EVENTS_SHEET_ID`=production. Add the block to the 10:07 summary (existing trigger, no new message).
- [ ] Check for 1 week. Extend the grids past 31.12.2026 by December.

**4. 24/7 columns**
- [ ] George OK. **A human** adds K:M to the production Resident info (the bot does not edit the production sheet).
- [ ] Fill in the actual 24/7 residents, keys and deposits.
- [ ] Only after that: `keyholders247_` in the 22:30 run (read-only).

**5. Stage 5 timesheet**
- [ ] George or the accountant confirms the TEST table for 21.08–20.09 (hand check).
- [ ] Config: `SCHEDULE_SHEET_ID`=production, `ACCOUNTANT_TO` = the real accountant, `DRAFT_ENABLED=true`.
- [ ] Monthly trigger on the **28th**, 09:30, **draft** only (period = current month; leave after the 28th → next month). George sends it himself.
- [ ] For 2027: `SHEET_ID_BY_YEAR`.
