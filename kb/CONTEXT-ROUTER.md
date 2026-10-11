# CONTEXT-ROUTER — context loading order

**Single source of rules for bots.** Read this before any task.

## Loading priority (light to heavy)

1. **`kb/contexts/*.en.md`** — prefer English versions (lower token cost)
2. **`kb/contexts/`** (Russian) — only if English version is missing
3. **`canon.json`** — if structure / machine parsing is needed
4. **`CANON.md`** — only if the above is not enough or there is a contradiction
5. Everything else (`docs/`, inbox, old drafts) — supporting only, never as source of truth

## Loading table by task

| Task | Minimal set (prefer .en.md) | Extra if needed |
|---|---|---|
| Prices, hours, Pass/Office | `kb/contexts/prices-hours.en.md` | `canon.json` |
| What is allowed/forbidden, ban-list | `kb/contexts/products-ban.en.md` | `bot-rules.en.md` |
| Contacts, address, CTA | `kb/contexts/contacts.en.md` | — |
| Guest / reception answer | `reception-short.en.md` + `prices-hours.en.md` | `bot-rules.en.md` |
| Post / text / spec | `prices-hours.en.md` + `products-ban.en.md` + `bot-rules.en.md` | `CANON.md` only if complex |
| Any new task | `kb/contexts/bot-rules.en.md` + needed from table | — |

## Hard rules

- Never load old drafts (PR #7–9, files before 09.10) as a source.
- If a file in `kb/contexts/` contradicts `CANON.md` — `CANON.md` wins and the lightweight file must be updated.
- No fact → `ASSUMPTION` or ask George. Do not invent.
- All new texts are drafts only until explicit OK.

## Quick start for a new session

1. Read this file
2. Identify the task
3. Load only the indicated `.en.md` files
4. Work

Updated: 11.10.2026
