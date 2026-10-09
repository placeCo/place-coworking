# PLACE bots: low-cost scripted automation (09.10.2026)

Nothing here is deployed. These are drafts for George's OK. Canon: `/workspace/place-brief/PLACE-BRIEF-2026-10-09.md` plus `docs/canon/DECISIONS-LOG.md` (and `CANON.md`, which agrees with them).

| Path | What |
| --- | --- |
| `help-bot/HelpBot.gs` | NEW client Telegram bot (separate Apps Script project «Place Help Bot», doPost webhook). Asks EN/RU/TH, shows a menu, answers keywords, and logs anything unmatched or «Talk to a human» to Place Inbox tab `help-bot` |
| `help-bot/INSTALL.md` | install steps |
| `staff-bot/StaffCommands.gs` | v2: staff phrases without a slash (RU/EN/TH: цены, цена офиса, кто продлевается, брони завтра, адрес, помощь) + slash commands + «бронь …» → tab «Брони бот»; light/AC words left to Tuya.gs |
| `staff-bot/HOOK.md` | one line to add to `poll()` in the live Code.gs |
| `staff-bot/STAFF-COMMANDS.md` | phrase list for staff (Russian) |
| `staff-bot/test_staff.js` | offline node tests with mocks (`TZ=Asia/Bangkok node test_staff.js`) |
| `instagram/AUTOREPLIES.md` | Meta Business Suite instant reply, 4 FAQ questions, 6 saved replies EN/RU/TH |

No secrets are in any file. Tokens and keys go only in Script Properties.

## Open questions for George
1. **Meeting rooms.** CANON.md §3 still lists «meeting rooms from 250 ฿/h and the −20% resident discount as a public offer» as not-for-sale. The brief (09.10 14:18) and the decision of 09.10 restore −20% for Place Pass residents, and the site keeps the meeting-rooms page. The bots say «meeting rooms exist, residents −20%, price and booking via WhatsApp» and give **no price**. Is that right, or should meeting rooms not be mentioned at all?
2. **Google Maps link.** The canon has no map link. The bots use `https://maps.app.goo.gl/pgJ5eHhoCJmf1YEH6` from TG channel post /26. It resolves to the Google place «PLACE COWORKING PHUKET», Chao Fah Tawan Tok Rd, Chalong. That Google listing shows postcode **83000** (banned in canon, should be 83130), so the GBP address may need fixing. Confirm the link, or set `MAPS_URL` to `-` to hide it.
3. **Help-bot handoffs.** Rows with `status=new` in `help-bot` aren't announced anywhere yet. Who reads them, and should Ops be woken (same pattern as the bridge `opsWake_`)?
4. **/ac.** Tuya has no device called AC and no IR blaster. Smart plug «Умный переключатель 6» draws ~1.25 kW (looks like an AC). Which plug or bulb is in which room? Is it OK to switch an AC off at the socket? Who besides admins may use /light and /ac?
5. **/bookings.** It needs `bookings-today.gs` added to «Place TG Bridge». Is «Events and booking» still kept up to date? On 29.09 the meeting-room grid ended at 30.09.
6. **/free saved reply (Instagram).** It says «no free days by default, only with our ad/flyer offer». That matches the reception rule in the canon. OK to use, or drop it?
7. Instagram TH replies and the help-bot TH texts are simple and polite (ค่ะ). A Thai admin (Tangmo/Leena) should proofread them before go-live.
