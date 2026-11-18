import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EMPTY_EQUIPMENT, coinBalance, currentStreak, levelFor, milestones, universe } from './logic';
import { zcompose } from './pixel/engine';
import { AppContext, PixelImg, useApp, type AppContextValue, type Tab } from './ui';
import { useAppState, useTick, useToday } from './store';
import { World } from './screens/World';
import { Habits } from './screens/Habits';
import { Shop } from './screens/Shop';
import { Missions } from './screens/Missions';

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'world', label: 'Monde', icon: 'M7 1h2v2h2v2h2v2h2v2h-2v6H9v-4H7v4H3V9H1V7h2V5h2V3h2z' },
  { id: 'habits', label: 'Habitudes', icon: 'M2 2h12v12H2zm2 2v8h8V4zm5 1h2v2h-1v1H9v1H8v1H7V9H6V8H5V7h2v1h1V7h1z' },
  { id: 'shop', label: 'Boutique', icon: 'M3 5h10v1h1v8H2V6h1zm2-3h6v3H9V4H7v1H5z' },
  { id: 'missions', label: 'Missions', icon: 'M7 1h2v4h4v2h-1v2h1v2h-2v3H5v-3H3V9h1V7H3V5h4z' },
];

export function App() {
  const [state, dispatch] = useAppState();
  const today = useToday();
  const tick = useTick();
  const [tab, setTab] = useState<Tab>(() => (state.habits.length ? 'world' : 'habits'));
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<number>();
  const mainRef = useRef<HTMLElement>(null);

  const realStreak = useMemo(() => currentStreak(state, today), [state, today]);
  const coins = useMemo(() => coinBalance(state), [state]);
  const streak = state.simStreak ?? realStreak;
  const level = levelFor(realStreak);

  const toast = useCallback((message: string) => {
    setToastMsg(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 1800);
  }, []);

  const go = useCallback((t: Tab) => {
    setTab(t);
    mainRef.current?.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    if (state.seenLevel === null || level < state.seenLevel) dispatch({ type: 'seeLevel', level });
  }, [level, state.seenLevel, dispatch]);

  const ctx: AppContextValue = { state, dispatch, today, streak, realStreak, coins, tick, toast, go };
  const celebrate = state.seenLevel !== null && level > state.seenLevel;

  return (
    <AppContext.Provider value={ctx}>
      <div className="app">
        <main ref={mainRef} className="screen">
          {tab === 'world' && <World />}
          {tab === 'habits' && <Habits />}
          {tab === 'shop' && <Shop />}
          {tab === 'missions' && <Missions />}
        </main>
        <div className={`toast ${toastMsg ? 'show' : ''}`} role="status" aria-live="polite">
          {toastMsg}
        </div>
        <nav className="tabbar" aria-label="Navigation principale">
          {TABS.map((t) => (
            <button key={t.id} type="button" className="tabbar-btn" aria-current={tab === t.id ? 'page' : undefined} onClick={() => go(t.id)}>
              <svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true" shapeRendering="crispEdges">
                <path fill="currentColor" fillRule="evenodd" d={t.icon} />
              </svg>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        {celebrate && (
          <Celebration
            level={level}
            onClose={() => {
              dispatch({ type: 'seeLevel', level });
              go('world');
            }}
          />
        )}
      </div>
    </AppContext.Provider>
  );
}

function Celebration({ level, onClose }: { level: number; onClose: () => void }) {
  const { state } = useApp();
  const uni = universe(state.uni);
  const m = milestones(uni.key)[level - 1];
  return (
    <div className="celebrate" role="dialog" aria-modal="true" aria-label="Nouveau palier">
      <div className="celebrate-card" style={{ borderColor: uni.acc }}>
        <span className="overline" style={{ color: uni.acc }}>
          Nouveau {m.kind.startsWith('Stade') ? 'stade' : 'palier'} · {m.day} j
        </span>
        <PixelImg src={zcompose(uni.key, m.stage, m.palier, EMPTY_EQUIPMENT, 0)} alt="" className="celebrate-img" />
        <h2>{m.name}</h2>
        <p className="muted">Ton monde vient d’évoluer. Continue sur ta lancée !</p>
        <button type="button" className="btn btn-gold" onClick={onClose} autoFocus>
          Voir mon monde
        </button>
      </div>
    </div>
  );
}
