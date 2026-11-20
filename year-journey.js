(function(root){
 'use strict';
 const cache=new WeakMap();
 function months(projection){
  if(cache.has(projection))return cache.get(projection);
  const result=[];
  for(let month=0;month<12;month++){
   const days=projection.days.filter(day=>day.month===month);
   if(!days.length)continue;
   const end=days.at(-1),entries=projection.ledger.filter(e=>e.date.slice(0,7)===end.date.slice(0,7));
   const moments=entries.filter(e=>['life','temptation','deviation','extraIncome','insured','loanPayment','reserveBonus'].includes(e.type));
   const featured=moments.reduce((best,e)=>!best||Math.abs(e.amount)>Math.abs(best.amount)?e:best,null);
   result.push({month,endIndex:end.index,date:end.date,checking:end.checking,reserve:end.reserve,future:end.future,debtRemaining:end.debtRemaining||0,
    available:end.checking+end.reserve,firstGap:days.find(day=>day.low<0)?.date||null,
    spent:entries.filter(e=>e.amount<0).reduce((sum,e)=>sum-e.amount,0),
    drawn:entries.filter(e=>e.type==='reserveDraw').reduce((sum,e)=>sum+e.amount,0),featured});
  }
  cache.set(projection,result);return result;
 }
 function nextIndex(projection,cursor){return months(projection).find(month=>month.endIndex>cursor)?.endIndex??projection.days.length-1;}
 function frames(projection,month){
  const days=projection.days.filter(day=>day.month===month),first=days[0];
  if(!first)return [];
  const previous=projection.days[first.index-1]||{...projection.opening,date:first.date};
  return [previous,...days].map(day=>({date:day.date,checking:day.checking,reserve:day.reserve,future:day.future}));
 }
 function scale(projection){return Math.max(1,Math.abs(projection.opening.available),...projection.days.map(day=>Math.abs(day.checking+day.reserve)));}
 const api={months,nextIndex,scale,frames};if(typeof module!=='undefined')module.exports=api;root.YearJourney=api;
})(typeof window==='undefined'?globalThis:window);
