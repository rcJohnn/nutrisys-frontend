import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConsultas, cancelarConsulta, marcarNoAsistio,
  type Consulta, type ConsultaFiltros,
} from '../api/consultas';
import { getUsuarios } from '../api/usuarios';
import { getMedicos } from '../api/medicos';
import { Pagination } from '../components/Pagination';
import { useAlerta } from '../components/Alerta/AlertaContext';
import './Consultas.css';

const PAGE_SIZE = 10;

// ── Helpers ────────────────────────────────────────────────────────────────

const ESTADO_LABELS: Record<string, string> = {
  P: 'Pendiente', C: 'Completada', X: 'Cancelada', N: 'No Asistió',
  Pendiente: 'Pendiente', Completada: 'Completada',
  Cancelada: 'Cancelada', 'No Asistió': 'No Asistió',
};

const ESTADO_CODE: Record<string, string> = {
  Pendiente: 'P', Completada: 'C', Cancelada: 'X', 'No Asistió': 'N',
  P: 'P', C: 'C', X: 'X', N: 'N',
};

const estadoLabel = (e: string) => ESTADO_LABELS[e] ?? e;
const estadoCode  = (e: string) => ESTADO_CODE[e]  ?? e;

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];
const DIAS_SHORT = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

// ── Calendar ───────────────────────────────────────────────────────────────

interface CalendarProps {
  consultas: Consulta[];
  onSelect: (c: Consulta) => void;
}

const CalendarView: React.FC<CalendarProps> = ({ consultas, onSelect }) => {
  const [current, setCurrent] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });

  const prevMes = () => setCurrent(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; });
  const nextMes = () => setCurrent(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; });

  const year  = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  // Build grid: 42 cells
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length < 42) cells.push(null);

  // Index events by day
  const byDay = new Map<number, Consulta[]>();
  consultas.forEach(c => {
    const d = new Date(c.Fecha_Cita);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(c);
    }
  });

  return (
    <div className="cc-calendar">
      <div className="cc-cal-nav">
        <button className="cc-cal-nav-btn" onClick={prevMes}>
          <i className="fa fa-chevron-left" />
        </button>
        <span className="cc-cal-nav-title">{MESES[month]} {year}</span>
        <button className="cc-cal-nav-btn" onClick={nextMes}>
          <i className="fa fa-chevron-right" />
        </button>
      </div>

      <div className="cc-cal-weekdays">
        {DIAS_SHORT.map(d => <div key={d} className="cc-cal-weekday">{d}</div>)}
      </div>

      <div className="cc-cal-grid">
        {cells.map((day, idx) => {
          const isToday = day !== null
            && day === today.getDate()
            && month === today.getMonth()
            && year === today.getFullYear();
          const events = day ? (byDay.get(day) ?? []) : [];

          return (
            <div
              key={idx}
              className={`cc-cal-day${!day ? ' cc-cal-day--other' : ''}${isToday ? ' cc-cal-day--today' : ''}`}
            >
              {day && <div className="cc-cal-day-num">{day}</div>}
              {events.slice(0, 3).map(c => (
                <div
                  key={c.Id_Consulta}
                  className={`cc-cal-event cc-cal-event--${estadoCode(c.Estado)}`}
                  onClick={() => onSelect(c)}
                  title={`${c.NombreUsuario} — ${estadoLabel(c.Estado)}`}
                >
                  {new Date(c.Fecha_Cita).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })} {c.NombreUsuario.split(' ')[0]}
                </div>
              ))}
              {events.length > 3 && (
                <div className="cc-cal-more">+{events.length - 3} más</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Popup ──────────────────────────────────────────────────────────────────

interface PopupProps {
  consulta: Consulta;
  onClose: () => void;
  onEditar: () => void;
  onCancelar: () => void;
  onNoAsistio: () => void;
  onVerDetalle: () => void;
  onCompletarMetricas: () => void;
}

const ConsultaPopup: React.FC<PopupProps> = ({
  consulta, onClose, onEditar, onCancelar, onNoAsistio, onVerDetalle, onCompletarMetricas,
}) => {
  const code  = estadoCode(consulta.Estado);
  const label = estadoLabel(consulta.Estado);
  const fecha = new Date(consulta.Fecha_Cita);

  return (
    <div className="cc-popup-overlay" onClick={onClose}>
      <div className="cc-popup" onClick={e => e.stopPropagation()}>
        <div className="cc-popup-header">
          <h4><i className="fa fa-calendar-check-o" /> Detalle de Cita</h4>
          <button className="cc-popup-close" onClick={onClose}>✕</button>
        </div>
        <div className="cc-popup-body">
          <div className="cc-popup-row">
            <i className="fa fa-user" />
            <div><strong>Paciente</strong> {consulta.NombreUsuario}</div>
          </div>
          <div className="cc-popup-row">
            <i className="fa fa-stethoscope" />
            <div><strong>Médico</strong> {consulta.NombreMedico}</div>
          </div>
          <div className="cc-popup-row">
            <i className="fa fa-clock-o" />
            <div>
              <strong>Fecha</strong>{' '}
              {fecha.toLocaleDateString('es-CR', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })}{' '}
              {fecha.toLocaleTimeString('es-CR', { hour:'2-digit', minute:'2-digit' })}
            </div>
          </div>
          <div className="cc-popup-row">
            <i className="fa fa-hourglass-half" />
            <div><strong>Duración</strong> {consulta.Duracion_Minutos} min</div>
          </div>
          <div className="cc-popup-row">
            <i className="fa fa-circle" />
            <div>
              <strong>Estado</strong>{' '}
              <span className={`badge-estado badge-${code}`}>{label}</span>
            </div>
          </div>
          {consulta.Motivo && (
            <div className="cc-popup-row">
              <i className="fa fa-file-text-o" />
              <div><strong>Motivo</strong> {consulta.Motivo}</div>
            </div>
          )}
        </div>
        <div className="cc-popup-actions">
          {code === 'P' && (
            <>
              <button className="btn btn-sm btn-primary btn-style" onClick={onEditar}>
                <i className="fa fa-edit" /> Editar
              </button>
              <button className="btn btn-sm btn-success btn-style" onClick={onCompletarMetricas}>
                <i className="fa fa-check-circle" /> Completar Métricas
              </button>
              <button className="btn btn-sm btn-danger btn-style" onClick={onCancelar}>
                <i className="fa fa-times" /> Cancelar
              </button>
              <button className="btn btn-sm btn-secondary btn-style" onClick={onNoAsistio}>
                <i className="fa fa-user-times" /> No Asistió
              </button>
            </>
          )}
          {code === 'C' && (
            <button className="btn btn-sm btn-info btn-style" onClick={onVerDetalle}>
              <i className="fa fa-eye" /> Ver Detalle
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────

const Consultas: React.FC = () => {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const alerta      = useAlerta();
  const userType    = localStorage.getItem('userType') || 'A';
  const userId      = Number(localStorage.getItem('userId') || '0');
  const userName    = localStorage.getItem('userName') || '';
  const userEmail   = localStorage.getItem('userEmail') || '';

  const [vista, setVista]   = useState<'calendario' | 'tabla'>('calendario');
  const [popup, setPopup]   = useState<Consulta | null>(null);
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState<ConsultaFiltros>({
    Id_Usuario: userType === 'U' ? userId : undefined,
    Id_Medico:  userType === 'M' ? userId : undefined,
  });
  const [form, setForm] = useState({
    idUsuario: userType === 'U' ? userId : 0,
    idMedico:  userType === 'M' ? userId : 0,
    estado:    '',
    fechaInicio: '',
    fechaFin:    '',
  });

  // ── Queries ──
  const { data: consultas = [], isLoading } = useQuery({
    queryKey: ['consultas', filtros],
    queryFn:  () => getConsultas(filtros),
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios-select'],
    queryFn:  () => getUsuarios(),
    enabled:  userType === 'A',
  });

  const { data: medicos = [] } = useQuery({
    queryKey: ['medicos-select'],
    queryFn:  () => getMedicos(),
    enabled:  userType !== 'U',
  });

  // ── Mutations ──
  const cancelarMut = useMutation({
    mutationFn: cancelarConsulta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] });
      setPopup(null);
      alerta.success('Cita cancelada', 'La cita fue cancelada correctamente.');
    },
    onError: () => alerta.error('Error', 'No se pudo cancelar la cita.'),
  });

  const noAsistioMut = useMutation({
    mutationFn: marcarNoAsistio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] });
      setPopup(null);
      alerta.success('Registrado', 'La cita fue marcada como No Asistió.');
    },
    onError: () => alerta.error('Error', 'No se pudo marcar la cita.'),
  });

  // ── Handlers ──
  const handleFiltrar = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setFiltros({
      Id_Usuario: form.idUsuario || undefined,
      Id_Medico:  form.idMedico  || undefined,
      Estado:     form.estado    || undefined,
      FechaInicio: form.fechaInicio || undefined,
      FechaFin:    form.fechaFin   || undefined,
    });
  };

  const handleLimpiar = () => {
    setPage(1);
    setForm({
      idUsuario: userType === 'U' ? userId : 0,
      idMedico:  userType === 'M' ? userId : 0,
      estado: '', fechaInicio: '', fechaFin: '',
    });
    setFiltros({
      Id_Usuario: userType === 'U' ? userId : undefined,
      Id_Medico:  userType === 'M' ? userId : undefined,
    });
  };

  // ── Pagination ──
  const total = consultas.length;
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedConsultas = consultas.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelar = async (id: number) => {
    const ok = await alerta.confirm(
      '¿Cancelar esta cita?',
      'Esta acción no se puede deshacer.',
      { textoConfirmar: 'Sí, cancelar', textoCancelar: 'No' },
    );
    if (ok) cancelarMut.mutate(id);
  };

  const handleNoAsistio = async (id: number) => {
    const ok = await alerta.confirm(
      '¿Marcar como No Asistió?',
      'Se registrará que el paciente no se presentó a la cita.',
      { textoConfirmar: 'Confirmar', textoCancelar: 'Cancelar' },
    );
    if (ok) noAsistioMut.mutate(id);
  };

  // ── Render ──
  return (
    <div className="consultas-page">
      {/* Breadcrumb */}
      <nav className="cm-breadcrumb">
        <span onClick={() => navigate('/dashboard')} className="cm-bc-link">Inicio</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span className="cm-bc-active">Citas Médicas</span>
      </nav>

      {/* Welcome */}
      <div className="welcome-msg pt-3 pb-4">
        <h1>Hola <span className="text-primary">{userName}</span>, Bienvenido</h1>
        <p>{userEmail}</p>
      </div>

      {/* Hero */}
      <div className="cc-hero">
        <div className="cc-hero-info">
          <div className="cc-hero-icon"><i className="fa fa-calendar" /></div>
          <div>
            <div className="cc-hero-title">Citas Médicas</div>
            <div className="cc-hero-sub">Agenda, gestiona y haz seguimiento de las citas</div>
          </div>
        </div>
        <div className="cc-hero-actions">
          <div className="cc-vista-toggle">
            <button
              className={`btn-vista${vista === 'calendario' ? ' activo' : ''}`}
              onClick={() => setVista('calendario')}
            >
              <i className="fa fa-calendar" /> Calendario
            </button>
            <button
              className={`btn-vista${vista === 'tabla' ? ' activo' : ''}`}
              onClick={() => setVista('tabla')}
            >
              <i className="fa fa-list" /> Lista
            </button>
          </div>
          <button className="cc-hero-btn" onClick={() => navigate('/consultas/nueva')}>
            <i className="fa fa-plus" /> Agendar Cita
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="cc-layout">
        {/* Main */}
        <div>
          {isLoading ? (
            <div className="cc-loading"><i className="fa fa-spinner fa-spin" /> Cargando citas...</div>
          ) : vista === 'calendario' ? (
            <CalendarView consultas={consultas} onSelect={setPopup} />
          ) : (
            <div className="cc-table-wrapper">
              <div className="cards__heading"><h3>Listado de Citas</h3></div>
              {consultas.length === 0 ? (
                <div className="cc-empty">
                  <i className="fa fa-calendar-times-o" />
                  <p>No se encontraron citas con los filtros seleccionados.</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="cc-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Paciente</th>
                          <th>Médico</th>
                          <th>Fecha / Hora</th>
                          <th>Duración</th>
                          <th>Estado</th>
                          <th>Motivo</th>
                          <th style={{ textAlign: 'center' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedConsultas.map(c => {
                          const code  = estadoCode(c.Estado);
                          const label = estadoLabel(c.Estado);
                          const fecha = new Date(c.Fecha_Cita);
                          return (
                            <tr key={c.Id_Consulta}>
                              <td style={{ fontWeight: 600, color: 'var(--ns-slate-500)', fontSize: '0.8rem' }}>
                                #{c.Id_Consulta}
                              </td>
                              <td>{c.NombreUsuario}</td>
                              <td>{c.NombreMedico}</td>
                              <td style={{ whiteSpace: 'nowrap' }}>
                                {fecha.toLocaleDateString('es-CR', { day:'2-digit', month:'2-digit', year:'numeric' })}{' '}
                                {fecha.toLocaleTimeString('es-CR', { hour:'2-digit', minute:'2-digit' })}
                              </td>
                              <td>{c.Duracion_Minutos} min</td>
                              <td>
                                <span className={`badge-estado badge-${code}`}>{label}</span>
                              </td>
                              <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {c.Motivo || '—'}
                              </td>
                              <td>
                                <div className="cc-actions" style={{ justifyContent: 'center' }}>
                                  {code === 'P' && (
                                    <>
                                      <button
                                        className="cc-action-btn cc-action-btn--edit"
                                        title="Editar"
                                        onClick={() => navigate(`/consultas/editar/${c.Id_Consulta}`)}
                                      >
                                        <i className="fa fa-edit" />
                                      </button>
                                      <button
                                        className="cc-action-btn cc-action-btn--check"
                                        title="Completar Métricas"
                                        onClick={() => navigate(`/consultas/${c.Id_Consulta}/completar`)}
                                      >
                                        <i className="fa fa-check-circle" />
                                      </button>
                                      <button
                                        className="cc-action-btn cc-action-btn--cancel"
                                        title="Cancelar"
                                        onClick={() => handleCancelar(c.Id_Consulta)}
                                      >
                                        <i className="fa fa-times-circle" />
                                      </button>
                                      <button
                                        className="cc-action-btn cc-action-btn--na"
                                        title="No Asistió"
                                        onClick={() => handleNoAsistio(c.Id_Consulta)}
                                      >
                                        <i className="fa fa-user-times" />
                                      </button>
                                    </>
                                  )}
                                  {code === 'C' && (
                                    <button
                                      className="cc-action-btn cc-action-btn--view"
                                      title="Ver Detalle"
                                      onClick={() => navigate(`/consultas/detalle/${c.Id_Consulta}`)}
                                    >
                                      <i className="fa fa-eye" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    total={total}
                    page={page}
                    pageSize={PAGE_SIZE}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </div>
          )}
        </div>

        {/* Sidebar filtros */}
        <div className="cc-sidebar">
          <div className="cc-filter-card">
            <div className="cc-filter-header">
              <i className="fa fa-search" /> Filtrar citas
            </div>
            <div className="cc-filter-body">
              <form onSubmit={handleFiltrar}>
                {/* Filtro paciente — solo admin */}
                {userType === 'A' && (
                  <div className="form-group">
                    <label>Paciente</label>
                    <select
                      className="form-control input-style"
                      value={form.idUsuario}
                      onChange={e => setForm(f => ({ ...f, idUsuario: Number(e.target.value) }))}
                    >
                      <option value={0}>Todos</option>
                      {(usuarios as any[]).map((u: any) => (
                        <option key={u.Id_Usuario} value={u.Id_Usuario}>
                          {u.Nombre} {u.Prim_Apellido} {u.Seg_Apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Filtro médico — admin y paciente */}
                {userType !== 'M' && (
                  <div className="form-group">
                    <label>Médico</label>
                    <select
                      className="form-control input-style"
                      value={form.idMedico}
                      onChange={e => setForm(f => ({ ...f, idMedico: Number(e.target.value) }))}
                    >
                      <option value={0}>Todos</option>
                      {(medicos as any[]).map((m: any) => (
                        <option key={m.Id_Medico} value={m.Id_Medico}>
                          {m.Nombre} {m.Prim_Apellido} {m.Seg_Apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Estado */}
                <div className="form-group">
                  <label>Estado</label>
                  <select
                    className="form-control input-style"
                    value={form.estado}
                    onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
                  >
                    <option value="">Todos</option>
                    <option value="P">Pendiente</option>
                    <option value="C">Completada</option>
                    <option value="X">Cancelada</option>
                    <option value="N">No Asistió</option>
                  </select>
                </div>

                {/* Fechas */}
                <div className="form-group">
                  <label>Fecha desde</label>
                  <input
                    type="date"
                    className="form-control input-style"
                    value={form.fechaInicio}
                    onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Fecha hasta</label>
                  <input
                    type="date"
                    className="form-control input-style"
                    value={form.fechaFin}
                    onChange={e => setForm(f => ({ ...f, fechaFin: e.target.value }))}
                  />
                </div>

                <div className="cc-filter-actions">
                  <button type="submit" className="btn btn-primary btn-style">
                    <i className="fa fa-search" /> Buscar
                  </button>
                  <button type="button" className="btn btn-secondary btn-style" onClick={handleLimpiar}>
                    <i className="fa fa-eraser" /> Limpiar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Popup */}
      {popup && (
        <ConsultaPopup
          consulta={popup}
          onClose={() => setPopup(null)}
          onEditar={() => { navigate(`/consultas/editar/${popup.Id_Consulta}`); setPopup(null); }}
          onCompletarMetricas={() => { navigate(`/consultas/${popup.Id_Consulta}/completar`); setPopup(null); }}
          onCancelar={() => handleCancelar(popup.Id_Consulta)}
          onNoAsistio={() => handleNoAsistio(popup.Id_Consulta)}
          onVerDetalle={() => { navigate(`/consultas/detalle/${popup.Id_Consulta}`); setPopup(null); }}
        />
      )}
    </div>
  );
};

export default Consultas;
