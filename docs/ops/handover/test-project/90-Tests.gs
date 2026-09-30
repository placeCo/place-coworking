/** PLACE automations TEST — test entry points. Run from the editor (Run ▸ function). No triggers. */
var T_FAKE_CHAT = {id: -1009990001, title: 'Тех вопросы TEST', type: 'supergroup'};

function test_all() {
  return [test_guard(), test_stage6(), test_issues(), test_issuesBridgeHook(), test_bookings(), test_keyholders(), test_timesheet()]
    .map(function (r) { return r.status; });
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
    return {handled: r, morning: ISS.issuesDigest_('morning'), evening: ISS.issuesDigest_('evening')};
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

/** Stage 5: timesheet dry run + "draft" (stub, not created) for 21.08–20.09.2026. */
function test_timesheet() {
  return T_fixture_('timesheet', 'ST5.dryRun + createTimesheetDraft(stub)', function () {
    var r = ST5.dryRun();
    return {subject: r.subject, warnings: r.warnings, people: (r.csv || '').split('\n').length - 1, draft: ST5.createTimesheetDraft()};
  });
}
