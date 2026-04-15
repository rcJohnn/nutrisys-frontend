import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAlerta } from '../components/Alerta/AlertaContext';
import {
  getConsultaById, createConsulta, updateConsulta,
  getClinicasMedico,
  type CreateConsultaData, type UpdateConsultaData,
} from '../api/consultas';
import { resolveApiFileUrl } from '../api/client';
import { getUsuarios, type Usuario } from '../api/usuarios';
import { getMedicos, getMedicosConAutoagendamiento } from '../api/medicos';
import CalendarioDisponibilidad from '../components/CalendarioDisponibilidad';
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
  const alerta = useAlerta();

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

  // Calendario de disponibilidad state
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [calendarioYear, setCalendarioYear] = useState(new Date().getFullYear());
  const [calendarioMonth, setCalendarioMonth] = useState(new Date().getMonth() + 1);

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

  // Load medicos: pacientes solo ven médicos con autoagendamiento habilitado
  const { data: medicos = [], isLoading: loadingMedicos } = useQuery({
    queryKey: ['medicos-select', userType],
    queryFn: () => userType === 'U' ? getMedicosConAutoagendamiento() : getMedicos(),
  });

  // Load clinics when medico changes
  const { data: clinicas = [] } = useQuery({
    queryKey: ['clinicas-medico', form.idMedico],
    queryFn: () => getClinicasMedico(form.idMedico),
    enabled: form.idMedico > 0,
  });

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
      // Load paciente info for edit mode
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
      getUsuarios({ nombre: '' }).then((usuarios) => {
        const p = (usuarios as Usuario[]).find((u: any) => u.Id_Usuario === userId);
        if (p) {
          setSelectedPaciente(p);
          setForm(f => ({ ...f, idUsuario: userId }));
          setShowSelfBadge(true);
        }
      });
    }
  }, [userType, userId]);

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
    // Reset calendario cuando cambia el médico
    setMostrarCalendario(false);
  };

  // Manejar selección de fecha desde calendario
  const handleFechaSeleccionadaCalendario = useCallback((fecha: string, slots: any[]) => {
    let horaSugerida = form.horaCita;
    if (slots.length > 0) {
      // Sugerir el primer slot disponible
      horaSugerida = slots[0].Inicio;
    }
    
    setForm(f => ({
      ...f,
      fechaCita: fecha,
      horaCita: horaSugerida
    }));
    
    setMostrarCalendario(false);
    
    // Mostrar mensaje informativo
    alerta.info(
      'Fecha seleccionada',
      `Se ha seleccionado la fecha ${fecha} a las ${horaSugerida}. Puedes ajustar la hora si lo deseas.`
    );
  }, [form.horaCita, alerta]);

  // Manejar cambio de mes en calendario
  const handleMesCambiadoCalendario = useCallback((year: number, month: number) => {
    setCalendarioYear(year);
    setCalendarioMonth(month);
  }, []);

  // Función para buscar paciente
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

  // Construye el payload a partir del estado del form
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

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (isEdit && id) {
        const updateData: UpdateConsultaData = {
          Id_Usuario: data.Id_Usuario,
          Id_Medico: data.Id_Medico,
          Id_Clinica: data.Id_Clinica,
          Fecha_Cita: data.Fecha_Cita,
          Duracion_Minutos: data.Duracion_Minutos,
          Estado: data.Estado,
          Motivo: data.Motivo,
          Forzar: data.Forzar,
        };
        return updateConsulta(Number(id), updateData);
      } else {
        const createData: CreateConsultaData = {
          Id_Usuario: data.Id_Usuario,
          Id_Medico: data.Id_Medico,
          Id_Clinica: data.Id_Clinica,
          Fecha_Cita: data.Fecha_Cita,
          Duracion_Minutos: data.Duracion_Minutos,
          Motivo: data.Motivo,
          Forzar: data.Forzar,
        };
        return createConsulta(createData);
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] });
      await alerta.success(
        isEdit ? 'Cita actualizada' : 'Cita agendada',
        isEdit ? 'La cita fue modificada correctamente.' : 'La cita fue agendada correctamente.'
      );
      navigate('/consultas');
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

    // Validaciones básicas
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
          onClick={() => navigate('/consultas')}
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

            {/* Médico */}
            <div className="form-group col-md-6">
              <label htmlFor="cboMedico" className="input__label">Médico *</label>
              {!loadingMedicos && userType === 'U' && medicos.length === 0 ? (
                <div className="mc-sin-autoagenda">
                  <i className="fa fa-info-circle"></i>
                  <span>
                    No hay médicos disponibles para autoagendar citas en este momento.
                    Por favor comuníquese directamente con su nutricionista.
                  </span>
                </div>
              ) : (
                <select
                  id="cboMedico"
                  name="idMedico"
                  className="form-control input-style"
                  required
                  disabled={userType === 'M' || loadingMedicos}
                  value={form.idMedico}
                  onChange={handleMedicoChange}
                >
                  <option value={0}>
                    {loadingMedicos ? 'Cargando médicos...' : 'Seleccione un médico...'}
                  </option>
                  {medicos.map((m: any) => (
                    <option key={m.Id_Medico} value={m.Id_Medico}>
                      {m.Nombre} {m.Prim_Apellido}
                    </option>
                  ))}
                </select>
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
                <input
                  type="date"
                  id="fechaCita"
                  name="fechaCita"
                  className="form-control input-style"
                  required
                  value={form.fechaCita}
                  onChange={handleChange}
                />
                {form.idMedico > 0 && (
                  <button
                    type="button"
                    className="mc-btn-ver-disponibilidad"
                    onClick={() => setMostrarCalendario(!mostrarCalendario)}
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
              />
            </div>
            <div className="form-group col-md-4">
              <label htmlFor="duracion" className="input__label">Duración (minutos) *</label>
              <select
                id="duracion"
                name="duracion"
                className="form-control input-style"
                required
                value={form.duracion}
                onChange={handleChange}
              >
                {DURACIONES.map(d => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
            </div>
          </div>

          {/* Calendario de disponibilidad */}
          {form.idMedico > 0 && mostrarCalendario && (
            <div className="mc-calendario-container">
              <div className="mc-calendario-header">
                <h4>Disponibilidad del médico</h4>
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
                <p><small>Selecciona una fecha disponible para autocompletar el formulario.</small></p>
              </div>
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
              onClick={() => navigate('/consultas')}
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
    </div>
  );
};

export default MantenimientoConsultas;