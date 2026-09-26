# Place TG Bot и мост — рабочая схема

**Актуально на 26 сентября 2026 · ICT (Asia/Bangkok)**

## Бот

- Бот: **@PlaceLeadBot**. Privacy mode отключён.
- Бот находится в чатах **PLACE Team**, **PlaceCo** и **«Тех вопросы»**.
- Токен хранится только на компьютере Lead и **не хранится в репозитории**.

## Bridge Apps Script

- Проект Apps Script: **«Place TG Bridge»**, аккаунт **info@placecoworking.com**.
- ID проекта: `1b6HRWG7y33yeGUwAkc5zaibuV-4TXCtpghU5Go-nQy65Pjpz6LAGIf7_`.
- Скрипт вызывает `getUpdates` раз в минуту. **`setWebhook` запрещён:** он сломает polling-мост.
- Каждое сообщение попадает письмом на `info@placecoworking.com` с темой `TG | name | chat`, а также строкой в Place Inbox: таблица `1uMHYp6d-Ji9VQj5xtESiXummBNX9bC8vTruPRQLs8jw`, вкладка `queue`.
- Gmail-фильтр переносит письма с `TG |` из inbox, помечает их прочитанными и ставит label `TG-inbox`.

Шаблон кода без секретов: [`tg-bridge/Code.template.gs`](tg-bridge/Code.template.gs). В нём допустимы только плейсхолдеры `__TOKEN__`, `__OPS_URL__`, `__OPS_AUTH__`.

## Wake Place Ops

Мост делает отфильтрованный `POST` на webhook рутины Place Ops **«TG bot message wake»**. URL и ключ находятся только в Script Properties: `OPS_URL` и `OPS_AUTH`. Заголовок: `Authorization: Bearer <OPS_AUTH>`.

В wake попадают:

- личные сообщения боту;
- упоминания `@PlaceLeadBot` и ответы на сообщения бота;
- все сообщения из **«Тех вопросы»**;
- сообщения Лены `@yasozidayu`, Никиты `@rufasstyle` и Алёны `@dftnsss`, кроме заказов кафе.

Стикеры никогда не отправляются в Ops. Обычная пакетная отправка — не чаще одного раза в 15 минут (`OPS_DELAY_MIN`), с ожиданием 3 минуты на сбор пачки; payload: `{batch, count, messages[]}`. Срочные слова (`срочн`, `urgent`, `asap`, `горит`, `помогите`, `help`, `не работает`, `сломал`, `авари`, `пожар`, `потоп`, `утечк`, `emergency`, `ด่วน`) будят Ops в течение минуты.

Ops не отвечает в Telegram сам: он передаёт задачу Lead, а Lead отвечает через Bot API.

## Личные сообщения аккаунту Place (с 26.09.2026)

**С 26.09.2026 Place Lead не видит личные сообщения (ЛС) аккаунту Place в Telegram в реальном времени.** Рабочие сообщения для Lead пишите в бот **@PlaceLeadBot** (или в рабочие группы **PLACE Team**, **PlaceCo**, **«Тех вопросы»**), **не в личку** аккаунту Place.

Исключение — ночной сбор ЛС:

- Раз в сутки около **00:08 ICT** Lead открывает Telegram Web аккаунта Place и собирает новые ЛС в очередь Place Inbox (вкладка `queue`, source **«TG Web DM»**).
- Ночью Lead **никому не отвечает**.
- Ответы команде — после **10:00 ICT** через бота; ответы лидам/клиентам — только черновик на **OK George**.

## Welcome

При `/start` в личке бот отправляет правила из константы `WELCOME` в [`tg-bridge/Code.template.gs`](tg-bridge/Code.template.gs). Текст шаблона не содержит секретов.

## Расписание routines (ICT, ежедневно, включая выходные)

Канонический список расписания ведётся в [`ROUTINES-AND-REMINDERS-EXPORT-2026-09-25.md`](ROUTINES-AND-REMINDERS-EXPORT-2026-09-25.md). На 26 сентября 2026:

- **00:08** — Place nightly TG Web DM sweep: Telegram Web аккаунта Place, новые ЛС → Place Inbox `queue` (source «TG Web DM»); ночью никому не отвечать.
- **10:07** — утренний отчёт продаж за вчера Лене в личку через бота, для сверки с кассой.
- **13:00** — midday inbox: только Gmail с label `TG-inbox` и вкладка `queue`; Telegram Web не открывать.
- **23:10** — вечерний wrap-up и отчёт продаж Джорджу (перенесено с 19:30, когда коворкинг закрывается для ночной смены). После него сообщения команде в TG отправляются только с **10:00**.
- **Пн/Ср/Пт, 10:52** — черновики TG social.
- Watch напоминаний Apps Script — **на паузе**.
