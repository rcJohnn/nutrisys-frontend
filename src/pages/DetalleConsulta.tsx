import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getConsultaById, getAntropometria, getDistribucionMacros } from '../api/consultas';
import './DetalleConsulta.css';

const DetalleConsulta: React.FC = () => {
  const { id } = useParams();
  const consultaId = Number(id);

  const { data: consulta, isLoading: loadingConsulta } = useQuery({
    queryKey: ['consulta', consultaId],
    queryFn: () => getConsultaById(consultaId),
    enabled: Boolean(consultaId),
  });

  const { data: antropometria } = useQuery({
    queryKey: ['antropometria', consultaId],
    queryFn: () => getAntropometria(consultaId),
    enabled: Boolean(consultaId),
  });

  const { data: distribucion } = useQuery({
    queryKey: ['distribucion-macros', consultaId],
    queryFn: () => getDistribucionMacros(consultaId),
    enabled: Boolean(consultaId),
  });

  if (loadingConsulta) {
    return (
      <div className="dc-loading-wrap">
        <div className="dc-spinner"></div>
        <p>Cargando información de la consulta...</p>
      </div>
    );
  }

  if (!consulta) {
    return <div className="text-center p-4">Consulta no encontrada</div>;
  }

  const formatFecha = (fecha: string) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-CR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getBadgeClass = (estado: string) => {
    switch (estado) {
      case 'Completada': return 'dc-badge-success';
      case 'Cancelada': return 'dc-badge-danger';
      case 'No Asistió': return 'dc-badge-warning';
      default: return 'dc-badge-pending';
    }
  };

  const calcularKcal = (cho: number, prot: number, grasa: number) => {
    return (cho * 4) + (prot * 4) + (grasa * 9);
  };

  return (
    <div className="dc-page">

      {/* Breadcrumb */}
      <nav className="cm-breadcrumb">
        <span onClick={() => navigate('/dashboard')} className="cm-bc-link">Inicio</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span onClick={() => navigate('/consultas')} className="cm-bc-link">Citas Médicas</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span className="cm-bc-active">Detalle de Consulta</span>
      </nav>

      {/* Header */}
      <div className="dc-page-header">
        <div className="dc-header-left">
          <a href="/consultas" className="dc-back-btn">
            <i className="fa fa-arrow-left"></i> Volver
          </a>
          <div className="dc-header-info">
            <h1 className="dc-page-title">Detalle de Consulta</h1>
            <p className="dc-page-sub">Vista de solo lectura — {formatFecha(consulta.Fecha_Cita)}</p>
          </div>
        </div>
        <div className="dc-header-right">
          <span className={`dc-badge ${getBadgeClass(consulta.Estado)}`}>
            {consulta.Estado}
          </span>
        </div>
      </div>

      {/* FILA: PACIENTE + MÉDICO */}
      <div className="dc-row-2">
        <div className="dc-card">
          <div className="dc-card-header dc-emerald">
            <i className="fa fa-user"></i> Paciente
          </div>
          <div className="dc-card-body">
            <div className="dc-info-row">
              <span className="dc-info-label">Nombre completo</span>
              <span className="dc-info-value">{consulta.NombreUsuario}</span>
            </div>
            <div className="dc-info-row">
              <span className="dc-info-label">Cédula</span>
              <span className="dc-info-value">{consulta.CedulaUsuario || '-'}</span>
            </div>
            <div className="dc-info-row">
              <span className="dc-info-label">Correo</span>
              <span className="dc-info-value">{consulta.CorreoUsuario || '-'}</span>
            </div>
          </div>
        </div>

        <div className="dc-card">
          <div className="dc-card-header dc-indigo">
            <i className="fa fa-user-md"></i> Médico y Cita
          </div>
          <div className="dc-card-body">
            <div className="dc-info-row">
              <span className="dc-info-label">Médico tratante</span>
              <span className="dc-info-value">{consulta.NombreMedico}</span>
            </div>
            <div className="dc-info-row">
              <span className="dc-info-label">Fecha y hora</span>
              <span className="dc-info-value">{formatFecha(consulta.Fecha_Cita)}</span>
            </div>
            <div className="dc-info-row">
              <span className="dc-info-label">Duración</span>
              <span className="dc-info-value">{consulta.Duracion_Minutos} min</span>
            </div>
            <div className="dc-info-row">
              <span className="dc-info-label">Motivo de consulta</span>
              <span className="dc-info-value">{consulta.Motivo || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MÉTRICAS CORPORALES */}
      <div className="dc-card dc-card-full">
        <div className="dc-card-header dc-emerald">
          <i className="fa fa-heartbeat"></i> Métricas Corporales
        </div>
        <div className="dc-card-body">
          {/* Signos vitales y antropometría principal */}
          <div className="dc-metrics-section-title">Signos Vitales y Composición Corporal</div>
          <div className="dc-metrics-grid dc-metrics-main">
            <div className="dc-metric-box">
              <div className="dc-metric-icon dc-icon-emerald"><i className="fa fa-arrows-v"></i></div>
              <div className="dc-metric-val">{consulta.Peso_kg || '-'}</div>
              <div className="dc-metric-unit">kg</div>
              <div className="dc-metric-lbl">Peso</div>
            </div>
            <div className="dc-metric-box">
              <div className="dc-metric-icon dc-icon-slate"><i className="fa fa-male"></i></div>
              <div className="dc-metric-val">{consulta.Estatura_cm || '-'}</div>
              <div className="dc-metric-unit">cm</div>
              <div className="dc-metric-lbl">Estatura</div>
            </div>
            <div className="dc-metric-box dc-metric-highlight">
              <div className="dc-metric-icon dc-icon-indigo"><i className="fa fa-bar-chart"></i></div>
              <div className="dc-metric-val">{consulta.IMC || '-'}</div>
              <div className="dc-metric-unit">kg/m²</div>
              <div className="dc-metric-lbl">IMC</div>
            </div>
            <div className="dc-metric-box">
              <div className="dc-metric-icon dc-icon-danger"><i className="fa fa-heartbeat"></i></div>
              <div className="dc-metric-val">
                {consulta.Presion_Arterial_Sistolica && consulta.Presion_Arterial_Diastolica
                  ? `${consulta.Presion_Arterial_Sistolica}/${consulta.Presion_Arterial_Diastolica}`
                  : '-'}
              </div>
              <div className="dc-metric-unit">mmHg</div>
              <div className="dc-metric-lbl">Presión Arterial</div>
            </div>
          </div>

          {/* Composición corporal */}
          <div className="dc-metrics-section-title" style={{ marginTop: '1.5rem' }}>Composición Corporal</div>
          <div className="dc-metrics-grid">
            <div className="dc-metric-box">
              <div className="dc-metric-icon dc-icon-amber"><i className="fa fa-tint"></i></div>
              <div className="dc-metric-val">{consulta.Grasa_g || '-'}</div>
              <div className="dc-metric-unit">g</div>
              <div className="dc-metric-lbl">Grasa (g)</div>
            </div>
            {consulta.Grasa_Porcentaje != null && (
              <div className="dc-metric-box">
                <div className="dc-metric-icon dc-icon-amber"><i className="fa fa-pie-chart"></i></div>
                <div className="dc-metric-val">{consulta.Grasa_Porcentaje}</div>
                <div className="dc-metric-unit">%</div>
                <div className="dc-metric-lbl">Grasa (%)</div>
              </div>
            )}
            <div className="dc-metric-box">
              <div className="dc-metric-icon dc-icon-emerald"><i className="fa fa-male"></i></div>
              <div className="dc-metric-val">{consulta.Musculo_g || '-'}</div>
              <div className="dc-metric-unit">g</div>
              <div className="dc-metric-lbl">Músculo (g)</div>
            </div>
            {consulta.Masa_Osea_g != null && (
              <div className="dc-metric-box">
                <div className="dc-metric-icon dc-icon-slate"><i className="fa fa-circle-o"></i></div>
                <div className="dc-metric-val">{consulta.Masa_Osea_g}</div>
                <div className="dc-metric-unit">g</div>
                <div className="dc-metric-lbl">Masa Ósea</div>
              </div>
            )}
            {consulta.Grasa_Visceral != null && (
              <div className="dc-metric-box">
                <div className="dc-metric-icon dc-icon-amber"><i className="fa fa-circle"></i></div>
                <div className="dc-metric-val">{consulta.Grasa_Visceral}</div>
                <div className="dc-metric-unit">nivel</div>
                <div className="dc-metric-lbl">Grasa Visceral</div>
              </div>
            )}
            {consulta.Agua_Corporal_Pct != null && (
              <div className="dc-metric-box">
                <div className="dc-metric-icon dc-icon-indigo"><i className="fa fa-tint"></i></div>
                <div className="dc-metric-val">{consulta.Agua_Corporal_Pct}</div>
                <div className="dc-metric-unit">%</div>
                <div className="dc-metric-lbl">Agua Corporal</div>
              </div>
            )}
            {consulta.Edad_Metabolica != null && (
              <div className="dc-metric-box">
                <div className="dc-metric-icon dc-icon-slate"><i className="fa fa-clock-o"></i></div>
                <div className="dc-metric-val">{consulta.Edad_Metabolica}</div>
                <div className="dc-metric-unit">años</div>
                <div className="dc-metric-lbl">Edad Metabólica</div>
              </div>
            )}
          </div>

          {/* Circunferencias */}
          <div className="dc-metrics-section-title" style={{ marginTop: '1.5rem' }}>Circunferencias</div>
          <div className="dc-metrics-grid">
            <div className="dc-metric-box">
              <div className="dc-metric-icon dc-icon-slate"><i className="fa fa-expand"></i></div>
              <div className="dc-metric-val">{consulta.Circunferencia_Cintura_cm || '-'}</div>
              <div className="dc-metric-unit">cm</div>
              <div className="dc-metric-lbl">Cintura</div>
            </div>
            <div className="dc-metric-box">
              <div className="dc-metric-icon dc-icon-slate"><i className="fa fa-expand"></i></div>
              <div className="dc-metric-val">{consulta.Circunferencia_Cadera_cm || '-'}</div>
              <div className="dc-metric-unit">cm</div>
              <div className="dc-metric-lbl">Cadera</div>
            </div>
            {consulta.Circunferencia_Muneca_cm != null && (
              <div className="dc-metric-box">
                <div className="dc-metric-icon dc-icon-slate"><i className="fa fa-expand"></i></div>
                <div className="dc-metric-val">{consulta.Circunferencia_Muneca_cm}</div>
                <div className="dc-metric-unit">cm</div>
                <div className="dc-metric-lbl">Muñeca</div>
              </div>
            )}
          </div>

          {/* Antropometría de brazo (si hay datos) */}
          {antropometria && (
            <div>
              <div className="dc-metrics-section-title" style={{ marginTop: '1.5rem' }}>
                Antropometría de Brazo
              </div>
              <div className="dc-metrics-grid">
                {antropometria.Antrop_ATB > 0 && (
                  <div className="dc-metric-box">
                    <div className="dc-metric-icon dc-icon-indigo"><i className="fa fa-square"></i></div>
                    <div className="dc-metric-val">{antropometria.Antrop_ATB}</div>
                    <div className="dc-metric-unit">cm²</div>
                    <div className="dc-metric-lbl">ATB</div>
                  </div>
                )}
                {antropometria.Antrop_CMB > 0 && (
                  <div className="dc-metric-box">
                    <div className="dc-metric-icon dc-icon-emerald"><i className="fa fa-compress"></i></div>
                    <div className="dc-metric-val">{antropometria.Antrop_CMB}</div>
                    <div className="dc-metric-unit">cm</div>
                    <div className="dc-metric-lbl">CMB</div>
                  </div>
                )}
                {antropometria.Antrop_AMB > 0 && (
                  <div className="dc-metric-box">
                    <div className="dc-metric-icon dc-icon-emerald"><i className="fa fa-square-o"></i></div>
                    <div className="dc-metric-val">{antropometria.Antrop_AMB}</div>
                    <div className="dc-metric-unit">cm²</div>
                    <div className="dc-metric-lbl">AMB</div>
                  </div>
                )}
                {antropometria.Antrop_AGB > 0 && (
                  <div className="dc-metric-box">
                    <div className="dc-metric-icon dc-icon-amber"><i className="fa fa-tint"></i></div>
                    <div className="dc-metric-val">{antropometria.Antrop_AGB}</div>
                    <div className="dc-metric-unit">cm²</div>
                    <div className="dc-metric-lbl">AGB</div>
                  </div>
                )}
              </div>
              <div className="dc-metrics-section-title" style={{ marginTop: '1rem' }}>
                Estimaciones Chumlea
              </div>
              <div className="dc-metrics-grid">
                {antropometria.Peso_Estimado_kg > 0 && (
                  <div className="dc-metric-box">
                    <div className="dc-metric-icon dc-icon-emerald"><i className="fa fa-balance-scale"></i></div>
                    <div className="dc-metric-val">{antropometria.Peso_Estimado_kg}</div>
                    <div className="dc-metric-unit">kg</div>
                    <div className="dc-metric-lbl">Peso Estimado</div>
                  </div>
                )}
                {antropometria.Talla_Estimada_cm > 0 && (
                  <div className="dc-metric-box">
                    <div className="dc-metric-icon dc-icon-indigo"><i className="fa fa-arrows-v"></i></div>
                    <div className="dc-metric-val">{antropometria.Talla_Estimada_cm}</div>
                    <div className="dc-metric-unit">cm</div>
                    <div className="dc-metric-lbl">Talla Estimada</div>
                  </div>
                )}
                {antropometria.Altura_Rodilla_cm > 0 && (
                  <div className="dc-metric-box">
                    <div className="dc-metric-icon dc-icon-slate"><i className="fa fa-male"></i></div>
                    <div className="dc-metric-val">{antropometria.Altura_Rodilla_cm}</div>
                    <div className="dc-metric-unit">cm</div>
                    <div className="dc-metric-lbl">Altura de Rodilla</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DISTRIBUCIÓN DE MACRONUTRIENTES */}
      {distribucion && (
        <div className="dc-card dc-card-full">
          <div className="dc-card-header dc-amber">
            <i className="fa fa-calculator"></i>
            Evaluación Cuantitativa — Distribución de Macronutrientes
          </div>
          <div className="dc-card-body">
            {/* Encabezado calórico */}
            <div className="dc-calorico-header">
              <div>
                <div className="dc-calorico-label">Fórmula utilizada</div>
                <div className="dc-formula-badge">{distribucion.Formula_Usada || '-'}</div>
              </div>
              <div className="dc-ree-block">
                <div className="dc-calorico-label">Requerimiento Energético Total (REE)</div>
                <div className="dc-ree-value">
                  <span>{distribucion.REE || '-'}</span>
                  <span className="dc-ree-unit">kcal/día</span>
                </div>
              </div>
            </div>

            {/* Aporte calórico por macronutriente */}
            <div className="dc-metrics-section-title" style={{ marginTop: '1.25rem' }}>
              Aporte Calórico por Macronutriente
            </div>
            <div className="dc-macro-desglose">
              <div className="dc-macro-item dc-macro-cho-item">
                <div className="dc-macro-item-header">
                  <i className="fa fa-leaf"></i> Carbohidratos
                </div>
                <div className="dc-macro-item-data">
                  <span className="dc-macro-num">{distribucion.CHO_g || 0}</span>
                  <span className="dc-macro-unit2">g</span>
                </div>
                <div className="dc-macro-item-kcal">
                  {((distribucion.CHO_g || 0) * 4)} kcal
                  <span className="dc-macro-pct">
                    ({distribucion.Formula_Usada ? '~' : ''}
                    {distribucion.REE > 0
                      ? Math.round(((distribucion.CHO_g || 0) * 4 / distribucion.REE) * 100)
                      : 0}%)
                  </span>
                </div>
              </div>

              <div className="dc-macro-item dc-macro-prot-item">
                <div className="dc-macro-item-header">
                  <i className="fa fa-male"></i> Proteínas
                </div>
                <div className="dc-macro-item-data">
                  <span className="dc-macro-num">{distribucion.Prot_g || 0}</span>
                  <span className="dc-macro-unit2">g</span>
                </div>
                <div className="dc-macro-item-kcal">
                  {((distribucion.Prot_g || 0) * 4)} kcal
                  <span className="dc-macro-pct">
                    ({distribucion.REE > 0
                      ? Math.round(((distribucion.Prot_g || 0) * 4 / distribucion.REE) * 100)
                      : 0}%)
                  </span>
                </div>
              </div>

              <div className="dc-macro-item dc-macro-grasa-item">
                <div className="dc-macro-item-header">
                  <i className="fa fa-tint"></i> Grasas
                </div>
                <div className="dc-macro-item-data">
                  <span className="dc-macro-num">{distribucion.Grasa_g || 0}</span>
                  <span className="dc-macro-unit2">g</span>
                </div>
                <div className="dc-macro-item-kcal">
                  {((distribucion.Grasa_g || 0) * 9)} kcal
                  <span className="dc-macro-pct">
                    ({distribucion.REE > 0
                      ? Math.round(((distribucion.Grasa_g || 0) * 9 / distribucion.REE) * 100)
                      : 0}%)
                  </span>
                </div>
              </div>

              <div className="dc-macro-item dc-macro-fibra-item">
                <div className="dc-macro-item-header">
                  <i className="fa fa-circle-o"></i> Fibra
                </div>
                <div className="dc-macro-item-data">
                  <span className="dc-macro-num">{distribucion.Fibra_g || 0}</span>
                  <span className="dc-macro-unit2">g</span>
                </div>
                <div className="dc-macro-item-kcal dc-macro-fibra-note">
                  Recomendada/día
                </div>
              </div>
            </div>

            {/* Tabla por tiempo de comida */}
            <div className="dc-metrics-section-title" style={{ marginTop: '1.5rem' }}>
              Distribución por Tiempo de Comida
            </div>
            <div className="dc-meal-table-wrap">
              <table className="dc-meal-table">
                <thead>
                  <tr>
                    <th className="dc-meal-col-name">Tiempo de Comida</th>
                    <th>CHO (g)</th>
                    <th>Proteínas (g)</th>
                    <th>Grasas (g)</th>
                    <th>Fibra (g)</th>
                    <th className="dc-col-kcal">kcal</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'Desayuno', label: 'Desayuno', icon: 'fa-sun-o' },
                    { key: 'MeriendaAM', label: 'Merienda AM', icon: 'fa-coffee' },
                    { key: 'Almuerzo', label: 'Almuerzo', icon: 'fa-cutlery' },
                    { key: 'MeriendaPM', label: 'Merienda PM', icon: 'fa-apple' },
                    { key: 'Cena', label: 'Cena', icon: 'fa-moon-o' },
                  ].map(meal => {
                    const cho = (distribucion as any)[`${meal.key}_CHO_g`] || 0;
                    const prot = (distribucion as any)[`${meal.key}_Prot_g`] || 0;
                    const grasa = (distribucion as any)[`${meal.key}_Grasa_g`] || 0;
                    const fibra = (distribucion as any)[`${meal.key}_Fibra_g`] || 0;
                    const kcal = calcularKcal(cho, prot, grasa);
                    return (
                      <tr key={meal.key} className="dc-meal-row">
                        <td className="dc-meal-name">
                          <i className={`fa ${meal.icon} dc-meal-icon`}></i> {meal.label}
                        </td>
                        <td>{cho > 0 ? cho : '-'}</td>
                        <td>{prot > 0 ? prot : '-'}</td>
                        <td>{grasa > 0 ? grasa : '-'}</td>
                        <td>{fibra > 0 ? fibra : '-'}</td>
                        <td className="dc-kcal-cell">{kcal > 0 ? kcal : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="dc-meal-total-row">
                    <td className="dc-meal-name"><strong>Total</strong></td>
                    <td>{distribucion.CHO_g || 0}</td>
                    <td>{distribucion.Prot_g || 0}</td>
                    <td>{distribucion.Grasa_g || 0}</td>
                    <td>{distribucion.Fibra_g || 0}</td>
                    <td className="dc-kcal-cell">{calcularKcal(distribucion.CHO_g || 0, distribucion.Prot_g || 0, distribucion.Grasa_g || 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* NOTAS CLÍNICAS */}
      <div className="dc-row-2">
        <div className="dc-card">
          <div className="dc-card-header dc-emerald">
            <i className="fa fa-stethoscope"></i> Observaciones del Médico
          </div>
          <div className="dc-card-body">
            <div className="dc-text-block">
              {consulta.Observaciones_Medico || 'Sin observaciones registradas.'}
            </div>
          </div>
        </div>

        <div className="dc-card">
          <div className="dc-card-header dc-indigo">
            <i className="fa fa-list-ul"></i> Recomendaciones
          </div>
          <div className="dc-card-body">
            <div className="dc-text-block">
              {consulta.Recomendaciones || 'Sin recomendaciones registradas.'}
            </div>
          </div>
        </div>
      </div>

      {/* PRÓXIMA CITA */}
      {consulta.Proxima_Cita && (
        <div className="dc-card dc-card-full dc-proxima-cita">
          <div className="dc-card-header dc-emerald">
            <i className="fa fa-calendar-check-o"></i> Próxima Cita
          </div>
          <div className="dc-card-body" style={{ padding: '1.25rem 1.5rem' }}>
            <div className="dc-proxima-fecha">{formatFecha(consulta.Proxima_Cita)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleConsulta;
