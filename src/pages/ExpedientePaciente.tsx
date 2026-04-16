import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getHistoriaClinica,
  updateHistoriaClinica,
  getAnalisisBioquimicoList,
  saveAnalisisBioquimico,
} from '../api/expediente';
import { getUsuarioById } from '../api/usuarios';
<<<<<<< HEAD
import { getConsultas } from '../api/consultas';
import { getConsultas as getProgresoConsultas } from '../api/progreso';
import { useRef } from 'react';
declare const Chart: any;
=======
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
import type {
  AnalisisBioquimicoResponse,
  SaveHistoriaClinicaData,
  SaveAnalisisBioquimicoData,
} from '../api/expediente';
<<<<<<< HEAD
import type { Consulta } from '../api/consultas';
=======
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
import './ExpedientePaciente.css';


const ExpedientePaciente: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'hc' | 'ab'>('hc');
<<<<<<< HEAD
  const [userActiveTab, setUserActiveTab] = useState<'citas' | 'graficos'>('citas');
  const [selectedConsultaId, setSelectedConsultaId] = useState<number | null>(null);

  // Info del usuario logueado (para auditoría y control de vista)
  const [currentUserId, setCurrentUserId] = useState(0);
  const [userType, setUserType] = useState<string>('M');

  // Graficos refs
  const refPeso = useRef<HTMLCanvasElement>(null);
  const refIMC = useRef<HTMLCanvasElement>(null);
  const refCompos = useRef<HTMLCanvasElement>(null);
  const refPresion = useRef<HTMLCanvasElement>(null);
  const instPeso = useRef<any>(null);
  const instIMC = useRef<any>(null);
  const instCompos = useRef<any>(null);
  const instPresion = useRef<any>(null);

  useEffect(() => {
    const uid = Number(localStorage.getItem('userId') || '0');
    const tipo = localStorage.getItem('userType') || 'M';
    setCurrentUserId(uid);
    setUserType(tipo);
  }, []);

  const isUsuario = userType === 'U';

=======

  // Info del usuario logueado (para auditoría)
  const [currentUserId, setCurrentUserId] = useState(0);

  useEffect(() => {
    const id = Number(localStorage.getItem('userId') || '0');
    setCurrentUserId(id);
  }, []);

>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
  // Info del paciente
  const { data: pacienteInfo } = useQuery({
    queryKey: ['usuario-info', id],
    queryFn: () => getUsuarioById(Number(id)),
    enabled: Boolean(id),
  });

  // ── Historia Clínica ────────────────────────────────
  const { data: historiaClinica, isLoading: loadingHC } = useQuery({
    queryKey: ['historia-clinica', id],
    queryFn: () => getHistoriaClinica(Number(id)),
    enabled: Boolean(id),
  });

  const [hcForm, setHcForm] = useState<SaveHistoriaClinicaData>({
    Fuma: false,
    Consume_Alcohol: false,
    Frecuencia_Alcohol: '',
    Embarazo: false,
    Lactancia: false,
    Intolerancias: '',
    Alergias_Alimentarias: '',
  });

  useEffect(() => {
    if (historiaClinica) {
      setHcForm({
        Fuma: historiaClinica.Fuma || false,
        Consume_Alcohol: historiaClinica.Consume_Alcohol || false,
        Frecuencia_Alcohol: historiaClinica.Frecuencia_Alcohol || '',
        Embarazo: historiaClinica.Embarazo || false,
        Lactancia: historiaClinica.Lactancia || false,
        Intolerancias: historiaClinica.Intolerancias || '',
        Alergias_Alimentarias: historiaClinica.Alergias_Alimentarias || '',
      });
    }
  }, [historiaClinica]);

  const hcSaveMutation = useMutation({
    mutationFn: (data: SaveHistoriaClinicaData) =>
      updateHistoriaClinica(Number(id), { ...data, IdUsuario_Modificacion: currentUserId }),
    onSuccess: () => {
      alert('Historia clínica guardada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['historia-clinica', id] });
    },
    onError: (err: any) => alert(err?.response?.data?.error || 'Error al guardar'),
  });

  // ── Análisis Bioquímico ─────────────────────────────
  const { data: analisisList = [], isLoading: loadingAB } = useQuery({
    queryKey: ['analisis-bioquimico', id],
    queryFn: () => getAnalisisBioquimicoList(Number(id)),
<<<<<<< HEAD
    enabled: Boolean(id) && !isUsuario,
  });

  // ── Consultas del paciente (sólo para vista U) ───────
  const { data: consultasPaciente = [], isLoading: loadingConsultas } = useQuery({
    queryKey: ['consultas-paciente', id],
    queryFn: () => getConsultas({ Id_Usuario: Number(id) }),
    enabled: Boolean(id) && isUsuario,
  });

  // ── Datos de Progreso (solo para vista U - graficos) ──
  const { data: progresoData = [] } = useQuery({
    queryKey: ['progreso-paciente', id],
    queryFn: () => getProgresoConsultas(Number(id)),
    enabled: Boolean(id) && isUsuario && userActiveTab === 'graficos',
  });

  // Efecto para inicializar gráficos
  useEffect(() => {
    if (!isUsuario || userActiveTab !== 'graficos' || progresoData.length === 0) return;

    const baseOptions = (yLabel = '') => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' as const } },
      scales: {
        y: { title: { display: !!yLabel, text: yLabel } }
      }
    });

    const labels = progresoData.map((c: any) => {
      const d = new Date(c.Fecha_Cita || c.Fecha_Consulta || c.Fecha);
      return d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short' });
    });

    // Chart Helper
    const createChart = (canvas: HTMLCanvasElement | null, inst: React.MutableRefObject<any>, label: string, data: any[], color: string) => {
      if (!canvas) return;
      inst.current?.destroy();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        inst.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label,
              data,
              borderColor: color,
              backgroundColor: color + '20',
              fill: true,
              tension: 0.3
            }]
          },
          options: baseOptions()
        });
      }
    };

    createChart(refPeso.current, instPeso, 'Peso (kg)', progresoData.map((c: any) => c.PesoKg || c.Peso_kg), '#006c49');
    createChart(refIMC.current, instIMC, 'IMC', progresoData.map((c: any) => c.IMC || c.Imc), '#3b82f6');
    
    // Gráfico compuesto (Grasa y Músculo)
    if (refCompos.current) {
      instCompos.current?.destroy();
      const ctx = refCompos.current.getContext('2d');
      if (ctx) {
        instCompos.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              { label: 'Grasa (%)', data: progresoData.map((c: any) => c.Grasa_Porcentaje || c.Grasa_g), borderColor: '#ef4444', tension: 0.3 },
              { label: 'Músculo (%)', data: progresoData.map((c: any) => c.MusculoG || c.Musculo_g), borderColor: '#8b5cf6', tension: 0.3 }
            ]
          },
          options: baseOptions('%')
        });
      }
    }

    // Gráfico Presión Arterial
    if (refPresion.current) {
      instPresion.current?.destroy();
      const ctx = refPresion.current.getContext('2d');
      if (ctx) {
        instPresion.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              { label: 'Sistólica (mmHg)', data: progresoData.map((c: any) => c.Presion_Arterial_Sistolica || c.Sistolica), borderColor: '#ec4899', tension: 0.3 },
              { label: 'Diastólica (mmHg)', data: progresoData.map((c: any) => c.Presion_Arterial_Diastolica || c.Diastolica), borderColor: '#3b82f6', tension: 0.3 }
            ]
          },
          options: baseOptions('mmHg')
        });
      }
    }

    return () => {
      instPeso.current?.destroy();
      instIMC.current?.destroy();
      instCompos.current?.destroy();
      instPresion.current?.destroy();
    };
  }, [isUsuario, userActiveTab, progresoData]);

  // Selección de consulta por defecto (la última)
  useEffect(() => {
    if (isUsuario && consultasPaciente.length > 0 && selectedConsultaId === null) {
      const completadas = [...consultasPaciente].filter(c => c.Estado === 'Completada')
        .sort((a, b) => new Date(b.Fecha_Cita).getTime() - new Date(a.Fecha_Cita).getTime());
      if (completadas.length > 0) {
        setSelectedConsultaId(completadas[0].Id_Consulta);
      }
    }
  }, [isUsuario, consultasPaciente, selectedConsultaId]);

  // Última consulta completada con recomendaciones (para cabecera o fallback)
  const ultimaConsulta = (consultasPaciente as Consulta[])
    .filter(c => c.Estado === 'Completada')
    .sort((a, b) => new Date(b.Fecha_Cita).getTime() - new Date(a.Fecha_Cita).getTime())[0] ?? null;

  const consultaActiva = selectedConsultaId 
    ? (consultasPaciente as any[]).find(c => c.Id_Consulta === selectedConsultaId)
    : ultimaConsulta;

=======
    enabled: Boolean(id),
  });

>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
  const [abForm, setAbForm] = useState<SaveAnalisisBioquimicoData>({
    Fecha_Analisis: '',
    Hemoglobina: null,
    Hematocrito: null,
    Colesterol_Total: null,
    HDL: null,
    LDL: null,
    Trigliceridos: null,
    Glicemia: null,
    Acido_Urico: null,
    Albumina: null,
    Nitrogeno_Ureico: null,
    Creatinina: null,
    TSH: null,
    T4: null,
    T3: null,
    Vitamina_D: null,
    Vitamina_B12: null,
    Observaciones: '',
  });

  const abSaveMutation = useMutation({
    mutationFn: (data: SaveAnalisisBioquimicoData) =>
      saveAnalisisBioquimico({ ...data, Id_Usuario: Number(id), IdUsuario_Registro: currentUserId }),
    onSuccess: () => {
      alert('Análisis bioquímico registrado exitosamente');
      setAbForm({
        Fecha_Analisis: '',
        Hemoglobina: null,
        Hematocrito: null,
        Colesterol_Total: null,
        HDL: null,
        LDL: null,
        Trigliceridos: null,
        Glicemia: null,
        Acido_Urico: null,
        Albumina: null,
        Nitrogeno_Ureico: null,
        Creatinina: null,
        TSH: null,
        T4: null,
        T3: null,
        Vitamina_D: null,
        Vitamina_B12: null,
        Observaciones: '',
      });
      queryClient.invalidateQueries({ queryKey: ['analisis-bioquimico', id] });
    },
    onError: (err: any) => alert(err?.response?.data?.error || 'Error al guardar'),
  });

  const handleHcChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setHcForm(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleAbChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? (value ? parseFloat(value) : null) : value;
    setAbForm(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleHcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hcSaveMutation.mutate(hcForm);
  };

  const handleAbSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!abForm.Fecha_Analisis) {
      alert('Por favor ingrese la fecha del análisis');
      return;
    }
    abSaveMutation.mutate(abForm);
  };

  const formatFecha = (fecha: string) => {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const isSaving = hcSaveMutation.isPending || abSaveMutation.isPending;

  if (!id) {
    return (
      <div className="text-center p-5">
        <p className="text-muted">No se especificó el paciente.</p>
        <Link to="/usuarios" className="btn btn-secondary">Regresar</Link>
      </div>
    );
  }

<<<<<<< HEAD
  const formatFechaCita = (fecha: string) => {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

=======
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
  return (
    <div className="expediente-page">
      {/* Breadcrumb */}
      <nav className="cm-breadcrumb">
        <span onClick={() => navigate('/dashboard')} className="cm-bc-link">Inicio</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
<<<<<<< HEAD
        {!isUsuario && (
          <>
            <span onClick={() => navigate('/usuarios')} className="cm-bc-link">Pacientes</span>
            <span className="cm-bc-sep"> &rsaquo; </span>
          </>
        )}
        <span className="cm-bc-active">{isUsuario ? 'Mi Expediente' : 'Expediente del Paciente'}</span>
=======
        <span onClick={() => navigate('/usuarios')} className="cm-bc-link">Pacientes</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span className="cm-bc-active">Expediente del Paciente</span>
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
      </nav>

      {/* Header */}
      <div className="welcome-msg pt-3 pb-4">
        <h1>
<<<<<<< HEAD
          {isUsuario ? 'Mi Expediente' : 'Expediente'} — <span className="text-primary">
=======
          Expediente — <span className="text-primary">
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
            {pacienteInfo ? `${pacienteInfo.Nombre} ${pacienteInfo.Prim_Apellido} ${pacienteInfo.Seg_Apellido}` : 'Cargando...'}
          </span>
        </h1>
        {pacienteInfo?.Correo && <p className="text-muted">{pacienteInfo.Correo}</p>}
      </div>

<<<<<<< HEAD
      {/* VISTA PACIENTE (U) — pestañas personalizadas */}
      {isUsuario && (
        <div>
          {/* Tabs para Paciente */}
          <ul className="nav nav-tabs mb-4" role="tablist">
            <li className="nav-item">
              <button
                className={`nav-link ${userActiveTab === 'citas' ? 'active' : ''}`}
                onClick={() => setUserActiveTab('citas')}
                type="button"
              >
                <i className="fa fa-calendar-check-o"></i> Mis Citas
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${userActiveTab === 'graficos' ? 'active' : ''}`}
                onClick={() => setUserActiveTab('graficos')}
                type="button"
              >
                <i className="fa fa-line-chart"></i> Mi Progreso
              </button>
            </li>
          </ul>

          {userActiveTab === 'citas' ? (
            loadingConsultas ? (
              <div className="text-center p-5"><i className="fa fa-spinner fa-spin fa-2x"></i></div>
            ) : (
              <>
                {/* Selector de Fecha y Detalles de la Cita */}
                <div className="card card_border py-2 mb-4">
                  <div className="cards__heading d-flex justify-content-between align-items-center">
                    <h3><i className="fa fa-stethoscope me-2"></i>Detalles de tu Cita</h3>
                    <div className="d-flex align-items-center" style={{ gap: '10px' }}>
                      <label className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>Elegir fecha:</label>
                      <select 
                        className="form-control form-control-sm" 
                        style={{ width: 'auto' }}
                        value={selectedConsultaId || ''}
                        onChange={(e) => setSelectedConsultaId(Number(e.target.value))}
                      >
                        {(consultasPaciente as Consulta[])
                          .filter(c => c.Estado === 'Completada')
                          .sort((a, b) => new Date(b.Fecha_Cita).getTime() - new Date(a.Fecha_Cita).getTime())
                          .map(c => (
                            <option key={c.Id_Consulta} value={c.Id_Consulta}>
                              {new Date(c.Fecha_Cita).toLocaleDateString('es-CR')}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                  <div className="card-body">
                    {consultaActiva ? (
                      <div className="row">
                        <div className="col-md-7">
                          <h5 className="mb-3 text-primary"><i className="fa fa-lightbulb-o me-2"></i>Recomendaciones del Médico</h5>
                          <div className="ep-recomendaciones mb-4">
                            {consultaActiva.Recomendaciones || <span className="text-muted">No se registraron recomendaciones en esta cita.</span>}
                          </div>
                          {consultaActiva.Proxima_Cita && (
                            <div className="ep-proxima-cita">
                              <i className="fa fa-clock-o me-1 text-primary"></i>
                              <strong>Próxima cita sugerida:</strong> {formatFechaCita(consultaActiva.Proxima_Cita)}
                            </div>
                          )}
                        </div>
                        <div className="col-md-5">
                          <h5 className="mb-3 text-primary"><i className="fa fa-bar-chart me-2"></i>Métricas de la Consulta</h5>
                          <div className="ep-metrics-grid-mini">
                            <div className="ep-metric-item">
                              <span className="ep-metric-label">Peso</span>
                              <span className="ep-metric-val">{consultaActiva.Peso_kg || consultaActiva.PesoKg || '—'} <small>kg</small></span>
                            </div>
                            <div className="ep-metric-item">
                              <span className="ep-metric-label">IMC</span>
                              <span className="ep-metric-val">{consultaActiva.IMC || consultaActiva.Imc || '—'}</span>
                            </div>
                            <div className="ep-metric-item">
                              <span className="ep-metric-label">Grasa</span>
                              <span className="ep-metric-val">{consultaActiva.Grasa_Porcentaje || '—'} <small>%</small></span>
                            </div>
                            <div className="ep-metric-item">
                              <span className="ep-metric-label">Agua Corporal</span>
                              <span className="ep-metric-val">{consultaActiva.Agua_Corporal_Pct || '—'} <small>%</small></span>
                            </div>
                            <div className="ep-metric-item">
                              <span className="ep-metric-label">Músculo</span>
                              <span className="ep-metric-val">{consultaActiva.Musculo_g || consultaActiva.MusculoG || '—'} <small>g</small></span>
                            </div>
                            <div className="ep-metric-item">
                              <span className="ep-metric-label">Presión</span>
                              <span className="ep-metric-val" style={{ fontSize: '0.9rem' }}>
                                {consultaActiva.Presion_Arterial_Sistolica || '—'}/{consultaActiva.Presion_Arterial_Diastolica || '—'} <small>mmHg</small>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted">
                        <i className="fa fa-info-circle mb-2"></i>
                        <p>Selecciona una cita completada para ver los detalles.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Historial simplificado */}
                <div className="card card_border py-2 mb-4">
                  <div className="cards__heading">
                    <h3><i className="fa fa-history me-2"></i>Historial de Citas</h3>
                  </div>
                  <div className="card-body">
                    {consultasPaciente.length === 0 ? (
                      <p className="text-center text-muted">No tienes citas registradas.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-bordered table-hover table-sm">
                          <thead className="thead-light">
                            <tr>
                              <th>Fecha</th>
                              <th>Médico</th>
                              <th>Motivo</th>
                              <th>Estado</th>
                              <th>Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(consultasPaciente as Consulta[])
                              .sort((a, b) => new Date(b.Fecha_Cita).getTime() - new Date(a.Fecha_Cita).getTime())
                              .map(c => (
                                <tr key={c.Id_Consulta} className={selectedConsultaId === c.Id_Consulta ? 'table-primary' : ''}>
                                  <td>{formatFechaCita(c.Fecha_Cita)}</td>
                                  <td>{c.NombreMedico}</td>
                                  <td>{c.Motivo || '—'}</td>
                                  <td>
                                    <span className={`badge ${
                                      c.Estado === 'Completada' ? 'badge-success' :
                                      c.Estado === 'Cancelada'  ? 'badge-danger'  :
                                      c.Estado === 'No Asistió' ? 'badge-warning' :
                                      'badge-secondary'
                                    }`}>{c.Estado}</span>
                                  </td>
                                  <td>
                                    {c.Estado === 'Completada' && (
                                      <button
                                        className="btn btn-xs btn-primary btn-style"
                                        onClick={() => setSelectedConsultaId(c.Id_Consulta)}
                                      >
                                        <i className="fa fa-check-circle"></i> Seleccionar
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))
                            }
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )
          ) : (
            /* Tab de Gráficos */
            <div className="ep-graficos-container">
              {progresoData.length === 0 ? (
                <div className="card card_border py-5 text-center text-muted">
                  <i className="fa fa-line-chart fa-3x mb-3"></i>
                  <p>No hay suficientes datos de progreso para generar gráficos.</p>
                </div>
              ) : (
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <div className="card card_border p-3">
                      <h4 className="mb-3">Evolución del Peso</h4>
                      <div style={{ height: '250px' }}><canvas ref={refPeso}></canvas></div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <div className="card card_border p-3">
                      <h4 className="mb-3">Evolución del IMC</h4>
                      <div style={{ height: '250px' }}><canvas ref={refIMC}></canvas></div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <div className="card card_border p-3">
                      <h4 className="mb-3">Presión Arterial</h4>
                      <div style={{ height: '250px' }}><canvas ref={refPresion}></canvas></div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <div className="card card_border p-3">
                      <h4 className="mb-3">Composición Corporal</h4>
                      <div style={{ height: '250px' }}><canvas ref={refCompos}></canvas></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════ */}
      {/* VISTA MÉDICO/ADMIN (M/A) — expediente completo  */}
      {/* ════════════════════════════════════════════════ */}
      {!isUsuario && (
        <>
          {/* Tabs */}
          <ul className="nav nav-tabs mb-4" role="tablist">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'hc' ? 'active' : ''}`}
                onClick={() => setActiveTab('hc')}
                type="button"
              >
                <i className="fa fa-notes-medical"></i> Historia Clínica
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'ab' ? 'active' : ''}`}
                onClick={() => setActiveTab('ab')}
                type="button"
              >
                <i className="fa fa-flask"></i> Análisis Bioquímico
              </button>
            </li>
          </ul>
=======
      {/* Tabs */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'hc' ? 'active' : ''}`}
            onClick={() => setActiveTab('hc')}
            type="button"
          >
            <i className="fa fa-notes-medical"></i> Historia Clínica
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'ab' ? 'active' : ''}`}
            onClick={() => setActiveTab('ab')}
            type="button"
          >
            <i className="fa fa-flask"></i> Análisis Bioquímico
          </button>
        </li>
      </ul>
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91

      <div className="tab-content">

        {/* ══ TAB 1: HISTORIA CLÍNICA ══ */}
        {activeTab === 'hc' && (
          <div className="tab-pane fade show active">
            {loadingHC ? (
              <div className="text-center p-5"><i className="fa fa-spinner fa-spin fa-2x"></i></div>
            ) : (
              <form onSubmit={handleHcSubmit}>
                <div className="card card_border py-2 mb-4">
                  <div className="cards__heading">
                    <h3>Historia Clínica</h3>
                  </div>
                  <div className="card-body">
                    <p className="text-muted mb-3">
                      <i className="fa fa-info-circle me-1" />
                      Datos estables del paciente. Los datos específicos de cada consulta (objetivos, actividad, medicamentos, etc.) se registran desde la consulta correspondiente.
                    </p>

                    <div className="form-row">
                      <div className="form-group col-md-3">
                        <label className="input__label">Hábitos</label>
                        <div className="form-check mt-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="chkFuma"
                            name="Fuma"
                            checked={hcForm.Fuma}
                            onChange={handleHcChange}
                          />
                          <label className="form-check-label" htmlFor="chkFuma">Fuma</label>
                        </div>
                        <div className="form-check mt-1">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="chkConsumeAlcohol"
                            name="Consume_Alcohol"
                            checked={hcForm.Consume_Alcohol}
                            onChange={handleHcChange}
                          />
                          <label className="form-check-label" htmlFor="chkConsumeAlcohol">Consume Alcohol</label>
                        </div>
                      </div>
                      <div className="form-group col-md-3" style={{ display: hcForm.Consume_Alcohol ? 'block' : 'none' }}>
                        <label className="input__label">Frecuencia de Alcohol</label>
                        <input
                          type="text"
                          className="form-control input-style"
                          name="Frecuencia_Alcohol"
                          value={hcForm.Frecuencia_Alcohol}
                          onChange={handleHcChange}
                          placeholder="Ej: Fines de semana"
                          maxLength={100}
                        />
                      </div>
                      <div className="form-group col-md-3">
                        <label className="input__label">Condiciones</label>
                        <div className="form-check mt-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="chkEmbarazo"
                            name="Embarazo"
                            checked={hcForm.Embarazo}
                            onChange={handleHcChange}
                          />
                          <label className="form-check-label" htmlFor="chkEmbarazo">Embarazo</label>
                        </div>
                        <div className="form-check mt-1">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="chkLactancia"
                            name="Lactancia"
                            checked={hcForm.Lactancia}
                            onChange={handleHcChange}
                          />
                          <label className="form-check-label" htmlFor="chkLactancia">Lactancia</label>
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label className="input__label">Intolerancias Alimentarias</label>
                        <textarea
                          className="form-control input-style"
                          name="Intolerancias"
                          rows={2}
                          value={hcForm.Intolerancias}
                          onChange={handleHcChange}
                          placeholder="Ej: Lactosa, gluten..."
                          maxLength={500}
                        />
                      </div>
                      <div className="form-group col-md-6">
                        <label className="input__label">Alergias Alimentarias</label>
                        <textarea
                          className="form-control input-style"
                          name="Alergias_Alimentarias"
                          rows={2}
                          value={hcForm.Alergias_Alimentarias}
                          onChange={handleHcChange}
                          placeholder="Ej: Maní, mariscos..."
                          maxLength={500}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-style mt-3" disabled={isSaving}>
                      <i className={`fa ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`} />
                      {isSaving ? ' Guardando...' : ' Guardar Historia Clínica'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ══ TAB 2: ANÁLISIS BIOQUÍMICO ══ */}
        {activeTab === 'ab' && (
          <div className="tab-pane fade show active">
            {/* Historial */}
            <div className="card card_border py-2 mb-4">
              <div className="cards__heading">
                <h3>Historial de Análisis</h3>
              </div>
              <div className="card-body">
                {loadingAB ? (
                  <div className="text-center"><i className="fa fa-spinner fa-spin"></i></div>
                ) : analisisList.length === 0 ? (
                  <p className="text-center text-muted">No hay análisis registrados.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover table-sm">
                      <thead className="thead-light">
                        <tr>
                          <th>Fecha</th>
                          <th>Hemoglobina</th>
                          <th>Col. Total</th>
                          <th>Glicemia</th>
                          <th>Trigliceridos</th>
                          <th>Ácido Úrico</th>
                          <th>Observaciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(analisisList as AnalisisBioquimicoResponse[]).map((a) => (
                          <tr key={a.Id_Analisis}>
                            <td>{formatFecha(a.Fecha_Analisis)}</td>
                            <td>{a.Hemoglobina ?? '-'}</td>
                            <td>{a.Colesterol_Total ?? '-'}</td>
                            <td>{a.Glicemia ?? '-'}</td>
                            <td>{a.Trigliceridos ?? '-'}</td>
                            <td>{a.Acido_Urico ?? '-'}</td>
                            <td>{a.Observaciones || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Formulario nuevo análisis */}
            <form onSubmit={handleAbSubmit}>
              <div className="card card_border py-2 mb-4">
                <div className="cards__heading">
                  <h3>Registrar Nuevo Análisis</h3>
                </div>
                <div className="card-body">

                  <div className="form-row">
                    <div className="form-group col-md-4">
                      <label className="input__label">Fecha del Análisis *</label>
                      <input
                        type="date"
                        className="form-control input-style"
                        name="Fecha_Analisis"
                        value={abForm.Fecha_Analisis}
                        onChange={handleAbChange}
                      />
                    </div>
                  </div>

                  <h6 className="text-muted mt-2 mb-3">Hemograma</h6>
                  <div className="form-row">
                    <div className="form-group col-md-3">
                      <label className="input__label">Hemoglobina (g/dL)</label>
                      <input type="number" step="0.01" className="form-control input-style"
                        name="Hemoglobina" value={abForm.Hemoglobina ?? ''} onChange={handleAbChange} placeholder="0.00" />
                    </div>
                    <div className="form-group col-md-3">
                      <label className="input__label">Hematocrito (%)</label>
                      <input type="number" step="0.01" className="form-control input-style"
                        name="Hematocrito" value={abForm.Hematocrito ?? ''} onChange={handleAbChange} placeholder="0.00" />
                    </div>
                  </div>

                  <h6 className="text-muted mt-2 mb-3">Perfil Lipídico</h6>
                  <div className="form-row">
                    <div className="form-group col-md-3">
                      <label className="input__label">Colesterol Total (mg/dL)</label>
                      <input type="number" step="0.01" className="form-control input-style"
                        name="Colesterol_Total" value={abForm.Colesterol_Total ?? ''} onChange={handleAbChange} placeholder="0.00" />
                    </div>
                    <div className="form-group col-md-3">
                      <label className="input__label">HDL (mg/dL)</label>
                      <input type="number" step="0.01" className="form-control input-style"
                        name="HDL" value={abForm.HDL ?? ''} onChange={handleAbChange} placeholder="0.00" />
                    </div>
                    <div className="form-group col-md-3">
                      <label className="input__label">LDL (mg/dL)</label>
                      <input type="number" step="0.01" className="form-control input-style"
                        name="LDL" value={abForm.LDL ?? ''} onChange={handleAbChange} placeholder="0.00" />
                    </div>
                    <div className="form-group col-md-3">
                      <label className="input__label">Trigliceridos (mg/dL)</label>
                      <input type="number" step="0.01" className="form-control input-style"
                        name="Trigliceridos" value={abForm.Trigliceridos ?? ''} onChange={handleAbChange} placeholder="0.00" />
                    </div>
                  </div>

                  <h6 className="text-muted mt-2 mb-3">Química Sanguínea</h6>
                  <div className="form-row">
                    <div className="form-group col-md-3">
                      <label className="input__label">Glicemia (mg/dL)</label>
                      <input type="number" step="0.01" className="form-control input-style"
                        name="Glicemia" value={abForm.Glicemia ?? ''} onChange={handleAbChange} placeholder="0.00" />
                    </div>
                    <div className="form-group col-md-3">
                      <label className="input__label">Ácido Úrico (mg/dL)</label>
                      <input type="number" step="0.01" className="form-control input-style"
                        name="Acido_Urico" value={abForm.Acido_Urico ?? ''} onChange={handleAbChange} placeholder="0.00" />
                    </div>
                    <div className="form-group col-md-3">
                      <label className="input__label">Albúmina (g/dL)</label>
                      <input type="number" step="0.01" className="form-control input-style"
                        name="Albumina" value={abForm.Albumina ?? ''} onChange={handleAbChange} placeholder="0.00" />
                    </div>
                    <div className="form-group col-md-3">
                      <label className="input__label">Creatinina (mg/dL)</label>
                      <input type="number" step="0.01" className="form-control input-style"
                        name="Creatinina" value={abForm.Creatinina ?? ''} onChange={handleAbChange} placeholder="0.00" />
                    </div>
                  </div>

                  <h6 className="text-muted mt-2 mb-3">Función Tiroidea</h6>
                  <div className="form-row">
                    <div className="form-group col-md-4">
                      <label className="input__label">TSH (mUI/L)</label>
                      <input type="number" step="0.001" className="form-control input-style"
                        name="TSH" value={abForm.TSH ?? ''} onChange={handleAbChange} placeholder="0.000" />
                    </div>
                    <div className="form-group col-md-4">
                      <label className="input__label">T4 (ng/dL)</label>
                      <input type="number" step="0.01" className="form-control input-style"
                        name="T4" value={abForm.T4 ?? ''} onChange={handleAbChange} placeholder="0.00" />
                    </div>
                    <div className="form-group col-md-4">
                      <label className="input__label">T3 (pg/mL)</label>
                      <input type="number" step="0.01" className="form-control input-style"
                        name="T3" value={abForm.T3 ?? ''} onChange={handleAbChange} placeholder="0.00" />
                    </div>
                  </div>

                  <h6 className="text-muted mt-2 mb-3">Vitaminas</h6>
                  <div className="form-row">
                    <div className="form-group col-md-4">
                      <label className="input__label">Vitamina D (ng/mL)</label>
                      <input type="number" step="0.01" className="form-control input-style"
                        name="Vitamina_D" value={abForm.Vitamina_D ?? ''} onChange={handleAbChange} placeholder="0.00" />
                    </div>
                    <div className="form-group col-md-4">
                      <label className="input__label">Vitamina B12 (pg/mL)</label>
                      <input type="number" step="0.01" className="form-control input-style"
                        name="Vitamina_B12" value={abForm.Vitamina_B12 ?? ''} onChange={handleAbChange} placeholder="0.00" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col-md-12">
                      <label className="input__label">Observaciones</label>
                      <textarea
                        className="form-control input-style"
                        name="Observaciones"
                        rows={3}
                        value={abForm.Observaciones}
                        onChange={handleAbChange}
                        placeholder="Observaciones generales del análisis..."
                        maxLength={500}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-success btn-style mt-3" disabled={isSaving}>
                    <i className={`fa ${isSaving ? 'fa-spinner fa-spin' : 'fa-plus'}`} />
                    {isSaving ? ' Registrando...' : ' Registrar Análisis'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
<<<<<<< HEAD
        </>
      )}

      {/* Regresar */}
      <div className="mb-5">
        <button
          type="button"
          className="btn btn-secondary btn-style"
          onClick={() => navigate(isUsuario ? '/dashboard' : '/usuarios')}
        >
          <i className="fa fa-arrow-left" /> {isUsuario ? 'Volver al inicio' : 'Regresar'}
=======

      {/* Regresar */}
      <div className="mb-5">
        <button type="button" className="btn btn-secondary btn-style" onClick={() => navigate('/usuarios')}>
          <i className="fa fa-arrow-left" /> Regresar
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
        </button>
      </div>
    </div>
  );
};

export default ExpedientePaciente;
