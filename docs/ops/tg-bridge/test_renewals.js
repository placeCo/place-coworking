// Offline tests for Renewals.gs (no network). Run: node test_renewals.js
// Optional dry run on a sheet export: RN_ROWS=/path/rows.json RN_DAYS=2026-10-16,2026-10-18 node test_renewals.js
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const tmp = path.join(os.tmpdir(), 'rn_' + process.pid + '.js');
fs.copyFileSync(path.join(__dirname, 'Renewals.gs'), tmp);
const R = require(tmp);
let pass = 0, fail = 0;
function ok(c, n) { if (c) pass++; else { fail++; console.log('FAIL ' + n); } }

const H = ['', 'Name', 'Type', 'Floor', 'Start', 'Finish', 'Contact', 'H', '', ''];
const rows = [H,
  ['3rd floor', 'Anna Four', '1 month', '3rd floor', '2026-09-20', '2026-10-20', '+66812345678', '', '', ''],   // d4 on 16.10
  ['', 'Bob Three', '1 week', '3rd floor', '2026-10-12', '2026-10-19', '', '', '', ''],                        // d3
  ['', 'Cara One', '1 month', '1st floor', '2026-09-17', '2026-10-17', '', '', '', ''],                        // d1, H empty
  ['', 'Dan One', '1 month', '1st floor', '2026-09-17', '2026-10-17', '', 'Extend', '', ''],                   // d1, H filled
  ['', 'Eve Old', '1 month', '1st floor', '2026-09-09', '2026-10-09', '', '', '', ''],                         // dm7
  ['5th floor', 'Bamboo', 'Office room', '5th floor', '2026-09-20', '2026-10-20', '', '', '', '']];          // office d4
const T = '2026-10-16';
const c = R.rnCollect_(rows, T);
ok(c.d4.length === 2 && c.d3.length === 1 && c.d1.length === 2 && c.esc.length === 1 && c.esc[0].name === 'Cara One', 'buckets');
ok(c.dm7.length === 1 && c.offices.length === 0, 'dm7/offices');
const none = () => false;
let p = R.rnPlan_(c, none, '');
const lab = p.msgs.map(m => m.label);
ok(lab.filter(l => l === 'team d4').length === 1, 'team d4 one post, office excluded');
ok(lab.includes('team d3') && lab.includes('team d1'), 'team d3 + d1');
ok(lab.filter(l => l === 'lena').length === 1 && !lab.includes('george'), 'lena yes, george no');
ok(p.warns.length === 1 && /WARN RN_NO_GEORGE_CHAT_ID/.test(p.warns[0]), 'george warn');
ok(lab.filter(l => /^admin/.test(l)).length === 2, 'admin DMs kept');
const t4 = p.msgs.find(m => m.label === 'team d4').text;
ok(t4 === 'Renewal check: Anna Four (1 month) ends on 20.10. Please ask the guest if they will renew and write the answer in column H of Resident info (Extend / Not extend). Thank you!\nเช็คการต่ออายุ: Anna Four (1 month) หมดวันที่ 20.10 กรุณาถามลูกค้าว่าจะต่อหรือไม่ แล้วกรอกคำตอบในคอลัมน์ H ของ Resident info (Extend / Not extend) ขอบคุณค่ะ', 'team text verbatim');
ok(!/฿|\+66/.test(p.msgs.filter(m => m.to === '-1003641241156').map(m => m.text).join()), 'team: no prices/contacts');
ok(/ends tomorrow, 17\.10\. Column H is still empty/.test(p.msgs.find(m => m.label === 'team d1').text), 'd1 text');
ok(/Bamboo/.test(p.msgs.find(m => m.label === 'lena').text), 'lena sees office');
p = R.rnPlan_(c, none, '555');
ok(p.msgs.find(m => m.label === 'george' && m.to === '555' && /Cara One/.test(m.text) && !/Dan One/.test(m.text)), 'george DM only H empty');
ok(p.warns.length === 0, 'no warn with id');
// dedupe: mark everything -> nothing
const sent = {}; p.msgs.forEach(m => m.keys.forEach(k => sent[k] = T));
ok(R.rnPlan_(c, k => !!sent[k], '555').msgs.length === 0, 'dedupe all');
// next day: Anna moves d4->d3 = new stage -> sent again; Bob d3->? none
const c2 = R.rnCollect_(rows, '2026-10-17');
const p2 = R.rnPlan_(c2, k => !!sent[k], '555');
ok(p2.msgs.some(m => m.label === 'team d3' && /Anna Four/.test(m.text)), 'next stage sends');
// same day rerun with new row -> only new guest
const rows3 = rows.concat([['3rd floor', 'Fay New', '1 month', '3rd floor', '2026-09-20', '2026-10-20', '', '', '', '']]);
const p3 = R.rnPlan_(R.rnCollect_(rows3, T), k => !!sent[k], '555');
ok(p3.msgs.filter(m => /^team/.test(m.label)).length === 1 && /Fay New/.test(p3.msgs[0].text), 'only new guest');
ok(p3.msgs.filter(m => /^admin/.test(m.label)).length === 0, 'Fay d4 -> no admin digest');
// key format / hash
const k = R.rnKey_('team', 'd3', {name: ' Bob  Three', finish: '2026-10-19'});
ok(k === R.rnKey_('team', 'd3', {name: 'bob three', finish: '2026-10-19'}) && /^RN_S_team_d3_[0-9a-f]{8}_20261019$/.test(k), 'key stable');
ok(R.rnHash_('Anna') !== R.rnHash_('Anne'), 'hash differs');
// cleanup
const old = R.rnOldKeys_(['RN_S_team_d3_aaaaaaaa_20260901', 'RN_S_team_d3_aaaaaaaa_20261010', 'GEORGE_CHAT_ID', 'RN_LAST_SENT_DATE'], T);
ok(old.length === 1 && old[0].endsWith('20260901'), 'cleanup');
// dates
ok(R.rnResolveDates_('2026-12-22', '2026-01-21', T).finish === '2027-01-21', 'new year fix');
ok(R.rnResolveDates_('2526-06-09', '2026-07-08', T).start === '2026-06-09', 'absurd start year fixed');
ok(R.rnResolveDates_('2024-11-18', '2014-12-17', T).finish === '2014-12-17', 'old typo row stays old (no false hit)');
ok(R.rnResolveDates_('9.10', '20.10', T).finish === '2026-10-20', 'text date infer');
ok(R.rnResolveDates_('', '2026-10-20', T).finish === '2026-10-20', 'no start');

console.log('tests: ' + pass + ' passed, ' + fail + ' failed');

if (process.env.RN_ROWS) {
  const data = JSON.parse(fs.readFileSync(process.env.RN_ROWS, 'utf8'));
  (process.env.RN_DAYS || T).split(',').forEach(d => {
    const cc = R.rnCollect_(data, d), pp = R.rnPlan_(cc, () => false, process.env.RN_GEORGE || '');
    console.log('\n===== DRY RUN ' + d + ' : d4=' + cc.d4.length + ' d3=' + cc.d3.length + ' d1=' + cc.d1.length + ' esc=' + cc.esc.length + ' d0=' + cc.d0.length + ' dm7=' + cc.dm7.length + ' offices=' + cc.offices.length);
    pp.warns.forEach(w => console.log(w));
    pp.msgs.forEach(m => console.log('--> ' + m.label + ' [' + m.to + ']\n' + m.text + '\n'));
    if (!pp.msgs.length) console.log('RN_NOTHING_TO_SEND');
  });
}
fs.unlinkSync(tmp);
process.exit(fail ? 1 : 0);
