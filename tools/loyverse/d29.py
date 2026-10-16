import json,collections as C,datetime as dt
ict=dt.timezone(dt.timedelta(hours=7))
t=lambda s: dt.datetime.fromisoformat(s.replace('Z','+00:00')).astimezone(ict)
L=lambda n: json.load(open(n))
cats={c['id']:c['name'] for c in L('raw/categories.json')}
items={i['id']:i for i in L('raw/items.json')}
cust={c['id']:c.get('name') for c in L('raw/customers_all.json')}
A=L('raw/receipts_29sep_repull_PLACE.json'); B=L('raw/receipts_29sep_repull_ALLSTORES.json')
print('store ids all-stores query:',C.Counter(r['store_id'][:8] for r in B))
D=[r for r in A if t(r['receipt_date']).date()==dt.date(2026,9,29)]
print('29.09 ICT receipts',len(D),'range',t(min(r['receipt_date'] for r in D)),t(max(r['receipt_date'] for r in D)))
print('types',C.Counter(r['receipt_type'] for r in A), 'refunds', [(r['receipt_number'],r['refund_for'],r['receipt_date']) for r in A if r['receipt_type']=='REFUND'])
print('cancelled 29.09:',[(r['receipt_number'],r['total_money'],r['cancelled_at'],[l['item_name'] for l in r['line_items']]) for r in D if r['cancelled_at']])
# created 29 but dated other day / vice versa
print('dated 29 created later:',[(r['receipt_number'],r['created_at']) for r in D if t(r['created_at']).date()!=dt.date(2026,9,29)])
GRP={'1 day pass':'passes','1 week, 10 days pass':'passes','1 month, 3 months pass, 1 year':'passes','Print/scan':'print',
 'soup':'food','Breakfast':'food','lunch':'food','Dessert':'food','Meat snacks':'snacks','Bars':'snacks','Ice cream':'snacks',
 'Coffee & tea':'drinks','Smoothie & lemonade':'drinks','Metal can drinks':'drinks','Glass & plastic drinks':'drinks','Beer':'drinks','BAR':'drinks'}
def summarize(rs,label):
    g=d=n=0; cat=C.defaultdict(lambda:[0,0,0]); pay=C.Counter(); payn=C.Counter(); ptsd=0; full=0; zero=0
    for r in rs:
        g+=sum(l['gross_total_money'] for l in r['line_items']); d+=r['total_discount']; n+=r['total_money']
        if r['total_money']==0: zero+=1
        for x in r['total_discounts']:
            if x['type']=='DISCOUNT_BY_POINTS': ptsd+=x['money_amount']
            elif x.get('percentage')==100: full+=x['money_amount']
        for l in r['line_items']:
            i=items.get(l['item_id']); c=GRP.get(cats.get(i['category_id']) if i else None,'other:'+(cats.get(i['category_id'],'?') if i else '?'))
            cat[c][0]+=l['gross_total_money']; cat[c][1]+=l['total_discount']; cat[c][2]+=l['total_money']
        for p in r['payments']: pay[p['name']]+=p['money_amount']; payn[p['name']]+=1
    print(f'--- {label}: receipts {len(rs)} (0฿: {zero}) gross {g:.0f} disc {d:.0f} net {n:.0f} | points-disc {ptsd:.0f} | 100%-disc {full:.0f}')
    for k,v in sorted(cat.items(),key=lambda x:-x[1][0]): print(f'   {k:28} gross {v[0]:8.0f} disc {v[1]:7.0f} net {v[2]:8.0f}')
    print('   payments', {k:(round(v),payn[k]) for k,v in pay.items()})
    return cat
V=[r for r in D if not r['cancelled_at']]
summarize(D,'ALL incl cancelled (as a naive pull)')
summarize(V,'CORRECT: excl cancelled')
Vp=[r for r in V if r['total_money']>0]
summarize(Vp,'excl cancelled and 0฿')
# other-category detail
for r in V:
    for l in r['line_items']:
        i=items.get(l['item_id']); c=cats.get(i['category_id']) if i else '?'
        if GRP.get(c) is None: print('  other:',r['receipt_number'],t(r['receipt_date']).strftime('%H:%M'),c,l['item_name'],l['gross_total_money'],l['total_money'],[p['name'] for p in r['payments']],cust.get(r['customer_id']))
print('after 19:06:',[(r['receipt_number'],t(r['receipt_date']).strftime('%H:%M'),r['total_money'],r['total_discount'],[l['item_name'] for l in r['line_items']],[p['name'] for p in r['payments']],cust.get(r['customer_id'])) for r in V if t(r['receipt_date']).strftime('%H:%M')>'19:06'])
# non-zero receipts with discounts
print('discounted paid:',[(r['receipt_number'],r['total_money'],[(x['name'],x.get('percentage'),x['money_amount']) for x in r['total_discounts']],cust.get(r['customer_id'])) for r in V if r['total_discount']>0 and r['total_money']>0])
# Transfer/Card detail
for pn in ['Transfer','Card']:
    print(pn,[(r['receipt_number'],t(r['receipt_date']).strftime('%H:%M'),p['money_amount'],cust.get(r['customer_id'])) for r in V for p in r['payments'] if p['name']==pn])
