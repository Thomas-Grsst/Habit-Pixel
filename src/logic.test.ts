import { describe, expect, it } from 'vitest';
import { addDays, bestStreak, coinBalance, currentStreak, initialState, levelFor, missions, progression, weekStart, type AppState } from './logic';
import { reducer } from './store';

const TODAY = '2026-11-18';

function withHabits(days: number, opts: { skipToday?: boolean } = {}): AppState {
  const s = initialState();
  s.habits = [
    { id: 'a', name: 'Eau', color: '#fff', createdAt: addDays(TODAY, -400) },
    { id: 'b', name: 'Sport', color: '#fff', createdAt: addDays(TODAY, -400) },
  ];
  for (let i = opts.skipToday ? 1 : 0; i < days; i++) s.log[addDays(TODAY, -i)] = ['a', 'b'];
  return s;
}

describe('séries', () => {
  it('compte les journées complètes consécutives', () => {
    expect(currentStreak(withHabits(5), TODAY)).toBe(5);
  });
  it("ne casse pas la série si aujourd'hui n'est pas encore fait", () => {
    expect(currentStreak(withHabits(6, { skipToday: true }), TODAY)).toBe(5);
  });
  it('une journée partielle ne compte pas', () => {
    const s = withHabits(5);
    s.log[addDays(TODAY, -2)] = ['a'];
    expect(currentStreak(s, TODAY)).toBe(2);
    expect(bestStreak(s)).toBe(2);
  });
  it("une habitude créée aujourd'hui n'invalide pas le passé", () => {
    const s = withHabits(3, { skipToday: true });
    s.habits.push({ id: 'c', name: 'Lire', color: '#fff', createdAt: TODAY });
    expect(currentStreak(s, TODAY)).toBe(2);
  });
});

describe('progression', () => {
  it('suit les stades puis les paliers', () => {
    expect(levelFor(0)).toBe(1);
    expect(levelFor(100)).toBe(7);
    expect(levelFor(160)).toBe(8);
    expect(levelFor(1000)).toBe(22);
    expect(progression('combo', 1000).next).toBeNull();
    expect(progression('combo', 5).next?.day).toBe(7);
  });
  it('semaine commence le lundi', () => {
    expect(weekStart('2026-11-18')).toBe('2026-11-16');
    expect(weekStart('2026-11-22')).toBe('2026-11-16');
  });
});

describe('pièces et missions', () => {
  it('pièces = départ + validations + journées complètes - dépenses', () => {
    const s = withHabits(2);
    expect(coinBalance(s)).toBe(150 + 4 * 10 + 2 * 25);
  });
  it("décocher retire les pièces gagnées (pas d'abus)", () => {
    let s = withHabits(1);
    s = reducer(s, { type: 'toggleCheck', day: TODAY, habitId: 'a' });
    s = reducer(s, { type: 'toggleCheck', day: TODAY, habitId: 'a' });
    expect(coinBalance(s)).toBe(150 + 20 + 25);
  });
  it('une mission se réclame une seule fois', () => {
    let s = withHabits(7);
    const m = missions(s, TODAY).find((x) => x.id === 'streak-7')!;
    s = reducer(s, { type: 'claim', mission: m });
    s = reducer(s, { type: 'claim', mission: m });
    expect(s.earnedFromMissions).toBe(80);
  });
  it('acheter un objet débite et équipe', () => {
    let s = withHabits(0);
    s = reducer(s, { type: 'buy', item: { id: 'ac-lantern', cat: 'Accessoires', n: 'Lanterne', price: 90 } });
    expect(coinBalance(s)).toBe(60);
    expect(s.eq.acc).toContain('ac-lantern');
    s = reducer(s, { type: 'buy', item: { id: 'ac-flowers', cat: 'Accessoires', n: 'Couronne', price: 140 } });
    expect(s.owned).not.toContain('ac-flowers');
  });
});
