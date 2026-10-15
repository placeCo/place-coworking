DRAFT · needs George + Grok

# Ops — paced 2-week plan 16.10–29.10.2026

Principle (George, 15.10): slow, cheapest-first, gas is limited. Max 1–2 small Ops tasks/day. Load only CORE.en.md + docs/bots/ops/ROLE-CORE.md; no MEMORY.md. Heavy work → separate TZ in docs/drafts/tz/ marked `heavy` / `Для Grok`, then stop.

Sources: docs/canon/ANALYSIS-HARD-2026-10-15.md (§3 micro-management, §4 gas), docs/ops/TEAM-AND-QUESTIONS.md, docs/ops/PAYROLL-THAI-2026.md, kb/BOT-LOAD.md, existing Ops backlog, docs/drafts/tz/2026-10-15-ops-budget-split.md.

## Week 1 budget split (George 15.10)
- Week 1 = **16.10–22.10** (not only Fri–Sun).
- **45%** — analysis tasks from budget-split (items 1–6 below).
- **45%** — own Ops plan items (A, D/D2, E…) in this window; Ops parts stay **low** only.
- **10%** — reserve if we overrun.
- Anything above low → Grok via spec (combined week-1 analysis: `docs/drafts/tz/2026-10-15-grok-week1-analysis-tasks.md`; Ops heavies keep their own specs).
- If Ops own-plan work does not fit week 1 → shift to week 2.

## Rules (gas)
- **Serious / growing tasks:** write a short TZ first, then stop. Grok reviews hourly; Ops only checks canon + deploys after George OK.
- **Small tasks:** do directly (one short session, no browser, no MEMORY.md).
- Cost scale: low = one short session, no browser; medium = code edit/test; high = browser/long generation (avoid; route via TZ to Grok).

## Budget (overview)
- Week 1 (16.10–22.10): 45% analysis + 45% Ops plan + 10% reserve (see above).
- Week 2 (23.10–29.10): normal pacing, 1–2 tasks/day, one medium task per day max; stop and write a TZ if a task grows to high.
- Grok has a large limit — route generously. Ops keeps only tiny tasks, specs, checks and deploys.

## Grok split
Heavy items go to George's Grok: Ops writes a short spec in docs/drafts/tz/ (first line `DRAFT · needs George + Grok`), Grok does the work, Ops then checks against canon and deploys after George OK.
- Analysis 1–6 heavy parts → **one combined** `docs/drafts/tz/2026-10-15-grok-week1-analysis-tasks.md` → results in `docs/drafts/grok-out/`
- D/D2 Tuya.gs → spec `docs/drafts/tz/2026-10-20-grok-tuya-aliases-colours.md`
- E2 keyholders code → spec `docs/drafts/tz/2026-10-22-grok-keyholders-night.md`
- F autoreplies EN/RU/TH → spec `docs/drafts/tz/2026-10-26-grok-autoreplies.md`
- I next-backlog analysis (if more than a short status) → spec on 29.10

## Day by day

### Week 1 (16.10–22.10) — analysis 45% + Ops 45% + 10% reserve

| Date | Analysis (45%) | Ops plan (45%) | Budget |
|------|----------------|----------------|--------|
| Fri 16.10 | **1.** Payroll status + kickoff with Accounting (Ops: status note only). Heavy process doc → Grok | **A.** air3 Tuya quota — ask John (text only) | low |
| Sat 17.10 | **3.** Daily reports — format + collector (Ops: 3-line skeleton / who-when). Full EN/RU/TH file → Grok if grows | **B.** fold into #3 (no separate heavy) | low |
| Sun 18.10 | **2.** Thai team list + questions (Ops: roles known only). TH/EN questions pack → Grok | rest / buffer | low |
| Mon 19.10 | **5.** Team onboarding to bot — list + what each gets (Ops: fill known cells). Onboarding matrix → Grok | light check of #2/#5 drafts | low |
| Tue 20.10 | **4.** Leave/days-off — table columns + reminder design → Grok (Apps Script design only) | **D.** Tuya.gs aliases + colours — Ops writes Grok spec | low |
| Wed 21.10 | **6.** External contour — pick 2 platforms + first post draft → Grok (+ Marketing/SMM review later) | **D2.** Check Grok's Tuya.gs result, test 1 device | low–medium |
| Thu 22.10 | George review of `docs/drafts/grok-out/*` week-1; reserve 10% | **E.** keyholders rework — Ops writes Grok spec | low |

### Week 2 (23.10–29.10)

| Date | Task | Budget |
|------|------|--------|
| Fri 23.10 | E2. Check Grok's keyholders code, dry run in test-project | low–medium |
| Sat 24.10 | buffer / George review | – |
| Sun 25.10 | rest | – |
| Mon 26.10 | F. Autoreplies EN/RU/TH — **Grok**: Ops writes spec; check result 27.10 | low |
| Tue 27.10 | Check F result; leave table deploy only after George OK on Grok leave design (from week 1) | low |
| Wed 28.10 | H. Urgent-issue flow (status in chat + log) + gas-savings checklist | low |
| Thu 29.10 | I. Wrap-up: status report to George, next 2-week backlog | low |

## Analysis items (week 1, from budget-split)

1. **Payroll** — status + process with Accounting per `docs/ops/PAYROLL-THAI-2026.md`. Ops: status. Grok: process doc.
2. **Thai team list + questions** per `docs/ops/TEAM-AND-QUESTIONS.md`. Ops: known roles. Grok: TH/EN questions.
3. **Daily reports** — format + collector. Ops: who/when skeleton. Grok if full multilingual template grows.
4. **Leave / days-off** — table + reminder. Grok: sheet design + Apps Script reminder design (no deploy).
5. **Team onboarding to bot** — list + what each gets. Grok: onboarding matrix.
6. **External** — pick 2 platforms + first post draft with Marketing/SMM. Grok: shortlist + draft (no send).

## Task cards

### A. air3 Tuya quota (16.10)
- Budget: low
- Goal: restore/raise Tuya API quota so air3 readings/control work.
- Refs: Ops backlog; ROLE-CORE (Tuya night read 00:00).
- Steps: ask John by message for current quota/plan (he checks the Tuya IoT console, not Ops via browser); log the answer; if quota exhausted, propose reducing poll frequency (night read only, no polling loops).
- Done: quota status known and written here; night read 00:00 confirmed working or issue logged.

### B / Analysis #3. Daily report template (17.10)
- Budget: low for Ops
- Goal: 3-line format "done / problem / need" (ANALYSIS §3.2).
- Steps: Ops notes collector + time; full template EN/RU/TH → Grok week-1 spec if not tiny; target `docs/ops/DAILY-REPORT.md`.
- Done: template file exists; George approves collector + time.

### Analysis #1. Payroll (16.10)
- Budget: low for Ops (process doc → Grok)
- Goal: status of Thai payroll + process draft for Accounting.
- Refs: PAYROLL-THAI-2026.md; TEAM-AND-QUESTIONS.md payroll fields.
- Done: status note + Grok process draft in grok-out; Accounting owns numbers.

### Analysis #2 / #5. Team list + onboarding (18–19.10)
- Budget: low for Ops (TH/EN + matrix → Grok)
- Goal: prepare onboarding of Thai team to the bot (ANALYSIS §3.4).
- Steps: Ops fills only known roles; George fills names/contacts; TH/EN + onboarding matrix → Grok; payroll fields → Accounting.
- Done: table with at least roles + language + channel; questions ready to send (**send only after George OK**).

### D/D2. Tuya.gs EN aliases + status colours for Lena (20–21.10)
- Budget: low for Ops (heavy part → Grok, spec 2026-10-20-grok-tuya-aliases-colours.md)
- Goal: English device aliases and colour-coded status (e.g. green ok / yellow warn / red offline) readable by Lena.
- Refs: Ops backlog. NOTE: Tuya.gs is not in the repo (only Line.gs, keyholders) — need source.
- Steps: get current Tuya.gs (George/Apps Script export) → commit to docs/ops/tuya/; add alias map {deviceId → EN name}; add status→colour mapping in sheet output; test on one device.
- Done: diff committed; Lena sees EN names + colours in one sample run.

### Analysis #4. Leave/days-off (20.10 design)
- Budget: low for Ops (design + Apps Script → Grok week-1 spec)
- Goal: ANALYSIS §3.3 — table + reminder 3 days before.
- Steps: Grok designs sheet columns + daily cheap trigger; Ops checks; deploy only after George OK (week 2).
- Done: design in grok-out; no live trigger without approval.

### Analysis #6. External platforms + first post (21.10)
- Budget: low for Ops (shortlist + draft → Grok; Marketing/SMM review)
- Refs: docs/marketing/EXTERNAL-PLATFORMS-30.md; ANALYSIS §4.
- Suggested start: Phuket Digital Nomads + Nomad List (canon in route section).
- Done: 2 platforms chosen + one post draft in grok-out; **no publishing**.

### E/E2. keyholders-247.gs rework (22–23.10)
- Budget: low for Ops (code → Grok, spec 2026-10-22-grok-keyholders-night.md)
- Refs: docs/ops/handover/keyholders-247.gs, docs/ops/handover/test-project/40-Keyholders.gs.
- Rules: owners (office holders) always have night access; guests only on request (explicit approval/date); never write "24/7" anywhere (texts, sheet headers, logs, file comments). Consider renaming file to keyholders-night.gs.
- Steps: spec (22.10) → code in test-project, dry run (23.10) → George approves before deploy.
- Done: grep "24/7" = 0 in outputs; owner/guest logic tested on sample rows.

### F. Autoreplies EN/RU/TH (26.10)
- Budget: low for Ops (drafting → Grok, spec 2026-10-26-grok-autoreplies.md)
- Refs: docs/ops/bots/instagram/AUTOREPLIES.md, docs/ops/line/Line.gs, CORE.en.md.
- Steps: audit existing replies vs canon (08:00–23:00, prices, ban list, WhatsApp phrase for office/podcast); draft EN/RU/TH set; TH needs native check.
- Done: one file with 3 languages, banned words = 0; George approves; deploy separately.

### H. Urgent issues + gas checklist (28.10)
- Budget: low
- Goal: ANALYSIS §3.5 + §4. Short doc: how urgent issues are posted/logged; gas rules for all bots (CORE+ROLE-CORE only, no MEMORY.md, heavy → TZ, no images/long texts in bot sessions).
- Done: docs/ops/URGENT-AND-GAS.md (≤1 page).

### I. Wrap-up (29.10)
- Budget: low
- Status of A–H + analysis 1–6, what slipped, next backlog.

## Route to other bots (not Ops)
- Accounting: payroll process + Thai payroll table (PAYROLL-THAI-2026.md: SSO 5% max 875, PND1, WCF, EWF from 01.10.2026 if 10+ staff); payroll fields from TEAM-AND-QUESTIONS.md.
- Marketing: EXTERNAL-PLATFORMS-30.md, COMPETITORS-ANALYSIS.md, ARTICLE-EXAMPLES-20.md; pick 2 platforms (Phuket Digital Nomads + Nomad List); 1 post/week, 1–2 replies/week; Google Business/Tripadvisor replies.
- SMM: draft external posts until the external-contour bot exists.
- Site: live placecoworking.com still shows 24h / 3 free days / old prices → decide launch new (place-coworking-site) or patch old; day 500 from 01.11.
- Lead: inbound/TG/info@; possibly collecting daily reports (shared with Ops — George to decide).
- New "external contour" bot: only after platform list + post format are fixed (ANALYSIS §4).

## Open questions for George
1. Where is current Tuya.gs (Apps Script project/export)? Not in repo.
2. air3 quota: who owns the Tuya IoT account — John? Upgrade plan allowed (cost)?
3. Daily reports: collected by Ops or Lead? Channel (LINE/Telegram) and time?
4. Team names/contacts/languages — who fills: you or a manager?
5. keyholders: list of "owners" (offices 5 & 2 only, or also long-term members)? Who approves guest night requests?
6. Autoreplies: which channels (Instagram, LINE, WhatsApp)? Who checks Thai?
7. Leave table: new sheet or existing one?
8. OK to send onboarding questions to the team after approval, via which channel?
