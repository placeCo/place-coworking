# unpaid_orders.py — how the routine feeds it (read-only)

No Gmail API token exists on this box (only the `user-Gmail` MCP connector), so the
script reads JSON dumps of MCP results. Nothing is written to Gmail or Telegram.

## 1. Get the dump via MCP (agent routine)
For each ICT window (split the day into 00–12 and 12–24; split further if a call returns 50):

    CallMcpTool server=user-Gmail tool=search_threads
      { "query": "subject:\"PLACE Team\" in:anywhere after:<epoch_start> before:<epoch_end>",
        "pageSize": 50, "includeTrash": true }            # follow nextPageToken if present

* epoch = Unix seconds, e.g. `date -d '2026-09-29 00:00 +0700' +%s` (Gmail's after:YYYY/MM/DD
  is not reliable for ICT, epoch seconds are exact).
* `includeTrash: true` + `in:anywhere` are REQUIRED: bridge emails older than ~1 day end up in
  Trash (something cleans TG mails); without it only today's mails are found.
* Save each raw JSON result as-is to `/home/box/place-reports/dumps/<date>_<part>.json`.
* Snippets (~200 chars) are enough for normal orders. get_thread (full body) works only for
  mails that are NOT in Trash ("caller does not have permission" otherwise); a get_thread JSON
  can be saved into the same folder and is picked up too (plaintextBody wins over snippet).

## 2. Run
    python3 /home/box/place-reports/unpaid_orders.py --dump dumps/2026-09-29_*.json            # today
    python3 /home/box/place-reports/unpaid_orders.py --dump dumps/*.json --days 3 --loyverse   # 3 days + Loyverse candidates
    python3 /home/box/place-reports/unpaid_orders.py --reconcile --date 2026-10-02 --dump dumps/*.json   # 21:00 digest
    options: --date YYYY-MM-DD, --unmarked (list orders with no ✅/❌), --json, --reconcile [--verbose]
    (--dump takes several files since 02.10; before that it needed `--dump F` per file)

## Matching edits
Bridge body has no Telegram message_id. Edited copies carry "(отредактировано)" and the
ORIGINAL post time (Telegram message.date), so versions are grouped by
sender + posted minute (+ best text similarity with status markers removed, ≥0.5).
Latest version by Gmail internalDate = current status.

## Reconciliation (--reconcile), since 02.10.2026
George, 02.10: «Делай сверку и тогда говори про оплаченные и не оплаченные заказы в девять» — кратко.
`--reconcile --date D` reads PLACE Team + Payments Place bridge mails from the dumps and that ICT day's
Loyverse receipts (GET only, cancelled excluded), and prints the short Russian digest with discrepancies only.

Order statuses (Lena's rules: only ❌ = unpaid; no mark can be paid-unmarked, membership/deposit,
or paid in the evening when the client leaves):
* matched — a receipt found (same day, at/after the post −2 min). Score = item names (aliases for staff
  spellings: "Salmon buckwheat"→salmon veggie, "Black tea pot"→Black tea (teapot), "Falt white"…) +
  customer name (Loyverse customer vs "for <Name>", "Max team"→Maksim Surkov deposit, "for me"→sender) +
  mark vs payment type (point→0 ฿/points, cash/transfer/card) + `N*item` = quantity + amount if the post has ฿.
  Each receipt line (×quantity) can be used once; greedy best-score-first. 0 ฿ evening batches
  (deposit/membership drinks rung at ~17:30 / 22:00) are normal matches.
* `❌→оплачен?` — ❌ but a receipt exists → likely paid, mark not updated.
* `❌ не оплачен` — ❌ and no receipt. Only then the draft reminder is added (never sent in TEST).
* `⚠️ нет чека` — ✅ or unmarked and no receipt → membership or missing receipt, check.
Payments Place (TG -1003702681187) IS bridged to info@ the same way (subject `TG | <name> | Payments Place`,
first mail 30.09 22:03). Text posts with an amount (฿/baht/บาท/THB) are matched to a non-cash
(Transfer/Card) receipt with the same amount within ±6 h; salary, supplier (Makro, Shopee, delivery),
cash pick-ups/bank deposits are skipped; Thai+Latin double posts of one transfer are merged.
Photo-only posts can't be read (bridge sends "[фото]") — the digest says how many were not checked.

## Routine 21:00 flow (TEST mode)
Intent: every day at 21:00 ICT reconcile first, then tell George and Lena only what doesn't add up.
1. Fetch dumps for today (ICT) via user-Gmail `search_threads`, `includeTrash: true`, `pageSize: 50`,
   epoch windows 00–12 and 12–24 (split more if a page returns 50 / follow nextPageToken):
   * `subject:"PLACE Team" in:anywhere after:<s> before:<e>` → `dumps/<date>_am.json`, `<date>_pm.json`
   * `subject:"Payments Place" in:anywhere after:<s> before:<e>` → `dumps/<date>_payments.json`
   Save the raw JSON as-is. Re-fetch the pm window at 21:00 even if fetched earlier (edits ✅/❌ arrive late).
2. Run
       cd /home/box/place-reports
       python3 unpaid_orders.py --reconcile --date <YYYY-MM-DD> --dump dumps/*.json > dumps/<date>_digest.txt
   (`--verbose` prints every match for debugging; do not send that part.)
   Sanity check: `Заказов N` > 0 and receipts loaded; if Loyverse fails (TLS drops are retried 5×),
   send nothing and report the error instead of a digest without reconciliation.
3. Deliver the digest text exactly as printed, via @PlaceLeadBot, as a private message to
   George (TG 8503184147) and Lena (TG 626363253). One message each.
   The "Черновик напоминания" block (only present when there are unpaid ❌) is shown to them as a draft;
   it is NOT posted.
4. TEST mode: nothing goes to PLACE Team or Payments Place — no reminder, no reply, no reaction.
   Leaving TEST mode (posting the reminder in PLACE Team) needs George's explicit OK.
5. Digest format (keep it this short):
       🧪 ТЕСТ · Сверка 02.10.2026
       Заказов 34, сошлось с Loyverse 32
       <problem lines only>   or   Расхождений нет

Known limitations: receipts rung after 21:00 are not seen (an evening-paid order shows as "нет чека" /
"❌ не оплачен" until next day's run); snippets are ~200 chars (long orders may lose the mark);
item aliases are hand-made (new menu items may need an alias); Loyverse customer is sometimes
set to the wrong person on 0 ฿ batches (02.10: Youssef/Sergei swapped) — the matcher tolerates it;
Payments Place photos (screenshots) are not read; direction of a PromptPay post (incoming vs paid out)
is not stated in the text.
