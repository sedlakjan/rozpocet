(function(root){
 'use strict';
 const E=typeof module!=='undefined'?require('./engine'):root.BudgetEngine;
 const offers=[
  {id:'evening',name:'Kino a večer vonku',title:'Kamoš volá. Ideš s ním?',text:'Kino, niečo pod zub a večer spolu.',amount:50,icon:'cup'},
  {id:'concert',name:'Lístok na koncert',title:'Tvoja kapela hrá v meste.',text:'Ešte ostalo pár lístkov. Dopraješ si koncert?',amount:50,icon:'star'},
  {id:'shoes',name:'Tenisky v zľave',title:'Tie tenisky sú práve v zľave.',text:'Nepotrebuješ ich súrne, ale už dlhšie sa ti páčia.',amount:50,icon:'shirt'},
  {id:'trip',name:'Jednodňový výlet',title:'Na chvíľu vypadnúť z mesta?',text:'Cesta, vstupné a niečo dobré po ceste.',amount:50,icon:'bus'},
  {id:'friends-holiday',name:'Dovolenka s kamoškou',title:'Kamoška navrhla dovolenku. Ideš?',text:'Spoločný pobyt aj s cestou. Pridáš sa?',amount:450,icon:'star'},
  {id:'festival',name:'Festivalový víkend',title:'Celý víkend hudby?',text:'Lístok, cesta a ubytovanie. Partia už plánuje odchod.',amount:450,icon:'play'},
  {id:'robot',name:'Robotický vysávač',title:'Menej upratovania znie dobre.',text:'Robotický vysávač je práve v ponuke. Dopraješ si ho?',amount:450,icon:'appliance'},
  {id:'course',name:'Kurz fotografovania',title:'Skúsiš konečne to fotenie?',text:'Kurz, ktorý už dlhšie pozeráš, otvára novú skupinu.',amount:450,icon:'book'},
  {id:'phone',name:'Nový mobil',title:'Vyšiel nový mobil. Berieš?',text:'Ten tvoj ešte funguje. Tento ťa však láka.',amount:600,icon:'phone'},
  {id:'weekend',name:'Predĺžený víkend',title:'Tri dni preč od všetkého.',text:'Objavil sa voľný pobyt. Ubytovanie aj cesta spolu.',amount:600,icon:'home'},
  {id:'bike',name:'Nový bicykel',title:'Tento bicykel by ťa vytiahol von.',text:'Ten starý ešte poslúži. Vymeníš ho už teraz?',amount:600,icon:'star'},
  {id:'console',name:'Herná konzola',title:'Nová konzola na voľné večery.',text:'Konzola a prvé hry sú v jednom balíku.',amount:600,icon:'play'},
  {id:'tv',name:'Nový televízor',title:'Veľká telka. Veľké pokušenie.',text:'Filmové večery by mohli vyzerať inak.',amount:1200,icon:'appliance'},
  {id:'laptop',name:'Nový notebook',title:'Rýchlejší notebook, menej čakania.',text:'Upgrade je lákavý. Ten súčasný však ešte funguje.',amount:1200,icon:'other'},
  {id:'holiday',name:'Dovolenka pri mori',title:'More namiesto bežného týždňa?',text:'Našiel si pobyt aj s cestou. Rozhodneš sa preň?',amount:1200,icon:'star'},
  {id:'sofa',name:'Nová sedačka',title:'Obývačka by si zaslúžila zmenu.',text:'Táto sedačka by sa tam presne hodila.',amount:1200,icon:'home'}
 ];
 function prepare(run){
  if(run.interactive)return run;
  const candidates=run.events.filter(e=>e.type==='deviation'&&e.date.slice(5,7)!=='01');
  const count=Math.round(candidates.length/3),chosen=new Set();let seed=(run.seed||1)>>>0;
  for(let i=0;i<count;i++){
   const group=candidates.slice(Math.floor(i*candidates.length/count),Math.floor((i+1)*candidates.length/count));
   seed=(Math.imul(seed,1664525)+1013904223)>>>0;chosen.add(group[seed%group.length].id);
  }
  return {...run,interactive:true,rescue:null,events:run.events.map(e=>chosen.has(e.id)?{...e,choiceBase:{...e},type:'choice',amount:0,included:false,decision:'pending',name:'Tvoje rozhodnutie',text:'O tomto nákupe rozhodneš počas mesiaca.'}:({...e}))};
 }
 function reset(run){const {interactive,rescue,crisis,turbo,reservePlan,...base}=run;return {...base,events:run.events.map(e=>({...(e.choiceBase||e)}))};}
 function offer(snapshot,run=null,eventId=''){
  // Price variety uses account money plus a quarter of the emergency buffer.
  // Actual affordability still uses account + reserve, with drawdown disclosed.
  const capacity=Math.max(0,snapshot.checking+Math.floor(Math.max(0,snapshot.reserve)*.25));
  const tiers=capacity>=120000?[1200,600,450]:capacity>=60000?[600,450]:capacity>=45000?[450,50]:[50];
  const seen=(run?.events||[]).filter(e=>e.id!==eventId&&e.offerId),usage=price=>seen.filter(e=>offers.find(item=>item.id===e.offerId)?.amount===price).length;
  const tier=tiers.reduce((best,price)=>usage(price)<usage(best)?price:best,tiers[0]);
  const pool=offers.filter(item=>item.amount===tier),used=new Set(seen.map(e=>e.offerId));
  const fresh=pool.filter(item=>!used.has(item.id)),candidates=fresh.length?fresh:pool;
  let seed=(run?.seed||0)>>>0;for(const char of eventId)seed=(Math.imul(seed,31)+char.charCodeAt(0))>>>0;
  const item=candidates[seed%candidates.length],cost=E.cents(item.amount),available=snapshot.checking+snapshot.reserve;
  const reserveDraw=Math.min(Math.max(0,snapshot.reserve),Math.max(0,cost-snapshot.checking));
  return {...item,canBuy:available>=cost,afterChecking:snapshot.checking-cost+reserveDraw,afterReserve:snapshot.reserve-reserveDraw,reserveDraw};
 }
 function purchase(run,id,buy,snapshot){
  const target=run.events.find(e=>e.id===id&&e.decision==='pending');if(!target||typeof buy!=='boolean'||snapshot.date!==target.date)return run;
  const item=offer(snapshot,run,id);if(buy&&!item.canBuy)return run;
  return {...run,events:run.events.map(e=>e.id!==id?e:{...e,type:buy?'temptation':'covered',decision:buy?'bought':'declined',offerId:item.id,amount:buy?item.amount:0,included:!buy,name:buy?item.name:`Teraz nie: ${item.name}`,icon:item.icon,text:buy?'Tvoj nákup počas simulácie.':'Tento nákup si tentoraz vynechal.'})};
 }
 function loan(snapshot){
  const available=snapshot.available??snapshot.checking+snapshot.reserve;
  const principal=Math.max(300,Math.ceil((-available+20000)/10000)*100),total=E.cents(principal)*11/10;
  return {principal,total:Math.round(total),term:12,payment:Math.round(total/12),cost:Math.round(total)-E.cents(principal)};
 }
 function rescue(run,kind,snapshot){
  if(run.rescue||!['loan','cut','none'].includes(kind)||(snapshot.available??snapshot.checking+snapshot.reserve)>=0)return run;
  return {...run,rescue:{kind,date:snapshot.date,...(kind==='loan'?loan(snapshot):{})}};
 }
 function crisisMonth(projection,run){
  if(run.crisis)return -1;
  let streak=0;
  for(let month=0;month<12;month++){
   const end=projection.days.filter(day=>day.month===month).at(-1);if(!end)continue;
   streak=end.available<0?streak+1:0;if(streak===2)return month;
  }
  return -1;
 }
 function crisisPlan(budget,run){
  const joys=budget.consumption.filter(row=>['outside','clothes','leisure'].includes(row.id));
  const before=joys.reduce((sum,row)=>sum+Math.round(E.cents(row.amount)*(run.rescue?.kind==='cut'?.9:1)),0);
  const after=joys.reduce((sum,row)=>sum+Math.round(E.cents(row.amount)*.3),0);
  return {before,after};
 }
 function activateCrisis(run,snapshot){
  if(run.crisis||(snapshot.available??snapshot.checking+snapshot.reserve)>=0)return run;
  return {...run,crisis:{date:snapshot.date,joyFactor:.3}};
 }
 function turboMonth(projection,run){
  if(!run.crisis||run.turbo)return -1;
  const first=Number(run.crisis.date.slice(5,7))-1+3;
  for(let month=first;month<12;month++)if(projection.days.filter(day=>day.month===month).at(-1)?.available<0)return month;
  return -1;
 }
 function turboPlan(budget){
  return {before:budget.consumption.filter(row=>['outside','clothes','leisure'].includes(row.id)).reduce((sum,row)=>sum+Math.round(E.cents(row.amount)*.3),0),after:0};
 }
 function activateTurbo(run,snapshot,enabled=true){
  if(!run.crisis||run.turbo||typeof enabled!=='boolean'||(snapshot.available??snapshot.checking+snapshot.reserve)>=0)return run;
  const elapsed=Number(snapshot.date.slice(5,7))-Number(run.crisis.date.slice(5,7));if(elapsed<3)return run;
  return {...run,turbo:{date:snapshot.date,enabled}};
 }
 function reserveMonth(projection,run){
  if(run.reservePlan||!(projection.monthlyExpenses>0))return -1;
  for(let month=1;month<11;month++){
   const end=projection.days.filter(day=>day.month===month).at(-1);
   const contributing=projection.monthlyReserveSaving>0||projection.ledger.some(e=>e.surplus&&e.target==='reserve'&&e.amount>0&&e.date<=end?.date);
   if(end&&contributing&&end.checking>=0&&!end.debtRemaining&&end.reserve>=projection.monthlyExpenses*3)return month;
  }
  return -1;
 }
 function directReserve(run,snapshot,share,expenseBase){
  if(run.reservePlan||!Number.isFinite(share)||share<0||share>100||!(expenseBase>0)||snapshot.reserve<expenseBase*3||snapshot.checking<0||snapshot.debtRemaining>0)return run;
  return {...run,reservePlan:{date:snapshot.date,share:Math.round(share),expenseBase}};
 }
 function finish(run,projection=null){
  let completed={...run,rescue:run.rescue||{kind:'none'},events:run.events.map(e=>e.decision==='pending'?{...e,type:'covered',decision:'declined',amount:0,included:true,name:'Nákup vynechaný',text:'Pri dokončení roka bez ďalších volieb sa tento nákup neuskutočnil.'}:e)};
  if(projection){const month=crisisMonth(projection,completed);if(month>=0)completed=activateCrisis(completed,projection.days.filter(day=>day.month===month).at(-1));}
  return completed;
 }
 function timeline(projection,run,month,from=null){
  const days=projection.days.filter(d=>d.month===month),first=days[0];if(!first)return [];
  const previous=projection.days[first.index-1]||{...projection.opening,date:first.date};
  const points=[from?{...from,checkpoint:undefined}:previous];let shortage=false;
  const pending=new Set(run.events.filter(e=>e.decision==='pending').map(e=>e.id));
  for(const day of days){
   if(from&&day.date<from.date)continue;
   for(const entry of day.events){
    if(entry.type==='choice'&&pending.has(entry.eventId))points.push({...entry,checkpoint:{kind:'purchase',eventId:entry.eventId}});
    if(!run.rescue&&!shortage&&entry.available<0&&entry.reserve===0&&month>0){points.push({...entry,checkpoint:{kind:'rescue'}});shortage=true;}
   }
   points.push(day);
  }
  if(crisisMonth(projection,run)===month)points[points.length-1]={...points.at(-1),checkpoint:{kind:'crisis'}};
  else if(turboMonth(projection,run)===month)points[points.length-1]={...points.at(-1),checkpoint:{kind:'turbo'}};
  else if(reserveMonth(projection,run)===month)points[points.length-1]={...points.at(-1),checkpoint:{kind:'reserve'}};
  return points.map(({date,checking,reserve,future,debtRemaining=0,checkpoint})=>({date,checking,reserve,future,debtRemaining,...(checkpoint?{checkpoint}:{})}));
 }
 const api={offers,prepare,reset,offer,purchase,loan,rescue,crisisMonth,crisisPlan,activateCrisis,turboMonth,turboPlan,activateTurbo,reserveMonth,directReserve,finish,timeline};if(typeof module!=='undefined')module.exports=api;root.YearChoices=api;
})(typeof window==='undefined'?globalThis:window);
