(function(root){
 'use strict';
 const total=balances=>balances.checking+balances.reserve+balances.future;
 function month(projection){
  const end=projection.days[30],prefix=end.date.slice(0,7);
  const entries=projection.ledger.filter(e=>e.date.startsWith(prefix));
  const sum=type=>entries.filter(e=>e.type===type).reduce((n,e)=>n+Math.abs(e.amount),0);
  const drawn=sum('reserveDraw'),saved=entries.filter(e=>e.type==='transfer'&&e.target==='reserve').reduce((n,e)=>n+e.amount,0);
  const firstGap=projection.days.slice(0,31).find(day=>day.checkingLow<0);
  const outcome=firstGap?'gap':drawn?'reserve':'own';
  const reserveChange=end.reserve-projection.opening.reserve;
  const tone=firstGap||reserveChange<0?'red':drawn?'yellow':'green';
  return {end,drawn,saved,reserveChange,tone,firstGap:firstGap?.date||null,outcome,
   overspending:sum('deviation'),life:sum('life')+sum('temptation'),
   wealthChange:total(end)-total(projection.opening),
   plannedSaving:entries.filter(e=>e.type==='transfer'&&e.target==='reserve').reduce((n,e)=>n+e.planned,0)};
 }
 function compare(current,previous){return (total(current.days[30])-total(current.opening))-(total(previous.days[30])-total(previous.opening));}
 const api={month,compare};if(typeof module!=='undefined')module.exports=api;root.JourneyInsights=api;
})(typeof window==='undefined'?globalThis:window);
