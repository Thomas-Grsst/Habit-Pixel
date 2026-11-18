import { useState } from 'react';
import { LOCK, zcompose } from '../pixel/engine';
import { EMPTY_EQUIPMENT, milestones, progression, universe } from '../logic';
import { PixelImg, ProgressBar, ScreenHeader, useApp } from '../ui';
import { EquipSheet } from './EquipSheet';
import { SettingsSheet } from './SettingsSheet';

export function World() {
  const { state, streak, tick, go } = useApp();
  const [sheet, setSheet] = useState<'equip' | 'settings' | null>(null);
  const uni = universe(state.uni);
  const prog = progression(uni.key, streak);
  const img = zcompose(uni.key, prog.stage, prog.palier, state.eq, tick);
  const road = milestones(uni.key);
  const current = [...road].reverse().find((m) => m.day <= streak);

  return (
    <>
      <ScreenHeader title="Mon monde">
        <button type="button" className="icon-btn" aria-label="Réglages" onClick={() => setSheet('settings')}>
          <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" shapeRendering="crispEdges">
            <path fill="currentColor" d="M7 1h2v2h2v2h2v2h2v2h-2v2h-2v2H9v2H7v-2H5v-2H3V9H1V7h2V5h2V3h2zm0 5v4h2V6z" />
          </svg>
        </button>
      </ScreenHeader>

      {state.simStreak !== null && (
        <p className="sim-banner">
          Aperçu : série simulée à {state.simStreak} j.{' '}
          <button type="button" className="link-btn" onClick={() => setSheet('settings')}>
            Modifier
          </button>
        </p>
      )}

      <div className="world-stage" style={{ ['--acc' as string]: uni.acc }}>
        <PixelImg src={img} alt={`${uni.name} : ${prog.stageName}`} className="world-img" />
        <span className="rank">Niv. {prog.level}</span>
      </div>

      <div className="world-streak">
        <span className="big-num">{streak} jours</span>
        <span className="muted">
          {prog.stageName}
          {prog.palierName ? ` · ${prog.palierName}` : ''}
        </span>
      </div>

      <div className="card next-card">
        <div className="next-row">
          <span className="muted small">Prochaine surprise</span>
          <span className="next-in" style={{ color: uni.acc }}>
            {prog.next ? `dans ${prog.next.day - streak} j` : '1000 j atteints'}
          </span>
        </div>
        <ProgressBar pct={prog.nextPct} color={uni.acc} label="Progression vers la prochaine surprise" />
      </div>

      <div className="two-col">
        <button type="button" className="btn btn-gold" onClick={() => go('shop')}>
          Boutique
        </button>
        <button type="button" className="btn btn-outline" onClick={() => setSheet('equip')}>
          Équipement
        </button>
      </div>

      <section className="roadmap" aria-label="Feuille de route">
        <h2 className="section-title">Feuille de route</h2>
        <p className="muted small">7 stades jusqu’à 100 j, puis un palier de légende tous les 60 j. Les étapes futures restent cachées.</p>
        <ol className="road-grid">
          {road.map((m) => {
            const unlocked = m.day <= streak;
            const isCurrent = current?.day === m.day;
            return (
              <li key={m.day} className="road-tile" style={{ borderColor: isCurrent ? uni.acc : undefined }}>
                <div className="road-img">
                  <PixelImg src={unlocked ? zcompose(uni.key, m.stage, m.palier, EMPTY_EQUIPMENT, 0) : LOCK()} alt="" />
                </div>
                <span className="road-day" style={{ color: unlocked ? uni.acc : undefined }}>
                  {m.day} j
                </span>
                <span className="road-name">{unlocked ? m.name : '???'}</span>
                <span className="road-kind">{unlocked ? m.kind : 'Verrouillé'}</span>
              </li>
            );
          })}
        </ol>
      </section>

      {sheet === 'equip' && <EquipSheet onClose={() => setSheet(null)} />}
      {sheet === 'settings' && <SettingsSheet onClose={() => setSheet(null)} />}
    </>
  );
}
