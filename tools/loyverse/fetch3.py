import requests,json,time,datetime as dt
TOK=open('/home/box/secrets/loyverse_token').read().strip()
S=requests.Session(); S.headers['Authorization']='Bearer '+TOK
B='https://api.loyverse.com/v1.0'
def get_all(path,key,params):
    params=dict(params,limit=250); out=[]
    while True:
        r=S.get(B+path,params=params,timeout=60)
        if r.status_code==429: time.sleep(3); continue
        r.raise_for_status(); d=r.json(); out+=d.get(key,[])
        if not d.get('cursor'): break
        params['cursor']=d['cursor']; time.sleep(0.3)
    return out
now=dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
PLACE='e4054a32-6c9e-4853-8daf-f358623642ac'
a=get_all('/receipts','receipts',{'store_id':PLACE,'created_at_min':'2026-09-28T12:00:00.000Z','created_at_max':now})
b=get_all('/receipts','receipts',{'created_at_min':'2026-09-28T12:00:00.000Z','created_at_max':now})  # all stores, to check store filter
json.dump(a,open('raw/receipts_29sep_repull_PLACE.json','w'),ensure_ascii=False,indent=1)
json.dump(b,open('raw/receipts_29sep_repull_ALLSTORES.json','w'),ensure_ascii=False,indent=1)
r=S.get(B+'/receipts/5-34458',timeout=30); print('5-34458 direct:',r.status_code, r.text[:300] if r.status_code!=200 else json.dumps({k:r.json().get(k) for k in ['receipt_type','cancelled_at','total_money','receipt_date','updated_at']}))
print(len(a),len(b),now)
