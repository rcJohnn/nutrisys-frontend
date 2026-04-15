import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getConsultaById, getAntropometria, getDistribucionMacros } from '../api/consultas';
import { getAnalisisBioquimico } from '../api/completarMetricas';
import './DetalleConsulta.css';

const DetalleConsulta: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const { data: analisis } = useQuery({
    queryKey: ['analisis-bioquimico', consulta?.Id_Usuario],
    queryFn: () => getAnalisisBioquimico(consulta!.Id_Usuario),
    enabled: Boolean(consulta?.Id_Usuario),
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
      {(() => {
        // Claves normalizadas por axios interceptor (ver client.ts normalizeKeys)
        const c = consulta as any;
        const peso    = c.PesoKg                 ?? c.Peso_kg;
        const estatura= c.EstaturaCm             ?? c.Estatura_cm;
        const imcStored = c.IMC;
        const imc     = (imcStored && imcStored > 0)
          ? imcStored
          : (peso && estatura && estatura > 0)
            ? parseFloat((peso / Math.pow(estatura / 100, 2)).toFixed(1))
            : null;
        const grasaG  = c.GrasaG                 ?? c.Grasa_g;
        const grasaPct= c.Grasa_Porcentaje;
        const musculo = c.MusculoG               ?? c.Musculo_g;
        const masaOsea= c.Masa_OseaG             ?? c.Masa_Osea_g;
        const visceral= c.Grasa_Visceral;
        const agua    = c.Agua_Corporal_Pct;
        const edadMet = c.Edad_Metabolica;
        const cintura = c.Circunferencia_CinturaCm ?? c.Circunferencia_Cintura_cm;
        const cadera  = c.Circunferencia_CaderaCm  ?? c.Circunferencia_Cadera_cm;
        const muneca  = c.Circunferencia_MunecaCm  ?? c.Circunferencia_Muneca_cm;
        const sistolica  = c.Presion_Arterial_Sistolica;
        const diastolica = c.Presion_Arterial_Diastolica;
        return (
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
              <div className="dc-metric-val">{peso || '-'}</div>
              <div className="dc-metric-unit">kg</div>
              <div className="dc-metric-lbl">Peso</div>
            </div>
            <div className="dc-metric-box">
              <div className="dc-metric-icon dc-icon-slate"><i className="fa fa-male"></i></div>
              <div className="dc-metric-val">{estatura || '-'}</div>
              <div className="dc-metric-unit">cm</div>
              <div className="dc-metric-lbl">Estatura</div>
            </div>
            <div className="dc-metric-box dc-metric-highlight">
              <div className="dc-metric-icon dc-icon-indigo"><i className="fa fa-bar-chart"></i></div>
              <div className="dc-metric-val">{imc ?? '-'}</div>
              <div className="dc-metric-unit">kg/m²</div>
              <div className="dc-metric-lbl">IMC</div>
            </div>
            <div className="dc-metric-box">
              <div className="dc-metric-icon dc-icon-danger"><i className="fa fa-heartbeat"></i></div>
              <div className="dc-metric-val">
                {sistolica && diastolica ? `${sistolica}/${diastolica}` : '-'}
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
              <div className="dc-metric-val">{grasaG || '-'}</div>
              <div className="dc-metric-unit">g</div>
              <div className="dc-metric-lbl">Grasa (g)</div>
            </div>
            {grasaPct != null && (
              <div className="dc-metric-box">
                <div className="dc-metric-icon dc-icon-amber"><i className="fa fa-pie-chart"></i></div>
                <div className="dc-metric-val">{grasaPct}</div>
                <div className="dc-metric-unit">%</div>
                <div className="dc-metric-lbl">Grasa (%)</div>
              </div>
            )}
            <div className="dc-metric-box">
              <div className="dc-metric-icon dc-icon-emerald"><i className="fa fa-male"></i></div>
              <div className="dc-metric-val">{musculo || '-'}</div>
              <div className="dc-metric-unit">g</div>
              <div className="dc-metric-lbl">Músculo (g)</div>
            </div>
            {masaOsea != null && (
              <div className="dc-metric-box">
                <div className="dc-metric-icon dc-icon-slate"><i className="fa fa-circle-o"></i></div>
                <div className="dc-metric-val">{masaOsea}</div>
                <div className="dc-metric-unit">g</div>
                <div className="dc-metric-lbl">Masa Ósea</div>
              </div>
            )}
            {visceral != null && (
              <div className="dc-metric-box">
                <div className="dc-metric-icon dc-icon-amber"><i className="fa fa-circle"></i></div>
                <div className="dc-metric-val">{visceral}</div>
                <div className="dc-metric-unit">nivel</div>
                <div className="dc-metric-lbl">Grasa Visceral</div>
              </div>
            )}
            {agua != null && (
              <div className="dc-metric-box">
                <div className="dc-metric-icon dc-icon-indigo"><i className="fa fa-tint"></i></div>
                <div className="dc-metric-val">{agua}</div>
                <div className="dc-metric-unit">% o g</div>
                <div className="dc-metric-lbl">Agua Corporal</div>
              </div>
            )}
            {edadMet != null && (
              <div className="dc-metric-box">
                <div className="dc-metric-icon dc-icon-slate"><i className="fa fa-clock-o"></i></div>
                <div className="dc-metric-val">{edadMet}</div>
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
              <div className="dc-metric-val">{cintura || '-'}</div>
              <div className="dc-metric-unit">cm</div>
              <div className="dc-metric-lbl">Cintura</div>
            </div>
            <div className="dc-metric-box">
              <div className="dc-metric-icon dc-icon-slate"><i className="fa fa-expand"></i></div>
              <div className="dc-metric-val">{cadera || '-'}</div>
              <div className="dc-metric-unit">cm</div>
              <div className="dc-metric-lbl">Cadera</div>
            </div>
            {muneca != null && (
              <div className="dc-metric-box">
                <div className="dc-metric-icon dc-icon-slate"><i className="fa fa-expand"></i></div>
                <div className="dc-metric-val">{muneca}</div>
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
        );
      })()}

      {/* DISTRIBUCIÓN DE MACRONUTRIENTES */}
      {distribucion && (() => {
        // Claves normalizadas: CHO_g → CHOG, Prot_g → ProtG, Grasa_g → GrasaG, Fibra_g → FibraG
        // Desayuno_CHO_g → Desayuno_CHOG  (el _C queda, solo _g → G)
        const d = distribucion as any;
        const getMeal = (key: string) => ({
          cho  : d[`${key}_CHOG`]   ?? d[`${key}_CHO_g`]   ?? 0,
          prot : d[`${key}_ProtG`]  ?? d[`${key}_Prot_g`]  ?? 0,
          grasa: d[`${key}_GrasaG`] ?? d[`${key}_Grasa_g`] ?? 0,
          fibra: d[`${key}_FibraG`] ?? d[`${key}_Fibra_g`] ?? 0,
        });
        // Si los totales no se guardaron (ej: el usuario completó paso 5 sin pasar por paso 3-4),
        // calculamos como suma de tiempos de comida como fallback.
        const meals = ['Desayuno', 'MeriendaAM', 'Almuerzo', 'MeriendaPM', 'Cena'].map(getMeal);
        const sumMeal = (fn: (m: ReturnType<typeof getMeal>) => number) =>
          meals.reduce((acc, m) => acc + fn(m), 0);
        const chogStored  = d.CHOG   ?? d.CHO_g   ?? 0;
        const protgStored = d.ProtG  ?? d.Prot_g  ?? 0;
        const grasagStored = d.GrasaG ?? d.Grasa_g ?? 0;
        const chog   = chogStored  > 0 ? chogStored  : sumMeal(m => m.cho);
        const protg  = protgStored > 0 ? protgStored : sumMeal(m => m.prot);
        const grasag = grasagStored > 0 ? grasagStored : sumMeal(m => m.grasa);
        const fibrag = d.FibraG ?? d.Fibra_g ?? 0;
        // REE: si viene 0, intentamos recalcular kcal totales desde los macros
        const reeStored = d.REE ?? 0;
        const ree = reeStored > 0 ? reeStored : Math.round((chog * 4) + (protg * 4) + (grasag * 9));
        return (
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
                <div className="dc-formula-badge">{d.Formula_Usada || '-'}</div>
              </div>
              <div className="dc-ree-block">
                <div className="dc-calorico-label">Requerimiento Energético Total (REE)</div>
                <div className="dc-ree-value">
                  <span>{ree || '-'}</span>
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
                <div className="dc-macro-item-header"><i className="fa fa-leaf"></i> Carbohidratos</div>
                <div className="dc-macro-item-data">
                  <span className="dc-macro-num">{chog}</span>
                  <span className="dc-macro-unit2">g</span>
                </div>
                <div className="dc-macro-item-kcal">
                  {chog * 4} kcal
                  <span className="dc-macro-pct">({ree > 0 ? Math.round((chog * 4 / ree) * 100) : 0}%)</span>
                </div>
              </div>

              <div className="dc-macro-item dc-macro-prot-item">
                <div className="dc-macro-item-header"><i className="fa fa-male"></i> Proteínas</div>
                <div className="dc-macro-item-data">
                  <span className="dc-macro-num">{protg}</span>
                  <span className="dc-macro-unit2">g</span>
                </div>
                <div className="dc-macro-item-kcal">
                  {protg * 4} kcal
                  <span className="dc-macro-pct">({ree > 0 ? Math.round((protg * 4 / ree) * 100) : 0}%)</span>
                </div>
              </div>

              <div className="dc-macro-item dc-macro-grasa-item">
                <div className="dc-macro-item-header"><i className="fa fa-tint"></i> Grasas</div>
                <div className="dc-macro-item-data">
                  <span className="dc-macro-num">{grasag}</span>
                  <span className="dc-macro-unit2">g</span>
                </div>
                <div className="dc-macro-item-kcal">
                  {grasag * 9} kcal
                  <span className="dc-macro-pct">({ree > 0 ? Math.round((grasag * 9 / ree) * 100) : 0}%)</span>
                </div>
              </div>

              <div className="dc-macro-item dc-macro-fibra-item">
                <div className="dc-macro-item-header"><i className="fa fa-circle-o"></i> Fibra</div>
                <div className="dc-macro-item-data">
                  <span className="dc-macro-num">{fibrag}</span>
                  <span className="dc-macro-unit2">g</span>
                </div>
                <div className="dc-macro-item-kcal dc-macro-fibra-note">Recomendada/día</div>
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
                    <th>CHO (g)</th><th>Proteínas (g)</th><th>Grasas (g)</th>
                    <th>Fibra (g)</th><th className="dc-col-kcal">kcal</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'Desayuno',   label: 'Desayuno',    icon: 'fa-sun-o'   },
                    { key: 'MeriendaAM', label: 'Merienda AM', icon: 'fa-coffee'  },
                    { key: 'Almuerzo',   label: 'Almuerzo',    icon: 'fa-cutlery' },
                    { key: 'MeriendaPM', label: 'Merienda PM', icon: 'fa-apple'   },
                    { key: 'Cena',       label: 'Cena',        icon: 'fa-moon-o'  },
                  ].map(meal => {
                    const m = getMeal(meal.key);
                    const kcal = calcularKcal(m.cho, m.prot, m.grasa);
                    return (
                      <tr key={meal.key} className="dc-meal-row">
                        <td className="dc-meal-name">
                          <i className={`fa ${meal.icon} dc-meal-icon`}></i> {meal.label}
                        </td>
                        <td>{m.cho  > 0 ? m.cho   : '-'}</td>
                        <td>{m.prot > 0 ? m.prot  : '-'}</td>
                        <td>{m.grasa> 0 ? m.grasa : '-'}</td>
                        <td>{m.fibra> 0 ? m.fibra : '-'}</td>
                        <td className="dc-kcal-cell">{kcal > 0 ? kcal : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="dc-meal-total-row">
                    <td className="dc-meal-name"><strong>Total</strong></td>
                    <td>{chog}</td><td>{protg}</td><td>{grasag}</td><td>{fibrag}</td>
                    <td className="dc-kcal-cell">{calcularKcal(chog, protg, grasag)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
        );
      })()}

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

      {/* ANÁLISIS BIOQUÍMICO */}
      {analisis && (
        <div className="dc-card dc-card-full">
          <div className="dc-card-header dc-indigo">
            <i className="fa fa-flask"></i> Exámenes de Laboratorio
            {analisis.Fecha_Analisis && (
              <span className="dc-badge-fecha"> — {analisis.Fecha_Analisis}</span>
            )}
          </div>
          <div className="dc-card-body">
            <div className="dc-metrics-grid">
              {analisis.Hemoglobina    != null && <div className="dc-metric-box"><div className="dc-metric-icon dc-icon-danger"><i className="fa fa-tint"></i></div><div className="dc-metric-val">{analisis.Hemoglobina}</div><div className="dc-metric-unit">g/dl</div><div className="dc-metric-lbl">Hemoglobina</div></div>}
              {analisis.Hematocrito    != null && <div className="dc-metric-box"><div className="dc-metric-icon dc-icon-danger"><i className="fa fa-tint"></i></div><div className="dc-metric-val">{analisis.Hematocrito}</div><div className="dc-metric-unit">%</div><div className="dc-metric-lbl">Hematocrito</div></div>}
              {analisis.Colesterol_Total != null && <div className="dc-metric-box"><div className="dc-metric-icon dc-icon-amber"><i className="fa fa-heartbeat"></i></div><div className="dc-metric-val">{analisis.Colesterol_Total}</div><div className="dc-metric-unit">mg/dl</div><div className="dc-metric-lbl">Colesterol Total</div></div>}
              {analisis.HDL            != null && <div className="dc-metric-box"><div className="dc-metric-icon dc-icon-emerald"><i className="fa fa-heart"></i></div><div className="dc-metric-val">{analisis.HDL}</div><div className="dc-metric-unit">mg/dl</div><div className="dc-metric-lbl">HDL</div></div>}
              {analisis.LDL            != null && <div className="dc-metric-box"><div className="dc-metric-icon dc-icon-amber"><i className="fa fa-heart"></i></div><div className="dc-metric-val">{analisis.LDL}</div><div className="dc-metric-unit">mg/dl</div><div className="dc-metric-lbl">LDL</div></div>}
              {analisis.Trigliceridos  != null && <div className="dc-metric-box"><div className="dc-metric-icon dc-icon-amber"><i className="fa fa-tint"></i></div><div className="dc-metric-val">{analisis.Trigliceridos}</div><div className="dc-metric-unit">mg/dl</div><div className="dc-metric-lbl">Triglicéridos</div></div>}
              {analisis.Glicemia       != null && <div className="dc-metric-box"><div className="dc-metric-icon dc-icon-indigo"><i className="fa fa-flask"></i></div><div className="dc-metric-val">{analisis.Glicemia}</div><div className="dc-metric-unit">mg/dl</div><div className="dc-metric-lbl">Glicemia</div></div>}
              {analisis.Acido_Urico    != null && <div className="dc-metric-box"><div className="dc-metric-icon dc-icon-slate"><i className="fa fa-flask"></i></div><div className="dc-metric-val">{analisis.Acido_Urico}</div><div className="dc-metric-unit">mg/dl</div><div className="dc-metric-lbl">Ácido Úrico</div></div>}
              {analisis.Albumina       != null && <div className="dc-metric-box"><div className="dc-metric-icon dc-icon-slate"><i className="fa fa-flask"></i></div><div className="dc-metric-val">{analisis.Albumina}</div><div className="dc-metric-unit">g/dl</div><div className="dc-metric-lbl">Albúmina</div></div>}
              {analisis.Creatinina     != null && <div className="dc-metric-box"><div className="dc-metric-icon dc-icon-slate"><i className="fa fa-flask"></i></div><div className="dc-metric-val">{analisis.Creatinina}</div><div className="dc-metric-unit">mg/dl</div><div className="dc-metric-lbl">Creatinina</div></div>}
              {analisis.TSH            != null && <div className="dc-metric-box"><div className="dc-metric-icon dc-icon-indigo"><i className="fa fa-flask"></i></div><div className="dc-metric-val">{analisis.TSH}</div><div className="dc-metric-unit">μUI/ml</div><div className="dc-metric-lbl">TSH</div></div>}
              {analisis.T4             != null && <div className="dc-metric-box"><div className="dc-metric-icon dc-icon-indigo"><i className="fa fa-flask"></i></div><div className="dc-metric-val">{analisis.T4}</div><div className="dc-metric-unit">ng/dl</div><div className="dc-metric-lbl">T4</div></div>}
              {analisis.T3             != null && <div className="dc-metric-box"><div className="dc-metric-icon dc-icon-indigo"><i className="fa fa-flask"></i></div><div className="dc-metric-val">{analisis.T3}</div><div className="dc-metric-unit">ng/dl</div><div className="dc-metric-lbl">T3</div></div>}
              {analisis.Vitamina_D     != null && <div className="dc-metric-box"><div className="dc-metric-icon dc-icon-amber"><i className="fa fa-sun-o"></i></div><div className="dc-metric-val">{analisis.Vitamina_D}</div><div className="dc-metric-unit">ng/ml</div><div className="dc-metric-lbl">Vitamina D</div></div>}
              {analisis.Vitamina_B12   != null && <div className="dc-metric-box"><div className="dc-metric-icon dc-icon-emerald"><i className="fa fa-flask"></i></div><div className="dc-metric-val">{analisis.Vitamina_B12}</div><div className="dc-metric-unit">pg/ml</div><div className="dc-metric-lbl">Vitamina B12</div></div>}
            </div>
            {analisis.Observaciones && (
              <div className="dc-text-block" style={{ marginTop: '1rem' }}>
                <strong>Observaciones:</strong> {analisis.Observaciones}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleConsulta;
