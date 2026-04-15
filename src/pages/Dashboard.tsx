import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getHubResumen, getHubAgenda, getHubUsuario, type HubAgendaItem, type HubInfoUsuario } from '../api/hub';
import './Dashboard.css';

const DIAS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function formatFechaCorta(isoStr: string): string {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  return `${d.getDate()} de ${MESES_ES[d.getMonth()]} de ${d.getFullYear()}`;
}

function formatHora(isoStr: string): string {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function getSaludo(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function getFechaHoy(): string {
  const d = new Date();
  return `${DIAS_ES[d.getDay()]}, ${d.getDate()} de ${MESES_ES[d.getMonth()]} de ${d.getFullYear()}`;
}

function getEstadoClass(codigo: string): string {
  switch (codigo) {
    case 'P': return 'hub-badge-amber';
    case 'C': return 'hub-badge-green';
    case 'X': return 'hub-badge-danger';
    case 'N': return 'hub-badge-muted';
    default: return 'hub-badge-muted';
  }
}

const Dashboard: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState('');
  const [userId, setUserId] = useState(0);

  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Usuario';
    const type = localStorage.getItem('userType') || 'A';
    const id = Number(localStorage.getItem('userId') || '0');
    setUserName(name);
    setUserType(type);
    setUserId(id);
  }, []);

  // Queries para médico
  const { data: resumenMedico } = useQuery({
    queryKey: ['hub-resumen', userId],
    queryFn: () => getHubResumen(userId),
    enabled: userType === 'M' && userId > 0,
  });

  const { data: agendaMedico = [] } = useQuery({
    queryKey: ['hub-agenda', userId],
    queryFn: () => getHubAgenda(userId),
    enabled: userType === 'M' && userId > 0,
  });

  // Query para usuario
  const { data: infoUsuario = [] } = useQuery({
    queryKey: ['hub-usuario', userId],
    queryFn: () => getHubUsuario(userId),
    enabled: userType === 'U' && userId > 0,
  });

  const ultimaCita = infoUsuario.find((u: HubInfoUsuario) => u.Tipo === 'ultima');
  const proximaCita = infoUsuario.find((u: HubInfoUsuario) => u.Tipo === 'proxima');

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="hub-header">
        <div>
          <h1 className="hub-greeting">
            <span id="hubSaludo">{getSaludo()}</span>, <span className="hub-greeting-name">{userName}</span>
          </h1>
          <p className="hub-fecha" id="hubFechaHoy">{getFechaHoy()}</p>
        </div>
        <div className={`hub-status-badge ${userType === 'M' ? 'hub-badge-indigo' : userType === 'U' ? 'hub-badge-green' : 'hub-badge-amber'}`}>
          {userType === 'M' ? 'Médico' : userType === 'U' ? 'Paciente' : 'Administrador'}
        </div>
      </div>

      {/* ── ROL MÉDICO ── */}
      {userType === 'M' && (
        <div className="hub-section">
          {/* Stats row */}
          <div className="hub-stats-row">
            <div className="hub-stat-card hub-stat-green">
              <span className="hub-stat-icon"><i className="fa fa-users"></i></span>
              <div>
                <div className="hub-stat-value">{resumenMedico?.PacientesSinSeguimiento30 ?? '—'}</div>
                <div className="hub-stat-label">Pacientes sin seguimiento <span className="hub-stat-meta">(+30 dias)</span></div>
              </div>
            </div>
            <div className="hub-stat-card hub-stat-indigo">
              <span className="hub-stat-icon"><i className="fa fa-calendar-check-o"></i></span>
              <div>
                <div className="hub-stat-value">{resumenMedico?.ConsultasHoy ?? '—'}</div>
                <div className="hub-stat-label">Consultas hoy</div>
              </div>
            </div>
            <div className="hub-stat-card hub-stat-amber">
              <span className="hub-stat-icon"><i className="fa fa-clock-o"></i></span>
              <div>
                <div className="hub-stat-value">{resumenMedico?.ConsultasPendientes ?? '—'}</div>
                <div className="hub-stat-label">Consultas pendientes</div>
              </div>
            </div>
            <div className="hub-stat-card hub-stat-slate">
              <span className="hub-stat-icon"><i className="fa fa-user-md"></i></span>
              <div>
                <div className="hub-stat-value">{resumenMedico?.TotalPacientes ?? '—'}</div>
                <div className="hub-stat-label">Pacientes atendidos</div>
              </div>
            </div>
          </div>

          {/* Agenda del día */}
          <div className="hub-card">
            <div className="hub-card-header">
              <div>
                <h3 className="hub-card-title">Agenda de hoy</h3>
                <p className="hub-card-subtitle">
                  {agendaMedico.length === 0
                    ? 'No hay consultas programadas para hoy'
                    : `${agendaMedico.length} consulta${agendaMedico.length !== 1 ? 's' : ''} programada${agendaMedico.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <Link to="/consultas?vista=dia" className="hub-btn-link">Ver todas <i className="fa fa-arrow-right"></i></Link>
            </div>
            <div className="hub-agenda-list">
              {agendaMedico.length === 0 ? (
                <p className="hub-empty-msg">Tu agenda de hoy está libre.</p>
              ) : (
                agendaMedico.map((c: HubAgendaItem) => (
                  <div key={c.Id_Consulta} className="hub-agenda-item">
                    <div className="hub-agenda-hora">{c.HoraCita || formatHora(c.Fecha_Cita)}</div>
                    <div className="hub-agenda-info">
                      <span className="hub-agenda-paciente">{c.NombrePaciente}</span>
                      {c.NombreClinica && <span className="hub-agenda-clinica"><i className="fa fa-map-marker"></i> {c.NombreClinica}</span>}
                      {c.Motivo && <span className="hub-agenda-motivo">{c.Motivo}</span>}
                    </div>
                    <span className={`hub-badge ${getEstadoClass(c.EstadoCodigo)}`}>{c.EstadoTexto}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Acceso rápido */}
          <div className="hub-card">
            <div className="hub-card-header">
              <h3 className="hub-card-title">Accesos rápidos</h3>
            </div>
            <div className="hub-quicklinks">
              <Link to="/consultas/nueva" className="hub-quicklink">
                <i className="fa fa-calendar-plus-o"></i>
                <span>Nueva consulta</span>
              </Link>
              <Link to="/config-agenda" className="hub-quicklink">
                <i className="fa fa-sliders"></i>
                <span>Configurar horario</span>
              </Link>
              <Link to="/consultas?vista=mes" className="hub-quicklink">
                <i className="fa fa-list-alt"></i>
                <span>Historial completo</span>
              </Link>
              <Link to="/progreso" className="hub-quicklink">
                <i className="fa fa-line-chart"></i>
                <span>Evolución paciente</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── ROL USUARIO / PACIENTE ── */}
      {userType === 'U' && (
        <div className="hub-section">
          <div className="hub-citas-grid">
            {/* Última cita */}
            <div className="hub-card">
              <div className="hub-card-header">
                <h3 className="hub-card-title">Última consulta</h3>
                {ultimaCita && (
                  <span className={`hub-badge ${getEstadoClass(ultimaCita.EstadoTexto === 'Completada' ? 'C' : 'N')}`}>
                    {ultimaCita.EstadoTexto}
                  </span>
                )}
              </div>
              <div className="hub-cita-body">
                {ultimaCita ? (
                  <>
                    <div className="hub-cita-fecha"><i className="fa fa-calendar"></i> {formatFechaCorta(ultimaCita.Fecha_Cita)}</div>
                    <div className="hub-cita-medico"><i className="fa fa-user-md"></i> {ultimaCita.NombreMedico}</div>
                    {ultimaCita.Peso && (
                      <div className="hub-cita-meta"><i className="fa fa-balance-scale"></i> Peso registrado: <strong>{ultimaCita.Peso} kg</strong></div>
                    )}
                    <div className="hub-dias-desde"><i className="fa fa-clock-o"></i> Hace <strong>{ultimaCita.DiasDesde} día{ultimaCita.DiasDesde !== 1 ? 's' : ''}</strong></div>
                  </>
                ) : (
                  <p className="hub-empty-msg">Sin consultas anteriores registradas.</p>
                )}
              </div>
            </div>

            {/* Próxima cita */}
            <div className="hub-card">
              <div className="hub-card-header">
                <h3 className="hub-card-title">Próxima cita</h3>
                {proximaCita && <span className="hub-badge hub-badge-green">{proximaCita.EstadoTexto}</span>}
              </div>
              <div className="hub-cita-body">
                {proximaCita ? (
                  <>
                    <div className="hub-cita-fecha"><i className="fa fa-calendar"></i> {formatFechaCorta(proximaCita.Fecha_Cita)}</div>
                    <div className="hubCita-hora"><i className="fa fa-clock-o"></i> {formatHora(proximaCita.Fecha_Cita)} h</div>
                    <div className="hub-cita-medico"><i className="fa fa-user-md"></i> {proximaCita.NombreMedico}</div>
                    <div className="hub-dias-hasta"><i className="fa fa-hourglass-half"></i> En <strong>{proximaCita.DiasDesde} día{proximaCita.DiasDesde !== 1 ? 's' : ''}</strong></div>
                  </>
                ) : (
                  <>
                    <p className="hub-empty-msg">No tienes ninguna cita agendada.</p>
                    <div className="hub-cta-agendar" style={{ display: 'flex' }}>
                      <div className="hub-cta-icon"><i className="fa fa-calendar-plus-o"></i></div>
                      <div>
                        <p className="hub-cta-title">No tienes consultas agendadas</p>
                        <p className="hub-cta-sub">Agenda una cita con tu nutricionista para continuar tu seguimiento.</p>
                      </div>
                      <Link to="/consultas/nueva" className="hub-btn-primary">Agendar cita</Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* CTA agendar si no tiene próxima cita */}
          {!proximaCita && (
            <div className="hub-cta-agendar" style={{ display: 'none' }}>
              <div className="hub-cta-icon"><i className="fa fa-calendar-plus-o"></i></div>
              <div>
                <p className="hub-cta-title">No tienes consultas agendadas</p>
                <p className="hub-cta-sub">Agenda una cita con tu nutricionista para continuar tu seguimiento.</p>
              </div>
              <Link to="/consultas/nueva" className="hub-btn-primary">Agendar cita</Link>
            </div>
          )}

          {/* Acceso rápido */}
          <div className="hub-card">
            <div className="hub-card-header">
              <h3 className="hub-card-title">Accesos rápidos</h3>
            </div>
            <div className="hub-quicklinks">
              <Link to="/consultas/nueva" className="hub-quicklink">
                <i className="fa fa-calendar-plus-o"></i>
                <span>Agendar cita</span>
              </Link>
              <Link to="/progreso" className="hub-quicklink">
                <i className="fa fa-line-chart"></i>
                <span>Mi evolución</span>
              </Link>
              <Link to="/generar-plan" className="hub-quicklink">
                <i className="fa fa-cutlery"></i>
                <span>Mi plan nutricional</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── ROL ADMIN ── */}
      {userType === 'A' && (
        <div className="hub-section">
          <div className="hub-card">
            <div className="hub-card-header">
              <h3 className="hub-card-title">Panel de Administración</h3>
            </div>
            <div className="hub-quicklinks">
              <Link to="/usuarios" className="hub-quicklink">
                <i className="fa fa-users"></i>
                <span>Usuarios</span>
              </Link>
              <Link to="/medicos" className="hub-quicklink">
                <i className="fa fa-user-md"></i>
                <span>Médicos</span>
              </Link>
              <Link to="/alimentos" className="hub-quicklink">
                <i className="fa fa-leaf"></i>
                <span>Alimentos</span>
              </Link>
              <Link to="/auditoria" className="hub-quicklink">
                <i className="fa fa-shield"></i>
                <span>Auditoría</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
