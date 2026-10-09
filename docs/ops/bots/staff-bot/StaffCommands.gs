// StaffCommands.gs — file in Apps Script project «Place TG Bridge» (@PlaceLeadBot). NO SECRETS IN THIS FILE.
// v2 09.10.2026 ICT. Staff get an instant canned answer from the script (no AI, Ops is not woken; Lead reviews the log):
//   • slash commands: /help /prices /office /renewals [дата] /bookings [завтра|дата] /hours /book …
//   • plain RU/EN/TH phrases without a slash: «цены», «цена офиса», «кто продлевается», «брони завтра», «адрес», «помощь» …
//   • booking request: «бронь переговорка 15:00-16:00 Иван +66…» → new row in «Events and booking» → tab «Брони бот»
// Conservative: plain phrases only if short (≤ 60 chars) and clearly about ONE thing; in groups only when @PlaceLeadBot is
// mentioned or the message replies to the bot; DMs match freely. Only staff senders. Anything else returns false and
// poll() continues exactly as before (email to info@, queue row, opsNeeded_ → Ops wake).
// Light / AC / lamp / shower words (свет, кондиционер, лампа, ไฟ, แอร์, /light, /ac …) ALWAYS return false here, so the
// next hook in poll(), tuyaHookSafe_ (Tuya.gs), gets them.
//
// Live order in poll() (Code.gs): photoHook_ → `if (!text) continue` → handleStaffCommand_(m, tok, edited) → tuyaHookSafe_(u, m, tok).
// Reuses (only if present in the project, typeof-guarded): rnBuild_/rnTodayIct_ (Renewals.gs),
// bookingsToday_/bkDateCols_ (file BookingsToday = docs/ops/handover/bookings-today.gs).
// Script Properties used: STAFF_IDS (optional, extra Telegram user ids, comma-separated). No keys, no tokens in this file.
// Writes: Place Inbox → tab «staff-cmd» (one row per handled message); Events and booking → tab «Брони бот» (append only).
// Never writes into the existing booking grids. All globals are prefixed SC_/sc* (no clashes with Code.gs, Tuya.gs, BK_*).

var SC_TZ = 'Asia/Bangkok';
var SC_BOT = 'placeleadbot';
var SC_INBOX_ID = '1uMHYp6d-Ji9VQj5xtESiXummBNX9bC8vTruPRQLs8jw';   // Place Inbox (same as SHEET_ID in Code.gs)
var SC_LOG_TAB = 'staff-cmd';
var SC_LOG_HDR = ['ts', 'chat', 'chat_id', 'from', 'command', 'result', 'intent', 'mode'];
var SC_EVENTS_ID = '1BSwm4sY-ksXjFNEEsAdyiWmUDzgbQlJpL_dh9JIdZAc';  // «Events and booking»
var SC_BOOK_TAB = 'Брони бот';
var SC_BOOK_HDR = ['created_ict', 'date', 'start', 'end', 'room', 'name_contact', 'by', 'raw_text', 'status'];
var SC_GRID_HEADER_ROW = 4;                                          // grids: row 4 = "Time" + one column per day
var SC_STAFF_USERNAMES = ['yasozidayu', 'rufasstyle', 'dftnsss'];   // = TEAM in Code.gs (Лена, Никита, Алёна)
var SC_STAFF_IDS = ['7486466296', '8944262207', '8503184147'];      // Tangmo, Leena (admins), George
var SC_MAX_TG = 3900;
var SC_MAX_PLAIN = 60;                                               // plain phrases longer than this → not ours
var SC_MAX_BOOK = 160;
var SC_WA = '+66 95 117 0481';
var SC_ADDR = '59/2 Chao Fah Tawan Tok Rd, Chalong, Mueang Phuket, 83130';

// Rooms = tab names of «Events and booking» (read 09.10.2026; hidden «3 floor», «Office room-2», «Sheet34» left out).
// Podcast has no grid tab: only «Брони бот» rows are checked for it.
var SC_ROOMS = [
  {name: 'Meeting room', tab: 'Meeting room', re: 'meeting\\s*room|meeting|переговор[а-яё]*|ห้องประชุม'},
  {name: 'Podcast', tab: null, re: 'podcast\\s*room|podcast|подкаст[а-яё]*|ห้องพอดแคสต์|พอดแคสต์|พ็อดแคสต์'},
  {name: 'Library', tab: 'Library', re: 'library|библиотек[а-яё]*|ห้องสมุด'},
  {name: 'ART Room', tab: 'ART Room ', re: 'art\\s*room|арт[\\s-]*рум[а-яё]*|арт|art'},
  {name: 'Workshop room', tab: 'Workshop room', re: 'workshop(?:\\s*room)?|воркшоп[а-яё]*|เวิร์คช็อป|เวิร์กช็อป'},
  {name: 'Office room-4 (GREEN)', tab: 'Office room-4 (GREEN)', re: 'office\\s*room[\\s-]*4(?:\\s*\\(green\\))?|green(?:\\s*(?:room|office))?|грин|зел[её]н[а-яё]*\\s+(?:комнат[а-яё]*|офис[а-яё]*)'},
  {name: '1 floor', tab: '1 floor', re: '1\\s*(?:st)?\\s*(?:floor|этаж[а-яё]*)|(?:floor|этаж)\\s*1|ชั้น\\s*1'},
  {name: '4 floor', tab: '4 floor', re: '4\\s*(?:th)?\\s*(?:floor|этаж[а-яё]*)|(?:floor|этаж)\\s*4|ชั้น\\s*4'},
  {name: '6 floor', tab: '6 floor', re: '6\\s*(?:th)?\\s*(?:floor|этаж[а-яё]*)|(?:floor|этаж)\\s*6|ชั้น\\s*6'}
];

// ---------------- entry point ----------------

function handleStaffCommand_(m, tok, isEdit) {
  var d = scDecide_(m);
  if (!d) return false;                                       // not ours → poll() continues (Tuya hook, email, queue, Ops)
  if (isEdit) { scLog_(m, d, 'edit ignored', ''); return true; }   // never re-run / re-book because a message was edited
  var reply;
  try {
    reply = scRun_(d, m);
  } catch (e) {
    Logger.log('STAFF_CMD_ERR ' + d.intent + ' ' + e);
    scSend_(tok, m.chat.id, scT_(d.lang, 'fail') + String((e && e.message) || e).slice(0, 200), m.message_id);
    scLog_(m, d, 'ERROR ' + String((e && e.message) || e).slice(0, 200), '');
    return false;                                             // fall through → queue + Ops wake
  }
  var parts = Array.isArray(reply) ? reply : [reply];
  parts.forEach(function (p, i) { scSend_(tok, m.chat.id, p, i === 0 ? m.message_id : null); });
  scLog_(m, d, d.status || 'ok', parts.join('\n'));
  return true;
}

// Pure decision (no sends, no writes): {intent, lang, mode, cmd, ymd?, day?, raw?} or null.
function scDecide_(m) {
  if (!m || !m.chat || typeof m.text !== 'string') return null;
  var text = m.text.trim();
  if (!text) return null;
  if (scHasDeviceWords_(text)) return null;                   // light / AC / lamp … → Tuya.gs gets it
  if (!scIsStaff_(m.from)) return null;                       // not staff → Ops as before (no auto answer)
  return scClassify_(m, text);
}

function scRun_(d, m) {
  switch (d.intent) {
    case 'help': return scHelp_(d.lang);
    case 'prices': return scPrices_(new Date(), d.lang);
    case 'office': return scOffice_(d.lang);
    case 'hours': return scHours_(d.lang);
    case 'renewals': return scRenewals_(d);
    case 'bookings': return scBookings_(d);
    case 'book': return scBook_(d, m);
  }
  throw new Error('unknown intent ' + d.intent);
}

// ---------------- access ----------------

function scIsStaff_(f) {
  f = f || {};
  var id = String(f.id || ''), un = String(f.username || '').toLowerCase();
  var extra = String(PropertiesService.getScriptProperties().getProperty('STAFF_IDS') || '').split(/[\s,]+/).filter(Boolean);
  return !!id && (SC_STAFF_IDS.indexOf(id) >= 0 || extra.indexOf(id) >= 0) || (!!un && SC_STAFF_USERNAMES.indexOf(un) >= 0);
}

// ---------------- classification ----------------

// Device words belong to Tuya.gs. Token-exact for RU/EN (so «Светлана» is not «свет»), substring for Thai.
var SC_DEVICE_TOKEN_RE = /^(?:свет|света|свету|светом|ламп[а-яё]*|лампочк[а-яё]*|конди[а-яё]*|конде[а-яё]*|кондер[а-яё]*|конд|душ|душа|душе|вкл|выкл|включ[а-яё]*|выключ[а-яё]*|отключ[а-яё]*|вруби[а-яё]*|выруби[а-яё]*|light|lights|lamp|lamps|bulb|bulbs|ac|acs|air|aircon|aircons|aircondition[a-z]*|conditioner|shower|lc_?\d|fl4_?[a-z0-9_]*|air_?\d|podcast_?[12]|podcast[12]|status|статус)$/;
var SC_DEVICE_TH_RE = /(ไฟ|แอร์|หลอด|โคม|เครื่องปรับอากาศ|ฝักบัว)/;

function scHasDeviceWords_(text) {
  var t = String(text || '');
  if (SC_DEVICE_TH_RE.test(t)) return true;
  var w = t.toLowerCase().replace(/ё/g, 'е').replace(/@[a-z0-9_]+/g, ' ').replace(/^\s*\//, '').split(/[^a-zа-я0-9_]+/);
  for (var i = 0; i < w.length; i++) if (w[i] && SC_DEVICE_TOKEN_RE.test(w[i])) return true;
  return false;
}

function scLang_(s) {
  s = String(s || '');
  if (/[\u0E00-\u0E7F]/.test(s)) return 'th';
  if (/[а-яё]/i.test(s)) return 'ru';
  return 'en';
}

function scAddressed_(m, text) {
  if (m.chat.type === 'private') return true;
  if (new RegExp('@' + SC_BOT + '\\b', 'i').test(text)) return true;
  var r = m.reply_to_message;
  return !!(r && r.from && String(r.from.username || '').toLowerCase() === SC_BOT);
}

var SC_SLASH = {help: 'help', start_help: 'help', prices: 'prices', price: 'prices', office: 'office', renewals: 'renewals',
  bookings: 'bookings', hours: 'hours', address: 'hours', book: 'book'};

function scClassify_(m, text) {
  // 1) slash commands (work in groups without a mention, as before; /cmd@otherbot is ignored)
  var mm = text.match(/^\/([a-z_]+)(?:@([a-z0-9_]+))?(?:\s+([\s\S]*))?$/i);
  if (mm) {
    var cmd = mm[1].toLowerCase(), at = (mm[2] || '').toLowerCase(), args = (mm[3] || '').trim();
    if (at && at !== SC_BOT) return null;
    if (!SC_SLASH.hasOwnProperty(cmd)) return null;           // unknown (/start, /light, /ac, /foo …) → not ours
    var d = {intent: SC_SLASH[cmd], lang: args ? scLang_(args) : 'en', mode: 'slash', cmd: '/' + cmd + (args ? ' ' + args : '')};
    if (d.intent === 'book') { d.raw = args; return d; }
    if (d.intent === 'renewals' || d.intent === 'bookings') scDateArgs_(args, d);
    return d;
  }
  if (text.charAt(0) === '/') return null;
  // 2) plain text: groups only when addressed to the bot
  if (!scAddressed_(m, text)) return null;
  var s = text.replace(new RegExp('@' + SC_BOT + '\\b', 'ig'), ' ').replace(/\s+/g, ' ').trim();
  if (!s || /@[a-z0-9_]{3,}/i.test(s)) return null;           // addressed to someone else too → Ops
  var lang = scLang_(s);
  // booking request: prefix + (time or room)
  var bp = s.match(/^(?:бронь|забронируй(?:те)?|забронировать|book|booking|จอง)(?=$|[\s,:])|^จอง/i);
  if (bp) {
    var rest = s.slice(bp[0].length).replace(/^[\s,:]+/, '');
    if (scFindTime_(rest) || scFindRoom_(rest).length) {
      if (s.length > SC_MAX_BOOK) return null;
      return {intent: 'book', lang: lang, mode: 'plain', cmd: s, raw: rest};
    }
  }
  if (s.length > SC_MAX_PLAIN) return null;
  var r = lang === 'th' ? scClassifyTh_(s) : scClassifyWords_(s);
  if (!r) return null;
  r.lang = lang; r.mode = 'plain'; r.cmd = s;
  return r;
}

function scDateArgs_(args, d) {
  var a = String(args || '').toLowerCase();
  var dm = a.match(/\d{4}-\d{2}-\d{2}|\d{1,2}[.\/]\d{1,2}(?:[.\/]\d{2,4})?/), ymd = dm ? scParseDateToken_(dm[0]) : null;
  if (ymd) d.ymd = ymd;
  else if (/послезавтра|มะรืน/.test(a)) d.ymd = scAddDays_(scToday_(), 2);
  else if (/tomorrow|завтра|พรุ่งนี้/.test(a)) d.ymd = scAddDays_(scToday_(), 1);
}

// Vocabulary: every token of the message must be known; exactly one intent.
var SC_VOCAB = (function () {
  var v = {}, add = function (cat, list) { list.split(' ').forEach(function (x) { (v[x] = v[x] || []).push(cat); }); };
  add('kw:help', 'help помощь помоги команды commands command menu меню умеешь можешь');
  add('kw:prices', 'цены цена цену цен ценах прайс прайслист прайса стоимость тариф тарифы тарифов price prices pricing pricelist rates tariff tariffs');
  add('kw:office', 'офис офиса офисы офисов офисе офису office offices кабинет кабинеты кабинета');
  add('kw:renewals', 'продление продления продлений продлевается продлеваются продлевает продлить продлил продлили истекает истекают истек истекли истекло заканчивается заканчиваются renewals renewal renew renews renewing expiring expire expires expired expiry');
  add('kw:bookings', 'брони бронь бронирования бронирование бронирований забронировано забронирован бронировал бронировали bookings booking booked reservations reservation reserved');
  add('kw:hours', 'часы работы работаете работаем открыто открыты открываемся открываетесь закрываемся закрываетесь закрыты режим адрес адреса адресс находимся находитесь hours opening open close closing closes opens address location located where');
  add('weak', 'сколько стоит стоят how much cost costs');
  add('today', 'сегодня today сегодняшние');
  add('tomorrow', 'завтра tomorrow завтрашние');
  add('after', 'послезавтра');
  add('filler', 'пожалуйста плиз пж pls plz please бот bot а и у нас на в во по за с со к о об для что кто какие какая какой какое где скинь скиньте дай дайте покажи покажите напомни подскажи подскажите расскажи скажи текущие текущий актуальные актуальный актуальная сейчас все весь наши наш наша мне ты вы есть ли когда the a an our your what whats is are do does we you have show me list send give tell now current all hi hello привет ок ok us of for on at to my who whose when which');
  add('t:product', 'pass пасс place плейс день дня неделя недели неделю месяц месяца месяцев 10 дней day days week weeks month months monitor монитор монитора коворкинг коворкинга coworking лист list');
  add('t:office', 'месяц год года году годовой годовом годовая аренда аренды адрес адресом адреса регистрацией регистрация month year yearly annual address registration rent private приватный 2 5 этаж этаже этажа floor');
  add('t:room', 'переговорка переговорки переговорку переговорная переговорной переговорок meeting room rooms комнаты комната подкаст подкаста podcast библиотека library арт art workshop воркшоп green грин');
  add('t:pass', 'абонемент абонементы абонементов пасс пассы pass passes members участники резиденты резидентов residents клиенты клиентов membership memberships кого');
  return v;
})();
var SC_HELP_OK = ['help', 'помощь', 'команды', 'commands', 'command', 'menu', 'меню', 'умеешь', 'можешь', 'что', 'ты', 'вы', 'бот', 'bot'];
var SC_TOPICS_OK = {prices: ['t:product', 't:room'], office: ['t:office', 't:product'], bookings: ['t:room'], renewals: ['t:pass'], hours: [], help: []};

function scWords_(s) {
  return String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[’'`]/g, '')
    .replace(/(\d)[.\/-](?=\d)/g, '$1\u0001')                   // keep 12.10 / 2026-10-12 together
    .replace(/[^a-zа-я0-9\u0001]+/g, ' ').replace(/\u0001/g, '.').trim().split(' ').filter(Boolean);
}

function scClassifyWords_(s) {
  var words = scWords_(s), kws = {}, weak = 0, topics = [], day = null, ymd = null, kwHours = 0;
  for (var i = 0; i < words.length; i++) {
    var w = words[i], cats = SC_VOCAB[w];
    if (!cats) {
      var dt = /^\d/.test(w) ? scParseDateToken_(w) : null;
      if (dt) { ymd = dt; continue; }
      return null;                                            // unknown word → not confident
    }
    var kw = cats.filter(function (c) { return c.indexOf('kw:') === 0; })[0];
    if (kw) { kws[kw.slice(3)] = (kws[kw.slice(3)] || 0) + 1; continue; }
    if (cats.indexOf('weak') >= 0) { weak++; continue; }
    if (cats.indexOf('today') >= 0) { day = 'today'; continue; }
    if (cats.indexOf('tomorrow') >= 0) { day = 'tomorrow'; continue; }
    if (cats.indexOf('after') >= 0) { day = 'after'; continue; }
    if (cats.indexOf('filler') >= 0) continue;
    topics.push(cats.filter(function (c) { return c.indexOf('t:') === 0; }));
  }
  var k = Object.keys(kws), intent = null;
  if (kws.office) {
    // «цена офиса» / «сколько стоит офис» / «office price»; bare «офис» is ambiguous; «адрес» is a topic of office here
    var others = k.filter(function (x) { return x !== 'office' && x !== 'prices' && x !== 'hours'; });
    if (others.length || !(kws.prices || weak)) return null;
    if (kws.hours && !(words.some(function (w) { return /^адрес|^address$/.test(w); }))) return null;
    intent = 'office';
  } else if (!k.length) {
    if (weak >= 2) intent = 'prices';                         // «сколько стоит», «how much»
  } else if (k.length === 1) {
    intent = k[0];
  } else if (k.length === 2 && kws.bookings && kws.hours === undefined && kws.prices === undefined && kws.renewals === undefined && kws.help === undefined) {
    intent = 'bookings';
  }
  if (!intent) return null;
  // «help» alone may be a cry for help (URGENT_RE in Code.gs): only «помощь», «help», «что умеешь», «команды», «menu» …
  if (intent === 'help' && (/!/.test(s) || words.some(function (w) { return SC_HELP_OK.indexOf(w) < 0; }))) return null;
  var ok = SC_TOPICS_OK[intent] || [];
  for (var j = 0; j < topics.length; j++) if (!topics[j].some(function (c) { return ok.indexOf(c) >= 0; })) return null;
  var r = {intent: intent};
  if (intent === 'renewals' || intent === 'bookings') {
    if (ymd) r.ymd = ymd;
    else if (day === 'tomorrow') r.ymd = scAddDays_(scToday_(), 1);
    else if (day === 'after') r.ymd = scAddDays_(scToday_(), 2);
  } else if (ymd) return null;                                // a date with «цены» etc. → not clear
  return r;
}

// Thai has no spaces: strip polite particles and compare the compact string with known phrases.
var SC_TH = {
  prices: ['ราคา', 'ราคาเท่าไหร่', 'ราคาเท่าไร', 'อัตราค่าบริการ', 'ค่าบริการ', 'ราคาทั้งหมด', 'ราคาค่าบริการ', 'เท่าไหร่', 'pricesราคา', 'ราคาplacepass'],
  office: ['ราคาออฟฟิศ', 'ออฟฟิศราคา', 'ออฟฟิศราคาเท่าไหร่', 'ออฟฟิศเท่าไหร่', 'ค่าเช่าออฟฟิศ', 'ราคาห้องออฟฟิศ', 'ราคาสำนักงาน', 'ค่าเช่าสำนักงาน', 'ราคาoffice', 'officeราคา'],
  renewals: ['ใครหมดอายุ', 'หมดอายุ', 'ใครต่ออายุ', 'ต่ออายุ', 'สมาชิกหมดอายุ', 'ใครจะหมดอายุ', 'ใครต้องต่ออายุ'],
  bookings: ['จอง', 'การจอง', 'ใครจอง', 'รายการจอง', 'มีจอง', 'มีการจอง', 'มีใครจอง', 'booking', 'bookings'],
  hours: ['เวลาเปิด', 'เวลาเปิดปิด', 'เปิดกี่โมง', 'ปิดกี่โมง', 'เปิดกี่โมงปิดกี่โมง', 'เวลาทำการ', 'ที่อยู่', 'อยู่ที่ไหน', 'ที่อยู่ร้าน'],
  help: ['ช่วยเหลือ', 'วิธีใช้', 'ทำอะไรได้', 'คำสั่ง', 'เมนู', 'help']
};

function scClassifyTh_(s) {
  var t = String(s).toLowerCase().replace(/[\s?!.,]+/g, '');
  t = t.replace(/^ขอ/, '').replace(/(ครับ|คับ|ค่ะ|คะ|ค่า|นะ|จ้ะ|จ้า|หน่อย|บ้าง|ด้วย|บอท|ไหม|มั้ย)/g, '');
  var r = {};
  if (/มะรืนนี้|มะรืน/.test(t)) { r.ymd = scAddDays_(scToday_(), 2); t = t.replace(/มะรืนนี้|มะรืน/g, ''); }
  else if (/พรุ่งนี้/.test(t)) { r.ymd = scAddDays_(scToday_(), 1); t = t.replace(/พรุ่งนี้/g, ''); }
  else if (/วันนี้/.test(t)) t = t.replace(/วันนี้/g, '');
  var hits = Object.keys(SC_TH).filter(function (k) { return SC_TH[k].indexOf(t) >= 0; });
  if (hits.length !== 1) return null;
  r.intent = hits[0];
  if (r.ymd && r.intent !== 'renewals' && r.intent !== 'bookings') return null;
  return r;
}

// ---------------- dates (ICT, string-based so the script time zone doesn't matter) ----------------

function scToday_() { return Utilities.formatDate(new Date(), SC_TZ, 'yyyy-MM-dd'); }
function scPad_(n) { return (n < 10 ? '0' : '') + n; }
function scAddDays_(ymd, n) {
  var p = ymd.split('-'), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n));
  return d.getUTCFullYear() + '-' + scPad_(d.getUTCMonth() + 1) + '-' + scPad_(d.getUTCDate());
}
function scValidYmd_(y, mo, d) {
  var x = new Date(Date.UTC(y, mo - 1, d));
  return x.getUTCFullYear() === y && x.getUTCMonth() === mo - 1 && x.getUTCDate() === d ? y + '-' + scPad_(mo) + '-' + scPad_(d) : null;
}
// 2026-10-12 · 12.10 · 12/10 · 12.10.2026 · 12.10.26 → yyyy-mm-dd (no year → this year, or next year if already past)
function scParseDateToken_(w) {
  w = String(w || '');
  var a = w.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (a) return scValidYmd_(+a[1], +a[2], +a[3]);
  var b = w.match(/^(\d{1,2})[.\/](\d{1,2})(?:[.\/](\d{2}|\d{4}))?$/);
  if (!b) return null;
  var today = scToday_(), y = b[3] ? (b[3].length === 2 ? 2000 + +b[3] : +b[3]) : +today.slice(0, 4);
  var r = scValidYmd_(y, +b[2], +b[1]);
  if (r && !b[3] && r < today) r = scValidYmd_(y + 1, +b[2], +b[1]);
  return r;
}
function scDdMm_(ymd, lang) {
  var p = ymd.split('-'), wd = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay();
  var names = {ru: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], th: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']};
  return (names[lang] || names.en)[wd] + ' ' + p[2] + '.' + p[1];
}
function scMin_(hm) { var p = String(hm).split(':'); return +p[0] * 60 + +p[1]; }
function scHm_(min) { return scPad_(Math.floor(min / 60)) + ':' + scPad_(min % 60); }

// ---------------- canned texts ----------------

var SC_TXT = {
  fail: {ru: '⚠️ Не получилось, передал Ops: ', en: '⚠️ Failed, passed to Ops: ', th: '⚠️ ทำไม่สำเร็จค่ะ ส่งต่อให้ Ops แล้ว: '},
  none_ren: {ru: '✅ Продления {d}: никого (нет пассов, истекающих через 3 дня / завтра / сегодня, нет открытых −7 дней).',
    en: '✅ Renewals {d}: nothing (no passes ending in 3 days / tomorrow / today, no open −7 days).',
    th: '✅ การต่ออายุ {d}: ไม่มีค่ะ (ไม่มีพาสที่หมดใน 3 วัน / พรุ่งนี้ / วันนี้)'},
  no_rn: {ru: 'ℹ️ Renewals.gs ещё не установлен в проекте. Спросите Ops.', en: 'ℹ️ Renewals.gs is not installed in this project yet. Ask Ops.', th: 'ℹ️ ยังไม่ได้ติดตั้ง Renewals.gs ค่ะ กรุณาถาม Ops'},
  no_bk: {ru: 'ℹ️ Чтение сетки бронирований (BookingsToday) ещё не установлено. Источник: таблица «Events and booking».',
    en: 'ℹ️ The bookings reader (BookingsToday) is not installed yet. Source: «Events and booking» sheet.',
    th: 'ℹ️ ยังไม่ได้ติดตั้งตัวอ่านตารางจอง (BookingsToday) ค่ะ ดูได้ที่ชีต «Events and booking»'},
  bot_rows: {ru: '🤖 «Брони бот» (ещё не в сетке):', en: '🤖 «Брони бот» tab (not in the grid yet):', th: '🤖 แท็บ «Брони бот» (ยังไม่ได้ลงตาราง):'}
};
function scT_(lang, key) { var x = SC_TXT[key]; return x[lang] || x.en; }

function scHelp_(lang) {
  if (lang === 'ru') return [
    '🤖 @PlaceLeadBot — быстрые ответы (сразу, без Ops). Можно без слэша:',
    '• «цены» / «прайс» — все цены по канону',
    '• «цена офиса» — Office 30 000 / 20 000',
    '• «кто продлевается» / «истекают завтра» — список продлений',
    '• «брони сегодня» / «брони завтра» / «брони 12.10» — брони по комнатам',
    '• «часы» / «адрес» — часы 08:00–23:00 и адрес',
    '• «бронь переговорка 15:00-16:00 Иван +66…» — записать бронь (лист «Брони бот»)',
    '  ещё: «бронь подкаст завтра 18:00 Олег», «бронь библиотека 12.10 10:00-12:00 Анна»',
    'В группе — только с @PlaceLeadBot или ответом на сообщение бота. Слэш-команды тоже работают: /prices /office /renewals /bookings /hours /book /help',
    'Свет, кондиционеры, душ, подкаст-розетки: пишите в личку боту, напр. «свет 4 вкл», «статус» (это отдельный модуль Tuya).',
    'Всё остальное уходит Ops как обычно. Срочно: «срочно» / urgent / ด่วน.'
  ].join('\n');
  if (lang === 'th') return [
    '🤖 @PlaceLeadBot — ตอบทันทีค่ะ (ไม่ต้องใช้ /):',
    '• «ราคา» — ราคาทั้งหมด',
    '• «ราคาออฟฟิศ» — Office 30 000 / 20 000',
    '• «ใครหมดอายุ» / «หมดอายุพรุ่งนี้» — รายการต่ออายุ',
    '• «การจองวันนี้» / «การจองพรุ่งนี้» — การจองแต่ละห้อง',
    '• «เวลาเปิด» / «ที่อยู่» — เวลา 08:00–23:00 และที่อยู่',
    '• «จอง ห้องประชุม 15:00-16:00 Ivan +66…» — บันทึกการจอง (แท็บ «Брони бот»)',
    'ในกลุ่ม: ต้อง @PlaceLeadBot หรือตอบกลับข้อความของบอทค่ะ คำสั่ง /prices /office /renewals /bookings /hours /book /help ใช้ได้เหมือนเดิม',
    'ไฟ / แอร์: พิมพ์ในแชทส่วนตัวกับบอท เช่น «light 3 on», «status»',
    'ข้อความอื่นจะส่งต่อให้ Ops ตามปกติค่ะ เรื่องด่วนพิมพ์ «ด่วน»'
  ].join('\n');
  return [
    '🤖 @PlaceLeadBot — instant answers (no Ops wake). No slash needed:',
    '• «prices» — canon prices',
    '• «office price» — Office 30 000 / 20 000',
    '• «renewals» / «renewals tomorrow» — who renews',
    '• «bookings today» / «bookings tomorrow» / «bookings 12.10»',
    '• «hours» / «address»',
    '• «book meeting room 15:00-16:00 Ivan +66…» — save a booking (tab «Брони бот»)',
    'In groups: only with @PlaceLeadBot or as a reply to the bot. Slash commands still work: /prices /office /renewals /bookings /hours /book /help',
    'Lights / AC: DM the bot, e.g. «light 3 on», «status» (separate Tuya module).',
    'Anything else goes to Ops as usual. Urgent: «срочно» / urgent / ด่วน.'
  ].join('\n');
}

// Canon: PLACE-BRIEF 09.10.2026 + DECISIONS-LOG 09.10 + CANON.md. Day / 10-day prices switch automatically on 01.11.2026.
function scPrices_(now, lang) {
  var before = Utilities.formatDate(now, SC_TZ, 'yyyy-MM-dd') < '2026-11-01';
  var L = {
    ru: {day: before ? '400 ฿ (до 31.10; с 01.11 — 500 ฿)' : '500 ฿', ten: before ? '2 500 ฿ (до 31.10; с 01.11 — 3 500 ฿)' : '3 500 ฿', t: [
      '💳 ЦЕНЫ (канон 09.10.2026). Часы: каждый день 08:00–23:00 (24/7 не писать).', '',
      'PLACE PASS — этажи 1 + 3', '• час 50 ฿ · день {day}', '• неделя 1 800 ฿ · 10 дней {ten}', '• месяц 6 000 ฿ · 3 месяца 15 000 ฿', '',
      'OFFICE — этажи 5 и 2, до 6 человек', '• 30 000 ฿/мес (без адреса для компании)',
      '• 20 000 ฿/мес при договоре на 1 год — адрес регистрации компании только в годовом',
      '• свободные офисы не подтверждаем → «напишите в WhatsApp, покажем что свободно». 4 этаж не предлагать.', '',
      'ДОПОЛНИТЕЛЬНО', '• доп. монитор: 200 ฿ / 10 ч или 1 500 ฿ / мес', '• переговорки: резидентам Place Pass −20% (цена → George / WhatsApp)',
      '• подкаст: одна комната, свою цену не называем → запись в WhatsApp ' + SC_WA,
      '• промокод партнёров (не публично): бесплатный день, −10% неделя/месяц, −20% переговорки → код в «Новые гости»', '',
      'Бесплатный день — только по рекламе/листовке. Никогда: 3 бесплатных дня, день 250/300, месяц 3 000/3 500, «самый дешёвый».',
      'WhatsApp ' + SC_WA + ' · 59/2 Chao Fah Tawan Tok Rd, Chalong']},
    th: {day: before ? '400 ฿ (ถึง 31.10; ตั้งแต่ 01.11 — 500 ฿)' : '500 ฿', ten: before ? '2 500 ฿ (ถึง 31.10; ตั้งแต่ 01.11 — 3 500 ฿)' : '3 500 ฿', t: [
      '💳 ราคา (ตามแคนอน 09.10.2026) ค่ะ เวลาเปิด: ทุกวัน 08:00–23:00 (ห้ามเขียนว่า 24/7)', '',
      'PLACE PASS — ชั้น 1 + 3', '• ชั่วโมงละ 50 ฿ · วันละ {day}', '• สัปดาห์ 1 800 ฿ · 10 วัน {ten}', '• เดือน 6 000 ฿ · 3 เดือน 15 000 ฿', '',
      'OFFICE — ชั้น 5 และ 2 สูงสุด 6 คน', '• 30 000 ฿/เดือน (ไม่รวมที่อยู่จดทะเบียนบริษัท)',
      '• 20 000 ฿/เดือน สัญญา 1 ปี — ใช้ที่อยู่จดทะเบียนบริษัทได้เฉพาะสัญญารายปีเท่านั้น',
      '• ห้ามยืนยันว่าออฟฟิศว่าง → «ทักมาทาง WhatsApp เดี๋ยวเราแจ้งว่าห้องไหนว่างค่ะ» ห้ามเสนอชั้น 4', '',
      'เพิ่มเติม', '• จอเสริม: 200 ฿ / 10 ชม. หรือ 1 500 ฿ / เดือน', '• ห้องประชุม: สมาชิก Place Pass ลด 20% (ราคา → George / WhatsApp)',
      '• พอดแคสต์: ห้องเดียว ไม่แจ้งราคาเอง → จองทาง WhatsApp ' + SC_WA,
      '• โค้ดพาร์ทเนอร์ (ไม่เปิดเผยสาธารณะ): ฟรี 1 วัน, ลด 10% สัปดาห์/เดือน, ลด 20% ห้องประชุม → จดโค้ดใน «Новые гости»', '',
      'วันฟรีเฉพาะลูกค้าที่มีโฆษณา/ใบปลิวเท่านั้นค่ะ ห้ามพูด: ฟรี 3 วัน, วันละ 250/300, เดือนละ 3 000/3 500, «ถูกที่สุด»',
      'WhatsApp ' + SC_WA + ' · 59/2 Chao Fah Tawan Tok Rd, Chalong']},
    en: {day: before ? '400 ฿ (until 31.10; from 01.11 — 500 ฿)' : '500 ฿', ten: before ? '2 500 ฿ (until 31.10; from 01.11 — 3 500 ฿)' : '3 500 ฿', t: [
      '💳 PRICES (canon 09.10.2026). Hours: every day 08:00–23:00 (never write 24/7).', '',
      'PLACE PASS — floors 1 + 3', '• hour 50 ฿ · day {day}', '• week 1 800 ฿ · 10 days {ten}', '• month 6 000 ฿ · 3 months 15 000 ฿', '',
      'OFFICE — floors 5 and 2, up to 6 people', '• 30 000 ฿/month (no company address)',
      '• 20 000 ฿/month on a 1-year contract — company registration address only on the annual contract',
      '• never confirm free offices → «message us on WhatsApp, we\'ll show what\'s free». Never offer floor 4.', '',
      'EXTRAS', '• extra monitor: 200 ฿ / 10 h or 1 500 ฿ / month', '• meeting rooms: Place Pass residents −20% (price → George / WhatsApp)',
      '• podcast: one room, no price from us → booking on WhatsApp ' + SC_WA + ' (light/camera rental, no own price)',
      '• partner promo code only (not public): free day, −10% week/month, −20% meeting rooms → write the code in «Новые гости»', '',
      'NO free day unless the guest holds an ad/flyer. Never: 3 free days, day 250/300, month 3 000/3 500, «cheapest».',
      'WhatsApp ' + SC_WA + ' · 59/2 Chao Fah Tawan Tok Rd, Chalong']}
  };
  var x = L[lang] || L.en;
  return x.t.join('\n').replace('{day}', x.day).replace('{ten}', x.ten);
}

function scOffice_(lang) {
  if (lang === 'ru') return ['🏢 OFFICE — этажи 5 и 2, до 6 человек',
    '• 30 000 ฿/мес — без адреса для компании', '• 20 000 ฿/мес — договор на 1 год; адрес регистрации компании только в годовом',
    '• свободность не подтверждаем: «напишите в WhatsApp, покажем что свободно» → ' + SC_WA, '• 4 этаж не предлагать'].join('\n');
  if (lang === 'th') return ['🏢 OFFICE — ชั้น 5 และ 2 สูงสุด 6 คน ค่ะ',
    '• 30 000 ฿/เดือน — ไม่รวมที่อยู่จดทะเบียนบริษัท', '• 20 000 ฿/เดือน — สัญญา 1 ปี ใช้ที่อยู่จดทะเบียนบริษัทได้เฉพาะสัญญารายปี',
    '• ห้ามยืนยันว่าห้องว่าง: «ทักมาทาง WhatsApp เดี๋ยวเราแจ้งว่าห้องไหนว่างค่ะ» → ' + SC_WA, '• ห้ามเสนอชั้น 4'].join('\n');
  return ['🏢 OFFICE — floors 5 and 2, up to 6 people',
    '• 30 000 ฿/month — no company address', '• 20 000 ฿/month — 1-year contract; company registration address only on the annual contract',
    '• never confirm what is free: «message us on WhatsApp and we\'ll show you what\'s free» → ' + SC_WA, '• never offer floor 4'].join('\n');
}

function scHours_(lang) {
  if (lang === 'ru') return ['🕗 Часы: каждый день 08:00–23:00. «24/7», «круглосуточно», «night access» — никогда не писать.',
    'Ночью: владельцы офисов — в свой офис всегда; гость — только исключение → «напишите в WhatsApp ' + SC_WA + ', посмотрим», без обещаний.',
    '📍 Адрес: ' + SC_ADDR + ' (не Kathu, не 83000, не «592»).', 'WhatsApp ' + SC_WA + ' · info@placecoworking.com'].join('\n');
  if (lang === 'th') return ['🕗 เวลาเปิด: ทุกวัน 08:00–23:00 ค่ะ ห้ามเขียนว่า «24/7» หรือ «เปิด 24 ชม.»',
    'กลางคืน: เจ้าของออฟฟิศเข้าออฟฟิศตัวเองได้เสมอ ลูกค้าทั่วไปเป็นกรณีพิเศษเท่านั้น → «ทักมาทาง WhatsApp ' + SC_WA + ' เดี๋ยวเราดูให้ค่ะ» ไม่สัญญาล่วงหน้า',
    '📍 ที่อยู่: ' + SC_ADDR + ' (ไม่ใช่ Kathu, ไม่ใช่ 83000)', 'WhatsApp ' + SC_WA + ' · info@placecoworking.com'].join('\n');
  return ['🕗 Hours: every day 08:00–23:00. Never write «24/7», «open 24h», «night access».',
    'Nights: office owners can always access their office; a guest only as an exception → «message us on WhatsApp ' + SC_WA + ', we\'ll see», no promises.',
    '📍 Address: ' + SC_ADDR + ' (not Kathu, not 83000, not «592»).', 'WhatsApp ' + SC_WA + ' · info@placecoworking.com'].join('\n');
}

// ---------------- renewals (Renewals.gs, read-only: no outbox, RN_LAST_SENT_DATE untouched) ----------------

function scRenewals_(d) {
  if (typeof rnBuild_ !== 'function' || typeof rnTodayIct_ !== 'function') return scT_(d.lang, 'no_rn');
  var day = d.ymd || rnTodayIct_();
  var b = rnBuild_(day);
  if (!b || !b.parts || !b.parts.length) return scT_(d.lang, 'none_ren').replace('{d}', day);
  return b.parts;
}

// ---------------- bookings (BookingsToday file, read-only) + «Брони бот» rows ----------------

function scBookings_(d) {
  var ymd = d.ymd || scToday_(), out = [];
  if (typeof bookingsToday_ === 'function') out.push(bookingsToday_(new Date(ymd + 'T12:00:00+07:00')));
  else out.push(scT_(d.lang, 'no_bk') + ' (' + ymd + ')');
  try {
    var rows = scBotRows_(null).filter(function (r) { return r.date === ymd && !scCancelled_(r.status); });
    if (rows.length) {
      rows.sort(function (a, b) { return a.start < b.start ? -1 : 1; });
      out.push(scT_(d.lang, 'bot_rows') + '\n' + rows.map(function (r) {
        return r.start + '–' + r.end + ' ' + r.room + ' — ' + r.name + ' (' + (r.status || 'new') + ')';
      }).join('\n'));
    }
  } catch (e) { Logger.log('STAFF_BOTROWS_ERR ' + e); }
  return out.join('\n');
}

function scCancelled_(st) { return /cancel|отмен|ยกเลิก|reject|отказ|delete|удал/i.test(String(st || '')); }

function scBookSheet_(create) {
  var ss = SpreadsheetApp.openById(SC_EVENTS_ID), sh = ss.getSheetByName(SC_BOOK_TAB);
  if (!sh && create) {
    sh = ss.insertSheet(SC_BOOK_TAB, ss.getNumSheets());      // new tab at the end; existing grids untouched
    sh.getRange(1, 1, 1, SC_BOOK_HDR.length).setValues([SC_BOOK_HDR]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function scBotRows_(sh) {
  sh = sh || scBookSheet_(false);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, SC_BOOK_HDR.length).getDisplayValues().map(function (r) {
    return {date: scNormYmd_(r[1]), start: scNormHm_(r[2]), end: scNormHm_(r[3]), room: String(r[4]).trim(), name: String(r[5]).trim(), status: String(r[8]).trim()};
  }).filter(function (r) { return r.date && r.start && r.end; });
}
function scNormYmd_(v) {
  v = String(v || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  var b = v.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/);
  return b ? scValidYmd_(+b[3], +b[2], +b[1]) : '';
}
function scNormHm_(v) { var t = String(v || '').trim().match(/^(\d{1,2})[:.](\d{2})/); return t ? scPad_(+t[1]) + ':' + t[2] : ''; }

// ---------------- booking requests ----------------

var SC_B = '(^|[\\s,;:(])', SC_E = '(?=$|[\\s,;:.!?)])';

function scFindRoom_(s) {
  var hits = [];
  SC_ROOMS.forEach(function (r) {
    var mm = String(s).match(new RegExp(SC_B + '(' + r.re + ')' + SC_E, 'i'));
    if (mm) hits.push({room: r, index: mm.index + mm[1].length, len: mm[2].length});
  });
  return hits;
}

var SC_TRANGE_RE = /(^|[^\d.:\/])([01]?\d|2[0-3])[:.]([0-5]\d)\s*(?:-|–|—|до|to|till|until|ถึง)\s*([01]?\d|2[0-4])[:.]([0-5]\d)(?!\d)/i;
var SC_TONE_RE = /(^|[^\d.:\/])(?:(?:в|at|с|from|เวลา)\s*)?(?:([01]?\d|2[0-3]):([0-5]\d)|([01]?\d|2[0-3])\.(00|1[3-9]|[2-5]\d))(?![\d.:\/])/i;

function scFindTime_(s) {
  var r = String(s).match(SC_TRANGE_RE);
  if (r) return {start: +r[2] * 60 + +r[3], end: +r[4] * 60 + +r[5], index: r.index + r[1].length, len: r[0].length - r[1].length};
  var o = String(s).match(SC_TONE_RE);
  if (o) { var h = o[2] !== undefined ? +o[2] : +o[4], mi = o[2] !== undefined ? +o[3] : +o[5]; return {start: h * 60 + mi, end: null, index: o.index + o[1].length, len: o[0].length - o[1].length}; }
  return null;
}

function scCut_(s, i, n) { return s.slice(0, i) + ' ' + s.slice(i + n); }

// Pure parser. Returns {ok:true, room, tab, ymd, start, end, endDefault, name} or {ok:false, err}.
function scParseBooking_(raw) {
  var s = ' ' + String(raw || '').replace(/@placeleadbot\b/ig, ' ') + ' ';
  var rooms = scFindRoom_(s);
  if (rooms.length !== 1) return {ok: false, err: rooms.length ? 'rooms' : 'room'};
  var room = rooms[0].room;
  s = scCut_(s, rooms[0].index, rooms[0].len);
  var t = scFindTime_(s);
  if (!t) return {ok: false, err: 'time'};
  s = scCut_(s, t.index, t.len);
  var endDefault = t.end === null, end = endDefault ? t.start + 60 : t.end;
  if (end > 24 * 60) end = 24 * 60;
  if (end <= t.start) return {ok: false, err: 'order'};
  var today = scToday_(), ymd = null, mm;
  if ((mm = s.match(/(^|[\s,;(])(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[.\/]\d{1,2}(?:[.\/]\d{2,4})?)(?=$|[\s,;!?)])/))) {
    ymd = scParseDateToken_(mm[2]);
    if (!ymd) return {ok: false, err: 'date'};
    s = scCut_(s, mm.index + mm[1].length, mm[2].length);
  } else if ((mm = s.match(/(^|[\s,;(])(послезавтра|day after tomorrow)(?=$|[\s,;.!?)])|มะรืนนี้|มะรืน/i))) {
    ymd = scAddDays_(today, 2); s = s.replace(mm[0], ' ');
  } else if ((mm = s.match(/(^|[\s,;(])(завтра|tomorrow)(?=$|[\s,;.!?)])|พรุ่งนี้/i))) {
    ymd = scAddDays_(today, 1); s = s.replace(mm[0], ' ');
  } else if ((mm = s.match(/(^|[\s,;(])(сегодня|today)(?=$|[\s,;.!?)])|วันนี้/i))) {
    ymd = today; s = s.replace(mm[0], ' ');
  }
  ymd = ymd || today;
  if (ymd < today) return {ok: false, err: 'past'};
  var filler = /^(?:на|в|во|с|со|до|для|по|for|at|on|from|to|by|name|имя|контакт|contact|ชื่อ|คุณ|-|–|—|,|:)$/i;
  var words = s.replace(/[,;]+/g, ' ').split(/\s+/).filter(Boolean);
  while (words.length && filler.test(words[0])) words.shift();
  while (words.length && filler.test(words[words.length - 1])) words.pop();
  var name = words.join(' ').slice(0, 100);
  if (!/[a-zа-яё\u0E00-\u0E7F]/i.test(name) && (name.match(/\d/g) || []).length < 6) return {ok: false, err: 'name'};
  return {ok: true, room: room.name, tab: room.tab, ymd: ymd, start: scHm_(t.start), end: scHm_(end), endDefault: endDefault, name: name};
}

var SC_BOOK_ERR = {
  room: {ru: 'не нашёл комнату', en: 'no room found', th: 'ไม่พบชื่อห้อง'},
  rooms: {ru: 'больше одной комнаты', en: 'more than one room', th: 'มีมากกว่าหนึ่งห้อง'},
  time: {ru: 'нет времени (чч:мм)', en: 'no time (hh:mm)', th: 'ไม่มีเวลา (ชช:นน)'},
  order: {ru: 'конец раньше начала', en: 'end is before start', th: 'เวลาจบก่อนเวลาเริ่ม'},
  date: {ru: 'непонятная дата', en: 'unclear date', th: 'วันที่ไม่ถูกต้อง'},
  past: {ru: 'дата в прошлом', en: 'date is in the past', th: 'วันที่ผ่านไปแล้ว'},
  name: {ru: 'нет имени или контакта', en: 'no name or contact', th: 'ไม่มีชื่อหรือเบอร์ติดต่อ'}
};

function scBookUsage_(lang, err) {
  var why = err ? (SC_BOOK_ERR[err] || {})[lang] || (SC_BOOK_ERR[err] || {}).en || err : '';
  if (lang === 'ru') return '❓ Не понял бронь' + (why ? ' (' + why + ')' : '') + '. Формат:\nбронь <комната> [сегодня|завтра|дд.мм] <чч:мм>[-<чч:мм>] <имя/контакт>\n' +
    'Примеры:\n• бронь переговорка 15:00-16:00 Иван +66 81 234 5678\n• бронь подкаст завтра 18:00 Олег\n' +
    'Комнаты: переговорка, подкаст, библиотека, арт, воркшоп, green (Office room-4), 1/4/6 этаж. Без конца — 1 час.\nСписок броней: «брони сегодня» / «брони завтра».';
  if (lang === 'th') return '❓ ไม่เข้าใจการจองค่ะ' + (why ? ' (' + why + ')' : '') + ' รูปแบบ:\nจอง <ห้อง> [วันนี้|พรุ่งนี้|วว.ดด] <ชช:นน>[-<ชช:นน>] <ชื่อ/เบอร์>\n' +
    'ตัวอย่าง:\n• จอง ห้องประชุม 15:00-16:00 Ivan +66 81 234 5678\n• จอง podcast พรุ่งนี้ 18:00 Oleg\n' +
    'ห้อง: ห้องประชุม (meeting room), podcast, library, art room, workshop, green, ชั้น 1/4/6 ถ้าไม่ระบุเวลาจบ = 1 ชั่วโมงค่ะ';
  return '❓ Could not read the booking' + (why ? ' (' + why + ')' : '') + '. Format:\nbook <room> [today|tomorrow|dd.mm] <hh:mm>[-<hh:mm>] <name/contact>\n' +
    'Examples:\n• book meeting room 15:00-16:00 Ivan +66 81 234 5678\n• book podcast tomorrow 18:00 Oleg\n' +
    'Rooms: meeting room, podcast, library, art room, workshop, green (Office room-4), floor 1/4/6. No end time = 1 hour.';
}

function scBook_(d, m) {
  var lang = d.lang, b = scParseBooking_(d.raw);
  if (!b.ok) { d.status = 'usage ' + b.err; return scBookUsage_(lang, b.err); }
  var s = scMin_(b.start), e = scMin_(b.end), clash = [], notes = [];
  var sh = scBookSheet_(true);
  scBotRows_(sh).forEach(function (r) {
    if (r.date === b.ymd && r.room === b.room && !scCancelled_(r.status) && scMin_(r.start) < e && s < scMin_(r.end)) {
      clash.push('«' + SC_BOOK_TAB + '»: ' + r.start + '–' + r.end + ' ' + r.name);
    }
  });
  if (b.tab) {
    var g = scGridBusy_(b.tab, b.ymd);
    if (!g.checked) notes.push(g.note);
    g.items.forEach(function (it) { if (it.s < e && s < it.e) clash.push('«' + b.tab.trim() + '» ' + scHm_(it.s) + '–' + scHm_(Math.min(it.e, 1440)) + ': ' + it.text); });
  }
  var when = b.room + ' · ' + scDdMm_(b.ymd, lang) + ' · ' + b.start + '–' + b.end;
  if (clash.length) {
    d.status = 'conflict';
    var head = {ru: '⛔ Не записал — пересечение: ', en: '⛔ Not saved — overlaps: ', th: '⛔ ยังไม่ได้บันทึกค่ะ — เวลาชนกัน: '}[lang] || '⛔ ';
    var tail = {ru: 'Выберите другое время или уточните у админа.', en: 'Pick another time or check with the admin.', th: 'กรุณาเลือกเวลาอื่น หรือสอบถามแอดมินค่ะ'}[lang] || '';
    return head + when + '\n• ' + clash.slice(0, 5).join('\n• ') + '\n' + tail;
  }
  var f = m.from || {};
  var by = [f.first_name, f.last_name].filter(Boolean).join(' ') + (f.username ? ' @' + f.username : '') + (f.id ? ' (' + f.id + ')' : '');
  var row = [Utilities.formatDate(new Date(), SC_TZ, 'yyyy-MM-dd HH:mm:ss'), b.ymd, b.start, b.end, b.room, b.name, by.trim(), String(m.text || '').slice(0, 300), 'new'];
  var at = sh.getLastRow() + 1, rg = sh.getRange(at, 1, 1, row.length);
  rg.setNumberFormat('@');                                    // plain text: no date/phone/formula auto-conversion
  rg.setValues([row]);
  d.status = 'booked row ' + at;
  var ok = {ru: '✅ Бронь записана (статус new): ', en: '✅ Booking saved (status new): ', th: '✅ บันทึกการจองแล้วค่ะ (สถานะ new): '}[lang];
  var more = {ru: 'Лист «' + SC_BOOK_TAB + '» в «Events and booking»; в основную сетку переносит админ.',
    en: 'Tab «' + SC_BOOK_TAB + '» in «Events and booking»; the admin copies it into the main grid.',
    th: 'แท็บ «' + SC_BOOK_TAB + '» ในชีต «Events and booking» แอดมินจะลงตารางหลักให้ค่ะ'}[lang];
  if (b.endDefault) notes.unshift({ru: 'конец не указан → 1 час', en: 'no end time → 1 hour', th: 'ไม่ระบุเวลาจบ → 1 ชั่วโมง'}[lang]);
  return ok + when + ' · ' + b.name + '\n' + more + (notes.length ? '\nℹ️ ' + notes.join('; ') : '');
}

// Busy intervals in a grid tab for one day (read-only). Needs bkDateCols_ from the BookingsToday file.
function scGridBusy_(tab, ymd) {
  var out = {checked: false, note: '', items: []};
  if (typeof bkDateCols_ !== 'function') { out.note = 'grid «' + tab.trim() + '» not checked (BookingsToday not installed)'; return out; }
  try {
    var sh = SpreadsheetApp.openById(SC_EVENTS_ID).getSheetByName(tab);
    if (!sh) { out.note = 'no tab «' + tab.trim() + '»'; return out; }
    var hr = SC_GRID_HEADER_ROW, lastC = sh.getLastColumn(), lastR = sh.getLastRow();
    if (lastR <= hr) { out.note = 'grid «' + tab.trim() + '» empty'; return out; }
    var head = sh.getRange(hr, 1, 1, lastC).getDisplayValues()[0];
    var p = ymd.split('-'), key = +p[0] + '-' + +p[1] + '-' + +p[2];
    var cols = bkDateCols_(head, +scToday_().slice(0, 4)), col = cols.map[key];
    if (col === undefined) { out.note = 'grid «' + tab.trim() + '» has no column for ' + ymd; return out; }
    var labels = sh.getRange(hr + 1, 1, lastR - hr, 1).getDisplayValues(), cells = sh.getRange(hr + 1, col + 1, lastR - hr, 1).getDisplayValues();
    var slots = labels.map(function (x) { var t = String(x[0]).match(/^(\d{1,2})[:.](\d{2})/); return t ? +t[1] * 60 + +t[2] : null; });
    for (var i = 0; i < cells.length; i++) {
      var v = String(cells[i][0] || '').trim();
      if (!v) continue;
      var r = v.match(/([01]?\d|2[0-3])[:.]([0-5]\d)\s*[-–—]\s*([01]?\d|2[0-4])[:.]([0-5]\d)/), s0, e0;
      if (r) { s0 = +r[1] * 60 + +r[2]; e0 = +r[3] * 60 + +r[4]; }
      else if (slots[i] !== null) {
        s0 = slots[i]; e0 = s0 + 60;
        for (var j = i + 1; j < slots.length; j++) if (slots[j] !== null) { if (slots[j] > s0) e0 = slots[j]; break; }
      } else continue;
      if (e0 <= s0) e0 = s0 + 60;
      out.items.push({s: s0, e: e0, text: v.replace(/\s+/g, ' ').slice(0, 60)});
    }
    out.checked = true;
  } catch (e) { out.note = 'grid «' + tab.trim() + '» not checked: ' + String((e && e.message) || e).slice(0, 80); }
  return out;
}

// ---------------- Telegram + log ----------------

function scSend_(tok, chatId, text, replyTo) {
  var t = String(text || '-');
  for (var i = 0; i < t.length; i += SC_MAX_TG) {
    var p = {chat_id: chatId, text: t.slice(i, i + SC_MAX_TG), disable_web_page_preview: true};
    if (replyTo && i === 0) { p.reply_to_message_id = replyTo; p.allow_sending_without_reply = true; }
    try {
      UrlFetchApp.fetch('https://api.telegram.org/bot' + tok + '/sendMessage', {method: 'post', contentType: 'application/json', payload: JSON.stringify(p), muteHttpExceptions: true});
    } catch (e) { Logger.log('STAFF_SEND_ERR ' + e); }
  }
}

// One row per handled message: ts | chat | chat_id | from | command (what staff wrote) | result + reply excerpt | intent | mode
function scLog_(m, d, status, reply) {
  try {
    var ss = SpreadsheetApp.openById(SC_INBOX_ID), sh = ss.getSheetByName(SC_LOG_TAB);
    if (!sh) { sh = ss.insertSheet(SC_LOG_TAB, ss.getNumSheets()); sh.getRange(1, 1, 1, SC_LOG_HDR.length).setValues([SC_LOG_HDR]); sh.setFrozenRows(1); }
    else if (!String(sh.getRange(1, 7, 1, 1).getDisplayValues()[0][0] || '').trim()) sh.getRange(1, 7, 1, 2).setValues([SC_LOG_HDR.slice(6)]);
    var f = m.from || {};
    var row = [Utilities.formatDate(new Date(), SC_TZ, 'yyyy-MM-dd HH:mm:ss'), m.chat.title || (m.chat.type === 'private' ? 'личка боту' : ''),
      String(m.chat.id), [f.first_name, f.last_name].filter(Boolean).join(' ') + (f.username ? ' @' + f.username : ''),
      String(d.cmd || m.text || '').slice(0, 200), (status + ' | ' + String(reply || '').replace(/\s+/g, ' ')).slice(0, 500), d.intent, d.mode + '/' + d.lang];
    var rg = sh.getRange(sh.getLastRow() + 1, 1, 1, row.length);
    rg.setNumberFormat('@');
    rg.setValues([row]);
  } catch (e) { Logger.log('STAFF_LOG_ERR ' + e); }
}

// ---------------- editor dry run (sends nothing, writes nothing) ----------------

// [text, expected intent or false, options]. Options: chat 'group', mention, replyToBot, from 'stranger', isEdit.
var SC_DRY_SAMPLES = [
  ['/help', 'help'], ['/prices', 'prices'], ['/prices@PlaceLeadBot', 'prices'], ['/renewals 2026-10-11', 'renewals'], ['/bookings tomorrow', 'bookings'],
  ['/office', 'office'], ['/hours', 'hours'], ['/book переговорка 15:00 Иван', 'book'],
  ['цены', 'prices'], ['Цены?', 'prices'], ['прайс', 'prices'], ['какие цены', 'prices'], ['сколько стоит', 'prices'], ['price', 'prices'], ['prices please', 'prices'],
  ['ราคา', 'prices'], ['ราคาเท่าไหร่คะ', 'prices'], ['цена месяц', 'prices'],
  ['цена офиса', 'office'], ['сколько стоит офис', 'office'], ['office price', 'office'], ['ราคาออฟฟิศ', 'office'], ['офис с адресом цена', 'office'],
  ['кто продлевается', 'renewals'], ['кто продлевается завтра', 'renewals'], ['истекают', 'renewals'], ['renewals', 'renewals'], ['ใครหมดอายุ', 'renewals'], ['หมดอายุพรุ่งนี้', 'renewals'],
  ['брони сегодня', 'bookings'], ['брони завтра', 'bookings'], ['брони 12.10', 'bookings'], ['bookings', 'bookings'], ['bookings tomorrow', 'bookings'], ['การจองวันนี้', 'bookings'], ['จองพรุ่งนี้', 'bookings'],
  ['часы работы', 'hours'], ['адрес', 'hours'], ['во сколько открываемся', 'hours'], ['opening hours', 'hours'], ['address', 'hours'], ['เปิดกี่โมง', 'hours'], ['ที่อยู่', 'hours'],
  ['помощь', 'help'], ['что умеешь?', 'help'], ['help', 'help'], ['ช่วยเหลือ', 'help'],
  ['бронь переговорка 15:00-16:00 Иван +66812345678', 'book'], ['бронь подкаст завтра 18:00 Олег', 'book'], ['book meeting room 15:00 Ivan', 'book'],
  ['จอง ห้องประชุม 15:00-16:00 Ivan', 'book'], ['бронь библиотека 12.10 10:00-12:00 Анна', 'book'], ['бронь переговорка', 'book'],
  ['@PlaceLeadBot цены', 'prices', {chat: 'group', mention: true}], ['брони завтра', 'bookings', {chat: 'group', replyToBot: true}],
  // must be false (normal flow: Tuya / queue / email / Ops)
  ['цены', false, {chat: 'group'}], ['бронь переговорка 15:00 Иван', false, {chat: 'group'}], ['цены', false, {from: 'stranger'}],
  ['свет 4 вкл', false], ['весь свет выкл', false], ['кондиционер 2 выкл', false], ['лампа 3 красный', false], ['/light', false], ['/ac status', false],
  ['light 3 on', false], ['ac all off', false], ['ไฟ ปิด', false], ['ปิดแอร์', false], ['статус', false], ['помощь свет', false], ['цены на свет', false],
  ['душ выкл', false], ['подкаст 1 вкл', false], ['/start', false], ['/foo', false], ['/prices@otherbot', false],
  ['Привет, как дела?', false], ['цены поменялись с ноября?', false], ['офис', false], ['Светлана придёт в 15', false],
  ['Можно забронировать переговорку на завтра?', false], ['кто сегодня закрывает', false], ['wifi password', false], ['пароль от вайфая', false],
  ['цены и брони', false], ['help me please', false], ['help!', false], ['Цены на кофе какие сейчас у нас в кафе на первом этаже?', false],
  ['New order for Anna Latte 4th floor', false], ['кондей 1 24', false], ['all off', false]
];

function scDryMsg_(text, o) {
  o = o || {};
  var from = o.from === 'stranger' ? {id: 1, username: 'stranger', first_name: 'Stranger'} : {id: 8503184147, first_name: 'George'};
  var chat = o.chat === 'group' ? {id: -1001, type: 'supergroup', title: 'PLACE Team'} : {id: 8503184147, type: 'private'};
  var m = {message_id: 1, date: 0, from: from, chat: chat, text: text};
  if (o.replyToBot) m.reply_to_message = {message_id: 0, from: {id: 2, is_bot: true, username: 'PlaceLeadBot'}};
  return m;
}

function staffDryRun() {
  var fail = 0;
  SC_DRY_SAMPLES.forEach(function (c) {
    var d = scDecide_(scDryMsg_(c[0], c[2])), got = d ? d.intent : false, ok = got === c[1];
    if (!ok) fail++;
    var extra = d && d.intent === 'book' ? ' ' + JSON.stringify(scParseBooking_(d.raw)) : '';
    Logger.log((ok ? 'PASS ' : 'FAIL ') + JSON.stringify(c[0]) + ' → ' + got + (ok ? '' : ' (want ' + c[1] + ')') + extra);
  });
  Logger.log(scHelp_('ru'));
  Logger.log(scPrices_(new Date(), 'ru').slice(0, 300));
  Logger.log('STAFF_DRYRUN ' + (SC_DRY_SAMPLES.length - fail) + '/' + SC_DRY_SAMPLES.length + ' ok, failures=' + fail);
  return fail;
}

if (typeof module !== 'undefined') module.exports = {handleStaffCommand_: handleStaffCommand_, scDecide_: scDecide_, scClassify_: scClassify_,
  scParseBooking_: scParseBooking_, scHasDeviceWords_: scHasDeviceWords_, scPrices_: scPrices_, scIsStaff_: scIsStaff_, scGridBusy_: scGridBusy_,
  scBookings_: scBookings_, scHelp_: scHelp_, staffDryRun: staffDryRun, SC_DRY_SAMPLES: SC_DRY_SAMPLES, scDryMsg_: scDryMsg_};
