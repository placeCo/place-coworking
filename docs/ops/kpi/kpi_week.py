#!/usr/bin/env python3
"""Weekly KPI from Loyverse (read-only GET, token handled by loyverse_month.session, never printed).
Usage: kpi_week.py YYYY-MM-DD(monday of week)  -> compares that week with previous one."""
import sys, json, datetime as dt, collections as C
sys.path.insert(0, '/workspace/accounting')
import loyverse_month as L

mon = dt.datetime.fromisoformat(sys.argv[1]).replace(tzinfo=L.ICT)
p0 = mon - dt.timedelta(days=7); end = mon + dt.timedelta(days=7)
s = L.session()
rec = L.get_all(s, '/receipts', 'receipts', {'store_id': L.STORE_ID,
      'created_at_min': L.iso(p0 - dt.timedelta(days=1)), 'created_at_max': L.iso(min(end + dt.timedelta(days=1), dt.datetime.now(L.ICT)))})
cats = L.get_all(s, '/categories', 'categories'); items = L.get_all(s, '/items', 'items')
json.dump({'receipts': rec, 'categories': cats, 'items': items}, open(f'/workspace/reports/kpi/raw_{p0:%Y%m%d}_{end:%Y%m%d}.json', 'w'), ensure_ascii=False)
cat_name = {c['id']: c['name'] for c in cats}
grp_of_cat = {c: g for g, cs in L.GROUPS.items() for c in cs}
item_cat = {i['id']: cat_name.get(i['category_id'], '') for i in items}
def group(li):
    if any(w in (li['item_name'] or '').lower() for w in L.DEPOSIT_WORDS): return 'deposits'
    return grp_of_cat.get(item_cat.get(li['item_id'], ''), 'other')
refunded = {r['refund_for'] for r in rec if r['receipt_type'] == 'REFUND' and r.get('refund_for')}

def week(a, b):
    R = [r for r in rec if r['store_id'] == L.STORE_ID and a <= L.ict(r['receipt_date']) < b]
    t = C.Counter(); items_q = C.Counter(); items_m = C.Counter(); daily = C.Counter(); zero_pass = C.Counter()
    cust = set()
    for r in R:
        if r['cancelled_at'] or r['receipt_type'] == 'REFUND' or r['receipt_number'] in refunded:
            t['voided'] += 1; continue
        d = L.ict(r['receipt_date']).strftime('%Y-%m-%d')
        if r['total_money'] == 0:
            t['zero'] += 1
            t['points'] += sum(x['money_amount'] for x in r['total_discounts'] if x['type'] == 'DISCOUNT_BY_POINTS')
            for l in r['line_items']:
                if group(l) == 'passes': zero_pass[l['item_name']] += l['quantity']
            continue
        t['receipts'] += 1; t['net'] += r['total_money']; t['gross'] += sum(l['gross_total_money'] for l in r['line_items'])
        t['discount'] += r['total_discount']; daily[d] += r['total_money']
        t['points'] += sum(x['money_amount'] for x in r['total_discounts'] if x['type'] == 'DISCOUNT_BY_POINTS')
        for p in r['payments']: t['pay_' + p['name']] += p['money_amount']
        for l in r['line_items']:
            g = group(l); t[g] += l['total_money']
            if g in ('passes', 'rentals', 'deposits', 'other'):
                items_q[(g, l['item_name'])] += l['quantity']; items_m[(g, l['item_name'])] += l['total_money']
        if r.get('customer_id'): cust.add(r['customer_id'])
    t['customers'] = len(cust)
    return t, items_q, items_m, daily, zero_pass

out = {}
for name, a, b in [('prev', p0, mon), ('cur', mon, end)]:
    t, q, m, daily, zp = week(a, b)
    out[name] = {'range': f'{a:%d.%m}–{(b - dt.timedelta(days=1)):%d.%m}', 'tot': dict(t),
                 'items': sorted([[g, n, q[(g, n)], m[(g, n)]] for (g, n) in q], key=lambda x: (x[0], -x[3])),
                 'daily': dict(sorted(daily.items())), 'zero_pass': dict(zp)}
json.dump(out, open(f'/workspace/reports/kpi/kpi_{mon:%Y%m%d}.json', 'w'), ensure_ascii=False, indent=1)
print(json.dumps(out, ensure_ascii=False, indent=1))
