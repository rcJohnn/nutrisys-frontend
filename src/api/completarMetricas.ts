import { apiClient } from './client';

// ── Métricas ───────────────────────────────────────────────────────────────

export interface CompletarMetricasPayload {
  Peso_kg: number;
  Estatura_cm: number;
  IMC: number;
  Grasa_g?: number;
  Musculo_g?: number;
  Circunferencia_Cintura_cm?: number;
  Circunferencia_Cadera_cm?: number;
  Presion_Arterial_Sistolica: number;
  Presion_Arterial_Diastolica: number;
  Grasa_Porcentaje?: number;
  Circunferencia_Muneca_cm?: number;
  Agua_Corporal_Pct?: number;
  Edad_Metabolica?: number;
  Masa_Osea_g?: number;
  Grasa_Visceral?: number;
  Observaciones_Medico?: string;
  Recomendaciones?: string;
}

export const completarMetricas = async (idConsulta: number, payload: CompletarMetricasPayload) => {
  const { data } = await apiClient.post(`/Consultas/${idConsulta}/metricas`, payload);
  return data;
};

export const completarConsultaFinal = async (
  idConsulta: number,
  observaciones: string,
  recomendaciones: string,
  proximaCita: string | null,
) => {
  const { data } = await apiClient.post(`/Consultas/${idConsulta}/completar`, {
    Observaciones_Medico: observaciones,
    Recomendaciones: recomendaciones,
    Proxima_Cita: proximaCita,
  });
  return data;
};

// ── Historia Clínica ───────────────────────────────────────────────────────

export interface HistoriaClinicaData {
  Id_Usuario: number;
  Objetivos_Clinicos: string;
  Calidad_Sueno: string;
  Funcion_Intestinal: string;
  Fuma: boolean;
  Consume_Alcohol: boolean;
  Frecuencia_Alcohol: string;
  Actividad_Fisica: string;
  Medicamentos: string;
  Cirugias_Recientes: string;
  Embarazo: boolean;
  Lactancia: boolean;
  Alimentos_Favoritos: string;
  Alimentos_No_Gustan: string;
  Intolerancias: string;
  Alergias_Alimentarias: string;
  Ingesta_Agua_Diaria: string;
}

export const getHistoriaClinica = async (idUsuario: number): Promise<HistoriaClinicaData | null> => {
  try {
    const { data } = await apiClient.get(`/HistoriaClinica/${idUsuario}`);
    return data;
  } catch {
    return null;
  }
};

export const saveHistoriaClinica = async (payload: HistoriaClinicaData, existe: boolean) => {
  if (existe) {
    const { data } = await apiClient.put(`/HistoriaClinica/${payload.Id_Usuario}`, payload);
    return data;
  }
  const { data } = await apiClient.post('/HistoriaClinica', payload);
  return data;
};

// ── Evaluación Cuantitativa ────────────────────────────────────────────────

export interface EvaluacionItem {
  Tiempo_Comida: string;
  Consumo_Usual: string;
}

export interface EvaluacionCuantitativaData {
  Id_Usuario: number;
  Evaluaciones: EvaluacionItem[];
}

export const getEvaluacionCuantitativa = async (idUsuario: number): Promise<EvaluacionItem[]> => {
  try {
    const { data } = await apiClient.get(`/EvaluacionCuantitativa?idUsuario=${idUsuario}`);
    return data ?? [];
  } catch {
    return [];
  }
};

export const saveEvaluacionCuantitativa = async (idUsuario: number, evaluaciones: EvaluacionItem[]) => {
  const { data } = await apiClient.post('/EvaluacionCuantitativa/batch', { Id_Usuario: idUsuario, Evaluaciones: evaluaciones });
  return data;
};

// ── Análisis Bioquímico ────────────────────────────────────────────────────

export interface AnalisisBioquimicoData {
  Id_Usuario: number;
  Fecha_Analisis: string;
  Hemoglobina?: number;
  Hematocrito?: number;
  Colesterol_Total?: number;
  HDL?: number;
  LDL?: number;
  Trigliceridos?: number;
  Glicemia?: number;
  Acido_Urico?: number;
  Albumina?: number;
  Creatinina?: number;
  TSH?: number;
  T4?: number;
  T3?: number;
  Vitamina_D?: number;
  Vitamina_B12?: number;
  Observaciones?: string;
}

export const getAnalisisBioquimico = async (idUsuario: number): Promise<AnalisisBioquimicoData | null> => {
  try {
    const { data } = await apiClient.get(`/AnalisisBioquimico?idUsuario=${idUsuario}`);
    if (Array.isArray(data) && data.length > 0) return data[data.length - 1];
    return data ?? null;
  } catch {
    return null;
  }
};

export const saveAnalisisBioquimico = async (payload: AnalisisBioquimicoData) => {
  const { data } = await apiClient.post('/AnalisisBioquimico', payload);
  return data;
};

// ── Pliegues Cutáneos ──────────────────────────────────────────────────────

export interface PliegueData {
  Id_Pliegue?: number;
  Id_Consulta: number;
  Tipo_Pliegue: string;
  Valor_mm: number;
}

export const getPliegues = async (idConsulta: number): Promise<PliegueData[]> => {
  try {
    const { data } = await apiClient.get(`/PlieguesCutaneos?idConsulta=${idConsulta}`);
    return data ?? [];
  } catch {
    return [];
  }
};

export const savePliegue = async (payload: PliegueData) => {
  const { data } = await apiClient.post('/PlieguesCutaneos', payload);
  return data;
};

export const deletePliegue = async (idPliegue: number) => {
  await apiClient.delete(`/PlieguesCutaneos/${idPliegue}`);
};

// ── Antropometría ──────────────────────────────────────────────────────────

export interface AntropometriaPayload {
  Id_Consulta: number;
  Circunferencia_Brazo_cm: number;
  Circunferencia_Pantorrilla_cm: number;
  Altura_Rodilla_cm: number;
  Raza: string;
}

export interface AntropometriaResult {
  Antrop_ATB: number;
  Antrop_CMB: number;
  Antrop_AMB: number;
  Antrop_AGB: number;
  Peso_Estimado_kg: number;
  Talla_Estimada_cm: number;
  Edad_Calculada?: number;
  PCT_cm_Usado?: number;
  Circunferencia_Brazo_cm?: number;
  Circunferencia_Pantorrilla_cm?: number;
  Altura_Rodilla_cm?: number;
}

export const calcularAntropometria = async (payload: AntropometriaPayload): Promise<AntropometriaResult> => {
  const { data } = await apiClient.post('/Antropometria', payload);
  return data;
};

export const getAntropometriaConsulta = async (idConsulta: number): Promise<AntropometriaResult | null> => {
  try {
    const { data } = await apiClient.get(`/Antropometria?idConsulta=${idConsulta}`);
    return data ?? null;
  } catch {
    return null;
  }
};

// ── Distribución de Macros ─────────────────────────────────────────────────

export interface DistribucionMacrosPayload {
  Id_Consulta: number;
  Id_Usuario: number;
  Id_Medico: number;
  Formula_Usada: string;
  REE: number;
  CHO_g: number;
  Prot_g: number;
  Grasa_g: number;
  Fibra_g: number;
  Desayuno_CHO_g: number;
  Desayuno_Prot_g: number;
  Desayuno_Grasa_g: number;
  Desayuno_Fibra_g: number;
  MeriendaAM_CHO_g: number;
  MeriendaAM_Prot_g: number;
  MeriendaAM_Grasa_g: number;
  MeriendaAM_Fibra_g: number;
  Almuerzo_CHO_g: number;
  Almuerzo_Prot_g: number;
  Almuerzo_Grasa_g: number;
  Almuerzo_Fibra_g: number;
  MeriendaPM_CHO_g: number;
  MeriendaPM_Prot_g: number;
  MeriendaPM_Grasa_g: number;
  MeriendaPM_Fibra_g: number;
  Cena_CHO_g: number;
  Cena_Prot_g: number;
  Cena_Grasa_g: number;
  Cena_Fibra_g: number;
}

export const saveDistribucionMacros = async (payload: DistribucionMacrosPayload) => {
  const { data } = await apiClient.post('/DistribucionMacros', payload);
  return data;
};

export const getDistribucionMacrosConsulta = async (idConsulta: number) => {
  try {
    const { data } = await apiClient.get(`/DistribucionMacros/consulta/${idConsulta}`);
    return data;
  } catch {
    return null;
  }
};
