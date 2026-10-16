# SYSTEMS INVENTORY — Place Coworking (16.10.2026, ICT)

Every account, service, sheet, script, routine and schedule found in the repo, the bot box (`/workspace`, `/tmp/livesrv`, `~/.config/place`), and Drive search on 16.10.2026.
**Repo is PUBLIC** → this file holds only names, IDs and *where* each credential lives. No passwords, tokens, bank numbers or personal phones.
Entry point: [`README.md`](README.md).

Credential locations used below:
- **[Access]** = Google Sheet «Access» `1vaxuIXvUT8JOzgt0Hwr8Lb6l2HEZbaff-OZy6qEBHig` on info@ Drive (owner George).
- **[passwords]** = Google Sheet «passwords» `1Z6-drYawKIGmJMAHsycNTiLFv4QB5gUReb6Hz-bIZDk` on info@ Drive (owner George).
- **[SP]** = Script Properties of the named Apps Script project (Project Settings → Script Properties). Editors of the project = info@.
- **[box]** = file on the Grok Bot box (shared by all Place bots; George logs in on the bot screen). Not in git.
- **[George]** = George logs in himself; no password vault (1Password refused by George).

## 1. Accounts and services

| Service | Account / handle | What for | Credential lives | Who has access |
|---|---|---|---|---|
| Google Workspace / Gmail | info@placecoworking.com | main mail, Drive, Sheets, Apps Script owner | [George]; [Access]/[passwords] | George; bots via connectors |
| GitHub | `placeCo/place-coworking` (**public**) | repo, kb, bot roles, backups | [George]; bots via GitHub connector | George, bots |
| Telegram bot | @PlaceLeadBot | staff bot, bridge, Tuya, renewals | token: [SP] «Place TG Bridge» `TOKEN`; [box] `/home/box/.secrets/place_lead_bot_token` | George, Ops bot |
| Telegram help bot (draft) | new client bot | FAQ for guests (not live) | [SP] «Place Help Bot» `HELP_BOT_TOKEN`; [box] `/home/box/secrets/tg-help-bot.env` | George |
| Telegram account | @coworking_place (admin), channel @coworking_place_phuket | reception TG, public channel | work phone (Dtac) / [George] | admins, George |
| Telegram groups | PLACE Team, Payments Place, «Тех вопросы», PlaceCo | staff+café orders; payments/receipts; breakages; general | membership | team |
| LINE OA | @294bqkju | channel to accountant Pat | access token+secret: [SP] `LINE_CHANNEL_ACCESS_TOKEN`/`LINE_CHANNEL_SECRET`; [box] `/home/box/secrets/line.env` | George, Lead bot |
| Loyverse | Place POS | café + passes sales, stock | API token [box] `/home/box/secrets/loyverse_token`; login [Access] | admins (POS), Lena, George, Accounting bot |
| Tuya / Smart Life | Smart Life app + Tuya Cloud project | floor-4 lights, AC, shower, podcast plugs | Cloud keys [box] `~/.config/place/tuya.env` and [SP] `TUYA_ACCESS_ID/SECRET/ENDPOINT`; app login [box] `/home/box/secrets/smart-life-tuya.txt` | George, Lena, Sasha, Nikita (allow-list in Tuya.gs) |
| Google Ads | CID 487-476-0915 | paid search | info@ [George] | George |
| Google Business Profile | «PLACE COWORKING PHUKET» | Maps listing (fix postcode 83000→83130) | info@ [George] | George |
| Google Search Console / Analytics | placecoworking.com | SEO/analytics | info@ [George] | George |
| Website | placecoworking.com on Tilda (Business plan, account info@) | current site | [George] / [Access] | George |
| New site, domain, DNS | developer friend of George | redesign; holds admin + DNS/registrar | with the developer — **record registrar + owner** | developer, George |
| Deskimo | partner listing | day-pass marketplace | [Access] / [George] | George |
| Office Hub, coworker.com, LiquidSpace, Tripadvisor, Foursquare, Bing Places, Apple Maps, CoworkingCafe, Workfrom, Yelp, Wanderlog | listings | directories | logins in [box] `/home/box/secrets/directories.txt` / info@ | Marketing bot, George |
| Postiz | platform.postiz.com, info@ | social scheduler (Standard) | box browser session; password [George] | SMM bot, George |
| Instagram / Meta Business Suite | @place_coworking_phuket | social, autoreplies | [George] (login blocked from box IP) | George, SMM |
| Canva (2 teams) | info@ | creative | connector / [George] | SMM, Marketing |
| Teamly | agents office | support agents | box browser session | George |
| amoCRM | infoplacecoworkingcom.amocrm.ru | old CRM — **unpaid/stale** | [Access] | — |
| Fingerprint scanner (door) | on-site device | staff/guest access | [box] `/home/box/secrets/fingerprint-scanner.txt` | Lena (database), George |
| Secom | alarm/panic button | security | alarm codes: George / Khun Sak (not written) | George, Sak |
| 3BB internet ×4 lines (…4751, …4746, …7174, …7790) | ISP | internet | account numbers in payment reminders; login [Access] | George |
| Bank (KBank, Thai company) | — | money | **not written anywhere in git**; Khun Sak + George | George, Sak (Lena has no access) |
| Grok Bot box | Linux machine with all bots | runs agents, scripts, browser sessions | George's Grok Bot account | George |

## 2. Google Sheets (Drive search 16.10.2026)

| Sheet | ID | Role |
|---|---|---|
| **Resident info** | `1Rzz9CKQYHwgZ8BPtrTxxUwFdphphSivSJkkTwFC8wo4` | residents/passes/offices registry, keys 24/7 (cols K–M), «Откуда пришёл» — source of truth for occupancy |
| **Schedule 26** (info@ copy 15.10) | `1Al1hV_BXUSS3S7qezTr4ah0FWxAAvWYrZuhorPoTgeU` | staff shifts 2026 (current) |
| Schedule 26 (original) | `1eQTyAIjlnGlyYy_5FDfDOAbT5NXaAeYAR_QPnWWBrZc` | old owner copy |
| Schedule 26 backup 29.09 | `1ZhAMZ3YnSVP6HLgVs1d_zpyacqcZp3_HQVRAYoDZ_FE` | backup |
| **Place Inbox** | `1uMHYp6d-Ji9VQj5xtESiXummBNX9bC8vTruPRQLs8jw` | TG bridge queue, café orders, **Payments** tab, LINE, Tuya log, help-bot |
| **Events and booking** | `1BSwm4sY-ksXjFNEEsAdyiWmUDzgbQlJpL_dh9JIdZAc` | room/event grids (to 31.12.2026) |
| Events and booking backup 29.09 | `1D_vCRUX-KzU8fylXs0tGyVqoKkDeoL1zcOAIWscXRpg` | backup |
| Прайс | `1qsNXnSPjfNqZh2oonrILFA8T6X1ODSj1oZPYGP80d9E` | old office price list — incomplete, use CANON |
| Transaction report 26 | `13SB5CQTgVZKIEl-EPybPQqLMqAjujalcj_PrVOfTI_o` | transactions 2026 |
| sales report 26 | `124ODmUyNxp_ekd4SCOb6-niNNe54Ud_q02GShTrUthk` | sales 2026 |
| Place petty cash 26 | `1QHiiuo5giCdqtI233XmPwo_BVfPylB4x7D3wAhQLV5M` | petty cash |
| Balance | `128BRlM2AxRzPy0NS6vZNe-H8t59yYPdlhCrbY2pUoCk` | balance |
| Tilda Webhook Place Leads | `1_TZXIANy_TcpTW7Sx5RNHn34fIrHHY4P0914L7DPPgc` | site form leads |
| Place Coworking (189528) | `1boiDePnMOaml4tkTOAofaTgPa0NCFQfu45MBMc0GNn0` | (export, purpose unconfirmed) |
| Place SMM — календарь постинга | `1YjIN-j7jw_i-rCRdF_Xfpq2AD-ZIxKV1qAobmQH8ds8` | SMM calendar |
| PLACE Coworking (old mini-plan) | `1DlwrWNqvf5KrpfQGOLS-LMY0NsXlyAbWQMjZ4yaVMO8` | archive, leave alone |
| План, SEO | `1JslEMSo5Ddze0UdiWRn3ZDxC11cjSrSEkvfs_WNXawM` | SEO plan |
| Access | `1vaxuIXvUT8JOzgt0Hwr8Lb6l2HEZbaff-OZy6qEBHig` | **credentials** — never export |
| passwords | `1Z6-drYawKIGmJMAHsycNTiLFv4QB5gUReb6Hz-bIZDk` | **credentials** — never export |
| TEST copies | Resident info TEST `1THjNTF1S0Gu3aHeAD4vxK0Ylcf5BDhTqsL2GMaq8cH4`, Events TEST `1kkVOqLqVMpwpZtYpshx3zvH5_EGJ7wYp69sKJJQw3Rk`, Schedule TEST `13viAmqT1XMQ99twJw-u5AaTtHWSGPki0zzEX7PleYYg`, Place Inbox TEST `1fwjPnLM4JcBH8HnqayWMLdRznU2U7saJX3PQLa9-6GU` | sandbox for «PLACE automations TEST» |

«Payments» is a tab inside Place Inbox, not a separate file. Older inventory: [`docs/ops/SHEETS-INVENTORY-2026-09-23.md`](../ops/SHEETS-INVENTORY-2026-09-23.md).

## 3. Apps Script projects and triggers

| Project | Owner | Files (backup in git) | Triggers / entry points | Script Properties (names only) |
|---|---|---|---|---|
| **Place TG Bridge** | info@ | `tools/apps-script/place-tg-bridge/` Code.gs, StaffCommands.gs, Renewals.gs, Tuya.gs, Line.gs (live sources 16.10 from `/tmp/livesrv`) | `poll` — time-based every 1 min (Telegram getUpdates → info@ label TG-inbox + Place Inbox queue, orders, Payments); `renewalsDaily` — daily 10:15 ICT; `doPost` web app — LINE webhook; Ops wake via `OPS_URL` (≤ once per 15 min, urgent words immediately) | `TOKEN`, `OFFSET`, `OPS_URL`, `OPS_AUTH`, `OPS_BUF`, `OPS_LAST`, `STAFF_IDS`, `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`, `TUYA_ACCESS_ID`, `TUYA_ACCESS_SECRET`, `TUYA_ENDPOINT` |
| **PLACE automations TEST** | info@ | `tools/apps-script/place-automations-test/` (scriptId `1MoGliVK3faV1h78dS8nsN975sO7cQ0U_WbbB_2oya8XtoZGj2wcGZ8wu`) | relay to George+Lena only: job_stage6 09:05, job_coverage 09:10, job_paymentReminders 09:15, job_bookings 10:07, job_issuesMorning 10:07, job_issuesEvening 23:10, job_cashReminder every 3 days 22:30, job_timesheet 28th 09:30, runReminders 09:30 | `TG_TOKEN`, `GEORGE_CHAT_ID`, `LENA_CHAT_ID`, `TECH_CHAT_ID`, `PAY_CHAT_ID` |
| Pass renewal reminder (legacy) | info@ | in Resident info bound script (`checkAndSendReminder`) | daily | — |
| Place Help Bot (draft) | — | `tools/apps-script/place-help-bot/` | `doPost` webhook (not live) | `HELP_BOT_TOKEN`, `WEBHOOK_SECRET` |
| Drafts not deployed | — | `docs/ops/handover/*.gs` (bookings-today, cash-collection, issues-log, keyholders-247, leave-requests, payment-reminders, schedule-coverage, stage5-timesheet, stage6-office-reminders) | — | — |

## 4. Box scripts (backed up in `tools/`, see `tools/README.md`)

| Script | Purpose | Reads secret from |
|---|---|---|
| `tools/loyverse/*.py` (fetch*, a1–a5, d29, daily_report, order, fc) | Loyverse read-only pulls, daily report, chef order | `/home/box/secrets/loyverse_token` |
| `tools/accounting/loyverse_month.py` | monthly Loyverse sales export for Pat | same |
| `tools/accounting/numbering.py`, `fill_voucher.py` | invoice numbering T/B, payment vouchers + WHT | — |
| `tools/accounting/scan_oct.py` | Payments Place receipts scan via bot API | `/home/box/.secrets/place_lead_bot_token` |
| `tools/line/set_webhook.sh` | set LINE webhook | `/home/box/secrets/line.env` |
| `tools/tuya/tuya.py` | Tuya Cloud signed requests | `~/.config/place/tuya.env` |
| `tools/place-reports/unpaid_orders.py` | unpaid café orders | Gmail |
| `/workspace/srv.py` (running) | local helper server on box — not backed up (ad-hoc) | — |

Not copied on purpose: one-off message scripts (`/workspace/lena_*.py`, `tangmo_*.py`, `sasha_*.py`) — they contain personal chats; data files (xlsx/csv/json, receipts, payroll, ID photos).

## 5. Bot routines (Grok Bot agents, ICT)

| Bot | Schedule |
|---|---|
| Lead | Inbox queue every 30 min 08:08–22:38; TG+info@ 10:04, 17:04; Lena message 11:27; Pat via LINE ≤1/day |
| Ops | morning brief weekdays 11:15; Tuya night read 00:00 |
| Accounting | receipts ~17:56 weekdays; Loyverse export ~21:41 weekdays; weekly summary Fri 17:07; Pat pack by 7th |
| Marketing | weekly report Mon 10:24 |
| SMM | hooks Mon/Thu 08:31; weekly slides Fri; schedule flyer Sun |
| Partners | Tangmo batch 10:04 |
| Revizor | audit Thu 23:21 |
| Site | on request |
Bot IDs: [`docs/bots/BOTS.md`](../bots/BOTS.md).

## 6. Recurring payments / deadlines

See README §6 and `docs/ops/handover/payment-reminders.gs` (PEA 15th, water 20th, 3BB 8/8/12/28, billboard 5th, printer 10th, Dtac 1st, Secom 1 Feb & 1 Jul, garbage Nov, contracts end 27.02.2027; SSO by 15th, PND1 by 7th; timesheet 28th).

## 7. Gaps (not found, fill in)

- Building rent / landlord contract: amount, due date, contact — **no data**.
- Domain registrar, DNS owner, new-site hosting — held by George's developer friend; not recorded.
- Bank accounts / online banking holders — intentionally not recorded; confirm with Khun Sak.
- Loyverse, Tilda, Google Ads, Postiz billing dates and cards — check info@ invoices.
- Live trigger list of «Place TG Bridge» was taken from source code, not from the Triggers screen.
- No CSV data snapshots in git (repo is public).
