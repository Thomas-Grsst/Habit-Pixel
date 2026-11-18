import { COMBO, DAYS, EVOS, ITEMS, LEG, LN, type Equipment, type ShopItem, type Universe } from './pixel/engine';

export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface AppState {
  v: 1;
  habits: Habit[];
  log: Record<string, string[]>;
  spent: number;
  earnedFromMissions: number;
  owned: string[];
  eq: Equipment;
  claimed: string[];
  uni: string;
  simStreak: number | null;
  seenLevel: number | null;
}

export const START_COINS = 150;
export const COINS_PER_CHECK = 10;
export const COINS_PER_FULL_DAY = 25;

export const HABIT_COLORS = ['#6fd0e8', '#ef8a3c', '#f6cf57', '#a97ce0', '#f29bb8', '#62d06a'];

export const SUGGESTIONS: Array<Pick<Habit, 'name' | 'color'>> = [
  { name: 'Boire 2L d’eau', color: '#6fd0e8' },
  { name: 'Sport 20 min', color: '#ef8a3c' },
  { name: 'Lire 15 pages', color: '#f6cf57' },
  { name: 'Méditer 10 min', color: '#a97ce0' },
  { name: 'Couché avant 23h', color: '#f29bb8' },
];

export const UNIVERSES: Universe[] = [COMBO, ...EVOS];

export const EMPTY_EQUIPMENT: Equipment = { skin: null, leaf: null, ground: null, bg: null, acc: [], pet: null };

export function initialState(): AppState {
  return {
    v: 1,
    habits: [],
    log: {},
    spent: 0,
    earnedFromMissions: 0,
    owned: [],
    eq: { ...EMPTY_EQUIPMENT, acc: [] },
    claimed: [],
    uni: 'combo',
    simStreak: null,
    seenLevel: null,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const d = parseKey(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

export function weekStart(key: string): string {
  const d = parseKey(key);
  const offset = (d.getDay() + 6) % 7;
  return addDays(key, -offset);
}

export function activeHabits(state: AppState, day: string): Habit[] {
  return state.habits.filter((h) => h.createdAt <= day);
}

export function doneOn(state: AppState, day: string): string[] {
  const ids = new Set(state.habits.map((h) => h.id));
  return (state.log[day] ?? []).filter((id) => ids.has(id));
}

export function isFullDay(state: AppState, day: string): boolean {
  const active = activeHabits(state, day);
  if (active.length === 0) return false;
  const done = new Set(state.log[day] ?? []);
  return active.every((h) => done.has(h.id));
}

function earliestHabitDay(state: AppState): string | null {
  return state.habits.reduce<string | null>((min, h) => (min === null || h.createdAt < min ? h.createdAt : min), null);
}

export function currentStreak(state: AppState, today: string): number {
  const first = earliestHabitDay(state);
  if (!first) return 0;
  let day = isFullDay(state, today) ? today : addDays(today, -1);
  let count = 0;
  while (day >= first && isFullDay(state, day)) {
    count++;
    day = addDays(day, -1);
  }
  return count;
}

export function habitStreak(state: AppState, habitId: string, today: string): number {
  const has = (day: string) => (state.log[day] ?? []).includes(habitId);
  let day = has(today) ? today : addDays(today, -1);
  let count = 0;
  while (has(day)) {
    count++;
    day = addDays(day, -1);
  }
  return count;
}

export function habitTotal(state: AppState, habitId: string): number {
  return Object.values(state.log).filter((ids) => ids.includes(habitId)).length;
}

export function bestStreak(state: AppState): number {
  const days = Object.keys(state.log).sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of days) {
    if (!isFullDay(state, day)) {
      run = 0;
      prev = null;
      continue;
    }
    run = prev !== null && addDays(prev, 1) === day ? run + 1 : 1;
    prev = day;
    best = Math.max(best, run);
  }
  return best;
}

export function coinBalance(state: AppState): number {
  let earned = START_COINS + state.earnedFromMissions;
  for (const day of Object.keys(state.log)) {
    earned += doneOn(state, day).length * COINS_PER_CHECK;
    if (isFullDay(state, day)) earned += COINS_PER_FULL_DAY;
  }
  return Math.max(0, earned - state.spent);
}

export interface Progression {
  stage: number;
  palier: number;
  level: number;
  stageName: string;
  palierName: string | null;
  next: { day: number; name: string; kind: string } | null;
  nextPct: number;
}

export interface Milestone {
  day: number;
  name: string;
  kind: string;
  stage: number;
  palier: number;
}

export function milestones(uniKey: string): Milestone[] {
  const uni = universe(uniKey);
  return [
    ...DAYS.map((day, i) => ({ day, name: uni.st[i], kind: `Stade ${i + 1}`, stage: i, palier: 0 })),
    ...LEG.map((day, i) => ({ day, name: LN(uni.key, i), kind: `Palier ${i + 1}`, stage: 6, palier: i + 1 })),
  ];
}

export function universe(key: string): Universe {
  return UNIVERSES.find((u) => u.key === key) ?? COMBO;
}

export function levelFor(streak: number): number {
  const stage = DAYS.filter((d) => d <= streak).length - 1;
  const palier = LEG.filter((d) => d <= streak).length;
  return stage + 1 + palier;
}

export function progression(uniKey: string, streak: number): Progression {
  const uni = universe(uniKey);
  const stage = DAYS.filter((d) => d <= streak).length - 1;
  const palier = LEG.filter((d) => d <= streak).length;
  const all = milestones(uniKey);
  const next = all.find((m) => m.day > streak) ?? null;
  const prev = [...all].reverse().find((m) => m.day <= streak)!;
  return {
    stage,
    palier,
    level: stage + 1 + palier,
    stageName: uni.st[stage],
    palierName: palier ? LN(uni.key, palier - 1) : null,
    next: next ? { day: next.day, name: next.name, kind: next.kind } : null,
    nextPct: next ? Math.round(((streak - prev.day) / (next.day - prev.day)) * 100) : 100,
  };
}

export type Reward = { coins: number } | { item: string };

export interface Mission {
  id: string;
  claimKey: string;
  tag: 'Quotidienne' | 'Hebdo' | 'Défi' | 'Série' | 'Légende';
  name: string;
  goal: number;
  progress: number;
  reward: Reward;
}

export function missions(state: AppState, today: string): Mission[] {
  const streak = currentStreak(state, today);
  const week = weekStart(today);
  const activeToday = activeHabits(state, today);
  const doneToday = new Set(state.log[today] ?? []);
  const bestHabitRun = Math.max(0, ...state.habits.map((h) => habitStreak(state, h.id, today)));
  const bestHabitTotal = Math.max(0, ...state.habits.map((h) => habitTotal(state, h.id)));
  let perfectDays = 0;
  for (let i = 0; i < 7; i++) {
    const day = addDays(week, i);
    if (day <= today && isFullDay(state, day)) perfectDays++;
  }

  const once = (id: string) => id;
  const list: Mission[] = [
    {
      id: 'daily-all',
      claimKey: `daily-all:${today}`,
      tag: 'Quotidienne',
      name: 'Valider toutes tes habitudes aujourd’hui',
      goal: Math.max(1, activeToday.length),
      progress: activeToday.filter((h) => doneToday.has(h.id)).length,
      reward: { coins: 60 },
    },
    {
      id: 'weekly-run',
      claimKey: `weekly-run:${week}`,
      tag: 'Hebdo',
      name: 'Tenir une habitude 7 jours de suite',
      goal: 7,
      progress: bestHabitRun,
      reward: { coins: 100 },
    },
    {
      id: 'weekly-perfect',
      claimKey: `weekly-perfect:${week}`,
      tag: 'Hebdo',
      name: 'Semaine parfaite (7 jours sur 7)',
      goal: 7,
      progress: perfectDays,
      reward: { coins: 250 },
    },
    {
      id: 'challenge-30',
      claimKey: once('challenge-30'),
      tag: 'Défi',
      name: 'Valider une même habitude 30 fois',
      goal: 30,
      progress: bestHabitTotal,
      reward: { item: 'ac-rainbow' },
    },
    { id: 'streak-7', claimKey: once('streak-7'), tag: 'Série', name: 'Atteindre 7 jours de série', goal: 7, progress: streak, reward: { coins: 80 } },
    { id: 'streak-30', claimKey: once('streak-30'), tag: 'Série', name: 'Atteindre 30 jours de série', goal: 30, progress: streak, reward: { coins: 150 } },
    { id: 'streak-100', claimKey: once('streak-100'), tag: 'Série', name: 'Atteindre 100 jours de série', goal: 100, progress: streak, reward: { coins: 400 } },
    { id: 'streak-365', claimKey: once('streak-365'), tag: 'Légende', name: 'Atteindre 365 jours de série', goal: 365, progress: streak, reward: { item: 'sk-or' } },
    { id: 'streak-1000', claimKey: once('streak-1000'), tag: 'Légende', name: 'Atteindre 1000 jours de série', goal: 1000, progress: streak, reward: { coins: 2000 } },
  ];
  return list.map((m) => ({ ...m, progress: Math.min(m.goal, m.progress) }));
}

export const MISSION_ITEM_LABEL: Record<string, string> = {
  'ac-rainbow': '30× une habitude',
  'sk-or': '365 j de série',
};

export const NEUTRAL_ITEMS = ['sk-orig', 'bg-none', 'lf-orig', 'gr-orig'];
const SLOT: Record<string, keyof Omit<Equipment, 'acc'>> = { Teintes: 'skin', Fonds: 'bg', Arbre: 'leaf', 'Île': 'ground', Compagnons: 'pet' };

export function shopCategories(uniKey: string): string[] {
  return [
    'Teintes',
    ...(['combo', 'tree'].includes(uniKey) ? ['Arbre'] : []),
    ...(['combo', 'island'].includes(uniKey) ? ['Île'] : []),
    'Fonds',
    'Accessoires',
    'Compagnons',
  ];
}

export function categoryLabel(cat: string, uniKey: string): string {
  return cat === 'Teintes' && ['combo', 'blob'].includes(uniKey) ? 'Momo' : cat;
}

export function itemById(id: string): ShopItem {
  const it = ITEMS.find((i) => i.id === id);
  if (!it) throw new Error(`Objet inconnu : ${id}`);
  return it;
}

export function isOwned(state: AppState, id: string): boolean {
  return NEUTRAL_ITEMS.includes(id) || state.owned.includes(id);
}

export function isEquipped(eq: Equipment, item: ShopItem): boolean {
  if (item.cat === 'Accessoires') return eq.acc.includes(item.id);
  const current = eq[SLOT[item.cat]] ?? null;
  return current === (NEUTRAL_ITEMS.includes(item.id) ? null : item.id);
}

export function withItem(eq: Equipment, item: ShopItem): Equipment {
  const next: Equipment = { ...eq, acc: eq.acc.slice() };
  if (item.cat === 'Accessoires') {
    if (!next.acc.includes(item.id)) next.acc.push(item.id);
  } else {
    next[SLOT[item.cat]] = NEUTRAL_ITEMS.includes(item.id) ? null : item.id;
  }
  return next;
}

export function toggleItem(eq: Equipment, item: ShopItem): Equipment {
  const next: Equipment = { ...eq, acc: eq.acc.slice() };
  if (item.cat === 'Accessoires') {
    next.acc = eq.acc.includes(item.id) ? eq.acc.filter((x) => x !== item.id) : [...eq.acc, item.id];
  } else {
    const slot = SLOT[item.cat];
    next[slot] = NEUTRAL_ITEMS.includes(item.id) || eq[slot] === item.id ? null : item.id;
  }
  return next;
}
