// StaffCommands.gs — new file in Apps Script project «Place TG Bridge» (@PlaceLeadBot). NO SECRETS IN THIS FILE.
// 09.10.2026 ICT. Common staff commands answered directly by the script, without waking Ops:
//   /help  /prices  /renewals [yyyy-mm-dd]  /bookings [tomorrow|yyyy-mm-dd]  /light …  /ac …
// Anything else (or a non-staff sender, or an error) returns false → poll() continues exactly as before
// (email to info@, queue row, opsNeeded_ → Ops wake).
//
// Called from poll() in Code.gs (see HOOK.md): handleStaffCommand_(m, tok, isEdit) → true = handled, skip the rest.
// Reuses (if present in the project): rnBuild_/rnTodayIct_ from Renewals.gs, bookingsToday_ from bookings-today.gs.
//
// Script Properties used (values never in code):
//   TUYA_ACCESS_ID, TUYA_ACCESS_SECRET, TUYA_ENDPOINT  — Tuya IoT cloud project (same values as on the box tuya.env)
//   TUYA_GROUPS   — JSON device map, e.g. {"light":{"f3":["<device_id>",…]},"ac":{"meeting":["<device_id>"]}}
//   STAFF_IDS     — optional, extra Telegram user ids allowed to use commands (comma-separated)
//   DEVICE_IDS    — optional, if set ONLY these user ids may use /light and /ac (default: all staff)
// All globals are prefixed SC_/sc* to avoid clashes with Code.gs, Photo.gs, Line.gs, Renewals.gs.

var SC_TZ = 'Asia/Bangkok';
var SC_BOT = 'placeleadbot';
var SC_INBOX_ID = '1uMHYp6d-Ji9VQj5xtESiXummBNX9bC8vTruPRQLs8jw';   // Place Inbox (same as SHEET_ID in Code.gs)
var SC_LOG_TAB = 'staff-cmd';                                       // ts | chat | chat_id | from | command | result
var SC_STAFF_USERNAMES = ['yasozidayu', 'rufasstyle', 'dftnsss'];   // = TEAM in Code.gs (Лена, Никита, Алёна)
var SC_STAFF_IDS = ['7486466296', '8944262207', '8503184147'];      // Tangmo, Leena (admins, /start 03.10), George
var SC_COMMANDS = ['help', 'prices', 'renewals', 'bookings', 'light', 'ac'];
var SC_MAX_TG = 3900;

// ---------------- entry point ----------------

function handleStaffCommand_(m, tok, isEdit) {
  var text = String((m && m.text) || '').trim();
  var mm = text.match(/^\/([a-z_]+)(?:@([a-z0-9_]+))?(?:\s+([\s\S]*))?$/i);
  if (!mm) return false;
  var cmd = mm[1].toLowerCase(), at = (mm[2] || '').toLowerCase(), args = (mm[3] || '').trim();
  if (at && at !== SC_BOT) return false;                      // command for another bot
  if (SC_COMMANDS.indexOf(cmd) < 0) return false;             // unknown → Ops as before
  if (!scIsStaff_(m.from)) return false;                      // not staff → Ops as before (no auto answer)
  if (isEdit) return true;                                    // never re-run a command because it was edited
  var reply, result;
  try {
    switch (cmd) {
      case 'help': reply = scHelp_(); break;
      case 'prices': reply = scPrices_(new Date()); break;
      case 'renewals': reply = scRenewals_(args); break;
      case 'bookings': reply = scBookings_(args); break;
      case 'light': case 'ac':
        if (!scMayUseDevices_(m.from)) { reply = '⛔ /' + cmd + ': not allowed for your account. Ask George.'; break; }
        reply = scDevicesCmd_(cmd, args, m.from);
        break;
    }
    result = 'ok';
  } catch (e) {
    Logger.log('STAFF_CMD_ERR /' + cmd + ' ' + e);
    scSend_(tok, m.chat.id, '⚠️ /' + cmd + ' failed: ' + String(e.message || e).slice(0, 200) + '\nPassed to Ops.', m.message_id);
    scLog_(m, cmd + (args ? ' ' + args : ''), 'ERROR ' + String(e.message || e).slice(0, 200));
    return false;                                             // fall through → queue + Ops wake
  }
  var parts = Array.isArray(reply) ? reply : [reply];
  parts.forEach(function (p, i) { scSend_(tok, m.chat.id, p, i === 0 ? m.message_id : null); });
  scLog_(m, cmd + (args ? ' ' + args : ''), result + ' ' + parts.join('\n').replace(/\s+/g, ' ').slice(0, 300));
  return true;
}

// ---------------- access ----------------

function scIsStaff_(f) {
  f = f || {};
  var id = String(f.id || ''), un = String(f.username || '').toLowerCase();
  var extra = String(PropertiesService.getScriptProperties().getProperty('STAFF_IDS') || '').split(/[\s,]+/).filter(Boolean);
  return SC_STAFF_IDS.indexOf(id) >= 0 || extra.indexOf(id) >= 0 || (un && SC_STAFF_USERNAMES.indexOf(un) >= 0);
}

function scMayUseDevices_(f) {
  var only = String(PropertiesService.getScriptProperties().getProperty('DEVICE_IDS') || '').split(/[\s,]+/).filter(Boolean);
  return !only.length || only.indexOf(String((f || {}).id || '')) >= 0;
}

// ---------------- /help ----------------

function scHelp_() {
  return [
    '🤖 @PlaceLeadBot — quick commands (answered instantly, Ops is not woken):',
    '/prices — canon prices (Place Pass, office, monitor)',
    '/renewals — today\'s renewal list (read-only; /renewals 2026-10-11 for another day)',
    '/bookings — today\'s bookings from «Events and booking» (/bookings tomorrow)',
    '/light — show light groups · /light on <group> · /light off <group> · /light status',
    '/ac — show AC groups · /ac on <group> · /ac off <group> · /ac status',
    '/help — this list',
    '',
    'Anything else you write goes to Ops as usual. Urgent: write «срочно» / urgent / ด่วน.'
  ].join('\n');
}

// ---------------- /prices (canon: PLACE-BRIEF 09.10.2026 + DECISIONS-LOG 09.10) ----------------

function scPrices_(now) {
  var before = Utilities.formatDate(now, SC_TZ, 'yyyy-MM-dd') < '2026-11-01';
  var day = before ? '400 ฿ (until 31.10; from 01.11 — 500 ฿)' : '500 ฿';
  var ten = before ? '2 500 ฿ (until 31.10; from 01.11 — 3 500 ฿)' : '3 500 ฿';
  return [
    '💳 PRICES (canon 09.10.2026). Hours: every day 08:00–23:00 (never write 24/7).',
    '',
    'PLACE PASS — floors 1 + 3',
    '• hour 50 ฿ · day ' + day,
    '• week 1 800 ฿ · 10 days ' + ten,
    '• month 6 000 ฿ · 3 months 15 000 ฿',
    '',
    'OFFICE — floors 5 and 2, up to 6 people',
    '• 30 000 ฿/month (no company address)',
    '• 20 000 ฿/month on a 1-year contract — company registration address only on the annual contract',
    '• never confirm free offices → «message us on WhatsApp, we\'ll show what\'s free». Never offer floor 4.',
    '',
    'EXTRAS',
    '• extra monitor: 200 ฿ / 10 h or 1 500 ฿ / month',
    '• meeting rooms: Place Pass residents −20% (price → George / WhatsApp)',
    '• podcast: one room, no price from us → booking on WhatsApp +66 95 117 0481 (light/camera rental, no own price)',
    '• partner promo code only (not public): free day, −10% week/month, −20% meeting rooms → write the code in «Новые гости»',
    '',
    'NO free day unless the guest holds an ad/flyer. Never: 3 free days, day 250/300, month 3 000/3 500, «cheapest».',
    'WhatsApp +66 95 117 0481 · 59/2 Chao Fah Tawan Tok Rd, Chalong'
  ].join('\n');
}

// ---------------- /renewals (reuses Renewals.gs, read-only) ----------------

function scRenewals_(args) {
  if (typeof rnBuild_ !== 'function' || typeof rnTodayIct_ !== 'function') return 'ℹ️ Renewals.gs is not installed in this project yet.';
  var day = (args.match(/\d{4}-\d{2}-\d{2}/) || [])[0] || rnTodayIct_();
  var b = rnBuild_(day);                                     // reads Resident info only; writes nothing, no outbox
  if (!b.parts.length) return '✅ Renewals ' + day + ': nothing today (no passes ending in 3 days / tomorrow / today, no open −7 days).';
  return b.parts;
}

// ---------------- /bookings (reuses bookings-today.gs, read-only) ----------------

function scBookings_(args) {
  var d = new Date();
  var ymd = (args.match(/\d{4}-\d{2}-\d{2}/) || [])[0];
  if (/tomorrow|завтра|พรุ่งนี้/i.test(args)) d = new Date(d.getTime() + 86400000);
  else if (ymd) d = new Date(ymd + 'T12:00:00+07:00');
  if (typeof bookingsToday_ === 'function') return bookingsToday_(d);
  // TODO: install docs/ops/handover/bookings-today.gs (read-only reader of «Events and booking»
  // 1BSwm4sY-ksXjFNEEsAdyiWmUDzgbQlJpL_dh9JIdZAc) as a file in this project; then this command works with no other change.
  return 'ℹ️ Bookings reader is not installed yet (bookings-today.gs). Source: «Events and booking» sheet. Ask Ops.';
}

// ---------------- /light, /ac via Tuya Cloud ----------------

function scGroups_(kind) {
  var raw = PropertiesService.getScriptProperties().getProperty('TUYA_GROUPS');
  if (!raw) throw new Error('Script Property TUYA_GROUPS is not set');
  var g = JSON.parse(raw)[kind] || {};
  return g;
}

function scDevicesCmd_(kind, args, from) {
  var groups = scGroups_(kind), names = Object.keys(groups);
  if (!names.length) return 'ℹ️ No ' + kind + ' groups configured (TUYA_GROUPS.' + kind + ').';
  var a = args.toLowerCase().split(/\s+/).filter(Boolean);
  var action = a[0], name = a[1];
  if (!action) return '/' + kind + ' groups: ' + names.join(', ') + '\nUse: /' + kind + ' on <group> · /' + kind + ' off <group> · /' + kind + ' status';
  if (action === 'status') return scStatus_(kind, name ? (groups[name] ? [name] : []) : names, groups);
  if (action !== 'on' && action !== 'off') return 'Use: /' + kind + ' on <group> · /' + kind + ' off <group> · /' + kind + ' status';
  if (!name) return 'Which group? /' + kind + ' ' + action + ' <' + names.join('|') + '>';
  if (!groups[name]) return 'Unknown group «' + name + '». Groups: ' + names.join(', ');
  var on = action === 'on', tk = scTuyaToken_(), ok = [], bad = [];
  groups[name].forEach(function (id) {
    var code = scSwitchCode_(id, tk);
    var r = scTuya_('POST', '/v1.0/iot-03/devices/' + id + '/commands', {commands: [{code: code, value: on}]}, tk);
    (r.success ? ok : bad).push(id.slice(-4) + (r.success ? '' : ' (' + (r.msg || r.code) + ')'));
  });
  return (bad.length ? '⚠️ ' : '✅ ') + '/' + kind + ' ' + action + ' ' + name + ': ' + ok.length + '/' + groups[name].length + ' done' +
    (bad.length ? '\nfailed: ' + bad.join(', ') : '');
}

function scStatus_(kind, names, groups) {
  if (!names.length) return 'Unknown group.';
  var tk = scTuyaToken_(), lines = [];
  names.forEach(function (n) {
    var s = groups[n].map(function (id) {
      var r = scTuya_('GET', '/v1.0/iot-03/devices/' + id + '/status', null, tk);
      if (!r.success) return id.slice(-4) + ' ?';
      var st = {}; (r.result || []).forEach(function (x) { st[x.code] = x.value; });
      var v = st.switch_led !== undefined ? st.switch_led : st.switch_1 !== undefined ? st.switch_1 : st['switch'];
      return id.slice(-4) + ' ' + (v === true ? 'ON' : v === false ? 'off' : '?') + (st.cur_power !== undefined ? ' ' + Math.round(st.cur_power / 10) + 'W' : '');
    });
    lines.push(n + ': ' + s.join(', '));
  });
  return '/' + kind + ' status\n' + lines.join('\n');
}

// Bulbs (category dj) use switch_led; plugs/switches (cz, kg) use switch_1. Detected from status, cached 6 h.
function scSwitchCode_(id, tk) {
  var c = CacheService.getScriptCache(), k = 'tuya_code_' + id, v = c.get(k);
  if (v) return v;
  var r = scTuya_('GET', '/v1.0/iot-03/devices/' + id + '/status', null, tk);
  var codes = (r.result || []).map(function (x) { return x.code; });
  v = ['switch_led', 'switch_1', 'switch'].filter(function (x) { return codes.indexOf(x) >= 0; })[0];
  if (!v) throw new Error('device ' + id.slice(-4) + ': no on/off code (' + (r.msg || codes.join(',')) + ')');
  c.put(k, v, 21600);
  return v;
}

// --- Tuya signing (port of ~/.config/place/tuya.py) ---
// stringToSign = METHOD \n sha256hex(body) \n "" \n path(+query)
// sign = HMAC-SHA256(secret, client_id + access_token + t + stringToSign).hex().toUpperCase()

function scHex_(bytes) {
  return bytes.map(function (b) { var v = (b < 0 ? b + 256 : b).toString(16); return v.length < 2 ? '0' + v : v; }).join('');
}

function scTuyaSign_(aid, sec, method, path, body, token, t) {
  var bodyHash = scHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, body || '', Utilities.Charset.UTF_8));
  var sts = [method, bodyHash, '', path].join('\n');
  return scHex_(Utilities.computeHmacSha256Signature(aid + (token || '') + t + sts, sec, Utilities.Charset.UTF_8)).toUpperCase();
}

function scTuya_(method, path, bodyObj, token) {
  var p = PropertiesService.getScriptProperties();
  var aid = p.getProperty('TUYA_ACCESS_ID'), sec = p.getProperty('TUYA_ACCESS_SECRET'), ep = p.getProperty('TUYA_ENDPOINT');
  if (!aid || !sec || !ep) throw new Error('Tuya Script Properties are not set');
  var body = bodyObj ? JSON.stringify(bodyObj) : '';
  var t = String(Date.now());
  var h = {client_id: aid, sign: scTuyaSign_(aid, sec, method, path, body, token, t), t: t, sign_method: 'HMAC-SHA256'};
  if (token) h.access_token = token;
  var opt = {method: method.toLowerCase(), headers: h, contentType: 'application/json', muteHttpExceptions: true};
  if (body) opt.payload = body;
  var res = UrlFetchApp.fetch(ep.replace(/\/$/, '') + path, opt);
  try { return JSON.parse(res.getContentText()); } catch (e) { return {success: false, msg: 'HTTP ' + res.getResponseCode()}; }
}

function scTuyaToken_() {
  var c = CacheService.getScriptCache(), v = c.get('tuya_token');
  if (v) return v;
  var r = scTuya_('GET', '/v1.0/token?grant_type=1', null, '');
  if (!r.success) throw new Error('Tuya token: ' + (r.msg || r.code));
  v = r.result.access_token;
  c.put('tuya_token', v, Math.max(60, Math.min(21600, (r.result.expire_time || 7200) - 120)));
  return v;
}

// ---------------- Telegram + log ----------------

function scSend_(tok, chatId, text, replyTo) {
  var t = String(text || '-');
  for (var i = 0; i < t.length; i += SC_MAX_TG) {
    var p = {chat_id: chatId, text: t.slice(i, i + SC_MAX_TG), disable_web_page_preview: true};
    if (replyTo && i === 0) { p.reply_to_message_id = replyTo; p.allow_sending_without_reply = true; }
    UrlFetchApp.fetch('https://api.telegram.org/bot' + tok + '/sendMessage', {method: 'post', contentType: 'application/json', payload: JSON.stringify(p), muteHttpExceptions: true});
  }
}

function scLog_(m, command, result) {
  try {
    var ss = SpreadsheetApp.openById(SC_INBOX_ID), sh = ss.getSheetByName(SC_LOG_TAB);
    if (!sh) { sh = ss.insertSheet(SC_LOG_TAB, ss.getNumSheets()); sh.appendRow(['ts', 'chat', 'chat_id', 'from', 'command', 'result']); sh.setFrozenRows(1); }
    var f = m.from || {};
    sh.appendRow([Utilities.formatDate(new Date(), SC_TZ, 'yyyy-MM-dd HH:mm:ss'), m.chat.title || (m.chat.type === 'private' ? 'личка боту' : ''),
      String(m.chat.id), [f.first_name, f.last_name].filter(Boolean).join(' ') + (f.username ? ' @' + f.username : ''), '/' + command, String(result).slice(0, 500)]);
  } catch (e) { Logger.log('STAFF_LOG_ERR ' + e); }
}

// ---------------- editor helpers (send nothing to Telegram) ----------------

// Read-only: lists Tuya devices with id / category / online and the on/off code. Use it to fill TUYA_GROUPS.
function staffTuyaDevices() {
  var tk = scTuyaToken_();
  var r = scTuya_('GET', '/v2.0/cloud/thing/device?page_size=50', null, tk);
  if (!r.success) { Logger.log('TUYA_LIST_FAIL ' + r.msg); return; }
  (r.result || []).forEach(function (d) { Logger.log([d.name, d.id, d.category, d.isOnline ? 'online' : 'offline'].join(' | ')); });
  Logger.log('TUYA_DEVICES ' + (r.result || []).length);
}

// Dry run of the text commands (no Telegram, no device changes; reads Resident info / Events and booking if installed).
function staffDryRun() {
  Logger.log(scHelp_());
  Logger.log(scPrices_(new Date()));
  Logger.log(JSON.stringify(scRenewals_('')).slice(0, 1500));
  Logger.log(scBookings_(''));
  var fake = {from: {id: 1, username: 'stranger'}, chat: {id: 1, type: 'private'}, text: '/prices', message_id: 1};
  Logger.log('stranger handled=' + handleStaffCommand_(fake, 'x', false) + ' (want false)');
  Logger.log('unknown /foo handled=' + handleStaffCommand_({from: {id: 8503184147}, chat: {id: 1, type: 'private'}, text: '/foo', message_id: 1}, 'x', false) + ' (want false)');
}

if (typeof module !== 'undefined') module.exports = {handleStaffCommand_: handleStaffCommand_, scTuyaSign_: scTuyaSign_, scPrices_: scPrices_, scIsStaff_: scIsStaff_, scDevicesCmd_: scDevicesCmd_};
