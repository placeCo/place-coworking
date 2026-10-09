/**
 * Place Help Bot — Telegram client bot for PLACE Coworking (Chalong, Phuket).
 * Google Apps Script web app (doPost webhook). Separate Apps Script project «Place Help Bot».
 * 09.10.2026 ICT. Facts ONLY from canon: /workspace/place-brief/PLACE-BRIEF-2026-10-09.md + docs/canon/DECISIONS-LOG.md + CANON.md.
 *
 * NO SECRETS IN THIS FILE. Script Properties:
 *   HELP_BOT_TOKEN   — token of the NEW client bot (BotFather). NOT the @PlaceLeadBot token
 *                      (@PlaceLeadBot works by getUpdates polling; setWebhook on it would break the bridge).
 *   INBOX_SHEET_ID   — Place Inbox spreadsheet id (help-bot tab is created automatically).
 *   WEBHOOK_URL      — optional: the web app /exec URL, used by setWebhook() if no argument is passed.
 *   WEBHOOK_SECRET   — optional: random string; if set, it is added to the webhook URL as ?k=... and checked in doPost.
 *
 * Entry points: doPost (Telegram webhook), doGet (health check), setWebhook, deleteWebhook, webhookInfo,
 *   setupHelpBot (creates the help-bot tab, sets bot commands), helpBotSelfTest (no network, no writes).
 *
 * Rules baked in (canon): hours 08:00–23:00 daily (never 24/7); no free-day promise; office availability is never
 * confirmed («write us on WhatsApp, we'll show what's free»); no floor 4; podcast and meeting-room prices are not
 * invented (→ WhatsApp); day price 400 ฿ until 31.10.2026, 500 ฿ from 01.11.2026 (switches automatically by date).
 */

var HB_TZ = 'Asia/Bangkok';
var HB_TAB = 'help-bot';
var HB_HDR = ['ts', 'chat_id', 'username', 'lang', 'text', 'status'];
var HB_WA_NUMBER = '66951170481';                         // +66 95 117 0481
var HB_WA_URL = 'https://wa.me/' + HB_WA_NUMBER;
// Google Maps short link from the PLACE TG channel post /26 («Мы находимся здесь (Пхукет, Чалонг)»).
// Resolves to the Google place «PLACE COWORKING PHUKET», Chao Fah Tawan Tok Rd, Chalong (checked 09.10.2026).
// Override with Script Property MAPS_URL; set MAPS_URL to "-" to hide the button.
var HB_MAPS_URL = 'https://maps.app.goo.gl/pgJ5eHhoCJmf1YEH6';
var HB_PRICE_SWITCH = '2026-11-01';                      // day 400 -> 500, 10 days 2 500 -> 3 500
var HB_HUMAN_MIN = 30;                                   // after «Talk to a human», free text is logged for N minutes

// ============================ TEXTS (edit here) ============================
// Placeholders: {DAY} {DAY_NOTE} {TEN} {TEN_NOTE} {MAPS} are filled by date. Keep plain text (no Markdown/HTML).
var TEXTS = {
  en: {
    choose_lang: 'Hello! This is PLACE Coworking, Chalong, Phuket.\nPlease choose a language:',
    menu_title: 'How can we help? Choose a topic or just type your question.',
    btn_prices: '💳 Prices (Place Pass)',
    btn_offices: '🏢 Offices',
    btn_rooms: '🎙 Meeting rooms & podcast',
    btn_hours: '🕗 Hours & address',
    btn_whatsapp: '💬 Write on WhatsApp',
    btn_human: '🙋 Talk to a human',
    btn_menu: '⬅️ Menu',
    btn_maps: '📍 Google Maps',
    btn_lang: '🌐 Language',
    prices:
      'Place Pass — coworking on floors 1 and 3, every day 08:00–23:00.\n\n' +
      '• Hour — 50 ฿\n' +
      '• Day — {DAY} ฿{DAY_NOTE}\n' +
      '• Week — 1 800 ฿\n' +
      '• 10 days — {TEN} ฿{TEN_NOTE}\n' +
      '• Month — 6 000 ฿\n' +
      '• 3 months — 15 000 ฿\n\n' +
      'Extra monitor: 200 ฿ for 10 hours or 1 500 ฿ per month.\n' +
      'Place Pass residents get −20% on meeting rooms.\n\n' +
      'Questions? WhatsApp +66 95 117 0481.',
    day_note_before: ' (until 31.10.2026; from 01.11.2026 — 500 ฿)',
    ten_note_before: ' (until 31.10.2026; from 01.11.2026 — 3 500 ฿)',
    offices:
      'Private offices on floors 5 and 2, for teams of up to 6 people.\n\n' +
      '• 30 000 ฿ per month\n' +
      '• 20 000 ฿ per month on a 1-year contract — company registration address included (annual contract only)\n\n' +
      'Message us on WhatsApp and we\'ll show you what\'s free: +66 95 117 0481.',
    rooms:
      'Meeting rooms: for calls, client meetings and team sessions. Place Pass residents get −20%. For booking and prices, please write us on WhatsApp.\n\n' +
      'Podcast room: one room for recording; light and camera can be rented with it. Booking on WhatsApp +66 95 117 0481.',
    hours:
      'Open every day 08:00–23:00.\n\n' +
      'Address: 59/2 Chao Fah Tawan Tok Rd, Chalong, Mueang Phuket, 83130.\n' +
      'WhatsApp / phone: +66 95 117 0481\n' +
      'Email: info@placecoworking.com',
    maps_line: '\nMap: {MAPS}',
    night: 'Our hours are 08:00–23:00 every day. For anything outside these hours, please write us on WhatsApp +66 95 117 0481 and we\'ll see.',
    monitor: 'Extra monitor rental: 200 ฿ for 10 hours or 1 500 ฿ per month. Ask at reception or on WhatsApp +66 95 117 0481.',
    whatsapp: 'Write us on WhatsApp: +66 95 117 0481\n' + HB_WA_URL,
    human: 'Thank you! We\'ve passed your message to our team — we\'ll answer you here soon. For a faster reply, write us on WhatsApp +66 95 117 0481.',
    human_prompt: 'Sure! Type your question in one message and our team will answer here soon. For a faster reply: WhatsApp +66 95 117 0481.',
    lang_set: 'Language: English.'
  },
  ru: {
    choose_lang: 'Здравствуйте! Это PLACE Coworking, Чалонг, Пхукет.\nВыберите язык:',
    menu_title: 'Чем помочь? Выберите тему или просто напишите вопрос.',
    btn_prices: '💳 Цены (Place Pass)',
    btn_offices: '🏢 Офисы',
    btn_rooms: '🎙 Переговорки и подкаст',
    btn_hours: '🕗 Часы и адрес',
    btn_whatsapp: '💬 Написать в WhatsApp',
    btn_human: '🙋 Связаться с человеком',
    btn_menu: '⬅️ Меню',
    btn_maps: '📍 Google Maps',
    btn_lang: '🌐 Язык',
    prices:
      'Place Pass — коворкинг на 1 и 3 этаже, каждый день 08:00–23:00.\n\n' +
      '• Час — 50 ฿\n' +
      '• День — {DAY} ฿{DAY_NOTE}\n' +
      '• Неделя — 1 800 ฿\n' +
      '• 10 дней — {TEN} ฿{TEN_NOTE}\n' +
      '• Месяц — 6 000 ฿\n' +
      '• 3 месяца — 15 000 ฿\n\n' +
      'Аренда доп. монитора: 200 ฿ за 10 часов или 1 500 ฿ в месяц.\n' +
      'Резидентам Place Pass −20% на переговорные.\n\n' +
      'Вопросы — WhatsApp +66 95 117 0481.',
    day_note_before: ' (до 31.10.2026; с 01.11.2026 — 500 ฿)',
    ten_note_before: ' (до 31.10.2026; с 01.11.2026 — 3 500 ฿)',
    offices:
      'Офисы на 5 и 2 этаже, для команд до 6 человек.\n\n' +
      '• 30 000 ฿ в месяц\n' +
      '• 20 000 ฿ в месяц при договоре на год — адрес для регистрации компании входит (только в годовой договор)\n\n' +
      'Напишите в WhatsApp, покажем что свободно: +66 95 117 0481.',
    rooms:
      'Переговорные: для созвонов, встреч с клиентами и командных сессий. Резидентам Place Pass −20%. Бронь и цены — в WhatsApp.\n\n' +
      'Подкаст: одна комната для записи, к ней можно арендовать свет и камеру. Запись в WhatsApp +66 95 117 0481.',
    hours:
      'Открыто каждый день 08:00–23:00.\n\n' +
      'Адрес: 59/2 Chao Fah Tawan Tok Rd, Chalong, Mueang Phuket, 83130.\n' +
      'WhatsApp / телефон: +66 95 117 0481\n' +
      'Почта: info@placecoworking.com',
    maps_line: '\nКарта: {MAPS}',
    night: 'Мы работаем каждый день 08:00–23:00. Если нужно вне этих часов — напишите в WhatsApp +66 95 117 0481, посмотрим.',
    monitor: 'Аренда доп. монитора: 200 ฿ за 10 часов или 1 500 ฿ в месяц. Спросите на ресепшене или в WhatsApp +66 95 117 0481.',
    whatsapp: 'Напишите нам в WhatsApp: +66 95 117 0481\n' + HB_WA_URL,
    human: 'Спасибо! Мы передали сообщение команде и скоро ответим здесь. Быстрее всего — в WhatsApp +66 95 117 0481.',
    human_prompt: 'Конечно! Напишите вопрос одним сообщением — команда скоро ответит здесь. Быстрее всего — WhatsApp +66 95 117 0481.',
    lang_set: 'Язык: русский.'
  },
  th: {
    choose_lang: 'สวัสดีค่ะ PLACE Coworking ฉลอง ภูเก็ต ค่ะ\nกรุณาเลือกภาษาค่ะ:',
    menu_title: 'ให้เราช่วยอะไรดีคะ เลือกหัวข้อ หรือพิมพ์คำถามได้เลยค่ะ',
    btn_prices: '💳 ราคา (Place Pass)',
    btn_offices: '🏢 ออฟฟิศ',
    btn_rooms: '🎙 ห้องประชุม และ พอดแคสต์',
    btn_hours: '🕗 เวลาเปิด และ ที่อยู่',
    btn_whatsapp: '💬 ติดต่อทาง WhatsApp',
    btn_human: '🙋 คุยกับเจ้าหน้าที่',
    btn_menu: '⬅️ เมนู',
    btn_maps: '📍 Google Maps',
    btn_lang: '🌐 ภาษา',
    prices:
      'Place Pass — โคเวิร์กกิ้งชั้น 1 และชั้น 3 เปิดทุกวัน 08:00–23:00 ค่ะ\n\n' +
      '• รายชั่วโมง — 50 ฿\n' +
      '• รายวัน — {DAY} ฿{DAY_NOTE}\n' +
      '• รายสัปดาห์ — 1 800 ฿\n' +
      '• 10 วัน — {TEN} ฿{TEN_NOTE}\n' +
      '• รายเดือน — 6 000 ฿\n' +
      '• 3 เดือน — 15 000 ฿\n\n' +
      'เช่าจอเสริม: 200 ฿ ต่อ 10 ชั่วโมง หรือ 1 500 ฿ ต่อเดือน\n' +
      'สมาชิก Place Pass ลด 20% ค่าห้องประชุมค่ะ\n\n' +
      'สอบถามเพิ่มเติม WhatsApp +66 95 117 0481 ค่ะ',
    day_note_before: ' (ถึง 31.10.2026; ตั้งแต่ 01.11.2026 — 500 ฿)',
    ten_note_before: ' (ถึง 31.10.2026; ตั้งแต่ 01.11.2026 — 3 500 ฿)',
    offices:
      'ออฟฟิศส่วนตัวชั้น 5 และชั้น 2 สำหรับทีมไม่เกิน 6 คนค่ะ\n\n' +
      '• 30 000 ฿ ต่อเดือน\n' +
      '• 20 000 ฿ ต่อเดือน เมื่อทำสัญญา 1 ปี — ใช้ที่อยู่จดทะเบียนบริษัทได้ (เฉพาะสัญญารายปี)\n\n' +
      'ติดต่อเราทาง WhatsApp แล้วเราจะแจ้งห้องที่ว่างให้ค่ะ: +66 95 117 0481',
    rooms:
      'ห้องประชุม: สำหรับประชุมออนไลน์ พบลูกค้า และประชุมทีม สมาชิก Place Pass ลด 20% จองและสอบถามราคาทาง WhatsApp ค่ะ\n\n' +
      'ห้องพอดแคสต์: 1 ห้องสำหรับอัดเสียง เช่าไฟและกล้องเพิ่มได้ จองทาง WhatsApp +66 95 117 0481 ค่ะ',
    hours:
      'เปิดทุกวัน 08:00–23:00 ค่ะ\n\n' +
      'ที่อยู่: 59/2 Chao Fah Tawan Tok Rd, Chalong, Mueang Phuket, 83130\n' +
      'WhatsApp / โทร: +66 95 117 0481\n' +
      'อีเมล: info@placecoworking.com',
    maps_line: '\nแผนที่: {MAPS}',
    night: 'เราเปิดทุกวัน 08:00–23:00 ค่ะ หากต้องการนอกเวลานี้ กรุณาติดต่อ WhatsApp +66 95 117 0481 ค่ะ',
    monitor: 'เช่าจอเสริม: 200 ฿ ต่อ 10 ชั่วโมง หรือ 1 500 ฿ ต่อเดือน สอบถามที่เคาน์เตอร์ หรือ WhatsApp +66 95 117 0481 ค่ะ',
    whatsapp: 'ติดต่อเราทาง WhatsApp: +66 95 117 0481\n' + HB_WA_URL,
    human: 'ขอบคุณค่ะ เราส่งข้อความให้ทีมงานแล้ว จะตอบกลับที่นี่เร็ว ๆ นี้ค่ะ หากต้องการคำตอบเร็วขึ้น ติดต่อ WhatsApp +66 95 117 0481 ค่ะ',
    human_prompt: 'ได้เลยค่ะ พิมพ์คำถามในข้อความเดียว ทีมงานจะตอบกลับที่นี่เร็ว ๆ นี้ค่ะ หรือติดต่อ WhatsApp +66 95 117 0481 ค่ะ',
    lang_set: 'ภาษา: ไทย'
  }
};

// Free-text keyword routing (first match wins; order matters). Lowercased text is tested.
var HB_KEYWORDS = [
  // free day / trial: canon allows the free day only in ads/flyers -> never answered by the bot, goes to a human
  ['human',   /(free|trial|бесплатн|пробн|ฟรี|ทดลอง)/i],
  ['night',   /(24\s*\/\s*7|24h|night|overnight|ноч|круглосуточ|กลางคืน|ตลอด\s*24|24\s*ชั่วโมง)/i],
  ['monitor', /(monitor|screen|монитор|экран|จอ)/i],
  ['offices', /(office|private room|company address|registration|офис|кабинет|адрес для компании|регистрац|ออฟฟิศ|สำนักงาน|ห้องทำงาน)/i],
  ['rooms',   /(meeting|conference|podcast|studio|record|переговор|подкаст|студи|запис|ห้องประชุม|พอดแคสต์|อัดเสียง|สตูดิโอ)/i],
  ['prices',  /(price|cost|how much|\brates?\b|tariff|\bpass\b|\bday\b|\bweek|\bmonth|цен|стоит|стоимост|сколько|прайс|тариф|пасс|абонемент|день|недел|месяц|ราคา|เท่าไหร่|เท่าไร|ค่าใช้จ่าย|รายวัน|รายเดือน)/i],
  ['hours',   /(hour|open|close|when|address|where|location|map|direction|час|работает|открыт|закрыт|адрес|где|как добраться|карт|เวลา|เปิด|ปิด|ที่อยู่|ที่ไหน|แผนที่)/i],
  ['whatsapp',/(whatsapp|ватсап|вотсап|วอทส์แอป)/i],
  ['human',   /(human|person|manager|operator|staff|человек|менеджер|оператор|администратор|เจ้าหน้าที่|พนักงาน|คุยกับคน)/i]
];
// prices is checked before hours, so «how much per hour» -> prices, «opening hours» -> hours.

// ============================ webhook ============================

function doGet() { return ContentService.createTextOutput('Place Help Bot OK'); }

function doPost(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty('WEBHOOK_SECRET');
    if (secret && (!e || !e.parameter || e.parameter.k !== secret)) return hbOk_();
    var u = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!u.update_id) return hbOk_();
    var cache = CacheService.getScriptCache();
    if (cache.get('upd_' + u.update_id)) return hbOk_();     // Telegram may retry the same update
    cache.put('upd_' + u.update_id, '1', 21600);
    if (u.callback_query) hbOnCallback_(u.callback_query);
    else if (u.message) hbOnMessage_(u.message);
  } catch (err) {
    Logger.log('HB_ERR ' + err + (err && err.stack ? '\n' + err.stack : ''));
  }
  return hbOk_();
}

function hbOk_() { return ContentService.createTextOutput('ok'); }

function hbOnMessage_(m) {
  if (!m.chat || m.chat.type !== 'private') return;          // client bot: private chats only
  var chatId = m.chat.id, from = m.from || {};
  var text = String(m.text || m.caption || '').trim();
  var lang = hbGetLang_(chatId);
  if (/^\/start\b/.test(text) || (!lang && !text)) { hbAskLang_(chatId, from); return; }
  if (!lang) lang = hbGuessLang_(from);
  if (/^\/(menu|help)\b/.test(text)) { hbSendMenu_(chatId, lang); return; }
  if (/^\/lang(uage)?\b/.test(text)) { hbAskLang_(chatId, from); return; }
  if (!text) { // photo without caption, sticker, voice …
    text = m.photo ? '[photo]' : m.voice ? '[voice]' : m.sticker ? '[sticker]' : m.document ? '[file]' : '[non-text]';
    hbHandoff_(chatId, from, lang, text, false);
    return;
  }
  var cache = CacheService.getScriptCache();
  if (cache.get('human_' + chatId)) { hbHandoff_(chatId, from, lang, text, false); return; }
  var topic = hbMatch_(text);
  if (topic === 'human' || !topic) { hbHandoff_(chatId, from, lang, text, false); return; }
  hbAnswer_(chatId, lang, topic);
}

function hbOnCallback_(q) {
  var chatId = q.message && q.message.chat && q.message.chat.id;
  var data = String(q.data || ''), from = q.from || {};
  hbApi_('answerCallbackQuery', {callback_query_id: q.id});
  if (!chatId) return;
  if (data.indexOf('lang:') === 0) {
    var lang = data.slice(5);
    if (!TEXTS[lang]) return;
    hbSetLang_(chatId, lang);
    hbSend_(chatId, hbT_(lang, 'lang_set'));
    hbSendMenu_(chatId, lang);
    return;
  }
  var lang2 = hbGetLang_(chatId) || hbGuessLang_(from);
  if (data === 'm:menu') { hbSendMenu_(chatId, lang2); return; }
  if (data === 'm:lang') { hbAskLang_(chatId, from); return; }
  if (data === 'm:human') {
    CacheService.getScriptCache().put('human_' + chatId, '1', HB_HUMAN_MIN * 60);
    hbHandoff_(chatId, from, lang2, '[button] Talk to a human', true);
    return;
  }
  if (data.indexOf('m:') === 0) hbAnswer_(chatId, lang2, data.slice(2));
}

// ============================ answers ============================

function hbMatch_(text) {
  var t = String(text || '').toLowerCase();
  for (var i = 0; i < HB_KEYWORDS.length; i++) if (HB_KEYWORDS[i][1].test(t)) return HB_KEYWORDS[i][0];
  return null;
}

function hbAnswer_(chatId, lang, topic) {
  var kb = [[hbBtn_(hbT_(lang, 'btn_whatsapp'), null, HB_WA_URL)], [hbBtn_(hbT_(lang, 'btn_menu'), 'm:menu')]];
  var body;
  switch (topic) {
    case 'prices': body = hbPrices_(lang, new Date()); break;
    case 'offices': body = hbT_(lang, 'offices'); break;
    case 'rooms': body = hbT_(lang, 'rooms'); break;
    case 'night': body = hbT_(lang, 'night'); break;
    case 'monitor': body = hbT_(lang, 'monitor'); break;
    case 'whatsapp': body = hbT_(lang, 'whatsapp'); break;
    case 'hours':
      body = hbT_(lang, 'hours');
      var maps = hbMapsUrl_();
      if (maps) { body += hbT_(lang, 'maps_line').replace('{MAPS}', maps); kb.unshift([hbBtn_(hbT_(lang, 'btn_maps'), null, maps)]); }
      break;
    default: hbSendMenu_(chatId, lang); return;
  }
  hbSend_(chatId, body, {inline_keyboard: kb});
}

function hbIctYmd_(d) { return Utilities.formatDate(d, HB_TZ, 'yyyy-MM-dd'); }

// Day 400 / 10 days 2 500 until 31.10.2026, then 500 / 3 500 (canon; after the switch only the new price is shown).
function hbPrices_(lang, now) {
  var before = hbIctYmd_(now) < HB_PRICE_SWITCH;
  return hbT_(lang, 'prices')
    .replace('{DAY}', before ? '400' : '500')
    .replace('{DAY_NOTE}', before ? hbT_(lang, 'day_note_before') : '')
    .replace('{TEN}', before ? '2 500' : '3 500')
    .replace('{TEN_NOTE}', before ? hbT_(lang, 'ten_note_before') : '');
}

function hbMapsUrl_() {
  var p = PropertiesService.getScriptProperties().getProperty('MAPS_URL');
  if (p === '-') return '';
  return p || HB_MAPS_URL;
}

function hbHandoff_(chatId, from, lang, text, isButton) {
  hbLog_(chatId, from, lang, text);
  var kb = {inline_keyboard: [[hbBtn_(hbT_(lang, 'btn_whatsapp'), null, HB_WA_URL)], [hbBtn_(hbT_(lang, 'btn_menu'), 'm:menu')]]};
  hbSend_(chatId, hbT_(lang, isButton ? 'human_prompt' : 'human'), kb);
  // Ops wake: NOT wired here on purpose. Ops reads tab «help-bot» rows with status=new (webhook wake to be added later).
}

function hbLog_(chatId, from, lang, text) {
  var id = PropertiesService.getScriptProperties().getProperty('INBOX_SHEET_ID');
  if (!id) { Logger.log('HB_NO_INBOX_SHEET_ID'); return; }
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var sh = hbSheet_(id);
    var who = from.username ? '@' + from.username : [from.first_name, from.last_name].filter(Boolean).join(' ');
    sh.appendRow([Utilities.formatDate(new Date(), HB_TZ, 'yyyy-MM-dd HH:mm:ss'), String(chatId), who, lang, String(text).slice(0, 4000), 'new']);
  } finally { try { lock.releaseLock(); } catch (e) {} }
}

function hbSheet_(id) {
  var ss = SpreadsheetApp.openById(id);
  var sh = ss.getSheetByName(HB_TAB);
  if (!sh) {
    sh = ss.insertSheet(HB_TAB, ss.getNumSheets());     // at the end: never becomes sheet [0] (bridge «queue» stays first)
    sh.appendRow(HB_HDR);
    sh.setFrozenRows(1);
  }
  return sh;
}

// ============================ menus ============================

function hbAskLang_(chatId, from) {
  var g = hbGuessLang_(from || {});
  var title = TEXTS.en.choose_lang + (g !== 'en' ? '\n\n' + TEXTS[g].choose_lang : '');
  hbSend_(chatId, title, {inline_keyboard: [[hbBtn_('English', 'lang:en'), hbBtn_('Русский', 'lang:ru'), hbBtn_('ไทย', 'lang:th')]]});
}

function hbSendMenu_(chatId, lang) {
  var kb = [
    [hbBtn_(hbT_(lang, 'btn_prices'), 'm:prices')],
    [hbBtn_(hbT_(lang, 'btn_offices'), 'm:offices')],
    [hbBtn_(hbT_(lang, 'btn_rooms'), 'm:rooms')],
    [hbBtn_(hbT_(lang, 'btn_hours'), 'm:hours')],
    [hbBtn_(hbT_(lang, 'btn_whatsapp'), null, HB_WA_URL)],
    [hbBtn_(hbT_(lang, 'btn_human'), 'm:human'), hbBtn_(hbT_(lang, 'btn_lang'), 'm:lang')]
  ];
  hbSend_(chatId, hbT_(lang, 'menu_title'), {inline_keyboard: kb});
}

function hbBtn_(text, data, url) { return url ? {text: text, url: url} : {text: text, callback_data: data}; }

function hbT_(lang, key) { return (TEXTS[lang] && TEXTS[lang][key]) || TEXTS.en[key] || ''; }

// ============================ language storage ============================
// Persistent: Script Properties key lang_<chat_id> (2 chars each). Fast path: CacheService (6 h).

function hbGetLang_(chatId) {
  var c = CacheService.getScriptCache(), k = 'lang_' + chatId, v = c.get(k);
  if (v) return v;
  v = PropertiesService.getScriptProperties().getProperty(k);
  if (v) c.put(k, v, 21600);
  return v || null;
}

function hbSetLang_(chatId, lang) {
  PropertiesService.getScriptProperties().setProperty('lang_' + chatId, lang);
  CacheService.getScriptCache().put('lang_' + chatId, lang, 21600);
}

function hbGuessLang_(from) {
  var lc = String((from && from.language_code) || '').toLowerCase();
  if (/^(ru|uk|be|kk)/.test(lc)) return 'ru';
  if (/^th/.test(lc)) return 'th';
  return 'en';
}

// ============================ Telegram API ============================

function hbToken_() {
  var t = PropertiesService.getScriptProperties().getProperty('HELP_BOT_TOKEN');
  if (!t) throw new Error('HELP_BOT_TOKEN is not set in Script Properties');
  return t;
}

function hbApi_(method, payload) {
  var r = UrlFetchApp.fetch('https://api.telegram.org/bot' + hbToken_() + '/' + method, {
    method: 'post', contentType: 'application/json', payload: JSON.stringify(payload || {}), muteHttpExceptions: true});
  var j = {};
  try { j = JSON.parse(r.getContentText()); } catch (e) {}
  if (!j.ok) Logger.log('HB_API ' + method + ' ' + r.getResponseCode() + ' ' + String(j.description || '').slice(0, 200));
  return j;
}

function hbSend_(chatId, text, markup) {
  var p = {chat_id: chatId, text: text, disable_web_page_preview: true};
  if (markup) p.reply_markup = markup;
  return hbApi_('sendMessage', p);
}

// ============================ setup helpers (run from the editor) ============================

// Run after deploying the web app. Pass the /exec URL or set Script Property WEBHOOK_URL first.
// Uses HELP_BOT_TOKEN only. NEVER use the @PlaceLeadBot token here.
function setWebhook(url) {
  var props = PropertiesService.getScriptProperties();
  url = (typeof url === 'string' && url) || props.getProperty('WEBHOOK_URL');
  if (!url || !/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(url)) throw new Error('Set Script Property WEBHOOK_URL to the web app /exec URL');
  var secret = props.getProperty('WEBHOOK_SECRET');
  var full = url + (secret ? '?k=' + encodeURIComponent(secret) : '');
  var r = hbApi_('setWebhook', {url: full, allowed_updates: ['message', 'callback_query'], drop_pending_updates: true, max_connections: 10});
  Logger.log('SET_WEBHOOK ok=' + r.ok + ' ' + (r.description || ''));
  webhookInfo();
}

function deleteWebhook() { var r = hbApi_('deleteWebhook', {drop_pending_updates: false}); Logger.log('DELETE_WEBHOOK ok=' + r.ok); }

function webhookInfo() {
  var r = hbApi_('getWebhookInfo', {});
  var i = r.result || {};
  // url is logged without the ?k= secret
  Logger.log('WEBHOOK url=' + String(i.url || '').replace(/\?k=.*/, '?k=***') + ' pending=' + i.pending_update_count +
    ' last_error=' + (i.last_error_message || '-') + ' bot=' + JSON.stringify((hbApi_('getMe', {}).result || {}).username));
}

// Creates the help-bot tab (if missing) and sets the bot command list. Sends no messages.
function setupHelpBot() {
  var id = PropertiesService.getScriptProperties().getProperty('INBOX_SHEET_ID');
  if (!id) throw new Error('Set Script Property INBOX_SHEET_ID');
  Logger.log('TAB ' + hbSheet_(id).getName() + ' OK');
  hbApi_('setMyCommands', {commands: [{command: 'start', description: 'Start / language'}, {command: 'menu', description: 'Menu'}, {command: 'lang', description: 'Language / Язык / ภาษา'}]});
  hbApi_('setMyCommands', {language_code: 'ru', commands: [{command: 'start', description: 'Начать / язык'}, {command: 'menu', description: 'Меню'}, {command: 'lang', description: 'Язык'}]});
  hbApi_('setMyCommands', {language_code: 'th', commands: [{command: 'start', description: 'เริ่มต้น / ภาษา'}, {command: 'menu', description: 'เมนู'}, {command: 'lang', description: 'ภาษา'}]});
  Logger.log('SETUP_HELP_BOT_OK');
}

// No network, no writes: checks keyword routing, price switch and banned phrases in all texts.
function helpBotSelfTest() {
  var out = [], bad = /(24\s*\/\s*7|open 24|круглосуточ|free day|бесплатн|ฟรี|cheapest|дешев|дешёв|kathu|83000|bangkok|бангкок|4th floor|4 этаж|ชั้น 4)/i;
  Object.keys(TEXTS).forEach(function (l) {
    Object.keys(TEXTS[l]).forEach(function (k) { if (bad.test(TEXTS[l][k])) out.push('BANNED ' + l + '.' + k); });
    ['prices', 'offices', 'rooms', 'hours', 'night', 'monitor', 'whatsapp', 'human', 'human_prompt', 'menu_title'].forEach(function (k) {
      if (!TEXTS[l][k]) out.push('MISSING ' + l + '.' + k);
    });
  });
  var cases = {'how much is a day?': 'prices', 'цена месяц': 'prices', 'ราคาเท่าไหร่': 'prices', 'do you have an office for 4?': 'offices',
    'офис на год': 'offices', 'ออฟฟิศ': 'offices', 'what are your opening hours': 'hours', 'где вы находитесь': 'hours', 'เปิดกี่โมง': 'hours',
    'podcast booking': 'rooms', 'переговорка на завтра': 'rooms', 'open 24/7?': 'night', 'можно ночью?': 'night', 'monitor rent': 'monitor',
    'хочу поговорить с менеджером': 'human', 'free day?': 'human', 'бесплатный день': 'human', 'asdf qwerty': null};
  Object.keys(cases).forEach(function (q) { var got = hbMatch_(q); if (got !== cases[q]) out.push('MATCH "' + q + '" -> ' + got + ' (want ' + cases[q] + ')'); });
  var p1 = hbPrices_('en', new Date('2026-10-31T16:00:00Z')), p2 = hbPrices_('en', new Date('2026-10-31T17:30:00Z'));
  if (p1.indexOf('Day — 400 ฿') < 0 || p1.indexOf('10 days — 2 500 ฿') < 0) out.push('PRICE_BEFORE ' + p1);
  if (p2.indexOf('Day — 500 ฿') < 0 || p2.indexOf('10 days — 3 500 ฿') < 0 || /400|2 500/.test(p2)) out.push('PRICE_AFTER ' + p2);
  Logger.log(out.length ? 'SELFTEST_FAIL\n' + out.join('\n') : 'SELFTEST_OK');
  return out;
}

if (typeof module !== 'undefined') module.exports = {TEXTS: TEXTS, hbMatch_: hbMatch_, hbPrices_: hbPrices_, helpBotSelfTest: helpBotSelfTest};
