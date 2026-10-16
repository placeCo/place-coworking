/**
 * Place Coworking — G-5 «Bookings today» from Events and booking (→ PLACE Team: EN+TH structured, George 16.10.2026). DRAFT TEMPLATE, NOT DEPLOYED.
 * READ-ONLY: never writes to the sheet, never sends. Returns text for the existing 10:07 run.
 *
 * Sheet layout (checked read-only 29.09.2026): each tab = one space; row 4 = "Time" + one column
 * per day ("Mon 28/10" or "ПН 11.03"), month marker columns like "Jan\n2025" / "September\n2026"
 * give the year; column A = time slots (09:00, 09:30 …); a booking = any non-empty cell.
 * FINDING 29.09: the «Meeting room» grid ends at Wed 30/09/2026 (+ an "October 2026" marker) —
 * no columns for October yet.
 *
 * Script Properties (optional): EVENTS_SHEET_ID, BOOKING_TABS (JSON list), HEADER_ROW=4, LOOKAHEAD_DAYS=14
 * 10.10.2026: unreadable sheet/tab/date column → «⚠️ не смог прочитать <tab>: <reason>», never «none»; job adds «Брони бот» rows.
 */
var BK_TZ = 'Asia/Bangkok';
var BK_ID = '1BSwm4sY-ksXjFNEEsAdyiWmUDzgbQlJpL_dh9JIdZAc';
var BK_TABS = ['Meeting room', '1 floor', '4 floor', 'ART Room ', 'Workshop room', 'Office room-4 (GREEN)', '6 floor', 'Library'];  // Library added 10.10.2026 (bot «бронь библиотека»)
var BK_MONTHS = {jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11};

function dryRunBookings() { var t = bookingsToday_(new Date()); Logger.log(t); return t; }

/** Text for one day from the grid tabs (also used by StaffCommands /bookings, which appends «Брони бот» rows itself). */
function bookingsToday_(now, lang) { return bkFormat_(bkCollect_(now, false), lang); }

/** Text for the 10:07 job: grid tabs + «Брони бот» rows (bookings made with the bot command «бронь …», not in the grid yet). */
function bookingsJob_(now, lang) { return bkFormat_(bkCollect_(now, true), lang); }   // lang: 'en+th' (default) | 'ru' | 'en'

/** FIX 10.10.2026: every source is either read OK (empty or with bookings) or listed in `failed` with a reason.
 *  «none» is printed only when nothing failed (sheet opened, every tab found, today's column found) and all were empty. */
function bkCollect_(now, withBot) {
  var p = PropertiesService.getScriptProperties();
  var tabs = JSON.parse(p.getProperty('BOOKING_TABS') || JSON.stringify(BK_TABS));
  var hr = Number(p.getProperty('HEADER_ROW') || 4), look = Number(p.getProperty('LOOKAHEAD_DAYS') || 14);
  var ymd = Utilities.formatDate(now, BK_TZ, 'yyyy-MM-dd'), s = ymd.split('-');
  var today = new Date(+s[0], +s[1] - 1, +s[2]);
  var horizon = new Date(today.getFullYear(), today.getMonth(), today.getDate() + look);
  var c = {dd: s[2] + '.' + s[1], lines: [], items: [], failed: [], empty: [], warn: []};
  var ss = null;
  try { ss = SpreadsheetApp.openById(p.getProperty('EVENTS_SHEET_ID') || BK_ID); if (!ss) throw new Error('openById returned nothing'); }
  catch (e) { c.failed.push({tab: 'Events and booking', why: bkErr_(e)}); return c; }
  tabs.forEach(function (name) {
    var label = String(name).trim();
    try {
      var sh = ss.getSheetByName(name);
      if (!sh) { c.failed.push({tab: label, why: 'tab not found'}); return; }
      var disp = sh.getDataRange().getDisplayValues();
      if (!disp || disp.length < hr) { c.failed.push({tab: label, why: 'no header row ' + hr}); return; }
      var cols = bkDateCols_(disp[hr - 1], today.getFullYear());
      var col = cols.map[bkKey_(today)];
      if (col === undefined) {
        c.failed.push({tab: label, why: 'no column for ' + c.dd + (cols.last ? ' (grid ends ' + bkDmy_(cols.last) + ')' : ' (no dates in row ' + hr + ')')});
        return;
      }
      if (cols.last && cols.last < horizon) c.warn.push(label + ': grid ends ' + bkDmy_(cols.last));
      var items = [], cur = null;   // 16.10.2026: consecutive slots with the same text = one booking (Room / Time / Guest)
      for (var r = hr; r < disp.length; r++) {
        var v = String(disp[r][col] || '').trim().replace(/\s+/g, ' ').slice(0, 60);
        var slot = String(disp[r][0] || '').trim() || '?';
        if (v && cur && cur.guest === v) { cur.last = slot; continue; }
        if (cur) items.push(cur);
        cur = v ? {room: label, first: slot, last: slot, guest: v} : null;
      }
      if (cur) items.push(cur);
      items.forEach(function (it) { c.items.push({room: it.room, time: bkRange_(it.first, it.last), guest: it.guest, task: ''}); });
      if (items.length) c.lines.push(label + ': ' + items.length); else c.empty.push(label);
    } catch (e) { c.failed.push({tab: label, why: bkErr_(e)}); }
  });
  if (withBot) {
    try {
      var bt = ss.getSheetByName(BK_BOT_TAB);   // missing tab = nobody used «бронь …» yet → no bot rows, not a failure
      var rows = bt && bt.getLastRow() >= 2 ? bt.getRange(2, 1, bt.getLastRow() - 1, 9).getDisplayValues() : [];
      var bot = rows.filter(function (r) { return bkYmd_(r[1]) === ymd && !BK_CANCELLED.test(String(r[8])); })
        .map(function (r) { return {room: String(r[4]).trim(), time: String(r[2]).trim() + '–' + String(r[3]).trim(),
          guest: String(r[5]).trim().slice(0, 40), task: 'add to the grid', bot: true}; })
        .sort(function (a, b) { return a.time < b.time ? -1 : a.time > b.time ? 1 : 0; });
      bot.forEach(function (b) { c.items.push(b); });
      if (bot.length) c.lines.push(BK_BOT_TAB + ': ' + bot.length); else c.empty.push(BK_BOT_TAB);
    } catch (e) { c.failed.push({tab: BK_BOT_TAB, why: bkErr_(e)}); }
  }
  return c;
}

/** 16.10.2026 (George): every group message clearly structured. PLACE Team = English + Thai blocks, one bullet group per booking.
 *  lang: 'en+th' (default, PLACE Team), 'ru' (Russian groups), 'en' (other international groups). Text only; never sends. */
var BK_L = {
  en: {flag: '🇬🇧 English', room: 'Room', time: 'Time', guest: 'Guest', task: 'Task', none: '• No bookings today',
       fail: 'could not read', emptyOk: 'read OK, empty', grid: 'grid ends', add: 'add to the grid'},
  th: {flag: '🇹🇭 ภาษาไทย', room: 'ห้อง', time: 'เวลา', guest: 'ลูกค้า', task: 'งาน', none: '• วันนี้ไม่มีการจอง',
       fail: 'อ่านไม่ได้', emptyOk: 'อ่านได้ ไม่มีจอง', grid: 'ตารางสิ้นสุด', add: 'ใส่ในตารางจอง'},
  ru: {flag: '🇷🇺 Русский', room: 'Комната', time: 'Время', guest: 'Гость', task: 'Задача', none: '• Броней на сегодня нет',
       fail: 'не смог прочитать', emptyOk: 'прочитано, пусто', grid: 'сетка заканчивается', add: 'внести в сетку'}
};
function bkFormat_(c, lang) {
  c.items.sort(function (a, b) { var x = a.time.replace('.', ':'), y = b.time.replace('.', ':'); return x < y ? -1 : x > y ? 1 : 0; });
  var langs = lang === 'ru' ? ['ru'] : lang === 'en' ? ['en'] : ['en', 'th'];
  var blocks = langs.map(function (l) { return bkBlock_(c, BK_L[l]); });
  return '📅 BOOKING ' + c.dd + '\n\n' + blocks.join('\n\n━━━━━━━━━━\n\n');
}
function bkBlock_(c, L) {
  var out = [L.flag];
  c.items.forEach(function (it, i) {
    if (i) out.push('');
    out.push('• ' + L.room + ': ' + it.room, '• ' + L.time + ': ' + it.time, '• ' + L.guest + ': ' + (it.guest || '—'));
    if (it.task) out.push('✅ ' + L.task + ': ' + (it.task === 'add to the grid' ? L.add : it.task));
  });
  if (!c.items.length && !c.failed.length) out.push(L.none);
  if (c.failed.length || c.warn.length) out.push('');
  c.failed.forEach(function (f) { out.push('⚠️ ' + L.fail + ' ' + f.tab + ': ' + f.why); });
  if (c.failed.length && c.empty.length) out.push('ℹ️ ' + L.emptyOk + ': ' + c.empty.join(', '));
  c.warn.forEach(function (w) { out.push('⚠️ ' + w.replace('grid ends', L.grid)); });
  return out.join('\n');
}
/** «09:00» + «10:30» (30-min slots) → «09:00–11:00»; unparseable → as is. */
function bkRange_(a, b) {
  var m = String(b).match(/^(\d{1,2})[:.](\d{2})$/);
  if (!m) return a === b ? a : a + '–' + b;
  var t = +m[1] * 60 + +m[2] + 30, end = ('0' + Math.floor(t / 60)).slice(-2) + ':' + ('0' + t % 60).slice(-2);
  return a.replace('.', ':') + '–' + end;
}

var BK_BOT_TAB = 'Брони бот';   // written by StaffCommands «бронь …»: created_ict, date, start, end, room, name_contact, by, raw_text, status
var BK_CANCELLED = /cancel|отмен|ยกเลิก|reject|отказ|delete|удал/i;   // = scCancelled_ in StaffCommands
function bkErr_(e) { return 'error: ' + String(e && e.message || e).replace(/\s+/g, ' ').slice(0, 100); }
function bkDmy_(d) { return Utilities.formatDate(d, BK_TZ, 'dd.MM.yyyy'); }
function bkYmd_(v) {
  v = String(v || '').trim();
  var m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
  m = v.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/);
  return m ? m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2) : '';
}

/** Header row -> {map: {yyyy-mm-dd: colIndex}, last: Date}. Year from month markers; rollover Dec->Jan. */
function bkDateCols_(row, fallbackYear) {
  var map = {}, year = null, lastMonth = null, last = null;
  for (var j = 1; j < row.length; j++) {
    var c = String(row[j] || '').trim();
    var mk = c.match(/^([A-Za-z]+)\s*\n?\s*(\d{4})$/);
    if (mk) { year = +mk[2]; lastMonth = null; continue; } // FIX 10.10.2026: marker already sets the year; no extra Dec->Jan +1 after «January 2026»
    var m = c.match(/(\d{1,2})[\/.](\d{1,2})$/);
    if (!m) continue;
    var d = +m[1], mo = +m[2] - 1;
    if (year === null) year = fallbackYear - 2; // first columns before any marker (e.g. Oct 2024)
    if (lastMonth !== null && mo < lastMonth && !mk) { if (lastMonth === 11 && mo === 0) year++; }
    lastMonth = mo;
    var dt = new Date(year, mo, d);
    map[bkKey_(dt)] = j; last = dt;
  }
  return {map: map, last: last};
}
function bkKey_(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
