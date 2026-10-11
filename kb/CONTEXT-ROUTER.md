# CONTEXT-ROUTER — context loading order

**Single source of rules for bots.** Read this before any task.

## Loading priority (light to heavy)

1. **`kb/contexts/CORE.en.md`** — default for most tasks (ultra-short)
2. Other `kb/contexts/*.en.md` — only if CORE is not enough
3. Russian versions in `kb/contexts/` — only if English is missing
4. **`canon.json`** — if structure is needed
5. **`CANON.md`** — only if previous is insufficient or contradicts
6. Everything else (`docs/`, inbox, old drafts) — **NEVER as source of truth**

## Loading table by task

| Task | Load first | Extra only if needed |
|---|---|---|
| Most tasks / general | `kb/contexts/CORE.en.md` | — |
| Detailed prices / hours | `CORE.en.md` + `prices-hours.en.md` | `canon.json` |
| Ban-list / what not to sell | `CORE.en.md` + `products-ban.en.md` | — |
| Reception answers | `CORE.en.md` + `reception-short.en.md` | — |
| Complex post / TZ | `CORE.en.md` + `products-ban.en.md` + `bot-rules.en.md` | `CANON.md` |
| Any new task | `CORE.en.md` | specific `.en.md` |

## NEVER LOAD as source

- Old drafts (PR #7–9, anything before 09.10)
- Full `docs/` unless explicitly needed for a supporting detail
- Inbox, marketing drafts, old SEO notes

## Hard rules

- If anything in `kb/contexts/` contradicts `CANON.md` — `CANON.md` wins, update the lightweight file.
- No fact → `ASSUMPTION` or ask George. Do not invent.
- All new texts = drafts only until explicit OK.

## Quick start

1. Read this file
2. Load `kb/contexts/CORE.en.md`
3. Add one more specific `.en.md` only if the task clearly needs it
4. Work

Updated: 11.10.2026
