#!/usr/bin/env python3
"""Document numbering for Place Co., Ltd. — single source of truth.

Pat (accountant), LINE 10.10.2026:
  17:28  invoices / receipts: YYYY + MM + running no. (example <TG_USER_ID>)
  19:30  abbreviated tax invoices need a series SEPARATE from full tax invoices, told apart by a letter,
         example T202610001 / B202610001 (letter + YYYYMM + 3-digit running no.)

Series (monthly reset, one counter per series):
  tax_invoice  ใบเสร็จรับเงิน/ใบกำกับภาษี (เต็มรูป)  -> PREFIX['tax_invoice'] + YYYYMM + NNN  e.g. T202610001
  abbreviated  ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ (daily) -> PREFIX['abbreviated'] + YYYYMM + NNN e.g. B202610001
  invoice      ใบแจ้งหนี้ (no tax invoice)                -> YYYYMM + NN                      e.g. <TG_USER_ID>
  receipt      ใบเสร็จรับเงิน (non-VAT receipt)            -> YYYYMM + NN
Deposits (มัดจำ) get a FULL tax invoice (Pat 19:33) -> tax_invoice series.

PREFIX letters: which letter is which is PENDING Pat's confirmation (her example only). Change here only.
The daily abbreviated builder (pat/2026-10-TH/daily-tax-invoices/build_daily_ti.py) numbers its days itself
with fmt('abbreviated', ...) — it does not reserve numbers in counters.json.

Usage:
  python3 numbering.py show
  python3 numbering.py next tax_invoice 2026-10-06
  python3 numbering.py take tax_invoice 2026-10-06 "note"
"""
from __future__ import annotations
import json, sys, datetime as dt
from pathlib import Path

PREFIX = {'tax_invoice': 'T', 'abbreviated': 'B'}          # PENDING Pat: confirm letters (19:30 example)
SEQ_WIDTH = {'tax_invoice': 3, 'abbreviated': 3, 'invoice': 2, 'receipt': 2}
SERIES = {
    'tax_invoice': 'ใบเสร็จรับเงิน/ใบกำกับภาษี (เต็มรูป) — incl. deposits',
    'abbreviated': 'ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ (daily)',
    'invoice':     'ใบแจ้งหนี้',
    'receipt':     'ใบเสร็จรับเงิน (ไม่ใช่ใบกำกับภาษี)',
}
STATE = Path(__file__).resolve().parent / 'counters.json'


def fmt(series: str, year: int, month: int, seq: int) -> str:
    w = max(SEQ_WIDTH[series], len(str(seq)))
    return f"{PREFIX.get(series, '')}{year:04d}{month:02d}{seq:0{w}d}"


def _load() -> dict:
    return json.loads(STATE.read_text()) if STATE.exists() else {}


def next_no(series: str, date) -> str:
    assert series in SERIES, series
    d = dt.date.fromisoformat(str(date))
    last = _load().get(series, {}).get(f'{d.year:04d}-{d.month:02d}', 0)
    return fmt(series, d.year, d.month, last + 1)


def take(series: str, date, note: str = '') -> str:
    assert series in SERIES and series != 'abbreviated', series
    d = dt.date.fromisoformat(str(date)); key = f'{d.year:04d}-{d.month:02d}'
    st = _load(); s = st.setdefault(series, {}); s[key] = s.get(key, 0) + 1
    no = fmt(series, d.year, d.month, s[key])
    st.setdefault('_log', []).append({'series': series, 'no': no, 'date': str(d), 'note': note,
                                      'at': dt.datetime.now().isoformat(timespec='seconds')})
    STATE.write_text(json.dumps(st, ensure_ascii=False, indent=1))
    return no


if __name__ == '__main__':
    a = sys.argv[1:]
    if not a or a[0] == 'show':
        st = _load(); print(json.dumps({k: v for k, v in st.items() if k != '_log'}, ensure_ascii=False, indent=1))
    elif a[0] == 'next': print(next_no(a[1], a[2]))
    elif a[0] == 'take': print(take(a[1], a[2], a[3] if len(a) > 3 else ''))
    else: print(__doc__)
