(() => {
  'use strict';
  const E = window.BudgetEngine;
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Bratislava', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const date = (iso, full = false) => new Intl.DateTimeFormat('sk-SK', { day: 'numeric', month: full ? 'long' : 'numeric', ...(full ? { year: 'numeric' } : {}), timeZone: 'UTC' }).format(E.parseDate(iso));
  const number = (value, digits) => new Intl.NumberFormat('sk-SK', { minimumFractionDigits: digits ?? (Number.isInteger(value) ? 0 : 2), maximumFractionDigits: digits ?? 2 }).format(value);
  const money = (value, digits) => `${number(value / 100, digits)} €`;
  const amountHTML = value => `${esc(number(value / 100))} <small>€</small>`;
  const uid = () => crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const STORAGE = '5penazi-rozpocet-v1';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const demoNames = { tight: 'Napätý rozpočet', balanced: 'Menšia rezerva', roomy: 'Väčší priestor' };
  const categories = ['Bývanie', 'Energie', 'Telefón a internet', 'Doprava', 'Deti', 'Zdravie', 'Poistenie', 'Splátky', 'Iné'];
  const realityNames = ['Oslava', 'Servis auta', 'Škola / deti', 'Poistka', 'Zdravie', 'Výlet', 'Iné'];
  let model = null, remember = false, includeUncertain = true, useReserve = false;
  let selected = 0, playing = false, timer = null, animating = false;
  let draft = null, editorTab = 0, wizard = false, scenarioDraft = null;
  let current = null, base = null, toastTimer = null, feedbackTimer = null;

  function validModel(candidate) {
    try {
      if (!candidate || !['individual', 'household'].includes(candidate.household)) return false;
      E.parseDate(candidate.start);
      if (!['available', 'reserve', 'weekly', 'goal'].every(key => Number.isFinite(candidate[key]) && candidate[key] >= 0 && candidate[key] <= 1e9)) return false;
      if (!['incomes', 'payments', 'reality', 'scenarios'].every(key => Array.isArray(candidate[key]) && candidate[key].length <= 200)) return false;
      for (const row of [...candidate.incomes, ...candidate.payments, ...candidate.reality, ...candidate.scenarios.filter(s => s.type !== 'delay')]) {
        E.parseDate(row.date);
        if (Math.abs(E.diffDays(candidate.start, row.date)) > 3660 || typeof row.id !== 'string' || typeof row.name !== 'string' || !row.name.trim() || !Number.isFinite(row.amount) || row.amount <= 0 || row.amount > 1e9) return false;
      }
      for (const scenario of candidate.scenarios) {
        if (!['delay', 'purchase', 'unexpected'].includes(scenario.type) || typeof scenario.id !== 'string') return false;
        if (scenario.type === 'delay' && (!Number.isInteger(scenario.days) || scenario.days < 1 || scenario.days > 60 || !candidate.incomes.some(i => i.id === scenario.incomeId))) return false;
      }
      return true;
    } catch { return false; }
  }
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE));
    if (saved?.version === 1 && validModel(saved.model)) {
      model = saved.model; remember = true; includeUncertain = saved.includeUncertain !== false; useReserve = saved.useReserve === true;
    }
  } catch { /* Ukladanie nie je podmienkou používania. */ }

  function toast(message) {
    $('#toast').textContent = message;
    $('#toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3400);
  }
  function persist() {
    try {
      if (remember && model) localStorage.setItem(STORAGE, JSON.stringify({ version: 1, model, includeUncertain, useReserve }));
      else localStorage.removeItem(STORAGE);
    } catch {
      remember = false;
      const checkbox = $('#remember'); if (checkbox) checkbox.checked = false;
      toast('Prehliadač nepovolil uloženie. Čísla ostávajú iba v pamäti.');
    }
  }
  function stopPlayback() { clearInterval(timer); timer = null; playing = false; }
  function resetPlayback() { stopPlayback(); selected = 0; animating = false; }
  function scrollTop() { window.scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' }); }
  function startDemo(kind = 'balanced') {
    resetPlayback(); useReserve = false; includeUncertain = true;
    model = E.demo(kind, today); persist(); showWorkspace();
  }
  function showWorkspace() {
    $('#welcome').hidden = true; $('#workspace').hidden = false;
    renderWorkspace(); scrollTop();
  }
  function renderWorkspace() {
    const isDemo = !!model.demo;
    $('#workspace').innerHTML = `
      <div class="workspace-heading"><div><p class="eyebrow">POZRI SA NA SVOJE MOŽNOSTI</p><h1>Tvoj rozpočet. <span>Naživo.</span></h1><p>Malé rozhodnutie dnes. Viditeľný rozdiel o pár dní.</p></div><button class="back-button" data-action="home"><span aria-hidden="true">←</span> Späť na úvod</button></div>
      <div class="demo-bar"><div class="demo-label"><span>${isDemo ? 'FIKTÍVNY PRÍKLAD' : 'MOJE ČÍSLA'}</span>${isDemo ? 'Vyber si východiskovú situáciu' : `Rozpočet od ${date(model.start, true)}`}</div>
      <div class="demo-options" aria-label="Fiktívne demo situácie">${Object.entries(demoNames).map(([key, name]) => `<button data-action="preset" data-preset="${key}" class="${model.demo === key ? 'selected' : ''}" aria-pressed="${model.demo === key}">${name}</button>`).join('')}</div>
      <button class="own-link" data-action="${isDemo ? 'own' : 'edit'}" data-tab="0">${isDemo ? 'Radšej zadám svoje čísla →' : 'Upraviť moje čísla →'}</button></div>
      <div class="budget-layout">
        <aside class="control-panel" aria-label="Moje peniaze">
          <div class="panel-heading"><span class="section-number">01 / MOJE PENIAZE</span><button class="icon-button" data-action="edit" data-tab="0" aria-label="Upraviť všetky údaje">↗</button></div>
          <h2>S čím začíname?</h2><p class="control-intro">${model.household === 'household' ? 'Rozpočet domácnosti' : 'Rozpočet jednotlivca'} · ${date(model.start)}</p>
          <label class="field"><span>${model.start === today ? 'Teraz mám k dispozícii' : 'Peniaze na začiatku obdobia'}</span><span class="amount-input"><input id="available" data-model="available" type="number" min="0" max="1000000000" step="0.01" value="${model.available}" inputmode="decimal" aria-describedby="available-note"><span aria-hidden="true">€</span></span><small id="available-note">Na bežné fungovanie. Bez rezervy.</small></label>
          <label class="field reserve-field"><span>Rezerva bokom <span aria-hidden="true">↗</span></span><span class="amount-input"><input id="reserve" data-model="reserve" type="number" min="0" max="1000000000" step="0.01" value="${model.reserve}" inputmode="decimal" aria-describedby="reserve-note"><span aria-hidden="true">€</span></span><small id="reserve-note">Nie je súčasťou peňazí na míňanie.</small></label>
          <div class="control-separator"></div>
          <div class="weekly-field"><div class="weekly-heading"><span>Bežné výdavky</span><span class="estimated">ODHAD</span></div><label class="field"><span class="field-label">Jedlo, doprava a každodenné potreby</span><span class="amount-input"><input id="weekly" data-model="weekly" type="number" min="0" max="1000000000" step="0.01" value="${model.weekly}" inputmode="decimal"><span>€ / týž.</span></span></label>
          <input class="range" id="weekly-range" aria-label="Týždenné výdavky – posuvník" type="range" min="0" max="${Math.max(500, Math.ceil(model.weekly / 100) * 100)}" step="5" value="${model.weekly}" style="--fill:${Math.min(100, model.weekly / Math.max(500, Math.ceil(model.weekly / 100) * 100) * 100)}%"><div class="range-ends"><span>0 €</span><span>${money(E.cents(Math.max(500, Math.ceil(model.weekly / 100) * 100)))}</span></div><small class="field-note">Odhad rozkladáme rovnomerne na každý deň.</small></div>
          <div class="control-links"><button data-action="edit" data-tab="1">Príjmy a povinné platby <span aria-hidden="true">↗</span></button><button data-action="edit" data-tab="2">Čo bude tentoraz iné? <span aria-hidden="true">+</span></button></div>
          <p class="goal-caption" id="goal-caption">${goalCaption()}</p>
          <label class="privacy-control"><input type="checkbox" id="remember" ${remember ? 'checked' : ''}> Zapamätať na tomto zariadení</label><button class="erase-button" data-action="erase">Vymazať moje čísla aj uloženie</button>
        </aside>
        <div class="visual-column" id="live-results"></div>
      </div>
      <section class="scenario-section" aria-labelledby="scenario-title"><div class="scenario-heading"><div><p class="eyebrow">02 / PRIESTOR NA EXPERIMENT</p><h2 id="scenario-title">A čo ak…?</h2><p>Skús jednu zmenu. Hneď uvidíš, čo urobí s tvojím mesiacom.</p></div><span class="scenario-hint">Základný plán zostáva. Každý scenár môžeš upraviť alebo odstrániť.</span></div>
      <div class="scenario-grid"><button class="scenario-card" data-action="scenario" data-type="unexpected"><span class="scenario-icon" aria-hidden="true">!</span><span><strong>Niečo nečakané</strong><small>Čo zmení výdavok 150 €?</small></span><span class="add-symbol" aria-hidden="true">+</span></button><button class="scenario-card" data-action="scenario" data-type="delay"><span class="scenario-icon" aria-hidden="true">◷</span><span><strong>Výplata mešká</strong><small>Čo ak príde o 7 dní neskôr?</small></span><span class="add-symbol" aria-hidden="true">+</span></button><button class="scenario-card" data-action="scenario" data-type="purchase"><span class="scenario-icon" aria-hidden="true">♧</span><span><strong>Niečo si chcem kúpiť</strong><small>Vyskúšaj vlastnú cenu a dátum.</small></span><span class="add-symbol" aria-hidden="true">+</span></button></div><div id="active-scenarios" class="active-scenarios"></div></section>
      <p class="model-footnote"><span class="info-icon" aria-hidden="true">i</span><span>Orientačný model pre zadané údaje a 35 dní. Týždenný odhad delíme siedmimi. Graf zobrazuje koniec dňa; poradie transakcií počas dňa nepoznáme. <button data-action="help">Ako presne počítame?</button></span></p>
      <div class="mobile-feedback" id="mobile-feedback" role="status"></div>`;
    renderResults(); renderScenarios();
  }
  function goalCaption() {
    return `Pravdepodobné míňanie: <strong>${money(E.cents(model.weekly))} / týž.</strong> Tvoj cieľ: ${money(E.cents(model.goal))} / týž. Cieľ sa automaticky nepočíta ako úspora.`;
  }
  function renderResults() {
    const activeElementId = document.activeElement?.id;
    base = E.project(model, { scenarios: false, includeUncertain, useReserve });
    current = E.project(model, { includeUncertain, useReserve });
    const compare = model.scenarios.some(s => s.enabled !== false);
    const uncertain = model.incomes.some(i => i.uncertain && i.date >= model.start);
    const next = current.nextIncome;
    const negative = current.spending < 0;
    const until = next ? date(next.date) : date(current.days.at(-1).date);
    const compareStat = value => compare ? `<small class="comparison">Pôvodne ${money(value)}</small>` : '';
    const reserveLabel = useReserve ? 'Čerpanie rezervy' : 'Potrebná rezerva';
    const outcome = statusCopy(current);
    const nearby = current.events.filter(e => e.date >= model.start && e.date <= current.days.at(-1).date).slice(0, 5);
    $('#live-results').innerHTML = `<section class="money-stage" aria-labelledby="stage-title"><div class="stage-header"><div><span class="section-number">TVOJICH NASLEDUJÚCICH 35 DNÍ</span><h2 id="stage-title">Peniaze v pohybe</h2></div><span class="period-chip"><span></span>${date(model.start)} – ${date(current.days.at(-1).date)}</span></div>
      <div class="headline-amount"><div><p class="spend-label">${negative ? 'Do príjmu chýba na zadané výdavky' : next ? 'Priestor na ďalšie míňanie do príjmu' : 'Priestor na ďalšie míňanie v období'}</p><strong class="spend-value ${negative ? 'deficit' : ''}">${amountHTML(Math.abs(current.spending))}</strong><p class="spend-note">${negative ? 'Záväzky a bežné potreby prevyšujú dostupné peniaze.' : `Po odrátaní platieb aj bežných potrieb do ${until} Bez započítania rezervy.`}</p></div><div class="next-income">${next ? `Najbližší príjem<strong>+ ${money(next.amount)}</strong>${date(next.date, true)}${next.uncertain ? '<span class="uncertain-tag">neistý</span>' : ''}${next.scenario ? '<br><span>posunutý scenárom</span>' : ''}` : 'Najbližší príjem<strong>Nezadaný</strong><button class="text-link" data-action="edit" data-tab="1">Pridať príjem</button>'}</div></div>
      <div class="chart-container">${chartSVG(compare)}</div><div class="chart-toolbar"><div class="legend">${compare ? '<span><i class="original"></i>Základný plán</span><span><i class="changed"></i>So scenármi</span>' : '<span><i></i>Základný plán</span>'}${useReserve && current.need ? '<span><i class="reserve"></i>Bez čerpania rezervy</span>' : ''}</div><span class="chart-hint">Klikni na bod a zisti, čo sa stalo.</span></div>
      <div class="day-readout" id="day-readout">${dayReadout()}</div><div class="playback"><div class="playback-buttons"><button id="play" class="button primary play-button" data-action="play"><span class="play-icon" aria-hidden="true">${playing ? 'Ⅱ' : '▶'}</span>${playing ? 'Pozastaviť' : selected === 34 ? 'Prehrať znova' : 'Prehrať môj rozpočet'}</button><button class="icon-button" data-action="replay" aria-label="Vrátiť prehrávanie na začiatok">↶</button><button class="result-button" data-action="finish">Zobraziť výsledok →</button></div><div class="progress-row"><label class="sr-only" for="day-slider">Deň rozpočtu</label><input class="range" id="day-slider" type="range" min="0" max="34" value="${selected}" style="--fill:${selected / 34 * 100}%"><span>${selected + 1}. / 35 dní</span></div></div>
      <div class="result-strip"><div class="result-stat"><span>Najnižší zostatok<br>pred čerpaním rezervy</span><strong class="${current.lowest.raw < 0 ? 'negative' : ''}">${money(current.lowest.raw)}</strong><small>${date(current.lowest.date)}</small>${compareStat(base.lowest.raw)}</div><div class="result-stat"><span>Chýba aj po využití<br>celej dostupnej rezervy</span><strong class="${current.shortfall ? 'negative' : ''}">${money(current.shortfall)}</strong><small>${current.shortfall ? 'nepokryté výdavky' : 'rezerva by stačila'}</small>${compareStat(base.shortfall)}</div><div class="result-stat"><span>${reserveLabel}<br>${useReserve ? 'výslovne zapnutá' : 'z dostupnej rezervy'}</span><strong>${money(useReserve ? current.drawn : current.reserveNeeded)}</strong><small>${useReserve ? `Zostane ${money(E.cents(model.reserve) - current.drawn)}` : 'Zatiaľ sa nečerpá'}</small>${compareStat(useReserve ? base.drawn : base.reserveNeeded)}</div><div class="result-stat"><span>Na konci<br>${date(current.days.at(-1).date)}</span><strong class="${current.final < 0 ? 'negative' : ''}">${money(current.final)}</strong><small>${useReserve ? 'vrátane čerpanej rezervy' : 'bez čerpania rezervy'}</small>${compareStat(base.final)}</div></div></section>
      <div class="status-bar ${current.status}" role="status"><span class="status-symbol" aria-hidden="true">${current.status === 'green' ? '✓' : current.status === 'amber' ? '!' : '−'}</span><div><strong>${outcome.title}</strong><p>${outcome.text}</p>${base.status === 'red' && base.rawFinal < 0 ? '<p>Podľa zadaných údajov peniaze nestačia na základné výdavky. Samotné presúvanie medzi kategóriami tento rozdiel nevyrieši.</p>' : ''}<small>Platí pre zadané údaje a toto 35-dňové obdobie.</small>${model.reserve > 0 ? `<label class="reserve-choice"><input id="use-reserve" type="checkbox" ${useReserve ? 'checked' : ''}>Výslovne použiť rezervu na pokrytie nedostatku</label>` : ''}</div></div>
      ${uncertain ? `<label class="uncertain-control"><input id="include-uncertain" type="checkbox" ${includeUncertain ? 'checked' : ''}>Započítať aj neisté príjmy <span class="uncertain-tag">odhad</span></label><p class="uncertain-impact">${uncertainCopy()}</p>` : ''}
      <section class="events-section"><div class="section-topline"><h3>Čo sa chystá <span class="muted">· platby ${money(current.upcomingTotal)}</span></h3><button class="text-link" data-action="edit" data-tab="1">Upraviť platby ↗</button></div><div class="event-list">${nearby.length ? nearby.map(event => `<button class="event-card ${event.kind}" data-action="event" data-date="${event.date}" aria-label="${esc(event.name)}, ${date(event.date)}, ${money(event.amount)}"><span aria-hidden="true">${event.kind === 'income' ? '↓' : event.scenario ? '◇' : '↑'}</span><span><small>${date(event.date)} · ${esc(event.name)}${event.uncertain ? ' (neistý)' : ''}</small><strong>${event.amount >= 0 ? '+ ' : '− '}${money(Math.abs(event.amount))}</strong></span></button>`).join('') : '<p class="empty-note">Nemáš zadané žiadne udalosti. Bežné výdavky sú zahrnuté v grafe.</p>'}</div></section>`;
    if (activeElementId && ['play', 'day-slider', 'use-reserve', 'include-uncertain'].includes(activeElementId)) document.getElementById(activeElementId)?.focus({ preventScroll: true });
  }
  function statusCopy(result) {
    if (result.status === 'green') return { title: 'Zadané výdavky sú pokryté bez rezervy.', text: `Zostatok počas obdobia neklesne pod nulu. Najnižšie budeš na ${money(result.lowest.raw)} (${date(result.lowest.date)}).` };
    if (result.status === 'amber') return { title: useReserve ? 'Výdavky pokryje aj zapnutá rezerva.' : 'Na pokrytie výdavkov bude treba rezervu.', text: useReserve ? `Model použije ${money(result.drawn)} z rezervy. Bez nej by zostatok klesol na ${money(result.lowest.raw)}.` : `Bez rezervy vznikne nedostatok ${money(result.need)}. Dostupných ${money(E.cents(model.reserve))} bokom by ho pokrylo; čerpanie si môžeš zapnúť nižšie.` };
    return { title: 'Ani dostupná rezerva nepokryje všetky výdavky.', text: `Najväčší nedostatok je ${money(result.need)}. Aj po využití rezervy ${money(E.cents(model.reserve))} zostane nepokrytých ${money(result.shortfall)}.` };
  }
  function uncertainCopy() {
    const without = E.project(model, { includeUncertain: false, useReserve });
    const withIncome = E.project(model, { includeUncertain: true, useReserve });
    return `Porovnanie: bez neistých príjmov je na konci ${money(without.final)}, s nimi ${money(withIncome.final)}. Teraz zobrazuješ variant ${includeUncertain ? 's neistými príjmami' : 'bez neistých príjmov'}.`;
  }
  function chartSVG(compare) {
    const mobile = matchMedia('(max-width: 700px)').matches;
    const width = mobile ? 440 : 790, height = mobile ? 272 : 285;
    const left = mobile ? 57 : 65, right = 22, top = 22, bottom = height - 37;
    const all = [...base.days.map(d => d.balance), ...current.days.map(d => d.balance), ...(useReserve ? current.days.map(d => d.raw) : []), E.cents(model.available), 0];
    let min = Math.min(...all), max = Math.max(...all);
    const step = Math.max(10000, Math.ceil((max - min || 10000) / 4 / 10000) * 10000);
    min = Math.floor(min / step) * step; max = Math.max(min + step, Math.ceil(max / step) * step);
    const x = index => left + index / 34 * (width - left - right);
    const y = value => bottom - (value - min) / (max - min) * (bottom - top);
    const path = (days, prop = 'balance') => days.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(2)},${y(d[prop]).toFixed(2)}`).join(' ');
    const shown = animating ? current.days.slice(0, selected + 1) : current.days;
    const mainPath = path(shown), lastX = x(shown.length - 1);
    const colour = compare ? '#7b79ff' : '#4479ff';
    const points = current.days.filter(d => d.events.length || d.index === selected || d.index === 34);
    const ticks = Array.from({ length: 5 }, (_, i) => min + (max - min) * i / 4);
    return `<svg class="budget-chart" viewBox="0 0 ${width} ${height}" role="group" aria-labelledby="chart-title chart-description"><title id="chart-title">Vývoj zostatku počas 35 dní</title><desc id="chart-description">${compare ? 'Prerušovaná čiara je základný plán, fialová plán so zapnutými scenármi.' : 'Modrá čiara je základný plán.'} Najnižší zostatok pred rezervou ${money(current.lowest.raw)} dňa ${date(current.lowest.date)}. Body udalostí možno otvoriť klávesnicou.</desc><defs><linearGradient id="balance-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${colour}" stop-opacity=".12"/><stop offset="1" stop-color="${colour}" stop-opacity=".015"/></linearGradient></defs>
      ${min < 0 ? `<rect x="${left}" y="${y(0)}" width="${width - left - right}" height="${bottom - y(0)}" fill="#fff2f1"/>` : ''}
      ${ticks.map(tick => `<line x1="${left}" x2="${width - right}" y1="${y(tick)}" y2="${y(tick)}" stroke="#e4e9f2" stroke-dasharray="3 5"/><text x="${left - 10}" y="${y(tick) + 4}" text-anchor="end">${number(tick / 100, 0)}</text>`).join('')}
      <text x="${left - 10}" y="11" text-anchor="end" style="font-size:8px">EUR</text>
      ${[0, 7, 14, 21, 28, 34].filter((_, i) => !mobile || i !== 4).map(index => `<line x1="${x(index)}" x2="${x(index)}" y1="${top}" y2="${bottom}" stroke="#edf0f6"/><text class="tick-label" x="${x(index)}" y="${height - 13}" text-anchor="${index === 0 ? 'start' : index === 34 ? 'end' : 'middle'}">${index === 0 ? (model.start === today ? 'Dnes' : date(model.start)) : date(E.addDays(model.start, index))}</text>`).join('')}
      <path d="${mainPath} L${lastX},${y(0)} L${left},${y(0)} Z" fill="url(#balance-fill)"/>
      ${compare ? `<path d="${path(base.days)}" stroke="#99a9c2" stroke-width="2" stroke-dasharray="5 5" fill="none" stroke-linejoin="round"/>` : ''}
      ${useReserve && current.need ? `<path d="${path(current.days, 'raw')}" stroke="#a78a3d" stroke-width="1.5" stroke-dasharray="3 4" fill="none"/>` : ''}
      ${min < 0 ? `<line x1="${left}" x2="${width - right}" y1="${y(0)}" y2="${y(0)}" stroke="#cd8f91" stroke-width="1"/><text class="zero-label" x="${width - right - 4}" y="${y(0) - 7}" text-anchor="end">hranica dostupných peňazí</text>` : ''}
      <path d="${mainPath}" stroke="${colour}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="${x(selected)}" x2="${x(selected)}" y1="${top}" y2="${bottom}" stroke="${colour}" stroke-opacity=".5" stroke-dasharray="3 4"/>
      ${points.filter(d => !animating || d.index <= selected).map(d => `<g role="button" tabindex="0" data-action="day" data-day="${d.index}" aria-label="${date(d.date)}: ${esc(d.events.map(e => e.name).join(', ') || 'Zostatok')}, ${money(d.balance)}"><title>${date(d.date)} · ${esc(d.events.map(e => e.name).join(', ') || 'Bežné výdavky')} · ${money(d.balance)}</title><circle cx="${x(d.index)}" cy="${y(d.balance)}" r="${d.index === selected ? 8 : 6}" fill="${d.events.some(e => e.kind === 'income') ? '#ded38f' : 'white'}" stroke="${colour}" stroke-width="${d.index === selected ? 3 : 2}"/><circle cx="${x(d.index)}" cy="${y(d.balance)}" r="16" fill="transparent"/></g>`).join('')}
    </svg>`;
  }
  function dayReadout() {
    const day = current.days[selected];
    const events = day.events.map(event => `${esc(event.name)}${event.uncertain ? ' (neistý)' : ''} <strong>${event.amount >= 0 ? '+' : '−'}${money(Math.abs(event.amount))}</strong>`).join(' · ');
    return `<div><div class="day-date">${selected === 0 && model.start === today ? 'DNES · ' : ''}${date(day.date, true)} · koniec dňa</div><p class="day-description">${events || 'Deň bez jednorazovej platby.'} ${events ? '<br>' : ''}Bežné potreby −${money(day.daily)}${day.draw ? ` · Z rezervy +${money(day.draw)}` : ''}</p></div><div class="day-balance">${money(day.balance)}<small>${day.balance < 0 ? 'potreba financovania' : 'zostatok na konci dňa'}</small></div>`;
  }
  function renderScenarios() {
    $('#active-scenarios').innerHTML = model.scenarios.map(s => {
      const income = model.incomes.find(i => i.id === s.incomeId);
      const detail = s.type === 'delay' ? `${esc(income?.name || 'Príjem')}: +${s.days} dní${income ? ` · ${date(income.date)} → ${date(E.addDays(income.date, s.days))}` : ''}` : `${money(E.cents(s.amount))} · ${date(s.date)}`;
      return `<div class="active-scenario"><label><input type="checkbox" data-scenario-toggle="${esc(s.id)}" ${s.enabled !== false ? 'checked' : ''}><span><strong>${esc(s.name)}</strong> <small>${detail}</small></span></label><button class="text-link" data-action="edit-scenario" data-id="${esc(s.id)}">Upraviť</button><button class="icon-button" data-action="remove-scenario" data-id="${esc(s.id)}" aria-label="Odstrániť scenár ${esc(s.name)}">×</button></div>`;
    }).join('');
  }
  function inputFeedback() {
    const note = $('#mobile-feedback');
    if (!note) return;
    note.innerHTML = `<span>${current.spending < 0 ? 'Do príjmu chýba' : 'Priestor do príjmu'}</span><strong class="${current.spending < 0 ? 'negative' : ''}">${money(Math.abs(current.spending))}</strong>`;
    note.classList.add('visible'); clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => note.classList.remove('visible'), 2300);
  }
  function playback() {
    if (playing) { stopPlayback(); renderResults(); return; }
    if (reduced.matches) { selected = 34; animating = false; renderResults(); toast('Výsledok je zobrazený bez animácie podľa nastavenia zariadenia.'); return; }
    if (selected === 34) selected = 0;
    animating = true; playing = true; renderResults();
    timer = setInterval(() => {
      selected = Math.min(34, selected + 1);
      if (selected === 34) { stopPlayback(); animating = false; }
      renderResults();
    }, 320);
  }

  // Editors work with a separate draft. Cancelling leaves the live plan untouched.
  function openEditor(tab = 0, own = false) {
    stopPlayback(); scenarioDraft = null; wizard = own; editorTab = tab;
    draft = own ? { start: today, demo: null, household: 'individual', available: 0, reserve: 0, weekly: 0, goal: 0, incomes: [], payments: [], reality: [], scenarios: [] } : structuredClone(model);
    renderEditor(); $('#editor').showModal();
  }
  function numberField(name, label, value, note = '', minimum = 0) {
    return `<label class="field"><span>${label}</span><input name="${name}" type="number" min="${minimum}" max="1000000000" step="0.01" inputmode="decimal" value="${value}" required>${note ? `<small>${note}</small>` : ''}</label>`;
  }
  function entryRow(row, kind) {
    const id = esc(row.id), linked = kind === 'reality' && row.existingPaymentId && draft.payments.find(p => p.id === row.existingPaymentId);
    return `<div class="entry-row ${kind === 'reality' ? 'reality-row' : ''}" data-entry-id="${id}" data-kind="${kind}"><div class="entry-fields"><label class="field"><span>Názov</span><input data-field="name" value="${esc(row.name)}" maxlength="80" required aria-label="Názov ${kind === 'income' ? 'príjmu' : 'platby'}"></label><label class="field"><span>Suma v €</span><input data-field="amount" type="number" min="0.01" max="1000000000" step="0.01" value="${linked ? linked.amount : row.amount}" inputmode="decimal" required ${linked ? 'disabled' : ''} aria-label="Suma – ${esc(row.name)}"></label><label class="field"><span>Dátum</span><input data-field="date" type="date" min="${draft.start}" max="${E.addDays(draft.start, 3660)}" value="${linked ? linked.date : row.date}" required ${linked ? 'disabled' : ''} aria-label="Dátum – ${esc(row.name)}"></label><button type="button" class="entry-remove" data-action="remove-entry" data-id="${id}" data-kind="${kind}" aria-label="Odstrániť ${esc(row.name)}">×</button></div>
      <div class="entry-extra">${kind === 'income' ? `<label><input data-field="uncertain" type="checkbox" ${row.uncertain ? 'checked' : ''}>Neistý príjem · nemusí prísť</label>` : kind === 'payment' ? `<label>Kategória <input class="category-input" list="expense-categories" data-field="category" value="${esc(row.category || 'Iné')}" maxlength="50" aria-label="Kategória – ${esc(row.name)}"></label>` : `<label>Táto platba <select data-field="existingPaymentId" aria-label="Zabrániť dvojitému započítaniu ${esc(row.name)}"><option value="">ešte nie je v mojom rozpočte</option>${draft.payments.map(p => `<option value="${esc(p.id)}" ${row.existingPaymentId === p.id ? 'selected' : ''}>už je zadaná ako: ${esc(p.name)}</option>`).join('')}</select></label>${linked ? '<span>Započítame iba pôvodnú platbu, jedenkrát.</span>' : ''}`}</div></div>`;
  }
  function renderEditor() {
    const contents = editorTab === 0 ? `
      <div class="field"><span>Pre koho je rozpočet?</span><div class="household-choice"><label><input type="radio" name="household" value="individual" ${draft.household === 'individual' ? 'checked' : ''}>Pre mňa</label><label><input type="radio" name="household" value="household" ${draft.household === 'household' ? 'checked' : ''}>Pre domácnosť</label></div></div>
      <div class="form-grid"><label class="field full"><span>Začiatok projekcie</span><input name="start" type="date" value="${draft.start}" required><small>Dostupné peniaze sa vzťahujú k tomuto dátumu.</small></label>${numberField('available', 'Peniaze na bežné fungovanie (€)', draft.available, 'Bez sumy, ktorú uvedieš ako rezervu.')}${numberField('reserve', 'Oddelená dostupná rezerva (€)', draft.reserve, 'Peniaze navyše, ešte nezahrnuté v prvej sume.')}<div class="full">${numberField('weekly', 'Koľko pravdepodobne miniem za týždeň (€)', draft.weekly, 'Odhad na jedlo, dopravu a bežné potreby. Jednorazové platby pridáš v ďalšom kroku.')}</div></div>` : editorTab === 1 ? `
      <p>Zadaj najbližší príjem a konkrétne platby. Pri opakovaných platbách pridaj každý dátum v tomto období osobitne.</p>
      <section class="editor-section"><div class="editor-section-head"><h3>Príjmy</h3><button type="button" class="add-button" data-action="add-entry" data-kind="income">+ Pridať príjem</button></div>${draft.incomes.map(i => entryRow(i, 'income')).join('') || '<div class="empty-note">Pridaj najbližší príjem, jeho sumu a dátum.</div>'}</section>
      <section class="editor-section"><div class="editor-section-head"><h3>Povinné a plánované platby</h3><button type="button" class="add-button" data-action="add-entry" data-kind="payment">+ Pridať platbu</button></div>${draft.payments.map(p => entryRow(p, 'payment')).join('') || '<div class="empty-note">Napríklad bývanie, energie alebo splátka.</div>'}</section><datalist id="expense-categories">${categories.map(c => `<option value="${c}"></option>`).join('')}</datalist>` : `
      <h3>Čím budú najbližšie týždne iné než zvyčajne?</h3><p>Táto otázka je voliteľná. Ak už je výdavok medzi platbami, vyber ho zo zoznamu a nezapočítame ho dvakrát.</p>
      <div class="reality-options">${realityNames.map(name => `<button type="button" data-action="add-reality" data-name="${name}">+ ${name}</button>`).join('')}</div>${draft.reality.map(r => entryRow(r, 'reality')).join('')}
      <div class="form-grid"><div>${numberField('goal', 'Koľko chcem skúsiť minúť za týždeň (€)', draft.goal)}</div><div class="field"><span>Koľko pravdepodobne miniem</span><div class="amount-input"><strong style="padding:10px 0">${money(E.cents(draft.weekly))} / týždeň</strong></div><small>Aktuálny odhad pre graf.</small></div></div><div class="goal-explainer"><strong>Cieľ ešte nie je dosiahnutá úspora.</strong><br>Projekcia ďalej používa pravdepodobné míňanie ${money(E.cents(draft.weekly))} za týždeň. Ak chceš skúsiť iný odhad, zmeň bežné výdavky v prvom kroku.</div>`;
    $('#editor').className = '';
    $('#editor').innerHTML = `<button class="dialog-close" data-action="close-editor" aria-label="Zavrieť bez uloženia">×</button><span class="section-number">${wizard ? 'TVOJ VLASTNÝ ROZPOČET' : 'UPRAVIŤ ZÁKLADNÝ PLÁN'}</span><h2 id="editor-title">${['Začnime tvojimi číslami', 'Čo príde. Čo odíde.', 'Malá kontrola reality'][editorTab]}</h2><div class="editor-tabs" aria-label="Kroky zadávania">${['01 · Moje peniaze', '02 · Príjmy a platby', '03 · Čo bude iné?'].map((label, i) => `<button type="button" data-action="editor-tab" data-tab="${i}" class="${i === editorTab ? 'selected' : ''}" aria-current="${i === editorTab ? 'step' : 'false'}">${label}</button>`).join('')}</div><form id="budget-form">${contents}<div class="editor-actions"><button type="button" class="text-link" data-action="${editorTab ? 'editor-back' : 'close-editor'}">${editorTab ? '← Predchádzajúci krok' : 'Zrušiť'}</button><div>${wizard && editorTab === 2 ? '<button type="button" class="button secondary" data-action="skip-reality">Preskočiť</button>' : ''}<button class="button primary" type="submit">${wizard && editorTab < 2 ? 'Pokračovať' : wizard ? 'Otvoriť môj rozpočet' : 'Uložiť a prepočítať'} <span aria-hidden="true">→</span></button></div></div></form>`;
  }
  function collectDraft() {
    const form = $('#budget-form'); if (!form) return;
    if (editorTab === 0) {
      const data = new FormData(form);
      for (const field of ['available', 'reserve', 'weekly']) draft[field] = Number(data.get(field));
      draft.household = data.get('household'); draft.start = data.get('start');
    }
    if (editorTab === 1 || editorTab === 2) {
      for (const row of form.querySelectorAll('[data-entry-id]')) {
        const key = row.dataset.kind === 'income' ? 'incomes' : row.dataset.kind === 'payment' ? 'payments' : 'reality';
        const item = draft[key].find(i => i.id === row.dataset.entryId);
        for (const input of row.querySelectorAll('[data-field]')) {
          const field = input.dataset.field;
          item[field] = input.type === 'checkbox' ? input.checked : field === 'amount' ? Number(input.value) : input.value;
        }
        if (key === 'reality' && item.existingPaymentId) {
          const original = draft.payments.find(p => p.id === item.existingPaymentId);
          if (original) { item.amount = original.amount; item.date = original.date; }
        }
      }
      if (editorTab === 2) draft.goal = Number(form.elements.goal.value);
    }
  }
  function saveDraft(skipReality = false) {
    collectDraft();
    if (skipReality) draft.reality = [];
    if (!wizard) draft.demo = null;
    if (!validModel(draft)) { toast('Skontroluj sumy a dátumy vo všetkých krokoch.'); return; }
    draft.scenarios = draft.scenarios.filter(s => s.type !== 'delay' || draft.incomes.some(i => i.id === s.incomeId));
    model = structuredClone(draft); draft = null; $('#editor').close();
    resetPlayback(); persist(); showWorkspace(); toast('Rozpočet je prepočítaný podľa tvojich údajov.');
  }
  function openScenario(type, id) {
    stopPlayback();
    const original = model.scenarios.find(s => s.id === id || (!id && type === 'delay' && s.type === 'delay'));
    if (!original && type === 'delay' && !model.incomes.length) { openEditor(1); toast('Najprv pridaj príjem, ktorého dátum chceš skúsiť posunúť.'); return; }
    const next = E.transactions(model, { scenarios: false, includeUncertain }).find(e => e.kind === 'income' && e.date >= model.start) || model.incomes[0];
    scenarioDraft = original ? structuredClone(original) : { id: uid(), type, name: type === 'delay' ? 'Príjem príde neskôr' : type === 'purchase' ? 'Môj nákup' : 'Nečakaný výdavok', amount: 150, date: E.addDays(model.start, type === 'purchase' ? 10 : 6), incomeId: next?.id, days: 7, enabled: true };
    const s = scenarioDraft;
    $('#editor').className = 'scenario-form';
    $('#editor').innerHTML = `<button class="dialog-close" data-action="close-editor" aria-label="Zavrieť bez uloženia">×</button><span class="section-number">ČO AK…? / ${original ? 'UPRAVIŤ SCENÁR' : 'NOVÝ SCENÁR'}</span><h2 id="editor-title">${s.type === 'delay' ? 'Príjem príde neskôr' : s.type === 'purchase' ? 'Má tento nákup priestor?' : 'Niečo nečakané'}</h2><p>${s.type === 'delay' ? 'Posunie sa iba zvolený príjem. Dátumy povinných platieb zostávajú podľa tvojho zadania.' : 'Uprav sumu aj dátum a porovnaj výsledok so základným plánom.'}</p><form id="scenario-form"><div class="form-grid">${s.type === 'delay' ? `<label class="field full"><span>Ktorý príjem?</span><select name="incomeId">${model.incomes.map(i => `<option value="${esc(i.id)}" ${s.incomeId === i.id ? 'selected' : ''}>${esc(i.name)} · ${money(E.cents(i.amount))} · ${date(i.date)}${i.uncertain ? ' · neistý' : ''}</option>`).join('')}</select></label><label class="field full"><span>O koľko dní neskôr?</span><input name="days" type="number" min="1" max="60" step="1" value="${s.days}" required inputmode="numeric"></label>` : `<label class="field full"><span>Názov</span><input name="name" value="${esc(s.name)}" maxlength="80" required></label>${numberField('amount', 'Cena / výdavok (€)', s.amount, '', 0.01)}<label class="field"><span>Dátum</span><input name="date" type="date" min="${model.start}" max="${E.addDays(model.start, 3660)}" value="${s.date}" required></label>`}</div><div id="scenario-preview" class="scenario-preview" aria-live="polite"></div><div class="editor-actions"><button type="button" class="text-link" data-action="close-editor">Zrušiť</button><button type="submit" class="button primary">${original ? 'Uložiť zmenu' : 'Vyskúšať scenár'} <span aria-hidden="true">→</span></button></div></form>`;
    scenarioPreview(); $('#editor').showModal();
  }
  function readScenario() {
    const data = new FormData($('#scenario-form'));
    return scenarioDraft.type === 'delay' ? { ...scenarioDraft, incomeId: data.get('incomeId'), days: Number(data.get('days')) } : { ...scenarioDraft, name: data.get('name'), amount: Number(data.get('amount')), date: data.get('date') };
  }
  function scenarioPreview() {
    try {
      if (!$('#scenario-form').checkValidity()) { $('#scenario-preview').textContent = 'Doplň platnú sumu a dátum pre náhľad výsledku.'; return; }
      const s = readScenario();
      const result = E.project({ ...model, scenarios: [...model.scenarios.filter(item => item.id !== s.id), { ...s, enabled: true }] }, { includeUncertain, useReserve });
      $('#scenario-preview').innerHTML = `So zapnutým scenárom bude najnižší zostatok pred rezervou <strong>${money(result.lowest.raw)}</strong> (${date(result.lowest.date)}). Na konci obdobia <strong>${money(result.final)}</strong>.${s.type === 'delay' ? `<br>Nový dátum príjmu: <strong>${date(E.addDays(model.incomes.find(i => i.id === s.incomeId).date, s.days), true)}</strong>.` : ''}`;
    } catch { $('#scenario-preview').textContent = 'Doplň údaje na prepočet.'; }
  }

  function showInfo(type) {
    const privacy = type === 'privacy';
    $('#info-dialog').innerHTML = `<button class="dialog-close" data-action="close-info" aria-label="Zavrieť vysvetlenie">×</button><span class="section-number">ROZPOČET NAŽIVO · 5PEŇAZÍ</span><h2 id="info-title">${privacy ? 'Tvoje čísla zostávajú u teba.' : 'Malý model. Jasné pravidlá.'}</h2>${privacy ? `<p>Výpočty prebiehajú iba v tomto prehliadači. Aplikácia nemá účet, analytiku, pripojenie na banku ani externé AI služby. Fonty a logo sú uložené lokálne.</p><ul class="method-list"><li><strong>Predvolene iba v pamäti</strong>Po obnovení alebo zavretí stránky sa neuložené údaje stratia.</li><li><strong>Uloženie je dobrovoľné</strong>Voľba „Zapamätať na tomto zariadení“ uloží údaje do úložiska tohto prehliadača. Môžu ich vidieť aj ďalší používatelia rovnakého profilu prehliadača.</li><li><strong>Vymazanie máš pod kontrolou</strong>V paneli Moje peniaze použi „Vymazať moje čísla aj uloženie“. Vypnutie zapamätania vymaže uloženú kópiu a ponechá aktuálne čísla v pamäti.</li></ul>` : `<p>Nejde o hodnotenie tvojej finančnej situácie. Vyskúšaš si dôsledky konkrétnych údajov a rozhodnutí počas 35 dní.</p><ul class="method-list"><li><strong>Príjmy + platby + bežné potreby, každý deň</strong>Týždenný odhad delíme siedmimi. Centové zaokrúhľovanie rozkladáme tak, aby súčet za sedem dní presne zodpovedal týždennej sume. Mesačnú sumu nedelíme štyrmi.</li><li><strong>Graf zobrazuje koniec dňa</strong>V rovnaký deň započítame najprv príjem, potom jednorazové platby a bežné potreby. Skutočné poradie transakcií počas dňa nepoznáme: krátkodobý nedostatok v ten istý deň model nemusí ukázať.</li><li><strong>Priestor na míňanie je najnižší zostatok do príjmu</strong>Od úvodnej sumy odpočítavame zadané platby aj bežné potreby do dňa pred najbližším príjmom. Jeho sumu ešte nezapočítame. Ak príjem príde dnes, použijeme dnešný koncový zostatok a úvodnú sumu ako hornú hranicu. Bez zadaného príjmu sledujeme celé obdobie. Pri príjme za hranicou grafu počítame až do neho. Rezerva priestor na míňanie nezvyšuje.</li><li><strong>Rezerva je vždy oddelená</strong>Pri zápornom zostatku najprv ukážeme potrebu financovania. Rezervu použijeme iba po tvojom výslovnom zapnutí, len do výšky skutočne dostupnej sumy a iba raz. Čerpanie je modelované na konci dňa; kladné príjmy rezervu automaticky nedopĺňajú.</li><li><strong>Dve čiary, ten istý základ</strong>Prerušovaná čiara je pôvodný plán, fialová obsahuje iba zapnuté scenáre. Oneskorenie posúva zvolený príjem, nikdy povinné platby. Cieľ míňania sám osebe nemení odhad a nie je dosiahnutou úsporou. Neisté príjmy môžeš vypnúť.</li><li><strong>Semafor opisuje konkrétny plán alebo scenár</strong>Zelená: výdavky sú pokryté bez rezervy. Oranžová: treba dostupnú rezervu. Červená: ani dostupná rezerva nestačí. Farba nehodnotí človeka.</li></ul><p class="info-note">Nástroj pracuje iba s tým, čo zadáš. Nezohľadní nezadané platby ani zmeny cien. Začiatok obdobia aj všetky dátumy môžeš upraviť.</p>`}<div class="editor-actions"><span></span><button class="button primary" data-action="close-info">Rozumiem</button></div>`;
    $('#info-dialog').showModal();
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]'); if (!button) return;
    const action = button.dataset.action;
    if (action === 'home') { resetPlayback(); $('#welcome').hidden = false; $('#workspace').hidden = true; scrollTop(); }
    else if (action === 'demo') startDemo();
    else if (action === 'preset') startDemo(button.dataset.preset);
    else if (action === 'own') openEditor(0, true);
    else if (action === 'help' || action === 'privacy') showInfo(action);
    else if (action === 'close-info') $('#info-dialog').close();
    else if (action === 'edit') openEditor(Number(button.dataset.tab || 0));
    else if (action === 'close-editor') { $('#editor').close(); draft = null; scenarioDraft = null; }
    else if (action === 'editor-tab' || action === 'editor-back') {
      if (!$('#budget-form').reportValidity()) return;
      collectDraft(); if (!draft.start || !/^\d{4}-\d{2}-\d{2}$/.test(draft.start)) { $('#budget-form').reportValidity(); return; }
      editorTab = action === 'editor-back' ? editorTab - 1 : Number(button.dataset.tab); renderEditor();
    }
    else if (action === 'add-entry' || action === 'add-reality') {
      collectDraft(); const kind = action === 'add-reality' ? 'reality' : button.dataset.kind;
      const key = kind === 'income' ? 'incomes' : kind === 'payment' ? 'payments' : 'reality';
      const newId = uid();
      draft[key].push({ id: newId, name: kind === 'income' ? 'Nový príjem' : kind === 'payment' ? 'Nová platba' : button.dataset.name, category: 'Iné', amount: kind === 'income' ? 1200 : 50, date: E.addDays(draft.start, kind === 'income' ? 12 : 5), uncertain: false, existingPaymentId: '' });
      renderEditor(); $(`[data-entry-id="${newId}"] [data-field="name"]`)?.focus();
    }
    else if (action === 'remove-entry') {
      collectDraft(); const key = button.dataset.kind === 'income' ? 'incomes' : button.dataset.kind === 'payment' ? 'payments' : 'reality';
      draft[key] = draft[key].filter(item => item.id !== button.dataset.id);
      if (key === 'incomes') draft.scenarios = draft.scenarios.filter(s => s.type !== 'delay' || s.incomeId !== button.dataset.id);
      renderEditor();
    }
    else if (action === 'skip-reality') saveDraft(true);
    else if (action === 'scenario') openScenario(button.dataset.type);
    else if (action === 'edit-scenario') openScenario(null, button.dataset.id);
    else if (action === 'remove-scenario') { model.scenarios = model.scenarios.filter(s => s.id !== button.dataset.id); resetPlayback(); persist(); renderResults(); renderScenarios(); toast('Scenár je odstránený. Projekcia je prepočítaná.'); }
    else if (action === 'day' || action === 'event') {
      stopPlayback(); animating = false; selected = action === 'day' ? Number(button.dataset.day) : Math.max(0, Math.min(34, E.diffDays(model.start, button.dataset.date)));
      renderResults(); if (action === 'event') $('#day-readout').scrollIntoView({ block: 'center', behavior: reduced.matches ? 'instant' : 'smooth' });
    }
    else if (action === 'play') playback();
    else if (action === 'replay') { resetPlayback(); renderResults(); }
    else if (action === 'finish') { stopPlayback(); selected = 34; animating = false; renderResults(); }
    else if (action === 'erase') {
      remember = false; model = null; persist(); resetPlayback(); $('#workspace').innerHTML = ''; $('#workspace').hidden = true; $('#welcome').hidden = false; scrollTop(); toast('Tvoje čísla aj uložená kópia sú vymazané.');
    }
  });
  document.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('g[data-day]')) { event.preventDefault(); event.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  });
  document.addEventListener('input', event => {
    const input = event.target;
    if (input.dataset.model || input.id === 'weekly-range') {
      if (!input.validity.valid || input.value === '') return;
      const field = input.dataset.model || 'weekly'; model[field] = Number(input.value);
      if (model.demo) {
        model.demo = null; $('.demo-label').innerHTML = '<span>UPRAVENÝ PRÍKLAD</span>Tvoje úpravy fiktívnych čísel';
        const preset = $('.demo-options .selected'); if (preset) { preset.classList.remove('selected'); preset.setAttribute('aria-pressed', 'false'); }
      }
      if (field === 'weekly') {
        $('#weekly').value = model.weekly;
        const range = $('#weekly-range'); range.max = Math.max(500, Math.ceil(model.weekly / 100) * 100); range.value = model.weekly; range.style.setProperty('--fill', `${model.weekly / Number(range.max) * 100}%`);
        range.nextElementSibling.lastElementChild.textContent = money(E.cents(Number(range.max)));
        $('#goal-caption').innerHTML = goalCaption();
      }
      resetPlayback(); persist(); renderResults(); inputFeedback();
    }
    else if (input.id === 'day-slider') {
      stopPlayback(); animating = false; selected = Number(input.value);
      $('.chart-container').innerHTML = chartSVG(model.scenarios.some(s => s.enabled !== false));
      $('#day-readout').innerHTML = dayReadout();
      input.style.setProperty('--fill', `${selected / 34 * 100}%`);
      input.setAttribute('aria-valuetext', `${date(current.days[selected].date)}: ${money(current.days[selected].balance)}`);
      input.nextElementSibling.textContent = `${selected + 1}. / 35 dní`;
      $('#play').innerHTML = `<span class="play-icon" aria-hidden="true">▶</span>${selected === 34 ? 'Prehrať znova' : 'Prehrať môj rozpočet'}`;
    }
    else if (input.closest('#scenario-form')) scenarioPreview();
  });
  document.addEventListener('change', event => {
    const input = event.target;
    if (input.id === 'remember') { remember = input.checked; persist(); toast(remember ? 'Zapamätané iba v tomto prehliadači.' : 'Uložená kópia je vymazaná. Čísla zostávajú v pamäti.'); }
    else if (input.id === 'use-reserve') { useReserve = input.checked; resetPlayback(); persist(); renderResults(); }
    else if (input.id === 'include-uncertain') { includeUncertain = input.checked; resetPlayback(); persist(); renderResults(); }
    else if (input.dataset.scenarioToggle) { model.scenarios.find(s => s.id === input.dataset.scenarioToggle).enabled = input.checked; resetPlayback(); persist(); renderResults(); }
    else if (input.dataset.field === 'existingPaymentId') { collectDraft(); renderEditor(); }
  });
  document.addEventListener('submit', event => {
    if (event.target.id === 'budget-form') {
      event.preventDefault(); collectDraft();
      if (wizard && editorTab < 2) { editorTab++; renderEditor(); }
      else saveDraft();
    }
    else if (event.target.id === 'scenario-form') {
      event.preventDefault(); const scenario = readScenario();
      model.scenarios = [...model.scenarios.filter(s => s.id !== scenario.id), scenario];
      $('#editor').close(); scenarioDraft = null; resetPlayback(); persist(); renderResults(); renderScenarios();
      $('.money-stage').scrollIntoView({ block: 'start', behavior: reduced.matches ? 'instant' : 'smooth' }); toast('Scenár je pridaný do porovnania.');
    }
  });
  $('#editor').addEventListener('cancel', () => { draft = null; scenarioDraft = null; });
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) { stopPlayback(); renderResults(); } });
  reduced.addEventListener('change', () => { if (reduced.matches && playing) { stopPlayback(); selected = 34; animating = false; renderResults(); } });
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (model && !$('#workspace').hidden) renderResults(); }, 120);
  });
  if (model) { showWorkspace(); if (model.start !== today) toast(`Obnovený rozpočet začína ${date(model.start, true)}. Dátum aj čísla môžeš upraviť.`); }
})();
