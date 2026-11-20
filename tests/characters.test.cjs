const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../characters'),Y=require('../year-engine');
test('poistenie stojí 50 eur mesačne, zmestí sa do príjmu a kryje škodu z potrubia',()=>{
 const b=C.budgetFor('ferko',1600,1000,50,true);
 assert.equal(b.insurance.find(row=>row.id==='household').amount,50);
 const totals=Y.totals(b);assert.equal(totals.expenses+totals.saving,totals.income);
 const events=[{date:'2027-01-14',type:'life',name:'Prasknuté potrubie',amount:1200,insurance:'household'}];
 const p=Y.simulate(b,{year:2027,events});
 assert.equal(p.ledger.filter(e=>e.type==='expense'&&e.name==='Poistenie domácnosti').length,12);
 assert.equal(p.insured,120000);
 assert.equal(p.ledger.find(e=>e.type==='insured').amount,0);
});
test('správanie nemení životné udalosti ani počiatočné peniaze',()=>{
 for(const p of C.profiles){
  const b=C.budgetFor(p.id,p.income,p.income,50);
  const calm=C.scenario(b,6,42),wild=C.scenario(b,1,42);
  assert.deepEqual(calm.events.filter(e=>e.type!=='deviation'),wild.events.filter(e=>e.type!=='deviation'));
  assert.deepEqual(Y.simulate(b,calm).opening,Y.simulate(b,wild).opening);
  assert.ok(Y.simulate(b,calm).final.available>Y.simulate(b,wild).final.available);
 }
});
test('odkladanie prerozdeľuje disponibilný príjem, nevytvára nové peniaze',()=>{
 for(const p of C.profiles){
  const spend=C.budgetFor(p.id,p.income,0,0),save=C.budgetFor(p.id,p.income,0,100);
  assert.equal(Y.totals(spend).expenses+Y.totals(spend).saving,Y.totals(save).expenses+Y.totals(save).saving);
  assert.ok(Y.totals(save).saving>Y.totals(spend).saving);
  assert.equal(save.initial.reserve,0);
 }
});
test('nižší príjem môže vytvárať rezervu a vysoký môže skončiť v deficite',()=>{
 const b=C.budgetFor('jozko',1100,1100,100),a=Y.simulate(b,C.scenario(b,6,42));
 const c=C.budgetFor('janka',2700,2700,0),d=Y.simulate(c,C.scenario(c,1,42));
 assert.ok(a.final.reserve>a.opening.reserve);assert.equal(a.firstDeficit,null);
 assert.ok(d.final.checking<0);assert.equal(d.final.reserve,0);
});
test('nulový príjem aj príjem mimo pásma zostávajú platné, opakovanie je presné',()=>{
 for(const income of [0,1100,5000]){
  const b=C.budgetFor('jozko',income,0,100),run=C.scenario(b,4,17);
  const a=Y.simulate(b,run);assert.ok(Number.isFinite(a.final.checking));
  assert.deepEqual(a,Y.simulate(b,C.scenario(b,4,17)));
  for(const r of b.consumption)assert.ok(r.amount>=0);
 }
});

test('rezerva a budúcnosť sa delia bez zdvojenia a budúce úspory nepokrývajú výdavky',()=>{
 for(const p of C.profiles)for(const share of [0,50,100]){
  const b=C.budgetFor(p.id,p.income,0,100,false,share),t=Y.totals(b);
  assert.equal(t.expenses+t.saving,t.income);assert.equal(b.initial.reserve,0);
  if(share===0)assert.equal(b.goals[0].amount,0);if(share===100)assert.equal(b.saving[0].amount,0);
 }
 const b=C.budgetFor('ferko',1600,0,100,false,100),run={year:2027,events:[{id:'repair',date:'2027-02-01',type:'life',name:'Oprava',amount:10000}]};
 const p=Y.simulate(b,run);assert.ok(p.days[30].future>0);assert.equal(p.final.future,p.days[30].future);assert.ok(p.final.available<0);
});
