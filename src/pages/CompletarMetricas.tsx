import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConsultaById, finalizarConsulta, getClinicasMedico } from '../api/consultas';
import logoSistema from '../assets/images/Untitled.png';
import { getUsuarioById } from '../api/usuarios';
import {
  getPadecimientosDisponibles, getPadecimientosUsuario,
  asignarPadecimiento, eliminarPadecimiento,
} from '../api/padecimientos';
import {
  completarMetricas as completarMetricasApi, getHistoriaClinica, saveHistoriaClinica,
  getEvaluacionCuantitativa, saveEvaluacionCuantitativa,
  getAnalisisBioquimico, saveAnalisisBioquimico,
  getPliegues, savePliegue, deletePliegue,
  calcularAntropometria, getAntropometriaConsulta,
  saveDistribucionMacros,
  type HistoriaClinicaData, type AnalisisBioquimicoData,
  type PliegueData, type DistribucionMacrosPayload,
} from '../api/completarMetricas';
import './CompletarMetricas.css';

// ── Types ──────────────────────────────────────────────────────────────────

type TabId = 'metricas' | 'historia' | 'evaluacion' | 'analisis' | 'padecimientos';

interface MetricasForm {
  peso: string; estatura: string; grasaG: string; grasaPct: string;
  musculoG: string; masaOsea: string; aguaCorporal: string; edadMetabolica: string;
  grasaVisceral: string; cintura: string; cadera: string; muneca: string;
  sistolica: string; diastolica: string;
  observaciones: string; recomendaciones: string;
}

interface HistoriaForm {
  objetivos: string; calidadSueno: string; funcionIntestinal: string;
  fuma: boolean; alcohol: boolean; frecuenciaAlcohol: string;
  actividadFisica: string; medicamentos: string; cirugiasRecientes: string;
  embarazo: boolean; lactancia: boolean; alimentosFavoritos: string;
  alimentosNoGustan: string; intolerancias: string; alergias: string; ingestaAgua: string;
}

interface EvaluacionForm {
  desayuno: string; meriendaAM: string; almuerzo: string; meriendaPM: string; cena: string;
}

interface AnalisisForm {
  fechaAnalisis: string; hemoglobina: string; hematocrito: string;
  colesterolTotal: string; hdl: string; ldl: string; trigliceridos: string;
  glicemia: string; acidoUrico: string; albumina: string; creatinina: string;
  tsh: string; t4: string; t3: string; vitaminaD: string; vitaminaB12: string;
  observaciones: string;
}

interface AntropForm {
  pb: string; pantorrilla: string; ar: string; etnia: string;
}

interface AntropResult {
  atb: number; cmb: number; amb: number; agb: number;
  pesoEst: number; tallaEst: number;
}

interface CalculadoraState {
  // paso 1 - peso ideal
  factorEstructura: string; factorPersonalizado: string; pesoIdeal: number | null;
  // paso 2 - GEB
  formulaGEB: string; geb: number | null;
  // paso 3 - REE
  factorActividad: string; reeCalculado: number | null; reeEditable: string;
  // paso 4 - distribución macros
  pctCHO: string; pctProt: string; pctGrasa: string;
  tipoPesoRef: string; pesoPersonalizado: string;
  // paso 5 - distribución tiempos
  desayunoCHO: string; desayunoProt: string; desayunoGrasa: string; desayunoFibra: string;
  meriendaAMCHO: string; meriendaAMProt: string; meriendaAMGrasa: string; meriendaAMFibra: string;
  almuerzoCHO: string; almuerzoProt: string; almuerzoGrasa: string; almuerzoFibra: string;
  meriendaPMCHO: string; meriendaPMProt: string; meriendaPMGrasa: string; meriendaPMFibra: string;
  cenaCHO: string; cenaProt: string; cenaGrasa: string; cenaFibra: string;
  metaFibra: string;
}

// ── Cálculos puros ─────────────────────────────────────────────────────────

const calcIMC = (peso: number, estatura: number): number => {
  const h = estatura / 100;
  return Math.round((peso / (h * h)) * 10) / 10;
};

const clasificarIMC = (imc: number): { texto: string; clase: string } => {
  if (imc < 18.5) return { texto: 'Bajo peso', clase: 'imc-bajo' };
  if (imc < 25)   return { texto: 'Peso normal', clase: 'imc-normal' };
  if (imc < 30)   return { texto: 'Sobrepeso', clase: 'imc-sobrepeso' };
  return { texto: 'Obesidad', clase: 'imc-obesidad' };
};

const calcEdad = (fechaNac: string): number => {
  const hoy = new Date();
  const nac = new Date(fechaNac);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
};

const calcGEB = (
  formula: string, peso: number, estatura: number, edad: number,
  sexo: string, mlg?: number,
): number => {
  const s = sexo?.toUpperCase();
  switch (formula) {
    case 'HarrisBenedict':
      return s === 'M'
        ? 66.5 + 13.75 * peso + 5.003 * estatura - 6.755 * edad
        : 655.1 + 9.563 * peso + 1.85 * estatura - 4.676 * edad;
    case 'FAO_OMS': {
      if (s === 'M') {
        if (edad < 3)   return 60.9 * peso - 54;
        if (edad < 10)  return 22.7 * peso + 495;
        if (edad < 18)  return 17.5 * peso + 651;
        if (edad < 30)  return 15.3 * peso + 679;
        if (edad < 60)  return 11.6 * peso + 879;
        return 13.5 * peso + 487;
      } else {
        if (edad < 3)   return 61.0 * peso - 51;
        if (edad < 10)  return 22.5 * peso + 499;
        if (edad < 18)  return 12.2 * peso + 746;
        if (edad < 30)  return 14.7 * peso + 496;
        if (edad < 60)  return 8.7 * peso + 829;
        return 10.5 * peso + 596;
      }
    }
    case 'Mifflin':
      return s === 'M'
        ? 10 * peso + 6.25 * estatura - 5 * edad + 5
        : 10 * peso + 6.25 * estatura - 5 * edad - 161;
    case 'Cunningham':
      return 500 + 22 * (mlg ?? 0);
    case 'Valencia':
      return s === 'M'
        ? 14.2 * peso + 593
        : 10.9 * peso + 660;
    default:
      return 0;
  }
};

const calcPesoIdeal = (estatura: number, factor: number): number => {
  const t2 = (estatura / 100) * (estatura / 100);
  return ((estatura - t2 * factor) / 4) + (t2 * factor);
};

// ── Generación de PDF (HTML + window.print) ────────────────────────────────

const generarPDFNutricional = (datos: {
  paciente: string; medico: string; fecha: string;
  peso: number; estatura: number; imc: number; pesoIdeal: number | null;
  ree: number; formula: string; cho: number; prot: number; grasa: number; fibra: number;
  distribucion: { tiempos: string[]; cho: number[]; prot: number[]; grasa: number[]; fibra: number[] };
  historia?: HistoriaClinicaData | null;
  analisis?: AnalisisBioquimicoData | null;
  logoSistema?: string;
  logoClinica?: string;
}) => {
  const filasDist = datos.distribucion.tiempos.map((t, i) =>
    `<tr>
      <td>${t}</td>
      <td>${datos.distribucion.cho[i] ?? 0}g</td>
      <td>${datos.distribucion.prot[i] ?? 0}g</td>
      <td>${datos.distribucion.grasa[i] ?? 0}g</td>
      <td>${datos.distribucion.fibra[i] ?? 0}g</td>
    </tr>`
  ).join('');

  const htmlHistoria = datos.historia ? `
    <div style="margin-top:16px;padding:12px;background:#f8f9fa;border-radius:8px;">
      <h4 style="color:#006c49;margin:0 0 8px;">Historia Clínica</h4>
      ${datos.historia.Objetivos_Clinicos ? `<p><strong>Objetivos:</strong> ${datos.historia.Objetivos_Clinicos}</p>` : ''}
      ${datos.historia.Actividad_Fisica ? `<p><strong>Actividad física:</strong> ${datos.historia.Actividad_Fisica}</p>` : ''}
      ${datos.historia.Medicamentos ? `<p><strong>Medicamentos:</strong> ${datos.historia.Medicamentos}</p>` : ''}
      ${datos.historia.Intolerancias ? `<p><strong>Intolerancias:</strong> ${datos.historia.Intolerancias}</p>` : ''}
      ${datos.historia.Alergias_Alimentarias ? `<p><strong>Alergias:</strong> ${datos.historia.Alergias_Alimentarias}</p>` : ''}
    </div>` : '';

  const htmlAnalisis = datos.analisis ? `
    <div style="margin-top:16px;padding:12px;background:#f8f9fa;border-radius:8px;">
      <h4 style="color:#006c49;margin:0 0 8px;">Análisis Bioquímico (${datos.analisis.Fecha_Analisis})</h4>
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead><tr style="background:#006c49;color:#fff;"><th>Indicador</th><th>Valor</th></tr></thead>
        <tbody>
          ${datos.analisis.Hemoglobina != null ? `<tr><td>Hemoglobina</td><td>${datos.analisis.Hemoglobina} g/dl</td></tr>` : ''}
          ${datos.analisis.Colesterol_Total != null ? `<tr><td>Colesterol Total</td><td>${datos.analisis.Colesterol_Total} mg/dl</td></tr>` : ''}
          ${datos.analisis.HDL != null ? `<tr><td>HDL</td><td>${datos.analisis.HDL} mg/dl</td></tr>` : ''}
          ${datos.analisis.LDL != null ? `<tr><td>LDL</td><td>${datos.analisis.LDL} mg/dl</td></tr>` : ''}
          ${datos.analisis.Trigliceridos != null ? `<tr><td>Triglicéridos</td><td>${datos.analisis.Trigliceridos} mg/dl</td></tr>` : ''}
          ${datos.analisis.Glicemia != null ? `<tr><td>Glicemia</td><td>${datos.analisis.Glicemia} mg/dl</td></tr>` : ''}
        </tbody>
      </table>
    </div>` : '';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Plan Nutricional - ${datos.paciente}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
    .header { background: linear-gradient(135deg, #006c49, #10b981); color: #fff; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .header-logos { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
    .header-logos img { height: 52px; width: auto; object-fit: contain; background: rgba(255,255,255,0.15); border-radius: 6px; padding: 4px; }
    .header-text h1 { margin: 0; font-size: 22px; }
    .header-text p { margin: 4px 0 0; opacity: .85; font-size: 14px; }
    .card { background: #f2f3ff; border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; margin-bottom: 16px; }
    .card h3 { color: #006c49; margin: 0 0 8px; font-size: 15px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    .info-item label { font-size: 11px; color: #6b7280; display: block; }
    .info-item span { font-size: 14px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #006c49; color: #fff; padding: 6px 8px; text-align: left; }
    td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f9fafb; }
    .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #9ca3af; }
    @media print { body { padding: 0; } }
  </style></head><body>
  <div class="header">
    <div class="header-logos">
      ${datos.logoSistema ? `<img src="${datos.logoSistema}" alt="NutriSys" />` : ''}
      ${datos.logoClinica ? `<img src="${datos.logoClinica}" alt="Clínica" />` : ''}
    </div>
    <div class="header-text">
      <h1>Plan Nutricional</h1>
      <p>Paciente: ${datos.paciente} &nbsp;|&nbsp; Nutricionista: ${datos.medico} &nbsp;|&nbsp; Fecha: ${datos.fecha}</p>
    </div>
  </div>
  <div class="card">
    <h3>Métricas Corporales</h3>
    <div class="info-grid">
      <div class="info-item"><label>Peso</label><span>${datos.peso} kg</span></div>
      <div class="info-item"><label>Estatura</label><span>${datos.estatura} cm</span></div>
      <div class="info-item"><label>IMC</label><span>${datos.imc}</span></div>
      ${datos.pesoIdeal != null ? `<div class="info-item"><label>Peso Ideal</label><span>${datos.pesoIdeal.toFixed(1)} kg</span></div>` : ''}
    </div>
  </div>
  <div class="card">
    <h3>Evaluación Nutricional</h3>
    <div class="info-grid">
      <div class="info-item"><label>Fórmula GEB</label><span>${datos.formula}</span></div>
      <div class="info-item"><label>REE (kcal/día)</label><span>${Math.round(datos.ree)}</span></div>
    </div>
  </div>
  <div class="card">
    <h3>Metas de Macronutrientes</h3>
    <table>
      <thead><tr><th>Macronutriente</th><th>Kcal</th><th>Gramos</th></tr></thead>
      <tbody>
        <tr><td>Carbohidratos</td><td>${Math.round(datos.cho * 4)} kcal</td><td>${datos.cho.toFixed(1)} g</td></tr>
        <tr><td>Proteínas</td><td>${Math.round(datos.prot * 4)} kcal</td><td>${datos.prot.toFixed(1)} g</td></tr>
        <tr><td>Grasas</td><td>${Math.round(datos.grasa * 9)} kcal</td><td>${datos.grasa.toFixed(1)} g</td></tr>
        <tr><td>Fibra (meta)</td><td>—</td><td>${datos.fibra} g</td></tr>
      </tbody>
    </table>
  </div>
  <div class="card">
    <h3>Distribución por Tiempos de Comida</h3>
    <table>
      <thead><tr><th>Tiempo</th><th>CHO</th><th>Prot</th><th>Grasa</th><th>Fibra</th></tr></thead>
      <tbody>${filasDist}</tbody>
    </table>
  </div>
  ${htmlHistoria}
  ${htmlAnalisis}
  <div class="footer">Generado por NutriSys · ${new Date().toLocaleDateString('es-CR')}</div>
  </body></html>`;

  const ventana = window.open('', '_blank');
  if (ventana) {
    ventana.document.write(html);
    ventana.document.close();
    ventana.focus();
    setTimeout(() => ventana.print(), 500);
  }
};

// ── Copiar distribución al portapapeles ────────────────────────────────────

const copiarDistribucion = (
  paciente: string,
  tiempos: string[],
  emojis: string[],
  cho: number[], prot: number[], grasa: number[], fibra: number[],
  totalCHO: number, totalProt: number, totalGrasa: number,
) => {
  const lineas = tiempos.map((t, i) =>
    `${emojis[i]} ${t}\n  CHO: ${cho[i]}g | Prot: ${prot[i]}g | Grasa: ${grasa[i]}g | Fibra: ${fibra[i]}g`
  );
  const texto = `🥗 PLAN NUTRICIONAL - ${paciente}\n${'─'.repeat(40)}\n\n${lineas.join('\n\n')}\n\n${'─'.repeat(40)}\nTOTALES: CHO ${totalCHO}g | Prot ${totalProt}g | Grasa ${totalGrasa}g`;
  navigator.clipboard.writeText(texto).then(
    () => alert('Distribución copiada al portapapeles'),
    () => alert('No se pudo copiar al portapapeles'),
  );
};

// ── Constantes ─────────────────────────────────────────────────────────────

const TIEMPOS = ['Desayuno', 'Merienda AM', 'Almuerzo', 'Merienda PM', 'Cena'];
const EMOJIS_TIEMPOS = ['🌅', '🍎', '🍽️', '🥪', '🌙'];

const INIT_METRICAS: MetricasForm = {
  peso: '', estatura: '', grasaG: '', grasaPct: '', musculoG: '', masaOsea: '',
  aguaCorporal: '', edadMetabolica: '', grasaVisceral: '', cintura: '', cadera: '',
  muneca: '', sistolica: '', diastolica: '', observaciones: '', recomendaciones: '',
};

const GEB_DESCRIPTIONS: Record<string, string> = {
  HarrisBenedict: 'Clásica (1919). Peso, talla, edad y sexo. Adecuada para adultos sanos en general.',
  FAO_OMS: 'FAO/OMS/Schofield (1985). Por grupos etarios. Precisa en niños y adultos mayores.',
  Mifflin: 'Mifflin-St Jeor (1990). Revisión moderna de Harris-Benedict. Mayor precisión en obesidad.',
  Cunningham: 'Cunningham (1980). Requiere % de grasa corporal. Ideal en atletas y deportistas.',
  Valencia: 'Valencia Mexicana. Desarrollada para población latinoamericana. Usa peso y sexo.',
};

const INIT_HISTORIA: HistoriaForm = {
  objetivos: '', calidadSueno: 'Buena', funcionIntestinal: 'Normal',
  fuma: false, alcohol: false, frecuenciaAlcohol: '', actividadFisica: '',
  medicamentos: '', cirugiasRecientes: '', embarazo: false, lactancia: false,
  alimentosFavoritos: '', alimentosNoGustan: '', intolerancias: '', alergias: '', ingestaAgua: '',
};

const INIT_EVALUACION: EvaluacionForm = {
  desayuno: '', meriendaAM: '', almuerzo: '', meriendaPM: '', cena: '',
};

const INIT_ANALISIS: AnalisisForm = {
  fechaAnalisis: '', hemoglobina: '', hematocrito: '', colesterolTotal: '',
  hdl: '', ldl: '', trigliceridos: '', glicemia: '', acidoUrico: '',
  albumina: '', creatinina: '', tsh: '', t4: '', t3: '', vitaminaD: '', vitaminaB12: '',
  observaciones: '',
};

const INIT_CALC: CalculadoraState = {
  factorEstructura: 'Mediana', factorPersonalizado: '', pesoIdeal: null,
  formulaGEB: 'HarrisBenedict', geb: null,
  factorActividad: '1.2', reeCalculado: null, reeEditable: '',
  pctCHO: '', pctProt: '', pctGrasa: '', tipoPesoRef: 'Ideal', pesoPersonalizado: '',
  desayunoCHO: '', desayunoProt: '', desayunoGrasa: '', desayunoFibra: '',
  meriendaAMCHO: '', meriendaAMProt: '', meriendaAMGrasa: '', meriendaAMFibra: '',
  almuerzoCHO: '', almuerzoProt: '', almuerzoGrasa: '', almuerzoFibra: '',
  meriendaPMCHO: '', meriendaPMProt: '', meriendaPMGrasa: '', meriendaPMFibra: '',
  cenaCHO: '', cenaProt: '', cenaGrasa: '', cenaFibra: '',
  metaFibra: '25',
};

const FACTORES_ESTRUCTURA: Record<string, number> = {
  'Pequeña': 20, 'Mediana': 22.5, 'Grande': 25, 'Muy Grande': 27,
};

// ── Componente ─────────────────────────────────────────────────────────────

const CompletarMetricas: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const consultaId = Number(id);

  // ── Carga inicial ────────────────────────────────────────────────────────
  const { data: consulta, isLoading } = useQuery({
    queryKey: ['consulta', consultaId],
    queryFn: () => getConsultaById(consultaId),
    enabled: Boolean(consultaId),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: usuario } = useQuery({
    queryKey: ['usuario', consulta?.Id_Usuario],
    queryFn: () => getUsuarioById(consulta!.Id_Usuario),
    enabled: Boolean(consulta?.Id_Usuario),
  });

  // ── Estado de tabs ───────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('metricas');
  const [historiaCargada, setHistoriaCargada] = useState(false);
  const [evaluacionCargada, setEvaluacionCargada] = useState(false);
  const [analisisCargado, setAnalisisCargado] = useState(false);
  const [padecimientosCargados, setPadecimientosCargados] = useState(false);

  // ── Estado de formularios ────────────────────────────────────────────────
  const [metricas, setMetricas] = useState<MetricasForm>(INIT_METRICAS);
  const [historia, setHistoria] = useState<HistoriaForm>(INIT_HISTORIA);
  const [historiaExiste, setHistoriaExiste] = useState(false);
  const [evaluacion, setEvaluacion] = useState<EvaluacionForm>(INIT_EVALUACION);
  const [analisis, setAnalisis] = useState<AnalisisForm>(INIT_ANALISIS);

  // ── Estado pliegues ──────────────────────────────────────────────────────
  const [showPliegues, setShowPliegues] = useState(false);
  const [plieguesData, setPlieguesData] = useState<PliegueData[]>([]);
  const [valoresPliegues, setValoresPliegues] = useState<Record<string, string>>({});

  // ── Estado antropometría ─────────────────────────────────────────────────
  const [showAntrop, setShowAntrop] = useState(false);
  const [antropForm, setAntropForm] = useState<AntropForm>({ pb: '', pantorrilla: '', ar: '', etnia: 'B' });
  const [antropResult, setAntropResult] = useState<AntropResult | null>(null);

  // ── Estado padecimientos ─────────────────────────────────────────────────
  const [padecimientosDisp, setPadecimientosDisp] = useState<{ Id_Padecimiento: number; Descripcion: string }[]>([]);
  const [padecimientosAsig, setPadecimientosAsig] = useState<{ Id_Padecimiento: number; Descripcion: string }[]>([]);
  const [padSelected, setPadSelected] = useState('');

  // ── Estado calculadora ───────────────────────────────────────────────────
  const [showCalc, setShowCalc] = useState(false);
  const [calc, setCalc] = useState<CalculadoraState>(INIT_CALC);
  const [showDistTiempos, setShowDistTiempos] = useState(false);

  // ── IMC en tiempo real ───────────────────────────────────────────────────
  const [imcValor, setImcValor] = useState<number | null>(null);
  const [imcClasif, setImcClasif] = useState<{ texto: string; clase: string } | null>(null);

  // ── Populate form desde consulta cargada ─────────────────────────────────
  // NOTA: el interceptor de axios (normalizeKeys) convierte claves del response:
  //   _minúscula → Mayúscula  (Peso_kg → PesoKg, Grasa_g → GrasaG, Estatura_cm → EstaturaCm)
  //   _Mayúscula → sin cambio (Presion_Arterial_Sistolica, Observaciones_Medico quedan igual)
  // Por eso usamos fallback (normalizada ?? original) para cubrir ambos casos.
  useEffect(() => {
    if (activeTab !== 'metricas') return;
    if (!consulta) return;

    const c = consulta as any;
    const newMetricas = {
      peso:           (c.PesoKg                    ?? c.Peso_kg)                    ? String(c.PesoKg                    ?? c.Peso_kg)                    : '',
      estatura:       (c.EstaturaCm                ?? c.Estatura_cm)                ? String(c.EstaturaCm                ?? c.Estatura_cm)                : '',
      grasaG:         (c.GrasaG                    ?? c.Grasa_g)                    ? String(c.GrasaG                    ?? c.Grasa_g)                    : '',
      grasaPct:       (c.Grasa_Porcentaje)                                          ? String(c.Grasa_Porcentaje)                                          : '',
      musculoG:       (c.MusculoG                  ?? c.Musculo_g)                  ? String(c.MusculoG                  ?? c.Musculo_g)                  : '',
      masaOsea:       (c.Masa_OseaG                ?? c.Masa_Osea_g)                ? String(c.Masa_OseaG                ?? c.Masa_Osea_g)                : '',
      aguaCorporal:   (c.Agua_Corporal_Pct)                                         ? String(c.Agua_Corporal_Pct)                                         : '',
      edadMetabolica: (c.Edad_Metabolica)                                           ? String(c.Edad_Metabolica)                                           : '',
      grasaVisceral:  (c.Grasa_Visceral)                                            ? String(c.Grasa_Visceral)                                            : '',
      cintura:        (c.Circunferencia_CinturaCm  ?? c.Circunferencia_Cintura_cm)  ? String(c.Circunferencia_CinturaCm  ?? c.Circunferencia_Cintura_cm)  : '',
      cadera:         (c.Circunferencia_CaderaCm   ?? c.Circunferencia_Cadera_cm)   ? String(c.Circunferencia_CaderaCm   ?? c.Circunferencia_Cadera_cm)   : '',
      muneca:         (c.Circunferencia_MunecaCm   ?? c.Circunferencia_Muneca_cm)   ? String(c.Circunferencia_MunecaCm   ?? c.Circunferencia_Muneca_cm)   : '',
      sistolica:      (c.Presion_Arterial_Sistolica)                                ? String(c.Presion_Arterial_Sistolica)                                : '',
      diastolica:     (c.Presion_Arterial_Diastolica)                               ? String(c.Presion_Arterial_Diastolica)                               : '',
      observaciones:   c.Observaciones_Medico ?? '',
      recomendaciones: c.Recomendaciones ?? '',
    };

    setMetricas(newMetricas);
  }, [consulta, activeTab]);

  // ── Calcular IMC cuando cambian peso/estatura ────────────────────────────
  useEffect(() => {
    const p = parseFloat(metricas.peso);
    const e = parseFloat(metricas.estatura);
    if (p > 0 && e > 0) {
      const v = calcIMC(p, e);
      setImcValor(v);
      setImcClasif(clasificarIMC(v));
    } else {
      setImcValor(null);
      setImcClasif(null);
    }
  }, [metricas.peso, metricas.estatura]);

  // ── Carga lazy de pliegues al abrir panel ────────────────────────────────
  useEffect(() => {
    if (showPliegues && consultaId) {
      getPliegues(consultaId).then(setPlieguesData);
    }
  }, [showPliegues, consultaId]);

  // ── Carga lazy de antropometría al abrir panel ───────────────────────────
  useEffect(() => {
    if (showAntrop && consultaId) {
      getAntropometriaConsulta(consultaId).then(r => {
        if (r) {
          setAntropForm({
            pb: r.Circunferencia_Brazo_cm ? String(r.Circunferencia_Brazo_cm) : '',
            pantorrilla: r.Circunferencia_Pantorrilla_cm ? String(r.Circunferencia_Pantorrilla_cm) : '',
            ar: r.Altura_Rodilla_cm ? String(r.Altura_Rodilla_cm) : '',
            etnia: 'B',
          });
          setAntropResult({
            atb: r.Antrop_ATB ?? 0, cmb: r.Antrop_CMB ?? 0,
            amb: r.Antrop_AMB ?? 0, agb: r.Antrop_AGB ?? 0,
            pesoEst: r.Peso_Estimado_kg ?? 0, tallaEst: r.Talla_Estimada_cm ?? 0,
          });
        }
      });
    }
  }, [showAntrop, consultaId]);

  // ── Carga lazy por tab ───────────────────────────────────────────────────
  const cargarHistoria = useCallback(async () => {
    if (historiaCargada || !consulta?.Id_Usuario) return;
    const h = await getHistoriaClinica(consulta.Id_Usuario);
    setHistoriaCargada(true);
    if (h) {
      setHistoriaExiste(true);
      setHistoria({
        objetivos: h.Objetivos_Clinicos ?? '',
        calidadSueno: h.Calidad_Sueno ?? 'Buena',
        funcionIntestinal: h.Funcion_Intestinal ?? 'Normal',
        fuma: h.Fuma ?? false, alcohol: h.Consume_Alcohol ?? false,
        frecuenciaAlcohol: h.Frecuencia_Alcohol ?? '',
        actividadFisica: h.Actividad_Fisica ?? '',
        medicamentos: h.Medicamentos ?? '',
        cirugiasRecientes: h.Cirugias_Recientes ?? '',
        embarazo: h.Embarazo ?? false, lactancia: h.Lactancia ?? false,
        alimentosFavoritos: h.Alimentos_Favoritos ?? '',
        alimentosNoGustan: h.Alimentos_No_Gustan ?? '',
        intolerancias: h.Intolerancias ?? '',
        alergias: h.Alergias_Alimentarias ?? '',
        ingestaAgua: h.Ingesta_Agua_Diaria ?? '',
      });
    }
  }, [historiaCargada, consulta?.Id_Usuario]);

  const cargarEvaluacion = useCallback(async () => {
    if (evaluacionCargada || !consulta?.Id_Usuario) return;
    const items = await getEvaluacionCuantitativa(consulta.Id_Usuario);
    setEvaluacionCargada(true);
    const map: Record<string, string> = {};
    items.forEach(i => { map[i.Tiempo_Comida] = i.Consumo_Usual; });
    setEvaluacion({
      desayuno: map['Desayuno'] ?? '',
      meriendaAM: map['Merienda AM'] ?? '',
      almuerzo: map['Almuerzo'] ?? '',
      meriendaPM: map['Merienda PM'] ?? '',
      cena: map['Cena'] ?? '',
    });
  }, [evaluacionCargada, consulta?.Id_Usuario]);

  const cargarAnalisis = useCallback(async () => {
    if (analisisCargado || !consulta?.Id_Usuario) return;
    const a = await getAnalisisBioquimico(consulta.Id_Usuario);
    setAnalisisCargado(true);
    if (a) {
      setAnalisis({
        fechaAnalisis: a.Fecha_Analisis ?? '',
        hemoglobina: a.Hemoglobina != null ? String(a.Hemoglobina) : '',
        hematocrito: a.Hematocrito != null ? String(a.Hematocrito) : '',
        colesterolTotal: a.Colesterol_Total != null ? String(a.Colesterol_Total) : '',
        hdl: a.HDL != null ? String(a.HDL) : '',
        ldl: a.LDL != null ? String(a.LDL) : '',
        trigliceridos: a.Trigliceridos != null ? String(a.Trigliceridos) : '',
        glicemia: a.Glicemia != null ? String(a.Glicemia) : '',
        acidoUrico: a.Acido_Urico != null ? String(a.Acido_Urico) : '',
        albumina: a.Albumina != null ? String(a.Albumina) : '',
        creatinina: a.Creatinina != null ? String(a.Creatinina) : '',
        tsh: a.TSH != null ? String(a.TSH) : '',
        t4: a.T4 != null ? String(a.T4) : '',
        t3: a.T3 != null ? String(a.T3) : '',
        vitaminaD: a.Vitamina_D != null ? String(a.Vitamina_D) : '',
        vitaminaB12: a.Vitamina_B12 != null ? String(a.Vitamina_B12) : '',
        observaciones: a.Observaciones ?? '',
      });
    }
  }, [analisisCargado, consulta?.Id_Usuario]);

  const cargarPadecimientos = useCallback(async () => {
    if (padecimientosCargados || !consulta?.Id_Usuario) return;
    setPadecimientosCargados(true);
    const [disp, asig] = await Promise.all([
      getPadecimientosDisponibles(),
      getPadecimientosUsuario(consulta.Id_Usuario),
    ]);
    setPadecimientosDisp(disp);
    setPadecimientosAsig(asig);
  }, [padecimientosCargados, consulta?.Id_Usuario]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    if (tab === 'historia') cargarHistoria();
    if (tab === 'evaluacion') cargarEvaluacion();
    if (tab === 'analisis') cargarAnalisis();
    if (tab === 'padecimientos') cargarPadecimientos();
    // Al volver al tab métricas, forzar refetch para obtener datos actualizados
    if (tab === 'metricas') {
      queryClient.invalidateQueries({ queryKey: ['consulta', consultaId] });
    }
  };

  // ── Calculadora: actualizar GEB/REE al cambiar datos ─────────────────────
  const recalcularGEB = useCallback(() => {
    const peso = parseFloat(metricas.peso);
    const estatura = parseFloat(metricas.estatura);
    if (!peso || !estatura || !usuario) return;
    const edad = calcEdad(usuario.FechaNacimiento);
    const sexo = usuario.Sexo;
    const mlg = parseFloat(metricas.grasaPct) > 0
      ? peso * (1 - parseFloat(metricas.grasaPct) / 100)
      : undefined;
    const geb = calcGEB(calc.formulaGEB, peso, estatura, edad, sexo, mlg);
    const factAct = parseFloat(calc.factorActividad) || 1.2;
    const ree = geb * factAct;
    setCalc(c => ({ ...c, geb, reeCalculado: ree, reeEditable: String(Math.round(ree)) }));
  }, [metricas.peso, metricas.estatura, metricas.grasaPct, usuario, calc.formulaGEB, calc.factorActividad]);

  const recalcularPesoIdeal = useCallback(() => {
    const estatura = parseFloat(metricas.estatura);
    if (!estatura) return;
    let factor: number;
    if (calc.factorEstructura === 'Personalizado') {
      factor = parseFloat(calc.factorPersonalizado) || 22.5;
    } else {
      factor = FACTORES_ESTRUCTURA[calc.factorEstructura] ?? 22.5;
    }
    setCalc(c => ({ ...c, pesoIdeal: Math.round(calcPesoIdeal(estatura, factor) * 10) / 10 }));
  }, [metricas.estatura, calc.factorEstructura, calc.factorPersonalizado]);

  // ── Cálculo de distribución de macros ────────────────────────────────────
  const ree = parseFloat(calc.reeEditable) || 0;
  const pctCHO = parseFloat(calc.pctCHO) || 0;
  const pctProt = parseFloat(calc.pctProt) || 0;
  const pctGrasa = parseFloat(calc.pctGrasa) || 0;
  const totalPct = pctCHO + pctProt + pctGrasa;

  const pesoRef = (() => {
    if (calc.tipoPesoRef === 'Actual') return parseFloat(metricas.peso) || 0;
    if (calc.tipoPesoRef === 'Personalizado') return parseFloat(calc.pesoPersonalizado) || 0;
    return calc.pesoIdeal ?? parseFloat(metricas.peso) ?? 0;
  })();

  const kcalCHO = (pctCHO * ree) / 100;
  const kcalProt = (pctProt * ree) / 100;
  const kcalGrasa = (pctGrasa * ree) / 100;
  const gramsCHO = kcalCHO / 4;
  const gramsProt = kcalProt / 4;
  const gramsGrasa = kcalGrasa / 9;
  const gkgCHO = pesoRef > 0 ? gramsCHO / pesoRef : 0;
  const gkgProt = pesoRef > 0 ? gramsProt / pesoRef : 0;
  const gkgGrasa = pesoRef > 0 ? gramsGrasa / pesoRef : 0;

  // Totales distribución por tiempos
  const tiemposKeys = [
    { cho: 'desayunoCHO', prot: 'desayunoProt', grasa: 'desayunoGrasa', fibra: 'desayunoFibra' },
    { cho: 'meriendaAMCHO', prot: 'meriendaAMProt', grasa: 'meriendaAMGrasa', fibra: 'meriendaAMFibra' },
    { cho: 'almuerzoCHO', prot: 'almuerzoProt', grasa: 'almuerzoGrasa', fibra: 'almuerzoFibra' },
    { cho: 'meriendaPMCHO', prot: 'meriendaPMProt', grasa: 'meriendaPMGrasa', fibra: 'meriendaPMFibra' },
    { cho: 'cenaCHO', prot: 'cenaProt', grasa: 'cenaGrasa', fibra: 'cenaFibra' },
  ] as { cho: keyof CalculadoraState; prot: keyof CalculadoraState; grasa: keyof CalculadoraState; fibra: keyof CalculadoraState }[];

  const totalDistCHO = tiemposKeys.reduce((s, k) => s + (parseFloat(calc[k.cho] as string) || 0), 0);
  const totalDistProt = tiemposKeys.reduce((s, k) => s + (parseFloat(calc[k.prot] as string) || 0), 0);
  const totalDistGrasa = tiemposKeys.reduce((s, k) => s + (parseFloat(calc[k.grasa] as string) || 0), 0);
  const totalDistFibra = tiemposKeys.reduce((s, k) => s + (parseFloat(calc[k.fibra] as string) || 0), 0);

  const difCHO = Math.round(totalDistCHO - gramsCHO);
  const difProt = Math.round(totalDistProt - gramsProt);
  const difGrasa = Math.round(totalDistGrasa - gramsGrasa);
  const metaFibraNum = parseFloat(calc.metaFibra) || 25;

  // ── Mutations ─────────────────────────────────────────────────────────────

  const mutGuardarMetricas = useMutation({
    mutationFn: () => {
      const p = parseFloat(metricas.peso);
      const e = parseFloat(metricas.estatura);
      if (!p || !e) throw new Error('Peso y estatura son requeridos');
      return completarMetricasApi(consultaId, {
        Peso_kg: p, Estatura_cm: e,
        IMC: imcValor ?? calcIMC(p, e),
        Grasa_g: parseFloat(metricas.grasaG) || 0,
        Grasa_Porcentaje: parseFloat(metricas.grasaPct) || undefined,
        Musculo_g: parseFloat(metricas.musculoG) || 0,
        Masa_Osea_g: parseFloat(metricas.masaOsea) || undefined,
        Agua_Corporal_Pct: parseFloat(metricas.aguaCorporal) || undefined,
        Edad_Metabolica: parseInt(metricas.edadMetabolica) || undefined,
        Grasa_Visceral: parseInt(metricas.grasaVisceral) || undefined,
        Circunferencia_Cintura_cm: parseFloat(metricas.cintura) || 0,
        Circunferencia_Cadera_cm: parseFloat(metricas.cadera) || 0,
        Circunferencia_Muneca_cm: parseFloat(metricas.muneca) || undefined,
        Presion_Arterial_Sistolica: parseInt(metricas.sistolica) || 0,
        Presion_Arterial_Diastolica: parseInt(metricas.diastolica) || 0,
        Observaciones_Medico: metricas.observaciones,
        Recomendaciones: metricas.recomendaciones,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consulta', consultaId] });
      alert('Métricas guardadas correctamente');
      handleTabChange('historia');
    },
    onError: (err: Error) => alert(err.message || 'Error al guardar métricas'),
  });

  const mutGuardarHistoria = useMutation({
    mutationFn: () => {
      if (!consulta?.Id_Usuario) throw new Error('Sin ID de usuario');
      const payload: HistoriaClinicaData = {
        Id_Usuario: consulta.Id_Usuario,
        Objetivos_Clinicos: historia.objetivos,
        Calidad_Sueno: historia.calidadSueno,
        Funcion_Intestinal: historia.funcionIntestinal,
        Fuma: historia.fuma, Consume_Alcohol: historia.alcohol,
        Frecuencia_Alcohol: historia.frecuenciaAlcohol,
        Actividad_Fisica: historia.actividadFisica,
        Medicamentos: historia.medicamentos,
        Cirugias_Recientes: historia.cirugiasRecientes,
        Embarazo: historia.embarazo, Lactancia: historia.lactancia,
        Alimentos_Favoritos: historia.alimentosFavoritos,
        Alimentos_No_Gustan: historia.alimentosNoGustan,
        Intolerancias: historia.intolerancias,
        Alergias_Alimentarias: historia.alergias,
        Ingesta_Agua_Diaria: historia.ingestaAgua,
      };
      return saveHistoriaClinica(payload, historiaExiste);
    },
    onSuccess: () => {
      setHistoriaExiste(true);
      alert('Historia clínica guardada correctamente');
      handleTabChange('evaluacion');
    },
    onError: () => alert('Error al guardar historia clínica'),
  });

  const mutGuardarEvaluacion = useMutation({
    mutationFn: () => {
      if (!consulta?.Id_Usuario) throw new Error('Sin ID de usuario');
      const items = TIEMPOS.map((t, i) => ({
        Tiempo_Comida: t,
        Consumo_Usual: [evaluacion.desayuno, evaluacion.meriendaAM, evaluacion.almuerzo,
          evaluacion.meriendaPM, evaluacion.cena][i],
      })).filter(x => x.Consumo_Usual.trim());
      return saveEvaluacionCuantitativa(consulta.Id_Usuario, items);
    },
    onSuccess: () => {
      alert('Evaluación cuantitativa guardada correctamente');
      handleTabChange('analisis');
    },
    onError: () => alert('Error al guardar evaluación cuantitativa'),
  });

  const mutGuardarAnalisis = useMutation({
    mutationFn: () => {
      if (!consulta?.Id_Usuario) throw new Error('Sin ID de usuario');
      if (!analisis.fechaAnalisis) throw new Error('La fecha del análisis es requerida');
      const n = (v: string) => v ? parseFloat(v) : undefined;
      return saveAnalisisBioquimico({
        Id_Usuario: consulta.Id_Usuario,
        Fecha_Analisis: analisis.fechaAnalisis,
        Hemoglobina: n(analisis.hemoglobina), Hematocrito: n(analisis.hematocrito),
        Colesterol_Total: n(analisis.colesterolTotal), HDL: n(analisis.hdl),
        LDL: n(analisis.ldl), Trigliceridos: n(analisis.trigliceridos),
        Glicemia: n(analisis.glicemia), Acido_Urico: n(analisis.acidoUrico),
        Albumina: n(analisis.albumina), Creatinina: n(analisis.creatinina),
        TSH: n(analisis.tsh), T4: n(analisis.t4), T3: n(analisis.t3),
        Vitamina_D: n(analisis.vitaminaD), Vitamina_B12: n(analisis.vitaminaB12),
        Observaciones: analisis.observaciones,
      });
    },
    onSuccess: () => {
      alert('Análisis bioquímico guardado correctamente');
      handleTabChange('padecimientos');
    },
    onError: (err: Error) => alert(err.message || 'Error al guardar análisis bioquímico'),
  });

  const mutGuardarPliegue = useMutation({
    mutationFn: ({ tipo, valor }: { tipo: string; valor: number }) =>
      savePliegue({ Id_Consulta: consultaId, Tipo_Pliegue: tipo, Valor_mm: valor }),
    onSuccess: () => getPliegues(consultaId).then(setPlieguesData),
    onError: () => alert('Error al guardar pliegue'),
  });

  const mutEliminarPliegue = useMutation({
    mutationFn: (idPliegue: number) => deletePliegue(idPliegue),
    onSuccess: () => getPliegues(consultaId).then(setPlieguesData),
    onError: () => alert('Error al eliminar pliegue'),
  });

  const mutAntropometria = useMutation({
    mutationFn: () => calcularAntropometria({
      Id_Consulta: consultaId,
      Circunferencia_Brazo_cm: parseFloat(antropForm.pb),
      Circunferencia_Pantorrilla_cm: parseFloat(antropForm.pantorrilla),
      Altura_Rodilla_cm: parseFloat(antropForm.ar),
      Raza: antropForm.etnia,
    }),
    onSuccess: (r) => setAntropResult({
      atb: r.Antrop_ATB ?? 0, cmb: r.Antrop_CMB ?? 0,
      amb: r.Antrop_AMB ?? 0, agb: r.Antrop_AGB ?? 0,
      pesoEst: r.Peso_Estimado_kg ?? 0, tallaEst: r.Talla_Estimada_cm ?? 0,
    }),
    onError: () => alert('Error al calcular antropometría'),
  });

  const mutAsignarPadecimiento = useMutation({
    mutationFn: () => {
      if (!padSelected || !consulta?.Id_Usuario) throw new Error('Seleccione un padecimiento');
      return asignarPadecimiento(consulta.Id_Usuario, Number(padSelected));
    },
    onSuccess: async (result) => {
      if (result === -1) { alert('Este padecimiento ya está asignado'); return; }
      const asig = await getPadecimientosUsuario(consulta!.Id_Usuario);
      setPadecimientosAsig(asig);
      setPadSelected('');
    },
    onError: (err: Error) => alert(err.message || 'Error al asignar padecimiento'),
  });

  const mutEliminarPadecimiento = useMutation({
    mutationFn: (idPad: number) => {
      const idUsuGlobal = parseInt(localStorage.getItem('userId') ?? '0');
      return eliminarPadecimiento(consulta!.Id_Usuario, idPad, idUsuGlobal);
    },
    onSuccess: async () => {
      const asig = await getPadecimientosUsuario(consulta!.Id_Usuario);
      setPadecimientosAsig(asig);
    },
    onError: () => alert('Error al eliminar padecimiento'),
  });

  const mutGuardarDistribucion = useMutation({
    mutationFn: () => {
      if (Math.abs(totalPct - 100) > 0.1) throw new Error('Los porcentajes deben sumar 100%');
      if (!consulta?.Id_Usuario || !consulta?.Id_Medico) throw new Error('Datos de consulta incompletos');
      const payload: DistribucionMacrosPayload = {
        Id_Consulta: consultaId, Id_Usuario: consulta.Id_Usuario, Id_Medico: consulta.Id_Medico,
        Formula_Usada: calc.formulaGEB, REE: ree,
        CHO_g: Math.round(gramsCHO * 10) / 10,
        Prot_g: Math.round(gramsProt * 10) / 10,
        Grasa_g: Math.round(gramsGrasa * 10) / 10,
        Fibra_g: parseFloat(calc.metaFibra) || 25,
        Desayuno_CHO_g: parseFloat(calc.desayunoCHO) || 0,
        Desayuno_Prot_g: parseFloat(calc.desayunoProt) || 0,
        Desayuno_Grasa_g: parseFloat(calc.desayunoGrasa) || 0,
        Desayuno_Fibra_g: parseFloat(calc.desayunoFibra) || 0,
        MeriendaAM_CHO_g: parseFloat(calc.meriendaAMCHO) || 0,
        MeriendaAM_Prot_g: parseFloat(calc.meriendaAMProt) || 0,
        MeriendaAM_Grasa_g: parseFloat(calc.meriendaAMGrasa) || 0,
        MeriendaAM_Fibra_g: parseFloat(calc.meriendaAMFibra) || 0,
        Almuerzo_CHO_g: parseFloat(calc.almuerzoCHO) || 0,
        Almuerzo_Prot_g: parseFloat(calc.almuerzoProt) || 0,
        Almuerzo_Grasa_g: parseFloat(calc.almuerzoGrasa) || 0,
        Almuerzo_Fibra_g: parseFloat(calc.almuerzoFibra) || 0,
        MeriendaPM_CHO_g: parseFloat(calc.meriendaPMCHO) || 0,
        MeriendaPM_Prot_g: parseFloat(calc.meriendaPMProt) || 0,
        MeriendaPM_Grasa_g: parseFloat(calc.meriendaPMGrasa) || 0,
        MeriendaPM_Fibra_g: parseFloat(calc.meriendaPMFibra) || 0,
        Cena_CHO_g: parseFloat(calc.cenaCHO) || 0,
        Cena_Prot_g: parseFloat(calc.cenaProt) || 0,
        Cena_Grasa_g: parseFloat(calc.cenaGrasa) || 0,
        Cena_Fibra_g: parseFloat(calc.cenaFibra) || 0,
      };
      return saveDistribucionMacros(payload);
    },
    onSuccess: async () => {
      alert('Distribución guardada correctamente');
      // Obtener historia, análisis y logo de clínica para el PDF
      const [historiaData, analisisData] = await Promise.all([
        consulta?.Id_Usuario ? getHistoriaClinica(consulta.Id_Usuario) : Promise.resolve(null),
        consulta?.Id_Usuario ? getAnalisisBioquimico(consulta.Id_Usuario) : Promise.resolve(null),
      ]);
      let logoClinicaUrl: string | undefined;
      if (consulta?.Id_Medico && consulta?.Id_Clinica) {
        try {
          const clinicas = await getClinicasMedico(consulta.Id_Medico);
          const clinica = clinicas.find(c => c.id === consulta.Id_Clinica);
          if (clinica?.logo) logoClinicaUrl = clinica.logo;
        } catch { /* logo de clínica es opcional */ }
      }
      generarPDFNutricional({
        paciente: consulta?.NombreUsuario ?? '',
        medico: consulta?.NombreMedico ?? '',
        fecha: new Date().toLocaleDateString('es-CR'),
        peso: parseFloat(metricas.peso) || 0,
        estatura: parseFloat(metricas.estatura) || 0,
        imc: imcValor ?? 0,
        pesoIdeal: calc.pesoIdeal,
        ree, formula: calc.formulaGEB,
        cho: Math.round(gramsCHO * 10) / 10,
        prot: Math.round(gramsProt * 10) / 10,
        grasa: Math.round(gramsGrasa * 10) / 10,
        fibra: parseFloat(calc.metaFibra) || 25,
        distribucion: {
          tiempos: TIEMPOS,
          cho: tiemposKeys.map(k => parseFloat(calc[k.cho] as string) || 0),
          prot: tiemposKeys.map(k => parseFloat(calc[k.prot] as string) || 0),
          grasa: tiemposKeys.map(k => parseFloat(calc[k.grasa] as string) || 0),
          fibra: tiemposKeys.map(k => parseFloat(calc[k.fibra] as string) || 0),
        },
        historia: historiaData,
        analisis: analisisData,
        logoSistema,
        logoClinica: logoClinicaUrl,
      });
    },
    onError: (err: Error) => alert(err.message || 'Error al guardar distribución'),
  });

  const mutFinalizarConsulta = useMutation({
    mutationFn: () => finalizarConsulta(consultaId, {
      Observaciones_Medico: metricas.observaciones,
      Recomendaciones: metricas.recomendaciones,
    }),
    onSuccess: () => {
      alert('¡Consulta finalizada correctamente!');
      navigate(-1);
    },
    onError: (err: Error) => alert(err.message || 'Error al finalizar la consulta'),
  });

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="cm-loading">
        <div className="cm-spinner" />
        <p>Cargando información de la consulta...</p>
      </div>
    );
  }

  if (!consulta) {
    return <div className="cm-not-found">Consulta no encontrada</div>;
  }

  // ── Helpers UI ─────────────────────────────────────────────────────────────
  const setM =(field: keyof MetricasForm, val: string) =>
    setMetricas(p => ({ ...p, [field]: val }));
  const setH = (field: keyof HistoriaForm, val: string | boolean) =>
    setHistoria(p => ({ ...p, [field]: val }));
  const setE = (field: keyof EvaluacionForm, val: string) =>
    setEvaluacion(p => ({ ...p, [field]: val }));
  const setA = (field: keyof AnalisisForm, val: string) =>
    setAnalisis(p => ({ ...p, [field]: val }));
  const setC = (field: keyof CalculadoraState, val: string | number | null) =>
    setCalc(p => ({ ...p, [field]: val }));

  const PLIEGUES_TIPOS = [
    'Tricipital', 'Bicipital', 'Subescapular', 'Suprailiaco',
    'Abdominal', 'Muslo_Anterior', 'Pierna_Medial', 'Pectoral', 'Axilar_Medio',
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="cm-page">
      {/* Breadcrumb */}
      <nav className="cm-breadcrumb">
        <span onClick={() => navigate('/dashboard')} className="cm-bc-link">Inicio</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span onClick={() => navigate('/consultas')} className="cm-bc-link">Consultas</span>
        <span className="cm-bc-sep"> &rsaquo; </span>
        <span className="cm-bc-active">Completar Métricas</span>
      </nav>

      {/* Header */}
      <div className="cm-header">
        <div>
          <h2 className="cm-title">
            <i className="fa fa-heartbeat" /> Completar Métricas
          </h2>
          <p className="cm-subtitle">{consulta.NombreUsuario}</p>
        </div>
        <div className="cm-header-info">
          <span className="cm-badge-fecha">
            <i className="fa fa-calendar" /> {new Date(consulta.Fecha_Cita).toLocaleDateString('es-CR', {
              year: 'numeric', month: 'long', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </span>
          {consulta.Motivo && (
            <span className="cm-badge-motivo">
              <i className="fa fa-comment" /> {consulta.Motivo}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="cm-tabs">
        {[
          { id: 'metricas', icon: 'fa-heartbeat', label: 'Métricas' },
          { id: 'historia', icon: 'fa-file-text', label: 'Historia Clínica' },
          { id: 'evaluacion', icon: 'fa-cutlery', label: 'Evaluación' },
          { id: 'analisis', icon: 'fa-flask', label: 'Análisis' },
          { id: 'padecimientos', icon: 'fa-medkit', label: 'Padecimientos' },
        ].map(t => (
          <button
            key={t.id}
            className={`cm-tab ${activeTab === t.id ? 'cm-tab-active' : ''}`}
            onClick={() => handleTabChange(t.id as TabId)}
          >
            <i className={`fa ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: MÉTRICAS ─────────────────────────────────────────────── */}
      {activeTab === 'metricas' && (
        <div className="cm-tab-content">
          {/* Peso e IMC */}
          <div className="cm-card">
            <h4 className="cm-card-title"><i className="fa fa-balance-scale" /> Peso e IMC</h4>
            <div className="cm-grid-3">
              <div className="cm-field">
                <label>Peso (kg) <span className="cm-req">*</span></label>
                <input type="number" step="0.01" min="20" max="300"
                  value={metricas.peso}
                  onChange={e => setM('peso', e.target.value)}
                  placeholder="kg" />
              </div>
              <div className="cm-field">
                <label>Estatura (cm) <span className="cm-req">*</span></label>
                <input type="number" step="0.1" min="50" max="250"
                  value={metricas.estatura}
                  onChange={e => setM('estatura', e.target.value)}
                  placeholder="cm" />
              </div>
              <div className="cm-field">
                <label>IMC</label>
                <div className={`cm-imc-display ${imcClasif?.clase ?? ''}`}>
                  <span className="cm-imc-val">{imcValor != null ? imcValor.toFixed(1) : '—'}</span>
                  {imcClasif && <span className="cm-imc-label">{imcClasif.texto}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Composición corporal */}
          <div className="cm-card">
            <h4 className="cm-card-title"><i className="fa fa-user" /> Composición Corporal</h4>
            <div className="cm-grid-3">
              <div className="cm-field">
                <label>Grasa (g)</label>
                <input type="number" value={metricas.grasaG}
                  onChange={e => setM('grasaG', e.target.value)} placeholder="g" />
              </div>
              <div className="cm-field">
                <label>Grasa (%)</label>
                <input type="number" step="0.1" value={metricas.grasaPct}
                  onChange={e => setM('grasaPct', e.target.value)} placeholder="%" />
              </div>
              <div className="cm-field">
                <label>Músculo (g)</label>
                <input type="number" value={metricas.musculoG}
                  onChange={e => setM('musculoG', e.target.value)} placeholder="g" />
              </div>
              <div className="cm-field">
                <label>Masa Ósea (g)</label>
                <input type="number" value={metricas.masaOsea}
                  onChange={e => setM('masaOsea', e.target.value)} placeholder="g" />
              </div>
              <div className="cm-field">
                <label>Agua Corporal (%)</label>
                <input type="number" step="0.1" value={metricas.aguaCorporal}
                  onChange={e => setM('aguaCorporal', e.target.value)} placeholder="%" />
              </div>
              <div className="cm-field">
                <label>Edad Metabólica</label>
                <input type="number" value={metricas.edadMetabolica}
                  onChange={e => setM('edadMetabolica', e.target.value)} />
              </div>
              <div className="cm-field">
                <label>Grasa Visceral (1-59)</label>
                <input type="number" min="1" max="59" value={metricas.grasaVisceral}
                  onChange={e => setM('grasaVisceral', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Circunferencias */}
          <div className="cm-card">
            <h4 className="cm-card-title"><i className="fa fa-arrows-h" /> Circunferencias</h4>
            <div className="cm-grid-3">
              <div className="cm-field">
                <label>Cintura (cm)</label>
                <input type="number" step="0.1" value={metricas.cintura}
                  onChange={e => setM('cintura', e.target.value)} placeholder="cm" />
              </div>
              <div className="cm-field">
                <label>Cadera (cm)</label>
                <input type="number" step="0.1" value={metricas.cadera}
                  onChange={e => setM('cadera', e.target.value)} placeholder="cm" />
              </div>
              <div className="cm-field">
                <label>Muñeca (cm)</label>
                <input type="number" step="0.1" value={metricas.muneca}
                  onChange={e => setM('muneca', e.target.value)} placeholder="cm" />
              </div>
            </div>
          </div>

          {/* Presión arterial */}
          <div className="cm-card">
            <h4 className="cm-card-title"><i className="fa fa-tachometer" /> Presión Arterial</h4>
            <div className="cm-grid-3">
              <div className="cm-field">
                <label>Sistólica (mmHg)</label>
                <input type="number" min="60" max="250" value={metricas.sistolica}
                  onChange={e => setM('sistolica', e.target.value)} placeholder="mmHg" />
              </div>
              <div className="cm-field">
                <label>Diastólica (mmHg)</label>
                <input type="number" min="40" max="150" value={metricas.diastolica}
                  onChange={e => setM('diastolica', e.target.value)} placeholder="mmHg" />
              </div>
            </div>
          </div>

          {/* Panel Pliegues Cutáneos */}
          <div className="cm-collapsible">
            <button className="cm-collapsible-btn" onClick={() => setShowPliegues(v => !v)}>
              <i className={`fa ${showPliegues ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
              &nbsp; Pliegues Cutáneos
            </button>
            {showPliegues && (
              <div className="cm-collapsible-body">
                <div className="cm-grid-3">
                  {PLIEGUES_TIPOS.map(tipo => {
                    const saved = plieguesData.find(p => p.Tipo_Pliegue === tipo);
                    return (
                      <div key={tipo} className="cm-pliegue-row">
                        <label>{tipo.replace(/_/g, ' ')}</label>
                        <div className="cm-pliegue-input-row">
                          <input type="number" step="0.1" placeholder="mm"
                            value={valoresPliegues[tipo] ?? ''}
                            onChange={e => setValoresPliegues(v => ({ ...v, [tipo]: e.target.value }))}
                          />
                          <button className="cm-btn-sm cm-btn-save"
                            onClick={() => {
                              const v = parseFloat(valoresPliegues[tipo] ?? '');
                              if (!isNaN(v)) mutGuardarPliegue.mutate({ tipo, valor: v });
                            }}
                          >
                            <i className="fa fa-save" />
                          </button>
                          {saved && (
                            <button className="cm-btn-sm cm-btn-delete"
                              onClick={() => {
                                if (saved.Id_Pliegue && window.confirm('¿Eliminar este pliegue?'))
                                  mutEliminarPliegue.mutate(saved.Id_Pliegue);
                              }}
                            >
                              <i className="fa fa-trash" />
                            </button>
                          )}
                        </div>
                        {saved && (
                          <span className="cm-pliegue-saved">
                            <i className="fa fa-check-circle" /> {saved.Valor_mm} mm guardado
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Panel Antropometría */}
          <div className="cm-collapsible">
            <button className="cm-collapsible-btn" onClick={() => setShowAntrop(v => !v)}>
              <i className={`fa ${showAntrop ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
              &nbsp; Antropometría de Brazo
            </button>
            {showAntrop && (
              <div className="cm-collapsible-body">
                <div className="cm-grid-3">
                  <div className="cm-field">
                    <label>Circ. de Brazo (cm)</label>
                    <input type="number" step="0.1" value={antropForm.pb}
                      onChange={e => setAntropForm(a => ({ ...a, pb: e.target.value }))} />
                  </div>
                  <div className="cm-field">
                    <label>Circ. Pantorrilla (cm)</label>
                    <input type="number" step="0.1" value={antropForm.pantorrilla}
                      onChange={e => setAntropForm(a => ({ ...a, pantorrilla: e.target.value }))} />
                  </div>
                  <div className="cm-field">
                    <label>Altura de Rodilla (cm)</label>
                    <input type="number" step="0.1" value={antropForm.ar}
                      onChange={e => setAntropForm(a => ({ ...a, ar: e.target.value }))} />
                  </div>
                  <div className="cm-field">
                    <label>Etnia</label>
                    <select value={antropForm.etnia}
                      onChange={e => setAntropForm(a => ({ ...a, etnia: e.target.value }))}>
                      <option value="B">Blanca / Mestiza</option>
                      <option value="N">Negra / Afrodescendiente</option>
                    </select>
                  </div>
                </div>
                <button className="cm-btn cm-btn-primary mt-2"
                  onClick={() => mutAntropometria.mutate()}
                  disabled={mutAntropometria.isPending}
                >
                  <i className="fa fa-calculator" /> Calcular y Guardar
                </button>
                {antropResult && (
                  <div className="cm-antrop-results">
                    <div className="cm-antrop-grid">
                      {[
                        ['ATB (cm²)', antropResult.atb.toFixed(2)],
                        ['CMB (cm)', antropResult.cmb.toFixed(2)],
                        ['AMB (cm²)', antropResult.amb.toFixed(2)],
                        ['AGB (cm²)', antropResult.agb.toFixed(2)],
                        ['Peso Estimado', `${antropResult.pesoEst.toFixed(1)} kg`],
                        ['Talla Estimada', `${antropResult.tallaEst.toFixed(1)} cm`],
                      ].map(([label, val]) => (
                        <div key={label} className="cm-antrop-item">
                          <span className="cm-antrop-label">{label}</span>
                          <span className="cm-antrop-val">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Observaciones, Recomendaciones */}
          <div className="cm-card">
            <h4 className="cm-card-title"><i className="fa fa-pencil-square-o" /> Observaciones y Recomendaciones</h4>
            <div className="cm-field">
              <label>Observaciones Clínicas</label>
              <textarea rows={3} maxLength={2000} value={metricas.observaciones}
                onChange={e => setM('observaciones', e.target.value)}
                placeholder="Observaciones del médico..." />
            </div>
            <div className="cm-field mt-2">
              <label>Recomendaciones</label>
              <textarea rows={3} maxLength={2000} value={metricas.recomendaciones}
                onChange={e => setM('recomendaciones', e.target.value)}
                placeholder="Recomendaciones para el paciente..." />
            </div>
          </div>

          {/* Botones Tab 1 */}
          <div className="cm-tab-actions">
            <button className="cm-btn cm-btn-secondary"
              onClick={() => setMetricas(INIT_METRICAS)}>
              <i className="fa fa-eraser" /> Limpiar
            </button>
            <button className="cm-btn cm-btn-primary"
              onClick={() => mutGuardarMetricas.mutate()}
              disabled={mutGuardarMetricas.isPending}>
              <i className="fa fa-save" /> {mutGuardarMetricas.isPending ? 'Guardando...' : 'Guardar Métricas'}
            </button>
            <button className="cm-btn cm-btn-next"
              onClick={() => handleTabChange('historia')}>
              Historia Clínica <i className="fa fa-arrow-right" />
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 2: HISTORIA CLÍNICA ─────────────────────────────────────── */}
      {activeTab === 'historia' && (
        <div className="cm-tab-content">
          <div className="cm-card">
            <h4 className="cm-card-title"><i className="fa fa-stethoscope" /> Antecedentes Generales</h4>
            <div className="cm-field">
              <label>Objetivos Clínicos</label>
              <textarea rows={2} value={historia.objetivos}
                onChange={e => setH('objetivos', e.target.value)}
                placeholder="Objetivos del tratamiento..." />
            </div>
            <div className="cm-grid-3">
              <div className="cm-field">
                <label>Calidad del Sueño</label>
                <select value={historia.calidadSueno}
                  onChange={e => setH('calidadSueno', e.target.value)}>
                  <option>Excelente</option><option>Buena</option>
                  <option>Regular</option><option>Mala</option>
                </select>
              </div>
              <div className="cm-field">
                <label>Función Intestinal</label>
                <select value={historia.funcionIntestinal}
                  onChange={e => setH('funcionIntestinal', e.target.value)}>
                  <option>Normal</option><option>Estreñimiento</option>
                  <option>Diarrea</option><option>Irregular</option>
                </select>
              </div>
              <div className="cm-field">
                <label>Ingesta de Agua</label>
                <input type="text" value={historia.ingestaAgua}
                  onChange={e => setH('ingestaAgua', e.target.value)}
                  placeholder="ej. 2L diarios" />
              </div>
            </div>
          </div>

          <div className="cm-card">
            <h4 className="cm-card-title"><i className="fa fa-heartbeat" /> Hábitos y Estado</h4>
            <div className="cm-checkboxes">
              {[
                { field: 'fuma' as const,     label: 'Fuma',            icon: 'fa-smoking',   val: historia.fuma },
                { field: 'alcohol' as const,  label: 'Consume Alcohol', icon: 'fa-glass',     val: historia.alcohol },
                { field: 'embarazo' as const, label: 'Embarazo',        icon: 'fa-heart',     val: historia.embarazo },
                { field: 'lactancia' as const,label: 'Lactancia',       icon: 'fa-child',     val: historia.lactancia },
              ].map(({ field, label, icon, val }) => (
                <label key={field} className={`cm-check-card ${val ? 'cm-check-card--on' : ''}`}>
                  <input type="checkbox" checked={val}
                    onChange={e => setH(field, e.target.checked)} />
                  <i className={`fa ${icon}`} />
                  <span className="cm-check-label">{label}</span>
                  <span className={`cm-check-badge ${val ? 'cm-check-badge--si' : 'cm-check-badge--no'}`}>
                    {val ? 'Sí' : 'No'}
                  </span>
                </label>
              ))}
            </div>
            {historia.alcohol && (
              <div className="cm-field mt-2">
                <label>Frecuencia de consumo de alcohol</label>
                <input type="text" value={historia.frecuenciaAlcohol}
                  onChange={e => setH('frecuenciaAlcohol', e.target.value)}
                  placeholder="ej. 2 veces por semana" />
              </div>
            )}
            <div className="cm-grid-2 mt-2">
              <div className="cm-field">
                <label>Actividad Física</label>
                <input type="text" value={historia.actividadFisica}
                  onChange={e => setH('actividadFisica', e.target.value)}
                  placeholder="Descripción de actividad física" />
              </div>
              <div className="cm-field">
                <label>Medicamentos</label>
                <input type="text" value={historia.medicamentos}
                  onChange={e => setH('medicamentos', e.target.value)}
                  placeholder="Medicamentos actuales" />
              </div>
            </div>
            <div className="cm-field mt-2">
              <label>Cirugías Recientes</label>
              <textarea rows={2} value={historia.cirugiasRecientes}
                onChange={e => setH('cirugiasRecientes', e.target.value)}
                placeholder="Descripción de cirugías recientes..." />
            </div>
          </div>

          <div className="cm-card">
            <h4 className="cm-card-title"><i className="fa fa-cutlery" /> Preferencias Alimentarias</h4>
            <div className="cm-grid-2">
              <div className="cm-field">
                <label>Alimentos Favoritos</label>
                <textarea rows={2} value={historia.alimentosFavoritos}
                  onChange={e => setH('alimentosFavoritos', e.target.value)}
                  placeholder="Alimentos que le gustan..." />
              </div>
              <div className="cm-field">
                <label>Alimentos que no le gustan</label>
                <textarea rows={2} value={historia.alimentosNoGustan}
                  onChange={e => setH('alimentosNoGustan', e.target.value)}
                  placeholder="Alimentos que no le gustan..." />
              </div>
              <div className="cm-field">
                <label>Intolerancias</label>
                <textarea rows={2} value={historia.intolerancias}
                  onChange={e => setH('intolerancias', e.target.value)}
                  placeholder="Intolerancias alimentarias..." />
              </div>
              <div className="cm-field">
                <label>Alergias Alimentarias</label>
                <textarea rows={2} value={historia.alergias}
                  onChange={e => setH('alergias', e.target.value)}
                  placeholder="Alergias alimentarias..." />
              </div>
            </div>
          </div>

          <div className="cm-tab-actions">
            <button className="cm-btn cm-btn-secondary"
              onClick={() => handleTabChange('metricas')}>
              <i className="fa fa-arrow-left" /> Anterior
            </button>
            <button className="cm-btn cm-btn-secondary"
              onClick={() => setHistoria(INIT_HISTORIA)}>
              <i className="fa fa-eraser" /> Limpiar
            </button>
            <button className="cm-btn cm-btn-primary"
              onClick={() => mutGuardarHistoria.mutate()}
              disabled={mutGuardarHistoria.isPending}>
              <i className="fa fa-save" /> {mutGuardarHistoria.isPending ? 'Guardando...' : 'Guardar Historia'}
            </button>
            <button className="cm-btn cm-btn-next"
              onClick={() => handleTabChange('evaluacion')}>
              Evaluación <i className="fa fa-arrow-right" />
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 3: EVALUACIÓN CUANTITATIVA ─────────────────────────────── */}
      {activeTab === 'evaluacion' && (
        <div className="cm-tab-content">
          {[
            { key: 'desayuno' as const, label: 'Desayuno', emoji: '🌅' },
            { key: 'meriendaAM' as const, label: 'Merienda AM', emoji: '🍎' },
            { key: 'almuerzo' as const, label: 'Almuerzo', emoji: '🍽️' },
            { key: 'meriendaPM' as const, label: 'Merienda PM', emoji: '🥪' },
            { key: 'cena' as const, label: 'Cena', emoji: '🌙' },
          ].map(t => (
            <div key={t.key} className="cm-card cm-eval-card">
              <h4 className="cm-card-title">{t.emoji} {t.label}</h4>
              <textarea rows={3} value={evaluacion[t.key]}
                onChange={e => setE(t.key, e.target.value)}
                placeholder={`Describe el consumo habitual en ${t.label.toLowerCase()}...`}
              />
            </div>
          ))}

          <div className="cm-tab-actions">
            <button className="cm-btn cm-btn-secondary"
              onClick={() => handleTabChange('historia')}>
              <i className="fa fa-arrow-left" /> Anterior
            </button>
            <button className="cm-btn cm-btn-secondary"
              onClick={() => setEvaluacion(INIT_EVALUACION)}>
              <i className="fa fa-eraser" /> Limpiar
            </button>
            <button className="cm-btn cm-btn-primary"
              onClick={() => mutGuardarEvaluacion.mutate()}
              disabled={mutGuardarEvaluacion.isPending}>
              <i className="fa fa-save" /> {mutGuardarEvaluacion.isPending ? 'Guardando...' : 'Guardar Evaluación'}
            </button>
            <button className="cm-btn cm-btn-next"
              onClick={() => handleTabChange('analisis')}>
              Análisis <i className="fa fa-arrow-right" />
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 4: ANÁLISIS BIOQUÍMICOS ─────────────────────────────────── */}
      {activeTab === 'analisis' && (
        <div className="cm-tab-content">
          <div className="cm-card">
            <h4 className="cm-card-title"><i className="fa fa-calendar" /> Fecha del Análisis</h4>
            <div className="cm-field" style={{ maxWidth: 220 }}>
              <label>Fecha <span className="cm-req">*</span></label>
              <input type="date" value={analisis.fechaAnalisis}
                onChange={e => setA('fechaAnalisis', e.target.value)} />
            </div>
          </div>

          <div className="cm-card">
            <h4 className="cm-card-title"><i className="fa fa-tint" /> Hemograma</h4>
            <div className="cm-grid-3">
              <div className="cm-field">
                <label>Hemoglobina (g/dl)</label>
                <input type="number" step="0.1" value={analisis.hemoglobina}
                  onChange={e => setA('hemoglobina', e.target.value)} />
              </div>
              <div className="cm-field">
                <label>Hematocrito (%)</label>
                <input type="number" step="0.1" value={analisis.hematocrito}
                  onChange={e => setA('hematocrito', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="cm-card">
            <h4 className="cm-card-title"><i className="fa fa-flask" /> Perfil Lipídico</h4>
            <div className="cm-grid-3">
              {[
                { key: 'colesterolTotal' as const, label: 'Colesterol Total (mg/dl)' },
                { key: 'hdl' as const, label: 'HDL (mg/dl)' },
                { key: 'ldl' as const, label: 'LDL (mg/dl)' },
                { key: 'trigliceridos' as const, label: 'Triglicéridos (mg/dl)' },
              ].map(f => (
                <div key={f.key} className="cm-field">
                  <label>{f.label}</label>
                  <input type="number" step="0.1" value={analisis[f.key]}
                    onChange={e => setA(f.key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <div className="cm-card">
            <h4 className="cm-card-title"><i className="fa fa-bar-chart" /> Otros Indicadores</h4>
            <div className="cm-grid-3">
              {[
                { key: 'glicemia' as const, label: 'Glicemia (mg/dl)' },
                { key: 'acidoUrico' as const, label: 'Ácido Úrico (mg/dl)' },
                { key: 'albumina' as const, label: 'Albúmina (g/dl)' },
                { key: 'creatinina' as const, label: 'Creatinina (mg/dl)' },
              ].map(f => (
                <div key={f.key} className="cm-field">
                  <label>{f.label}</label>
                  <input type="number" step="0.01" value={analisis[f.key]}
                    onChange={e => setA(f.key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <div className="cm-card">
            <h4 className="cm-card-title"><i className="fa fa-medkit" /> Función Tiroidea</h4>
            <div className="cm-grid-3">
              {[
                { key: 'tsh' as const, label: 'TSH (μUI/ml)' },
                { key: 't4' as const, label: 'T4 (μg/dl)' },
                { key: 't3' as const, label: 'T3 (ng/dl)' },
              ].map(f => (
                <div key={f.key} className="cm-field">
                  <label>{f.label}</label>
                  <input type="number" step="0.01" value={analisis[f.key]}
                    onChange={e => setA(f.key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <div className="cm-card">
            <h4 className="cm-card-title"><i className="fa fa-sun-o" /> Vitaminas</h4>
            <div className="cm-grid-3">
              <div className="cm-field">
                <label>Vitamina D (ng/ml)</label>
                <input type="number" step="0.1" value={analisis.vitaminaD}
                  onChange={e => setA('vitaminaD', e.target.value)} />
              </div>
              <div className="cm-field">
                <label>Vitamina B12 (pg/ml)</label>
                <input type="number" step="0.1" value={analisis.vitaminaB12}
                  onChange={e => setA('vitaminaB12', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="cm-card">
            <h4 className="cm-card-title"><i className="fa fa-comment" /> Observaciones</h4>
            <div className="cm-field">
              <textarea rows={3} value={analisis.observaciones}
                onChange={e => setA('observaciones', e.target.value)}
                placeholder="Observaciones adicionales sobre el análisis..." />
            </div>
          </div>

          <div className="cm-tab-actions">
            <button className="cm-btn cm-btn-secondary"
              onClick={() => handleTabChange('evaluacion')}>
              <i className="fa fa-arrow-left" /> Anterior
            </button>
            <button className="cm-btn cm-btn-secondary"
              onClick={() => setAnalisis(INIT_ANALISIS)}>
              <i className="fa fa-eraser" /> Limpiar
            </button>
            <button className="cm-btn cm-btn-primary"
              onClick={() => mutGuardarAnalisis.mutate()}
              disabled={mutGuardarAnalisis.isPending}>
              <i className="fa fa-save" /> {mutGuardarAnalisis.isPending ? 'Guardando...' : 'Guardar Análisis'}
            </button>
            <button className="cm-btn cm-btn-next"
              onClick={() => handleTabChange('padecimientos')}>
              Padecimientos <i className="fa fa-arrow-right" />
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 5: PADECIMIENTOS ────────────────────────────────────────── */}
      {activeTab === 'padecimientos' && (
        <div className="cm-tab-content">
          <div className="cm-card">
            <h4 className="cm-card-title"><i className="fa fa-plus-circle" /> Asignar Padecimiento</h4>
            <div className="cm-pad-assign-row">
              <select value={padSelected} onChange={e => setPadSelected(e.target.value)}
                className="cm-pad-select">
                <option value="">-- Seleccione un padecimiento --</option>
                {padecimientosDisp.map(p => (
                  <option key={p.Id_Padecimiento} value={p.Id_Padecimiento}>
                    {p.Descripcion}
                  </option>
                ))}
              </select>
              <button className="cm-btn cm-btn-primary"
                onClick={() => mutAsignarPadecimiento.mutate()}
                disabled={mutAsignarPadecimiento.isPending || !padSelected}>
                <i className="fa fa-plus" /> Asignar
              </button>
            </div>
          </div>

          <div className="cm-card">
            <h4 className="cm-card-title"><i className="fa fa-list" /> Padecimientos Asignados</h4>
            {padecimientosAsig.length === 0 ? (
              <p className="cm-empty-msg">No hay padecimientos asignados</p>
            ) : (
              <table className="cm-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Padecimiento</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {padecimientosAsig.map((p, idx) => (
                    <tr key={p.Id_Padecimiento}>
                      <td>{idx + 1}</td>
                      <td>{p.Descripcion}</td>
                      <td>
                        <button className="cm-btn-sm cm-btn-delete"
                          onClick={() => {
                            if (window.confirm('¿Eliminar este padecimiento?'))
                              mutEliminarPadecimiento.mutate(p.Id_Padecimiento);
                          }}>
                          <i className="fa fa-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="cm-tab-actions">
            <button className="cm-btn cm-btn-secondary"
              onClick={() => handleTabChange('analisis')}>
              <i className="fa fa-arrow-left" /> Anterior
            </button>
            <button
              className={`cm-btn cm-btn-open-calc ${showCalc ? 'cm-btn-open-calc--active' : ''}`}
              onClick={() => {
                setShowCalc(v => !v);
                if (!showCalc) { recalcularGEB(); recalcularPesoIdeal(); }
              }}
            >
              <i className="fa fa-calculator" />
              {showCalc ? ' Cerrar Calculadora' : ' Abrir Calculadora Nutricional'}
            </button>
          </div>
        </div>
      )}

      {/* ── CALCULADORA NUTRICIONAL (flotante, todas las tabs) ───────────── */}
      <div className={`cm-calc-panel ${showCalc ? 'cm-calc-open' : ''}`}>
        <div className="cm-calc-handle">
          <span className="cm-calc-handle-title">
            <i className="fa fa-calculator" /> Calculadora Nutricional
          </span>
          <button className="cm-calc-arrow"
            onClick={() => {
              setShowCalc(v => !v);
              if (!showCalc) { recalcularGEB(); recalcularPesoIdeal(); }
            }}
            title={showCalc ? 'Cerrar calculadora' : 'Abrir calculadora'}
          >
            <i className={`fa ${showCalc ? 'fa-chevron-down' : 'fa-chevron-up'}`} />
          </button>
        </div>

        {showCalc && (
          <div className="cm-calc-body">
            {/* PASO 1: Peso Ideal */}
            <div className="cm-calc-step">
              <h5 className="cm-calc-step-title">Paso 1 — Peso Ideal</h5>
              <div className="cm-grid-3">
                <div className="cm-field">
                  <label>Estatura (m)</label>
                  <input type="number" readOnly
                    value={metricas.estatura ? (parseFloat(metricas.estatura) / 100).toFixed(2) : ''} />
                </div>
                <div className="cm-field">
                  <label>Circ. Muñeca (cm)</label>
                  <input type="number" step="0.1"
                    value={calc.factorEstructura === 'Personalizado' ? calc.factorPersonalizado : metricas.muneca}
                    onChange={e => {
                      const muneca = parseFloat(e.target.value);
                      const est = parseFloat(metricas.estatura);
                      if (muneca > 0 && est > 0) {
                        const factor = est / muneca;
                        setCalc(c => ({ ...c, factorPersonalizado: String(Math.round(factor * 100) / 100) }));
                      }
                    }}
                    placeholder="cm" />
                </div>
                <div className="cm-field">
                  <label>Factor de Estructura</label>
                  <select value={calc.factorEstructura}
                    onChange={e => {
                      setC('factorEstructura', e.target.value);
                      setTimeout(recalcularPesoIdeal, 0);
                    }}>
                    <option>Pequeña</option><option>Mediana</option>
                    <option>Grande</option><option>Muy Grande</option>
                    <option value="Personalizado">Otro (por muñeca)</option>
                  </select>
                </div>
              </div>
              <div className="cm-calc-result">
                <label>Peso Ideal</label>
                <span className="cm-calc-val">
                  {calc.pesoIdeal != null ? `${calc.pesoIdeal.toFixed(1)} kg` : '—'}
                </span>
                <button className="cm-btn cm-btn-calcular"
                  onClick={recalcularPesoIdeal}>
                  <i className="fa fa-calculator" /> Calcular
                </button>
              </div>
            </div>

            {/* PASO 2: GEB */}
            <div className="cm-calc-step">
              <h5 className="cm-calc-step-title">Paso 2 — GEB (Gasto Energético Basal)</h5>
              <div className="cm-grid-3">
                <div className="cm-field">
                  <label>Fórmula</label>
                  <select value={calc.formulaGEB}
                    onChange={e => { setC('formulaGEB', e.target.value); setTimeout(recalcularGEB, 0); }}>
                    <option value="HarrisBenedict">Harris-Benedict</option>
                    <option value="FAO_OMS">FAO / OMS (Schofield)</option>
                    <option value="Mifflin">Mifflin-St Jeor</option>
                    <option value="Cunningham">Cunningham (requiere % grasa)</option>
                    <option value="Valencia">Valencia Mexicana</option>
                  </select>
                  <p className="cm-formula-desc">
                    <i className="fa fa-info-circle" /> {GEB_DESCRIPTIONS[calc.formulaGEB]}
                  </p>
                </div>
                <div className="cm-field">
                  <label>Peso actual</label>
                  <input type="number" readOnly value={metricas.peso} />
                </div>
                <div className="cm-field">
                  <label>Estatura (cm)</label>
                  <input type="number" readOnly value={metricas.estatura} />
                </div>
                <div className="cm-field">
                  <label>Edad</label>
                  <input type="number" readOnly
                    value={usuario ? calcEdad(usuario.FechaNacimiento) : ''} />
                </div>
                <div className="cm-field">
                  <label>Sexo</label>
                  <input type="text" readOnly value={usuario?.Sexo ?? ''} />
                </div>
                {calc.formulaGEB === 'Cunningham' && (
                  <div className="cm-field">
                    <label>Masa libre de grasa (kg)</label>
                    <input type="number" readOnly
                      value={
                        metricas.peso && metricas.grasaPct
                          ? (parseFloat(metricas.peso) * (1 - parseFloat(metricas.grasaPct) / 100)).toFixed(1)
                          : ''
                      } />
                  </div>
                )}
              </div>
              <div className="cm-calc-result">
                <label>GEB</label>
                <span className="cm-calc-val">
                  {calc.geb != null ? `${Math.round(calc.geb)} kcal/día` : '—'}
                </span>
                <button className="cm-btn cm-btn-calcular" onClick={recalcularGEB}>
                  <i className="fa fa-calculator" /> Calcular
                </button>
              </div>
            </div>

            {/* PASO 3: REE */}
            <div className="cm-calc-step">
              <h5 className="cm-calc-step-title">Paso 3 — REE (Requerimiento Energético)</h5>
              <div className="cm-grid-3">
                <div className="cm-field">
                  <label>Factor de Actividad</label>
                  <select value={calc.factorActividad}
                    onChange={e => { setC('factorActividad', e.target.value); setTimeout(recalcularGEB, 0); }}>
                    <option value="1.2">Sedentario (1.2)</option>
                    <option value="1.375">Ligero (1.375)</option>
                    <option value="1.55">Moderado (1.55)</option>
                    <option value="1.725">Fuerte (1.725)</option>
                    <option value="1.9">Muy Fuerte (1.9)</option>
                  </select>
                </div>
                <div className="cm-field">
                  <label>REE calculado</label>
                  <input type="number" readOnly
                    value={calc.reeCalculado != null ? Math.round(calc.reeCalculado) : ''} />
                </div>
                <div className="cm-field">
                  <label>REE ajustado (editable)</label>
                  <input type="number" value={calc.reeEditable}
                    onChange={e => setC('reeEditable', e.target.value)}
                    placeholder="Ajustar según criterio clínico" />
                </div>
              </div>
              <button className="cm-btn cm-btn-restaurar"
                onClick={() => setC('reeEditable', String(calc.reeCalculado != null ? Math.round(calc.reeCalculado) : ''))}>
                <i className="fa fa-undo" /> Restaurar calculado
              </button>
            </div>

            {/* PASO 4: Distribución de Macros */}
            <div className="cm-calc-step">
              <h5 className="cm-calc-step-title">Paso 4 — Distribución de Macronutrientes</h5>
              <div className="cm-grid-3">
                <div className="cm-field">
                  <label>% Carbohidratos</label>
                  <input type="number" min="0" max="100" value={calc.pctCHO}
                    onChange={e => setC('pctCHO', e.target.value)} placeholder="%" />
                </div>
                <div className="cm-field">
                  <label>% Proteínas</label>
                  <input type="number" min="0" max="100" value={calc.pctProt}
                    onChange={e => setC('pctProt', e.target.value)} placeholder="%" />
                </div>
                <div className="cm-field">
                  <label>% Grasas</label>
                  <input type="number" min="0" max="100" value={calc.pctGrasa}
                    onChange={e => setC('pctGrasa', e.target.value)} placeholder="%" />
                </div>
              </div>
              {Math.abs(totalPct - 100) > 0.1 && totalPct > 0 && (
                <div className="cm-alert cm-alert-warning">
                  <i className="fa fa-exclamation-triangle" /> Los porcentajes suman {totalPct.toFixed(1)}% (deben sumar 100%)
                </div>
              )}
              <div className="cm-field mt-2">
                <label>Peso de Referencia</label>
                <div className="cm-peso-ref-row">
                  <select value={calc.tipoPesoRef}
                    onChange={e => setC('tipoPesoRef', e.target.value)}>
                    <option value="Ideal">Peso Ideal</option>
                    <option value="Actual">Peso Actual</option>
                    <option value="Personalizado">Personalizado</option>
                  </select>
                  {calc.tipoPesoRef === 'Personalizado' && (
                    <input type="number" step="0.1" value={calc.pesoPersonalizado}
                      onChange={e => setC('pesoPersonalizado', e.target.value)}
                      placeholder="kg" style={{ width: 80 }} />
                  )}
                  <span className="cm-peso-ref-val">{pesoRef.toFixed(1)} kg</span>
                </div>
              </div>
              {ree > 0 && totalPct > 0 && (
                <table className="cm-macro-table">
                  <thead>
                    <tr><th>Macronutriente</th><th>Kcal</th><th>Gramos</th><th>g/kg/día</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Carbohidratos</td>
                      <td>{Math.round(kcalCHO)}</td>
                      <td>{gramsCHO.toFixed(1)}</td>
                      <td>{gkgCHO.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Proteínas</td>
                      <td>{Math.round(kcalProt)}</td>
                      <td>{gramsProt.toFixed(1)}</td>
                      <td>{gkgProt.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Grasas</td>
                      <td>{Math.round(kcalGrasa)}</td>
                      <td>{gramsGrasa.toFixed(1)}</td>
                      <td>{gkgGrasa.toFixed(2)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td><strong>Total</strong></td>
                      <td><strong>{Math.round(ree)}</strong></td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* PASO 5: Distribución por Tiempos */}
            <div className="cm-calc-step">
              <button className="cm-collapsible-btn"
                onClick={() => setShowDistTiempos(v => !v)}>
                <i className={`fa ${showDistTiempos ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
                &nbsp; Paso 5 — Distribución por Tiempos de Comida
              </button>
              {showDistTiempos && ree <= 0 && (
                <div className="cm-alert cm-alert-warning" style={{ marginTop: 10 }}>
                  <i className="fa fa-exclamation-triangle" /> <strong>Primero calculá el REE</strong> (Pasos 2 y 3) para poder distribuir por tiempos.
                </div>
              )}
              {showDistTiempos && ree > 0 && Math.abs(totalPct - 100) > 0.1 && totalPct > 0 && (
                <div className="cm-alert cm-alert-warning" style={{ marginTop: 10 }}>
                  <i className="fa fa-exclamation-triangle" /> <strong>Los porcentajes de macros deben sumar 100%</strong> (actualmente suman {totalPct.toFixed(1)}%). Completá el Paso 4 primero.
                </div>
              )}
              {showDistTiempos && ree > 0 && Math.abs(totalPct - 100) <= 0.1 && (
                <div className="cm-dist-body">
                  <div className="cm-field mb-2">
                    <label>Meta de Fibra (g/día)</label>
                    <input type="number" style={{ width: 80 }} value={calc.metaFibra}
                      onChange={e => setC('metaFibra', e.target.value)} />
                  </div>
                  <div className="cm-dist-table-wrap">
                    <table className="cm-dist-table">
                      <thead>
                        <tr>
                          <th>Tiempo</th><th>CHO (g)</th><th>Prot (g)</th>
                          <th>Grasa (g)</th><th>Fibra (g)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tiemposKeys.map((k, i) => (
                          <tr key={TIEMPOS[i]}>
                            <td>{EMOJIS_TIEMPOS[i]} {TIEMPOS[i]}</td>
                            {(['cho', 'prot', 'grasa', 'fibra'] as const).map(mac => (
                              <td key={mac}>
                                <input
                                  type="number" step="0.1" className="cm-dist-input"
                                  value={calc[k[mac]] as string}
                                  onChange={e => setC(k[mac], e.target.value)}
                                  onKeyDown={e => {
                                    const allInputs = document.querySelectorAll<HTMLInputElement>('.cm-dist-input');
                                    const idx = Array.from(allInputs).indexOf(e.currentTarget);
                                    if (e.key === 'ArrowDown' && idx + 4 < allInputs.length) {
                                      e.preventDefault(); allInputs[idx + 4].focus();
                                    }
                                    if (e.key === 'ArrowUp' && idx - 4 >= 0) {
                                      e.preventDefault(); allInputs[idx - 4].focus();
                                    }
                                  }}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td><strong>Total</strong></td>
                          {[
                            { total: totalDistCHO, meta: gramsCHO, dif: difCHO },
                            { total: totalDistProt, meta: gramsProt, dif: difProt },
                            { total: totalDistGrasa, meta: gramsGrasa, dif: difGrasa },
                            { total: totalDistFibra, meta: metaFibraNum, dif: Math.round(totalDistFibra - metaFibraNum) },
                          ].map((col, i) => {
                            const cls = Math.abs(col.dif) < 2
                              ? 'cm-badge-ok'
                              : col.dif > 0 ? 'cm-badge-over' : 'cm-badge-under';
                            return (
                              <td key={i}>
                                <span className={`cm-badge ${cls}`}>{col.total.toFixed(1)}g</span>
                                {Math.abs(col.dif) >= 2 && (
                                  <span className={`cm-badge ${cls}`} style={{ marginLeft: 4 }}>
                                    {col.dif > 0 ? '+' : ''}{col.dif}g
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="cm-dist-actions">
                    <button className="cm-btn cm-btn-secondary"
                      onClick={() => {
                        if (window.confirm('¿Limpiar la distribución?')) {
                          setCalc(c => ({
                            ...c,
                            desayunoCHO: '', desayunoProt: '', desayunoGrasa: '', desayunoFibra: '',
                            meriendaAMCHO: '', meriendaAMProt: '', meriendaAMGrasa: '', meriendaAMFibra: '',
                            almuerzoCHO: '', almuerzoProt: '', almuerzoGrasa: '', almuerzoFibra: '',
                            meriendaPMCHO: '', meriendaPMProt: '', meriendaPMGrasa: '', meriendaPMFibra: '',
                            cenaCHO: '', cenaProt: '', cenaGrasa: '', cenaFibra: '',
                          }));
                        }
                      }}>
                      <i className="fa fa-eraser" /> Limpiar
                    </button>
                    <button className="cm-btn cm-btn-secondary"
                      onClick={() => copiarDistribucion(
                        consulta?.NombreUsuario ?? '',
                        TIEMPOS, EMOJIS_TIEMPOS,
                        tiemposKeys.map(k => parseFloat(calc[k.cho] as string) || 0),
                        tiemposKeys.map(k => parseFloat(calc[k.prot] as string) || 0),
                        tiemposKeys.map(k => parseFloat(calc[k.grasa] as string) || 0),
                        tiemposKeys.map(k => parseFloat(calc[k.fibra] as string) || 0),
                        totalDistCHO, totalDistProt, totalDistGrasa,
                      )}>
                      <i className="fa fa-clipboard" /> Copiar
                    </button>
                    <button className="cm-btn cm-btn-primary"
                      onClick={() => mutGuardarDistribucion.mutate()}
                      disabled={mutGuardarDistribucion.isPending}>
                      <i className="fa fa-file-pdf-o" />
                      &nbsp; {mutGuardarDistribucion.isPending ? 'Generando...' : 'Guardar y Generar PDF'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Finalizar Consulta ─────────────────────────────────────── */}
            <div className="cm-calc-step cm-calc-step--finalizar">
              <h5 className="cm-calc-step-title">
                <i className="fa fa-check-circle" /> ¿Listo para finalizar la consulta?
              </h5>
              <p className="cm-finalizar-desc">
                Al completar la consulta se marcará como <strong>Finalizada</strong> y solo podrá visualizarse en modo lectura.
              </p>
              <div className="cm-finalizar-actions">
                <button
                  className="cm-btn cm-btn-secondary"
                  onClick={() => navigate(-1)}>
                  <i className="fa fa-arrow-left" /> Regresar sin Completar
                </button>
                <button
                  className="cm-btn cm-btn-success"
                  onClick={() => {
                    if (window.confirm('¿Marcar esta consulta como finalizada? Esta acción no se puede deshacer.')) {
                      mutFinalizarConsulta.mutate();
                    }
                  }}
                  disabled={mutFinalizarConsulta.isPending}>
                  <i className="fa fa-check-circle" />
                  &nbsp; {mutFinalizarConsulta.isPending ? 'Finalizando...' : 'Completar Consulta y Marcar como Finalizada'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletarMetricas;
