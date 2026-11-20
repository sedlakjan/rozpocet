(function(root){
 'use strict';
 // A view of posted ledger entries, in cents. Transfers never count as shopping.
 function summarize(ledger,month,until){
  const rows=new Map(),transfers={drawn:0,reserve:0,future:0},coveredItems=[];
  let spent=0,income=0,covered=0;
  for(const entry of ledger){
   if(!until||!entry.date.startsWith(month)||entry.date>until)continue;
   if(entry.type==='reserveDraw'){transfers.drawn+=entry.amount;continue;}
   if(entry.type==='transfer'){transfers[entry.target]+=entry.amount;continue;}
   if(entry.type==='income'||entry.type==='extraIncome'){
    // The opening salary is already part of the ring's starting balance.
    if(entry.type==='extraIncome'||entry.date!==month+'-01')income+=entry.amount;
    continue;
   }
   if(entry.type==='covered'||entry.type==='insured'){
    covered++;coveredItems.push({name:entry.name,reason:entry.type==='insured'?'Kryté poistením':'Už zahrnuté v mesačnom pláne'});continue;
   }
   if(entry.amount>=0)continue;
   spent-=entry.amount;
   const key=entry.categoryId?'category:'+entry.categoryId:'event:'+(entry.eventId||entry.name);
   const row=rows.get(key)||{key,name:entry.name,icon:entry.icon||'basket',amount:0,extra:['life','temptation','deviation'].includes(entry.type),lastDate:entry.date};
   row.amount-=entry.amount;row.lastDate=entry.date;rows.set(key,row);
  }
  return {rows:[...rows.values()],spent,income,covered,coveredItems,transfers};
 }
 const api={summarize};if(typeof module!=='undefined')module.exports=api;root.BudgetReceipt=api;
})(typeof window==='undefined'?globalThis:window);
