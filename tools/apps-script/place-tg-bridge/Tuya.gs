// ===== Place TG Bridge: Tuya smart devices (floor 4 + podcast) via @PlaceLeadBot =====
// Add this file to the «Place TG Bridge» Apps Script project, next to Code.gs, plus ONE line in poll():
//     if (tuyaHookSafe_(u, m, tok)) continue;      // right after `if (!text) continue;`
// Script Properties: TUYA_ACCESS_ID, TUYA_ACCESS_SECRET, TUYA_ENDPOINT (same values as ~/.config/place/tuya.env on the box).
// Only NEW private text messages from TUYA_ALLOWED user ids that parse as a device command are handled here
// (reply + log to tab «Tuya»). Everything else returns false and goes through poll() exactly as before.
// If anything in here throws, tuyaHookSafe_ returns false and the message also flows as before.

var TUYA_ALLOWED = {'<TG_USER_ID>': 'George', '<TG_USER_ID>': 'Lena', '<TG_USER_ID>': 'Sasha', '<TG_USER_ID>': 'Nikita'};
var TUYA_WAIT_MS = 2000;
var TUYA_LOG_TAB = 'Tuya';
var TUYA_DEVICES = [
  {key: 'lc1', group: 'light', n: 1, name: 'fl4_Lc1', id: '<TUYA_DEVICE_ID>', code: 'switch_led'},
  {key: 'lc2', group: 'light', n: 2, name: 'Fl4_Lc2', id: '<TUYA_DEVICE_ID>', code: 'switch_led'},
  {key: 'lc3', group: 'light', n: 3, name: 'fl4_Lc3', id: '<TUYA_DEVICE_ID>', code: 'switch_led'},
  {key: 'lc4', group: 'light', n: 4, name: 'fl4_lc4', id: '<TUYA_DEVICE_ID>', code: 'switch_led'},
  {key: 'lc5', group: 'light', n: 5, name: 'fl4_lc5', id: '<TUYA_DEVICE_ID>', code: 'switch_led'},
  {key: 'lc6', group: 'light', n: 6, name: 'fl4_lc6', id: '<TUYA_DEVICE_ID>', code: 'switch_led'},
  {key: 'air1', group: 'ac', n: 1, name: 'Fl4_air1', id: '<TUYA_DEVICE_ID>', code: 'switch_1', power: 'cur_power'},
  {key: 'air2', group: 'ac', n: 2, name: 'Fl4_air2', id: '<TUYA_DEVICE_ID>', code: 'switch_1', power: 'cur_power'},
  {key: 'air3', group: 'ac', n: 3, name: 'Fl4_air3', id: '<TUYA_DEVICE_ID>', code: 'switch_1', power: 'cur_power'},
  {key: 'air4', group: 'ac', n: 4, name: 'Fl4_air4', id: '<TUYA_DEVICE_ID>', code: 'switch_1', power: 'cur_power'},
  {key: 'shower', group: 'shower', n: 1, name: 'Fl4_shower', id: '<TUYA_DEVICE_ID>', code: 'switch_1'},
  {key: 'podcast1', group: 'podcast', n: 1, name: 'Podcast1', id: '<TUYA_DEVICE_ID>', code: 'switch_1'},
  {key: 'podcast2', group: 'podcast', n: 2, name: 'Podcast2', id: '<TUYA_DEVICE_ID>', code: 'switch_1'}
];
var TUYA_GROUP_ORDER = ['light', 'ac', 'shower', 'podcast'];
var TUYA_GROUP_LABEL = {light: '💡 Свет', ac: '❄️ Кондиционеры', shower: '🚿 Душ', podcast: '🎙 Подкаст'};
var TUYA_ONE_LABEL = {light: 'Свет', ac: 'Кондиционер', shower: 'Душ', podcast: 'Подкаст'};
var TUYA_FLOOR4 = ['light', 'ac', 'shower'];   // «всё» = весь 4 этаж; подкаст не трогаем
// Colours for lamps Lc1–Lc6 (colour_data_v2: h 0–360, s/v 0–1000). Word forms are matched after ё->е.
var TUYA_COLOURS = (function () {
  var c = {}, add = function (h, name, list) { list.split(' ').forEach(function (x) { c[x] = {h: h, name: name}; }); };
  add(0, 'красный', 'красный красная красное красным красной красного red');
  add(30, 'оранжевый', 'оранжевый оранжевая оранжевое оранжевым оранжевой оранжевого orange');
  add(60, 'жёлтый', 'желтый желтая желтое желтым желтой желтого yellow');
  add(120, 'зелёный', 'зеленый зеленая зеленое зеленым зеленой зеленого green');
  add(180, 'голубой', 'голубой голубая голубое голубым голубого cyan');
  add(240, 'синий', 'синий синяя синее синим синей синего blue');
  add(280, 'фиолетовый', 'фиолетовый фиолетовая фиолетовое фиолетовым фиолетовой фиолетового purple violet');
  add(320, 'розовый', 'розовый розовая розовое розовым розовой розового pink');
  return c;
})();
function tuyaColourName_(h) {   // nearest named colour (lamps set from the app can have any hue)
  var best = null, bd = 999;
  Object.keys(TUYA_COLOURS).forEach(function (k) {
    var x = Math.abs(((Number(h) - TUYA_COLOURS[k].h) % 360 + 360) % 360), dd = Math.min(x, 360 - x);
    if (dd < bd) { bd = dd; best = TUYA_COLOURS[k].name; }
  });
  return best || ('h' + h);
}
function tuyaPctToBright_(p) { return Math.max(10, Math.min(1000, Math.round(p * 10))); }   // 1–100 % -> bright_value_v2 10–1000
function tuyaBrightToPct_(b) { return Math.max(1, Math.round(Number(b) / 10)); }

var TUYA_WORDS = (function () {
  var w = {}, add = function (role, list) { list.split(' ').forEach(function (x) { w[x] = role; }); };
  add('light', 'свет света свету light lights');
  add('lamp', 'лампа лампу лампы ламп лампочка лампочку лампочки лампочек lamp lamps lc');
  add('ac', 'кондиционер кондиционеры кондиционера кондиционеров кондей кондеи кондея кондеев кондер кондеры кондера конд кондиц ac acs air aircon aircons');
  add('shower', 'душ душа shower');
  add('podcast', 'подкаст подкаста подкасты подкастов podcast podcasts');
  add('all', 'все всех весь вся all everything');
  add('on', 'вкл включи включить включите включай вруби врубить on');
  add('off', 'выкл выключи выключить выключите выключай выруби вырубить отключи отключить off');
  add('status', 'статус status состояние state');
  add('help', 'помощь help команды commands справка');
  add('white', 'белый белая белое белым белой белого white');
  add('bright', 'яркость яркости яркостью brightness bright');
  add('pct', '% процент процента процентов percent');
  add('temp', 'температура темп temp temperature');
  add('floor', 'этаж этаже этажа эт floor fl th');
  add('skip', 'пожалуйста плиз pls please the turn switch на в и and градусов градуса градус c');
  return w;
})();

function tuyaHookSafe_(u, m, tok) {
  try { return tuyaHook_(u, m, tok); } catch (e) { Logger.log('TUYA_ERR ' + e); return false; }
}

function tuyaHook_(u, m, tok) {
  if (!u || !u.message || u.message !== m || !m.text) return false;   // only new text messages, not edits/channel posts
  if (!m.chat || m.chat.type !== 'private') return false;
  var uid = String((m.from || {}).id || '');
  if (!TUYA_ALLOWED.hasOwnProperty(uid)) return false;                 // not a controller: flows as before, nothing executed
  var cmd = tuyaParse_(m.text);
  if (!cmd) return false;                                              // not a device command: flows as before
  var reply;
  try { reply = tuyaRun_(cmd); } catch (e) { reply = '❌ Ошибка Tuya: ' + ((e && e.message) || e); }
  var sent = tuyaSend_(tok, m.chat.id, reply);
  try {
    tuyaLog_([Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss'), uid, TUYA_ALLOWED[uid],
      m.text, tuyaDescribe_(cmd), reply.replace(/\n/g, ' | ') + (sent ? '' : ' [TG send failed]')]);
  } catch (e) { Logger.log('TUYA_LOG_ERR ' + e); }
  return true;
}

// ---------- parser: text -> command object, or null when it is not a device command ----------
function tuyaTokens_(text) {
  var t = String(text || '').toLowerCase().replace(/ё/g, 'е').replace(/@placeleadbot/g, ' ').replace(/^\s*\//, '');
  t = t.replace(/[.,!?;:()«»"'°+\u2014\u2013\-]/g, ' ');
  var raw = t.split(/\s+/).filter(Boolean), out = [];
  for (var i = 0; i < raw.length; i++) {
    var w = raw[i], d;
    if ((d = w.match(/^(?:fl4_?)?lc_?([1-6])$/))) { out.push({r: 'dev', v: 'lc' + d[1]}); continue; }
    if ((d = w.match(/^(?:fl4_?)?air_?([1-4])$/))) { out.push({r: 'dev', v: 'air' + d[1]}); continue; }
    if (/^(?:fl4_?)?shower$/.test(w)) { out.push({r: 'dev', v: 'shower'}); continue; }
    if ((d = w.match(/^podcast_?([12])$/))) { out.push({r: 'dev', v: 'podcast' + d[1]}); continue; }
    var parts = w.match(/\d+|[^\d]+/g) || [];
    for (var j = 0; j < parts.length; j++) {
      var p = parts[j];
      if (/^\d+$/.test(p)) { out.push({r: 'num', v: Number(p)}); continue; }
      if (TUYA_COLOURS.hasOwnProperty(p)) { out.push({r: 'colour', v: TUYA_COLOURS[p].h}); continue; }
      if (!TUYA_WORDS.hasOwnProperty(p)) return null;                 // any unknown word -> not a command
      out.push({r: TUYA_WORDS[p], v: p});
    }
  }
  return out;
}

function tuyaParse_(text) {
  var toks = tuyaTokens_(text);
  if (!toks || !toks.length) return null;
  var f = {}, targets = [], cur = null, pendingAll = false, floor = null;
  for (var i = 0; i < toks.length; i++) {
    var k = toks[i], nx = toks[i + 1], pv = toks[i - 1];
    if (k.r === 'light' || k.r === 'lamp' || k.r === 'ac' || k.r === 'shower' || k.r === 'podcast') {
      cur = {grp: k.r === 'lamp' ? 'light' : k.r, strict: k.r !== 'light', nums: [], all: pendingAll};
      pendingAll = false; targets.push(cur);
    } else if (k.r === 'dev') { targets.push({dev: k.v}); cur = null;
    } else if (k.r === 'all') { if (cur && !cur.nums.length) cur.all = true; else pendingAll = true;
    } else if (k.r === 'num') {
      if (nx && nx.r === 'floor') { floor = k.v; i++; }
      else if (pv && pv.r === 'floor') floor = k.v;
      else if (nx && nx.r === 'pct') {                                                           // «50%» = brightness
        if (f.pct !== undefined || (cur && cur.strict && !cur.nums.length && !cur.all)) return null;   // «лампа 2 %» / «лампа 50%»: unclear
        f.pct = k.v; i++; }
      else if (f.bright && f.pct === undefined) f.pct = k.v;                                       // «яркость 50»
      else if (cur) cur.nums.push(k.v);
      else if (f.temp && f.on === undefined) { f.tempVal = k.v; }
      else return null;                                                 // bare number without a device word
    } else if (k.r === 'colour') { if (f.colour !== undefined && f.colour !== k.v) return null; f.colour = k.v;
    } else if (k.r === 'on' || k.r === 'off' || k.r === 'status' || k.r === 'help' || k.r === 'temp' || k.r === 'white' || k.r === 'bright') { f[k.r] = true;
    } else if (k.r === 'pct') { return null;                            // stray «%» without a number
    } // floor / skip words: ignored
  }
  if ((f.on && f.off) || (f.status && (f.on || f.off))) return null;
  var look = f.colour !== undefined || f.white || f.bright || f.pct !== undefined;
  if (look && (f.off || f.status || f.temp || f.help || (f.white && f.colour !== undefined))) return null;
  if (floor !== null && floor !== 4) return {action: 'error', text: 'Управляю только 4 этажом (и подкастом). Напишите «помощь».'};
  if (f.help) return (targets.length || f.on || f.off || f.status || pendingAll) ? null : {action: 'help'};
  if (pendingAll && !targets.length) targets.push(look ? {grp: 'light', nums: [], all: true} : {floor4: true});   // «всё красное» = все лампы
  if (!targets.length) return f.status && !f.on && !f.off && !look ? {action: 'status', keys: tuyaAllKeys_()} : null;

  var keys = [], temp = f.tempVal, errs = [];
  targets.forEach(function (t) {
    if (t.floor4) { TUYA_FLOOR4.forEach(function (g) { keys = keys.concat(tuyaGroupKeys_(g)); }); return; }
    if (t.dev) { keys.push(t.dev); return; }
    var nums = t.nums.slice();
    if (t.grp === 'ac') {
      var tn = nums.filter(function (n) { return n >= 16 && n <= 32; });
      if (tn.length) { temp = tn[tn.length - 1]; nums = nums.filter(function (n) { return n < 16 || n > 32; }); }
    }
    if (t.grp === 'light' && !t.strict && nums.length === 1 && nums[0] === 4 && floor === null) nums = [];  // «свет 4» = весь свет 4 этажа
    if (t.all || !nums.length) { keys = keys.concat(tuyaGroupKeys_(t.grp)); return; }
    nums.forEach(function (n) {
      var d = TUYA_DEVICES.filter(function (x) { return x.group === t.grp && x.n === n; })[0];
      if (d) keys.push(d.key); else errs.push(TUYA_ONE_LABEL[t.grp] + ' ' + n);
    });
  });
  if (errs.length) return {action: 'error', text: 'Нет такого устройства: ' + errs.join(', ') + '. Напишите «помощь».'};
  keys = keys.filter(function (x, i) { return keys.indexOf(x) === i; });
  if (look) {
    if (keys.some(function (x) { return tuyaDev_(x).group !== 'light'; })) return {action: 'error', text: 'Цвет и яркость — только для ламп 1–6 (свет 4 этажа). Напишите «помощь».'};
    if (f.bright && f.pct === undefined) return {action: 'error', text: 'Укажите яркость в процентах, например «лампа 2 яркость 50%».'};
    if (f.pct !== undefined && (f.pct < 1 || f.pct > 100)) return {action: 'error', text: 'Яркость — от 1 до 100%.'};
    var lc = {action: 'look', keys: keys, mode: f.colour !== undefined ? 'colour' : 'white'};
    if (f.colour !== undefined) lc.h = f.colour;
    if (f.pct !== undefined) { lc.pct = f.pct; lc.bright = tuyaPctToBright_(f.pct); }
    return lc;
  }
  if (f.on || f.off) return {action: 'set', value: !!f.on, keys: keys, tempNote: temp !== undefined};
  if (temp !== undefined) return f.status ? null : {action: 'temp', keys: keys, value: temp};
  return {action: 'status', keys: keys};
}

function tuyaAllKeys_() { return TUYA_DEVICES.map(function (d) { return d.key; }); }
function tuyaGroupKeys_(g) { return TUYA_DEVICES.filter(function (d) { return d.group === g; }).map(function (d) { return d.key; }); }
function tuyaDev_(key) { return TUYA_DEVICES.filter(function (d) { return d.key === key; })[0]; }
function tuyaDescribe_(c) {
  if (c.action === 'set') return 'set ' + (c.value ? 'on' : 'off') + ' ' + c.keys.join(',');
  if (c.action === 'look') return (c.mode === 'colour' ? 'colour h' + c.h : 'white') + (c.bright !== undefined ? ' v' + c.bright : '') + ' ' + c.keys.join(',');
  if (c.action === 'status' || c.action === 'temp') return c.action + (c.value !== undefined ? ' ' + c.value : '') + ' ' + c.keys.join(',');
  return c.action;
}

var TUYA_HELP = [
  'Устройства 4 этажа и подкаста:',
  '• статус — всё; статус свет / кондиционеры / подкаст',
  '• свет 4 вкл — весь свет 4 этажа; свет 3 выкл — лампа 3 (1–6); лампа 4 выкл — именно лампа 4',
  '• цвет ламп: лампа 2 красный; весь свет зелёный; весь свет белый',
  '  цвета: красный, оранжевый, жёлтый, зелёный, голубой, синий, фиолетовый, розовый, белый',
  '• яркость (белый свет): весь свет яркость 50%; лампа 3 яркость 30%',
  '  можно и цвет с яркостью: лампа 2 синий 40%. Выключенная лампа сама включится',
  '• кондиционер 2 выкл (кондей, ac); все кондиционеры выкл',
  '• душ вкл / душ выкл',
  '• подкаст 1 вкл; подкаст выкл — оба',
  '• всё выкл — весь 4 этаж (свет, кондиционеры, душ; подкаст не трогаю)',
  '• по имени: fl4_lc2 on, air3 off, podcast1 off',
  'English: status, light 3 on, ac all off, podcast 2 off, all off, light 2 red, lights brightness 50%.',
  'Температуру кондиционеров отсюда не менять: они на умных розетках.',
  'Бот читает сообщения раз в минуту, ответ — с реальным состоянием.'
].join('\n');

// ---------- execution ----------
function tuyaRun_(cmd) {
  if (cmd.action === 'help') return TUYA_HELP;
  if (cmd.action === 'error') return '❓ ' + cmd.text;
  var devs = cmd.keys.map(tuyaDev_);
  if (cmd.action === 'temp') {
    return '❄️ Температуру поменять нельзя: кондиционеры подключены через умные розетки, доступно только вкл/выкл.\n' +
      tuyaFormat_(devs, tuyaRead_(devs), null);
  }
  if (cmd.action === 'status') return 'Статус ' + Utilities.formatDate(new Date(), 'Asia/Bangkok', 'HH:mm') + ':\n' + tuyaFormat_(devs, tuyaRead_(devs), null);
  if (cmd.action === 'look') return tuyaRunLook_(cmd, devs);
  // set
  var before = tuyaRead_(devs), fail = {};
  devs.forEach(function (d) {
    var b = before[d.id];
    if (b.online === false) { fail[d.id] = 'оффлайн'; return; }
    var r = tuyaApi_('POST', '/v1.0/iot-03/devices/' + d.id + '/commands', {commands: [{code: d.code, value: cmd.value}]});
    if (!r.success) fail[d.id] = 'ошибка Tuya: ' + (r.msg || r.code);
  });
  Utilities.sleep(TUYA_WAIT_MS);
  var after = tuyaRead_(devs);
  Object.keys(fail).forEach(function (id) { after[id].fail = fail[id]; });
  var ok = devs.every(function (d) { return !after[d.id].fail && after[d.id].online !== false && after[d.id].on === cmd.value; });
  var head = ok ? '✅ ' + (cmd.value ? 'Включено' : 'Выключено') + ', сейчас:' : '⚠️ Не всё получилось (' + (cmd.value ? 'вкл' : 'выкл') + '), сейчас:';
  return head + '\n' + tuyaFormat_(devs, after, cmd.value) + (cmd.tempNote ? '\nТемпературу не менял: кондиционеры на умных розетках, только вкл/выкл.' : '');
}

// Colour / white / brightness for lamps. A lamp that is off gets switch_led=true first.
function tuyaLookCommands_(cmd, b) {
  if (cmd.mode === 'colour') {
    var v = cmd.bright;
    if (v === undefined) v = (b && b.on && b.mode === 'colour' && b.colour) ? b.colour.v : (b && b.on && b.mode === 'white' && b.bright) ? b.bright : 1000;
    v = Math.max(10, Math.min(1000, Number(v) || 1000));
    return [{code: 'work_mode', value: 'colour'}, {code: 'colour_data_v2', value: {h: cmd.h, s: 1000, v: v}}];
  }
  var c = [{code: 'work_mode', value: 'white'}];
  if (cmd.bright !== undefined) c.push({code: 'bright_value_v2', value: cmd.bright});
  return c;
}
function tuyaLookOk_(cmd, s) {
  if (!s || s.fail || s.err || s.online === false || s.on !== true || s.mode !== cmd.mode) return false;
  if (cmd.mode === 'colour') return !!s.colour && s.colour.h === cmd.h && (cmd.bright === undefined || Math.abs(s.colour.v - cmd.bright) <= 10);
  return cmd.bright === undefined || Math.abs(Number(s.bright) - cmd.bright) <= 10;
}
function tuyaRunLook_(cmd, devs) {
  var before = tuyaRead_(devs), fail = {};
  devs.forEach(function (d) {
    var b = before[d.id];
    if (b.online === false) { fail[d.id] = 'оффлайн'; return; }
    if (b.on !== true) {
      var r0 = tuyaApi_('POST', '/v1.0/iot-03/devices/' + d.id + '/commands', {commands: [{code: d.code, value: true}]});
      if (!r0.success) { fail[d.id] = 'не включилась: ' + (r0.msg || r0.code); return; }
    }
    var r = tuyaApi_('POST', '/v1.0/iot-03/devices/' + d.id + '/commands', {commands: tuyaLookCommands_(cmd, b)});
    if (!r.success) fail[d.id] = 'ошибка Tuya: ' + (r.msg || r.code);
  });
  Utilities.sleep(TUYA_WAIT_MS);
  var after = tuyaRead_(devs);
  Object.keys(fail).forEach(function (id) { after[id].fail = fail[id]; });
  var ok = devs.every(function (d) { return tuyaLookOk_(cmd, after[d.id]); });
  var what = cmd.mode === 'colour' ? tuyaColourName_(cmd.h) : 'белый';
  if (cmd.pct !== undefined) what += ' ' + cmd.pct + '%';
  var head = ok ? '✅ Готово (' + what + '), сейчас:' : '⚠️ Не всё получилось (' + what + '), сейчас:';
  return head + '\n' + tuyaFormat_(devs, after, true);
}

// Returns {deviceId: {online, on, watts, err, mode, bright, colour}} from Tuya (2 batch calls).
function tuyaRead_(devs) {
  var ids = devs.map(function (d) { return d.id; }).join(','), out = {};
  devs.forEach(function (d) { out[d.id] = {}; });
  var info = tuyaApi_('GET', '/v2.0/cloud/thing/batch?device_ids=' + ids);
  if (info.success) (info.result || []).forEach(function (x) { if (out[x.id]) out[x.id].online = !!x.is_online; });
  var st = tuyaApi_('GET', '/v1.0/iot-03/devices/status?device_ids=' + ids);
  if (!st.success) { devs.forEach(function (d) { out[d.id].err = 'ошибка Tuya: ' + (st.msg || st.code); }); return out; }
  (st.result || []).forEach(function (x) {
    var d = devs.filter(function (y) { return y.id === x.id; })[0];
    if (!d) return;
    (x.status || []).forEach(function (s) {
      if (s.code === d.code) out[d.id].on = s.value === true;
      if (d.power && s.code === d.power) out[d.id].watts = Math.round(Number(s.value) / 10);
      if (d.group === 'light') {
        if (s.code === 'work_mode') out[d.id].mode = s.value;
        if (s.code === 'bright_value_v2') out[d.id].bright = Number(s.value);
        if (s.code === 'colour_data_v2') {
          try { var cv = typeof s.value === 'string' ? JSON.parse(s.value) : s.value; out[d.id].colour = {h: Number(cv.h), s: Number(cv.s), v: Number(cv.v)}; } catch (e) {}
        }
      }
    });
  });
  return out;
}

function tuyaState_(d, s, want) {
  if (s.fail) return s.fail + ' ❌';
  if (s.online === false) return 'оффлайн ❌';
  if (s.err) return s.err + ' ❌';
  if (s.on === undefined) return 'нет данных ❓';
  var t = s.on ? 'вкл' : 'выкл';
  if (d.power && s.on && s.watts !== undefined) t += ' ' + s.watts + ' Вт';
  if (d.group === 'light' && s.on) {
    if (s.mode === 'colour' && s.colour) t += ' ' + tuyaColourName_(s.colour.h) + ' ' + tuyaBrightToPct_(s.colour.v) + '%';
    else if (s.mode === 'white' && s.bright !== undefined) t += ' белый ' + tuyaBrightToPct_(s.bright) + '%';
    else if (s.mode) t += ' ' + s.mode;
  }
  if (want !== null && want !== undefined && s.on !== want) t += ' ⚠️';
  return t;
}

function tuyaFormat_(devs, st, want) {
  var lines = [];
  TUYA_GROUP_ORDER.forEach(function (g) {
    var ds = devs.filter(function (d) { return d.group === g; });
    if (!ds.length) return;
    var single = TUYA_DEVICES.filter(function (d) { return d.group === g; }).length === 1;
    lines.push(TUYA_GROUP_LABEL[g] + ': ' + ds.map(function (d) {
      return (single ? '' : d.n + ' ') + tuyaState_(d, st[d.id] || {}, want);
    }).join(' · '));
  });
  return lines.join('\n');
}

// ---------- Tuya OpenAPI (HMAC-SHA256, same scheme as ~/.config/place/tuya.py) ----------
function tuyaCfg_() {
  var p = PropertiesService.getScriptProperties();
  var c = {aid: p.getProperty('TUYA_ACCESS_ID'), sec: p.getProperty('TUYA_ACCESS_SECRET'), ep: p.getProperty('TUYA_ENDPOINT')};
  if (!c.aid || !c.sec || !c.ep) throw new Error('нет ключей Tuya (Script Properties TUYA_*)');
  return c;
}
function tuyaHex_(bytes) { return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join(''); }
function tuyaRaw_(c, method, path, body, tk) {
  var b = body ? JSON.stringify(body) : '', t = String(Date.now());
  var sts = [method, tuyaHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, b, Utilities.Charset.UTF_8)), '', path].join('\n');
  var sign = tuyaHex_(Utilities.computeHmacSha256Signature(c.aid + tk + t + sts, c.sec, Utilities.Charset.UTF_8)).toUpperCase();
  var h = {client_id: c.aid, sign: sign, t: t, sign_method: 'HMAC-SHA256'};
  if (tk) h.access_token = tk;
  var o = {method: method.toLowerCase(), headers: h, contentType: 'application/json', muteHttpExceptions: true};
  if (b) o.payload = b;
  var res = UrlFetchApp.fetch(c.ep.replace(/\/$/, '') + path, o);
  try { return JSON.parse(res.getContentText()); } catch (e) { return {success: false, msg: 'HTTP ' + res.getResponseCode()}; }
}
function tuyaToken_(fresh) {
  var cache = CacheService.getScriptCache();
  var tk = fresh ? null : cache.get('TUYA_TK');
  if (tk) return tk;
  var r = tuyaRaw_(tuyaCfg_(), 'GET', '/v1.0/token?grant_type=1', null, '');
  if (!r.success) throw new Error('токен Tuya: ' + (r.msg || r.code));
  cache.put('TUYA_TK', r.result.access_token, Math.max(60, Math.min(21600, (r.result.expire_time || 3600) - 300)));
  return r.result.access_token;
}
function tuyaApi_(method, path, body) {
  var c = tuyaCfg_(), r = tuyaRaw_(c, method, path, body, tuyaToken_(false));
  if (!r.success && (r.code === 1010 || r.code === 1011)) r = tuyaRaw_(c, method, path, body, tuyaToken_(true));
  return r;
}

// ---------- Telegram reply + log ----------
function tuyaSend_(tok, chatId, text) {
  try {
    var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + tok + '/sendMessage', {method: 'post', contentType: 'application/json',
      payload: JSON.stringify({chat_id: chatId, text: text, disable_web_page_preview: true}), muteHttpExceptions: true});
    var r = JSON.parse(res.getContentText());
    return r.ok ? r.result.message_id : 0;
  } catch (e) { Logger.log('TUYA_SEND_ERR ' + e); return 0; }
}
function tuyaLog_(row) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(TUYA_LOG_TAB);
  if (!sh) {
    sh = ss.insertSheet(TUYA_LOG_TAB, ss.getNumSheets());   // at the end: getSheets()[0] stays «queue»
    sh.appendRow(['time_ict', 'user_id', 'name', 'command', 'parsed', 'reply']);
    sh.setFrozenRows(1);
  }
  sh.appendRow(row);
}

// Run from the editor after setting Script Properties: read-only status, nothing is switched, nothing sent to Telegram.
function tuyaSelfTest() { Logger.log(tuyaRun_({action: 'status', keys: tuyaAllKeys_()})); }
