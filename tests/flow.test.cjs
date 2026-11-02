const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function harness({reduced=true}={}){
 const nodes=new Map(),handlers={};
 const node=s=>{if(!nodes.has(s))nodes.set(s,{innerHTML:'',style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){},focus(){},scrollIntoView(){},showModal(){this.open=true;},close(){this.open=false;}});return nodes.get(s);};
 const document={querySelector:node,querySelectorAll:()=>[],addEventListener:(n,f)=>handlers[n]=f};
 const context={BudgetEngine:require('../engine'),YearEngine:require('../year-engine'),BudgetAdvice:require('../final-content'),document,window:{scrollTo(){},addEventListener(){}},matchMedia:()=>({matches:reduced,addEventListener(){}}),crypto:require('node:crypto').webcrypto,setTimeout:()=>0,clearTimeout(){},console};
 vm.runInNewContext(fs.readFileSync(require.resolve('../app'),'utf8'),context);
 return {node,input:target=>handlers.input({target}),click:(action,extra={})=>handlers.click({target:{closest:()=>({dataset:{action,...extra}})}}),submit:()=>handlers.submit({target:{id:'annual-budget'},preventDefault(){}})};
}
test('celý postup od úvodu po výsledok a opakovanie bez zmeny udalostí',()=>{
 const h=harness(),html=()=>h.node('#journey').innerHTML;
 assert.match(html(),/Ako tvoj rozpočet/);h.click('begin');assert.match(html(),/Predvyplnené údaje sú vymyslené/);h.submit();assert.match(html(),/disabled/);h.input({id:'discipline-scale',value:'6'});h.click('start-year');
 const balances=()=>html().match(/<div class="three-balances">(.*?)<p class="balance-explain">/s)[1];const initial=balances();
 for(let i=0;i<3;i++)h.click('reveal');assert.equal(balances(),initial);assert.match(html(),/3 \/ 3 udalosti/);assert.match(html(),/Prehrať január/);
 const cards=html().match(/<div class="reveal-grid">(.*?)<div class="flow-actions/s)[1];
 h.click('skip');assert.notEqual(balances(),initial);h.click('rest');h.click('skip');h.click('results');assert.match(html(),/Čo ukázal tvoj rok/);
 h.click('retry');h.submit();for(let i=0;i<3;i++)h.click('reveal');assert.equal(html().match(/<div class="reveal-grid">(.*?)<div class="flow-actions/s)[1],cards);assert.match(html(),/Pôvodný pokus, rovnaké udalosti/);
});
test('prehrať znova nemení januárový výsledok',()=>{const h=harness();h.click('begin');h.submit();h.input({id:'discipline-scale',value:'1'});h.click('start-year');for(let i=0;i<3;i++)h.click('reveal');h.click('skip');const first=h.node('#journey').innerHTML;h.click('restart');h.click('skip');assert.equal(h.node('#journey').innerHTML,first);});
test('mzda je hore ako mesačný príjem; sekcia pravidelných príjmov je preč',()=>{
 const h=harness();h.click('begin');const html=h.node('#journey').innerHTML;
 assert.match(html,/salary-row/);assert.match(html,/čistý mesačný príjem/);assert.doesNotMatch(html,/Pravidelné príjmy/);assert.match(html,/Už mám niečo na účte/);
 assert.match(html,/type="range" min="750" max="3000"[^>]*value="1200"/);
 assert.ok(html.indexOf('<strong>Poistenia</strong>')<html.indexOf('<strong>Rezerva</strong>'));
 assert.match(html,/<span class="group-index">03<\/span><span><strong>Poistenia/);
});
test('škála nemá predvolenú odpoveď a po interakcii umožní pokračovať',()=>{
 const h=harness();h.click('begin');h.submit();const html=h.node('#journey').innerHTML;
 assert.match(html,/id="discipline-scale" type="range"/);assert.match(html,/Zatiaľ bez odpovede/);assert.doesNotMatch(html,/class="answer /);
 h.input({id:'discipline-scale',value:'6'});assert.equal(h.node('#journey [data-action="start-year"]').disabled,false);assert.match(h.node('#scale-value').innerHTML,/Takmer vždy/);h.click('start-year');assert.match(h.node('#journey').innerHTML,/Január/);
});
test('ručný výdavok nad rozsah rozšíri posuvník a zmení mesačný súčet',()=>{
 const h=harness();h.click('begin');const slider={style:{setProperty(){}}},number={};const pair={querySelector:s=>s==='[type=number]'?number:slider};
 h.input({type:'number',dataset:{key:'fixed',id:'housing',field:'amount'},validity:{valid:true},value:'5200.25',closest:()=>pair});
 assert.equal(number.value,5200.25);assert.equal(slider.value,5200.25);assert.ok(slider.max>=5200.25);assert.match(h.node('#monthly-summary').innerHTML,/5\s775,25/);
});
test('odhalenie a preskočenie efektu nemení zostatky ani nestratí udalosť',()=>{
 const h=harness({reduced:false});h.click('begin');h.submit();h.input({id:'discipline-scale',value:'4'});h.click('start-year');
 const balance=()=>h.node('#journey').innerHTML.match(/<div class="three-balances">(.*?)<p class="balance-explain">/s)[1];const initial=balance();
 for(let i=0;i<3;i++){h.click('reveal');assert.equal(h.node('#event-reveal').open,true);assert.match(h.node('#event-reveal').innerHTML,/event-reveal-card/);h.click('finish-reveal');assert.equal(h.node('#event-reveal').open,false);assert.equal(balance(),initial);}
 assert.match(h.node('#journey').innerHTML,/3 \/ 3 udalosti/);assert.match(h.node('#journey').innerHTML,/event-caption/);
});
test('koncový bod grafu ukazuje bežný účet a kategórie pribudnú pri prehratí',()=>{
 const h=harness();h.click('begin');h.submit();h.input({id:'discipline-scale',value:'6'});h.click('start-year');
 assert.doesNotMatch(h.node('#journey').innerHTML,/class="end-balance"/);
 for(let i=0;i<3;i++)h.click('reveal');h.click('skip');
 const html=h.node('#journey').innerHTML,checking=html.match(/<div class="three-balances"><div><span>Bežný účet<\/span><strong[^>]*>(.*?)<\/strong>/s)[1];
 assert.ok(html.includes('aria-label="Zostatok bežného účtu '+checking+'"'));assert.match(html,/category-badge/);assert.match(html,/category-legend/);assert.match(html,/Potraviny/);assert.match(html,/Telefón/);
});
test('nový záver zobrazí tri zostatky, porovnanie a tri funkčné modálne okná',()=>{
 const h=harness();h.click('begin');h.submit();h.input({id:'discipline-scale',value:'6'});h.click('start-year');for(let i=0;i<3;i++)h.click('reveal');h.click('skip');h.click('rest');h.click('skip');h.click('results');
 const html=h.node('#journey').innerHTML;
 assert.match(html,/class="final-hero"/);for(const key of ['checking','reserve','future'])assert.ok(html.includes('data-final-balance="'+key+'"'));
 assert.match(html,/Na začiatku/);assert.match(html,/Na konci/);assert.match(html,/Začiatok už zahŕňa januárovú mzdu/);assert.equal((html.match(/data-action="advice"/g)||[]).length,3);
 for(const key of ['saving','spending','shortage']){h.click('advice',{advice:key});assert.equal(h.node('#info-dialog').open,true);assert.match(h.node('#info-dialog').innerHTML,/SKÚS JEDNU VEC/);h.click('close-info');assert.equal(h.node('#info-dialog').open,false);assert.equal(h.node('#journey').innerHTML,html);}
 h.click('retry');h.submit();for(let i=0;i<3;i++)h.click('reveal');h.click('skip');h.click('rest');h.click('skip');h.click('results');assert.match(h.node('#journey').innerHTML,/Pred úpravou/);assert.match(h.node('#journey').innerHTML,/Po úprave/);
});
test('nové poradie formulára, stav simulácie a úvod celého roka',()=>{
 const h=harness({reduced:false});h.click('begin');let html=h.node('#journey').innerHTML;
 assert.match(html,/class="opening-cash" hidden/);assert.doesNotMatch(html,/Niečo platíš iba raz za čas/);
 assert.ok(html.indexOf('Nepravidelné príjmy')<html.indexOf('Pravidelné výdavky'));
 h.submit();h.input({id:'discipline-scale',value:'6'});h.click('start-year');
 assert.match(h.node('#journey').innerHTML,/Čo možno prinesie mesiac/);
 for(let i=0;i<3;i++){h.click('reveal');h.click('finish-reveal');}h.click('play');
 html=h.node('#journey').innerHTML;assert.match(html,/Simulujem mesiac/);assert.match(html,/simulation-spinner/);assert.doesNotMatch(html,/Pozastaviť/);
 h.click('skip');h.click('rest');assert.equal(h.node('#year-intro').open,true);assert.match(h.node('#year-intro').innerHTML,/ako by sa vyvíjal/);
});
