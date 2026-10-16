import json, collections as C, datetime as dt
L=lambda n: json.load(open(f'raw/{n}.json'))
cats={c['id']:c['name'] for c in L('categories')}
items={i['id']:i for i in L('items')}
emp={e['id']:e['name'] for e in L('employees')}
ict=dt.timezone(dt.timedelta(hours=7))
def t(s): return dt.datetime.fromisoformat(s.replace('Z','+00:00')).astimezone(ict)
R=L('receipts')
today=dt.date(2026,9,29)
T=[r for r in R if t(r['receipt_date']).date()==today]
Tv=[r for r in T if not r['cancelled_at']]
print('today receipts',len(T),'cancelled',len(T)-len(Tv))
gross=sum(li['gross_total_money'] for r in Tv for li in r['line_items'])
print('gross',gross,'disc',sum(r['total_discount'] for r in Tv),'net',sum(r['total_money'] for r in Tv))
z=[r for r in Tv if r['total_money']==0]
print('zero today',len(z))
for r in sorted(z,key=lambda r:r['receipt_date']):
    print(t(r['receipt_date']).strftime('%H:%M:%S'), r['receipt_number'], emp.get(r['employee_id']), r['customer_id'] and r['customer_id'][:8], [ (li['item_name'],li['quantity'],li['gross_total_money']) for li in r['line_items']], [(d['name'],d['type'],d.get('percentage'),d['money_amount']) for d in r['total_discounts']], [(p['name'],p['money_amount']) for p in r['payments']])
# discounts today by name
dc=C.Counter(); 
for r in Tv:
    for d in r['total_discounts']: dc[d['name']]+=d['money_amount']
print(dc)
# big receipts today
for r in sorted(Tv,key=lambda r:-r['total_discount'])[:8]:
    print(t(r['receipt_date']).strftime('%H:%M'), r['receipt_number'], emp.get(r['employee_id']), r['total_money'], r['total_discount'], [(li['item_name'],li['quantity'],li['gross_total_money']) for li in r['line_items']][:5])
