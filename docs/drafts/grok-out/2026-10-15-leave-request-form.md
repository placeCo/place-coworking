DRAFT · Grok output for George review

# Leave request form — design (15.10.2026)

Source TZ: docs/drafts/tz/2026-10-15-grok-leave-request-form.md

## 1. Google Form fields (TH + EN labels)

| Field | EN label | TH label | Type | Notes |
|-------|----------|----------|------|-------|
| Name | Full name | ชื่อ-นามสกุล | Short text | Required |
| Position | Position / Role | ตำแหน่ง | Short text | Required |
| Type | Leave type | ประเภทการลา | Dropdown | Annual leave / Sick / Personal day / Unpaid / Shift swap |
| Urgent? | Is this urgent? | เร่งด่วนหรือไม่ | Yes/No | Yes for sick/emergency |
| From | Start date | วันที่เริ่ม | Date | Required |
| To | End date | วันที่สิ้นสุด | Date | Required |
| Number of days | Number of days | จำนวนวัน | Number | Auto or manual |
| Who covers | Who covers the shift | ใครให้ทำงานแทน | Short text | Required |
| Reason | Reason (optional) | เหตุผล (ไม่บังคับ) | Paragraph | Optional |

## 2. Responses sheet "Leave" extra columns

After the form response columns, add:

| Status | Decided by | Decided at | Reminder sent |
|--------|------------|------------|---------------|
| pending / approved / declined | George | timestamp | yes/no |

## 3. Apps Script design (draft only — no deploy)

- Trigger: onFormSubmit → notify George (short EN email or chat message with form response summary + "Approve / Decline by editing Status column").
- Flag late: if Urgent? = No and (From date - today) < 7 days → add note "late non-urgent".
- Daily trigger 09:00: scan approved leaves where (From - today) == 3 days and Reminder sent = no → post short EN reminder to PLACE Team Telegram group, set Reminder sent = yes.
- Cheap: one daily time-based trigger + onFormSubmit. No loops over large ranges.

Pseudo:
```
function onFormSubmit(e) {
  // build short EN message
  // send to George
  // optional: write "pending" + late flag
}
function dailyLeaveReminder() {
  // get sheet, filter approved + 3 days ahead + not reminded
  // send one message per matching leave
  // mark reminded
}
```

## 4. Staff announcement (TH + EN)

**EN:**  
To request leave, fill the form (link). Non-urgent leave must be submitted at least 7 days before the start date. Urgent (sick/emergency) — submit the same day. Verbal requests are not accepted. George approves.

**TH:**  
เพื่อขอลา ให้กรอกฟอร์ม (ลิงก์). ลาที่ไม่เร่งด่วนต้องยื่นล่วงหน้าอย่างน้อย 7 วัน. เร่งด่วน (ป่วย/ฉุกเฉิน) — ยื่นวันดียวกัน. ไม่รับคำขอปากเปล่า. George เป็นผู้อนุมัติ.

ASSUMPTION: Form link placeholder to be filled by Ops/George. No deploy performed.
