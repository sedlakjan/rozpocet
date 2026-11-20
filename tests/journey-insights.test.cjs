const {test}=require('node:test');
const assert=require('node:assert/strict');
const I=require('../journey-insights');
const Y=require('../year-engine');
const R=require('../receipt');

test('odkladanie príde prvý deň a hodnotenie zohľadní čistú zmenu rezervy',()=>{
 const b=Y.defaults();
 b.initial={checking:0,reserve:500,future:0};
 b.income=[{name:'Mzda',amount:1000}];b.fixed=[];b.insurance=[];b.goals=[];
 b.consumption=[{id:'food',name:'Potraviny',amount:800}];
 b.saving=[{name:'Do rezervy',amount:200}];
 for(const [expense,tone,change] of [[0,'green',20000],[100,'yellow',10000],[200,'yellow',0],[300,'red',-10000]]){
  const p=Y.simulate(b,{year:2027,events:expense?[{date:'2027-01-14',name:'Oprava',type:'life',amount:expense}]:[]});
  const first=p.days[0].events;
  assert.equal(first[0].type,'transfer');assert.equal(first[0].amount,20000);
  assert.equal(R.summarize(p.ledger,'2027-01','2027-01-01').transfers.reserve,20000);
  const r=I.month(p);assert.equal(r.tone,tone);assert.equal(r.reserveChange,change);
 }
});

test('čerpanie rezervy sa vysvetlí aj keď mesiac končí s nezáporným účtom',()=>{
 const b=Y.defaults();b.initial.reserve=10000;b.saving=[];b.goals=[];
 const run={year:2027,events:[{date:'2027-01-14',type:'life',name:'Oprava',amount:800}]};
 const p=Y.simulate(b,run),r=I.month(p);
 assert.equal(r.outcome,'reserve');assert.ok(r.drawn>0);assert.ok(r.end.checking>=0);
 assert.equal(r.life,80000);assert.equal(r.overspending,0);
});
test('nedostatok počas mesiaca sa nestratí, aj keď ho neskorší príjem vyrovná',()=>{
 const b=Y.defaults();b.initial.reserve=0;b.saving=[];b.goals=[];
 const p=Y.simulate(b,{year:2027,events:[{date:'2027-01-08',type:'life',name:'Oprava',amount:1800},{date:'2027-01-25',type:'extraIncome',name:'Bonus',amount:3000}]});
 const r=I.month(p);assert.equal(r.outcome,'gap');assert.equal(r.firstGap,'2027-01-08');assert.ok(r.end.checking>0);
});
test('vyššia počiatočná rezerva ani samotný presun nevytvárajú zlepšenie výsledku',()=>{
 const b=Y.defaults();b.initial.reserve=0;b.fixed=[];b.consumption=[];b.insurance=[];b.saving=[{id:'reserve',name:'Rezerva',amount:100}];b.goals=[];
 const run={year:2027,events:[]},p=Y.simulate(b,run),c=structuredClone(b);c.initial.reserve=1000;c.saving[0].amount=400;
 const other=Y.simulate(c,run);
 assert.equal(I.month(p).wealthChange,0);assert.equal(I.month(other).wealthChange,0);
 assert.equal(I.compare(other,p),0);assert.equal(I.month(p).outcome,'own');
});
test('januárový rozbor neprimieša neskoršie udalosti a nemení projekciu',()=>{
 const b=Y.defaults(),p=Y.simulate(b,Y.generate(b,4,8912)),copy=JSON.stringify(p),r=I.month(p);
 const expected=p.ledger.filter(e=>e.date.startsWith('2027-01')&&e.type==='deviation').reduce((n,e)=>n-e.amount,0);
 assert.equal(r.overspending,expected);assert.equal(JSON.stringify(p),copy);
});

test('budúcnosť má samostatný skutočný prírastok aj keď plánované odkladanie nevyšlo',()=>{
 const b=Y.defaults();b.income=[{name:'Mzda',amount:1000}];b.fixed=[];b.insurance=[];b.consumption=[];b.saving=[];
 b.initial={checking:0,reserve:0,future:300};b.goals=[{id:'future',name:'Budúcnosť',amount:100}];
 const run={year:2027,events:[]},r=I.month(Y.simulate(b,run));
 assert.equal(r.savedFuture,10000);assert.equal(r.futureChange,10000);assert.equal(r.end.future,40000);assert.equal(r.reserveChange,0);
 run.events=[{date:'2027-01-21',type:'life',name:'Oprava',amount:2000}];const gap=I.month(Y.simulate(b,run));
 assert.equal(gap.savedFuture,0);assert.equal(gap.futureChange,0);assert.equal(gap.end.future,30000);assert.ok(gap.end.checking<0);
});
