(function (root) {
  'use strict';
  const DAY = 86400000;
  const cents = value => Math.round(Number(value || 0) * 100);
  const euros = value => value / 100;
  function parseDate(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) throw new Error('Neplatný dátum');
    const date = new Date(iso + 'T12:00:00Z');
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== iso) throw new Error('Neplatný dátum');
    return date;
  }
  function addDays(iso, count) { const date = parseDate(iso); date.setUTCDate(date.getUTCDate() + count); return date.toISOString().slice(0, 10); }
  const diffDays = (a, b) => Math.round((parseDate(b) - parseDate(a)) / DAY);
  function transactions(model, options = {}) {
    const entries = [];
    const scenarios = options.scenarios === false ? [] : (model.scenarios || []).filter(s => s.enabled !== false);
    for (const income of model.incomes || []) {
      if (income.uncertain && options.includeUncertain === false) continue;
      const delay = scenarios.filter(s => s.type === 'delay' && s.incomeId === income.id).reduce((n, s) => n + Number(s.days || 0), 0);
      entries.push({ ...income, date: addDays(income.date, delay), originalDate: income.date, amount: Math.abs(cents(income.amount)), kind: 'income', scenario: delay > 0 });
    }
    for (const payment of model.payments || []) entries.push({ ...payment, amount: -Math.abs(cents(payment.amount)), kind: 'payment' });
    for (const event of model.reality || []) {
      if (event.existingPaymentId && (model.payments || []).some(p => p.id === event.existingPaymentId)) continue;
      entries.push({ ...event, amount: -Math.abs(cents(event.amount)), kind: 'reality' });
    }
    for (const scenario of scenarios.filter(s => s.type !== 'delay')) entries.push({ ...scenario, amount: -Math.abs(cents(scenario.amount)), kind: scenario.type === 'purchase' ? 'purchase' : 'unexpected', scenario: true });
    // Modelujeme koniec dňa: príjem, potom platby, potom bežné potreby.
    return entries.sort((a, b) => a.date.localeCompare(b.date) || Number(b.kind === 'income') - Number(a.kind === 'income') || a.id.localeCompare(b.id));
  }
  function project(model, options = {}) {
    const start = options.start || model.start;
    parseDate(start);
    const horizon = options.days || 35;
    const weekly = cents(model.weekly);
    const opening = cents(model.available);
    const reserve = Math.max(0, cents(model.reserve));
    const events = transactions(model, options);
    let raw = opening, balance = opening, drawn = 0;
    const days = [];
    for (let index = 0; index < horizon; index++) {
      const date = addDays(start, index);
      const daily = Math.round(weekly * (index + 1) / 7) - Math.round(weekly * index / 7);
      const dayEvents = events.filter(event => event.date === date);
      const movement = dayEvents.reduce((sum, event) => sum + event.amount, 0) - daily;
      raw += movement;
      balance += movement;
      const draw = options.useReserve && balance < 0 ? Math.min(-balance, reserve - drawn) : 0;
      drawn += draw;
      balance += draw;
      days.push({ date, index, raw, balance, daily, events: dayEvents, draw, reserveRemaining: reserve - drawn });
    }
    const lowest = days.reduce((low, day) => day.raw < low.raw ? day : low, { raw: opening, date: start, index: 0 });
    const need = Math.max(0, -lowest.raw);
    const nextIncome = events.find(e => e.kind === 'income' && e.amount > 0 && e.date >= start);
    const untilIncome = nextIncome ? Math.max(1, diffDays(start, nextIncome.date)) : horizon;
    // Priestor nezvyšujeme o rezervu. Pri ďalekom príjme overíme aj dni mimo grafu.
    const spendingDays = untilIncome > horizon && !options.internal ? project(model, { ...options, days: untilIncome, internal: true }).days : days;
    const beforeIncome = spendingDays.slice(0, untilIncome);
    const spending = Math.min(opening, ...beforeIncome.map(day => day.raw));
    return {
      days, events, lowest, need, drawn, nextIncome,
      spending, shortfall: Math.max(0, need - reserve), funding: Math.max(0, need - drawn),
      reserveNeeded: Math.min(need, reserve), final: days.at(-1).balance,
      rawFinal: days.at(-1).raw,
      status: need === 0 ? 'green' : need <= reserve ? 'amber' : 'red',
      upcomingTotal: events.filter(e => e.date >= start && e.date <= addDays(start, horizon - 1) && e.amount < 0).reduce((n, e) => n - e.amount, 0)
    };
  }
  function demo(kind, start) {
    const common = { start, household: 'household', goal: 130, reality: [], scenarios: [] };
    const income = (id, name, amount, offset, uncertain = false) => ({ id, name, amount, date: addDays(start, offset), uncertain });
    const payment = (id, name, category, amount, offset) => ({ id, name, category, amount, date: addDays(start, offset) });
    if (kind === 'tight') return { ...common, demo: kind, household: 'individual', available: 340, reserve: 80, weekly: 105, goal: 90,
      incomes: [income('salary', 'Výplata', 1050, 14), income('extra', 'Príležitostná práca', 80, 22, true)],
      payments: [payment('rent', 'Nájom', 'Bývanie', 530, 4), payment('energy', 'Energie', 'Energie', 85, 18), payment('phone', 'Telefón', 'Telefón a internet', 25, 8)] };
    if (kind === 'roomy') return { ...common, demo: kind, available: 2450, reserve: 3200, weekly: 210, goal: 190,
      incomes: [income('salary', 'Výplata', 2500, 12), income('partner', 'Príjem partnera/partnerky', 1600, 20)],
      payments: [payment('rent', 'Bývanie', 'Bývanie', 890, 5), payment('energy', 'Energie', 'Energie', 160, 9), payment('school', 'Škola a krúžky', 'Deti', 120, 16), payment('phone', 'Telefón a internet', 'Telefón a internet', 65, 25)] };
    return { ...common, demo: 'balanced', available: 1240, reserve: 450, weekly: 175, goal: 150,
      incomes: [income('salary', 'Výplata', 1650, 12), income('extra', 'Vedľajší príjem', 180, 23, true)],
      payments: [payment('rent', 'Nájom a bývanie', 'Bývanie', 620, 4), payment('energy', 'Energie', 'Energie', 95, 7), payment('phone', 'Telefón a internet', 'Telefón a internet', 38, 16), payment('transport', 'Mesačný cestovný lístok', 'Doprava', 35, 20)] };
  }
  const api = { cents, euros, parseDate, addDays, diffDays, transactions, project, demo };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.BudgetEngine = api;
})(typeof window === 'undefined' ? globalThis : window);
