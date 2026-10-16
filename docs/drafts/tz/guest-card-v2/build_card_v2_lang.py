#!/usr/bin/env python3
"""PLACE guest card v2, single-language print variants (TH for staff, RU sample). Usage: build_card_v2_lang.py TH|RU"""
import os, sys, html as H
OUT = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(OUT,'build_card_v2.py')).read()
exec(src[:src.index('e = lambda')])  # reuse G, BEIGE, WHITE, CSS
L = sys.argv[1]
CSS += "@font-face{font-family:'TH';src:url('NotoSansThai-Medium.ttf');font-weight:500}@font-face{font-family:'TH';src:url('NotoSansThai-SemiBold.ttf');font-weight:600}@font-face{font-family:'TH';src:url('NotoSansThai-Bold.ttf');font-weight:700}"
CSS += f"""body,.big{{font-family:'T','TH',sans-serif}} .card{{gap:2.6mm;padding-top:5mm}}
.who{{background:{G};color:{WHITE};font-weight:700;font-size:4.6mm;text-align:center;border-radius:1.2mm;padding:1.3mm 0;line-height:1.3}}
.h{{line-height:1.35;white-space:normal;margin-bottom:.6mm}} .lb{{line-height:1.3}} .f{{height:8.5mm}}"""
T = {
'TH': dict(who='ผู้ดูแลเป็นผู้กรอก', title='· ลูกค้าใหม่', q1='ขอทราบชื่อหน่อยได้ไหม?', q2='รู้จักเราจากที่ไหน?', q2n='เลือกข้อเดียว',
  q3='ขอ WhatsApp / Telegram ไว้ส่งข่าวสารได้ไหม?', q3n='ไม่บังคับ',
  src=['Google Maps','Instagram','Telegram','เพื่อนแนะนำ','เดินผ่าน','ใบปลิว','เว็บไซต์','อื่นๆ'],
  adm='สำหรับผู้ดูแล', date='วันที่', time='เวลา', bought='ซื้ออะไร', office='สนใจออฟฟิศ', yes='ใช่', no='ไม่ใช่', admin='ชื่อผู้ดูแล',
  back='· สำหรับผู้ดูแล', big='คุณเป็นผู้กรอก ไม่ใช่ลูกค้า',
  ins=['ถามลูกค้า 3 ข้อ: ชื่อ, รู้จักเราจากที่ไหน, WhatsApp/TG (ถ้าลูกค้ายินดี)','ทำเครื่องหมายในช่อง «รู้จักเราจากที่ไหน» เพียงช่องเดียว',
       'เขียนวันที่ เวลา และสิ่งที่ลูกค้าซื้อ','ทำเครื่องหมายว่าสนใจออฟฟิศหรือไม่: ใช่ / ไม่ใช่','เมื่อจบกะ ให้กรอกข้อมูลจากบัตรลงในตาราง'],
  note='ใช้เวลาแค่ 10 วินาที ไม่กดดันลูกค้า ไม่ต้องถามอีเมล หนังสือเดินทาง หรือที่อยู่ ขอเบอร์โทรเฉพาะเมื่อลูกค้ายินดีเท่านั้น'),
'RU': dict(who='Заполняет администратор', title='· Новый гость', q1='Как вас зовут?', q2='Как вы о нас узнали?', q2n='одно',
  q3='Можно WhatsApp / Telegram для новостей?', q3n='по желанию',
  src=['Google Maps','Instagram','Telegram','Друг','Проходил мимо','Листовка','Сайт','Другое'],
  adm='Для админа', date='Дата', time='Время', bought='Что купил', office='Интерес к офису', yes='Да', no='Нет', admin='Админ',
  back='· Админу', big='Заполняете вы, не гость',
  ins=["Спросите гостя 3 вопроса: имя, откуда узнал, WhatsApp/TG (по желанию).","Отметьте одну галочку в «Откуда узнали».",
       "Внизу запишите дату, время и что купил.","Отметьте интерес к офису: да / нет.","В конце смены внесите карточки в таблицу."],
  note='10 секунд, без давления. Не спрашивать email, паспорт, адрес. Номер — только если гость сам согласен.')}[L]
e = lambda t: H.escape(t, quote=False)
lab = lambda t: f'<span class="lb">{e(t)}</span>'
ck = lambda t: f'<div class="ck"><span class="box"></span><span class="one">{e(t)}</span></div>'
sec = lambda n, inner: f'<div class="sec"><div class="num">{n}</div><div class="body">{inner}</div></div>'
exec(''.join(l for l in src.splitlines(True)[68:76] if not l.startswith('open(')))
def front(bg):
    s=[f'<div class="who">{e(T["who"])}</div>', f'<div class="hdr"><span class="wm">PLACE</span><span class="tt">{e(T["title"])}</span></div>']
    s.append(sec(1, f'<div class="h">{e(T["q1"])}</div><div class="f" style="height:6mm"><span class="ln"></span></div>'))
    S=T['src']; rows=''.join(f'<div class="row c2">{ck(S[i])}{ck(S[i+1])}</div>' for i in range(0,8,2))
    s.append(sec(2, f'<div class="h">{e(T["q2"])} <i>· {e(T["q2n"])}</i></div>'+rows))
    s.append(sec(3, f'<div class="h">{e(T["q3"])} <i style="white-space:nowrap;display:inline-block">({e(T["q3n"])})</i></div><div class="f" style="height:6mm"><span class="ln"></span></div>'))
    s.append(f'<div class="adm"><div class="t">{e(T["adm"])}</div>'
      f'<div class="f">{lab(T["date"])}<span class="ln" style="flex:1.3"></span>{lab(T["time"])}<span class="ln"></span></div>'
      f'<div class="f">{lab(T["bought"])}<span class="ln"></span></div>'
      f'<div class="row" style="gap:3mm"><span class="one" style="margin-right:auto;font-weight:700">{e(T["office"])}</span>{ck(T["yes"])}{ck(T["no"])}</div>'
      f'<div class="f" style="height:7mm">{lab(T["admin"])}<span class="ln"></span></div></div>')
    return f'<div class="card" style="background:{bg}">'+''.join(s)+'</div>'
def back(bg):
    li=''.join(f'<li>{e(t)}</li>' for t in T['ins'])
    return (f'<div class="card" style="background:{bg}"><div class="hdr"><span class="wm">PLACE</span><span class="tt">{e(T["back"])}</span></div>'
            f'<div class="big">{e(T["big"])}</div><div class="ins"><ol>{li}</ol></div><div class="note">{e(T["note"])}</div></div>')
open(os.path.join(OUT,f'card_v2_{L}_A6.html'),'w').write(doc("@page{size:105mm 148.3mm;margin:0}", f'<div class="pg">{front(BEIGE)}</div><div>{back(BEIGE)}</div>'))
open(os.path.join(OUT,f'card_v2_{L}_A4_4up.html'),'w').write(doc("@page{size:210.3mm 297.3mm;margin:0}", sheet(front)+sheet(back)))
