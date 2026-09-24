# ТЗ Teamly — листовка Sports Street (двусторонняя)

**Кому:** Coordinator → Rhea / Pia / Sage / Aria (дизайн + финальный макет)  
**От:** Grok Bot / George (Place Coworking)  
**Дата:** 24 Sep 2026  
**Статус:** черновик ТЗ. **Не публиковать, не печатать, не постить** без явного OK George.

---

## 1. Цель

Разнести на **Sports Street (Chalong)** двустороннюю листовку:

| Сторона | Задача |
|---|---|
| **A (лицо)** | «Coworking рядом с вами» + оффер **1 FREE DAY** (только floor 3) |
| **B (оборот)** | Событие **Place 1K Free Smoothie** + 2 QR (Garmin + Strava) |

После печати человек сканирует QR → событие / сайт / IG. George сам вставит готовые QR из пачки `best-lap-pack-2026-09-24/`.

---

## 2. Формат

- **A5 портрет** (148 × 210 mm), двусторонняя печать.
- Bleed 3 mm, safe margin ≥ 8 mm от края.
- Цветовой профиль печати: CMYK; для экранных превью — RGB.
- Язык макета: **EN основной**; короткий RU-подзаголовок — если не ломает композицию.

---

## 3. Визуальный язык (ориентир — черновики John Johnson)

Сохранить стиль текущих черновиков John:

- Фон: **deep forest green** (#0F3D2E–#1A4D3A).
- Акцент: **muted gold / straw** (#D4C48A–#E8D9A0) — только на ключевом слове оффера.
- Текст/лого: **белый**.
- Шрифт: жирный геометрический sans (Montserrat Bold / Helvetica Neue Bold / аналог).
- Всё важное — **ALL CAPS**.
- Минимум декора; воздух; QR внизу ровной сеткой.
- Логотип Place Coworking (белый) — верх, как в черновиках John.

**Не копировать** ошибочный текст John («THREE FREE DAYS», 5 мелких QR Komoot/MapMyRun/Ride with GPS).

---

## 4. SIDE A — текст (LOCKED)

### Иерархия

1. Лого Place Coworking (верх).
2. Заголовок (крупно, по центру / верхней трети):

```
COWORKING
NEXT TO YOU
```

золотом или белым вторую строку по вкусу дизайна; допустим вариант в одну колонку:

```
COWORKING NEXT TO YOU
ON SPORTS STREET
```

3. Оффер (самое крупное, 3 строки):

```
1 FREE
DAY
COWORKING
```

- `1` и `DAY` / `COWORKING` — белые  
- `FREE` — **gold**  
- Под оффером мелким: `FLOOR 3 ONLY`

4. Факты (мелкий блок, не конкурирует с оффером):

```
59/2 CHAO FAH TAWAN TOK · CHALONG
08:00–23:00
PLACECOWORKING.COM
```

5. Низ — **ровно 2** пустых слота под QR (см. §6):

| Слот | Подпись под слотом |
|---|---|
| LEFT | `SIGN UP` |
| RIGHT | `INSTAGRAM` |

Опциональный RU (одна строка под оффером, если есть место):

```
1 БЕСПЛАТНЫЙ ДЕНЬ · ТОЛЬКО 3 ЭТАЖ
```

### Запрещено на Side A

- `THREE FREE DAYS` / `3 FREE DAYS` / любой multi-day trial  
- `5 FLOORS` как главный оффер Pass  
- Kathu, 5h@150, day 300, «open 24/7» без тарифа 9000  
- Студия / офисы как триал

---

## 5. SIDE B — текст (LOCKED)

### Иерархия

1. Верх мелким: `A SPORTS EVENT BY`  
   Крупнее: `PLACE COWORKING`

2. Центр — **упрощённая карта / маршрут** (иллюстрация, не фото с улицы):
   - Старт: флаг / точка **SPORTS STREET**
   - Путь ~1 km (изгиб «дорога»)
   - Финиш: **PLACE COWORKING** + иконка здания (7-Eleven рядом — опционально, как ориентир, мелким)
   - Лейбл на финише: `FINISH`

3. Под картой (accent, 1 строка):

```
FREE SMOOTHIE AFTER THE 1K FINISH
```

4. Дата / дистанция (белым, чётко):

```
MON 28 SEP 2026 · 08:00 · ~1 KM
FINISH AT PLACE · CHALONG
```

5. Мелкое правило стойки (1 строка, не мельчить до нечитаемости):

```
1 FREE SMOOTHIE / DAY · WALK OR RUN ONLY
```

6. Низ — **ровно 2** QR-слота (крупнее, чем у John с пятью):

| Слот | Подпись |
|---|---|
| LEFT | `GARMIN` |
| RIGHT | `STRAVA` |

Опциональный RU:

```
PLACE 1K: БЕСПЛАТНЫЙ СМУЗИ ПОСЛЕ ФИНИША
```

### Запрещено на Side B

- 5 QR (Komoot / MapMyRun / Ride with GPS) на уличной листовке  
- Без даты / без «1K» / «~1 km»  
- Обещание смузи без финиша / без лимита «1 в день»

---

## 6. QR — как сдавать макет

В **финале для печати** George вставит файлы:

| Сторона | Слот | Файл из пачки |
|---|---|---|
| A LEFT | Sign up / сайт | ссылка `https://placecoworking.com` (или отдельный signup URL — уточнить у George перед печатью) |
| A RIGHT | Instagram | QR на `https://instagram.com/place_coworking_phuket` |
| B LEFT | Garmin | `qr-garmin-run-event.png` |
| B RIGHT | Strava | `qr-strava-event.png` |

Папка QR: `/home/box/place-coworking/kb/inbox/best-lap-pack-2026-09-24/`

**В макете для AI / первого круга:** нарисовать **пустые белые квадраты** с тонкой рамкой и крестиком или текстом `QR` внутри — **не генерировать фейковые QR**. Размер слота: квадрат ≥ 28×28 mm на печати (лучше 32×32 mm). Зазор между двумя слотами ≥ 8 mm. Подпись — под квадратом, не поверх.

---

## 7. Deliverables (Teamly)

1. `SIDE-A.pdf` + `SIDE-B.pdf` (print-ready A5, bleed)  
2. `SIDE-A.png` + `SIDE-B.png` (RGB preview 150–300 dpi)  
3. Исходник Figma / Canva / PSD — ссылка в чат George  
4. Чеклист перед сдачей George:
   - [ ] Текст = §4 / §5 дословно (нет THREE FREE DAYS)
   - [ ] Дата 28 Sep 2026 · 08:00 · ~1 km
   - [ ] Только floor 3 для free day
   - [ ] 2+2 QR-слота, не 5
   - [ ] Chalong, не Kathu
   - [ ] Слоты пустые или уже с реальными QR после OK George

---

## 8. Референс

- Черновики John (стиль, НЕ текст): `kb/inbox/john-johnson/flyers-2026-09-24/`
- Канон: `CANON.md` — trial = 1 free day floor 3 only
- Событие: `BEST-LAP-GARMIN-STRAVA.md`

---

## 9. Цепочка approve

Coordinator собирает макет → George OK → печать / раздача.  
Без OK George — только черновики.
