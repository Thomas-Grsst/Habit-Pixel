import { createContext, useContext, useEffect, type Dispatch, type ReactNode } from 'react';
import { zcoin } from './pixel/engine';
import type { AppState } from './logic';
import type { Action } from './store';

export type Tab = 'world' | 'habits' | 'shop' | 'missions';

export interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
  today: string;
  streak: number;
  realStreak: number;
  coins: number;
  tick: number;
  toast: (message: string) => void;
  go: (tab: Tab) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé dans AppContext');
  return ctx;
}

export function PixelImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} className={`pixel ${className ?? ''}`} draggable={false} />;
}

export function CoinBadge({ coins }: { coins: number }) {
  return (
    <div className="coin-badge" aria-label={`${coins} pièces`}>
      <img src={zcoin()} alt="" aria-hidden="true" className="pixel coin-icon" />
      <span>{coins}</span>
    </div>
  );
}

export function ScreenHeader({ title, children }: { title: string; children?: ReactNode }) {
  const { coins } = useApp();
  return (
    <header className="screen-header">
      <h1>{title}</h1>
      <div className="screen-header-actions">
        {children}
        <CoinBadge coins={coins} />
      </div>
    </header>
  );
}

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="sheet-backdrop">
      <button type="button" className="sheet-dismiss" aria-label="Fermer" onClick={onClose} />
      <section className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-grip" aria-hidden="true" />
        <div className="sheet-head">
          <h2>{title}</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Fermer
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </section>
    </div>
  );
}

export function ProgressBar({ pct, color, label }: { pct: number; color: string; label: string }) {
  return (
    <div className="bar" role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
