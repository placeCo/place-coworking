DRAFT · needs George + Grok

# Leave request form (George 15.10.2026)

Goal: staff never ask Tangmo verbally for leave; every request goes through one form. George approves.

Rules (George):
- Approver: George only (Aiz no longer works at Place).
- Long leave: submit at least 7 days before start.
- Urgent (sick / emergency): submit immediately, same day.
- Verbal requests are not accepted.

Build (deliver to docs/drafts/grok-out/2026-10-15-leave-request-form.md):
1. Google Form fields, TH + EN labels: Name; Position; Type (annual leave / sick / personal day / unpaid / shift swap); Urgent? (yes/no); From; To; Number of days; Who covers the shift; Reason (optional).
2. Responses sheet "Leave" with extra columns: Status (pending/approved/declined), Decided by, Decided at, Reminder sent.
3. Apps Script design (code draft, no deploy): on submit, notify George (short EN message, includes Approve/Decline instructions); flag "late" if non-urgent and start < 7 days away; daily 09:00 run: 3 days before an approved leave, post a short EN reminder to the PLACE Team Telegram group (EN only). Cheap: one daily trigger + onFormSubmit, no loops.
4. Short announcement text for staff, TH + EN (2–3 sentences): how to request leave, the 7-day rule, urgent same day, link placeholder.

Don'ts: no staff names, bank data or salaries in git; nothing sent to anyone; no deploy; PLACE Team messages English only.
