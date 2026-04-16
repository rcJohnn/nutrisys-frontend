import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
<<<<<<< HEAD
import { useAlerta } from '../components/Alerta/AlertaContext';
=======
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
import {
  getConsultaById, createConsulta, updateConsulta,
  getClinicasMedico,
  type CreateConsultaData, type UpdateConsultaData,
} from '../api/consultas';
<<<<<<< HEAD
import { resolveApiFileUrl } from '../api/client';
import { getUsuarios, type Usuario } from '../api/usuarios';
import { getMedicos, getMedicosConAutoagendamiento } from '../api/medicos';
import { getConfigMedico } from '../api/configAgenda';
import type { SlotDisponible } from '../types/disponibilidad';
import { formatFechaDisplay } from '../types/disponibilidad';
import CalendarioDisponibilidad from '../components/CalendarioDisponibilidad';
=======
import { getUsuarios, type Usuario } from '../api/usuarios';
import { getMedicos } from '../api/medicos';
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
import './MantenimientoConsultas.css';

const DURACIONES = [15, 30, 45, 60, 90, 120];
const ESTADOS = [
  { value: 'P', label: 'Pendiente' },
  { value: 'C', label: 'Completada' },
  { value: 'X', label: 'Cancelada' },
  { value: 'N', label: 'No Asistió' },
];

const MantenimientoConsultas: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const userType = localStorage.getItem('userType') || 'A';
  const userId = Number(localStorage.getItem('userId') || '0');
<<<<<<< HEAD
  const alerta = useAlerta();
=======
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91

  // Form state
  const [form, setForm] = useState({
    idUsuario: 0,
    idMedico: 0,
    idClinica: 0 as number | null,
    fechaCita: '',
    horaCita: '',
    duracion: 30,
    motivo: '',
    estado: 'P',
  });

<<<<<<< HEAD
  // Calendario state
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [calendarioYear, setCalendarioYear] = useState(new Date().getFullYear());
  const [calendarioMonth, setCalendarioMonth] = useState(new Date().getMonth() + 1);

  // Slot picker state (mejora: mostrar slots al seleccionar fecha)
  const [vistaPanel, setVistaPanel] = useState<'calendario' | 'slots'>('calendario');
  const [fechaSlots, setFechaSlots] = useState<string | null>(null);
  const [slotsParaFecha, setSlotsParaFecha] = useState<SlotDisponible[]>([]);

=======
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Usuario[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Usuario | null>(null);

  // UI state
  const [showSelfBadge, setShowSelfBadge] = useState(false);

  // Load existing consulta if editing
  const { data: consultaExistente } = useQuery({
    queryKey: ['consulta', id],
    queryFn: () => getConsultaById(Number(id)),
    enabled: isEdit && Boolean(id),
  });

<<<<<<< HEAD
  // Load medicos
  const { data: medicos = [], isLoading: loadingMedicos } = useQuery({
    queryKey: ['medicos-select', userType],
    queryFn: () => userType === 'U' ? getMedicosConAutoagendamiento() : getMedicos(),
  });

  // Load config del médico seleccionado para obtener duración del slot
  const { data: configMedico } = useQuery({
    queryKey: ['config-medico', form.idMedico],
    queryFn: () => getConfigMedico(form.idMedico),
    enabled: form.idMedico > 0,
=======
  // Load medicos for dropdown
  const { data: medicos = [] } = useQuery({
    queryKey: ['medicos-select'],
    queryFn: () => getMedicos(),
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
  });

  // Load clinics when medico changes
  const { data: clinicas = [] } = useQuery({
    queryKey: ['clinicas-medico', form.idMedico],
    queryFn: () => getClinicasMedico(form.idMedico),
    enabled: form.idMedico > 0,
  });

<<<<<<< HEAD
  // Bug fix 1: para médicos (M), el userId ES el Id_Medico — auto-seleccionar
  useEffect(() => {
    if (userType === 'M' && userId > 0 && !isEdit) {
      setForm(f => ({ ...f, idMedico: userId }));
    }
  }, [userType, userId, isEdit]);

  // Bug fix 4: cuando carga la config del médico, aplicar Duracion_Slot_Min (solo en creación)
  useEffect(() => {
    if (!isEdit && configMedico?.Duracion_Slot_Min) {
      setForm(f => ({ ...f, duracion: configMedico.Duracion_Slot_Min }));
    }
  }, [configMedico, isEdit]);

=======
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
  // Load data into form when editing
  useEffect(() => {
    if (consultaExistente) {
      setForm({
        idUsuario: consultaExistente.Id_Usuario,
        idMedico: consultaExistente.Id_Medico,
        idClinica: consultaExistente.Id_Clinica ?? 0,
        fechaCita: consultaExistente.Fecha_Cita.split('T')[0],
        horaCita: consultaExistente.Fecha_Cita.split('T')[1]?.substring(0, 5) || '',
        duracion: consultaExistente.Duracion_Minutos,
        motivo: consultaExistente.Motivo,
        estado: consultaExistente.Estado === 'Completada' ? 'C'
          : consultaExistente.Estado === 'Cancelada' ? 'X'
          : consultaExistente.Estado === 'No Asistió' ? 'N' : 'P',
      });
<<<<<<< HEAD
=======
      // Load paciente info for edit mode
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
      if (userType !== 'U') {
        getUsuarios({ nombre: '' }).then((usuarios) => {
          const p = (usuarios as Usuario[]).find((u: any) => u.Id_Usuario === consultaExistente.Id_Usuario);
          if (p) setSelectedPaciente(p);
        });
      }
    }
  }, [consultaExistente, userType]);

  // Self-scheduling mode (patient)
  useEffect(() => {
    if (userType === 'U') {
<<<<<<< HEAD
      getUsuarios({ nombre: '' }).then((usuarios) => {
        const p = (usuarios as Usuario[]).find((u: any) => u.Id_Usuario === userId);
        if (p) {
          setSelectedPaciente(p);
          setForm(f => ({ ...f, idUsuario: userId }));
          setShowSelfBadge(true);
        }
=======
      setShowSelfBadge(true);
      getUsuarios({}).then((usuarios) => {
        const u = (usuarios as Usuario[]).find((x: any) => x.Id_Usuario === userId);
        if (u) setSelectedPaciente(u);
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
      });
    }
  }, [userType, userId]);

<<<<<<< HEAD
  // Search for pacientes
  useEffect(() => {
    if (searchTerm.length >= 2 && userType !== 'U') {
      getUsuarios({ nombre: searchTerm }).then((usuarios) => {
        setSearchResults(usuarios as Usuario[]);
        setShowResults(true);
      });
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchTerm, userType]);
=======
  // Auto-seleccionar médico cuando es perfil Médico
  useEffect(() => {
    if (userType === 'M' && userId > 0 && !isEdit) {
      setForm(f => ({ ...f, idMedico: userId }));
    }
  }, [userType, userId, isEdit]);

  // Search pacientes with debounce
  const buscarPacientes = useCallback((term: string) => {
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

  useEffect(() => {
    const timer = setTimeout(() => buscarPacientes(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, buscarPacientes]);

  const seleccionarPaciente = (paciente: Usuario) => {
    setSelectedPaciente(paciente);
    setForm(f => ({ ...f, idUsuario: paciente.Id_Usuario }));
    setSearchTerm('');
    setShowResults(false);
  };

  const limpiarPaciente = () => {
    setSelectedPaciente(null);
    setForm(f => ({ ...f, idUsuario: 0 }));
  };
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: name === 'idClinica' ? (value ? Number(value) : null) : Number(value) || value,
    }));
  };

  const handleMedicoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idMedico = Number(e.target.value);
    setForm(f => ({ ...f, idMedico, idClinica: 0 }));
<<<<<<< HEAD
    // Resetear panel completo al cambiar médico
    setMostrarCalendario(false);
    setVistaPanel('calendario');
    setFechaSlots(null);
    setSlotsParaFecha([]);
  };

  // Mejora: al seleccionar fecha en calendario, mostrar sus slots disponibles
  const handleFechaSeleccionadaCalendario = useCallback((fecha: string, slots: SlotDisponible[]) => {
    setFechaSlots(fecha);
    setSlotsParaFecha(slots);
    setForm(f => ({ ...f, fechaCita: fecha, horaCita: '' }));
    if (slots.length > 0) {
      setVistaPanel('slots');
    } else {
      alerta.warning('Sin horarios', 'No hay horarios disponibles para esa fecha.');
    }
  }, [alerta]);

  // Al seleccionar un slot, rellenar hora + duración y cerrar el panel
  const handleSlotSeleccionado = useCallback((slot: SlotDisponible) => {
    setForm(f => ({
      ...f,
      horaCita: slot.Inicio.substring(0, 5),
      duracion: slot.DuracionMinutos,
    }));
    setMostrarCalendario(false);
    setVistaPanel('calendario');
    setFechaSlots(null);
    setSlotsParaFecha([]);
  }, []);

  const handleVolverAlCalendario = useCallback(() => {
    setVistaPanel('calendario');
    setFechaSlots(null);
    setSlotsParaFecha([]);
    setForm(f => ({ ...f, fechaCita: '', horaCita: '' }));
  }, []);

  const handleMesCambiadoCalendario = useCallback((year: number, month: number) => {
    setCalendarioYear(year);
    setCalendarioMonth(month);
  }, []);

  const seleccionarPaciente = useCallback((p: Usuario) => {
    setSelectedPaciente(p);
    setForm(f => ({ ...f, idUsuario: p.Id_Usuario }));
    setSearchTerm('');
    setShowResults(false);
  }, []);

  const limpiarPaciente = useCallback(() => {
    setSelectedPaciente(null);
    setForm(f => ({ ...f, idUsuario: 0 }));
  }, []);

  const buildPayload = (forzar = false) => ({
    Id_Usuario: userType === 'U' ? userId : form.idUsuario,
    Id_Medico: form.idMedico,
    Id_Clinica: form.idClinica || undefined,
    Fecha_Cita: `${form.fechaCita}T${form.horaCita}:00`,
    Duracion_Minutos: form.duracion,
    Estado: form.estado,
    Motivo: form.motivo || undefined,
    Forzar: forzar,
  });

=======
  };

>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (isEdit && id) {
        const updateData: UpdateConsultaData = {
<<<<<<< HEAD
          Id_Usuario: data.Id_Usuario,
          Id_Medico: data.Id_Medico,
          Id_Clinica: data.Id_Clinica,
          Fecha_Cita: data.Fecha_Cita,
          Duracion_Minutos: data.Duracion_Minutos,
          Estado: data.Estado,
          Motivo: data.Motivo,
          Forzar: data.Forzar,
=======
          Id_Medico: data.idMedico,
          Id_Clinica: data.idClinica || undefined,
          Fecha_Cita: `${data.fechaCita}T${data.horaCita}:00`,
          Duracion_Minutos: data.duracion,
          Estado: data.estado,
          Motivo: data.motivo,
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
        };
        return updateConsulta(Number(id), updateData);
      } else {
        const createData: CreateConsultaData = {
<<<<<<< HEAD
          Id_Usuario: data.Id_Usuario,
          Id_Medico: data.Id_Medico,
          Id_Clinica: data.Id_Clinica,
          Fecha_Cita: data.Fecha_Cita,
          Duracion_Minutos: data.Duracion_Minutos,
          Motivo: data.Motivo,
          Forzar: data.Forzar,
=======
          Id_Usuario: data.idUsuario,
          Id_Medico: data.idMedico,
          Id_Clinica: data.idClinica || undefined,
          Fecha_Cita: `${data.fechaCita}T${data.horaCita}:00`,
          Duracion_Minutos: data.duracion,
          Motivo: data.motivo,
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
        };
        return createConsulta(createData);
      }
    },
<<<<<<< HEAD
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] });
      await alerta.success(
        isEdit ? 'Cita actualizada' : 'Cita agendada',
        isEdit ? 'La cita fue modificada correctamente.' : 'La cita fue agendada correctamente.'
      );
      // Bug fix 2: usuarios van al panel principal, no a consultas
      navigate(userType === 'U' ? '/' : '/consultas');
    },
    onError: async (err: any) => {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 409) {
        const codigo: number = data?.Codigo ?? data?.codigo ?? -1;
        const esUsuario = userType === 'U';

        if (esUsuario) {
          const mensajesUsuario: Record<number, string> = {
            [-1]: 'El médico ya tiene una cita en ese horario. Elegí otra fecha u hora.',
            [-2]: 'El horario solicitado está fuera del horario laboral del médico.',
            [-3]: 'El médico tiene un bloqueo en ese horario. Elegí otra fecha u hora.',
            [-4]: 'El horario cae dentro de un tiempo de comida del médico. Elegí otra hora.',
            [-5]: 'El horario termina muy cerca de un bloqueo del médico. Elegí un horario que termine al menos 30 minutos antes del bloqueo.',
          };
          await alerta.error(
            'Horario no disponible',
            mensajesUsuario[codigo] ?? 'El horario seleccionado no está disponible.'
          );
        } else {
          const titulos: Record<number, string> = {
            [-1]: 'Horario ocupado',
            [-2]: 'Fuera de horario laboral',
            [-3]: 'Bloqueo de agenda',
            [-4]: 'Tiempo de comida',
            [-5]: 'Cerca de bloqueo',
          };
          const mensajes: Record<number, string> = {
            [-1]: 'El médico ya tiene una cita en ese horario. ¿Querés agendar igual como cita de recargo?',
            [-2]: 'El horario está fuera del horario laboral configurado. ¿Querés forzar el agendamiento igual?',
            [-3]: 'El médico tiene un bloqueo en ese horario. ¿Querés forzar el agendamiento igual?',
            [-4]: 'El horario cae dentro de un tiempo de comida del médico. ¿Querés forzar el agendamiento igual?',
            [-5]: 'El horario termina muy cerca de un bloqueo del médico. ¿Querés forzar el agendamiento igual?',
          };
          const confirmar = await alerta.confirm(
            titulos[codigo] ?? 'Conflicto de agenda',
            mensajes[codigo] ?? 'Hay un conflicto de agenda. ¿Querés agendar igual?',
            { textoConfirmar: 'Sí, agendar igual', textoCancelar: 'Cancelar' }
          );
          if (confirmar) mutation.mutate(buildPayload(true));
        }
      } else if (data?.Error ?? data?.error) {
        await alerta.error('Error al guardar', data?.Error ?? data?.error);
      } else if (data?.errors) {
        const msgs = Object.values(data.errors as Record<string, string[]>).flat().join('\n');
        await alerta.error('Error de validación', msgs || 'Revisá los campos del formulario.');
      } else {
        await alerta.error('Error inesperado', err.message || 'Ocurrió un error inesperado.');
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fechaCita || !form.horaCita) {
      await alerta.warning('Fecha y hora requeridas', 'Ingresá la fecha y hora de la cita.');
      return;
    }

    if (userType !== 'U' && form.idUsuario === 0) {
      await alerta.warning('Paciente requerido', 'Seleccioná un paciente para la consulta.');
      return;
    }

    if (form.idMedico === 0) {
      await alerta.warning('Médico requerido', 'Seleccioná un médico para la consulta.');
      return;
    }

    mutation.mutate(buildPayload());
  };

  return (
    <div className="mc-container">
      <div className="mc-header">
        <h2 className="mc-title">{isEdit ? 'Editar Consulta' : 'Agendar Consulta'}</h2>
        <button
          type="button"
          className="mc-back-btn"
          onClick={() => navigate(userType === 'U' ? '/' : '/consultas')}
        >
          <i className="fa fa-arrow-left"></i> Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mc-form">
        <div className="mc-card">
          {/* Badge de auto-agendamiento */}
          {showSelfBadge && selectedPaciente && (
            <div className="mc-self-badge mb-3">
              <i className="fa fa-user-circle"></i>
              <div>
                <div className="mc-self-badge-name">
                  {selectedPaciente.Nombre} {selectedPaciente.Prim_Apellido}
                </div>
                <div className="mc-self-badge-sub">Paciente</div>
              </div>
            </div>
          )}

          {/* FILA 1: Paciente (admin/medico) + Médico */}
          <div className="form-row">
            {/* Paciente search (admin/medico only) */}
            {userType !== 'U' && (
              <div className="form-group col-md-6">
                <label className="input__label">Paciente *</label>
                <input type="hidden" name="idUsuario" value={form.idUsuario} />
                {selectedPaciente ? (
                  <div className="mc-paciente-badge">
                    <i className="fa fa-user"></i>
                    <span>{selectedPaciente.Nombre} {selectedPaciente.Prim_Apellido}</span>
                    <button type="button" onClick={limpiarPaciente} title="Cambiar paciente">&times;</button>
                  </div>
                ) : (
                  <div className="mc-search-wrapper">
                    <input
                      type="text"
                      className="form-control input-style"
                      placeholder="Busca por nombre o apellido..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
                      autoComplete="off"
                    />
                    {showResults && searchResults.length > 0 && (
                      <div className="mc-search-results">
                        {searchResults.map(p => (
                          <div
                            key={p.Id_Usuario}
                            className="mc-search-item"
                            onClick={() => seleccionarPaciente(p)}
                          >
                            <i className="fa fa-user"></i>
                            <span>{p.Nombre} {p.Prim_Apellido} {p.Seg_Apellido}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Médico: para 'M' se muestra como badge (auto-seleccionado), para otros como select */}
            <div className="form-group col-md-6">
              <label htmlFor="cboMedico" className="input__label">Médico *</label>
              {userType === 'M' ? (
                // Bug fix 1: médico ve su propio nombre sin selector
                <div className="mc-paciente-badge">
                  <i className="fa fa-user-md"></i>
                  <span>
                    {medicos.find((m: any) => m.Id_Medico === userId)
                      ? `${(medicos.find((m: any) => m.Id_Medico === userId) as any).Nombre} ${(medicos.find((m: any) => m.Id_Medico === userId) as any).Prim_Apellido}`
                      : 'Cargando...'}
                  </span>
                </div>
              ) : !loadingMedicos && userType === 'U' && medicos.length === 0 ? (
                <div className="mc-sin-autoagenda">
                  <i className="fa fa-info-circle"></i>
                  <span>
                    No hay médicos disponibles para autoagendar citas en este momento.
                    Por favor comuníquese directamente con su nutricionista.
                  </span>
                </div>
              ) : (
=======
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] });
      alert(isEdit ? 'Cita actualizada correctamente' : 'Cita agendada correctamente');
      navigate('/consultas');
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Error al guardar la cita');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.idUsuario && userType !== 'U') {
      alert('Seleccione un paciente');
      return;
    }
    if (!form.idMedico) {
      alert('Seleccione un médico');
      return;
    }
    if (!form.fechaCita || !form.horaCita) {
      alert('Ingrese fecha y hora de la cita');
      return;
    }
    mutation.mutate(form);
  };

  const handleRegresar = () => navigate('/consultas');

  return (
    <div className="mantenimiento-consultas-page mc-page">
      {/* Breadcrumb */}
      <nav className="cm-breadcrumb">
        <span onClick={() => navigate('/dashboard')} className="cm-bc-link">Inicio</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span onClick={() => navigate('/consultas')} className="cm-bc-link">Consulta de Citas</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span className="cm-bc-active">{isEdit ? 'Editar Cita' : 'Agendar Cita'}</span>
      </nav>

      {/* Welcome */}
      <div className="welcome-msg pt-3 pb-4">
        <h1>{isEdit ? 'Editar Cita' : 'Agendar Cita'}</h1>
      </div>

      <div className="card card_border py-2 mb-4">
        <div className="cards__heading">
          <h3>{isEdit ? 'Editar Cita Médica' : 'Nueva Cita Médica'}</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>

            {/* Self scheduling badge (patient) */}
            {showSelfBadge && selectedPaciente && (
              <div className="mc-self-badge mb-3">
                <i className="fa fa-user-circle"></i>
                <div>
                  <div className="mc-self-badge-name">
                    {selectedPaciente.Nombre} {selectedPaciente.Prim_Apellido}
                  </div>
                  <div className="mc-self-badge-sub">Paciente</div>
                </div>
              </div>
            )}

            {/* FILA 1: Paciente (admin/medico) + Médico */}
            <div className="form-row">
              {/* Paciente search (admin/medico only) */}
              {userType !== 'U' && (
                <div className="form-group col-md-6">
                  <label className="input__label">Paciente *</label>
                  <input type="hidden" name="idUsuario" value={form.idUsuario} />
                  {selectedPaciente ? (
                    <div className="mc-paciente-badge">
                      <i className="fa fa-user"></i>
                      <span>{selectedPaciente.Nombre} {selectedPaciente.Prim_Apellido}</span>
                      <button type="button" onClick={limpiarPaciente} title="Cambiar paciente">&times;</button>
                    </div>
                  ) : (
                    <div className="mc-search-wrapper">
                      <input
                        type="text"
                        className="form-control input-style"
                        placeholder="Busca por nombre o apellido..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
                        autoComplete="off"
                      />
                      {showResults && searchResults.length > 0 && (
                        <div className="mc-search-results">
                          {searchResults.map(p => (
                            <div
                              key={p.Id_Usuario}
                              className="mc-search-item"
                              onClick={() => seleccionarPaciente(p)}
                            >
                              <i className="fa fa-user"></i>
                              <span>{p.Nombre} {p.Prim_Apellido} {p.Seg_Apellido}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Médico */}
              <div className="form-group col-md-6">
                <label htmlFor="cboMedico" className="input__label">Médico *</label>
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
                <select
                  id="cboMedico"
                  name="idMedico"
                  className="form-control input-style"
                  required
<<<<<<< HEAD
                  disabled={loadingMedicos}
                  value={form.idMedico}
                  onChange={handleMedicoChange}
                >
                  <option value={0}>
                    {loadingMedicos ? 'Cargando médicos...' : 'Seleccione un médico...'}
                  </option>
=======
                  disabled={userType === 'M'}
                  value={form.idMedico}
                  onChange={handleMedicoChange}
                >
                  <option value={0}>Seleccione un médico...</option>
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
                  {medicos.map((m: any) => (
                    <option key={m.Id_Medico} value={m.Id_Medico}>
                      {m.Nombre} {m.Prim_Apellido}
                    </option>
                  ))}
                </select>
<<<<<<< HEAD
              )}
            </div>
          </div>

          {/* Clínica (solo si hay clínicas) */}
          {clinicas.length > 0 && (
            <div className="form-row">
              <div className="form-group col-md-12">
                <label className="input__label">
                  <i className="fa fa-hospital-o"></i> Clínica de Atención
                </label>
                <input type="hidden" name="idClinica" value={form.idClinica || 0} />
                <div className="mc-clinica-grid">
                  {clinicas.map((c: any) => {
                    const clinicaId = c.Id_Clinica ?? c.id;
                    const logoUrl = resolveApiFileUrl(c.Logo_Url);
                    return (
                      <div
                        key={clinicaId}
                        className={`mc-clinica-item ${form.idClinica === clinicaId ? 'selected' : ''}`}
                        onClick={() => setForm(f => ({ ...f, idClinica: clinicaId }))}
                      >
                        {logoUrl && (
                          <img src={logoUrl} alt={c.Nombre} className="mc-clinica-logo" />
                        )}
                        <div className="mc-clinica-info">
                          <div className="mc-clinica-name">{c.Nombre}</div>
                          <div className="mc-clinica-address">{c.Direccion}</div>
                        </div>
                        <div className="mc-clinica-check">
                          <i className="fa fa-check"></i>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* FILA 2: Fecha + Hora + Duración */}
          <div className="form-row">
            <div className="form-group col-md-4">
              <label htmlFor="fechaCita" className="input__label">Fecha de la Cita *</label>
              <div className="mc-fecha-hora-wrapper">
=======
              </div>
            </div>

            {/* Clínica (solo si hay clínicas) */}
            {clinicas.length > 0 && (
              <div className="form-row">
                <div className="form-group col-md-12">
                  <label className="input__label">
                    <i className="fa fa-hospital-o"></i> Clínica de Atención
                  </label>
                  <input type="hidden" name="idClinica" value={form.idClinica || 0} />
                  <div className="mc-clinica-grid">
                    {clinicas.map((c: any) => (
                      <div
                        key={c.id}
                        className={`mc-clinica-card ${form.idClinica === c.id ? 'selected' : ''}`}
                        onClick={() => setForm(f => ({ ...f, idClinica: c.id }))}
                      >
                        {c.Logo_Url ? (
                          <img src={c.Logo_Url} alt={c.nombre} className="mc-clinica-logo-img" />
                        ) : (
                          <div className="mc-clinica-logo-placeholder">
                            <i className="fa fa-hospital-o"></i>
                          </div>
                        )}
                        <div className="mc-clinica-nombre">{c.nombre}</div>
                        <div className="mc-clinica-dir">{c.direccion}</div>
                        {form.idClinica === c.id && (
                          <div className="mc-clinica-confirm-overlay">
                            <i className="fa fa-check-circle"></i> Confirmada
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* FILA 2: Fecha + Hora + Duración */}
            <div className="form-row">
              <div className="form-group col-md-4">
                <label htmlFor="fechaCita" className="input__label">Fecha de la Cita *</label>
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
                <input
                  type="date"
                  id="fechaCita"
                  name="fechaCita"
                  className="form-control input-style"
                  required
                  value={form.fechaCita}
                  onChange={handleChange}
                />
<<<<<<< HEAD
                {form.idMedico > 0 && (
                  <button
                    type="button"
                    className="mc-btn-ver-disponibilidad"
                    onClick={() => {
                      setMostrarCalendario(!mostrarCalendario);
                      setVistaPanel('calendario');
                      setFechaSlots(null);
                      setSlotsParaFecha([]);
                    }}
                    title="Ver disponibilidad del médico"
                  >
                    <i className="fa fa-calendar"></i>
                    {mostrarCalendario ? 'Ocultar calendario' : 'Ver disponibilidad'}
                  </button>
                )}
              </div>
            </div>
            <div className="form-group col-md-4">
              <label htmlFor="horaCita" className="input__label">Hora de la Cita *</label>
              <input
                type="time"
                id="horaCita"
                name="horaCita"
                className="form-control input-style"
                required
                value={form.horaCita}
                onChange={handleChange}
                step={form.duracion * 60}
              />
            </div>
            {/* Duración: oculto para usuarios (U), configurable para M/A */}
            {userType !== 'U' && (
              <div className="form-group col-md-4">
                <label htmlFor="duracion" className="input__label">
                  Duración (minutos) *
                  {configMedico && (
                    <span className="mc-config-hint"> — config: {configMedico.Duracion_Slot_Min} min</span>
                  )}
                </label>
=======
              </div>
              <div className="form-group col-md-4">
                <label htmlFor="horaCita" className="input__label">Hora de la Cita *</label>
                <input
                  type="time"
                  id="horaCita"
                  name="horaCita"
                  className="form-control input-style"
                  required
                  value={form.horaCita}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label htmlFor="duracion" className="input__label">Duración (minutos) *</label>
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
                <select
                  id="duracion"
                  name="duracion"
                  className="form-control input-style"
                  required
                  value={form.duracion}
                  onChange={handleChange}
                >
<<<<<<< HEAD
                  {/* Si la duración del config no está en la lista fija, agregarla */}
                  {[...new Set([...DURACIONES, configMedico?.Duracion_Slot_Min].filter(Boolean) as number[])].sort((a, b) => a - b).map(d => (
                    <option key={d} value={d}>{d} min{d === configMedico?.Duracion_Slot_Min ? ' ✓' : ''}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Panel de calendario / slot picker */}
          {form.idMedico > 0 && mostrarCalendario && (
            <div className="mc-calendario-container">
              {vistaPanel === 'calendario' ? (
                <>
                  <div className="mc-calendario-header">
                    <h4><i className="fa fa-calendar"></i> Disponibilidad del médico</h4>
                    <button
                      type="button"
                      className="mc-btn-cerrar-calendario"
                      onClick={() => setMostrarCalendario(false)}
                      title="Cerrar calendario"
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  </div>
                  <CalendarioDisponibilidad
                    medicoId={form.idMedico}
                    year={calendarioYear}
                    month={calendarioMonth}
                    duracionMinutos={form.duracion}
                    onFechaSeleccionada={handleFechaSeleccionadaCalendario}
                    onMesCambiado={handleMesCambiadoCalendario}
                    className="mc-calendario-embedded"
                  />
                  <div className="mc-calendario-info">
                    <p><small>Seleccioná una fecha disponible para ver los horarios.</small></p>
                  </div>
                </>
              ) : (
                /* Mejora: slot picker — se muestra al elegir una fecha */
                <div className="mc-slot-picker">
                  <div className="mc-slot-picker-header">
                    <button
                      type="button"
                      className="mc-btn-volver-calendario"
                      onClick={handleVolverAlCalendario}
                    >
                      <i className="fa fa-arrow-left"></i> Volver
                    </button>
                    <h4>
                      <i className="fa fa-clock-o"></i>{' '}
                      Horarios para {fechaSlots ? formatFechaDisplay(fechaSlots) : ''}
                    </h4>
                    <button
                      type="button"
                      className="mc-btn-cerrar-calendario"
                      onClick={() => setMostrarCalendario(false)}
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  </div>

                  {slotsParaFecha.length === 0 ? (
                    <div className="mc-slot-empty">
                      <i className="fa fa-calendar-times-o"></i>
                      <p>No hay horarios disponibles para esta fecha.</p>
                    </div>
                  ) : (
                    <div className="mc-slot-grid">
                      {[...slotsParaFecha]
                        .sort((a, b) => a.Inicio.localeCompare(b.Inicio))
                        .filter((slot, i, arr) => i === 0 || slot.Inicio !== arr[i - 1].Inicio)
                        .map((slot, i) => (
                        <button
                          key={i}
                          type="button"
                          className="mc-slot-btn"
                          onClick={() => handleSlotSeleccionado(slot)}
                        >
                          <i className="fa fa-clock-o"></i>
                          <span className="mc-slot-hora">
                            {slot.Inicio.substring(0, 5)} – {slot.Fin.substring(0, 5)}
                          </span>
                          <span className="mc-slot-dur">{slot.DuracionMinutos} min</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* FILA 3: Motivo */}
          <div className="form-row">
            <div className="form-group col-md-12">
              <label htmlFor="motivo" className="input__label">Motivo de la Consulta</label>
              <textarea
                id="motivo"
                name="motivo"
                className="form-control input-style"
                rows={3}
                placeholder="Describa brevemente el motivo de la consulta"
                maxLength={500}
                value={form.motivo}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* FILA 4: Estado (solo edición) */}
          {isEdit && (
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="estado" className="input__label">Estado</label>
                <select
                  id="estado"
                  name="estado"
                  className="form-control input-style"
                  value={form.estado}
                  onChange={handleChange}
                >
                  {ESTADOS.map(e => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="mc-actions">
            <button
              type="button"
              className="mc-btn-cancelar"
              onClick={() => navigate(userType === 'U' ? '/' : '/consultas')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="mc-btn-guardar"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <i className="fa fa-spinner fa-spin"></i> Guardando...
                </>
              ) : (
                <>
                  <i className="fa fa-save"></i> {isEdit ? 'Actualizar' : 'Agendar'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
=======
                  {DURACIONES.map(d => (
                    <option key={d} value={d}>{d} min</option>
                  ))}
                </select>
              </div>
            </div>

            {/* FILA 3: Motivo */}
            <div className="form-row">
              <div className="form-group col-md-12">
                <label htmlFor="motivo" className="input__label">Motivo de la Consulta</label>
                <textarea
                  id="motivo"
                  name="motivo"
                  className="form-control input-style"
                  rows={3}
                  placeholder="Describa brevemente el motivo de la consulta"
                  maxLength={500}
                  value={form.motivo}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* FILA 4: Estado (solo edición) */}
            {isEdit && (
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="estado" className="input__label">Estado</label>
                  <select
                    id="estado"
                    name="estado"
                    className="form-control input-style"
                    value={form.estado}
                    onChange={handleChange}
                  >
                    {ESTADOS.map(e => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Botones */}
            <button type="submit" className="btn btn-primary btn-style mt-4" disabled={mutation.isPending}>
              <i className="fa fa-save"></i> {isEdit ? 'Actualizar Cita' : 'Agendar Cita'}
            </button>
            <button type="button" className="btn btn-secondary btn-style mt-4" onClick={handleRegresar}>
              <i className="fa fa-arrow-left"></i> Regresar
            </button>
          </form>
        </div>
      </div>
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
    </div>
  );
};

export default MantenimientoConsultas;
