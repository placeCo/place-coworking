const fs=require('fs'), vm=require('vm'), assert=require('assert');
const H='/workspace/place-coworking/place-coworking/docs/ops/handover/';
const REAL=require(process.env.BK_TABS_JSON || '/tmp/tabs.json');
function fmt(d,tz,f){const p=new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);const g=t=>p.find(x=>x.type===t).value;return f.replace('yyyy',g('year')).replace('MM',g('month')).replace('dd',g('day'));}
function sheet(rows){return {getDataRange:()=>({getDisplayValues:()=>rows}),getLastRow:()=>rows.length,getRange:(r,c,n,m)=>({getDisplayValues:()=>rows.slice(r-1,r-1+n).map(x=>{const y=x.slice(c-1,c-1+m);while(y.length<m)y.push('');return y;})})};}
function mkCtx(book,props,openThrows){
  const ctx={Utilities:{formatDate:fmt},Logger:{log(){}},
    PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]===undefined?null:props[k]})},
    SpreadsheetApp:{openById:id=>{if(openThrows)throw new Error(openThrows);return {getSheetByName:n=>{const v=book[n];if(v===undefined)return null;if(v==='THROW')return {getDataRange:()=>{throw new Error('Service Spreadsheets timed out')},getLastRow:()=>{throw new Error('Service Spreadsheets timed out')}};return sheet(v);}};}}};
  vm.createContext(ctx); vm.runInContext(fs.readFileSync(H+'bookings-today.gs','utf8'),ctx); return ctx;}
const NOW=new Date('2026-10-10T10:10:00+07:00');
let pass=0, fail=0; function t(name,fn){try{fn();pass++;console.log('PASS',name)}catch(e){fail++;console.log('FAIL',name,'\n ',e.message)}}
const clone=x=>JSON.parse(JSON.stringify(x));
const ALL8=['Meeting room','1 floor','4 floor','ART Room ','Workshop room','Office room-4 (GREEN)','6 floor','Library'];
const OK5=['Meeting room','1 floor','4 floor','ART Room ','6 floor'];
let out;
t('1 real sheet, default 8 tabs (prod BK_TABS): no «none», Workshop/GREEN/Library reported', ()=>{
  const c=mkCtx(REAL,{}); out=c.bookingsToday_(NOW); console.log(out.replace(/^/gm,'    | '));
  assert(!/none/.test(out)); assert(/^📅 Bookings 10\.10\n/.test(out));
  assert(/⚠️ не смог прочитать Workshop room: нет колонки для 10\.10 \(сетка до 01\.01\.2026\)/.test(out));
  assert(/⚠️ не смог прочитать Office room-4 \(GREEN\): нет колонки для 10\.10 \(сетка до 02\.12\.2025\)/.test(out));
  assert(/⚠️ не смог прочитать Library: нет колонки для 10\.10 \(сетка до 30\.09\.2026\)/.test(out));
  assert(/read OK, empty: Meeting room, 1 floor, 4 floor, ART Room, 6 floor/.test(out)); });
t('2 real sheet, 5 tabs with October, all empty → «: none»', ()=>{
  out=mkCtx(REAL,{BOOKING_TABS:JSON.stringify(OK5)}).bookingsToday_(NOW); console.log('    | '+out); assert.strictEqual(out,'📅 Bookings 10.10: none'); });
t('3 Patrik typed into Meeting room ABH15 (15:00) → listed', ()=>{
  const b=clone(REAL); const r=b['Meeting room']; const col=r[3].indexOf('Sat 10/10',700); while(r[14].length<=col)r[14].push(''); r[14][col]='Patrik 15:00-16:00';
  out=mkCtx(b,{BOOKING_TABS:JSON.stringify(OK5)}).bookingsToday_(NOW); console.log('    | '+out); assert.strictEqual(out,'📅 Bookings 10.10\nMeeting room: 15:00 Patrik 15:00-16:00'); });
t('4 openById throws → sheet-level failure, no «none»', ()=>{
  out=mkCtx(REAL,{},'You do not have permission to access the requested document.').bookingsToday_(NOW); console.log('    | '+out.replace(/\n/g,'\n    | '));
  assert.strictEqual(out,'📅 Bookings 10.10\n⚠️ не смог прочитать Events and booking: ошибка: You do not have permission to access the requested document.'); });
t('5 missing tab + tab read throws + short header', ()=>{
  const b={'Meeting room':REAL['Meeting room'],'1 floor':'THROW','4 floor':[['x'],['y']]};
  out=mkCtx(b,{BOOKING_TABS:JSON.stringify(['Meeting room','1 floor','4 floor','ART Room '])}).bookingsToday_(NOW); console.log('    | '+out.replace(/\n/g,'\n    | '));
  assert(!/none/.test(out)); assert(/не смог прочитать 1 floor: ошибка: Service Spreadsheets timed out/.test(out));
  assert(/не смог прочитать 4 floor: нет строки заголовка 4/.test(out)); assert(/не смог прочитать ART Room: вкладка не найдена/.test(out)); assert(/read OK, empty: Meeting room$/m.test(out)); });
t('6 header row with no dates', ()=>{ out=mkCtx({'X':[[''],[''],[''],['Time','foo','bar'],['09:00','a']]},{BOOKING_TABS:'["X"]'}).bookingsToday_(NOW);
  assert.strictEqual(out,'📅 Bookings 10.10\n⚠️ не смог прочитать X: нет колонки для 10.10 (в строке 4 нет дат)'); });
const HDR=['created_ict','date','start','end','room','name_contact','by','raw_text','status'];
t('7 bookingsJob_: «Брони бот» rows today (yyyy-MM-dd and dd.MM.yyyy), cancelled and other dates skipped', ()=>{
  const b=clone(REAL); b['Брони бот']=[HDR,['2026-10-10 09:50:00','2026-10-10','15:00','16:00','Meeting room','Patrik','Geo','бронь переговорка 15:00-16:00 Patrik','new'],
    ['x','10.10.2026','12:00','13:00','Podcast','Oleg','','','cancelled'],['x','2026-10-16','16:30','17:30','Meeting room','Ido Gonen','','','new'],['x','10.10.2026','09:00','10:00','Library','Anna','','','']];
  out=mkCtx(b,{BOOKING_TABS:JSON.stringify(OK5)}).bookingsJob_(NOW); console.log('    | '+out.replace(/\n/g,'\n    | '));
  assert.strictEqual(out,'📅 Bookings 10.10\n🤖 Брони бот (not in the grid yet): 09:00–10:00 Library — Anna (new); 15:00–16:00 Meeting room — Patrik (new)'); });
t('8 bookingsJob_: no «Брони бот» tab yet → not a failure, «none» allowed', ()=>{
  out=mkCtx(REAL,{BOOKING_TABS:JSON.stringify(OK5)}).bookingsJob_(NOW); assert.strictEqual(out,'📅 Bookings 10.10: none'); });
t('9 bookingsJob_: «Брони бот» read error → failure', ()=>{
  const b=clone(REAL); b['Брони бот']='THROW'; out=mkCtx(b,{BOOKING_TABS:JSON.stringify(OK5)}).bookingsJob_(NOW);
  assert.strictEqual(out,'📅 Bookings 10.10\n⚠️ не смог прочитать Брони бот: ошибка: Service Spreadsheets timed out\nread OK, empty: Meeting room, 1 floor, 4 floor, ART Room, 6 floor'); });
t('10 bookingsToday_ ignores «Брони бот» (StaffCommands /bookings appends it itself → no duplicates)', ()=>{
  const b=clone(REAL); b['Брони бот']=[HDR,['x','2026-10-10','15:00','16:00','Meeting room','Patrik','','','new']];
  assert.strictEqual(mkCtx(b,{BOOKING_TABS:JSON.stringify(OK5)}).bookingsToday_(NOW),'📅 Bookings 10.10: none'); });
t('11 16.10: Ido Gonen not in ABN (it is in 09.10) → none for Meeting room; 09.10 shows it', ()=>{
  const c=mkCtx(REAL,{BOOKING_TABS:'["Meeting room"]'});
  assert.strictEqual(c.bookingsToday_(new Date('2026-10-16T10:07:00+07:00')),'📅 Bookings 16.10: none');
  assert(/16:30 Ido Gonen/.test(c.bookingsToday_(new Date('2026-10-09T10:07:00+07:00')))); });
t('12 day boundary in ICT: 00:05 ICT 10.10 (=17:05Z 09.10) → 10.10', ()=>{
  assert(/^📅 Bookings 10\.10/.test(mkCtx(REAL,{BOOKING_TABS:'["Meeting room"]'}).bookingsToday_(new Date('2026-10-09T17:05:00Z')))); });
t('13 bkDateCols_: January columns after «Jan\\n2026» marker are 2026 (not 2027); October 2026 → ABH', ()=>{
  const c=mkCtx(REAL,{}); const m=c.bkDateCols_(REAL['Meeting room'][3],2026).map; const hdr=REAL['Meeting room'][3];
  const jan=Object.keys(m).filter(k=>/^\d+-1-15$/.test(k)); assert(jan.includes('2026-1-15'), JSON.stringify(jan)); assert(!jan.includes('2028-1-15'));
  assert.strictEqual(hdr[m['2026-10-10']],'Sat 10/10'); assert.strictEqual(hdr[m['2026-10-16']],'Fri 16/10'); assert.strictEqual(hdr[m['2026-12-31']]||'', hdr[m['2026-12-31']]||''); });
t('14 TEST module 30-Bookings.gs + job_bookings (95-Scheduled.gs) relays bookingsJob_ text', ()=>{
  const b=clone(REAL); b['Брони бот']=[HDR,['x','2026-10-10','15:00','16:00','Meeting room','Patrik','','','new']];
  const base=mkCtx(b,{});const sent=[];
  const ctx={Utilities:{formatDate:fmt},T_props_:()=>({getScriptProperties:()=>({getProperty:k=>({BOOKING_TABS:JSON.stringify(OK5.concat(['Library']))})[k]||null})}),
    T_SS:base.SpreadsheetApp,T_GMAIL:{},T_MAIL:{},T_FETCH:{},T_SCRIPT:{},T_LOGGER:{log(){}},
    T_job_:(a,b2,c2,fn)=>fn(),T_relay_:(w,x)=>sent.push([w,x]),Date};
  vm.createContext(ctx); vm.runInContext(fs.readFileSync(H+'test-project/30-Bookings.gs','utf8'),ctx);
  const sch=fs.readFileSync(H+'test-project/95-Scheduled.gs','utf8'); const fnsrc=sch.match(/function job_bookings\(\)[\s\S]*?\n}\n/)[0];
  vm.runInContext(fnsrc,ctx); vm.runInContext('Date = function(){ return arguments.length? new (Function.prototype.bind.apply(globalThis.__D,[null].concat([].slice.call(arguments)))) : new globalThis.__D("2026-10-10T10:10:00+07:00"); }',Object.assign(ctx,{__D:global.Date}));
  out=ctx.job_bookings(); console.log('    | '+out.replace(/\n/g,'\n    | '));
  assert.strictEqual(sent.length,1); assert.strictEqual(sent[0][0],'PLACE Team, 10:07'); assert(!/none/.test(out));
  assert(/🤖 Брони бот \(not in the grid yet\): 15:00–16:00 Meeting room — Patrik \(new\)/.test(out)); assert(/не смог прочитать Library: нет колонки для 10\.10 \(сетка до 30\.09\.2026\)/.test(out)); });
t('15 bundle parses; 00-TestConfig sched profile uses T_BOOKING_TABS_SCHED incl. Library; fixture profile unchanged', ()=>{
  new Function(fs.readFileSync(H+'test-project/PLACE-automations-TEST.bundle.gs','utf8'));
  const cfg=fs.readFileSync(H+'test-project/00-TestConfig.gs','utf8');
  assert(/BKG: \{EVENTS_SHEET_ID: T_IDS\.events, BOOKING_TABS: T_BOOKING_TABS\}/.test(cfg)); assert(/BKG: \{EVENTS_SHEET_ID: P_IDS\.events, BOOKING_TABS: T_BOOKING_TABS_SCHED\}/.test(cfg)); });
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail?1:0);
