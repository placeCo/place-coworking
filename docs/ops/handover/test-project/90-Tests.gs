/** PLACE automations TEST — test entry points. Run from the editor (Run ▸ function). No triggers. */
var T_FAKE_CHAT = {id: -1009990001, title: 'Тех вопросы TEST', type: 'supergroup'};

function test_all() {
  var r = [test_guard(), test_relay(), test_techRoute(), test_stage6(), test_issues(), test_issuesBridgeHook(), test_issuesThread(), test_bookings(), test_keyholders(), test_timesheet(), test_leave(), test_payments(), test_cash()]
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

/** Bridge hook as it would sit in poll(): only «Тех вопросы» go to Issues; an edit updates the same row. */
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
      if (ISS.ISSUES_CHAT_RE.test(chat)) out.push(chat + ' -> ' + ISS.issuesHandle_(ISS.issuesSheet_(), m, text, name, !!u.edited_message));
      else out.push(chat + ' -> skipped');
    });
    return out;
  });
}

/** Row for Issues (opts.rows tests): id, opened 'yyyy-MM-dd HH:mm', text, reporter, [status, closed_at]. */
function T_issueRow_(id, at, text, who, status, closedAt) {
  var r = ISS.ISSUES_HEAD.map(function () { return ''; }), c = {}; ISS.ISSUES_HEAD.forEach(function (h, i) { c[h] = i; });
  r[c.issue_id] = '-1009990001:' + id; r[c.opened_at_ict] = at; r[c.reporter] = who; r[c.text] = text; r[c.status] = status || 'open';
  r[c.last_update_ict] = at; r[c.closed_at_ict] = closedAt || ''; r[c.tg_chat_id] = '-1009990001'; r[c.tg_message_id] = id; r[c.type] = 'issue';
  return r;
}
/** In-memory Issues sheet (nothing touches Place Inbox TEST). */
function T_memSheet_() {
  var v = [ISS.ISSUES_HEAD.slice()];
  return {values: v, getDataRange: function () { return {getValues: function () { return v.map(function (r) { return r.slice(); }); }}; },
    appendRow: function (r) { v.push(r.slice()); },
    getRange: function (r, c, nr, nc) { return {setValues: function (vals) { vals.forEach(function (x, i) { v[r - 1 + i] = x.slice(); }); }}; }};
}
/** George 01.10 23:10 «очень плохо»: ONE breakdown (outlet, floor-2 cabin 1) showed as «Поломки: 4».
 *  original + edit + reply + re-delivery + «починили» → 1 row, 0 open, «✅ закрыто сегодня: 1»; the real TEST rows
 *  (q256/q257 twice, from the queue sync) → 1 item «2 эт. кабинка 1 — розетка»; filler stripped, no «…». */
function test_issuesThread() {
  return T_fixture_('issues', 'one breakdown = one thread (in-memory sheet)', function () {
    var fail = [], chat = T_FAKE_CHAT, D = function (s) { return Math.floor(new Date(s + ':00+07:00').getTime() / 1000); };
    var night = new Date('2026-10-01T23:10:00+07:00'), morning = new Date('2026-10-01T10:07:00+07:00'), sh = T_memSheet_(), h = [];
    h.push(ISS.issuesHandle_(sh, {chat: chat, message_id: 701, date: D('2026-10-01T18:00'), from: {username: 'hey_len'}}, 'Здравствуйте \nНадо починить розетку на 2 этаже в кабинке номер 1', 'Hey_len'));
    h.push(ISS.issuesHandle_(sh, {chat: chat, message_id: 701, date: D('2026-10-01T18:00'), from: {username: 'hey_len'}}, 'Здравствуйте \nНадо починить розетку на 2 этаже в кабинке номер 1, срочно', 'Hey_len', true));
    h.push(ISS.issuesHandle_(sh, {chat: chat, message_id: 702, date: D('2026-10-01T18:01'), from: {username: 'hey_len'}, reply_to_message: {message_id: 701}}, 'Сломалась , сейчас пока от удлинителя', 'Hey_len'));
    h.push(ISS.issuesHandle_(sh, {chat: chat, message_id: 702, date: D('2026-10-01T18:01'), from: {username: 'hey_len'}, reply_to_message: {message_id: 701}}, 'Сломалась , сейчас пока от удлинителя', 'Hey_len'));
    var open1 = ISS.issuesDigest_('evening', night, {rows: sh.values, includeFixtures: true});
    if (open1 !== '🛠 Поломки: 1\n🔴 2 эт. кабинка 1 — розетка · открыто, сегодня') fail.push('before fix: ' + open1);
    h.push(ISS.issuesHandle_(sh, {chat: chat, message_id: 703, date: D('2026-10-01T20:00'), from: {username: 'som'}, reply_to_message: {message_id: 702}}, 'починили', 'Som'));
    if (sh.values.length !== 2) fail.push('rows: ' + (sh.values.length - 1) + ' (want 1)');
    if (h.join(',') !== 'open,edit,open,dup,closed') fail.push('handled: ' + h.join(','));
    var ev = ISS.issuesDigest_('evening', night, {rows: sh.values, includeFixtures: true}), mo = ISS.issuesDigest_('morning', morning, {rows: sh.values, includeFixtures: true});
    if (ev !== '🛠 Открытых поломок нет · ✅ закрыто сегодня: 1') fail.push('evening: ' + ev);
    if (mo !== '') fail.push('morning must be empty: ' + mo);
    // the real TEST rows of 30.09/01.10 (queue sync, no reply links, each row twice) + «починили» without reply
    var real = [ISS.ISSUES_HEAD, T_issueRow_('q256', '2026-09-30 23:53', 'Здравствуйте \nНадо починить розетку на 2 этаже в кабинке номер 1', 'Hey_len'),
      T_issueRow_('q257', '2026-09-30 23:54', 'Сломалась , сейчас пока от удлинителя', 'Hey_len'),
      T_issueRow_('q256', '2026-09-30 23:53', 'Здравствуйте \nНадо починить розетку на 2 этаже в кабинке номер 1', 'Hey_len'),
      T_issueRow_('q257', '2026-09-30 23:54', 'Сломалась , сейчас пока от удлинителя', 'Hey_len')];
    var r1 = ISS.issuesDigest_('morning', morning, {rows: real});
    if (r1 !== '🛠 Поломки: 1\n🔴 2 эт. кабинка 1 — розетка · открыто, с 30.09') fail.push('real rows: ' + r1);
    var r2 = ISS.issuesDigest_('evening', night, {rows: real.concat([T_issueRow_('q300', '2026-10-01 15:20', 'Розетку в кабинке 1 починили', 'Som')])});
    if (r2 !== '🛠 Открытых поломок нет · ✅ закрыто сегодня: 1') fail.push('real rows + починили: ' + r2);
    // 2 open: different authors/places stay separate; same author 45 min later about another place → new item; Lena «ок» closes
    var two = [ISS.ISSUES_HEAD, T_issueRow_('a1', '2026-09-30 23:53', 'Здравствуйте \nНадо починить розетку на 2 этаже в кабинке номер 1', 'Hey_len'),
      T_issueRow_('a2', '2026-10-01 09:40', 'Привет! На 3 этаже не работает кондиционер, please check', 'Som', 'in_progress'),
      T_issueRow_('a3', '2026-10-01 10:30', 'Добрый день, на 1 этаже скрипит лестница у входа', 'Som')];
    var d2 = ISS.issuesDigest_('evening', night, {rows: two});
    if (d2.split('\n').length !== 4 || d2.indexOf('🔴 1 эт. — скрипит лестница у входа · открыто, сегодня') < 0 || d2.indexOf('🟡 3 эт. — кондиционер · в работе, сегодня') < 0) fail.push('3 items: ' + d2);
    if (/…|Здравствуйте|Привет|please|Надо/i.test(d2)) fail.push('filler or ellipsis left: ' + d2);
    var sh2 = T_memSheet_();
    ISS.issuesHandle_(sh2, {chat: chat, message_id: 801, date: D('2026-10-01T09:00'), from: {username: 's'}}, 'ชั้น 3 แอร์เสีย', 'Som');
    ISS.issuesHandle_(sh2, {chat: chat, message_id: 802, date: D('2026-10-01T09:50'), from: {username: 's'}}, 'ชั้น 1 ไฟดับ', 'Som');
    var st = ISS.issuesHandle_(sh2, {chat: chat, message_id: 803, date: D('2026-10-01T12:00'), from: {username: 'lena'}, reply_to_message: {message_id: 801}}, 'ок 👍', 'Lena');
    if (sh2.values.length !== 3 || st !== 'closed') fail.push('lena confirm / 45-min split: rows ' + (sh2.values.length - 1) + ', ' + st);
    if (ISS.issuesHandle_(sh2, {chat: chat, message_id: 804, date: D('2026-10-01T12:05'), from: {username: 's'}, reply_to_message: {message_id: 802}}, 'не починили, ждём электрика', 'Som') === 'closed') fail.push('«не починили» closed it');
    if (fail.length) throw new Error('THREAD FAIL ' + fail.join(' | '));
    return {ok: 'original + edit + reply + dup + «починили» → 1 row, 0 open, closed today 1; real TEST rows → 1 item; 3 items; Lena «ок» closes; «не починили» stays open',
      sampleOpen: d2, sampleEveningClosedOnly: ev, realRows: r1};
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
      var H = ISS.ISSUES_HEAD, rows = [H, T_issueRow_('tr1', '2026-10-01 09:00', 'Кондиционер на 3 этаже не работает', 'Som')], opts = {rows: rows};
      T_relay_(null, ISS.issuesDigest_('morning', new Date('2026-10-01T10:07:00+07:00'), opts));
      if (sent.length !== 2 || sent[0].text.split('\n')[0] !== '🧪 ТЕСТ · 🛠 Поломки: 1' || /Куда ушло бы/.test(sent[0].text)) fail.push('header: ' + JSON.stringify(sent.map(function (x) { return x.text.split('\n')[0]; })));
      // 2) production path, TECH_CHAT_ID empty → not sent, warning
      sent = []; var buf0 = T_BUF.length;
      var a = ISS.issuesSendDigest_('evening', null, opts);
      if (a.sent !== false || sent.length || !/WARN TECH_CHAT_ID not set/.test(T_BUF.slice(buf0).join('\n'))) fail.push('empty TECH_CHAT_ID: ' + JSON.stringify(a) + ' sends=' + sent.length);
      // 3) production path, TECH_CHAT_ID set → one sendMessage to it, relayed as «Тех вопросы (TG группа)»
      sent = []; T_CTX.props = {TECH_CHAT_ID: '-1009990077'};
      var b = ISS.issuesSendDigest_('evening', null, opts);
      if (!b.sent || sent.length !== 2 || sent[0].text.split('\n')[0] !== '🧪 ТЕСТ · 🛠 Поломки: 1') fail.push('set TECH_CHAT_ID: ' + JSON.stringify(sent.map(function (x) { return x.text.split('\n')[0]; })));
    } finally { T_CTX = prev; }
    if (fail.length) throw new Error('TECH ROUTE FAIL ' + fail.join('; '));
      // 4) nothing open → nothing sent
      sent = []; var c = ISS.issuesSendDigest_('morning', null, {rows: [H]});
      if (c.sent !== false || sent.length) fail.push('empty digest sent: ' + JSON.stringify(c));
    return 'OK: short «🧪 ТЕСТ · » marker, no «Куда ушло бы»; TECH_CHAT_ID empty → not sent + WARN; set → sent to TECH_CHAT_ID; nothing → nothing sent';
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

/** Cash collection (George 01.10 12:05/12:06, safe with a drop slot): reminder asks «в кассе X / положил в сейф Y»;
 *  reply parsed; the script sums deposits since the last pickup; Sak DM «In the safe: TOTAL ฿ (+Y today, admin)» relayed to
 *  George + Lena as «Сак (ЛС)»; Y = 0 → no DM; Sak «забрал/taken/รับแล้ว» → counter reset. Fake ids + fake sender. */
function test_cash() {
  return T_fixture_('cash', 'CASH reminder / reply / running total / pickup (fake ids, fake sender)', function () {
    var fail = [], now = new Date('2026-10-04T23:05:00+07:00');
    var saved = CASH.cashSafe_();
    var rem = CASH.cashReminderText_();
    if (rem.split('\n').length > 3 || rem.indexOf('«в кассе X / положил в сейф Y»') < 0 || rem.indexOf('Cash collection today') < 0) fail.push('reminder: ' + rem);
    [['в кассе 2 000 / положил в сейф 12 500', 2000, 12500], ['в кассе 1500 / положила в сейф 0', 1500, 0], ['касса 800, в сейф 3000', 800, 3000],
     ['till 3,000 / deposited 9,800', 3000, 9800], ['ลิ้นชัก 2000 / ใส่เซฟ 7000', 2000, 7000]]
      .forEach(function (c) { var v = CASH.cashParse_(c[0]); if (!v || v.till !== c[1] || v.deposited !== c[2]) fail.push('parse ' + c[0] + ' → ' + JSON.stringify(v)); });
    if (CASH.cashParse_('12500')) fail.push('parse without labels must fail');
    var prev = T_CTX, sent = [], fake = function (id, text) { sent.push({id: id, text: text}); return 200; }, r1, r2;
    try {
      CASH.cashSafeSave_({total: 0, since: '', n: 0});
      T_CTX = {relay: true, ids: {george: '111111', lena: '222222'}, send: fake};
      r1 = CASH.cashReply_('в кассе 2000 / положил в сейф 12500', 'Tangmo', now);
      if (r1.ok && r1.sak) T_relay_('Сак (ЛС)', r1.sak);
      if (r1.sak.split('\n')[0] !== '💰 In the safe: 12 500 ฿ (+12 500 ฿ today, Tangmo). Please come by.') fail.push('sak 1: ' + r1.sak.split('\n')[0]);
      if (sent.length !== 2 || sent[0].text.split('\n')[0] !== '🧪 ТЕСТ · Куда ушло бы: Сак (ЛС)') fail.push('sak relay: ' + JSON.stringify(sent));
      r2 = CASH.cashReply_('в кассе 1500 / положил в сейф 3000', 'Nathaly', now);
      if (r2.total !== 15500 || r2.sak.split('\n')[0] !== '💰 In the safe: 15 500 ฿ (+3 000 ฿ today, Nathaly). Please come by.') fail.push('sak 2 (running total): ' + r2.sak);
      sent = [];
      var z = CASH.cashReply_('в кассе 800 / положил в сейф 0', 'Tangmo', now);
      if (z.sak || z.total !== 15500 || !/no collection/.test(z.ack)) fail.push('zero deposit: ' + JSON.stringify(z));
      if (CASH.cashReply_('12500', 'Tangmo', now).ok) fail.push('bad format accepted');
      if (CASH.cashPickup_('ok thanks', 'Sak', now).ok || CASH.cashSafe_().total !== 15500) fail.push('non-pickup text reset the counter');
      var p = CASH.cashPickup_('забрал', 'Sak', now);
      if (!p.ok || p.taken !== 15500 || CASH.cashSafe_().total !== 0) fail.push('pickup забрал: ' + JSON.stringify(p));
      CASH.cashReply_('в кассе 0 / положил в сейф 1000', 'Tangmo', now);
      if (CASH.cashSafe_().total !== 1000) fail.push('after reset: ' + CASH.cashSafe_().total);
      ['taken', 'รับแล้ว'].forEach(function (w) { CASH.cashSafeSave_({total: 500, since: 'x', n: 1}); var q = CASH.cashPickup_(w, 'Sak', now); if (!q.ok || CASH.cashSafe_().total !== 0) fail.push('pickup ' + w); });
    } finally { T_CTX = prev; CASH.cashSafeSave_(saved); }
    if (fail.length) throw new Error('CASH FAIL ' + fail.join('; '));
    return {ok: 'reminder; parse ru/en/th; running total 12 500 → 15 500; Y=0 → no DM; pickup забрал/taken/รับแล้ว → reset', reminder: rem, sak1: r1.sak, sak2: r2.sak};
  });
}
