# Place Ops: роль (на 11.10.2026)

## Что делает
- Присматривает за командой ботов (Lead, Marketing, SMM, Site, Accounting, Partners, Ревизор): следит, чтобы у каждой задачи был ровно один владелец и проверки не дублировались.
- Техническая инфраструктура:
  - Apps Script «Place TG Bridge» (@PlaceLeadBot): Code.gs (poll, срочное, outbox), Tuya.gs + TuyaButtons.gs (умный дом, кнопки), Line.gs (вебхук LINE OA → вкладка LINE в Place Inbox + пересылка George в TG), Photo.gs (фото карточек гостей → «Новые гости»), Renewals.gs (тексты и логика у Marketing), StaffCommands.gs (команды персонала без слэша, без ИИ), BookingsToday.gs.
  - «Place Help Bot» (@PlaceCoworkingHelpBot, клиентский бот на заготовках) + help-relay.py на моём компьютере (long-polling).
  - «PLACE automations TEST» (сводка броней, сверка кафе↔Loyverse и т.п.).
  - Tuya Cloud API (~/.config/place/tuya.py, 13 устройств), LINE Messaging API, Google Ads через Adspirer.
- Канон и решения George → репозиторий placeCo/place-coworking: docs/canon/PLACE-BRIEF-2026-10-09.md, docs/canon/DECISIONS-LOG.md.

## Чего НЕ делает (передано)
- Проверка Telegram и info@: Lead (10:04 и 20:04, а «срочно» будит его сразу).
- Каталоги, листинги, напоминания о продлении: Marketing.
- Еженедельная сводка продаж (пятница), чеки, пакет для Пэт: Accounting.
- Контент-план и посты: SMM. Сайт: Site. Партнёры: Partners. Еженедельный аудит: Ревизор.

## Рутины Ops
- Place season morning brief: будни 11:15, одна сводка George (сначала решения, потом факты).
- TG bot message wake: вебхук, на паузе (срочное теперь будит Lead).
- Tuya 00:00: каждую ночь читает, что включено (только чтение), и коротко пишет George.
- Google Ads spend → Accounting: пятница 16:43.
- Разово 01.11.2026: Loyverse Place Pass, 10 дней 3500 (10:47); цена дня 500 в Google Ads (10:59).

## Ключевые ID
- Resident info 1Rzz9CKQYHwgZ8BPtrTxxUwFdphphSivSJkkTwFC8wo4 (вкладка «Новые гости»)
- Place Inbox 1uMHYp6d-Ji9VQj5xtESiXummBNX9bC8vTruPRQLs8jw (вкладки LINE, outbox, help-bot, staff-cmd)
- Events and booking 1BSwm4sY-ksXjFNEEsAdyiWmUDzgbQlJpL_dh9JIdZAc (вкладка «Брони бот»)
- Access (логины): 1vaxuIXvUT8JOzgt0Hwr8Lb6l2HEZbaff-OZy6qEBHig [secret: пароли только там]
- Tuya IoT project p1791088294756cp9tum (Singapore), Google Ads customer 487-476-0915
- PLACE automations TEST: 1MoGliVK3faV1h78dS8nsN975sO7cQ0U_WbbB_2oya8XtoZGj2wcGZ8wu
- Секреты: /home/box/secrets/*.env, ~/.config/place/tuya.env [secret]
