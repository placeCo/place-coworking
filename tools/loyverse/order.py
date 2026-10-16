import json, csv, math
rows=json.load(open('variants_summary.json'))
WED='2'  # weekday key for 2026-09-30 (json keys are str)
P={'kitchen':(1,0.3,'cook (prep)'),'snacks_resale':(3,2,'TBD: bar/manager (resale)'),'drinks_packaged':(3,2,'TBD: bar/manager (resale)')}
out=[]
for x in rows:
    if x['grp'] not in P or not x['track']: continue
    if x['sold30']+x['today']==0: continue
    cover,safety,buyer=P[x['grp']]
    f=0.5*x['avg7']+0.5*x['wd_avg'][WED]
    placeholder = x['grp']=='kitchen' and x['stock']>60
    target=f*(cover+safety)
    if placeholder:
        order=''; note='stock looks like placeholder (made to order) - prep by forecast only'
    elif f<0.15:
        order=0 if x['stock']>0 else 1; note='slow mover - order on demand' 
    else:
        order=max(0, math.ceil(target - x['stock'])); note=''
    if x['stock']==0 and not placeholder: note=(note+'; ' if note else '')+'OUT OF STOCK now (demand may be understated)'
    out.append([x['grp'],buyer,x['name'],x['sku'],x['stock'],round(x['avg30'],2),round(x['avg7'],2),round(x['wd_avg'][WED],2),round(f,2),cover,safety,round(target,1),order,'unknown','unknown','unknown',note])
order_key={'kitchen':0,'snacks_resale':1,'drinks_packaged':2}
out.sort(key=lambda r:(order_key[r[0]], -(r[12] if isinstance(r[12],int) else 0), -r[8]))
with open('chef_order_sample.csv','w',newline='') as fh:
    w=csv.writer(fh)
    w.writerow(['# DRAFT / ЧЕРНОВИК - sample order for 2026-09-30 (Wed), NOT for real purchasing. Stock as of 2026-09-29 ~19:18 ICT. Assumptions: kitchen = daily prep (cover 1 day + safety 0.3); resale = purchase every 3 days + 2 days safety. forecast = 0.5*avg_7d + 0.5*avg_Wed(30d).'])
    w.writerow(['group','buyer_guess','item','sku','stock_now','avg_day_30d','avg_day_7d','avg_wed_30d','forecast_tomorrow','cover_days','safety_days','target_stock','suggested_qty_units','supplier','lead_time','pack_size','note'])
    w.writerows(out)
# full summary
with open('stock_summary.csv','w',newline='') as fh:
    w=csv.writer(fh); wd=['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    w.writerow(['group','category','item','sku','track_stock','stock_now','sold_30d','avg_30d','avg_7d','sold_today_29Sep']+['avg_'+d for d in wd]+['days_of_cover'])
    for x in sorted(rows,key=lambda x:(x['grp'],-x['sold30'])):
        if x['sold30']+x['today']==0 and not x['track']: continue
        if x['sold30']+x['today']==0: continue
        w.writerow([x['grp'],x['cat'],x['name'],x['sku'],x['track'],x['stock'],x['sold30'],round(x['avg30'],2),round(x['avg7'],2),x['today']]+[round(x['wd_avg'][str(i)],2) for i in range(7)]+[None if x['cover'] is None else round(x['cover'],1)])
for r in out: print(r[0][:7],r[2][:30],'st',r[4],'f',r[8],'tgt',r[11],'ORDER',r[12],r[16][:40])
