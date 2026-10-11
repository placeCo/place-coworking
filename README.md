# Place Coworking — work base / рабочая база

**EN:** Operational knowledge base for Place Coworking (Chalong, Phuket). Used by George and bots (Grok, Cursor, etc.).

**RU:** Операционная база Place Coworking (Чалонг, Пхукет). Для George и ботов.

Account: [placeCo](https://github.com/placeCo) · Repo: `place-coworking`

---

## FOR BOTS / ДЛЯ БОТОВ

**Старт здесь:** [`kb/BOT-START.md`](kb/BOT-START.md)  
Затем обязательно `CANON.md`.

- Пиши **только черновики**. Не публикуй без явного OK George.
- `CANON.md` — единственная правда по ценам, часам, продуктам, ban-list.
- Нет факта → `ASSUMPTION` или спроси George.
- Язык ответов George: русский, конкретно.

**Текущий канон (кратко):**  
Часы 08:00–23:00 daily. Place Pass: 50/ч · день 400 до 31.10 → 500 с 01.11 · нед 1800 · мес 6000 · 3мес 15000. Office 30k/мес или 20k на год. Podcast → WhatsApp. Нет 24/7 публично.

---

## Ops mode / Режим работы

- **Drafts only.** Бот пишет черновики; **не** публикует цены, посты, правки сайта, Ads, GBP без явного OK от George.
- **`CANON.md`** — единственная операционная правда по этажам/ценам/контактам, пока George явно не изменит канон.
- Публичные контакты: `info@placecoworking.com`, placecoworking.com, IG `@place_coworking_phuket`, TG `@coworking_place_phuket`.

---

## Инфраструктура / Infrastructure

Full-time маркетолога **нет** — работа через роли + календарь SMM (`docs/ops/ROLES.md`).

| Doc | Зачем |
|-----|--------|
| [`kb/BOT-START.md`](kb/BOT-START.md) | **Старт для ботов** |
| [`CANON.md`](CANON.md) | Полный канон (истина) |
| [`docs/ops/ROLES.md`](docs/ops/ROLES.md) | Кто что делает |
| [`docs/ops/bots/README.md`](docs/ops/bots/README.md) | Скрипты ботов (drafts) |
| [`docs/ops/WORKFLOW-MARKETING.md`](docs/ops/WORKFLOW-MARKETING.md) | idea → календарь → Готово → OK → publish |
| [`templates/`](templates/) | BRIEF-SMM, POST-SLOT, HANDOFF |

---

## Layout

```
README.md                 — этот файл
CANON.md                  — полный канон (истина)
kb/BOT-START.md           — точка входа для ботов
docs/
  reception/              — скрипт ресепшена
  site/                   — FAQ, TZ сайта
  marketing/              — черновики, календари
  ops/                    — roles, bots, workflow, sources
  canon/                  — decisions log
templates/
kb/
```

---

## Source hierarchy

1. `CANON.md` — sole truth for floors/prices/hours/products  
2. `docs/canon/DECISIONS-LOG.md` — история решений  
3. Всё остальное — supporting (может лаг)  
4. Missing fact → mark `ASSUMPTION` or ask George  

---

## Status (11.10.2026)

- Боты в `docs/ops/bots/` — drafts, не deployed.
- Открытые draft-PR #7–9 (SEO) — требуют решения George (устарели после брифа 09.10).
- Сайт-макет: приватный репо `place-coworking-site`.

---

## What was excluded from the seed

- Secrets, `.env`, tokens, personal emails, large binaries.
