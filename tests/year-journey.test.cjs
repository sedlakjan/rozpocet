const {test}=require('node:test');
const assert=require('node:assert/strict');
const Y=require('../year-engine'),J=require('../year-journey');
test('mesiace zachovajú presné koncové zostatky a nepočítajú presuny ako spotrebu',()=>{
 const b=Y.defaults(),p=Y.simulate(b,Y.generate(b,4,2087)),copy=JSON.stringify(p),rows=J.months(p);
 assert.equal(rows.length,12);
 for(const row of rows){
  const end=p.days.filter(d=>d.month===row.month).at(-1);
  assert.equal(row.checking,end.checking);assert.equal(row.reserve,end.reserve);assert.equal(row.future,end.future);
  assert.equal(row.available,end.checking+end.reserve);assert.equal(row.endIndex,end.index);
  assert.equal(row.spent,p.ledger.filter(e=>e.date.startsWith(end.date.slice(0,7))&&e.amount<0).reduce((n,e)=>n-e.amount,0));
  assert.ok(Math.abs(row.available)<=J.scale(p));
 }
 assert.equal(JSON.stringify(p),copy);
});
test('prehrávanie ide na skutočné konce mesiacov aj v priestupnom roku',()=>{
 for(const year of [2027,2028]){
  const b=Y.defaults(),p=Y.simulate(b,{year,events:[]});
  const end=J.nextIndex(p,30);assert.equal(p.days[end].date,year===2028?'2028-02-29':'2027-02-28');
  assert.equal(p.days[J.nextIndex(p,end)].date,year+'-03-31');
  assert.equal(J.nextIndex(p,p.days.length-1),p.days.length-1);
 }
});
test('dočasný deficit ostane označený aj po vyrovnaní neskorším príjmom',()=>{
 const b=Y.defaults();b.initial.reserve=0;b.saving=[];b.goals=[];
 const p=Y.simulate(b,{year:2027,events:[{date:'2027-02-08',type:'life',name:'Oprava',amount:1800},{date:'2027-02-25',type:'extraIncome',name:'Bonus',amount:4000}]});
 const month=J.months(p)[1];assert.equal(month.firstGap,'2027-02-08');assert.ok(month.available>0);
 assert.equal(month.featured.name,'Bonus');assert.equal(month.featured.amount,400000);
});
test('nulový rozpočet má konečnú mierku a presný nulový zostatok',()=>{
 const b=Y.defaults();for(const key of ['income','fixed','consumption','insurance','saving','goals'])b[key]=[];
 b.initial={checking:0,reserve:0,future:0};const p=Y.simulate(b,{year:2027,events:[]});
 assert.equal(J.scale(p),1);assert.ok(J.months(p).every(m=>m.available===0&&m.featured===null));
});
