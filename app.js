(() => {
 'use strict';
 const E=BudgetEngine,Y=YearEngine,$=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=n=>new Intl.NumberFormat('sk-SK',{style:'currency',currency:'EUR',maximumFractionDigits:n%100?2:0}).format(n/100),date=s=>new Intl.DateTimeFormat('sk-SK',{day:'numeric',month:'long',timeZone:'UTC'}).format(E.parseDate(s));
 const months=['Január','Február','Marec','Apríl','Máj','Jún','Júl','August','September','Október','November','December'];
 const presets=[{id:'enjoy',name:'Žijem pre dnešok',text:'Viac radostí, menej plánovania',discipline:2,future:10},{id:'balance',name:'Zlatá stredná cesta',text:'Niečo dnes, niečo na neskôr',discipline:4,future:50},{id:'planner',name:'Myslím dopredu',text:'Držím plán a tvorím rezervu',discipline:6,future:90}];
 const characterAnswers=['Takmer nikdy.','Zriedka.','Občas.','Často.','Takmer vždy.','Vždy.'];
 const answers=['Takmer vôbec.','Väčšinou sa ho nedržia.','Skôr sa ho nedržia.','Skôr sa ho držia.','Väčšinou sa ho držia.','Takmer vždy.'];
 const paths={coins:'M5 4h14v5H5V4Zm2 5v5h14V9M3 14h14v6H3v-6m4 3h6',shirt:'m8 3 4 2 4-2 6 6-4 3-2-3v12H8V9l-2 3-4-3 6-6Z',shield:'m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Zm-5 10 3 3 7-7',carShield:'M3 11h15v8H3v-8Zm2 0 2-7h8l2 7M6 19v3m9-3v3m3-18 5 2v4l-5 3-3-2',other:'M3 5h18v14H3V5Zm4 7h.1m4.9 0h.1m4.9 0h.1',euro:'M18 5a7 7 0 0 0-11 7 7 7 0 0 0 11 7M4 10h11M4 14h10',arrow:'M12 3v17m-6-6 6 6 6-6',basket:'M3 9h18l-2 11H5L3 9Zm4 0 5-7 5 7M9 12v5m6-5v5',cup:'M4 5h12v10a5 5 0 0 1-10 0V5m10 2h3a3 3 0 0 1 0 6h-3M3 22h17',star:'m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z',bag:'M5 7h14l2 15H3L5 7Zm3 0V5a4 4 0 0 1 8 0v2',home:'m2 11 10-9 10 9M5 9v12h14V9m-10 12v-8h6v8',phone:'M6 2h12v20H6V2Zm4 17h4',play:'m7 3 14 9-14 9V3Z',appliance:'M4 2h16v20H4V2Zm0 7h16M8 4v1m0 6v4',health:'M8 2h8v6h6v8h-6v6H8v-6H2V8h6V2Z',car:'M3 10h18v9H3v-9Zm2 0 2-7h10l2 7M6 19v3m12-3v3M6 14h2m8 0h2',bus:'M4 2h16v17H4V2Zm0 10h16M8 4v8m8 0V4M6 19v3m12-3v3',book:'M12 4v18M2 3l10 2 10-2v16l-10 2-10-2V3Z',gift:'M2 8h20v5H2V8Zm2 5v9h16v-9M12 8v14M12 8C2 8 5-4 12 8Zm0 0c10 0 7-12 0 0Z'};
 paths.umbrella='M3 12a9 9 0 0 1 18 0H3Zm9-9v17a2 2 0 0 0 4 0M12 1v2';
 paths.switch='M20 10a8 8 0 0 0-14-4L3 9m0-5v5h5m-4 5a8 8 0 0 0 14 4l3-3m0 5v-5h-5';
 const icon=(name,size=23)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.star}"/></svg>`;
 const groups=[['fixed','Pravidelné výdavky','Platby, s ktorými počítaš'],['consumption','Bežná spotreba','Každodenné potreby aj radosti'],['insurance','Poistenia','Mesačné poistné a modelové krytie'],['saving','Rezerva','Odkladanie · peniaze bokom'],['goals','Na budúcnosť','Odkladanie · tvoje budúce ciele']];
 let lastHaptic=0,lastHapticValue=null;
 function haptic(value){if(reduced.matches||typeof navigator==='undefined'||typeof navigator.vibrate!=='function')return;const now=Date.now();if(value===lastHapticValue||now-lastHaptic<65)return;lastHaptic=now;lastHapticValue=value;try{navigator.vibrate(8);}catch{}}
 let revealBusy=false,revealTimer=null,flight=null,pendingEvent=null;
 const settledStickers=new Set(),stickerTimers=new Map();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const genders=Object.fromEntries(BudgetCharacters.profiles.map(p=>[p.id,p.defaultGender]));
 const identity=p=>p.variants[genders[p.id]];
 const genderSwitch=p=>`<div class="gender-switch" role="group" aria-label="Podoba postavy pri príjme ${p.income} eur">${[['male','♂','Muž'],['female','♀','Žena']].map(([value,glyph,label])=>`<button type="button" data-action="gender" data-character="${p.id}" data-gender="${value}" aria-label="${label} · ${p.income} €" aria-pressed="${genders[p.id]===value}" title="${label}"><span aria-hidden="true">${glyph}</span></button>`).join('')}</div>`;
 let character=null,traits={discipline:4,future:50,goalShare:50},characterIncome=1100,characterReserve=1000,characterSeed=null,characterInsured=false;
 let attempt=1;
 const sound=typeof SimulationSound==='undefined'?null:SimulationSound.create();
 let lastPaymentDay=null;
 let budget=Y.defaults(),answer=null,run=null,projection=null,plan=null,previous=null,step='welcome',revealed=0,cursor=-1,playing=false,timer=null,inspected=null,editing=false;
 const primary=(a,t,disabled=false)=>`<button class="button primary ${a==='reveal'?'month-discover':''} ${a==='play'&&playing?'is-simulating':''}" data-action="${a}" ${disabled?'disabled':''} ${a==='play'&&playing?'aria-busy="true"':''}>${a==='reveal'?'<span class="discover-plus" aria-hidden="true">+</span>':''}${t}${a==='play'&&playing?'<span class="simulation-spinner" aria-hidden="true"></span>':a==='reveal'?'':'<span aria-hidden="true">→</span>'}</button>`;
 const title=(k,h,p='')=>`<div class="flow-heading">${k?`<p class="eyebrow">${k}</p>`: ''}<h1 tabindex="-1">${h}</h1>${p?`<p>${p}</p>`:''}</div>`;
 const progress=n=>`<nav class="flow-progress" aria-label="Postup">${(character?['Postava','Správanie','Január','Celý rok']:['Rozpočet','Tvoj odhad','Január','Celý rok']).map((s,i)=>`<span class="${i===n?'current':i<n?'done':''}"><b>${i<n?'✓':String(i+1).padStart(2,'0')}</b>${s}</span>`).join('')}</nav>`;
 function stop(){clearTimeout(timer);playing=false;}
 const screenHistory=[];
 let screenIndex=-1,monthReview=false,yearSelected=null;
 let yearDecision=null,yearContinuation=null;
 function closeYearDecision(){if($('#year-decision')?.open)$('#year-decision').close();yearDecision=null;yearContinuation=null;}
 function rememberScreen(){
  return JSON.parse(JSON.stringify({step,character,traits,characterIncome,characterReserve,characterSeed,characterInsured,
   attempt,budget,answer,run,projection,plan,previous,revealed,cursor,lastPaymentDay,inspected,editing,
   monthReview,yearSelected,genders,settled:[...settledStickers],monthRulesOpen,receiptTransfersOpen,eventCardsOpen,scroll:window.scrollY||0}));
 }
 function saveScreen(){if(screenIndex>=0)screenHistory[screenIndex]=rememberScreen();}
 function screenNavigation(){
  $('#screen-navigation').innerHTML=`${screenIndex>0?'<button class="button secondary" data-action="screen-back">← Späť</button>':''}${!monthReview&&screenIndex<screenHistory.length-1?'<button class="button secondary screen-forward" data-action="screen-forward">Ďalej →</button>':''}`;
 }
 function restoreScreen(index){
  stop();finishReveal(false);yearMotion?.reset();closeYearDecision();
  for(const timer of stickerTimers.values())clearTimeout(timer);
  stickerTimers.clear();
  const state=JSON.parse(JSON.stringify(screenHistory[index]));
  ({step,character,traits,characterIncome,characterReserve,characterSeed,characterInsured,attempt,budget,answer,
   run,projection,plan,previous,revealed,cursor,lastPaymentDay,inspected,editing,
   monthReview,yearSelected,monthRulesOpen,receiptTransfersOpen,eventCardsOpen}=state);
  Object.assign(genders,state.genders);
  settledStickers.clear();state.settled.forEach(id=>settledStickers.add(id));
  screenIndex=index;render();screenNavigation();
  window.scrollTo({top:state.scroll,behavior:'instant'});
 }
 function forgetForward(){screenHistory.splice(screenIndex+1);screenNavigation();}
 function nav(s){
  stop();finishReveal(false);yearMotion?.reset();closeYearDecision();step=s;inspected=null;render();
  screenHistory.splice(screenIndex+1);screenHistory.push(rememberScreen());screenIndex=screenHistory.length-1;
  screenNavigation();window.scrollTo({top:0,behavior:'instant'});$('#journey h1')?.focus({preventScroll:true});
 }
 function render(){if(step==='welcome')welcome();else if(step==='character')characterForm();else if(step==='budget')form();else if(step==='question')question();else if(step==='result')finalScreen();else scene();}
 function welcome(){
  $('#journey').innerHTML=`<section class="character-welcome">
   <p class="welcome-meta">Bez registrácie</p>
   <div class="welcome-bubble">
    <div class="flow-heading">
     <img class="welcome-stamp" src="assets/welcome-burst.svg" alt="" width="195" height="124">
     <h1 tabindex="-1">Výplata príde.<br><span>Život má iné plány.</span></h1>
     <p>Vyber si postavu alebo si vytvor vlastný rozpočet. Zisti, ako tvoj rozpočet zvládne bežný mesiac aj nečakané výdavky.</p>
    </div>
    <svg class="welcome-bubble-tail" viewBox="0 0 86 36" aria-hidden="true"><path fill="currentColor" transform="translate(0 36) rotate(-90)" d="M32 86C32 72.5567 24.9356 60.1404 13.4584 53.4239L2.16336 46.8101C-.721121 45.1259-.721121 40.8947 2.16336 39.2104L13.4584 32.5966C24.9356 25.8596 32 13.4433 32 0V86ZM32 0V86H36V0Z"/></svg>
   </div>
   <h2 class="selection-heading">Kto bude hlavná postava?</h2>
   <div class="character-grid">${BudgetCharacters.profiles.map(p=>`<article class="character-option">${genderSwitch(p)}<button class="character-card ${p.id}" data-action="choose-character" data-character="${p.id}"><span class="avatar-stage"><img src="assets/avatars/${identity(p).avatar}.png" alt="" width="260" height="260"></span><span class="character-name">${identity(p).name}</span><strong>${money(E.cents(p.income))}<small> čistého / mesiac</small></strong><span class="card-cta">Vyskúšať príbeh <span aria-hidden="true">→</span></span></button></article>`).join('')}</div>
   <div class="custom-entry"><div><h2>Radšej vlastný príbeh?</h2><p>Vyplň si svoj rozpočet a vyskúšaj vlastné čísla.</p></div><button class="button secondary" data-action="begin">Vyplň si svoj rozpočet →</button></div>
  </section>`;
  $('.welcome-bubble .flow-heading').addEventListener('click', () => {
   if(reduced.matches || window.getSelection()?.type === 'Range')return;
   const stamp=$('.welcome-stamp');
   stamp.getAnimations().forEach(animation => animation.cancel());
   stamp.animate([
    {transform:'scale(1)'},
    {transform:'scale(1.24) rotate(12deg)',filter:'sepia(1)',opacity:.85,offset:.34},
    {transform:'scale(1)'}
   ],{duration:520,easing:'cubic-bezier(.2,.75,.35,1)'});
  });
 }
 function openCharacterPicker(){
  const dialog=$('#character-picker');
  dialog.innerHTML=`<button class="dialog-close" data-action="close-character-picker" aria-label="Zavrieť výber postavy" autofocus>×</button><h2 id="character-picker-title">Vyber si postavu</h2><div class="character-picker-list">${BudgetCharacters.profiles.map(profile=>{
   const person=identity(profile),current=profile.id===character;
   return `<button class="character-picker-option" data-action="choose-character" data-character="${profile.id}" ${current?'disabled':''}><img src="assets/avatars/${person.avatar}.png" alt="" width="46" height="46"><span><strong>${person.name}</strong><small>${money(E.cents(profile.income))} / mesiac</small></span>${current?'<span class="character-picker-current">Aktuálna</span>':''}</button>`;
  }).join('')}</div>`;
  dialog.showModal();
 }
 // Eye centers and nearby skin colors in the original 1254 × 1254 portraits.
 const portraitEyes={
  jozko:[[566,368,'#fdbb92'],[713,334,'#fdbb93']],
  jozka:[[582,380,'#fdbb8e'],[719,344,'#fcbb8d']],
  ferko:[[564,355,'#fcb98c'],[732,382,'#fcb88d']],
  ferka:[[551,356,'#fdbc8f'],[718,385,'#fdbb8e']],
  janka:[[582,349,'#fab394'],[742,370,'#fab293']],
  janko:[[579,342,'#fcac8e'],[740,367,'#fdaf90']]
 };
 function characterPortrait(person){
  const eyelids=portraitEyes[person.avatar].map(([x,y,skin])=>`<g transform="translate(${x} ${y})"><ellipse rx="22" ry="31" fill="${skin}"/><path d="M-15 0Q0 11 15 0" fill="none" stroke="#092b50" stroke-width="8" stroke-linecap="round"/></g>`).join('');
  return `<div class="profile-art"><img src="assets/avatars/${person.avatar}.png" alt="" width="260" height="260"><svg class="portrait-eyelids" viewBox="0 0 1254 1254" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${eyelids}</svg></div>`;
 }
 function characterForm(){
  const p=BudgetCharacters.profiles.find(p=>p.id===character);budget=BudgetCharacters.budgetFor(character,characterIncome,characterReserve,traits.future,characterInsured,traits.goalShare??50);answer=traits.discipline;
  $('#journey').innerHTML=`<section class="character-settings">${title('','Nastav správanie svojej postavy',editing?'Zmeň jednu vec. Rovnaké životné udalosti ukážu rozdiel.':'')}<div class="character-setup-grid"><aside class="profile-summary ${p.id}"><div class="profile-portrait"><button class="icon-button character-switch" data-action="open-character-picker" aria-label="Vybrať inú postavu" aria-haspopup="dialog">${icon('switch',22)}</button>${characterPortrait(identity(p))}<h2>${identity(p).name}</h2></div><div class="profile-finances"><p class="profile-income"><span>Čistý mesačný príjem</span><strong>${money(E.cents(p.income))}</strong></p><div class="character-reserve"><label for="character-reserve">Veľkosť rezervy</label><div class="reserve-readout"><output id="character-reserve-value" for="character-reserve">${money(E.cents(characterReserve))}</output><span id="character-reserve-shield" class="reserve-shield" style="--reserve-level:${characterReserve/1000}" aria-hidden="true">${icon('shield',32)}</span></div><input id="character-reserve" data-character-field="reserve" type="range" min="0" max="1000" step="100" value="${characterReserve}" style="--fill:${characterReserve/10}%" aria-valuetext="${money(E.cents(characterReserve))}"><div class="reserve-limits" aria-hidden="true"><span>0 €</span><span>1 000 €</span></div><p>Už odložené peniaze, nie ďalší príjem.</p></div><label class="character-insurance" for="character-insurance"><input id="character-insurance" type="checkbox" data-character-field="insurance" ${characterInsured?'checked':''}><span>Poistenie <strong>50 €</strong></span></label></div></aside><div class="trait-panel"><div class="preset-section" hidden><p class="eyebrow">ZAČNI JEDNÝM KLIKNUTÍM</p><div class="behavior-presets" role="group" aria-label="Rýchle nastavenie správania">${presets.map(preset=>`<button data-action="preset" data-preset="${preset.id}" aria-pressed="${traits.discipline===preset.discipline&&traits.future===preset.future}"><strong>${preset.name}</strong><small>${preset.text}</small></button>`).join('')}</div><p>Vyber si štart. Posuvníkmi si ho doladíš po svojom.</p></div><section><span class="eyebrow">01 / DODRŽANIE ROZPOČTU</span><h2 id="character-discipline-title">Ako často sa bude držať svojho rozpočtu?</h2><label for="character-discipline" id="discipline-label">${characterAnswers[traits.discipline-1]}</label><input id="character-discipline" aria-labelledby="character-discipline-title" data-character-field="discipline" type="range" min="1" max="6" step="1" value="${traits.discipline}" style="--fill:${(traits.discipline-1)*20}%"><div class="trait-extremes"><span>Takmer nikdy</span><span>Vždy</span></div></section><section><span class="eyebrow">02 / DNES ALEBO ZAJTRA</span><h2>Koľko si odložíš?</h2><label for="character-future" id="future-label">${traits.future===0?'Užijem si teraz':traits.future===100?'Rezerva na prvom mieste':'Trochu dnes, trochu na neskôr'} · ${traits.future} / 100</label><input id="character-future" data-character-field="future" type="range" min="0" max="100" step="10" value="${traits.future}" style="--fill:${traits.future}%"><div class="trait-extremes"><span>Viac radostí dnes</span><span>Viac na neskôr</span></div><p>Základné potreby ostávajú zaplatené. Rozdeľuješ len sumu, ktorá po nich zostane.</p></section><section><span class="eyebrow">03 / REZERVA A BUDÚCNOSŤ</span><h2 id="character-goal-share-title">Kam pôjde odkladanie?</h2><label for="character-goalShare" id="goal-share-label"></label><input id="character-goalShare" aria-labelledby="character-goal-share-title" data-character-field="goalShare" type="range" min="0" max="100" step="10" value="${traits.goalShare??50}" style="--fill:${traits.goalShare??50}%"><div class="trait-extremes"><span>Do rezervy</span><span>Na budúcnosť</span></div><p>Rezerva pomôže pri nečakaných platbách. Sporenie na budúcnosť sa pri nich nečerpá.</p></section><div id="character-budget-summary"></div><details class="basket-details"><summary>Kam presne ide spotreba?</summary><div id="character-basket"></div></details><div class="character-launch">${primary('character-start',editing?'Zopakovať mesiac s novým plánom':'Začať Januárom')}</div></div></div></section>`;updateCharacterSummary();
 }
 function basketChart(items){
  const rows=items.filter(row=>row.amount>0),total=rows.reduce((sum,row)=>sum+E.cents(row.amount),0);
  const colors=['#4479ff','#8073d2','#c38c33','#329c94','#5982a7','#d77065','#b05c95','#7a9452'];
  let angle=-Math.PI/2;
  const slices=rows.map((row,index)=>{
   const amount=E.cents(row.amount),size=amount/total*Math.PI*2,end=angle+size;
   const x1=110+96*Math.cos(angle),y1=110+96*Math.sin(angle),x2=110+96*Math.cos(end),y2=110+96*Math.sin(end);
   const shape=rows.length===1?'<circle cx="110" cy="110" r="96"':`<path d="M110 110 L${x1.toFixed(3)} ${y1.toFixed(3)} A96 96 0 ${size>Math.PI?1:0} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z"`;
   angle=end;
   return `${shape} fill="${colors[index%colors.length]}" stroke="white" stroke-width="2"><title>${esc(row.name)} · ${money(amount)}</title>${rows.length===1?'</circle>':'</path>'}`;
  }).join('');
  return `<figure class="basket-chart"><div class="basket-chart-visual"><svg viewBox="0 0 220 220" role="img" aria-label="Rozdelenie mesačnej spotreby, spolu ${money(total)}">${slices||'<circle cx="110" cy="110" r="96" fill="#e7eaf5"/>'}<circle cx="110" cy="110" r="61" fill="#fff" pointer-events="none"/></svg><figcaption>Plánovaná spotreba<strong>${money(total)}</strong></figcaption></div><ul class="basket-chart-legend">${rows.map((row,index)=>`<li><i style="background:${colors[index%colors.length]}" aria-hidden="true"></i><span>${esc(row.name)}</span><strong>${money(E.cents(row.amount))}</strong></li>`).join('')}</ul></figure>`;
 }
 function updateCharacterSummary(changedField='initial'){
  document.querySelectorAll('[data-action="preset"]').forEach(button=>{const preset=presets.find(p=>p.id===button.dataset.preset);button.setAttribute('aria-pressed',String(traits.discipline===preset.discipline&&traits.future===preset.future));});
  $('#character-discipline').setAttribute('aria-valuetext',characterAnswers[traits.discipline-1]);
  $('#character-future').setAttribute('aria-valuetext',traits.future+' zo 100 v prospech odkladania');
  if(changedField==='discipline')return;
  if(changedField==='reserve'){
   budget.initial.reserve=characterReserve;
   return;
  }
  budget=BudgetCharacters.budgetFor(character,characterIncome,characterReserve,traits.future,characterInsured,traits.goalShare??50);
  const t=Y.totals(budget);
  const profile=BudgetCharacters.profiles.find(p=>p.id===character),essentials=E.cents(profile.housing+profile.phone+20+profile.food+profile.transport);
  const premium=budget.insurance.reduce((sum,row)=>sum+E.cents(row.amount),0);
  const joys=Math.max(0,t.expenses-essentials-premium);
  const reserveSaving=budget.saving.reduce((sum,row)=>sum+E.cents(row.amount),0),futureSaving=budget.goals.reduce((sum,row)=>sum+E.cents(row.amount),0);
  const parts=[['Základné potreby',essentials,'needs','home'],['Radosti',joys,'joy','bag'],['Do rezervy',reserveSaving,'save','shield'],['Na budúcnosť',futureSaving,'future','star']];
  if(premium)parts.push(['Poistenie',premium,'insurance','umbrella']);
  const scale=Math.max(1,t.income,t.expenses+t.saving);
  $('#future-label').textContent=money(t.saving)+' mesačne bokom';
  $('#goal-share-label').textContent='Rezerva '+money(reserveSaving)+' · Budúcnosť '+money(futureSaving);
  $('#character-goalShare').disabled=t.saving===0;$('#character-goalShare').setAttribute('aria-valuetext',money(reserveSaving)+' do rezervy, '+money(futureSaving)+' na budúcnosť');
  if(changedField==='initial'||changedField==='insurance'){
   $('#character-budget-summary').innerHTML=`<div class="allocation-card"><div class="allocation-title"><span class="eyebrow">TVOJ PLÁN NA MESIAC</span></div><div class="allocation-bar" aria-hidden="true">${parts.map(([,amount,category])=>`<span class="${category}" data-allocation-segment="${category}" style="width:${amount/scale*100}%"></span>`).join('')}</div><div class="allocation-legend">${parts.map(([name,amount,category,glyph])=>`<span><span class="allocation-icon ${category}">${icon(glyph,18)}</span>${name}<strong data-allocation-value="${category}">${money(amount)}</strong></span>`).join('')}</div></div>`;
  }else{
   for(const [,amount,category] of parts){
    $(`[data-allocation-segment="${category}"]`).style.width=`${amount/scale*100}%`;
    $(`[data-allocation-value="${category}"]`).textContent=money(amount);
   }
  }
  $('#character-basket').innerHTML=basketChart([...budget.fixed,...budget.consumption,...budget.insurance]);
 }
 let monthRulesOpen=false,receiptTransfersOpen=false,eventCardsOpen=false;
 const receiptCounter=typeof requestAnimationFrame==='function'?ReceiptCounter.create({
  requestFrame:requestAnimationFrame,cancelFrame:cancelAnimationFrame,now:()=>performance.now(),
  format:(value,target)=>new Intl.NumberFormat('sk-SK',{style:'currency',currency:'EUR',minimumFractionDigits:target%100?2:0,maximumFractionDigits:target%100?2:0}).format(value/100)
 }):null;
 const yearMotion=typeof requestAnimationFrame==='function'?YearMotion.create({requestFrame:requestAnimationFrame,cancelFrame:cancelAnimationFrame,now:()=>performance.now()}):null;
 const yearMoney=new Intl.NumberFormat('sk-SK',{style:'currency',currency:'EUR',maximumFractionDigits:0});
 const receiptAmount=(key,value)=>`<strong data-receipt-amount="${esc(key)}" data-cents="${value}" aria-label="${money(value)}">${money(value)}</strong>`;
 function monthlyReceipt(){
  const summary=BudgetReceipt.summarize(projection.ledger,run.year+'-01',cursor<0?null:projection.days[cursor].date),done=cursor>=30;
  const {spent,income,coveredItems,transfers}=summary;
  return `<aside class="month-receipt" aria-label="Účtenka za január"><div class="receipt-header"><span class="receipt-shop">ŽIVOT, s. r. o.</span><h2>Účtenka za január</h2><p>${done?'Mesiac uzavretý · 31 / 31 dní':cursor<0?'':`Priebežne · ${cursor+1}. január`}</p></div><div class="receipt-list">${transfers.reserve?`<div class="receipt-saving">${icon('shield',18)}<span>1. január · Do rezervy<small>Presun na vlastnú rezervu</small></span>${receiptAmount('saved-reserve',transfers.reserve)}</div>`: ''}${summary.rows.length?summary.rows.map(row=>`<div class="receipt-row ${row.extra?'receipt-extra':''}"><span class="receipt-check" aria-hidden="true">✓</span><span>${esc(row.name)}${row.extra?'<small>neplánované</small>':''}</span>${receiptAmount(row.key,row.amount)}</div>`).join(''):`<div class="receipt-empty">${icon('basket',36)}<strong>Ešte si nenakupoval.</strong><p>Spusti mesiac a účtenka sa začne plniť.</p><span aria-hidden="true">· · ·</span></div>`}</div>${summary.rows.length?`<div class="receipt-total"><span>SPOLU MINUTÉ</span>${receiptAmount('total',spent)}</div>`:''}${income?`<p class="receipt-income">Príjmy navyše <strong>+ ${money(income)}</strong></p>`:''}${coveredItems.map(item=>`<p class="receipt-covered"><span>${esc(item.name)}<small>${esc(item.reason)} · navyše 0 €</small></span></p>`).join('')}${transfers.drawn||transfers.reserve||transfers.future?`<details class="receipt-transfers" data-month-disclosure="transfers" ${receiptTransfersOpen?'open':''}><summary>Presuny bokom <span>↗</span></summary><p>Vlastné peniaze, mimo súčtu minutého.</p>${[['drawn','Z rezervy na účet'],['reserve','Z účtu do rezervy'],['future','Z účtu na budúcnosť']].filter(([key])=>transfers[key]>0).map(([key,label])=>`<div><span>${label}</span><strong>${money(transfers[key])}</strong></div>`).join('')}</details>`:''}<div class="receipt-footer">${done?'<span class="receipt-stamp">JANUÁR VYBAVENÝ ✓</span>':''}<div class="receipt-barcode" aria-hidden="true"></div><small>Výdavky za mesiac</small></div></aside>`;
 }
 function fundingOrder(){return '<p class="funding-order">Platby: účet → rezerva.<span>Budúcnosť sa automaticky nepoužíva.</span></p>';}
 function moneyRing(){
  const d=snapshot(),base=projection.opening.checking,value=d.checking,ratio=Math.min(1,Math.abs(value)/Math.max(1,base)),circ=628.32,done=cursor>=30;
  const today=cursor<0?[]:projection.days[cursor].events;
  const main=today.filter(e=>!['daily','reserveDraw','income'].includes(e.type));
  const daily=-today.filter(e=>e.type==='daily').reduce((n,e)=>n+e.amount,0);
  const active=main.length>1?[{name:'Dnešné pohyby · '+main.length+' položky',icon:'coins',amount:main.reduce((n,e)=>n+(e.type==='transfer'?-e.amount:e.amount),0)}]:main.length?main:[{name:'Bežný deň',icon:'basket',amount:-daily}];
  return `<div class="money-view"><div class="ring-stage"><div class="month-track"><span>${done?'31 / 31 dní':cursor<0?'Dni v mesiaci':`Deň ${cursor+1} z 31`}</span><div aria-hidden="true">${Array.from({length:31},(_,i)=>`<i class="${i<=cursor?'passed':''}"></i>`).join('')}</div></div><div class="money-ring ${value<0?'in-debt':''}" data-balance="checking" data-value="${value}" role="img" aria-label="Zostatok bežného účtu ${money(value)}"><svg viewBox="0 0 240 240" aria-hidden="true"><circle cx="120" cy="120" r="100" fill="none" stroke="#e7eaf5" stroke-width="18"/><circle class="ring-fill" cx="120" cy="120" r="100" fill="none" stroke="${value<0?'#c6424c':'#4479ff'}" stroke-width="18" stroke-linecap="round" stroke-dasharray="${ratio*circ} ${circ}" transform="rotate(-90 120 120)"/></svg><div><small>${value<0?'CHÝBA NA ÚČTE':done?'NA KONCI MESIACA':'Zostatok na účte'}</small><strong>${money(value)}</strong><span>${value>base?'Nad úvodnou mierkou kruhu':cursor<0?'':done?'Január je za tebou.':date(projection.days[cursor].date)}</span></div></div><div class="payment-stage payment-stream" aria-label="Práve prechádza účtom"></div><div class="month-pockets"><div class="pocket-reserve" data-balance="reserve" data-value="${d.reserve}">${icon('shield',19)}<span>V rezerve</span><strong>${money(d.reserve)}</strong></div><div class="pocket-future" data-balance="future" data-value="${d.future}">${icon('star',19)}<span>Na budúcnosť</span><strong>${money(d.future)}</strong></div></div>${fundingOrder()}${monthStickers('active')}</div>${monthlyReceipt()}</div><details hidden class="month-rules" data-month-disclosure="rules" ${monthRulesOpen?'open':''}><summary>Ako čítať kruh a presuny?</summary><p>Plný kruh je úvodný účet: ${money(base)} vrátane januárovej mzdy. Mierka sa nemení${value>base?'; zostatok práve prekročil jeden plný kruh':''}. Červená znamená chýbajúce peniaze. Ak účet nestačí, čerpá sa dostupná rezerva. Budúce ciele sa automaticky nepoužívajú. Presuny uvidíš spolu pod účtenkou; nezapočítavajú sa do minutého.</p></details>`;
 }
 function monthConclusion(){
  const r=JourneyInsights.month(projection),d=r.end;
  const heading=r.firstGap?'Tentoraz peniaze nestačili.':r.tone==='red'?'Z rezervy ubudlo.':r.tone==='yellow'?(r.reserveChange>0?'Rezerva pomohla a aj narástla.':'Rezerva pomohla udržať mesiac.'):r.futureChange>0?'Odložil si aj na budúcnosť.':'Rozpočet tento mesiac vydržal.';
  const story=r.firstGap?'Ani rezerva nepokryla všetky platby.':r.tone==='red'?'Z rezervy sa použilo viac, než si do nej tento mesiac odložil.':r.tone==='yellow'?'Časť odložených peňazí sa počas mesiaca použila. Rezerva ti pomohla zvládnuť výdavky.':'Tento mesiac si z rezervy nemusel čerpať.';
  return `<section class="month-conclusion debrief compact-result result-${r.tone}"><span class="result-emblem" aria-hidden="true">${icon(r.tone==='green'?'shield':r.tone==='yellow'?'shield':'bag',28)}</span><h2 id="month-result-title" tabindex="-1">${heading}</h2><p class="result-story">${story}</p><div class="debrief-main"><span>${d.checking<0?'Na účte chýba':'Na účte zostalo'}</span><strong data-balance="checking" data-value="${d.checking}" class="${d.checking<0?'negative':''}">${money(Math.abs(d.checking))}</strong></div><div class="debrief-wallet"><div class="pocket-reserve" data-balance="reserve" data-value="${d.reserve}"><span>V rezerve</span><strong>${money(d.reserve)}</strong><small>${r.reserveChange>=0?'+ ':''}${money(r.reserveChange)} oproti začiatku mesiaca</small></div><div class="pocket-future" data-balance="future" data-value="${d.future}"><span>Na budúcnosť</span><strong>${money(d.future)}</strong><small>${r.futureChange>=0?'+ ':''}${money(r.futureChange)} oproti začiatku mesiaca</small></div></div>${fundingOrder()}<details class="result-details"><summary>Výsledok</summary><div class="result-breakdown"><dl><div><dt>Odložené do rezervy na začiatku mesiaca</dt><dd>${money(r.saved)}</dd></div><div><dt>Použité z rezervy</dt><dd>− ${money(r.drawn)}</dd></div><div><dt>Zmena rezervy za mesiac</dt><dd>${r.reserveChange>=0?'+ ':''}${money(r.reserveChange)}</dd></div><div><dt>Odložené na budúcnosť</dt><dd>${money(r.savedFuture)}</dd></div><div><dt>Nákupy nad plán</dt><dd>${money(r.overspending)}</dd></div><div><dt>Životné udalosti</dt><dd>${money(r.life)}</dd></div></dl></div></details></section>`;
 }
 function pushPayments(){
  if(cursor<0||cursor===lastPaymentDay)return;lastPaymentDay=cursor;
  const stage=$('.payment-stream');if(!stage?.append)return;
  const entries=projection.days[cursor].events;
  let items=entries.filter(e=>!['daily','reserveDraw','income'].includes(e.type));
  const fixed=items.filter(e=>e.type==='expense');if(fixed.length>1)items=[{name:'Pravidelné platby',icon:'home',type:'expense',amount:fixed.reduce((n,e)=>n+e.amount,0)},...items.filter(e=>e.type!=='expense')];
  const daily=entries.filter(e=>e.type==='daily').reduce((n,e)=>n+e.amount,0);
  if(daily)items.push({name:'Bežný deň',icon:'basket',amount:daily,type:'daily'});
  const drawn=entries.filter(e=>e.type==='reserveDraw').reduce((n,e)=>n+e.amount,0);
  if(drawn)items.push({name:'Pomohla rezerva',icon:'shield',amount:drawn,type:'reserveDraw'});
  const arrivals=entries.filter(e=>e.type==='income'&&e.date.slice(8)!=='01');items.push(...arrivals);
  const visible=items.filter(e=>e.amount||['covered','insured'].includes(e.type)).slice(0,5);
  visible.forEach((e,index)=>{
   const transfer=['transfer','reserveDraw'].includes(e.type),income=['income','extraIncome'].includes(e.type),expense=e.amount<0;
   const node=document.createElement('div');node.className='flying-payment '+(transfer?'is-transfer':expense?'is-expense':income?'is-income':'is-covered');
   node.style.animationDelay=(index*360)+'ms';node.innerHTML=`${icon(e.icon||'basket',23)}<span>${esc(e.name)}</span><strong>${transfer?(e.type==='reserveDraw'?'+ ':'− '):income?'+ ':expense?'− ':''}${money(Math.abs(e.amount))}</strong>`;
   if(reduced.matches){stage.replaceChildren(node);return;}
   node.addEventListener('animationend',()=>node.remove(),{once:true});stage.append(node);
  });
  while(stage.children.length>8)stage.firstElementChild.remove();
  if(visible.length)sound?.play(visible.some(e=>e.amount<0)?'expense':visible.some(e=>e.type==='transfer'||e.type==='reserveDraw')?'transfer':'income');
 }
 function januaryScene(force=false){
  const preparing=cursor<0,done=cursor>=30&&!monthReview,scroll=$('.receipt-list')?.scrollTop||0;
  if(done&&screenHistory[screenIndex]?.step==='january'&&screenHistory[screenIndex].cursor<30){
   const summary=rememberScreen(),review={...summary,monthReview:true,scroll:0};
   screenHistory[screenIndex]=review;
   screenHistory.splice(screenIndex+1,0,summary);
   screenIndex++;screenNavigation();
  }
  const focused=document.activeElement?.dataset?.action;
  const stage=$('.january-journey.is-playing .month-scene');
  if(!force&&playing&&stage?.matches?.('.month-scene')&&$('#journey .scene-actions>.primary')?.getAttribute?.('aria-busy')==='true'){
   const fresh=document.createElement('div');fresh.innerHTML=moneyRing();
   for(const selector of ['.month-track','.money-ring','.month-pockets','.month-receipt']){const current=stage.querySelector(selector),next=fresh.querySelector(selector);if(current&&next)current.replaceWith(next);}
   refreshStickers();
   const list=$('.receipt-list');if(list)list.scrollTop=scroll;animateReceipt();return;
  }
  $('#journey').innerHTML=`<section class="january-journey ${done?'is-complete':'is-playing'}"><div class="live-heading"><div><h1 tabindex="-1">${done?'Január za tebou.':'Január simulácia.'}</h1></div><button hidden class="sound-toggle" data-action="sound" aria-pressed="${!sound?.muted}" aria-label="${sound?.muted?'Zapnúť zvuk':'Stíšiť zvuk'}">${icon('phone',18)}<span>Zvuk ${sound?.muted?'vypnutý':'zapnutý'}</span></button></div>${done?`<div class="month-finale">${monthConclusion()}${monthlyReceipt()}</div>`:`<section class="annual-scene month-scene">${moneyRing()}</section>${monthStickers()}`}<div class="flow-actions scene-actions"><div>${done||monthReview?'':`${preparing?'':'<button class="text-link" data-action="skip">Preskočiť</button>'}`}</div>${monthReview?primary('screen-forward','Ďalej'):done?primary('rest','A čo celý rok?'):preparing&&revealed<3?primary('reveal',previous?'Znova odhaliť udalosti':'Odhaľ mesačný výdavok'):primary('play',playing?'Pozastaviť mesiac':preparing?'Spustiť mesiac':'Pokračovať')}</div><p hidden class="quiet-note">Ilustračný scenár.</p></section>`;
  const list=$('.receipt-list');if(list)list.scrollTop=scroll;animateReceipt();
  if(focused)($(`[data-action="${focused}"]`)||$('#journey .scene-actions>.primary'))?.focus({preventScroll:true});
 }
 function animateReceipt(){receiptCounter?.render([...document.querySelectorAll('[data-receipt-amount]')].map(node=>({key:node.dataset.receiptAmount,value:Number(node.dataset.cents),set:text=>{node.textContent=text;}})),!reduced.matches);}
 function amountInput(value,key,id,field='amount'){
  const min=key==='income'&&id==='salary'?750:0,max=key==='income'&&id==='salary'?3000:Math.max(2000,Math.ceil(value/500)*500),label=key==='initial'?{checking:'Bežný účet',reserve:'Rezerva',future:'Na budúcnosť'}[field]:budget[key].find(r=>r.id===id)?.name;
  return `<div class="paired-input"><div class="euro-entry"><input type="number" min="${min}" max="${min===750?3000:1000000000}" step="0.01" value="${value}" data-key="${key}" data-id="${id}" data-field="${field}" aria-label="Suma: ${esc(label)}" inputmode="decimal" required><span>€</span></div><input type="range" min="${min}" max="${max}" step="10" value="${value}" data-key="${key}" data-id="${id}" data-field="${field}" aria-label="Posuvník sumy ${esc(label)}" style="--fill:${(value-min)/(max-min)*100}%"></div>`;
 }
 function row(r,key){return `<div class="budget-row" data-row="${r.id}"><input class="row-name" value="${esc(r.name)}" data-key="${key}" data-id="${r.id}" data-field="name" aria-label="Názov položky ${esc(r.name)}" maxlength="80" required>${amountInput(r.amount,key,r.id)}${['irregular','known'].includes(key)?`<select data-key="${key}" data-id="${r.id}" data-field="month" aria-label="Mesiac ${esc(r.name)}">${months.map((m,i)=>`<option value="${i}" ${r.month===i?'selected':''}>${m}</option>`).join('')}</select>`:''}<button type="button" class="remove-row" data-action="remove" data-key="${key}" data-id="${r.id}" aria-label="Odstrániť ${esc(r.name)}">×</button>${key==='known'?`<label class="included-check"><input type="checkbox" data-key="known" data-id="${r.id}" data-field="included" ${r.included?'checked':''}> Už zahrnuté v mesačnom rozpočte — navyše 0 €</label>`:''}</div>`;}
 function form(){
  const group=(key,label,hint,index)=>`<details class="budget-group" data-budget-kind="${key}" ${index===0?'open':''}><summary><span class="group-index">${key==='saving'?icon('shield',20):key==='goals'?icon('star',20):index<5?'0'+(index+1):'↗'}</span><span><strong>${label}</strong><small>${hint}</small></span><b data-total="${key}">${money(budget[key].reduce((n,r)=>n+E.cents(r.amount),0))}</b><span class="chevron">⌄</span></summary><div class="group-body">${['saving','goals'].includes(key)?'<p class="saving-explanation">Tieto peniaze zostávajú tvoje. Presúvaš ich z bežného účtu do rezervy alebo na svoj cieľ — nejde o spotrebu.</p>':''}${key==='insurance'?'<p class="field-note">V skúšobnom modeli suma nad 0 € zapne plné krytie: domácnosť — škoda z prasknutého potrubia a vytopenia; auto — škoda po krupobití. Poruchy spotrebičov, opotrebovanie, stratené kľúče a pokuty sa nekryjú. Je to zjednodušenie bez spoluúčasti, nie opis reálnej poistky.</p>':''}${key==='known'?'<p class="field-note">Ak je výdavok už v mesačnom pláne, označ to. Tu ho druhýkrát neodpočítame.</p>':''}${budget[key].map(r=>row(r,key)).join('')}<button type="button" class="add-button" data-action="add" data-key="${key}">+ ${key==='irregular'?'Pridať príjem':key==='known'?'Známy výdavok':'Vlastná položka'}</button></div></details>`;
  $('#journey').innerHTML=`${progress(0)}${title('01 / MESAČNÝ PLÁN','Najskôr si to poskladaj.','Pokojne začni vymyslenými číslami. Všetko môžeš zmeniť.')}<form id="annual-budget"><div class="budget-editor"><div class="budget-table"><div class="fiction-note">${editing?'Upravuješ svoj plán. Udalosti zostávajú rovnaké.':'Predvyplnené údaje sú vymyslené.'}<button type="button" data-action="clear">Vymazať sumy</button></div><section class="opening-balances"><h2>S čím začínam</h2><p>Mzda prichádza každý mesiac. Rezerva a peniaze na budúcnosť sú už odložené.</p><div class="budget-row salary-row"><span><strong>Mzda</strong><small>čistý mesačný príjem</small></span>${amountInput(budget.income[0].amount,'income','salary')}</div>${[['reserve','Už vytvorená rezerva'],['future','Už odložené na budúcnosť']].map(([k,label])=>`<div class="budget-row"><span>${label}</span>${amountInput(budget.initial[k],'initial','initial',k)}</div>`).join('')}<details class="opening-cash" hidden><summary>Už mám niečo na účte</summary><p>Voliteľný zostatok pred januárovou mzdou. Mzdu sem druhýkrát nezadávaj.</p><div class="budget-row"><span>Peniaze na začiatku</span>${amountInput(budget.initial.checking,'initial','initial','checking')}</div></details></section>${group('irregular','Nepravidelné príjmy','Suma a mesiac prijatia',5)}${groups.map((g,i)=>group(...g,i)).join('')}</div><aside class="monthly-summary" id="monthly-summary"></aside></div><div class="flow-actions budget-actions"><span class="budget-mobile-left"><small>Po odložení zostáva</small><strong id="budget-mobile-left-value"></strong></span><button type="button" class="text-link" data-action="home">← Na úvod</button><button type="submit" class="button primary">${editing?'Zopakovať ten istý rok':'Ďalší krok'} <span aria-hidden="true">→</span></button></div></form>`;updateTotals();
 }
 function updateTotals(){const t=Y.totals(budget);const mobileTotal=$('#budget-mobile-left-value');if(mobileTotal){mobileTotal.textContent=money(t.left);mobileTotal.classList.toggle('negative',t.left<0);}$('#monthly-summary').innerHTML=`<p class="eyebrow">TVOJ BEŽNÝ MESIAC</p><h2>Čísla spolu</h2><dl><div><dt>Príjmy</dt><dd>${money(t.income)}</dd></div><div><dt>Výdavky</dt><dd>− ${money(t.expenses)}</dd></div><div><dt>Plánované odkladanie</dt><dd>− ${money(t.saving)}</dd></div></dl><div class="monthly-left"><span>Po odložení zostáva</span><strong class="${t.left<0?'negative':''}">${money(t.left)}</strong></div><p>${t.left<0?'Plánované výdavky a odkladanie sú vyššie než príjmy. Pokračovať môžeš aj tak — pozrieme sa, čo to znamená v čase.':'Toto je plán bežného mesiaca. Nepravidelné príjmy a známe jednorazové platby sa prejavia vo zvolených mesiacoch.'}</p>`;for(const [key]of [...groups,['known'],['irregular']]){const n=$(`[data-total="${key}"]`);if(n)n.textContent=money(budget[key].reduce((n,r)=>n+E.cents(r.amount),0));}}
 function question(){
  $('#journey').innerHTML=`${progress(1)}<section class="question-screen">${title('02 / TVOJ ODHAD','Do akej miery sa podľa teba ľudia držia rozpočtu, ktorý si stanovili?')}<div class="scale-card ${answer===null?'unanswered':''}"><div class="scale-caption"><span>TVOJ ODHAD</span><span>1 — 6</span></div><div class="scale-value" id="scale-value" aria-live="polite">${answer===null?'<span class="scale-prompt">Posuň ukazovateľ.<br>Čo si myslíš ty?</span>':`<span class="scale-number">0${answer}</span><strong>${answers[answer-1]}</strong>`}</div><label class="sr-only" for="discipline-scale">Do akej miery sa ľudia držia rozpočtu? Od 1, takmer vôbec, po 6, takmer vždy.</label><input id="discipline-scale" type="range" min="1" max="6" step="1" value="${answer||3}" aria-valuetext="${answer===null?'Zatiaľ bez odpovede':answers[answer-1]}" style="--fill:${((answer||3)-1)/5*100}%"><div class="scale-ticks" aria-hidden="true">${answers.map((a,i)=>`<span data-scale-tick="${i+1}" class="${answer===i+1?'selected':''}"><i></i>${i+1}</span>`).join('')}</div><div class="scale-extremes"><span>Takmer<br><strong>vôbec.</strong></span><span>Takmer<br><strong>vždy.</strong></span></div></div><p class="quiet-note">Žiadna odpoveď nie je správna ani nesprávna. Je to tvoj odhad, nie hodnotenie seba.</p><div class="flow-actions"><button class="text-link" data-action="edit-before">← Späť k rozpočtu</button>${primary('start-year','Pozrieť sa na jeden možný rok',answer===null)}</div></section>`;
 }
 function selectAnswer(value){
  answer=Math.max(1,Math.min(6,Number(value)));
  const input=$('#discipline-scale');input.value=answer;input.style.setProperty('--fill',`${(answer-1)/5*100}%`);input.setAttribute('aria-valuetext',answers[answer-1]);
  $('.scale-card').classList.remove('unanswered');$('#scale-value').innerHTML=`<span class="scale-number">0${answer}</span><strong>${answers[answer-1]}</strong>`;
  document.querySelectorAll('[data-scale-tick]').forEach(n=>n.classList.toggle('selected',Number(n.dataset.scaleTick)===answer));$('#journey [data-action="start-year"]').disabled=false;
 }
 function launch(same=false){stop();yearSelected=null;monthReview=false;for(const timer of stickerTimers.values())clearTimeout(timer);stickerTimers.clear();settledStickers.clear();receiptCounter?.reset();monthRulesOpen=false;receiptTransfersOpen=false;eventCardsOpen=false;if(character){characterSeed??=crypto.getRandomValues(new Uint32Array(1))[0];run=BudgetCharacters.scenario(budget,traits.discipline,characterSeed);}else if(!same)run=Y.generate(budget,answer,crypto.getRandomValues(new Uint32Array(1))[0]);if(run.interactive)run=YearChoices.reset(run);projection=Y.simulate(budget,run);plan=Y.simulate(budget,run,{plan:true});revealed=0;cursor=-1;lastPaymentDay=null;editing=false;nav('january');}
 const snapshot=()=>cursor<0?projection.opening:projection.days[cursor];
 function graph(){
  const mobile=matchMedia('(max-width:700px)').matches,W=mobile?360:1000,H=mobile?360:400,L=mobile?48:74,R=26,T=step==='january'?112:70,B=H-45,jan=step==='january',end=jan?30:projection.days.length-1,days=projection.days.slice(0,end+1),comparison=previous||plan;
  const vals=[projection.opening.checking,...days.flatMap(d=>[d.checking,d.checkingLow]),...comparison.days.slice(0,end+1).flatMap(d=>[d.checking,d.checkingLow])];let min=Math.min(0,...vals),max=Math.max(10000,...vals);const gap=Math.max(10000,(max-min)*.12);min=min<0?min-gap:0;max+=gap;
  const x=i=>L+i/end*(W-L-R),y=v=>B-(v-min)/(max-min)*(B-T);
  const path=(data,until)=>{let s=`M${L},${y(data.opening.checking)}`;for(const d of data.days.slice(0,until+1))s+=` L${x(d.index)},${y(d.checkingLow)} L${x(d.index)},${y(d.checking)}`;return s;};const main=path(projection,Math.min(cursor,end));
  let markers=[];
  if(jan){const candidates=[{day:0,icon:'euro',name:'Mzda už na účte',events:projection.ledger.filter(e=>e.date===run.year+'-01-01'&&e.type==='income')}];for(const e of run.events.filter(e=>e.date.slice(5,7)==='01').slice(0,revealed))candidates.push({day:Number(e.date.slice(8))-1,icon:e.icon,name:e.name,events:[e]});const seenCategories=new Set();
   for(const entry of projection.ledger){
    if(!entry.categoryId||!entry.date.startsWith(run.year+'-01'))continue;
    const day=E.diffDays(run.year+'-01-01',entry.date);
    const representative={food:8,transport:11,outside:15,leisure:19,clothes:23}[entry.categoryId]??17;
    if(day>cursor||(entry.type==='daily'&&day<representative)||seenCategories.has(entry.categoryId))continue;
    seenCategories.add(entry.categoryId);candidates.push({day,icon:entry.icon,name:entry.categoryName,events:[entry]});
   }
   for(const c of candidates.filter(c=>c.events.length).sort((a,b)=>a.day-b.day)){const last=markers.at(-1);if(last&&x(c.day)-x(last.day)<38){last.events.push(...c.events);last.name+=' + '+c.name;}else markers.push(c);}}
  else for(let m=0;m<12;m++){const seen=new Set();const events=projection.ledger.filter(e=>{if(Number(e.date.slice(5,7))!==m+1||E.diffDays(run.year+'-01-01',e.date)>cursor)return false;if(e.type==='daily'){if(seen.has(e.categoryId))return false;seen.add(e.categoryId);return true;}return ['expense','known','life','temptation','insured','deviation','extraIncome'].includes(e.type);}),chosen=events.find(e=>e.type==='life')||events[0];if(chosen){const day=E.diffDays(`${run.year}-01-01`,chosen.date);if(day<=cursor){const last=markers.at(-1);if(last&&x(day)-x(last.day)<38)last.events.push(...events);else markers.push({day,icon:chosen.icon,name:chosen.name,events});}}}
  const captionBoxes=[];
  const lastMarker=markers.filter(m=>m.day<=cursor).at(-1);
  function caption(m,xx,yy){
   if(!jan&&m!==lastMarker&&m.day!==inspected)return '';
   const width=mobile?116:162,left=Math.max(L,Math.min(W-R-width,xx-width/2)),height=34;
   let top=Math.max(8,yy-62);
   for(let lane=0;lane<6;lane++){
    const candidate=Math.max(8,yy-62-lane*40);
    if(!captionBoxes.some(b=>left<b.right+5&&left+width>b.left-5&&candidate<b.bottom+5&&candidate+height>b.top-5)){top=candidate;break;}
   }
   captionBoxes.push({left,right:left+width,top,bottom:top+height});
   const words=m.name.split(' '),lines=[''];for(const word of words){if((lines.at(-1)+' '+word).trim().length>(mobile?19:25)&&lines.length<2)lines.push(word);else lines[lines.length-1]+=(lines.at(-1)?' ':'')+word;}
   const label=lines.slice(0,2).map(l=>l.length>26?l.slice(0,24)+'…':l);
   return `<g class="event-caption" aria-hidden="true"><path d="M${left+width/2},${top+height} L${xx},${yy-19}" stroke="#c4bff2" stroke-width="1"/><rect x="${left}" y="${top}" width="${width}" height="${height}" rx="7" fill="${m.day===cursor?'#092b50':'#eeecff'}"/><text x="${left+width/2}" y="${top+(label.length===1?21:14)}" text-anchor="middle" style="font-size:${mobile?12:11}px;fill:${m.day===cursor?'white':'#403e72'};font-weight:600">${label.map((l,i)=>`<tspan x="${left+width/2}" dy="${i?12:0}">${esc(l)}</tspan>`).join('')}</text></g>`;
  }
  function endBalance(){const value=projection.days[end].checking,xx=x(end),yy=y(value),width=mobile?154:190,left=Math.max(L,xx-width),above=yy-75>8,top=above?yy-75:yy+26;return `<g class="end-balance" data-checking="${value}" role="img" aria-label="Zostatok bežného účtu ${money(value)}"><circle cx="${xx}" cy="${yy}" r="8" fill="#092b50" stroke="white" stroke-width="3"/><path d="M${xx},${yy} L${xx-12},${above?top+58:top}" stroke="#092b50" stroke-width="1.5"/><rect x="${left}" y="${top}" width="${width}" height="58" rx="12" fill="#092b50"/><text x="${left+14}" y="${top+20}" style="fill:#dce5fb;font-size:${mobile?11:12}px">ZOSTATOK NA ÚČTE</text><text x="${left+14}" y="${top+44}" style="fill:white;font-size:${mobile?20:23}px;font-weight:600">${esc(money(value))}</text></g>`;}
  const ticks=jan?[0,7,14,21,30]:Array.from({length:12},(_,m)=>E.diffDays(`${run.year}-01-01`,`${run.year}-${String(m+1).padStart(2,'0')}-01`)).filter((_,i)=>!mobile||i%2===0||i===11);
  return `<svg class="budget-chart year-chart" viewBox="0 0 ${W} ${H}" role="group" aria-label="Zostatok bežného účtu. Rezerva sa zobrazuje osobitne. Denný priebeh zachováva aj prepady v rámci mesiaca."><defs><linearGradient id="year-fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#4479ff" stop-opacity=".13"/><stop offset="1" stop-color="#4479ff" stop-opacity="0"/></linearGradient></defs>${min<0?`<rect x="${L}" y="${y(0)}" width="${W-L-R}" height="${B-y(0)}" fill="#fff1f0"/>`:''}${[0,1,2,3,4].map(i=>{const v=min+(max-min)*i/4;return `<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="#e1e7f0" stroke-dasharray="3 5"/><text x="${L-10}" y="${y(v)+4}" text-anchor="end">${new Intl.NumberFormat('sk-SK',{maximumFractionDigits:0}).format(v/100)}</text>`;}).join('')}<text x="${L-10}" y="15" text-anchor="end">EUR</text><path d="${path(comparison,end)}" fill="none" stroke="#b3bfd2" stroke-width="1.7" stroke-dasharray="5 5"/><path d="${main} L${x(Math.max(0,Math.min(cursor,end)))},${B} L${L},${B} Z" fill="url(#year-fill)"/><path d="${main}" stroke="#4479ff" stroke-width="3" fill="none" stroke-linejoin="round"/>${ticks.map(i=>`<text x="${x(i)}" y="${H-15}" text-anchor="${i===0?'start':i===end||i>330?'end':'middle'}">${jan?(i===0?'1. jan.':`${i+1}.`):months[projection.days[i].month].slice(0,3).toLowerCase()}</text>`).join('')}${markers.map(m=>{const future=m.day>cursor&&m.day!==0,yy=y(m.day===0&&cursor<0?projection.opening.checking:projection.days[m.day].checking),xx=x(m.day);const badges=[...new Set(m.events.map(e=>e.icon||m.icon))];return `<g tabindex="0" role="button" data-action="inspect" data-dates="${[...new Set(m.events.map(e=>e.date))].join(',')}" data-day="${m.day}" aria-label="${esc(m.name)}: ${date(projection.days[m.day].date)}${future?', náhľad':''}" style="color:#092b50"><title>${esc(m.name)}</title>${caption(m,xx,yy)}<circle cx="${xx}" cy="${yy}" r="${mobile?14:17}" fill="${future?'#efedff':'#ded38f'}" stroke="${future?'#9b95d9':'#4479ff'}" stroke-width="${m.day===cursor?4:2}"/>${badges.slice(0,4).map((key,i)=>`<g class="category-badge ${m.day===cursor?'entering':''}" transform="translate(${xx+(i-(Math.min(4,badges.length)-1)/2)*25},${yy})"><title>${esc(m.events.find(e=>e.icon===key)?.categoryName||m.name)}</title>${badges.length>1?'<circle r="13" fill="#f5f0cf" stroke="#4479ff" stroke-width="1.5"/>':''}<svg x="-9" y="-9" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="${paths[key]||paths.other}"/></svg></g>`).join('')}${m.events.length>1?`<text x="${xx+14}" y="${yy-15}" style="font-size:9px">${m.events.length}</text>`:''}</g>`;}).join('')}${cursor>=end?endBalance():''}</svg>`;
 }
 function categoryLegend(){
  const seen=new Set(),rows=[...budget.fixed,...budget.consumption,...(budget.insurance||[])];
  return `<div class="category-legend" aria-label="Kategórie výdavkov v grafe">${rows.filter(r=>r.amount>0).map(r=>{const key=Y.categoryIcon(r);if(seen.has(key))return '';seen.add(key);return `<span>${icon(key,18)}${esc(key==='other'?'Iné navyše':r.name)}</span>`;}).join('')}</div>`;
 }
 function balances(){const d=snapshot(),drawn=cursor<0?0:projection.ledger.filter(e=>e.type==='reserveDraw'&&e.date<=projection.days[cursor].date).reduce((total,e)=>total+e.amount,0);return `<div class="three-balances">${[['checking','Bežný účet'],['reserve','Rezerva'],['future','Na budúcnosť']].map(([k,n])=>`<div><span>${n}</span><strong class="${d[k]<0?'negative':''}">${money(d[k])}</strong>${k==='reserve'?`<small class="reserve-drawn">Doteraz čerpané: <b>${money(drawn)}</b></small>`:''}</div>`).join('')}</div>`;}
 function presentEvent(e){if(Y.isInsured(e,budget))return {...e,amount:0,included:true,text:'Pokrýva modelové poistenie. Pôvodný výdavok '+money(E.cents(e.amount))+'. Dopad na účet: 0 €.'};if(e.type==='deviation'&&run.crisis&&e.date>run.crisis.date)return {...e,amount:0,included:true,name:'Nákup nad plán vynechaný'};if(e.type==='deviation'&&run.rescue?.kind==='cut'&&e.date>run.rescue.date)return {...e,amount:Math.round(E.cents(e.amount)*.9)/100};return e;}
 function eventCard(e){e=presentEvent(e);return `<article class="reveal-card ${pendingEvent===e.id?'landing-pending':''}" data-event-id="${esc(e.id)}"><span class="event-icon">${icon(e.icon)}</span><div><small>${date(e.date)} · ${e.mood?(e.mood==='pleasant'?'Príjemná situácia':'Nepríjemná situácia'):e.type==='life'?'Život sa ozval':e.type==='deviation'?'nad vlastný plán':'súčasť plánu'}</small><h3>${esc(e.name)}</h3><strong>${e.included||e.type==='covered'?'Zahrnuté v pláne alebo kryté · navyše 0 €':`− ${money(E.cents(e.amount))}`}</strong><p>${esc(e.text)}</p></div></article>`;}
 function summarizeEvents(entries){
  const result=[],draws=new Map();
  for(const entry of entries){
   if(entry.type==='daily')continue;
   if(entry.type!=='reserveDraw'){result.push(entry);continue;}
   const existing=draws.get(entry.date);
   if(existing)existing.amount+=entry.amount;
   else{const summary={...entry};draws.set(entry.date,summary);result.push(summary);}
  }
  return result;
 }
 function moment(){const day=inspected!==null?projection.days[inspected]:cursor>=0?projection.days[cursor]:null;if(!day)return 'Mzda už je na účte. Začínaš so mzdou a peniazmi, ktoré si mal odložené. Najskôr zisti, čo priniesol január.';const events=summarizeEvents(day.events);return `<strong>${date(day.date)}</strong> ${events.length?events.map(e=>`${esc(e.name)}: ${e.type==='covered'?'navyše 0 €':money(e.amount)}${e.type==='reserveDraw'?' (z rezervy, bez zmeny súčtu)':e.type==='transfer'?` (presun; plán ${money(e.planned)})`:''}`).join(' · '):`Bežná spotreba podľa plánu: ${money(-day.events.filter(e=>e.type==='daily').reduce((n,e)=>n+e.amount,0))}`}${day.checking<0?'<br>Záporná suma je chýbajúce financovanie, nie poskytnutý úver.':''}`;}
 function yearLoanWarning(){
  if(!projection.loanBorrowed)return '';
  return `<aside class="year-loan-warning" aria-labelledby="loan-warning-title"><span class="eyebrow">ZÁŤAŽ ĎALŠÍCH MESIACOV</span><h2 id="loan-warning-title">Úľava dnes, splátky aj zajtra.</h2><p>Požičal si si <strong>${money(projection.loanBorrowed)}</strong>. Vrátiš celkom <strong>${money(projection.loanBorrowed+projection.loanCost)}</strong> — teda <strong>${money(projection.loanCost)} navyše za celú pôžičku</strong>.</p><p>Splácanie: <strong>${run.rescue.term} mesačných splátok približne po ${money(run.rescue.payment)}</strong>. Preplatenie nie je ďalší mesačný poplatok.</p><p>Pri financovaní radostí môže zážitok skončiť skôr než splácanie. Splátka pritom uberá priestor ďalším výdavkom aj odkladaniu.</p></aside>`;
 }
 function balanceTrend(key,label){
  if(!['reserve','future'].includes(key))return '';
  const values=[projection.opening[key],...YearJourney.months(projection).map(month=>month[key])];
  const min=Math.min(0,...values),max=Math.max(1,...values),width=132,height=28;
  const points=values.map((value,index)=>[4+index*width/(values.length-1),32-(value-min)/(max-min)*height]);
  const path=points.map(([x,y],index)=>`${index?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' '),last=points.at(-1);
  const direction=values.at(-1)>values[0]?'vzrástla':values.at(-1)<values[0]?'klesla':'zostala na rovnakej sume';
  return `<svg class="balance-trend trend-${key}" data-balance-trend="${key}" viewBox="0 0 140 48" role="img" aria-label="${label}: priebeh tohto roka, ${direction}, zo ${money(values[0])} na ${money(values.at(-1))}"><title>${label} · priebeh tohto roka od januára do decembra</title><path d="${path} L136,34 L4,34 Z" fill="currentColor" opacity=".09"/><path d="${path}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${last[0]}" cy="${last[1]}" r="3" fill="currentColor"/><text x="4" y="46">jan</text><text x="136" y="46" text-anchor="end">dec</text></svg>`;
 }
 function finalScreen(){
  const p=projection,f=p.final,drawn=p.ledger.filter(e=>e.type==='reserveDraw').reduce((n,e)=>n+e.amount,0);
  const before=previous?previous.final:p.opening;
  const items=[['checking','Zostatok na účte','euro'],['reserve','Rezerva','shield'],['future','Na budúcnosť','star']];
  const insight=p.firstDeficit?'Niektoré dni chýbali peniaze. Koncový zostatok sám o sebe neukáže, aký náročný bol priebeh.':p.shortSaving?'Plánované odkladanie sa nepodarilo celé. V ďalšom pokuse skús zistiť, čo mu vzalo priestor.':'Tento príbeh sa obišiel bez nekrytého výdavku. Iný rok môže priniesť iné situácie — rezerva má význam aj vtedy, keď ju práve netreba.';
  const relevantAdvice=p.firstDeficit?'shortage':p.deviation?'spending':'saving';
  $('#journey').innerHTML=`<section class="final-screen">${title('05 / TVOJ ROK','Čo ukázal tvoj rok?')}<div class="final-hero"><div class="final-hero-top"><span class="eyebrow">ZOSTATKY</span><span>${run.year} · 31. december</span></div><table class="final-comparison"><caption class="sr-only">${previous?'Zostatky pred úpravou a po úprave rozpočtu':'Zostatky na začiatku a na konci roka'}</caption><thead><tr><th scope="col"><span class="sr-only">Kde sú peniaze</span></th><th scope="col">${previous?'Pred úpravou':'Na začiatku'}</th><th scope="col">${previous?'Po úprave':'Na konci'}</th></tr></thead><tbody>${items.map(([key,label,glyph])=>`<tr class="balance-row-${key}"><th scope="row"><span>${icon(glyph,20)}${label}</span></th><td class="balance-before">${money(before[key]||0)}</td><td class="balance-after ${f[key]<0?'in-deficit':''}" data-final-balance="${key}"><span class="final-balance-line">${balanceTrend(key,label)}<strong class="final-balance-value">${money(f[key])}</strong></span></td></tr>`).join('')}${p.debtRemaining||previous?.debtRemaining?`<tr class="balance-row-debt"><th scope="row">Zostáva splatiť</th><td>${money(previous?.debtRemaining||0)}</td><td>${money(p.debtRemaining)}</td></tr><tr class="balance-row-net"><th scope="row">Účet + rezerva − dlh</th><td>${money(before.available-(previous?.debtRemaining||0))}</td><td>${money(f.available-p.debtRemaining)}</td></tr>`:''}</tbody></table></div>
  ${p.reserveBonus?`<aside class="year-reserve-bonus"><span>${icon('shield',20)}Modelový bonus banky k rezerve <strong>+ ${money(p.reserveBonus)}</strong></span><small>1 % z priemernej dennej rezervy ${money(Math.round(p.averageReserve))}, pripísané 31. decembra.${p.reserveBonusUsed?` Z toho ${money(p.reserveBonusUsed)} pomohlo pokryť mínus na účte.`:''}</small></aside>`:''}${yearLoanWarning()}<section class="next-questions" aria-labelledby="next-title"><h2 id="next-title">Jedna vec do ďalšej výplaty.</h2><div class="advice-bubbles">${Object.entries(BudgetAdvice).map(([key,item],i)=>`<button class="advice-bubble advice-${key} ${key===relevantAdvice?'is-relevant':''}" data-action="advice" data-advice="${key}" aria-haspopup="dialog"><span class="advice-icon">${icon(item.icon,28)}</span>${key===relevantAdvice?'<span class="advice-relevance">NADVÄZUJE NA TENTO VÝSLEDOK</span>':''}<strong>${esc(item.label)}</strong><span class="advice-link">Pozrieť tipy <span aria-hidden="true">↗</span></span></button>`).join('')}</div></section>
  <div class="flow-actions final-actions"><button class="text-link" data-action="new-year">Vyskúšať nový náhodný rok</button><button class="button secondary" data-action="retry">Zmeniť rozpočet a skúsiť ten istý rok <span aria-hidden="true">→</span></button>${primary('home','Koniec')}</div>
  <details class="final-details"><summary>Pozrieť priebeh roka a vysvetlenie výsledku</summary>${p.loanBorrowed?`<p class="final-breakdown">Pôžička priniesla ${money(p.loanBorrowed)}. Do konca roka si splatil ${money(p.loanPaid)}; zostáva ${money(p.debtRemaining)}. Požičané peniaze nie sú zárobok.</p>`:''}<p class="final-breakdown">${insight}</p><p class="final-breakdown">Z rezervy sa počas roka čerpalo ${money(drawn)}.${p.firstDeficit?` Prvý nekrytý výdavok: ${date(p.firstDeficit)}.`: ''}</p><p class="final-breakdown">Spotreba nad plán: −${money(p.deviation)}. Životné výdavky: −${money(p.life)}. Príjmy navyše: +${money(p.extra)}. Poistenie pokrylo ${money(p.insured)}.</p><p class="final-breakdown">Oproti plánu bez udalostí navyše zostalo na účte a v rezerve ${money(f.available-p.debtRemaining-plan.final.available)} po odpočítaní dlhu a na budúcnosť ${money(f.future-plan.final.future)}. Neuskutočnené plánované presuny: ${money(p.shortSaving)}.</p><section class="year-stage year-result-calendar">${yearSceneContent()}</section><div id="moment" class="moment">Vyber udalosť zo zoznamu.</div>${eventList()}</details><p class="quiet-note">Výsledok platí pre tvoje zadané údaje a tento ilustračný rok. <button class="text-link" data-action="help">Ako to funguje</button></p></section>`;
 }
 function showAdvice(key){
  const item=BudgetAdvice[key];if(!item)return;
  $('#info-dialog').classList.add('advice-dialog');
  $('#info-dialog').innerHTML=`<button class="dialog-close" data-action="close-info" aria-label="Zavrieť tipy">×</button><span class="advice-dialog-icon">${icon(item.icon,32)}</span><p class="eyebrow">MALÝ KROK DO BEŽNÉHO ŽIVOTA</p><h2 id="info-title">${esc(item.title)}</h2><p class="advice-intro">${esc(item.intro)}</p><ol class="advice-steps">${item.steps.map(([heading,text],i)=>`<li><span class="advice-step-number">0${i+1}</span><div><h3>${esc(heading)}</h3><p>${esc(text)}</p></div></li>`).join('')}</ol><div class="advice-try"><span class="eyebrow">SKÚS JEDNU VEC</span><p>${esc(item.try)}</p></div><p class="advice-note">${esc(item.note)}</p><p class="advice-source">Viac k téme: <a href="https://5penazi.sk/rady-pre-vas/rodinny-rozpocet-nastavte-si-vydavky-podla-prijmov/" target="_blank" rel="noopener noreferrer">5PEŇAZÍ — rodinný rozpočet</a>.</p><div class="editor-actions">${primary('close-info','Späť k môjmu roku')}</div>`;
  $('#info-dialog').showModal();
 }
 function eventList(){return `<details class="year-event-list"><summary>Udalosti roka · dostupný zoznam</summary><div>${run.events.map(raw=>{const e=presentEvent(raw);return `<button data-action="inspect" data-day="${E.diffDays(`${run.year}-01-01`,e.date)}">${icon(e.icon,18)}<span>${date(e.date)} · ${esc(e.name)}</span><strong>${e.included||e.type==='covered'?'navyše 0 €':`${e.type==='extraIncome'?'+':'−'}${money(E.cents(e.amount))}`}</strong></button>`;}).join('')}</div></details>`;}
 function yearWallet(row,scale){
  const radius=82,circ=2*Math.PI*radius,total=Math.abs(row.available),ratio=Math.min(1,total/scale);
  const checking=row.available<0?0:Math.max(0,row.checking)/scale,reserve=row.available<0?0:Math.max(0,row.reserve)/scale;
  return `<div class="year-wallet ${row.available<0?'in-deficit':''}" role="img" aria-label="${months[row.month]}: účet a rezerva spolu ${money(row.available)}"><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="82" fill="none" stroke="#e6eaf4" stroke-width="14"/>${[['checking','#4479ff',checking,0],['reserve','#8c7be3',reserve,-checking*circ],['deficit','#c34152',row.available<0?ratio:0,0]].map(([key,color,value,offset])=>`<circle data-year-ring="${key}" cx="100" cy="100" r="82" fill="none" stroke="${color}" stroke-width="14" stroke-dasharray="${value*circ} ${circ}" stroke-dashoffset="${offset}" transform="rotate(-90 100 100)"/>`).join('')}</svg><div><span>Účet + rezerva</span><strong data-year-total>${money(row.available)}</strong><small data-year-date>na konci mesiaca</small></div></div>`;
 }
 function yearCrisisImpact(row){
  if(!run.crisis||row.date<run.crisis.date)return '';
  const turbo=run.turbo?.enabled&&row.date>=run.turbo.date,impact=turbo?YearChoices.turboPlan(budget):YearChoices.crisisPlan(budget,run);
  return `<aside class="year-austerity-impact ${turbo?'is-turbo':''}"><span class="eyebrow">${turbo?'TURBO REŽIM':'ÚSPORNÝ REŽIM'} · OD ${date(E.addDays(turbo?run.turbo.date:run.crisis.date,1))}</span><strong>Radosti <s>${money(impact.before)}</s> → ${money(impact.after)} / mesiac</strong><p>Automatické nákupy navyše sú pozastavené. Doterajšie mínus sa nevymazalo.</p></aside>`;
 }
 function yearSceneContent(){
  const rows=YearJourney.months(projection),reached=projection.days[Math.max(0,cursor)].month;
  const selected=yearSelected!==null&&yearSelected<=reached?yearSelected:reached,row=rows[selected],scale=YearJourney.scale(projection),event=row.featured;
    return `<div class="year-stage-header"><div><span class="eyebrow">${run.year} · ${selected+1} / 12</span><h1 tabindex="-1">${months[selected]}</h1></div><span class="year-play-state">${playing?'Rok plynie':cursor>=projection.days.length-1?'Rok za tebou':'Pozastavené'}</span></div><div class="year-month-progress" aria-hidden="true"><i data-year-progress></i></div><div class="year-focus"><div class="year-focus-money">${yearWallet(row,scale)}<div class="year-pocket-legend"><span><i></i>Účet <strong data-year-pocket="checking">${money(row.checking)}</strong></span><span><i></i>Rezerva <strong data-year-pocket="reserve">${money(row.reserve)}</strong></span><span class="pocket-future"><i></i>Na budúcnosť <strong data-year-pocket="future">${money(row.future)}</strong></span></div>${fundingOrder()}${run.reservePlan&&row.date>=run.reservePlan.date?`<p class="year-direction-note">${run.reservePlan.share?`${run.reservePlan.share} % ďalších vkladov do rezervy smeruje na budúcnosť.`:'Rezervu buduješ do 6 mesiacov výdavkov; ďalšie vklady pôjdu na budúcnosť.'}</p>`:''}${row.debtRemaining?`<p class="year-debt-strip">Zostáva splatiť <strong data-year-debt>${money(row.debtRemaining)}</strong> <span>· splátka ${money(run.rescue.payment)} / mes.</span></p>`:''}${!run.crisis&&run.rescue?.kind==='cut'&&row.date>=run.rescue.date?'<p class="year-change-strip">Radosti −10 % od tvojho rozhodnutia</p>':''}</div><div class="year-month-story"><span class="year-story-icon">${icon(event?.icon||'basket',30)}</span><span class="eyebrow">${event?'MOMENT MESIACA':'BEŽNÝ MESIAC'}</span><h2>${event?esc(event.name):'Život ide ďalej.'}</h2>${event?`<strong class="year-story-amount ${event.amount<0?'outgoing':'incoming'}">${event.amount<0?'− ':event.amount>0?'+ ':''}${money(Math.abs(event.amount))}</strong>`:''}<p>${event?.type==='insured'?'Túto situáciu pokrylo modelové poistenie.':event?date(event.date):'Bežné platby sú zaplatené.'}</p><div class="year-gap ${row.firstGap?'':'is-empty'}" ${row.firstGap?'':'aria-hidden="true"'}>${icon('euro',18)}<span>V tomto mesiaci peniaze aj chýbali.</span></div></div></div>${yearCrisisImpact(row)}<div class="year-calendar" role="group" aria-label="Mesiace roka, účet a rezerva na konci mesiaca">${rows.map(m=>{
   const seen=m.endIndex<=cursor,current=m.month===selected;
   return `<button class="year-month-tile ${current?'is-current':''} ${seen?'is-complete':'is-pending'} ${m.available<0&&seen?'has-deficit':''}" data-action="year-month" data-month="${m.month}" ${seen?'':'disabled'} aria-pressed="${current}" aria-label="${months[m.month]}${seen?': účet a rezerva '+money(m.available)+(m.firstGap?', počas mesiaca nedostatok':''):', ešte neprehrané'}"><span class="tile-month">${months[m.month]}${seen&&m.firstGap?'<b aria-hidden="true">!</b>':''}</span><strong ${current?'data-year-total':''}>${seen?money(m.available):'—'}</strong><span class="tile-bar" aria-hidden="true"><i style="width:${seen?Math.abs(m.available)/scale*100:0}%"></i></span></button>`;
  }).join('')}</div><details class="year-explanation"><summary>Čo ukazujú mesiace?</summary><p>Kruh aj políčka sledujú účet a rezervu spolu. Všetky mesiace majú rovnakú mierku. Budúce ciele sú oddelené. Výkričník upozorní aj na nedostatok počas mesiaca, ktorý neskorší príjem vyrovnal.</p></details>`;
 }
 function openYearDecision(checkpoint,snapshot){
  if(step!=='year'||yearDecision)return;
  stop();yearDecision={...checkpoint,snapshot};const dialog=$('#year-decision');
  const balances=`<p class="year-choice-balances">Na účte <strong>${money(snapshot.checking)}</strong><span>Rezerva ${money(snapshot.reserve)}</span><span class="year-choice-protected">Na budúcnosť ${money(snapshot.future)} · ostáva bokom</span></p>`;
  if(checkpoint.kind==='purchase'){
   const item=YearChoices.offer(snapshot,run,checkpoint.eventId),number=run.events.filter(e=>e.decision&&e.decision!=='pending').length+1,total=run.events.filter(e=>e.decision).length;
   dialog.innerHTML=`<span class="eyebrow">TERAZ ROZHODUJEŠ TY · ${number} / ${total}</span><span class="year-choice-icon">${icon(item.icon,32)}</span><h2 id="year-decision-title">${esc(item.title)}</h2><p>${esc(item.text)}</p><strong class="year-choice-price">${money(E.cents(item.amount))}</strong>${balances}<div class="year-choice-impact ${item.canBuy?'':'is-empty'}">${item.canBuy?`<p>Po kúpe zostane na účte: <strong>${money(item.afterChecking)}</strong></p>${item.reserveDraw?`<p class="year-reserve-impact">Z rezervy ti ubudne <strong>${money(item.reserveDraw)}</strong>.<small>Rezerva po kúpe: ${money(item.afterReserve)}.</small></p>`:''}`:''}</div><div class="year-choice-actions"><button class="button primary" data-action="year-buy">Áno, kúpiť</button><button class="button year-choice-no" data-action="year-decline">Teraz nie</button></div>`;
  }else if(checkpoint.kind==='reserve'){
   yearDecision.reserveShare=50;
   const monthsCovered=snapshot.reserve/projection.monthlyExpenses,atCap=monthsCovered>=6;
   dialog.innerHTML=`<span class="eyebrow">REZERVA MÁ PEVNÝ ZÁKLAD</span><h2 id="year-decision-title">Začneš investovať do budúcnosti?</h2><p>V rezerve máš <strong>${money(snapshot.reserve)}</strong>. To pokryje aspoň ${atCap?'6 mesiacov':'3 mesiace'} plánovaných výdavkov (${money(projection.monthlyExpenses)} / mesiac).</p><p>Rezerva ti dáva peniaze poruke pri nečakaných výdavkoch. Ďalšie peniaze môžeš investovať do budúcnosti s možnosťou vyššieho dlhodobého zhodnotenia.</p><label class="year-reserve-label" for="year-reserve-share">Akú časť ďalších vkladov do rezervy investuješ do budúcnosti?</label><input id="year-reserve-share" type="range" min="0" max="100" step="10" value="50" style="--fill:50%"><output class="year-reserve-preview" id="year-reserve-preview" for="year-reserve-share" aria-live="polite"></output><div class="year-choice-actions"><button class="button primary" data-action="year-reserve" data-kind="redirect">Áno, investovať 50 %</button><button class="button year-choice-no" data-action="year-reserve" data-kind="keep">${atCap?'Zachovať rezervu do 6 mesiacov':'Nie, chcem väčšiu rezervu (do 6 mesiacov)'}</button></div><p class="year-reserve-context">Menia sa ďalšie vklady od budúceho mesiaca. Pri 6 mesiacoch výdavkov pôjdu ďalšie vklady na budúcnosť. Hodnota investície môže aj klesnúť a výnos nie je zaručený. Zhodnotenie tu zatiaľ nesimulujeme.</p>`;
   updateReserveDecision();
  }else if(checkpoint.kind==='turbo'){
   const impact=YearChoices.turboPlan(budget);
   dialog.innerHTML=`<span class="eyebrow">ÚSPORNÝ PLÁN STÁLE NESTAČÍ</span><h2 id="year-decision-title">Zrýchlime návrat z mínusu?</h2><p>Úsporný plán už beží aspoň tri mesiace, ale účet a rezerva sú stále v mínuse. Turbo od ďalšieho mesiaca do konca roka zastaví plánované radosti, aby viac peňazí zostalo na vyrovnanie mínusu.</p><div class="year-crisis-comparison"><span>Plánované radosti mesačne</span><strong><s>${money(impact.before)}</s><span aria-hidden="true">→</span>${money(impact.after)}</strong><small>Potraviny, bývanie, doprava aj splátky pokračujú. Ponuky nákupov zostávajú na tvojom rozhodnutí.</small></div><p class="year-turbo-context">V realite sa k mínusu môžu pridať úroky, poplatky aj stres. Ďalšie náklady záporného účtu v tejto simulácii nepripočítavame.</p><div class="year-choice-actions"><button class="button primary" data-action="year-turbo" data-enabled="yes">Zapnúť turbo režim</button><button class="button year-choice-no" data-action="year-turbo" data-enabled="no">Pokračovať úsporne</button></div>`;
  }else if(checkpoint.kind==='crisis'){
   const impact=YearChoices.crisisPlan(budget,run);
   dialog.innerHTML=`<span class="eyebrow">HERNÉ PRAVIDLO · ÚSPORNÝ REŽIM</span><h2 id="year-decision-title">Takto to ďalej nejde.</h2><p>Tri mesiace po sebe si v mínuse aspoň 1 000 €. Od ďalšieho mesiaca potrebuje rozpočet úsporný plán.</p><div class="year-crisis-comparison"><span>Radosti mesačne</span><strong><s>${money(impact.before)}</s><span aria-hidden="true">→</span>${money(impact.after)}</strong><small>Automatické nákupy nad plán sa zastavia. Pri ďalších ponukách rozhodneš ty.</small></div><p class="year-crisis-note">Doterajšie mínus zostáva. Základné potreby, splátky a nečakané udalosti pokračujú.</p><button class="button primary year-crisis-start" data-action="year-crisis">Zapnúť úsporný režim</button>`;
  }else{
   const offer=YearChoices.loan(snapshot),saving=budget.consumption.filter(r=>['outside','clothes','leisure'].includes(r.id)).reduce((sum,r)=>sum+E.cents(r.amount),0)*.1;
   dialog.innerHTML=`<span class="eyebrow">ROZPOČET NARAZIL NA MÍNUS</span><h2 id="year-decision-title">Čo teraz?</h2>${balances}<div class="year-rescue-offer"><span>Peniaze na účet hneď</span><strong>+ ${money(E.cents(offer.principal))}</strong><p>Herná pôžička: ${offer.term} splátok, približne ${money(offer.payment)} mesačne od budúceho mesiaca. Spolu ${money(offer.total)}, z toho cena pôžičky ${money(offer.cost)}.</p><button class="button primary" data-action="year-rescue" data-kind="loan">Vziať pôžičku</button></div><div class="year-rescue-cut"><strong>Radosti o 10 % skromnejšie</strong><p>Od zajtra menej na jedlo vonku, oblečenie, voľný čas a automatické nákupy nad plán. Na radostiach približne ${money(Math.round(saving))} za celý mesiac menej; dnešné mínus zostáva.</p><button class="button year-choice-no" data-action="year-rescue" data-kind="cut">Znížiť radosti o 10 %</button></div><button class="text-link year-choice-later" data-action="year-rescue" data-kind="none">Pokračovať bez zmeny</button>`;
  }
  sound?.play('reveal');dialog.showModal();
 }
 function updateReserveDecision(){
  if(yearDecision?.kind!=='reserve')return;
  const share=yearDecision.reserveShare,allocation=Y.reserveAllocation(budget,{share,expenseBase:projection.monthlyExpenses},yearDecision.snapshot);
  $('#year-reserve-preview').innerHTML=`<strong>${share} % na budúcnosť</strong><span>Rezerva ${money(allocation.reserve)} / mesiac</span><span>Budúcnosť ${money(allocation.future)} / mesiac</span>`;
  $('#year-reserve-share').setAttribute('aria-valuetext',`${share} %, rezerva ${money(allocation.reserve)}, budúcnosť ${money(allocation.future)}`);
  $('#year-reserve-share').style.setProperty('--fill',share+'%');
  $('#year-decision [data-action="year-reserve"][data-kind="redirect"]').textContent=`Áno, investovať ${share} %`;
 }
 function resolveYearDecision(answer){
  if(!yearDecision)return;
  const {kind,eventId,snapshot}=yearDecision;
  if(kind==='purchase'&&answer&&!YearChoices.offer(snapshot,run,eventId).canBuy){
   const item=YearChoices.offer(snapshot,run,eventId);
   $('#year-decision').innerHTML=`<span class="eyebrow">TENTO NÁKUP TERAZ NEPREJDE</span><h2 id="year-decision-title">Nemáme peniaze, musíme šetriť.</h2><p class="year-no-money-alert" role="alert">Na nákup za ${money(E.cents(item.amount))} teraz účet ani rezerva nestačia.</p><p>Peniaze na budúcnosť ostávajú bokom. Nákup sa neuskutočnil.</p><button class="button year-choice-no year-blocked-confirm" data-action="year-decline" autofocus>Rozumiem, teraz nie</button>`;
   $('#year-decision [data-action="year-decline"]')?.focus();return;
  }
  if(kind==='purchase'&&answer&&run.turbo?.enabled&&snapshot.date>run.turbo.date&&!yearDecision.confirmed){
   yearDecision.confirmed=true;
   const button=$('#year-decision [data-action="year-buy"]');button.textContent='Skutočne? 🤦';
   button.classList.add('is-reconsidering');button.setAttribute('aria-label','Skutočne kúpiť aj v turbo režime?');button.focus();return;
  }
  const updated=kind==='purchase'?YearChoices.purchase(run,eventId,answer,snapshot):kind==='crisis'?YearChoices.activateCrisis(run,snapshot):kind==='turbo'?YearChoices.activateTurbo(run,snapshot,answer):kind==='reserve'?YearChoices.directReserve(run,snapshot,answer,projection.monthlyExpenses):YearChoices.rescue(run,answer,snapshot);
  if(updated===run)return;
  run=updated;projection=Y.simulate(budget,run);yearDecision=null;$('#year-decision').close();yearContinuation=snapshot;yearMotion?.reset();
  playing=true;scene(true);if(kind==='purchase'&&answer)sound?.play('expense');else if(kind==='rescue'&&answer==='loan')sound?.play('income');
  if(playing&&cursor<projection.days.length-1)timer=setTimeout(tick,3500);else if(!yearDecision)playing=false;
  saveScreen();
 }
 $('#year-decision')?.addEventListener?.('cancel',e=>{e.preventDefault();if(yearDecision&&yearDecision.kind!=='crisis')resolveYearDecision(yearDecision.kind==='reserve'?0:['purchase','turbo'].includes(yearDecision.kind)?false:'none');});
 function animateYearMonth(animate){
  if(!yearMotion)return;
  const stage=$('#journey [data-year-scene]');if(!stage)return;
  const reached=projection.days[Math.max(0,cursor)].month;
  const selected=yearSelected??reached,scale=YearJourney.scale(projection),circ=2*Math.PI*82;
  const totals=[...stage.querySelectorAll('[data-year-total]')],pockets=[...stage.querySelectorAll('[data-year-pocket]')];
  const ring=stage.querySelector('.year-wallet'),rings=Object.fromEntries([...stage.querySelectorAll('[data-year-ring]')].map(node=>[node.dataset.yearRing,node]));
  const progress=stage.querySelector('[data-year-progress]'),label=stage.querySelector('[data-year-date]'),tile=stage.querySelector('.is-current'),bar=stage.querySelector('.is-current .tile-bar>i');
  const continuation=yearContinuation;yearContinuation=null;
  const points=run.interactive?YearChoices.timeline(projection,run,selected,continuation):YearJourney.frames(projection,selected);
  const elapsed=continuation?Math.min(1,Number(continuation.date.slice(8))/Number(points.at(-1).date.slice(8))):0;
  const debt=stage.querySelector('[data-year-debt]');
  yearMotion.render({id:selected,points,animate:animate&&!reduced.matches,duration:continuation?1600:selected===1?2700:2200,onCheckpoint:openYearDecision,draw:value=>{
   if(debt)debt.textContent=money(value.debtRemaining);
   const settled=value.progress===1,format=n=>settled?money(n):yearMoney.format(n/100);
   totals.forEach(node=>{node.textContent=format(value.available);});pockets.forEach(node=>{node.textContent=format(value[node.dataset.yearPocket]);});
   const negative=value.available<0,checking=negative?0:Math.max(0,value.checking)/scale,reserve=negative?0:Math.max(0,value.reserve)/scale;
   for(const [key,ratio] of [['checking',checking],['reserve',reserve],['deficit',negative?Math.abs(value.available)/scale:0]])rings[key].setAttribute('stroke-dasharray',`${Math.min(1,ratio)*circ} ${circ}`);
   rings.reserve.setAttribute('stroke-dashoffset',-checking*circ);ring.classList.toggle('in-deficit',negative);
   tile?.classList.toggle('has-deficit',negative);
   if(bar)bar.style.width=`${Math.min(1,Math.abs(value.available)/scale)*100}%`;
   label.textContent=settled?'na konci mesiaca':date(value.date);progress.style.width=`${(elapsed+(1-elapsed)*value.progress)*100}%`;
   stage.classList.toggle('is-year-moving',!settled);stage.setAttribute('aria-busy',String(!settled));
  }});
 }
 function scene(animateYear=false){
  if(step==='january'){januaryScene();return;}
  if(step==='result'){finalScreen();return;}
  receiptCounter?.reset();
  const focusAction=document.activeElement?.dataset?.action,done=cursor>=projection.days.length-1,content=yearSceneContent();
  const stage=$('#journey [data-year-scene]');
  if(playing&&stage?.matches?.('[data-year-scene]')&&$('#journey .scene-actions>.primary')?.getAttribute?.('aria-busy')==='true'){stage.innerHTML=content;animateYearMonth(animateYear);return;}
  $('#journey').innerHTML=`<section class="year-journey"><section class="year-stage" data-year-scene>${content}</section><div class="flow-actions scene-actions year-actions"><div>${done?'':`<button class="text-link" data-action="skip">${run.interactive?'Dokončiť bez ďalších nákupov':'Preskočiť na výsledok'}</button>`}</div>${done?primary('results','Pozrieť výsledok roka',run.events.some(e=>e.decision==='pending')):primary('play',playing?'Pozastaviť rok':'Pokračovať v roku')}</div></section>`;
  animateYearMonth(animateYear);
  if(focusAction)($(`#journey [data-action="${focusAction}"]`)||$('#journey .scene-actions>.primary'))?.focus({preventScroll:true});
 }
 function startYearIntro(){
  run=YearChoices.prepare(run);projection=Y.simulate(budget,run);yearSelected=null;cursor=30;nav('year');
  if(reduced.matches){scene();return;}
  const dialog=$('#year-intro');
  dialog.innerHTML='<div class="year-intro-content"><p class="eyebrow">JANUÁR BOL LEN ZAČIATOK</p><h2 id="year-intro-title">Teraz si pozrieme,<br>ako by sa vyvíjal<br><span>celý rok.</span></h2><span class="intro-year-line" aria-hidden="true">JAN ━━━━━━━━━ DEC</span></div>';
  dialog.showModal();
  dialog.classList.remove('is-leaving');timer=setTimeout(finishYearIntro,2600);
 }
 function finishYearIntro(){
  clearTimeout(timer);const dialog=$('#year-intro');if(!dialog.open||step!=='year')return;
  dialog.classList.add('is-leaving');timer=setTimeout(()=>{
   dialog.close();dialog.classList.remove('is-leaving');playing=true;scene();
   timer=setTimeout(tick,1900);
  },500);
 }
 $('#year-intro')?.addEventListener?.('cancel',e=>{e.preventDefault();finishYearIntro();});
 function monthBeat(){
  if(cursor<0)return 850;
  const day=projection.days[cursor];
  const main=run.events.some(e=>e.date===day.date);
  if(main)return 1800;
  if(day.events.some(e=>['expense','transfer','known','extraIncome'].includes(e.type)))return 1050;
  return 700;
 }
 function tick(){if(!playing)return;const jan=step==='january',end=jan?30:projection.days.length-1;cursor=Math.min(end,jan?cursor+1:YearJourney.nextIndex(projection,cursor));inspected=null;if(cursor===end)stop();scene(!jan);if(jan&&cursor<end)pushPayments();if(!jan)sound?.play(YearJourney.months(projection)[projection.days[cursor].month].featured?.amount>0?'income':'expense');if(jan&&cursor===end){window.scrollTo({top:0,behavior:'instant'});$('#month-result-title')?.focus({preventScroll:true});}if(playing)timer=setTimeout(tick,jan?monthBeat():(YearJourney.months(projection)[projection.days[cursor].month].featured?(projection.days[cursor].month===1?4700:4200):3600));}
 function finishReveal(restore=true){
  clearTimeout(revealTimer);flight?.cancel();flight=null;
  const dialog=$('#event-reveal');if(dialog?.open)dialog.close();
  const target=pendingEvent?$(`[data-event-id="${pendingEvent}"]`):null;target?.classList.remove('landing-pending');
  pendingEvent=null;revealBusy=false;
  if(restore)$('#journey .scene-actions>.primary')?.focus({preventScroll:true});
 }
 function revealEvent(){
  if(step!=='january'||cursor>=0||revealBusy||revealed>=3)return;
  const event=run.events.filter(e=>e.date.startsWith(run.year+'-01'))[revealed];
  if(!event)return;revealed++;revealBusy=true;showRandomEvent(event);sound?.unlock();sound?.play('reveal');
 }
 function showRandomEvent(raw){
  const event=presentEvent(raw),dialog=$('#event-reveal'),covered=event.included||event.type==='covered';
  dialog.innerHTML=`<div class="event-reveal-card random-event-focus" data-preview-event="${esc(event.id)}"><p class="eyebrow">Tento mesiac nás čaká · ${revealed} / 3</p><div class="random-event-dots" aria-hidden="true">${[1,2,3].map(n=>`<i class="${n<=revealed?'seen':''}"></i>`).join('')}</div><div class="big-event-icon">${icon(event.icon,46)}</div><span class="reveal-date">${date(event.date)}</span><h2 id="reveal-title">${esc(event.name)}</h2><strong class="reveal-amount ${covered?'is-covered':'is-expense'}">${covered?'Navyše 0 €':`− ${money(E.cents(event.amount))}`}</strong><p>${esc(event.text)}</p><span class="reveal-footnote">${covered?'Už zahrnuté v pláne.':'Platba príde počas mesiaca.'}</span><button class="reveal-continue" data-action="next-event">${revealed<3?(previous?'Ďalšia udalosť':'Vylosovať ďalšiu udalosť'):'Prehrať mesiac'} <span aria-hidden="true">→</span></button></div>`;
  if(!dialog.open)dialog.showModal();else $('.reveal-continue')?.focus({preventScroll:true});
 }
 function refreshStickers(){
  for(const zone of ['active','settled']){
   const container=$(`[data-sticker-zone="${zone}"]`);
   if(container)container.outerHTML=monthStickers(zone);
  }
 }
 function monthStickers(zone='settled'){
  const events=run.events.filter(event=>event.date.startsWith(run.year+'-01')).slice(0,revealed);
  return `<div class="month-stickers stickers-${zone}" data-sticker-zone="${zone}">${events.map(raw=>{
   const event=presentEvent(raw),paid=cursor>=0&&event.date<=projection.days[cursor].date;
   if(paid&&!settledStickers.has(event.id)&&!stickerTimers.has(event.id)){
    const activeRun=run;
    stickerTimers.set(event.id,setTimeout(()=>{
     if(step!=='january'||run!==activeRun){stickerTimers.delete(event.id);return;}
     const node=$(`[data-sticker-id="${event.id}"]`);
     const finish=()=>{
      stickerTimers.delete(event.id);settledStickers.add(event.id);
      if(step==='january'&&run===activeRun)refreshStickers();
     };
     if(!reduced.matches&&node?.animate){
      const animation=node.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(45px) rotate(6deg)'}],{duration:280,easing:'ease-in',fill:'forwards'});
      animation.onfinish=finish;
     }else finish();
    },2000));
   }
   const settled=settledStickers.has(event.id)||cursor>=30;
   if((zone==='settled')!==settled)return '';
   return `<div class="month-sticker ${paid?'is-paid':''}" data-sticker-id="${esc(event.id)}"><span>${icon(event.icon,20)}</span><div><strong>${esc(event.name)}</strong><small>${date(event.date)}</small></div>${paid?'<span class="sticker-check" aria-label="Zaúčtované">✓</span>':''}</div>`;
  }).join('')}</div>`;
 }
 function nextRandomEvent(){
  if(!revealBusy||step!=='january'||cursor>=0||flight)return;
  const card=$('#event-reveal .random-event-focus');
  const rect=card?.getBoundingClientRect?.();
  const event=run.events.filter(e=>e.date.startsWith(run.year+'-01'))[revealed-1];
  $('#event-reveal').close();
  januaryScene(true);
  const target=event?$(`[data-sticker-id="${event.id}"]`):null;
  const proceed=()=>{
   flight=null;
   if(revealed<3){revealBusy=false;revealEvent();return;}
   finishReveal(false);sound?.unlock();playing=true;tick();window.scrollTo({top:0,behavior:'instant'});
  };
  if(reduced.matches||!rect||!target?.animate){proceed();return;}
  const end=target.getBoundingClientRect();
  const clone=target.cloneNode(true);
  clone.removeAttribute('data-sticker-id');
  clone.classList.add('sticker-flight');clone.setAttribute('aria-hidden','true');
  Object.assign(clone.style,{left:end.left+'px',top:end.top+'px',width:end.width+'px'});
  document.body.append(clone);
  target.style.visibility='hidden';
  const animation=clone.animate([
   {transform:`translate(${rect.left+rect.width/2-end.left-end.width/2}px,${rect.top+rect.height/2-end.top-end.height/2}px) scale(1.4) rotate(-8deg)`,opacity:.8},
   {transform:'translate(0,0) scale(1) rotate(0deg)',opacity:1}
  ],{duration:480,easing:'cubic-bezier(.22,.72,.28,1)'});
  const cleanup=()=>{clone.remove();target.style.visibility='';};
  flight={cancel(){animation.cancel();cleanup();}};
  animation.onfinish=()=>{cleanup();if(step==='january'&&cursor<0&&revealBusy)proceed();};
 }
 $('#event-reveal')?.addEventListener?.('cancel',e=>{e.preventDefault();nav(character?'character':'budget');});
 function showInfo(privacy=false){if(character&&!privacy){if(playing){stop();scene();}$('#info-dialog').classList.remove('advice-dialog');$('#info-dialog').innerHTML=`<button class="dialog-close" data-action="close-info" aria-label="Zavrieť">×</button><h2 id="info-title">Rovnaké podmienky. Iné správanie.</h2><ul class="method-list"><li><strong>Modelové postavy</strong>Príjem, bývanie a košík sú ilustračné. Nie sú to štatistické priemery ani predpoveď.</li><li><strong>Disciplína</strong>Šesť polôh znamená 80 %, 55 %, 30 %, 15 %, 5 % alebo 0 % mesačnej bežnej spotreby navyše. Ide o zámerne výrazné herné scenáre, nie psychologické odhady.</li><li><strong>Dnes alebo zajtra</strong>Po bývaní, telefóne, predplatnom, potravinách a doprave rozdelíme zvyšok medzi radosti a odkladanie. Odkladanie si samostatne rozdelíš na rezervu a sporenie na budúcnosť, ktoré sa pri výdavkoch nečerpá. Maximum odkladá približne 80 % tohto zvyšku; sumy zaokrúhľujeme na 10 €.</li><li><strong>Rezerva</strong>Predvolene 1 000 €, posuvníkom ju môžeš nastaviť od 0 do 1 000 € po 100 €. Nie je ďalší príjem. Pri nedostatku účtu sa čerpá dostupná rezerva. Nekrytý zvyšok je mínus, nie automatická pôžička. Odkladanie sa účtuje 1. deň a iba z dostupných peňazí.</li><li><strong>Rovnaký mesiac</strong>Pri zmene správania zachovávame životné udalosti a ich dátumy. Mení sa plán spotreby, odkladanie a nákupy nad plán. Nový náhodný rok je samostatná akcia.</li><li><strong>Kruh</strong>Plný kruh predstavuje úvodný zostatok účtu vrátane januárovej mzdy. Mierka sa nemení. Červená označuje chýbajúce financovanie. Rezerva a budúce ciele sú samostatné.</li></ul><div class="editor-actions">${primary('close-info','Rozumiem')}</div>`;$('#info-dialog').showModal();return;}$('#info-dialog').classList.remove('advice-dialog');if(playing){stop();scene();}$('#info-dialog').innerHTML=`<button class="dialog-close" data-action="close-info" aria-label="Zavrieť">×</button><h2 id="info-title">${privacy?'Tvoje čísla ostávajú u teba.':'Jeden rok. Jasné pravidlá.'}</h2>${privacy?'<p>Údaje, odpoveď aj priebeh sú iba v pamäti tohto prehliadača. Obnovením stránky sa vymažú. Bez analytiky, účtu a odosielania údajov na server. Staršie uložené rozpočty táto verzia nenačítava.</p>':`<ul class="method-list"><li><strong>Pracovné scenáre, nie výskumné odhady</strong>Odpovede zodpovedajú 20 %, 15 %, 10 %, 6 %, 3 % alebo 0 % bežnej spotreby navyše. Ročnú sumu rozdeľujeme medzi mesiace s miernou variabilitou a účtujeme iba cez konkrétne udalosti. Nájom, splátky a sporenie percentá nezvyšujú.</li><li><strong>Život má samostatný plán</strong>Základné životné udalosti a príjmy navyše vznikajú nezávisle od odpovede. Počet doplnkových situácií sa riadi škálou, nejde o reálne pravdepodobnosti. Nových 20 situácií žrebujeme podľa škály: 14, 12, 10, 8, 6 alebo 4 za rok; ich sumy sa pridávajú samostatne. Január je názorný scenár: odpovede 1–2 znamenajú tri výdavky navyše, 3–4 dva a 5–6 jeden plus dva bežné nákupy v pláne. Typy aj poradie sa žrebujú. Nižšia odpoveď môže priniesť drahšiu situáciu. Je to obtiažnosť modelu, nie tvrdenie, že neistota spôsobuje škody.</li><li><strong>Modelové poistenie</strong>Príspevok nad 0 € mesačne zapne plné modelové krytie označených škôd z vytopenia alebo krupobitia. Bežné poruchy a opotrebovanie sa nekryjú. Poistné sa účtuje každý mesiac, pokrytý výdavok má nulový dopad. Bez limitov a spoluúčasti; reálne poistky majú vlastné podmienky.</li><li><strong>Tri zostatky, žiadne vymyslené peniaze</strong>Príjmy a výdavky účtujeme raz. Presun do rezervy nemení spoločný súčet. Presun na budúcnosť nie je spotreba. Presúva sa iba kladný zostatok účtu. Pri nedostatku výdavok pokryje rezerva; ciele sa automaticky nečerpajú. Nekrytý zvyšok je záporný účet, ďalší príjem ho najskôr vyrovná.</li><li><strong>Ilustračné rozloženie</strong>Rok ${run?.year||2027}: mzda už pri začiatku januára a potom vždy 1., fixné platby 6., nepravidelné príjmy 12., známe výdavky 18., rezerva 1. a ciele 28. deň. Spotreba sa rozdelí podľa skutočného počtu dní mesiaca s centovou presnosťou. Príjmy predchádzajú výdavkom v ten istý deň, presuny sú posledné.</li><li><strong>Ten istý rok</strong>Seed: ${run?.seed??'vytvorí sa na začiatku'}. Pri druhom pokuse zostávajú všetky udalosti, dátumy aj sumy. Zníženie limitu nemaže nákupy navyše. Graf zachováva aj denné a vnútrodenné minimá. Zoskupené ikony otvoríš kliknutím.</li><li><strong>Známe platby bez zdvojenia</strong>Označenie „už zahrnuté“ znamená, že výdavok účtuje iba mesačný plán. Zoznam známych platieb ho znova neodpočíta. Bez inflácie či výnosov sporenia. Herná pôžička má vlastnú zverejnenú cenu a splátky.</li></ul>`}<div class="editor-actions">${primary('close-info','Rozumiem')}</div>`;$('#info-dialog').showModal();}
 document.addEventListener('input',e=>{
  const t=e.target,k=t.dataset?.characterField;
  if(t.id==='year-reserve-share'){if(yearDecision?.kind==='reserve'){yearDecision.reserveShare=Math.max(0,Math.min(100,Math.round(Number(t.value)/10)*10));updateReserveDecision();}return;}
  if(k||t.id==='discipline-scale'||t.dataset?.key)forgetForward();
  if(k){
   if(k==='insurance'){characterInsured=t.checked;updateCharacterSummary('insurance');return;}
   if(k==='income'||t.value===''||t.validity?.valid===false)return;
   if(t.type==='range')haptic(t.value);
   const value=Number(t.value);
   if(k==='reserve'){
    characterReserve=Math.max(0,Math.min(1000,Math.round(value/100)*100));
    t.value=characterReserve;
    $('#character-reserve-value').textContent=money(E.cents(characterReserve));
    $('#character-reserve-shield').style.setProperty('--reserve-level',characterReserve/1000);
    t.setAttribute?.('aria-valuetext',money(E.cents(characterReserve)));
   }else{
    traits[k]=value;
    answer=traits.discipline;
    $('#discipline-label').innerHTML=characterAnswers[traits.discipline-1];
   }
   if(t.style)t.style.setProperty('--fill',((Number(t.value)-Number(t.min))/(Number(t.max)-Number(t.min))*100)+'%');
   updateCharacterSummary(k);
   return;
  }
  if(t.id==='discipline-scale'){haptic(t.value);selectAnswer(t.value);return;}if(!t.dataset.key)return;if(t.type==='range')haptic(t.value);const {key,id,field}=t.dataset;if(t.type==='number'&&(!t.validity.valid||t.value===''))return;const r=key==='initial'?budget.initial:budget[key].find(r=>r.id===id);r[field]=field==='name'?t.value:field==='included'?t.checked:Number(t.value);if(['number','range'].includes(t.type)){const pair=t.closest('.paired-input'),n=pair.querySelector('[type=number]'),slider=pair.querySelector('[type=range]');n.value=r[field];slider.max=key==='income'&&id==='salary'?3000:Math.max(2000,Math.ceil(r[field]/500)*500);slider.value=r[field];slider.style.setProperty('--fill',`${(r[field]-Number(slider.min||0))/(Number(slider.max)-Number(slider.min||0))*100}%`);}updateTotals();});
 document.addEventListener('submit',e=>{if(e.target.id!=='annual-budget')return;e.preventDefault();saveScreen();if(!editing&&screenHistory[screenIndex+1]?.step==='question')restoreScreen(screenIndex+1);else if(editing)launch(true);else nav('question');});
 document.addEventListener('keydown',e=>{if(e.target.matches('g[data-action]')&&['Enter',' '].includes(e.key)){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
 document.addEventListener('click',e=>{if(e.target.id==='discipline-scale'){haptic(e.target.value);selectAnswer(e.target.value);return;}const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;
  saveScreen();
  if(yearDecision){if(a==='year-reserve'&&yearDecision.kind==='reserve')resolveYearDecision(b.dataset.kind==='redirect'?yearDecision.reserveShare:0);else if(a==='year-turbo'&&yearDecision.kind==='turbo')resolveYearDecision(b.dataset.enabled==='yes');else if(a==='year-crisis'&&yearDecision.kind==='crisis')resolveYearDecision('crisis');else if(a==='year-buy'||a==='year-decline')resolveYearDecision(a==='year-buy');else if(a==='year-rescue')resolveYearDecision(b.dataset.kind);return;}
  if(a==='screen-back'){if(screenIndex>0)restoreScreen(screenIndex-1);return;}
  if(a==='screen-forward'){if(screenIndex<screenHistory.length-1)restoreScreen(screenIndex+1);return;}
  const nextStep=screenHistory[screenIndex+1]?.step;
  const expectedStep={'choose-character':'character','begin':'budget','character-start':'january','start-year':'january','rest':'year','results':'result','edit-before':character?'character':'budget'}[a];
  if(expectedStep&&nextStep===expectedStep&&(a!=='choose-character'||b.dataset.character===screenHistory[screenIndex+1].character)){
   if($('#character-picker')?.open)$('#character-picker').close();
   restoreScreen(screenIndex+1);return;
  }
  if(a==='edit-before'&&screenHistory[screenIndex-1]?.step===expectedStep){restoreScreen(screenIndex-1);return;}
  if(['choose-character','begin','character-retry','retry','new-year','gender','preset','clear','add','remove','home'].includes(a))forgetForward();

  if(a==='year-month'){const month=Number(b.dataset.month),row=YearJourney.months(projection)[month];if(!['year','result'].includes(step)||!row||row.endIndex>cursor||yearMotion?.busy())return;stop();yearMotion?.reset();yearSelected=month;scene();if(step==='result')$('.final-details').open=true;else window.scrollTo({top:0,behavior:'instant'});$(`[data-action="year-month"][data-month="${month}"]`)?.focus({preventScroll:true});}else if(a==='sound'){sound?.toggle();januaryScene(true);}else if(a==='preset'){const preset=presets.find(p=>p.id===b.dataset.preset);if(!preset||step!=='character')return;traits={discipline:preset.discipline,future:preset.future,goalShare:traits.goalShare??50};characterForm();$(`[data-preset="${preset.id}"]`)?.focus({preventScroll:true});}else if(a==='gender'){if(step!=='welcome')return;const p=BudgetCharacters.profiles.find(p=>p.id===b.dataset.character);if(!p||!p.variants[b.dataset.gender])return;genders[p.id]=b.dataset.gender;welcome();document.querySelector(`[data-action="gender"][data-character="${p.id}"][data-gender="${b.dataset.gender}"]`)?.focus();}else if(a==='home')nav('welcome');else if(a==='open-character-picker'&&step==='character')openCharacterPicker();else if(a==='close-character-picker')$('#character-picker').close();else if(a==='choose-character'){const p=BudgetCharacters.profiles.find(p=>p.id===b.dataset.character);if(!p||(step==='character'&&p.id===character))return;const picker=$('#character-picker');if(picker.open)picker.close();attempt=1;character=p.id;characterIncome=p.income;characterReserve=1000;characterInsured=false;traits={discipline:4,future:50,goalShare:50};characterSeed=null;run=null;previous=null;editing=false;nav('character');}else if(a==='character-start'){sound?.unlock();if([...document.querySelectorAll('[data-character-field]')].some(input=>!input.reportValidity()))return;launch();}else if(a==='character-retry'){previous=projection;attempt++;editing=true;nav('character');if(['discipline','future'].includes(b.dataset.focus))$('#character-'+b.dataset.focus)?.focus({preventScroll:false});}else if(a==='begin'){attempt=1;character=null;budget=Y.defaults();answer=null;run=null;previous=null;editing=false;nav('budget');}else if(a==='edit-before')nav(character?'character':'budget');
  else if(a==='add'){const {key}=b.dataset;budget[key].push({id:crypto.randomUUID(),name:'Vlastná položka',amount:0,month:0,included:false});const open=[...document.querySelectorAll('.budget-group')].map(d=>d.open);form();document.querySelectorAll('.budget-group').forEach((d,i)=>d.open=open[i]);}
  else if(a==='remove'){const {key,id}=b.dataset;budget[key]=budget[key].filter(r=>r.id!==id);b.closest('.budget-row').remove();updateTotals();}
  else if(a==='clear'){for(const key of ['income','fixed','insurance','consumption','saving','goals','irregular','known'])for(const r of budget[key])r.amount=0;budget.initial={checking:0,reserve:0,future:0};budget.income[0].amount=750;form();}
  else if(a==='start-year'){sound?.unlock();launch(!!run&&run.answer===answer);}else if(a==='next-event')nextRandomEvent();else if(a==='reveal')revealEvent();else if(a==='finish-reveal')nextRandomEvent();
  else if(a==='play'){if(step==='year'&&!playing&&yearMotion?.busy()){playing=true;scene();timer=setTimeout(tick,yearMotion.remaining()+1700);return;}if(step==='year'&&!playing)yearSelected=null;if(step==='january'&&(revealBusy||revealed<3))return;sound?.unlock();const starting=cursor<0;if(playing){stop();scene();}else if(reduced.matches&&step==='january'){cursor=30;scene();}else {playing=true;tick();}if(starting)window.scrollTo({top:0,behavior:'instant'});}
  else if(a==='skip'){stop();yearMotion?.reset();yearSelected=null;if(step==='year'&&run.interactive){run=YearChoices.finish(run,projection);projection=Y.simulate(budget,run);const review=YearChoices.turboMonth(projection,run);if(review>=0)run=YearChoices.activateTurbo(run,projection.days.filter(day=>day.month===review).at(-1),false);const full=YearChoices.reserveMonth(projection,run);if(full>=0){run=YearChoices.directReserve(run,projection.days.filter(day=>day.month===full).at(-1),0,projection.monthlyExpenses);projection=Y.simulate(budget,run);}}cursor=step==='january'?30:projection.days.length-1;scene();window.scrollTo({top:0,behavior:'instant'});$('#month-result-title')?.focus({preventScroll:true});}
  else if(a==='restart'){stop();yearMotion?.reset();yearSelected=null;sound?.unlock();cursor=step==='january'?-1:30;lastPaymentDay=null;inspected=null;scene();if(!reduced.matches){playing=true;tick();}}
  else if(a==='rest')startYearIntro();
  else if(a==='results'){if(run.events.some(e=>e.decision==='pending')||yearMotion?.busy())return;nav('result');}else if(a==='retry'){previous=projection;attempt++;editing=true;nav(character?'character':'budget');}else if(a==='new-year'){attempt=1;previous=null;run=null;characterSeed=null;launch();}
  else if(a==='inspect'){inspected=Number(b.dataset.day);const dates=b.dataset.dates?.split(',');const detail=dates?dates.map(d=>`<strong>${date(d)}</strong> `+summarizeEvents(projection.ledger.filter(e=>e.date===d)).map(e=>`${esc(e.name)}: ${money(e.amount)}${e.type==='transfer'||e.type==='reserveDraw'?' (presun)':''}`).join(' · ')).join('<br>'):moment();$('#moment').innerHTML=(step==='january'&&inspected>cursor?'Náhľad, zatiaľ nezúčtované: ':'')+detail;$('#moment').scrollIntoView({block:'nearest',behavior:'instant'});}
  else if(a==='advice')showAdvice(b.dataset.advice);else if(a==='help'||a==='privacy')showInfo(a==='privacy');else if(a==='close-info')$('#info-dialog').close();
 });
 document.addEventListener('toggle',e=>{if(e.target.isConnected===false)return;const key=e.target.dataset?.monthDisclosure;if(key==='events')eventCardsOpen=e.target.open;if(key==='rules')monthRulesOpen=e.target.open;if(key==='transfers')receiptTransfersOpen=e.target.open;},true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){stop();scene();}});
 reduced.addEventListener('change',()=>{if(reduced.matches&&revealBusy)finishReveal();if(reduced.matches&&playing){stop();if(step==='january')cursor=30;else yearMotion?.reset();scene();}});
 let resize;window.addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(()=>{if(['january','year','result'].includes(step))scene();},120);});render();screenHistory.push(rememberScreen());screenIndex=0;screenNavigation();
})();
