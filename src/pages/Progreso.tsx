import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getConsultas, getBioquimicos, getHistoria } from '../api/progreso';
import { getUsuarios, type Usuario } from '../api/usuarios';
import './Progreso.css';

declare const Chart: any;

type TabType = 'corporal' | 'presion' | 'bioquimicos' | 'notas';

const Progreso: React.FC = () => {
  const userName = localStorage.getItem('userName') || 'Usuario';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userType = localStorage.getItem('userType') || 'U';
  const userId = Number(localStorage.getItem('userId') || '0');

  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Usuario[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('corporal');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Gráficos - se crean y destruyen con el tab activo
  const [chartInstances, setChartInstances] = useState<Record<string, any>>({});

  // Si es usuario normal, cargar su propio progreso automáticamente
  useEffect(() => {
    if (userType === 'U' && userId > 0) {
      getUsuarios({}).then((usuarios) => {
        const yo = (usuarios as Usuario[]).find((u) => u.Id_Usuario === userId);
        if (yo) {
          setSelectedUsuario(yo);
        }
      });
    }
  }, [userType, userId]);

  // Búsqueda de usuarios con debounce
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

  const seleccionarUsuario = (u: Usuario) => {
    setSelectedUsuario(u);
    setSearchTerm('');
    setShowResults(false);
  };

  const limpiarUsuario = () => {
    setSelectedUsuario(null);
  };

  // Queries para datos
  const { data: consultas = [], isLoading: loadingConsultas } = useQuery({
    queryKey: ['consultas', selectedUsuario?.Id_Usuario],
    queryFn: () => getConsultas(selectedUsuario!.Id_Usuario),
    enabled: !!selectedUsuario,
  });

  const { data: bioquimicos = [] } = useQuery({
    queryKey: ['bioquimicos', selectedUsuario?.Id_Usuario],
    queryFn: () => getBioquimicos(selectedUsuario!.Id_Usuario),
    enabled: !!selectedUsuario,
  });

  const { data: historia = [] } = useQuery({
    queryKey: ['historia', selectedUsuario?.Id_Usuario],
    queryFn: () => getHistoria(selectedUsuario!.Id_Usuario),
    enabled: !!selectedUsuario,
  });

  // Destruir todos los gráficos al desmontar
  useEffect(() => {
    return () => {
      Object.values(chartInstances).forEach((chart: any) => chart?.destroy?.());
    };
  }, []);

  // Destruir gráficos cuando cambia el tab
  useEffect(() => {
    Object.values(chartInstances).forEach((chart: any) => chart?.destroy?.());
    setChartInstances({});
  }, [activeTab]);

  // Crear gráfico individual
  const crearGrafico = (canvasId: string, config: any) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;
    
    // Destruir anterior si existe
    if (chartInstances[canvasId]) {
      chartInstances[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, config);
    setChartInstances(prev => ({ ...prev, [canvasId]: chart }));
  };

  // Gráfico de Peso
  useEffect(() => {
    if (activeTab !== 'corporal' || !consultas.length) return;
    
    const labels = consultas.map((c) => c.Fecha).reverse();
    const pesos = consultas.map((c) => c.Peso).reverse();

    crearGrafico('chartPeso', {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Peso (kg)',
          data: pesos,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
        },
        scales: {
          y: { beginAtZero: false }
        }
      }
    });
  }, [activeTab, consultas]);

  // Gráfico de IMC
  useEffect(() => {
    if (activeTab !== 'corporal' || !consultas.length) return;
    
    const labels = consultas.map((c) => c.Fecha).reverse();
    const imcs = consultas.map((c) => c.IMC).reverse();

    crearGrafico('chartIMC', {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'IMC',
          data: imcs,
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top' } },
        scales: { y: { beginAtZero: false } }
      }
    });
  }, [activeTab, consultas]);

  // Gráfico de Composición Corporal
  useEffect(() => {
    if (activeTab !== 'corporal' || !consultas.length) return;
    
    const labels = consultas.map((c) => c.Fecha).reverse();
    const grasa = consultas.map((c) => c.Grasa).reverse();
    const musculo = consultas.map((c) => c.Musculo).reverse();

    crearGrafico('chartComposicion', {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Grasa (%)', data: grasa, borderColor: '#f44336', backgroundColor: 'rgba(244, 67, 54, 0.1)', fill: true, tension: 0.3, pointRadius: 4 },
          { label: 'Músculo (%)', data: musculo, borderColor: '#9C27B0', backgroundColor: 'rgba(156, 39, 176, 0.1)', fill: true, tension: 0.3, pointRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top' } },
        scales: { y: { beginAtZero: false } }
      }
    });
  }, [activeTab, consultas]);

  // Gráfico de Circunferencias
  useEffect(() => {
    if (activeTab !== 'corporal' || !consultas.length) return;
    
    const labels = consultas.map((c) => c.Fecha).reverse();
    const cintura = consultas.map((c) => c.Cintura).reverse();
    const cadera = consultas.map((c) => c.Cadera).reverse();

    crearGrafico('chartCircunferencias', {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Cintura (cm)', data: cintura, borderColor: '#FF9800', backgroundColor: 'rgba(255, 152, 0, 0.1)', fill: true, tension: 0.3, pointRadius: 4 },
          { label: 'Cadera (cm)', data: cadera, borderColor: '#00BCD4', backgroundColor: 'rgba(0, 188, 212, 0.1)', fill: true, tension: 0.3, pointRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top' } },
        scales: { y: { beginAtZero: false } }
      }
    });
  }, [activeTab, consultas]);

  // Gráfico de Presión Arterial
  useEffect(() => {
    if (activeTab !== 'presion' || !consultas.length) return;
    
    const labels = consultas.map((c) => c.Fecha).reverse();
    const sistolica = consultas.map((c) => c.Sistolica).reverse();
    const diastolica = consultas.map((c) => c.Diastolica).reverse();

    crearGrafico('chartPresion', {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Sistólica (mmHg)', data: sistolica, borderColor: '#E91E63', backgroundColor: 'rgba(233, 30, 99, 0.1)', fill: true, tension: 0.3, pointRadius: 4 },
          { label: 'Diastólica (mmHg)', data: diastolica, borderColor: '#3F51B5', backgroundColor: 'rgba(63, 81, 181, 0.1)', fill: true, tension: 0.3, pointRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top' } },
        scales: { y: { beginAtZero: false } }
      }
    });
  }, [activeTab, consultas]);

  const getSemaphoreColor = (value: number | null, normal: [number, number]): string => {
    if (value === null) return '#9e9e9e';
    if (value < normal[0] || value > normal[1]) return '#f44336';
    return '#4CAF50';
  };

  const bioquimico = bioquimicos[0];
  const ultimaHistoria = historia[0];

  const showEmptyState = selectedUsuario && consultas.length === 0 && !loadingConsultas;
  const showContent = selectedUsuario && consultas.length > 0;
  const showSearch = userType !== 'U';

  const nombreCompleto = selectedUsuario 
    ? `${selectedUsuario.Nombre} ${selectedUsuario.Prim_Apellido} ${selectedUsuario.Seg_Apellido}`.trim()
    : '';

  return (
    <div className="progreso-page">
      <nav className="cm-breadcrumb">
        <span onClick={() => navigate('/dashboard')} className="cm-bc-link">Inicio</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span className="cm-bc-active">Mi Progreso</span>
      </nav>

      <div className="welcome-msg pt-3 pb-4">
        <h1>Hola <span className="text-primary">{userName}</span>, Bienvenido</h1>
        <p>{userEmail}</p>
      </div>

      {/* Búsqueda de paciente - solo Admin y Médico */}
      {showSearch && (
        <div className="card card_border py-2 mb-4">
          <div className="cards__heading">
            <h3>Selección de Paciente <span></span></h3>
          </div>
          <div className="card-body">
            {selectedUsuario ? (
              <div className="pg-usuario-seleccionado">
                <div className="pg-usuario-info">
                  <div className="pg-usuario-avatar">{nombreCompleto.charAt(0)}</div>
                  <div className="pg-usuario-nombre">{nombreCompleto}</div>
                </div>
                <button className="pg-btn-cambiar" onClick={limpiarUsuario}>Cambiar</button>
              </div>
            ) : (
              <div className="form-group">
                <label className="input__label">Paciente *</label>
                <div className="pg-search-container">
                  <span className="pg-search-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </span>
                  <input
                    type="text"
                    className="form-control input-style pg-search-input"
                    placeholder="Buscar paciente por nombre..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    autoComplete="off"
                  />
                  {showResults && searchResults.length > 0 && (
                    <div className="pg-search-dropdown">
                      {searchResults.map((u) => (
                        <div key={u.Id_Usuario} className="pg-search-item" onClick={() => seleccionarUsuario(u)}>
                          <div className="pg-search-nombre">{u.Nombre} {u.Prim_Apellido} {u.Seg_Apellido}</div>
                          <div className="pg-search-email">{u.Correo}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {showContent && (
        <>
          {/* Header paciente */}
          <div className="pg-patient-header">
            <div className="pg-patient-avatar">{nombreCompleto.charAt(0)}</div>
            <div className="pg-patient-info">
              <div className="pg-patient-name">{nombreCompleto}</div>
              <div className="pg-patient-meta">{selectedUsuario?.Correo}</div>
            </div>
          </div>

          {/* Filtro de fechas */}
          <div className="pg-filter-bar">
            <span className="pg-filter-label">Período</span>
            <div className="pg-filter-group">
              <label className="pg-filter-input-label">Desde</label>
              <input type="date" className="pg-filter-input" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
            </div>
            <div className="pg-filter-group">
              <label className="pg-filter-input-label">Hasta</label>
              <input type="date" className="pg-filter-input" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
            </div>
            <button className="pg-filter-reset" onClick={() => { setFechaDesde(''); setFechaHasta(''); }}>↺ Todas</button>
          </div>

          {/* Tabs */}
          <div className="pg-tabs-container">
            <div className="pg-tabs">
              <button className={`pg-tab-btn ${activeTab === 'corporal' ? 'active' : ''}`} onClick={() => setActiveTab('corporal')}>⚖️ Evolución Corporal</button>
              <button className={`pg-tab-btn ${activeTab === 'presion' ? 'active' : ''}`} onClick={() => setActiveTab('presion')}>🫀 Presión Arterial</button>
              <button className={`pg-tab-btn ${activeTab === 'bioquimicos' ? 'active' : ''}`} onClick={() => setActiveTab('bioquimicos')}>🔬 Estado Actual</button>
              <button className={`pg-tab-btn ${activeTab === 'notas' ? 'active' : ''}`} onClick={() => setActiveTab('notas')}>📋 Notas Clínicas</button>
            </div>
          </div>

          {/* Tab: Evolución Corporal */}
          {activeTab === 'corporal' && (
            <div className="pg-tab-content">
              <div className="pg-cards-row">
                <div className="pg-summary-card">
                  <div className="pg-summary-label">Peso Actual</div>
                  <div className="pg-summary-value">{consultas[consultas.length - 1]?.Peso ?? '-'} <span className="pg-summary-unit">kg</span></div>
                </div>
                <div className="pg-summary-card">
                  <div className="pg-summary-label">IMC Actual</div>
                  <div className="pg-summary-value">{consultas[consultas.length - 1]?.IMC ?? '-'}</div>
                </div>
                <div className="pg-summary-card">
                  <div className="pg-summary-label">Grasa Actual</div>
                  <div className="pg-summary-value">{consultas[consultas.length - 1]?.Grasa ?? '-'} <span className="pg-summary-unit">%</span></div>
                </div>
                <div className="pg-summary-card">
                  <div className="pg-summary-label">Músculo Actual</div>
                  <div className="pg-summary-value">{consultas[consultas.length - 1]?.Musculo ?? '-'} <span className="pg-summary-unit">%</span></div>
                </div>
              </div>

              <div className="pg-chart-card">
                <div className="pg-chart-title">📈 Evolución del Peso</div>
                <div className="pg-chart-wrap"><canvas id="chartPeso"></canvas></div>
              </div>

              <div className="pg-chart-card">
                <div className="pg-chart-title">📊 Índice de Masa Corporal (IMC)</div>
                <div className="pg-chart-wrap"><canvas id="chartIMC"></canvas></div>
              </div>

              <div className="pg-chart-card">
                <div className="pg-chart-title">💪 Composición Corporal — Grasa vs Músculo</div>
                <div className="pg-chart-wrap"><canvas id="chartComposicion"></canvas></div>
              </div>

              <div className="pg-chart-card">
                <div className="pg-chart-title">📏 Circunferencias — Cintura y Cadera</div>
                <div className="pg-chart-wrap"><canvas id="chartCircunferencias"></canvas></div>
              </div>
            </div>
          )}

          {/* Tab: Presión Arterial */}
          {activeTab === 'presion' && (
            <div className="pg-tab-content">
              <div className="pg-chart-card pg-chart-card--full">
                <div className="pg-chart-title">🫀 Evolución de la Presión Arterial</div>
                <div className="pg-pa-legend">
                  <span className="pg-pa-badge normal">✅ Normal (&lt;120/80)</span>
                  <span className="pg-pa-badge elevada">⚠️ Elevada (120-129)</span>
                  <span className="pg-pa-badge alta">🔴 Alta (≥130/80)</span>
                </div>
                <div className="pg-chart-wrap pg-chart-wrap--large"><canvas id="chartPresion"></canvas></div>
              </div>
            </div>
          )}

          {/* Tab: Bioquímicos */}
          {activeTab === 'bioquimicos' && (
            <div className="pg-tab-content">
              {bioquimico ? (
                <>
                  <div className="pg-bio-fecha">
                    <i className="fa fa-calendar"></i> Última actualización: {bioquimico.Fecha}
                  </div>

                  <div className="pg-section-title">🩸 Perfil Lipídico y Metabólico</div>
                  <div className="pg-semaforo-grid">
                    <div className="pg-semaforo-item" style={{ borderLeftColor: getSemaphoreColor(bioquimico.ColesterolTotal, [0, 200]) }}>
                      <div className="pg-semaforo-label">Colesterol Total</div>
                      <div className="pg-semaforo-value">{bioquimico.ColesterolTotal ?? '-'}</div>
                      <div className="pg-semaforo-unit">mg/dL</div>
                    </div>
                    <div className="pg-semaforo-item" style={{ borderLeftColor: getSemaphoreColor(bioquimico.HDL, [40, 60]) }}>
                      <div className="pg-semaforo-label">HDL (Bueno)</div>
                      <div className="pg-semaforo-value">{bioquimico.HDL ?? '-'}</div>
                      <div className="pg-semaforo-unit">mg/dL</div>
                    </div>
                    <div className="pg-semaforo-item" style={{ borderLeftColor: getSemaphoreColor(bioquimico.LDL, [0, 100]) }}>
                      <div className="pg-semaforo-label">LDL (Malo)</div>
                      <div className="pg-semaforo-value">{bioquimico.LDL ?? '-'}</div>
                      <div className="pg-semaforo-unit">mg/dL</div>
                    </div>
                    <div className="pg-semaforo-item" style={{ borderLeftColor: getSemaphoreColor(bioquimico.Trigliceridos, [0, 150]) }}>
                      <div className="pg-semaforo-label">Triglicéridos</div>
                      <div className="pg-semaforo-value">{bioquimico.Trigliceridos ?? '-'}</div>
                      <div className="pg-semaforo-unit">mg/dL</div>
                    </div>
                    <div className="pg-semaforo-item" style={{ borderLeftColor: getSemaphoreColor(bioquimico.Glicemia, [70, 100]) }}>
                      <div className="pg-semaforo-label">Glicemia</div>
                      <div className="pg-semaforo-value">{bioquimico.Glicemia ?? '-'}</div>
                      <div className="pg-semaforo-unit">mg/dL</div>
                    </div>
                  </div>

                  <div className="pg-section-title">🔬 Otros Indicadores</div>
                  <div className="pg-semaforo-grid">
                    <div className="pg-semaforo-item" style={{ borderLeftColor: getSemaphoreColor(bioquimico.Hemoglobina, [12, 17]) }}>
                      <div className="pg-semaforo-label">Hemoglobina</div>
                      <div className="pg-semaforo-value">{bioquimico.Hemoglobina ?? '-'}</div>
                      <div className="pg-semaforo-unit">g/dL</div>
                    </div>
                    <div className="pg-semaforo-item" style={{ borderLeftColor: getSemaphoreColor(bioquimico.Hematocrito, [36, 50]) }}>
                      <div className="pg-semaforo-label">Hematocrito</div>
                      <div className="pg-semaforo-value">{bioquimico.Hematocrito ?? '-'}</div>
                      <div className="pg-semaforo-unit">%</div>
                    </div>
                    <div className="pg-semaforo-item" style={{ borderLeftColor: getSemaphoreColor(bioquimico.AcidoUrico, [2.5, 7]) }}>
                      <div className="pg-semaforo-label">Ácido Úrico</div>
                      <div className="pg-semaforo-value">{bioquimico.AcidoUrico ?? '-'}</div>
                      <div className="pg-semaforo-unit">mg/dL</div>
                    </div>
                    <div className="pg-semaforo-item" style={{ borderLeftColor: getSemaphoreColor(bioquimico.Creatinina, [0.7, 1.3]) }}>
                      <div className="pg-semaforo-label">Creatinina</div>
                      <div className="pg-semaforo-value">{bioquimico.Creatinina ?? '-'}</div>
                      <div className="pg-semaforo-unit">mg/dL</div>
                    </div>
                    <div className="pg-semaforo-item" style={{ borderLeftColor: getSemaphoreColor(bioquimico.TSH, [0.4, 4]) }}>
                      <div className="pg-semaforo-label">TSH</div>
                      <div className="pg-semaforo-value">{bioquimico.TSH ?? '-'}</div>
                      <div className="pg-semaforo-unit">μIU/mL</div>
                    </div>
                    <div className="pg-semaforo-item" style={{ borderLeftColor: getSemaphoreColor(bioquimico.VitaminaD, [30, 100]) }}>
                      <div className="pg-semaforo-label">Vitamina D</div>
                      <div className="pg-semaforo-value">{bioquimico.VitaminaD ?? '-'}</div>
                      <div className="pg-semaforo-unit">ng/mL</div>
                    </div>
                  </div>

                  {ultimaHistoria && (
                    <>
                      <div className="pg-section-title">🏃 Hábitos y Estilo de Vida</div>
                      <div className="pg-habitos-grid">
                        <div className="pg-habito-item">
                          <div className="pg-habito-icon">😴</div>
                          <div className="pg-habito-content">
                            <div className="pg-habito-label">Calidad del Sueño</div>
                            <div className="pg-habito-value">{ultimaHistoria.CalidadSueno || '-'}</div>
                          </div>
                        </div>
                        <div className="pg-habito-item">
                          <div className="pg-habito-icon">🚽</div>
                          <div className="pg-habito-content">
                            <div className="pg-habito-label">Función Intestinal</div>
                            <div className="pg-habito-value">{ultimaHistoria.FuncionIntestinal || '-'}</div>
                          </div>
                        </div>
                        <div className="pg-habito-item">
                          <div className="pg-habito-icon">🚬</div>
                          <div className="pg-habito-content">
                            <div className="pg-habito-label">¿Fuma?</div>
                            <div className="pg-habito-value">{ultimaHistoria.Fuma ? 'Sí' : 'No'}</div>
                          </div>
                        </div>
                        <div className="pg-habito-item">
                          <div className="pg-habito-icon">🍷</div>
                          <div className="pg-habito-content">
                            <div className="pg-habito-label">¿Consume Alcohol?</div>
                            <div className="pg-habito-value">{ultimaHistoria.Alcohol ? 'Sí' : 'No'}</div>
                          </div>
                        </div>
                        <div className="pg-habito-item">
                          <div className="pg-habito-icon">🏃</div>
                          <div className="pg-habito-content">
                            <div className="pg-habito-label">Actividad Física</div>
                            <div className="pg-habito-value">{ultimaHistoria.ActividadFisica || '-'}</div>
                          </div>
                        </div>
                        <div className="pg-habito-item">
                          <div className="pg-habito-icon">💧</div>
                          <div className="pg-habito-content">
                            <div className="pg-habito-label">Ingesta de Agua</div>
                            <div className="pg-habito-value">{ultimaHistoria.Agua || '-'}</div>
                          </div>
                        </div>
                        <div className="pg-habito-item pg-habito-item--full">
                          <div className="pg-habito-icon">💊</div>
                          <div className="pg-habito-content">
                            <div className="pg-habito-label">Medicamentos</div>
                            <div className="pg-habito-value">{ultimaHistoria.Medicamentos || '-'}</div>
                          </div>
                        </div>
                        <div className="pg-habito-item pg-habito-item--full">
                          <div className="pg-habito-icon">⚠️</div>
                          <div className="pg-habito-content">
                            <div className="pg-habito-label">Intolerancias / Alergias</div>
                            <div className="pg-habito-value">{ultimaHistoria.Intolerancias || '-'} / {ultimaHistoria.Alergias || '-'}</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="pg-empty">
                  <div className="pg-empty-icon">🔬</div>
                  <div className="pg-empty-title">Sin análisis bioquímicos</div>
                  <div className="pg-empty-sub">No hay registros de análisis bioquímicos para este paciente.</div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Notas Clínicas */}
          {activeTab === 'notas' && (
            <div className="pg-tab-content">
              <div className="pg-section-title">📋 Historial de Consultas</div>
              {consultas.length > 0 ? (
                <div className="pg-timeline">
                  {consultas.map((consulta, index) => (
                    <div key={index} className="pg-timeline-item">
                      <div className="pg-timeline-date">
                        <div className="pg-timeline-day">{new Date(consulta.Fecha).getDate()}</div>
                        <div className="pg-timeline-month">{new Date(consulta.Fecha).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</div>
                      </div>
                      <div className="pg-timeline-content">
                        <div className="pg-timeline-header">
                          <span className="pg-timeline-medico">👨‍⚕️ {consulta.Medico}</span>
                        </div>
                        {consulta.Observaciones && (
                          <div className="pg-timeline-observaciones">{consulta.Observaciones}</div>
                        )}
                        {consulta.Recomendaciones && (
                          <div className="pg-timeline-recomendaciones">
                            <strong>💡 Recomendaciones:</strong> {consulta.Recomendaciones}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pg-empty">
                  <div className="pg-empty-icon">📋</div>
                  <div className="pg-empty-title">Sin consultas registradas</div>
                  <div className="pg-empty-sub">No hay consultas en el historial de este paciente.</div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Empty state cuando no hay usuario seleccionado */}
      {!selectedUsuario && !showSearch && (
        <div className="pg-empty">
          <div className="pg-empty-icon">📊</div>
          <div className="pg-empty-title">Cargando...</div>
          <div className="pg-empty-sub">Obteniendo información del paciente.</div>
        </div>
      )}

      {/* Empty state cuando no hay datos */}
      {showEmptyState && (
        <div className="pg-empty">
          <div className="pg-empty-icon">📊</div>
          <div className="pg-empty-title">Sin datos registrados</div>
          <div className="pg-empty-sub">Aún no hay consultas completadas con métricas para este paciente.</div>
        </div>
      )}

      {/* Spinner */}
      {loadingConsultas && (
        <div className="pg-spinner-wrap">
          <div className="pg-spinner-dot"></div>
          <div className="pg-spinner-text">Cargando datos...</div>
        </div>
      )}
    </div>
  );
};

export default Progreso;
