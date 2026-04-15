import React, { useEffect, useMemo, useState } from 'react';
import type { AlimentoNutricional } from '../../api/plan';
import { GP_MACROGRUPOS, MACROCHIP_FILTERS, NUTRIENT_RANK_OPTIONS } from './constants';

const PAGE_SIZE = 10;

function num(a: AlimentoNutricional, field: string): number {
  const raw = a as any;
  const v = raw[field];
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  // Intenta la clave normalizada: _([a-z]) → mayúscula + capitaliza primer char
  const normalized = field
    .replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
    .replace(/^[a-z]/, (c) => c.toUpperCase());
  const v2 = raw[normalized];
  return typeof v2 === 'number' && !Number.isNaN(v2) ? v2 : 0;
}

function fidTag(emoji: string, label: string, valor: number, unidad: string, bg: string, color: string) {
  return (
    <div className="gp-fid-tag" style={{ background: bg, color }}>
      <span className="gp-fid-emoji">{emoji}</span>
      <div className="gp-fid-info">
        <div className="gp-fid-label">{label}</div>
        <div className="gp-fid-valor">
          {valor} <span className="gp-fid-unidad">{unidad}</span>
        </div>
      </div>
    </div>
  );
}

const ListaTab: React.FC<{ alimentos: AlimentoNutricional[]; loading: boolean }> = ({
  alimentos,
  loading,
}) => {
  const [filterCat, setFilterCat] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [rankField, setRankField] = useState('');
  const [appliedRankField, setAppliedRankField] = useState('');
  const [rankTop, setRankTop] = useState(15);
  const [groupPages, setGroupPages] = useState<Record<string, number>>({});

  // Resetear páginas cuando cambia el filtro o la búsqueda
  useEffect(() => {
    setGroupPages({});
  }, [filterCat, search]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return alimentos.filter((a) => {
      const mg = a.Macrogrupo || 'Sin clasificar';
      const mc = filterCat === 'all' || mg === filterCat;
      const ms = !q || a.Nombre.toLowerCase().includes(q);
      return mc && ms;
    });
  }, [alimentos, filterCat, search]);

  const grupos = useMemo(() => {
    const g: Record<string, AlimentoNutricional[]> = {};
    for (const a of filtered) {
      const key = a.Macrogrupo || 'Sin clasificar';
      if (!g[key]) g[key] = [];
      g[key].push(a);
    }
    return g;
  }, [filtered]);

  const rankList = useMemo(() => {
    if (!appliedRankField) return [];
    const sorted = [...alimentos]
      .map((a) => ({ a, v: num(a, appliedRankField) }))
      .filter((x) => x.v > 0)
      .sort((x, y) => y.v - x.v);
    return sorted.slice(0, Math.min(50, Math.max(5, rankTop)));
  }, [alimentos, appliedRankField, rankTop]);

  const abrirGrupos = filterCat !== 'all' || !!search.trim();

  return (
    <div className="gp-tab-panel gp-tab-panel--lista">
      <div className="gp-section-title">Lista de alimentos agrupados por macrogrupo</div>
      <p className="gp-section-sub">
        Explorá los alimentos con información nutricional por cada 100g (según datos del catálogo).
      </p>

      <div className="gp-nr-panel">
        <div className="gp-nr-header">📊 Alimentos más ricos en…</div>
        <div className="gp-nr-controls">
          <select
            className="gp-nr-select"
            value={rankField}
            onChange={(e) => {
              setRankField(e.target.value);
              setAppliedRankField('');
            }}
          >
            <option value="">Seleccioná un nutriente…</option>
            {['Macronutrientes', 'Minerales', 'Vitaminas', 'Ácidos grasos'].map((g) => (
              <optgroup key={g} label={g}>
                {NUTRIENT_RANK_OPTIONS.filter((o) => o.group === g).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="gp-nr-top-wrap">
            <label>Top</label>
            <input
              type="number"
              className="gp-nr-top-input"
              value={rankTop}
              min={5}
              max={50}
              onChange={(e) => setRankTop(Number(e.target.value) || 15)}
            />
          </div>
          <button
            type="button"
            className="gp-btn gp-btn-primary gp-nr-buscar-btn"
            disabled={!rankField}
            onClick={() => setAppliedRankField(rankField)}
          >
            Buscar
          </button>
        </div>
        {appliedRankField && rankList.length === 0 && (
          <div className="gp-nr-empty">Sin resultados para este nutriente.</div>
        )}
        {appliedRankField && rankList.length > 0 && (
          <div className="gp-nr-result">
            <ol className="gp-nr-list">
              {rankList.map(({ a, v }, i) => (
                <li key={a.Id_Alimento + '-' + i}>
                  <span className="gp-nr-name">{a.Nombre}</span>
                  <span className="gp-nr-val">{v.toFixed(2)}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <div className="gp-search-wrapper gp-search-wrapper--lista">
        <span className="gp-search-icon">🔍</span>
        <input
          type="text"
          className="gp-search-box"
          placeholder="Buscar alimento…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="gp-chips">
        {MACROCHIP_FILTERS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`gp-chip${filterCat === c.id ? ' active' : ''}`}
            onClick={() => setFilterCat(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="gp-loading-block">
          <div className="gp-spinner" />
          <p>Cargando alimentos…</p>
        </div>
      ) : alimentos.length === 0 ? (
        <div className="gp-empty-state">
          <p>No se pudo cargar el catálogo. Verificá el endpoint de alimentos o PlanNutricional/lista-alimentos.</p>
        </div>
      ) : (
        <div className="gp-food-groups-root">
          {Object.entries(grupos).map(([cat, items]) => {
            const info = GP_MACROGRUPOS[cat] || GP_MACROGRUPOS['Sin clasificar'];
            const page = groupPages[cat] ?? 0;
            const totalPages = Math.ceil(items.length / PAGE_SIZE);
            const pageItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
            const setPage = (p: number) => setGroupPages((prev) => ({ ...prev, [cat]: p }));

            return (
              <details key={cat} className={`gp-food-group${abrirGrupos ? ' open' : ''}`} open={abrirGrupos}>
                <summary className="gp-fg-header">
                  <div className="gp-fg-left">
                    <div className="gp-fg-icon" style={{ background: info.color }}>
                      {info.emoji}
                    </div>
                    <div>
                      <div className="gp-fg-title">{cat}</div>
                      <div className="gp-fg-count">{items.length} alimentos</div>
                    </div>
                  </div>
                  <span className="gp-fg-chevron">▾</span>
                </summary>
                <div className="gp-fg-body">
                  {pageItems.map((a) => (
                    <details key={a.Id_Alimento} className="gp-food-item">
                      <summary className="gp-food-item-header">
                        <span className="gp-food-item-name">{a.Nombre}</span>
                        <span className="gp-food-item-chevron">▾</span>
                      </summary>
                      <div className="gp-food-item-body gp-food-item-detail">
                        <div className="gp-fid-section-title">
                          Macronutrientes <span className="gp-fid-unit">por 100g</span>
                        </div>
                        <div className="gp-fid-macros">
                          {fidTag('⚡', 'Energía', num(a, 'Energia_kcal'), 'kcal', '#fff3cd', '#856404')}
                          {fidTag('💪', 'Proteína', num(a, 'Proteina_g'), 'g', '#d1e7dd', '#0f5132')}
                          {fidTag('🌾', 'Carbohidratos', num(a, 'Carbohidratos_g'), 'g', '#cfe2ff', '#084298')}
                          {fidTag('🥑', 'Grasas', num(a, 'Grasa_g'), 'g', '#f8d7da', '#842029')}
                          {fidTag('🌿', 'Fibra', num(a, 'Fibra_g'), 'g', '#d1e7dd', '#0a3622')}
                          {fidTag('🫀', 'Colesterol', num(a, 'Colesterol_mg'), 'mg', '#f8d7da', '#842029')}
                        </div>
                        <div className="gp-fid-section-title">Minerales</div>
                        <div className="gp-fid-macros">
                          {fidTag('🦴', 'Calcio', num(a, 'Calcio_mg'), 'mg', '#e8f4fd', '#0c4a6e')}
                          {fidTag('🔋', 'Fósforo', num(a, 'Fosforo_mg'), 'mg', '#e8f4fd', '#0c4a6e')}
                          {fidTag('🩸', 'Hierro', num(a, 'Hierro_mg'), 'mg', '#fce8e8', '#7f1d1d')}
                          {fidTag('⚗️', 'Potasio', num(a, 'Potasio_mg'), 'mg', '#fef5e7', '#78350f')}
                          {fidTag('🧲', 'Magnesio', num(a, 'Magnesio_mg'), 'mg', '#e6f5e6', '#14532d')}
                          {fidTag('🧂', 'Sodio', num(a, 'Sodio_mg'), 'mg', '#fef9c3', '#713f12')}
                          {fidTag('💎', 'Zinc', num(a, 'Zinc_mg'), 'mg', '#f0fdf4', '#14532d')}
                        </div>
                        <div className="gp-fid-section-title">Vitaminas</div>
                        <div className="gp-fid-macros">
                          {fidTag('🌞', 'Vit. C', num(a, 'Vit_C_mg'), 'mg', '#fff3cd', '#78350f')}
                          {fidTag('👁️', 'Vit. A', num(a, 'Vit_A_ug'), 'µg', '#fef5e7', '#92400e')}
                          {fidTag('🧬', 'Tiamina/B1', num(a, 'Tiamina_mg'), 'mg', '#fce8f0', '#831843')}
                          {fidTag('🔆', 'Riboflavina/B2', num(a, 'Riboflavina_mg'), 'mg', '#fdf4ff', '#6b21a8')}
                          {fidTag('⚙️', 'Niacina/B3', num(a, 'Niacina_mg'), 'mg', '#fff7ed', '#7c2d12')}
                          {fidTag('🔩', 'Vit. B6', num(a, 'Vit_B6_mg'), 'mg', '#f0e8fd', '#4c1d95')}
                          {fidTag('🔬', 'Vit. B12', num(a, 'Vit_B12_ug'), 'µg', '#e8f0fd', '#1e3a5f')}
                          {fidTag('🍃', 'Folato', num(a, 'Folato_ug'), 'µg', '#f0fdf4', '#065f46')}
                        </div>
                        <div className="gp-fid-section-title">Ácidos grasos</div>
                        <div className="gp-fid-macros">
                          {fidTag('🔴', 'Saturados', num(a, 'Ac_Grasos_Saturados_g'), 'g', '#fee2e2', '#991b1b')}
                          {fidTag('🟡', 'Monoinsaturados', num(a, 'Ac_Grasos_Monoinsaturados_g'), 'g', '#fefce8', '#854d0e')}
                          {fidTag('🟢', 'Poliinsaturados', num(a, 'Ac_Grasos_Poliinsaturados_g'), 'g', '#f0fdf4', '#166534')}
                        </div>
                      </div>
                    </details>
                  ))}

                  {totalPages > 1 && (
                    <div className="gp-fg-paginacion">
                      <button
                        type="button"
                        className="gp-fg-pag-btn"
                        disabled={page === 0}
                        onClick={() => setPage(page - 1)}
                      >
                        ← Anterior
                      </button>
                      <span className="gp-fg-pag-info">
                        {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, items.length)} de {items.length}
                      </span>
                      <button
                        type="button"
                        className="gp-fg-pag-btn"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(page + 1)}
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ListaTab;
