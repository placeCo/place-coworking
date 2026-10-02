#!/usr/bin/env python3
"""Unpaid café/service orders from the PLACE Team Telegram group (read-only).

Source: the Apps Script bridge (/home/box/.secrets/Code.gs) copies every PLACE Team
message to info@placecoworking.com as an email:
    Subject: "TG | <First Last> | PLACE Team"
    Body:    "Время (ICT): YYYY-MM-DD HH:MM\\nЧат: PLACE Team (-1003641241156)\\nОт: <name> [@user]
              [\\n(отредактировано)]\\n\\n<text>"
The bridge does NOT include the Telegram message_id (the t.me link is only added
for public chats, PLACE Team has none). But for an edit it re-sends the message with
`(отредактировано)` and the ORIGINAL post time (Telegram keeps m.date on edits).
So an edit is matched to its original by: same chat + same sender + same posted
minute, and (if several candidates) the most similar text with status markers removed.
The latest email version (by Gmail internalDate) wins.

There is no Gmail API token on this box, only the Gmail MCP connector, so this script
reads JSON dumps saved from MCP calls (see README.md next to this file):
    unpaid_orders.py --dump FILE [--dump FILE ...] [--days N | --date YYYY-MM-DD]
                     [--unmarked] [--loyverse] [--json]
FILE may be raw user-Gmail search_threads output ({"threads":[...]}), get_thread output,
or a plain list of messages with id / internalDate / subject / snippet or plaintextBody.
--days N : from 00:00 ICT N-1 days ago up to now (default 1 = today). Times are Asia/Bangkok.
"""
import argparse, datetime as dt, difflib, json, re, sys, urllib.request
from zoneinfo import ZoneInfo

ICT = ZoneInfo('Asia/Bangkok')
CHAT_ID = '-1003641241156'
STORE = 'e4054a32-6c9e-4853-8daf-f358623642ac'
SNIPPET_LIMIT = 190          # Gmail snippets are cut at ~200 chars

HDR = re.compile(r'Время \(ICT\):\s*(\d{4}-\d\d-\d\d \d\d:\d\d)\s+Чат:\s*(.*?)\s*\((-?\d+)\)\s+От:\s*(.*)', re.S)
UNPAID = re.compile(r'❌|\bnot\s*(yet\s*)?pa(y|id)\b|\bunpaid\b|ยังไม่จ่าย', re.I)
PAID = re.compile(r'✅\s*([A-Za-z]+)?|[/\s](cash|transfer|points?|card|qr)\s*$', re.I)
ORDER = re.compile(r'\border\b|^for me please|^please\b|^for\s+\w+\s+(staff\b|\w)', re.I)
NOT_ORDER = re.compile(r'show\s*case|empty\s+tea|empty\s+teapot|^(new order )?(for \w+ )?\d?\s*\*?\s*hot water( in kettle)?\b[^,]*(floor)?\s*$|สั่งของ|^\[фото\]$', re.I)
FLOOR = re.compile(r'(\d)\s*(?:st|nd|rd|th)?\s*(?:floor|fl\b|fooor)|meeting room|office\s*#?\s*\d+|podcast|terrace', re.I)
STATUS_STRIP = re.compile(r'❌\s*not\s*(yet\s*)?pa(y|id)\s*(yet)?|not\s*paid\s*yet|✅\s*\w*|[/\s](cash|transfer|points?)\s*$', re.I)


def load_messages(paths):
    out = {}
    def walk(o):
        if isinstance(o, dict):
            if 'internalDate' in o and ('snippet' in o or 'plaintextBody' in o):
                out[o['id']] = o
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    for p in paths:
        with open(p, encoding='utf-8') as f:
            walk(json.load(f))
    return list(out.values())


def parse(m, chat_id_want=CHAT_ID):
    body = m.get('plaintextBody') or ''
    full = bool(body)
    raw = (body or m.get('snippet') or '').replace('\ufffd', '')   # bridge/emoji decoding garbage
    h = HDR.search(raw)
    if not h:
        return None
    posted, chat, chat_id, rest = h.groups()
    if chat_id != chat_id_want:
        return None
    subj = m.get('subject') or ''
    sm = re.match(r'TG \| (.*) \| ', subj)
    name = sm.group(1).replace('\ufffd', '').strip() if sm else None
    rest = rest.strip()
    if name and rest.startswith(name):
        rest = rest[len(name):]
    elif not name:                      # no subject: sender = up to @username or first line
        mm = re.match(r'(.*?@\w+)\s+(.*)', rest, re.S) if full is False else None
        if full:
            name, _, rest = rest.partition('\n')
        elif mm:
            name, rest = mm.group(1), mm.group(2)
        else:
            name = '?'
    rest = rest.strip()
    user = ''
    um = re.match(r'@(\w+)\s*(.*)', rest, re.S)
    if um:
        user, rest = um.group(1), um.group(2)
    edited = False
    if rest.startswith('(отредактировано)'):
        edited, rest = True, rest[len('(отредактировано)'):]
    text = re.sub(r'\s*https://t\.me/\S+\s*$', '', rest).strip()
    text_1l = re.sub(r'\s+', ' ', text)
    return dict(id=m['id'], ts=int(m['internalDate']), posted=posted, sender=name.strip(),
                user=user, edited=edited, text=text_1l,
                truncated=(not full and len(raw) >= SNIPPET_LIMIT))


def norm(t):
    t = STATUS_STRIP.sub(' ', t.lower())
    return re.sub(r'[^\w]+', ' ', t).strip()


def status(t):
    if UNPAID.search(t):
        return 'UNPAID', ''
    p = PAID.search(t)
    if p:
        return 'PAID', (p.group(1) or p.group(2) or '').lower()
    return 'NONE', ''


def group_versions(msgs):
    """Return orders: list of lists of versions (chronological)."""
    orders = []
    for v in sorted(msgs, key=lambda x: x['ts']):
        cands = [o for o in orders if o[0]['sender'] == v['sender'] and o[0]['posted'] == v['posted']]
        best, score = None, 0.0
        for o in cands:
            s = difflib.SequenceMatcher(None, norm(o[-1]['text']), norm(v['text'])).ratio()
            if s > score:
                best, score = o, s
        # edits always carry "(отредактировано)"; a non-edited near-identical duplicate is a bridge resend
        if best is not None and (v['edited'] and score >= 0.5 or score >= 0.95):
            best.append(v)
            v['match_score'] = round(score, 2)
        else:
            orders.append([v])
    return orders


def floor_of(t):
    f = FLOOR.search(t)
    if not f:
        return '?'
    return f'{f.group(1)} fl' if f.group(1) else f.group(0)


def _lv_get(q, tok):
    """GET with retries (the API sometimes drops TLS: SSLEOFError)."""
    import time
    for i in range(5):
        try:
            r = urllib.request.Request('https://api.loyverse.com/v1.0/' + q, headers={'Authorization': 'Bearer ' + tok})
            return json.load(urllib.request.urlopen(r, timeout=30))
        except Exception as e:                       # noqa: BLE001
            if i == 4:
                raise
            time.sleep(2 * (i + 1))


def loyverse(start, end):
    tok = open('/home/box/.secrets/loyverse_token').read().strip()
    fmt = lambda d: d.astimezone(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
    recs, cur = [], None
    while True:
        q = (f'receipts?store_id={STORE}&created_at_min={fmt(start)}&created_at_max={fmt(end)}&limit=250'
             + (f'&cursor={cur}' if cur else ''))
        d = _lv_get(q, tok)
        recs += d['receipts']; cur = d.get('cursor')
        if not cur:
            break
    return [r for r in recs if not r.get('cancelled_at') and r['receipt_type'] == 'SALE']


ALIASES = {'crepes': 'crepe', 'pasta salmon': 'salmon pasta', 'green tea (teapot)': 'green teapot',
           'black tea (teapot)': 'black teapot', 'meeting room (1h)': 'meeting room'}


def receipt_candidates(order, recs):
    """Receipts 0..4h after the order whose items all appear in the order text. Heuristic, printed as 'candidate'."""
    t0 = dt.datetime.strptime(order['posted'], '%Y-%m-%d %H:%M').replace(tzinfo=ICT)
    txt = order['text'].lower()
    out = []
    for r in recs:
        t = dt.datetime.fromisoformat(r['created_at'].replace('Z', '+00:00')).astimezone(ICT)
        if not (t0 - dt.timedelta(minutes=5) <= t <= t0 + dt.timedelta(hours=4)) or r['total_money'] <= 0:
            continue
        items = [l['item_name'].lower() for l in r['line_items']]
        hit = []
        for it in items:
            base = ALIASES.get(it, it).replace('russian ', '')
            words = [w for w in re.findall(r'[a-z]+', base) if len(w) > 2]
            if words and all(w.rstrip('s') in txt for w in words):
                hit.append(it)
        if hit:
            out.append((t, r, hit, len(hit) == len(items)))
    return out


def collect_orders(msgs):
    """Group versions and keep real orders. A post with a payment mark is always an order
    (e.g. 'Black tea pot 2*empty tea cups ✅transfer'), otherwise NOT_ORDER filters free/stock posts."""
    orders = []
    for vs in group_versions(msgs):
        last = vs[-1]
        st, how = status(last['text'])
        if st != 'PAID' and NOT_ORDER.search(last['text']):
            continue
        if not (ORDER.search(last['text']) or UNPAID.search(last['text']) or '✅' in last['text']):
            continue
        orders.append(dict(posted=last['posted'], sender=last['sender'], text=last['text'],
                           floor=floor_of(last['text']), status=st, method=how, versions=len(vs),
                           ever_unpaid=any(UNPAID.search(v['text']) for v in vs),
                           truncated=last['truncated'], staff=bool(re.search(r'\bstaff\b', last['text'], re.I)),
                           email_ids=[v['id'] for v in vs]))
    return orders


# ======================= --reconcile (PLACE Team + Payments Place vs Loyverse) =======================
PAY_CHAT_ID = '-1003702681187'          # Payments Place (bridged to info@ since 30.09 22:03 ICT)
XMARK = re.compile(r'❌')               # Lena: ONLY ❌ counts as unpaid ("Not paid yet" without ❌ = unmarked)
PAID_WORD = re.compile(r'(?<!not )\bpaid\b\s*$', re.I)
# Loyverse item -> extra phrases staff write in PLACE Team (all-words match is tried first)
ITEM_ALIASES = {
    'salmon veggie': ['salmon veg', 'salmon buckwheat', 'salmon vegetable'],
    'black tea (teapot)': ['black tea pot', 'black teapot'],
    'green tea (teapot)': ['green tea pot', 'green teapot'],
    'chicken teriyaki (rice)': ['teriyaki rice'],
    'chicken teriyaki (buckwheat)': ['teriyaki buckwheat'],
    'flat white': ['falt white', 'flat white'],
    'cocoa': ['cocoa'],
    'thai tea': ['thai tea'],
    'water place': ['water'],
}
NON_CAFE = re.compile(r'meeting room|\bpass\b|rental|\bfloor\b|yoga|deposit|\bflex\b|\brent', re.I)
GENERIC_SKIP = {'chicken', 'tea', 'water', 'place', 'pass'}          # never enough alone
NON_CASH = {'Transfer', 'Card', 'PromptPay', 'QR'}
PAY_SKIP = re.compile(r'зарплат|salary|\bз/?п\b|аванс|เงินเดือน|makro|макро|shop+ee|lazada|доставк|delivery|поставщ|supplier|'
                      r'забрал|положить на сч|инкасс|сдач[аи]|ค่าจ้าง', re.I)
PAY_AMOUNT = re.compile(r'(\d[\d,. ]{0,9}\d|\d)\s*(?:baht|бат\w*|thb|฿|บาท)|฿\s*(\d[\d,]*)|total\s*(\d[\d,]*)', re.I)
PAY_METHOD = re.compile(r'prom(?:pt)?pay|kbank|scb|bbl|krungthai|ktb|transfer|перевод|qr|card|карт', re.I)


def _t(s):
    return dt.datetime.fromisoformat(s.replace('Z', '+00:00')).astimezone(ICT)


def rstatus(text):
    if XMARK.search(text):
        return 'X'
    if PAID.search(text) or PAID_WORD.search(text) or '✅' in text:
        p = PAID.search(text)
        return 'OK:' + ((p.group(1) or p.group(2) or '') if p else 'paid').lower()
    return 'NONE'


def item_hits(text, item_name):
    """Does order text mention this Loyverse item? -> True/False"""
    name = item_name.lower()
    if NON_CAFE.search(name):            # 'Cappuccino ... meeting room' is a delivery place, not a room booking
        return False
    txt = ' ' + re.sub(r'[^a-z0-9]+', ' ', text.lower()) + ' '
    for ph in ITEM_ALIASES.get(name, []):
        if ' ' + ph in txt:
            return True
    words = [w for w in re.findall(r'[a-z]+', re.sub(r'\(\d+\)', '', name)) if len(w) > 2]
    if not words or set(words) <= GENERIC_SKIP:
        return False
    return all(re.search(r'\b' + w.rstrip('s') + r'(s|es)?\b', txt) for w in words)


def order_person(o):
    t = o['text']
    if re.search(r'max\s*team', t, re.I):
        return 'maksim'                    # Max team orders go on Maksim Surkov's deposit (0 ฿ receipts)
    if re.match(r'for me\b', t, re.I):
        return re.sub(r'^hey_?', '', o['sender'].lower()).split()[0] if o['sender'] else None
    m = re.search(r'\bfor\s+([A-Za-zА-Яа-я]+)(?:\s+([A-Z])\.?\b)?', t)
    if m and m.group(1).lower() not in ('me', 'show', 'office'):
        return m.group(1).lower()
    return None


NAME_EQ = [{'alena', 'alyona', 'aliona'}, {'alex', 'alexander', 'aleksandr'}, {'tuay', 'touy'}, {'len', 'lena', 'leena'},
           {'den', 'denis'}, {'max', 'maksim', 'maxim'}]


def same_person(p, cust):
    if not p or not cust:
        return None
    c = cust.lower().split()[0]
    if p == c or (len(p) >= 4 and c.startswith(p[:4])):
        return True
    return any(p in g and c in g for g in NAME_EQ)


def method_ok(mark, r):
    m = mark.split(':', 1)[1] if mark.startswith('OK:') else ''
    pays = {x['name'] for x in r['payments']}
    if not m or m == 'paid':
        return 0
    if m.startswith('po') or m.startswith('pi'):               # point / piont -> deposit (0 ฿ or points)
        return 1 if r['total_money'] == 0 or (r.get('points_deducted') or 0) > 0 else -1
    if r['total_money'] == 0:
        return -1
    want = {'cash': 'Cash', 'trans': 'Transfer', 'transfer': 'Transfer', 'card': 'Card', 'qr': 'Transfer'}.get(m)
    return 1 if want in pays else (-1 if want else 0)


def reconcile_orders(orders, recs, customers):
    """Greedy one-to-one-per-line assignment of orders to receipt lines. Mutates orders (adds 'rec')."""
    cap = {r['receipt_number']: collections_counter(r) for r in recs}
    pairs = []
    for i, o in enumerate(orders):
        t0 = dt.datetime.strptime(o['posted'], '%Y-%m-%d %H:%M').replace(tzinfo=ICT)
        person = order_person(o)
        amt = re.search(r'(\d+)\s*(?:฿|baht|thb)', o['text'], re.I)
        for r in recs:
            tr = _t(r['created_at'])
            if tr < t0 - dt.timedelta(minutes=2) or tr.date() != t0.date():
                continue
            hit = [l['item_name'] for l in r['line_items'] if item_hits(o['text'], l['item_name'])]
            if not hit:
                continue
            extra = len(r['line_items']) - len(hit)
            cust = customers.get(r.get('customer_id') or '', {}).get('name')
            sp = same_person(person, cust)
            score = 3 * len(set(hit)) - 0.4 * extra - 0.12 * (tr - t0).total_seconds() / 3600
            for l in r['line_items']:                         # '2*raf' and Raf x2 on the receipt
                q = re.search(r'(\d)\s*[*x×]\s*' + re.escape(l['item_name'].split()[0].lower()), o['text'].lower())
                if l['item_name'] in hit and q and int(q.group(1)) == int(l['quantity']):
                    score += 1
            score += 2.5 if sp else (-1 if sp is False and person else 0)   # cashiers do swap customers
            score += 1.0 * method_ok(o['mark'], r)
            if amt:
                score += 2 if abs(float(amt.group(1)) - r['total_money']) < 1 else -1
            pairs.append((score, i, r['receipt_number'], hit, tr, cust))
    pairs.sort(key=lambda x: -x[0])
    for score, i, rn, hit, tr, cust in pairs:
        o = orders[i]
        if o.get('rec') or score < 1.5:
            continue
        c = cap[rn]
        if not all(c[h] > 0 for h in set(hit)):
            continue
        for h in set(hit):
            c[h] -= 1
        r = next(x for x in recs if x['receipt_number'] == rn)
        o['rec'] = dict(no=rn, time=f'{tr:%H:%M}', total=r['total_money'], pay='/'.join(p['name'] for p in r['payments']),
                        cust=cust, items=hit, score=round(score, 2))
    return orders


def collections_counter(r):
    from collections import Counter
    c = Counter()
    for l in r['line_items']:
        c[l['item_name']] += int(l['quantity'] or 1)
    return c


def parse_payments(msgs):
    """Payments Place text posts -> payment dicts. Photos/no amount/salary/supplier/internal cash are skipped (counted)."""
    pays, skipped = [], {'photo': 0, 'excluded': 0, 'chat': 0}
    for vs in group_versions(msgs):
        v = vs[-1]
        txt = v['text']
        if txt.strip() in ('[фото]', '[photo]') or not txt.strip():
            skipped['photo'] += 1; continue
        if PAY_SKIP.search(txt):
            skipped['excluded'] += 1; continue
        m = PAY_AMOUNT.search(txt)
        if not m:
            skipped['chat'] += 1; continue
        amount = float(re.sub(r'[^\d.]', '', next(g for g in m.groups() if g)).rstrip('.'))
        meth = PAY_METHOD.search(txt)
        meth = re.sub(r'(?i)^prom(?:pt)?pay$', 'PromptPay', meth.group(0)) if meth else None
        name = re.sub(r'(?i)prom(?:pt)?pay|kbank|total|baht|thb|บาท|฿|[\d,.]+', ' ', txt)
        pays.append(dict(posted=v['posted'], sender=v['sender'], amount=amount, text=txt,
                         method=(meth or '?'), payer=re.sub(r'\s+', ' ', name).strip(),
                         acct=(re.search(r'\b0\d{9}\b|\b\d{10}\b', txt) or [None])[0]))
    # the same transfer is often posted twice (Thai + Latin name): same amount + same account within 15 min
    out = []
    for p in sorted(pays, key=lambda x: x['posted']):
        dup = next((q for q in out if q['amount'] == p['amount'] and (q['acct'] == p['acct'] or not p['acct'])
                    and abs((dt.datetime.fromisoformat(p['posted']) - dt.datetime.fromisoformat(q['posted'])).total_seconds()) <= 900), None)
        if dup:
            if re.search(r'[A-Za-z]{3}', p['payer']) and len(p['payer']) >= len(dup['payer']):
                dup.update(payer=p['payer'], method=p['method'] if p['method'] != '?' else dup['method'], posted2=p['posted'])
            continue
        out.append(p)
    return out, skipped


def match_payments(pays, recs):
    used = set()
    for p in pays:
        t0 = dt.datetime.strptime(p['posted'], '%Y-%m-%d %H:%M').replace(tzinfo=ICT)
        best = None
        for r in recs:
            amt = sum(x['money_amount'] for x in r['payments'] if x['name'] in NON_CASH)
            if not amt or abs(amt - p['amount']) >= 1 or r['receipt_number'] in used:
                continue
            d = abs((_t(r['created_at']) - t0).total_seconds())
            if d <= 6 * 3600 and (best is None or d < best[0]):
                best = (d, r)
        if best:
            used.add(best[1]['receipt_number'])
            p['rec'] = dict(no=best[1]['receipt_number'], time=f"{_t(best[1]['created_at']):%H:%M}")
    return pays


def customers_for(recs, tok, cache_path='/home/box/place-reports/cache/customers.json'):
    import os
    try:
        cache = json.load(open(cache_path))
    except Exception:                                   # noqa: BLE001
        cache = {}
    for cid in {r.get('customer_id') for r in recs if r.get('customer_id')} - set(cache):
        c = _lv_get('customers/' + cid, tok)
        cache[cid] = dict(name=c.get('name'))
    os.makedirs(os.path.dirname(cache_path), exist_ok=True)
    json.dump(cache, open(cache_path, 'w'), ensure_ascii=False)
    return cache


def who(o):
    m = re.search(r'(?i)\bfor\s+((?!me\b)[A-Za-z]+(?:\s*\([^)]*\))?(?:\s+[A-Z]\b\.?)?)', o['text'])
    return m.group(1) if m else f"({o['floor']})" if o['floor'] != '?' else o['sender'].split()[0]


def short_items(o):
    t = re.sub(r'(?i)^(new order|for me please)\s*', '', o['text'])
    m = re.search(r'(?i)\bfor\s+((?!me\b)[A-Za-z]+(?:\s*\([^)]*\))?(?:\s+[A-Z]\b\.?)?)', t)
    if m and m.start() < 3:
        t = t[m.end():]
    t = re.sub(r'(?i)\s*(❌.*|✅.*|/\w+\s*$|\b\d(st|nd|rd|th)\s*floor.*|not paid yet.*|paid\s*$)', '', t)
    return t.strip()[:45]


def run_reconcile(day, dumps, as_json=False, verbose=False):
    start = dt.datetime(day.year, day.month, day.day, tzinfo=ICT)
    end = start + dt.timedelta(days=1)
    in_day = lambda m: start <= dt.datetime.strptime(m['posted'], '%Y-%m-%d %H:%M').replace(tzinfo=ICT) < end
    raw = load_messages(dumps)
    team = [p for p in (parse(m) for m in raw) if p and in_day(p)]
    paym = [p for p in (parse(m, PAY_CHAT_ID) for m in raw) if p and in_day(p)]
    orders = collect_orders(team)
    for o in orders:
        o['mark'] = rstatus(o['text'])
    tok = open('/home/box/.secrets/loyverse_token').read().strip()
    recs = [r for r in loyverse(start, end)]                    # SALE, cancelled/voided excluded
    customers = customers_for(recs, tok)
    reconcile_orders(orders, recs, customers)
    pays, pskip = parse_payments(paym)
    match_payments(pays, recs)

    x_open = [o for o in orders if o['mark'] == 'X' and not o.get('rec')]
    x_paid = [o for o in orders if o['mark'] == 'X' and o.get('rec')]
    norec = [o for o in orders if o['mark'] != 'X' and not o.get('rec')]
    pay_norec = [p for p in pays if not p.get('rec')]
    matched = sum(1 for o in orders if o.get('rec'))
    if as_json:
        print(json.dumps(dict(day=str(day), orders=orders, payments=pays, payments_skipped=pskip,
                              payments_bridged=bool(paym)), ensure_ascii=False, indent=1, default=str))
        return
    fmt = lambda n: f'{n:,.0f}'.replace(',', ' ')
    L = [f'🧪 ТЕСТ · Сверка {day:%d.%m.%Y}', f'Заказов {len(orders)}, сошлось с Loyverse {matched}']
    for o in x_open:
        L.append(f"❌ не оплачен: {o['posted'][11:]} {who(o)} — {short_items(o)}")
    for o in x_paid:
        r = o['rec']
        L.append(f"❌→оплачен? {o['posted'][11:]} {who(o)} — {short_items(o)}: чек {r['no']} {r['time']} {fmt(r['total'])} ฿ {r['pay']}"
                 + (f" ({' '.join(r['cust'].split('(')[0].split()[:2])})" if r['cust'] else '') + ' — обновить отметку')
    for o in norec:
        tag = '✅' if o['mark'].startswith('OK') else 'без отметки'
        L.append(f"⚠️ нет чека ({tag}): {o['posted'][11:]} {who(o)} — {short_items(o)}"
                 + (' (staff)' if o['staff'] else ''))
    for p in pay_norec:
        L.append(f"💳 оплата без чека: {p['posted'][11:]} {fmt(p['amount'])} ฿ {p['method']} {p['payer'][:30]}".rstrip())
    if not paym:
        L.append('Payments Place: за день писем моста нет, оплаты не сверены')
    elif pskip['photo']:
        L.append(f"Payments Place: {pskip['photo']} фото без текста не сверены")
    if not (x_open or x_paid or norec or pay_norec):
        L.insert(2, 'Расхождений нет')
    if x_open:
        L += ['', 'Черновик напоминания в PLACE Team (не отправлено):', 'Unpaid ❌ still open:']
        for o in x_open:
            fl = re.search(r'\b(\d(?:st|nd|rd|th)\s*floor)', o['text'], re.I)
            L.append(f"• {o['posted'][11:]} {who(o)} — {short_items(o)}" + (f" — {fl.group(1)}" if fl else '')
                     + f" ({o['sender'].split()[0]})")
        L.append('Please collect payment or update the mark. Thanks!')
    print('\n'.join(L))
    if verbose:
        print('\n--- debug: orders ---')
        for o in orders:
            r = o.get('rec')
            print(f"{o['posted'][11:]} {o['mark']:<12} {o['text'][:70]:<70} -> "
                  + (f"{r['no']} {r['time']} {r['total']:g} {r['pay']} {r['cust']} {r['items']} s={r['score']}" if r else '—'))
        print('--- debug: payments ---', pskip)
        for p in pays:
            print(p['posted'][11:], p['amount'], p['method'], p['payer'], '->', p.get('rec'))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dump', action='extend', nargs='+', required=True, help='JSON dump(s) from Gmail MCP (several allowed)')
    ap.add_argument('--days', type=int, default=1)
    ap.add_argument('--date', help='single ICT date YYYY-MM-DD (overrides --days)')
    ap.add_argument('--unmarked', action='store_true', help='also list orders with no ✅/❌ mark')
    ap.add_argument('--loyverse', action='store_true', help='show Loyverse receipt candidates (read-only GET)')
    ap.add_argument('--json', action='store_true')
    ap.add_argument('--reconcile', action='store_true',
                    help='full reconciliation PLACE Team (+ Payments Place) vs Loyverse for --date (default today); prints the short RU digest')
    ap.add_argument('--verbose', action='store_true', help='with --reconcile: also print every order/payment match (debug)')
    a = ap.parse_args()

    now = dt.datetime.now(ICT)
    if a.date:
        start = dt.datetime.fromisoformat(a.date).replace(tzinfo=ICT); end = start + dt.timedelta(days=1)
    else:
        start = now.replace(hour=0, minute=0, second=0, microsecond=0) - dt.timedelta(days=a.days - 1); end = now

    if a.reconcile:
        day = dt.date.fromisoformat(a.date) if a.date else now.date()
        run_reconcile(day, a.dump, as_json=a.json, verbose=a.verbose)
        return
    msgs = [p for p in (parse(m) for m in load_messages(a.dump)) if p]
    msgs = [m for m in msgs if start <= dt.datetime.strptime(m['posted'], '%Y-%m-%d %H:%M').replace(tzinfo=ICT) < end]
    orders = collect_orders(msgs)
    unpaid = [o for o in orders if o['status'] == 'UNPAID']
    unknown = [o for o in orders if o['status'] == 'NONE' and o['truncated']]
    unmarked = [o for o in orders if o['status'] == 'NONE' and not o['truncated']]

    recs = loyverse(start, end + dt.timedelta(hours=4)) if a.loyverse else []
    if a.json:
        print(json.dumps(dict(window=[start.isoformat(), end.isoformat()], unpaid=unpaid, unknown=unknown,
                              unmarked=unmarked if a.unmarked else len(unmarked)), ensure_ascii=False, indent=1))
        return
    print(f'Unpaid orders (latest version ❌ / not paid), {start:%d.%m %H:%M}–{end:%d.%m %H:%M} ICT: {len(unpaid)}')
    for o in unpaid:
        print(f"  {o['posted']}  {o['sender']:<22} {o['floor']:<14} {o['text']}"
              + (f"  [{o['versions']} versions]" if o['versions'] > 1 else ''))
        if a.loyverse:
            for t, r, hit, allin in receipt_candidates(o, recs):
                pay = '/'.join(p['name'] for p in r.get('payments', []))
                print(f"      Loyverse candidate {r['receipt_number']} {t:%H:%M} {pay} ฿{r['total_money']:g}: "
                      + ', '.join(l['item_name'] for l in r['line_items']) + ('' if allin else ' (partly other items)'))
    if unknown:
        print(f'\nStatus not visible (email text cut off at ~200 chars, check in Telegram): {len(unknown)}')
        for o in unknown:
            print(f"  {o['posted']}  {o['sender']:<22} {o['text'][:90]}…")
    if a.unmarked:
        print(f'\nOrders with no ✅/❌ mark: {len(unmarked)}')
        for o in unmarked:
            print(f"  {o['posted']}  {o['sender']:<22} {o['floor']:<14} {o['text']}" + ('  (staff)' if o['staff'] else ''))
    else:
        print(f'\n(+{len(unmarked)} orders without any ✅/❌ mark; use --unmarked to list)')


if __name__ == '__main__':
    main()
