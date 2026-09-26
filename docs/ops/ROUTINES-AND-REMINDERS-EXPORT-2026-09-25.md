# Routines + напоминания — экспорт для Pro-бота
**2026-09-25 · Asia/Bangkok (ICT)**  
Новый бот: **восстановить routines один в один** и держать этот список открытых хвостов, пока George не скажет иначе.

---

## A. Актуальное расписание routines (ICT, ежедневно, включая выходные)

| Время | Routine | Что делает |
|-------|---------|------------|
| 10:07 | Place TG morning sales report | Отчёт продаж за вчера Лене в DM через бота, для сверки с кассой |
| 13:00 | Place midday inbox | Только Gmail с label `TG-inbox` и вкладка `queue`; Telegram Web не использовать |
| 23:10 | Place evening wrap-up | Вечерний wrap-up и отчёт продаж George; перенесено с 19:30 |
| Пн/Ср/Пт 10:52 | Place TG social drafts | Черновики TG social |

После вечернего wrap-up сообщения команде в TG отправляются только с **10:00 ICT**. Коворкинг работает по выходным, поэтому расписание выше — ежедневно. Apps Script reminder watch — **на паузе**.


## B. Что George не должен помнить сам (бот напоминает)

### Ежедневно / по расписанию
- [ ] 10:07 — утренний отчёт продаж за вчера Лене через бота
- [ ] 13:00 — midday inbox: только Gmail `TG-inbox` + queue, без Telegram Web
- [ ] 23:10 — вечерний wrap-up и отчёт продаж George
- [ ] Пн/Ср/Пт — SMM слоты / блокеры Алене
- [ ] Apps Script reminder watch — на паузе

### Открытый фронт на 25 Sep (пока не закрыто)
| ID | Хвост | Кто | Срок | Статус |
|----|-------|-----|------|--------|
| O1 | Room 3 Renat vs Igor | Lena ← lead шлёт 10:00 | 25 Sep | open |
| O2 | Контакты Surkov/Stukalov/Goldman room13 | Ресепшен | 26 Sep | open |
| O3 | Booking plan → **архив (A)** | Place Ops + lead | 26 Sep | decide→A |
| O4 | Apps Script renewals после fail 24 Sep | Place Ops | 25–26 | watch |
| O5 | Deskimo фото | Алена + Никита | — | blocked |
| O6 | Deskimo Wi‑Fi + банк | Lena | — | open |
| O7 | Прайс Sheet ≠ канон Pass | George/lead | — | open |
| S1 | Sep-01 карусель: 4–6 фото переговорки | Алена | — | blocked |
| S2 | Sep-06 прайс-карточка (канон, без 5ч@150) | Алена/Canva | — | caption ready |
| S3 | Sep-08 reel 3 эт. 15–30с | продакшн | — | open |
| S4 | Октябрь 10 слотов = «Идея» → медиа после фото | SMM | — | wait photos |
| D1 | Deskimo listing draft → publish только OK George | Ops | — | draft |
| W1 | Site `docs/site/` готов; **CMS не трогать** | Site | — | wait OK |
| T1 | Teamly brief Mon 28 Sep; delegation broken → Coordinator solo | Teamly | 28 Sep | waiting |
| M1 | Meta/Postiz — paused до календаря + Meta login | lead | — | paused |
| G1 | Pro-аккаунт: импорт Place Lead + логины info@/TG/gh | George | ASAP | in progress |

### Правила, которые бот обязан напоминать при сомнении
1. Не publish live (сайт/IG/TG public/цены/Deskimo) без OK George.  
2. Не 5ч@150 в публичном прайсе.  
3. Витрина всегда Pass 1+3 / Offices 2+5 / Studio 4.  
4. info@ только; не mangmuang для Place.  
5. Не 1Password.  
6. Literacy check перед любым TG send.  
7. Lead один отчитывается в Place Ops room.

---

## C. Тексты / артефакты уже готовы (не выдумывать заново)

- Текст Лене room 3: `kb/inbox/ops-queue-draft-2026-09-25.md`
- Thai as-is: `kb/inbox/thai-team-ops-as-is-2026-09-25.md`
- Deskimo draft: `kb/inbox/deskimo-listing-draft-2026-09-25.md`
- Site pack: `docs/site/`
- SMM calendar: https://docs.google.com/spreadsheets/d/1YjIN-j7jw_i-rCRdF_Xfpq2AD-ZIxKV1qAobmQH8ds8/
- Migration TZ: `docs/ops/MIGRATION-TZ-PRO-ACCOUNT-2026-09-25.md`
- START-HERE: `docs/ops/START-HERE-PRO-ACCOUNT.md`
- Chat archive: `kb/archive/chat-history-2026-09-25/`

---

## D. Команда ботов (воссоздать на Pro)

| Агент | Мандат |
|-------|--------|
| Place Lead (этот) | ведёт, один отчёт George |
| Place SMM | календарь, брифы @dftnsss, Canva, Postiz drafts |
| Place Site | site drafts / 6 red / NAP — CMS only после OK |
| Place Ops | Deskimo/Sheets/renewals/events drafts |
| Room Place Ops | отчёты сюда |

---

## E. Сообщение новому боту про напоминания

```
Восстанови все routines из docs/ops/ROUTINES-AND-REMINDERS-EXPORT-2026-09-25.md
и веди ops-queue O1–O7 + S/D/W/T/M хвосты. Напоминай мне дедлайны сам —
я не хочу ничего держать в голове. Контакт с тайцами только 10:00–22:00 ICT.
```
