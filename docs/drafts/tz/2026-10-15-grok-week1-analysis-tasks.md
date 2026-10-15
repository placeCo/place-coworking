DRAFT · needs George + Grok

# Grok TZ — Week 1 analysis tasks (heavy parts) · 16.10–22.10.2026

Ops budget-split (George 15.10): 45% analysis / 45% Ops plan / 10% reserve.  
This TZ covers **heavy** pieces of analysis items 1–6. Ops keeps only low work (status notes, known roles, specs, checks).

**Load only:** `kb/contexts/CORE.en.md` + `docs/bots/ops/ROLE-CORE.md`. Never MEMORY.md.

**Put all results in** `docs/drafts/grok-out/` with the filenames below.

## Global don'ts
- No 24/7 (texts, headers, comments, logs).
- No floor 4.
- No prices beyond CORE.en.md canon.
- **No sending** anything (no messages to team, Accounting, Marketing, platforms, Instagram/LINE/FB).
- No committing staff bank account numbers, full legal names, or payroll photo to the repo.
- Drafts only; mark ASSUMPTION where fact is missing. Stop if task grows — do not invent deploy steps.

---

## 1. Payroll process doc (with Accounting)

**Goal:** Draft a Thai payroll **process** for PLACE so Accounting can run monthly payroll consistently. Status of Sept 2026 is known to George; Grok writes the process + empty template matching the real column structure.

**Source refs:**
- `docs/ops/PAYROLL-THAI-2026.md` (SSO 5% max 875, PND1, WCF, EWF from 01.10.2026 if 10+ staff)
- `docs/ops/TEAM-AND-QUESTIONS.md` (payroll fields block)
- George Sept 2026 payroll sheet (local image only — **do not open into git**):  
  `/workspace/accounting/payroll/2026-09/salary-sept-2026.jpg`  
  Aggregates for context (no per-person data in output): 8 staff; salary 143,000; advances 38,500; SSO 5,822; unpaid leave 16,900; paid 81,778; Tangmo loan 10,000 remaining 2,900.

**Column structure the process/template must produce** (headers only — no real staff rows, no Account numbers, no personal names in git):

| Staff ID | Name | Nickname | Position | Account | Salary | Advance | SSO | WHT | Unpaid leave | Paid | loan deductions |

**Deliverable:** `docs/drafts/grok-out/2026-10-15-payroll-process.md`  
Include: monthly calendar (SSO by 15th next month, PND1 timing), who does what (Ops vs Accounting), empty one-row template with the columns above, checklist for new hire SSO registration (30 days), note on EWF if headcount ≥ 10, loan-deduction field usage.  
**Don'ts:** no real names, nicknames, bank accounts, or photo in the deliverable; no legal advice claims; no sending to Accounting.

---

## 2. Thai team list + questions (TH/EN)

**Goal:** Ready-to-use onboarding / micro-management question pack in **Thai + English** from the existing template; skeleton team table with roles only (no invented personal data).

**Source refs:**
- `docs/ops/TEAM-AND-QUESTIONS.md`
- `docs/canon/ANALYSIS-HARD-2026-10-15.md` (§3.4 Thai team)

**Deliverable:** `docs/drafts/grok-out/2026-10-15-team-questions-th-en.md`  
Include: the 8 questions in TH and EN; payroll-related questions flagged “→ Accounting only”; empty team table columns (Name | Role | TH/RU | Contact | What bot gives | Schedule).  
**Don'ts:** do not invent staff names/contacts; do not send questions to anyone.

---

## 3. Daily reports — format + collector

**Goal:** 3-line daily report format (done / problem / need) + who collects + by when. Multilingual short template.

**Source refs:**
- `docs/canon/ANALYSIS-HARD-2026-10-15.md` (§3.2)
- Role handoff: Ops or Lead collects — leave as open question for George if unknown

**Deliverable:** `docs/drafts/grok-out/2026-10-15-daily-report-format.md`  
(Also suitable later as `docs/ops/DAILY-REPORT.md` after George OK.)  
Include: EN/RU/TH 3-line template; suggested channel placeholder; collector role placeholder; gas note (short text only).  
**Don'ts:** no bot polling loops; no 24/7 wording; no send.

---

## 4. Leave / days-off — table + Apps Script reminder design

**Goal:** Sheet column design + cheap daily Apps Script reminder design (3 days before leave). Design only — no live deploy.

**Source refs:**
- `docs/canon/ANALYSIS-HARD-2026-10-15.md` (§3.3)
- Existing Apps Script patterns under `docs/ops/handover/` if useful for style

**Deliverable:** `docs/drafts/grok-out/2026-10-15-leave-table-reminder-design.md`  
Include: columns (name, from, to, type, replacement, notified?); trigger = one cheap run/day; pseudo-code or Apps Script draft in a fenced block; gas limits (no tight loops).  
**Don'ts:** no deploy instructions that touch production; no 24/7; no floor 4.

---

## 5. Team onboarding to bot — list + what each gets

**Goal:** Onboarding matrix: role → channel → language → what the bot should give each person (minimum viable).

**Source refs:**
- `docs/ops/TEAM-AND-QUESTIONS.md`
- `docs/bots/ops/ROLE-CORE.md` (handoffs: Lead / Marketing / Accounting)
- ANALYSIS §3.4

**Deliverable:** `docs/drafts/grok-out/2026-10-15-onboarding-matrix.md`  
Include: matrix Role | Channel | Lang | Bot outputs | Does not get; 15-min onboarding checklist; note that names/contacts are filled by George/Ops only.  
**Don'ts:** no invented personal data; no sending invites; no prices beyond canon.

---

## 6. External contour — 2 platforms + first post draft

**Goal:** Shortlist **2** platforms and one first-post draft (EN; optional RU note). For Marketing/SMM review — not publish.

**Source refs:**
- `docs/marketing/EXTERNAL-PLATFORMS-30.md`
- Suggested start from Ops plan: Phuket Digital Nomads + Nomad List
- CORE.en.md (hours 08:00–23:00, prices, contacts, banned phrases)

**Deliverable:** `docs/drafts/grok-out/2026-10-15-external-platforms-post-draft.md`  
Include: why these 2; one draft post (useful answer, not spam); WA contact phrase; checklist vs banned list (no 24/7, no 3 free days, no cheapest, no Kathu/83000, no visa-condo, office/podcast → WhatsApp only).  
**Don'ts:** **no posting**; no prices outside CORE; no floor 4.

---

## Ops follow-up (not Grok)
After Grok drops files in `docs/drafts/grok-out/`: Ops checks vs CORE + ROLE-CORE, George approves, then route payroll → Accounting, external draft → Marketing/SMM, leave design deploy → week 2 after OK.
