import json, collections as C, datetime as dt, math
L=lambda n: json.load(open(f'raw/{n}.json'))
cats={c['id']:c['name'] for c in L('categories')}
items=L('items'); inv={x['variant_id']:x for x in L('inventory')}
ict=dt.timezone(dt.timedelta(hours=7))
def t(s): return dt.datetime.fromisoformat(s.replace('Z','+00:00')).astimezone(ict)
R=[r for r in L('receipts') if not r['cancelled_at']]
GROUP={'soup':'kitchen','Breakfast':'kitchen','lunch':'kitchen','Dessert':'kitchen',
 'Meat snacks':'snacks_resale','Bars':'snacks_resale','Ice cream':'snacks_resale','Choco paste':'snacks_resale',
 'Coffee & tea':'drinks_bar','Smoothie & lemonade':'drinks_bar','BAR':'drinks_bar',
 'Metal can drinks':'drinks_packaged','Glass & plastic drinks':'drinks_packaged','Beer':'drinks_packaged',
 '1 day pass':'coworking_pass','1 week, 10 days pass':'coworking_pass','1 month, 3 months pass, 1 year':'coworking_pass'}
def grp(cid): return GROUP.get(cats.get(cid),'other')
D0=dt.date(2026,8,30); D1=dt.date(2026,9,28); W0=dt.date(2026,9,22)
ndays=(D1-D0).days+1
wdcount=C.Counter((D0+dt.timedelta(d)).weekday() for d in range(ndays))
var={}
for i in items:
    for v in i['variants']:
        name=i['item_name']+(' / '+' '.join(x for x in [v['option1_value'],v['option2_value'],v['option3_value']] if x) if v['option1_value'] else '')
        st=next((s for s in v['stores'] if s['store_id'].startswith('e4054a32')),{})
        var[v['variant_id']]=dict(item=i['item_name'],name=name,cat=cats.get(i['category_id'],'—'),grp=grp(i['category_id']),track=i['track_stock'],
            stock=inv.get(v['variant_id'],{}).get('in_stock'),inv_upd=inv.get(v['variant_id'],{}).get('updated_at'),
            sold30=0,sold7=0,today=0,wd=C.Counter(),supplier=i['primary_supplier_id'],cost=v['cost'],purchase_cost=v['purchase_cost'],
            optimal=st.get('optimal_stock'),low=st.get('low_stock'),sku=v['sku'],avail=st.get('available_for_sale'))
unknown=C.Counter()
for r in R:
    d=t(r['receipt_date']).date()
    for li in r['line_items']:
        x=var.get(li['variant_id'])
        if not x: unknown[li['item_name']]+=li['quantity']; continue
        q=li['quantity']
        if d==dt.date(2026,9,29): x['today']+=q
        elif D0<=d<=D1:
            x['sold30']+=q; x['wd'][d.weekday()]+=q
            if d>=W0: x['sold7']+=q
print('unknown variants',unknown)
rows=[]
for vid,x in var.items():
    x['avg30']=x['sold30']/ndays; x['avg7']=x['sold7']/7
    x['wd_avg']={w:x['wd'][w]/wdcount[w] for w in range(7)}
    x['cover']=(x['stock']/x['avg30']) if (x['stock'] is not None and x['avg30']>0) else None
    x['vid']=vid; rows.append(x)
json.dump(rows,open('variants_summary.json','w'),ensure_ascii=False,indent=1,default=str)
# summaries
sold=[x for x in rows if x['sold30']+x['today']>0]
print('variants total',len(rows),'tracked',sum(x['track'] for x in rows),'sold in 30d',len(sold))
for g in ['kitchen','snacks_resale','drinks_bar','drinks_packaged','coworking_pass','other']:
    s=[x for x in sold if x['grp']==g]
    print(g,'sold variants',len(s),'tracked',sum(x['track'] for x in s),'untracked',[x['name'] for x in s if not x['track']][:30])
tr=[x for x in rows if x['track']]
print('tracked: neg',sum(1 for x in tr if x['stock'] is not None and x['stock']<0),'zero',sum(1 for x in tr if x['stock']==0),'none',sum(1 for x in tr if x['stock'] is None))
for g in ['kitchen','snacks_resale','drinks_bar','drinks_packaged','coworking_pass','other']:
    s=[x for x in tr if x['grp']==g]
    print(' ',g,'tracked',len(s),'neg',sum(1 for x in s if (x['stock'] or 0)<0),'zero',sum(1 for x in s if x['stock']==0),'pos',sum(1 for x in s if (x['stock'] or 0)>0))
print('optimal/low set', sum(1 for x in rows if x['optimal'] is not None), sum(1 for x in rows if x['low'] is not None), 'purchase_cost set', sum(1 for x in rows if x['purchase_cost']))
