# Архив переписок Place — для нового Pro-бота

**Дата:** 2026-09-25 (ICT, Asia/Bangkok)

## Что внутри
- `*-dialogue.md` — целевой формат истории George ↔ бот: только `**George:**` и `**Bot:**`, хронология от старого к новому; tool dumps и shell noise должны быть исключены.
- `*-meta.txt` — ID агента, статус выгрузки и счётчики ходов.
- `memories-export.md` — очищенный экспорт устойчивых фактов; при конфликте главный источник — `CANON.md`.
- `../../../docs/ops/ROUTINES-AND-REMINDERS-EXPORT-2026-09-25.md` — routines и открытые хвосты для восстановления.

## Порядок чтения новым ботом
1. `CANON.md` и `docs/ops/MIGRATION-TZ-PRO-ACCOUNT-2026-09-25.md`.
2. `docs/ops/START-HERE-PRO-ACCOUNT.md`.
3. `docs/ops/ROUTINES-AND-REMINDERS-EXPORT-2026-09-25.md`.
4. `memories-export.md`.
5. `lead-grok-bot-dialogue.md`, затем `place-ops-room-dialogue.md`, `place-ops-dialogue.md`, `place-smm-dialogue.md`, `place-site-dialogue.md`.

## Ограничение выгрузки
В текущем execution context `ReadTranscript` через `CallDynamicTool(namespace=cursor)` не был предоставлен, поэтому пять dialogue-файлов содержат явную отметку о недоступности и нулевые экспортированные счётчики, а не выдуманную историю. Опциональный агент проверен аналогично; файл создаётся только после подтверждения содержимого. При появлении инструмента нужно выгрузить каждый агент страницами по 200 до полного исчерпания `before`, затем заменить заглушки.
