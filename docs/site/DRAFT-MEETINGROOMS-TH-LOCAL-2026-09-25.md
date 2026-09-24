# DRAFT · `/meetingrooms` и угол `/th`

**DRAFT · needs George OK before CMS**

| | |
|---|---|
| Дата | 2026-09-25 |
| Для | George / Place Ops |
| URL | `/meetingrooms` (тонкая) и блок на `/th` |
| Режим | Черновик в git. Tilda, CMS, publish **не трогаем**. Новых URL не заводим. |

Зачем: `/meetingrooms` в снимке GSC почти невидима (0 кликов / 10 показов), `/th` — 24 клика / 1401 показ. Отдельного запроса `meeting room Phuket` в топ-10 того снимка нет. Есть спайк **«ห้องประชุม ป่าตอง»** (+292% показов к обычной базе; абсолют в снимке не дан — не достраиваем). Разбор: PR [#8](https://github.com/placeCo/place-coworking/pull/8), файл `docs/site/DRAFT-SEO-SEARCH-QUERIES-SEASONAL-2026-09-25.md` на ветке PR, **не на main**.

Аудит называет страницу тонкой и просит оставить канон 250฿/ч и −20%, без filming SKU: [AUDIT-LIVE-BANLIST-2026-09-25.md](./AUDIT-LIVE-BANLIST-2026-09-25.md). Полный блок карточки уже есть: [MEETING-ROOMS-BLOCK.md](./MEETING-ROOMS-BLOCK.md). Указатель в заходе CMS: [HANDOFF-CMS-ONE-PASS-2026-09-25.md](./HANDOFF-CMS-ONE-PASS-2026-09-25.md) § Meeting rooms. Шесть red главной не копируем.

Спайк по Патонгу — спрос на комнату, не наш адрес. В title, description и тексте **нет** «мы в Патонге», «ป่าตอง» как локация Place, «5 минут от Bangla». Ответ сниппета: переговорка в **Chalong**.

`/th` в аудите не открыт целиком (curl 403). Тайские строки — stub, сверить носителем до CMS. Отдельной `/th/meetingrooms` в репозитории нет; не создавать её из этого файла. TH-блок ставить на существующую `/th`. EN-блок — на `/meetingrooms`.

## EN — вставить на `/meetingrooms`

**Title (46):**

```
Meeting Room Phuket | Place Coworking, Chalong
```

**Description (129):**

```
Meeting room in Chalong, Phuket — not Patong. From 250฿/hour. Place Pass residents −20%. Book via WhatsApp or phone +66951170481.
```

Тот же текст — в OG.

**Короткое тело (не вместо полного блока в MEETING-ROOMS-BLOCK):**

```
Meeting room in Chalong, Phuket. Place Coworking is in Chalong — not a Patong branch.

From 250฿ per hour.
Place Pass residents: −20%.

Book with us on WhatsApp, Telegram, or +66951170481 · info@placecoworking.com.
No self-serve calendar on the site.

Rooms are on the ground floor, next to the library and café zone. A larger setup is about 20 people. Projector, screen, and whiteboard where the room has them — we confirm when you book.
```

CTA с карточки, если нужна одна строка: `Book a meeting room · Ask about resident −20%`.

## TH stub — блок на `/th`

Кластер в заголовке: `ห้องประชุม` + Пхукет. Район в тексте: ฉลอง / Chalong. Слово ป่าตอง стоит только в отрицании («не Патонг»), не как адрес.

**Title (39):**

```
ห้องประชุมภูเก็ต | Place Coworking ฉลอง
```

**Description (92):**

```
ห้องประชุมในฉลอง (Chalong) ไม่ใช่ป่าตอง จาก 250฿ ต่อชั่วโมง เรซิเดนต์ Pass ลด 20% จองผ่านเรา
```

**Тело:**

```
ห้องประชุมบนภูเก็ต — Place Coworking ย่านฉลอง (Chalong)
เราอยู่ฉลอง ไม่ใช่สาขาป่าตอง

เริ่มต้น 250฿ ต่อชั่วโมง
เรซิเดนต์ Place Pass ลด 20%

จองผ่านเรา: WhatsApp, Telegram หรือ +66951170481 · info@placecoworking.com
ยังไม่มีจองเองบนเว็บ

ห้องอยู่ชั้นล่าง ข้างห้องสมุดและโซนคาเฟ่ ห้องใหญ่ประมาณ 20 คน โปรเจ็กเตอร์ / จอ / ไวท์บอร์ด — ยืนยันตอนจอง
```

Глосс для проверки фактов (не публиковать как второй абзац): комната в Чалонге, не филиал Патонга; от 250฿/ч; резидентам Pass −20%; бронь через нас; 1 этаж у библиотеки и кафе; большая ~20 человек; оборудование подтверждаем при брони.

## Не писать

Патонг / ป่าตอง как наша локация · крыша как meeting coworking · Filming 500฿/ч · 2 этаж как dedicated desk · бесплатный 24/7 · самозапись «как стол», пока календаря нет. Часы здания на этой странице, если строка нужна: **08:00–23:00** — не «open 24 hours».
