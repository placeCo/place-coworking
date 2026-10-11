# Place Site — memory export (11.10.2026)
Exported via RecallMemory (agent scope, several broad queries). Dates are when the fact was saved. No secrets.

## Role and rules (profile)
- 2026-09-24: Place Site works for George. It owns the docs/site/ package in placeCo/place-coworking (6 red Tilda items, NAP/FAQ drafts, copy pack). The CMS and live site change only with George's explicit written OK. It talks to George in Russian.
- 2026-10-08: Duty split from 09.10 (George via Ops). Site handles only docs/site/ in the repo and the Tilda CMS (CMS only with George's OK). Directories and live listings (WAVE2, Deskimo, coworker.com, Office Hub, TripAdvisor, GBP) belong to Ops; since 09.10 16:06 they belong to Marketing. Site never registers or edits them; NAP drafts in docs are fine.
- 2026-09-26: Place Ops room was closed to save tokens. Tasks come by DM from Lead and results go back there, without "принял". Site doesn't open Telegram Web. A direct OK from George himself is still needed for the 6 red items.
- 2026-10-09: For site prices George wants layouts built so only the numbers change later, never the layout.
- 2026-10-09: The site admin is George's friend, who passes information along. Admin, domain and hosting are left to the developers.
- 2026-10-09: Nikita has the PLACE SVG logo.
- 2026-10-09 (note): George has his own Grok account and generates concept images from English prompts that Site writes.

## Canon used on the site (as of 10.10)
- Hours: 08:00–23:00 daily. Never 24/7.
- Three products, in order: Office → Place Pass (floors 1 and 3) → Podcast room.
- Floors:
  - 5: offices, up to 6 people each
  - 4: podcast room (one room, light and camera); never offices on floor 4
  - 3: Pass hall
  - 2: offices
  - 1: Pass hall
- Office: 30 000 ฿/month without company address; 20 000 ฿/month on a 1-year contract, company address included. Never confirm availability; the line is «напишите WhatsApp, покажем что свободно». Included: bathroom, shower, CCTV, furniture, A/C, maintenance and cleaning, café next door, night access for tenants (mentioned once, on the office page only).
- Place Pass:
  - 50 ฿/h
  - day 400 ฿ until 31.10.2026, then 500 ฿
  - week 1 800 ฿
  - 10 days 2 500 ฿, 3 500 ฿ from 01.11.2026 (public since 09.10; 30-day validity is internal and not on the site)
  - month 6 000 ฿
  - 3 months 15 000 ฿
- Podcast: no price, WhatsApp.
- Meeting rooms: 250 ฿/h. Rooms for 20, 13 (85″ screen) and 6. «Place Pass residents −20%» (restored by George 09.10 14:18; NOT 20% off all services). /meetingrooms page stays.
- Equipment rental stays (George 09.10 09:38):
  - monitor 200 ฿/10 h or 1 500 ฿/month (George 09.10 10:50)
  - VR 200 ฿/h or 1 500 ฿/day
  - laptop 150 ฿/h or 750 ฿/8 h
  - photo/video gear on request
- Never on the site: 24/7, free days, cheapest/best value/affordable, café/yoga/events/rooftop as products, Dedicated Space, 20% off all services, printing, tea zone, visa, Kathu, 83000, Bangkok, 1645 m², floor-4 offices, "move in and start working", deposit 1+2, BBQ/PlayStation, relocation partners.
- Contacts: WhatsApp +66 95 117 0481, info@placecoworking.com, LINE https://line.me/R/ti/p/@294bqkju, Maps https://maps.app.goo.gl/9VaJy1sW3Vz2VUiNA, TG bot @Placecoworking_bot (coming).

## Tilda live site — history
- 2026-09-25: Lead relayed George: day pass 400 from 01.10 to 31.10, 500 again from 01.11. Day price is not put in meta.
- 2026-09-25: PR #8 (SEO seasonal draft) and PR #9 (DRAFT-META-HOME, DRAFT-OFFICE-PAGE-ALIGN, DRAFT-MEETINGROOMS-TH-LOCAL) in docs/site/. Copy pack HOME/PASS/OFFICES/STUDIO, FAQ EN+RU, CMS handoff, NAP listings are on main.
- 2026-09-28: George OK'd price edits on 6 Tilda pages per /workspace/tz/TZ-PRICES-OCT-2026.md; publishing needed a separate OK.
- 2026-10-01: prices published. Follow-up fixes for bold or misaligned prices, old RU/office figures and the mobile office table. Screens are in /workspace/tilda-publish-0110/.
- 2026-10-02: one Place Pass HTML block (50/400/1800/6000/15000 plus Include) went onto EN/RU/TH/ZH homes. Old T614 blocks are hidden, not deleted. Files are in /workspace/tilda-pass-preview/. The "Workspaces for teams" card now shows floors 5 and 2 with the photo from SMM's slide 4. TH/ZH teams card fixed. Screens are in /workspace/tilda-fix-0210-teams/.
- 2026-10-09 03:30–04:55: site aligned with the 09.10 brief on /, /ru, /zh, /th, both office pages and the /meetingrooms success message. Meeting-room/event blocks were hidden at that time. Desktop Pass blocks were limited to >980px.
- 2026-10-09 (v3, Marketing round 2 with George's OK):
  - removed Dedicated Space (card, menu, footer, accordion, anchor), 20% off, printing, tea, "hourly to yearly", and Show More
  - H1 is «PLACE Coworking Space — Phuket, Chalong» (plus RU/ZH/TH versions)
  - teams card shown once per width via CSS
  - TH typos fixed; «เก้าอี้พิเศษ» → Place Pass
  - office EN/RU v3 HTML: removed BBQ, PlayStation, deposit 1+2, relocation, free printing, Perks/discounted ads
  - TH/ZH menu got an office link
  - "Meeting Rooms" in About now links to /meetingrooms
  - /meetingrooms: meta added, "roof" line removed, typo fixed
  - 10 days 2 500 ฿ added in every Pass spot
  - −20% meeting-room line added
  - Files: /workspace/tilda-brief-0910/ (AUDIT.md, paste-v3/, shots/)
- 2026-10-09: routine set for 01.11.2026 07:37 ICT to change 10 days from 2 500 to 3 500 on all 4 homes, number only.

## Tilda technique (for whoever edits next)
- Project 10152187. Page ids:
  - EN 66467581
  - RU 70500635
  - TH 69621003
  - ZH 69948333
  - Office EN 150873646
  - Office RU 151070136
  - /meetingrooms 54470657
- Pass HTML blocks (desktop/mobile):
  - EN rec4420194601/rec965881491
  - RU rec4420367701/rec1090224146
  - ZH rec4420589001/rec1068843666
  - TH rec4420458301/rec1055949736
- Pass card summaries: EN rec937266791, RU rec1090223931, ZH rec1068843451, TH rec1055949521.
- Prices paragraph: EN rec952103231, RU rec1090224126, ZH rec1068843646, TH rec1055949716.
- Office T123: EN rec2416433131, RU rec2419610261.
- Hide, never delete. Non-Latin text is pasted from clip files, never typed. Re-check Zero-blocks after reload before publishing. Verify live with curl ?nocache.

## New site (developer ТЗ)
- 2026-10-09/10: ТЗ written with Marketing: /workspace/place-site-tz/TZ-PLACE-SITE-2026-10.md, repo docs/site/TZ-PLACE-SITE-2026-10.md (draft 5, commit 7084561), Google Doc 17CxZVx0KvTz2zI9dSbT2xUdRH7PSk79nyX2RxDf9fsQ.
  - Rules: one price source with automatic date switching; 4 languages; WhatsApp main CTA; cookie banner (Consent Mode, equal buttons); no Yandex Metrika; Keyword Planner and GSC access for the developer; LINE on all languages; meeting-room pages in 4 languages; SMM photo list §17.
- 2026-10-09: 7 coworking references (structure and prices) plus George's 10 mood sites reviewed. Screens are in /workspace/place-site-tz/refs/. Heavy WebGL, preloaders and audio are rejected.
- 2026-10-10: design prompt /workspace/place-site-tz/DESIGN-PROMPT-FULL-SITE.md (repo docs/site/, commit 17a20b8). Palette #0A2208/#203D2B/#F4EEE0. Floor map labels all 5 floors.
- 2026-10-10: George uploaded the mockup to https://github.com/placeCo/place-coworking-site. Site reviewed it (screens in /workspace/pcs-review/shots/) and gave George a 10-point edits ТЗ.
- 2026-10-10: floor-map brief for George's artist «Горка» (flat isometric SVG, labels on their own layer).

## Shared user facts recorded by Site
- 09.10 10:50: monitor 200 ฿/10 h or 1 500 ฿/month on all languages.
- 09.10 23:36: 10 days 3 500 ฿ from 01.11, valid 30 days (internal). Meeting-room price shown. Dated prices switch automatically. The developer handles admin/domain/DNS.
- 09.10 23:57: office includes list; cards accepted; online payment undecided; meeting rooms in 4 languages; LINE on all versions; logo SVG with Nikita; photos are urgent (owner decided at the Mon–Tue meeting).
- 10.10 03:50: podcast room on floor 4; offices on floor 4 never.
