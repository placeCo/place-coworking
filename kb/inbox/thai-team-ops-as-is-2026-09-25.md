# As-is: тайская команда — брони / задачи (черновик)
**2026-09-25 · Place Ops · DRAFT — без внедрения, без писем команде до «го» George**

## Где сейчас живут брони

| Что | Где | Кто смотрит | Статус |
|-----|-----|-------------|--------|
| Резиденты / Pass / офисы / даты | **Resident info** Sheet | Ресепшен + George | LIVE, но дыры: двойная room 3 (5 эт.), нет контактов части выездов, Office rent tab пуст |
| Столы open space | Resident → **Booking plan** | Ресепшен? | **Протух** (май–авг) — не источник правды |
| Переговорки / ивенты / ART / этажи | **Events and booking** | Ресепшен / менеджер | LIVE сетка; нет revenue rollup; вкладка 6 floor vs канон «крыша не коворкинг» |
| Studio 4 | TG → менеджер (не self-book) | Менеджер | Вне Sheets |
| Смены ресепшена/кухни/теха | **Schedule 26** | Ops Manager (Aiz) + Admin | LIVE coverage; дыры leave / night vs продукт 24/7 |
| Продления «концы абонементов» | Apps Script → email | Авто + George | Ломалось 24 Sep (`Invalid email`); патч pending next trigger |
| Walk-in / ad-hoc | TG + устный ресепшен | Admin смены | Нет единого трекера задач |

## Кто / что / где смотрим (одна схема)

```
Гость/бронь
  ├─ Pass / офис / даты     → Resident info      → владелец дня: Admin на смене (Schedule 26)
  ├─ Переговорка / ивент    → Events and booking → Admin / менеджер
  ├─ Studio                 → менеджер (TG)      → не ресепшен «как стол»
  └─ Смена / кто на стойке  → Schedule 26        → Aiz (OM)

Хвосты без владельца сейчас:
  • Room 3 Renat vs Igor     → спросить Лену (OK George, пт 10:00)
  • Контакты Surkov/Stukalov/Goldman room13
  • Booking plan протух      → архив или обновление (решение George)
  • Apps Script renewals     → мониторинг следующего триггера
  • Wi‑Fi / банк (Deskimo)   → Lena
```

## Что ломается чаще всего (по канону/инвентарю)

1. **Двойные/грязные записи в Resident** (room 3) — ресепшен не знает, кто сидит.  
2. **Прайс Sheet неполный** vs канон Pass — риск продажи не с той вилки.  
3. **Booking plan мёртвый** — брони столов уходят в TG/голову.  
4. **Apps Script renewals** — фейлы email → пропуск продлений.  
5. **Coverage gaps** (leave) → walk-in без владельца на стойке до 23:00.  
6. **Нет единого task board** для тайской команды — задачи в TG, без статуса/владельца.

## Черновик простой целевой схемы (не внедрять)

| Слой | Один source of truth | Владелец дня | Эскалация |
|------|----------------------|--------------|-----------|
| Occupancy / renewals | Resident info only | Admin смены | Lena / George |
| Meeting / events | Events and booking only | Admin / менеджер | George |
| Смены | Schedule 26 | Aiz | George |
| Хвосты (1 строка = 1 задача) | один короткий TG-тред или Sheet «Ops queue» | кто назначен | Lena |

Правило: **не** плодить второй прайс; ресепшен только `RECEPTION-SCRIPT` + канон.

## Next (после «го» George)

1. Сверка room 3 с Леной.  
2. Архивировать Booking plan или обновить.  
3. Один ops-queue формат (владелец / дедлайн / статус).  
4. Не писать команде до явного OK.
