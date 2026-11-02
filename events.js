(function(root){
  'use strict';
  const make=(id,type,icon,name,min,max,text,condition='always',included=false)=>({id,type,icon,name,min,max,text,condition,included});
  const catalog=[
    make('groceries','covered','basket','Bežný nákup',0,0,'Nákup potravín má svoje miesto v pláne.','food',true),
    make('coffee','covered','cup','Káva s priateľmi',0,0,'Malá radosť, s ktorou už rozpočet počíta.','outside',true),
    make('ticket','covered','bus','Cesta do práce',0,0,'Doprava je súčasťou bežnej spotreby.','transport',true),
    make('film','covered','star','Večer s filmom',0,0,'Oddych sa zmestil do plánu.','leisure',true),
    make('shirt','covered','bag','Nové tričko',0,0,'Oblečenie už má vyhradené peniaze.','clothes',true),
    make('rent','covered','home','Bývanie zaplatené',0,0,'Táto platba už je medzi pravidelnými výdavkami.','housing',true),
    make('phone','covered','phone','Telefón funguje ďalej',0,0,'Mesačný paušál nie je prekvapenie.','phone',true),
    make('subscription','covered','play','Predplatné na ďalší mesiac',0,0,'Aj malá pravidelná platba je v pláne.','subscription',true),
    make('sale','deviation','bag','Bola akcia',15,55,'Bola akcia. Účet si to vysvetlil inak.'),
    make('takeaway','deviation','cup','Večera bez varenia',10,40,'Plán na večeru dostal pohodlnejšiu verziu.'),
    make('weekend','deviation','star','Víkend sa trochu predĺžil',20,70,'O jeden zážitok viac, než bolo v pláne.'),
    make('small','deviation','basket','Drobnosti navyše',10,45,'Pár malých nákupov sa stretlo na jednom účte.'),
    make('delivery','deviation','bag','Košík ešte nebol plný',15,65,'Do objednávky pribudlo niečo navyše.'),
    make('snacks','deviation','basket','Nákup nalačno',10,35,'Zoznam bol krátky. Taška už menej.'),
    make('outing','deviation','star','Spontánny program',15,60,'Pôvodne to mala byť pokojná sobota.'),
    make('treat','deviation','cup','Malá odmena',10,50,'Odmena prišla skôr než kontrola rozpočtu.'),
    make('fridge','life','appliance','Chladnička má vlastný plán',130,240,'Chladnička sa rozhodla pre izbovú teplotu.'),
    make('washer','life','appliance','Práčka si vzala voľno',90,190,'Rozpočet si dodržal. Spotrebiče ho nepodpísali.'),
    make('plumbing','life','home','Kvapká to o trochu viac',70,160,'Malá oprava doma už nemôže čakať.'),
    make('phonefix','life','phone','Displej po stretnutí so zemou',65,140,'Gravitácia tentoraz vyhrala.'),
    make('dentist','life','health','Neplánované ošetrenie',50,130,'Zdravie si vypýtalo neplánovaný výdavok.'),
    make('keys','life','home','Kľúče majú iný program',25,65,'Náhradný kľúč a malá zachádzka.'),
    make('shoes','life','bag','Topánky už nepokračujú',40,90,'Oprava alebo výmena sa nedá odkladať.'),
    make('glasses','life','health','Oprava okuliarov',35,95,'Aby bol ďalší plán opäť ostrý.'),
    make('carfix','life','car','Auto chce servis',120,320,'Nečakaná kontrolka má aj cenovku.','car'),
    make('tyre','life','car','Pneumatika povedala dosť',65,130,'Cesta sa skončila trochu skôr.','car'),
    make('school','life','book','Školský výlet navyše',30,80,'Zo školy prišla nová správa aj s platbou.','children'),
    make('club','life','book','Výbava na krúžok',25,65,'Krúžok potrebuje ešte jednu drobnosť.','children'),
    make('gift','extraIncome','gift','Darček v obálke',30,100,'Tentoraz peniaze prišli k tebe.'),
    make('refund','extraIncome','arrow','Vrátený preplatok',25,90,'Vyúčtovanie prinieslo príjemné prekvapenie.'),
    make('sold','extraIncome','bag','Vec našla nový domov',20,85,'Nepoužívaná vec sa zmenila na príjem.'),
    make('bonus','extraIncome','gift','Jednorazová odmena',40,120,'Malý príjem navyše, s ktorým plán nepočítal.')
  ];
  const config={rates:[.20,.15,.10,.06,.03,0],weights:[1.08,.92,1.04,.96,1.02,1.08,.94,1.06,.98,1.04,.92,.96]};
  const situations=[
    ['friend-gift','Darček kamarátovi',25,'pleasant','gift','Kamarát má narodeniny a chceš mu kúpiť darček.'],
    ['boss-gift','Spoločný darček šéfovi',10,'pleasant','gift','Kolegovia organizujú spoločný darček šéfovi a chceš prispieť.'],
    ['fare-fine','Pokuta v MHD',80,'unpleasant','bus','Cestou domov dostaneš pokutu za jazdu načierno v MHD.'],
    ['headphones','Pokazené slúchadlá',45,'unpleasant','phone','Pokazia sa ti slúchadlá, ktoré denne používaš.'],
    ['concert','Lístok na koncert',75,'pleasant','star','Obľúbená kapela ohlási koncert. Lístky sa rýchlo vypredávajú!'],
    ['wedding','Pozvánka na svadbu',250,'pleasant','gift','Dar, oblečenie a doprava niečo stoja.'],
    ['tooth','Nečakané ošetrenie zuba',140,'unpleasant','health','Zrazu ťa rozbolí zub a potrebuješ neplánované ošetrenie.'],
    ['trip','Spontánny víkendový výlet',120,'pleasant','star','Kamaráti navrhli spontánny víkendový výlet.'],
    ['screen','Rozbitý displej',160,'unpleasant','phone','Rozbil sa ti displej na mobile.'],
    ['jacket','Bunda v zľave',65,'pleasant','bag','Objavíš bundu, po ktorej dlho túžiš, so 60 % zľavou.'],
    ['forgot-sub','Zabudnuté predplatné',49,'unpleasant','play','Zabudol si zrušiť automatické ročné predplatné aplikácie.'],
    ['vet','Nečakaná návšteva veterinára',230,'unpleasant','health','Tvoj domáci miláčik potrebuje nečakané veterinárne ošetrenie.','pet'],
    ['bike','Defekt na bicykli',35,'unpleasant','bus','Na bicykli dostaneš defekt a potrebuješ vymeniť plášť.','bike'],
    ['tow','Odťah auta a pokuta',190,'unpleasant','car','Pri parkovaní ti odtiahnu auto. Musíš zaplatiť odťah a pokutu.','car'],
    ['parents','Večera k výročiu rodičov',90,'pleasant','gift','Chceš rodičov prekvapiť večerou na oslavu výročia.'],
    ['washer-new','Nová práčka',450,'unpleasant','appliance','Oprava práčky sa neoplatí, potrebuješ novú.','always'],
    ['lock','Výmena zámku',110,'unpleasant','home','Stratíš kľúče a musíš si dať vymeniť zámok.','always'],
    ['brakes','Problém s brzdami',380,'unpleasant','car','Auto vydáva zvláštne zvuky. Servis zistí problém s brzdami.','car'],
    ['holiday-deal','Ponuka na dovolenku',600,'pleasant','star','Objaví sa výhodná ponuka na dovolenku, ktorú si dlho plánoval.'],
    ['flood','Prasknuté potrubie',1200,'unpleasant','home','Praskne vodovodné potrubie a vytopí ti časť bytu.','always','household']
  ].map(([id,name,amount,mood,icon,text,condition='always',insurance=null])=>({id,name,amount,min:amount,max:amount,mood,icon,text,condition,insurance,type:mood==='pleasant'?'temptation':'life',included:false}));
  config.januaryNegativeSlots=[2,2,1,1,0,0];
  config.situationCount=[14,12,10,8,6,4];
  catalog.push({...make('hail','life','car','Auto po krupobití',900,900,'Krupobitie poškodilo karosériu auta.','car'),insurance:'car'});
  const api={catalog,situations,config}; if(typeof module!=='undefined')module.exports=api; root.BudgetEvents=api;
})(typeof window==='undefined'?globalThis:window);
