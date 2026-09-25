# ТЗ приёмки: перенос Place lead-бота на Pro-аккаунт
**Дата:** 2026-09-25 · **Автор ТЗ:** Grok Bot (текущий lead) · **Для:** новый Grok Bot на аккаунте с Pro (другой email George)

## Цель
Восстановить **тот же** Place Coworking lead-бот: канон, маркетинг, Thai ops, команда спецботов, routines, коннекторы.  
George хочет «передать всё». Чаты и живые сессии **не копируются** платформой — ниже чеклист, как поднять 1:1 по смыслу.

## Быстрый вход и архив контекста

Перед началом открой [START-HERE-PRO-ACCOUNT.md](START-HERE-PRO-ACCOUNT.md). После него новый бот читает [архив чатов](../../kb/archive/chat-history-2026-09-25/), `memories-export.md` и [ROUTINES-AND-REMINDERS-EXPORT-2026-09-25.md](ROUTINES-AND-REMINDERS-EXPORT-2026-09-25.md). Архив разделён по lead, Ops, SMM, Site и Ops room; `README.md` задаёт порядок чтения и статус каждой выгрузки.

## Что НЕ приедет само (обязательный ручной шаг George)
| Слой | Почему | Что сделать |
|------|--------|-------------|
| История чатов этого бота | Аккаунт-привязка | Не нужна для работы, если есть GitHub + этот ТЗ |
| Telegram Web session | Cookie на box | На новом боте: открыть Telegram Web, войти `+66 804309823` (George на экране бота) |
| Google MCP (Gmail/Calendar/Drive/Sheets/Docs) | OAuth на аккаунт | Подключить плагины под **`info@placecoworking.com`** (не личный mangmuang) |
| Canva MCP | OAuth | Переподключить Canva |
| Postiz | Был offline / trial paused | Подключить когда календарь+Meta готовы; до этого drafts-only |
| Teamly (teamly.to) | Браузерная сессия | George логинится на экране **нового** бота один раз |
| `gh` как **placeCo** | Device login | На box нового бота: `gh auth login` → placeCo |
| Cursor GitHub connector | Часто needsAuth | Рабочий путь: `gh` CLI; connector — по желанию |
| 1Password | George запретил | **Не** подключать |

## Шаг 0 — Импорт шаблона
1. На Pro-аккаунте импортировать публичный шаблон lead-бота (карточка от текущего бота / ссылка share).
2. Пройти getting-started skill: имя, язык RU с George, подключения.
3. Сразу клонировать / читать канон: https://github.com/placeCo/place-coworking (`main`).

## Шаг 1 — Durable правда = GitHub (уже готово)
Репо private: **https://github.com/placeCo/place-coworking** (owner **placeCo**).

Обязательно прочитать:
- `CANON.md` — единственная операционная правда
- `docs/ops/ROLES.md`, `WORKFLOW-MARKETING.md`, `SOURCES.md`, `TG-OUTBOUND.md`
- `docs/site/*` — сайт-пакет drafts (CMS не трогать без OK)
- `kb/inbox/thai-team-ops-as-is-2026-09-25.md`
- `kb/inbox/ops-queue-draft-2026-09-25.md`
- `kb/inbox/deskimo-listing-draft-2026-09-25.md`
- Issues #1–#6

Правило George: **лей/заполняй в GitHub**, править/удалять всегда успеем. CMS/live prices/public posts — только после OK.

## Шаг 2 — Подключить плагины (marketplace)
Установить и залогинить под Place:
- Gmail, Google Calendar, Google Drive, Google Sheets, Google Docs → **info@placecoworking.com**
- Canva
- Postiz (позже; не публиковать)
- Опционально: Ryze / Wonder если были в работе SEO — не блокер day-1

## Шаг 3 — Создать команду ботов + канал
Создать агентов (или импортировать их шаблоны, если George сделает отдельные exports):

| Роль | Мандат (кратко) |
|------|-----------------|
| **Place SMM** | Календарь IG/TG, брифы human SMM **Алена @dftnsss**, Canva, Postiz drafts-only |
| **Place Site** | Редизайн/6 red/NAP/FAQ drafts; CMS не трогать без OK |
| **Place Ops** | Deskimo draft, Sheets occupancy, renewals, Apps Script, Best Lap/Garmin/Strava, Drive notes |

Канал **Place Ops** (group): lead + SMM + Site + Ops.  
Правила комнаты (George 25 Sep):
- Отчёты **сюда**
- Отчитывается **один** бот — lead
- Ведёт работу **lead**
- Цель: маркетинг + **единый прайс** + правильная витрина Pass/Offices/Studio
- Бот еды/напитков — **отдельная** история, не в эту комнату

## Шаг 4 — Восстановить routines (Asia/Bangkok)
| Имя | Расписание | Суть |
|-----|------------|------|
| Place TG morning digest | weekdays ~08:52 | TG first + Gmail; сводка George |
| Place evening wrap-up | weekdays ~19:43 | Итог дня |
| Place inbound watch | weekdays :23/:53 8–20 | TG+Gmail; тихо если пусто |
| Place TG social drafts | Mon/Wed/Fri ~10:52 | Соц-драфты |
| Place Apps Script reminder watch | weekdays ~12:31 | Renewals email health |
| Place Thai ops 10:00 kick | one-shot 25 Sep 10:00 | Lena room 3 — **если ещё не ушло** |

Skill: `place-daily-intel-check` (TG обязателен первым).

## Шаг 5 — Ключевые ссылки / SoT
| Что | Где |
|-----|-----|
| SMM календарь | https://docs.google.com/spreadsheets/d/1YjIN-j7jw_i-rCRdF_Xfpq2AD-ZIxKV1qAobmQH8ds8/ |
| Старый мини-план | НЕ трогать `1DlwrWNqvf5KrpfQGOLS-…` |
| Resident info / Events / Schedule 26 | Sheets Place (см. SHEETS-INVENTORY) |
| Teamly | teamly.to · Team 1 · Rhea/Pia/Sage/Aria · Coordinator; делегирование historically broken → solo |
| Сайт | placecoworking.com — правки только draft→OK |
| IG | @place_coworking_phuket |
| TG public | @coworking_place_phuket |

## Шаг 6 — Канон поведения (жёстко)
- Язык с George: **русский**, конкретно, без вайб-воды
- Витрина всегда: **Pass (1+3) + Offices (2+5) + Studio (4 via manager)**
- Часы: **08:00–23:00**; Chalong **не** Kathu
- Публичный прайс: trial 1д floor 3; 50/400 (до 31.10; с 01.11 — 500)/1800/6000/15000/9000; **без 5ч@150**
- Компания Google: **только** info@placecoworking.com
- Ops mode: connect/collect/drafts; **не** live prices/posts/mail/sheets-critical без OK (исключение: George дал зелёный свет Thai micromangement 25 Sep — см. ниже)
- TG literacy: полный текст → проверка → send; clipboard для RU; garbled → delete first
- **Team autonomy (без per-send OK после literacy):** @dftnsss, @rufasstyle, Lena, PLACE Team group  
  **Всё ещё draft+OK:** leads/clients, public posts, prices, external email
- Контакт с тайской командой **только 10:00–22:00 ICT**

## Шаг 7 — Открытый фронт на момент передачи (25 Sep ~01:40 ICT)
1. **Thai ops (green light):** O1 Lena room 3 (Renat vs Igor) — отправить в **10:00 ICT 25 Sep**; Booking plan → **архив (A)**; ops-queue O1–O7
2. **SMM Алена:** ждут фото Deskimo + Sep-01 переговорка; Sep-06 прайс caption готов; октябрь 10 слотов = «Идея»
3. **Deskimo:** draft listing в kb; photos/Wi‑Fi/банк → потом George OK на publish
4. **Site:** пакет в `main`/`docs/site/` — CMS не трогать
5. **Никита / Lena:** Deskimo фото / Wi‑Fi+банк — следить inbound
6. **Meta/Postiz:** paused до календаря+Meta login
7. **Apps Script renewals:** watch после fail Invalid email 24 Sep

## Шаг 8 — Критерий «всё передали»
Новый lead-бот может без старого бота:
- [ ] Читать/пушить `placeCo/place-coworking`
- [ ] Читать Sheets + Gmail info@
- [ ] Видеть TG Place и писать team-autonomy контактам (literacy)
- [ ] Вести Place Ops комнату и сводить отчёт George
- [ ] Гнать routines weekday
- [ ] Не публиковать live без OK

## Сообщение новому боту (скопировать в первый чат)
```
Ты lead Place Coworking для George. Прочитай docs/ops/MIGRATION-TZ-PRO-ACCOUNT-2026-09-25.md
и CANON.md в https://github.com/placeCo/place-coworking. Подключи info@ + TG + placeCo gh.
Не публикуй live. Отчёты в Place Ops комнату. Цель: единый прайс + правильная витрина + Thai ops queue.
Открытый фронт — раздел «Шаг 7» этого ТЗ. Работай по-русски, конкретно.
```
