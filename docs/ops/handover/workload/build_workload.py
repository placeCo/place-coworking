#!/usr/bin/env python3
"""Builds WORKLOAD.csv / WORKLOAD.tsv and the tables in ../WORKLOAD.md from the task list below.
All minutes are ESTIMATES (see 'basis'), rounded to 5 min where possible. Edit the list, re-run: python3 build_workload.py"""
import csv, os
# role, id, area, task, freq, occ_per_week, min_before, min_after, status, basis, source
# freq: shift / day / week / month / per event. occ_per_week: admins 7 shifts/week (the role, not one person); month = 12/52.
M = 12 / 52
R = [
# ---------- morning admin (shift A 08:00-17:00; mid shift B 11-20 tasks before 17:00 counted here) ----------
('morning admin','MA01','opening','Lights, AC/fans, windows, TV/music, mosquito devices (O1, O2, O4, O13, O14)','shift',7,15,15,'manual','estimate: 5 floors, ~3 min per floor','CHECKLISTS A'),
('morning admin','MA02','opening','Toilets, floor 3, corridors, reception check (O5-O8)','shift',7,20,20,'manual','estimate: 5 floors, ~4 min per floor','CHECKLISTS A'),
('morning admin','MA03','opening','Count change float + open Loyverse shift (O9, O10)','shift',7,10,10,'manual','estimate','CHECKLISTS A'),
('morning admin','MA04','cafe','Showcase: light, expiry dates, 50% labels, photo, dessert count (O11, K1-K3)','shift',7,10,10,'manual','estimate','CHECKLISTS A, D2 K'),
('morning admin','MA05','cafe','Showcase order to the cook (O12)','shift',7,5,1,'automated after go-live','estimate; draft order by Loyverse worker (not deployed), admin only checks','Loyverse REPORT §3'),
('morning admin','MA06','opening','Locker dates (O15)','shift',7,5,5,'manual','estimate','CHECKLISTS A'),
('morning admin','MA07','bookings','Check today\'s events and bookings (O16)','shift',7,5,1,'automated after go-live','estimate; bookings-today in the 10:07 summary (B, tested)','STATUS G-5'),
('morning admin','MA08','members','Passes expiring today/tomorrow, renewal reminders, resident messages (O17, K4, Z3)','shift',7,15,10,'automated by bot','estimate; renewal reminders already sent by checkAndSendReminder (live)','STATUS M-2.2'),
('morning admin','MA09','issues','Report breakdowns to «Тех вопросы» (O18)','shift',7,5,5,'manual','estimate','CHECKLISTS A'),
('morning admin','MA10','purchasing','Makro delivery: check goods against the receipt, photos (O19, D1-D4)','per event',3,15,15,'manual','estimate; deliveries per week unknown, assumed 3','CHECKLISTS O19 (George 30.09)'),
('morning admin','MA11','cafe','Dessert order before 12:00 (Z1, Z2)','shift',7,5,5,'manual','estimate','CHECKLISTS D2 Z'),
('morning admin','MA12','front desk','Guest service: sales, payments, Loyverse (≈30 receipts 08-17)','shift',7,60,60,'manual','estimate: ~2 min per receipt; count from Loyverse 30.08-29.09 (~30 receipts/day 08:00-16:59)','Loyverse receipts'),
('morning admin','MA13','front desk','Bar drinks (coffee, smoothies) ≈15 per shift','shift',7,45,45,'manual','estimate: ~3 min per drink; Loyverse ~31 bar drinks/day, split by time; ASSUMES admins make drinks (confirm with Lena)','Loyverse receipts'),
('morning admin','MA14','front desk','Guest/lead messages and calls (TG, IG, phone)','shift',7,30,30,'manual','estimate, no data','DUTY-MAP 4.2, M-2.1'),
('morning admin','MA15','front desk','Unpaid ❌ orders follow-up (daytime part)','shift',7,5,5,'manual','estimate','CHECKLISTS D2 U'),
('morning admin','MA16','events','Meeting room / event setup and cleanup (E1-E5), daytime share','per event',8,20,20,'manual','estimate: ~20 min per booking; Events and booking Sept: 69 bookings/30 days ≈ 16/week, half in the day','Events and booking (Sept)'),
('morning admin','MA17','handover','Handover to the next shift: cash together, ❌, bookings, open issues (H1-H7)','shift',7,10,10,'manual','estimate','CHECKLISTS C'),
('morning admin','MA18','cleaning','Hourly tidy-up / dishes (oral rule)','shift',7,20,20,'manual','estimate, no data','CHECKLISTS D (oral rule)'),
('morning admin','MA19','weekly','Weekly tasks: power banks, storage, drinks stock, cables, broken lamps (W1-W5)','week',1,30,30,'manual','estimate','CHECKLISTS D2 W'),
('morning admin','MA20','reporting','Answer the bot checklist in TG (ticks + photos) for opening','shift',7,0,5,'automated after go-live','estimate; NEW work that comes with the TG checklist','CHECKLISTS E'),
('morning admin','MA21','rounds','Day rounds 11:00 / 13:00 / 15:00 (R1-R6, S1-S2)','shift',7,30,30,'paused','estimate: 3 × 10 min; paused by George 29.09, not in totals','CHECKLISTS D1'),
('morning admin','MA22','opening','Wi-Fi speedtest floors 1 and 3 (O3, R5)','shift',7,5,0,'removed','estimate; removed 29.09: internet is monitored automatically','CHECKLISTS D (George 29.09)'),
# ---------- evening admin (shift C 14:00-23:00) ----------
('evening admin','EA01','kitchen','16:00 cook stock list, vegetables, drinks/ice-cream check (P1-P4)','shift',7,15,15,'manual','estimate','CHECKLISTS D2 P'),
('evening admin','EA02','purchasing','Makro order for tomorrow (C16) when needed','per event',3,15,15,'manual','estimate; assumed 3 orders/week, otherwise «не нужно»','CHECKLISTS C16 (George 30.09)'),
('evening admin','EA03','evening','Chairs in, plants watered (C1, V1, V3)','shift',7,20,20,'manual','estimate','CHECKLISTS B, D2 V'),
('evening admin','EA04','closing','Showcase photo, 22:45 closing announcement (C2, C3)','shift',7,5,5,'manual','estimate','CHECKLISTS B'),
('evening admin','EA05','closing','Close unpaid ❌ orders of the day (C4, U1-U3)','shift',7,10,5,'automated after go-live','estimate; 21:00 unpaid-orders check by the bot (5.1.6, in TEST)','STATUS 5.1.6'),
('evening admin','EA06','closing','Cash count 23:00, Loyverse cash/transfer/card check, close shift, note differences (C5-C7)','shift',7,20,15,'automated by bot','estimate; Loyverse reconciliation by the worker (A), counting stays manual','STATUS 5.1.7/5.1.8'),
('evening admin','EA07','closing','Batch entry of free drinks for staff/owner/friends in Loyverse (≈15 zero-price receipts/day)','shift',7,15,15,'manual','estimate: ~1 min per receipt; Loyverse: 455 «Discount 100%» receipts in 30 days, 96% entered 17-22h','Loyverse REPORT §4'),
('evening admin','EA08','closing','24/7 residents still inside (C8)','shift',7,3,2,'automated after go-live','estimate; 24/7 list from Resident info K:M (columns added 30.09)','STATUS C8'),
('evening admin','EA09','closing','Trash all floors, kitchen clean, dishes (C9)','shift',7,20,20,'manual','estimate','CHECKLISTS B'),
('evening admin','EA10','closing','Windows, AC, lights/TV/music, charging, lock door (C10-C14)','shift',7,15,15,'manual','estimate: 5 floors','CHECKLISTS B'),
('evening admin','EA11','closing','Incident log of the day (C15)','shift',7,5,3,'automated after go-live','estimate; issues-log keeps open issues','STATUS 2.1.5'),
('evening admin','EA12','front desk','Guest service: sales, payments, Loyverse (≈24 paid receipts 14-23)','shift',7,50,50,'manual','estimate: ~2 min per receipt; Loyverse ~39 receipts/day from 14:00 minus ~15 zero-price batch entries','Loyverse receipts'),
('evening admin','EA13','front desk','Bar drinks ≈20 per shift','shift',7,60,60,'manual','estimate: ~3 min per drink; Loyverse ~25 bar drinks/day after 14:00; ASSUMES admins make drinks','Loyverse receipts'),
('evening admin','EA14','front desk','Guest/lead messages and calls','shift',7,30,30,'manual','estimate, no data','DUTY-MAP 4.2'),
('evening admin','EA15','events','Meeting room / event setup and cleanup (E1-E5), evening share','per event',8,20,20,'manual','estimate: ~20 min per booking, ≈16 bookings/week','Events and booking (Sept)'),
('evening admin','EA16','handover','Receive handover (H1-H7)','shift',7,5,5,'manual','estimate','CHECKLISTS C'),
('evening admin','EA17','cash','Prepare cash + count sheet for the Thai partner (every 3 days)','per event',7/3,10,10,'manual','estimate; reminder by the bot after go-live, counting stays manual','AUTOMATION-NEXT draft 3'),
('evening admin','EA18','cleaning','Hourly tidy-up / dishes (oral rule)','shift',7,20,20,'manual','estimate, no data','CHECKLISTS D'),
('evening admin','EA19','reporting','Answer the bot checklist in TG (ticks + photos) for closing','shift',7,0,5,'automated after go-live','estimate; NEW work that comes with the TG checklist','CHECKLISTS E'),
('evening admin','EA20','rounds','Rounds 19:00 / 21:00 (R1-R6)','shift',7,20,20,'paused','estimate: 2 × 10 min; paused by George 29.09, not in totals','CHECKLISTS D1'),
('evening admin','EA21','rounds','Toilets round 16:30 (T1-T3)','shift',7,10,0,'removed','estimate; removed 29.09 (cleaners until ~17:00)','CHECKLISTS D (George 29.09)'),
# ---------- manager (Lena) ----------
('manager','MG01','schedule','Next month schedule in Schedule 26 (with Place Ops)','month',M,120,120,'manual','estimate: 10 staff × 30 days','STATUS M-3.1 (approved)'),
('manager','MG02','schedule','Weekly swaps and corrections','week',1,30,30,'manual','estimate','STATUS M-3.1'),
('manager','MG03','schedule','Coverage check: hours without an admin, two on leave the same day','week',1,30,5,'automated after go-live','estimate; schedule-coverage digest (draft)','schedule-coverage.gs'),
('manager','MG04','leave','Leave requests: decide, check coverage, mark in the schedule (with George)','per event',2,10,2,'automated after go-live','estimate; ~2 requests/week assumed; bot request/approve/mark (TEST)','STATUS G-13, leave-requests.gs'),
('manager','MG05','offices','Electricity bills to office tenants (approved role)','month',M,90,70,'automated after go-live','estimate: ~6 offices × 15 min (number of offices to confirm; Office rent registry empty); bot creates the task on the day','STATUS G-10a'),
('manager','MG06','offices','Office rent reminders, deposits, registry (PROPOSAL for Lena; owner Place Ops)','month',M,60,20,'automated after go-live','estimate; stage6 drafts, human reviews','STATUS 2.1.9/2.1.10/5.1.5'),
('manager','MG07','events','Event preparation: organiser, room, equipment (approved 30.09)','per event',3,20,15,'automated after go-live','estimate; ~3 floor events/week assumed; reminder from bookings (spec only)','STATUS §4 events'),
('manager','MG08','on site','Senior on site: staff questions, guest escalations, coordination','day',7,30,30,'manual','estimate, no data; the largest uncertainty','STATUS M-3.2 (Lena for now)'),
('manager','MG09','issues','Breakdowns: follow up with Som, contractors','day',7,10,5,'automated after go-live','estimate; issues-log digest 10:07/23:10','STATUS 2.1.5'),
('manager','MG10','checklists','Check who missed opening/closing items','day',7,10,5,'automated after go-live','estimate; bot summary 23:10 / 10:07 after go-live','CHECKLISTS D4'),
('manager','MG11','accounts','Accounts: Wi-Fi/router, Deskimo, work phone (shared with George)','week',1,30,20,'automated after go-live','estimate; internet monitoring after go-live (waiting for Vitya)','STATUS §4 accounts, M-1.2'),
('manager','MG12','keys','24/7 key register: new/expired holders, deposits','week',1,15,10,'automated after go-live','estimate; keyholders list 22:30 after go-live','STATUS C8'),
]
HEAD = ['role','id','area','task','frequency','occurrences_per_week','min_per_occurrence_before','min_per_occurrence_after','min_per_week_before','min_per_week_after','status','estimate_basis','source']
rows = []
for r in R:
    role,i,area,task,freq,occ,mb,ma,st,basis,src = r
    counted = st != 'paused'
    wb = round(occ*mb) if counted else 0
    wa = round(occ*ma) if counted and st != 'removed' else 0
    rows.append([role,i,area,task,freq,round(occ,2),mb,ma,wb,wa,st,basis,src])
here = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(here,'WORKLOAD.csv'),'w',newline='',encoding='utf-8') as f: w=csv.writer(f); w.writerow(HEAD); w.writerows(rows)
with open(os.path.join(here,'WORKLOAD.tsv'),'w',newline='',encoding='utf-8') as f: w=csv.writer(f,delimiter='\t'); w.writerow(HEAD); w.writerows(rows)
# totals
def tot(role, col):
    return sum(x[col] for x in rows if x[0]==role)
out = {}
for role in ['morning admin','evening admin']:
    b, a = tot(role,8)/7, tot(role,9)/7
    paused = sum(round(x[5]*x[6]) for x in rows if x[0]==role and x[10]=='paused')/7
    out[role] = (b, a, paused)
mg = (tot('manager',8), tot('manager',9))
top = sorted([x for x in rows if x[10]!='paused'], key=lambda x: -x[8])[:8]
import json
print(json.dumps({'admins': {k:[round(v/60,2) for v in vs] for k,vs in out.items()}, 'manager_h_week': [round(v/60,1) for v in mg]}, ensure_ascii=False))
for x in top: print(x[0],x[1],x[3][:70],x[8],x[9])
