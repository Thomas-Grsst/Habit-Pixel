import { ITEMS, zcompose } from '../pixel/engine';
import { categoryLabel, isEquipped, isOwned, progression, shopCategories, universe, withItem } from '../logic';
import { PixelImg, Sheet, useApp } from '../ui';

export function EquipSheet({ onClose }: { onClose: () => void }) {
  const { state, dispatch, streak, tick } = useApp();
  const uni = universe(state.uni);
  const prog = progression(uni.key, streak);
  const groups = shopCategories(uni.key)
    .map((cat) => ({ cat, items: ITEMS.filter((i) => i.cat === cat && isOwned(state, i.id)) }))
    .filter((g) => g.items.length);

  return (
    <Sheet title="Équipement" onClose={onClose}>
      <div className="equip-preview">
        <PixelImg src={zcompose(uni.key, prog.stage, prog.palier, state.eq, tick)} alt="Aperçu de ton monde" />
      </div>
      {groups.map((g) => (
        <div key={g.cat} className="equip-group">
          <h3 className="overline">{categoryLabel(g.cat, uni.key)}</h3>
          <div className="equip-grid">
            {g.items.map((it) => {
              const eq = isEquipped(state.eq, it);
              return (
                <button
                  key={it.id}
                  type="button"
                  className="equip-item"
                  aria-pressed={eq}
                  style={{ borderColor: eq ? uni.acc : undefined }}
                  onClick={() => dispatch({ type: 'toggleEquip', item: it })}
                >
                  <span className="equip-thumb">
                    <PixelImg src={zcompose(uni.key, prog.stage, prog.palier, withItem(state.eq, it), 0)} alt="" />
                  </span>
                  <span className="equip-name">{it.n}</span>
                  <span className="equip-state" style={{ color: eq ? uni.acc : undefined }}>
                    {eq ? 'Équipé ✓' : 'Équiper'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </Sheet>
  );
}
