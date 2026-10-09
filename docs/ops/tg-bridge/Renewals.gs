// Renewals.gs — new file in Apps Script project «Place TG Bridge». No secrets here: nothing is sent from this file.
// 09.10.2026 ICT. Spec: George 09.10 14:12 (via Marketing), texts from place-marketing/funnel-retention-2026-10-09.md,
// section 3 «Удержание → Что делать до конца срока».
//
// What it does: once a day (~10:15 ICT) reads Resident info «Лист1», finds passes whose Finish is
//   today+3 / tomorrow / today / today−7 (and column H empty), composes ONE Telegram message per admin
//   (RU + short EN) with ready WhatsApp texts (+ wa.me link when column G holds a phone number) and appends it
//   to Place Inbox «outbox». Photo.gs outboxFlush_() (called each minute from poll()) does the actual sending.
//   Nothing in any bucket → nothing is written.
// Entry points: renewalsDaily (trigger), renewalsDryRun (log only), renewalsDryRunFor('2026-10-11'),
//   installRenewalsTrigger, removeRenewalsTrigger.
// All globals are prefixed RN_/rn* to avoid clashes with Code.gs, Line.gs, Photo.gs.

var RN_RESIDENT_SHEET_ID = '1Rzz9CKQYHwgZ8BPtrTxxUwFdphphSivSJkkTwFC8wo4'; // Resident info
var RN_RESIDENT_TAB = 'Лист1';
var RN_INBOX_SHEET_ID = '1uMHYp6d-Ji9VQj5xtESiXummBNX9bC8vTruPRQLs8jw';    // Place Inbox
var RN_OUTBOX_TAB = 'outbox';                                               // chat_id | reply_to_message_id | text | status | sent_at | result
var RN_TZ = 'Asia/Bangkok';
// Recipients: admins' private chats with @PlaceLeadBot (both did /start on 03.10.2026, docs/ops/admin-feedback-TEST.md).
// No admins-only group is documented (PLACE Team also has kitchen staff), so DMs. Their replies to the bot reach Ops via the queue.
var RN_RECIPIENTS = [
  {name: 'Tangmo', chat_id: '7486466296'},
  {name: 'Leena', chat_id: '8944262207'}   // Leena = admin, NOT Lena (manager)
];
var RN_TRIGGER_HOUR = 10, RN_TRIGGER_MINUTE = 15;   // ICT; Apps Script fires within ±15 min of nearMinute
var RN_DAY_FROM = 9, RN_DAY_TO = 21;                // daytime window (ICT hours, [from, to)) for writing to outbox
var RN_MAX_TG = 3800;                               // Telegram limit is 4096; keep each part under 4000
var RN_TRUST_CELL_YEAR = true;  // dates in «Лист1» are real date cells (display dd.MM hides the year). true = use the stored year
                                // (fixes Finish<Start by +1 year); false = ignore stored year, infer the year closest to today.
var RN_PROP_LAST = 'RN_LAST_SENT_DATE';             // Script Property: last ICT date we wrote to outbox (no double send)

// Canon prices (brief). Day / 10 days change from 01.11.2026. 24/7 is never offered.
var RN_PRICE_SWITCH = '2026-11-01';
var RN_PRICES = {hour: 50, dayOld: 400, dayNew: 500, week: 1800, tenOld: 2500, tenNew: 3500, month: 6000, months3: 15000};
var RN_ALLOWED_AMOUNTS = ['50', '400', '500', '1 800', '6 000', '15 000', '30 000', '20 000']; // 30 000 / 20 000 = office (in the verbatim text)

// ---------------- pure helpers (no Apps Script services; tested in node) ----------------

var RN_MONTHS = {jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  'янв': 1, 'фев': 2, 'мар': 3, 'апр': 4, 'мая': 5, 'май': 5, 'июн': 6, 'июл': 7, 'авг': 8, 'сен': 9, 'окт': 10, 'ноя': 11, 'дек': 12};

function rnPad_(n) { return (n < 10 ? '0' : '') + n; }
function rnYmd_(y, m, d) { return y + '-' + rnPad_(m) + '-' + rnPad_(d); }
function rnToDays_(ymd) { var p = ymd.split('-'); return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 86400000); }
function rnFromDays_(n) { var d = new Date(n * 86400000); return rnYmd_(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()); }
function rnAddDays_(ymd, k) { return rnFromDays_(rnToDays_(ymd) + k); }
function rnDdMm_(ymd) { var p = ymd.split('-'); return p[2] + '.' + p[1]; }
function rnValid_(y, m, d) { return m >= 1 && m <= 12 && d >= 1 && d <= 31 && rnFromDays_(rnToDays_(rnYmd_(y, m, d))) === rnYmd_(y, m, d); }

// Cell -> {ymd, hasYear} | null. Accepts 'yyyy-MM-dd' (Date cells are converted to this before), '9.10', '09.10',
// '9/10', '9 Oct', '9 октября', '10.9.26', '09.10.2026'. Always day first.
function rnParseCell_(v) {
  if (v === null || v === undefined) return null;
  var s = String(v).trim();
  if (!s) return null;
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return rnValid_(+m[1], +m[2], +m[3]) ? {ymd: rnYmd_(+m[1], +m[2], +m[3]), hasYear: true} : null;
  m = s.match(/^(\d{1,2})\s*[.\/\-]\s*(\d{1,2})(?:\s*[.\/\-]\s*(\d{2}|\d{4}))?\.?$/);
  if (m) {
    var y = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : 0;
    return rnValid_(y || 2024, +m[2], +m[1]) ? {d: +m[1], m: +m[2], y: y, hasYear: !!y, ymd: y ? rnYmd_(y, +m[2], +m[1]) : null} : null;
  }
  m = s.toLowerCase().match(/^(\d{1,2})\s*([a-zа-яё]{3,})\.?(?:\s+(\d{4}))?$/);
  if (m && RN_MONTHS[m[2].slice(0, 3)]) {
    var mo = RN_MONTHS[m[2].slice(0, 3)], yy = m[3] ? +m[3] : 0;
    return rnValid_(yy || 2024, mo, +m[1]) ? {d: +m[1], m: mo, y: yy, hasYear: !!yy, ymd: yy ? rnYmd_(yy, mo, +m[1]) : null} : null;
  }
  return null;
}

// Year closest to today (y-1, y, y+1). 29.02 in a non-leap year -> skipped candidate.
function rnInferYear_(d, m, todayYmd) {
  var ty = +todayYmd.slice(0, 4), t = rnToDays_(todayYmd), best = null;
  [ty - 1, ty, ty + 1].forEach(function (y) {
    if (!rnValid_(y, m, d)) return;
    var ymd = rnYmd_(y, m, d), dist = Math.abs(rnToDays_(ymd) - t);
    if (!best || dist < best.dist) best = {ymd: ymd, dist: dist};
  });
  return best ? best.ymd : null;
}

// -> {start, finish} as ymd (either may be null)
function rnResolveDates_(startCell, finishCell, todayYmd) {
  var s = rnParseCell_(startCell), f = rnParseCell_(finishCell);
  if (!f) return {start: s && s.ymd, finish: null};
  var fin, st = null;
  if (f.hasYear && RN_TRUST_CELL_YEAR) fin = f.ymd;
  else fin = rnInferYear_(f.d || +f.ymd.slice(8), f.m || +f.ymd.slice(5, 7), todayYmd);
  if (s) {
    if (s.hasYear && RN_TRUST_CELL_YEAR) st = s.ymd;
    else {
      var sd = s.d || +s.ymd.slice(8), sm = s.m || +s.ymd.slice(5, 7), fy = +fin.slice(0, 4);
      st = rnValid_(fy, sm, sd) ? rnYmd_(fy, sm, sd) : null;
      if (st && st > fin) st = rnValid_(fy - 1, sm, sd) ? rnYmd_(fy - 1, sm, sd) : null;
    }
  }
  // Year typed/auto-filled wrong across New Year (22.12 -> 21.01 stored in the same year): move Finish +1 year.
  if (st && fin < st) {
    var f2 = (+fin.slice(0, 4) + 1) + fin.slice(4);
    if (rnToDays_(f2) - rnToDays_(st) <= 400) fin = f2;
  }
  return {start: st, finish: fin};
}

function rnClean_(v) { return String(v === null || v === undefined ? '' : v).replace(/\s+/g, ' ').trim(); }

// Pass kind from columns C (type) + D (floor). -> {kind, standard, label}
// kind: month | months3 | week | day | ten | other. standard = canon product on 1st/3rd floor without extras.
function rnPassKind_(type, floor) {
  var t = rnClean_(type).toLowerCase(), fl = rnClean_(floor).toLowerCase();
  var core = t.replace(/\+\s*smart\s*card/g, '').replace(/\s+/g, ' ').trim();
  var kind = 'other';
  if (/^(1\s*)?month(ly)?$|^1\s*monthly$|^30\s*(days|дн)$/.test(core)) kind = 'month';
  else if (/^3\s*months?$/.test(core)) kind = 'months3';
  else if (/^(1\s*week|7\s*days|weekly( pass)?)$/.test(core)) kind = 'week';
  else if (/^(1\s*)?day( pass)?$/.test(core)) kind = 'day';
  else if (/^10\s*days/.test(core) || /^10\s*flex/.test(core)) kind = 'ten';
  var floorOk = !fl || /^(1st|3rd)\s*floor$/.test(fl);   // Place Pass = 1st and 3rd floor only; 2nd floor rooms are special
  var standard = (kind === 'month' || kind === 'months3' || kind === 'week' || kind === 'day') && floorOk;
  return {kind: kind, standard: standard, label: rnClean_(type) || '?'};
}

var RN_OFFICE_NAME_RE = /(^|\b)(maksim|max)\b|\brenat\b|igor\s+gomon|\bbamboo\b/i;
function rnIsOffice_(r, inOfficeBlock) {
  if (inOfficeBlock) return true;
  if (/office/i.test(r.floor) || /office/i.test(r.type)) return true;
  if (RN_OFFICE_NAME_RE.test(r.name) || /maksim team|max team/i.test(r.h + ' ' + r.notes)) return true;
  return false;
}

function rnFirstName_(name) {
  var n = rnClean_(name);
  if (/\b(ltd|co\.|co,|company)\b/i.test(n)) return n;
  return n.split(/[\s(]/)[0] || n;
}

// Contact -> {phone: digits|null, raw}. Phone only if it starts with + or has >= 10 digits (wa.me needs the country code).
function rnPhone_(contact) {
  var raw = rnClean_(contact);
  if (!raw) return {phone: null, raw: ''};
  var parts = raw.split(/[\/,;]| or /);
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i].trim();
    if (!p || /@|[a-z]/i.test(p)) continue;
    if (!/^\+?[\d\s\-().]{6,}$/.test(p)) continue;
    var dg = p.replace(/\D/g, '');
    if (/^0\d{9}$/.test(dg)) dg = '66' + dg.slice(1);       // Thai local mobile
    if (p.charAt(0) === '+' || dg.length >= 10) return {phone: dg, raw: raw};
  }
  return {phone: null, raw: raw};
}

function rnWaLink_(phone, text) { return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text); }

// Client texts — verbatim from funnel-retention-2026-10-09.md §3 (name/date substituted).
function rnClientText_(bucket, r, todayYmd) {
  var name = rnFirstName_(r.name), date = rnDdMm_(r.finish), after = todayYmd >= RN_PRICE_SWITCH;
  if (bucket === 'd3') {
    if (!r.pass.standard) return 'Здравствуйте, ' + name + '. Ваш пасс в PLACE заканчивается ' + date + '. Продлить можно на ресепшене, условия — у Лены.';
    if (r.pass.kind === 'month' || r.pass.kind === 'months3')
      return 'Здравствуйте, ' + name + '. Ваш месяц в PLACE заканчивается ' + date + '. Продлить можно на ресепшене или переводом: месяц 6 000 ฿, 3 месяца 15 000 ฿. Если нужен офис — 30 000 ฿ в месяц или 20 000 ฿ на год, напишите, покажем что свободно.';
    return null; // week/day: §3 has no 3-day text (week gets §2 step 5 text tomorrow)
  }
  if (bucket === 'd1') {
    if (!r.pass.standard) return 'Завтра ваш последний день. Продлеваем? Условия — у Лены.';
    if (r.pass.kind === 'week') return 'Ваша неделя заканчивается завтра. Продлить можно на ресепшене: неделя 1 800 ฿, месяц 6 000 ฿.'; // §2 шаг 5
    return 'Завтра ваш последний день. Продлеваем?';
  }
  if (bucket === 'd0') {
    if (!r.pass.standard) return 'Здравствуйте, ' + name + '. Сегодня последний день вашего пасса. Условия продления — у Лены.';
    return 'Здравствуйте, ' + name + '. Сегодня последний день вашего пасса. Если вернётесь позже — час 50 ฿, ' +
      (after ? 'день 500 ฿' : 'день 400 ฿ (с 01.11 — 500 ฿)') + ', неделя 1 800 ฿.';
  }
  return null; // dm7: «Ещё сообщений не слать»
}

// Guard: only canon amounts, never 24/7.
function rnCheckText_(t) {
  if (!t) return;
  if (/24\s*\/\s*7/.test(t)) throw new Error('RN_247_IN_TEXT');
  var re = /(\d{1,3}(?: \d{3})*)\s*฿/g, m;
  while ((m = re.exec(t))) if (RN_ALLOWED_AMOUNTS.indexOf(m[1]) < 0) throw new Error('RN_NON_CANON_PRICE ' + m[1]);
}

// rows: values of «Лист1» A:J with Date cells already converted to 'yyyy-MM-dd'. -> {today, buckets, rowsSeen}
function rnCollect_(rows, todayYmd) {
  var want = {d3: rnAddDays_(todayYmd, 3), d1: rnAddDays_(todayYmd, 1), d0: todayYmd, dm7: rnAddDays_(todayYmd, -7)};
  var out = {today: todayYmd, dates: want, d3: [], d1: [], d0: [], dm7: [], offices: [], skipped: [], rowsSeen: 0};
  var block = '', officeBlock = false;
  for (var i = 1; i < rows.length; i++) {        // row 1 = header
    var v = rows[i];
    var a = rnClean_(v[0]);
    if (a) { block = a; officeBlock = /office/i.test(rnClean_(v[2]) + ' ' + rnClean_(v[3])); }
    var r = {row: i + 1, block: block, name: rnClean_(v[1]), type: rnClean_(v[2]), floor: rnClean_(v[3]),
      contact: rnClean_(v[6]), h: rnClean_(v[7]), notes: rnClean_(v[8])};
    if (!r.name || /^name$/i.test(r.name)) continue;
    out.rowsSeen++;
    var dt = rnResolveDates_(v[4], v[5], todayYmd);
    if (!dt.finish) continue;
    r.start = dt.start; r.finish = dt.finish;
    var bucket = null;
    for (var k in want) if (want[k] === r.finish) bucket = k;
    if (!bucket) continue;
    r.pass = rnPassKind_(r.type, r.floor);
    if (rnIsOffice_(r, officeBlock)) { r.bucket = bucket; out.offices.push(r); continue; }
    if (bucket === 'dm7' && r.h) { out.skipped.push({row: r.row, name: r.name, why: 'H filled: ' + r.h}); continue; }
    r.ph = rnPhone_(r.contact);
    r.text = rnClientText_(bucket, r, todayYmd);
    rnCheckText_(r.text);
    if (r.text && r.ph.phone) r.wa = rnWaLink_(r.ph.phone, r.text);
    out[bucket].push(r);
  }
  return out;
}

function rnTotal_(c) { return c.d3.length + c.d1.length + c.d0.length + c.dm7.length + c.offices.length; }

function rnGuestBlock_(r, n) {
  var lines = [n + ') ' + r.name + ' — ' + r.pass.label + (r.floor ? ', ' + r.floor : '') +
    (r.start ? ', ' + rnDdMm_(r.start) : '') + '–' + rnDdMm_(r.finish) + ' [row ' + r.row + ']'];
  if (!r.pass.standard) lines.push('⚠ Особый пасс / special pass: без цен, условия — у Лены (ask Lena, manager).');
  if (r.h) lines.push('H: ' + r.h);
  if (r.text) {
    lines.push(r.bucket === 'd1' ? 'Текст / Text:' : 'WhatsApp:');
    lines.push(r.text);
  }
  if (!r.text && r.bucket === 'd3' && r.pass.kind === 'week') lines.push('(неделя: WhatsApp завтра / week: WhatsApp tomorrow)');
  if (r.wa) lines.push('▶ ' + r.wa);
  else if (r.text) lines.push('(нет телефона в G / no phone in column G' + (r.ph && r.ph.raw ? ': ' + r.ph.raw : '') + ' — найдите в WhatsApp / Loyverse)');
  return lines.join('\n');
}

// -> array of message strings (parts), each <= RN_MAX_TG. Empty array if nothing to send.
function rnCompose_(c) {
  if (!rnTotal_(c)) return [];
  var head = '🔔 Продления / Renewals — ' + rnDdMm_(c.today) + '.' + c.today.slice(0, 4) + '\n' +
    'Ответьте боту по каждому гостю: «продлил» или «нет + причина», с именем. Ops запишет в колонку H.\n' +
    'Reply to this bot per guest with the name: «продлил» (renewed) or «нет + reason» (not renewed). Ops will fill column H.';
  var blocks = [];
  function section(title, list, bucket) {
    if (!list.length) return;
    blocks.push(title);
    list.forEach(function (r, i) { r.bucket = bucket; blocks.push(rnGuestBlock_(r, i + 1)); });
  }
  section('📅 Через 3 дня (' + rnDdMm_(c.dates.d3) + ') — отправить WhatsApp / Ends in 3 days — send WhatsApp', c.d3, 'd3');
  section('⏳ Завтра (' + rnDdMm_(c.dates.d1) + ') — спросить на ресепшене при встрече / Ends TOMORROW — ask at reception', c.d1, 'd1');
  section('🔴 Сегодня последний день (' + rnDdMm_(c.dates.d0) + ') — если не оплатил, отправить WhatsApp / Ends TODAY — if not paid, send WhatsApp', c.d0, 'd0');
  section('❓ Закончился 7 дней назад (' + rnDdMm_(c.dates.dm7) + '), в H пусто — клиенту НЕ писать, отметить «продлил / нет + причина» / Ended 7 days ago, no renewal recorded — do NOT message the guest, just reply', c.dm7, 'dm7');
  if (c.offices.length) {
    var when = {d3: 'через 3 дня / in 3 days', d1: 'завтра / tomorrow', d0: 'сегодня / today', dm7: '7 дней назад / 7 days ago'};
    blocks.push('🏢 Офисы — только напоминание, клиенту не писать (цена/сроки — George) / Offices — internal reminder only, no client text');
    c.offices.forEach(function (r) {
      blocks.push('• ' + r.name + (r.floor ? ' — ' + r.floor : '') + ': срок до ' + rnDdMm_(r.finish) + ' (' + when[r.bucket] + '). Проверить оплату/продление / check payment & renewal. [row ' + r.row + ']');
    });
  }
  var parts = [], cur = head;
  blocks.forEach(function (b) {
    if (b.length > RN_MAX_TG - 200) b = b.slice(0, RN_MAX_TG - 220) + '\n…(обрезано / cut)';
    if ((cur + '\n\n' + b).length > RN_MAX_TG - 20) { parts.push(cur); cur = b; } else cur += '\n\n' + b;
  });
  parts.push(cur);
  if (parts.length > 1) parts = parts.map(function (p, i) { return '(' + (i + 1) + '/' + parts.length + ') ' + p; });
  return parts;
}

// ---------------- Apps Script side ----------------

function rnTodayIct_() { return Utilities.formatDate(new Date(), RN_TZ, 'yyyy-MM-dd'); }

function rnReadRows_() {
  var ss = SpreadsheetApp.openById(RN_RESIDENT_SHEET_ID);
  var sh = ss.getSheetByName(RN_RESIDENT_TAB);
  if (!sh) throw new Error('RN_NO_TAB ' + RN_RESIDENT_TAB);
  var n = sh.getLastRow();
  if (n < 2) return [];
  var tz = ss.getSpreadsheetTimeZone() || RN_TZ;
  var vals = sh.getRange(1, 1, n, 10).getValues();
  var disp = sh.getRange(1, 5, n, 2).getDisplayValues();
  return vals.map(function (row, i) {
    return row.map(function (v, j) {
      if (v instanceof Date) return Utilities.formatDate(v, tz, 'yyyy-MM-dd');
      if ((j === 4 || j === 5) && typeof v === 'number') return disp[i][j - 4]; // plain number in a date column
      return v;
    });
  });
}

function rnBuild_(todayYmd) {
  var c = rnCollect_(rnReadRows_(), todayYmd);
  return {collected: c, parts: rnCompose_(c)};
}

function rnLog_(b) {
  var c = b.collected;
  Logger.log('RN today=' + c.today + ' rows=' + c.rowsSeen + ' d3(' + c.dates.d3 + ')=' + c.d3.length + ' d1(' + c.dates.d1 + ')=' + c.d1.length +
    ' d0=' + c.d0.length + ' dm7(' + c.dates.dm7 + ')=' + c.dm7.length + ' offices=' + c.offices.length + ' skipped=' + JSON.stringify(c.skipped));
  b.parts.forEach(function (p, i) { Logger.log('--- part ' + (i + 1) + '/' + b.parts.length + ' (' + p.length + ' chars) ---\n' + p); });
  if (!b.parts.length) Logger.log('RN_NOTHING_TO_SEND');
}

// Dry run: reads the sheet, logs the messages. Writes nothing.
function renewalsDryRun() { rnLog_(rnBuild_(rnTodayIct_())); }
function renewalsDryRunFor(ymd) { rnLog_(rnBuild_(ymd || rnTodayIct_())); }

// Trigger target. One message (split into parts only if > ~3800 chars) per admin per day, daytime only.
function renewalsDaily() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { Logger.log('RN_LOCK_BUSY'); return; }
  try {
    var today = rnTodayIct_(), hour = +Utilities.formatDate(new Date(), RN_TZ, 'H');
    if (hour < RN_DAY_FROM || hour >= RN_DAY_TO) { Logger.log('RN_NOT_DAYTIME hour=' + hour); return; }
    var props = PropertiesService.getScriptProperties();
    if (props.getProperty(RN_PROP_LAST) === today) { Logger.log('RN_ALREADY_SENT ' + today); return; }
    var b = rnBuild_(today);
    rnLog_(b);
    if (b.parts.length) {
      var ob = SpreadsheetApp.openById(RN_INBOX_SHEET_ID).getSheetByName(RN_OUTBOX_TAB);
      if (!ob) throw new Error('RN_NO_OUTBOX (run setupPhotos from Photo.gs first)');
      var rows = [];
      RN_RECIPIENTS.forEach(function (to) { b.parts.forEach(function (p) { rows.push([to.chat_id, '', p, '', '', '']); }); });
      ob.getRange(ob.getLastRow() + 1, 1, rows.length, 6).setValues(rows);
      Logger.log('RN_OUTBOX_ROWS ' + rows.length);
    }
    props.setProperty(RN_PROP_LAST, today);
  } finally { lock.releaseLock(); }
}

// Run ONCE from the editor. Removes existing renewalsDaily triggers, then creates one daily ~10:15 ICT.
function installRenewalsTrigger() {
  var removed = removeRenewalsTrigger();
  ScriptApp.newTrigger('renewalsDaily').timeBased().everyDays(1).atHour(RN_TRIGGER_HOUR).nearMinute(RN_TRIGGER_MINUTE)
    .inTimezone(RN_TZ).create();
  Logger.log('RN_TRIGGER_OK removed=' + removed + ' now=' + ScriptApp.getProjectTriggers().filter(function (t) { return t.getHandlerFunction() === 'renewalsDaily'; }).length);
}

function removeRenewalsTrigger() {
  var n = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'renewalsDaily') { ScriptApp.deleteTrigger(t); n++; }
  });
  return n;
}

if (typeof module !== 'undefined') module.exports = {rnCollect_: rnCollect_, rnCompose_: rnCompose_, rnParseCell_: rnParseCell_,
  rnResolveDates_: rnResolveDates_, rnPhone_: rnPhone_, rnPassKind_: rnPassKind_, setTrustYear: function (b) { RN_TRUST_CELL_YEAR = b; }};
