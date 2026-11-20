(function(root){
 'use strict';
 const keys=['checking','reserve','future','debtRemaining'];
 function sample(points,progress){
  const p=Math.max(0,Math.min(1,progress)),position=p*(points.length-1),index=Math.floor(position);
  const from=points[index],to=points[Math.min(index+1,points.length-1)],fraction=position-index;
  const eased=fraction*fraction*(3-2*fraction),value={date:points[Math.max(Math.min(1,points.length-1),Math.ceil(position))].date,progress:p};
  for(const key of keys)value[key]=Math.round((from[key]||0)+((to[key]||0)-(from[key]||0))*eased);
  value.available=value.checking+value.reserve;
  return value;
 }
 function create({requestFrame,cancelFrame,now}){
  let frame=null,active=null,visible=null;
  function reset(){if(frame!==null)cancelFrame(frame);frame=null;active=null;visible=null;}
  function render({id,points,draw,animate=false,duration=2200,onCheckpoint=()=>{}}){
   // Rebind replacement DOM without restarting an unfinished month (e.g. pause).
   if(active?.id===id){active.draw=draw;active.onCheckpoint=onCheckpoint;draw(visible);return;}
   reset();
   const checkpoint=points.findIndex(point=>point.checkpoint),checkpointProgress=checkpoint<0?Infinity:checkpoint/(points.length-1);
   visible=sample(points,animate?0:Math.min(1,checkpointProgress));active={id,points,draw,start:now(),duration,onCheckpoint,held:false};draw(visible);
   function hold(){active.held=true;active.onCheckpoint(points[checkpoint].checkpoint,visible);}
   if(!animate){if(checkpoint>=0)hold();return;}
   function tick(time){
    frame=null;
    const progress=Math.min(1,(time-active.start)/active.duration);
    visible=sample(active.points,Math.min(progress,checkpointProgress));active.draw(visible);
    if(progress>=checkpointProgress){hold();return;}
    if(visible.progress<1)frame=requestFrame(tick);
   }
   frame=requestFrame(tick);
  }
  return {render,reset,busy:()=>!!active&&(active.held||visible?.progress<1),remaining:()=>active?Math.max(0,active.duration-(now()-active.start)):0};
 }
 const api={sample,create};if(typeof module!=='undefined')module.exports=api;root.YearMotion=api;
})(typeof window==='undefined'?globalThis:window);
