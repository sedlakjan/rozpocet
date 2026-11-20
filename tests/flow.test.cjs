const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const revealedEvents=html=>JSON.stringify([...html.matchAll(/data-event-id="([^"]+)"/g)].map(match=>match[1]));
const renderedBalances=html=>JSON.stringify([...html.matchAll(/data-balance="(checking|reserve|future)" data-value="(-?\d+)"/g)].map(m=>[m[1],Number(m[2])]));
test('podoba sa volí na úvode a drží sa aj pri opakovaní mesiaca',()=>{
 const h=harness(),html=()=>h.node('#journey').innerHTML;
 h.click('gender',{character:'jozko',gender:'female'});assert.match(html(),/jozka.png/);assert.match(html(),/Jožka/);
 h.click('choose-character',{character:'jozko'});assert.match(html(),/<h2>Jožka<\/h2>/);
 assert.doesNotMatch(html(),/flow-progress|data-action="gender"/);
 assert.match(html(),/Nastav správanie svojej postavy/);
 h.input({dataset:{characterField:'income'},value:'1500'});h.input({dataset:{characterField:'reserve'},value:'500'});h.input({dataset:{characterField:'future'},value:'80'});h.input({dataset:{characterField:'discipline'},value:'6'});
 h.click('character-start');h.click('skip');const balances=renderedBalances(html());
 h.click('character-retry');assert.match(html(),/<h2>Jožka<\/h2>/);assert.doesNotMatch(html(),/data-action="gender"|data-character-field="income"/);assert.match(html(),/1\s100/);assert.match(html(),/value="500"/);assert.match(html(),/value="80"/);
 h.click('character-start');h.click('skip');assert.equal(renderedBalances(html()),balances);
 for(const [character,gender,name] of [['ferko','female','Ferka'],['janka','male','Janko']]){h.click('home');h.click('gender',{character,gender});h.click('choose-character',{character});assert.ok(html().includes('<h2>'+name+'</h2>'));}
});
test('postava prejde mesiacom, zmena správania zachová externé udalosti a vlastný rozpočet resetuje režim',()=>{
 const h=harness(),html=()=>h.node('#journey').innerHTML;
 h.click('choose-character',{character:'janka'});assert.match(html(),/<h2>Janka<\/h2>/);
 assert.match(html(),/Ako často sa bude držať svojho rozpočtu\?/);
 h.input({dataset:{characterField:'future'},value:'100'});assert.match(h.node('#character-budget-summary').innerHTML,/Do rezervy/);
 h.click('character-start');for(let i=0;i<3;i++)h.click('reveal');h.click('skip');assert.match(html(),/Január za tebou/);
 h.click('character-retry');assert.match(html(),/Zopakovať mesiac s novým plánom/);
 const plan=h.node('#character-budget-summary').innerHTML,basket=h.node('#character-basket').innerHTML;
 assert.doesNotMatch(plan,/Nákupy nad plán/i);
 h.input({dataset:{characterField:'discipline'},value:'6'});
 assert.match(h.node('#discipline-label').innerHTML,/Vždy/);
 assert.equal(h.node('#character-budget-summary').innerHTML,plan);assert.equal(h.node('#character-basket').innerHTML,basket);
 h.click('character-start');for(let i=0;i<3;i++)h.click('reveal');h.click('skip');assert.match(html(),/Zmena rezervy za mesiac/);
 assert.doesNotMatch(html(),/data-action="help"/);
 h.click('rest');h.click('skip');assert.doesNotMatch(html(),/data-action="help"/);
 h.click('results');assert.match(html(),/data-action="help">Ako to funguje/);
 h.click('help');assert.match(h.node('#info-dialog').innerHTML,/80 %, 55 %/);h.click('close-info');
 h.click('retry');assert.match(html(),/character-settings/);
 h.click('home');h.click('begin');assert.match(html(),/annual-budget/);assert.doesNotMatch(html(),/character-settings/);
});
test('rýchly výber vymení postavu priamo na obrazovke nastavení',()=>{
 const h=harness(),journey=h.node('#journey'),picker=h.node('#character-picker');
 h.click('choose-character',{character:'jozko'});
 h.click('open-character-picker');
 assert.equal(picker.open,true);
 assert.match(picker.innerHTML,/data-character="jozko" disabled/);
 h.click('close-character-picker');
 assert.equal(picker.open,false);
 assert.match(journey.innerHTML,/<h2>Jožko<\/h2>/);
 h.click('open-character-picker');h.click('choose-character',{character:'ferko'});
 assert.equal(picker.open,false);
 assert.match(journey.innerHTML,/<h2>Ferko<\/h2>/);
 assert.doesNotMatch(journey.innerHTML,/character-grid/);
});
function harness({reduced=true,clock=false,motion=false,scenario=null}={}){
 let motionFrame=null,motionBusy=false;
 let time=0,timerId=0;const timers=new Map();
 const nodes=new Map(),handlers={},sounds=[];
 const node=s=>{if(!nodes.has(s))nodes.set(s,{innerHTML:'',querySelector:selector=>node(selector),querySelectorAll:()=>[],style:{setProperty(name,value){this[name]=value;}},classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){},focus(){},scrollIntoView(){},showModal(){this.open=true;},close(){this.open=false;}});return nodes.get(s);};
 const document={querySelector:node,querySelectorAll:()=>[],addEventListener:(n,f)=>handlers[n]=f};
 const context={YearChoices:require('../year-choices'),YearJourney:require('../year-journey'),SimulationSound:{create:()=>({muted:false,unlock(){},play:kind=>sounds.push(kind),toggle(){this.muted=!this.muted;}})},JourneyInsights:require('../journey-insights'),BudgetReceipt:require('../receipt'),BudgetCharacters:require('../characters'),BudgetEngine:require('../engine'),YearEngine:require('../year-engine'),BudgetAdvice:require('../final-content'),document,window:{scrollTo(){},addEventListener(){}},matchMedia:()=>({matches:reduced,addEventListener(){}}),crypto:require('node:crypto').webcrypto,setTimeout:(fn,delay)=>{if(!clock)return 0;timers.set(++timerId,{fn,at:time+delay});return timerId;},clearTimeout:id=>timers.delete(id),console};
 if(scenario)context.BudgetCharacters={...context.BudgetCharacters,scenario};
 if(motion)Object.assign(context,{ReceiptCounter:require('../receipt-counter'),YearMotion:{create:()=>({render:options=>{motionFrame=options;},reset:()=>{motionBusy=false;},busy:()=>motionBusy,remaining:()=>1000})},requestAnimationFrame:()=>0,cancelAnimationFrame(){},performance:{now:()=>time}});
 vm.runInNewContext(fs.readFileSync(require.resolve('../app'),'utf8'),context);
 const advance=ms=>{const end=time+ms;for(let i=0;i<100;i++){const next=[...timers].filter(([,v])=>v.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;timers.delete(next[0]);time=next[1].at;next[1].fn();}time=end;};
 const checkpoint=kind=>{const point=motionFrame?.points.find(p=>p.checkpoint?.kind===kind);if(!point)return null;motionBusy=true;const {date,checking,reserve,future,debtRemaining}=point;motionFrame.onCheckpoint(point.checkpoint,{date,checking,reserve,future,debtRemaining,available:checking+reserve,progress:.5});return point;};
 return {node,sounds,advance,checkpoint,motion:()=>motionFrame,input:target=>handlers.input({target}),click:(action,extra={})=>handlers.click({target:{closest:()=>({dataset:{action,...extra}})}}),submit:()=>handlers.submit({target:{id:'annual-budget'},preventDefault(){}})};
}
test('späť a ďalej obnoví január aj celý rok bez nového prehrávania',()=>{
 const h=harness(),html=()=>h.node('#journey').innerHTML;
 h.click('choose-character',{character:'ferko'});h.click('character-start');h.click('skip');
 const january=renderedBalances(html());
 h.click('rest');h.click('skip');const year=html();
 h.click('results');const final=html(),sounds=[...h.sounds];
 h.click('screen-back');assert.equal(html(),year);
 h.click('screen-back');assert.equal(renderedBalances(html()),january);
 h.click('screen-back');assert.match(html(),/money-ring/);assert.match(html(),/Účtenka za január/);assert.doesNotMatch(html(),/month-finale/);
 assert.equal(renderedBalances(html()),january);
 h.click('screen-back');assert.match(html(),/character-settings/);
 h.click('character-start');assert.equal(renderedBalances(html()),january);
 h.click('screen-forward');assert.match(html(),/month-finale/);
 h.click('rest');assert.equal(html(),year);
 h.click('results');assert.equal(html(),final);assert.deepEqual(h.sounds,sounds);
});
test('zmena nastavenia po návrate zruší uložený ďalší priebeh',()=>{
 const h=harness();
 h.click('choose-character',{character:'ferko'});h.click('character-start');h.click('skip');
 h.click('screen-back');h.click('screen-back');
 h.input({dataset:{characterField:'reserve'},value:'0'});
 assert.doesNotMatch(h.node('#screen-navigation').innerHTML,/screen-forward/);
 h.click('character-start');
 assert.match(h.node('#journey').innerHTML,/Odhaľ mesačný výdavok/);
 assert.match(h.node('#journey').innerHTML,/data-balance="reserve" data-value="0"/);
});
test('celý postup od úvodu po výsledok a opakovanie bez zmeny udalostí',()=>{
 const h=harness(),html=()=>h.node('#journey').innerHTML;
 assert.match(html(),/Výplata príde/);h.click('begin');assert.match(html(),/Predvyplnené údaje sú vymyslené/);h.submit();assert.match(html(),/disabled/);h.input({id:'discipline-scale',value:'6'});h.click('start-year');
 const balances=()=>renderedBalances(html());const initial=balances();
 assert.equal(balances(),initial);assert.doesNotMatch(html(),/prediction/);assert.match(html(),/Odhaľ mesačný výdavok/);
 const cards=revealedEvents(html());
 h.click('skip');assert.notEqual(balances(),initial);h.click('rest');h.click('skip');h.click('results');assert.match(html(),/Čo ukázal tvoj rok/);
 h.click('retry');h.submit();for(let i=0;i<3;i++)h.click('reveal');assert.equal(revealedEvents(html()),cards);assert.match(html(),/payment-stream/);
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
test('tri náhodné udalosti sa ukážu po jednej a pauza nemení zostatky',()=>{
 const h=harness({reduced:false});h.click('choose-character',{character:'ferko'});h.click('character-start');
 h.click('reveal');for(let i=0;i<3;i++)h.click('next-event');
 const balance=()=>renderedBalances(h.node('#journey').innerHTML),initial=balance();
 assert.match(h.node('#journey').innerHTML,/Pozastaviť mesiac/);
 assert.doesNotMatch(h.node('#journey').innerHTML,/prediction|mystery-grid/);
 h.click('play');assert.equal(balance(),initial);assert.match(h.node('#journey').innerHTML,/Pokračovať/);
 h.click('skip');assert.match(h.node('#journey').innerHTML,/month-finale/);
});

test('koncový bod grafu ukazuje bežný účet a kategórie pribudnú pri prehratí',()=>{
 const h=harness();h.click('begin');h.submit();h.input({id:'discipline-scale',value:'6'});h.click('start-year');
 assert.doesNotMatch(h.node('#journey').innerHTML,/class="end-balance"/);
 for(let i=0;i<3;i++)h.click('reveal');h.click('skip');
 const html=h.node('#journey').innerHTML,checking=html.match(/data-balance="checking" data-value="(-?\d+)"/)[1];
 assert.ok(Number.isFinite(Number(checking)));assert.match(html,/class="month-finale"/);assert.doesNotMatch(html,/category-legend/);assert.match(html,/Účtenka za január/);assert.match(html,/Potraviny/);assert.match(html,/Telefón/);
});
test('nový záver zobrazí tri zostatky, porovnanie a tri funkčné modálne okná',()=>{
 const h=harness();h.click('begin');h.submit();h.input({id:'discipline-scale',value:'6'});h.click('start-year');for(let i=0;i<3;i++)h.click('reveal');h.click('skip');h.click('rest');h.click('skip');h.click('results');
 const html=h.node('#journey').innerHTML;
 assert.match(html,/class="final-hero"/);for(const key of ['checking','reserve','future'])assert.ok(html.includes('data-final-balance="'+key+'"'));
 assert.equal((html.match(/data-balance-trend=/g)||[]).length,2);assert.match(html,/data-balance-trend="reserve"/);assert.match(html,/data-balance-trend="future"/);assert.doesNotMatch(html,/data-balance-trend="checking"|NaN/);
 assert.match(html,/Na začiatku/);assert.match(html,/Na konci/);assert.equal((html.match(/class="final-comparison"/g)||[]).length,1);assert.doesNotMatch(html,/class="before-after"|class="final-balances"|januárovú mzdu/);assert.equal((html.match(/data-action="advice"/g)||[]).length,3);
 for(const key of ['saving','spending','shortage']){h.click('advice',{advice:key});assert.equal(h.node('#info-dialog').open,true);assert.match(h.node('#info-dialog').innerHTML,/SKÚS JEDNU VEC/);h.click('close-info');assert.equal(h.node('#info-dialog').open,false);assert.equal(h.node('#journey').innerHTML,html);}
 h.click('retry');h.submit();for(let i=0;i<3;i++)h.click('reveal');h.click('skip');h.click('rest');h.click('skip');h.click('results');assert.match(h.node('#journey').innerHTML,/Pred úpravou/);assert.match(h.node('#journey').innerHTML,/Po úprave/);
});
test('nové poradie formulára, stav simulácie a úvod celého roka',()=>{
 const h=harness({reduced:false});h.click('begin');let html=h.node('#journey').innerHTML;
 assert.match(html,/class="opening-cash" hidden/);assert.doesNotMatch(html,/Niečo platíš iba raz za čas/);
 assert.ok(html.indexOf('Nepravidelné príjmy')<html.indexOf('Pravidelné výdavky'));
 h.submit();h.input({id:'discipline-scale',value:'6'});h.click('start-year');
 h.click('reveal');for(let i=0;i<3;i++)h.click('next-event');
 assert.match(h.node('#journey').innerHTML,/Pozastaviť mesiac/);
 html=h.node('#journey').innerHTML;assert.match(html,/Pozastaviť mesiac/);assert.match(html,/simulation-spinner/);assert.match(html,/payment-stage/); assert.match(html,/receipt-list/);
 h.click('skip');h.click('rest');assert.equal(h.node('#year-intro').open,true);assert.match(h.node('#year-intro').innerHTML,/ako by sa vyvíjal/);
});

test('modrý úvod dobehne, odkryje január a až po pokojnom rozbehu spustí február',()=>{
 const h=harness({reduced:false,clock:true}),html=()=>h.node('#journey').innerHTML;
 h.click('choose-character',{character:'ferko'});h.click('character-start');h.click('skip');h.click('rest');
 h.advance(2600);assert.equal(h.node('#year-intro').open,true);assert.match(html(),/<h1 tabindex="-1">Január/);
 h.advance(500);assert.equal(h.node('#year-intro').open,false);assert.match(html(),/<h1 tabindex="-1">Január/);
 h.advance(1899);assert.match(html(),/<h1 tabindex="-1">Január/);
 h.advance(1);assert.match(html(),/<h1 tabindex="-1">Február/);
 h.advance(4699);assert.match(html(),/<h1 tabindex="-1">Február/);
 h.advance(1);assert.match(html(),/<h1 tabindex="-1">Marec/);
});


test('január má jediný hlavný zostatok, účtenku bez presunov medzi nákupmi a uzavretie mesiaca',()=>{
 const h=harness();h.click('choose-character',{character:'ferko'});h.click('character-start');
 let html=h.node('#journey').innerHTML;
 assert.equal((html.match(/data-balance="checking"/g)||[]).length,1);
 assert.doesNotMatch(html,/annual-available|three-balances|category-legend|balance-explain|class="moment"|UŽ PREŠLO ÚČTOM/);
 assert.match(html,/payment-stream/);assert.doesNotMatch(html,/SPOLU MINUTÉ/);
 for(let i=0;i<3;i++)h.click('reveal');h.click('skip');html=h.node('#journey').innerHTML;
 assert.match(html,/JANUÁR VYBAVENÝ/);assert.match(html,/31 \/ 31 dní/);assert.match(html,/SPOLU MINUTÉ/);
 assert.doesNotMatch(html,/data-month-disclosure="events"|debrief-cause|guess-result/);
 assert.doesNotMatch(html,/receipt-row[^>]*>[^]*?Presun z rezervy[^]*?<\/strong><\/div>/);
 assert.doesNotMatch(html,/NaN|undefined/);
});


test('postava má pevný príjem, skryté predvoľby a rezervu 0 až 1000 eur po stovkách',()=>{
 const h=harness();h.click('choose-character',{character:'ferko'});
 const html=h.node('#journey').innerHTML;
 assert.match(html,/<div class="preset-section" hidden>/);
 assert.doesNotMatch(html,/data-character-field="income"/);
 assert.match(html,/data-character-field="reserve" type="range" min="0" max="1000" step="100" value="1000"/);
 const summary=h.node('#character-budget-summary').innerHTML;
 h.input({dataset:{characterField:'income'},value:'3000'});
 assert.equal(h.node('#character-budget-summary').innerHTML,summary);
 for(const [input,expected] of [['0','0'],['300','300'],['1000','1\\s000'],['1300','1\\s000']]){
  h.input({dataset:{characterField:'reserve'},type:'range',value:input});
  assert.match(h.node('#character-reserve-value').textContent,new RegExp(expected));
  assert.equal(h.node('#character-reserve-shield').style['--reserve-level'],Math.min(1,Number(input)/1000));
 }
 h.click('character-start');assert.match(h.node('#journey').innerHTML,/data-balance="checking" data-value="160000"/);
 assert.match(h.node('#journey').innerHTML,/data-balance="reserve" data-value="100000"/);
});

test('odkladanie aktualizuje mesačný pás a košík priamo na obrazovke',()=>{
 const h=harness();h.click('choose-character',{character:'ferko'});
 const initial=h.node('#character-basket').innerHTML;
 assert.match(initial,/class="basket-chart"/);assert.match(initial,/<svg[^>]+role="img"/);
 assert.equal((initial.match(/<path /g)||[]).length,8);
 assert.match(initial,/Bývanie a energie/);assert.match(initial,/Potraviny/);
 h.input({dataset:{characterField:'future'},value:'100'});
 assert.match(h.node('[data-allocation-value="save"]').textContent,/270/);
 assert.match(h.node('[data-allocation-value="future"]').textContent,/270/);
 assert.match(h.node('[data-allocation-value="joy"]').textContent,/140/);
 assert.equal(h.node('[data-allocation-segment="save"]').style.width,'16.875%');
 const updated=h.node('#character-basket').innerHTML;
 assert.notEqual(updated,initial);assert.doesNotMatch(updated,/NaN|undefined/);
 assert.match(updated,/520/);assert.match(updated,/270/);
});

test('sporenie na budúcnosť má vlastné nastavenie, rozdelenie aj zachovaný ďalší pokus',()=>{
 const h=harness();h.click('choose-character',{character:'ferko'});
 assert.match(h.node('#journey').innerHTML,/data-character-field="goalShare"/);
 assert.match(h.node('#character-budget-summary').innerHTML,/Na budúcnosť/);
 h.input({dataset:{characterField:'goalShare'},value:'100'});
 assert.match(h.node('[data-allocation-value="save"]').textContent,/0/);
 assert.match(h.node('[data-allocation-value="future"]').textContent,/270/);
 h.click('character-start');h.click('skip');h.click('character-retry');
 assert.match(h.node('#journey').innerHTML,/data-character-field="goalShare"[^>]*value="100"/);
 h.input({dataset:{characterField:'future'},value:'0'});assert.equal(h.node('#character-goalShare').disabled,true);
});

test('obe obálky sú viditeľné aj pri nule počas januára, v jeho výsledku aj pri ročnom kruhu',()=>{
 const h=harness(),html=()=>h.node('#journey').innerHTML;
 h.click('choose-character',{character:'ferko'});h.input({dataset:{characterField:'goalShare'},value:'0'});h.click('character-start');
 assert.match(html(),/class="pocket-future" data-balance="future" data-value="0"/);assert.match(html(),/Platby: účet → rezerva/);
 h.click('skip');assert.match(html(),/class="pocket-future" data-balance="future" data-value="0"/);assert.match(html(),/Odložené na budúcnosť/);
 h.click('rest');assert.match(html(),/Na budúcnosť <strong data-year-pocket="future">0/);assert.match(html(),/Budúcnosť sa automaticky nepoužíva/);
 assert.doesNotMatch(html(),/Účet \+ rezerva \+ budúcnosť/);
});


test('stručný výsledok umožní opakovanie bez odhadov a medzikrokov',()=>{
 const h=harness();h.click('choose-character',{character:'ferko'});h.click('character-start');h.click('skip');
 const before=renderedBalances(h.node('#journey').innerHTML);
 assert.doesNotMatch(h.node('#journey').innerHTML,/prediction|Tvoj tip|ČO ROZHODLO|ČO SKÚSIŠ/);
 h.click('character-retry');h.click('character-start');h.click('skip');
 assert.equal(renderedBalances(h.node('#journey').innerHTML),before);
 assert.doesNotMatch(h.node('#journey').innerHTML,/data-action="character-retry"|Skúsiť iný plán/);assert.match(h.node('#journey').innerHTML,/<summary>Výsledok<\/summary>/);
});


test('každá z troch kariet drží pozornosť sama a náhľad nemení účet',()=>{
 const h=harness({reduced:false});h.click('choose-character',{character:'ferko'});h.click('character-start');
 const initial=renderedBalances(h.node('#journey').innerHTML),ids=[];
 assert.notEqual(h.node('#event-reveal').open,true);assert.match(h.node('#journey').innerHTML,/Odhaľ mesačný výdavok/);
 h.click('play');assert.equal(renderedBalances(h.node('#journey').innerHTML),initial);
 h.click('reveal');
 for(let i=1;i<=3;i++){
  const card=h.node('#event-reveal').innerHTML;
  assert.equal(h.node('#event-reveal').open,true);assert.match(card,new RegExp('Tento mesiac nás čaká · '+i+' / 3'));
  assert.equal((card.match(/data-preview-event=/g)||[]).length,1);ids.push(card.match(/data-preview-event="([^"]+)"/)[1]);
  assert.equal(renderedBalances(h.node('#journey').innerHTML),initial);
  h.click('play');assert.equal(renderedBalances(h.node('#journey').innerHTML),initial);
  h.click('next-event');
  assert.match(h.node('#journey').innerHTML,new RegExp('data-sticker-id="'+ids[i-1]+'"'));
 }
 assert.equal(new Set(ids).size,3);assert.equal(h.node('#event-reveal').open,false);
 assert.match(h.node('#journey').innerHTML,/Pozastaviť mesiac/);assert.notEqual(renderedBalances(h.node('#journey').innerHTML),initial);
 h.click('skip');h.click('character-retry');h.click('character-start');
 assert.notEqual(h.node('#event-reveal').open,true);h.click('reveal');
 assert.match(h.node('#event-reveal').innerHTML,/Tento mesiac nás čaká · 1 \/ 3/);
 assert.equal(h.node('#event-reveal').innerHTML.match(/data-preview-event="([^"]+)"/)[1],ids[0]);
});


test('vylosovanie každej z troch udalostí spustí zvuk presne raz',()=>{
 const h=harness();h.click('choose-character',{character:'ferko'});h.click('character-start');
 assert.deepEqual(h.sounds,[]);h.click('reveal');assert.deepEqual(h.sounds,['reveal']);
 h.click('reveal');assert.equal(h.sounds.length,1);
 h.click('next-event');assert.equal(h.sounds.length,2);
 h.click('next-event');assert.equal(h.sounds.length,3);
 h.click('next-event');assert.deepEqual(h.sounds,['reveal','reveal','reveal']);
});


test('ročný pohľad má kalendár namiesto čiary a odkrýva iba odohrané mesiace',()=>{
 const h=harness({reduced:false}),html=()=>h.node('#journey').innerHTML;
 h.click('choose-character',{character:'ferko'});h.click('character-start');h.click('skip');h.click('rest');
 assert.doesNotMatch(html(),/flow-progress|budget-chart|year-chart|year-legend|three-balances/);
 assert.equal((html().match(/class="year-month-tile /g)||[]).length,12);
 assert.equal((html().match(/is-pending/g)||[]).length,11);
 h.click('play');assert.match(html(),/<h1 tabindex="-1">Február/);
 assert.equal((html().match(/is-pending/g)||[]).length,10);
 h.click('year-month',{month:'0'});assert.match(html(),/<h1 tabindex="-1">Január/);
 assert.equal((html().match(/is-pending/g)||[]).length,10);
 const before=html();h.click('year-month',{month:'11'});assert.equal(html(),before);
 h.click('play');assert.match(html(),/<h1 tabindex="-1">Marec/);
 h.click('skip');assert.equal((html().match(/is-pending/g)||[]).length,0);
 h.click('results');assert.doesNotMatch(html(),/budget-chart|year-chart/);
 h.click('year-month',{month:'5'});assert.match(html(),/<h1 tabindex="-1">Jún/);
 h.click('screen-back');assert.match(html(),/<h1 tabindex="-1">December/);
 h.click('screen-forward');assert.match(html(),/<h1 tabindex="-1">Jún/);
});

test('rozhodovacie okno drží rok, teraz nie pokračuje a pôžička ostane viditeľná ako dlh',()=>{
 const h=harness({reduced:false,motion:true}),html=()=>h.node('#journey').innerHTML;
 h.click('choose-character',{character:'jozko'});
 h.input({dataset:{characterField:'reserve'},value:'0'});h.input({dataset:{characterField:'discipline'},value:'1'});
 h.click('character-start');h.click('skip');h.click('rest');
 let shortage;
 for(let i=0;i<11&&!shortage;i++){h.click('play');shortage=h.checkpoint('rescue');if(!shortage&&h.checkpoint('purchase'))h.click('year-decline');}
 assert.ok(shortage);assert.equal(h.node('#year-decision').open,true);
 assert.match(h.node('#year-decision').innerHTML,/12 splátok|12 splát/);assert.match(h.node('#year-decision').innerHTML,/od budúceho mesiaca/);
 const stopped=html();h.click('skip');assert.equal(html(),stopped);assert.equal(h.node('#year-decision').open,true);
 h.click('year-rescue',{kind:'loan'});assert.equal(h.node('#year-decision').open,false);assert.match(html(),/Zostáva splatiť/);
 assert.equal(h.motion().points[0].checking,shortage.checking);
 if(h.checkpoint('purchase')){assert.match(h.node('#year-decision').innerHTML,/Áno, kúpiť/);assert.match(h.node('#year-decision').innerHTML,/Teraz nie/);h.click('year-decline');assert.equal(h.node('#year-decision').open,false);}
 h.click('skip');h.click('results');assert.match(html(),/balance-row-debt/);assert.match(html(),/Účet \+ rezerva − dlh/);assert.match(html(),/Požičané peniaze nie sú zárobok/);
 assert.match(html(),/year-loan-warning/);assert.match(html(),/12 mesačných splátok približne po/);assert.match(html(),/navyše za celú pôžičku/);assert.match(html(),/Vrátiš celkom/);assert.match(html(),/nie je ďalší mesačný poplatok/);assert.match(html(),/Pri financovaní radostí/);
 h.click('retry');h.click('character-start');h.click('skip');h.click('rest');
 assert.doesNotMatch(html(),/year-debt-strip/);
 h.click('skip');h.click('results');assert.doesNotMatch(html(),/year-loan-warning/);
});

test('pri nákupe teraz nie nezruší zvyšok rozhodnutí a opakované stlačenie nič nestrhne',()=>{
 const h=harness({reduced:false,motion:true});h.click('choose-character',{character:'janka'});h.input({dataset:{characterField:'discipline'},value:'6'});
 h.click('character-start');h.click('skip');h.click('rest');let purchase;
 for(let i=0;i<11&&!purchase;i++){
  h.click('play');if(h.checkpoint('rescue'))h.click('year-rescue',{kind:'none'});purchase=h.checkpoint('purchase');
 }
 assert.ok(purchase);assert.equal(h.node('#year-decision').open,true);assert.match(h.node('#year-decision').innerHTML,/1 \/ 4/);
 h.click('year-decline');assert.equal(h.node('#year-decision').open,false);
 const continued=h.node('#journey').innerHTML;h.click('year-decline');assert.equal(h.node('#journey').innerHTML,continued);
 assert.equal(h.motion().points.filter(p=>p.checkpoint?.eventId===purchase.checkpoint.eventId).length,0);
 assert.equal(h.motion().points[0].checking,purchase.checking);
});

test('tri zlé mesiace otvoria jediný úsporný krok a po ňom je zmena výdavkov viditeľná',()=>{
 const h=harness({reduced:false,motion:true});h.click('choose-character',{character:'jozko'});
 h.input({dataset:{characterField:'reserve'},value:'0'});h.input({dataset:{characterField:'discipline'},value:'1'});h.input({dataset:{characterField:'future'},value:'0'});
 h.click('character-start');h.click('skip');h.click('rest');let crisis;
 for(let i=0;i<11&&!crisis;i++){
  h.click('play');if(h.checkpoint('rescue'))h.click('year-rescue',{kind:'none'});
  if(h.checkpoint('purchase'))h.click('year-decline');crisis=h.checkpoint('crisis');
 }
 assert.ok(crisis);assert.equal(h.node('#year-decision').open,true);
 const modal=h.node('#year-decision').innerHTML;
 assert.equal((modal.match(/data-action=/g)||[]).length,1);assert.match(modal,/Zapnúť úsporný režim/);assert.match(modal,/<s>/);
 h.click('skip');assert.equal(h.node('#year-decision').open,true);
 h.click('year-crisis');assert.equal(h.node('#year-decision').open,false);assert.match(h.node('#journey').innerHTML,/year-austerity-impact/);
 assert.equal(h.motion().points.filter(p=>p.checkpoint?.kind==='crisis').length,0);
 let nextOffer;
 for(let i=0;i<10&&!nextOffer;i++){h.click('play');if(h.checkpoint('turbo'))h.click('year-turbo',{enabled:'no'});nextOffer=h.checkpoint('purchase');}
 assert.ok(nextOffer);assert.equal(h.node('#year-decision').open,true);
 assert.doesNotMatch(h.node('#year-decision').innerHTML,/Nemáme peniaze, musíme šetriť|data-action="year-buy" disabled/);
 const unchanged=h.node('#journey').innerHTML;
 h.click('year-buy');assert.equal(h.node('#year-decision').open,true);
 assert.match(h.node('#year-decision').innerHTML,/Nemáme peniaze, musíme šetriť/);assert.match(h.node('#year-decision').innerHTML,/Nákup sa neuskutočnil/);
 assert.equal(h.node('#journey').innerHTML,unchanged);assert.doesNotMatch(h.node('#year-decision').innerHTML,/data-action="year-buy"/);
 h.click('year-decline');assert.equal(h.node('#year-decision').open,false);
});

test('ponuka turba počká na voľbu a nadviaže na rovnaký zostatok bez nového dlhu',()=>{
 const scenario=(b,d,seed)=>{const run=require('../characters').scenario(b,d,seed);return {...run,events:[...run.events,{id:'deep-deficit',date:'2027-01-01',type:'life',name:'Veľká oprava',amount:10000}].sort((a,b)=>a.date.localeCompare(b.date))};};
 const h=harness({reduced:false,motion:true,scenario});h.click('choose-character',{character:'jozko'});
 h.input({dataset:{characterField:'reserve'},value:'0'});h.input({dataset:{characterField:'discipline'},value:'1'});h.input({dataset:{characterField:'future'},value:'0'});
 h.click('character-start');h.click('skip');h.click('rest');let turbo;
 for(let i=0;i<11&&!turbo;i++){
  h.click('play');if(h.checkpoint('rescue'))h.click('year-rescue',{kind:'none'});
  if(h.checkpoint('purchase'))h.click('year-decline');if(h.checkpoint('crisis'))h.click('year-crisis');turbo=h.checkpoint('turbo');
 }
 assert.ok(turbo);assert.equal(h.node('#year-decision').open,true);
 assert.match(h.node('#year-decision').innerHTML,/Zapnúť turbo režim/);assert.match(h.node('#year-decision').innerHTML,/Pokračovať úsporne/);
 assert.match(h.node('#year-decision').innerHTML,/náklady záporného účtu.*nepripočítavame/);
 h.click('year-turbo',{enabled:'yes'});assert.equal(h.node('#year-decision').open,false);
 assert.match(h.node('#journey').innerHTML,/TURBO REŽIM/);assert.equal(h.motion().points[0].checking,turbo.checking);
 assert.equal(h.motion().points.filter(p=>p.checkpoint?.kind==='turbo').length,0);
});

test('ročné zhodnotenie ukáže skutočný bonus rezervy a pri nulovej rezerve ho nevymyslí',()=>{
 const h=harness();h.click('choose-character',{character:'ferko'});h.click('character-start');h.click('skip');h.click('rest');h.click('skip');h.click('results');
 assert.match(h.node('#journey').innerHTML,/year-reserve-bonus/);assert.match(h.node('#journey').innerHTML,/1 % z priemernej dennej rezervy/);assert.match(h.node('#journey').innerHTML,/pripísané 31. decembra/);
 h.click('home');h.click('choose-character',{character:'ferko'});h.input({dataset:{characterField:'reserve'},value:'0'});h.input({dataset:{characterField:'future'},value:'0'});
 h.click('character-start');h.click('skip');h.click('rest');h.click('skip');h.click('results');assert.doesNotMatch(h.node('#journey').innerHTML,/year-reserve-bonus/);
});

test('dostupný nákup v turbo režime najprv zmení tlačidlo a až druhý klik ho raz zaúčtuje',()=>{
 const scenario=(b,discipline,seed)=>({year:2027,seed:23,answer:discipline,events:[
  {id:'shock',date:'2027-01-08',type:'life',name:'Veľká oprava',amount:10000},
  ...Array.from({length:11},(_,i)=>({id:'auto-'+i,date:`2027-${String(i+2).padStart(2,'0')}-14`,type:'deviation',name:'Nákup navyše',amount:100})),
  {id:'recovery',date:'2027-07-01',type:'extraIncome',name:'Mimoriadny príjem',amount:50000}
 ].sort((a,b)=>a.date.localeCompare(b.date))});
 const h=harness({reduced:false,motion:true,scenario});h.click('choose-character',{character:'ferko'});h.input({dataset:{characterField:'reserve'},value:'0'});
 h.click('character-start');h.click('skip');h.click('rest');let turbo=false,purchase;
 for(let i=0;i<24&&!purchase;i++){
  h.click('play');if(h.checkpoint('rescue'))h.click('year-rescue',{kind:'none'});
  const offer=h.checkpoint('purchase');if(offer){if(turbo)purchase=offer;else h.click('year-decline');}
  if(!purchase&&h.checkpoint('crisis'))h.click('year-crisis');if(!purchase&&h.checkpoint('turbo')){h.click('year-turbo',{enabled:'yes'});turbo=true;}
  if(!purchase&&h.checkpoint('reserve'))h.click('year-reserve',{kind:'keep'});
 }
 assert.ok(turbo&&purchase);assert.ok(purchase.checking>=120000);
 const balances=h.node('#journey').innerHTML,sounds=[...h.sounds];
 h.click('year-buy');assert.equal(h.node('#year-decision').open,true);assert.equal(h.node('#journey').innerHTML,balances);assert.deepEqual(h.sounds,sounds);
 assert.equal(h.node('#year-decision [data-action="year-buy"]').textContent,'Skutočne? 🤦');
 h.click('year-buy');assert.equal(h.node('#year-decision').open,false);assert.equal(h.sounds.filter(s=>s==='expense').length,sounds.filter(s=>s==='expense').length+1);
 const settled=h.node('#journey').innerHTML;h.click('year-buy');assert.equal(h.node('#journey').innerHTML,settled);
});

test('plná rezerva otvorí percentá, náhľad reaguje na slider a voľba pokračuje bez presunu starej rezervy',()=>{
 const h=harness({reduced:false,motion:true,scenario:(b,d,seed)=>({year:2027,seed,answer:d,events:[]})});h.click('choose-character',{character:'ferko'});
 h.input({dataset:{characterField:'future'},value:'100'});h.input({dataset:{characterField:'goalShare'},value:'0'});
 h.click('character-start');h.click('skip');h.click('rest');let full;
 for(let i=0;i<10&&!full;i++){h.click('play');full=h.checkpoint('reserve');}
 assert.ok(full);assert.equal(h.node('#year-decision').open,true);assert.match(h.node('#year-decision').innerHTML,/3 mesiace plánovaných výdavkov/);
 assert.match(h.node('#year-decision').innerHTML,/Nie, chcem väčšiu rezervu/);
 h.input({id:'year-reserve-share',value:'100'});assert.match(h.node('#year-reserve-preview').innerHTML,/100 % na budúcnosť/);assert.match(h.node('#year-reserve-preview').innerHTML,/Rezerva 0/);assert.match(h.node('#year-reserve-preview').innerHTML,/540/);
 h.click('year-reserve',{kind:'redirect'});assert.equal(h.node('#year-decision').open,false);assert.equal(h.motion().points[0].reserve,full.reserve);
 assert.match(h.node('#journey').innerHTML,/100 % ďalších vkladov/);assert.equal(h.motion().points.filter(p=>p.checkpoint?.kind==='reserve').length,0);
});
