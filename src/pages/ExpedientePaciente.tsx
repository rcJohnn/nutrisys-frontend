import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getHistoriaClinica,
  saveHistoriaClinica,
  updateHistoriaClinica,
  getEvaluacionCuantitativa,
  saveEvaluacionCuantitativaBatch,
  getAnalisisBioquimicoList,
  saveAnalisisBioquimico,
} from '../api/expediente';
import { getUsuarioById } from '../api/usuarios';
import type {
  EvaluacionCuantitativaItem,
  AnalisisBioquimicoResponse,
  SaveHistoriaClinicaData,
  SaveEvaluacionCuantitativaData,
  SaveAnalisisBioquimicoData,
} from '../api/expediente';
import './ExpedientePaciente.css';

const TIEMPOS_COMIDA = ['Desayuno', 'Merienda AM', 'Almuerzo', 'Merienda PM', 'Cena'];

const ExpedientePaciente: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'hc' | 'ec' | 'ab'>('hc');

  // Info del usuario logueado (para auditoría)
  const [currentUserId, setCurrentUserId] = useState(0);

  useEffect(() => {
    const id = Number(localStorage.getItem('userId') || '0');
    setCurrentUserId(id);
  }, []);

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
    Objetivos_Clinicos: '',
    Calidad_Sueno: '',
    Funcion_Intestinal: '',
    Fuma: false,
    Consume_Alcohol: false,
    Frecuencia_Alcohol: '',
    Actividad_Fisica: '',
    Medicamentos: '',
    Cirugias_Recientes: '',
    Embarazo: false,
    Lactancia: false,
    Alimentos_Favoritos: '',
    Alimentos_No_Gustan: '',
    Intolerancias: '',
    Alergias_Alimentarias: '',
    Ingesta_Agua_Diaria: '',
  });

  useEffect(() => {
    if (historiaClinica) {
      setHcForm({
        Objetivos_Clinicos: historiaClinica.Objetivos_Clinicos || '',
        Calidad_Sueno: historiaClinica.Calidad_Sueno || '',
        Funcion_Intestinal: historiaClinica.Funcion_Intestinal || '',
        Fuma: historiaClinica.Fuma || false,
        Consume_Alcohol: historiaClinica.Consume_Alcohol || false,
        Frecuencia_Alcohol: historiaClinica.Frecuencia_Alcohol || '',
        Actividad_Fisica: historiaClinica.Actividad_Fisica || '',
        Medicamentos: historiaClinica.Medicamentos || '',
        Cirugias_Recientes: historiaClinica.Cirugias_Recientes || '',
        Embarazo: historiaClinica.Embarazo || false,
        Lactancia: historiaClinica.Lactancia || false,
        Alimentos_Favoritos: historiaClinica.Alimentos_Favoritos || '',
        Alimentos_No_Gustan: historiaClinica.Alimentos_No_Gustan || '',
        Intolerancias: historiaClinica.Intolerancias || '',
        Alergias_Alimentarias: historiaClinica.Alergias_Alimentarias || '',
        Ingesta_Agua_Diaria: historiaClinica.Ingesta_Agua_Diaria || '',
      });
    }
  }, [historiaClinica]);

  const hcSaveMutation = useMutation({
    mutationFn: (data: SaveHistoriaClinicaData) =>
      historiaClinica
        ? updateHistoriaClinica(Number(id), { ...data, Id_Historia: historiaClinica.Id_Historia, IdUsuario_Modificacion: currentUserId })
        : saveHistoriaClinica({ ...data, Id_Usuario: Number(id!), IdUsuario_Modificacion: currentUserId }),
    onSuccess: () => {
      alert('Historia clínica guardada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['historia-clinica', id] });
    },
    onError: (err: any) => alert(err?.response?.data?.error || 'Error al guardar'),
  });

  // ── Evaluación Cuantitativa ─────────────────────────
  const { data: evalData = [], isLoading: loadingEC } = useQuery({
    queryKey: ['evaluacion-cuantitativa', id],
    queryFn: () => getEvaluacionCuantitativa(Number(id)),
    enabled: Boolean(id),
  });

  const [ecForm, setEcForm] = useState<Record<string, string>>({
    Desayuno: '',
    'Merienda AM': '',
    Almuerzo: '',
    'Merienda PM': '',
    Cena: '',
  });

  useEffect(() => {
    if (evalData.length > 0) {
      const map: Record<string, string> = {};
      evalData.forEach((item: EvaluacionCuantitativaItem) => {
        map[item.Tiempo_Comida] = item.Consumo_Usual || '';
      });
      setEcForm(prev => ({ ...prev, ...map }));
    }
  }, [evalData]);

  const ecSaveMutation = useMutation({
    mutationFn: (data: SaveEvaluacionCuantitativaData) =>
      saveEvaluacionCuantitativaBatch({ Id_Usuario: Number(id), Evaluaciones: data.Evaluaciones }),
    onSuccess: () => {
      alert('Evaluación cuantitativa guardada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['evaluacion-cuantitativa', id] });
    },
    onError: (err: any) => alert(err?.response?.data?.error || 'Error al guardar'),
  });

  // ── Análisis Bioquímico ─────────────────────────────
  const { data: analisisList = [], isLoading: loadingAB } = useQuery({
    queryKey: ['analisis-bioquimico', id],
    queryFn: () => getAnalisisBioquimicoList(Number(id)),
    enabled: Boolean(id),
  });

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

  const handleEcChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEcForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

  const handleEcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const evaluaciones = TIEMPOS_COMIDA
      .map(tiempo => ({ Tiempo_Comida: tiempo, Consumo_Usual: ecForm[tiempo] || '' }))
      .filter(ev => ev.Consumo_Usual.trim() !== '');
    ecSaveMutation.mutate({ Evaluaciones: evaluaciones });
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

  const isSaving = hcSaveMutation.isPending || ecSaveMutation.isPending || abSaveMutation.isPending;

  if (!id) {
    return (
      <div className="text-center p-5">
        <p className="text-muted">No se especificó el paciente.</p>
        <Link to="/usuarios" className="btn btn-secondary">Regresar</Link>
      </div>
    );
  }

  return (
    <div className="expediente-page">
      {/* Breadcrumb */}
      <nav className="cm-breadcrumb">
        <span onClick={() => navigate('/dashboard')} className="cm-bc-link">Inicio</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span onClick={() => navigate('/usuarios')} className="cm-bc-link">Pacientes</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span className="cm-bc-active">Expediente del Paciente</span>
      </nav>

      {/* Header */}
      <div className="welcome-msg pt-3 pb-4">
        <h1>
          Expediente — <span className="text-primary">
            {pacienteInfo ? `${pacienteInfo.Nombre} ${pacienteInfo.Prim_Apellido} ${pacienteInfo.Seg_Apellido}` : 'Cargando...'}
          </span>
        </h1>
        {pacienteInfo?.Correo && <p className="text-muted">{pacienteInfo.Correo}</p>}
      </div>

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
            className={`nav-link ${activeTab === 'ec' ? 'active' : ''}`}
            onClick={() => setActiveTab('ec')}
            type="button"
          >
            <i className="fa fa-cutlery"></i> Evaluación Cuantitativa
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

                    <div className="form-row">
                      <div className="form-group col-md-12">
                        <label className="input__label">Objetivos Clínicos</label>
                        <textarea
                          className="form-control input-style"
                          name="Objetivos_Clinicos"
                          rows={3}
                          value={hcForm.Objetivos_Clinicos}
                          onChange={handleHcChange}
                          placeholder="Objetivos del tratamiento..."
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label className="input__label">Calidad del Sueño</label>
                        <select
                          className="form-control input-style"
                          name="Calidad_Sueno"
                          value={hcForm.Calidad_Sueno}
                          onChange={handleHcChange}
                        >
                          <option value="">Seleccione...</option>
                          <option value="Buena">Buena</option>
                          <option value="Regular">Regular</option>
                          <option value="Mala">Mala</option>
                          <option value="Insomnia">Insomnia</option>
                        </select>
                      </div>
                      <div className="form-group col-md-6">
                        <label className="input__label">Función Intestinal</label>
                        <select
                          className="form-control input-style"
                          name="Funcion_Intestinal"
                          value={hcForm.Funcion_Intestinal}
                          onChange={handleHcChange}
                        >
                          <option value="">Seleccione...</option>
                          <option value="Normal">Normal</option>
                          <option value="Estreñimiento">Estreñimiento</option>
                          <option value="Diarrea">Diarrea</option>
                          <option value="Irregular">Irregular</option>
                        </select>
                      </div>
                    </div>

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
                        <label className="input__label">Actividad Física</label>
                        <input
                          type="text"
                          className="form-control input-style"
                          name="Actividad_Fisica"
                          value={hcForm.Actividad_Fisica}
                          onChange={handleHcChange}
                          placeholder="Tipo y frecuencia de actividad física"
                          maxLength={200}
                        />
                      </div>
                      <div className="form-group col-md-6">
                        <label className="input__label">Ingesta de Agua Diaria</label>
                        <input
                          type="text"
                          className="form-control input-style"
                          name="Ingesta_Agua_Diaria"
                          value={hcForm.Ingesta_Agua_Diaria}
                          onChange={handleHcChange}
                          placeholder="Ej: 2 litros"
                          maxLength={100}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label className="input__label">Medicamentos</label>
                        <textarea
                          className="form-control input-style"
                          name="Medicamentos"
                          rows={2}
                          value={hcForm.Medicamentos}
                          onChange={handleHcChange}
                          placeholder="Medicamentos que consume actualmente..."
                          maxLength={500}
                        />
                      </div>
                      <div className="form-group col-md-6">
                        <label className="input__label">Cirugías Recientes</label>
                        <textarea
                          className="form-control input-style"
                          name="Cirugias_Recientes"
                          rows={2}
                          value={hcForm.Cirugias_Recientes}
                          onChange={handleHcChange}
                          placeholder="Cirugías o procedimientos recientes..."
                          maxLength={500}
                        />
                      </div>
                    </div>

                    <hr />
                    <h6 className="text-muted mb-3">Preferencias Alimentarias</h6>

                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label className="input__label">Alimentos Favoritos</label>
                        <textarea
                          className="form-control input-style"
                          name="Alimentos_Favoritos"
                          rows={2}
                          value={hcForm.Alimentos_Favoritos}
                          onChange={handleHcChange}
                          placeholder="Alimentos que le gustan..."
                          maxLength={500}
                        />
                      </div>
                      <div className="form-group col-md-6">
                        <label className="input__label">Alimentos que No le Gustan</label>
                        <textarea
                          className="form-control input-style"
                          name="Alimentos_No_Gustan"
                          rows={2}
                          value={hcForm.Alimentos_No_Gustan}
                          onChange={handleHcChange}
                          placeholder="Alimentos que no consume..."
                          maxLength={500}
                        />
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

        {/* ══ TAB 2: EVALUACIÓN CUANTITATIVA ══ */}
        {activeTab === 'ec' && (
          <div className="tab-pane fade show active">
            {loadingEC ? (
              <div className="text-center p-5"><i className="fa fa-spinner fa-spin fa-2x"></i></div>
            ) : (
              <form onSubmit={handleEcSubmit}>
                <div className="card card_border py-2 mb-4">
                  <div className="cards__heading">
                    <h3>Evaluación Cuantitativa</h3>
                  </div>
                  <div className="card-body">
                    <p className="text-muted mb-4">Registre el consumo habitual del paciente por tiempo de comida.</p>

                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label className="input__label">Desayuno</label>
                        <textarea
                          className="form-control input-style"
                          name="Desayuno"
                          rows={3}
                          value={ecForm.Desayuno}
                          onChange={handleEcChange}
                          placeholder="Describe lo que consume habitualmente en el desayuno..."
                          maxLength={1000}
                        />
                      </div>
                      <div className="form-group col-md-6">
                        <label className="input__label">Merienda AM</label>
                        <textarea
                          className="form-control input-style"
                          name="Merienda AM"
                          rows={3}
                          value={ecForm['Merienda AM']}
                          onChange={handleEcChange}
                          placeholder="Describe lo que consume en la merienda de la mañana..."
                          maxLength={1000}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label className="input__label">Almuerzo</label>
                        <textarea
                          className="form-control input-style"
                          name="Almuerzo"
                          rows={3}
                          value={ecForm.Almuerzo}
                          onChange={handleEcChange}
                          placeholder="Describe lo que consume habitualmente en el almuerzo..."
                          maxLength={1000}
                        />
                      </div>
                      <div className="form-group col-md-6">
                        <label className="input__label">Merienda PM</label>
                        <textarea
                          className="form-control input-style"
                          name="Merienda PM"
                          rows={3}
                          value={ecForm['Merienda PM']}
                          onChange={handleEcChange}
                          placeholder="Describe lo que consume en la merienda de la tarde..."
                          maxLength={1000}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group col-md-6">
                        <label className="input__label">Cena</label>
                        <textarea
                          className="form-control input-style"
                          name="Cena"
                          rows={3}
                          value={ecForm.Cena}
                          onChange={handleEcChange}
                          placeholder="Describe lo que consume habitualmente en la cena..."
                          maxLength={1000}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-style mt-3" disabled={isSaving}>
                      <i className={`fa ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`} />
                      {isSaving ? ' Guardando...' : ' Guardar Evaluación'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ══ TAB 3: ANÁLISIS BIOQUÍMICO ══ */}
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

      {/* Regresar */}
      <div className="mb-5">
        <button type="button" className="btn btn-secondary btn-style" onClick={() => navigate('/usuarios')}>
          <i className="fa fa-arrow-left" /> Regresar
        </button>
      </div>
    </div>
  );
};

export default ExpedientePaciente;
