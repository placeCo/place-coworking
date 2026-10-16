#!/usr/bin/env python3
"""PLACE short 'New guest' card v2 — admin fills it while asking the guest 2-3 questions.
A6 front (guest Qs + admin block) + A6 back (admin instruction, RU). Writes card_v2_A6.html + card_v2_A4_4up.html."""
import os, html as H
OUT = os.path.dirname(os.path.abspath(__file__))
G, BEIGE, WHITE = '#0A2208', '#E1DBC0', '#FFFFFF'
FONTS = ''.join(f"@font-face{{font-family:'T';src:url('InterT-{w}.ttf');font-weight:{w}}}" for w in (500,600,700)) + \
        "@font-face{font-family:'I';src:url('InterD-700.ttf');font-weight:700}"
CSS = FONTS + f"""
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
body{{font-family:'T',sans-serif;color:{G};font-weight:500}}
.card{{position:relative;width:105mm;height:148mm;overflow:hidden;padding:6mm 6mm 6mm;display:flex;flex-direction:column;gap:3.2mm}}
.hdr{{display:flex;align-items:baseline;gap:1.6mm;white-space:nowrap;border-bottom:.5mm solid {G};padding-bottom:1.8mm}}
.wm{{font-family:'I';font-weight:700;font-size:6.6mm;letter-spacing:-.03em;line-height:1}}
.tt{{font-weight:700;font-size:5mm}} .te{{font-weight:500;font-size:3.8mm}}
.sec{{display:flex;align-items:flex-start;gap:2mm}}
.num{{flex:none;width:6mm;height:6mm;border-radius:1mm;background:{G};color:{WHITE};font-weight:700;font-size:4mm;line-height:6mm;text-align:center;margin-top:.6mm}}
.body{{flex:1;min-width:0}}
.h{{font-size:3.8mm;font-weight:700;line-height:6mm;white-space:nowrap}} .h i{{font-style:normal;font-weight:500}}
.f{{display:flex;align-items:flex-end;height:8mm;gap:1.6mm}}
.lb{{font-size:3.5mm;font-weight:600;white-space:nowrap;line-height:1.05;padding-bottom:.6mm}} .lb i{{font-style:normal;font-weight:500}}
.ln{{flex:1;min-width:8mm;border-bottom:.35mm solid {G};height:100%}}
.row{{display:flex;align-items:center;min-height:7.4mm}}
.ck{{display:flex;align-items:center;gap:1.8mm;white-space:nowrap}}
.box{{flex:none;width:5.4mm;height:5.4mm;border:.5mm solid {G};border-radius:.3mm;background:{WHITE}}}
.two{{font-size:3.3mm;line-height:1.02;font-weight:600}} .two i{{display:block;font-style:normal;font-weight:500}}
.one{{font-size:3.5mm;font-weight:600}}
.c2>*{{width:50%}}
.adm{{margin-top:auto;border:.45mm solid {G};border-radius:1.4mm;padding:2mm 3mm 2.4mm;background:{WHITE}}}
.adm .t{{font-size:3.3mm;font-weight:700;letter-spacing:.06em;text-transform:uppercase}}
.ins{{font-size:4.1mm;line-height:1.45;font-weight:600}} .ins ol{{padding-left:5.5mm}} .ins li{{margin-bottom:1.6mm}}
.big{{font-family:'I';font-weight:700;font-size:5.6mm;letter-spacing:-.02em}}
.note{{font-size:3.3mm;line-height:1.35;font-weight:500;margin-top:auto;border-top:.35mm solid {G};padding-top:2mm}}
"""
e = lambda t: H.escape(t, quote=False)
lab = lambda ru, en: f'<span class="lb">{e(ru)} <i>/ {e(en)}</i></span>'
def ck(ru, en=None):
    l = f'<span class="two">{e(ru)}<i>{e(en)}</i></span>' if en else f'<span class="one">{e(ru)}</span>'
    return f'<div class="ck"><span class="box"></span>{l}</div>'
sec = lambda n, inner: f'<div class="sec"><div class="num">{n}</div><div class="body">{inner}</div></div>'
SRC = [("Google Maps",None),("Instagram",None),("Telegram",None),("Друг","Friend"),
       ("Проходил мимо","Walked by"),("Листовка","Flyer"),("Сайт","Website"),("Другое","Other")]

def front(bg):
    s = ['<div class="hdr"><span class="wm">PLACE</span><span class="tt">· Новый гость</span><span class="te">/ New guest</span></div>']
    s.append(sec(1, f'<div class="f">{lab("Имя","Name")}<span class="ln"></span></div>'))
    rows = ''.join(f'<div class="row c2">{ck(*SRC[i])}{ck(*SRC[i+1])}</div>' for i in range(0,8,2))
    s.append(sec(2, '<div class="h">Откуда узнали <i>/ How found us · одна / one</i></div>' + rows))
    s.append(sec(3, f'<div class="f"><span class="lb">WhatsApp / Telegram<br><i>для новостей, по желанию / for updates, optional</i></span></div><div class="f" style="height:7mm"><span class="ln"></span></div>'))
    s.append('<div class="adm"><div class="t">Для админа / Admin</div>' +
        f'<div class="f">{lab("Дата","Date")}<span class="ln" style="flex:1.3"></span>{lab("Время","Time")}<span class="ln"></span></div>' +
        f'<div class="f">{lab("Купил","Bought")}<span class="ln"></span></div>' +
        f'<div class="row" style="gap:3mm"><span class="two" style="margin-right:auto;font-weight:700">Интерес к офису<i>Office interest</i></span>{ck("Да","Yes")}{ck("Нет","No")}</div>' +
        f'<div class="f" style="height:6.5mm">{lab("Админ","Admin")}<span class="ln"></span></div></div>')
    return f'<div class="card" style="background:{bg}">' + ''.join(s) + '</div>'

INSTR = ["Спросите гостя 3 вопроса: имя, откуда узнал, WhatsApp/TG (по желанию).",
         "Отметьте одну галочку в «Откуда узнали».",
         "Внизу запишите дату, время и что купил.",
         "Отметьте интерес к офису: да / нет.",
         "В конце смены внесите карточки в таблицу."]
def back(bg):
    li = ''.join(f'<li>{e(t)}</li>' for t in INSTR)
    return (f'<div class="card" style="background:{bg}"><div class="hdr"><span class="wm">PLACE</span><span class="tt">· Админу</span></div>'
            f'<div class="big">Заполняете вы, не гость</div><div class="ins"><ol>{li}</ol></div>'
            '<div class="note">10 секунд, без давления. Не спрашивать email, паспорт, адрес. Номер — только если гость сам согласен.</div></div>')

CHECK = """<script>document.fonts.ready.then(()=>{let bad=[];document.querySelectorAll('.card').forEach(c=>{if(c.scrollHeight>c.clientHeight+1)bad.push('card-h');
c.querySelectorAll('.row,.f,.h,.hdr').forEach(r=>{if(r.scrollWidth>r.clientWidth+1)bad.push('w:'+r.className)})});document.title=bad.length?'OVER '+[...new Set(bad)]:'ok';});</script>"""
doc = lambda pc, body: f'<!doctype html><html><head><meta charset="utf-8"><title>…</title><style>{pc}{CSS}.pg{{page-break-after:always}}</style></head><body>{body}{CHECK}</body></html>'
open(os.path.join(OUT,'card_v2_A6.html'),'w').write(doc("@page{size:105mm 148.3mm;margin:0}", f'<div class="pg">{front(BEIGE)}</div><div>{back(BEIGE)}</div>'))
MARK='position:absolute;background:#000'
marks=''.join(f'<div style="{MARK};left:{x}mm;top:{y}mm;width:{w}mm;height:{h}mm"></div>' for x,y,w,h in
  [(104.9,0.5,.2,10),(104.9,286.5,.2,10),(0,148.4,10,.2),(200,148.4,10,.2),(101,148.4,8,.2),(104.9,144.5,.2,8)])
def sheet(f): return f'<div class="pg" style="position:relative;width:210mm;height:297mm"><div style="position:absolute;left:0;top:.5mm;display:grid;grid-template-columns:105mm 105mm">{f(WHITE)*4}</div>{marks}</div>'
open(os.path.join(OUT,'card_v2_A4_4up.html'),'w').write(doc("@page{size:210.3mm 297.3mm;margin:0}", sheet(front)+sheet(back)))
print('ok')
