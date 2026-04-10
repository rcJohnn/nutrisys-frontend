import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConsultaById, createConsulta, updateConsulta,
  getClinicasMedico,
  type CreateConsultaData, type UpdateConsultaData,
} from '../api/consultas';
import { getUsuarios, type Usuario } from '../api/usuarios';
import { getMedicos } from '../api/medicos';
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

  // Load medicos for dropdown
  const { data: medicos = [] } = useQuery({
    queryKey: ['medicos-select'],
    queryFn: () => getMedicos(),
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
      setShowSelfBadge(true);
      getUsuarios({}).then((usuarios) => {
        const u = (usuarios as Usuario[]).find((x: any) => x.Id_Usuario === userId);
        if (u) setSelectedPaciente(u);
      });
    }
  }, [userType, userId]);

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
  };

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (isEdit && id) {
        const updateData: UpdateConsultaData = {
          Id_Medico: data.idMedico,
          Id_Clinica: data.idClinica || undefined,
          Fecha_Cita: `${data.fechaCita}T${data.horaCita}:00`,
          Duracion_Minutos: data.duracion,
          Estado: data.estado,
          Motivo: data.motivo,
        };
        return updateConsulta(Number(id), updateData);
      } else {
        const createData: CreateConsultaData = {
          Id_Usuario: data.idUsuario,
          Id_Medico: data.idMedico,
          Id_Clinica: data.idClinica || undefined,
          Fecha_Cita: `${data.fechaCita}T${data.horaCita}:00`,
          Duracion_Minutos: data.duracion,
          Motivo: data.motivo,
        };
        return createConsulta(createData);
      }
    },
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
                <select
                  id="cboMedico"
                  name="idMedico"
                  className="form-control input-style"
                  required
                  value={form.idMedico}
                  onChange={handleMedicoChange}
                >
                  <option value={0}>Seleccione un médico...</option>
                  {medicos.map((m: any) => (
                    <option key={m.Id_Medico} value={m.Id_Medico}>
                      {m.Nombre} {m.Prim_Apellido}
                    </option>
                  ))}
                </select>
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
                        <div className="mc-clinica-logo-placeholder">
                          <i className="fa fa-hospital-o"></i>
                        </div>
                        <div className="mc-clinica-nombre">{c.nombre}</div>
                        <div className="mc-clinica-dir">{c.direccion}</div>
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
                <input
                  type="date"
                  id="fechaCita"
                  name="fechaCita"
                  className="form-control input-style"
                  required
                  value={form.fechaCita}
                  onChange={handleChange}
                />
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
    </div>
  );
};

export default MantenimientoConsultas;
