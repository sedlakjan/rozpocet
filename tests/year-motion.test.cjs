const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../year-motion'),J=require('../year-journey'),Y=require('../year-engine');
const points=[{date:'2027-01-31',checking:0,reserve:30000,future:0},{date:'2027-02-01',checking:160000,reserve:30000,future:0},{date:'2027-02-28',checking:-20000,reserve:0,future:10000}];
test('animácia prejde cez príjem aj míňanie, zachová súčet a presné koncové centy',()=>{
 const start=M.sample(points,0),payday=M.sample(points,.5),end=M.sample(points,1);
 assert.equal(start.available,30000);assert.equal(payday.available,190000);assert.equal(end.available,-20000);
 assert.equal(end.date,'2027-02-28');assert.equal(end.future,10000);
 for(let i=0;i<=100;i++){const v=M.sample(points,i/100);assert.equal(v.available,v.checking+v.reserve);assert.ok(Number.isInteger(v.available));}
});
test('animácia berie denné účtovné zostatky a mierka obsiahne aj výplatu uprostred prehrávania',()=>{
 const b=Y.defaults(),p=Y.simulate(b,Y.generate(b,4,305));
 for(let month=0;month<12;month++){
  const frames=J.frames(p,month),days=p.days.filter(d=>d.month===month);
  assert.equal(frames.length,days.length+1);
  assert.deepEqual(frames.slice(1),days.map(({date,checking,reserve,future})=>({date,checking,reserve,future})));
  assert.equal(frames[0].checking,month?p.days[days[0].index-1].checking:p.opening.checking);
  for(const frame of frames)assert.ok(Math.abs(frame.checking+frame.reserve)<=J.scale(p));
 }
});
test('prekreslenie pri pauze nevráti rozbehnutý mesiac na začiatok a odchod zruší staré snímky',()=>{
 let time=0,id=0,shown;const frames=new Map();
 const motion=M.create({requestFrame:fn=>{frames.set(++id,fn);return id;},cancelFrame:id=>frames.delete(id),now:()=>time});
 const advance=ms=>{time+=ms;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(time));};
 motion.render({id:1,points,animate:true,duration:2000,draw:v=>{shown=v;}});
 advance(700);const paused=shown;let replacement;
 motion.render({id:1,points,draw:v=>{replacement=v;}});assert.deepEqual(replacement,paused);
 advance(1300);assert.equal(replacement.available,-20000);assert.equal(replacement.progress,1);assert.equal(frames.size,0);
 motion.render({id:2,points,animate:true,draw:v=>{shown=v;}});assert.equal(frames.size,1);
 motion.reset();assert.equal(frames.size,0);
 motion.render({id:2,points,animate:false,draw:v=>{shown=v;}});assert.equal(shown.available,-20000);assert.equal(frames.size,0);
});

test('rozhodnutie zastaví snímky presne v účtovnom bode aj pri oneskorenej snímke',()=>{
 let time=0,id=0,visible,held=0;const frames=new Map();
 const motion=M.create({requestFrame:fn=>{frames.set(++id,fn);return id;},cancelFrame:id=>frames.delete(id),now:()=>time});
 const path=points.map((p,i)=>i===1?{...p,checkpoint:{kind:'purchase',eventId:'pick'}}:p);
 const render=animate=>motion.render({id:1,points:path,animate,duration:2000,draw:v=>{visible=v;},onCheckpoint:(c,v)=>{held++;assert.equal(c.eventId,'pick');assert.equal(v.available,190000);}});
 render(true);time=1700;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(time));
 assert.equal(held,1);assert.equal(visible.progress,.5);assert.equal(frames.size,0);assert.equal(motion.busy(),true);
 render(false);assert.equal(held,1);assert.equal(visible.available,190000);
 motion.reset();render(false);assert.equal(held,2);assert.equal(frames.size,0);
});
