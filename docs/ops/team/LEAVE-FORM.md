# Leave request form — FINAL (approved by George, 15.10.2026)

Based on draft: docs/drafts/grok-out/2026-10-15-leave-request-form.md

## 1. Leave types / ประเภทการลา (listed separately)

| # | EN | TH |
|---|----|----|
| 1 | Annual leave (vacation) | ลาพักร้อน (ลาพักผ่อนประจำปี) |
| 2 | Sick leave | ลาป่วย |
| 3 | Personal day (day off) | ลากิจ |
| 4 | Unpaid leave | ลาโดยไม่รับค่าจ้าง |
| 5 | Shift swap | สลับกะ |

## 2. Notice rules / กฎการแจ้งล่วงหน้า

| Type | Notice (EN) | TH |
|------|-------------|----|
| Annual leave | At least 7 days before start date | ล่วงหน้าอย่างน้อย 7 วัน |
| Unpaid leave | At least 7 days before start date | ล่วงหน้าอย่างน้อย 7 วัน |
| Personal day | Submit as early as possible (no fixed minimum) | ยื่นให้เร็วที่สุดเท่าที่ทำได้ (ไม่มีขั้นต่ำ) |
| Sick leave / emergency | Same day — notify as soon as you can | แจ้งภายในวันเดียวกัน โดยเร็วที่สุด |
| Shift swap | Submit before the shift; George confirms | ยื่นก่อนกะ; George ยืนยัน |

- Verbal requests are not accepted — use the form. / ไม่รับคำขอปากเปล่า กรุณาใช้ฟอร์ม
- George approves all requests. / George เป็นผู้อนุมัติทุกคำขอ
- Sick leave is never refused because of late notice. If you are too ill to fill the form, a message to George is enough and the form can be filled later. / การลาป่วยจะไม่ถูกปฏิเสธเพราะแจ้งช้า หากป่วยจนกรอกฟอร์มไม่ได้ ให้แจ้ง George แล้วกรอกฟอร์มภายหลังได้
- The 7-day rule applies to annual/unpaid leave only; it never reduces statutory entitlements below.

## 3. Thai law compliance — Labour Protection Act B.E. 2541

| Topic | Rule | Section |
|-------|------|---------|
| Sick leave | Entitled for as long as actually sick; paid up to 30 working days/year. No advance notice can be required (illness is not planned). | s.32, s.57 |
| Medical certificate | May be requested for sick leave of 3+ consecutive days; if none, employee gives an explanation. | s.32 |
| Personal business leave | At least 3 paid working days/year. | s.34, s.57/1 |
| Annual leave | At least 6 working days/year after 1 year of continuous service (pro rata possible before). | s.30 |

Sources:
- Ministry of Labour (official EN): https://www.mol.go.th/wp-content/uploads/sites/2/1998/01/Labour%5FProtection%5FAct%5FBE2541.pdf
- ILO NATLEX: https://natlex.ilo.org/dyn/natlex2/natlex2/files/download/49727/THA81031%20Eng%202014.pdf
- Thai Law Online: https://www.thailawonline.com/documents/Labour%20Laws/The%20Labour%20Protection%20Act%20B.E.%202541.pdf

## 4. Google Form fields (TH + EN)

| Field | EN label | TH label | Type | Notes |
|-------|----------|----------|------|-------|
| Name | Full name | ชื่อ-นามสกุล | Short text | Required |
| Position | Position / Role | ตำแหน่ง | Short text | Required |
| Type | Leave type | ประเภทการลา | Dropdown | 5 types from §1 |
| Urgent? | Is this urgent? | เร่งด่วนหรือไม่ | Yes/No | Yes for sick/emergency |
| From | Start date | วันที่เริ่ม | Date | Required |
| To | End date | วันที่สิ้นสุด | Date | Required |
| Days | Number of days | จำนวนวัน | Number | Required |
| Cover | Who covers the shift | ผู้ทำงานแทน | Short text | Required except sick leave |
| Medical cert | Medical certificate (sick 3+ days, if requested) | ใบรับรองแพทย์ (ลาป่วย 3 วันขึ้นไป หากร้องขอ) | File upload / note | Optional |
| Reason | Reason (optional) | เหตุผล (ไม่บังคับ) | Paragraph | Optional |

## 5. Responses sheet "Leave" extra columns

| Status | Decided by | Decided at | Reminder sent |
|--------|------------|------------|---------------|
| pending / approved / declined | George | timestamp | yes/no |

Automation (draft, not deployed): onFormSubmit notifies George; flag "late" only for Annual/Unpaid with < 7 days notice (never for Sick/Personal); daily 09:00 reminder 3 days before approved leave.

## 6. Announcement — PLACE Team (EN only)

> Hi team! From now on, all leave requests go through the leave form (link). Types: Annual leave (vacation), Sick leave, Personal day (day off), Unpaid leave, Shift swap.
> • Annual and unpaid leave: submit at least 7 days ahead.
> • Personal day: submit as early as possible.
> • Sick leave / emergency: let us know the same day, as soon as you can. Sick leave is never refused for short notice — if you're too unwell, message George and fill the form later. For 3+ consecutive sick days a medical certificate may be requested.
> • Verbal requests are not accepted. George approves all requests.
> Thank you!

Form link placeholder to be filled by Ops/George. No personal staff data in this file.
