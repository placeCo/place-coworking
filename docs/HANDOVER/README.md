# HANDOVER — точка входа для преемника Place Coworking

Составлено 16.10.2026 (ICT) по просьбе George: «если меня не станет завтра, чтобы кто-то мог всё подхватить».
Подробная таблица всех аккаунтов, ID и расписаний: [`SYSTEMS-INVENTORY.md`](SYSTEMS-INVENTORY.md).

> ⚠️ **Репозиторий `placeCo/place-coworking` ПУБЛИЧНЫЙ** (проверено 16.10.2026 через GitHub). Здесь нет паролей, токенов,
> банковских счетов, зарплат, телефонов сотрудников и выгрузок таблиц. Для каждого доступа написано только **где** он хранится и **у кого** есть.
> Первое решение преемника: сделать репо private (Settings → General → Danger Zone → Change visibility) — см. «Первые 7 дней».

---

## 1. Что такое Place

**Place Coworking Phuket** — коворкинг в Чалонге: **59/2 Chao Fah Tawan Tok Rd, Chalong, Phuket 83130**.
Открыт каждый день **08:00–23:00** (публично 24/7 не продаём). Сайт https://placecoworking.com, почта **info@placecoworking.com**,
WhatsApp ресепшена +66 95 117 0481, TG-канал @coworking_place_phuket, админ TG @coworking_place, Instagram @place_coworking_phuket.

Продаём три продукта: **Place Pass** (этажи 1+3), **Office** (этажи 5 и 2), **Podcast** (одна комната). Этажи: 1 — вход, библиотека, кафе (amenity);
2 и 5 — офисы; 3 — open space; 4 — не предлагать; крыша (6) арендована, не коворкинг.

## 2. Люди и роли (по графику на октябрь 2026, Schedule 26 → вкладка Oct)

| Кто | Роль | Примечание |
|---|---|---|
| **George** | владелец/основатель | все OK по ценам, публикациям, деньгам; TG @grungelovecatss |
| **Lena** | менеджер на месте, финансы/платежи | старшая на месте с 30.09; TG @yasozidayu. Доступа к банковским счетам **нет** |
| **Tangmo, Nathaly, Fon** | админы ресепшена | смены 08:00–17:00 / 11:00–20:00 / 14:00–23:00 |
| **Kate, Sun** | кухня/кафе | заказы в TG-группе PLACE Team, касса Loyverse |
| **Som** | техник | свет, вода, AC, лифт |
| **Wawa, Tuay** | уборка | |
| **Pat** | бухгалтер (с 09.2026) | **только через LINE OA @294bqkju**, по-тайски, ≤1 сообщения в день, с OK George |
| **Sasha (Александр К)** | тех. сопровождение: камеры, сеть, AC, Tuya | TG @Solar_element |
| **Nikita** | тех./фото/контент | TG @rufasstyle |
| **Khun Sak (Somsak)** | директор тайской компании, коммуналка, инкассация | PEA, сейф, госорганы |

Контакты подрядчиков и экстренные номера: [`docs/ops/handover/EMERGENCY-CONTACTS.md`](../ops/handover/EMERGENCY-CONTACTS.md). Роли: [`docs/ops/ROLES.md`](../ops/ROLES.md).

## 3. Цены и канон

Единственный источник правды — **[`CANON.md`](../../CANON.md)** + [`docs/canon/`](../canon/) (`PLACE-BRIEF-2026-10-09.md`, `DECISIONS-LOG.md`).
Коротко: Pass 50 ฿/час · 400 ฿/день до 31.10 (**500 с 01.11.2026** — поменять в Loyverse и на сайте руками) · 1 800 неделя · 6 000 месяц · 15 000 3 месяца ·
10 дней 2 500 (3 500 с 01.11). Office 30 000 ฿/мес, 20 000 ฿/мес по годовому договору (адрес компании только в годовом). Podcast — цена через WhatsApp.
Лист «Прайс» в Google неполный — не опираться.

## 4. Боты (агенты Grok Bot) и их обязанности

Полный список и ID: [`docs/bots/BOTS.md`](../bots/BOTS.md); у каждого `docs/bots/<bot>/ROLE-CORE.md`, `MEMORY.md`, `OPEN.md`.

| Бот | Что делает |
|---|---|
| **Place Lead** | очередь Place Inbox каждые 30 мин (08:08–22:38), TG + info@ 10:04/17:04, сообщение Лене 11:27, LINE с Pat, срочное → George |
| **Place Ops** | технический надзор: TG Bridge, Help Bot, Tuya, LINE, Apps Script; утренний бриф George (будни 11:15); ночное чтение Tuya 00:00 |
| **Place Accounting** | ежедневный экспорт Loyverse (~21:41), приём чеков (~17:56), недельная сводка пт 17:07, **пакет для Pat до 7-го**, ваучеры, WHT, T/B-инвойсы |
| **Place Marketing** | каталоги/листинги, недельный отчёт George (пн 10:24), «Откуда пришёл» |
| **Place SMM** | контент-план, подписи, хуки пн/чт 08:31, флаер расписания по воскресеньям, Postiz только после OK |
| **Place Partners** | партнёрский батч для Tangmo (10:04), бартер, B2B-рефералы |
| **Place Site** | контент сайта, ТЗ, только черновики до OK |
| **Ревизор** | аудит работы ботов против канона, чт 23:21, отчёт George |

Правило для всех: **draft → OK George → публикация**. Боты работают на общем «боксе» (Linux-машина Grok Bot), там же скрипты и сессии браузера.

## 5. Системы (подробно — SYSTEMS-INVENTORY)

- **Google Workspace info@placecoworking.com** — почта, Drive, все таблицы. Ключевые: Resident info `1Rzz9CKQYHwgZ8BPtrTxxUwFdphphSivSJkkTwFC8wo4`, Schedule 26 (копия info@) `1Al1hV_BXUSS3S7qezTr4ah0FWxAAvWYrZuhorPoTgeU`, Place Inbox `1uMHYp6d-Ji9VQj5xtESiXummBNX9bC8vTruPRQLs8jw` (вкладки queue, orders, **Payments**, LINE…), Events and booking `1BSwm4sY-ksXjFNEEsAdyiWmUDzgbQlJpL_dh9JIdZAc`.
- **Apps Script «Place TG Bridge»** (под info@, бот @PlaceLeadBot): `poll()` каждую минуту, `renewalsDaily` 10:15, StaffCommands, Tuya, LINE webhook. Исходники: [`tools/apps-script/`](../../tools/apps-script/). Токены — в Script Properties проекта.
- **Telegram**: @PlaceLeadBot; группы PLACE Team (персонал + заказы кафе), Payments Place (чеки/платежи), «Тех вопросы» (поломки), PlaceCo; канал @coworking_place_phuket.
- **LINE OA @294bqkju** — канал с бухгалтером Pat; webhook → Place Inbox «LINE».
- **Loyverse** — POS кафе и пассов; токен API на боксе; цены меняет человек.
- **Tuya / Smart Life** — свет, AC, душ 4 этажа, розетки подкаста; управление командами в @PlaceLeadBot.
- **Google Ads** CID 487-476-0915; **Google Business Profile** (адрес в профиле надо исправить на 83130); **Google Search Console/Analytics**.
- **Сайт placecoworking.com** — Tilda (аккаунт info@, тариф Business); новый сайт делает **друг-разработчик George, у него админка и DNS/регистратор** — уточнить у него и записать, кто владелец домена. При переносе DNS не трогать MX/SPF/DKIM почты.
- **Каталоги**: Deskimo, Office Hub, coworker.com, LiquidSpace, Tripadvisor, Foursquare, Bing Places, Apple Maps и др. — статус в `/workspace/directories` (бокс) и [`docs/ops/directories`](../ops/directories/).
- **Postiz** (планировщик соцсетей, info@), **Canva**, **Teamly**.

## 6. Регулярные платежи и сроки

| Что | Когда | Сумма (ориентир) | Кто платит |
|---|---|---|---|
| Электричество PEA | 15-го (по листу Aiz срок 8-го) | 43–57 тыс. ฿ | Khun Sak |
| Вода | до 20-го | 0,9–1,5 тыс. ฿ | счёт Лене |
| Интернет 3BB, 4 линии (…4751, …4746, …7174, …7790) | 8, 8, 12, 28 числа | ≈1,5–1,9 тыс. ฿ каждая | George |
| Билборд/вывеска | 5-го | 5 000 ฿ | George |
| Аренда принтера | 10-го | 2 675 ฿ | Лена |
| Dtac (рабочий телефон) | 1-го | 300–400 ฿ | админ |
| Secom (тревожная кнопка) | 1.02 и 1.07 | 24 396 ฿ за платёж | Лена |
| Вывоз мусора, муниципалитет Чалонг | ноябрь, раз в год | 7 200 ฿ | Sak, Лена |
| Зарплата + SSO (до 15-го след. месяца), PND1 (до 7-го / 15-го онлайн) | ежемесячно; табель 28-го | — | Pat + George |
| Пакет документов для Pat | до 7-го | — | Place Accounting → Лена |
| Tilda, Google Ads, Postiz, Loyverse | по подписке | — | карта George (проверить в info@) |
| Конец договоров принтер и билборд | **27.02.2027** | — | George, Лена |
| Аренда здания | **нет данных** — уточнить у George/Sak | | |

Источник: `docs/ops/handover/payment-reminders.gs`, [`docs/ops/OPEN-PAYMENTS.md`](../ops/OPEN-PAYMENTS.md).

## 7. Открытые задачи (на 16.10.2026)

- **01.11 смена цены дня 400 → 500** и 10 дней 2 500 → 3 500: Loyverse, сайт, листовки (руками).
- Бухгалтерия: ответы Pat по префиксам T/B, реквизиты клиентов для T-инвойсов, депозиты 25 000 и 33 000, e-Tax Makro — [`docs/bots/accounting/OPEN.md`](../bots/accounting/OPEN.md).
- Renewals v2 и StaffCommands v2 — в ветке `bot-optimize-2026-10-11` есть 5 коммитов не в main (не задеплоено); решить, мержить ли.
- Payments Place → Drive + вкладка Payments (последний коммит в main) — проверить, что живёт.
- Tuya: квота API, air3; какие розетки = какие AC.
- Help Bot (клиентский TG-бот) — черновик, не запущен.
- Google Business: индекс 83000 → 83130; Deskimo/Office Hub — публикация после OK George.
- Новый сайт: доступы к домену/DNS у друга-разработчика — зафиксировать.
- Аренда здания, арендодатель, электрик, сантехник, больница — пустые места в EMERGENCY-CONTACTS.
- Все открытые задачи ботов: `docs/bots/*/OPEN.md`.

## 8. Первые 7 дней преемника

1. **День 1.** Получить доступ к **info@placecoworking.com** (через George/семью; пароли — в Google-таблицах «Access» и «passwords» на Drive info@, доступ у George). Сделать GitHub-репо **private** и сменить пароли от ключевых аккаунтов.
2. Познакомиться с Леной (менеджер) и Khun Sak (тайская компания, коммуналка, деньги из сейфа). Убедиться, что админы знают: смены и касса идут как обычно.
3. Прочитать `CANON.md` и этот README; открыть Resident info и Schedule 26 — кто сейчас живёт, у кого какие сроки, кто на смене.
4. Проверить деньги: Loyverse (выручка), Payments Place (TG), банк (через Sak/George), [`OPEN-PAYMENTS`](../ops/OPEN-PAYMENTS.md); заплатить всё, что в таблице §6 со сроком на ближайшую неделю.
5. Проверить, что живы автоматизации: в Apps Script «Place TG Bridge» → Triggers есть `poll` (1 мин) и `renewalsDaily`; в Place Inbox `queue` появляются новые строки.
6. Связаться с Pat (LINE OA @294bqkju) — кто теперь подписывает и платит зарплату/SSO; со Сашей/Никитой — сеть, камеры, Tuya, бокс ботов; с другом-разработчиком — сайт и домен.
7. Пройти `docs/ops/handover/CHECKLISTS-OPEN-CLOSE.md` с админами, проверить офисных арендаторов (договоры, депозиты, продления) и решить, кто даёт OK вместо George.

---

## EN summary

Place Coworking Phuket, 59/2 Chao Fah Tawan Tok Rd, Chalong (83130), open daily 08:00–23:00. Products: Place Pass (floors 1+3), Offices (floors 5 & 2), Podcast room.
Prices and rules live only in `CANON.md` and `docs/canon/`. Team (Oct 2026): admins Tangmo, Nathaly, Fon; kitchen Kate, Sun; technician Som; cleaners Wawa, Tuay;
Lena = on-site manager/finance contact; accountant Pat via LINE OA @294bqkju; Sasha & Nikita = tech; Khun Sak = Thai company director (utilities, cash).
Eight Grok Bot agents (Lead, Ops, Accounting, Marketing, SMM, Partners, Site, Revizor) run routines — see `docs/bots/`. Everything runs on Google Workspace
info@placecoworking.com: key Sheets, the Apps Script project «Place TG Bridge» (@PlaceLeadBot, `poll` every minute, renewals 10:15), Telegram groups, LINE OA, Loyverse POS,
Tuya smart devices, Google Ads/Business, Tilda site (new site + DNS held by George's developer friend), Deskimo/Office Hub/other directories.
Script backups are in `tools/`. **The repo is public**, so no data exports, secrets, or personal details are stored here; credentials are in the «Access»/«passwords» sheets on info@ Drive (George).
Day one for a successor: secure info@, make the repo private, meet Lena and Khun Sak, check money and recurring bills (§6), confirm the triggers still run.
