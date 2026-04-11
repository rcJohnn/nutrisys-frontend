import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getConsultas, getBioquimicos, getHistoria } from '../api/progreso';
import { getUsuarios, type Usuario } from '../api/usuarios';
import './Progreso.css';

declare const Chart: any;

type TabType = 'corporal' | 'presion' | 'bioquimicos' | 'notas';

// ── Mapeo defensivo de claves ─────────────────────────────────────────────────
// normalizeKeys: _[a-z] → uppercase + capitaliza primer char
// Los SPs pueden variar — usamos múltiples fallbacks para robustez

const mapConsulta = (r: any) => ({
  fecha     : r.Fecha_Cita ?? r.Fecha_Consulta ?? r.Fecha ?? '',
  peso      : r.PesoKg     ?? r.Peso_kg        ?? null,
  imc       : r.IMC        ?? r.Imc            ?? null,
  grasa     : r.Grasa_Porcentaje ?? r.GrasaG   ?? r.Grasa_g ?? r.Grasa ?? null,
  musculo   : r.MusculoG   ?? r.Musculo_g      ?? r.Musculo ?? null,
  cintura   : r.Circunferencia_CinturaCm ?? r.Circunferencia_Cintura_cm ?? r.Cintura ?? null,
  cadera    : r.Circunferencia_CaderaCm  ?? r.Circunferencia_Cadera_cm  ?? r.Cadera  ?? null,
  sistolica : r.Presion_Arterial_Sistolica  ?? r.Sistolica  ?? null,
  diastolica: r.Presion_Arterial_Diastolica ?? r.Diastolica ?? null,
  observaciones : r.Observaciones_Medico ?? r.Observaciones ?? '',
  recomendaciones: r.Recomendaciones ?? '',
  medico    : r.NombreMedico ?? r.Medico ?? '',
});

const mapBioquimico = (r: any) => ({
  fecha         : r.Fecha_Analisis ?? r.Fecha_Examen ?? r.Fecha ?? '',
  hemoglobina   : r.Hemoglobina     ?? null,
  hematocrito   : r.Hematocrito     ?? null,
  colesterolTotal: r.Colesterol_Total ?? r.ColesterolTotal ?? null,
  hdl           : r.HDL             ?? null,
  ldl           : r.LDL             ?? null,
  trigliceridos : r.Trigliceridos   ?? null,
  glicemia      : r.Glicemia        ?? null,
  acidoUrico    : r.Acido_Urico     ?? r.AcidoUrico   ?? null,
  albumina      : r.Albumina        ?? null,
  creatinina    : r.Creatinina      ?? null,
  tsh           : r.TSH             ?? null,
  vitaminaD     : r.Vitamina_D      ?? r.VitaminaD    ?? null,
  vitaminaB12   : r.Vitamina_B12    ?? r.VitaminaB12  ?? null,
  observaciones : r.Observaciones   ?? '',
});

const mapHistoria = (r: any) => ({
  calidadSueno    : r.Calidad_Sueno     ?? r.CalidadSueno     ?? '',
  funcionIntestinal: r.Funcion_Intestinal ?? r.FuncionIntestinal ?? '',
  fuma            : r.Fuma   ?? false,
  alcohol         : r.Alcohol ?? false,
  actividadFisica : r.Actividad_Fisica  ?? r.ActividadFisica  ?? '',
  medicamentos    : r.Medicamentos      ?? '',
  agua            : r.Ingesta_Agua      ?? r.Agua             ?? '',
  intolerancias   : r.Intolerancias     ?? '',
  alergias        : r.Alergias_Alimentarias ?? r.Alergias     ?? '',
});

type Consulta   = ReturnType<typeof mapConsulta>;
type Bioquimico = ReturnType<typeof mapBioquimico>;
type Historia   = ReturnType<typeof mapHistoria>;

// ── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  emerald    : '#006c49',
  emeraldBg  : 'rgba(0,108,73,0.10)',
  blue       : '#3b82f6',
  blueBg     : 'rgba(59,130,246,0.10)',
  red        : '#ef4444',
  redBg      : 'rgba(239,68,68,0.10)',
  purple     : '#8b5cf6',
  purpleBg   : 'rgba(139,92,246,0.10)',
  amber      : '#f59e0b',
  amberBg    : 'rgba(245,158,11,0.10)',
  pink       : '#ec4899',
  pinkBg     : 'rgba(236,72,153,0.10)',
};

// ── Opciones Chart.js ─────────────────────────────────────────────────────────
const baseOptions = (yLabel = '') => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: false as const,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: { position: 'top' as const, labels: { usePointStyle: true, padding: 16, font: { size: 12 } } },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    y: {
      beginAtZero: false,
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: { font: { size: 11 } },
      ...(yLabel ? { title: { display: true, text: yLabel, font: { size: 11 } } } : {}),
    },
  },
});

const ds = (
  label: string, data: (number | null)[], color: string, bg: string, fill = true,
) => ({ label, data, borderColor: color, backgroundColor: bg, fill, tension: 0.35,
        pointRadius: 4, pointHoverRadius: 7, borderWidth: 2 });

/** Chart global (index.html). Actualiza series con update('none') si la estructura coincide. */
function syncLineChart(canvas: HTMLCanvasElement | null, inst: React.MutableRefObject<any>, cfg: any) {
  if (!canvas) return;
  const { labels, datasets } = cfg.data;
  if (inst.current && inst.current.config?.type === cfg.type
    && inst.current.data.datasets.length === datasets.length) {
    inst.current.data.labels = labels;
    datasets.forEach((d: any, i: number) => {
      const cur = inst.current.data.datasets[i];
      cur.data = d.data;
      cur.label = d.label;
    });
    inst.current.update('none');
    return;
  }
  inst.current?.destroy();
  const ctx = canvas.getContext('2d');
  if (ctx) inst.current = new Chart(ctx, cfg);
}

// ── Trend badge ───────────────────────────────────────────────────────────────
const TrendBadge: React.FC<{ val: number | null; prev: number | null; invertido?: boolean }> = ({
  val, prev, invertido = false,
}) => {
  if (val == null || prev == null || prev === 0) return null;
  const pct  = ((val - prev) / Math.abs(prev)) * 100;
  const sube = pct > 0;
  const ok   = invertido ? !sube : sube;
  const col  = Math.abs(pct) < 0.1 ? '#94a3b8' : ok ? '#22c55e' : '#ef4444';
  return (
    <span className="pg-trend" style={{ color: col }}>
      {sube ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
    </span>
  );
};

// ── Semáforo ──────────────────────────────────────────────────────────────────
const semColor = (v: number | null, [lo, hi]: [number, number]) => {
  if (v == null) return '#94a3b8';
  return (v < lo || v > hi) ? '#ef4444' : '#22c55e';
};

// ── Formateo fecha ────────────────────────────────────────────────────────────
const fmt = (f: string) => {
  if (!f) return '';
  const d = new Date(f);
  return isNaN(d.getTime()) ? f : d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ────────────────────────────────────────────────────────────────────────────
const Progreso: React.FC = () => {
  const navigate  = useNavigate();
  const userName  = localStorage.getItem('userName')  || 'Usuario';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userType  = localStorage.getItem('userType')  || 'U';
  const userId    = Number(localStorage.getItem('userId') || '0');

  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [searchTerm,    setSearchTerm]    = useState('');
  const [searchResults, setSearchResults] = useState<Usuario[]>([]);
  const [showResults,   setShowResults]   = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError,   setSearchError]   = useState<string | null>(null);
  const [activeTab,     setActiveTab]     = useState<TabType>('corporal');
  const [fechaDesde,    setFechaDesde]    = useState('');
  const [fechaHasta,    setFechaHasta]    = useState('');

  // Canvas refs
  const refPeso    = useRef<HTMLCanvasElement>(null);
  const refIMC     = useRef<HTMLCanvasElement>(null);
  const refCompos  = useRef<HTMLCanvasElement>(null);
  const refCirc    = useRef<HTMLCanvasElement>(null);
  const refPresion = useRef<HTMLCanvasElement>(null);

  // Chart instance refs (no state → no re-renders)
  const instPeso    = useRef<any>(null);
  const instIMC     = useRef<any>(null);
  const instCompos  = useRef<any>(null);
  const instCirc    = useRef<any>(null);
  const instPresion = useRef<any>(null);

  // Auto-load para usuario tipo U
  useEffect(() => {
    if (userType === 'U' && userId > 0) {
      getUsuarios({ estado: 'Activo' }).then((res) => {
        const yo = res.find((u) => u.Id_Usuario === userId);
        if (yo) setSelectedUsuario(yo);
      });
    }
  }, [userType, userId]);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchTerm(v);
    setSearchError(null);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!v.trim() || v.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      setSearchLoading(false);
      return;
    }
    const term = v.trim();
    searchDebounceRef.current = setTimeout(() => {
      searchDebounceRef.current = null;
      setShowResults(true);
      setSearchLoading(true);
      getUsuarios({ nombre: term, estado: 'Activo' })
        .then((r) => {
          setSearchResults(r);
        })
        .catch(() => {
          setSearchResults([]);
          setSearchError('No se pudo buscar. Revise la conexión o vuelva a intentar.');
        })
        .finally(() => setSearchLoading(false));
    }, 300);
  }, []);

  useEffect(() => () => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
  }, []);

  // Queries
  const { data: rawC = [], isLoading: loadingC } = useQuery({
    queryKey: ['pg-consultas', selectedUsuario?.Id_Usuario],
    queryFn : () => getConsultas(selectedUsuario!.Id_Usuario),
    enabled : !!selectedUsuario,
  });
  const { data: rawB = [] } = useQuery({
    queryKey: ['pg-bioquimicos', selectedUsuario?.Id_Usuario],
    queryFn : () => getBioquimicos(selectedUsuario!.Id_Usuario),
    enabled : !!selectedUsuario,
  });
  const { data: rawH = [] } = useQuery({
    queryKey: ['pg-historia', selectedUsuario?.Id_Usuario],
    queryFn : () => getHistoria(selectedUsuario!.Id_Usuario),
    enabled : !!selectedUsuario,
  });

  // Mapeo defensivo (claves API → modelo de pantalla)
  const consultas   = useMemo(() => rawC.map((r) => mapConsulta(r)),   [rawC]);
  const bioquimicos = useMemo(() => rawB.map((r) => mapBioquimico(r)), [rawB]);
  const historias   = useMemo(() => rawH.map((r) => mapHistoria(r)),   [rawH]);

  // Filtro por fechas (aplicado a gráficos y KPIs)
  const filtradas: Consulta[] = useMemo(() => consultas.filter((c) => {
    if (!c.fecha) return true;
    const d = new Date(c.fecha);
    if (fechaDesde && d < new Date(fechaDesde))                    return false;
    if (fechaHasta && d > new Date(fechaHasta + 'T23:59:59'))      return false;
    return true;
  }), [consultas, fechaDesde, fechaHasta]);

  const ultimo   = filtradas[filtradas.length - 1] ?? null;
  const anterior = filtradas[filtradas.length - 2] ?? null;
  const bio: Bioquimico | null  = bioquimicos[0] ?? null;
  const hist: Historia | null   = historias[0]   ?? null;

  // ── Gráficos: Evolución Corporal ───────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'corporal') return;
    if (!filtradas.length) {
      [instPeso, instIMC, instCompos, instCirc].forEach((r) => {
        r.current?.destroy();
        r.current = null;
      });
      return;
    }
    const labels = filtradas.map((c) => fmt(c.fecha));
    syncLineChart(refPeso.current,   instPeso,   { type: 'line', data: { labels, datasets: [ds('Peso (kg)', filtradas.map((c) => c.peso),    C.emerald, C.emeraldBg)] }, options: baseOptions('kg')  });
    syncLineChart(refIMC.current,    instIMC,    { type: 'line', data: { labels, datasets: [ds('IMC',       filtradas.map((c) => c.imc),     C.blue,    C.blueBg)]    }, options: baseOptions('kg/m²') });
    syncLineChart(refCompos.current, instCompos, { type: 'line', data: { labels, datasets: [ds('Grasa (%)', filtradas.map((c) => c.grasa),   C.red,     C.redBg), ds('Músculo (%)', filtradas.map((c) => c.musculo), C.purple, C.purpleBg)] }, options: baseOptions('%') });
    syncLineChart(refCirc.current,   instCirc,   { type: 'line', data: { labels, datasets: [ds('Cintura (cm)', filtradas.map((c) => c.cintura), C.amber, C.amberBg), ds('Cadera (cm)', filtradas.map((c) => c.cadera), C.blue, C.blueBg)] }, options: baseOptions('cm') });
    return () => {
      [instPeso, instIMC, instCompos, instCirc].forEach((r) => {
        r.current?.destroy();
        r.current = null;
      });
    };
  }, [activeTab, filtradas]);

  // ── Gráfico: Presión Arterial ─────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'presion') return;
    if (!filtradas.length) {
      instPresion.current?.destroy();
      instPresion.current = null;
      return;
    }
    const labels = filtradas.map((c) => fmt(c.fecha));
    syncLineChart(refPresion.current, instPresion, {
      type: 'line',
      data: {
        labels,
        datasets: [
          ds('Sistólica (mmHg)',  filtradas.map((c) => c.sistolica),  C.pink, C.pinkBg, false),
          ds('Diastólica (mmHg)', filtradas.map((c) => c.diastolica), C.blue, C.blueBg, false),
        ],
      },
      options: baseOptions('mmHg'),
    });
    return () => {
      instPresion.current?.destroy();
      instPresion.current = null;
    };
  }, [activeTab, filtradas]);

  // Cleanup on unmount
  useEffect(() => () => {
    [instPeso, instIMC, instCompos, instCirc, instPresion].forEach(r => r.current?.destroy());
  }, []);

  // ── Helpers de render ─────────────────────────────────────────────────────
  const showSearch  = userType !== 'U';
  const hasData     = filtradas.length > 0;
  const nombreCompleto = selectedUsuario
    ? `${selectedUsuario.Nombre} ${selectedUsuario.Prim_Apellido} ${selectedUsuario.Seg_Apellido}`.trim()
    : '';

  const TAB_LABELS: Record<TabType, string> = {
    corporal   : '⚖️ Evolución Corporal',
    presion    : '🫀 Presión Arterial',
    bioquimicos: '🔬 Bioquímicos',
    notas      : '📋 Notas Clínicas',
  };

  const KPIS: { label: string; val: number | null; prev: number | null; unit: string; inv: boolean }[] = [
    { label: 'Peso',    val: ultimo?.peso   ?? null, prev: anterior?.peso   ?? null, unit: 'kg',    inv: true  },
    { label: 'IMC',     val: ultimo?.imc    ?? null, prev: anterior?.imc    ?? null, unit: 'kg/m²', inv: true  },
    { label: 'Grasa',   val: ultimo?.grasa  ?? null, prev: anterior?.grasa  ?? null, unit: '%',     inv: true  },
    { label: 'Músculo', val: ultimo?.musculo?? null, prev: anterior?.musculo?? null, unit: '%',     inv: false },
  ];

  return (
    <div className="progreso-page">

      {/* Breadcrumb */}
      <nav className="cm-breadcrumb">
        <span onClick={() => navigate('/dashboard')} className="cm-bc-link">Inicio</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span className="cm-bc-active">Mi Progreso</span>
      </nav>

      {/* Welcome */}
      <div className="pg-welcome">
        <h1 className="pg-welcome-title">Hola, <span>{userName}</span></h1>
        <p className="pg-welcome-sub">{userEmail}</p>
      </div>

      {/* Búsqueda (admin / médico) */}
      {showSearch && (
        <div className="pg-search-card">
          <div className="pg-search-card-title">
            <i className="fa fa-user-circle-o"></i> Seleccionar paciente
          </div>
          {selectedUsuario ? (
            <div className="pg-usuario-seleccionado">
              <div className="pg-usuario-info">
                <div className="pg-usuario-avatar">{nombreCompleto.charAt(0)}</div>
                <div className="pg-usuario-nombre">{nombreCompleto}</div>
              </div>
              <button className="pg-btn-cambiar" onClick={() => setSelectedUsuario(null)}>Cambiar paciente</button>
            </div>
          ) : (
            <div className="pg-search-wrap">
              <i className="fa fa-search pg-search-ico"></i>
              <input
                type="text"
                className="pg-search-input"
                placeholder="Buscar paciente por nombre..."
                value={searchTerm}
                onChange={handleSearch}
                autoComplete="off"
              />
              {showResults && (
                <div className="pg-search-dropdown">
                  {searchLoading && (
                    <div className="pg-search-item pg-search-item--muted">Buscando…</div>
                  )}
                  {!searchLoading && searchError && (
                    <div className="pg-search-item pg-search-item--muted">{searchError}</div>
                  )}
                  {!searchLoading && !searchError && searchResults.length === 0 && (
                    <div className="pg-search-item pg-search-item--muted">Sin coincidencias. Pruebe con otro nombre.</div>
                  )}
                  {!searchLoading && !searchError && searchResults.map((u) => (
                    <div key={u.Id_Usuario} className="pg-search-item"
                      onClick={() => {
                        setSelectedUsuario(u);
                        setSearchTerm('');
                        setShowResults(false);
                        setSearchResults([]);
                      }}>
                      <div className="pg-search-nombre">{u.Nombre} {u.Prim_Apellido} {u.Seg_Apellido}</div>
                      <div className="pg-search-email">{u.Correo}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Spinner */}
      {loadingC && (
        <div className="pg-spinner-wrap">
          <div className="pg-spinner-dot"></div>
          <p className="pg-spinner-text">Cargando datos...</p>
        </div>
      )}

      {/* Sin datos */}
      {selectedUsuario && !loadingC && !hasData && (
        <div className="pg-empty">
          <div className="pg-empty-icon">📊</div>
          <div className="pg-empty-title">Sin datos registrados</div>
          <div className="pg-empty-sub">No hay consultas completadas con métricas para este paciente.</div>
        </div>
      )}

      {/* Dashboard */}
      {selectedUsuario && hasData && (
        <>
          {/* Banner + filtro */}
          <div className="pg-banner">
            <div className="pg-banner-left">
              <div className="pg-banner-avatar">{nombreCompleto.charAt(0)}</div>
              <div>
                <div className="pg-banner-name">{nombreCompleto}</div>
                <div className="pg-banner-meta">
                  {selectedUsuario.Correo} · {filtradas.length} consulta{filtradas.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <div className="pg-filter-bar">
              <span className="pg-filter-label">Período</span>
              <input type="date" className="pg-filter-input" value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)} />
              <span className="pg-filter-sep">→</span>
              <input type="date" className="pg-filter-input" value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)} />
              {(fechaDesde || fechaHasta) && (
                <button className="pg-filter-reset"
                  onClick={() => { setFechaDesde(''); setFechaHasta(''); }}>✕</button>
              )}
            </div>
          </div>

          {/* KPIs */}
          <div className="pg-kpi-row">
            {KPIS.map(({ label, val, prev, unit, inv }) => (
              <div key={label} className="pg-kpi-card">
                <div className="pg-kpi-label">{label}</div>
                <div className="pg-kpi-value">
                  {val ?? '—'}
                  {val != null && <span className="pg-kpi-unit"> {unit}</span>}
                </div>
                <TrendBadge val={val} prev={prev} invertido={inv} />
                {anterior && val != null && prev != null && (
                  <div className="pg-kpi-prev">Ant: {prev} {unit}</div>
                )}
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="pg-tabs-wrap">
            <div className="pg-tabs">
              {(Object.keys(TAB_LABELS) as TabType[]).map((tab) => (
                <button key={tab}
                  className={`pg-tab-btn${activeTab === tab ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab)}>
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tab: Evolución Corporal ── */}
          {activeTab === 'corporal' && (
            <div className="pg-tab-content">
              <div className="pg-chart-grid-2">
                <div className="pg-chart-card">
                  <div className="pg-chart-title">📈 Evolución del Peso</div>
                  <div className="pg-chart-wrap"><canvas ref={refPeso}></canvas></div>
                </div>
                <div className="pg-chart-card">
                  <div className="pg-chart-title">📊 Índice de Masa Corporal</div>
                  <div className="pg-chart-wrap"><canvas ref={refIMC}></canvas></div>
                </div>
              </div>
              <div className="pg-chart-card">
                <div className="pg-chart-title">💪 Composición Corporal — Grasa vs Músculo</div>
                <div className="pg-chart-wrap"><canvas ref={refCompos}></canvas></div>
              </div>
              <div className="pg-chart-card">
                <div className="pg-chart-title">📏 Circunferencias — Cintura y Cadera</div>
                <div className="pg-chart-wrap"><canvas ref={refCirc}></canvas></div>
              </div>
            </div>
          )}

          {/* ── Tab: Presión Arterial ── */}
          {activeTab === 'presion' && (
            <div className="pg-tab-content">
              <div className="pg-pa-legend">
                <span className="pg-pa-badge pg-pa-normal">✅ Normal (&lt;120/80)</span>
                <span className="pg-pa-badge pg-pa-elevada">⚠️ Elevada (120–129)</span>
                <span className="pg-pa-badge pg-pa-alta">🔴 Alta (≥130/80)</span>
              </div>
              <div className="pg-chart-card">
                <div className="pg-chart-title">🫀 Evolución de la Presión Arterial</div>
                <div className="pg-chart-wrap pg-chart-wrap--xl"><canvas ref={refPresion}></canvas></div>
              </div>
            </div>
          )}

          {/* ── Tab: Bioquímicos ── */}
          {activeTab === 'bioquimicos' && (
            <div className="pg-tab-content">
              {bio ? (
                <>
                  <div className="pg-bio-fecha">
                    <i className="fa fa-calendar-o"></i> Última actualización: {fmt(bio.fecha)}
                  </div>

                  <div className="pg-section-title">🩸 Perfil Lipídico y Metabólico</div>
                  <div className="pg-semaforo-grid">
                    {([
                      { label: 'Colesterol Total', v: bio.colesterolTotal, r: [0,   200] as [number,number], u: 'mg/dL' },
                      { label: 'HDL (Bueno)',       v: bio.hdl,            r: [40,  60]  as [number,number], u: 'mg/dL' },
                      { label: 'LDL (Malo)',        v: bio.ldl,            r: [0,   100] as [number,number], u: 'mg/dL' },
                      { label: 'Triglicéridos',     v: bio.trigliceridos,  r: [0,   150] as [number,number], u: 'mg/dL' },
                      { label: 'Glicemia',          v: bio.glicemia,       r: [70,  100] as [number,number], u: 'mg/dL' },
                    ]).map(({ label, v, r, u }) => (
                      <div key={label} className="pg-semaforo-item" style={{ borderLeftColor: semColor(v, r) }}>
                        <div className="pg-semaforo-label">{label}</div>
                        <div className="pg-semaforo-value">{v ?? '—'}</div>
                        <div className="pg-semaforo-unit">{u}</div>
                      </div>
                    ))}
                  </div>

                  <div className="pg-section-title">🔬 Otros Indicadores</div>
                  <div className="pg-semaforo-grid">
                    {([
                      { label: 'Hemoglobina',  v: bio.hemoglobina,  r: [12,  17]   as [number,number], u: 'g/dL'    },
                      { label: 'Hematocrito',  v: bio.hematocrito,  r: [36,  50]   as [number,number], u: '%'       },
                      { label: 'Ácido Úrico',  v: bio.acidoUrico,   r: [2.5, 7]    as [number,number], u: 'mg/dL'  },
                      { label: 'Creatinina',   v: bio.creatinina,   r: [0.7, 1.3]  as [number,number], u: 'mg/dL'  },
                      { label: 'TSH',          v: bio.tsh,          r: [0.4, 4]    as [number,number], u: 'μIU/mL' },
                      { label: 'Vitamina D',   v: bio.vitaminaD,    r: [30,  100]  as [number,number], u: 'ng/mL'  },
                    ]).filter(x => x.v != null).map(({ label, v, r, u }) => (
                      <div key={label} className="pg-semaforo-item" style={{ borderLeftColor: semColor(v, r) }}>
                        <div className="pg-semaforo-label">{label}</div>
                        <div className="pg-semaforo-value">{v}</div>
                        <div className="pg-semaforo-unit">{u}</div>
                      </div>
                    ))}
                  </div>

                  {bio.observaciones && (
                    <div className="pg-bio-obs">{bio.observaciones}</div>
                  )}
                </>
              ) : (
                <div className="pg-empty">
                  <div className="pg-empty-icon">🔬</div>
                  <div className="pg-empty-title">Sin análisis bioquímicos</div>
                  <div className="pg-empty-sub">No hay registros de análisis para este paciente.</div>
                </div>
              )}

              {hist && (
                <>
                  <div className="pg-section-title">🏃 Hábitos y Estilo de Vida</div>
                  <div className="pg-habitos-grid">
                    {([
                      { icon: '😴', label: 'Calidad del Sueño',   val: hist.calidadSueno },
                      { icon: '🚽', label: 'Función Intestinal',   val: hist.funcionIntestinal },
                      { icon: '🚬', label: '¿Fuma?',               val: hist.fuma    ? 'Sí' : 'No' },
                      { icon: '🍷', label: '¿Alcohol?',            val: hist.alcohol ? 'Sí' : 'No' },
                      { icon: '🏃', label: 'Actividad Física',     val: hist.actividadFisica },
                      { icon: '💧', label: 'Ingesta de Agua',      val: hist.agua },
                    ]).map(({ icon, label, val }) => val ? (
                      <div key={label} className="pg-habito-item">
                        <div className="pg-habito-icon">{icon}</div>
                        <div>
                          <div className="pg-habito-label">{label}</div>
                          <div className="pg-habito-value">{val}</div>
                        </div>
                      </div>
                    ) : null)}
                    {hist.medicamentos && (
                      <div className="pg-habito-item pg-habito-full">
                        <div className="pg-habito-icon">💊</div>
                        <div>
                          <div className="pg-habito-label">Medicamentos</div>
                          <div className="pg-habito-value">{hist.medicamentos}</div>
                        </div>
                      </div>
                    )}
                    {(hist.intolerancias || hist.alergias) && (
                      <div className="pg-habito-item pg-habito-full">
                        <div className="pg-habito-icon">⚠️</div>
                        <div>
                          <div className="pg-habito-label">Intolerancias / Alergias</div>
                          <div className="pg-habito-value">{hist.intolerancias || '—'} / {hist.alergias || '—'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Tab: Notas Clínicas ── */}
          {activeTab === 'notas' && (
            <div className="pg-tab-content">
              <div className="pg-timeline">
                {[...filtradas].reverse().map((c, i) => {
                  const d = c.fecha ? new Date(c.fecha) : null;
                  return (
                    <div key={i} className="pg-timeline-item">
                      <div className="pg-timeline-date">
                        <div className="pg-timeline-day">{d ? d.getDate() : '?'}</div>
                        <div className="pg-timeline-month">
                          {d ? d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) : ''}
                        </div>
                      </div>
                      <div className="pg-timeline-content">
                        <div className="pg-timeline-medico">👨‍⚕️ {c.medico || 'Médico'}</div>
                        {c.observaciones && (
                          <div className="pg-timeline-obs">{c.observaciones}</div>
                        )}
                        {c.recomendaciones && (
                          <div className="pg-timeline-rec">
                            <strong>💡 Recomendaciones:</strong> {c.recomendaciones}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {!selectedUsuario && !showSearch && !loadingC && (
        <div className="pg-empty">
          <div className="pg-empty-icon">⏳</div>
          <div className="pg-empty-title">Cargando...</div>
        </div>
      )}
    </div>
  );
};

export default Progreso;
