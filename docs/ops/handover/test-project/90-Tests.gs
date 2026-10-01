/** PLACE automations TEST — test entry points. Run from the editor (Run ▸ function). No triggers. */
var T_FAKE_CHAT = {id: -1009990001, title: 'Тех вопросы TEST', type: 'supergroup'};

function test_all() {
  var r = [test_guard(), test_relay(), test_techRoute(), test_stage6(), test_issues(), test_issuesBridgeHook(), test_bookings(), test_keyholders(), test_timesheet(), test_leave(), test_payments(), test_cash()]
    .map(function (x) { return x.status; });
  r.push('cleanup: ' + cleanupTestFixtures().status);   // test rows must not reach the scheduled summaries
  return r;
}

/** Deletes test rows from Issues in Place Inbox TEST: tag = fixture, plus old untagged rows from test_* runs
 *  (fake «Тех вопросы TEST» chat id, «(TEST)»/«_test» reporters, «TEST Tenant» electricity tasks). Real rows stay. */
function cleanupTestFixtures() {
  return T_fixture_('cleanup', 'cleanupTestFixtures (Place Inbox TEST / Issues)', function () {
    var sh = T_SS.openById(T_IDS.inbox).getSheetByName('Issues'); if (!sh) return 'no Issues tab';
    var v = sh.getDataRange().getValues(), h = v[0], c = {}; h.forEach(function (x, i) { c[x] = i; });
    var del = [];
    for (var r = v.length - 1; r >= 1; r--) {
      var x = v[r], g = function (k) { return c[k] === undefined ? '' : String(x[c[k]] || ''); };
      var fixture = g('tag') === 'fixture' || g('tg_chat_id') === String(T_FAKE_CHAT.id) ||
        /\(TEST\)\s*$|_test$/i.test(g('reporter')) || /TEST Tenant/.test(g('text'));
      if (fixture) { sh.deleteRow(r + 1); del.push(g('issue_id')); }
    }
    return 'deleted ' + del.length + (del.length ? ': ' + del.reverse().join(', ') : '') + '; left ' + (v.length - 1 - del.length) + ' rows';
  });
}

/** Self-test of the safety layer: every call must be BLOCKED. */
function test_guard() {
  return T_fixture_('guard', 'test_guard', function () {
    var out = [];
    [function () { T_SS.openById(P_IDS.inbox).getSheetByName('queue').appendRow(['x']); },   // prod write
     function () { T_SS.openById(P_IDS.resident).getSheets()[0].getRange(1, 1).setValue('x'); }, // prod write
     function () { T_SS.openById('1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'); },              // unknown sheet
     function () { T_FETCH.fetch('https://example.com/'); },                                       // non-Telegram fetch
     function () { T_SCRIPT.newTrigger('x'); }]                                                    // triggers from modules
      .forEach(function (f, i) { try { f(); out.push(i + ':NOT BLOCKED'); } catch (e) { out.push(i + ':blocked'); } });
    var ro = T_SS.openById(P_IDS.inbox).getSheetByName('queue').getLastRow();                      // prod read works
    if (out.join(',').indexOf('NOT') >= 0) throw new Error('GUARD FAIL ' + out.join(','));
    return 'all 5 blocked: ' + out.join(',') + '; prod read OK (queue rows ' + ro + ')';
  });
}

/** Stage 6: offices + electricity task for Lena (writes Issues in Place Inbox TEST). */
function test_stage6() { return T_fixture_('stage6', 'ST6.run_(draft→stub)', function () { return ST6.run_('draft'); }); }
function test_stage6Reset() { return T_fixture_('stage6', 'ST6.resetSentLog', function () { ST6.resetSentLog(); return 'SENT_LOG cleared'; }); }

/** Issues: new issue, second issue, reply in progress, reply «готово» closes, digests. */
function test_issues() {
  return T_fixture_('issues', 'ISS.issuesHandle_ + digest', function () {
    var sh = ISS.issuesSheet_(), t = Math.floor(Date.now() / 1000), base = 900000 + (t % 90000), r = [];
    r.push(ISS.issuesHandle_(sh, {chat: T_FAKE_CHAT, message_id: base, date: t, from: {username: 'som_test'}}, 'TEST: кондиционер на 3 этаже течёт', 'Som (TEST)'));
    r.push(ISS.issuesHandle_(sh, {chat: T_FAKE_CHAT, message_id: base + 1, date: t + 60, from: {username: 'tangmo_test'}}, 'TEST: ชั้น 1 ไฟดับ 2 ดวง', 'Tangmo (TEST)'));
    r.push(ISS.issuesHandle_(sh, {chat: T_FAKE_CHAT, message_id: base + 2, date: t + 120, from: {username: 'som_test'}, reply_to_message: {message_id: base}}, 'смотрю, нужна деталь', 'Som (TEST)'));
    r.push(ISS.issuesHandle_(sh, {chat: T_FAKE_CHAT, message_id: base + 3, date: t + 180, from: {username: 'som_test'}, reply_to_message: {message_id: base + 1}}, 'готово', 'Som (TEST)'));
    r.push(ISS.issuesHandle_(sh, {chat: T_FAKE_CHAT, message_id: base + 4, date: t + 240, from: {username: 'placeleadbot'}}, 'bot echo', 'bot'));
    return {handled: r, morning: ISS.issuesDigest_('morning', null, {includeFixtures: true}), evening: ISS.issuesDigest_('evening', null, {includeFixtures: true}),
      jobView: ISS.issuesDigest_('morning')};   // jobView = what job_issues* would send: fixtures skipped
  });
}

/** Bridge hook as it would sit in poll(): only «Тех вопросы» and not edited messages go to Issues. */
function test_issuesBridgeHook() {
  return T_fixture_('issues', 'bridge hook simulation', function () {
    var t = Math.floor(Date.now() / 1000), base = 990000 + (t % 9000), out = [];
    var updates = [
      {message: {chat: T_FAKE_CHAT, message_id: base, date: t, from: {username: 'kate_test'}, text: 'TEST: ชั้น 4 น้ำรั่ว'}},
      {message: {chat: {id: -1009990002, title: 'PLACE Team TEST'}, message_id: base + 1, date: t, from: {username: 'kate_test'}, text: 'TEST: not an issue chat'}},
      {edited_message: {chat: T_FAKE_CHAT, message_id: base, date: t, from: {username: 'kate_test'}, text: 'edited'}}
    ];
    updates.forEach(function (u) {
      var m = u.message || u.edited_message, chat = (m.chat && m.chat.title) || '', text = m.text, name = (m.from && m.from.username) || '?';
      if (ISS.ISSUES_CHAT_RE.test(chat) && !(u.edited_message)) out.push(chat + ' -> ' + ISS.issuesHandle_(ISS.issuesSheet_(), m, text, name));
      else out.push(chat + ' -> skipped');
    });
    return out;
  });
}

/** G-5: bookings for 01.10.2026 (TEST booking in Meeting room) and for today. */
function test_bookings() {
  return T_fixture_('bookings', 'BKG.bookingsToday_', function () {
    return BKG.bookingsToday_(new Date('2026-10-01T10:07:00+07:00')) + '\n\n' + BKG.bookingsToday_(new Date('2026-12-20T10:07:00+07:00'));
  });
}

/** C8: active 24/7 key holders (TEST rows 303-305 in Лист1). */
function test_keyholders() { return T_fixture_('keyholders', 'KH.keyholders247_', function () { return KH.keyholders247_(new Date('2026-09-30T22:30:00+07:00')); }); }

/** Stage 5: timesheet dry run + "draft" (stub). Calendar month, counted to the 28th; 29..end = after cutoff; prev month 29..end = adjustments. */
function test_timesheet() {
  return T_fixture_('timesheet', 'ST5.dryRun + createTimesheetDraft(stub)', function () {
    var r = ST5.dryRun();
    return {subject: r.subject, period: r.fromIso + '..' + r.toIso, countedTo: r.cutIso, warnings: r.warnings, people: r.rows.length,
      afterCutoff: r.afterCutoff, prevAdjustments: r.prevAdjustments, draft: ST5.createTimesheetDraft()};
  });
}

/** G-13 leave via bot (staged, scheme 30.09 10:40): request -> cards to BOTH George and Lena -> either decides ->
 *  employee notified + Schedule 26 TEST marked; second decision refused; non-approver refused; bad format. */
function test_leave() {
  return T_fixture_('leave', 'LV.leaveRequest_ + leaveDecide_ (George + Lena)', function () {
    var now = new Date();
    var bad = LV.leaveRequest_({name: 'Tangmo', user: 'tangmo_test', chatId: 1}, '/leave holiday tomorrow', now);
    var a = LV.leaveRequest_({name: 'Tangmo', user: 'tangmo_test', chatId: 1}, '/leave vacation 11.10-12.10 TEST family', now);
    // the same card goes to every approver: ONE relay (it already reaches George and Lena), no double send to George
    T_relay_(T_leaveWho_(a.cards.map(function (c) { return c.to; })) + ' (approve)', a.cards[0].text);
    var nope = LV.leaveDecide_(a.id, 'approve', 'Kate', '', now);
    var ok = LV.leaveDecide_(a.id, 'approve', 'Lena', '', now);
    var late = LV.leaveDecide_(a.id, 'reject', 'George', '', now);
    T_relay_('сотрудник Tangmo в личку', ok.employeeMsg);
    ok.otherMsg.forEach(function (m) { T_relay_(T_leaveWho_([m.to]) + ' в личку', m.text); });
    var b = LV.leaveRequest_({name: 'Kate', user: 'kate_test', chatId: 2}, '/leave выходной 14.10 TEST', new Date(now.getTime() + 1000));
    var no = LV.leaveDecide_(b.id, 'reject', 'George', 'TEST reason', now);
    T_relay_('сотрудник Kate в личку', no.employeeMsg);
    return {badFormat: bad.error, request: a.id, cardsTo: a.cards.map(function (c) { return c.to; }), nonApprover: nope.status,
      approveByLena: {status: ok.status, written: ok.written, conflicts: ok.conflicts}, secondDecision: late.status, dayoffRejectByGeorge: no.status};
  });
}

/** Approver names -> label: ['George','Lena'] -> «Лена и George». */
function T_leaveWho_(names) {
  var ru = names.map(function (n) { return /^lena$/i.test(n) ? 'Лена' : n; }).sort(function (a, b) { return a === 'Лена' ? -1 : b === 'Лена' ? 1 : 0; });
  return ru.join(' и ');
}

/** Test-mode relay: goes to George AND Lena, header «🧪 ТЕСТ» + «Куда ушло бы», blank line, body;
 *  LENA_CHAT_ID empty -> George only + warning, no failure; same id twice -> one send. Fake ids + fake sender, nothing is sent. */
function test_relay() {
  return T_fixture_('relay', 'T_relay_ (fake ids, fake sender)', function () {
    var sent = [], prev = T_CTX, fail = [];
    var fake = function (id, text) { sent.push({id: id, text: text}); return 200; };
    var body = 'Сегодня брони: Meeting room 14:00–16:00';
    function run(ids) { sent = []; T_CTX = {relay: true, ids: ids, send: fake}; var buf0 = T_BUF.length; var r = T_relay_('PLACE Team', body); var w = T_BUF.slice(buf0).join('\n'); T_CTX = prev; return {r: r, sent: sent, log: w}; }
    try {
      var a = run({george: '111111', lena: '222222'});
      if (a.sent.length !== 2 || a.sent[0].id !== '111111' || a.sent[1].id !== '222222') fail.push('both: ' + JSON.stringify(a.sent.map(function (x) { return x.id; })));
      a.sent.forEach(function (x) {
        var L = x.text.split('\n');
        if (L[0] !== '🧪 ТЕСТ · Куда ушло бы: PLACE Team') fail.push('line1: ' + L[0]);
        if (L[1] !== '' || L.slice(2).join('\n') !== body) fail.push('body: ' + JSON.stringify(L.slice(1)));
      });
      var b = run({george: '111111', lena: ''});
      if (b.sent.length !== 1 || b.sent[0].id !== '111111') fail.push('no-lena: ' + JSON.stringify(b.sent.map(function (x) { return x.id; })));
      if (!/WARN LENA_CHAT_ID not set/.test(b.log)) fail.push('no-lena: warning missing');
      var c = run({george: '111111', lena: '111111'});
      if (c.sent.length !== 1) fail.push('same id twice: sent ' + c.sent.length);
      var d = run({george: '', lena: ''});
      if (d.sent.length !== 0 || !/^log-only/.test(d.r)) fail.push('no ids: ' + d.r);
    } finally { T_CTX = prev; }
    if (fail.length) throw new Error('RELAY FAIL ' + fail.join('; '));
    return 'OK: both ids + header + «Куда ушло бы» + body; Lena empty → George only + WARN; same id → 1 send; no ids → log only';
  });
}

/** Issues digests → «Тех вопросы» (TECH_CHAT_ID): job header, production send skips + WARN when empty, sends to TECH_CHAT_ID when set. */
function test_techRoute() {
  return T_fixture_('relay', 'issues digests → Тех вопросы (fake ids, fake sender)', function () {
    var prev = T_CTX, fail = [], sent = [], fake = function (id, text) { sent.push({id: id, text: text}); return 200; };
    try {
      // 1) job header (T_issuesJob_ with fake relay)
      var saved = [T_PROFILE]; T_CTX = {relay: true, ids: {george: '111111', lena: '222222'}, send: fake, props: {TECH_CHAT_ID: ''}};
      T_relay_('Тех вопросы, 10:07', ISS.issuesDigest_('morning'));
      if (sent.length !== 2 || sent[0].text.split('\n')[0] !== '🧪 ТЕСТ · Куда ушло бы: Тех вопросы, 10:07') fail.push('header: ' + JSON.stringify(sent.map(function (x) { return x.text.split('\n')[0]; })));
      if (sent.some(function (x) { return /PLACE Team/.test(x.text.split('\n')[0]); })) fail.push('still PLACE Team');
      // 2) production path, TECH_CHAT_ID empty → not sent, warning
      sent = []; var buf0 = T_BUF.length;
      var a = ISS.issuesSendDigest_('evening');
      if (a.sent !== false || sent.length || !/WARN TECH_CHAT_ID not set/.test(T_BUF.slice(buf0).join('\n'))) fail.push('empty TECH_CHAT_ID: ' + JSON.stringify(a) + ' sends=' + sent.length);
      // 3) production path, TECH_CHAT_ID set → one sendMessage to it, relayed as «Тех вопросы (TG группа)»
      sent = []; T_CTX.props = {TECH_CHAT_ID: '-1009990077'};
      var b = ISS.issuesSendDigest_('evening');
      if (!b.sent || sent.length !== 2 || sent[0].text.split('\n')[0] !== '🧪 ТЕСТ · Куда ушло бы: Тех вопросы') fail.push('set TECH_CHAT_ID: ' + JSON.stringify(sent.map(function (x) { return x.text.split('\n')[0]; })));
    } finally { T_CTX = prev; }
    if (fail.length) throw new Error('TECH ROUTE FAIL ' + fail.join('; '));
    return 'OK: header «Тех вопросы (TG группа, сводка 10:07)»; TECH_CHAT_ID empty → not sent + WARN; set → sent to TECH_CHAT_ID';
  });
}

/** Payment reminders: dates (3 days before + on the day; contracts 30/3/0), no bank account numbers, TEST header, PAY_CHAT_ID empty → WARN, no send. */
function test_payments() {
  return T_fixture_('payments', 'PAY.payDue_ / payText_ / payRemindersRun_ (fake ids, fake sender)', function () {
    var fail = [], D = function (s) { return new Date(s + 'T09:15:00+07:00'); };
    var names = function (d) { return PAY.payDue_(D(d)).map(function (x) { return x.entry.name + '@' + x.daysLeft; }).sort().join(' | '); };
    var cases = {
      '2026-10-05': ['Электричество (PEA)@3', 'Интернет 3BB …4746@3', 'Интернет 3BB …4751@3', 'Билборд@0'],
      '2026-10-08': ['Электричество (PEA)@0', 'Интернет 3BB …4746@0', 'Интернет 3BB …4751@0'],
      '2026-10-17': ['Вода@3'],
      '2026-10-25': ['Интернет 3BB …7790@3'],
      '2026-10-29': ['Вывоз мусора (Чалонг)@3', 'Обновить телефонный счёт Dtac@3'],
      '2026-11-01': ['Вывоз мусора (Чалонг)@0', 'Обновить телефонный счёт Dtac@0'],
      '2027-01-28': ['Конец договора: принтер@30', 'Конец договора: билборд@30', 'Интернет 3BB …7790@0'],
      '2027-01-29': ['Secom (тревожная кнопка)@3', 'Обновить телефонный счёт Dtac@3'],
      '2027-02-01': ['Secom (тревожная кнопка)@0', 'Обновить телефонный счёт Dtac@0'],
      '2027-07-01': ['Secom (тревожная кнопка)@0', 'Обновить телефонный счёт Dtac@0'],
      '2027-02-24': ['Конец договора: принтер@3', 'Конец договора: билборд@3'],
      '2026-10-14': []
    };
    Object.keys(cases).forEach(function (d) {
      var want = cases[d].slice().sort().join(' | '), got = names(d);
      if (want !== got) fail.push(d + ': want [' + want + '] got [' + got + ']');
    });
    // all texts of a year: no bank-account-like numbers (10+ digits, or xxx-x-xxxxx-x / xxx xxx xxxx)
    for (var i = 0; i < 400; i++) {
      var t = PAY.payText_(new Date(D('2026-10-01').getTime() + i * 86400000));
      if (/\d{10,}|\b\d{3}[- ]\d{1,3}[- ]\d{4,5}(?:[- ]\d)?\b/.test(t)) { fail.push('bank-like number in text ' + i); break; }
    }
    var t27 = PAY.payText_(D('2027-02-27'));
    if (!/принтер.*после этой даты принтер наш/.test(t27)) fail.push('printer note missing: ' + t27);
    if (!/24 396 ฿ за платёж/.test(PAY.payText_(D('2027-02-01')))) fail.push('Secom wording');
    if (PAY.payText_(D('2026-10-05')).split('\n').length > 6) fail.push('payments text too long');
    // relay: header + PAY label to George and Lena; production path with empty PAY_CHAT_ID sends nothing
    var prev = T_CTX, sent = [], fake = function (id, text) { sent.push({id: id, text: text}); return 200; };
    try {
      T_CTX = {relay: true, ids: {george: '111111', lena: '222222'}, send: fake, props: {PAY_CHAT_ID: ''}};
      T_relay_('PAY_CHAT_ID (группа, уточняется)', PAY.payText_(D('2026-10-08')));
      if (sent.length !== 2 || sent[0].text.split('\n')[0] !== '🧪 ТЕСТ · Куда ушло бы: PAY_CHAT_ID (группа, уточняется)') fail.push('relay header');
      sent = []; var buf0 = T_BUF.length, r = PAY.payRemindersRun_(D('2026-10-08'));
      if (r.sent !== false || sent.length || !/WARN PAY_CHAT_ID not set/.test(T_BUF.slice(buf0).join('\n'))) fail.push('empty PAY_CHAT_ID: ' + JSON.stringify(r));
    } finally { T_CTX = prev; }
    if (fail.length) throw new Error('PAYMENTS FAIL ' + fail.join('; '));
    return {ok: Object.keys(cases).length + ' dates OK, no bank numbers, header OK, empty PAY_CHAT_ID → not sent', sample: PAY.payText_(D('2026-10-05'))};
  });
}

/** Cash collection (George 01.10): short reminder asks «в кассе X / в сейф Y»; reply parsed; Sak DM relayed to George + Lena
 *  as «Сак (ЛС)»; safe 0 → no collection, no DM; bad format → hint. Fake ids + fake sender, nothing is sent. */
function test_cash() {
  return T_fixture_('cash', 'CASH.cashReminderText_ / cashReply_ (fake ids, fake sender)', function () {
    var fail = [], now = new Date('2026-10-04T23:05:00+07:00');
    var rem = CASH.cashReminderText_();
    if (rem.split('\n').length > 4 || rem.indexOf('«в кассе X / в сейф Y»') < 0 || /photo|фото/i.test(rem.replace('no photo', ''))) fail.push('reminder: ' + rem);
    [['в кассе 2 000 / в сейф 12 500', 2000, 12500], ['касса 1500, сейф 0', 1500, 0], ['in till 3,000 / safe 9,800', 3000, 9800], ['ลิ้นชัก 2000 / เซฟ 7000', 2000, 7000]]
      .forEach(function (c) { var v = CASH.cashParse_(c[0]); if (!v || v.till !== c[1] || v.safe !== c[2]) fail.push('parse ' + c[0] + ' → ' + JSON.stringify(v)); });
    if (CASH.cashParse_('12500')) fail.push('parse without labels must fail');
    var prev = T_CTX, sent = [], fake = function (id, text) { sent.push({id: id, text: text}); return 200; };
    try {
      T_CTX = {relay: true, ids: {george: '111111', lena: '222222'}, send: fake};
      var r = CASH.cashReply_('в кассе 2000 / в сейф 12500', 'Tangmo', now);
      if (r.ok && r.sak) T_relay_('Сак (ЛС)', r.sak);
      if (sent.length !== 2 || sent[0].text.split('\n')[0] !== '🧪 ТЕСТ · Куда ушло бы: Сак (ЛС)' || !/12 500 ฿/.test(sent[0].text)) fail.push('sak dm: ' + JSON.stringify(sent));
      var z = CASH.cashReply_('в кассе 800 / в сейф 0', 'Tangmo', now);
      if (z.sak || !/no collection/.test(z.ack)) fail.push('zero safe: ' + JSON.stringify(z));
      if (CASH.cashReply_('12500', 'Tangmo', now).ok) fail.push('bad format accepted');
    } finally { T_CTX = prev; }
    if (fail.length) throw new Error('CASH FAIL ' + fail.join('; '));
    return {ok: 'reminder short + format; parse ru/en/th; Sak DM → George + Lena as «Сак (ЛС)»; safe 0 → no DM', reminder: rem, sak: r.sak, ack: r.ack};
  });
}
