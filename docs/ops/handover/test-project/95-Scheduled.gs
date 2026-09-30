/**
 * PLACE automations TEST — scheduled TEST mode (George OK 30.09.2026 10:02).
 * Production sheets READ-ONLY, writes only to Place Inbox TEST (Issues, Log), every outgoing message relayed to
 * George's and Lena's DMs with @PlaceLeadBot (see T_relay_). Triggers: installTestTriggers() / removeTestTriggers().
 *
 * One-time setup (see TEST-PLAN.md §2b):
 *   1. Project Settings ▸ Script properties ▸ add TG_TOKEN = <token of @PlaceLeadBot>  (never in code, never in Log).
 *      TECH_CHAT_ID = chat id of the TG group «Тех вопросы» (real target of the issues digests; unknown yet, may stay empty).
 *      LENA_CHAT_ID = Lena's private chat id with @PlaceLeadBot (every test message goes to George AND Lena).
 *      Optional: GEORGE_CHAT_ID (if known), GEORGE_TG_USERNAME (e.g. without @), CASH_ANCHOR_DATE (yyyy-mm-dd).
 *   2. Run setupTestProperties()  -> checks the token (getMe), finds/sets GEORGE_CHAT_ID, writes a summary to Log.
 *   3. Run sendTestPing()          -> George and Lena get «🧪 ТЕСТ … ping».
 *   4. Run installTestTriggers()   -> 7 time triggers (Asia/Bangkok).
 */
var T_JOBS = [
  // handler,            kind,     when (Asia/Bangkok; Apps Script runs within ~±15 min of nearMinute)
  ['job_stage6',         'daily',  9, 5,  'stage6 office reminders + electricity tasks'],
  ['job_coverage',       'daily',  9, 10, 'schedule-coverage'],
  ['job_bookings',       'daily',  10, 7, 'bookings-today (10:07 summary)'],
  ['job_issuesMorning',  'daily',  10, 7, 'issues summary morning → TG group «Тех вопросы» (TECH_CHAT_ID)'],
  ['job_issuesEvening',  'daily',  23, 10, 'issues summary evening → TG group «Тех вопросы» (TECH_CHAT_ID)'],
  ['job_timesheet',      'month28', 9, 30, 'timesheet draft for the accountant (28th; period = current month, 29..end = next month adjustments)'],
  ['job_cashReminder',   'every3', 20, 0, 'cash-deposit reminder for the evening admin (every 3 days)']
];

// ---------- setup ----------
function setupTestProperties() {
  return T_run_('setup', 'setupTestProperties', function () {
    var p = PropertiesService.getScriptProperties(), out = [];
    var tok = p.getProperty('TG_TOKEN');
    if (!tok) out.push('TG_TOKEN: NOT SET. Add it by hand: Project Settings ▸ Script properties ▸ TG_TOKEN. Relay stays LOG ONLY.');
    else {
      var r = UrlFetchApp.fetch('https://api.telegram.org/bot' + tok + '/getMe', {muteHttpExceptions: true});
      var ok = r.getResponseCode() === 200 && JSON.parse(r.getContentText()).ok;
      out.push('TG_TOKEN: set, getMe ' + (ok ? 'OK @' + JSON.parse(r.getContentText()).result.username : 'FAILED HTTP ' + r.getResponseCode()));
    }
    var chat = p.getProperty('GEORGE_CHAT_ID');
    if (!chat) {
      var c = T_findGeorgeChatId_();
      out.push('GEORGE_CHAT_ID lookup in production queue (read-only): ' + c.note);
      if (c.id) { p.setProperty('GEORGE_CHAT_ID', c.id); chat = c.id; }
    }
    out.push('GEORGE_CHAT_ID: ' + (chat ? chat : 'NOT SET → George gets nothing. George: press /start in @PlaceLeadBot, then run setupTestProperties() again, or set GEORGE_CHAT_ID by hand.'));
    var lena = p.getProperty('LENA_CHAT_ID');
    out.push('TECH_CHAT_ID («Тех вопросы», issues digests): ' + (p.getProperty('TECH_CHAT_ID') || 'NOT SET → WARN in Log; in production the digests would not be sent'));
    out.push('LENA_CHAT_ID: ' + (lena ? lena : 'NOT SET → test messages go to George only (warning in Log). Set Script Property LENA_CHAT_ID by hand.'));
    if (!p.getProperty('CASH_ANCHOR_DATE')) { p.setProperty('CASH_ANCHOR_DATE', Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd')); }
    out.push('CASH_ANCHOR_DATE: ' + p.getProperty('CASH_ANCHOR_DATE'));
    out.push('Triggers now: ' + ScriptApp.getProjectTriggers().map(function (t) { return t.getHandlerFunction(); }).join(', '));
    return out.join('\n');
  });
}

/** George's private chat id: rows «личка боту» in the production queue (bridge log), matched by GEORGE_TG_USERNAME or name. */
function T_findGeorgeChatId_() {
  var p = PropertiesService.getScriptProperties(), user = String(p.getProperty('GEORGE_TG_USERNAME') || '').replace(/^@/, '').toLowerCase();
  var sh = T_SS.openById(P_IDS.inbox).getSheetByName('queue');
  if (!sh) return {id: null, note: 'queue tab not found'};
  var v = sh.getDataRange().getDisplayValues(), found = {};
  for (var r = 1; r < v.length; r++) {
    var chat = v[r][1], id = String(v[r][2] || ''), name = v[r][3], un = String(v[r][4] || '').replace(/^@/, '').toLowerCase();
    if (!/личка боту/i.test(chat) || !/^\d+$/.test(id)) continue;
    if ((user && un === user) || (!user && /george|geo\b|джордж/i.test(name))) found[id] = name + (un ? ' @' + un : '');
  }
  var ids = Object.keys(found);
  if (ids.length === 1) return {id: ids[0], note: 'found ' + ids[0] + ' (' + found[ids[0]] + ')'};
  return {id: null, note: ids.length ? 'ambiguous: ' + JSON.stringify(found) + ' → set GEORGE_TG_USERNAME' : 'no private chat from George yet'};
}

/** Test ping to George + Lena through the same relay as the jobs (header «🧪 ТЕСТ» + «Куда ушло бы»). */
function sendTestPing() {
  var prev = T_CTX; T_CTX = {relay: true, mail: null};
  try {
    return T_run_('ping', 'sendTestPing', function () {
      var p = PropertiesService.getScriptProperties();
      if (!p.getProperty('TG_TOKEN')) throw new Error('TG_TOKEN missing → run setupTestProperties()');
      if (!T_relayTargets_().ids.length) throw new Error('GEORGE_CHAT_ID / LENA_CHAT_ID missing → run setupTestProperties()');
      var r = T_relay_('никуда (проверка связи)', 'ping from «PLACE automations TEST», ' + T_now_() + ' ICT');
      if (!/^relayed( (George|Lena):200(,200)*)+$/.test(r)) throw new Error('ping: ' + r);
      return 'ping ' + r;
    });
  } finally { T_CTX = prev; }
}

// ---------- triggers ----------
function installTestTriggers() {
  removeTestTriggers();
  var made = T_JOBS.map(function (j) {
    var b = ScriptApp.newTrigger(j[0]).timeBased().inTimezone('Asia/Bangkok');
    if (j[1] === 'daily') b = b.everyDays(1).atHour(j[2]).nearMinute(j[3]);
    else if (j[1] === 'every3') b = b.everyDays(3).atHour(j[2]).nearMinute(j[3]);
    else if (j[1] === 'month28') b = b.onMonthDay(28).atHour(j[2]).nearMinute(j[3]);
    b.create();
    return j[0] + ' ' + j[1] + ' ' + j[2] + ':' + ('0' + j[3]).slice(-2);
  });
  T_log_('triggers', 'installTestTriggers', 'OK', made.join('\n'));
  return made;
}
function removeTestTriggers() {
  var names = T_JOBS.map(function (j) { return j[0]; }), n = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) { if (names.indexOf(t.getHandlerFunction()) >= 0) { ScriptApp.deleteTrigger(t); n++; } });
  T_log_('triggers', 'removeTestTriggers', 'OK', 'removed ' + n);
  return n;
}

// ---------- jobs (trigger handlers) ----------
function ST6_prop_(k) { return T_props_('ST6').getScriptProperties().getProperty(k); }
function job_stage6() {
  return T_job_('stage6', 'job_stage6 (prod Resident info read-only)', function (to) {
    if (to === 'info@placecoworking.com') return 'Place Ops и George, email info@ (черновик, дайджест офисов)';
    return 'арендатор ' + to + ', email (черновик на info@)';
  }, function () {
    var reg = T_SS.openById(ST6_prop_('RESIDENT_SHEET_ID')).getSheetByName(ST6_prop_('TAB_NAME'));
    if (!reg || reg.getLastRow() < 2) return 'Office rent is empty in production Resident info: nothing to check (no relay)';
    var r = ST6.run_('draft');
    var rows = T_SS.openById(T_IDS.inbox).getSheetByName('Issues').getDataRange().getValues(), today = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd');
    rows.filter(function (x) { return /^elec:/.test(x[0]) && String(x[1]).indexOf(today) === 0 && String(x[14] || '') !== 'fixture'; }).forEach(function (x) {
      T_relay_('Лена в личку', '⚡ ' + x[4] + '\n(задача в Issues: ' + x[0] + ')');
    });
    return r;
  });
}
function job_coverage() {
  return T_job_('coverage', 'job_coverage (prod Schedule 26 read-only)', function (to) {
    return 'Лена и Place Ops, email ' + to + ' (черновик, пробелы в графике)';
  }, function () { var r = SC.coverage_('draft'); return {subject: r.subject, gaps: r.gaps}; });
}
function job_bookings() {
  return T_job_('bookings', 'job_bookings (prod Events and booking read-only)', null, function () {
    var t = BKG.bookingsToday_(new Date());
    T_relay_('PLACE Team (TG группа, сводка 10:07)', t);
    return t;
  });
}
/** Issues digests go to the TG group «Тех вопросы» (George 30.09 14:27), not PLACE Team. Real target = Script Property
 *  TECH_CHAT_ID (unknown yet). In TEST the digest is always relayed to George + Lena; empty TECH_CHAT_ID → WARN in Log
 *  (in production issuesSendDigest_ would then send nothing). */
function job_issuesMorning() { return T_issuesJob_('morning', 'Тех вопросы (TG группа, сводка 10:07)'); }
function job_issuesEvening() { return T_issuesJob_('evening', 'Тех вопросы (TG группа, сводка 23:10)'); }
function T_issuesJob_(kind, channel) {
  return T_job_('issues', 'job_issues ' + kind, null, function () {
    var synced = T_syncIssuesFromQueue_();
    var tech = T_props_('ISS').getScriptProperties().getProperty('TECH_CHAT_ID');
    if (!tech) T_BUF.push('WARN TECH_CHAT_ID not set → in production this digest would NOT be sent (relayed in TEST anyway)');
    var t = ISS.issuesDigest_(kind);
    T_relay_(channel, t);
    return {synced: synced, techChatId: tech ? 'set' : 'EMPTY (warning)', digest: t};
  });
}
/** Read-only copy of new «Тех вопросы» rows from the production queue (bridge log) into Issues of Place Inbox TEST.
 *  The live bridge is NOT changed. Queue rows have no reply link, so they only open issues (close in TEST by hand). */
function T_syncIssuesFromQueue_() {
  var p = PropertiesService.getScriptProperties(), key = 'T_ISS_QUEUE_ROW';
  var q = T_SS.openById(P_IDS.inbox).getSheetByName('queue'); if (!q) return 'no queue tab';
  var vals = q.getDataRange().getValues(), last = Number(p.getProperty(key) || Math.max(1, vals.length - 200)), n = 0;
  var sh = ISS.issuesSheet_();
  for (var r = last; r < vals.length; r++) {
    var row = vals[r], chat = String(row[1] || '');
    if (!ISS.ISSUES_CHAT_RE.test(chat) || !String(row[5] || '').trim()) continue;
    var d = row[0] instanceof Date ? row[0] : new Date();
    ISS.issuesHandle_(sh, {chat: {id: String(row[2] || 'queue'), title: chat}, message_id: 'q' + (r + 1), date: Math.floor(d.getTime() / 1000),
      from: {username: String(row[4] || '').replace(/^@/, '')}}, String(row[5]), String(row[3] || row[4] || '?'));
    n++;
  }
  p.setProperty(key, String(vals.length));
  return n + ' new from queue rows ' + (last + 1) + '..' + vals.length;
}
function job_timesheet() {
  return T_job_('timesheet', 'job_timesheet (prod Schedule 26 read-only)', function (to) {
    return 'email Khun Pat (черновик)' + (/@/.test(to) ? ' ' + to : '');
  }, function () { return ST5.createTimesheetDraft(); });
}
/** Every 3 days 20:00: remind the evening admin (shift ending 23:00) to prepare cash + count for the Thai partner. */
function job_cashReminder() {
  return T_job_('cash', 'job_cashReminder (prod Schedule 26 read-only)', null, function () {
    var now = new Date(), names = T_eveningAdmins_(now);
    var text = 'Cash for the bank / เงินสดฝากธนาคาร\n' +
      'Tomorrow the Thai partner collects the cash for the bank. After closing (23:00) please:\n' +
      '1) count the cash in the till;\n2) put it in the envelope with the count sheet (date, total, notes/coins, your name);\n' +
      '3) send the total + a photo of the count sheet here with #cash.\n\n' +
      'พรุ่งนี้พาร์ทเนอร์จะมารับเงินสดไปฝากธนาคาร หลังปิดร้าน (23:00) กรุณา:\n' +
      '1) นับเงินสดในลิ้นชัก\n2) ใส่ซองพร้อมใบนับเงิน (วันที่ ยอดรวม ธนบัตร/เหรียญ ชื่อผู้นับ)\n3) ส่งยอดรวม + รูปใบนับเงินที่นี่ พร้อม #cash';
    var who = names.length ? 'вечерний админ ' + names.join(', ') + ' в личку' : 'вечерний админ (не найден в Schedule 26) → Place Ops и George в личку';
    T_relay_(who, text);
    return {eveningAdmins: names};
  });
}
function T_eveningAdmins_(d) {
  var c = SC.scCfg_(), sh = T_SS.openById(c.id).getSheetByName(c.tabs[d.getMonth()]);
  var m = SC.scReadTab_(sh, c); if (!m) return [];
  var day = Number(Utilities.formatDate(d, 'Asia/Bangkok', 'd'));
  return m.people.filter(function (p) { var s = SC.scShift_(p.days[day] || ''); return s && s.b >= 23; }).map(function (p) { return p.name; });
}

/** Dry check of all jobs right now (relay ON: George gets the messages if TG_TOKEN + GEORGE_CHAT_ID are set). */
function runAllJobsOnce() {
  var fns = {job_stage6: job_stage6, job_coverage: job_coverage, job_bookings: job_bookings, job_issuesMorning: job_issuesMorning,
    job_issuesEvening: job_issuesEvening, job_timesheet: job_timesheet, job_cashReminder: job_cashReminder};
  return T_JOBS.map(function (j) { return j[0] + ': ' + fns[j[0]]().status; });
}
