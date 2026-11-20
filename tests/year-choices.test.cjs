const {test}=require('node:test');
const assert=require('node:assert/strict');
const Y=require('../year-engine'),C=require('../year-choices'),B=require('../characters');
function empty(){const b=Y.defaults();for(const key of ['income','fixed','consumption','saving','goals','insurance'])b[key]=[];b.initial={checking:0,reserve:0,future:0};return b;}
test('štyri ročné nákupy sú voľby, sedem ostáva podľa nastavenia a január sa nemení',()=>{
 const b=B.budgetFor('ferko',1600,1000,50),original=B.scenario(b,4,71),copy=structuredClone(original),run=C.prepare(original);
 assert.deepEqual(original,copy);assert.equal(C.prepare(run),run);
 assert.equal(run.events.filter(e=>e.decision==='pending').length,4);
 assert.equal(run.events.filter(e=>e.type==='deviation'&&e.date.slice(5,7)!=='01').length,7);
 assert.deepEqual(run.events.filter(e=>e.date.slice(5,7)==='01'),original.events.filter(e=>e.date.slice(5,7)==='01'));
 assert.deepEqual(run.events.filter(e=>!e.decision),original.events.filter(e=>!run.events.find(r=>r.id===e.id)?.decision));
 const disciplined=C.prepare(B.scenario(b,6,71));assert.ok(disciplined.events.filter(e=>e.type==='deviation').every(e=>e.amount===0));
 assert.deepEqual(disciplined.events.filter(e=>e.decision).map(e=>e.id),run.events.filter(e=>e.decision).map(e=>e.id));
 assert.deepEqual(C.reset(run),original);
});
test('ponuka sleduje účet, kúpa z rezervy je viditeľná a nedostatok kúpu nepovolí',()=>{
 assert.equal(C.offer({checking:120000,reserve:0}).amount,1200);
 assert.equal(C.offer({checking:60000,reserve:0}).amount,600);
 const item=C.offer({checking:1000,reserve:100000});assert.equal(item.amount,50);assert.equal(item.reserveDraw,4000);assert.equal(item.afterChecking,0);assert.equal(item.afterReserve,96000);
 const own=C.offer({checking:16128,reserve:82400});assert.equal(own.afterChecking,11128);assert.equal(own.afterReserve,82400);assert.equal(own.reserveDraw,0);
 assert.equal(C.offer({checking:0,reserve:0}).canBuy,false);
});

test('štyri rozhodnutia sa neopakujú ani pri rovnakej cenovej hladine a odmietnutiach',()=>{
 for(const checking of [10000,60000,120000]){
  let run={year:2027,seed:77,events:Array.from({length:4},(_,i)=>({id:'pick-'+i,date:`2027-0${i+2}-14`,type:'choice',decision:'pending',amount:0}))};
  const shown=[];
  for(let i=0;i<4;i++){
   const event=run.events[i],snapshot={date:event.date,checking,reserve:100000,future:0};
   const item=C.offer(snapshot,run,event.id);assert.equal(C.offer(snapshot,run,event.id).id,item.id);shown.push(item.id);
   run=C.purchase(run,event.id,false,snapshot);assert.equal(run.events[i].offerId,item.id);
  }
  assert.equal(new Set(shown).size,4);
 }
});

test('väčší buffer prinesie aj TV, mobil a dovolenku, chránená budúcnosť cenu ponuky nenafukuje',()=>{
 assert.equal(C.offer({checking:0,reserve:600000,future:0}).amount,1200);
 assert.equal(C.offer({checking:0,reserve:180000,future:0}).amount,450);
 assert.equal(C.offer({checking:0,reserve:0,future:10000000}).amount,50);
 let run={seed:9,events:Array.from({length:4},(_,i)=>({id:'choice-'+i,date:`2027-0${i+2}-14`,type:'choice',decision:'pending',amount:0}))};const prices=[];
 for(const event of run.events){const snapshot={date:event.date,checking:0,reserve:600000,future:0};const item=C.offer(snapshot,run,event.id);prices.push(item.amount);assert.equal(item.reserveDraw,item.amount*100);run=C.purchase(run,event.id,false,snapshot);}
 assert.deepEqual(prices,[1200,600,450,1200]);
 assert.ok(C.offers.some(e=>e.id==='friends-holiday'&&e.amount===450));
});

test('plná rezerva sa riadi výdavkami, nepýta sa pri dlhu, nule ani bez ďalších vkladov',()=>{
 const b=empty();b.income=[{name:'Mzda',amount:2000}];b.fixed=[{name:'Bývanie',amount:1000}];b.saving=[{name:'Rezerva',amount:1000}];b.initial.reserve=3000;
 const run={year:2027,events:[]},p=Y.simulate(b,run);
 assert.equal(p.monthlyExpenses,100000);assert.equal(C.reserveMonth(p,run),1);
 assert.equal(C.timeline(p,run,1).at(-1).checkpoint.kind,'reserve');
 const indebted={...p,days:p.days.map(d=>({...d,debtRemaining:100}))};assert.equal(C.reserveMonth(indebted,run),-1);
 assert.equal(C.reserveMonth({...p,monthlyExpenses:0},run),-1);assert.equal(C.reserveMonth({...p,monthlyReserveSaving:0},run),-1);
 const snapshot=p.days.find(d=>d.date==='2027-02-28');assert.equal(C.directReserve(run,snapshot,101,p.monthlyExpenses),run);
 const chosen=C.directReserve(run,snapshot,50,p.monthlyExpenses);assert.equal(C.reserveMonth(p,chosen),-1);assert.equal(C.reset(chosen).reservePlan,undefined);
});

test('presmerovanie mení iba ďalšie vklady a limit šiestich mesiacov presúva iba nové peniaze',()=>{
 const b=empty();b.income=[{name:'Mzda',amount:2000}];b.fixed=[{name:'Bývanie',amount:1000}];b.saving=[{name:'Rezerva',amount:1000}];b.initial.reserve=3000;
 const run={year:2027,events:[]},before=Y.simulate(b,run),snapshot=before.days.find(d=>d.date==='2027-02-28');
 for(const [share,expectedReserve,expectedFuture] of [[100,500000,1000000],[0,600000,900000]]){
  const chosen=C.directReserve(run,snapshot,share,before.monthlyExpenses),after=Y.simulate(b,chosen);
  assert.deepEqual(after.ledger.filter(e=>e.date<=snapshot.date),before.ledger.filter(e=>e.date<=snapshot.date));
  assert.equal(after.final.reserve-after.reserveBonus,expectedReserve);assert.equal(after.final.future,expectedFuture);
  assert.equal(after.final.checking+after.final.reserve+after.final.future,1500000+after.reserveBonus);
  assert.ok(after.ledger.filter(e=>e.type==='transfer'&&e.target==='reserve'&&e.date>snapshot.date).every(e=>e.reserve<=600000));
 }
 const allocation=Y.reserveAllocation(b,{share:0,expenseBase:100000},{reserve:800000});assert.equal(allocation.reserve,0);assert.equal(allocation.extraFuture,100000);
 const split=Y.reserveAllocation(b,{share:70,expenseBase:100000},snapshot);assert.equal(split.reserve,30000);assert.equal(split.future,70000);
});
test('áno zaúčtuje nákup presne raz, nie nič nestrhne a ďalší pokus vráti pôvodné otázky',()=>{
 const b=empty();b.income=[{name:'Mzda',amount:1600}];
 const run={year:2027,interactive:true,events:[{id:'pick',date:'2027-03-14',type:'choice',amount:0,decision:'pending',choiceBase:{id:'pick',date:'2027-03-14',type:'deviation',amount:100}}]};
 const p=Y.simulate(b,run),snapshot=p.ledger.find(e=>e.eventId==='pick');
 const accepted=C.purchase(run,'pick',true,snapshot),result=Y.simulate(b,accepted);
 assert.equal(result.final.available,p.final.available-120000);
 assert.equal(result.ledger.filter(e=>e.eventId==='pick').length,1);assert.equal(C.purchase(accepted,'pick',true,snapshot),accepted);
 assert.equal(Y.simulate(b,C.purchase(run,'pick',false,snapshot)).final.available,p.final.available);
 assert.equal(C.purchase(run,'pick',true,{...snapshot,date:'2027-03-15'}),run);
 assert.equal(C.purchase(run,'pick',true,{...snapshot,checking:0,reserve:0}),run);
 assert.equal(C.reset(accepted).events[0].type,'deviation');assert.equal(C.reset(accepted).events[0].amount,100);
});
test('pôžička príde na účet, platí sa od ďalšieho mesiaca a čistý výsledok obsahuje cenu dlhu',()=>{
 const b=empty();b.initial.checking=100;
 const base={year:2027,events:[{id:'repair',date:'2027-02-10',name:'Oprava',type:'life',amount:400}]};
 const before=Y.simulate(b,base),snapshot=before.ledger.find(e=>e.available<0),run=C.rescue(base,'loan',snapshot),p=Y.simulate(b,run);
 assert.equal(run.rescue.principal,500);assert.equal(p.loanBorrowed,50000);assert.equal(p.extra,0);
 const credit=p.ledger.find(e=>e.type==='loan');assert.equal(credit.reserve,0);assert.equal(credit.checking,snapshot.checking+50000);
 const payments=p.ledger.filter(e=>e.type==='loanPayment');assert.equal(payments.length,10);assert.equal(payments[0].date,'2027-03-02');
 assert.equal(p.loanPaid,-payments.reduce((n,e)=>n+e.amount,0));assert.equal(p.debtRemaining,run.rescue.total-p.loanPaid);
 assert.equal(p.final.available-before.final.available,p.loanBorrowed-p.loanPaid);
 assert.equal(p.final.netAvailable-before.final.available,-p.loanCost);
 assert.equal(p.ledger.filter(e=>e.type==='loan').length,1);assert.equal(C.rescue(run,'loan',snapshot),run);
 assert.equal(Y.simulate(b,run,{plan:true}).loanBorrowed,0);
});
test('decembrová pôžička má celý dlh aj splátky za hranicou zobrazeného roka',()=>{
 const b=empty(),base={year:2027,events:[{id:'repair',date:'2027-12-21',name:'Oprava',type:'life',amount:100}]};
 const snapshot=Y.simulate(b,base).ledger.find(e=>e.available<0),run=C.rescue(base,'loan',snapshot),p=Y.simulate(b,run);
 assert.equal(p.loanPaid,0);assert.equal(p.debtRemaining,run.rescue.total);assert.equal(p.final.netAvailable,-10000-p.loanCost);
});

test('mínus sa ponúkne po použití vlastnej rezervy a pôžička ju znovu nenaplní',()=>{
 const b=empty();b.initial={checking:100,reserve:100,future:0};
 const base={year:2027,events:[{id:'repair',date:'2027-02-10',name:'Oprava',type:'life',amount:400}]};
 const snapshot=C.timeline(Y.simulate(b,base),base,1).find(p=>p.checkpoint?.kind==='rescue');
 assert.equal(snapshot.reserve,0);assert.equal(snapshot.checking,-20000);
 const p=Y.simulate(b,C.rescue(base,'loan',snapshot)),credit=p.ledger.find(e=>e.type==='loan');
 assert.equal(credit.reserve,0);assert.equal(credit.checking,20000);assert.equal(p.final.reserve,0);
});
test('desaťpercentné zníženie zmení iba budúce radosti a automatické nákupy, nie minulosť či potreby',()=>{
 const b=empty();b.consumption=[{id:'food',name:'Potraviny',amount:100},{id:'outside',name:'Jedlo vonku',amount:100}];
 const base={year:2027,events:[{id:'past',date:'2027-02-09',type:'deviation',name:'Nákup',amount:10},{id:'next',date:'2027-02-11',type:'deviation',name:'Nákup',amount:10}]};
 const original=Y.simulate(b,base),snapshot={date:'2027-02-10',checking:-100,available:-100,reserve:0,future:0},run=C.rescue(base,'cut',snapshot),p=Y.simulate(b,run);
 assert.deepEqual(p.ledger.filter(e=>e.date<='2027-02-10'),original.ledger.filter(e=>e.date<='2027-02-10'));
 assert.equal(p.ledger.find(e=>e.eventId==='past').amount,-1000);assert.equal(p.ledger.find(e=>e.eventId==='next').amount,-900);
 for(const [id,total] of [['food',10000],['outside',9000]])assert.equal(-p.ledger.filter(e=>e.type==='daily'&&e.categoryId===id&&e.date.startsWith('2027-03')).reduce((n,e)=>n+e.amount,0),total);
 assert.equal(p.firstDeficit,original.firstDeficit);assert.equal(p.loanBorrowed,0);assert.equal(p.deviation,1900);
});
test('časová os zastaví pred nerozhodnutým nákupom a pri prvom mínuse; dokončenie nič nekúpi ani nepožičia',()=>{
 const b=empty();b.initial.checking=30;
 const run={year:2027,interactive:true,events:[{id:'pick',date:'2027-02-14',type:'choice',amount:0,decision:'pending'},{id:'repair',date:'2027-02-20',name:'Oprava',type:'life',amount:100}]};
 const p=Y.simulate(b,run),points=C.timeline(p,run,1),checkpoints=points.filter(p=>p.checkpoint);
 assert.deepEqual(checkpoints.map(p=>[p.checkpoint.kind,p.date]),[['purchase','2027-02-14'],['rescue','2027-02-20']]);
 assert.equal(checkpoints[0].checking,3000);assert.equal(checkpoints[1].checking,-7000);
 const accepted=C.purchase(run,'pick',false,checkpoints[0]),rest=C.timeline(Y.simulate(b,accepted),accepted,1,checkpoints[0]);
 assert.equal(rest.filter(p=>p.checkpoint?.kind==='purchase').length,0);assert.ok(rest[1].date>=checkpoints[0].date);
 const finished=C.finish(run),result=Y.simulate(b,finished);assert.equal(result.final.available,p.final.available);assert.equal(result.loanBorrowed,0);
 assert.equal(finished.events.filter(e=>e.decision==='pending').length,0);assert.equal(C.timeline(result,finished,1).filter(p=>p.checkpoint).length,0);
});

test('kríza vyžaduje tri po sebe idúce mesačné konce pod mínus tisíc, prerušenie sériu zruší',()=>{
 const projection=values=>({days:values.map((available,month)=>({month,available}))});
 assert.equal(C.crisisMonth(projection([-100000,-100000,-100000]),{}),2);
 assert.equal(C.crisisMonth(projection([-100001,0,-100001,-100001,-99999,-100001,-100001,-100001]),{}),7);
 assert.equal(C.crisisMonth(projection(Array(12).fill(200000)),{}),-1);
 assert.equal(C.crisisMonth(projection(Array(12).fill(-99999)),{}),-1);
 assert.equal(C.crisisMonth(projection(Array(12).fill(-200000)),{crisis:{date:'2027-03-31'}}),-1);
});

test('úsporný režim nemení minulé mínus, zníži len budúce radosti a zastaví nákupy navyše',()=>{
 const b=empty();b.initial.checking=-2000;b.consumption=[{id:'food',name:'Potraviny',amount:100},{id:'outside',name:'Jedlo vonku',amount:100},{id:'leisure',name:'Voľný čas',amount:100}];
 const run={year:2027,interactive:true,rescue:{kind:'none'},events:[{id:'auto',date:'2027-04-14',type:'deviation',name:'Nákup',amount:100},{id:'pick',date:'2027-05-14',type:'choice',decision:'pending',amount:0},{id:'life',date:'2027-06-14',type:'life',name:'Oprava',amount:500}]};
 const p=Y.simulate(b,run),points=C.timeline(p,run,2),checkpoint=points.at(-1);assert.equal(checkpoint.checkpoint.kind,'crisis');assert.equal(checkpoint.date,'2027-03-31');
 const updated=C.activateCrisis(run,{...checkpoint,available:checkpoint.checking+checkpoint.reserve}),after=Y.simulate(b,updated);
 assert.deepEqual(after.ledger.filter(e=>e.date<='2027-03-31'),p.ledger.filter(e=>e.date<='2027-03-31'));
 for(const [id,total] of [['food',10000],['outside',3000],['leisure',3000]])assert.equal(-after.ledger.filter(e=>e.type==='daily'&&e.categoryId===id&&e.date.startsWith('2027-04')).reduce((n,e)=>n+e.amount,0),total);
 assert.equal(after.ledger.find(e=>e.eventId==='auto').amount,0);assert.equal(after.ledger.find(e=>e.eventId==='life').amount,-50000);
 assert.equal(updated.events.find(e=>e.id==='pick').decision,'pending');
 const temptation=C.timeline(after,updated,4).find(p=>p.checkpoint?.kind==='purchase');assert.ok(temptation);assert.equal(temptation.checking<0,true);
 assert.equal(C.purchase(updated,'pick',true,temptation),updated);
 const declined=C.purchase(updated,'pick',false,temptation);assert.equal(declined.events.find(e=>e.id==='pick').decision,'declined');assert.equal(Y.simulate(b,declined).final.available,after.final.available);
 assert.deepEqual(C.crisisPlan(b,run),{before:20000,after:6000});assert.ok(after.final.available>p.final.available);assert.ok(after.final.available<0);
 const finished=C.finish(run,p);assert.equal(finished.crisis.date,'2027-03-31');assert.equal(C.reset(updated).crisis,undefined);
});

test('turbo sa ponúkne až po troch ukončených mesiacoch úsporného režimu a iba pri mínuse',()=>{
 const b=empty();b.initial.checking=-2000;const run={year:2027,events:[],rescue:{kind:'none'},crisis:{date:'2027-03-31',joyFactor:.3}},p=Y.simulate(b,run);
 assert.equal(C.turboMonth(p,run),5);
 for(const month of [3,4])assert.equal(C.timeline(p,run,month).filter(p=>p.checkpoint?.kind==='turbo').length,0);
 const checkpoint=C.timeline(p,run,5).at(-1);assert.equal(checkpoint.checkpoint.kind,'turbo');assert.equal(checkpoint.date,'2027-06-30');
 assert.equal(C.activateTurbo(run,p.days.find(d=>d.date==='2027-05-31')),run);
 assert.equal(C.activateTurbo(run,{...checkpoint,checking:0,reserve:0,available:0}),run);
 const healthy={...p,days:p.days.map(d=>({...d,available:100}))};assert.equal(C.turboMonth(healthy,run),-1);
 assert.equal(C.turboMonth(p,{...run,crisis:{date:'2027-10-31'}}),-1);
});

test('turbo zastaví až ďalšie plánované radosti, zachová minulosť, potreby aj dobrovoľné ponuky',()=>{
 const b=empty();b.initial.checking=-2000;b.consumption=[{id:'food',name:'Potraviny',amount:100},{id:'leisure',name:'Voľný čas',amount:100}];
 const run={year:2027,events:[{id:'pick',date:'2027-08-14',type:'choice',decision:'pending',amount:0}],rescue:{kind:'none'},crisis:{date:'2027-03-31',joyFactor:.3}},before=Y.simulate(b,run),snapshot=before.days.find(d=>d.date==='2027-06-30');
 const updated=C.activateTurbo(run,snapshot),after=Y.simulate(b,updated);
 assert.deepEqual(after.ledger.filter(e=>e.date<=snapshot.date),before.ledger.filter(e=>e.date<=snapshot.date));
 assert.equal(after.ledger.filter(e=>e.type==='daily'&&e.categoryId==='leisure'&&e.date>'2027-06-30').length,0);
 assert.equal(after.ledger.filter(e=>e.type==='daily'&&e.categoryId==='food'&&e.date.startsWith('2027-07')).reduce((sum,e)=>sum-e.amount,0),10000);
 assert.equal(after.final.available-before.final.available,18000);assert.equal(after.loanBorrowed,0);
 assert.equal(C.timeline(after,updated,7).filter(p=>p.checkpoint?.kind==='purchase').length,1);
 assert.equal(C.activateTurbo(updated,snapshot),updated);assert.equal(C.reset(updated).turbo,undefined);
 assert.deepEqual(C.turboPlan(b),{before:3000,after:0});
 const declined=C.activateTurbo(run,snapshot,false);assert.deepEqual(Y.simulate(b,declined),before);assert.equal(C.turboMonth(before,declined),-1);
});
