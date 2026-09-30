/**
 * Place Coworking — C8 «Ключи 24/7» для чек-листа закрытия 22:30. DRAFT TEMPLATE, NOT DEPLOYED.
 * READ-ONLY: never writes, never sends. Returns text for the existing close-checklist run.
 *
 * Needs 3 columns in Resident info «Лист1» (proposal D-DRAFTS.md §2; added only in the TEST copy):
 *   «24/7 (Y/N)» · «Key # / card #» · «Key deposit paid (date, ฿)»
 * Active = 24/7 = Y and Finish >= today (Finish is dd.mm or dd.mm.yy[yy]; dd.mm = current year).
 * Script Properties (optional): RESIDENT_SHEET_ID, KEY_TAB='Лист1'.
 */
var KH_TZ = 'Asia/Bangkok';
var KH_ID = '1Rzz9CKQYHwgZ8BPtrTxxUwFdphphSivSJkkTwFC8wo4';
var KH_HEAD = {name: 'name', finish: 'finish', floor: 'floor access', flag: '24/7 (y/n)', key: 'key # / card #', dep: 'key deposit paid (date, ฿)'};

function dryRunKeyholders() { var t = keyholders247_(new Date()); Logger.log(t); return t; }

function keyholders247_(now) {
  var p = PropertiesService.getScriptProperties();
  var sh = SpreadsheetApp.openById(p.getProperty('RESIDENT_SHEET_ID') || KH_ID).getSheetByName(p.getProperty('KEY_TAB') || 'Лист1');
  if (!sh) return '24/7: нет вкладки';
  var v = sh.getDataRange().getDisplayValues();
  var head = v[0].map(function (h) { return String(h).trim().toLowerCase(); }), ix = {};
  Object.keys(KH_HEAD).forEach(function (k) { ix[k] = head.indexOf(KH_HEAD[k]); });
  if (ix.flag < 0) return '24/7: колонок 24/7 нет (нужна правка Resident info по OK George)';
  var s = Utilities.formatDate(now, KH_TZ, 'yyyy-MM-dd').split('-'), today = new Date(+s[0], +s[1] - 1, +s[2]);
  var act = [], warn = [];
  for (var r = 1; r < v.length; r++) {
    if (!/^y/i.test(String(v[r][ix.flag]).trim())) continue;
    var name = String(v[r][ix.name] || '').trim(), fin = khDate_(v[r][ix.finish], today.getFullYear());
    var key = ix.key >= 0 ? String(v[r][ix.key]).trim() : '', dep = ix.dep >= 0 ? String(v[r][ix.dep]).trim() : '';
    if (!fin) { warn.push('стр. ' + (r + 1) + ' ' + name + ': нет даты Finish'); continue; }
    if (fin < today) { if (key) warn.push('стр. ' + (r + 1) + ' ' + name + ': 24/7 истёк ' + Utilities.formatDate(fin, KH_TZ, 'dd.MM') + ', ключ ' + key + ' не возвращён?'); continue; }
    act.push('• ' + name + (key ? ' — ключ ' + key : ' — ключ не указан') + ' (до ' + Utilities.formatDate(fin, KH_TZ, 'dd.MM') + ')' + (dep ? '' : ' ⚠️ депозит за ключ не отмечен'));
  }
  return 'Ключи 24/7: активных ' + act.length + '\n' + act.join('\n') + (warn.length ? '\n⚠️ ' + warn.join('\n⚠️ ') : '');
}
function khDate_(x, y) {
  var m = String(x || '').trim().match(/^(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?$/);
  if (!m) return null;
  var yy = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : y;
  return new Date(yy, +m[2] - 1, +m[1]);
}
