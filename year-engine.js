(function(root){
  'use strict';
  const E=typeof module!=='undefined'?require('./engine.js'):root.BudgetEngine;
  const C=typeof module!=='undefined'?require('./events.js'):root.BudgetEvents;
  const sum=rows=>rows.reduce((n,r)=>n+E.cents(r.amount),0);
  function defaults(){return {initial:{checking:0,reserve:1000,future:300},income:[{id:'salary',name:'Mzda',amount:1200}],insurance:[{id:'household',name:'Poistenie domácnosti',amount:0},{id:'car',name:'Poistenie auta',amount:0}],fixed:[{id:'housing',name:'Bývanie a energie',amount:400},{id:'loans',name:'Splátky',amount:0},{id:'phone',name:'Telefón / internet',amount:40},{id:'subscription',name:'Predplatné',amount:15}],consumption:[{id:'food',name:'Potraviny',amount:280},{id:'transport',name:'Doprava',amount:70},{id:'outside',name:'Jedlo vonku',amount:60},{id:'leisure',name:'Voľný čas',amount:70},{id:'clothes',name:'Oblečenie',amount:40}],saving:[{id:'reserve',name:'Do rezervy',amount:100}],goals:[{id:'holiday',name:'Dovolenka',amount:80}],irregular:[],known:[]};}
  const categoryIcons={housing:'home',loans:'coins',phone:'phone',subscription:'play',food:'basket',transport:'bus',outside:'cup',leisure:'star',clothes:'shirt',household:'shield',car:'carShield'};
  const categoryIcon=row=>categoryIcons[row.id]||'other';
  function totals(b){const income=sum(b.income),expenses=sum(b.fixed)+sum(b.consumption)+sum(b.insurance||[]),saving=sum(b.saving)+sum(b.goals);return {income,expenses,saving,left:income-expenses-saving};}
  function rng(seed){let x=seed>>>0;return()=>{x+=0x6D2B79F5;let t=Math.imul(x^x>>>15,1|x);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
  function applies(c,b){const all=[...b.fixed,...b.consumption,...(b.insurance||[])];if(c.condition==='always')return true;if(c.condition==='car')return all.some(r=>/auto|benzín|nafta|servis/i.test(r.name)&&r.amount>0);if(c.condition==='pet')return all.some(r=>/miláčik|pes|mačka|veterin/i.test(r.name)&&r.amount>0);if(c.condition==='bike')return all.some(r=>/bicykel|cyklo/i.test(r.name)&&r.amount>0);if(c.condition==='children')return all.some(r=>/deti|dieťa|škola|krúž/i.test(r.name)&&r.amount>0);return all.some(r=>r.id===c.condition&&r.amount>0);}
  function generate(b,answer,seed,year=2027){
    const lifeRng=rng(seed),behaviourRng=rng(seed^0x514ac89),events=[];
    const date=(m,d)=>`${year}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const add=(c,m,d,amount,suffix='')=>events.push({...c,id:`${c.id}-${m}-${suffix}`,date:date(m,d),amount});
    const pick=rows=>rows[Math.floor(lifeRng()*rows.length)];
    const amount=c=>Math.round(c.min+(c.max-c.min)*lifeRng());
    const januaryRng=rng(seed^0x15ab7),negativeSlots=C.config.januaryNegativeSlots[answer-1];
    const covered=C.catalog.filter(c=>c.type==='covered'&&applies(c,b));
    const fallback={id:'planned',type:'covered',icon:'basket',name:'Bežný deň podľa plánu',text:'Žiadny výdavok navyše.',included:true};
    const januaryPool=[...C.catalog,...C.situations].filter(c=>c.type==='life'&&applies(c,b)).sort((a,b)=>a.max-b.max||a.id.localeCompare(b.id));
    const risk=(6-answer)/5,index=Math.min(januaryPool.length-1,Math.floor((lifeRng()*.5+risk*.5)*januaryPool.length));
    const surprise=januaryPool[index],january=[{...surprise,amount:amount(surprise)}];
    for(let m=1;m<12;m++){
      if(m%2===0){const c=pick(C.catalog.filter(c=>c.type==='life'&&applies(c,b)));add(c,m,10+Math.floor(lifeRng()*13),amount(c));}
      if(m===3||m===7||m===11){const c=pick(C.catalog.filter(c=>c.type==='extraIncome'));add(c,m,17,amount(c));}
    }
    const annual=Math.round(sum(b.consumption)*C.config.rates[answer-1]*12),weightSum=C.config.weights.reduce((a,n)=>a+n,0);let allocated=0,cumulative=0,deferred=0;
    for(let m=0;m<12;m++){
      cumulative+=C.config.weights[m];const target=Math.round(annual*cumulative/weightSum),cents=target-allocated;allocated=target;
      const options=C.catalog.filter(c=>c.type==='deviation'),c=options[Math.floor(behaviourRng()*options.length)];
      if(m===0){
        if(negativeSlots===0)deferred=cents;
        else for(let slot=0;slot<negativeSlots;slot++){
          const choices=options.filter(e=>!january.some(j=>j.id===e.id));
          const chosen=choices[Math.floor(januaryRng()*choices.length)];
          const portion=negativeSlots===1?cents:slot===0?Math.round(cents*.6):cents-Math.round(cents*.6);
          january.push({...chosen,amount:portion/100,included:portion===0});
        }
        continue;
      }
      const charged=cents+(m===1?deferred:0);
      add({...c,included:charged===0,name:charged===0?'Spotreba zostala v pláne':c.name,text:charged===0?'V tomto scenári sa bežná spotreba drží zadaného plánu.':c.text},m,14,charged/100);
    }
    const candidates=[...covered];
    while(january.length<3){const i=Math.floor(januaryRng()*Math.max(1,candidates.length));january.push({...candidates.splice(i,1)[0]||fallback,amount:0});}
    for(let i=january.length-1;i>0;i--){const j=Math.floor(januaryRng()*(i+1));[january[i],january[j]]=[january[j],january[i]];}
    january.forEach((event,i)=>add(event,0,[8,14,21][i],event.amount,'january'));
    const situationRng=rng(seed^0x9721b4),pool=C.situations.filter(e=>applies(e,b)),chosen=[...pool];
    for(let i=chosen.length-1;i>0;i--){const j=Math.floor(situationRng()*(i+1));[chosen[i],chosen[j]]=[chosen[j],chosen[i]];}
    chosen.slice(0,C.config.situationCount[answer-1]).forEach((e,i)=>add(e,1+i%11,6+Math.floor(i/11)*17,e.amount,'situation'));
    return {seed,year,answer,events:events.sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id)),deviationTotal:annual};
  }
  function simulate(b,run,{plan=false}={}){
    const year=run.year,start=`${year}-01-01`,end=`${year}-12-31`,count=E.diffDays(start,end)+1;
    let checking=E.cents(b.initial.checking)+sum(b.income),reserve=E.cents(b.initial.reserve),future=E.cents(b.initial.future);
    const opening={checking,reserve,future,available:checking+reserve},days=[],ledger=[];let firstDeficit=null,lowest={available:checking+reserve,date:start},shortSaving=0;
    const record=(date,type,name,amount,extra={})=>{const e={date,type,name,amount,...extra,checking,reserve,future,available:checking+reserve};ledger.push(e);if(e.available<lowest.available)lowest={available:e.available,date};if(e.available<0&&!firstDeficit)firstDeficit=date;return e;};
    for(const r of b.income)if(r.amount)record(start,'income',r.name,E.cents(r.amount),{icon:'euro',text:'Januárová mzda už je pripísaná v úvodnom zostatku.'});
    function expense(date,name,amount,type='expense',extra={}){checking-=amount;record(date,type,name,-amount,extra);if(checking<0&&reserve>0){const moved=Math.min(-checking,reserve);checking+=moved;reserve-=moved;record(date,'reserveDraw','Presun z rezervy',moved,{icon:'arrow',text:'Rezerva pokrýva nedostatok na bežnom účte. Spoločný súčet sa nemení.'});}}
    function transfer(date,name,amount,target){const actual=Math.min(Math.max(0,checking),amount);checking-=actual;if(target==='reserve')reserve+=actual;else future+=actual;shortSaving+=amount-actual;record(date,'transfer',name,actual,{target,planned:amount,icon:'arrow',text:`Presun medzi vlastnými zostatkami. ${actual<amount?'Časť presunu sa pre nedostatok nevykonala.':''}`});}
    for(let i=0;i<count;i++){
      const date=E.addDays(start,i),m=Number(date.slice(5,7))-1,d=Number(date.slice(8)),monthDays=new Date(Date.UTC(year,m+1,0)).getUTCDate(),offset=ledger.length;
      if(d===1&&m>0)for(const r of b.income)if(r.amount){checking+=E.cents(r.amount);record(date,'income',r.name,E.cents(r.amount),{icon:'euro',text:'Pravidelný príjem na bežný účet.'});}
      if(d===12)for(const r of b.irregular.filter(r=>r.month===m))if(r.amount){checking+=E.cents(r.amount);record(date,'income',r.name,E.cents(r.amount),{icon:'gift',text:'Vopred zadaný nepravidelný príjem.'});}
      if(d===5)for(const r of [...b.fixed,...(b.insurance||[])])if(r.amount)expense(date,r.name,E.cents(r.amount),'expense',{icon:categoryIcon(r),categoryId:r.id,categoryName:categoryIcons[r.id]?r.name:'Iné navyše',text:'Pravidelný výdavok zo zadaného rozpočtu.'});
      if(d===18)for(const r of b.known.filter(r=>r.month===m&&!r.included))if(r.amount)expense(date,r.name,E.cents(r.amount),'known',{icon:'other',categoryId:r.id,categoryName:'Iné navyše',text:'Známy jednorazový výdavok. Neúčtuje sa v inej kategórii.'});
      for(const row of b.consumption){
        const daily=Math.round(E.cents(row.amount)*d/monthDays)-Math.round(E.cents(row.amount)*(d-1)/monthDays);
        if(daily)expense(date,row.name,daily,'daily',{icon:categoryIcon(row),categoryId:row.id,categoryName:categoryIcons[row.id]?row.name:'Iné navyše',text:'Denná časť mesačného plánu tejto kategórie.'});
      }
      if(!plan)for(const event of run.events.filter(e=>e.date===date)){
        if(isInsured(event,b))record(date,'insured',event.name,0,{icon:event.icon,text:'Pokrýva modelové poistenie. Dopad 0 €.',eventId:event.id,insuredAmount:E.cents(event.amount)});
        else if(event.type==='covered'||event.included)record(date,'covered',event.name,0,{...event,amount:0,text:event.text});
        else if(event.type==='extraIncome'){checking+=E.cents(event.amount);record(date,event.type,event.name,E.cents(event.amount),{icon:event.icon,text:event.text,eventId:event.id});}
        else expense(date,event.name,E.cents(event.amount),event.type,{icon:event.icon,text:event.text,eventId:event.id});
      }
      if(d===27)for(const r of b.saving)transfer(date,r.name,E.cents(r.amount),'reserve');
      if(d===28)for(const r of b.goals)transfer(date,r.name,E.cents(r.amount),'future');
      const movements=ledger.slice(offset);const available=checking+reserve;
      days.push({date,index:i,month:m,day:d,checking,reserve,future,available,checkingLow:Math.min(checking,...movements.map(e=>e.checking+Math.min(Math.max(0,-e.checking),e.reserve))),low:Math.min(available,...movements.map(e=>e.available)),events:movements});
    }
    const deviation=plan?0:run.events.filter(e=>e.type==='deviation'&&!e.included).reduce((n,e)=>n+E.cents(e.amount),0);
    const life=plan?0:run.events.filter(e=>['life','temptation'].includes(e.type)&&!isInsured(e,b)).reduce((n,e)=>n+E.cents(e.amount),0);
    const extra=plan?0:run.events.filter(e=>e.type==='extraIncome').reduce((n,e)=>n+E.cents(e.amount),0);
    return {opening,days,ledger,lowest,firstDeficit,shortSaving,deviation,life,extra,insured:plan?0:run.events.filter(e=>isInsured(e,b)).reduce((n,e)=>n+E.cents(e.amount),0),final:days.at(-1)};
  }
  function isInsured(event,b){return !!event.insurance&&(b.insurance||[]).some(p=>p.id===event.insurance&&p.amount>0);}
  const api={categoryIcon,isInsured,defaults,totals,generate,simulate,applies};if(typeof module!=='undefined')module.exports=api;root.YearEngine=api;
})(typeof window==='undefined'?globalThis:window);
