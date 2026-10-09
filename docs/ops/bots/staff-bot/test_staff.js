// Offline tests for StaffCommands.gs (no network, no real sheets). Run: TZ=Asia/Bangkok node test_staff.js
// Loads BookingsToday (bookings-today.gs), Tuya.gs and StaffCommands.gs into ONE vm context, like Apps Script's shared global scope.
'use strict';
process.env.TZ = 'Asia/Bangkok';
const vm = require('vm'), fs = require('fs'), path = require('path');
const HERE = __dirname;
const first = list => list.filter(Boolean).filter(f => fs.existsSync(f))[0] || list.filter(Boolean)[0];
const SRC = {
  staff: path.join(HERE, 'StaffCommands.gs'),
  // repo copy lives in docs/ops/bots/staff-bot → ../../handover/bookings-today.gs; box copy → absolute repo path
  bookings: first([process.env.BOOKINGS_GS, path.join(HERE, '../../handover/bookings-today.gs'), '/workspace/place-coworking/place-coworking/docs/ops/handover/bookings-today.gs']),
  tuya: first([process.env.TUYA_GS, '/home/box/place-reports/tuya/Tuya.gs'])     // Lead's Tuya.gs (not in the repo)
};
const FIXED = Date.parse('2026-10-09T18:44:00+07:00');
class FDate extends Date { constructor(...a) { if (!a.length) super(FIXED); else super(...a); } static now() { return FIXED; } }

let pass = 0, fail = 0; const fails = [];
function ok(cond, name, extra) { if (cond) pass++; else { fail++; fails.push(name + (extra ? ' :: ' + extra : '')); } }

function fmt(d, tz, f) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'}).formatToParts(d).map(x => [x.type, x.value]));
  if (f === 'H') return String(+p.hour);
  return f.replace('yyyy', p.year).replace('MM', p.month).replace('dd', p.day).replace('HH', p.hour).replace('mm', p.minute).replace('ss', p.second);
}

// ---- in-memory Sheets ----
function Sheet(name, rows) {
  this.name = name; this.rows = rows || []; this.fmtCalls = []; this.frozen = 0;
}
Sheet.prototype = {
  getName() { return this.name; },
  getLastRow() { let n = this.rows.length; while (n && this.rows[n - 1].every(v => v === '' || v == null)) n--; return n; },
  getLastColumn() { return this.rows.reduce((a, r) => Math.max(a, r.length), 0); },
  setFrozenRows(n) { this.frozen = n; },
  appendRow(r) { this.rows.push(r.map(String)); },
  getDataRange() { return this.getRange(1, 1, Math.max(1, this.getLastRow()), Math.max(1, this.getLastColumn())); },
  getRange(r, c, nr, nc) {
    const sh = this; nr = nr || 1; nc = nc || 1;
    const read = () => { const out = []; for (let i = 0; i < nr; i++) { const row = sh.rows[r - 1 + i] || []; const o = []; for (let j = 0; j < nc; j++) o.push(row[c - 1 + j] == null ? '' : String(row[c - 1 + j])); out.push(o); } return out; };
    return {
      getValues: read, getDisplayValues: read,
      setNumberFormat(f) { sh.fmtCalls.push({r, c, nr, nc, f, at: sh.rows.length}); return this; },
      setValues(v) { for (let i = 0; i < nr; i++) { while (sh.rows.length < r + i) sh.rows.push([]); const row = sh.rows[r - 1 + i]; for (let j = 0; j < nc; j++) row[c - 1 + j] = String(v[i][j]); } sh.lastWriteFmt = sh.fmtCalls.length && sh.fmtCalls[sh.fmtCalls.length - 1].r === r ? sh.fmtCalls[sh.fmtCalls.length - 1].f : null; return this; }
    };
  }
};
function Spreadsheet(id, sheets) { this.id = id; this.sheets = sheets; }
Spreadsheet.prototype = {
  getSheetByName(n) { return this.sheets.filter(s => s.name === n)[0] || null; },
  getSheets() { return this.sheets; }, getNumSheets() { return this.sheets.length; },
  insertSheet(n, i) { const s = new Sheet(n, []); this.sheets.splice(i == null ? this.sheets.length : i, 0, s); return s; }
};

function meetingGrid() {
  const head = ['Time', 'Mon 28/09', 'Tue 29/09', 'Wed 30/09', 'October\n2026'];
  for (let d = 1; d <= 31; d++) { const dt = new Date(2026, 9, d); head.push(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dt.getDay()] + ' ' + String(d).padStart(2, '0') + '/10'); }
  const rows = [['Free of charge'], ['Rent a space'], ['Community event'], head];
  for (let h = 9; h <= 23; h++) rows.push([String(h).padStart(2, '0') + ':00']);
  const col10 = head.indexOf('Sat 10/10');
  const at = (hh, txt) => { const r = rows.findIndex(x => x[0] === hh); rows[r][col10] = txt; };
  at('14:00', 'Kirill 14.00-15.00 /Price 250/hour');
  at('17:00', 'Alexei');
  return rows;
}
function plainGrid(first) { const head = ['Time', 'September\n2026', 'Wed 30/09', 'October\n2026']; for (let d = 1; d <= 20; d++) head.push('Day ' + String(d).padStart(2, '0') + '/10'); const rows = [[first], [''], [''], head]; for (let h = 9; h <= 22; h++) rows.push([String(h).padStart(2, '0') + ':00']); return rows; }

function makeCtx(opts) {
  opts = opts || {};
  const sends = [], logs = [], rnCalls = [];
  const inbox = new Spreadsheet('INBOX', [new Sheet('queue', [['received_ict']]), new Sheet('staff-cmd', [['ts', 'chat', 'chat_id', 'from', 'command', 'result']])]);
  const events = new Spreadsheet('EVENTS', [new Sheet('Meeting room', meetingGrid()), new Sheet('Library', plainGrid('x')), new Sheet('ART Room ', plainGrid('x')),
    new Sheet('Workshop room', plainGrid('x')), new Sheet('Office room-4 (GREEN)', plainGrid('x')), new Sheet('1 floor', plainGrid('x')), new Sheet('4 floor', plainGrid('x')), new Sheet('6 floor', plainGrid('x'))]);
  const props = {};
  const ctx = {
    console, JSON, Math, Number, String, Object, Array, RegExp, Error, Date: FDate, Intl,
    SHEET_ID: 'INBOX',
    Logger: {log: x => logs.push(String(x))},
    PropertiesService: {getScriptProperties: () => ({getProperty: k => (k in props ? props[k] : null), setProperty: (k, v) => { props[k] = String(v); }, deleteProperty: k => { delete props[k]; }})},
    CacheService: {getScriptCache: () => ({get: () => null, put: () => {}, remove: () => {}})},
    Utilities: {formatDate: fmt, sleep: () => {}},
    UrlFetchApp: {fetch: (url, o) => { if (/sendMessage/.test(url)) sends.push(JSON.parse(o.payload)); else throw new Error('unexpected fetch ' + url); return {getContentText: () => '{"ok":true,"result":{"message_id":5}}', getResponseCode: () => 200}; }},
    SpreadsheetApp: {openById: id => {
      if (id === '1uMHYp6d-Ji9VQj5xtESiXummBNX9bC8vTruPRQLs8jw' || id === 'INBOX') return inbox;
      if (id === '1BSwm4sY-ksXjFNEEsAdyiWmUDzgbQlJpL_dh9JIdZAc') { if (opts.eventsThrows) throw new Error('no access to Events'); return events; }
      throw new Error('unknown sheet ' + id);
    }}
  };
  vm.createContext(ctx);
  if (!opts.noBookings) vm.runInContext(fs.readFileSync(SRC.bookings, 'utf8'), ctx, {filename: 'bookings-today.gs'});
  vm.runInContext(fs.readFileSync(SRC.tuya, 'utf8'), ctx, {filename: 'Tuya.gs'});
  if (!opts.noRenewals) {
    ctx.rnTodayIct_ = () => fmt(new FDate(), 'Asia/Bangkok', 'yyyy-MM-dd');
    ctx.rnBuild_ = d => { rnCalls.push(d); return {collected: {}, parts: d === '2026-10-09' ? ['🔔 Renewals 2026-10-09: Anna (day pass) today'] : []}; };
  }
  vm.runInContext(fs.readFileSync(SRC.staff, 'utf8'), ctx, {filename: 'StaffCommands.gs'});
  return {ctx, sends, logs, rnCalls, inbox, events, props};
}
const GEORGE = {id: 8503184147, first_name: 'George', username: 'george_x'};
let mid = 100;
function dm(text, from) { return {message_id: ++mid, date: 0, from: from || GEORGE, chat: {id: 8503184147, type: 'private'}, text}; }
function grp(text, extra) { return Object.assign({message_id: ++mid, date: 0, from: GEORGE, chat: {id: -100777, type: 'supergroup', title: 'PLACE Team'}, text}, extra || {}); }

// ---------- A. sample phrases (same list as staffDryRun) ----------
{
  const {ctx} = makeCtx();
  const S = ctx.SC_DRY_SAMPLES;
  S.forEach(c => { const d = ctx.scDecide_(ctx.scDryMsg_(c[0], c[2])); const got = d ? d.intent : false; ok(got === c[1], 'sample ' + JSON.stringify(c[0]) + (c[2] ? ' ' + JSON.stringify(c[2]) : ''), 'got ' + got + ' want ' + c[1]); });
  const f = ctx.staffDryRun();
  ok(f === 0, 'staffDryRun failures=0', 'failures=' + f);
  console.log('samples: ' + S.length + ' (positive ' + S.filter(c => c[1]).length + ', negative ' + S.filter(c => !c[1]).length + ')');
}

// ---------- B. hook order: device phrases fall through to Tuya (tuyaParse_ non-null) ----------
{
  const {ctx, sends, inbox} = makeCtx();
  const dev = ['свет 4 вкл', 'весь свет выкл', 'кондиционер 2 выкл', 'лампа 3 красный', '/light', '/ac status', 'light 3 on', 'ac all off', 'статус', 'душ выкл', 'подкаст 1 вкл', 'кондей 1 24', 'all off', 'помощь'.replace('помощь', 'статус свет')];
  const before = inbox.getSheetByName('staff-cmd').rows.length;
  dev.forEach(t => {
    const handled = ctx.handleStaffCommand_(dm(t), 'TOK', false);
    ok(handled === false, 'device phrase not handled by staff: ' + t);
    ok(ctx.tuyaParse_(t) !== null, 'Tuya parses device phrase: ' + t);
  });
  ['ไฟ ปิด', 'ปิดแอร์', 'лампа', 'Включи кондей'].forEach(t => ok(ctx.handleStaffCommand_(dm(t), 'TOK', false) === false, 'device word → false: ' + t));
  ok(sends.length === 0 && inbox.getSheetByName('staff-cmd').rows.length === before, 'device phrases: nothing sent, nothing logged');
  ok(ctx.handleStaffCommand_(dm('Светлана придёт в 15'), 'TOK', false) === false, '«Светлана» is not a light word but also not an intent → false');
  ok(ctx.scHasDeviceWords_('Светлана придёт') === false, '«Светлана» not a device word');
}

// ---------- C. end-to-end replies + log ----------
{
  const E = makeCtx(); const {ctx, sends, inbox, rnCalls} = E; const log = inbox.getSheetByName('staff-cmd');
  let h = ctx.handleStaffCommand_(dm('цены'), 'TOK', false);
  ok(h === true && sends.length === 1, 'цены handled + 1 send');
  ok(/ЦЕНЫ/.test(sends[0].text) && /400 ฿ \(до 31\.10; с 01\.11 — 500 ฿\)/.test(sends[0].text) && sends[0].reply_to_message_id === mid, 'RU prices text + reply_to');
  ok(log.rows[0][6] === 'intent' && log.rows[0][7] === 'mode', 'staff-cmd header extended with intent|mode', JSON.stringify(log.rows[0]));
  const lr = log.rows[log.rows.length - 1];
  ok(lr[4] === 'цены' && /^ok \| 💳 ЦЕНЫ/.test(lr[5]) && lr[6] === 'prices' && lr[7] === 'plain/ru' && lr[1] === 'личка боту', 'log row: command, reply excerpt, intent, mode', JSON.stringify(lr));
  ctx.handleStaffCommand_(dm('ราคาเท่าไหร่คะ'), 'TOK', false);
  ok(/ค่ะ/.test(sends[sends.length - 1].text) && /ชั่วโมงละ 50/.test(sends[sends.length - 1].text), 'Thai prices, polite');
  ctx.handleStaffCommand_(dm('office price'), 'TOK', false);
  ok(/^🏢 OFFICE/.test(sends[sends.length - 1].text) && /20 000/.test(sends[sends.length - 1].text), 'EN office reply');
  ctx.handleStaffCommand_(dm('адрес'), 'TOK', false);
  ok(/59\/2 Chao Fah Tawan Tok Rd/.test(sends[sends.length - 1].text) && /08:00–23:00/.test(sends[sends.length - 1].text), 'hours/address reply');
  ctx.handleStaffCommand_(dm('кто продлевается'), 'TOK', false);
  ok(rnCalls[rnCalls.length - 1] === '2026-10-09' && /Anna/.test(sends[sends.length - 1].text), 'renewals today via rnBuild_');
  ctx.handleStaffCommand_(dm('кто продлевается завтра'), 'TOK', false);
  ok(rnCalls[rnCalls.length - 1] === '2026-10-10' && /Продления 2026-10-10: никого/.test(sends[sends.length - 1].text), 'renewals tomorrow → none text');
  ctx.handleStaffCommand_(dm('брони завтра'), 'TOK', false);
  ok(/📅 Bookings 10\.10/.test(sends[sends.length - 1].text) && /Kirill/.test(sends[sends.length - 1].text), 'bookings tomorrow via bookingsToday_', sends[sends.length - 1].text);
  ctx.handleStaffCommand_(dm('/prices'), 'TOK', false);
  ok(/PRICES \(canon/.test(sends[sends.length - 1].text), 'slash /prices still works (EN)');
  ok(ctx.handleStaffCommand_(dm('/light'), 'TOK', false) === false, '/light → false (Tuya)');
  ctx.handleStaffCommand_(dm('помощь'), 'TOK', false);
  ok(/бронь переговорка/.test(sends[sends.length - 1].text), 'RU help lists phrases');
  // groups
  const n0 = sends.length;
  ok(ctx.handleStaffCommand_(grp('цены'), 'TOK', false) === false && sends.length === n0, 'group without mention → false, no send');
  ok(ctx.handleStaffCommand_(grp('@PlaceLeadBot цены'), 'TOK', false) === true, 'group with @mention → handled');
  ok(ctx.handleStaffCommand_(grp('брони сегодня', {reply_to_message: {message_id: 1, from: {is_bot: true, username: 'PlaceLeadBot'}}}), 'TOK', false) === true, 'group reply-to-bot → handled');
  ok(ctx.handleStaffCommand_(grp('/prices'), 'TOK', false) === true, 'group /prices (slash) still handled');
  ok(ctx.handleStaffCommand_(grp('@PlaceLeadBot @someone цены'), 'TOK', false) === false, 'group: also addressed to someone else → false');
  // stranger, edit
  const n1 = sends.length, l1 = log.rows.length;
  ok(ctx.handleStaffCommand_(dm('цены', {id: 1, username: 'rand'}), 'TOK', false) === false && sends.length === n1 && log.rows.length === l1, 'stranger → false, nothing sent/logged');
  ok(ctx.handleStaffCommand_(dm('цены'), 'TOK', true) === true && sends.length === n1, 'edited → swallowed, no send');
  ok(/^edit ignored/.test(log.rows[log.rows.length - 1][5]), 'edit logged as «edit ignored»');
  ok(ctx.handleStaffCommand_(dm('Привет, как дела?'), 'TOK', false) === false, 'chit-chat → false');
  ok(ctx.handleStaffCommand_(dm('help me please'), 'TOK', false) === false, '«help me please» → false (may be urgent)');
  ok(ctx.handleStaffCommand_({message_id: 1, chat: {id: 1, type: 'private'}, from: GEORGE, photo: [{}]}, 'TOK', false) === false, 'no text → false');
  ok(ctx.handleStaffCommand_(null, 'TOK', false) === false, 'null message → false');
  // after 01.11 prices switch
  const nov = ctx.scPrices_(new Date('2026-11-02T10:00:00+07:00'), 'ru');
  ok(/день 500 ฿/.test(nov) && !/до 31\.10/.test(nov) && /10 дней 3 500 ฿/.test(nov), 'prices switch on 01.11');
}

// ---------- D. bookings: write, overlap, usage ----------
{
  const {ctx, sends, events, inbox} = makeCtx();
  const last = () => sends[sends.length - 1].text;
  ok(!events.getSheetByName('Брони бот'), 'no «Брони бот» before');
  let h = ctx.handleStaffCommand_(dm('бронь переговорка завтра 15:00-16:00 Иван +66812345678'), 'TOK', false);
  const bt = events.getSheetByName('Брони бот');
  ok(h === true && bt && bt.rows[0].join('|') === 'created_ict|date|start|end|room|name_contact|by|raw_text|status' && bt.frozen === 1, 'tab created with header');
  ok(bt && bt.rows.length === 2 && bt.rows[1].slice(1, 6).join('|') === '2026-10-10|15:00|16:00|Meeting room|Иван +66812345678' && bt.rows[1][8] === 'new' && /George @george_x \(8503184147\)/.test(bt.rows[1][6]), 'row written', bt && JSON.stringify(bt.rows[1]));
  ok(bt && bt.lastWriteFmt === '@', 'row written as plain text (setNumberFormat @ before setValues)');
  ok(/✅ Бронь записана/.test(last()) && /Meeting room · сб 10\.10 · 15:00–16:00/.test(last()), 'confirmation RU', last());
  ok(events.getSheetByName('Meeting room').rows[4].length <= 40 && events.getSheetByName('Meeting room').rows.every(r => !r.some(v => /Иван/.test(v))), 'existing grid untouched');
  const lg = inbox.getSheetByName('staff-cmd'); const lr = lg.rows[lg.rows.length - 1];
  ok(lr[6] === 'book' && /^booked row 2 \| ✅/.test(lr[5]), 'booking logged with intent + reply', JSON.stringify(lr));
  // overlap with bot row
  ctx.handleStaffCommand_(dm('бронь переговорка завтра 15:30 Олег'), 'TOK', false);
  ok(/⛔ Не записал/.test(last()) && /15:00–16:00 Иван/.test(last()) && bt.rows.length === 2, 'conflict with «Брони бот» row, nothing written', last());
  // overlap with grid (range in cell text)
  ctx.handleStaffCommand_(dm('бронь переговорка завтра 14:30-15:00 Олег'), 'TOK', false);
  ok(/Kirill/.test(last()) && bt.rows.length === 2, 'conflict with grid (Kirill 14.00-15.00)', last());
  // overlap with grid (slot only)
  ctx.handleStaffCommand_(dm('book meeting room tomorrow 17:30 Peter'), 'TOK', false);
  ok(/⛔ Not saved/.test(last()) && /Alexei/.test(last()) && bt.rows.length === 2, 'conflict with grid slot (Alexei 17:00)', last());
  // adjacent slot is fine
  ctx.handleStaffCommand_(dm('бронь переговорка завтра 16:00-17:00 Олег'), 'TOK', false);
  ok(/✅/.test(last()) && bt.rows.length === 3, 'adjacent 16:00-17:00 ok');
  // other room, same time; podcast has no grid
  ctx.handleStaffCommand_(dm('бронь подкаст завтра 18:00 Олег'), 'TOK', false);
  ok(/✅/.test(last()) && /конец не указан → 1 час/.test(last()) && bt.rows[3][4] === 'Podcast' && bt.rows[3][3] === '19:00', 'podcast default 1h', last());
  ctx.handleStaffCommand_(dm('бронь подкаст завтра 18:30 Анна'), 'TOK', false);
  ok(/⛔/.test(last()) && bt.rows.length === 4, 'podcast overlap with bot row');
  // cancelled rows don't block
  bt.rows[3][8] = 'отмена';
  ctx.handleStaffCommand_(dm('бронь подкаст завтра 18:30 Анна'), 'TOK', false);
  ok(/✅/.test(last()) && bt.rows.length === 5, 'cancelled row does not block');
  // EN, Thai, dd.mm, case
  ctx.handleStaffCommand_(dm('book meeting room 12.10 at 10:00 for Ivan'), 'TOK', false);
  ok(/✅ Booking saved/.test(last()) && bt.rows[5][1] === '2026-10-12' && bt.rows[5][5] === 'Ivan', 'EN booking with dd.mm', JSON.stringify(bt.rows[5]));
  ctx.handleStaffCommand_(dm('จอง ห้องประชุม พรุ่งนี้ 19:00-20:00 Somchai 0812345678'), 'TOK', false);
  ok(/บันทึกการจองแล้วค่ะ/.test(last()) && bt.rows[6][1] === '2026-10-10' && bt.rows[6][2] === '19:00', 'Thai booking', last());
  ctx.handleStaffCommand_(dm('Бронь Библиотека 12.10 10:00-12:00 Анна'), 'TOK', false);
  ok(/✅/.test(last()) && bt.rows[7][4] === 'Library', 'capitalised RU, Library grid checked');
  ctx.handleStaffCommand_(dm('бронь переговорка с 11:00 до 12:30 Мария @maria'.replace(' @maria', ' tg maria')), 'TOK', false);
  ok(/✅/.test(last()) && bt.rows[8][1] === '2026-10-09' && bt.rows[8][3] === '12:30' && bt.rows[8][5] === 'Мария tg maria', '«с … до …», today default', JSON.stringify(bt.rows[8]));
  // usage replies (handled = true, nothing written)
  const n = bt.rows.length;
  [['бронь переговорка Иван', 'нет времени'], ['бронь переговорка 15:00', 'нет имени'], ['бронь переговорка 01.10.2026 15:00 Иван', 'дата в прошлом'],
   ['бронь переговорка 16:00-15:00 Иван', 'конец раньше начала'], ['бронь 15:00 Иван', 'не нашёл комнату'], ['бронь переговорка подкаст 15:00 Иван', 'больше одной комнаты'],
   ['бронь переговорка 31.02 15:00 Иван', 'непонятная дата']].forEach(([t, why]) => {
    const hh = ctx.handleStaffCommand_(dm(t), 'TOK', false);
    ok(hh === true && /❓ Не понял бронь/.test(last()) && last().indexOf(why) >= 0 && /бронь переговорка 15:00-16:00 Иван/.test(last()), 'usage: ' + t, last().slice(0, 80));
  });
  ok(bt.rows.length === n, 'usage replies wrote nothing');
  ctx.handleStaffCommand_(dm('брони завтра'), 'TOK', false);
  ok(/Брони бот/.test(last()) && /15:00–16:00 Meeting room — Иван \+66812345678 \(new\)/.test(last()) && !/Podcast — Олег/.test(last()), 'bookings list includes «Брони бот» rows (not cancelled)', last());
  // edited booking is not re-written
  ok(ctx.handleStaffCommand_(dm('бронь переговорка завтра 20:00 Иван'), 'TOK', true) === true && bt.rows.length === n, 'edited booking not written');
}

// ---------- E. degraded modes ----------
{
  const {ctx, sends} = makeCtx({noBookings: true, noRenewals: true});
  ctx.handleStaffCommand_(dm('брони сегодня'), 'TOK', false);
  ok(/не установлено/.test(sends[sends.length - 1].text), 'BookingsToday missing → note');
  ctx.handleStaffCommand_(dm('renewals'), 'TOK', false);
  ok(/not installed/.test(sends[sends.length - 1].text), 'Renewals.gs missing → note');
  ctx.handleStaffCommand_(dm('бронь переговорка завтра 15:00 Иван'), 'TOK', false);
  ok(/✅/.test(sends[sends.length - 1].text) && /not checked \(BookingsToday not installed\)/.test(sends[sends.length - 1].text), 'booking without grid reader → written with note');
}
{
  const {ctx, sends, inbox} = makeCtx({eventsThrows: true});
  const h = ctx.handleStaffCommand_(dm('бронь переговорка завтра 15:00 Иван'), 'TOK', false);
  ok(h === false && /⚠️ Не получилось, передал Ops/.test(sends[sends.length - 1].text), 'sheet error → fail message + false (falls through to Ops)');
  const lr = inbox.getSheetByName('staff-cmd').rows.slice(-1)[0];
  ok(/^ERROR/.test(lr[5]), 'error logged');
}

// ---------- F. module exports (plain require) ----------
{
  const m = require(SRC.staff);
  ok(typeof m.handleStaffCommand_ === 'function' && typeof m.scParseBooking_ === 'function' && Array.isArray(m.SC_DRY_SAMPLES), 'module.exports present');
}

console.log('tests: ' + (pass + fail) + ', passed: ' + pass + ', failures: ' + fail);
if (fail) { console.log(fails.join('\n')); process.exit(1); }
