# BOT-LOAD — how to start any task (zero search)

**Read this once per session. Then stop looking.**

## Always load first (in this order)

1. `kb/contexts/CORE.en.md` — prices, hours, ban, contacts, rule
2. Your role’s `docs/bots/<role>/ROLE-CORE.md`

## Only then, if the task clearly needs it

- Specific `kb/contexts/*.en.md` (prices-hours, products-ban, etc.)
- `canon.json`
- Full `ROLE.md` of your role
- `CANON.md`

## MEMORY.md — almost never

**Do not load `MEMORY.md` by default.** Especially:
- `docs/bots/smm/MEMORY.md` (~32 KB)
- `docs/bots/accounting/MEMORY.md` (~30 KB)

Load MEMORY.md only if George explicitly asks or the task is impossible without a specific fact that lives only there. In all other cases skip it.

## Heavy / high-token tasks

If the task is complex and will clearly burn a lot of limits:
- Do **not** try to finish everything in one run.
- Write a detailed TZ to `docs/drafts/tz/` (see README there).
- Mark it `DRAFT · needs George + Grok`.
- Stop and wait.

## Never do

- Do not search the whole repo for prices or rules
- Do not load old drafts, inbox, or full `docs/` by default
- Do not load other bots’ MEMORY.md
- Do not invent facts — use ASSUMPTION or ask George

Updated: 12.10.2026
