DRAFT · Grok output for George / Accounting review

# Thai payroll process draft for PLACE (15.10.2026)

Source: docs/ops/PAYROLL-THAI-2026.md + TZ week1 #1. No personal data. Not legal advice.

## Monthly calendar (key dates)
- SSO (employer + employee): by 15th of the following month.
- PND1 (withholding tax): by 7th (or 15th online) of the following month.
- EWF (if applicable, headcount ≥ 10 from 01.10.2026): by 15th of the following month.
- WCF: annual + reconciliation as per Accounting.

## Who does what
- Ops: status notes, collect raw inputs if needed, no calculations.
- Accounting: owns numbers, SSO/PND1/EWF filings, final paid amounts, bank transfers.
- George: approves process and any exceptions.

## Empty one-row template (headers only)

| Staff ID | Name | Nickname | Position | Account | Salary | Advance | SSO | WHT | Unpaid leave | Paid | loan deductions |
|----------|------|----------|----------|---------|--------|---------|-----|-----|--------------|------|-----------------|
| | | | | | | | | | | | |

Use this structure for the monthly sheet. No real names, accounts or amounts in git.

## Checklist — new hire SSO registration
- Within 30 days of start date.
- Accounting handles registration with SSO.
- Ops notes start date in team list (roles only).

## Notes
- SSO 5% each side, max 875 THB (base up to 17 500 THB).
- EWF 0.25% each side if ≥ 10 staff and no qualifying provident fund (confirm with Accounting).
- Loan-deduction field: use only for agreed internal loans; track remaining balance separately (Accounting).
- Aggregates known to George for Sept 2026 context only; do not copy into repo.

ASSUMPTION: Column structure matches the Sept sheet headers as specified in TZ. Confirm with Accounting before use.
