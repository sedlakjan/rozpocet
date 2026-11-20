(function(root){
 'use strict';
 function create(){
  let context=null,muted=false,last=-Infinity,lastEnd=0,resuming=null;
  function unlock(){
   if(muted)return;
   try{const Audio=root.AudioContext||root.webkitAudioContext;if(!Audio)return;context??=new Audio();if(context.state==='suspended')resuming=context.resume().catch(()=>{});}catch{}
  }
  function toggle(){muted=!muted;if(muted){context?.suspend().catch(()=>{});}else unlock();return muted;}
  function play(kind='expense'){
   if(muted||!context)return;
   if(context.state!=='running'){
    if(resuming)resuming.then(()=>{if(!muted&&context.state==='running')play(kind);});
    return;
   }
   const now=context.currentTime;
   if(kind!=='reveal'&&now-last<.2)return;
   const origin=Math.max(now,lastEnd+.006);last=now;
   // Two tiny coin strikes. Inharmonic overtones give the payment a metallic
   // attack, without a long notification tail. Each cue lasts at most 125 ms.
   const coin=kind==='expense';
   const notes=coin?[1850,2450]:kind==='reveal'?[1050,1575]:kind==='income'?[740,1110]:[520,780];
   const gap=coin ? .04 : .035,duration=coin ? .075 : .085;
   notes.forEach((frequency,index)=>{
    const partials=coin?[[1,.027],[2.71,.009],[4.1,.004]]:[[1,.028]];
    partials.forEach(([ratio,volume])=>{
     const oscillator=context.createOscillator(),gain=context.createGain(),start=origin+index*gap;
     oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency*ratio,start);
     gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(volume,start+.002);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
     oscillator.connect(gain);gain.connect(context.destination);oscillator.start(start);oscillator.stop(start+duration+.005);
    });
   });
   lastEnd=origin+gap+duration+.005;
  }
  function quiet(){context?.suspend().catch(()=>{});}
  return {unlock,toggle,play,quiet,get muted(){return muted;}};
 }
 const api={create};if(typeof module!=='undefined')module.exports=api;root.SimulationSound=api;
})(typeof window==='undefined'?globalThis:window);
