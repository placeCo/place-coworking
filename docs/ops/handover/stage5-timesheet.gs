/**
 * Place Coworking — Stage 5 (7.1.14 Timesheet). DRAFT TEMPLATE, NOT DEPLOYED.
 *
 * Reads a Schedule-26-style sheet (one tab per month: Jan..Dec;
 * columns: Position | Name | day1..dayN | Total Hrs.), computes hours per staff
 * member and builds a timesheet email for the accountant.
 *
 * PAYROLL RULES (Aiz 30.09.2026, kb/ops/payroll-rules.md b3a8c49):
 *  - payroll period = calendar month (1st .. last day);
 *  - the timesheet goes to the accountant on the 28th (CUTOFF_DAY);
 *  - leave taken after the 28th is deducted in NEXT month's payroll.
 * So a run on the 28th covers the current month: days 1..28 are the timesheet table; days 29..end (not yet worked)
 * are listed as «after cutoff → next month adjustments» (planned shifts / leave), and the previous month's
 * days 29..end are listed as «adjustments from previous month» (leave actually taken after last cutoff).
 *
 * SAFETY:
 *  - The script NEVER sends email. There is no GmailApp.sendEmail / MailApp call.
 *  - dryRun() only writes to the log.
 *  - createTimesheetDraft() creates a Gmail DRAFT only, and only when the Script
 *    Property DRAFT_ENABLED = 'true'. A human reviews and sends it manually.
 *  - Read-only access to the sheet (no writes).
 *
 * SETUP (after George OK; run from info@placecoworking.com):
 *  1. Schedule 26 must be owned by / shared with info@ (right now it is owned
 *     by Aiz's personal gmail and info@ has view only; view is enough to read,
 *     but ownership must move before 30.09).
 *  1b. Project Settings -> Time zone = (GMT+07:00) Bangkok.
 *  2. Project Settings -> Script Properties (all optional except the addresses):
 *     SCHEDULE_SHEET_ID   default 1eQTyAIjlnGlyYy_5FDfDOAbT5NXaAeYAR_QPnWWBrZc (Schedule 26)
 *     SHEET_YEAR          year of SCHEDULE_SHEET_ID, default 2026
 *     SHEET_ID_BY_YEAR    JSON, e.g. {"2025":"<id>","2027":"<id>"} for periods crossing a year
 *     TAB_NAMES           JSON array of 12 tab names, default ["Jan",...,"Dec"]
 *     POSITION_COL        default A
 *     NAME_COL            default B
 *     FIRST_DAY_COL       default '' = auto-detect the row with day numbers 1..31
 *     DAY_HEADER_ROW      default '' = auto-detect (scans first HEADER_SCAN_ROWS rows)
 *     HEADER_SCAN_ROWS    default 10
 *     PERIOD_MODE         'month' (default): calendar month; run on/after CUTOFF_DAY -> current month, before -> previous month
 *                         'custom': PERIOD_START_DAY (21) .. PERIOD_END_DAY (20), the old 21–20 scheme
 *     CUTOFF_DAY          default 28 (timesheet sent to the accountant; later leave -> next month)
 *     PERIOD_FROM / PERIOD_TO  optional explicit ISO dates (yyyy-mm-dd), override the above (cutoff = PERIOD_TO)
 *     BREAK_HOURS         unpaid break deducted per shift, default 0 (to confirm)
 *     EXCLUDE_NAMES       comma list of names to skip (e.g. owners)
 *     ACCOUNTANT_TO       accountant address (NOT stored in repo)
 *     ACCOUNTANT_CC       cc address(es), comma separated (NOT stored in repo)
 *     GREETING            default 'Dear Khun Pat,' (new accountant, 30.09.2026)
 *     SUBJECT_PREFIX      default 'Place Coworking — timesheet'
 *     DRAFT_ENABLED       'true' to allow createTimesheetDraft(); anything else = dry
 */

var TZ = 'Asia/Bangkok';
var DEFAULT_SHEET_ID = '1eQTyAIjlnGlyYy_5FDfDOAbT5NXaAeYAR_QPnWWBrZc';
var DEFAULT_TABS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Non-shift marks seen in Schedule 26. Order matters: first match wins.
var MARKS = [
  {code: 'UNPAID', re: /(leave\s*with\s*out\s*money|without\s*money|unpaid|ลาไม่รับเงิน)/i},
  {code: 'SICK',   re: /(sick|ป่วย)/i},
  {code: 'ANNUAL', re: /(annual|พักร้อน)/i},
  {code: 'DOCTOR', re: /(doctor)/i},
  {code: 'OFF',    re: /^(off|day\s*off|หยุด|-|x)$/i}
];

// ---------- entry points ----------

/** Log-only run: computes the period, hours and the email text. Nothing is created. */
function dryRun() {
  var res = buildTimesheet_(cfg_());
  Logger.log(res.subject);
  Logger.log(res.text);
  if (res.warnings.length) Logger.log('WARNINGS:\n' + res.warnings.join('\n'));
  return res;
}

/** Creates a Gmail DRAFT for the accountant (never sends). Requires DRAFT_ENABLED=true. */
function createTimesheetDraft() {
  var c = cfg_();
  var res = buildTimesheet_(c);
  if (c.draftEnabled !== 'true') {
    Logger.log('DRAFT_ENABLED is not "true" -> dry run only.\n' + res.subject + '\n' + res.text);
    return 'DRY';
  }
  if (!c.to) throw new Error('ACCOUNTANT_TO is empty');
  var csv = Utilities.newBlob(res.csv, 'text/csv', 'timesheet_' + res.fromIso + '_' + res.toIso + '.csv');
  var d = GmailApp.createDraft(c.to, res.subject, res.text, {cc: c.cc || '', htmlBody: res.html, attachments: [csv]});
  Logger.log('DRAFT_CREATED ' + d.getId() + ' — review in Gmail Drafts and send manually.');
  return d.getId();
}

// ---------- core ----------

function cfg_() {
  var p = PropertiesService.getScriptProperties();
  var g = function (k, d) { var v = p.getProperty(k); return (v === null || v === '') ? d : v; };
  return {
    sheetId: g('SCHEDULE_SHEET_ID', DEFAULT_SHEET_ID),
    sheetYear: Number(g('SHEET_YEAR', '2026')),
    sheetByYear: JSON.parse(g('SHEET_ID_BY_YEAR', '{}')),
    tabs: JSON.parse(g('TAB_NAMES', JSON.stringify(DEFAULT_TABS))),
    posCol: colIdx_(g('POSITION_COL', 'A')),
    nameCol: colIdx_(g('NAME_COL', 'B')),
    firstDayCol: g('FIRST_DAY_COL', '') ? colIdx_(g('FIRST_DAY_COL', '')) : null,
    dayHeaderRow: g('DAY_HEADER_ROW', '') ? Number(g('DAY_HEADER_ROW', '')) : null,
    scanRows: Number(g('HEADER_SCAN_ROWS', '10')),
    startDay: Number(g('PERIOD_START_DAY', '21')),
    endDay: Number(g('PERIOD_END_DAY', '20')),
    from: g('PERIOD_FROM', ''), to_: g('PERIOD_TO', ''),
    mode: g('PERIOD_MODE', 'month'), cutoff: Number(g('CUTOFF_DAY', '28')),
    breakHours: Number(g('BREAK_HOURS', '0')),
    exclude: g('EXCLUDE_NAMES', '').split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(String),
    to: g('ACCOUNTANT_TO', ''), cc: g('ACCOUNTANT_CC', ''),
    greeting: g('GREETING', 'Dear Khun Pat,'),
    prefix: g('SUBJECT_PREFIX', 'Place Coworking — timesheet'),
    draftEnabled: g('DRAFT_ENABLED', 'false')
  };
}

/** Payroll period. Default (PERIOD_MODE=month): calendar month; on/after the cutoff day -> current month, else previous.
 *  Returns {from, to, cut}: the table covers from..cut; cut+1..to = after cutoff (next month adjustments). */
function period_(c) {
  if (c.from && c.to_) { var t = isoDate_(c.to_); return {from: isoDate_(c.from), to: t, cut: t}; }
  var now = new Date(Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd'T'00:00:00"));
  var y = now.getFullYear(), m = now.getMonth();
  if (c.mode !== 'custom') {
    if (now.getDate() < c.cutoff) m -= 1;
    var first = new Date(y, m, 1), last = new Date(y, m + 1, 0);
    var cut = new Date(first.getFullYear(), first.getMonth(), Math.min(c.cutoff, last.getDate()));
    return {from: first, to: last, cut: cut};
  }
  if (c.startDay === 1) { var f = new Date(y, m - 1, 1), l = new Date(y, m, 0); return {from: f, to: l, cut: l}; }
  // old scheme: period ends on endDay of month M; take the latest endDay that is < today
  var end = new Date(y, m, c.endDay);
  if (end >= now) end = new Date(y, m - 1, c.endDay);
  var from = new Date(end.getFullYear(), end.getMonth() - 1, c.startDay);
  return {from: from, to: end, cut: end};
}

/** Reads Schedule 26 for days from..to (may span months). */
function collect_(c, from, to, warnings) {
  var people = {}, order = [], byMonth = {};
  for (var d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    var key = d.getFullYear() + '-' + d.getMonth();
    (byMonth[key] = byMonth[key] || {y: d.getFullYear(), m: d.getMonth(), days: []}).days.push(d.getDate());
  }
  Object.keys(byMonth).forEach(function (k) {
    var bm = byMonth[k];
    var id = c.sheetByYear[String(bm.y)] || (bm.y === c.sheetYear ? c.sheetId : null);
    if (!id) { warnings.push('No sheet for year ' + bm.y + ' (set SHEET_ID_BY_YEAR); days skipped: ' + bm.days.join(',')); return; }
    var sh = SpreadsheetApp.openById(id).getSheetByName(c.tabs[bm.m]);
    if (!sh) { warnings.push('Tab "' + c.tabs[bm.m] + '" not found in ' + id); return; }
    readMonth_(sh, bm, c, people, order, warnings);
  });
  return {people: people, order: order};
}

/** One line per person with leave / planned shifts in a side period (after cutoff, or previous month's tail). */
function sideLines_(res, withShifts) {
  var out = [];
  res.order.forEach(function (k) {
    var p = res.people[k], parts = [];
    if (withShifts && p.shifts) parts.push(p.shifts + ' shift(s) planned');
    if (p.ANNUAL) parts.push('annual ' + p.ANNUAL);
    if (p.SICK) parts.push('sick ' + p.SICK);
    if (p.UNPAID) parts.push('unpaid ' + p.UNPAID);
    if (p.DOCTOR) parts.push('doctor ' + p.DOCTOR);
    if (p.unknown.length) parts.push('unrecognised: ' + p.unknown.join('; '));
    if (parts.length) out.push(p.name + ': ' + parts.join(', '));
  });
  return out;
}

function buildTimesheet_(c) {
  var per = period_(c), warnings = [];
  var main = collect_(c, per.from, per.cut, warnings), people = main.people, order = main.order;
  var afterFrom = new Date(per.cut.getFullYear(), per.cut.getMonth(), per.cut.getDate() + 1);
  var after = afterFrom <= per.to ? collect_(c, afterFrom, per.to, warnings) : null;
  var prevEnd = new Date(per.from.getFullYear(), per.from.getMonth(), 0), prevFrom = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), c.cutoff + 1);
  var prev = (c.mode !== 'custom' && !(c.from && c.to_) && prevFrom <= prevEnd) ? collect_(c, prevFrom, prevEnd, warnings) : null;
  var D = function (x) { return fmt_(x, 'dd.MM.yyyy'); };
  var afterLines = after ? sideLines_(after, true) : [], prevLines = prev ? sideLines_(prev, false) : [];
  var afterTitle = after ? 'After cutoff ' + fmt_(afterFrom, 'dd.MM') + '–' + D(per.to) + ' (not yet worked → next month adjustments):' : '';
  var prevTitle = prev ? 'Adjustments from previous month ' + fmt_(prevFrom, 'dd.MM') + '–' + D(prevEnd) + ' (leave after last cutoff):' : '';

  var fromIso = fmt_(per.from, 'yyyy-MM-dd'), toIso = fmt_(per.to, 'yyyy-MM-dd');
  var head = ['Position', 'Name', 'Shifts', 'Hours', 'Annual leave (days)', 'Sick (days)', 'Unpaid leave (days)', 'Doctor', 'Unrecognised cells'];
  var rows = order.map(function (k) {
    var p = people[k];
    return [p.position, p.name, p.shifts, round2_(p.hours), p.ANNUAL, p.SICK, p.UNPAID, p.DOCTOR, p.unknown.join('; ')];
  });
  var range = D(per.from) + '–' + D(per.to) + (per.cut < per.to ? ' (counted to ' + D(per.cut) + ')' : '');
  var subject = c.prefix + ' ' + D(per.from) + '–' + D(per.to);
  var sections = (after ? '\n\n' + afterTitle + '\n' + (afterLines.length ? afterLines.map(function (l) { return '• ' + l; }).join('\n') : '• none') : '') +
    (prev ? '\n\n' + prevTitle + '\n' + (prevLines.length ? prevLines.map(function (l) { return '• ' + l; }).join('\n') : '• none') : '');
  var text = c.greeting + '\n\nPlease find the staff timesheet for the period ' + range + ' (from Schedule 26).\n\n' +
    [head.join(' | ')].concat(rows.map(function (r) { return r.join(' | '); })).join('\n') + sections +
    '\n\nUnpaid leave days are listed for the deduction (monthly salary / 30 per day; SSO 5% is calculated after the deduction, cap 875). Leave after the ' + c.cutoff + 'th is deducted in the next month.' +
    '\nThe same table is attached as CSV. Please let us know if anything needs to be corrected.\n\nBest regards,\nPlace Coworking';
  var htmlList = function (title, lines) { return '<p><b>' + esc_(title) + '</b></p><ul>' + (lines.length ? lines : ['none']).map(function (l) { return '<li>' + esc_(l) + '</li>'; }).join('') + '</ul>'; };
  var html = '<p>' + esc_(c.greeting) + '</p><p>Please find the staff timesheet for the period <b>' + esc_(range) + '</b> (from Schedule 26).</p>' +
    '<table border="1" cellpadding="4" style="border-collapse:collapse"><tr>' + head.map(function (h) { return '<th>' + esc_(h) + '</th>'; }).join('') + '</tr>' +
    rows.map(function (r) { return '<tr>' + r.map(function (v) { return '<td>' + esc_(String(v)) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>' +
    (after ? htmlList(afterTitle, afterLines) : '') + (prev ? htmlList(prevTitle, prevLines) : '') +
    '<p>Unpaid leave days are listed for the deduction (monthly salary / 30 per day; SSO 5% is calculated after the deduction, cap 875). Leave after the ' + c.cutoff + 'th is deducted in the next month.<br>The same table is attached as CSV. Please let us know if anything needs to be corrected.</p><p>Best regards,<br>Place Coworking</p>';
  var csvRows = [head].concat(rows);
  if (after) { csvRows.push([]); csvRows.push([afterTitle]); afterLines.forEach(function (l) { csvRows.push(['', l]); }); }
  if (prev) { csvRows.push([]); csvRows.push([prevTitle]); prevLines.forEach(function (l) { csvRows.push(['', l]); }); }
  var csv = csvRows.map(function (r) { return r.map(csvCell_).join(','); }).join('\n');
  return {subject: subject, text: text, html: html, csv: csv, rows: rows, warnings: warnings, fromIso: fromIso, toIso: toIso,
    cutIso: fmt_(per.cut, 'yyyy-MM-dd'), afterCutoff: afterLines, prevAdjustments: prevLines};
}

function readMonth_(sh, bm, c, people, order, warnings) {
  var vals = sh.getDataRange().getValues();
  var disp = sh.getDataRange().getDisplayValues();
  var hdr = findDayHeader_(vals, c);
  if (!hdr) { warnings.push(sh.getName() + ': day header row (1..31) not found; set DAY_HEADER_ROW / FIRST_DAY_COL'); return; }
  var lastPos = '';
  for (var r = hdr.row + 1; r < vals.length; r++) {
    var name = String(disp[r][c.nameCol] || '').trim();
    var pos = String(disp[r][c.posCol] || '').trim();
    if (pos) lastPos = pos;
    if (!name || /^name$/i.test(name) || /total/i.test(name)) continue;
    if (c.exclude.indexOf(name.toLowerCase()) >= 0) continue;
    var key = name.toLowerCase();
    if (!people[key]) { people[key] = {name: name, position: lastPos, shifts: 0, hours: 0, ANNUAL: 0, SICK: 0, UNPAID: 0, DOCTOR: 0, OFF: 0, unknown: []}; order.push(key); }
    var p = people[key];
    bm.days.forEach(function (day) {
      var col = hdr.cols[day];
      if (col === undefined) return;
      var raw = String(disp[r][col] || '').trim();
      if (!raw) return;
      var h = shiftHours_(raw, vals[r][col]);
      if (h !== null) { p.shifts++; p.hours += Math.max(0, h - c.breakHours); return; }
      for (var i = 0; i < MARKS.length; i++) if (MARKS[i].re.test(raw)) { p[MARKS[i].code]++; return; }
      p.unknown.push(bm.y + '-' + pad_(bm.m + 1) + '-' + pad_(day) + ' "' + raw + '"');
    });
  }
}

/** Finds the row whose cells contain day numbers 1..N (numbers, "1", or Date cells). */
function findDayHeader_(vals, c) {
  var rows = c.dayHeaderRow ? [c.dayHeaderRow - 1] : range_(0, Math.min(c.scanRows, vals.length));
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i], cols = {}, n = 0;
    for (var j = (c.firstDayCol !== null ? c.firstDayCol : 0); j < vals[r].length; j++) {
      var v = vals[r][j], day = null;
      if (v instanceof Date) day = Number(fmt_(v, 'd'));
      else if (/^\d{1,2}$/.test(String(v).trim())) day = Number(v);
      if (day && day >= 1 && day <= 31 && cols[day] === undefined) { cols[day] = j; n++; }
    }
    if (n >= 28 && cols[1] !== undefined) return {row: r, cols: cols};
  }
  return null;
}

/** "8:00-17:00", "8.00 – 17.00", "8-17", "23:00-8:00" (overnight) or a plain number of hours. */
function shiftHours_(raw, val) {
  if (typeof val === 'number' && val > 0 && val <= 24) return val;
  var m = raw.replace(/\s+/g, '').match(/^(\d{1,2})(?:[:.](\d{2}))?(?:น\.)?[-–—~to]+(\d{1,2})(?:[:.](\d{2}))?(?:น\.)?$/i);
  if (!m) return null;
  var a = Number(m[1]) + Number(m[2] || 0) / 60, b = Number(m[3]) + Number(m[4] || 0) / 60;
  if (a > 24 || b > 24) return null;
  var h = b - a; if (h <= 0) h += 24;
  return h;
}

// ---------- helpers ----------
function colIdx_(letters) { var s = String(letters).toUpperCase().trim(), n = 0; for (var i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64); return n - 1; }
function fmt_(d, f) { return Utilities.formatDate(d, TZ, f); }
function isoDate_(s) { var p = s.split('-'); return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])); }
function pad_(n) { return (n < 10 ? '0' : '') + n; }
function round2_(x) { return Math.round(x * 100) / 100; }
function range_(a, b) { var r = []; for (var i = a; i < b; i++) r.push(i); return r; }
function esc_(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function csvCell_(v) { v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
