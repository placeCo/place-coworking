# PLACE — monthly payroll process (Ops-approved, 15.10.2026)

Based on Grok draft docs/drafts/grok-out/2026-10-15-payroll-process.md, checked against the Sept 2026 sheet and docs/ops/PAYROLL-THAI-2026.md. No personal data, accounts or amounts in git. Not legal advice.

## Where data lives
- Monthly sheets/images and drafts: box only, `/workspace/accounting/payroll/YYYY-MM/`. Never commit them.

## Monthly flow
1. Ops (by ~25th): staff list for the month (who joined/left/part-time), noted in the box draft. No calculations.
2. Accounting (Pat): salaries, advances, unpaid leave, SSO, WHT, loan deductions → final "Paid".
3. George: approves the sheet and any exception (loans, dismissal pay, part-time terms).
4. Place Accounting bot: makes payments per approved sheet.
5. Pat: files SSO and PND1.

## Deadlines (following month)
- SSO (employee + employer): by 15th.
- PND1: by 7th (paper) / by 15th (e-filing).
- EWF: only if ≥10 employees from 01.10.2026 without a qualifying provident fund — currently not applicable (Oct headcount < 10); recheck on each hire.
- WCF: annual + reconciliation, Pat.

## Sheet columns (as in the actual Sept 2026 sheet)
Staff ID | Name | Nick name | Position | Account Number | Salary | Advance | SSO | WHT | Unpaid leave | Paid
- Paid = Salary − Advance − SSO − WHT − Unpaid leave (− loan deduction, if any).
- Internal loans are NOT a column in the current sheet: tracked as a note under the table (borrowed, each deduction, remaining balance). If a deduction is made that month, Pat shows it explicitly.

## SSO
- 5% each side, base 1 650–17 500 THB, max 875 THB/side.
- In Sept, SSO for some staff was computed on salary minus unpaid leave → Pat confirms the rule (see open questions in box draft).

## New hire / leaver
- New hire: SSO registration within 30 days of start (Pat); Ops notes start date and role.
- Leaver: final pay and SSO deregistration decided by George + Pat; Ops only notes the date.

## Changes vs Grok draft
- Payments: Place Accounting bot, not "Accounting bank transfers"; filings: Pat.
- Removed invented "loan deductions" column — loans tracked as note, as in the real sheet.
- EWF: marked not applicable at current headcount.
- Added flow, leaver step, data-on-box rule.
