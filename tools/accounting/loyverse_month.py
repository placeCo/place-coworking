#!/usr/bin/env python3
"""DRAFT. Monthly Loyverse sales export for the accountant (PLACE COWORKING store only).
Usage: python3 loyverse_month.py YYYY-MM [--out PATH] [--cache DIR] [--from-cache] [--aiz-dir DIR] [--no-aiz]
Outputs:
  1) Aiz format (what the accountant got until 09.2026): raw Loyverse «Receipts» export, one file per day
     '<Month> YY/receipts-YYYY-MM-DD.xlsx' (sheet 'receipts-YYYY-MM-DD-YYYY-MM-DD') + month file
     '<Month> YY/<Month> YY sales report.xlsx' (sheet 'receipts-YYYY-MM-01-YYYY-MM-<last>'); 19 columns, ALL receipts
     (Closed, 0 THB, Cancelled), no totals. Default folder: /workspace/accounting/out/<Month> YY/
  2) our Summary workbook (extra): loyverse-sales-YYYY-MM.xlsx (rules below)
Read-only: GET requests only. Token from /home/box/secrets/loyverse_token (never printed).
Rules (same as corrected 29.09 report):
  * day = Asia/Bangkok (UTC+7) calendar day of receipt_date
  * only store PLACE COWORKING
  * voided (cancelled_at set), refunds (receipt_type REFUND) and refunded originals -> excluded, listed on 'Voided & refunds'
  * receipts with total 0 THB (free drinks / paid by deposit points / welcome pass) -> excluded, listed on 'Zero THB'
  * 'Paid from deposit (points)' is shown separately (it is a discount in Loyverse, money came in earlier)
Edit COLUMNS / GROUPS below to match the accountant's template.
"""
import sys, os, json, time, argparse, datetime as dt, collections as C
import requests
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

API = 'https://api.loyverse.com/v1.0'
STORE_ID = 'e4054a32-6c9e-4853-8daf-f358623642ac'   # PLACE COWORKING
TOKEN_FILE = '/home/box/secrets/loyverse_token'
ICT = dt.timezone(dt.timedelta(hours=7))

# category name -> report group
GROUPS = {
    'passes': ['1 day pass', '1 week, 10 days pass', '1 month, 3 months pass, 1 year'],
    'food': ['soup', 'Breakfast', 'lunch', 'Dessert'],
    'drinks': ['Coffee & tea', 'Smoothie & lemonade', 'BAR', 'Metal can drinks', 'Glass & plastic drinks', 'Beer'],
    'snacks': ['Meat snacks', 'Bars', 'Ice cream', 'Choco paste'],
    'rentals': ['Rent', 'Rent 1st floor', 'Rent 4th floor', 'Rent 6 floor', 'Rent art room', 'Rent meeting rooms',
                'Rent podcast', 'Rent equipment', 'Office rentals'],
    'print': ['Print/scan'],
    'deposits': ['Deposit for smth'],
}
GROUP_ORDER = ['passes', 'food', 'drinks', 'snacks', 'rentals', 'print', 'deposits', 'other']
DEPOSIT_WORDS = ('deposit', 'advance money')          # item names that are deposits even in other categories
MAIN_PAYMENTS = ['Cash', 'Card', 'Transfer']

def session():
    s = requests.Session()
    s.headers['Authorization'] = 'Bearer ' + open(TOKEN_FILE).read().strip()
    return s

def get_all(s, path, key, params=None):
    params = dict(params or {}, limit=250); out = []
    while True:
        for attempt in range(6):
            r = s.get(API + path, params=params, timeout=60)
            if r.status_code == 429 or r.status_code >= 500:
                time.sleep(2 ** attempt); continue
            break
        r.raise_for_status()
        d = r.json(); out += d.get(key, [])
        if not d.get('cursor'): return out
        params['cursor'] = d['cursor']; time.sleep(0.3)

def iso(d): return d.astimezone(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
def ict(s): return dt.datetime.fromisoformat(s.replace('Z', '+00:00')).astimezone(ICT)

def fetch(month, cache, from_cache=False):
    y, m = map(int, month.split('-'))
    start = dt.datetime(y, m, 1, tzinfo=ICT)
    end = dt.datetime(y + (m == 12), m % 12 + 1, 1, tzinfo=ICT)
    now = dt.datetime.now(ICT)
    cf = os.path.join(cache or '', f'loyverse_{month}.json')
    if from_cache and os.path.exists(cf):
        data = json.load(open(cf))
        if 'pos_devices' not in data or 'stores' not in data:      # older cache: fetch the two small lists (GET only)
            s = session(); data['pos_devices'] = get_all(s, '/pos_devices', 'pos_devices'); data['stores'] = get_all(s, '/stores', 'stores')
            json.dump(data, open(cf, 'w'), ensure_ascii=False)
        return data, start, end, dt.datetime.fromisoformat(data['fetched_at'])
    s = session()
    # created_at window with margin: receipts can be synced later than receipt_date
    rec = get_all(s, '/receipts', 'receipts', {'store_id': STORE_ID, 'created_at_min': iso(start - dt.timedelta(days=1)),
                                               'created_at_max': iso(min(end + dt.timedelta(days=3), now))})
    data = {'receipts': rec,
            'categories': get_all(s, '/categories', 'categories'),
            'items': get_all(s, '/items', 'items'),
            'customers': get_all(s, '/customers', 'customers'),
            'employees': get_all(s, '/employees', 'employees'),
            'pos_devices': get_all(s, '/pos_devices', 'pos_devices'),
            'stores': get_all(s, '/stores', 'stores'),
            'fetched_at': now.isoformat()}
    if cache:
        os.makedirs(cache, exist_ok=True)
        json.dump(data, open(os.path.join(cache, f'loyverse_{month}.json'), 'w'), ensure_ascii=False)
    return data, start, end, now

def build(month, out, cache, data=None):
    data, start, end, now = data or fetch(month, cache)
    cat_name = {c['id']: c['name'] for c in data['categories']}
    grp_of_cat = {c: g for g, cs in GROUPS.items() for c in cs}
    item_cat = {i['id']: cat_name.get(i['category_id'], '') for i in data['items']}
    cust = {c['id']: c.get('name') or '' for c in data['customers']}
    emp = {e['id']: e.get('name') or '' for e in data['employees']}

    def group(li):
        if any(w in (li['item_name'] or '').lower() for w in DEPOSIT_WORDS): return 'deposits'
        return grp_of_cat.get(item_cat.get(li['item_id'], ''), 'other')

    R = [r for r in data['receipts'] if r['store_id'] == STORE_ID and start <= ict(r['receipt_date']) < end]
    R.sort(key=lambda r: r['receipt_date'])
    refunded = {r['refund_for'] for r in data['receipts'] if r['receipt_type'] == 'REFUND' and r.get('refund_for')}

    rows, excluded, zero = [], [], []
    for r in R:
        gross = sum(l['gross_total_money'] for l in r['line_items'])
        points = sum(d['money_amount'] for d in r['total_discounts'] if d['type'] == 'DISCOUNT_BY_POINTS')
        pays = C.Counter()
        for p in r['payments']: pays[p['name']] += p['money_amount']
        g = C.Counter()
        for l in r['line_items']: g[group(l)] += l['total_money']
        if r['cancelled_at']: status = 'VOIDED ' + ict(r['cancelled_at']).strftime('%Y-%m-%d %H:%M')
        elif r['receipt_type'] == 'REFUND': status = 'REFUND of ' + (r.get('refund_for') or '?')
        elif r['receipt_number'] in refunded: status = 'REFUNDED'
        elif r['total_money'] == 0: status = 'ZERO'
        else: status = 'OK'
        disc_names = sorted({d['name'] + (f" {d['percentage']:g}%" if d.get('percentage') else '') for d in r['total_discounts']})
        row = dict(date=ict(r['receipt_date']).strftime('%Y-%m-%d'), time=ict(r['receipt_date']).strftime('%H:%M'),
                   receipt=r['receipt_number'],
                   items='; '.join(f"{l['quantity']:g}x {l['item_name']}" + (f" ({l['variant_name']})" if l.get('variant_name') else '') for l in r['line_items']),
                   gross=gross, discount=r['total_discount'], points=points, net=r['total_money'],
                   payment=' + '.join(f"{k} {v:g}" if len(pays) > 1 else k for k, v in pays.items()),
                   pays=pays, groups=g, discount_names=', '.join(disc_names),
                   customer=cust.get(r['customer_id'], ''), employee=emp.get(r['employee_id'], ''), status=status)
        (rows if status == 'OK' else zero if status == 'ZERO' else excluded).append(row)

    wb = Workbook(); bold = Font(bold=True); head_fill = PatternFill('solid', fgColor='DDEBF7')
    def sheet(ws, header, data_rows, widths=None):
        ws.append(header)
        for c in ws[1]: c.font = bold; c.fill = head_fill
        for dr in data_rows: ws.append(dr)
        ws.freeze_panes = 'A2'
        for i, h in enumerate(header, 1):
            ws.column_dimensions[get_column_letter(i)].width = (widths or {}).get(h, max(10, min(40, len(h) + 2)))
    num = lambda x: round(x, 2)

    # Summary
    pay_types = MAIN_PAYMENTS + sorted({k for r in rows for k in r['pays']} - set(MAIN_PAYMENTS))
    days = [(start + dt.timedelta(d)).strftime('%Y-%m-%d') for d in range((end - start).days) if start + dt.timedelta(d) <= now]
    hdr = (['Date', 'Receipts', 'Gross', 'Discount', 'Net'] + pay_types + [g.capitalize() for g in GROUP_ORDER]
           + ['Paid from deposit (points, excluded)', 'Zero THB receipts (excl.)', 'Voided/refund receipts (excl.)', 'Check pay=net'])
    ws = wb.active; ws.title = 'Summary'
    srows = []; tot = C.Counter()
    for d in days:
        dr = [r for r in rows if r['date'] == d]
        pz = sum(r['points'] for r in rows + zero if r['date'] == d)
        vals = [len(dr), sum(r['gross'] for r in dr), sum(r['discount'] for r in dr), sum(r['net'] for r in dr)]
        vals += [sum(r['pays'].get(p, 0) for r in dr) for p in pay_types]
        vals += [sum(r['groups'].get(g, 0) for r in dr) for g in GROUP_ORDER]
        vals += [pz, sum(1 for r in zero if r['date'] == d), sum(1 for r in excluded if r['date'] == d)]
        paysum = sum(vals[4:4 + len(pay_types)])
        srows.append([d] + [num(v) for v in vals] + ['OK' if abs(paysum - vals[3]) < 0.01 else f'DIFF {paysum - vals[3]:.2f}'])
        for i, v in enumerate(vals): tot[i] += v
    srows.append(['TOTAL'] + [num(tot[i]) for i in range(len(hdr) - 2)] + [''])
    sheet(ws, hdr, srows, {'Date': 12, 'Paid from deposit (points, excluded)': 18, 'Zero THB receipts (excl.)': 14, 'Voided/refund receipts (excl.)': 14})
    for c in ws[ws.max_row]: c.font = bold
    for col in range(2, len(hdr)):
        for cell in ws.iter_cols(min_col=col, max_col=col, min_row=2):
            for x in cell: x.number_format = '#,##0.00' if col > 2 else '0'
    for c in ws[1]: c.alignment = Alignment(wrap_text=True, vertical='top')

    cols = ['Date', 'Time', 'Receipt no', 'Items', 'Gross', 'Discount', 'Net', 'Payment type', 'Status',
            'Discount type', 'Customer', 'Employee'] + [g.capitalize() for g in GROUP_ORDER]
    W = {'Items': 50, 'Customer': 28, 'Discount type': 22, 'Status': 22}
    line = lambda r: ([r['date'], r['time'], r['receipt'], r['items'], num(r['gross']), num(r['discount']), num(r['net']),
                       r['payment'], r['status'], r['discount_names'], r['customer'], r['employee']]
                      + [num(r['groups'].get(g, 0)) for g in GROUP_ORDER])
    sheet(wb.create_sheet('Daily'), cols, [line(r) for r in rows], W)
    sheet(wb.create_sheet('Zero THB'), cols[:12] + ['Paid from deposit (points)'], [line(r)[:12] + [num(r['points'])] for r in zero], W)
    sheet(wb.create_sheet('Voided & refunds'), cols[:12], [line(r)[:12] for r in excluded], W)
    notes = wb.create_sheet('Notes')
    for t in [f'DRAFT - generated {now:%Y-%m-%d %H:%M} ICT from Loyverse API (read-only), store PLACE COWORKING only.',
              f'Period: {month} by receipt date in Asia/Bangkok (UTC+7). Partial month if generated before month end.',
              'Totals (Summary, Daily) include only valid paid receipts (status OK).',
              'Excluded and listed separately: voided receipts, refunds and refunded originals ("Voided & refunds"); receipts with total 0 THB ("Zero THB": free drinks, paid by deposit points, welcome pass).',
              'Gross = price x qty before discounts; Discount = all discounts; Net = amount paid.',
              '"Paid from deposit (points)" = goods paid with prepaid deposit (Loyverse points); not new money that day, shown for info.',
              'Groups: ' + '; '.join(f"{g}: {', '.join(c)}" for g, c in GROUPS.items()) + '; deposits also = items named Deposit/Advance money; other = everything else.']:
        notes.append([t])
    notes.column_dimensions['A'].width = 140
    os.makedirs(os.path.dirname(out), exist_ok=True)
    wb.save(out)
    return rows, zero, excluded, srows, hdr

# ---------------- Aiz format (raw Loyverse «Receipts» export) ----------------
AIZ_COLS = ['Date', 'Receipt number', 'Receipt type', 'Gross sales', 'Discounts', 'Net sales', 'Taxes', 'Total collected',
            'Cost of goods', 'Gross profit', 'Payment type', 'Description', 'Dining option', 'POS', 'Store', 'Cashier name',
            'Customer name', 'Customer contacts', 'Status']

def _n(x):
    x = round(float(x or 0), 2)
    return int(x) if x == int(x) else x

def aiz_rows(data, start, end):
    """One row per receipt of the store in [start, end), ICT receipt date, ALL receipts (incl. 0 THB, cancelled, refunds)."""
    cust = {c['id']: c for c in data['customers']}
    emp = {e['id']: e.get('name') or '' for e in data['employees']}
    pos = {p['id']: p.get('name') or '' for p in data.get('pos_devices', [])}
    store = {x['id']: x.get('name') or '' for x in data.get('stores', [])}
    R = [r for r in data['receipts'] if r['store_id'] == STORE_ID and start <= ict(r['receipt_date']) < end]
    R.sort(key=lambda r: (r['receipt_date'], r['receipt_number']))
    out = []
    for r in R:
        sign = -1 if r['receipt_type'] == 'REFUND' else 1
        gross = sum(l['gross_total_money'] for l in r['line_items'])
        disc = r['total_discount']
        net = gross - disc
        cost = sum(l.get('cost_total') or 0 for l in r['line_items'])
        tip, sur = r.get('tip') or 0, r.get('surcharge') or 0
        c = cust.get(r.get('customer_id')) or {}
        contacts = ', '.join(x for x in [c.get('email'), c.get('phone_number')] if x)
        pays = []
        for p in r['payments']:
            if p['name'] not in pays: pays.append(p['name'])
        desc = ', '.join(f"{l['quantity']:g} x {l['item_name']}" + (f" ({l['variant_name']})" if l.get('variant_name') else '') for l in r['line_items'])
        d = ict(r['receipt_date']).replace(tzinfo=None, second=0, microsecond=0)
        out.append([d, r['receipt_number'], 'Refund' if sign < 0 else 'Sale',
                    _n(sign * gross), _n(sign * disc), _n(sign * net), _n(sign * r['total_tax']), _n(sign * (net + tip + sur)),
                    _n(sign * cost), _n(sign * (net - cost)), ', '.join(pays), desc, r.get('dining_option') or '',
                    pos.get(r.get('pos_device_id'), ''), store.get(r['store_id'], 'PLACE COWORKING'), emp.get(r.get('employee_id'), ''),
                    c.get('name') or '', contacts, 'Cancelled' if r.get('cancelled_at') else 'Closed'])
    return out

def _aiz_book(path, sheet_title, rows):
    wb = Workbook(); ws = wb.active; ws.title = sheet_title[:31]
    ws.append(AIZ_COLS)
    for r in rows: ws.append(r)
    for c in ws['A'][1:]: c.number_format = 'yyyy-mm-dd hh:mm'
    for i, w in enumerate([17, 14, 12, 12, 11, 11, 9, 14, 13, 12, 13, 50, 13, 8, 18, 14, 28, 36, 10], 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    wb.save(path)

def write_aiz(month, data, start, end, now, folder=None):
    """Writes the Aiz-format folder. Days up to today only (partial month allowed). Returns (folder, per-day counts)."""
    label = start.strftime('%B %y')                       # e.g. 'September 26'
    folder = folder or os.path.join('/workspace/accounting/out', label)
    os.makedirs(folder, exist_ok=True)
    rows = aiz_rows(data, start, end)
    counts = C.OrderedDict()
    day = start
    while day < end and day.date() <= now.date():
        dr = [r for r in rows if r[0].date() == day.date()]
        ds = day.strftime('%Y-%m-%d')
        if dr:
            _aiz_book(os.path.join(folder, f'receipts-{ds}.xlsx'), f'receipts-{ds}-{ds}', dr)
        counts[ds] = len(dr)
        day += dt.timedelta(days=1)
    last = (end - dt.timedelta(days=1)).strftime('%Y-%m-%d')
    _aiz_book(os.path.join(folder, f'{label} sales report.xlsx'), f"receipts-{start:%Y-%m-%d}-{last}", rows)
    return folder, counts, rows

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('month'); ap.add_argument('--out'); ap.add_argument('--cache', default='/workspace/accounting/raw')
    ap.add_argument('--from-cache', action='store_true', help='use cached JSON instead of calling the API')
    ap.add_argument('--aiz-dir', help="folder for the Aiz-format files (default /workspace/accounting/out/<Month> YY)")
    ap.add_argument('--no-aiz', action='store_true', help='only our Summary workbook')
    a = ap.parse_args()
    out = a.out or f'/workspace/accounting/loyverse-sales-{a.month}.xlsx'
    fetched = fetch(a.month, a.cache, a.from_cache)
    if not a.no_aiz:
        folder, counts, arows = write_aiz(a.month, *fetched, folder=a.aiz_dir)
        print('Aiz format:', folder, '| receipts', len(arows), '| days with files', sum(1 for v in counts.values() if v))
    rows, zero, excl, srows, hdr = build(a.month, out, a.cache, fetched)
    print('saved', out, '| OK receipts', len(rows), '| zero', len(zero), '| voided/refunds', len(excl))
    print('\t'.join(hdr)); [print('\t'.join(map(str, r))) for r in srows]
