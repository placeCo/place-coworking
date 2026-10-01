/* Node harness: runs the TEST Apps Script files (00..90) against JSON snapshots of the TEST copies.
 * Usage: node run-harness.js <snapshotDir> [nowISO]   -> prints results + writes <snapshotDir>/writes.json
 * Mocks: SpreadsheetApp (snapshot-backed, records appendRow/setValues/insertSheet), PropertiesService (memory),
 * Utilities.formatDate (Asia/Bangkok), Logger. Real Google services are never called. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = process.argv[2], NOW = new Date(process.argv[3] || '2026-09-30T10:07:00+07:00');
const cfgSrc = fs.readFileSync(path.join(__dirname, '..', '00-TestConfig.gs'), 'utf8');
const ids = {}; for (const m of cfgSrc.matchAll(/(\w+):\s*'([\w-]{30,})'/g)) ids[m[2]] = m[1];
const files = {resident: 'resident.json', schedule: 'schedule.json', events: 'events.json', inbox: 'inbox.json'};
const writes = [], RealDate = Date;
function rev(v) { return v && v.__date ? new FDate(v.__date + (v.__date.length <= 19 ? '+07:00' : '')) : v; }
function book(id) {
  const key = ids[id]; if (!key) throw new Error('harness: unknown id ' + id);
  const data = JSON.parse(fs.readFileSync(path.join(dir, files[key]), 'utf8'));
  const sheet = (name) => {
    const t = data[name]; if (!t) return null;
    return {
      getName: () => name,
      getDataRange: () => ({getValues: () => t.values.map(r => r.map(rev)), getDisplayValues: () => t.display.map(r => r.slice())}),
      appendRow: (row) => { t.values.push(row); t.display.push(row.map(String)); writes.push({book: key, id, tab: name, op: 'appendRow', row}); },
      getRange: (r, c, nr, nc) => ({setValue: (v) => writes.push({book: key, id, tab: name, op: 'setValue', r, c, v}), setValues: (vals) => { vals.forEach((vr, i) => { t.values[r - 1 + i] = vr; t.display[r - 1 + i] = vr.map(String); }); writes.push({book: key, id, tab: name, op: 'setValues', r, c, vals}); }}),
      deleteRow: (n) => { t.values.splice(n - 1, 1); t.display.splice(n - 1, 1); writes.push({book: key, id, tab: name, op: 'deleteRow', r: n}); },
      getLastRow: () => t.values.length
    };
  };
  return {getSheets: () => Object.keys(data).map(sheet), getSheetByName: sheet, insertSheet: (n) => { data[n] = {values: [], display: []}; writes.push({book: key, id, tab: n, op: 'insertSheet'}); return sheet(n); }};
}
const cache = {};
function fmt(d, f) {
  const o = new Intl.DateTimeFormat('en-GB', {timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short', hourCycle: 'h23'}).formatToParts(d).reduce((a, p) => (a[p.type] = p.value, a), {});
  return f.replace(/'T'/g, '\u0001').replace(/yyyy/g, o.year).replace(/yy/g, o.year.slice(2)).replace(/MM/g, o.month).replace(/dd/g, o.day).replace(/HH/g, o.hour).replace(/mm/g, o.minute).replace(/ss/g, o.second).replace(/EEE/g, o.weekday).replace(/^H$/, String(+o.hour)).replace(/^d$/, String(+o.day)).replace(/\u0001/g, 'T');
}
class FDate extends RealDate { constructor(...a) { if (a.length === 0) super(NOW); else super(...a); } static now() { return +NOW; } }
const props = {}, logs = [], fetches = [], triggers = [];
const ctx = {Date: FDate, JSON, Math, String, Number, Object, Array, RegExp, isNaN, Error, parseInt, parseFloat, console,
  Logger: {log: x => logs.push(x)},
  Utilities: {formatDate: (d, tz, f) => fmt(d, f), newBlob: (c, t, n) => ({c, t, n})},
  PropertiesService: {getScriptProperties: () => ({getProperty: k => (k in props ? props[k] : null), setProperty: (k, v) => { props[k] = String(v); }, deleteProperty: k => { delete props[k]; }})},
  SpreadsheetApp: {openById: id => cache[id] || (cache[id] = book(id))},
  GmailApp: {createDraft: () => { throw new Error('REAL GmailApp reached — stub failed'); }}, MailApp: {},
  UrlFetchApp: {fetch: (u, o) => { const pl = o && o.payload ? JSON.parse(o.payload) : {}; fetches.push({url: String(u).replace(/bot[^/]+/, 'bot***'), chat_id: pl.chat_id, text: pl.text});
    return {getResponseCode: () => 200, getContentText: () => JSON.stringify({ok: true, result: {username: 'PlaceLeadBot'}})}; }},
  ScriptApp: {getProjectTriggers: () => triggers.slice(), deleteTrigger: t => { triggers.splice(triggers.indexOf(t), 1); },
    newTrigger: h => { const spec = {h}; const b = {timeBased: () => b, inTimezone: z => (spec.tz = z, b), everyDays: n => (spec.every = n, b), onMonthDay: d => (spec.monthDay = d, b), atHour: x => (spec.hour = x, b), nearMinute: m => (spec.min = m, b), create: () => { const t = {getHandlerFunction: () => h, spec}; triggers.push(t); return t; }}; return b; }}};
vm.createContext(ctx);
const src = fs.readdirSync(path.join(__dirname, '..')).filter(f => /^\d\d-.*\.gs$/.test(f)).sort();
src.forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, {filename: f}));
vm.runInContext("T_RUNNER = 'node-harness';", ctx);
const names = ['test_guard', 'test_relay', 'test_techRoute', 'test_stage6', 'test_issues', 'test_issuesBridgeHook', 'test_issuesThread', 'test_bookings', 'test_keyholders', 'test_timesheet', 'test_leave', 'test_payments', 'test_cash', 'cleanupTestFixtures'];
if (process.env.SCHED) { names.length = 0; props.TG_TOKEN = '123456:FAKE_TOKEN_FOR_HARNESS'; if (process.env.SCHED === 'chat') { props.GEORGE_CHAT_ID = '111111'; if (process.env.LENA !== '0') props.LENA_CHAT_ID = '222222'; }
  ['setupTestProperties', 'sendTestPing', 'job_stage6', 'job_coverage', 'job_bookings', 'job_issuesMorning', 'job_issuesEvening', 'job_timesheet', 'job_cashReminder', 'job_paymentReminders', 'simulateCashReply', 'simulateSakPickup'].forEach(n => names.push(n)); }
const results = {};
if (process.env.DEBUG_FN) { try { vm.runInContext(process.env.DEBUG_FN, ctx); } catch (e) { console.log(e.stack); } process.exit(0); }
names.forEach(n => { results[n] = vm.runInContext(n + '()', ctx); });
if (process.env.SCHED) { vm.runInContext('installTestTriggers()', ctx); }
fs.writeFileSync(path.join(dir, process.env.SCHED ? 'writes-sched.json' : 'writes.json'), JSON.stringify({now: NOW.toISOString(), writes, fetches, triggers: triggers.map(t => t.spec), props: Object.assign({}, props, {TG_TOKEN: '***'})}, null, 1));
for (const n of names) { const r = results[n]; console.log('=== ' + n + ': ' + r.status); console.log(typeof r.result === 'string' ? r.result : JSON.stringify(r.result, null, 1)); if (r.log.length) console.log('--- log ---\n' + r.log.join('\n').slice(0, 4000)); }
console.log('\nWRITES:', writes.map(w => w.book + '/' + w.tab + ' ' + w.op).join(', '));
console.log('FETCHES:', fetches.map(f => f.url.replace(/https:\/\/api.telegram.org\//, '') + ' chat=' + f.chat_id).join(', '));
console.log('TRIGGERS:', JSON.stringify(triggers.map(t => t.spec)));
