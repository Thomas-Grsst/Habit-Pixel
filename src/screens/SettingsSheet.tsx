import { useRef } from 'react';
import { initialState, UNIVERSES } from '../logic';
import { isValidState } from '../store';
import { Sheet, useApp } from '../ui';

export function SettingsSheet({ onClose }: { onClose: () => void }) {
  const { state, dispatch, realStreak, toast } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'habit-pixel-sauvegarde.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isValidState(parsed)) throw new Error('format');
      dispatch({ type: 'replace', state: { ...initialState(), ...parsed } });
      toast('Sauvegarde importée');
    } catch {
      toast('Fichier invalide');
    }
  };

  const reset = () => {
    if (window.confirm('Effacer toutes tes habitudes, pièces et objets ? Cette action est définitive.')) {
      dispatch({ type: 'replace', state: initialState() });
      toast('Données effacées');
      onClose();
    }
  };

  const simOn = state.simStreak !== null;

  return (
    <Sheet title="Réglages" onClose={onClose}>
      <div className="settings-block">
        <h3 className="overline">Univers</h3>
        <div className="chip-row">
          {UNIVERSES.map((u) => (
            <button
              key={u.key}
              type="button"
              className="chip"
              aria-pressed={state.uni === u.key}
              style={state.uni === u.key ? { background: u.acc, borderColor: u.acc, color: '#0d1117' } : undefined}
              onClick={() => dispatch({ type: 'setUniverse', key: u.key })}
            >
              {u.name.replace(' v2', '')}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-block">
        <h3 className="overline">Aperçu de la progression</h3>
        <label className="switch-row">
          <input
            type="checkbox"
            checked={simOn}
            onChange={(e) => dispatch({ type: 'setSimulation', streak: e.target.checked ? Math.max(realStreak, 100) : null })}
          />
          <span>Simuler une série pour voir l’évolution du monde</span>
        </label>
        {simOn && (
          <label className="range-row">
            <span className="sr-only">Série simulée</span>
            <input
              type="range"
              min={0}
              max={1000}
              value={state.simStreak ?? 0}
              onChange={(e) => dispatch({ type: 'setSimulation', streak: Number(e.target.value) })}
            />
            <span className="range-val">{state.simStreak} j</span>
          </label>
        )}
        <p className="muted small">La simulation ne change que l’affichage du monde. Ta vraie série ({realStreak} j), tes pièces et tes missions restent intactes.</p>
      </div>

      <div className="settings-block">
        <h3 className="overline">Données</h3>
        <p className="muted small">Tout est stocké sur cet appareil. Exporte une sauvegarde pour la transférer ailleurs.</p>
        <div className="two-col">
          <button type="button" className="btn btn-outline" onClick={exportData}>
            Exporter
          </button>
          <button type="button" className="btn btn-outline" onClick={() => fileRef.current?.click()}>
            Importer
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importData(f);
            e.target.value = '';
          }}
        />
        <button type="button" className="btn btn-danger" onClick={reset}>
          Tout effacer
        </button>
      </div>
    </Sheet>
  );
}
