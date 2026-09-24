# Place Coworking — work base / рабочая база

**EN:** Private operational knowledge base for Place Coworking (Chalong, Phuket). Used by George and Grok Bot for canon, drafts, site TZ, events, and marketing prep.

**RU:** Приватная операционная база Place Coworking (Чалонг, Пхукет). Для George и Grok-бота: канон, черновики, ТЗ сайта, ивенты, маркетинг.

Account: [placeCo](https://github.com/placeCo) · Repo: `place-coworking`

---

## Ops mode / Режим работы

- **Drafts only.** Бот пишет черновики; **не** публикует цены, посты, правки сайта, Ads, GBP без явного OK от George.
- **`CANON.md`** — единственная операционная правда по этажам/ценам/контактам, пока George явно не изменит канон.
- Язык ответов George: русский, конкретно. Документы RU/EN — ок.
- Публичные контакты Place: `info@placecoworking.com`, сайт placecoworking.com, IG `@place_coworking_phuket`, TG `@coworking_place_phuket`.

---

## Инфраструктура / Infrastructure

Full-time маркетолога **нет** — работа через роли + календарь SMM (`docs/ops/ROLES.md`).

| Doc | Зачем |
|-----|--------|
| [`docs/ops/ROLES.md`](docs/ops/ROLES.md) | Кто что делает (George, SMM @dftnsss, Bot, ресепшен, Nikita, John, Lena) |
| [`docs/ops/WORKFLOW-MARKETING.md`](docs/ops/WORKFLOW-MARKETING.md) | idea → календарь → Готово → OK → Postiz draft → OK → publish |
| [`docs/ops/SOURCES.md`](docs/ops/SOURCES.md) | Карта ссылок (sheet, каналы, Deskimo, Best Lap, Teamly) |
| [`docs/ops/TG-OUTBOUND.md`](docs/ops/TG-OUTBOUND.md) | Канон исходящих Telegram |
| [`templates/`](templates/) | BRIEF-SMM, POST-SLOT, HANDOFF, WEEKLY-MARKETING-CHECK |

SMM calendar: https://docs.google.com/spreadsheets/d/1YjIN-j7jw_i-rCRdF_Xfpq2AD-ZIxKV1qAobmQH8ds8/  
Postiz/Meta на паузе, пока календарь не «Готово» и Meta login не сделан. Ops mode выше — без изменений.


## Layout

```
README.md                 — этот файл
.gitignore
CANON.md                  — полный канон (истина)
CANON-CORE-2026-09-23.md  — короткий core Pass / Offices / Studio
docs/
  reception/              — скрипт ресепшена
  site/                   — FAQ, TZ сайта, offices/meeting rooms, meeting notes, redesign TZ
  events/                 — Garmin Best Lap, Strava, QR png, best-lap pack
  marketing/              — IG draft, Teamly coordinator, SMM calendars, playbooks
  ops/                    — roles, workflow, sources, TG outbound, sheets inventory, audits
templates/                — BRIEF-SMM, POST-SLOT, HANDOFF, WEEKLY-MARKETING-CHECK
kb/
  README.md · INDEX.md · PRIORITY-CONNECTORS.md
  facts/                  — condensed canon, marketing, ops-sources, MCP status
  inbox/                  — SEO snapshots, SaaS inventory; see README-MOVED
teamly/
  EXTRACT-2026-09-24.md   — content pack + 6 red site fixes (non-secret)
```

---

## Source hierarchy

1. `CANON.md` + `CANON-CORE-2026-09-23.md` — sole truth for floors/prices  
2. Teamly extract, Sheets inventory, FAQ/TZ — supporting (may lag)  
3. Inbox snapshots / SaaS inventory — evidence only; not permission to publish  
4. Missing fact → mark `ASSUMPTION` or ask George  

---

## What was excluded from the seed

- `*.bak` and `_archived-*` edit scrap / fonts / large intermediates  
- Files with **member personal emails** (`ops-followup`, apps-script membership notes)  
- Large PDF flyer, chat screenshots, analytics overview PNGs (markdown snapshots kept)  
- Secrets, `.env`, tokens, cookies  

---

## Next (suggested)

- SMM: октябрьские слоты → «Готово» (см. issues `smm` / `marketing`)  
- Meta/IG login `info@` + Postiz drafts only после календаря  
- Branch for site redesign from `docs/site/SITE-REDESIGN-TZ-2026-09-24.md`  
- Deskimo: добрать поля → OK George перед publish  
- Connect priority connectors (see `kb/PRIORITY-CONNECTORS.md`) via George screen login  
