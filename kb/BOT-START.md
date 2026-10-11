# BOT-START — entry point for bots

**Read this first.** Then `kb/CONTEXT-ROUTER.md`.

## Default load (most tasks)

1. `kb/CONTEXT-ROUTER.md`
2. **`kb/contexts/CORE.en.md`** ← start here for almost everything
3. Add one specific `.en.md` only if needed
4. `canon.json` — only for structure
5. `CANON.md` — last resort

## Truth hierarchy

1. `CANON.md` — binding
2. `canon.json` + `kb/contexts/*` — extracts
3. Everything else — supporting only

## Quick links

- Router: `kb/CONTEXT-ROUTER.md`
- Default context: `kb/contexts/CORE.en.md`
- Other light: `kb/contexts/*.en.md`
- JSON: `canon.json`
- Full: `CANON.md`

## Checklist

- [ ] Loaded `CORE.en.md` first
- [ ] Did not load extra files without need
- [ ] Did not violate ban-list
- [ ] New files = DRAFT

If in doubt — ask George or mark ASSUMPTION.
