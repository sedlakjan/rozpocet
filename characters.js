(function(root){
 'use strict';
 const Y=typeof module!=='undefined'?require('./year-engine'):root.YearEngine;
 const profiles=[
  {id:'jozko',name:'Jožko',defaultGender:'male',variants:{male:{name:'Jožko',avatar:'jozko'},female:{name:'Jožka',avatar:'jozka'}},income:1100,range:'800 – 1 300 €',housing:320,food:230,transport:40,phone:30},
  {id:'ferko',name:'Ferko',defaultGender:'male',variants:{male:{name:'Ferko',avatar:'ferko'},female:{name:'Ferka',avatar:'ferka'}},income:1600,range:'1 300 – 2 000 €',housing:520,food:270,transport:70,phone:40},
  {id:'janka',name:'Janka',defaultGender:'female',variants:{male:{name:'Janko',avatar:'janko'},female:{name:'Janka',avatar:'janka'}},income:2700,range:'2 000 – 3 500 €',housing:750,food:310,transport:100,phone:40}
 ];
 function budgetFor(id,income,reserve,future=50,insured=false,goalShare=50){
  const p=profiles.find(p=>p.id===id);if(!p)throw new Error('Neznáma postava');
  const b=Y.defaults();b.initial={checking:0,reserve,future:0};b.income[0].amount=income;
  b.fixed=b.fixed.map(r=>({...r,amount:r.id==='housing'?p.housing:r.id==='phone'?p.phone:r.id==='subscription'?20:0}));
  const premium=insured?50:0;
  b.insurance=b.insurance.map(row=>({...row,amount:row.id==='household'?premium:0}));
  // A preference allocates only the room left after essential costs. It is not income.
  const room=Math.max(0,income-p.housing-p.phone-20-p.food-p.transport-premium);
  const saving=Math.round(room*(future/100)*.8/10)*10;
  const forFuture=Math.min(saving,Math.max(0,Math.round(saving*(goalShare/100)/10)*10));
  const fun=room-saving;
  const outside=Math.round(fun*.35/10)*10,clothes=Math.round(fun*.2/10)*10;
  b.consumption=[{id:'food',name:'Potraviny',amount:p.food},{id:'transport',name:'Doprava',amount:p.transport},{id:'outside',name:'Jedlo vonku',amount:outside},{id:'clothes',name:'Oblečenie',amount:clothes},{id:'leisure',name:'Voľný čas',amount:Math.max(0,fun-outside-clothes)}];
  b.saving=[{id:'reserve',name:'Do rezervy',amount:saving-forFuture}];b.goals=[{id:'future',name:'Sporenie na budúcnosť',amount:forFuture}];return b;
 }
 function scenario(b,discipline,seed,year=2027){
  // Fixed external circumstances across behaviour choices; only overspending changes.
  const run=Y.generate(b,4,seed,year),rate=[.8,.55,.3,.15,.05,0][discipline-1];
  const base=b.consumption.reduce((n,r)=>n+r.amount,0);
  run.events=run.events.map(e=>e.type==='deviation'?{...e,amount:Math.round(base*rate),included:rate===0,name:rate?'Nákup nad vlastný plán':'Plán dodržaný',text:rate?'K plánovaným radostiam pribudlo niečo navyše. Tvoj limit s tým nerátal.':'Tentoraz bez nákupu nad plán.'}:e);
  run.answer=discipline;run.deviationTotal=run.events.filter(e=>e.type==='deviation').reduce((n,e)=>n+Math.round(e.amount*100),0);return run;
 }
 const api={profiles,budgetFor,scenario};if(typeof module!=='undefined')module.exports=api;root.BudgetCharacters=api;
})(typeof window==='undefined'?globalThis:window);
