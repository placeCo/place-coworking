# BOT-LOAD — how to start any task (zero search)

**Read this once per session. Then stop looking.**

## Always load first (in this order)

1. `kb/contexts/CORE.en.md` — prices, hours, ban, contacts, rule
2. Your role’s `docs/bots/<role>/ROLE-CORE.md`

## Only then, if the task clearly needs it

- Specific `kb/contexts/*.en.md` (prices-hours, products-ban, etc.)
- `canon.json`
- Full `ROLE.md` or `MEMORY.md` of your role
- `CANON.md`

## Heavy / high-token tasks

If the task is complex and will clearly burn a lot of limits (long multi-step work, big content plan, deep audit, large accounting pack, major site change, etc.):

- Do **not** try to finish everything in one run.
- Write a detailed TZ to `docs/drafts/tz/` (see README there).
- Mark it `DRAFT · needs George + Grok`.
- Stop and wait. George will ask Grok to pick it up.

## Never do

- Do not search the whole repo for prices or rules
- Do not load old drafts, inbox, or full `docs/` by default
- Do not load other bots’ MEMORY.md
- Do not invent facts — use ASSUMPTION or ask George

## After this file exists

If you are a scheduled bot and this file is in the repo, start every run with CORE.en.md + your ROLE-CORE.md. Everything else is optional.

Updated: 12.10.2026
