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
now=dt.datetime.now(dt.timezone.utc)
rec=get_all('/receipts','receipts',{'store_id':'e4054a32-6c9e-4853-8daf-f358623642ac','created_at_min':'2026-09-25T17:00:00.000Z','created_at_max':now.strftime('%Y-%m-%dT%H:%M:%S.000Z')})
json.dump(rec,open('raw/receipts_26-29sep_refresh.json','w'),ensure_ascii=False,indent=1)
cu=get_all('/customers','customers',{})
json.dump(cu,open('raw/customers_all.json','w'),ensure_ascii=False,indent=1)
print(len(rec),len(cu),max(r['receipt_date'] for r in rec))
