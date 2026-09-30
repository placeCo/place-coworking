"""Snapshot of a Google Sheet exported as xlsx -> JSON {tab: {values, display}} for the node harness.
Snapshots contain real data: keep them OUTSIDE the repo (default /workspace/booking/test)."""
import openpyxl, json, sys, datetime
def disp(c):
    v, f = c.value, (c.number_format or 'General')
    if v is None: return ''
    if isinstance(v, datetime.datetime):
        if 'ddd' in f: return v.strftime('%a %d/%m')
        if f.lower().startswith('h') and v.year < 1901: return '%d:%02d' % (v.hour, v.minute)
        return v.strftime('%d.%m.%Y')
    if isinstance(v, datetime.time): return '%d:%02d' % (v.hour, v.minute)
    if isinstance(v, float) and 'h' in f.lower() and v < 2:
        m = round(v * 1440) % 1440; return '%d:%02d' % (m // 60, m % 60)
    if isinstance(v, float) and v.is_integer(): return str(int(v))
    return str(v)
def val(v):
    if isinstance(v, datetime.datetime): return {'__date': v.isoformat()}
    if isinstance(v, datetime.time): return {'__date': datetime.datetime(1899, 12, 30, v.hour, v.minute).isoformat()}
    return '' if v is None else v
out = {}
wb = openpyxl.load_workbook(sys.argv[1])
for ws in wb.worksheets:
    rows = list(ws.iter_rows(min_row=1, max_row=ws.max_row, max_col=ws.max_column))
    out[ws.title] = {'values': [[val(c.value) for c in r] for r in rows], 'display': [[disp(c) for c in r] for r in rows]}
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False)
print(sys.argv[2], {k: (len(v['values']), len(v['values'][0]) if v['values'] else 0) for k, v in out.items()})
