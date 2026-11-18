import { itemById, missions, universe } from '../logic';
import { ProgressBar, ScreenHeader, useApp } from '../ui';

const TAG_COLORS: Record<string, string> = {
  Quotidienne: '#4ade80',
  Hebdo: '#7fd0f5',
  'Défi': '#f29bc8',
  'Série': '#b392f0',
  'Légende': '#f6cf57',
};

export function Missions() {
  const { state, dispatch, today, toast } = useApp();
  const acc = universe(state.uni).acc;
  const list = missions(state, today);
  const claimable = list.filter((m) => m.progress >= m.goal && !state.claimed.includes(m.claimKey)).length;

  return (
    <>
      <ScreenHeader title="Missions" />
      <p className="muted">
        {claimable} récompense{claimable > 1 ? 's' : ''} à réclamer
      </p>
      <ul className="mission-list">
        {list.map((m) => {
          const done = m.progress >= m.goal;
          const claimed = state.claimed.includes(m.claimKey);
          const reward = 'coins' in m.reward ? `+${m.reward.coins} pièces` : `Objet : ${itemById(m.reward.item).n}`;
          return (
            <li key={m.id} className="mission card" style={{ borderColor: done && !claimed ? '#5a4a1a' : undefined }}>
              <div className="mission-head">
                <span className="mission-tag" style={{ color: TAG_COLORS[m.tag] }}>
                  {m.tag}
                </span>
                <span className="mission-reward">{reward}</span>
              </div>
              <span className="mission-name">{m.name}</span>
              <div className="mission-prog">
                <ProgressBar pct={Math.round((m.progress / m.goal) * 100)} color={done ? '#f6cf57' : acc} label={m.name} />
                <span className="muted xsmall">
                  {m.progress}/{m.goal}
                </span>
              </div>
              {claimed ? (
                <button type="button" className="btn btn-sm btn-disabled" disabled>
                  Réclamé ✓
                </button>
              ) : done ? (
                <button
                  type="button"
                  className="btn btn-sm btn-gold"
                  onClick={() => {
                    dispatch({ type: 'claim', mission: m });
                    toast('coins' in m.reward ? `+${m.reward.coins} pièces !` : `Objet débloqué : ${itemById(m.reward.item).n}`);
                  }}
                >
                  Réclamer
                </button>
              ) : (
                <button type="button" className="btn btn-sm btn-disabled" disabled>
                  En cours
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <p className="muted small rules">
        +10 pièces par habitude validée, +25 pour une journée complète. Une journée complète (toutes tes habitudes) prolonge ta série et fait grandir ton monde.
      </p>
    </>
  );
}
