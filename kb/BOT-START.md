# BOT-START — entry point for bots

**Read this first.** Then immediately `kb/CONTEXT-ROUTER.md`.

## Loading order (strict)

1. **`kb/CONTEXT-ROUTER.md`** — main loading rules
2. **`kb/contexts/MINIMAL.en.md`** — for general tasks (absolute minimum, English preferred)
3. Specific `.en.md` files from `kb/contexts/` according to the router table
4. `canon.json` — only if structure is needed
5. `CANON.md` — only if everything above is not enough

## Truth hierarchy

1. `CANON.md` — binding source of truth
2. `canon.json` and `kb/contexts/*` — extracts. Contradiction → CANON.md wins
3. Everything else — supporting

## Quick links

- Router: `kb/CONTEXT-ROUTER.md`
- Minimum: `kb/contexts/MINIMAL.en.md`
- Lightweight: `kb/contexts/*.en.md`
- JSON: `canon.json`
- Full: `CANON.md`

## Checklist

- [ ] Read the router
- [ ] Loaded only the minimum needed (prefer `.en.md`)
- [ ] Did not violate the ban-list
- [ ] Did not invent facts
- [ ] New files = DRAFT

If in doubt — ask George or mark ASSUMPTION.
