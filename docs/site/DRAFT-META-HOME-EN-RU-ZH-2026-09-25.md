# DRAFT · meta главной EN / RU / ZH (+ TH stub)

**DRAFT · needs George OK before CMS**

| | |
|---|---|
| Дата | 2026-09-25 |
| Для | George / Place Ops |
| Страницы | `/` · `/ru` · `/zh` · `/th` (stub) |
| Режим | Черновик в git. Tilda, CMS, publish **не трогаем**. |

Живой meta/OG главной всё ещё обещает «Get 3 Free Days on Any Floor!» — строка аудита: [AUDIT-LIVE-BANLIST-2026-09-25.md](./AUDIT-LIVE-BANLIST-2026-09-25.md). Ниже — строки на замену **после** OK. Полный проход 6 red здесь не дублируется: [CHECKLIST-TILDA-6RED-2026-09-25.md](./CHECKLIST-TILDA-6RED-2026-09-25.md). Факты hero: [copy/HOME-EN-RU.md](./copy/HOME-EN-RU.md).

Зачем эти кластеры: снимок GSC и разбор сезона лежат в PR [#8](https://github.com/placeCo/place-coworking/pull/8) (`docs/site/DRAFT-SEO-SEARCH-QUERIES-SEASONAL-2026-09-25.md` на ветке `cursor/seo-seasonal-queries-00d4`, **не на main**). Коротко: `coworking phuket` 2/107, `phuket coworking space` 1/93, `co working space phuket` 6/71, `коворкинг пхукет` 1/78, `co working space ภูเก็ต` 3/83. Бренд уже кликают; generic — нет.

Длины ниже — `len()` строки (символ ฿ = 1). В Tilda смотреть превью: CJK и тайский шире латиницы.

Цену дня в title, description и OG специально не пишем: 01.10–31.10.2026 день **400฿**, с 01.11.2026 снова **500฿**. Google держит сниппет неделями, и цена дня в meta устареет раньше страницы. В сниппете остаются месяц **6000** и **1 бесплатный день (только 3 этаж)**.

## Куда вешать

Один и тот же title и description — в SEO title, meta description и OG title / OG description. Иначе сниппет и шаринг снова разъедутся (сейчас OG повторяет бан «3 free days»).

## EN — `/`

Рекомендуемый title держит самый слабый CTR-запрос (`coworking phuket`) и район. Запасной — если в превью важнее фраза `phuket coworking space`. Description закрывает оба плюс `co-working space`.

**Title (43)** — вставить:

```
Coworking Phuket | Place Coworking, Chalong
```

**Title, запасной (41):**

```
Phuket Coworking Space in Chalong | Place
```

**Description (138):**

```
Phuket coworking space in Chalong: Place Coworking. Co-working space, hours 08:00–23:00. Month 6,000฿. One free trial day on floor 3 only.
```

## RU — `/ru`

**Title (44):**

```
Коворкинг Пхукет в Чалонге | Place Coworking
```

**Description (119):**

```
Коворкинг на Пхукете: Place в Чалонге (не Kathu). Часы 08:00–23:00. Месяц 6 000฿. Один бесплатный день — только 3 этаж.
```

## 中文 — `/zh`

Черновик перевода с EN-фактов. До CMS сверить носителем; не раздувать до полного ZH-hero (его ещё нет в [copy/HOME-EN-RU.md](./copy/HOME-EN-RU.md)).

**Title (28):**

```
普吉岛共享办公 | Place Coworking，查龙
```

**Description (77):**

```
Place Coworking，查龙 Chalong（不是 Kathu）。每天 08:00–23:00。月票 6,000฿。免费试用 1 天，仅 3 楼。
```

## TH stub — `/th`

`/th` в аудите не прочитан целиком (curl 403). Строки ниже — только title/description под кластер `co working space ภูเก็ต`, не перевод всей главной. Сверить носителем до CMS.

**Title (36):**

```
Co Working Space ภูเก็ต | Place ฉลอง
```

**Description (108):**

```
Place Coworking ย่านฉลอง Chalong ไม่ใช่ Kathu เปิดทุกวัน 08:00–23:00 เดือน 6,000฿ ทดลองฟรี 1 วัน เฉพาะชั้น 3
```

## В этих строках уже есть / чего в них нет

Есть: Place, Chalong, 08:00–23:00, месяц 6000, триал = 1 бесплатный день только 3 этаж.

Нет и не добавлять в title, description, OG: цену дня (ни 400, ни 500), бесплатный 24/7, «open 24 hours», день 300, «3 free days» / «any floor», Kathu, Patong. Ночь (месяц 24/7 = 9000) в этот сниппет не класть — иначе снова читается как «мы открыты всем ночью».
