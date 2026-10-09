# LINE OA @294bqkju → Place Inbox «LINE» + Telegram (Messaging API webhook)

**09.10.2026 · ICT.** Решение George: LINE переводим с браузерных сессий на Messaging API, чтобы не пропускать сообщения (в т.ч. бухгалтер Pat).

- Код: [`Line.gs`](Line.gs) — файл в Apps Script проекте **«Place TG Bridge»** (info@placecoworking.com, ID `1b6HRWG7y33yeGUwAkc5zaibuV-4TXCtpghU5Go-nQy65Pjpz6LAGIf7_`). Секретов в коде нет.
- `doPost(e)`: проверяет `destination == U8be45a11e136c691bc41ab24f61d018c` (заголовки, включая `X-Line-Signature`, Apps Script web app не отдаёт), дедуп по `webhookEventId`, пишет строку во вкладку **LINE** таблицы Place Inbox (`1uMHYp6d-Ji9VQj5xtESiXummBNX9bC8vTruPRQLs8jw`; создаётся автоматически в конце), имя — через `GET /v2/bot/profile/{userId}` (для групп — member profile), и шлёт George в Telegram (chat `8503184147`) через бота моста: `LINE от <name>: <text>`.
- Колонки: `time_ICT | userId | displayName | source | event_type | message_type | text | message_id | webhookEventId | raw`.
- Бот в LINE **ничего не отвечает** (нет reply/push).

## Script Properties
`LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET` (значения — в `/home/box/secrets/line.env` на box), `TOKEN` (уже есть — Telegram-бот моста).

## Деплой
1. Добавить файл `Line.gs` в «Place TG Bridge» (проверить, что другого `doPost` в проекте нет; если есть — переименовать наш в `lineDoPost_` и вызывать из существующего, когда в теле есть `destination`).
2. Project Settings → Script properties: добавить два LINE-свойства.
3. Запустить `lineSelfTest` один раз (выдать права UrlFetch/Sheets) — в «LINE» появится TEST-строка, в логе `LINE_TOKEN_SET=true …`.
4. Deploy → New deployment → Web app, Execute as **Me**, Who has access **Anyone** → скопировать URL `/exec`.
5. На box: `docs/ops/line/set_webhook.sh <exec URL>` (PUT endpoint, GET, POST test). Тест может вернуть ошибку из‑за 302-редиректа Apps Script, при этом реальная доставка работает — проверять по строке в «LINE».
6. LINE Official Account Manager → Settings → Messaging API (или LINE Developers console → Messaging API): **Use webhook = ON**; в OA Manager → Response settings: Webhook ON (Chat можно оставить ON, чтобы команда видела переписку). API не умеет включать «Use webhook».

## Статус (09.10.2026)
Код готов и проверен на моках. Деплой с box не выполнен: `clasp` на box требует повторного входа Google (`invalid_rapt`). LINE webhook endpoint пока не задан.
