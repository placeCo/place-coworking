/**
 * Place Coworking — Internet monitor alert router. DRAFT TEMPLATE, NOT DEPLOYED.
 *
 * Idea: small devices on each network send a heartbeat to Healthchecks.io every
 * 2 minutes (see heartbeat.sh / esp32-heartbeat.ino). This Apps Script reads the
 * Healthchecks.io API (READ-ONLY key) every ~5 minutes, detects up/down changes
 * and routes the alert:
 *   10:00–21:59 ICT -> PLACE Team (admins on shift) — ENGLISH ONLY (George 05.10.2026); George DM stays Russian
 *   22:00–09:59 ICT -> George only (DM to @PlaceLeadBot), and only if down >= NIGHT_MIN_DOWN
 * Lena: NOT a recipient (any Lena role is only a proposal).
 *
 * SAFETY: NETMON_MODE defaults to 'dry' (log only). 'live' sends Telegram
 * messages and must be enabled only after George OK.
 *
 * Can run as a separate project or inside the TG bridge (call netmonTick() from
 * poll() at most every 5 min; see INTERNET-MONITOR.md).
 *
 * Script Properties:
 *   HC_API_KEY       Healthchecks.io project READ-ONLY API key
 *   CHECK_LABELS     JSON {"floor1-wifi":"1st floor Wi-Fi", "floor3-wifi":"3rd floor Wi-Fi", "isp-a-wired":"Line A (wired)"} (English: shown in PLACE Team)
 *   TG_TOKEN         bot token (bridge already has it as TOKEN)
 *   ADMIN_CHAT_ID    PLACE Team chat id
 *   GEORGE_CHAT_ID   George's private chat id with @PlaceLeadBot (after /start)
 *   DAY_START=10  DAY_END=22  NIGHT_MIN_DOWN=15 (minutes)
 *   NETMON_MODE      'dry' | 'live'
 */

var NM_TZ = 'Asia/Bangkok';

function netmonTick() {
  var p = PropertiesService.getScriptProperties();
  var key = p.getProperty('HC_API_KEY');
  if (!key) { Logger.log('NETMON: no HC_API_KEY'); return 'NO_KEY'; }
  var r = UrlFetchApp.fetch('https://healthchecks.io/api/v3/checks/', {headers: {'X-Api-Key': key}, muteHttpExceptions: true});
  if (r.getResponseCode() !== 200) { Logger.log('NETMON: HC API ' + r.getResponseCode()); return 'HC_ERR'; }
  return netmonProcess_(JSON.parse(r.getContentText()).checks || [], new Date());
}

/** Pure logic: checks = Healthchecks API objects {name, slug, status: up|down|grace|new|paused, last_ping}. */
function netmonProcess_(checks, now) {
  var p = PropertiesService.getScriptProperties();
  var labels = JSON.parse(p.getProperty('CHECK_LABELS') || '{}');
  var state = JSON.parse(p.getProperty('NETMON_STATE') || '{}'); // slug -> {down_since, alerted, night_pending}
  var dayStart = Number(p.getProperty('DAY_START') || 10), dayEnd = Number(p.getProperty('DAY_END') || 22);
  var nightMin = Number(p.getProperty('NIGHT_MIN_DOWN') || 15);
  var hour = Number(Utilities.formatDate(now, NM_TZ, 'H'));
  var isDay = hour >= dayStart && hour < dayEnd;
  var out = [];
  var downNow = [];
  checks.forEach(function (c) {
    var id = c.slug || c.name, label = labels[id] || c.name, s = state[id] || {};
    if (c.status === 'paused' || c.status === 'new') return;
    if (c.status === 'down') {
      downNow.push(label);
      if (!s.down_since) s.down_since = (c.last_ping ? new Date(c.last_ping) : now).getTime();
      var mins = Math.round((now.getTime() - s.down_since) / 60000);
      if (!s.alerted) {
        if (isDay) { out.push({to: 'admins', text: '🔴 Internet down: ' + label + ' (since ' + hm_(s.down_since) + ', ' + mins + ' min). Check the router / power.'}); s.alerted = 'admins'; }
        else if (mins >= nightMin) { out.push({to: 'george', text: '🔴 Ночью нет интернета: ' + label + ' с ' + hm_(s.down_since) + ' (' + mins + ' мин).'}); s.alerted = 'george'; }
      } else if (s.alerted === 'admins' && !isDay && !s.george) {
        // outage started in the day and continues after 22:00: hand over to George once
        out.push({to: 'george', text: '🔴 Интернет всё ещё не работает после 22:00: ' + label + ' (с ' + hm_(s.down_since) + ', ' + mins + ' мин).'}); s.george = true;
      } else if (s.alerted === 'george' && isDay && !s.admins) {
        // outage started at night and continues after 10:00: tell the shift once
        out.push({to: 'admins', text: '🔴 Internet down since the night: ' + label + ' (since ' + hm_(s.down_since) + '). Check the router / power.'}); s.admins = true;
      }
    } else if (c.status === 'up' && s.down_since) {
      var dur = Math.round((now.getTime() - s.down_since) / 60000);
      if (s.alerted) out.push({to: isDay ? 'admins' : 'george', text: isDay ? '🟢 Internet back: ' + label + ' (down ' + dur + ' min).' : '🟢 Интернет восстановлен: ' + label + ' (простой ' + dur + ' мин).'});
      s = {};
    }
    state[id] = s;
  });
  if (downNow.length >= 2 && downNow.length === checks.filter(function (c) { return c.status !== 'paused' && c.status !== 'new'; }).length) {
    out.forEach(function (m) { m.text += m.to === 'admins' ? '\n⚠️ ALL networks are down: probably a power cut or the main router/line.' : '\n⚠️ Упали ВСЕ сети сразу: вероятно, нет электричества или упал главный роутер/линия.'; });
  }
  p.setProperty('NETMON_STATE', JSON.stringify(state));
  var mode = p.getProperty('NETMON_MODE') || 'dry';
  out.forEach(function (m) {
    var chat = m.to === 'admins' ? p.getProperty('ADMIN_CHAT_ID') : p.getProperty('GEORGE_CHAT_ID');
    if (mode === 'live' && chat) tgSend_(chat, m.text);
    else Logger.log('[netmon ' + mode + '] -> ' + m.to + ': ' + m.text);
  });
  return out;
}

function tgSend_(chatId, text) {
  var tok = PropertiesService.getScriptProperties().getProperty('TG_TOKEN') || PropertiesService.getScriptProperties().getProperty('TOKEN');
  return UrlFetchApp.fetch('https://api.telegram.org/bot' + tok + '/sendMessage', {method: 'post', contentType: 'application/json', payload: JSON.stringify({chat_id: chatId, text: text}), muteHttpExceptions: true}).getResponseCode();
}

function hm_(ms) { return Utilities.formatDate(new Date(ms), NM_TZ, 'HH:mm'); }

/** Offline test: fake day outage, recovery, and night outage. Sends nothing. */
function dryRunNetmon() {
  var p = PropertiesService.getScriptProperties();
  p.deleteProperty('NETMON_STATE');
  var t0 = new Date('2026-10-01T14:00:00+07:00');
  var log = [];
  log.push(netmonProcess_([{slug: 'floor1-wifi', name: 'floor1-wifi', status: 'down', last_ping: '2026-10-01T06:55:00Z'}, {slug: 'floor3-wifi', name: 'floor3-wifi', status: 'up'}], t0));
  log.push(netmonProcess_([{slug: 'floor1-wifi', name: 'floor1-wifi', status: 'up'}, {slug: 'floor3-wifi', name: 'floor3-wifi', status: 'up'}], new Date(t0.getTime() + 20 * 60000)));
  var n0 = new Date('2026-10-02T02:00:00+07:00');
  log.push(netmonProcess_([{slug: 'floor3-wifi', name: 'floor3-wifi', status: 'down', last_ping: '2026-10-01T18:55:00Z'}], n0));
  log.push(netmonProcess_([{slug: 'floor3-wifi', name: 'floor3-wifi', status: 'down', last_ping: '2026-10-01T18:55:00Z'}], new Date(n0.getTime() + 20 * 60000)));
  p.deleteProperty('NETMON_STATE');
  Logger.log(JSON.stringify(log, null, 1));
  return log;
}
