## Mini grafy rezervy a budúcnosti v ročnom zhodnotení — 20. 11. 2026

Riadky rezervy a budúcnosti v modrom porovnaní majú malé grafy aktuálneho roka: úvodný zostatok a 12 skutočných mesačných koncov vrátane bankového bonusu. Bez mriežky, číselných osí a ďalšieho vysvetľovania, iba január/december. Na desktope sú pri konečnej sume, na mobile pod ňou. Účet graf nemá. Pri porovnávaní pokusov graf stále ukazuje priebeh práve zobrazeného roka, nie rozdiel medzi pokusmi. Každý graf má vlastnú mierku zahŕňajúcu nulu, presné hodnoty zostávajú v tabuľke a prístupný popis pomenúva začiatok, koniec aj smer. Účtovanie sa nemení. Kontrola syntaxe a existujúce kontroly priechodu vrátane dvoch správnych grafov prešli; vizuálnu kontrolu si používateľ prevzal.

## Jasný dôvod investovať do budúcnosti — 20. 11. 2026

Dialóg plnej rezervy sa pýta „Začneš investovať do budúcnosti?“ a vysvetľuje odlišný účel: rezerva drží peniaze poruke na nečakané výdavky, ďalšie peniaze možno investovať na dlhodobé ciele s možnosťou vyššieho zhodnotenia. Tlačidlo používa „Áno, investovať X %“. Riziko poklesu hodnoty a nezaručený výnos sú pomenované priamo; simulované zhodnotenie budúcnosti sa nepridáva. Výpočet, príspevky, zachovanie existujúcej rezervy a voľba väčšej rezervy sa nemenia.

## Plná rezerva a drahšie ponuky — 20. 11. 2026

Rezervu porovnávame s pravidelnými plánovanými mesačnými výdavkami (fixné platby + spotreba + poistenie), nie s výplatou a nie s odkladaním. Pri dosiahnutí troch takých mesiacov na konci niektorého mesiaca február–november sa raz ponúkne presmerovanie ďalších rezervných príspevkov na budúcnosť. Ponuka sa nezobrazí pri nulovom základe, nulových rezervných príspevkoch, zápornom účte ani nesplatenom hernom úvere. Predvolené presmerovanie je 50 %, posuvník ide 0–100 % po desiatich. Náhľad ukazuje obe plánované mesačné sumy vrátane existujúceho sporenia na budúcnosť. Alternatíva ponechá ďalšie budovanie rezervy, najviac do šiestich mesiacov výdavkov; nové príspevky nad hranicou potom idú na budúcnosť.

Voľba mení až vklady od nasledujúceho mesiaca. Už vytvorená rezerva sa neodčerpáva ani nezmenšuje. Presmerované rezervné príspevky idú na budúcnosť v pôvodný deň rezervného vkladu, existujúce ciele ostávajú 28. deň. Súčet príspevkov sa nemení, skutočné presuny naďalej obmedzuje dostupný účet. Limit sa týka nových príspevkov; modelový bankový bonus sa ďalej pripisuje do rezervy. Pri opakovaní sa rozhodnutie vyčistí. Dokončenie bez ďalších volieb ponechá budovanie rezervy s týmto limitom.

Výber ponúk už nepoužíva iba účet: hernú cenovú hladinu určuje účet + štvrtina rezervy. Budúce úspory sa nepočítajú. Pri väčšom finančnom priestore sa striedajú najmenej použité hladiny 1 200 / 600 / 450 €, namiesto opakovania iba 50 €. Nové situácie za 450 € zahŕňajú dovolenku s kamoškou, festival, vysávač a kurz fotografovania. Skutočná dostupnosť a dopad kúpy sa stále počítajú z celého účtu a rezervy; pred kúpou je viditeľné čerpanie rezervy. Cenové hladiny sú pravidlá hry, nie odporúčanie minúť rezervu.

Dialóg nesľubuje vyšší istý výnos. Prípadné investovanie označuje za rizikové a zhodnotenie budúcnosti zostáva vypnuté. Finančné východisko: [NBS — Investovanie](https://nbs.sk/dohlad-nad-financnym-trhom/ofs/financne-produkty/sporenie-a-investovanie/investovanie/). Hranice 3/6 mesiacov a cenový výber sú používateľom zadané herné pravidlá.

Overenie: syntax a 118 testov; základ výdavkov namiesto mzdy, prah a výnimky, živý náhľad percent, účtovanie od ďalšieho mesiaca, zachovanie minulosti a existujúcich úspor, limit ďalších vkladov, súlad súčtov a bankového bonusu, obnova ďalšieho pokusu, drahšie ponuky aj pri nízkom účte a vyššej rezerve a nedostupnosť budúcich úspor. Vizuálnu kontrolu si používateľ prevzal.

## Potvrdenie nákupu v turbo režime a zrozumiteľná cena pôžičky — 20. 11. 2026

Pri dostupnom dobrovoľnom nákupe po zapnutí turbo režimu prvý klik na „Áno, kúpiť“ iba zmení tlačidlo na „Skutočne? 🤦“ a nič nezaúčtuje. Druhý klik potvrdí nákup cez pôvodnú kontrolu dostupných peňazí. „Teraz nie“ nákup odmietne. Potvrdenie platí iba pre otvorenú ponuku; ďalšia začína odznova. Nedostupný nákup naďalej hneď po pokuse zobrazí upozornenie bez strhnutia peňazí. Úsporný režim bez zapnutého turba ďalšie potvrdenie nepridáva.

Upozornenie k pôžičke oddelene ukazuje požičanú sumu, celkom na splatenie a preplatenie za celú pôžičku. Až nasledujúca veta uvádza počet mesačných splátok a približnú splátku; vyslovene vysvetlí, že preplatenie nie je ďalší mesačný poplatok. Napríklad 300 € požičaných → 330 € celkom, z toho 30 € navyše celkom, splácané 12 × 27,50 €. Čísla sa berú zo skutočného scenára; výpočtový model sa nemení.

Overenie: syntax a 114 testov, vrátane prvej potvrdenej kúpy po turbe bez zmeny zostatkov či zvuku platby, presne jednej platby po druhom kliknutí, ignorovania ďalšieho kliknutia a oddeleného zobrazenia mesačnej splátky od celkového preplatenia. Vizuálnu kontrolu si používateľ prevzal.

## Bonus rezervy a kontrola po pokuse o kúpu — 20. 11. 2026

Model pripíše 31. decembra do rezervy bonus 1 % z priemeru denných konečných zostatkov rezervy za celý rok. Použije skutočný počet dní vrátane priestupného roka, priemer pred pripísaním bonusu a zaokrúhlenie bonusu na cent až na konci. Bonus sa nezapočíta sám do svojho základu a opätovný výpočet ho neznásobí. Rovnaké pravidlo platí v porovnávacom pláne. Budúcnosť nemá žiadne zhodnotenie. Ak účet zostáva záporný, pripísaný bonus z rezervy pomôže pokryť mínus cez existujúce pravidlo čerpania; záver uvedie aj takto použitú sumu. Bonus je samostatný príjem v denníku a viditeľná položka ročného zhodnotenia s priemerným základom. Ide o herný modelový bonus, nie skutočnú ponuku banky.

Ponuka nákupu už vopred nezobrazuje červené upozornenie a tlačidlo „Áno, kúpiť“ je možné stlačiť aj pri nedostatku. V takom prípade sa nákup nezaúčtuje; obsah dialógu sa zmení na „Nemáme peniaze, musíme šetriť“, vysvetlí nedostatok a ponechá potvrdenie „Rozumiem, teraz nie“. Po ňom sa nákup odmietne a mesiac pokračuje. Budúcnosť sa nepoužije, nevznikne automatická pôžička ani ďalší dlh. Doménová kontrola dostupných peňazí zostáva zachovaná.

Overenie: syntax a 113 testov. Pokryté sú konštantná, míňaná aj úplne vyčerpaná rezerva, priestupný rok, jediná ročná výplata, nemenná budúcnosť, presné zosúladenie denníka vrátane rozdielu bonusu oproti plánu, zobrazenie ročného bonusu a kontrola kúpy až po kliknutí bez zmeny zostatkov. Vizuálnu kontrolu si používateľ prevzal.

## Turbo režim a upozornenie pri pôžičke — 20. 11. 2026

Po aspoň troch celých mesiacoch od zapnutia úsporného režimu sa pri ďalšom zápornom konci mesiaca ponúkne turbo. Napríklad úsporný režim prijatý 31. marca možno prvýkrát zhodnotiť 30. júna. Pri nezápornom zostatku sa ponuka nezobrazí; ak sa tri mesiace nezmestia do roka, nezobrazí sa predčasne. Používateľ môže zapnúť turbo alebo pokračovať úsporne. Voľba je jednorazová. Zapnutie od ďalšieho mesiaca do konca roka nastaví plánované jedlo vonku, oblečenie a voľný čas na nulu. Doterajšie pohyby, mínus, potreby, splátky a budúce úspory sa nemenia. Dobrovoľné nákupné ponuky pokračujú s kontrolou dostupných peňazí. Kruh a kalendár ukazujú nový režim a radosti pred/po. Dokončenie bez ďalších volieb turbo samo nezapína; nový pokus vyčistí aj túto voľbu.

Dialóg oddeľuje herný model od reality: uvádza, že ďalšie náklady záporného účtu sa tu nepripočítavajú, hoci v realite sa môžu pridať úroky či poplatky. Nevytvárame nové poplatky ani automatické pôžičky. Stres je pomenovaný ako možná skúsenosť, nie ako hodnotenie alebo diagnóza.

Ročné zhodnotenie má pri skutočne čerpanej pôžičke viditeľné vecné upozornenie „Úľava dnes, splátky aj zajtra“ s konkrétnou mesačnou splátkou a cenou pôžičky. Financovanie radostí vysvetľuje podmienene; netvrdí, že konkrétna pôžička na opravu bola minutá na zábavu. Zostávajúci dlh ostáva v modrej tabuľke, detail o čerpaní a zaplatených splátkach je v rozbalení. Pri odmietnutej pôžičke sa upozornenie nezobrazí.

Finančný podklad overený v primárnych zdrojoch: [NBS — Úvery](https://nbs.sk/dohlad-nad-financnym-trhom/ofs/financne-produkty/uvery/) a [NBS — Povolené prečerpanie účtu](https://nbs.sk/dohlad-nad-financnym-trhom/ofs/financne-produkty/uvery/povolene-precerpanie-uctu/). Konkrétne prahy a rozsah turbo škrtov sú pravidlá tejto hry, nie bankové podmienky ani osobné finančné odporúčanie.

Overenie: syntax a 108 testov; hranica troch mesiacov, nezáporný zostatok a koniec roka, prijatie aj odmietnutie, zachovanie minulosti, skutočné zníženie ďalších výdavkov, pokračovanie ponúk, jednorazovosť, obnovenie ďalšieho pokusu a podmienené upozornenie pri pôžičke. Vizuálnu kontrolu si používateľ prevzal.

## Ponuky aj počas úsporného režimu — 20. 11. 2026

Úsporný režim už neodstraňuje zostávajúce rozhodovacie ponuky. Automatické nákupy nad plán sú naďalej zastavené, pri dobrovoľných rozhoduje používateľ podľa aktuálne dostupného účtu a rezervy. Pri nedostatku sa zobrazí upozornenie „Nemáme peniaze, musíme šetriť.“ a kúpa zostáva neaktívna; rozhodnutie „Teraz nie“ pokračuje v simulácii. Budúce úspory sa nepoužívajú. Kontroly pokrývajú aj pokračujúce ponuky v úspornom režime, odmietnutie nepovolenej kúpy a zachovanie zostatkov. Vizuálnu kontrolu si používateľ prevzal.

## Účet, rezerva a budúcnosť — jednotné zobrazenie 20. 11. 2026

Poradie automatického krytia ostáva účet → rezerva. Sporenie na budúcnosť sa automaticky nečerpá a nie je súčasťou dostupnej sumy ročného kruhu; jeho výber by vyžadoval osobitné vedomé rozhodnutie, ktoré táto verzia nepridáva. Január počas prehrávania aj vo výsledku a ročný kruh ukazujú obe odložené obálky vždy, aj pri nule. Mesačný výsledok má samostatnú zmenu rezervy a budúcnosti; rozbalenie uvádza skutočne vykonané odkladanie, nie iba plán. Pri rozhodovaní o nákupe alebo pôžičke sa budúcnosť zobrazuje zvlášť ako peniaze ponechané bokom. Účtovanie ani pravidlá čerpania sa nemenia.

Overenie: syntax a 105 testov; samostatné zmeny budúcnosti, neuskutočnený presun pri nedostatku a trvalo viditeľné nulové obálky pri mesiaci i roku. Vizuálnu kontrolu si používateľ prevzal.

## Oddelené sporenie, dopad nákupu a povinný úsporný režim — 20. 11. 2026

Nastavenie postavy má opäť sporenie na budúcnosť. Druhý posuvník určuje celkové mesačné odkladanie; tretí ho delí medzi rezervu a budúcnosť, predvolene napoly. Súčet odkladania ani príjem sa rozdelením nemení. Mesačný plán zobrazuje obe položky zvlášť. Budúcnosť je chránená pred automatickým čerpaním a nákupmi; existujúci model ju odkladá 28. deň iba z dostupného účtu. Počiatočná rezerva zostáva samostatným vstupom.

Nákupný dialóg uvádza presný zostatok na účte po kúpe. Pri čerpaní rezervy samostatne zvýrazní jej úbytok a menej výrazne zostávajúcu rezervu. Súčet účtu s rezervou sa ako voľné peniaze po kúpe nezobrazuje. Každá z troch cenových hladín má štyri rozdielne situácie. Výber je stabilný zo seedu a identifikátora udalosti; už ponúknuté situácie vrátane odmietnutých sa v rámci hladiny počas štyroch rozhodnutí neopakujú. Dialóg aj zaúčtovanie používajú rovnaký výber.

Po troch po sebe idúcich koncoch mesiacov s dostupným zostatkom účtu a rezervy ≤ −1 000 € sa prehrávanie zastaví na povinnom úspornom kroku. Ide o herné pravidlo, nie posúdenie skutočného úpadku. Jediná akcia zapne úsporný režim od ďalšieho mesiaca: radosti na 30 % pôvodného plánu, automatické nákupy nad plán na nulu a nasledujúce dobrovoľné nákupy sa odložia. Potraviny, doprava, fixné platby, splátky a nečakané udalosti sa nemenia. Minulé pohyby ani mínus sa spätne neupravia. Okno a následný kalendár ukazujú radosti pred/po; výsledok preto môže zostať záporný. Pri dokončení bez ďalších nákupov sa povinné pravidlo uplatní automaticky, ak jeho prah nastal. Nový pokus režim vyčistí a obnoví pôvodný scenár.

Overenie: syntax a 103 testov. Nové kontroly pokrývajú centové zostatky účtu/rezervy, neopakovanie všetkých cenových hladín, rozdelenie odkladania a ochranu budúcich úspor, zachovanie nastavenia pri opakovaní, presný prah a prerušenie série mínusových mesiacov, jedinú povinnú akciu, zachovanie minulosti a skutočné zníženie budúcich účtovaných výdavkov. Vizuálnu kontrolu si používateľ prevzal.

## Rozhodnutia počas roka — 20. 11. 2026

Štyri z jedenástich automatických nákupov nad plán vo februári až decembri sa nahradia rozhodnutím používateľa. Výber je deterministický zo seedu, rozložený naprieč rokom. Sedem automatických pohybov a pôvodné tri januárové udalosti naďalej vychádzajú z nastavenia. Ponuky sú zatiaľ pracovné: kino a večer vonku 50 €, mobil 600 €, TV 1 200 €. Cenový stupeň vyberá suma na bežnom účte v okamihu udalosti; rezerva je zobrazená zvlášť. Kúpa sa povolí iba pri dostatku účtu a rezervy a prípadné čerpanie rezervy sa ukáže pred potvrdením. „Teraz nie“ nič nestrhne. Texty a sumy sú centrálne v `year-choices.js`.

Prehrávanie sa zastaví na skutočnom účtovnom bode, čaká na voľbu a pokračuje zo zobrazenej sumy. Nerozhodnutý nákup sa dopredu nezaúčtuje. Reduced-motion zachová voľby bez animácie. Dokončenie bez ďalších nákupov ich vynechá a neberie novú pôžičku. Pri opakovaní sa vyčistia voľby aj zásah pri mínuse, externý scenár a január sa zachovajú.

Pri prvom nekrytom mínuse počas ročného prehrávania možno zvoliť pôžičku, znížiť radosti o 10 % alebo pokračovať bez zmeny. Táto ponuka sa v jednom pokuse neopakuje. Pôžička prichádza na bežný účet, nie do rezervy, a nie je zaradená medzi zarobené príjmy. Pracovná herná cena: 10 % požičanej sumy navyše celkom, 12 splátok od druhého dňa nasledujúceho mesiaca; posledná splátka vyrovná zaokrúhlenie. Nejde o bankovú ponuku ani výpočet RPMN. Suma pokrýva aktuálny nedostatok s 200 € vankúšom, zaokrúhľuje sa nahor na stovky, najmenej 300 €. Splátky skutočne odchádzajú z rozpočtu a znižujú záväzok. Záver zobrazuje zostávajúci dlh aj účet s rezervou po jeho odpočítaní, vrátane splátok za horizontom roka.

Zníženie radostí platí od ďalšieho dňa pre jedlo vonku, oblečenie, voľný čas a ďalšie automatické nákupy nad plán. Potraviny, bývanie, životné udalosti ani vedomé kúpy sa nemenia; dnešné mínus ani minulé výdavky sa spätne nevymažú. Presunové účtovanie a budúce ciele zostávajú oddelené.

Overenie: syntax a 97 testov; zahŕňajú rozdelenie automatických a vlastných rozhodnutí, prijatie/odmietnutie a opakované stlačenia, zastavenie snímok na udalosti, nadviazanie animácie, čistý ďalší pokus, účet oproti rezerve, splácanie od ďalšieho mesiaca, decembrový dlh a budúce zníženie výdavkov. Vizuálnu kontrolu si používateľ prevzal.

## Plynutie roka — 20. 11. 2026

Modrý úvod sa postupne stratí počas 500 ms. Po ňom ostane január ešte 1,9 sekundy, potom sa začne február. Čísla, kruh aj aktívny pruh sa menia spoločne cez skutočné denné zostatky, nie iba medzi koncami mesiacov. Prvý prepočet trvá 2,7 s, ďalšie 2,2 s; medzi mesiacmi zostáva čas na prečítanie. Pauza zabráni ďalšiemu mesiacu a rozbehnutý prepočet pokojne dobehne. Preskočenie, výber mesiaca a odchod zrušia starú animáciu. Mierka zahŕňa aj denné maximá; výpočty ostávajú nezmenené. Reduced-motion zobrazí presné výsledky okamžite. Nová vrstva: `year-motion.js`. Kontrola syntaxe a 86 testov prešli. Vizuálnu kontrolu tejto úpravy si používateľ výslovne prevzal; staršie snímky nezachytávajú nové animácie.

## Ročný pohľad — 20. 11. 2026

Aktuálna ročná simulácia nahrádza starší čiarový graf, duplicitné zostatky a ukazovateľ krokov. Jedna scéna ukazuje jeden mesiac, presný koncový zostatok účtu s rezervou a najväčší mimoriadny pohyb podľa absolútnej sumy. Kalendár uchováva odohrané mesiace; budúce sú zatiaľ bez súm. Detailnejšie vysvetlenie aj celý denník sú dobrovoľné. Nepridávame povinné otázky, odhady ani odmeny za výšku príjmu.

### Výskumný podklad a dizajnový úsudok

- [Krajbich, Armel a Rangel (2010), Nature Neuroscience](https://www.nature.com/articles/nn.2635): výskum spája vizuálne fixácie s výpočtom a porovnávaním hodnôt pri jednoduchých voľbách. Podporuje záujem o vedenie pozornosti; nedokazuje optimálny vzhľad finančnej simulácie. Naša aplikácia princípu je jeden dominantný mesiac a jedna udalosť súčasne.
- [Heer a Bostock (2010), CHI — Crowdsourcing Graphical Perception](https://hci.stanford.edu/publications/2010/crowd-perception/heer-chi2010.pdf): experimenty s čítaním grafov reprodukujú rozdiely v presnosti pri porovnávaní polohy/dĺžky oproti uhlom. Preto na porovnanie mesiacov slúžia pruhy na rovnakej mierke a presné čísla. Veľký kruh ostáva vizuálnou kotvou aktuálneho mesiaca; 12 samostatných koláčov by sťažovalo presné porovnávanie.

Ide o návrh odvodený z týchto poznatkov, nie o empiricky potvrdený najlepší dizajn ani dokázaný vzdelávací účinok. Overenie s ľuďmi má zistiť, či bez vysvetlenia rozoznajú pokles dostupných peňazí, rozdiel medzi účtom a rezervou a mesiac s dočasným nedostatkom.

### Význam čísel a kontrola

Hlavná suma = účet + rezerva; peniaze na budúcnosť sa nepovažujú za dostupné. Všetky mesiace aj kruh používajú stálu mierku odvodenú zo začiatku a koncov mesiacov. Záporné sumy ostávajú podpísané a červené. Výkričník sleduje skutočný denný nedostatok, aj keď neskorší príjem pomohol. Presuny medzi účtom a rezervou nie sú spotreba. Každý mesiac zobrazuje skutočný účtovný koniec vrátane priestupných rokov.

Overené automaticky: súlad mesačných zostatkov s modelom, neporušenie vstupných dát, nulový rozpočet, priestupný rok, neskôr vyrovnaný deficit, odhaľovanie mesiacov, výber a pokračovanie, história obrazoviek a ročný záver. Prehliadač: šírky 320/390/1 366 px, pozastavenie, výber mesiaca, preskočenie, výsledok a rozbalenie kalendára. Spolu 82 testov. Nasledujúce sekcie zachytávajú staršie iterácie.

---

# Rozpočet naživo: skúsenosť, ktorú možno zopakovať

**Aktuálna korekcia po spätnej väzbe:** odhad bol odstránený; tri náhodné udalosti ostávajú a zobrazujú sa jednotlivo, aby sa pozornosť sústredila vždy na jednu vec. Prioritou je plynutie mesiaca s krátkymi zvukmi a odplávajúcimi platbami. Záver je stručný, ďalšie tipy voliteľné. Nižšie je zdokumentovaný predchádzajúci návrh a jeho východiská.

## Čo má po mesiaci zostať v hlave

„Účet skončil na nule“ nestačí na pochopenie výsledku. Dôležité je vedieť, či pomohla rezerva, kedy peniaze chýbali, čo stáli nákupy nad plán a čo sa pri druhom pokuse zmenilo.

Priebeh preto tvorí krátka slučka: **odhad → skúsenosť → vysvetlenie → zmena jednej veci**. Nepovinný odhad nie je bodovaný. Karty sa zatvárajú až po prečítaní. V závere ostáva účtenka a vysvetlenie; ďalší pokus smeruje priamo na zvolený posuvník. Schované predvoľby, pevný príjem postavy, počiatočná rezerva 0–1 000 € po stovkách, koláčový košík a plynulé počítanie súm zostali zachované.

## Jazyk a interpretácia

- Rozhranie pomenúva nákupy nad plán, nie charakter ani „dobrotu“ človeka.
- Čerpanie rezervy je použitie rezervy. Neskoršie vyrovnanie účtu nevymaže skorší nedostatok.
- Presuny nie sú spotreba ani zárobok. Porovnanie pokusov odpočíta počiatočné peniaze, aby zvýšenie vstupnej rezervy nevytvorilo falošné zlepšenie.
- Výsledok sa vzťahuje na konkrétny ilustračný scenár. Herné sadzby nie sú psychologický test ani odhad pravdepodobnosti správania. Výpočtový model sa touto úpravou nemení.

## Podklad a hranice

Princípy relevantnej, použiteľnej informácie a rozvíjania zručností podporujú [princípy finančného vzdelávania CFPB](https://www.consumerfinance.gov/data-research/research-reports/effective-financial-education-five-principles-and-how-use-them/). Konkrétne odhaľovanie kariet, odhad a opakovanie sú dizajnový návrh pre tento prototyp; ich vzdelávací účinok zatiaľ nie je odmeraný.

Pri používateľskom overení sledujeme: vie človek vysvetliť rozdiel medzi nulovým účtom a vyčerpanou rezervou? Rozumie, čo sa pri opakovaní zachovalo? Dokáže pomenovať jednu zmenu pre ďalší pokus bez toho, aby výsledok vnímal ako hodnotenie seba?

## Overenie implementácie

Automatické kontroly pokrývajú účtovanie, porovnanie po zmene počiatočnej rezervy, dočasný deficit vyrovnaný neskorším príjmom, nepovinnosť odhadu a nezmenené udalosti. Reálny prehliadač overuje mobilné aj desktopové rozloženie, odhalenie udalostí, prvý a druhý pokus, pozastavenie mesiaca aj roka a prechod do ročného výsledku. Ovládacie tlačidlá sa počas prehrávania neprestavujú pri každom kroku.
