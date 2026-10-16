import urllib.request, urllib.parse, json, time, sys, os, datetime
tok=open('/home/box/.secrets/place_lead_bot_token').read().strip()
api=f'https://api.telegram.org/bot{tok}/'
OUT='/workspace/accounting/payments-place/2026-10'
G=<TG_USER_ID>; SRC=<TG_CHAT_ID>
ICT=datetime.timezone(datetime.timedelta(hours=7))
START=datetime.datetime(2026,10,1,tzinfo=ICT)
def call(m,**p):
    for _ in range(5):
        try: r=json.load(urllib.request.urlopen(api+m,urllib.parse.urlencode(p).encode(),timeout=60))
        except urllib.error.HTTPError as e: r=json.load(e)
        except (urllib.error.URLError, OSError) as e:
            print('NETERR',m,p.get('message_id'),e,flush=True); time.sleep(3); continue
        if r.get('error_code')==429:
            time.sleep(r.get('parameters',{}).get('retry_after',5)+1); continue
        return r
    return r
log=open(OUT+'/../scan_log.jsonl','a')
def fetch(mid):
    r=call('forwardMessage',chat_id=G,from_chat_id=SRC,message_id=mid,disable_notification='true')
    if not r.get('ok'): return None,r.get('description')
    m=r['result']
    d=call('deleteMessage',chat_id=G,message_id=m['message_id'])
    if not d.get('ok'):
        time.sleep(1); d=call('deleteMessage',chat_id=G,message_id=m['message_id'])
        if not d.get('ok'): print('DELETE FAILED',mid,m['message_id'],d,flush=True); sys.exit(2)
    return m,None
def info(mid,m):
    fo=m.get('forward_origin',{})
    ts=fo.get('date',m.get('forward_date',m['date']))
    dt=datetime.datetime.fromtimestamp(ts,ICT)
    if fo.get('type')=='user':
        u=fo['sender_user']; snd=(u.get('first_name','')+' '+u.get('last_name','')).strip()+(' @'+u['username'] if u.get('username') else '')
    else: snd=fo.get('sender_user_name') or fo.get('author_signature') or (fo.get('sender_chat') or fo.get('chat') or {}).get('title','') or fo.get('type','')
    rec={'msg_id':mid,'dt':dt.strftime('%Y-%m-%d %H:%M'),'sender':snd,'text':m.get('caption') or m.get('text') or '','file':''}
    fid=None; ext='jpg'; kind=None
    if m.get('photo'): fid=m['photo'][-1]['file_id']; kind='photo'
    elif m.get('document'):
        doc=m['document']; fid=doc['file_id']; n=doc.get('file_name','') ; ext=(n.rsplit('.',1)[-1].lower() if '.' in n else 'bin'); kind='doc'
    elif m.get('video') or m.get('sticker') or m.get('voice') or m.get('video_note') or m.get('animation'): kind=[k for k in ('video','sticker','voice','video_note','animation') if m.get(k)][0]
    rec['kind']=kind or 'text'
    if fid and kind in('photo','doc'):
        f=call('getFile',file_id=fid)
        if f.get('ok'):
            p=f'{OUT}/{mid}_{dt:%Y-%m-%d}_{kind}.{ext}'
            urllib.request.urlretrieve(f'https://api.telegram.org/file/bot{tok}/{f["result"]["file_path"]}',p); rec['file']=p
        else: rec['file']='GETFILE_ERR:'+f.get('description','')
    return rec,dt
mode=sys.argv[1]; a=int(sys.argv[2]); b=int(sys.argv[3]) if len(sys.argv)>3 else None
mid=a; miss=0; old=0
while True:
    m,err=fetch(mid)
    if m is None:
        print(mid,'ERR',err,flush=True); miss+=1
        if mode=='fwd' and miss>=40: break
    else:
        miss=0; rec,dt=info(mid,m); log.write(json.dumps(rec,ensure_ascii=False)+'\n'); log.flush()
        print(mid,rec['dt'],rec['kind'],rec['sender'][:20],rec['text'][:60].replace('\n',' '),flush=True)
        if mode=='back':
            if dt<START: old+=1
            else: old=0
            if old>=5: break
    mid = mid-1 if mode=='back' else mid+1
    if b is not None and mid==b: break
    time.sleep(0.4)
