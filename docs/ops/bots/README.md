# PLACE bots — scripted automation (drafts)

**Status on 11.10.2026:** Все скрипты ниже — **DRAFT**. Ничего не deployed. Требует явного OK George перед установкой в Apps Script.

Canon: `CANON.md` + `docs/canon/DECISIONS-LOG.md`. Старт для ботов: `kb/BOT-START.md`.

## Файлы

| Path | Status | What |
| --- | --- | --- |
| `help-bot/HelpBot.gs` | DRAFT | Client Telegram bot (EN/RU/TH menu, keywords, log to Inbox `help-bot`) |
| `help-bot/INSTALL.md` | DRAFT | install steps |
| `staff-bot/StaffCommands.gs` | DRAFT | Staff phrases (RU/EN/TH) + slash commands + bookings |
| `staff-bot/HOOK.md` | DRAFT | hook for live Code.gs |
| `staff-bot/STAFF-COMMANDS.md` | DRAFT | phrase list |
| `staff-bot/test_staff.js` | DRAFT | offline tests |
| `instagram/AUTOREPLIES.md` | DRAFT | Meta instant replies + saved replies |

No secrets in any file. Tokens only in Script Properties.

## Open questions for George (still open)

1. **Meeting rooms.** Боты говорят «существуют, резидентам −20%, цена/бронь через WhatsApp» без цены. Ок или убрать упоминание?
2. **Google Maps link.** В ботах `https://maps.app.goo.gl/pgJ5eHhoCJmf1YEH6` (GBP показывает 83000 — запрещёно в каноне). Подтвердить или скрыть.
3. **Help-bot handoffs.** Кто читает `status=new` в вкладке `help-bot`? Нужно ли будить Ops?
4. **/ac и /light.** Какие розетки/Tuya соответствуют комнатам? Кто может их использовать?
5. **/bookings.** Нужен ли `bookings-today.gs` в живом бридже? Актуальны ли сетки?
6. **Instagram /free reply.** Ок ли фраза «нет free days по умолчанию»?
7. **Thai texts.** Нужна вычитка тайским админом перед go-live.

## Как работать с этими файлами (для ботов)

- Не копируй цены и формулировки из скриптов — бери из `CANON.md`.
- Если меняешь скрипт — пиши черновик и пометь `DRAFT · needs George OK`.
- Секреты не добавляй.
