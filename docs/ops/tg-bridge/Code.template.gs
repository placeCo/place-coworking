// Place TG bridge: Telegram bot -> email to info@ (label TG-inbox) + Place Inbox queue sheet
const TOKEN = '__TOKEN__';
const SHEET_ID = '1uMHYp6d-Ji9VQj5xtESiXummBNX9bC8vTruPRQLs8jw';
const TO = 'info@placecoworking.com';
const LABEL = 'TG-inbox';
const OPS_URL = '__OPS_URL__';
const OPS_AUTH = '__OPS_AUTH__';
const OPS_DELAY_MIN = 15; // будить Ops не чаще раза в N минут, пачкой
const URGENT_RE = /(срочн|urgent|asap|горит|помогите|help|не работает|сломал|авари|пожар|потоп|утечк|emergency|ด่วน)/i;
const TEAM = ['yasozidayu', 'rufasstyle', 'dftnsss']; // Лена, Никита, Алёна
const BOT = 'placeleadbot';
const CAFE_RE = /(americano|американо|кофе|coffee|латте|latte|капучино|cappuccino|эспрессо|espresso|блин|crepe|чайник|teapot|\bчай\b|\btea\b|смузи|smoothie|сок|juice|круассан|croissant)/i;

function setupOps() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('OPS_URL', OPS_URL);
  props.setProperty('OPS_AUTH', OPS_AUTH);
  Logger.log('OPS_OK ' + opsWake_({test: true, chat: 'TEST', from: 'Place TG Bridge', text: 'Тест из Apps Script bridge. Ответ в TG не нужен.', date: '', message_id: 0, reply_to: null}));
}

function opsNeeded_(m, text) {
  if (m.sticker) return false;
  var f = m.from || {};
  var un = (f.username || '').toLowerCase();
  var low = text.toLowerCase();
  var mention = low.indexOf('@' + BOT) >= 0;
  var rt = m.reply_to_message && m.reply_to_message.from && (m.reply_to_message.from.username || '').toLowerCase() === BOT;
  if (m.chat.type === 'private' || mention || rt) return true;
  if (/тех вопрос/i.test(m.chat.title || '')) return true;
  if (TEAM.indexOf(un) >= 0) return !CAFE_RE.test(text);
  return false;
}

function opsQueue_(item) {
  var props = PropertiesService.getScriptProperties();
  var buf = JSON.parse(props.getProperty('OPS_BUF') || '[]');
  item.q = Date.now();
  buf.push(item);
  props.setProperty('OPS_BUF', JSON.stringify(buf.slice(-40)));
}

function opsFlush_() {
  var props = PropertiesService.getScriptProperties();
  var buf = JSON.parse(props.getProperty('OPS_BUF') || '[]');
  if (!buf.length) return;
  var last = Number(props.getProperty('OPS_LAST') || 0);
  var urgent = buf.some(function (x) { return URGENT_RE.test(x.text || ''); });
  if (!urgent && Date.now() - last < OPS_DELAY_MIN * 60000) return;
  if (!urgent && Date.now() - (buf[0].q || 0) < 3 * 60000) return; // ждём 3 мин, чтобы собрать всю переписку в одну пачку
  var code = opsWake_({batch: true, count: buf.length, messages: buf});
  if (code === 200) { props.setProperty('OPS_BUF', '[]'); props.setProperty('OPS_LAST', String(Date.now())); }
}

function opsWake_(payload) {
  var props = PropertiesService.getScriptProperties();
  var url = props.getProperty('OPS_URL') || OPS_URL, auth = props.getProperty('OPS_AUTH') || OPS_AUTH;
  if (!url || !auth) return 'NO_CFG';
  try {
    var r = UrlFetchApp.fetch(url, {method: 'post', contentType: 'application/json', headers: {Authorization: 'Bearer ' + auth}, payload: JSON.stringify(payload), muteHttpExceptions: true});
    return r.getResponseCode();
  } catch (e) { return 'ERR ' + e; }
}

function setup() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('TOKEN', TOKEN);
  UrlFetchApp.fetch('https://api.telegram.org/bot' + TOKEN + '/deleteWebhook', {muteHttpExceptions: true});
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(['received_ict','chat','chat_id','from','username','text','status','note']);
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('poll').timeBased().everyMinutes(1).create();
  if (!GmailApp.getUserLabelByName(LABEL)) GmailApp.createLabel(LABEL);
  poll();
  Logger.log('SETUP_OK');
}

const WELCOME = "Привет! Это @PlaceLeadBot, помощник команды Place Coworking.\n\nПожалуйста, представьтесь одним сообщением: имя и должность (чем занимаетесь в Place). Так я буду знать, к кому с какими вопросами обращаться.\n\nКак я работаю:\n• Всё, что вы пишете мне сюда или в рабочие чаты (PLACE Team, PlaceCo, «Тех вопросы»), я получаю и разбираю.\n• Личные сообщения аккаунту Place я сразу не вижу, только раз в сутки ночью. Поэтому все рабочие вопросы пишите сюда, в бот, или в рабочие чаты.\n• Обычные сообщения я смотрю пачкой, примерно раз в 15 минут, плюс сводки в 13:00 и 23:10.\n• Если что-то срочное, напишите слово «срочно» (или urgent / ด่วน). Тогда я увижу сообщение в течение минуты.\n• Заказы в кафе пишите как обычно в PLACE Team, их обрабатывают отдельно.\n• Цены, публикации и ответы клиентам согласовывает George. Если вопрос требует его решения, я передам и вернусь с ответом.\n• Отвечаю с 10:00 до 22:00.";

function describe_(m) {
  var t = m.text || m.caption || '';
  if (m.photo) t = '[фото] ' + t;
  if (m.voice) t = '[голосовое ' + (m.voice.duration || '?') + 'с] ' + t;
  if (m.audio) t = '[аудио] ' + t;
  if (m.video) t = '[видео] ' + t;
  if (m.video_note) t = '[видеосообщение] ' + t;
  if (m.document) t = '[файл: ' + (m.document.file_name || '') + '] ' + t;
  if (m.sticker) t = '[стикер ' + (m.sticker.emoji || '') + '] ' + t;
  if (m.contact) t = '[контакт: ' + (m.contact.first_name || '') + ' ' + (m.contact.phone_number || '') + '] ' + t;
  if (m.location) t = '[геолокация] ' + t;
  return t.trim();
}

function poll() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    var props = PropertiesService.getScriptProperties();
    var tok = props.getProperty('TOKEN') || TOKEN;
    var off = Number(props.getProperty('OFFSET') || 0);
    var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + tok + '/getUpdates?timeout=0&offset=' + off, {muteHttpExceptions: true});
    var r = JSON.parse(res.getContentText());
    if (!r.ok || !r.result.length) { opsFlush_(); return; }
    var label = GmailApp.getUserLabelByName(LABEL) || GmailApp.createLabel(LABEL);
    var sh = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    var sent = 0;
    for (var i = 0; i < r.result.length; i++) {
      var u = r.result[i];
      var m = u.message || u.edited_message || u.channel_post || u.edited_channel_post;
      props.setProperty('OFFSET', String(u.update_id + 1));
      if (!m) continue;
      var text = describe_(m);
      if (!text) continue; // service messages (joins etc.)
      if (m.chat.type === 'private' && /^\/start/.test(text)) {
        UrlFetchApp.fetch('https://api.telegram.org/bot' + tok + '/sendMessage', {method: 'post', contentType: 'application/json', payload: JSON.stringify({chat_id: m.chat.id, text: WELCOME}), muteHttpExceptions: true});
      }
      var f = m.from || {};
      var name = [f.first_name, f.last_name].filter(Boolean).join(' ') || m.chat.title || '?';
      var chat = m.chat.title || (m.chat.type === 'private' ? 'личка боту' : String(m.chat.id));
      var when = Utilities.formatDate(new Date(m.date * 1000), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm');
      var link = m.chat.username ? 'https://t.me/' + m.chat.username + '/' + m.message_id : '';
      var body = 'Время (ICT): ' + when + '\nЧат: ' + chat + ' (' + m.chat.id + ')\nОт: ' + name +
        (f.username ? ' @' + f.username : '') + (u.edited_message ? '\n(отредактировано)' : '') +
        '\n\n' + text + (link ? '\n\n' + link : '');
      GmailApp.sendEmail(TO, 'TG | ' + name + ' | ' + chat, body);
      sh.appendRow([when, chat, String(m.chat.id), name, f.username ? '@' + f.username : '', text, '', '']);
      sent++;
      if (ORDERS_CHAT_RE.test(chat)) try { ordersUpsert_(ordersSheet_(), m, text, name, !!(u.edited_message || u.edited_channel_post)); } catch (e) { Logger.log('ORDERS_ERR ' + e); }
      if (opsNeeded_(m, text)) opsQueue_({chat: chat, chat_id: m.chat.id, from: name + (f.username ? ' @' + f.username : ''), text: text, date: when, message_id: m.message_id, reply_to: m.reply_to_message ? (describe_(m.reply_to_message) || '').slice(0, 300) : null});
    }
    opsFlush_();
    if (sent) {
      Utilities.sleep(4000);
      GmailApp.search('to:' + TO + ' subject:"TG |" -label:' + LABEL + ' newer_than:1d').forEach(function (t) { t.addLabel(label); });
    }
  } finally {
    lock.releaseLock();
  }
}

// ===== Stage 3 (6.1.3): PLACE Team orders -> tab «Заказы» in the same Place Inbox spreadsheet =====
// Never breaks email: poll() calls ordersUpsert_ inside try/catch. No extra triggers/webhooks.
const ORDERS_TAB = 'Заказы';
const ORDERS_HDR = ['posted_time_ICT', 'sender', 'full_text', 'floor', 'status', 'edited_at', 'tg_message_id', 'status_history'];
const ORDERS_CHAT_RE = /place\s*team/i;
const ORDER_RE = /(order|สั่งของ|สั่งซื้อ)/i;   // 'New order ...' + KA TE purchase lists
const KATE_RE = /^ka\s*te/i;                    // KA TE (kitchen) purchase orders

function ordersSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(ORDERS_TAB);
  if (!sh) {
    sh = ss.insertSheet(ORDERS_TAB, ss.getNumSheets()); // at the end: getSheets()[0] stays «queue»
    sh.appendRow(ORDERS_HDR);
    sh.setFrozenRows(1);
  }
  return sh;
}

function isOrder_(chatTitle, sender, text) {
  if (!ORDERS_CHAT_RE.test(chatTitle || '')) return false;
  return ORDER_RE.test(text || '') || (KATE_RE.test(sender || '') && /สั่ง/.test(text || ''));
}

function parseFloor_(text) {
  var t = String(text || ''), out = [], re = /([1-6])\s*(st|nd|rd|th)?\s*f[lo]+r\b/ig, mm;
  var suf = {1: 'st', 2: 'nd', 3: 'rd'};
  while ((mm = re.exec(t))) { var f = mm[1] + (suf[mm[1]] || 'th') + ' floor'; if (out.indexOf(f) < 0) out.push(f); }
  var rooms = [[/meeting\s*room/i, 'Meeting room'], [/library/i, 'Library'], [/terrace|rooftop/i, 'Terrace'], [/take\s*-?away/i, 'Takeaway']];
  rooms.forEach(function (r) { if (r[0].test(t)) out.push(r[1]); });
  return out.join(', ');
}

function parseStatus_(text) {
  var t = String(text || ''), paid = t.match(/✅\s*([A-Za-z\u0E00-\u0E7F]+)?/);
  if (paid) return '✅' + (paid[1] ? paid[1].toLowerCase() : '');
  if (/❌|not\s*pa(y|id)|unpaid/i.test(t)) return '❌';
  return 'none';
}

function ictTime_(unix) { return Utilities.formatDate(new Date(unix * 1000), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm'); }

// Insert a new order row, or (for edits) update the row with the same tg_message_id.
function ordersUpsert_(sh, m, text, sender, isEdit) {
  var chat = m.chat.title || '';
  var id = String(m.message_id);
  var row = 0;
  if (isEdit && sh.getLastRow() > 1) {
    var ids = sh.getRange(2, 7, sh.getLastRow() - 1, 1).getValues();
    for (var i = ids.length - 1; i >= 0; i--) if (String(ids[i][0]) === id) { row = i + 2; break; }
  }
  if (!row && !isOrder_(chat, sender, text)) return 'skip';
  if (!ORDERS_CHAT_RE.test(chat)) return 'skip';
  var floor = parseFloor_(text), status = parseStatus_(text);
  var editedAt = isEdit ? ictTime_(m.edit_date || Math.floor(Date.now() / 1000)) : '';
  if (row) {
    var cur = sh.getRange(row, 1, 1, 8).getValues()[0];
    var hist = String(cur[7] || '');
    hist = (hist ? hist + ' | ' : '') + (cur[4] || 'none') + ' @' + (cur[5] || cur[0]);
    sh.getRange(row, 1, 1, 8).setValues([[cur[0], sender, text, floor, status, editedAt, cur[6], hist]]);
    return 'updated ' + row;
  }
  sh.appendRow([ictTime_(m.date), sender, text, floor, status, editedAt, id, '']);
  return 'inserted';
}

// Dry run: in-memory sheet only. No Telegram, no email, no spreadsheet writes. Run from the editor, read Logger.
function dryRunOrders() {
  var fake = {rows: [ORDERS_HDR.slice()],
    getLastRow: function () { return this.rows.length; },
    appendRow: function (r) { this.rows.push(r.slice()); },
    getRange: function (r, c, nr, nc) { var self = this; return {
      getValues: function () { return self.rows.slice(r - 1, r - 1 + nr).map(function (x) { return x.slice(c - 1, c - 1 + nc); }); },
      setValues: function (v) { for (var i = 0; i < nr; i++) for (var j = 0; j < nc; j++) self.rows[r - 1 + i][c - 1 + j] = v[i][j]; } }; }};
  var chat = {id: -1003641241156, title: 'PLACE Team', type: 'supergroup'};
  var t0 = 1790000000;
  var log = [];
  log.push(ordersUpsert_(fake, {chat: chat, message_id: 900001, date: t0}, 'New order for Anna Latte , separate 1 sugar 4th floor ❌ Not pay yet', 'Liang K', false));
  log.push(ordersUpsert_(fake, {chat: chat, message_id: 900001, date: t0, edit_date: t0 + 600}, 'New order for Anna Latte , separate 1 sugar 4th floor ✅ cash', 'Liang K', true));
  log.push(ordersUpsert_(fake, {chat: chat, message_id: 900002, date: t0 + 60}, 'Кто закрывает сегодня?', 'Leena', false));
  log.push(ordersUpsert_(fake, {chat: chat, message_id: 900003, date: t0 + 120, edit_date: t0 + 180}, 'New order for Saif Al Iced americano 3rd fooor', 'Aiz', true));
  log.push(ordersUpsert_(fake, {chat: chat, message_id: 900004, date: t0 + 200}, 'สั่งของ29.09.69 นมเมจิ5ลิตร 1แกลลอน', 'KA TE', false));
  Logger.log(JSON.stringify({ops: log, rows: fake.rows}, null, 1));
  return {ops: log, rows: fake.rows};
}
