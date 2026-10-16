---
name: place-weekly-schedule
description: >-
  Generate the weekly "Расписание недели" flyer every Sunday for the next Mon–Sun.
  SMM prepares data + prompt; George generates the image in Grok.
---
# Weekly schedule flyer (every Sunday)

## When
- **Sunday**: SMM reads the Events and booking sheet for the next week (Mon–Sun), selects public events only, updates the TZ in `docs/drafts/tz/`, sends to George.
- **Sunday**: George generates the image in Grok from the prompt, checks dates/days/times, approves.
- **Publication**: SMM/Postiz or Lead publishes after George OK, not earlier than 11:00 ICT.

## Style canon (do not change)
- Background: creamy off-white `#F7F5EC`
- Text: dark green `#1E3A2A`
- Title: two lines, centered — "РАСПИСАНИЕ" (regular) + "НЕДЕЛИ" (extra-bold, very large)
- Rows: date bold + day of week on the same line | event | time bold with en dash
- Thin gray-green divider lines between rows
- Footer: "PLACE COWORKING" bold, centered
- Format: 1080×1350 (feed). Optional 1080×1920 story with more top/bottom space.
- Show only days that have events (default). No empty days with "—".

## What to include
- Public events only (yoga, clubs, workshops, etc.)
- No prices, no "free", no instructor names, no private bookings, no floors, no address on the image
- Event name can be the public brand name if it has one (e.g. "AI Phuket", "Panda Tea")

## Data source
- Google Sheet «Events and booking» (read-only, all tabs)
- TZ template: `docs/drafts/tz/YYYY-MM-DD-smm-weekly-schedule.md`

## Prompt template (paste into Grok)
```
Minimalist vertical poster 1080×1350, creamy off-white background #F7F5EC, dark green text #1E3A2A, modern sans-serif.

Top center tightly stacked title: РАСПИСАНИЕ regular, below НЕДЕЛИ extra-bold very large.

Clean list with thin gray-green divider lines. Each row three columns:
- left: date bold + day of week on same line
- center: event name
- right: time bold with en dash

Rows (exact, no changes):
[PASTE ROWS HERE]

Bottom center bold: PLACE COWORKING.

Lots of whitespace, precise typography, no extra text, no prices, no names, no floors, no address.
```

## Captions (after image OK)
### Telegram (RU)
```
🗓 Расписание недели в Place Coworking · [dates]

[🧘 events list]

📍 Чалонг, Пхукет
💬 Вопросы и запись — WhatsApp +66 95 117 0481
```

### Instagram (EN)
```
🗓 This week at Place Coworking · [dates]

[🧘 events list]

📍 Chalong, Phuket
💬 Questions? Tap the buttons in our profile
```

## Checklist before publish
- Dates match days of week
- Times use en dash with spaces
- No prices / free / names / private bookings / floors on image
- George OK on image and captions
