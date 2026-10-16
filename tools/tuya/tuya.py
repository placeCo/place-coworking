import hashlib, hmac, json, time, sys, urllib.request, os
env = dict(l.strip().split('=',1) for l in open(os.path.expanduser('~/.config/place/tuya.env')) if '=' in l)
AID, SEC, EP = env['TUYA_ACCESS_ID'], env['TUYA_ACCESS_SECRET'], env['TUYA_ENDPOINT']
def _sign(method, path, body, token=''):
    t = str(int(time.time()*1000))
    sts = '\n'.join([method, hashlib.sha256((body or '').encode()).hexdigest(), '', path])
    s = hmac.new(SEC.encode(), (AID + token + t + sts).encode(), hashlib.sha256).hexdigest().upper()
    return t, s
def req(method, path, body=None, token=''):
    b = json.dumps(body) if body is not None else ''
    t, s = _sign(method, path, b, token)
    h = {'client_id': AID, 'sign': s, 't': t, 'sign_method': 'HMAC-SHA256', 'Content-Type': 'application/json'}
    if token: h['access_token'] = token
    r = urllib.request.Request(EP + path, data=b.encode() if b else None, headers=h, method=method)
    return json.load(urllib.request.urlopen(r, timeout=20))
def token():
    return req('GET', '/v1.0/token?grant_type=1')['result']['access_token']
if __name__ == '__main__':
    tk = req('GET', '/v1.0/token?grant_type=1')
    print('token ok:', tk.get('success'), tk.get('msg'))
    if tk.get('success'):
        r = req('GET', '/v2.0/cloud/thing/device?page_size=20', token=tk['result']['access_token'])
        print('devices call ok:', r.get('success'), r.get('msg'))
        for d in (r.get('result') or []):
            print(d.get('name'), d.get('id'), 'online' if d.get('isOnline') else 'offline')
