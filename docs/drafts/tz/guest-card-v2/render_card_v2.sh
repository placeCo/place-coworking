#!/bin/bash
set -e; cd "$(dirname "$0")"
python3 build_card_v2.py
d=/tmp/chr-card2
for n in card_v2_A6 card_v2_A4_4up; do rm -rf $d
  google-chrome --headless=new --disable-gpu --no-sandbox --user-data-dir=$d --virtual-time-budget=6000 --no-pdf-header-footer --print-to-pdf=/tmp/$n.raw.pdf file://$PWD/$n.html >/dev/null 2>&1
  echo "$n $(google-chrome --headless=new --disable-gpu --no-sandbox --user-data-dir=$d --virtual-time-budget=6000 --dump-dom file://$PWD/$n.html 2>/dev/null | grep -o '<title>[^<]*</title>')"
done; rm -rf $d
python3 fix_boxes.py /tmp/card_v2_A6.raw.pdf guest_card_v2_A6.pdf 105 148 'PLACE — New guest card v2 (A6, front+back)'
python3 fix_boxes.py /tmp/card_v2_A4_4up.raw.pdf guest_card_v2_A4_4up.pdf 210 297 'PLACE — New guest card v2, 4-up A4 (fronts, backs)'
pdftoppm -png -r 200 guest_card_v2_A6.pdf guest_card_v2_A6
pdftoppm -png -r 80 guest_card_v2_A4_4up.pdf guest_card_v2_A4_4up
