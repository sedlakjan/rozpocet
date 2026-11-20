const {test}=require('node:test');
const assert=require('node:assert/strict');
const {create}=require('../simulation-sound');
test('platba má krátky zvuk, mute ho zastaví a husté udalosti sa neprekrikujú',()=>{
 const original=globalThis.AudioContext,tones=[];
 class AudioMock{
  constructor(){this.state='running';this.currentTime=0;this.destination={};AudioMock.instance=this;}
  resume(){this.state='running';return Promise.resolve();}
  suspend(){this.state='suspended';return Promise.resolve();}
  createOscillator(){return {frequency:{setValueAtTime:f=>tones.push(f)},connect(){},start(){},stop(){}};}
  createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};}
 }
 globalThis.AudioContext=AudioMock;
 try{
  const sound=create();sound.play();assert.equal(tones.length,0);sound.unlock();sound.play();assert.equal(tones.length,6);
  sound.play();assert.equal(tones.length,6);AudioMock.instance.currentTime=1;
  sound.toggle();sound.play();assert.equal(tones.length,6);assert.equal(sound.muted,true);
  sound.toggle();sound.play('income');assert.equal(tones.length,8);assert.equal(sound.muted,false);
 }finally{if(original===undefined)delete globalThis.AudioContext;else globalThis.AudioContext=original;}
});
test('bez Web Audio môže simulácia pokračovať bez chyby',()=>{
 const sound=create();assert.doesNotThrow(()=>{sound.unlock();sound.play();sound.toggle();sound.quiet();});
});


test('cinknutie je krátke a všetky tri odhalenia dostanú vlastný zvuk',()=>{
 const original=globalThis.AudioContext,voices=[];
 class AudioMock{
  constructor(){this.state='running';this.currentTime=1;this.destination={};}
  createOscillator(){const voice={frequency:{setValueAtTime(){}},connect(){},start(t){this.startAt=t;},stop(t){this.stopAt=t;}};voices.push(voice);return voice;}
  createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};}
 }
 globalThis.AudioContext=AudioMock;
 try{
  const sound=create();sound.unlock();sound.play('expense');
  assert.equal(voices.length,6);
  assert.ok(Math.max(...voices.map(v=>v.stopAt))-Math.min(...voices.map(v=>v.startAt))<=.125);
  const offset=voices.length;sound.play('reveal');sound.play('reveal');sound.play('reveal');
  assert.equal(voices.length-offset,6);
  const revealed=voices.slice(offset);
  for(let i=0;i<3;i++){
   const pair=revealed.slice(i*2,i*2+2);
   assert.ok(pair[1].stopAt-pair[0].startAt<=.125);
   if(i)assert.ok(pair[0].startAt>revealed[i*2-1].stopAt);
  }
 }finally{if(original===undefined)delete globalThis.AudioContext;else globalThis.AudioContext=original;}
});
