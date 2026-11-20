const {test}=require('node:test');
const assert=require('node:assert/strict');
const R=require('../receipt');
const Y=require('../year-engine');

test('účtenka zoskupí platby, presuny oddelí a náhľad neúčtuje',()=>{
 const entries=[
  {date:'2027-01-01',type:'income',name:'Mzda',amount:160000},
  {date:'2027-01-02',type:'daily',categoryId:'food',name:'Potraviny',amount:-2000},
  {date:'2027-01-03',type:'daily',categoryId:'food',name:'Potraviny',amount:-2500},
  {date:'2027-01-03',type:'reserveDraw',amount:500},
  {date:'2027-01-04',type:'reserveDraw',amount:800},
  {date:'2027-01-05',type:'transfer',target:'reserve',amount:1000},
  {date:'2027-01-05',type:'transfer',target:'future',amount:300},
  {date:'2027-01-06',type:'covered',amount:0},
  {date:'2027-01-07',type:'income',name:'Bonus',amount:700},
  {date:'2027-02-01',type:'daily',categoryId:'food',name:'Potraviny',amount:-9000}
 ];
 const copy=JSON.stringify(entries);
 assert.equal(R.summarize(entries,'2027-01',null).spent,0);
 assert.equal(R.summarize(entries,'2027-01','2027-01-02').spent,2000);
 const r=R.summarize(entries,'2027-01','2027-01-31');
 assert.equal(r.rows.length,1);assert.equal(r.spent,4500);assert.equal(r.income,700);
 assert.deepEqual(r.transfers,{drawn:1300,reserve:1000,future:300});assert.equal(r.covered,1);
 assert.equal(JSON.stringify(entries),copy);
});

test('účtenka sa zhoduje s účtom každý januárový deň vrátane vyčerpania rezervy',()=>{
 for(const reserve of [0,50,1000]){
  const b=Y.defaults();b.initial.reserve=reserve;b.consumption[0].amount=1800;
  const run=Y.generate(b,1,32854),p=Y.simulate(b,run);
  for(const day of p.days.slice(0,31)){
   const r=R.summarize(p.ledger,'2027-01',day.date);
   assert.equal(r.rows.reduce((n,row)=>n+row.amount,0),r.spent);
   assert.equal(p.opening.checking+r.income-r.spent+r.transfers.drawn-r.transfers.reserve-r.transfers.future,day.checking);
   assert.equal(p.opening.reserve+r.transfers.reserve-r.transfers.drawn,day.reserve);
   assert.equal(p.opening.future+r.transfers.future,day.future);
  }
 }
});
