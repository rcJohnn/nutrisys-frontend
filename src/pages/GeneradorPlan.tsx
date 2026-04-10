import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getAlimentosDisponibles, generarPlan, generarPlanConFiltro,
  type AlimentoDisponible, type PlanNutricionalResponse,
} from '../api/plan';
import { getUsuarios, type Usuario } from '../api/usuarios';
import './GeneradorPlan.css';

const TIEMPOS_COMIDA = [
  { key: 'Desayuno', label: 'Desayuno', time: '6:00–8:00 AM', icon: 'fa-sun-o' },
  { key: 'MeriendaAM', label: 'Merienda AM', time: '9:30–10:30 AM', icon: 'fa-coffee' },
  { key: 'Almuerzo', label: 'Almuerzo', time: '12:00–1:00 PM', icon: 'fa-cutlery' },
  { key: 'MeriendaPM', label: 'Merienda PM', time: '3:00–4:00 PM', icon: 'fa-apple' },
  { key: 'Cena', label: 'Cena', time: '6:00–7:30 PM', icon: 'fa-moon-o' },
];

const CATEGORIAS = [
  'Todos',
  'Lácteos y derivados',
  'Proteínas animales',
  'Vegetales',
  'Grasas y semillas',
  'Frutas',
  'Cereales y harinas',
  'Azúcares y dulces',
];

interface PlanAcumulado {
  tiempoComida: string;
  alimentos: { alimento: AlimentoDisponible; porcion_g: number }[];
  macros: { cho: number; prot: number; grasa: number; fibra: number; kcal: number };
}

const GeneradorPlan: React.FC = () => {
  const userType = localStorage.getItem('userType') || 'A';

  // Active tab
  const [activeTab, setActiveTab] = useState<'planner' | 'recetas' | 'lista'>('planner');

  // User selection
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Usuario[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  // Planner state
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [macros, setMacros] = useState({ carb: 0, prot: 0, grasa: 0, fibra: 0 });
  const [esVegano, setEsVegano] = useState(false);
  const [pantryOnly] = useState(false);

  // Resultados
  const [planResult, setPlanResult] = useState<PlanNutricionalResponse | null>(null);
  const [acumulados, setAcumulados] = useState<PlanAcumulado[]>([]);

  // Lista tab
  const [categoriaFilter, setCategoriaFilter] = useState('Todos');
  const [alimentoSearch, setAlimentoSearch] = useState('');
  const [selectedAlimentos] = useState<AlimentoDisponible[]>([]);

  // Search usuarios
  const buscarUsuarios = useCallback((term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    getUsuarios({ nombre: term }).then((res) => {
      setSearchResults(res as Usuario[]);
      setShowResults(true);
    });
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    const timer = setTimeout(() => buscarUsuarios(val), 300);
    return () => clearTimeout(timer);
  };

  useState(() => {
    const timer = setTimeout(() => buscarUsuarios(searchTerm), 300);
    return () => clearTimeout(timer);
  });

  const seleccionarUsuario = (u: Usuario) => {
    setSelectedUsuario(u);
    setSearchTerm('');
    setShowResults(false);
  };

  const limpiarUsuario = () => {
    setSelectedUsuario(null);
  };

  // Load foods for lista tab
  const { data: allAlimentos = [] } = useQuery({
    queryKey: ['alimentos-lista', selectedUsuario?.Id_Usuario, selectedMeal],
    queryFn: () => selectedUsuario
      ? getAlimentosDisponibles(selectedUsuario.Id_Usuario, selectedMeal || 'Desayuno')
      : Promise.resolve([]),
    enabled: Boolean(selectedUsuario),
  });

  // Generar plan mutation
  const mutation = useMutation({
    mutationFn: () => {
      if (!selectedUsuario) return Promise.reject('No hay usuario');
      const payload = {
        IdUsuario: selectedUsuario.Id_Usuario,
        TiempoComida: selectedMeal || 'Desayuno',
        MetaCarbohidratos: macros.carb,
        MetaProteina: macros.prot,
        MetaGrasa: macros.grasa,
        MetaFibra: macros.fibra,
        EsVegano: esVegano,
      };
      return pantryOnly
        ? generarPlanConFiltro({ ...payload, alimentosPermitidos: selectedAlimentos.map(a => a.Id_Alimento) })
        : generarPlan(payload);
    },
    onSuccess: (data) => {
      setPlanResult(data);
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || err.message || 'Error al generar plan');
    },
  });

  const handleGenerarPlan = () => {
    if (!selectedUsuario) { alert('Seleccione un usuario'); return; }
    if (!selectedMeal) { alert('Seleccione un tiempo de comida'); return; }
    if (macros.carb <= 0 && macros.prot <= 0 && macros.grasa <= 0) {
      alert('Ingrese al menos una meta nutricional');
      return;
    }
    mutation.mutate();
  };

  const confirmarPlan = () => {
    if (!planResult || !selectedMeal) return;
    const cho = planResult.TotalCarbohidratos;
    const prot = planResult.TotalProteina;
    const grasa = planResult.TotalGrasa;
    const fibra = planResult.TotalFibra;
    const kcal = planResult.TotalEnergia;
    setAcumulados(prev => [...prev, {
      tiempoComida: selectedMeal,
      alimentos: planResult.Alimentos.map(a => ({
        alimento: { Id_Alimento: a.Id_Alimento, Nombre: a.Nombre, Categoria: a.Categoria, Energia_kcal: a.Energia_kcal },
        porcion_g: a.Porcion_g,
      })),
      macros: { cho, prot, grasa, fibra, kcal },
    }]);
    setPlanResult(null);
    setSelectedMeal(null);
  };

  // Filter foods for lista
  const filteredAlimentos = allAlimentos.filter((a: AlimentoDisponible) => {
    const matchCat = categoriaFilter === 'Todos' || a.Categoria === categoriaFilter;
    const matchSearch = !alimentoSearch || a.Nombre.toLowerCase().includes(alimentoSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const groupedAlimentos = filteredAlimentos.reduce((acc: Record<string, AlimentoDisponible[]>, a: AlimentoDisponible) => {
    if (!acc[a.Categoria]) acc[a.Categoria] = [];
    acc[a.Categoria].push(a);
    return acc;
  }, {});

  return (
    <div className="gp-page">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb my-breadcrumb">
          <li className="breadcrumb-item"><a href="/dashboard">Inicio</a></li>
          <li className="breadcrumb-item active" aria-current="page">Generador de Plan Nutricional</li>
        </ol>
      </nav>

      <div className="welcome-msg pt-3 pb-4">
        <h1>Generador de Plan Nutricional</h1>
      </div>

      {/* User selection */}
      <div className="card card_border py-2 mb-4">
        <div className="cards__heading">
          <h3>Selección de Usuario <span></span></h3>
        </div>
        <div className="card-body">
          {userType === 'U' ? (
            <div className="gp-user-fixed">
              <div className="gp-user-info">
                <i className="fa fa-user-circle"></i>
                <span>Generando plan para: <strong>{localStorage.getItem('userName')}</strong></span>
              </div>
            </div>
          ) : (
            <div>
              {selectedUsuario ? (
                <div className="gp-usuario-badge">
                  <i className="fa fa-user"></i>
                  <span>{selectedUsuario.Nombre} {selectedUsuario.Prim_Apellido}</span>
                  <button onClick={limpiarUsuario} title="Cambiar usuario">&times;</button>
                </div>
              ) : (
                <div className="gp-search-wrapper">
                  <input
                    type="text"
                    className="form-control input-style"
                    placeholder="Buscá por nombre o apellido..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
                    autoComplete="off"
                  />
                  {showResults && searchResults.length > 0 && (
                    <div className="gp-search-results">
                      {searchResults.map(u => (
                        <div key={u.Id_Usuario} className="gp-search-item" onClick={() => seleccionarUsuario(u)}>
                          <i className="fa fa-user"></i>
                          <span>{u.Nombre} {u.Prim_Apellido} {u.Seg_Apellido}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="gp-tabs-container">
        <div className="gp-tabs">
          <button
            className={`gp-tab-btn ${activeTab === 'planner' ? 'active' : ''}`}
            onClick={() => setActiveTab('planner')}
          >
            🍽️ Generador de Plan
          </button>
          <button
            className={`gp-tab-btn ${activeTab === 'recetas' ? 'active' : ''}`}
            onClick={() => setActiveTab('recetas')}
          >
            👨‍🍳 Ideas de Comidas (IA)
          </button>
          <button
            className={`gp-tab-btn ${activeTab === 'lista' ? 'active' : ''}`}
            onClick={() => setActiveTab('lista')}
          >
            📋 Lista de Alimentos
          </button>
        </div>
      </div>

      {/* ── TAB: PLANNER ── */}
      {activeTab === 'planner' && (
        <div className="gp-tab-panel">
          {/* Meal selector */}
          <div className="gp-meal-selector">
            {TIEMPOS_COMIDA.map(m => (
              <button
                key={m.key}
                className={`gp-meal-btn ${selectedMeal === m.key ? 'active' : ''}`}
                onClick={() => { setSelectedMeal(m.key); setPlanResult(null); }}
              >
                <span className="gp-ms-icon"><i className={`fa ${m.icon}`}></i></span>
                <span className="gp-ms-name">{m.label}</span>
                <span className="gp-ms-time">{m.time}</span>
              </button>
            ))}
          </div>

          {/* Macros card */}
          {selectedMeal && (
            <div className="gp-macros-card">
              <div className="gp-macros-title">
                🌅 {TIEMPOS_COMIDA.find(m => m.key === selectedMeal)?.label} — Metas nutricionales
              </div>
              <div className="gp-macros-grid">
                <div className="gp-macro-field">
                  <label>🌾 Carbohidratos</label>
                  <input
                    type="number"
                    className="gp-macro-input"
                    placeholder="0"
                    min={0}
                    value={macros.carb || ''}
                    onChange={e => setMacros(m => ({ ...m, carb: Number(e.target.value) || 0 }))}
                  />
                  <div className="gp-macro-unit">gramos</div>
                </div>
                <div className="gp-macro-field">
                  <label>💪 Proteínas</label>
                  <input
                    type="number"
                    className="gp-macro-input"
                    placeholder="0"
                    min={0}
                    value={macros.prot || ''}
                    onChange={e => setMacros(m => ({ ...m, prot: Number(e.target.value) || 0 }))}
                  />
                  <div className="gp-macro-unit">gramos</div>
                </div>
                <div className="gp-macro-field">
                  <label>🥑 Grasas</label>
                  <input
                    type="number"
                    className="gp-macro-input"
                    placeholder="0"
                    min={0}
                    value={macros.grasa || ''}
                    onChange={e => setMacros(m => ({ ...m, grasa: Number(e.target.value) || 0 }))}
                  />
                  <div className="gp-macro-unit">gramos</div>
                </div>
                <div className="gp-macro-field">
                  <label>🌿 Fibra</label>
                  <input
                    type="number"
                    className="gp-macro-input"
                    placeholder="0"
                    min={0}
                    value={macros.fibra || ''}
                    onChange={e => setMacros(m => ({ ...m, fibra: Number(e.target.value) || 0 }))}
                  />
                  <div className="gp-macro-unit">gramos</div>
                </div>
              </div>

              {/* Vegan toggle */}
              <div className="gp-toggle-row">
                <label className="gp-toggle-switch">
                  <input type="checkbox" checked={esVegano} onChange={e => setEsVegano(e.target.checked)} />
                  <span className="gp-toggle-slider"></span>
                </label>
                <div>
                  <div className="gp-toggle-label">🌿 Modo vegano</div>
                  <div className="gp-toggle-sub">Solo legumbres como fuente de proteínas</div>
                </div>
              </div>

              <div className="gp-actions-row">
                <button
                  className="gp-btn gp-btn-primary"
                  onClick={handleGenerarPlan}
                  disabled={mutation.isPending}
                >
                  ⚡ {mutation.isPending ? 'Generando...' : 'Generar Plan'}
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {planResult && (
            <div className="gp-results-card">
              <div className="gp-results-title">Alimentos seleccionados</div>
              <table className="gp-results-table">
                <thead>
                  <tr>
                    <th>Alimento</th>
                    <th>Categoría</th>
                    <th>Porción (g)</th>
                    <th>Energía (kcal)</th>
                  </tr>
                </thead>
                <tbody>
                  {planResult.Alimentos.map((a, i) => (
                    <tr key={i}>
                      <td>{a.Nombre}</td>
                      <td>{a.Categoria}</td>
                      <td>{a.Porcion_g}</td>
                      <td>{Math.round(a.Energia_kcal * (a.Porcion_g / 100))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2}><strong>Total</strong></td>
                    <td><strong>{planResult.TotalCarbohidratos + planResult.TotalProteina + planResult.TotalGrasa}</strong></td>
                    <td><strong>{planResult.TotalEnergia}</strong></td>
                  </tr>
                </tfoot>
              </table>

              <div className="gp-result-actions">
                <button className="gp-btn gp-btn-primary" onClick={confirmarPlan}>
                  ✅ Confirmar plan
                </button>
                <button className="gp-btn gp-btn-outline" onClick={() => setPlanResult(null)}>
                  ✏️ Modificar
                </button>
              </div>
            </div>
          )}

          {/* Acumulados sidebar */}
          {acumulados.length > 0 && (
            <div className="gp-acumulados">
              <div className="gp-acumulados-title">Planes confirmados</div>
              {acumulados.map((a, i) => (
                <div key={i} className="gp-acumulado-item">
                  <div className="gp-acum-header">
                    <i className={`fa ${TIEMPOS_COMIDA.find(t => t.key === a.tiempoComida)?.icon}`}></i>
                    {a.tiempoComida}
                  </div>
                  <div className="gp-acum-macros">
                    CHO: {a.macros.cho}g | Prot: {a.macros.prot}g | Grasa: {a.macros.grasa}g | {a.macros.kcal} kcal
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: RECETAS IA ── */}
      {activeTab === 'recetas' && (
        <div className="gp-tab-panel">
          <div className="gp-ia-empty">
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🍽️</div>
            <div>Primero generá y confirmá tu plan en la pestaña <strong>Generador de Plan</strong>.</div>
          </div>
        </div>
      )}

      {/* ── TAB: LISTA ── */}
      {activeTab === 'lista' && (
        <div className="gp-tab-panel">
          <div className="gp-section-title">Lista de Alimentos</div>

          {/* Search */}
          <div className="gp-search-wrapper" style={{ marginBottom: '1rem' }}>
            <span className="gp-search-icon">🔍</span>
            <input
              type="text"
              className="gp-search-box"
              placeholder="Buscar alimento..."
              value={alimentoSearch}
              onChange={e => setAlimentoSearch(e.target.value)}
            />
          </div>

          {/* Category chips */}
          <div className="gp-chips">
            {CATEGORIAS.map(cat => (
              <button
                key={cat}
                className={`gp-chip ${categoriaFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoriaFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Food groups */}
          {!selectedUsuario ? (
            <div className="gp-empty-state">
              <i className="fa fa-user"></i>
              <p>Seleccione un usuario para ver los alimentos disponibles.</p>
            </div>
          ) : (
            <div>
              {Object.entries(groupedAlimentos).map(([cat, foods]) => (
                <div key={cat} className="gp-food-group">
                  <div className="gp-food-group-title">{cat}</div>
                  <div className="gp-food-grid">
                    {(foods as AlimentoDisponible[]).map(f => (
                      <div key={f.Id_Alimento} className="gp-food-card">
                        <div className="gp-food-name">{f.Nombre}</div>
                        <div className="gp-food-energy">{f.Energia_kcal} kcal / 100g</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeneradorPlan;
