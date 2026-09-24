# DRAFT · выравнивание `/office-for-rent-in-phuket`

**DRAFT · needs George OK before CMS**

| | |
|---|---|
| Дата | 2026-09-25 |
| Для | George / Place Ops |
| URL | `/office-for-rent-in-phuket` и зеркало `/ru/office-for-rent-in-phuket` |
| Режим | Черновик в git. Tilda, CMS, publish **не трогаем**. |

Зачем: в GSC страница уже собирает показы и почти не клики — 4 клика / 664 показа (разбор в PR [#8](https://github.com/placeCo/place-coworking/pull/8), файл `DRAFT-SEO-SEARCH-QUERIES-SEASONAL-2026-09-25.md` **только на ветке PR**, не на main). Живой текст расходится с каноном офисов. Аудит: [AUDIT-LIVE-BANLIST-2026-09-25.md](./AUDIT-LIVE-BANLIST-2026-09-25.md) (строка office landing). Канон карточки: [OFFICES-BLOCK.md](./OFFICES-BLOCK.md), паста витрины: [copy/OFFICES-EN-RU.md](./copy/OFFICES-EN-RU.md). Шаг в общем заходе CMS: [HANDOFF-CMS-ONE-PASS-2026-09-25.md](./HANDOFF-CMS-ONE-PASS-2026-09-25.md) § «SEO-страница офисов». Шесть red главной здесь не расписываются — [CHECKLIST-TILDA-6RED-2026-09-25.md](./CHECKLIST-TILDA-6RED-2026-09-25.md).

RU-зеркало в том же аудите **не вычитано целиком** (URL есть в sitemap). Ниже EN — то, что вставлять; RU — те же факты, если на зеркале те же блоки.

## Снять на EN-странице

| Найти на живой странице | Что сделать |
|---|---|
| Coworking «from ฿3,000 / month» | Удалить. Не заменять на день 300 и не оставлять «месяц от 3000». Якорь Pass на этой URL лучше убрать совсем: страница про офис. Если строка про коворкинг обязана остаться — месяц **6,000฿**, часы 08:00–23:00, без «from 3000». |
| Mon–Fri 24 hours / 24h / open 24 hours | Заменить на **08:00–23:00 daily**. Не писать бесплатный 24/7. |
| 2 этаж как аренда всего этажа (в аудите: 285 m²), hot desk / dedicated menu, публичные SKU «from ฿15,000» | Снять публичное меню и колонку цен 2 этажа. 2 этаж — офис **через менеджера**, без прайса на сайте. |
| Год «from 15,000», если он спорит с главной | На 5 этаже только цифры ниже: **30,000฿/мес** или **20,000฿/мес** при годе. |

Не добавлять на эту страницу: завтрак как оффер 2 этажа, Filming 500฿/ч, Kathu, отдельный night pass.

## EN — вставить

**Title (42):**

```
Office for Rent in Phuket | Place, Chalong
```

**Description (137):**

```
Private office for rent in Chalong, Phuket. Floor 5: 30,000฿/mo or 20,000฿/mo yearly (~4 people). Floor 2 via manager. Hours 08:00–23:00.
```

Тот же текст — в OG title / OG description.

**H1:**

```
Offices — floors 2 and 5
```

**Lead:**

```
Need a closed office — not a hot desk? Place has dedicated office space on floors 2 and 5 in Chalong. Details and availability via the manager.
```

**Floor 5:**

```
Floor 5 — private offices
Rooms for small teams (about up to 4 people).
30,000฿ / month
20,000฿ / month on a yearly deal
```

**Floor 2:**

```
Floor 2 — office space via the manager
We lease floor 2 as office space. It is not a public hot-desk menu and it has no price column on this page. Layout, availability, and a rare Pass upgrade if a room is free — ask the manager.
```

**Hours:**

```
Hours: 08:00–23:00 daily.
```

**CTA:**

```
Book an office tour · WhatsApp / call +66951170481 · info@placecoworking.com · Telegram @coworking_place_phuket
```

Адрес в подвале страницы не менять на другой район: 59/2 Chao Fah Tawan Tok Rd, **Chalong**.

## RU — зеркало `/ru/office-for-rent-in-phuket`

Те же снятия: «от 3 000», «Пн–Пт круглосуточно» / 24h, публичное меню hot desk 2 этажа, SKU «от 15 000». Часы: **08:00–23:00**. Не обещать бесплатный 24/7.

**Title:**

```
Аренда офиса на Пхукете | Place, Чалонг
```

**Description:**

```
Офис в Чалонге, Пхукет. 5 этаж: 30 000฿/мес или 20 000฿/мес при годе (около 4 человек). 2 этаж — через менеджера. Часы 08:00–23:00.
```

**H1:**

```
Офисы — этажи 2 и 5
```

**Лид:**

```
Нужен закрытый офис, а не горячий стол? В Place офисное пространство на 2 и 5 этажах в Чалонге. Свободность и условия — у менеджера.
```

**5 этаж:**

```
5 этаж — кабинеты
Для небольших команд (примерно до 4 человек).
30 000฿ / месяц
20 000฿ / месяц при годовом контракте
```

**2 этаж:**

```
2 этаж — офис через менеджера
Сдаём 2 этаж как офис. Это не публичное меню hot desk и не колонка цен на сайте. Планировка, свободность и редкий перевод с Pass, если комната свободна — у менеджера.
```

**Часы:**

```
Часы: 08:00–23:00 ежедневно.
```

**CTA:**

```
Тур по офисам · WhatsApp / звонок +66951170481 · info@placecoworking.com · Telegram @coworking_place_phuket
```

Если у страницы есть ZH-зеркало того же шаблона — те же факты (30 000 / 20 000, 2 этаж через менеджера, 08:00–23:00, Chalong). Готовый ZH-абзац в этот файл не кладём: в [copy/OFFICES-EN-RU.md](./copy/OFFICES-EN-RU.md) китайский всё ещё stub.
