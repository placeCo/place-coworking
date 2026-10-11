# Place Coworking — work base / рабочая база

**EN:** Operational knowledge base for Place Coworking (Chalong, Phuket). Used by George and bots.

**RU:** Операционная база Place Coworking (Чалонг, Пхукет). Для George и ботов.

Account: [placeCo](https://github.com/placeCo) · Repo: `place-coworking`

---

## FOR BOTS / ДЛЯ БОТОВ

**Старт строго в этом порядке:**

1. [`kb/BOT-START.md`](kb/BOT-START.md)
2. [`kb/CONTEXT-ROUTER.md`](kb/CONTEXT-ROUTER.md)
3. [`kb/contexts/MINIMAL.md`](kb/contexts/MINIMAL.md) или конкретные файлы из `kb/contexts/`
4. Только если не хватает — `canon.json` → `CANON.md`

- Пиши **только черновики**. Не публикуй без явного OK George.
- Нет факта → `ASSUMPTION` или спроси George.
- Язык ответов George: русский, конкретно.

---

## Инфраструктура

| Doc | Зачем |
|-----|--------|
| [`kb/CONTEXT-ROUTER.md`](kb/CONTEXT-ROUTER.md) | **Порядок загрузки контекста** |
| [`kb/contexts/MINIMAL.md`](kb/contexts/MINIMAL.md) | Абсолютный минимум |
| [`kb/contexts/`](kb/contexts/) | Лёгкие контексты по задачам |
| [`CANON.md`](CANON.md) | Полный канон (истина) |
| [`canon.json`](canon.json) | Machine-readable |
| [`docs/ops/bots/README.md`](docs/ops/bots/README.md) | Скрипты ботов (drafts) |

---

## Layout

```
README.md
CANON.md
canon.json
kb/
  BOT-START.md
  CONTEXT-ROUTER.md
  contexts/
    MINIMAL.md
    prices-hours.md
    products-ban.md
    contacts.md
    bot-rules.md
    reception-short.md
docs/
```

---

## Source hierarchy

1. `CANON.md` — sole truth  
2. `kb/contexts/*` + `canon.json` — lightweight extracts  
3. Всё остальное — supporting  

---

## Status (11.10.2026)

- Боты в `docs/ops/bots/` — drafts, не deployed.
- Draft-PR #7–9 — устарели.
- Сайт-макет: репо `place-coworking-site`.
