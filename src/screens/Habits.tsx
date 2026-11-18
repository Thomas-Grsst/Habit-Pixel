import { useState } from 'react';
import {
  activeHabits,
  addDays,
  bestStreak,
  HABIT_COLORS,
  habitStreak,
  isFullDay,
  parseKey,
  SUGGESTIONS,
  weekStart,
  type Habit,
} from '../logic';
import { ScreenHeader, Sheet, useApp } from '../ui';

const DAY_LETTERS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const WEEKS = 16;

function formatDay(key: string, today: string): string {
  if (key === today) return 'Aujourd’hui';
  if (key === addDays(today, -1)) return 'Hier';
  return parseKey(key).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function Habits() {
  const { state, dispatch, today, realStreak } = useApp();
  const [day, setDay] = useState(today);
  const [editing, setEditing] = useState<Habit | 'new' | null>(null);
  const selected = day > today ? today : day;
  const active = activeHabits(state, selected);
  const done = new Set(state.log[selected] ?? []);
  const doneCount = active.filter((h) => done.has(h.id)).length;
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

  return (
    <>
      <ScreenHeader title="Habitudes" />

      <div className="stats-row">
        <div className="stat card">
          <span className="stat-num">{realStreak} j</span>
          <span className="muted small">Série en cours</span>
        </div>
        <div className="stat card">
          <span className="stat-num">{bestStreak(state)} j</span>
          <span className="muted small">Record</span>
        </div>
        <div className="stat card">
          <span className="stat-num">
            {doneCount}/{active.length}
          </span>
          <span className="muted small">{selected === today ? 'Aujourd’hui' : 'Ce jour-là'}</span>
        </div>
      </div>

      <div className="week-strip" role="group" aria-label="Choisir le jour">
        {week.map((d) => {
          const full = isFullDay(state, d);
          return (
            <button
              key={d}
              type="button"
              className="week-day"
              aria-pressed={d === selected}
              aria-label={`${formatDay(d, today)}${full ? ', journée complète' : ''}`}
              onClick={() => setDay(d)}
            >
              <span className="week-letter">{DAY_LETTERS[parseKey(d).getDay()]}</span>
              <span className="week-num">{parseKey(d).getDate()}</span>
              <span className={`week-dot ${full ? 'on' : ''}`} aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <h2 className="section-title day-title">{formatDay(selected, today)}</h2>

      {state.habits.length === 0 ? (
        <div className="card empty">
          <p>Chaque journée où tu valides toutes tes habitudes fait grandir ton monde.</p>
          <button
            type="button"
            className="btn btn-gold"
            onClick={() => dispatch({ type: 'addHabits', habits: SUGGESTIONS, day: today })}
          >
            Commencer avec 5 habitudes suggérées
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setEditing('new')}>
            Créer ma propre habitude
          </button>
        </div>
      ) : (
        <ul className="habit-list">
          {active.length === 0 && <li className="muted small">Aucune habitude n’existait encore ce jour-là.</li>}
          {active.map((h) => {
            const checked = done.has(h.id);
            const run = habitStreak(state, h.id, today);
            return (
              <li key={h.id} className="habit card" style={{ borderColor: checked ? h.color : undefined }}>
                <button
                  type="button"
                  className="habit-check"
                  role="checkbox"
                  aria-checked={checked}
                  aria-label={h.name}
                  style={{ borderColor: h.color, background: checked ? h.color : 'transparent' }}
                  onClick={() => dispatch({ type: 'toggleCheck', day: selected, habitId: h.id })}
                >
                  {checked && (
                    <svg viewBox="0 0 8 8" width="16" height="16" aria-hidden="true" shapeRendering="crispEdges">
                      <path fill="#0d1117" d="M6 1h1v1h1v1H7v1H6v1H5v1H4v1H3V6H2V5H1V4h1v1h1v1h1V5h1V4h1V3h1V2H6z" />
                    </svg>
                  )}
                </button>
                <div className="habit-text">
                  <span className="habit-name">{h.name}</span>
                  <span className="muted small">{run > 0 ? `${run} j d’affilée` : checked ? 'Validée' : 'À faire'}</span>
                </div>
                <button type="button" className="icon-btn" aria-label={`Modifier ${h.name}`} onClick={() => setEditing(h)}>
                  <svg viewBox="0 0 12 12" width="16" height="16" aria-hidden="true" shapeRendering="crispEdges">
                    <path fill="currentColor" d="M1 5h2v2H1zm4 0h2v2H5zm4 0h2v2H9z" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {state.habits.length > 0 && (
        <button type="button" className="btn btn-outline add-btn" onClick={() => setEditing('new')}>
          + Nouvelle habitude
        </button>
      )}

      {state.habits.length > 0 && <Heatmap />}

      {editing && <HabitSheet habit={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function Heatmap() {
  const { state, today } = useApp();
  const start = addDays(weekStart(today), -(WEEKS - 1) * 7);
  const levels = ['#1a212b', '#1f5a34', '#2f9a52', '#4ade80'];
  const cells = Array.from({ length: WEEKS * 7 }, (_, i) => {
    const week = Math.floor(i / 7);
    const dow = i % 7;
    const d = addDays(start, week * 7 + dow);
    if (d > today) return { d, color: 'transparent', title: '' };
    const active = activeHabits(state, d);
    const count = (state.log[d] ?? []).filter((id) => active.some((h) => h.id === id)).length;
    const ratio = active.length ? count / active.length : 0;
    const lv = ratio === 0 ? 0 : ratio < 0.5 ? 1 : ratio < 1 ? 2 : 3;
    return { d, color: levels[lv], title: `${parseKey(d).toLocaleDateString('fr-FR')} : ${count}/${active.length}` };
  });
  return (
    <section className="card heatmap-card" aria-label="Historique des 16 dernières semaines">
      <h2 className="section-title">Historique</h2>
      <div className="heatmap" style={{ gridTemplateColumns: `repeat(${WEEKS}, 1fr)` }}>
        {cells.map((c) => (
          <span key={c.d} className="heat-cell" title={c.title} style={{ background: c.color }} />
        ))}
      </div>
      <div className="heat-legend muted small">
        <span>Aucune</span>
        {levels.map((c) => (
          <span key={c} className="heat-cell" style={{ background: c }} aria-hidden="true" />
        ))}
        <span>Toutes</span>
      </div>
    </section>
  );
}

function HabitSheet({ habit, onClose }: { habit: Habit | null; onClose: () => void }) {
  const { dispatch, today } = useApp();
  const [name, setName] = useState(habit?.name ?? '');
  const [color, setColor] = useState(habit?.color ?? HABIT_COLORS[0]);
  const valid = name.trim().length > 0;

  const save = () => {
    if (!valid) return;
    if (habit) dispatch({ type: 'updateHabit', id: habit.id, name: name.trim(), color });
    else dispatch({ type: 'addHabits', habits: [{ name: name.trim(), color }], day: today });
    onClose();
  };

  const remove = () => {
    if (habit && window.confirm(`Supprimer « ${habit.name} » et son historique ?`)) {
      dispatch({ type: 'deleteHabit', id: habit.id });
      onClose();
    }
  };

  return (
    <Sheet title={habit ? 'Modifier l’habitude' : 'Nouvelle habitude'} onClose={onClose}>
      <form
        className="habit-form"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label className="field">
          <span className="overline">Nom</span>
          <input autoFocus value={name} maxLength={40} placeholder="Ex. Marcher 30 min" onChange={(e) => setName(e.target.value)} />
        </label>
        <fieldset className="field">
          <legend className="overline">Couleur</legend>
          <div className="color-row">
            {HABIT_COLORS.map((c) => (
              <label key={c} className="color-swatch" style={{ background: c, outlineColor: color === c ? '#e8ecef' : 'transparent' }}>
                <input type="radio" name="color" value={c} checked={color === c} onChange={() => setColor(c)} className="sr-only" />
                <span className="sr-only">Couleur {c}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="btn btn-gold" disabled={!valid}>
          {habit ? 'Enregistrer' : 'Ajouter'}
        </button>
        {habit && (
          <button type="button" className="btn btn-danger" onClick={remove}>
            Supprimer
          </button>
        )}
      </form>
    </Sheet>
  );
}
