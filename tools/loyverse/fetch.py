import requests, json, time, sys, datetime as dt
TOK=open('/home/box/secrets/loyverse_token').read().strip()
B='https://api.loyverse.com/v1.0'
S=requests.Session(); S.headers['Authorization']='Bearer '+TOK
STORE='e4054a32-6c9e-4853-8daf-f358623642ac'
def get_all(path, key, params=None):
    params=dict(params or {}); params['limit']=250; out=[]
    while True:
        for a in range(6):
            r=S.get(B+path,params=params,timeout=60)
            if r.status_code==429: time.sleep(2**a); continue
            break
        if r.status_code!=200:
            print(path,r.status_code,r.text[:300]); break
        d=r.json(); out+=d.get(key,[])
        c=d.get('cursor')
        if not c: break
        params['cursor']=c; time.sleep(0.3)
    print(path,len(out)); return out
def save(n,o): json.dump(o,open(f'raw/{n}.json','w'),ensure_ascii=False,indent=1)
save('stores',get_all('/stores','stores'))
save('categories',get_all('/categories','categories'))
save('items',get_all('/items','items'))
save('inventory',get_all('/inventory','inventory_levels',{'store_ids':STORE}))
save('suppliers',get_all('/suppliers','suppliers'))
save('payment_types',get_all('/payment_types','payment_types'))
save('employees',get_all('/employees','employees'))
save('discounts',get_all('/discounts','discounts'))
now=dt.datetime.now(dt.timezone.utc)
# 30 full days + today (ICT): start = ICT midnight 30 days ago
ict=dt.timezone(dt.timedelta(hours=7))
start=(now.astimezone(ict).replace(hour=0,minute=0,second=0,microsecond=0)-dt.timedelta(days=30)).astimezone(dt.timezone.utc)
save('receipts',get_all('/receipts','receipts',{'store_id':STORE,'created_at_min':start.strftime('%Y-%m-%dT%H:%M:%S.000Z'),'created_at_max':now.strftime('%Y-%m-%dT%H:%M:%S.000Z')}))
