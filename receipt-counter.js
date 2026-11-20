(function(root){
 'use strict';
 function create({requestFrame,cancelFrame,now,format}){
  let frame=null;
  const values=new Map();
  function cancel(){if(frame!==null)cancelFrame(frame);frame=null;}
  function reset(){cancel();values.clear();}
  function render(items,animate=true){
   cancel();
   const start=now(),pending=[];
   for(const item of items){
    const from=values.get(item.key)??0;
    if(!animate||from===item.value){values.set(item.key,item.value);item.set(format(item.value,item.value));}
    else{item.set(format(from,item.value));pending.push({...item,from});}
   }
   function tick(time){
    frame=null;
    const progress=Math.max(0,Math.min(1,(time-start)/280)),eased=1-Math.pow(1-progress,3);
    for(const item of pending){
     const value=progress===1?item.value:Math.round(item.from+(item.value-item.from)*eased);
     values.set(item.key,value);item.set(format(value,item.value));
    }
    if(progress<1)frame=requestFrame(tick);
   }
   if(pending.length)frame=requestFrame(tick);
  }
  return {render,reset};
 }
 const api={create};if(typeof module!=='undefined')module.exports=api;root.ReceiptCounter=api;
})(typeof window==='undefined'?globalThis:window);
