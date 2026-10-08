# facts/ops-sources.md — Live occupancy / sales sources
**Sources:** `../SHEETS-INVENTORY-2026-09-23.md`; canon §6 sales slice; Gmail signals (info@). Read-only unless George asks write.

## Google Sheets (MCP `user-Google-sheets` — connected)
| Sheet | Spreadsheet ID | Holds |
|-------|----------------|-------|
| **Resident info** | `1Rzz9CKQYHwgZ8BPtrTxxUwFdphphSivSJkkTwFC8wo4` | Main registry by floor: Name / Type of pass / Floor access / Start–Finish / Contact / extend notes. **Primary occupancy signal.** Tab “Office rent” empty; “Booking plan” stale (May–Aug). Floor-5 section uses ROOM/PRICE |
| **Events and booking** | `1BSwm4sY-ksXjFNEEsAdyiWmUDzgbQlJpL_dh9JIdZAc` | Room/event grids (Meeting, Library, 1/3/4 floors, ART, Workshop, office rooms, **6 floor/roof**). Meeting cells show 200–250/h; studio manager rates |
| **Schedule 26** | `1eQTyAIjlnGlyYy_5FDfDOAbT5NXaAeYAR_QPnWWBrZc` | Staff shifts 2026 (coverage, not guest revenue). Admin windows align 08–23; night coverage in Sep sample unclear |
| **Прайс** | `1qsNXnSPjfNqZh2oonrILFA8T6X1ODSj1oZPYGP80d9E` | Offices floor 5 (30k/20k yearly) + meeting 250/h + headcount office grid — **no Pass ladder** |

### Inventory mismatches to remember (do not “fix” without approve)
- Resident history still has floor-1/2 as Pass desks + “10 days flex”
- Прайс incomplete for Pass — reception must use **CANON**, not Прайс, for Pass
- ~~Possible double-book Office room 3 (Renat vs Igor) — ops risk~~ **CLOSED** — not a double booking: Renat rents three rooms (George 07.10.2026)
- Meeting cells sometimes <250 without “resident −20%” label

## Canon short-tail sales (old prices)
20 Jul–20 Sep 2026: see `facts/canon.md` § short-tail. No week/month/office/studio in that export.

## Gmail / other ops signals (evidence, not publish rights)
| Signal | Evidence | Role |
|--------|----------|------|
| **Loyverse** | Daily low-stock + invoices to info@ (Sep 2026) | Café/POS stock & sales |
| **Tilda forms** | Error mails (Webhook / historically AmoCRM) | Site lead capture |
| **amoCRM** | `infoplacecoworkingcom.amocrm.ru` — paid sub ended; renew nag Jan 2026; Tilda→Amo errors Feb 2025 | CRM **stale / unpaid** |
| **Google Ads** | CID **487-476-0915**; payments & suspension notices 2026 | Paid search/performance |
| Thai sales Excel | Ops BCC info@ (e.g. Jun 2026 report) | Ad-hoc, not durable system |

## Drive / Docs / Calendar
MCP connected — briefs & inventories; **Resident info** sheet remains occupancy SoT.
