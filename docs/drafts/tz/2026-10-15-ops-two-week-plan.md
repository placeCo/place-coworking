DRAFT · needs George + Grok

# Ops — paced 2-week plan 16.10–29.10.2026

Principle (George, 15.10): slow, cheapest-first, gas is limited. Max 1–2 small Ops tasks/day. Load only CORE.en.md + docs/bots/ops/ROLE-CORE.md; no MEMORY.md. Heavy work → separate TZ in docs/drafts/tz/ marked `heavy` / `Для Grok`, then stop.

Sources: docs/canon/ANALYSIS-HARD-2026-10-15.md (§3 micro-management, §4 gas), docs/ops/TEAM-AND-QUESTIONS.md, docs/ops/PAYROLL-THAI-2026.md, kb/BOT-LOAD.md, existing Ops backlog.

## Budget
- Week 1 (16.10–18.10): Ops spends max 45% of weekly AI budget on this plan. Only A (message to John, no browser) and B (one small md file). Everything else moved to week 2.
- Week 2 (19.10–29.10): normal pacing, 1–2 tasks/day, one medium task per day max; stop and write a TZ if a task grows to high.
- Cost scale: low = one short session, no browser; medium = code edit/test; high = browser/long generation (avoid; route via TZ to Grok).

## Grok split
Grok has a large limit — route generously. Anything beyond a tiny task (code, long docs, research, analysis, translations, multi-file work) goes to Grok. Ops keeps only tiny tasks, specs, checks and deploys.
Heavy items go to George's Grok: Ops writes a short spec in docs/drafts/tz/ (first line `DRAFT · needs George + Grok`), Grok does the work, Ops then checks against canon and deploys after George OK.
- D/D2 Tuya.gs → spec `docs/drafts/tz/2026-10-20-grok-tuya-aliases-colours.md`
- E2 keyholders code → spec `docs/drafts/tz/2026-10-22-grok-keyholders-night.md`
- F autoreplies EN/RU/TH → spec `docs/drafts/tz/2026-10-26-grok-autoreplies.md`
- C TH/EN translation of team questions → spec `docs/drafts/tz/2026-10-19-grok-team-questions-th.md`
- G leave table + reminder Apps Script → spec `docs/drafts/tz/2026-10-27-grok-leave-reminder.md`
- I next-backlog analysis (if more than a short status) → spec on 29.10

## Day by day

| Date | Task | Budget |
|------|------|------|
| Fri 16.10 | A. air3 Tuya quota — ask John (text only, no console/browser) | low |
| Sat 17.10 | B. Daily report template (3 lines) | low |
| Sun 18.10 | rest — week-1 cap 45% | – |
| Mon 19.10 | C. Team list skeleton + 8 onboarding questions → George | low |
| Tue 20.10 | D. Tuya.gs aliases + colours — **Grok**: Ops writes spec | low |
| Wed 21.10 | D2. Check Grok's Tuya.gs result, test 1 device | low–medium |
| Thu 22.10 | E. keyholders rework — **Grok**: Ops writes spec | low |
| Fri 23.10 | E2. Check Grok's code, dry run in test-project | low–medium |
| Sat 24.10 | buffer / George review | – |
| Sun 25.10 | rest | – |
| Mon 26.10 | F. Autoreplies EN/RU/TH — **Grok**: Ops writes spec; check result 27.10 | low |
| Tue 27.10 | G. Leave table + reminder — **Grok**: Ops writes spec; check F result | low |
| Wed 28.10 | H. Urgent-issue flow (status in chat + log) + gas-savings checklist | low |
| Thu 29.10 | I. Wrap-up: status report to George, next 2-week backlog | low |

## Task cards

### A. air3 Tuya quota (16.10)
- Budget: low
- Goal: restore/raise Tuya API quota so air3 readings/control work.
- Refs: Ops backlog; ROLE-CORE (Tuya night read 00:00).
- Steps: ask John by message for current quota/plan (he checks the Tuya IoT console, not Ops via browser); log the answer; if quota exhausted, propose reducing poll frequency (night read only, no polling loops).
- Done: quota status known and written here; night read 00:00 confirmed working or issue logged.

### B. Daily report template (17.10)
- Budget: low
- Goal: 3-line format "done / problem / need" (ANALYSIS §3.2).
- Steps: write docs/ops/DAILY-REPORT.md with template in EN/RU/TH, who sends, by when, who collects (Ops).
- Done: template file exists; George approves collector + time.

### C. Team list + questions (19.10)
- Budget: low
- Goal: prepare onboarding of Thai team to the bot (ANALYSIS §3.4, TEAM-AND-QUESTIONS.md).
- Steps: Ops fills only known roles; George fills names/contacts; TH/EN translation → Grok (spec 2026-10-19-grok-team-questions-th.md); define "what each person gets from bot". Payroll fields → hand to Accounting.
- Done: table with at least roles + language + channel; questions ready to send (send only after George OK).

### D/D2. Tuya.gs EN aliases + status colours for Lena (20–21.10)
- Budget: low for Ops (heavy part → Grok, spec 2026-10-20-grok-tuya-aliases-colours.md)
- Goal: English device aliases and colour-coded status (e.g. green ok / yellow warn / red offline) readable by Lena.
- Refs: Ops backlog. NOTE: Tuya.gs is not in the repo (only Line.gs, keyholders) — need source.
- Steps: get current Tuya.gs (George/Apps Script export) → commit to docs/ops/tuya/; add alias map {deviceId → EN name}; add status→colour mapping in sheet output; test on one device.
- Done: diff committed; Lena sees EN names + colours in one sample run.

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

### G. Leave/days-off table + reminder (27.10)
- Budget: low
- Goal: ANALYSIS §3.3 — table + reminder 3 days before.
- Steps: sheet columns (name, from, to, type, replacement); Apps Script daily trigger (one cheap run/day) — code by Grok (spec 2026-10-27-grok-leave-reminder.md); Ops checks + deploys.
- Done: spec + sheet template; code only after George OK.

### H. Urgent issues + gas checklist (28.10)
- Budget: low
- Goal: ANALYSIS §3.5 + §4. Short doc: how urgent issues are posted/logged; gas rules for all bots (CORE+ROLE-CORE only, no MEMORY.md, heavy → TZ, no images/long texts in bot sessions).
- Done: docs/ops/URGENT-AND-GAS.md (≤1 page).

### I. Wrap-up (29.10)
- Budget: low
- Status of A–H, what slipped, next backlog.

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
