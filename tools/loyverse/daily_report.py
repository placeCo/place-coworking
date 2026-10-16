#!/usr/bin/env python3
"""Place Coworking daily sales report (Russian plain text) from Loyverse API. Read-only GET.
Usage: python3 daily_report.py [YYYY-MM-DD | DD.MM.YYYY]   (default = yesterday, Asia/Bangkok)
Method (30.09): only valid receipts (no voids, no refunds, no refunded originals); net = gross - discounts.
Payments from deposit (Loyverse DISCOUNT_BY_POINTS) shown separately, NOT in totals/discounts."""
import sys, collections as C, datetime as dt
sys.path.insert(0, '/workspace/accounting')
from loyverse_month import session, get_all, iso, ict, ICT, STORE_ID, GROUPS, DEPOSIT_WORDS
PAY_RU = {'Transfer': 'перевод', 'Cash': 'наличные', 'Card': 'карта', 'Grab': 'Grab'}
MONTHLY_CAT = '1 month, 3 months pass, 1 year'
def n(x): return f"{x:,.0f}".replace(',', ' ')
def parse(a):
    for f in ('%Y-%m-%d', '%d.%m.%Y'):
        try: return dt.datetime.strptime(a, f).date()
        except ValueError: pass
    raise SystemExit('bad date: ' + a)
day = parse(sys.argv[1]) if len(sys.argv) > 1 else dt.datetime.now(ICT).date() - dt.timedelta(days=1)
ds = dt.datetime(day.year, day.month, day.day, tzinfo=ICT); de = ds + dt.timedelta(days=1)
ms = ds.replace(day=1)
s = session()
now = dt.datetime.now(ICT)
rec = get_all(s, '/receipts', 'receipts', {'store_id': STORE_ID, 'created_at_min': iso(ms - dt.timedelta(days=1)),
                                           'created_at_max': iso(min(de + dt.timedelta(days=3), now))})
cats = {c['id']: c['name'] for c in get_all(s, '/categories', 'categories')}
icat = {i['id']: cats.get(i['category_id'], '') for i in get_all(s, '/items', 'items')}
refunded = {r['refund_for'] for r in rec if r['receipt_type'] == 'REFUND' and r.get('refund_for')}
def valid(r): return r['store_id'] == STORE_ID and not r['cancelled_at'] and r['receipt_type'] != 'REFUND' and r['receipt_number'] not in refunded
def inrange(r, a, b): return a <= ict(r['receipt_date']) < b
def pts(r): return sum(d['money_amount'] for d in r['total_discounts'] if d['type'] == 'DISCOUNT_BY_POINTS')
def summ(rs):
    gross = sum(l['gross_total_money'] for r in rs for l in r['line_items'])
    p = sum(pts(r) for r in rs)
    disc = sum(r['total_discount'] for r in rs) - p
    net = sum(r['total_money'] for r in rs)
    return gross - p, disc, net, p
D = [r for r in rec if valid(r) and inrange(r, ds, de)]
M = [r for r in rec if valid(r) and inrange(r, ms, de)]
X = [r for r in rec if r['store_id'] == STORE_ID and inrange(r, ds, de) and not valid(r)]
g, d, net, p = summ(D)
paid = [r for r in D if r['total_money'] > 0]
out = [f"Place Coworking — продажи за {day:%d.%m.%Y}",
       f"Итого {n(net)} ฿ чистыми ({n(g)} − {n(d)} скидки), {len(paid)} чеков" + (f" (+{len(D)-len(paid)} чеков на 0 ฿)" if len(D) > len(paid) else '') + "."]
pay = C.Counter()
for r in D:
    for x in r['payments']: pay[x['name']] += x['money_amount']
out.append("Оплата: " + (', '.join(f"{PAY_RU.get(k, k)} {n(v)}" for k, v in pay.most_common()) or 'нет') + ".")
cat = C.Counter(); monthly = C.Counter(); dep = C.Counter()
for r in D:
    for l in r['line_items']:
        c = icat.get(l['item_id'], '') or (l.get('item_name') and 'без категории') or '?'
        if any(w in (l['item_name'] or '').lower() for w in DEPOSIT_WORDS) or c in GROUPS['deposits']:
            dep['n'] += 1; dep['sum'] += l['total_money']
        elif c == MONTHLY_CAT:
            monthly['n'] += 1; monthly['sum'] += l['total_money']
        else:
            cat[c] += l['total_money']
out.append("Категории: " + (', '.join(f"{k} {n(v)}" for k, v in cat.most_common() if v) or 'нет') + ".")
out.append(f"Месячные абонементы (1 мес/3 мес/год): {n(monthly['sum'])} ฿ ({monthly['n']} поз.)." if monthly['n'] else "Месячные абонементы: нет.")
out.append(f"Депозиты внесены: {n(dep['sum'])} ฿ ({dep['n']} поз.)." if dep['n'] else "Депозиты внесены: нет.")
pr = [r for r in D if pts(r)]
out.append(f"Оплачено с депозита (не в итоге): {n(p)} ฿, {len(pr)} чеков." if p else "Оплат с депозита: нет.")
if X: out.append(f"Исключено (отмены/возвраты): {len(X)} чеков: " + ', '.join(r['receipt_number'] for r in X) + ".")
mg, md, mnet, mp = summ(M)
out.append(f"С начала месяца ({ms:%d.%m}–{day:%d.%m}): {n(mnet)} ฿ чистыми ({n(mg)} − {n(md)} скидки), {len([r for r in M if r['total_money']>0])} чеков"
           + (f"; с депозита {n(mp)} ฿ (не в итоге)" if mp else '') + ".")
print('\n'.join(out))
