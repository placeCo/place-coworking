# Workflow маркетинга (календарь → publish)

**Календарь SMM:** https://docs.google.com/spreadsheets/d/1YjIN-j7jw_i-rCRdF_Xfpq2AD-ZIxKV1qAobmQH8ds8/  
Вкладки: **Календарь**, **Октябрь**, **Справочник**.  
Старый мини-план не трогаем: https://docs.google.com/spreadsheets/d/1DlwrWNqvf5KrpfQGOLS-LMY0NsXlyAbWQMjZ4yaVMO8/

**Postiz / Meta:** на паузе, пока октябрьские слоты не доведены до «Готово» и пока George не сделает Meta login (`info@`). До этого — только календарь + Canva, без live-публикации через Postiz.

Цены и этажи — только из `CANON.md`. Бриф: `templates/BRIEF-SMM.md`. Слот: `templates/POST-SLOT.md`.

---

## Пайплайн (end-to-end)

```
idea → строка в календаре → brief → Canva/media
  → статус «Готово» → OK George
  → Postiz draft (когда Meta+календарь готовы)
  → OK George → publish
```

---

## Состояния слота

| Состояние | Кто двигает | Что есть |
|-----------|-------------|----------|
| Идея / пусто | Bot или George / SMM | тема, канал, дата-черновик |
| Бриф готов | Bot → SMM | `BRIEF-SMM` заполнен |
| В работе | SMM | Canva + текст пишутся |
| Текст+медиа | SMM | черновик в ячейках календаря |
| **Готово** | SMM | текст + Canva/media в слоте; можно отдавать George |
| OK George (контент) | George | можно готовить Postiz draft |
| Postiz draft | Bot/SMM после OK | черновик в Postiz, **не** schedule live |
| OK George (publish) | George | разрешена публикация |
| Опубликовано | SMM / Postiz после OK | факт в календаре |
| Заблок. | любой | лейбл `blocked` / причина в issue |

---

## Кто за что отвечает на шаге

1. **Idea** — Bot предлагает структуру/темы по канону; George может задать приоритет.
2. **Calendar row** — Bot или SMM создаёт/уточняет строку (дата, канал, рубрика).
3. **Brief** — Bot заполняет `templates/BRIEF-SMM.md` → передаёт @dftnsss.
4. **Canva** — SMM; при нужде фото — Nikita @rufasstyle.
5. **«Готово»** — SMM ставит в листе (текст + ссылка/файл медиа).
6. **George OK (контент)** — George смотрит слот/батч; без OK → Postiz не трогаем.
7. **Postiz draft** — только после OK и после Meta login; drafts only, без автопоста.
8. **George OK (publish)** — явное разрешение на выход в IG/TG.
9. **Publish** — SMM или Postiz по OK; факт фиксируется в календаре.

---

## Что никогда без OK George

- Живая публикация IG/TG/сайта/листингов (Deskimo и др.).
- Смена цен / канона / публичных офферов.
- Meta login / подключение Postiz к аккаунтам.
- Отправка исходящих от имени Place в Telegram (см. `TG-OUTBOUND.md`) — бот только после OK.
- Правки «боевых» Sheets (Resident info, Прайс и т.п.) — режим collect/draft.
- Включение schedule/autopost в Postiz.

---

## Согласованный приоритет сейчас

1. Заполнить календарь (октябрь) до **«Готово»** — текст + Canva/media.  
2. Meta/IG login `info@` + решение по Postiz (только drafts).  
3. Затем Postiz drafts → OK → publish.

До выполнения п.1–2 Postiz/Meta **не live**.

---

## Связанные файлы

- Роли: `docs/ops/ROLES.md`
- Источники: `docs/ops/SOURCES.md`
- TG: `docs/ops/TG-OUTBOUND.md`
- Шаблоны: `templates/`
- Канон: `CANON.md`
