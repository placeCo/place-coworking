# BOT-START — точка входа для ботов

**Читай это первым.** Затем грузи только нужные лёгкие контексты.

## 0. Экономия токенов (главное)

Для большинства задач **не грузи весь `CANON.md`**.

Используй папку `kb/contexts/`:

| Задача | Грузи этот файл |
|---|---|
| Цены / часы | `kb/contexts/prices-hours.md` |
| Что можно/нельзя писать | `kb/contexts/products-ban.md` |
| Контакты / адрес | `kb/contexts/contacts.md` |
| Правила бота | `kb/contexts/bot-rules.md` |
| Ответы ресепшена | `kb/contexts/reception-short.md` |
| Индекс | `kb/contexts/README.md` |

**Порядок:**
1. Нужные файлы из `kb/contexts/`
2. `canon.json` (если нужна структура)
3. Только если не хватает — `CANON.md`

## 1. Источник правды (иерархия)

1. **`CANON.md`** — единственная операционная правда. Binding.
2. `canon.json` — machine-readable выжимка. Если противоречит `CANON.md` — побеждает `CANON.md`.
3. `kb/contexts/*` — лёгкие выжимки для экономии токенов.
4. Всё остальное — supporting. Если противоречит канону — канон побеждает.
5. Нет факта → `ASSUMPTION` или спроси George.

## 2. Текущий канон (кратко)

См. `kb/contexts/prices-hours.md` и `kb/contexts/products-ban.md`.

## 3. Что бот делает / не делает

См. `kb/contexts/bot-rules.md`.

## 4. Быстрые ссылки

| Что нужно | Куда |
|---|---|
| Лёгкие контексты | `kb/contexts/` |
| Machine-readable | `canon.json` |
| Полный канон | `CANON.md` |
| Решения | `docs/canon/DECISIONS-LOG.md` |
| Скрипт ресепшена | `docs/reception/RECEPTION-SCRIPT.md` |
| Боты (черновики) | `docs/ops/bots/README.md` |

## 5. Чеклист перед коммитом

- [ ] Использовал лёгкие контексты из `kb/contexts/`, а не весь CANON
- [ ] Не нарушил ban-list
- [ ] Не выдумал цены / загрузку / свободность офиса
- [ ] Новые файлы помечены как DRAFT, если это не канон
- [ ] Не добавил секретов

## 6. Статус на 11.10.2026

- Все скрипты в `docs/ops/bots/` — drafts, не deployed.
- Draft-PR #7–9 — устарели.
- Сайт-макет: репо `place-coworking-site`.

Если сомневаешься — спроси George или пометь ASSUMPTION.
