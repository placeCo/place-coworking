/**
 * Place Coworking — G-13 Staff leave requests through the bot. DRAFT, NOT LIVE (scheme per George 30.09.2026 10:40;
 * staged in the TEST project only, writes only Schedule 26 TEST).
 *
 * Flow:
 *   1. Employee writes to @PlaceLeadBot: «/leave <vacation|dayoff> dd.mm[-dd.mm] [reason]»
 *      (also: отпуск / выходной / พักร้อน / หยุด; optional sick / unpaid / doctor).
 *   2. leaveRequest_() adds a row to tab «Leave» and returns ONE approval card per approver: BOTH Lena and George
 *      (Script Property LEAVE_APPROVERS, default "George,Lena").
 *   3. Either approver answers «/approve L…» or «/reject L… reason». The first decision wins; a later one gets
 *      «already approved/rejected by …». Anyone not in LEAVE_APPROVERS is refused.
 *   4. leaveDecide_() updates the row, returns the message for the employee and a note for the other approver,
 *      and on approve marks the days in Schedule 26: vacation -> «Annual leave», day off -> «off» (sick -> «Sick leave»,
 *      unpaid -> «Leave with out money», doctor -> «Doctor»; the words stage5-timesheet understands).
 *      Only empty / «off» cells are filled; a cell with a shift is NOT overwritten, it is reported as a conflict.
 * Pure functions: sending is done by the caller (bridge hook later; TEST: relay to George's DM).
 *
 * Script Properties: LEAVE_SHEET_ID (spreadsheet with tab «Leave»), SCHEDULE_SHEET_ID, LEAVE_APPROVERS.
 */
var LV_TZ = 'Asia/Bangkok';
var LV_TABS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var LV_HEAD = ['id', 'requested_at', 'employee', 'tg_user', 'tg_chat_id', 'type', 'from', 'to', 'days', 'reason', 'status', 'decided_by', 'decided_at', 'schedule_written', 'conflicts', 'sent_to'];
var LV_MARK = {vacation: 'Annual leave', dayoff: 'off', sick: 'Sick leave', unpaid: 'Leave with out money', doctor: 'Doctor'};
var LV_LABEL = {vacation: 'Отпуск / Vacation', dayoff: 'Выходной / Day off', sick: 'Больничный / Sick', unpaid: 'За свой счёт / Unpaid', doctor: 'Врач / Doctor'};
var LV_ALIAS = {vacation: 'vacation', annual: 'vacation', 'отпуск': 'vacation', 'พักร้อน': 'vacation', dayoff: 'dayoff', off: 'dayoff',
  'выходной': 'dayoff', 'หยุด': 'dayoff', sick: 'sick', unpaid: 'unpaid', doctor: 'doctor'};
var LV_OFF_RE = /^(off|day\s*off|หยุด|-|x)?$/i;

function lvProps_() { return PropertiesService.getScriptProperties(); }
function lvApprovers_() { return String(lvProps_().getProperty('LEAVE_APPROVERS') || 'George,Lena').split(',').map(function (x) { return x.trim(); }).filter(String); }
function lvSheet_() {
  var ss = SpreadsheetApp.openById(lvProps_().getProperty('LEAVE_SHEET_ID')), sh = ss.getSheetByName('Leave');
  if (!sh) { sh = ss.insertSheet('Leave'); sh.appendRow(LV_HEAD); }
  return sh;
}

/** «/leave vacation 05.10-07.10 family» -> {type, from, to, days, comment} or {error}. */
function leaveParse_(text, now) {
  var m = String(text).trim().match(/^\/leave\s+(\S+)\s+(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?(?:\s*[-–]\s*(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?)?\s*(.*)$/i);
  var type = m && LV_ALIAS[m[1].toLowerCase()];
  if (!m || !type) return {error: 'Format: /leave vacation|dayoff dd.mm[-dd.mm] [reason]  (отпуск / выходной)'};
  var y = Number(Utilities.formatDate(now || new Date(), LV_TZ, 'yyyy'));
  var from = new Date(Number(m[4] || y), Number(m[3]) - 1, Number(m[2]));
  var to = m[5] ? new Date(Number(m[7] || m[4] || y), Number(m[6]) - 1, Number(m[5])) : from;
  if (to < from) return {error: 'End date is before start date'};
  var days = Math.round((to - from) / 86400000) + 1;
  if (days > 31) return {error: 'Max 31 days per request'};
  return {type: type, from: from, to: to, days: days, comment: m[8] || ''};
}

/** Registers the request. Returns {id, cards: [{to, text}] for EVERY approver, reply, error}. */
function leaveRequest_(emp, text, now) {
  now = now || new Date();
  var r = leaveParse_(text, now);
  if (r.error) return {error: r.error, reply: '❗ ' + r.error};
  var id = 'L' + Utilities.formatDate(now, LV_TZ, 'yyMMddHHmmss');
  var d = function (x) { return Utilities.formatDate(x, LV_TZ, 'dd.MM.yyyy'); };
  lvSheet_().appendRow([id, Utilities.formatDate(now, LV_TZ, 'yyyy-MM-dd HH:mm'), emp.name, emp.user || '', String(emp.chatId || ''),
    r.type, d(r.from), d(r.to), r.days, r.comment, 'pending', '', '', '', '', lvApprovers_().join(', ')]);
  var text = '🗓 Запрос ' + id + '\n' + emp.name + ': ' + LV_LABEL[r.type] + ', ' + d(r.from) + (r.days > 1 ? '–' + d(r.to) : '') +
    ' (' + r.days + ' дн.)' + (r.comment ? '\nПричина: ' + r.comment : '') +
    '\n\nРешает любой из: ' + lvApprovers_().join(' / ') + '.\nОтвет: /approve ' + id + '  или  /reject ' + id + ' причина';
  return {id: id, cards: lvApprovers_().map(function (a) { return {to: a, text: text}; }),
    reply: '✅ Запрос ' + id + ' отправлен ' + lvApprovers_().join(' и ') + '.'};
}

/** decision 'approve' | 'reject' by one of LEAVE_APPROVERS. First decision wins.
 *  Returns {status, employeeMsg, otherMsg: {to, text}, written, conflicts}. */
function leaveDecide_(id, decision, by, reason, now) {
  now = now || new Date();
  var who = lvApprovers_().filter(function (a) { return a.toLowerCase() === String(by).trim().toLowerCase(); })[0];
  if (!who) return {status: 'not allowed', reply: '⛔ Решать могут только: ' + lvApprovers_().join(', ')};
  var sh = lvSheet_(), v = sh.getDataRange().getValues();
  for (var r = 1; r < v.length; r++) {
    if (String(v[r][0]) !== id) continue;
    if (v[r][10] !== 'pending') return {status: 'already ' + v[r][10] + ' by ' + v[r][11], reply: 'ℹ️ ' + id + ' уже ' + v[r][10] + ' (' + v[r][11] + ')'};
    var row = v[r], res = {written: 0, conflicts: []};
    row[10] = decision === 'approve' ? 'approved' : 'rejected'; row[11] = who; row[12] = Utilities.formatDate(now, LV_TZ, 'yyyy-MM-dd HH:mm');
    if (decision === 'approve') { res = leaveWriteSchedule_(row[2], row[5], lvDate_(row[6]), lvDate_(row[7])); row[13] = res.written; row[14] = res.conflicts.join('; '); }
    sh.getRange(r + 1, 1, 1, LV_HEAD.length).setValues([row]);
    var msg = decision === 'approve'
      ? '✅ ' + LV_LABEL[row[5]] + ' ' + id + ' одобрен (' + row[6] + '–' + row[7] + ', ' + who + '). В графике отмечено дней: ' + res.written + (res.conflicts.length ? '. Лена/Place Ops проверят смены: ' + res.conflicts.join(', ') : '')
      : '❌ ' + LV_LABEL[row[5]] + ' ' + id + ' отклонён (' + who + ')' + (reason ? ': ' + reason : '');
    var others = lvApprovers_().filter(function (a) { return a !== who; });
    return {status: row[10], employeeMsg: msg, written: res.written, conflicts: res.conflicts,
      otherMsg: others.map(function (a) { return {to: a, text: 'ℹ️ ' + id + ' (' + row[2] + '): ' + row[10] + ' — решил(а) ' + who + '. Решать больше не нужно.'}; })};
  }
  return {status: 'not found'};
}

function leaveWriteSchedule_(name, type, from, to) {
  var ss = SpreadsheetApp.openById(lvProps_().getProperty('SCHEDULE_SHEET_ID')), mark = LV_MARK[type], written = 0, conflicts = [], cache = {};
  for (var d = new Date(from); d <= to; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    var tab = LV_TABS[d.getMonth()], t = cache[tab] || (cache[tab] = lvTab_(ss.getSheetByName(tab), name));
    var label = Utilities.formatDate(d, LV_TZ, 'dd.MM');
    if (!t.sh) { conflicts.push(label + ' нет вкладки ' + tab); continue; }
    if (t.row < 0) { conflicts.push(label + ' нет строки «' + name + '»'); continue; }
    var col = t.cols[d.getDate()];
    if (col === undefined) { conflicts.push(label + ' нет колонки дня'); continue; }
    var cur = String(t.disp[t.row][col] || '').trim();
    if (!LV_OFF_RE.test(cur) && cur !== mark) { conflicts.push(label + ' стоит «' + cur + '»'); continue; }
    t.sh.getRange(t.row + 1, col + 1).setValue(mark); written++;
  }
  return {written: written, conflicts: conflicts};
}
function lvTab_(sh, name) {
  if (!sh) return {sh: null};
  var vals = sh.getDataRange().getValues(), disp = sh.getDataRange().getDisplayValues(), cols = {}, hr = -1;
  for (var r = 0; r < Math.min(10, vals.length) && hr < 0; r++) {
    var c = {}, n = 0;
    for (var j = 0; j < vals[r].length; j++) { var x = vals[r][j]; if (x instanceof Date || Object.prototype.toString.call(x) === '[object Date]') { if (c[x.getDate()] === undefined) { c[x.getDate()] = j; n++; } } }
    if (n >= 28) { hr = r; cols = c; }
  }
  var row = -1;
  for (var r2 = hr + 1; r2 < disp.length && hr >= 0; r2++) if (String(disp[r2][1]).trim().toLowerCase() === String(name).trim().toLowerCase()) { row = r2; break; }
  return {sh: sh, cols: cols, row: row, disp: disp};
}
function lvDate_(s) { var p = String(s).split('.'); return new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0])); }
