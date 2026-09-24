# ТЗ для Nano Banana 2 / Grok Image — листовка Place Sports Street

**Задача:** нарисовать **две отдельные картинки** (Side A и Side B) так точно, чтобы потом в Canva / Photoshop / Preview **вставить реальные QR** в готовые белые квадраты.

**Правило:** в промпте **запрещено** просить настоящие сканируемые QR. Только **пустые белые квадраты** с рамкой и подписью.

**Размер генерации:** портрет **3:4** или **A5 ratio** (например 1080×1440 / 1536×2048). Одна сторона = один промпт = один файл.

**Стиль бренда (зафиксировать в каждом промпте):**
- deep forest green background (#163D2F)
- accent muted gold (#DCCB8A) for ONE keyword only
- white bold geometric sans-serif, ALL CAPS
- Place Coworking logo top (wordmark “PLACE” over “COWORKING” + two chevrons)
- clean, premium, minimal, print flyer flat lay (NOT a photo of a flyer on a table — generate the **flat artwork itself**)

---

## Как пользоваться

1. Скопируй блок **PROMPT SIDE A** целиком → Nano Banana 2 или Grok Image.  
2. То же для **PROMPT SIDE B**.  
3. Если модель добавила стол / растение / «mockup» — добавь Negative и перегенерируй.  
4. Открой PNG в редакторе → положи поверх белых квадратов файлы:
   - A: сайт / IG QR (сделай сам из ссылок)
   - B: `qr-garmin-run-event.png` + `qr-strava-event.png`
5. Экспорт в PDF A5 для печати.

---

## NEGATIVE (добавляй к обоим)

```
negative prompt: three free days, 3 free days, FIVE free, Kathu, 5h@150, mockup on wooden table, plant in foreground, bookshelf, photo of flyer, lifestyle scene, fake QR code patterns, tiny unreadable text, 5 QR codes in a row, Komoot, MapMyRun, Ride with GPS, blue UI, neon, busy collage, watermark, low contrast, handwritten font, comic style
```

---

## PROMPT SIDE A — copy-paste (EN)

```
Flat print-ready A5 portrait flyer design, full-bleed artwork, not a photo mockup.

Background: solid deep forest green (#163D2F), subtle fine paper grain, no photo overlay.

Top left: white Place Coworking logo wordmark — “PLACE” above “COWORKING”, small double chevron mark, clean.

Center hierarchy, generous negative space, ALL CAPS bold geometric sans-serif (Montserrat Black style):

Line 1 small white: COWORKING NEXT TO YOU
Line 2 small white: ON SPORTS STREET

Then the hero offer stacked large and centered:
“1” in white
“FREE” in muted gold (#DCCB8A)
“DAY” in white
“COWORKING” in white slightly smaller under DAY

Directly under hero, small white caps: FLOOR 3 ONLY

Lower third, small white centered facts, three lines:
59/2 CHAO FAH TAWAN TOK · CHALONG
08:00–23:00
PLACECOWORKING.COM

Bottom: exactly TWO empty white squares side by side for future QR stickers.
Each square: solid white fill, thin light-gold border, centered faint gray text “QR” inside (placeholder only, not a real QR matrix).
Square size: large, equal, ~18% of flyer width each, gap between them.
Under left square a white pill label with black text: SIGN UP
Under right square a white pill label with black text: INSTAGRAM

No other logos. No map. No people. No wooden table. No third QR. High-end minimal coworking poster.
```

### Короткая RU-версия того же (если модель лучше ест RU)

```
Плоский макет листовки A5 портрет, готовый к печати, НЕ фото на столе.

Фон: сплошной тёмно-зелёный forest green. Лого Place Coworking белым сверху слева.

По центру крупно ALL CAPS:
COWORKING NEXT TO YOU
ON SPORTS STREET

Оффер очень крупно:
1 (белый)
FREE (золотой)
DAY (белый)
COWORKING (белый)
под ним мелко: FLOOR 3 ONLY

Внизу факты мелко белым:
59/2 CHAO FAH TAWAN TOK · CHALONG
08:00–23:00
PLACECOWORKING.COM

В самом низу РОВНО ДВА пустых белых квадрата под будущие QR (внутри серым «QR», без матрицы), подписи: SIGN UP и INSTAGRAM.
Стиль: премиальный минимализм, жирный sans.
```

---

## PROMPT SIDE B — copy-paste (EN)

```
Flat print-ready A5 portrait flyer design, full-bleed artwork, not a photo mockup.

Background: solid deep forest green (#163D2F), subtle paper grain.

Top center small white caps: A SPORTS EVENT BY
Below it larger bold white: PLACE COWORKING

Middle: stylized illustrated folded paper map graphic (3D-ish soft paper folds), warm beige/cream map surface on the green background.
On the map:
- brown winding path labeled SPORTS STREET
- red start flag labeled START / SPORTS STREET
- path length feeling ~1 km
- finish flag FINISH next to a simple building icon labeled PLACE COWORKING
Optional tiny 7-Eleven landmark icon near finish, very small, not dominant.

Below the map, one accent line in soft coral/rose or muted gold:
FREE SMOOTHIE AFTER THE 1K FINISH

Then white caps centered:
MON 28 SEP 2026 · 08:00 · ~1 KM
FINISH AT PLACE · CHALONG

Small white rule line:
1 FREE SMOOTHIE / DAY · WALK OR RUN ONLY

Bottom: exactly TWO large empty white QR placeholder squares side by side (white fill, thin border, faint “QR” text inside, NOT a real QR pattern).
Under left: white pill GARMIN
Under right: white pill STRAVA

No Komoot, no MapMyRun, no Ride with GPS, no five QR row.
No people photos. No wooden table mockup. Clean premium sports-event poster matching Place brand green + gold.
```

### Короткая RU-версия Side B

```
Плоский макет A5 портрет, НЕ фото на столе. Фон deep forest green.

Сверху: A SPORTS EVENT BY / PLACE COWORKING.

В центре: стилизованная бумажная карта — путь SPORTS STREET → FINISH у PLACE COWORKING (~1 km).

Под картой золотом/кораллом: FREE SMOOTHIE AFTER THE 1K FINISH

Белым: MON 28 SEP 2026 · 08:00 · ~1 KM · FINISH AT PLACE · CHALONG
Мелко: 1 FREE SMOOTHIE / DAY · WALK OR RUN ONLY

Внизу РОВНО ДВА пустых белых квадрата QR с подписями GARMIN и STRAVA.
Без пяти приложений. Минимализм Place.
```

---

## PROMPT VARIANT — если нужна «одна картинка = оба макета рядом» (для выбора)

Обычно **не используй** — лучше генерировать стороны по отдельности. Если хочешь moodboard:

```
Two flat A5 Place Coworking flyer artworks side by side on transparent/neutral gray, NOT on a wooden table. Left = Side A “1 FREE DAY”. Right = Side B “1K Free Smoothie map”. Same forest green brand. Empty QR placeholders only.
```

---

## Чеклист после генерации (до вставки QR)

- [ ] На Side A написано **1 FREE DAY**, не THREE  
- [ ] Есть **FLOOR 3 ONLY**  
- [ ] Адрес Chalong, часы 08:00–23:00  
- [ ] На Side B есть **28 SEP 2026**, **08:00**, **1K / ~1 KM**  
- [ ] Ровно **2** слота QR на каждой стороне  
- [ ] Квадраты пустые (можно вставить PNG)  
- [ ] Нет Kathu / 5 floors as Pass / multi-day trial  

---

## Куда вставить QR после отрисовки

| Сторона | Слот | Что вставить |
|---|---|---|
| A | SIGN UP | QR → https://placecoworking.com (или signup URL от George) |
| A | INSTAGRAM | QR → https://instagram.com/place_coworking_phuket |
| B | GARMIN | файл `qr-garmin-run-event.png` |
| B | STRAVA | файл `qr-strava-event.png` |

Файлы B: `/home/box/place-coworking/kb/inbox/best-lap-pack-2026-09-24/`

---

## Grok Image — короткая системная приписка (опционально)

Если Grok спрашивает «что нарисовать», вставь перед промптом:

```
You are a print designer. Output one flat flyer artwork only. Follow the locked copy character-for-character. Leave QR areas as blank white squares.
```
