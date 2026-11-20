const {test}=require('node:test');
const assert=require('node:assert/strict');
const Y=require('../year-engine');
function budget(){const b=Y.defaults();for(const key of ['income','fixed','insurance','consumption','saving','goals'])b[key]=[];b.initial={checking:0,reserve:1000,future:2000};return b;}
test('ročný bonus je jedno percento denného priemeru, pripísané raz do rezervy bez zhodnotenia budúcnosti',()=>{
 const b=budget(),run={year:2027,events:[]},p=Y.simulate(b,run);
 assert.equal(p.averageReserve,100000);assert.equal(p.reserveBonus,1000);assert.equal(p.final.reserve,101000);assert.equal(p.final.future,200000);
 const bonus=p.ledger.filter(e=>e.type==='reserveBonus');assert.equal(bonus.length,1);assert.equal(bonus[0].date,'2027-12-31');assert.equal(bonus[0].amount,1000);
 assert.ok(p.days.slice(0,-1).every(d=>d.reserve===100000));assert.deepEqual(Y.simulate(b,run),p);
 assert.equal(Y.simulate(b,run,{plan:true}).reserveBonus,1000);assert.equal(b.initial.reserve,1000);
});
test('použitá rezerva znižuje bonus podľa počtu dní aj v priestupnom roku',()=>{
 for(const [year,firstHalf] of [[2027,181],[2028,182]]){
  const p=Y.simulate(budget(),{year,events:[{date:year+'-07-01',type:'life',name:'Oprava',amount:500}]}),days=firstHalf+184;
  const expectedAverage=(firstHalf*100000+184*50000)/days;
  assert.equal(p.averageReserve,expectedAverage);assert.equal(p.reserveBonus,Math.round(expectedAverage*.01));
  assert.equal(p.final.reserve,50000+p.reserveBonus);assert.equal(p.final.future,200000);
 }
});
test('vyčerpaná rezerva môže dostať bonus za minulé dni a ten pokryje účet bez nového dlhu',()=>{
 const p=Y.simulate(budget(),{year:2027,events:[{date:'2027-07-01',type:'life',name:'Oprava',amount:1500}]});
 assert.equal(p.reserveBonus,Math.round(181*100000/365*.01));assert.equal(p.reserveBonusUsed,p.reserveBonus);
 assert.equal(p.final.reserve,0);assert.equal(p.final.checking,-50000+p.reserveBonus);assert.equal(p.loanBorrowed,0);
 assert.equal(p.firstDeficit,'2027-07-01');assert.equal(p.final.future,200000);
});
test('bez rezervy nie je bonus a nevznikne žiadny výnos z budúcich peňazí',()=>{
 const b=budget();b.initial.reserve=0;const p=Y.simulate(b,{year:2027,events:[]});
 assert.equal(p.reserveBonus,0);assert.equal(p.averageReserve,0);assert.equal(p.final.future,200000);assert.equal(p.ledger.filter(e=>e.type==='reserveBonus').length,0);
});
