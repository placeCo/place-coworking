import json, collections as C, datetime as dt
L=lambda n: json.load(open(f'raw/{n}.json'))
cats={c['id']:c['name'] for c in L('categories')}
items=L('items'); R=L('receipts')
ict=dt.timezone(dt.timedelta(hours=7))
def t(s): return dt.datetime.fromisoformat(s.replace('Z','+00:00')).astimezone(ict)
# items by category, track_stock, composite
cc=C.Counter(); 
for i in items:
    if i['deleted_at']: continue
    cc[(cats.get(i['category_id'],'—'), i['track_stock'], i['is_composite'])]+=1
for k,v in sorted(cc.items(), key=lambda x:str(x)): print(k,v)
print('composites:', sum(i['is_composite'] for i in items), 'use_production', sum(i['use_production'] for i in items), 'with supplier', sum(bool(i['primary_supplier_id']) for i in items), 'deleted', sum(bool(i['deleted_at']) for i in items))
# receipt types
print(C.Counter(r['receipt_type'] for r in R), 'cancelled', sum(bool(r['cancelled_at']) for r in R))
print(C.Counter(r['source'] for r in R)); print(C.Counter(r['dining_option'] for r in R))
print('note non-null', sum(bool(r['note']) for r in R), [r['note'] for r in R if r['note']][:15])
print('order non-null', sum(bool(r['order']) for r in R), [r['order'] for r in R if r['order']][:10])
