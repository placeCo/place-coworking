import json,requests,collections as C,datetime as dt,time
TOK=open('/home/box/secrets/loyverse_token').read().strip()
S=requests.Session(); S.headers['Authorization']='Bearer '+TOK
R=[r for r in json.load(open('raw/receipts.json')) if not r['cancelled_at']]
cust=json.load(open('raw/customers_today.json'))
ids={r['customer_id'] for r in R if r['customer_id'] and r['total_discount']>0}-set(cust)
for i in ids:
    r=S.get('https://api.loyverse.com/v1.0/customers/'+i,timeout=30)
    if r.status_code==200: cust[i]=r.json()
    time.sleep(0.1)
json.dump(cust,open('raw/customers_discounted.json','w'),ensure_ascii=False,indent=1)
ict=dt.timezone(dt.timedelta(hours=7))
def t(s): return dt.datetime.fromisoformat(s.replace('Z','+00:00')).astimezone(ict)
def grp(cid):
    if not cid: return 'NO CUSTOMER'
    n=(cust.get(cid,{}).get('name') or '')
    if 'Staff' in n: return 'Staff'
    if 'Owner' in n: return 'Owner'
    if 'Georgii' in n or 'friend' in n.lower(): return 'Owner friend'
    return 'Other customer'
full=C.Counter(); fullm=C.Counter(); who=C.Counter(); hrs=C.Counter()
for r in R:
    if any(d['type']=='FIXED_PERCENT' and d['percentage']==100 for d in r['total_discounts']):
        g=grp(r['customer_id']); full[g]+=1; fullm[g]+=r['total_discount']; who[cust.get(r['customer_id'],{}).get('name')]+=r['total_discount']; hrs[t(r['receipt_date']).hour]+=1
print('100% by group',full,fullm); print(who.most_common(15)); print(sorted(hrs.items()))
pts=C.Counter()
for r in R:
    for d in r['total_discounts']:
        if d['type']=='DISCOUNT_BY_POINTS': pts[cust.get(r['customer_id'],{}).get('name')]+=d['money_amount']
print('points',pts.most_common(8))
pers=C.Counter()
for r in R:
    for d in r['total_discounts']:
        if d['name']=='PERSONAL DISCOUNT': pers[tuple(li['item_name'] for li in r['line_items'])]+=d['money_amount']
print('personal',pers.most_common(8))
# items in 100% receipts
it=C.Counter()
for r in R:
    if any(d.get('percentage')==100 for d in r['total_discounts']):
        for li in r['line_items']: it[li['item_name']]+=li['quantity']
print(it.most_common(15))
