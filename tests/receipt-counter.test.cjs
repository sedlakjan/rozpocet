const {test}=require('node:test');
const assert=require('node:assert/strict');
const {create}=require('../receipt-counter');

function setup(){
 let time=0,id=0;const frames=new Map(),shown=new Map();
 const counter=create({requestFrame:fn=>{frames.set(++id,fn);return id;},cancelFrame:id=>frames.delete(id),now:()=>time,format:n=>n});
 const render=(value,animate=true)=>counter.render([{key:'food',value,set:n=>shown.set('food',n)}],animate);
 const advance=ms=>{time+=ms;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(time));};
 return {counter,render,advance,shown,frames};
}
test('nová suma dobehne z nuly, ďalšia z poslednej sumy a skončí na presnom cente',()=>{
 const h=setup();h.render(10001);assert.equal(h.shown.get('food'),0);
 h.advance(140);const halfway=h.shown.get('food');assert.ok(halfway>0&&halfway<10001);
 h.advance(140);assert.equal(h.shown.get('food'),10001);assert.equal(h.frames.size,0);
 h.render(15003);assert.equal(h.shown.get('food'),10001);h.advance(280);assert.equal(h.shown.get('food'),15003);
 h.render(15003);assert.equal(h.frames.size,0);
});
test('prerušený prepočet pokračuje od zobrazenej hodnoty bez preskoku a reset zruší staré snímky',()=>{
 const h=setup();h.render(10000);h.advance(70);const visible=h.shown.get('food');
 h.render(20000);assert.equal(h.shown.get('food'),visible);assert.equal(h.frames.size,1);
 h.advance(280);assert.equal(h.shown.get('food'),20000);
 h.render(30000);h.counter.reset();assert.equal(h.frames.size,0);
 h.render(500);assert.equal(h.shown.get('food'),0);h.advance(280);assert.equal(h.shown.get('food'),500);
});
test('obmedzený pohyb zobrazí konečnú sumu okamžite a zruší rozbehnutú animáciu',()=>{
 const h=setup();h.render(10000);h.advance(70);h.render(10000,false);
 assert.equal(h.shown.get('food'),10000);assert.equal(h.frames.size,0);
});
