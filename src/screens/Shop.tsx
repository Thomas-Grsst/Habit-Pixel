import { useState } from 'react';
import { ITEMS, zcompose } from '../pixel/engine';
import {
  categoryLabel,
  isEquipped,
  isOwned,
  MISSION_ITEM_LABEL,
  progression,
  shopCategories,
  universe,
  withItem,
} from '../logic';
import { PixelImg, ScreenHeader, useApp } from '../ui';

export function Shop() {
  const { state, dispatch, streak, coins, tick, toast, go } = useApp();
  const uni = universe(state.uni);
  const prog = progression(uni.key, streak);
  const cats = shopCategories(uni.key);
  const [tab, setTab] = useState('Accessoires');
  const current = cats.includes(tab) ? tab : cats[0];
  const items = ITEMS.filter((i) => i.cat === current);

  return (
    <>
      <ScreenHeader title="Boutique" />
      <div className="shop-preview">
        <PixelImg src={zcompose(uni.key, prog.stage, prog.palier, state.eq, tick)} alt="Aperçu de ton monde" />
      </div>
      <p className="muted small">{ITEMS.filter((i) => cats.includes(i.cat)).length} objets pour cet univers</p>
      <div className="tabs" role="tablist" aria-label="Catégories">
        {cats.map((c) => (
          <button key={c} type="button" role="tab" aria-selected={c === current} className="tab" onClick={() => setTab(c)}>
            {categoryLabel(c, uni.key)}
          </button>
        ))}
      </div>
      <div className="shop-grid">
        {items.map((it) => {
          const owned = isOwned(state, it.id);
          const eq = isEquipped(state.eq, it);
          const sub = it.price === 0 ? 'Gratuit' : owned ? 'Possédé' : it.price == null ? `Mission : ${MISSION_ITEM_LABEL[it.id] ?? it.mission}` : `${it.price} pièces`;
          let action;
          if (eq || owned) {
            action = (
              <button type="button" className={`btn btn-sm ${eq ? 'btn-acc' : 'btn-outline'}`} style={eq ? { background: uni.acc, borderColor: uni.acc } : undefined} onClick={() => dispatch({ type: 'toggleEquip', item: it })}>
                {eq ? 'Équipé ✓' : 'Équiper'}
              </button>
            );
          } else if (it.price == null) {
            action = (
              <button type="button" className="btn btn-sm btn-outline" onClick={() => go('missions')}>
                Voir la mission
              </button>
            );
          } else if (coins >= it.price) {
            action = (
              <button
                type="button"
                className="btn btn-sm btn-gold"
                onClick={() => {
                  dispatch({ type: 'buy', item: it });
                  toast(`${it.n} acheté et équipé`);
                }}
              >
                Acheter · {it.price}
              </button>
            );
          } else {
            action = (
              <button type="button" className="btn btn-sm btn-disabled" disabled>
                Manque {it.price - coins}
              </button>
            );
          }
          return (
            <div key={it.id} className="shop-item card" style={{ borderColor: eq ? uni.acc : undefined }}>
              <div className="shop-thumb">
                <PixelImg src={zcompose(uni.key, prog.stage, prog.palier, withItem(state.eq, it), 0)} alt="" />
              </div>
              <div className="shop-text">
                <span className="shop-name">{it.n}</span>
                <span className="muted xsmall">{sub}</span>
              </div>
              {action}
            </div>
          );
        })}
      </div>
    </>
  );
}
