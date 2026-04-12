import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  generarPlan,
  generarPlanConFiltro,
  cambiarAlimentoPlan,
  enviarPlanesMultiplesCorreo,
  parseSpliterResponse,
  type AlimentoNutricional,
  type PlanNutricionalResponse,
} from '../../api/plan';
import { fetchDespensaIds, despensaLocalGet, despensaLocalSet, saveDespensaIds } from '../../api/despensa';
import { getUltimaDistribucionPorTiempo, type TiempoComidaKey } from '../../api/distribucionPlan';
import { getAlimentos } from '../../api/alimentos';
import {
  aplicarOptimizar,
  applyPorcionDisplay,
  buildItemFromCatalogo,
  computeTotales,
  displayPorcion,
  fromApiAlimento,
  mergeCambioAlimento,
  previewOptimizar,
  type PlanItemEdit,
  type MacrosMeta,
  type SugerenciaAlimento,
} from './planLogic';
import { GP_MACROGRUPOS, TIEMPOS_COMIDA } from './constants';

const GP_MACRO_KEYS = Object.keys(GP_MACROGRUPOS).filter((k) => k !== 'Sin clasificar');

function barColor(dev: number, type: 'macro' | 'grasa' | 'kcal') {
  if (type === 'kcal') return dev <= 10 ? '#4e9a42' : '#d9534f';
  if (type === 'grasa') return dev <= 20 ? '#4e9a42' : dev <= 35 ? '#f59e0b' : '#d9534f';
  return dev <= 10 ? '#4e9a42' : dev <= 20 ? '#f59e0b' : '#d9534f';
}

const MacroBar: React.FC<{
  label: string;
  val: number;
  meta: number;
  unit?: string;
  type?: 'macro' | 'grasa' | 'kcal';
}> = ({ label, val, meta, unit = 'g', type = 'macro' }) => {
  const rawPct = meta > 0 ? (val / meta) * 100 : 0;
  const dev = Math.abs(rawPct - 100);
  const color = barColor(dev, type);
  const lbl = meta > 0 ? `${rawPct.toFixed(1)}%` : '—';
  return (
    <div className="gp-bar-row">
      <div className="gp-bar-label">
        <span className="gp-bar-name">{label}</span>
        <span>
          <span style={{ color: '#64748b' }}>
            {val}
            {unit} / {meta}
            {unit}
          </span>{' '}
          <span className="gp-bar-pct" style={{ color }}>
            {lbl}
          </span>
        </span>
      </div>
      <div className="gp-bar-track">
        <div className="gp-bar-fill" style={{ width: `${Math.min(rawPct, 100)}%`, background: color }} />
      </div>
    </div>
  );
};

export interface PlanAcumulado {
  tiempo: TiempoComidaKey;
  items: PlanItemEdit[];
  totales: ReturnType<typeof computeTotales>;
  metas: MacrosMeta;
}

interface PlannerTabProps {
  idUsuario: number;
  catalogo: AlimentoNutricional[];
  onPlanConfirmado: (p: { tiempo: TiempoComidaKey; items: PlanItemEdit[]; totales: ReturnType<typeof computeTotales>; metas: MacrosMeta }) => void;
  onPlanesParaIA: (planes: PlanAcumulado[]) => void;
  toast: (msg: string) => void;
}

const PlannerTab: React.FC<PlannerTabProps> = ({ idUsuario, catalogo, onPlanConfirmado, onPlanesParaIA, toast }) => {
  const [pantryOn, setPantryOn] = useState(false);
  const [despensaIds, setDespensaIds] = useState<Set<number>>(new Set());
  const [despensaAlimentos, setDespensaAlimentos] = useState<AlimentoNutricional[]>([]);
  const [despensaSearch, setDespensaSearch] = useState('');
  const [despensaLoading, setDespensaLoading] = useState(false);

  const [selectedMeal, setSelectedMeal] = useState<TiempoComidaKey | null>(null);
  const [macros, setMacros] = useState<MacrosMeta>({ carb: 0, prot: 0, grasa: 0, fibra: 0 });
  const [esVegano, setEsVegano] = useState(false);
  const [metaKcalDistrib, setMetaKcalDistrib] = useState(0);

  const [items, setItems] = useState<PlanItemEdit[]>([]);
  const [totales, setTotales] = useState(computeTotales([]));
  const [metasAct, setMetasAct] = useState<MacrosMeta>({ carb: 0, prot: 0, grasa: 0, fibra: 0 });
  const [estadoItem, setEstadoItem] = useState<Record<string, 'confirmed' | 'to-change' | null>>({});
  const [panelCambio, setPanelCambio] = useState<Record<string, string | null>>({});
  const [loadingCambio, setLoadingCambio] = useState<Record<string, boolean>>({});

  const [acumulados, setAcumulados] = useState<PlanAcumulado[]>([]);
  const [mealDone, setMealDone] = useState<Record<string, boolean>>({});

  const [showOptimize, setShowOptimize] = useState(false);
  const [optPreview, setOptPreview] = useState<ReturnType<typeof previewOptimizar> | null>(null);
  const [nextMealOpen, setNextMealOpen] = useState(false);
  const [showIAPrompt, setShowIAPrompt] = useState(false);
  const [planesEnviados, setPlanesEnviados] = useState<PlanAcumulado[]>([]);

  const [addOpen, setAddOpen] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [addCategoryFilter, setAddCategoryFilter] = useState('');
  const [addSel, setAddSel] = useState<{ al: AlimentoNutricional; porcion: number } | null>(null);

  const catalogoById = useMemo(() => {
    const m = new Map<number, AlimentoNutricional>();
    for (const a of catalogo) m.set(a.Id_Alimento, a);
    return m;
  }, [catalogo]);

  const catalogoAddAgrupado = useMemo(() => {
    const filtrado = catalogo
      .filter((x) => !items.some((i) => i.id_bd === x.Id_Alimento))
      .filter((x) => !addCategoryFilter || (x.Macrogrupo || x.Categoria) === addCategoryFilter)
      .filter((x) => !addSearch.trim() || x.Nombre.toLowerCase().includes(addSearch.trim().toLowerCase()));
    const grupos: Record<string, AlimentoNutricional[]> = {};
    for (const a of filtrado) {
      const key = a.Macrogrupo || a.Categoria || 'Sin clasificar';
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(a);
    }
    return grupos;
  }, [catalogo, items, addCategoryFilter, addSearch]);

  const loadDespensaPanel = useCallback(async () => {
    setDespensaLoading(true);
    try {
      const [all, srv] = await Promise.all([getAlimentos(), fetchDespensaIds(idUsuario)]);
      const base = (all as AlimentoNutricional[]).length ? (all as AlimentoNutricional[]) : catalogo;
      setDespensaAlimentos(base);
      const ids = srv ?? despensaLocalGet(idUsuario);
      setDespensaIds(new Set(ids));
    } catch {
      setDespensaAlimentos(catalogo);
      setDespensaIds(new Set(despensaLocalGet(idUsuario)));
    } finally {
      setDespensaLoading(false);
    }
  }, [idUsuario, catalogo]);

  useEffect(() => {
    if (pantryOn) loadDespensaPanel();
  }, [pantryOn, loadDespensaPanel]);

  const toggleDespensa = (id: number) => {
    setDespensaIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const despensaGrupos = useMemo(() => {
    const q = despensaSearch.trim().toLowerCase();
    const g: Record<string, AlimentoNutricional[]> = {};
    for (const a of despensaAlimentos) {
      if (q && !a.Nombre.toLowerCase().includes(q)) continue;
      const key = a.Macrogrupo || 'Sin clasificar';
      if (!g[key]) g[key] = [];
      g[key].push(a);
    }
    return g;
  }, [despensaAlimentos, despensaSearch]);

  const guardarDespensa = async () => {
    const ids = [...despensaIds];
    despensaLocalSet(idUsuario, ids);
    const ok = await saveDespensaIds(idUsuario, ids);
    toast(ok ? '✅ Despensa guardada en el servidor' : '✅ Despensa guardada localmente (servidor no disponible)');
    setPantryOn(false);
  };

  const resetPlanUi = () => {
    setItems([]);
    setTotales(computeTotales([]));
    setEstadoItem({});
    setPanelCambio({});
  };

  const selectMeal = (m: TiempoComidaKey) => {
    setSelectedMeal(m);
    setMacros({ carb: 0, prot: 0, grasa: 0, fibra: 0 });
    setMetaKcalDistrib(0);
    resetPlanUi();
    /* auto traer distribución */
    getUltimaDistribucionPorTiempo(idUsuario, m)
      .then((d) => {
        setMacros({ carb: d.cho, prot: d.prot, grasa: d.grasa, fibra: d.fibra });
        setMetaKcalDistrib(Math.round(d.cho * 4 + d.prot * 4 + d.grasa * 9));
        toast(`Distribución cargada (${d.fechaRegistro || 'última cita'})`);
      })
      .catch(() => {
        /* sin distribución: no molestar */
      });
  };

  const metaKcal = Math.round(macros.carb * 4 + macros.prot * 4 + macros.grasa * 9);

  const applyPlanResponse = (data: PlanNutricionalResponse) => {
    if (data.Error) {
      toast('❌ ' + data.Error);
      return;
    }
    const arr = (data.Alimentos || []).map((a, i) => fromApiAlimento(a, i));
    setItems(arr);
    setTotales(
      computeTotales(arr),
    );
    setMetasAct({ ...macros });
    const st: Record<string, 'confirmed' | 'to-change' | null> = {};
    for (const it of arr) st[it.key] = null;
    setEstadoItem(st);
    setPanelCambio({});
  };

  const genMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMeal) throw new Error('Tiempo de comida');
      const base = {
        IdUsuario: idUsuario,
        TiempoComida: selectedMeal,
        MetaCarbohidratos: macros.carb,
        MetaProteina: macros.prot,
        MetaGrasa: macros.grasa,
        MetaFibra: macros.fibra,
        EsVegano: esVegano,
      };
      if (pantryOn) {
        const ids = [...despensaIds];
        if (ids.length === 0) throw new Error('Seleccioná alimentos en la despensa');
        return generarPlanConFiltro({ ...base, alimentosPermitidos: ids });
      }
      return generarPlan(base);
    },
    onSuccess: (data) => applyPlanResponse(data),
    onError: (e: any) => toast(e?.message || e?.response?.data?.error || 'Error al generar'),
  });

  const handleGenerar = () => {
    if (!selectedMeal) {
      toast('⚠️ Seleccioná un tiempo de comida');
      return;
    }
    if (!macros.carb && !macros.prot && !macros.grasa && !macros.fibra) {
      toast('⚠️ Ingresá al menos una meta');
      return;
    }
    genMutation.mutate();
  };

  const traerDistribucion = () => {
    if (!selectedMeal) {
      toast('⚠️ Seleccioná un tiempo de comida');
      return;
    }
    getUltimaDistribucionPorTiempo(idUsuario, selectedMeal)
      .then((d) => {
        setMacros({ carb: d.cho, prot: d.prot, grasa: d.grasa, fibra: d.fibra });
        setMetaKcalDistrib(Math.round(d.cho * 4 + d.prot * 4 + d.grasa * 9));
        toast(`Metas cargadas (${d.fechaRegistro})`);
      })
      .catch((e) => toast('⚠️ ' + (e?.message || 'Sin datos')));
  };

  const toggleEstado = (key: string, mode: 'confirmed' | 'to-change') => {
    setEstadoItem((prev) => {
      const cur = prev[key];
      const next = cur === mode ? null : mode;
      if (next === 'confirmed') {
        setPanelCambio((pc) => {
          const c = { ...pc };
          delete c[key];
          return c;
        });
      } else if (next === 'to-change') {
        setPanelCambio((pc) => ({ ...pc, [key]: null }));
      } else if (next === null && cur === 'to-change') {
        setPanelCambio((pc) => {
          const c = { ...pc };
          delete c[key];
          return c;
        });
      }
      return { ...prev, [key]: next };
    });
  };

  const eliminarItem = (key: string) => {
    const idx = items.findIndex((x) => x.key === key);
    if (idx < 0) return;
    const arr = items.filter((x) => x.key !== key);
    setItems(arr);
    setTotales(computeTotales(arr));
    setEstadoItem((p) => {
      const n = { ...p };
      delete n[key];
      return n;
    });
    setPanelCambio((p) => {
      const n = { ...p };
      delete n[key];
      return n;
    });
    toast('🗑️ Alimento eliminado');
  };

  const ejecutarCambio = async (key: string, catOverride?: string) => {
    const cat = catOverride ?? panelCambio[key];
    if (!cat || !selectedMeal) {
      toast('⚠️ Elegí un macrogrupo');
      return;
    }
    if (esVegano && (cat === 'Proteínas animales' || cat === 'Lácteos y derivados')) {
      toast('⚠️ Modo vegano: no lácteos ni proteínas animales');
      return;
    }
    const idx = items.findIndex((x) => x.key === key);
    if (idx < 0) return;
    const al = items[idx];

    let carbConf = 0,
      protConf = 0,
      grasConf = 0,
      fibrConf = 0;
    for (const it of items) {
      if (estadoItem[it.key] === 'confirmed') {
        carbConf += it.carb;
        protConf += it.prot;
        grasConf += it.grasa;
        fibrConf += it.fibra;
      }
    }

    setLoadingCambio((p) => ({ ...p, [key]: true }));
    try {
      const nuevo = await cambiarAlimentoPlan({
        IdUsuario: idUsuario,
        TiempoComida: selectedMeal,
        CategoriaMacro: cat,
        IdAlimentoOriginal: al.id_bd,
        IdsEnPlan: items.map((i) => i.id_bd),
        IdsFiltroDespensa: pantryOn ? [...despensaIds] : [],
        FaltaCarb: Math.max(0, metasAct.carb - carbConf),
        FaltaProt: Math.max(0, metasAct.prot - protConf),
        FaltaGrasa: Math.max(0, metasAct.grasa - grasConf),
        FaltaFibra: Math.max(0, metasAct.fibra - fibrConf),
        EsVegano: esVegano,
      });
      const merged = mergeCambioAlimento(nuevo, idx);
      const arr = [...items];
      arr[idx] = merged;
      setItems(arr);
      setTotales(computeTotales(arr));
      setEstadoItem((p) => {
        const n = { ...p };
        delete n[key];
        n[merged.key] = null;
        return n;
      });
      setPanelCambio((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
      toast('✅ Cambiado por: ' + nuevo.Nombre);
    } catch {
      toast('⚠️ No hay más alimentos de esa categoría o el endpoint cambiar-alimento no está disponible');
    } finally {
      setLoadingCambio((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
    }
  };

  const openOptimize = () => {
    const prev = previewOptimizar(items, metasAct);
    if (prev.yaOptimizado) {
      toast('El plan ya está muy cerca de las metas');
      return;
    }
    setOptPreview(prev);
    setShowOptimize(true);
  };

  const applyOptimize = () => {
    if (!optPreview) return;
    const arr = aplicarOptimizar(items, optPreview.factor);
    setItems(arr);
    setTotales(computeTotales(arr));
    setShowOptimize(false);
    toast('⚡ Porciones optimizadas');
  };

  const confirmarAcumular = () => {
    if (!selectedMeal || items.length === 0) return;
    const t = computeTotales(items);
    const block: PlanAcumulado = { tiempo: selectedMeal, items: [...items], totales: t, metas: { ...metasAct } };
    const newAcc = [...acumulados, block];
    const doneKeys = { ...mealDone, [selectedMeal]: true };
    const quedan = TIEMPOS_COMIDA.some((x) => !doneKeys[x.key]);
    setAcumulados(newAcc);
    setMealDone(doneKeys);
    resetPlanUi();
    setSelectedMeal(null);
    setMetaKcalDistrib(0);
    if (!quedan) {
      void enviarTodosAcumulados(newAcc);
      return;
    }
    setNextMealOpen(true);
  };

  const confirmarYIA = () => {
    if (!selectedMeal || items.length === 0) return;
    const t = computeTotales(items);
    onPlanConfirmado({ tiempo: selectedMeal, items: [...items], totales: t, metas: { ...metasAct } });
    toast('✅ Plan listo para IA');
  };

  const enviarTodosAcumulados = async (planes: PlanAcumulado[]) => {
    if (planes.length === 0) return;
    const json = JSON.stringify(
      planes.map((p) => ({
        tiempo: p.tiempo,
        alimentos: p.items,
        totales: p.totales,
        metas: p.metas,
      })),
    );
    try {
      const raw = await enviarPlanesMultiplesCorreo(idUsuario, 0, json);
      const { ok, parts } = parseSpliterResponse(raw);
      toast(ok ? '✅ ' + (parts[1] || 'Enviado') : '⚠️ ' + (parts[1] || raw));
      if (ok) {
        setPlanesEnviados([...planes]);
        setShowIAPrompt(true);
        setAcumulados([]);
        setMealDone({});
      }
    } catch {
      toast('⚠️ No se pudo enviar (configurá PlanNutricional/enviar-planes-correo en el API)');
    }
  };

  const todosConfirmados =
    items.length > 0 && items.every((it) => estadoItem[it.key] === 'confirmed');

  const mealLabel = (k: string) => k.replace('AM', ' AM').replace('PM', ' PM');
  const mealMeta = TIEMPOS_COMIDA.find((t) => t.key === selectedMeal);

  return (
    <div className="gp-tab-panel">
      <div className="gp-section-title">Generador de plan</div>
      <p className="gp-section-sub">Seleccioná el tiempo de comida, metas y generá el plan (como en el sistema original).</p>

      <div className="gp-toggle-row">
        <label className="gp-toggle-switch">
          <input type="checkbox" checked={pantryOn} onChange={(e) => setPantryOn(e.target.checked)} />
          <span className="gp-toggle-slider" />
        </label>
        <div>
          <div className="gp-toggle-label">🏠 Usar solo alimentos que tengo en casa</div>
          <div className="gp-toggle-sub">Elegí alimentos en la despensa para filtrar la generación</div>
        </div>
        <span className="gp-badge">{despensaIds.size} seleccionados</span>
      </div>

      {pantryOn && (
        <div className="gp-panel-despensa">
          <div className="gp-panel-despensa-head">
            <strong>Alimentos disponibles en casa</strong>
            <div className="gp-panel-despensa-btns">
              <button type="button" className="gp-btn gp-btn-outline gp-btn-sm" onClick={() => setDespensaIds(new Set(despensaAlimentos.map((a) => a.Id_Alimento)))}>
                ✅ Todos
              </button>
              <button type="button" className="gp-btn gp-btn-outline gp-btn-sm" onClick={() => setDespensaIds(new Set())}>
                ⬜ Ninguno
              </button>
              <button type="button" className="gp-btn gp-btn-primary gp-btn-sm" onClick={guardarDespensa}>
                💾 Guardar
              </button>
            </div>
          </div>
          <input
            type="text"
            className="gp-input"
            placeholder="Buscar en despensa…"
            value={despensaSearch}
            onChange={(e) => setDespensaSearch(e.target.value)}
          />
          <div className="gp-despensa-scroll">
            {despensaLoading ? (
              <div className="gp-loading-inline">
                <div className="gp-spinner sm" /> Cargando…
              </div>
            ) : (
              Object.entries(despensaGrupos).map(([cat, list]) => (
                <div key={cat} className="gp-despensa-grupo">
                  <div className="gp-despensa-cat">{cat}</div>
                  <div className="gp-despensa-chks">
                    {list.map((a) => (
                      <label key={a.Id_Alimento} className={`gp-despensa-item${despensaIds.has(a.Id_Alimento) ? ' on' : ''}`}>
                        <input
                          type="checkbox"
                          checked={despensaIds.has(a.Id_Alimento)}
                          onChange={() => toggleDespensa(a.Id_Alimento)}
                        />
                        <span>{a.Nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {acumulados.length > 0 && !selectedMeal && (
        <div className="gp-acumulado-center">
          <div className="gp-acumulado-title">📦 Planes acumulados ({acumulados.length})</div>
          <div className="gp-acumulado-grid">
            {acumulados.map((p, i) => (
              <div key={i} className="gp-acum-card">
                <div className="gp-acum-card-h">
                  <span>{mealLabel(p.tiempo)}</span>
                  <span className="gp-acum-kcal">⚡ {p.totales.energia} kcal</span>
                </div>
                <ul className="gp-acum-ul">
                  {p.items.map((x) => (
                    <li key={x.key}>
                      {x.nombre} <strong>{x.porcion_g}g</strong>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <button type="button" className="gp-btn gp-btn-primary" onClick={() => enviarTodosAcumulados(acumulados)}>
            📧 Enviar {acumulados.length} plan{acumulados.length !== 1 ? 'es' : ''} por correo
          </button>
        </div>
      )}

      <div className="gp-meal-label-upper">⏰ Seleccioná el tiempo de comida</div>
      <div className="gp-meal-selector">
        {TIEMPOS_COMIDA.map((m) => (
          <button
            key={m.key}
            type="button"
            className={`gp-meal-btn${selectedMeal === m.key ? ' active' : ''}${mealDone[m.key] ? ' done' : ''}`}
            onClick={() => selectMeal(m.key)}
          >
            <span className="gp-ms-icon">
              <i className={`fa ${m.icon}`} />
            </span>
            <span className="gp-ms-name">{m.label}</span>
            <span className="gp-ms-time">{m.time}</span>
          </button>
        ))}
      </div>

      {selectedMeal && (
        <div className="gp-macros-card">
          <div className="gp-macros-title">
            {mealMeta?.principal ? '🌅' : '☕'} {mealLabel(selectedMeal)} — Metas nutricionales
          </div>
          <p className="gp-rules-info">
            {mealMeta?.principal
              ? 'Incluye mínimo 1 harina, 1 verdura y 1 proteína (reglas del generador original).'
              : 'Merienda: combinación flexible hacia las metas.'}
          </p>
          <div className="gp-macros-grid">
            {(['carb', 'prot', 'grasa', 'fibra'] as const).map((f) => (
              <div key={f} className="gp-macro-field">
                <label>{f === 'carb' ? '🌾 CHO' : f === 'prot' ? '💪 Prot' : f === 'grasa' ? '🥑 Grasa' : '🌿 Fibra'}</label>
                <input
                  type="number"
                  className="gp-macro-input"
                  min={0}
                  step={0.1}
                  value={macros[f] || ''}
                  onChange={(e) => setMacros((m) => ({ ...m, [f]: Number(e.target.value) || 0 }))}
                />
                <div className="gp-macro-unit">gramos</div>
              </div>
            ))}
          </div>
          {metaKcal > 0 && (
            <div className="gp-meta-kcal">⚡ Meta aproximada de esta comida: {metaKcal} kcal</div>
          )}

          <div className="gp-toggle-row gp-toggle-row--inner">
            <label className="gp-toggle-switch">
              <input type="checkbox" checked={esVegano} onChange={(e) => setEsVegano(e.target.checked)} />
              <span className="gp-toggle-slider" />
            </label>
            <div>
              <div className="gp-toggle-label">🌿 Modo vegano</div>
              <div className="gp-toggle-sub">Sin carnes, lácteos ni huevos en cambios sugeridos</div>
            </div>
          </div>

          <div className="gp-actions-row">
            <button type="button" className="gp-btn gp-btn-primary" disabled={genMutation.isPending} onClick={handleGenerar}>
              ⚡ {genMutation.isPending ? 'Generando…' : 'Generar plan'}
            </button>
            <button type="button" className="gp-btn gp-btn-outline" onClick={traerDistribucion}>
              📋 Traer distribución de última cita
            </button>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="gp-plan-wrapper">
          <div className="gp-plan-main">
            <p className="gp-hint-results">✅ Confirmá los que te gustaron · 🔄 Marcá los que querés cambiar</p>
            <div className="gp-food-result-list">
              {items.map((a) => {
                const st = estadoItem[a.key];
                return (
                  <div key={a.key}>
                    <div className={`gp-rfi${st === 'confirmed' ? ' confirmed' : ''}${st === 'to-change' ? ' to-change' : ''}`}>
                      <div className="gp-rfi-accent" />
                      <div className="gp-rfi-body">
                        <div className="gp-rfi-name">{a.nombre}</div>
                        <div className="gp-rfi-cat">{a.macrogrupo || a.categoria}</div>
                        <div className="gp-porcion-row">
                          <button type="button" className="gp-porcion-btn" onClick={() => {
                            const d = displayPorcion(a) - 5;
                            const base = catalogoById.get(a.id_bd) || null;
                            const idx = items.findIndex((x) => x.key === a.key);
                            const arr = [...items];
                            arr[idx] = applyPorcionDisplay(a, Math.max(1, d), base);
                            setItems(arr);
                            setTotales(computeTotales(arr));
                          }}>
                            −
                          </button>
                          <input
                            type="number"
                            className="gp-porcion-input"
                            value={displayPorcion(a)}
                            min={1}
                            onChange={(e) => {
                              const base = catalogoById.get(a.id_bd) || null;
                              const idx = items.findIndex((x) => x.key === a.key);
                              const arr = [...items];
                              arr[idx] = applyPorcionDisplay(a, Number(e.target.value) || 1, base);
                              setItems(arr);
                              setTotales(computeTotales(arr));
                            }}
                          />
                          <span className="gp-porcion-unit">{a.factor_coccion > 1 ? 'g cocido' : 'g'}</span>
                          <button type="button" className="gp-porcion-btn" onClick={() => {
                            const d = displayPorcion(a) + 5;
                            const base = catalogoById.get(a.id_bd) || null;
                            const idx = items.findIndex((x) => x.key === a.key);
                            const arr = [...items];
                            arr[idx] = applyPorcionDisplay(a, d, base);
                            setItems(arr);
                            setTotales(computeTotales(arr));
                          }}>
                            +
                          </button>
                        </div>
                        <div className="gp-rfi-macros">
                          <span className="gp-macro-tag">🌾 {a.carb}g</span>
                          <span className="gp-macro-tag">💪 {a.prot}g</span>
                          <span className="gp-macro-tag">🥑 {a.grasa}g</span>
                          <span className="gp-macro-tag">🌿 {a.fibra}g</span>
                          <span className="gp-macro-tag">⚡ {a.energia}kcal</span>
                        </div>
                      </div>
                      <div className="gp-rfi-actions">
                        <button type="button" className={`gp-btn-confirm${st === 'confirmed' ? ' active' : ''}`} onClick={() => toggleEstado(a.key, 'confirmed')} title="Confirmar">
                          ✅
                        </button>
                        <button type="button" className={`gp-btn-change${st === 'to-change' ? ' active' : ''}`} onClick={() => toggleEstado(a.key, 'to-change')} title="Cambiar">
                          🔄
                        </button>
                        <button type="button" className="gp-btn-delete" onClick={() => eliminarItem(a.key)} title="Eliminar">
                          🗑️
                        </button>
                      </div>
                    </div>
                    {st === 'to-change' && (
                      <div className="gp-change-panel open">
                        <div className="gp-change-panel-title">
                          {loadingCambio[a.key]
                            ? '⏳ Buscando alimento…'
                            : `Elegí la categoría — se reemplaza ${a.nombre} por un alimento aleatorio de esa categoría`}
                        </div>
                        {!loadingCambio[a.key] && (
                          <div className="gp-cat-chips">
                            {GP_MACRO_KEYS.filter((c) => !(esVegano && (c === 'Proteínas animales' || c === 'Lácteos y derivados'))).map((c) => (
                              <button
                                key={c}
                                type="button"
                                className="gp-cat-chip"
                                onClick={() => ejecutarCambio(a.key, c)}
                              >
                                {(GP_MACROGRUPOS[c] || GP_MACROGRUPOS['Sin clasificar']).emoji} {c}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {todosConfirmados && (
              <div className="gp-optimizar-banner">
                <div>
                  <strong>🎯 Todos los alimentos confirmados</strong>
                  <p>Podés escalar porciones para acercarte al 100% de las metas.</p>
                </div>
                <button type="button" className="gp-btn gp-btn-primary" onClick={openOptimize}>
                  ⚡ Optimizar porciones
                </button>
              </div>
            )}

            <div className="gp-callout">
              <span>✅</span>
              <span>Cuando estés conforme, confirmá el plan o pasá a ideas con IA.</span>
            </div>
            <div className="gp-confirm-actions">
              <button type="button" className="gp-btn gp-btn-primary" onClick={confirmarAcumular}>
                ✅ Confirmar plan
              </button>
              <button type="button" className="gp-btn gp-btn-orange" onClick={confirmarYIA}>
                👨‍🍳 Confirmar y generar ideas con IA
              </button>
              <button type="button" className="gp-btn gp-btn-outline" onClick={() => setAddOpen((v) => !v)}>
                ➕ Agregar alimento
              </button>
            </div>

            {addOpen && (
              <div className="gp-panel-agregar">
                <div className="gp-panel-agregar-h">
                  <span>➕ Agregar alimento al plan</span>
                  <button type="button" className="gp-btn-close" onClick={() => { setAddOpen(false); setAddSel(null); setAddSearch(''); setAddCategoryFilter(''); }}>
                    ✕
                  </button>
                </div>
                {!addSel ? (
                  <>
                    <input className="gp-input" placeholder="Buscar…" value={addSearch} onChange={(e) => setAddSearch(e.target.value)} />
                    {addCategoryFilter && (
                      <div className="gp-add-cat-badge">
                        Categoría: <strong>{addCategoryFilter}</strong>
                        <button type="button" onClick={() => setAddCategoryFilter('')}>✕</button>
                      </div>
                    )}
                    <div className="gp-add-grupos">
                      {Object.entries(catalogoAddAgrupado).map(([cat, foods]) => {
                        const info = GP_MACROGRUPOS[cat] || GP_MACROGRUPOS['Sin clasificar'];
                        const abierto = !!addSearch.trim() || !!addCategoryFilter;
                        return (
                          <details key={cat} className="gp-add-grupo" open={abierto}>
                            <summary className="gp-add-grupo-header">
                              <span className="gp-add-grupo-icon" style={{ background: info.color }}>{info.emoji}</span>
                              <span className="gp-add-grupo-name">{cat}</span>
                              <span className="gp-add-grupo-count">{foods.length}</span>
                              <span className="gp-add-grupo-chevron">▾</span>
                            </summary>
                            <div className="gp-add-list">
                              {foods.map((x) => (
                                <button key={x.Id_Alimento} type="button" className="gp-add-row" onClick={() => setAddSel({ al: x, porcion: 25 })}>
                                  {x.Nombre} <span>+</span>
                                </button>
                              ))}
                            </div>
                          </details>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="gp-add-detail">
                    <strong>{addSel.al.Nombre}</strong>
                    <div className="gp-porcion-row">
                      <button type="button" className="gp-porcion-btn" onClick={() => setAddSel((s) => (s ? { ...s, porcion: Math.max(1, s.porcion - 5) } : s))}>
                        −
                      </button>
                      <input
                        type="number"
                        className="gp-porcion-input"
                        value={addSel.porcion}
                        onChange={(e) => setAddSel((s) => (s ? { ...s, porcion: Number(e.target.value) || 1 } : s))}
                      />
                      <span>g</span>
                      <button type="button" className="gp-porcion-btn" onClick={() => setAddSel((s) => (s ? { ...s, porcion: Math.min(500, s.porcion + 5) } : s))}>
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="gp-btn gp-btn-primary"
                      style={{ width: '100%', marginTop: 12 }}
                      onClick={() => {
                        const ni = buildItemFromCatalogo(addSel.al, addSel.porcion);
                        const arr = [...items, ni];
                        setItems(arr);
                        setTotales(computeTotales(arr));
                        setEstadoItem((p) => ({ ...p, [ni.key]: null }));
                        setAddSel(null);
                        setAddSearch('');
                        toast('✅ Agregado');
                      }}
                    >
                      ✅ Agregar al plan
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="gp-sidebar">
            <div className="gp-result-card">
              <div className="gp-result-header">
                <div className="gp-result-title">{selectedMeal && mealLabel(selectedMeal)}</div>
                <button type="button" className="gp-btn-regen" onClick={handleGenerar}>
                  🎲 Regenerar
                </button>
              </div>
              <div className="gp-result-body">
                <MacroBar label="🌾 Carbohidratos" val={totales.carb} meta={metasAct.carb} />
                <MacroBar label="💪 Proteínas" val={totales.prot} meta={metasAct.prot} />
                <MacroBar label="🥑 Grasas" val={totales.grasa} meta={metasAct.grasa} type="grasa" />
                <MacroBar label="🌿 Fibra" val={totales.fibra} meta={metasAct.fibra} />
                {metaKcalDistrib > 0 ? (
                  <MacroBar label="⚡ Energía" val={totales.energia} meta={metaKcalDistrib} unit="kcal" type="kcal" />
                ) : (
                  <div className="gp-sidebar-kcal">⚡ {totales.energia} kcal totales</div>
                )}
              </div>
            </div>

            {acumulados.length > 0 && selectedMeal && (
              <div className="gp-sidebar-acum">
                <div className="gp-sidebar-acum-t">📦 Acumulados</div>
                {acumulados.map((p, i) => (
                  <div key={i} className="gp-acum-mini">
                    {mealLabel(p.tiempo)} · {p.totales.energia} kcal
                  </div>
                ))}
                <button type="button" className="gp-btn gp-btn-primary gp-btn-block" onClick={() => enviarTodosAcumulados(acumulados)}>
                  📧 Enviar todos
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {showOptimize && optPreview && (
        <div className="gp-modal-back" onClick={() => setShowOptimize(false)}>
          <div className="gp-modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚡ Optimizar porciones</h3>
            <p>Factor: {optPreview.factor.toFixed(2)}×</p>
            <ul className="gp-opt-list">
              {optPreview.items.map((r) => (
                <li key={r.nombre}>
                  {r.nombre}: {r.actual}g → {r.nuevo}g
                </li>
              ))}
            </ul>
            {optPreview.advertencias.length > 0 && (
              <div className="gp-opt-warn">{optPreview.advertencias.join(' ')}</div>
            )}
            {optPreview.sugerencias.length > 0 && (
              <div className="gp-opt-sugerencias">
                <p className="gp-opt-sug-title">💡 Para mejorar la cobertura, considerá agregar:</p>
                {optPreview.sugerencias.map((s: SugerenciaAlimento) => (
                  <button
                    key={s.macro}
                    type="button"
                    className="gp-opt-sug-btn"
                    onClick={() => {
                      setShowOptimize(false);
                      setAddCategoryFilter(s.categoria);
                      setAddOpen(true);
                      setAddSearch('');
                      setAddSel(null);
                    }}
                  >
                    {s.emoji} Agregar {s.categoria} (~{s.cantidadG}g para +{s.deficit}g de {s.macroLabel})
                  </button>
                ))}
              </div>
            )}
            <div className="gp-modal-actions">
              <button type="button" className="gp-btn gp-btn-outline" onClick={() => setShowOptimize(false)}>
                Cancelar
              </button>
              <button type="button" className="gp-btn gp-btn-primary" onClick={applyOptimize}>
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {nextMealOpen && (
        <div className="gp-modal-back" onClick={() => setNextMealOpen(false)}>
          <div className="gp-modal" onClick={(e) => e.stopPropagation()}>
            <h3>¿Siguiente tiempo de comida?</h3>
            {TIEMPOS_COMIDA.filter((t) => !mealDone[t.key]).map((t) => (
              <button
                key={t.key}
                type="button"
                className="gp-next-meal-btn"
                onClick={() => {
                  setNextMealOpen(false);
                  selectMeal(t.key);
                }}
              >
                {t.label}
              </button>
            ))}
            <button type="button" className="gp-btn gp-btn-outline gp-btn-block" style={{ marginTop: 12 }} onClick={() => setNextMealOpen(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {showIAPrompt && planesEnviados.length > 0 && (
        <div className="gp-modal-back" onClick={() => setShowIAPrompt(false)}>
          <div className="gp-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>🤖</div>
            <h3 style={{ textAlign: 'center', marginBottom: 8 }}>¿Generamos recetas con IA?</h3>
            <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
              Podés generar ideas de recetas personalizadas para cada uno de los{' '}
              <strong>{planesEnviados.length}</strong> tiempo{planesEnviados.length !== 1 ? 's' : ''} de comida enviados.
            </p>
            <div className="gp-modal-actions">
              <button
                type="button"
                className="gp-btn gp-btn-outline"
                onClick={() => setShowIAPrompt(false)}
              >
                No por ahora
              </button>
              <button
                type="button"
                className="gp-btn gp-btn-primary"
                onClick={() => {
                  setShowIAPrompt(false);
                  onPlanesParaIA(planesEnviados);
                }}
              >
                ✨ Sí, generar recetas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerTab;
