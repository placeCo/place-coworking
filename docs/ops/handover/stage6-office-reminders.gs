/**
 * Place Coworking — Stage 6 (2.1.9 / 2.1.10 / 5.1.5 Offices). DRAFT TEMPLATE, NOT DEPLOYED.
 *
 * Reads the office tenants table (proposed: the empty tab "Office rent" in
 * Resident info, columns see STAGES-5-6.md) and prepares reminders:
 *   - payment due in N days (default 7,3,0)
 *   - contract end in N days (default 30,7)
 *   - deposit not paid (deposit amount > 0 and no deposit paid date)
 *   - room overlap (two active contracts on the same room, e.g. 5th floor room 3)
 *
 * MODES (Script Property MODE):
 *   'dry'   (default) — log only, nothing is created.
 *   'draft' — creates Gmail DRAFTS (tenant reminders + one internal digest). Never sends.
 * There is intentionally NO send mode. Sending stays manual until George approves.
 * The script never writes to the sheet; "already reminded" is kept in Script Properties.
 *
 * Script Properties:
 *   RESIDENT_SHEET_ID   default 1Rzz9CKQYHwgZ8BPtrTxxUwFdphphSivSJkkTwFC8wo4 (Resident info)
 *   TAB_NAME            default 'Office rent'
 *   HEADER_ROW          default 1
 *   PAYMENT_DAYS        default '7,3,0'
 *   CONTRACT_DAYS       default '30,7'
 *   DIGEST_TO           internal recipient of the digest draft, default info@placecoworking.com
 *   MODE                'dry' | 'draft'
 *   TENANT_DRAFTS       'true' (default) = also create per-tenant drafts in draft mode
 *   COL_*               header overrides, e.g. COL_EMAIL='E-mail' (see HEADERS below)
 *   ELEC_TASK_MODE      'dry' (default, log only) | 'issues' = (only with MODE=draft) append a row to the «Issues»
 *                       tech-task tab (see issues-log.gs). No TG post from here.
 *   ISSUES_SHEET_ID     spreadsheet with the «Issues» tab (Place Inbox), required for 'issues'
 *
 * ELECTRICITY BILL TASK (George 29.09): on the first day of each tenant's rent
 * month (= day-of-month of «Contract start», e.g. start 10.09 -> every 10th;
 * 31st -> last day of shorter months) create a tech task
 * «выставить счёт за электричество: <office>, <tenant>». Deduplicated per month.
 *
 * Time zone of the project: (GMT+07:00) Bangkok.
 * Principle (George 29.09): no new separate runs. Preferred: Lead calls dryRun()
 * results inside the existing 10:07 run. installDailyTrigger() is here only as
 * an option and must NOT be run without George OK.
 */

var TZ = 'Asia/Bangkok';
var DEFAULT_SHEET_ID = '1Rzz9CKQYHwgZ8BPtrTxxUwFdphphSivSJkkTwFC8wo4';
var HEADERS = { // logical key -> default header text in the sheet
  tenant: 'Tenant', contact: 'Contact name', email: 'Email', floor: 'Floor', room: 'Office/Room',
  start: 'Contract start', end: 'Contract end', term: 'Term', rent: 'Monthly rent',
  deposit: 'Deposit amount', depositPaid: 'Deposit paid date', nextPay: 'Next payment date',
  lastPaid: 'Last paid date', status: 'Status', lang: 'Language', notes: 'Notes'
};

// ---------- entry points ----------

function dryRun() { return run_('dry'); }

/** Draft mode only if MODE=draft; otherwise behaves as dryRun. */
function runReminders() {
  var mode = PropertiesService.getScriptProperties().getProperty('MODE') || 'dry';
  return run_(mode === 'draft' ? 'draft' : 'dry');
}

/** OPTIONAL, do not run without George OK. Daily 09:30 ICT. */
function installDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'runReminders') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('runReminders').timeBased().everyDays(1).atHour(9).nearMinute(30).inTimezone(TZ).create();
}

/** Clears the "already reminded" memory (e.g. after testing). */
function resetSentLog() { PropertiesService.getScriptProperties().deleteProperty('SENT_LOG'); }

// ---------- core ----------

function cfg_() {
  var p = PropertiesService.getScriptProperties();
  var g = function (k, d) { var v = p.getProperty(k); return (v === null || v === '') ? d : v; };
  var cols = {};
  Object.keys(HEADERS).forEach(function (k) { cols[k] = g('COL_' + k.toUpperCase(), HEADERS[k]); });
  var nums = function (s) { return s.split(',').map(function (x) { return Number(x.trim()); }).filter(function (x) { return !isNaN(x); }); };
  return {
    sheetId: g('RESIDENT_SHEET_ID', DEFAULT_SHEET_ID), tab: g('TAB_NAME', 'Office rent'),
    headerRow: Number(g('HEADER_ROW', '1')), cols: cols,
    payDays: nums(g('PAYMENT_DAYS', '7,3,0')), endDays: nums(g('CONTRACT_DAYS', '30,7')),
    digestTo: g('DIGEST_TO', 'info@placecoworking.com'), tenantDrafts: g('TENANT_DRAFTS', 'true') === 'true'
  };
}

function run_(mode) {
  var c = cfg_();
  var sh = SpreadsheetApp.openById(c.sheetId).getSheetByName(c.tab);
  if (!sh) throw new Error('Tab not found: ' + c.tab);
  var vals = sh.getDataRange().getValues();
  var head = vals[c.headerRow - 1].map(function (h) { return String(h).trim().toLowerCase(); });
  var idx = {}, missing = [];
  Object.keys(c.cols).forEach(function (k) { idx[k] = head.indexOf(c.cols[k].toLowerCase()); if (idx[k] < 0 && ['tenant', 'room', 'end', 'nextPay', 'email'].indexOf(k) >= 0) missing.push(c.cols[k]); });
  if (missing.length) throw new Error('Missing required columns: ' + missing.join(', '));

  var today = today_(), items = [], warnings = [], active = [];
  for (var r = c.headerRow; r < vals.length; r++) {
    var row = vals[r], get = function (k) { return idx[k] >= 0 ? row[idx[k]] : ''; };
    var t = {
      row: r + 1, tenant: String(get('tenant')).trim(), contact: String(get('contact')).trim(), email: String(get('email')).trim(),
      room: String(get('room')).trim(), floor: String(get('floor')).trim(), start: date_(get('start')), end: date_(get('end')),
      rent: get('rent'), deposit: Number(String(get('deposit')).replace(/[^\d.]/g, '')) || 0, depositPaid: date_(get('depositPaid')),
      nextPay: date_(get('nextPay')), status: String(get('status')).trim().toLowerCase(), lang: String(get('lang')).trim().toLowerCase()
    };
    if (!t.tenant) continue;
    if (/^(ended|closed|cancel)/.test(t.status)) continue;
    if (t.end && t.end < today) { warnings.push('Row ' + t.row + ' ' + t.tenant + ': contract ended ' + d_(t.end) + ' but status is not Ended'); continue; }
    active.push(t);
    if (t.nextPay) {
      var dp = diffDays_(today, t.nextPay);
      if (c.payDays.indexOf(dp) >= 0) items.push({type: 'PAYMENT', days: dp, t: t});
      else if (dp < 0) warnings.push('Row ' + t.row + ' ' + t.tenant + ': next payment date ' + d_(t.nextPay) + ' is in the past (overdue or not updated)');
    } else warnings.push('Row ' + t.row + ' ' + t.tenant + ': no next payment date');
    if (t.end) {
      var de = diffDays_(today, t.end);
      if (c.endDays.indexOf(de) >= 0) items.push({type: 'CONTRACT_END', days: de, t: t});
    }
    if (t.deposit > 0 && !t.depositPaid) items.push({type: 'DEPOSIT_UNPAID', days: null, t: t});
    if (!t.email) warnings.push('Row ' + t.row + ' ' + t.tenant + ': no email');
  }
  // room overlaps
  for (var i = 0; i < active.length; i++) for (var j = i + 1; j < active.length; j++) {
    var a = active[i], b = active[j];
    if (a.room && a.room === b.room && a.floor === b.floor && overlap_(a, b)) warnings.push('Room overlap: ' + a.floor + ' / ' + a.room + ' — ' + a.tenant + ' (row ' + a.row + ') and ' + b.tenant + ' (row ' + b.row + ')');
  }

  var log = JSON.parse(PropertiesService.getScriptProperties().getProperty('SENT_LOG') || '{}');
  var created = [];
  items.forEach(function (it) {
    var key = it.type + '|' + it.t.row + '|' + (it.type === 'PAYMENT' ? d_(it.t.nextPay) : d_(it.t.end)) + '|' + it.days;
    it.key = key; it.already = !!log[key];
    if (mode === 'draft' && c.tenantDrafts && !it.already && it.t.email && it.type !== 'DEPOSIT_UNPAID') {
      var m = tenantMail_(it);
      var d = GmailApp.createDraft(it.t.email, m.subject, m.body);
      log[key] = d_(today); created.push(d.getId());
    }
  });
  var elec = electricityTasks_(active, today, log, mode);
  var digest = digest_(items, warnings, today);
  if (elec.length) digest.body = 'Задачи «счёт за электричество» сегодня:\n• ' + elec.join('\n• ') + '\n\n' + digest.body;
  if (mode === 'draft' && (items.length || warnings.length || elec.length)) {
    GmailApp.createDraft(c.digestTo, digest.subject, digest.body);
    PropertiesService.getScriptProperties().setProperty('SENT_LOG', JSON.stringify(log));
  }
  Logger.log('[' + mode + '] ' + digest.subject + '\n' + digest.body);
  if (mode === 'dry') items.forEach(function (it) { if (it.type !== 'DEPOSIT_UNPAID') { var m = tenantMail_(it); Logger.log('--- would draft to ' + (it.t.email || '(no email)') + ': ' + m.subject + '\n' + m.body); } });
  return {mode: mode, items: items.length, warnings: warnings.length, draftsCreated: created.length};
}

function tenantMail_(it) {
  var t = it.t, who = t.contact || t.tenant, room = [t.floor, t.room].filter(String).join(', ');
  if (it.type === 'PAYMENT') return {
    subject: 'Place Coworking — rent reminder (' + room + ')',
    body: 'Dear ' + who + ',\n\nThis is a friendly reminder that the rent for ' + room + (t.rent ? ' (' + t.rent + ' THB)' : '') +
      ' is due on ' + d_(t.nextPay) + (it.days === 0 ? ' (today)' : ' (in ' + it.days + ' days)') + '.\n' +
      'If you have already paid, please ignore this message or send us the transfer slip.\n\nThank you,\nPlace Coworking'
  };
  return {
    subject: 'Place Coworking — your office contract ends on ' + d_(t.end),
    body: 'Dear ' + who + ',\n\nYour contract for ' + room + ' ends on ' + d_(t.end) + ' (in ' + it.days + ' days).\n' +
      'Would you like to extend it? Please reply to this email and we will prepare the renewal. ' +
      'If you plan to move out, please let us know so we can arrange the key return and the deposit.\n\nThank you,\nPlace Coworking'
  };
}

function digest_(items, warnings, today) {
  var label = {PAYMENT: 'Payment due', CONTRACT_END: 'Contract ends', DEPOSIT_UNPAID: 'Deposit NOT paid'};
  var lines = items.map(function (it) {
    var t = it.t;
    return '• ' + label[it.type] + (it.days !== null ? ' in ' + it.days + ' d' : '') + ': ' + t.tenant + ' — ' + [t.floor, t.room].join(' ') +
      (it.type === 'PAYMENT' ? ', ' + d_(t.nextPay) + ', ' + t.rent + ' THB' : '') + (it.type === 'CONTRACT_END' ? ', ' + d_(t.end) : '') +
      (it.type === 'DEPOSIT_UNPAID' ? ', ' + t.deposit + ' THB' : '') + (it.already ? ' (reminder already drafted)' : '');
  });
  return {
    subject: 'Offices digest ' + d_(today) + ': ' + items.length + ' reminders, ' + warnings.length + ' warnings',
    body: (lines.length ? lines.join('\n') : 'No reminders today.') + (warnings.length ? '\n\nWarnings:\n• ' + warnings.join('\n• ') : '') +
      '\n\n(Drafts only. Review in Gmail Drafts and send manually.)'
  };
}

// Assignee of the electricity-bill task: Lena (approved role, George 29.09 19:40)
var ELEC_ASSIGNEE = 'Lena';

/** Rent-month start today? -> tech task. log = SENT_LOG object (dedupe key ELEC|row|yyyy-MM). */
function electricityTasks_(active, today, log, runMode) {
  var p = PropertiesService.getScriptProperties();
  // writes only when the whole run is in draft mode AND ELEC_TASK_MODE=issues; dryRun() never writes
  var mode = runMode === 'draft' ? (p.getProperty('ELEC_TASK_MODE') || 'dry') : 'dry';
  var out = [];
  active.forEach(function (t) {
    if (!t.start || (t.end && t.end < today) || t.start > today) return;
    var dim = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    var due = Math.min(t.start.getDate(), dim);
    if (today.getDate() !== due) return;
    var office = [t.floor ? t.floor + ' эт.' : '', t.room].filter(String).join(' ');
    var text = 'выставить счёт за электричество: ' + office + ', ' + t.tenant;
    var key = 'ELEC|' + t.row + '|' + Utilities.formatDate(today, TZ, 'yyyy-MM');
    if (log[key]) return;
    out.push(text + ' → ' + ELEC_ASSIGNEE);
    if (mode === 'issues') {
      var id = p.getProperty('ISSUES_SHEET_ID');
      var sh = id && SpreadsheetApp.openById(id).getSheetByName('Issues');
      if (!sh) { Logger.log('ELEC: no Issues tab / ISSUES_SHEET_ID -> dry'); Logger.log('[elec dry] ' + text); return; }
      var now = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm');
      // same columns as issues-log.gs ISSUES_HEAD (last = assignee)
      sh.appendRow(['elec:' + t.row + ':' + Utilities.formatDate(today, TZ, 'yyyy-MM'), now, t.floor, 'Place Ops (auto)', text, 'open', '', now, '', '', '', '', ELEC_ASSIGNEE]);
      log[key] = d_(today);
      PropertiesService.getScriptProperties().setProperty('SENT_LOG', JSON.stringify(log));
    } else Logger.log('[elec dry] ' + text + ' (assignee: ' + ELEC_ASSIGNEE + ')');
  });
  return out;
}

// ---------- helpers ----------
function today_() { var s = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd').split('-'); return new Date(Number(s[0]), Number(s[1]) - 1, Number(s[2])); }
function diffDays_(a, b) { return Math.round((b - a) / 86400000); }
function d_(d) { return d ? Utilities.formatDate(d, TZ, 'dd.MM.yyyy') : ''; }
function overlap_(a, b) { var far = new Date(2100, 0, 1), s1 = a.start || new Date(2000, 0, 1), s2 = b.start || new Date(2000, 0, 1); return s1 <= (b.end || far) && s2 <= (a.end || far); }
/** Date cell, or text dd.mm.yy / dd/mm/yyyy / yyyy-mm-dd. */
function date_(v) {
  if (v instanceof Date && !isNaN(v)) return new Date(v.getFullYear(), v.getMonth(), v.getDate());
  var s = String(v || '').trim(), m;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) return new Date(+m[1], +m[2] - 1, +m[3]);
  if ((m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/))) return new Date(m[3].length === 2 ? 2000 + +m[3] : +m[3], +m[2] - 1, +m[1]);
  return null;
}
