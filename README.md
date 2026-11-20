# Úprava záveru — jedno porovnanie

Ročný záver má jednu modrú tabuľku so zostatkami pred a po: účet, rezerva a budúce ciele. Samostatná biela tabuľka a opakované koncové sumy boli odstránené. Výplata sa osobitne nezobrazuje. Pri opakovaní porovnávame koncové zostatky pred úpravou a po úprave; pri prvom pokuse úvodné a koncové zostatky roka. Podrobnosti sú v rozbalení. Overenie: syntax a 72 testov.

# Aktualizácia 18. 11. 2026 — plynulý mesiac

Po nastavení čaká tlačidlo „Vylosovať náhodnú udalosť“; prvá karta sa neotvára automaticky. Tri náhodne vybrané udalosti sa odhaľujú po jednej. Každá má označenie scenára, poradie 1/3 až 3/3, názov, sumu a jednu vetu. Dve stlačenia posunú na ďalšiu kartu; tretie spustí mesiac. Počas náhľadov sa peniaze neúčtujú. Pri opakovaní sa karty označujú ako rovnaký scenár pre porovnanie. Tipovanie a súbežná mriežka kariet zostávajú odstránené. Platby postupne stúpajú nahor a miznú; výdavky majú červené sumy, príjmy zelené a presuny fialové. Bežná spotreba je jedna denná položka, pravidelné platby sa pri spoločnom dátume zobrazia spolu. Účtenka naďalej zachováva presné kategórie a súčty. Záver má zostatky, jednu vetu a opakovanie; podrobnosti sú v rozbalení. Ročné tipy sú voliteľné rozbalenie.

`simulation-sound.js` syntetizuje krátke tiché zvuky cez Web Audio po interakcii používateľa; bez sťahovaných nahrávok. Platby majú kovové dvojité cinknutie a každé z troch odhalení udalosti samostatný krátky tón. Jednotlivé zvuky trvajú najviac 125 ms; rýchle odhalenia sa zoradia bez prekrytia. Zvuk možno vypnúť a nepodporovaný prehliadač pokračuje potichu. `flow.css` obsahuje animácie; stream platieb sa pri ďalšom dni neodpája z dokumentu, takže animácie môžu dokončiť pohyb. Reduced-motion vypína odplávanie. Výpočtový model sa nemení.

Overenie: syntax a 70 testov vrátane troch samostatných náhľadov bez účtovania, zachovania scenára pri opakovaní, stíšenia a obmedzenia hustoty zvukov; v mobilnom prehliadači automatický štart, platby s pohybom nahor a červenými cenami, pauza, stíšenie, bez vodorovného presahu či chýb v konzole. Náhľad: `artifacts/ux-review/flow-mobile.jpg`.

# Predchádzajúca úprava — odhad, skúsenosť a ďalší pokus

Január má tri jasné fázy: príprava s nepovinným tipom a tromi kartami, prehrávanie s kruhom a účtenkou, záver s vysvetlením a návratom na jeden konkrétny posuvník. Karty sa zatvárajú až po prečítaní. Výsledok odlišuje čerpanie rezervy od nekrytého výdavku a vysvetľuje nákupy nad plán, životné udalosti a skutočné odkladanie. Porovnanie pokusov zohľadňuje aj zmenu počiatočnej rezervy. Výpočtový model sa nemení.

Nové vrstvy: `journey-insights.js` a `journey.css`. Podklad, dizajnové rozhodnutia a hranice návrhu sú v [DESIGN-NOTES.md](DESIGN-NOTES.md). Ovládanie zostáva počas prehrávania stabilné. Snímky obrazoviek sú v `artifacts/ux-review/`.

Overenie: syntax a 67 testov; reálny prehliadač pri šírkach 320, 390 a 1 366 px, nastavenie a koláčový košík, nepovinný tip, odhalenie kariet, výsledok mesiaca a opakovanie so zmenou jediného posuvníka, pozastavenie mesiaca aj roka a ročný výsledok. Bez vodorovného presahu v kontrolovaných mobilných pohľadoch a bez chýb v konzole.

# Aktualizácia 18. 11. 2026 — nastavenie postáv

Rýchle predvoľby správania sú skryté. Príjem vybranej postavy je pevný a zobrazuje sa ako text. Počiatočná rezerva je predvolene 1 000 €; posuvník umožňuje 0 až 1 000 € po 100 €. Vlastný rozpočet má naďalej vlastné vstupy. Mesačný košík používa koláčový SVG graf s farebnou legendou a sumami; pri zmene odkladania sa prepočíta. Overenie: kontrola syntaxe a 62 testov.

# Aktualizácia 4. 11. 2026 — mesačná účtenka

Január má jeden hlavný zostatok v kruhu, pod ním rezervu a iba aktívne budúce ciele. Duplicitný zostatok v hlavičke, legenda kategórií a denný textový výpis zostávajú iba v ročnom pohľade. Vysvetlenie kruhu je rozbaliteľné.

`receipt.js` sumarizuje iba zaúčtované januárové položky: denná spotreba sa sčítava podľa kategórie, presuny z rezervy a odkladanie majú samostatný rozbaliteľný súhrn a nezvyšujú minutú sumu. Účtenka má papierový vzhľad, postup dní a záverečnú pečiatku; štýly sú v `receipt.css`. Po spustení sa náhľady udalostí zbalia. Bežné dni sa prehrávajú rýchlejšie, významné pohyby majú dlhšiu pauzu. Odhalenú udalosť možno zavrieť tlačidlom „Mám to“.

Účtenka pri aktualizáciách neposúva riadky: nové sumy dobehnú z nuly a existujúce z poslednej zobrazenej hodnoty počas 280 ms. `receipt-counter.js` zachováva rozbehnuté hodnoty pri prekreslení; reduced-motion zobrazí výsledok okamžite. Oblasť položiek má stálu výšku a zachováva pozíciu posúvania.

Overenie: kontrola syntaxe a 60 testov vrátane denného zosúladenia účtenky s účtom, rezervou a cieľmi a priebehu číselných animácií. Nový vzhľad zatiaľ nebol vizuálne overený v prehliadači.

# Aktualizácia 4. 11. 2026 — postavy a jeden mesiac

Aktuálny hlavný vstup: Jožko (1 100 €), Ferko (1 600 €), Janka (2 700 €) → disciplína a preferencia odkladania → január s kruhom peňazí → zopakovanie s iným správaním alebo pôvodná ročná simulácia. Vlastný rozpočet je dobrovoľná cesta na spodku úvodu. Peňažné posuvníky idú po 10 €; presné číselné vstupy vlastného rozpočtu naďalej prijímajú centy.

Rezerva je predvolene jeden plat, viditeľná a ručne upraviteľná aj na nulu. Úprava príjmu automaticky nemení už vytvorenú rezervu. Príjem sa dá upraviť mimo pásma postavy. Pri novej postave sa resetuje predchádzajúci pokus. Obnovenie stránky vymaže stav.

`characters.js` obsahuje modelové koše a oddelené nastavenia správania. Výdavky nie sú publikované štatistické priemery. Boli zvolené ako pracovné ilustračné situácie; kalibrácia na slovenské náklady bývania a spotreby zostáva otvorená. ŠÚ SR publikuje Rodinné účty 2024 na osobu aj domácnosť za rok, čo nemožno priamo zameniť za rozpočet konkrétneho samostatne bývajúceho človeka.

Pri postavách sa generuje rovnaký životný scenár (základ pôvodnej škály 4); disciplína mení iba spotrebu nad plán, sadzby 80/55/30/15/5/0 % mesačnej spotreby. Ide o herné extrémy, nie výskumné odhady. Orientácia na budúcnosť presúva 0–80 % priestoru po základných nákladoch do plánovanej rezervy, zaokrúhlene na 10 €. Rovnaký seed zachová externé udalosti pri porovnaní správania; nový náhodný rok seed obnoví. Pôvodný formulár používa pôvodný model škály opísaný nižšie.

Mesačný kruh má stálu mierku úvodného účtu. Nula je prázdny kruh; deficit vypĺňa červenú časť s presným záporným číslom. Nad jednu obrátku sa kruh nasýti a text výslovne oznámi prekročenie mierky. Oddelené zostatky zachovávajú rezervu a ciele. Náhľady udalostí neúčtujú peniaze. Súhrn mesiaca porovná účet a rezervu s minulým pokusom.

Ročné rozhodnutia (mobil, rezerva, investovanie, úver, zníženie nákladov) sú podľa dohody ďalšia etapa; aktuálne pokračovanie používa existujúci ročný prehrávač.

Avatary: `assets/avatars/`, prompty a pôvod v tamojšom README. Nové rozloženie: `characters.css`. Overenie: `npm run check` a `npm test` (53 testov).

---

# Rozpočet naživo · jeden možný rok

Lokálny prototyp v HTML, CSS a JavaScripte. Zachováva identitu 5PEŇAZÍ, lokálne písma, ovládacie prvky a princíp pôvodného SVG grafu. Predchádzajúce rozhranie je odložené v `archive/`.

## Spustenie

`npm start` → http://localhost:4173/

Bez inštalácie balíkov. Node.js 20+. Pre mobil v rovnakej sieti: `npm run start:lan` vypíše lokálnu adresu počítača. Existujúci server najskôr ukonči Ctrl+C. Aplikácia funguje aj pri priamom otvorení index.html. Finančné údaje sa na server neposielajú; server iba doručuje statické súbory.

## Priebeh

Privítanie → mesačný rozpočet → jedna otázka bez predvolenej odpovede → tri náhľady januárových udalostí → prehratie januára → zrýchlený február až december → výsledok → zmena rozpočtu a opakovanie rovnakých udalostí.

Predvyplnené čísla sú výslovne vymyslené. Formulár má rozbaľovacie kategórie, vlastné položky a synchronizované číselné vstupy s posuvníkmi. Ručne možno prekročiť predvolený rozsah posuvníka. Počiatočné zostatky nie sú príjem. Známy jednorazový výdavok označený „už zahrnuté“ účtuje iba mesačný plán.

## Súbory

- `app.js`: postupné rozhranie, SVG graf, náhľady, prehrávanie, porovnanie.
- `year-engine.js`: nový spoločný denný model pre detail aj celý rok.
- `events.js`: 32 pôvodných a 20 doplnkových udalostí, podmienky a samostatná konfigurácia odchýlok.
- `engine.js`: zachované dátumové a centové funkcie a pôvodný model s regresnými testami.
- `styles.css`: pôvodná identita a doplnené responzívne rozhranie.

## Model

Ilustračný rok 2027. Januárová mzda je už v úvodnom zostatku, ďalšie mzdy prídu vždy 1., fixné výdavky 5., nepravidelný príjem 12., známe výdavky 18., rezerva 27. a budúce ciele 28. deň mesiaca. Bežná spotreba sa rozdeľuje podľa skutočných dní s centovým vyrovnaním. V rámci dňa príjem predchádza výdavkom a odkladanie je posledné.

Samostatné zostatky: bežný účet, rezerva, budúce ciele. Presun do rezervy nemení dostupné peniaze (účet + rezerva). Presun na budúcnosť znižuje dostupné peniaze, ale nie celkový súčet všetkých troch zostatkov. Je to presun, nie spotreba.

Pri nedostatku účtu sa použije iba zostávajúca rezerva. Budúce ciele sa automaticky nečerpajú. Nekrytý výdavok je záporný účet, teda chýbajúce financovanie, nie poskytnutý úver. Ďalší príjem ho najskôr vyrovná. Odkladanie môže používať iba kladný zostatok účtu; nevykonaná časť presunu sa eviduje.

Odpovede mapujú pracovné scenáre 20 %, 15 %, 10 %, 6 %, 3 %, 0 % bežnej spotreby navyše. Nejde o výskumný odhad, psychologický test ani predikciu používateľa. Celoročná suma sa rozdelí medzi mesiace s miernou variabilitou a účtuje iba konkrétnymi udalosťami. Neexistuje paralelná percentuálna prirážka. Fixné platby a odkladanie sa percentami nemenia.

Životné udalosti a príjmy navyše majú oddelený generátor a nezávisia od odpovede. Januárová neplánovaná situácia je vždy súčasťou názorného scenára. Auto a deti sa použijú len pri zodpovedajúcej položke rozpočtu. Pri opakovaní zostáva seed aj celý zoznam dátumov a súm nezmenený. Nižší spotrebný limit automaticky nevymaže predchádzajúce nákupy navyše. Nový náhodný rok je samostatná akcia.

Graf používa všetky denné údaje vrátane vnútrodenných miním, nie iba koncomesačné body. Budúce ciele sú mimo hlavnej čiary. Náhľady, animácie a opakovanie len čítajú výsledok spoločného nemenného výpočtu; neúčtujú transakcie znova.

## Súkromie

Táto verzia drží údaje, odpoveď, seed aj zoznam udalostí len v pamäti stránky. Obnovenie stránky začne nový priebeh. Staré voliteľne uložené rozpočty z predchádzajúcej verzie sa nenačítavajú ani automaticky nemažú. Bez analytiky, externých fontov, bankových importov, backendu či AI služieb.

## Overenie

`npm test` — 42 testov (19 zachovaných, 17 ročného modelu, 6 priebehu rozhrania vo virtuálnom dokumente).

`npm run check` — syntax všetkých vykonávaných JavaScriptových súborov.

Testy kontrolujú zachovanie peňazí, rezervu a deficit, nezdvojené platby, nulové vstupy, január a zvyšok roka, deterministické udalosti, preskočenie prehrávania, opakovanie, presné mesačné sumy a nemenné zostatky pri odhaľovaní kariet. Test priebehu nenahrádza vizuálny test v reálnom prehliadači.

Vizuálne overenie tejto úpravy na desktope a mobile zostáva nedokončené: nástroj Computer Use zastavil prístup pre nepodporovanú kontrolu URL v použitom Windows prehliadači. Responzívne štýly, klávesnicové ovládanie a rešpektovanie reduced-motion sú implementované.

Lokálne fonty a logo sú z projektu Investovanie podľa manuálu 5PEŇAZÍ. Licenčný dokument Animo zostáva v assets/licenses/.


## Mobilné doladenie

Mzda je priamo v časti „S čím začínam“ ako čistý mesačný príjem. Samostatná kategória pravidelných príjmov bola odstránená. Počiatočné peniaze na účte sú voliteľné a predvolene nulové; zadávajú sa osobitne v rozbalení „Už mám niečo na účte“. Rezerva a budúce ciele sú počiatočné zostatky.

Otázka používa šesťstupňovú škálu s posuvníkom, klávesnicovým ovládaním a textovým opisom vybranej hodnoty. Bez interakcie s ňou sa odpoveď nepotvrdí.

„Čo priniesol mesiac?“ odhalí veľkú kartu v modálnom okne a následne ju presunie do zoznamu. Karta zostáva zobrazená približne tri sekundy a potom zaletí do zoznamu; pri reduced-motion sa udalosť pridá okamžite. Animácia nemení finančné výpočty. Graf má popisy nad ikonami, pomalšie prehrávanie a dlhšie zastavenia na udalostiach.

Nové štýly sú v `mobile-polish.css`: viditeľné dráhy posuvníkov pre Firefox aj Chromium, väčšie dotykové plochy a na mobile prístupné ovládanie prehrávania pri spodnom okraji.


## Mzda, poistenie a situácie

Predvolená čistá mzda je 1 200 €. Zvolený rozsah vstupu aj posuvníka mzdy je 750 až 3 000 €; ostatné položky môžu byť nulové. Úvod grafu a zostatky už obsahujú januárovú mzdu a vlastné počiatočné peniaze. Január mzdu druhýkrát neúčtuje; v ročnom denníku je presne 12 miezd. Hlavná čiara naďalej zahŕňa aj oddelenú rezervu.

Poistenia majú samostatnú kategóriu. Mesačné poistné nad 0 € zapne plné modelové krytie označených udalostí: domácnosť pre škody z vytopenia po prasknutí potrubia; auto pre škodu po krupobití. Poruchy spotrebičov, opotrebovanie, brzdy, stratené kľúče a pokuty sa nekryjú. Pokuty nie sú kryté. Poistné sa účtuje každý mesiac. Udalosť zostane v pôvodnom zozname a pri výpočte sa dynamicky vyhodnotí na nulový dopad; druhý pokus tak môže porovnať rovnakú udalosť s poistením. Tento prototyp nepredstavuje podmienky skutočnej poistky, nepoužíva spoluúčasť, limity ani čas čakania na plnenie.

Katalóg obsahuje všetkých 20 dodaných situácií s presnými sumami a označením príjemná/nepríjemná. Škála volí 14, 12, 10, 8, 6 alebo 4 doplnkové situácie za rok. Ide o pracovné scenáre, nie pravdepodobnosti. Auto, bicykel a domáci miláčik vyžadujú zodpovedajúcu položku rozpočtu. Tieto výdavky sú samostatnou vrstvou popri pôvodnej percentuálnej odchýlke a sú viditeľné ako osobitné udalosti.

Posuvníky používajú krátky 8 ms impulz cez Vibration API, obmedzený na najviac približne jeden za 65 ms. Nepodporovaný prehliadač pokračuje bez vibrácie; reduced-motion ju vypína. Fyzická haptika vyžaduje overenie na podporovanom telefóne.


Január už nemá pevné poradie ani pevný nákupný košík. Pri predvyplnenej spotrebe majú odpovede 1–2 tri výdavky navyše, 3–4 dva a 5–6 jeden spolu s dvoma náhodnými bežnými udalosťami zahrnutými v pláne. Vhodné udalosti a ich poradie sa žrebujú zo seedu. Nižšia odpoveď posúva výber neplánovanej situácie k vyšším sumám. Ide o obtiažnosť názorného scenára, nie o skutočnú súvislosť medzi neistotou a vznikom škôd. Ročná percentuálna odchýlka sa nezvyšuje dvakrát: pri dvoch januárových položkách sa rozdelí; pri januári bez odchýlky sa jej januárová časť presunie do februára.


## Graf kategórií

Hlavná čiara sleduje zostatok bežného účtu; rezerva a ciele zostávajú v samostatných číslach. Koncový bod januára aj roka uvádza presný zostatok účtu. Základné položky majú vlastné monolineárne SVG ikony, vlastné položky spoločné „Iné navyše“. Ikony sa pri prehrávaní dopĺňajú až po zaúčtovaní výdavku. Zhodné alebo blízke dátumy sa zoskupujú, detail je dostupný kliknutím. Legenda ukazuje všetky aktívne kategórie aj v ročnom pohľade.

Bežná spotreba sa účtuje po kategóriách s presným mesačným súčtom. Januárová ikona pri bežnej spotrebe označuje jednu reprezentatívnu dennú platbu danej kategórie, nie druhé účtovanie celej mesačnej sumy. Počty a sumy udalostí sa ikonami nemenia.


## Nová záverečná obrazovka

Veľká modrá bublina zobrazuje zostatok bežného účtu, rezervu a peniaze na budúcnosť. Pod ňou je porovnanie troch zostatkov na začiatku a na konci roka vrátane rozdielu. Začiatok výslovne zahŕňa januárovú mzdu. Pri opakovanom pokuse sa porovnáva pôvodný a upravený rozpočet za rovnaký rok s rovnakými udalosťami.

Tri otázky otvárajú vlastné modálne okná: pravidelné sporenie, neplánované míňanie a nedostatok peňazí na konci mesiaca. Obsah je oddelený v `final-content.js`; každý text obsahuje tri kroky, jednoduchý krok na vyskúšanie a citlivé vysvetlenie hraníc rady. Odkaz na vzdelávací článok 5PEŇAZÍ je priamo v okne. Bez porovnávania človeka či odporúčaní konkrétnych produktov.

Celý graf, rozpis dopadov a udalosti sú dostupné v rozbalení pod záverom. Výpočtový model sa touto zmenou nemení. Vzhľad záveru je v `final-screen.css`.


Úprava postupu: počiatočné peniaze na účte sú dočasne skryté. Nepravidelné príjmy sú pod sekciou „S čím začínam“, pred prvou číslovanou kategóriou. Sekcia občasných platieb bola z rozhrania odstránená. Počas prehrávania je hlavné tlačidlo neaktívne, s textom „Simulujem mesiac“ alebo „Simulujem rok“ a indikátorom priebehu. Pri prechode na rok sa zobrazí modrý celoobrazovkový úvod s bielym písmom Animo na približne 2,6 sekundy; zvyšok roka začína pomalšie. Reduced-motion úvod preskočí.

Vizuálna kontrola 4. 11. 2026: overený úvod na desktope, nastavenie postavy pri mobilnom rozmere 390 × 844, odhalenie troch udalostí, výsledok mesiaca a návrat na zmenu správania. Mobilné nastavenie nemá horizontálny presah. Náhľad úvodu: assets/avatars/preview.jpg. Lokálny kontrolný server beží na http://127.0.0.1:4174/.

Prepínač podoby: každé príjmové pásmo má mužský a ženský avatar (Jožko/Jožka, Ferko/Ferka, Janko/Janka). Prepínače sú na úvode aj pri nastavení postavy. Mení sa iba meno a obrázok, rozpočet a seed zostávajú zachované. Voľba podoby sa drží v pamäti stránky. Overenie: 54 testov, kontrola prepínania na desktope a mobile. Dodatočné prompty: assets/avatars/variants-prompts.md.
