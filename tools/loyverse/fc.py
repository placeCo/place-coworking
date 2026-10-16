import json,requests,datetime as dt
TOK=open('/home/box/secrets/loyverse_token').read().strip()
S=requests.Session(); S.headers['Authorization']='Bearer '+TOK
R=json.load(open('raw/receipts.json'))
ids={r['customer_id'] for r in R if r['customer_id'] and r['receipt_date']>='2026-09-29T00:00'}
out={}
for i in ids:
    r=S.get('https://api.loyverse.com/v1.0/customers/'+i,timeout=30)
    if r.status_code==200: out[i]=r.json()
    else: print(i,r.status_code)
json.dump(out,open('raw/customers_today.json','w'),ensure_ascii=False,indent=1)
for i,c in out.items(): print(i[:8], c.get('name'), c.get('created_at'), 'visits',c.get('total_visits'),'spent',c.get('total_spent'),'pts',c.get('total_points'),'note',c.get('note'))
