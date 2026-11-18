import { useEffect, useReducer, useState } from 'react';
import type { ShopItem } from './pixel/engine';
import {
  coinBalance,
  dateKey,
  initialState,
  isEquipped,
  toggleItem,
  type AppState,
  type Habit,
  type Mission,
} from './logic';

const STORAGE_KEY = 'habit-pixel:v1';

export type Action =
  | { type: 'toggleCheck'; day: string; habitId: string }
  | { type: 'addHabits'; habits: Array<Pick<Habit, 'name' | 'color'>>; day: string }
  | { type: 'updateHabit'; id: string; name: string; color: string }
  | { type: 'deleteHabit'; id: string }
  | { type: 'buy'; item: ShopItem }
  | { type: 'toggleEquip'; item: ShopItem }
  | { type: 'claim'; mission: Mission }
  | { type: 'setUniverse'; key: string }
  | { type: 'setSimulation'; streak: number | null }
  | { type: 'seeLevel'; level: number }
  | { type: 'replace'; state: AppState };

const newId = () => Math.random().toString(36).slice(2, 10);

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'toggleCheck': {
      const done = state.log[action.day] ?? [];
      const next = done.includes(action.habitId) ? done.filter((id) => id !== action.habitId) : [...done, action.habitId];
      const log = { ...state.log };
      if (next.length) log[action.day] = next;
      else delete log[action.day];
      return { ...state, log };
    }
    case 'addHabits':
      return {
        ...state,
        habits: [...state.habits, ...action.habits.map((h) => ({ ...h, id: newId(), createdAt: action.day }))],
      };
    case 'updateHabit':
      return {
        ...state,
        habits: state.habits.map((h) => (h.id === action.id ? { ...h, name: action.name, color: action.color } : h)),
      };
    case 'deleteHabit': {
      const log: Record<string, string[]> = {};
      for (const [day, ids] of Object.entries(state.log)) {
        const kept = ids.filter((id) => id !== action.id);
        if (kept.length) log[day] = kept;
      }
      return { ...state, habits: state.habits.filter((h) => h.id !== action.id), log };
    }
    case 'buy': {
      const price = action.item.price;
      if (price == null || state.owned.includes(action.item.id) || coinBalance(state) < price) return state;
      const owned = [...state.owned, action.item.id];
      const eq = isEquipped(state.eq, action.item) ? state.eq : toggleItem(state.eq, action.item);
      return { ...state, owned, spent: state.spent + price, eq };
    }
    case 'toggleEquip':
      return { ...state, eq: toggleItem(state.eq, action.item) };
    case 'claim': {
      const m = action.mission;
      if (state.claimed.includes(m.claimKey) || m.progress < m.goal) return state;
      const claimed = [...state.claimed, m.claimKey];
      if ('coins' in m.reward) return { ...state, claimed, earnedFromMissions: state.earnedFromMissions + m.reward.coins };
      const item = m.reward.item;
      return { ...state, claimed, owned: state.owned.includes(item) ? state.owned : [...state.owned, item] };
    }
    case 'setUniverse':
      return { ...state, uni: action.key };
    case 'setSimulation':
      return { ...state, simStreak: action.streak };
    case 'seeLevel':
      return { ...state, seenLevel: action.level };
    case 'replace':
      return action.state;
  }
}

export function isValidState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false;
  const s = value as Partial<AppState>;
  return s.v === 1 && Array.isArray(s.habits) && typeof s.log === 'object' && Array.isArray(s.owned) && typeof s.eq === 'object';
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isValidState(parsed)) return { ...initialState(), ...parsed };
    }
  } catch {
    // stockage indisponible (navigation privée) : on repart d'un état vierge
  }
  return initialState();
}

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignoré : l'app reste utilisable sans persistance
    }
  }, [state]);
  return [state, dispatch] as const;
}

export function useToday(): string {
  const [today, setToday] = useState(() => dateKey(new Date()));
  useEffect(() => {
    const refresh = () => setToday(dateKey(new Date()));
    const timer = setInterval(refresh, 60_000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  return today;
}

export function useTick(ms = 150): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), ms);
    return () => clearInterval(timer);
  }, [ms]);
  return tick;
}
