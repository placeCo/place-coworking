// Line.gs — LINE Official Account @294bqkju (Place co-working) -> Place Inbox «LINE» tab + Telegram notice to George.
// Part of Apps Script project «Place TG Bridge» (info@placecoworking.com). No secrets in code.
// Script Properties used:
//   LINE_CHANNEL_ACCESS_TOKEN  (required, for profile lookup)
//   LINE_CHANNEL_SECRET        (stored for future signature checks; Apps Script web apps do not expose X-Line-Signature)
//   TOKEN                      (existing Telegram bot token of the bridge, set by setup())
// Deploy: Deploy > New deployment > Web app, Execute as: Me, Who has access: Anyone. Webhook URL = the /exec URL.
// NOTE: if the project already has another doPost(e), rename doPost below to lineDoPost_ and call it from the
// existing doPost when the body contains "destination" (LINE payload).

var LINE_BOT_USER_ID = 'U8be45a11e136c691bc41ab24f61d018c';
var LINE_SHEET_ID = '1uMHYp6d-Ji9VQj5xtESiXummBNX9bC8vTruPRQLs8jw'; // Place Inbox
var LINE_TAB = 'LINE';
var LINE_TG_CHAT = '8503184147'; // George
var LINE_HEADER = ['time_ICT', 'userId', 'displayName', 'source', 'event_type', 'message_type', 'text', 'message_id', 'webhookEventId', 'raw'];

function doPost(e) {
  var body = (e && e.postData && e.postData.contents) || '';
  var data;
  try { data = JSON.parse(body); } catch (err) { return lineOk_('bad json'); }
  if (!data || data.destination !== LINE_BOT_USER_ID) { console.warn('LINE_BAD_DEST ' + (data && data.destination)); return lineOk_('ignored'); }
  var events = data.events || [];
  if (!events.length) return lineOk_('ok'); // console "Verify" sends empty events
  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch (err) {}
  try {
    var sh = lineSheet_();
    var cache = CacheService.getScriptCache();
    events.forEach(function (ev) {
      try { lineHandleEvent_(ev, sh, cache); } catch (err) { console.error('LINE_EVENT_ERR ' + err); }
    });
  } finally { try { lock.releaseLock(); } catch (err) {} }
  return lineOk_('ok');
}

function lineOk_(s) { return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT); }

function lineHandleEvent_(ev, sh, cache) {
  var id = ev.webhookEventId || '';
  if (id && cache.get('lw_' + id)) return; // redelivery dedupe
  if (id) cache.put('lw_' + id, '1', 21600);
  var src = ev.source || {};
  var uid = src.userId || '';
  var name = lineName_(src, cache);
  var m = ev.message || {};
  var text = '';
  if (ev.type === 'message') {
    if (m.type === 'text') text = m.text || '';
    else if (m.type === 'sticker') text = '[sticker ' + (m.packageId || '') + '/' + (m.stickerId || '') + ']';
    else if (m.type === 'location') text = '[location] ' + (m.title || '') + ' ' + (m.address || '') + ' ' + m.latitude + ',' + m.longitude;
    else if (m.type === 'file') text = '[file] ' + (m.fileName || '') + ' (id ' + m.id + ')';
    else text = '[' + m.type + '] id ' + m.id;
  } else if (ev.type === 'postback') {
    text = '[postback] ' + ((ev.postback && ev.postback.data) || '');
  } else {
    text = '[' + ev.type + ']';
  }
  var srcLabel = src.type === 'group' ? 'group:' + src.groupId : src.type === 'room' ? 'room:' + src.roomId : 'user';
  var ts = Utilities.formatDate(new Date(ev.timestamp || Date.now()), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');
  sh.appendRow([ts, uid, name, srcLabel, ev.type, m.type || '', text, m.id || '', id, JSON.stringify(ev).slice(0, 2000)]);
  if (ev.type === 'message' || ev.type === 'follow' || ev.type === 'postback') {
    var notice = 'LINE от ' + (name || uid || '?') + ': ' + (text.length > 600 ? text.slice(0, 600) + '…' : text);
    lineTg_(notice);
  }
}

function lineName_(src, cache) {
  var uid = src.userId;
  if (!uid) return '';
  var key = 'ln_' + uid;
  var c = cache.get(key);
  if (c) return c;
  var tok = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');
  if (!tok) return '';
  var url = 'https://api.line.me/v2/bot/profile/' + encodeURIComponent(uid);
  if (src.type === 'group') url = 'https://api.line.me/v2/bot/group/' + encodeURIComponent(src.groupId) + '/member/' + encodeURIComponent(uid);
  if (src.type === 'room') url = 'https://api.line.me/v2/bot/room/' + encodeURIComponent(src.roomId) + '/member/' + encodeURIComponent(uid);
  try {
    var r = UrlFetchApp.fetch(url, {headers: {Authorization: 'Bearer ' + tok}, muteHttpExceptions: true});
    if (r.getResponseCode() === 200) {
      var n = JSON.parse(r.getContentText()).displayName || '';
      if (n) cache.put(key, n, 21600);
      return n;
    }
    console.warn('LINE_PROFILE ' + r.getResponseCode());
  } catch (err) { console.warn('LINE_PROFILE_ERR ' + err); }
  return '';
}

function lineTg_(text) {
  var tok = PropertiesService.getScriptProperties().getProperty('TOKEN');
  if (!tok) { console.warn('LINE_TG_NO_TOKEN'); return; }
  try {
    UrlFetchApp.fetch('https://api.telegram.org/bot' + tok + '/sendMessage', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      payload: JSON.stringify({chat_id: LINE_TG_CHAT, text: text, disable_web_page_preview: true})
    });
  } catch (err) { console.warn('LINE_TG_ERR ' + err); }
}

function lineSheet_() {
  var ss = SpreadsheetApp.openById(LINE_SHEET_ID);
  var sh = ss.getSheetByName(LINE_TAB);
  if (!sh) { // created at the end so getSheets()[0] stays «queue»
    sh = ss.insertSheet(LINE_TAB, ss.getSheets().length);
    sh.appendRow(LINE_HEADER);
    sh.setFrozenRows(1);
  }
  return sh;
}

// Manual check from the editor: writes one TEST row (no Telegram unless sendTg=true). Does not contact LINE users.
function lineSelfTest(sendTg) {
  var ev = {type: 'message', webhookEventId: 'TEST-' + Date.now(), timestamp: Date.now(), source: {type: 'user', userId: 'TEST'},
            message: {type: 'text', id: '0', text: 'Line.gs self-test'}};
  var sh = lineSheet_();
  sh.appendRow([Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss'), 'TEST', 'self-test', 'user', 'message', 'text', 'Line.gs self-test', '0', ev.webhookEventId, '']);
  if (sendTg === true) lineTg_('LINE от self-test: Line.gs работает');
  var p = PropertiesService.getScriptProperties();
  Logger.log('LINE_TOKEN_SET=' + !!p.getProperty('LINE_CHANNEL_ACCESS_TOKEN') + ' LINE_SECRET_SET=' + !!p.getProperty('LINE_CHANNEL_SECRET') + ' TG_TOKEN_SET=' + !!p.getProperty('TOKEN'));
}
