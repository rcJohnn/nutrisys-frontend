import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConfigMedico, updateConfigMedico, ejecutarInactivacion,
  getHorarioSemanal, guardarHorarioSemanal,
  getTiemposComida, guardarTiempoComida,
  getBloqueos, createBloqueo, deleteBloqueo,
  getPenalizacionesMedico, levantarPenalizacion,
  type HorarioSemanalItem,
  type TiempoComidaItem,
  type BloqueoResponse,
  type PenalizacionItem,
} from '../api/configAgenda';
import { getMedicos } from '../api/medicos';
import './ConfigAgenda.css';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TIEMPOS_COMIDA = ['Desayuno', 'Almuerzo', 'Cena', 'Merienda AM', 'Merienda PM'];

interface FormState {
  permiteAuto: boolean;
  slotMin: number;
  anticipacion: number;
  maxCitas: number | null;
  maxCancelaciones: number;
  periodoPenal: number;
  mesesInactividad: number;
}

const ConfigAgenda: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const userType = localStorage.getItem('userType') || 'A';
  const userId = Number(localStorage.getItem('userId') || '0');
  const userIdMedico = Number(localStorage.getItem('userIdMedico') || '0');

  // Médico seleccionado (admin ve combo, médico ve su propio ID)
  const [medicoId, setMedicoId] = useState<number>(0);
  const [medicoNombre, setMedicoNombre] = useState('');

  // Form state
  const [form, setForm] = useState<FormState>({
    permiteAuto: false,
    slotMin: 30,
    anticipacion: 60,
    maxCitas: null,
    maxCancelaciones: 3,
    periodoPenal: 30,
    mesesInactividad: 1,
  });

  // Horario semanal
  const [horarioSemanal, setHorarioSemanal] = useState<HorarioSemanalItem[]>([]);

  // Tiempos de comida
  const [tiemposComida, setTiemposComida] = useState<TiempoComidaItem[]>([]);

  // Bloqueos
  const [bloqueos, setBloqueos] = useState<BloqueoResponse[]>([]);

  // Penalizaciones
  const [penalizaciones, setPenalizaciones] = useState<PenalizacionItem[]>([]);

  // Bloqueo form
  const [bloqueoForm, setBloqueoForm] = useState({
    tipo: 'D',
    fechaInicio: '',
    fechaFin: '',
    horaInicio: '',
    horaFin: '',
    motivo: '',
  });

  // ── Queries ──
  const { data: medicos = [] } = useQuery({
    queryKey: ['medicos-select'],
    queryFn: () => getMedicos(),
    enabled: userType === 'A',
  });

  const { data: configMedico } = useQuery({
    queryKey: ['config-medico', medicoId],
    queryFn: () => getConfigMedico(medicoId),
    enabled: medicoId > 0,
  });

  const { data: horarioData, isLoading: isLoadingHorario } = useQuery({
    queryKey: ['horario-semanal', medicoId],
    queryFn: () => getHorarioSemanal(medicoId),
    enabled: medicoId > 0,
  });

  const { data: tiemposData, isLoading: isLoadingTiempos } = useQuery({
    queryKey: ['tiempos-comida', medicoId],
    queryFn: () => getTiemposComida(medicoId),
    enabled: medicoId > 0,
  });

  const { data: bloqueosData, isLoading: isLoadingBloqueos, refetch: refetchBloqueos } = useQuery({
    queryKey: ['bloqueos', medicoId],
    queryFn: () => getBloqueos(medicoId),
    enabled: medicoId > 0,
  });

  const { data: penalizacionesData } = useQuery({
    queryKey: ['penalizaciones', medicoId],
    queryFn: () => getPenalizacionesMedico(medicoId),
    enabled: medicoId > 0,
  });

  // ── Cargar datos cuando cambia médico ──
  useEffect(() => {
    if (!configMedico) return;
    setForm({
      permiteAuto: configMedico.Permite_Autoagendamiento,
      slotMin: configMedico.Duracion_Slot_Min,
      anticipacion: configMedico.Anticipacion_Min_Reserva,
      maxCitas: configMedico.Max_Citas_Por_Dia,
      maxCancelaciones: configMedico.Max_Cancelaciones_Usuario,
      periodoPenal: configMedico.Periodo_Penalizacion_Dias,
      mesesInactividad: configMedico.Meses_Inactividad_Usuario,
    });
  }, [configMedico]);

  useEffect(() => {
    if (horarioData) setHorarioSemanal(horarioData);
  }, [horarioData]);

  useEffect(() => {
    if (tiemposData) setTiemposComida(tiemposData);
  }, [tiemposData]);

  useEffect(() => {
    if (bloqueosData) setBloqueos(bloqueosData);
  }, [bloqueosData]);

  useEffect(() => {
    if (penalizacionesData) setPenalizaciones(penalizacionesData);
  }, [penalizacionesData]);

  // ── Leer medicoId del query param (cuando viene desde listado de médicos) ──
  useEffect(() => {
    const urlMedicoId = searchParams.get('medicoId');
    if (urlMedicoId) {
      const id = Number(urlMedicoId);
      if (id > 0) {
        setMedicoId(id);
        const medicosList = medicos as any[];
        const m = medicosList.find((x: any) => x.Id_Medico === id);
        if (m) setMedicoNombre(`${m.Nombre} ${m.Prim_Apellido}`);
      }
    }
  }, [searchParams, medicos]);

  // ── Inicializar médico según rol ──
  useEffect(() => {
    if (userType === 'M' && userIdMedico > 0) {
      setMedicoId(userIdMedico);
      const medicosList = medicos as any[];
      const m = medicosList.find((x: any) => x.Id_Medico === userIdMedico);
      if (m) setMedicoNombre(`${m.Nombre} ${m.Prim_Apellido}`);
    }
  }, [userType, userIdMedico, medicos]);

  // ── Mutations ──
  const updateConfigMut = useMutation({
    mutationFn: (data: any) => updateConfigMedico(medicoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config-medico', medicoId] });
      alert('Configuración guardada correctamente');
    },
    onError: (err: any) => alert(err.response?.data?.error || 'Error al guardar'),
  });

  const inactivarMut = useMutation({
    mutationFn: () => ejecutarInactivacion(medicoId, userId),
    onSuccess: (data) => {
      alert(data.valorScalar === '-1'
        ? 'Ocurrió un error al ejecutar la inactivación'
        : `${data.valorScalar} paciente(s) inactivado(s) correctamente`);
    },
    onError: (err: any) => alert(err.response?.data?.error || 'Error'),
  });

  const guardarHorarioMut = useMutation({
    mutationFn: (data: any) => guardarHorarioSemanal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horario-semanal', medicoId] });
      alert('Horario guardado correctamente');
    },
    onError: (err: any) => alert(err.response?.data?.error || 'Error'),
  });

  const guardarTiempoMut = useMutation({
    mutationFn: (data: any) => guardarTiempoComida(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiempos-comida', medicoId] });
      alert('Tiempo de comida guardado');
    },
    onError: (err: any) => alert(err.response?.data?.error || 'Error'),
  });

  const crearBloqueoMut = useMutation({
    mutationFn: () => createBloqueo({
      Id_Medico: medicoId,
      Tipo_Bloqueo: bloqueoForm.tipo,
      Fecha_Inicio: bloqueoForm.fechaInicio + (bloqueoForm.tipo === 'H' ? `T${bloqueoForm.horaInicio}:00` : 'T00:00:00'),
      Fecha_Fin: bloqueoForm.fechaFin + (bloqueoForm.tipo === 'H' ? `T${bloqueoForm.horaFin}:00` : 'T23:59:59'),
      Motivo: bloqueoForm.motivo,
    }, userId),
    onSuccess: () => {
      setBloqueoForm({ tipo: 'D', fechaInicio: '', fechaFin: '', horaInicio: '', horaFin: '', motivo: '' });
      refetchBloqueos();
      alert('Bloqueo agregado correctamente');
    },
    onError: (err: any) => alert(err.response?.data?.error || 'Error'),
  });

  const eliminarBloqueoMut = useMutation({
    mutationFn: (id: number) => deleteBloqueo(id),
    onSuccess: () => {
      refetchBloqueos();
      alert('Bloqueo eliminado');
    },
    onError: (err: any) => alert(err.response?.data?.error || 'Error'),
  });

  const levantarPenalizacionMut = useMutation({
    mutationFn: (data: any) => levantarPenalizacion(data.idPenalizacion, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['penalizaciones', medicoId] });
      alert('Penalización levantada');
    },
    onError: (err: any) => alert(err.response?.data?.error || 'Error'),
  });

  // ── Handlers ──
  const handleMedicoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setMedicoId(id);
    const medicosList = medicos as any[];
    const m = medicosList.find((x: any) => x.Id_Medico === id);
    if (m) setMedicoNombre(`${m.Nombre} ${m.Prim_Apellido}`);
  };

  const handleGuardarConfigGeneral = () => {
    if (!medicoId) { alert('Seleccione un médico'); return; }
    updateConfigMut.mutate({
      Permite_Autoagendamiento: form.permiteAuto,
      Duracion_Slot_Min: form.slotMin,
      Anticipacion_Min_Reserva: form.anticipacion,
      Max_Citas_Por_Dia: form.maxCitas,
      Max_Cancelaciones_Usuario: form.maxCancelaciones,
      Periodo_Penalizacion_Dias: form.periodoPenal,
      Meses_Inactividad_Usuario: form.mesesInactividad,
    });
  };

  const handleGuardarHorarioDia = (diaIndex: number) => {
    const dia = horarioSemanal.find(h => h.Dia_Semana === diaIndex + 1);
    if (!dia) return;
    guardarHorarioMut.mutate({
      Id_Horario: dia.Id_Horario,
      Id_Medico: medicoId,
      Dia_Semana: diaIndex + 1,
      Hora_Inicio: dia.Hora_Inicio,
      Hora_Fin: dia.Hora_Fin,
      Activo: dia.Activo,
      IdUsuarioGlobal: userId,
    });
  };

  const handleGuardarTiempoComida = (tipo: string) => {
    const tiempo = tiemposComida.find(t => t.Tipo_Comida === tipo);
    if (!tiempo) return;
    guardarTiempoMut.mutate({
      Id_Medico: medicoId,
      Tipo_Comida: tiempo.Tipo_Comida,
      Hora_Inicio: tiempo.Hora_Inicio,
      Hora_Fin: tiempo.Hora_Fin,
      Activo: tiempo.Activo,
      IdUsuarioGlobal: userId,
    });
  };

  const handleCrearBloqueo = () => {
    if (!bloqueoForm.fechaInicio || !bloqueoForm.fechaFin) {
      alert('Complete las fechas'); return;
    }
    if (bloqueoForm.tipo === 'H' && (!bloqueoForm.horaInicio || !bloqueoForm.horaFin)) {
      alert('Complete las horas'); return;
    }
    crearBloqueoMut.mutate();
  };

  const handleEliminarBloqueo = (id: number) => {
    if (window.confirm('¿Eliminar este bloqueo?')) {
      eliminarBloqueoMut.mutate(id);
    }
  };

  const isSaving = updateConfigMut.isPending || guardarHorarioMut.isPending ||
    guardarTiempoMut.isPending || crearBloqueoMut.isPending || eliminarBloqueoMut.isPending;

  const formatBloqueoTipo = (tipo: string) => tipo === 'D' ? 'Día completo' : 'Horas';

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (userType !== 'A' && userType !== 'M') {
    return <div className="text-center p-4">No tiene acceso a esta página</div>;
  }

  return (
    <div className="config-agenda-page">
      {/* Breadcrumb */}
      <nav className="cm-breadcrumb">
        <span onClick={() => navigate('/dashboard')} className="cm-bc-link">Inicio</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span onClick={() => navigate('/medicos')} className="cm-bc-link">Médicos</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span className="cm-bc-active">Configuración de Agenda</span>
      </nav>

      <div className="welcome-msg pt-3 pb-3">
        <h1>Configuración de Agenda</h1>
        {medicoNombre && <p className="text-muted">{medicoNombre}</p>}
      </div>

      {/* Selector de médico (solo admin) */}
      {userType === 'A' && (
        <div className="cfg-card">
          <div className="cfg-card-header">
            <i className="fa fa-user-md cfg-icon"></i>
            <h5>Seleccionar Médico</h5>
          </div>
          <div className="cfg-card-body">
            <div className="form-row align-items-end">
              <div className="form-group col-md-8 mb-0">
                <label className="input__label">Médico</label>
                <select className="form-control input-style" value={medicoId} onChange={handleMedicoChange}>
                  <option value={0}>-- Seleccione un médico --</option>
                  {(medicos as any[]).map((m: any) => (
                    <option key={m.Id_Medico} value={m.Id_Medico}>
                      {m.Nombre} {m.Prim_Apellido} {m.Seg_Apellido}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group col-md-4 mb-0">
                <button className="btn btn-primary btn-style btn-block"
                  onClick={() => medicoId && setMedicoId(medicoId)}
                  disabled={!medicoId}>
                  <i className="fa fa-search"></i> Cargar configuración
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {medicoId === 0 && userType === 'A' && (
        <div className="text-center p-5 text-muted">
          <i className="fa fa-user-md fa-3x mb-3"></i>
          <p>Seleccione un médico para configurar su agenda</p>
        </div>
      )}

      {medicoId > 0 && (
        <>
          {/* ── SECCIÓN 1: AUTOAGENDAMIENTO ── */}
          <div className="cfg-card">
            <div className="cfg-card-header">
              <i className="fa fa-toggle-on cfg-icon"></i>
              <h5>Autoagendamiento</h5>
            </div>
            <div className="cfg-card-body">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="form-switch-custom" onClick={() => setForm(f => ({ ...f, permiteAuto: !f.permiteAuto }))}>
                  <div className={`switch-track ${form.permiteAuto ? 'active' : ''}`}>
                    <div className="switch-thumb"></div>
                  </div>
                  <span className="switch-label">
                    {form.permiteAuto ? 'Activado' : 'Desactivado'} — el médico gestiona sus citas
                  </span>
                </div>
              </div>

              {form.permiteAuto && (
                <>
                  <hr />
                  <h6 className="mb-3 cfg-section-title">Parámetros de reserva</h6>
                  <div className="cfg-num-grid">
                    <div className="cfg-num-item">
                      <label>Duración del slot (min)</label>
                      <input type="number" className="form-control input-style"
                        min={10} max={120} step={5} value={form.slotMin}
                        onChange={e => setForm(f => ({ ...f, slotMin: Number(e.target.value) }))} />
                      <small>Ej: 30 = citas de media hora</small>
                    </div>
                    <div className="cfg-num-item">
                      <label>Anticipación mínima (min)</label>
                      <input type="number" className="form-control input-style"
                        min={0} max={1440} step={15} value={form.anticipacion}
                        onChange={e => setForm(f => ({ ...f, anticipacion: Number(e.target.value) }))} />
                      <small>Mínimo de tiempo antes de la cita</small>
                    </div>
                    <div className="cfg-num-item">
                      <label>Máx. citas por día</label>
                      <input type="number" className="form-control input-style"
                        min={1} max={50} value={form.maxCitas ?? ''}
                        onChange={e => setForm(f => ({ ...f, maxCitas: e.target.value ? Number(e.target.value) : null }))} />
                      <small>Vacío = sin límite</small>
                    </div>
                    <div className="cfg-num-item">
                      <label>Máx. de cancelaciones</label>
                      <input type="number" className="form-control input-style"
                        min={1} max={20} value={form.maxCancelaciones}
                        onChange={e => setForm(f => ({ ...f, maxCancelaciones: Number(e.target.value) }))} />
                      <small>Cancelaciones antes de penalizar</small>
                    </div>
                    <div className="cfg-num-item">
                      <label>Duración de penalización (días)</label>
                      <input type="number" className="form-control input-style"
                        min={1} max={365} value={form.periodoPenal}
                        onChange={e => setForm(f => ({ ...f, periodoPenal: Number(e.target.value) }))} />
                      <small>Días que el usuario no puede autoagendar</small>
                    </div>
                  </div>
                </>
              )}

              <hr />
              <h6 className="mb-3 cfg-section-title">
                <i className="fa fa-user-times"></i> Inactivación automática de pacientes
              </h6>
              <p className="text-muted" style={{ fontSize: '.82rem', marginBottom: '1rem' }}>
                Si un paciente no ha tenido consulta en el período indicado, el sistema lo pasa a <strong>Inactivo</strong>.
              </p>
              <div className="cfg-num-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))' }}>
                <div className="cfg-num-item">
                  <label>Meses sin consulta para inactivar</label>
                  <input type="number" className="form-control input-style"
                    min={1} max={24} value={form.mesesInactividad}
                    onChange={e => setForm(f => ({ ...f, mesesInactividad: Number(e.target.value) }))} />
                  <small>Mínimo 1 mes</small>
                </div>
              </div>
              <div className="mt-3">
                <button className="btn btn-outline-warning btn-sm" style={{ borderRadius: '8px' }}
                  onClick={() => inactivarMut.mutate()} disabled={inactivarMut.isPending}>
                  <i className="fa fa-bolt"></i> Ejecutar ahora
                </button>
              </div>
            </div>
          </div>

          {/* ── SECCIÓN 2: HORARIO SEMANAL (solo si autoagendamiento activado) ── */}
          {form.permiteAuto && (
          <div className="cfg-card">
            <div className="cfg-card-header">
              <i className="fa fa-clock-o cfg-icon"></i>
              <h5>Horario Semanal Base</h5>
            </div>
            <div className="cfg-card-body">
              <p className="text-muted" style={{ fontSize: '.82rem' }}>
                Activá los días que trabajás y definí el rango de horas.
              </p>
              <div className="dias-grid">
                {isLoadingHorario ? (
                  <div className="text-center p-3"><i className="fa fa-spinner fa-spin"></i></div>
                ) : (
                  DIAS_SEMANA.map((dia, i) => {
                    const h = horarioSemanal.find(h => h.Dia_Semana === i + 1) || {
                      Dia_Semana: i + 1, Hora_Inicio: '08:00', Hora_Fin: '17:00', Activo: false
                    } as HorarioSemanalItem;
                    return (
                      <div key={dia} className={`dia-item ${h.Activo ? 'active' : ''}`}>
                        <div className="dia-header" onClick={() => {
                          const updated = [...horarioSemanal];
                          const idx = updated.findIndex(x => x.Dia_Semana === i + 1);
                          if (idx >= 0) {
                            updated[idx] = { ...updated[idx], Activo: !updated[idx].Activo };
                          } else {
                            updated.push({ Id_Horario: 0, Id_Medico: medicoId, Dia_Semana: i + 1, Hora_Inicio: '08:00', Hora_Fin: '17:00', Activo: true });
                          }
                          setHorarioSemanal(updated);
                        }}>
                          <span className="dia-nombre">{dia}</span>
                          <span className={`dia-badge ${h.Activo ? 'badge-active' : ''}`}>
                            {h.Activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        {h.Activo && (
                          <div className="dia-horas">
                            <input type="time" className="form-control input-style"
                              value={h.Hora_Inicio}
                              onChange={e => {
                                const updated = [...horarioSemanal];
                                const idx = updated.findIndex(x => x.Dia_Semana === i + 1);
                                if (idx >= 0) updated[idx] = { ...updated[idx], Hora_Inicio: e.target.value };
                                else updated.push({ Id_Horario: 0, Id_Medico: medicoId, Dia_Semana: i + 1, Hora_Inicio: e.target.value, Hora_Fin: '17:00', Activo: true });
                                setHorarioSemanal(updated);
                              }} />
                            <span>—</span>
                            <input type="time" className="form-control input-style"
                              value={h.Hora_Fin}
                              onChange={e => {
                                const updated = [...horarioSemanal];
                                const idx = updated.findIndex(x => x.Dia_Semana === i + 1);
                                if (idx >= 0) updated[idx] = { ...updated[idx], Hora_Fin: e.target.value };
                                else updated.push({ Id_Horario: 0, Id_Medico: medicoId, Dia_Semana: i + 1, Hora_Inicio: '08:00', Hora_Fin: e.target.value, Activo: true });
                                setHorarioSemanal(updated);
                              }} />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="text-right mt-4">
                <button className="btn btn-primary btn-style" onClick={() => {
                  horarioSemanal.forEach((_, i) => handleGuardarHorarioDia(i));
                }} disabled={guardarHorarioMut.isPending}>
                  <i className={`fa ${guardarHorarioMut.isPending ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> Guardar Horario
                </button>
              </div>
            </div>
          </div>
          )}

          {/* ── SECCIÓN 3: TIEMPOS DE COMIDA (solo si autoagendamiento activado) ── */}
          {form.permiteAuto && (
          <div className="cfg-card">
            <div className="cfg-card-header cfg-card-header--amber">
              <i className="fa fa-cutlery cfg-icon"></i>
              <h5>Tiempos de Comida</h5>
            </div>
            <div className="cfg-card-body">
              <p className="text-muted" style={{ fontSize: '.82rem' }}>
                Configurá tus horarios de comida para bloquear esos slots automáticamente.
              </p>
              <div className="comidas-grid">
                {isLoadingTiempos ? (
                  <div className="text-center p-3"><i className="fa fa-spinner fa-spin"></i></div>
                ) : (
                  TIEMPOS_COMIDA.map(tipo => {
                    const tc = tiemposComida.find(t => t.Tipo_Comida === tipo) || {
                      Tipo_Comida: tipo, Hora_Inicio: '', Hora_Fin: '', Activo: false
                    } as TiempoComidaItem;
                    return (
                      <div key={tipo} className={`comida-item ${tc.Activo ? 'active' : ''}`}>
                        <div className="comida-header" onClick={() => {
                          const updated = [...tiemposComida];
                          const idx = updated.findIndex(x => x.Tipo_Comida === tipo);
                          if (idx >= 0) updated[idx] = { ...updated[idx], Activo: !updated[idx].Activo };
                          else updated.push({ Tipo_Comida: tipo, Hora_Inicio: '12:00', Hora_Fin: '13:00', Activo: true });
                          setTiemposComida(updated);
                        }}>
                          <span className="comida-nombre">{tipo}</span>
                          <span className={`comida-badge ${tc.Activo ? 'badge-active' : ''}`}>
                            {tc.Activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        {tc.Activo && (
                          <div className="comida-horas">
                            <input type="time" className="form-control input-style"
                              value={tc.Hora_Inicio}
                              onChange={e => {
                                const updated = [...tiemposComida];
                                const idx = updated.findIndex(x => x.Tipo_Comida === tipo);
                                if (idx >= 0) updated[idx] = { ...updated[idx], Hora_Inicio: e.target.value };
                                else updated.push({ Tipo_Comida: tipo, Hora_Inicio: e.target.value, Hora_Fin: '13:00', Activo: true });
                                setTiemposComida(updated);
                              }} />
                            <span>—</span>
                            <input type="time" className="form-control input-style"
                              value={tc.Hora_Fin}
                              onChange={e => {
                                const updated = [...tiemposComida];
                                const idx = updated.findIndex(x => x.Tipo_Comida === tipo);
                                if (idx >= 0) updated[idx] = { ...updated[idx], Hora_Fin: e.target.value };
                                else updated.push({ Tipo_Comida: tipo, Hora_Inicio: '12:00', Hora_Fin: e.target.value, Activo: true });
                                setTiemposComida(updated);
                              }} />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="text-right mt-4">
                <button className="btn btn-primary btn-style" onClick={() => {
                  tiemposComida.forEach(tc => handleGuardarTiempoComida(tc.Tipo_Comida));
                }} disabled={guardarTiempoMut.isPending}>
                  <i className={`fa ${guardarTiempoMut.isPending ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> Guardar Tiempos
                </button>
              </div>
            </div>
          </div>
          )}

          {/* ── SECCIÓN 4: BLOQUEOS PUNTUALES (solo si autoagendamiento activado) ── */}
          {form.permiteAuto && (
          <div className="cfg-card">
            <div className="cfg-card-header">
              <i className="fa fa-ban cfg-icon"></i>
              <h5>Bloqueos Puntuales</h5>
            </div>
            <div className="cfg-card-body">
              {/* Form nuevo bloqueo */}
              <div className="card bg-light mb-4" style={{ borderRadius: '10px' }}>
                <div className="card-body">
                  <h6 className="mb-3">Agregar bloqueo</h6>
                  <div className="form-row">
                    <div className="form-group col-md-3">
                      <label className="input__label">Tipo</label>
                      <select className="form-control input-style" value={bloqueoForm.tipo}
                        onChange={e => setBloqueoForm(f => ({ ...f, tipo: e.target.value }))}>
                        <option value="D">Día completo</option>
                        <option value="H">Rango de horas</option>
                      </select>
                    </div>
                    <div className="form-group col-md-3">
                      <label className="input__label">Fecha inicio</label>
                      <input type="date" className="form-control input-style"
                        value={bloqueoForm.fechaInicio}
                        onChange={e => setBloqueoForm(f => ({ ...f, fechaInicio: e.target.value }))} />
                    </div>
                    <div className="form-group col-md-3">
                      <label className="input__label">Fecha fin</label>
                      <input type="date" className="form-control input-style"
                        value={bloqueoForm.fechaFin}
                        onChange={e => setBloqueoForm(f => ({ ...f, fechaFin: e.target.value }))} />
                    </div>
                    {bloqueoForm.tipo === 'H' && (
                      <div className="form-group col-md-3">
                        <label className="input__label">Hora inicio — Hora fin</label>
                        <div className="d-flex gap-2">
                          <input type="time" className="form-control input-style"
                            value={bloqueoForm.horaInicio}
                            onChange={e => setBloqueoForm(f => ({ ...f, horaInicio: e.target.value }))} />
                          <input type="time" className="form-control input-style"
                            value={bloqueoForm.horaFin}
                            onChange={e => setBloqueoForm(f => ({ ...f, horaFin: e.target.value }))} />
                        </div>
                      </div>
                    )}
                    <div className="form-group col-md-6">
                      <label className="input__label">Motivo (opcional)</label>
                      <input type="text" className="form-control input-style"
                        placeholder="Ej: Vacaciones, Congreso..."
                        value={bloqueoForm.motivo}
                        onChange={e => setBloqueoForm(f => ({ ...f, motivo: e.target.value }))} />
                    </div>
                  </div>
                  <button className="btn btn-danger btn-style" onClick={handleCrearBloqueo}
                    disabled={crearBloqueoMut.isPending}>
                    <i className={`fa ${crearBloqueoMut.isPending ? 'fa-spinner fa-spin' : 'fa-ban'}`}></i> Agregar Bloqueo
                  </button>
                </div>
              </div>

              {/* Lista de bloqueos */}
              <div id="divListaBloqueos">
                {isLoadingBloqueos ? (
                  <p className="text-center text-muted">Cargando...</p>
                ) : bloqueos.length === 0 ? (
                  <p className="text-center text-muted" style={{ fontSize: '.82rem' }}>No hay bloqueos registrados</p>
                ) : (
                  bloqueos.map(b => (
                    <div key={b.Id_Bloqueo} className="bloqueo-item">
                      <div className="bloqueo-info">
                        <span className={`bloqueo-tipo bloqueo-tipo-${b.Tipo_Bloqueo}`}>
                          {formatBloqueoTipo(b.Tipo_Bloqueo)}
                        </span>
                        <span className="bloqueo-fechas">
                          {formatFecha(b.Fecha_Inicio)} → {formatFecha(b.Fecha_Fin)}
                        </span>
                        {b.Motivo && <div className="bloqueo-motivo">{b.Motivo}</div>}
                      </div>
                      <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: '8px' }}
                        onClick={() => handleEliminarBloqueo(b.Id_Bloqueo)}>
                        <i className="fa fa-trash-o"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          )}

          {/* ── SECCIÓN 5: PENALIZACIONES ── */}
          {(userType === 'A' || userType === 'M') && (
            <div className="cfg-card">
              <div className="cfg-card-header">
                <i className="fa fa-exclamation-triangle cfg-icon"></i>
                <h5>Penalizaciones de Usuarios</h5>
              </div>
              <div className="cfg-card-body">
                <p className="text-muted" style={{ fontSize: '.82rem' }}>
                  Usuarios que han superado el límite de cancelaciones para este médico.
                </p>
                <div>
                  {penalizaciones.length === 0 ? (
                    <p className="text-center text-muted">No hay penalizaciones activas</p>
                  ) : (
                    penalizaciones.map(p => (
                      <div key={p.Id_Usuario} className="penal-item">
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '.85rem' }}>{p.NombreUsuario}</div>
                          <div style={{ fontSize: '.75rem', color: '#8e8e93' }}>
                            Cancelaciones: {p.Cant_Cancelaciones}
                            {p.Penalizado && p.Fecha_Fin_Penal ? ` · Penalizado hasta ${formatFecha(p.Fecha_Fin_Penal)}` : ''}
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          {p.Penalizado ? (
                            <>
                              <span className="badge-penalizado">Penalizado</span>
                              <button className="btn btn-sm btn-outline-success" style={{ borderRadius: '8px' }}
                                onClick={() => levantarPenalizacionMut.mutate({ idPenalizacion: p.Id_Usuario })}>
                                <i className="fa fa-unlock"></i> Levantar
                              </button>
                            </>
                          ) : (
                            <span className="badge-libre">Sin penalización</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── BOTONES FINALES ── */}
          <div className="text-right mb-5" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-style" onClick={() => navigate('/medicos')}>
              <i className="fa fa-arrow-left"></i> Regresar
            </button>
            <button className="btn btn-success btn-style" onClick={handleGuardarConfigGeneral} disabled={isSaving}>
              <i className={`fa ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> Guardar Configuración General
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ConfigAgenda;
