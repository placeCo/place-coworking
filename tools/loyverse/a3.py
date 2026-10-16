import json, collections as C, datetime as dt
L=lambda n: json.load(open(f'raw/{n}.json'))
emp={e['id']:e['name'] for e in L('employees')}
ict=dt.timezone(dt.timedelta(hours=7))
def t(s): return dt.datetime.fromisoformat(s.replace('Z','+00:00')).astimezone(ict)
R=L('receipts'); V=[r for r in R if not r['cancelled_at']]
print('total',len(R),'valid',len(V),'cancelled',len(R)-len(V))
# lag created vs receipt_date
lag=[(t(r['created_at'])-t(r['receipt_date'])).total_seconds() for r in V]
print('lag>5min', sum(l>300 for l in lag), 'max lag h', max(lag)/3600)
for r in V:
  if r['receipt_date']>='2026-09-29T11:40': print(r['receipt_number'], t(r['receipt_date']).strftime('%H:%M:%S'), t(r['created_at']).strftime('%H:%M:%S'))
pc=C.Counter(); pm=C.Counter(); multi=0
for r in V:
    if len(r['payments'])>1: multi+=1
    for p in r['payments']: pc[p['name']]+=1; pm[p['name']]+=p['money_amount']
tot=sum(pm.values())
print('payments count',pc,'multi-tender',multi)
for k,v in pm.most_common(): print(f'  {k}: {v:.0f} ({v/tot*100:.1f}%) n={pc[k]}')
gross=sum(li['gross_total_money'] for r in V for li in r['line_items']); disc=sum(r['total_discount'] for r in V); net=sum(r['total_money'] for r in V)
print('30d gross',gross,'disc',disc, f'{disc/gross*100:.1f}%','net',net, 'tips',sum(r['tip'] for r in V))
dn=C.Counter(); dcount=C.Counter()
for r in V:
    for d in r['total_discounts']: dn[(d['name'],d['type'],d.get('percentage'))]+=d['money_amount']; dcount[(d['name'],d['type'],d.get('percentage'))]+=1
for k,v in dn.most_common(): print('  disc',k,v,dcount[k])
Z=[r for r in V if r['total_money']==0]
print('zero receipts',len(Z), f'{len(Z)/len(V)*100:.1f}%', 'gross of zero', sum(li['gross_total_money'] for r in Z for li in r['line_items']))
zt=C.Counter()
for r in Z:
    k=tuple(sorted({d['name'] for d in r['total_discounts']})) or ('NO DISCOUNT',)
    zt[k]+=1
print(zt)
print('zero w/o discount:', [(r['receipt_number'],[li['item_name'] for li in r['line_items']]) for r in Z if not r['total_discounts']][:10])
print('zero by emp', C.Counter(emp.get(r['employee_id']) for r in Z))
print('zero payment', C.Counter(p['name'] for r in Z for p in r['payments']))
# zero by day
zd=C.Counter(t(r['receipt_date']).date().isoformat() for r in Z); print(sorted(zd.items()))
# cancelled
print('cancelled', [(r['receipt_number'], t(r['receipt_date']).strftime('%m-%d %H:%M'), r['total_money']) for r in R if r['cancelled_at']][:25])
# receipt_number prefixes
print(C.Counter(r['receipt_number'].split('-')[0] for r in R), C.Counter(r['pos_device_id'][:8] for r in R))
print('with customer', sum(bool(r['customer_id']) for r in V))
print('line_note', sum(bool(li['line_note']) for r in V for li in r['line_items']), 'modifiers', sum(bool(li['line_modifiers']) for r in V for li in r['line_items']))
print('receipts/day', len(V)/31)
