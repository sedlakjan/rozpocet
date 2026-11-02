const { test } = require('node:test');
const assert = require('node:assert/strict');
const E = require('../engine.js');
const start = '2026-10-30';
const blank = overrides => ({ start, household: 'individual', available: 0, reserve: 0, weekly: 0, goal: 0, incomes: [], payments: [], reality: [], scenarios: [], ...overrides });
const income = (amount, offset, extra = {}) => ({ id: 'salary', name: 'Výplata', amount, date: E.addDays(start, offset), ...extra });
const payment = (amount, offset) => ({ id: 'rent', name: 'Nájom', amount, date: E.addDays(start, offset) });

test('kalendár: mesiac, rok, priestupný rok a neplatný dátum', () => {
  assert.equal(E.addDays('2026-10-30', 4), '2026-11-03');
  assert.equal(E.addDays('2026-12-30', 4), '2027-01-03');
  assert.equal(E.addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(E.addDays('2027-02-28', 1), '2027-03-01');
  assert.equal(E.diffDays('2026-10-24', '2026-10-27'), 3);
  assert.throws(() => E.parseDate('2026-02-30'));
});
test('projekcia obsahuje presne 35 po sebe idúcich dní', () => {
  const result = E.project(blank());
  assert.equal(result.days.length, 35);
  assert.equal(result.days[0].date, start);
  assert.equal(result.days.at(-1).date, '2026-12-03');
});
test('týždenné odhady sa rozložia bez centovej chyby, aj za päť týždňov', () => {
  const result = E.project(blank({ available: 1000, weekly: 50.03 }));
  for (let week = 0; week < 5; week++) assert.equal(result.days.slice(week * 7, week * 7 + 7).reduce((n, d) => n + d.daily, 0), 5003);
  assert.equal(result.rawFinal, 100000 - 5 * 5003);
});
test('v ten istý deň sa príjem započíta pred platbou a dennými potrebami', () => {
  const result = E.project(blank({ available: 10, weekly: 70, incomes: [income(120, 0)], payments: [payment(130, 0)] }), { days: 1 });
  assert.equal(result.days[0].raw, -1000);
  assert.equal(result.days[0].events[0].kind, 'income');
  assert.equal(result.days[0].events[1].kind, 'payment');
});
test('viac príjmov v rovnaký deň má stabilné poradie a správny súčet', () => {
  const model = blank({ incomes: [income(100, 0, { id: 'b' }), income(200, 0, { id: 'a' })], payments: [payment(50, 0)] });
  const result = E.project(model, { days: 1 });
  assert.deepEqual(result.days[0].events.map(e => e.id), ['a', 'b', 'rent']);
  assert.equal(result.final, 25000);
});
test('oneskorenie príjmu cez hranicu mesiaca neposunie povinné platby', () => {
  const model = blank({ available: 90, weekly: 70, incomes: [income(100, 3)], payments: [payment(60, 4)], scenarios: [{ id: 'late', type: 'delay', incomeId: 'salary', days: 7, enabled: true }] });
  const base = E.project(model, { scenarios: false });
  const changed = E.project(model);
  assert.equal(changed.events.find(e => e.kind === 'income').date, '2026-11-09');
  assert.equal(changed.events.find(e => e.kind === 'payment').date, '2026-11-03');
  assert.equal(base.days[4].raw, 8000);
  assert.equal(changed.days[4].raw, -2000);
  assert.equal(changed.rawFinal, base.rawFinal);
});
test('príjem posunutý mimo obdobia sa v grafe ešte nezapočíta', () => {
  const model = blank({ incomes: [income(1000, 30)], scenarios: [{ id: 'late', type: 'delay', incomeId: 'salary', days: 7 }] });
  assert.equal(E.project(model, { scenarios: false }).final, 100000);
  assert.equal(E.project(model).final, 0);
});
test('rezerva sa predvolene nemíňa a nezvyšuje priestor na míňanie', () => {
  const model = blank({ available: 100, reserve: 500, weekly: 70, incomes: [income(200, 7)] });
  const result = E.project(model);
  assert.equal(result.drawn, 0);
  assert.equal(result.spending, 3000);
  assert.equal(E.project({ ...model, reserve: 5000 }).spending, result.spending);
});
test('explicitné čerpanie je obmedzené rezervou a nikdy sa nezapočíta dvakrát', () => {
  const model = blank({ reserve: 25, weekly: 70 });
  const without = E.project(model, { days: 4 });
  const withReserve = E.project(model, { days: 4, useReserve: true });
  assert.equal(without.final, -4000);
  assert.equal(withReserve.drawn, 2500);
  assert.deepEqual(withReserve.days.map(d => d.draw), [1000, 1000, 500, 0]);
  assert.equal(withReserve.final, -1500);
  assert.equal(withReserve.shortfall, 1500);
  assert.equal(withReserve.status, 'red');
  assert.ok(withReserve.days.every(d => d.reserveRemaining >= 0));
});
test('neskorší príjem nevráti už čerpanú rezervu automaticky', () => {
  const result = E.project(blank({ reserve: 100, weekly: 70, incomes: [income(200, 2)] }), { days: 4, useReserve: true });
  assert.equal(result.drawn, 2000);
  assert.equal(result.final, 18000);
  assert.equal(result.days.at(-1).reserveRemaining, 8000);
  assert.equal(result.status, 'amber');
});
test('semafor opisuje nedostatok vzhľadom na dostupnú rezervu', () => {
  const model = blank({ available: 100, reserve: 50, payments: [payment(120, 2)] });
  assert.equal(E.project(model).status, 'amber');
  assert.equal(E.project({ ...model, reserve: 10 }).status, 'red');
  assert.equal(E.project({ ...model, available: 150 }).status, 'green');
});
test('odstránenie alebo vypnutie scenára obnoví presne pôvodnú projekciu', () => {
  const model = E.demo('balanced', start);
  const original = E.project(model);
  model.scenarios.push({ id: 'buy', name: 'Bicykel', type: 'purchase', amount: 300, date: E.addDays(start, 6), enabled: true });
  assert.equal(E.project(model).final, original.final - 30000);
  model.scenarios[0].enabled = false;
  assert.deepEqual(E.project(model), original);
  model.scenarios = [];
  assert.deepEqual(E.project(model), original);
});
test('neistý príjem možno úplne vylúčiť aj z hľadania ďalšieho príjmu', () => {
  const model = blank({ incomes: [income(500, 4, { uncertain: true })] });
  assert.equal(E.project(model).final, 50000);
  assert.equal(E.project(model, { includeUncertain: false }).final, 0);
  assert.equal(E.project(model, { includeUncertain: false }).nextIncome, undefined);
});
test('priestor zohľadňuje bežné potreby aj záväzky pred najbližším príjmom', () => {
  const result = E.project(E.demo('balanced', start));
  assert.equal(result.spending, 22500); // 1240 − 620 − 95 − 12 × 25
  assert.equal(result.lowest.raw, 22500);
  assert.equal(result.final, 140700);
});
test('pri deficite priestor vráti zápornú sumu, nie skrytú nulu', () => {
  const result = E.project(blank({ available: 20, weekly: 70, incomes: [income(200, 7)] }));
  assert.equal(result.spending, -5000);
});
test('priestor pred príjmom za hranicou grafu zohľadní aj dni mimo grafu', () => {
  const result = E.project(blank({ available: 1000, weekly: 70, incomes: [income(2000, 40)] }));
  assert.equal(result.spending, 60000);
  assert.equal(result.days.length, 35);
  assert.equal(result.final, 65000);
});
test('mimoriadna udalosť prepojená s existujúcou platbou sa počíta iba raz', () => {
  const model = blank({ available: 1000, payments: [payment(120, 2)], reality: [{ id: 'party', name: 'Oslava', amount: 120, date: E.addDays(start, 2), existingPaymentId: 'rent' }] });
  assert.equal(E.project(model).final, 88000);
  model.reality[0].existingPaymentId = '';
  assert.equal(E.project(model).final, 76000);
});
test('nižší cieľ míňania nezmení projekciu ani nevytvorí automatickú úsporu', () => {
  const model = E.demo('balanced', start);
  assert.deepEqual(E.project({ ...model, goal: 0 }), E.project({ ...model, goal: 175 }));
});
test('model nemení vstupy pri porovnávaní variantov', () => {
  const model = E.demo('balanced', start);
  const copy = structuredClone(model);
  E.project(model, { useReserve: true, includeUncertain: false });
  assert.deepEqual(model, copy);
});
