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
  var url = props.getProperty('OPS_URL'), auth = props.getProperty('OPS_AUTH');
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

const WELCOME = "Привет! Это @PlaceLeadBot, помощник команды Place Coworking.\n\nКак я работаю:\n• Всё, что вы пишете мне в личку или в рабочие чаты (PLACE Team, PlaceCo, «Тех вопросы»), я получаю и разбираю.\n• Обычные сообщения я собираю и смотрю пачкой, примерно раз в 15 минут, плюс сводки в 13:00 и 19:30.\n• Если что-то срочное, напишите слово «срочно» (или urgent / ด่วน). Тогда я увижу сообщение в течение минуты.\n• Заказы в кафе пишите как обычно в PLACE Team, их обрабатывают отдельно.\n• Цены, публикации и ответы клиентам согласовывает George. Если вопрос требует его решения, я передам и вернусь с ответом.\n• Отвечаю с 10:00 до 22:00. Если нужно что-то узнать или передать, пишите сюда прямо в личку.";

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
