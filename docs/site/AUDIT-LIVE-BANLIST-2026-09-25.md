# Live site BAN LIST audit — Place Coworking
**Date:** 2026-09-25 (Asia/Bangkok)  
**Mode:** DRAFT / read-only — no CMS login, no publish  
**Sources:** WebFetch + curl HTML of `https://placecoworking.com` (EN), `/ru`, `/zh`; secondary pages `/office-for-rent-in-phuket`, `/meetingrooms`; sitemap.  
**Canon:** TZ-SITE-CANON + George brief (Pass 1+3 · Offices 2+5 · Studio 4 via manager; hours 08:00–23:00; day 500; month 6000; month 24/7 = 9000).

**ASSUMPTION notes:** `/ru` and `/zh` returned **HTTP 403** to box curl (bot/geo); content below for RU/ZH is from WebFetch markdown (live page body visible). `/th` also 403 via curl — not audited in depth. Meetingrooms page is thin/JS-light (little price copy).

---

## Summary — 6 red fixes

| # | Red item | Live EN | Live RU | Live ZH | Status |
|---|----------|---------|---------|---------|--------|
| 1 | «3 Free Days Any Floor» / 3 free days / any floor trial | Present | «3 бесплатных дня на любом этаже» | «任意楼层免费体验3天» | **RED remaining** |
| 2 | Separate 1st-floor Open Space tariff column | Present (Open Space 1F + price table col) | Same | Same | **RED remaining** |
| 3 | Floor 2 sold as dedicated/hot desk public menu | Present (Dedicated Space 2F + price col) | Same | Same | **RED remaining** |
| 4 | Day 300 (should be 500) | Present on 1F & 3F | Same | Same | **RED remaining** |
| 5 | Mon–Fri 24h / open 24 hours without 9000 | Present (header + body + 24/7 access bullets) | «Пн–Пт: круглосуточно» | «周一至周五24小时» | **RED remaining** |
| 6 | Separate night-pass product rows (1500/3000/7000) | Present | Ночной абонемент 1500/7000/3000 | 夜间票 1500/7000/3000 | **RED remaining** |

### Red remaining count: **6 / 6** (all six still live on EN + mirrored on RU/ZH)

Secondary yellow/ban extras also still live (see table). Meeting room “from 250฿/h −20% residents” and floor-5 office 20000 yearly / 30000 monthly are **aligned** with canon where stated on the homepage Offer block.

---

## Findings table

| finding | page/URL | severity | canon fix | notes |
|---------|----------|----------|-----------|-------|
| Hero CTA «Get 3 Free Days on Any Floor!» + meta/OG same | https://placecoworking.com/ | red | Trial = **1 free day, floor 3 only** (not studio/office/roof). Remove “any floor” / 3 days. | Also button label «Get 3 Free Days» on Offer cards |
| «3 бесплатных дня на любом этаже» | https://placecoworking.com/ru | red | Same as EN (1 day / floor 3) | Contacts block repeats offer |
| «任意楼层免费体验3天» | https://placecoworking.com/zh | red | Same | Offer + CTA |
| Header hours «Mon - Fri 24 hours, Sat, Sun 9 AM - 11 PM» | EN `/` | red | Public hours **08:00–23:00 daily**. Night only with **Month 24/7 = 9000฿ + key** | Repeated in About + Prices intro |
| «Пн–Пт: круглосуточно, Сб и Вс: 9:00–23:00» | `/ru` | red | Same | Weekend still 9 not 8 |
| «周一至周五24小时，周六和周日9:00-23:00» | `/zh` | red | Same | |
| Feature bullet «24/7 access» on team/office cards | EN `/` (×2 blocks) | red | Do not claim 24/7 without 9000 month product | RU «Доступ 24/7»; ZH «24小时出入» |
| Offer card **Open Space** = 1st floor tariffs 50 / 150 / **300** / **900** / 1300 / **3000** | EN `/` We offer | red (#2+#4) + yellow extras | Remove separate 1F tariff column. Pass showcase = floor 3: hour 50 · day **500** · week 1800 · month 6000 · 3mo 15000 · month 24/7 9000 | 5h@150, week 900, 10-day, month 3000 all banned |
| Offer card **Dedicated Space** = 2nd floor 700 / 4200 / 5500 / 11000 | EN `/` | red (#3) | Floor 2 = offices **via manager**, not public hot/dedicated desk menu. Remove public 2F price column | RU/ZH same structure |
| Prices table columns **1st / 2nd / 3rd floor** with day 300 on 1F+3F | EN `#prices` section | red (#2,#3,#4,#6) | Single Pass menu (floor 3). Offices floor 5: 30000/mo or 20000/mo yearly. No night-pass SKUs | Night pass rows 1500 / 7000 / 3000 |
| Night pass 10PM–8AM 1500 / 7000 / 3000 | EN + RU + ZH price tables | red (#6) | No separate night-pass products. Nights only via Month 24/7 9000 | |
| Day pass (10h) **300 ฿** on floor 3 Shared Coworking card | EN `/` | red (#4) | Day = **500 ฿** | Floor 3 week 1800 & month 6000 OK; day wrong |
| «5 hours 150 ฿» on 1F & 3F | EN/RU/ZH | yellow (ban list) | Remove 5h@150 product | |
| «1 week 900 ฿» (1F) | EN/RU/ZH | yellow | Remove; Pass week = 1800 | |
| 10-day packs (1300 / 2500 / 5500) | EN/RU/ZH | yellow | Remove 10-day packs | |
| Month **3000** as 1F anchor | EN/RU/ZH | yellow | Pass month = 6000 (08–23); month 24/7 = 9000 | |
| «Filming in coworking space … **500 ฿ / hour**» | EN/RU/ZH Prices extras | yellow | Studio via manager — **NO Filming 500/h** public price | RU «Съемка… 500 ฿/час»; ZH same |
| Laptop rental public offer | EN/RU/ZH | yellow | Drop public laptop rental (per TZ-SITE-CANON) unless George re-confirms | |
| «5 Floors with Different Formats and a Rooftop» as coworking pick-any | EN `/` | yellow | Showcase: Pass (1+3) · Offices (2+5) · Studio (4 via manager). Roof leased — not coworking | Event copy still lists «6th floor» capacity |
| Event space «6th floor: up to 30 people» | EN/RU/ZH | yellow | Clarify roof/6F is leased/event-only via manager; not Pass floor | |
| Floor 2 marketed with breakfast / dedicated desk / “for entrepreneurs” | EN Offer Dedicated | red (#3) | Remove; office via manager only | |
| Office landing: coworking «from ฿3,000 / month»; Mon–Fri 24h; 2nd floor as whole-floor rent 285 m²; many «from ฿15,000» SKUs | https://placecoworking.com/office-for-rent-in-phuket | red/yellow | Align offices to canon floor 5: **30000/mo or 20000/mo yearly (~4 pax)**; floor 2 via manager not public menu; hours 08–23; no Pass day/month from 3000 | Heavy SEO page; diverges from homepage office numbers (15k yearly vs canon 20k yearly) |
| Meeting rooms page thin | https://placecoworking.com/meetingrooms | yellow | Keep meeting from 250฿/h, −20% Pass residents; no filming SKU | Little price text visible |
| Address / phone / email on homepage Contacts | EN/RU/ZH | OK | Keep: 59/2 Chao Fah Tawan Tok Rd, Chalong…; +66951170481; info@placecoworking.com | Address correct (Chalong, not Kathu) on own site |
| Meeting from 250฿/h + 20% resident discount | EN/RU/ZH Offer | OK | Matches canon | |
| Floor 5 private room 20000 yearly / 30000 monthly | EN/RU/ZH Offer | OK (homepage) | Matches canon offices | Office SEO page undercuts to 15k — conflict |
| Kathu / Patong / Mbps claims / «бизнес-центр» | Own site EN/RU/ZH | not found | Keep banned | Kathu appears on **Wanderlog** (external) |
| High speed WI-FI (no Mbps number) | EN/RU/ZH | OK / low yellow | Prefer no Mbps claims | No Mbps figure found |

---

## Locale coverage

| Locale | URL | Fetch | Ban-list posture |
|--------|-----|-------|------------------|
| EN | `/` | 200 WebFetch + curl | All 6 reds present |
| RU | `/ru` | WebFetch OK; curl 403 | Same 6 reds (translated) |
| ZH | `/zh` | WebFetch OK; curl 403 | Same 6 reds (translated) |
| TH | `/th` | curl 403; in sitemap | **ASSUMPTION:** likely same Tilda structure — re-check when fetchable |
| Office EN | `/office-for-rent-in-phuket` | 200 | Extra price/hours violations |
| Office RU | `/ru/office-for-rent-in-phuket` | in sitemap | Not fully fetched this pass |
| Meeting | `/meetingrooms` | 200 thin | Low price content |

---

## Priority fix order (for George / Tilda — draft only)

1. Kill Mon–Fri 24h + 24/7 bullets everywhere → 08:00–23:00; mention 9000 only as paid night product.  
2. Kill «3 Free Days Any Floor» → 1 free day floor 3.  
3. Collapse price UI to **one Pass column** (floor 3) at canon rates; day **500**.  
4. Remove floor 1 separate tariff column + floor 2 dedicated menu + all night-pass rows.  
5. Remove Filming 500/h, 5h@150, week 900, 10-day packs, month-from-3000.  
6. Reconcile `/office-for-rent-in-phuket` with floor-5 canon (stop 3000 Pass + 15k yearly conflict).

---

*End of audit. Status: DRAFT — do not publish without George OK.*
