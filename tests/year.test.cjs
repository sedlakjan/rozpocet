const {test}=require('node:test');
const assert=require('node:assert/strict');
const Y=require('../year-engine');
const E=require('../engine');
const C=require('../events');
const empty=()=>{const b=Y.defaults();for(const k of ['income','fixed','consumption','saving','goals'])for(const r of b[k])r.amount=0;b.initial={checking:0,reserve:0,future:0};return b;};
const run=events=>({year:2027,seed:123,answer:6,events});
test('presuny zachovávajú peniaze, sporenie nie je spotreba',()=>{
 const b=empty();b.initial.checking=100;b.saving[0].amount=40;b.goals[0].amount=30;
 const p=Y.simulate(b,run([]));let prev=p.opening;
 for(const e of p.ledger){assert.equal(e.checking+e.reserve+e.future,10000);if(e.type==='transfer'&&e.target==='reserve')assert.equal(e.available,prev.available);prev=e;}
 assert.equal(p.final.future,3000);assert.equal(p.final.reserve,7000);assert.ok(p.shortSaving>0);
});
test('zahrnutá udalosť a označená známa platba sa neúčtujú dvakrát',()=>{
 const b=empty();b.initial.checking=100;b.known=[{id:'x',name:'Poistka',amount:50,month:0,included:true}];
 const r=run([{id:'c',date:'2027-01-08',type:'covered',name:'Nákup',amount:50,included:true}]);
 assert.equal(Y.simulate(b,r).final.available,10000);b.known[0].included=false;assert.equal(Y.simulate(b,r).final.available,5000);
});
test('čerpanie a vyčerpanie rezervy, budúce ciele sa nepoužijú',()=>{
 const b=empty();b.initial={checking:10,reserve:30,future:200};
 const p=Y.simulate(b,run([{date:'2027-01-10',type:'life',name:'Oprava',amount:70}]));
 assert.equal(p.final.checking,-3000);assert.equal(p.final.reserve,0);assert.equal(p.final.future,20000);assert.equal(p.firstDeficit,'2027-01-10');assert.equal(p.ledger.find(e=>e.type==='reserveDraw').amount,3000);
});
test('príjem najskôr pokryje deficit, odkladanie nevytvorí dlh',()=>{
 const b=empty();b.income[0].amount=100;b.saving[0].amount=50;
 const r=run([{date:'2027-01-30',type:'life',name:'Oprava',amount:250}]);const p=Y.simulate(b,r);
 const feb=p.days.find(d=>d.date==='2027-02-27');assert.equal(feb.reserve,0);assert.equal(feb.checking,-5000);assert.ok(p.shortSaving>0);
});
test('január a zvyšok roka používajú ten istý nemenný denník',()=>{
 const b=Y.defaults(),r=Y.generate(b,3,45),p=Y.simulate(b,r);const copy=structuredClone(r);
 const jan=p.days.slice(0,31),rest=p.days.slice(31);assert.equal(jan.length+rest.length,365);assert.equal(rest[0].date,'2027-02-01');assert.deepEqual(Y.simulate(b,r),p);assert.deepEqual(r,copy);
});
test('preskočenie animácie aj postupný prístup končia rovnakými hodnotami',()=>{
 const b=Y.defaults(),r=Y.generate(b,4,123),p=Y.simulate(b,r);let frame;for(const day of p.days)frame=day;assert.deepEqual(frame,p.final);assert.deepEqual(Y.simulate(b,r).final,p.final);
});
test('rovnaký seed reprodukuje rok; zmena rozpočtu nemení uložené udalosti',()=>{
 const b=Y.defaults(),r=Y.generate(b,2,99),saved=structuredClone(r);assert.deepEqual(Y.generate(b,2,99),r);b.consumption[0].amount=0;Y.simulate(b,r);assert.deepEqual(r,saved);assert.ok(Y.simulate(b,r).deviation>0);
});
test('životné udalosti sú nezávislé od odpovede, auto a deti sú podmienené',()=>{
 const b=Y.defaults(),a=Y.generate(b,1,99),z=Y.generate(b,6,99);const life=r=>r.events.filter(e=>['life','extraIncome'].includes(e.type)&&!e.id.endsWith('-situation')&&!e.date.startsWith('2027-01'));assert.deepEqual(life(a),life(z));assert.ok(z.events.some(e=>e.date.startsWith('2027-01')&&e.type==='life'&&e.amount>0));assert.equal(z.deviationTotal,0);assert.ok(!a.events.some(e=>['car','children'].includes(e.condition)));assert.ok(C.catalog.length>=30);
});
test('ročné percento je účtované iba konkrétnymi udalosťami',()=>{
 const b=Y.defaults(),r=Y.generate(b,1,76),p=Y.simulate(b,r),base=Y.simulate(b,r,{plan:true});const expected=Math.round(b.consumption.reduce((n,e)=>n+E.cents(e.amount),0)*.2*12);assert.equal(p.deviation,expected);assert.equal(p.final.available+p.final.future-base.final.available-base.final.future,p.extra-p.life-p.deviation);
});
test('nulové vstupy aj deficitný rozpočet majú konečný výsledok',()=>{
 const b=empty();assert.equal(Y.simulate(b,run([])).final.available,0);b.fixed[0].amount=100;const p=Y.simulate(b,run([]));assert.equal(p.final.available,-120000);assert.equal(p.firstDeficit,'2027-01-05');assert.equal(p.final.future,0);
});
test('grafové minimá zachovávajú pokles pred neskorším príjmom',()=>{
 const b=empty();b.income[0].amount=100;b.known=[{name:'Platba',amount:300,month:0}];const p=Y.simulate(b,run([]));assert.ok(p.lowest.available<p.final.available);assert.ok(p.days.some(d=>d.low<0));
});
test('denná spotreba má presný mesačný súčet aj vo februári',()=>{
 const b=empty();b.initial.checking=10000;b.consumption[0].amount=100.03;const p=Y.simulate(b,run([]));for(let m=1;m<=12;m++)assert.equal(-p.ledger.filter(e=>e.type==='daily'&&Number(e.date.slice(5,7))===m).reduce((n,e)=>n+e.amount,0),10003);
});
test('mzda nie je počiatočný zostatok a príde presne dvanásťkrát',()=>{
 const b=Y.defaults(),p=Y.simulate(b,run([]));assert.equal(p.opening.checking,E.cents(b.income[0].amount));
 const salary=p.ledger.filter(e=>e.type==='income'&&e.name==='Mzda');assert.equal(salary.length,12);assert.equal(salary.reduce((n,e)=>n+e.amount,0),12*E.cents(b.income[0].amount));
});
test('úvod obsahuje mzdu a vlastný zostatok, január mzdu nezopakuje',()=>{
 const b=empty();b.initial.checking=150;b.income[0].amount=3000;const p=Y.simulate(b,run([]));assert.equal(p.opening.checking,315000);assert.equal(p.days[30].checking,315000);assert.equal(p.final.checking,3615000);
});
test('poistenie platí mesačne, kryje určenú škodu, nie pokutu',()=>{
 const b=empty();b.initial.checking=2000;b.insurance[0].amount=10;
 b.insurance[1].amount=0;
 for(const id of ['fridge','washer','keys','carfix'])assert.equal(Y.isInsured(C.catalog.find(e=>e.id===id),b),false);
 for(const id of ['washer-new','lock','brakes','tow'])assert.equal(Y.isInsured(C.situations.find(e=>e.id===id),b),false);
 const r=run([{date:'2027-02-10',name:'Voda',type:'life',amount:1200,insurance:'household'},{date:'2027-03-10',name:'Pokuta',type:'life',amount:80}]);
 const p=Y.simulate(b,r);assert.equal(p.insured,120000);assert.equal(p.final.available,180000);assert.equal(p.life,8000);assert.equal(p.ledger.find(e=>e.type==='insured').amount,0);
 b.insurance[0].amount=0;assert.equal(Y.simulate(b,r).final.available,72000);
});
test('20 situácií má presné sumy a škála riadi ich počet',()=>{
 assert.equal(C.situations.length,20);assert.equal(C.situations.find(e=>e.id==='flood').amount,1200);
 const b=Y.defaults();for(let a=1;a<=6;a++){const r=Y.generate(b,a,44);assert.equal(r.events.filter(e=>e.id.endsWith('-situation')).length,C.config.situationCount[a-1]);assert.deepEqual(r,Y.generate(b,a,44));}
});
test('posledná januárová situácia sa žrebuje, rovnaký seed ju zachová',()=>{
 const b=Y.defaults(),names=new Set();
 for(let seed=1;seed<=30;seed++){
  const r=Y.generate(b,4,seed),jan=r.events.filter(e=>e.date.startsWith('2027-01'));
  assert.equal(jan.length,3);assert.ok(jan.some(e=>e.type==='life'));names.add(jan.map(e=>e.name).join('|'));
  assert.deepEqual(jan,Y.generate(b,4,seed).events.filter(e=>e.date.startsWith('2027-01')));
  assert.ok(!['car','pet','bike','children'].includes(jan[2].condition));
 }
 assert.ok(names.size>3);
});
test('zmena poistenia nemení udalosti a účty sa stále zhodujú s plánom',()=>{
 const b=Y.defaults(),r=Y.generate(b,1,99),saved=structuredClone(r);b.insurance[0].amount=15;
 const p=Y.simulate(b,r),base=Y.simulate(b,r,{plan:true});assert.deepEqual(r,saved);assert.equal(p.final.available+p.final.future-base.final.available-base.final.future,p.extra-p.life-p.deviation);
 assert.ok(!r.events.some(e=>['pet','bike','car'].includes(e.condition)));
});
test('január mení počet mínusov podľa škály a žrebuje aj poradie nákupov',()=>{
 const b=Y.defaults(),firsts=new Set();
 for(let seed=1;seed<=40;seed++)for(let answer=1;answer<=6;answer++){
  const r=Y.generate(b,answer,seed),jan=r.events.filter(e=>e.date.startsWith('2027-01'));
  assert.equal(jan.length,3);
  assert.equal(jan.filter(e=>e.amount>0&&!e.included).length,[3,3,2,2,1,1][answer-1]);
  if(answer===6)firsts.add(jan[0].name);
  const expected=Math.round(b.consumption.reduce((n,e)=>n+E.cents(e.amount),0)*C.config.rates[answer-1]*12);
  assert.equal(Y.simulate(b,r).deviation,expected);
 }
 assert.ok(firsts.size>4);
});
test('kategórie majú samostatné ikony a denné pohyby zachovajú mesačné sumy',()=>{
 const b=Y.defaults();b.consumption.push({id:'custom',name:'Moja vlastná vec',amount:31.17});
 const p=Y.simulate(b,run([]));
 for(const row of b.consumption){const jan=p.ledger.filter(e=>e.type==='daily'&&e.categoryId===row.id&&e.date.startsWith('2027-01'));assert.equal(-jan.reduce((n,e)=>n+e.amount,0),E.cents(row.amount));assert.equal(jan[0].icon,Y.categoryIcon(row));}
 assert.equal(Y.categoryIcon({id:'custom'}),'other');assert.notEqual(Y.categoryIcon({id:'loans'}),Y.categoryIcon({id:'housing'}));
});
