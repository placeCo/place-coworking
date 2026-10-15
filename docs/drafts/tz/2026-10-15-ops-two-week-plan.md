DRAFT · needs George + Grok

# Ops — paced 2-week plan 16.10–29.10.2026

Principle (George, 15.10): slow, cheapest-first, gas is limited. Max 1–2 small Ops tasks/day. Load only CORE.en.md + docs/bots/ops/ROLE-CORE.md; no MEMORY.md. Heavy work → separate TZ in docs/drafts/tz/ marked `heavy` / `Для Grok`, then stop.

Sources: docs/canon/ANALYSIS-HARD-2026-10-15.md (§3 micro-management, §4 gas), docs/ops/TEAM-AND-QUESTIONS.md, docs/ops/PAYROLL-THAI-2026.md, kb/BOT-LOAD.md, existing Ops backlog.

## Day by day

| Date | Task | Cost |
|------|------|------|
| Fri 16.10 | A. air3 Tuya quota — check with John (back 16.10) | low |
| Sat 17.10 | B. Daily report template (3 lines) | low |
| Sun 18.10 | rest / buffer | – |
| Mon 19.10 | C. Team list skeleton + 8 onboarding questions → George | low |
| Tue 20.10 | D. Tuya.gs EN aliases (spec + patch) | med |
| Wed 21.10 | D2. Tuya.gs status colours for Lena | med |
| Thu 22.10 | E. keyholders-247.gs rework — spec | low |
| Fri 23.10 | E2. keyholders-247.gs rework — code draft + test in test-project | med |
| Sat 24.10 | buffer / George review | – |
| Sun 25.10 | rest | – |
| Mon 26.10 | F. Autoreplies EN/RU/TH — audit + draft | med |
| Tue 27.10 | G. Leave/days-off table + 3-day reminder (Apps Script spec) | low |
| Wed 28.10 | H. Urgent-issue flow (status in chat + log) + gas-savings checklist | low |
| Thu 29.10 | I. Wrap-up: status report to George, next 2-week backlog | low |

## Task cards

### A. air3 Tuya quota (16.10)
- Goal: restore/raise Tuya API quota so air3 readings/control work.
- Refs: Ops backlog; ROLE-CORE (Tuya night read 00:00).
- Steps: ask John for current quota/plan in Tuya IoT console; log the answer; if quota exhausted, propose reducing poll frequency (night read only, no polling loops).
- Done: quota status known and written here; night read 00:00 confirmed working or issue logged.

### B. Daily report template (17.10)
- Goal: 3-line format "done / problem / need" (ANALYSIS §3.2).
- Steps: write docs/ops/DAILY-REPORT.md with template in EN/RU/TH, who sends, by when, who collects (Ops).
- Done: template file exists; George approves collector + time.

### C. Team list + questions (19.10)
- Goal: prepare onboarding of Thai team to the bot (ANALYSIS §3.4, TEAM-AND-QUESTIONS.md).
- Steps: Ops fills only known roles; George fills names/contacts; translate the 8 questions to TH/EN (short); define "what each person gets from bot". Payroll fields → hand to Accounting.
- Done: table with at least roles + language + channel; questions ready to send (send only after George OK).

### D/D2. Tuya.gs EN aliases + status colours for Lena (20–21.10)
- Goal: English device aliases and colour-coded status (e.g. green ok / yellow warn / red offline) readable by Lena.
- Refs: Ops backlog. NOTE: Tuya.gs is not in the repo (only Line.gs, keyholders) — need source.
- Steps: get current Tuya.gs (George/Apps Script export) → commit to docs/ops/tuya/; add alias map {deviceId → EN name}; add status→colour mapping in sheet output; test on one device.
- Done: diff committed; Lena sees EN names + colours in one sample run.

### E/E2. keyholders-247.gs rework (22–23.10)
- Refs: docs/ops/handover/keyholders-247.gs, docs/ops/handover/test-project/40-Keyholders.gs.
- Rules: owners (office holders) always have night access; guests only on request (explicit approval/date); never write "24/7" anywhere (texts, sheet headers, logs, file comments). Consider renaming file to keyholders-night.gs.
- Steps: spec (22.10) → code in test-project, dry run (23.10) → George approves before deploy.
- Done: grep "24/7" = 0 in outputs; owner/guest logic tested on sample rows.

### F. Autoreplies EN/RU/TH (26.10)
- Refs: docs/ops/bots/instagram/AUTOREPLIES.md, docs/ops/line/Line.gs, CORE.en.md.
- Steps: audit existing replies vs canon (08:00–23:00, prices, ban list, WhatsApp phrase for office/podcast); draft EN/RU/TH set; TH needs native check.
- Done: one file with 3 languages, banned words = 0; George approves; deploy separately.

### G. Leave/days-off table + reminder (27.10)
- Goal: ANALYSIS §3.3 — table + reminder 3 days before.
- Steps: sheet columns (name, from, to, type, replacement); Apps Script daily trigger spec (one cheap run/day).
- Done: spec + sheet template; code only after George OK.

### H. Urgent issues + gas checklist (28.10)
- Goal: ANALYSIS §3.5 + §4. Short doc: how urgent issues are posted/logged; gas rules for all bots (CORE+ROLE-CORE only, no MEMORY.md, heavy → TZ, no images/long texts in bot sessions).
- Done: docs/ops/URGENT-AND-GAS.md (≤1 page).

### I. Wrap-up (29.10)
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
