import { apiClient } from './client';

// ── Types ───────────────────────────────────────────

export interface HistoriaClinicaResponse {
  Id_Historia: number;
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

export interface SaveHistoriaClinicaData {
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
  Id_Historia?: number;
  IdUsuario_Modificacion?: number;
}

export interface EvaluacionCuantitativaItem {
  Id_Evaluacion: number;
  Id_Usuario: number;
  Tiempo_Comida: string;
  Consumo_Usual: string;
}

export interface EvaluacionItemData {
  Tiempo_Comida: string;
  Consumo_Usual: string;
}

export interface SaveEvaluacionCuantitativaData {
  Evaluaciones: EvaluacionItemData[];
}

export interface AnalisisBioquimicoResponse {
  Id_Analisis: number;
  Id_Usuario: number;
  Fecha_Analisis: string;
  Hemoglobina: number | null;
  Hematocrito: number | null;
  Colesterol_Total: number | null;
  HDL: number | null;
  LDL: number | null;
  Trigliceridos: number | null;
  Glicemia: number | null;
  Acido_Urico: number | null;
  Albumina: number | null;
  Nitrogeno_Ureico: number | null;
  Creatinina: number | null;
  TSH: number | null;
  T4: number | null;
  T3: number | null;
  Vitamina_D: number | null;
  Vitamina_B12: number | null;
  Observaciones: string;
}

export interface SaveAnalisisBioquimicoData {
  Fecha_Analisis: string;
  Hemoglobina: number | null;
  Hematocrito: number | null;
  Colesterol_Total: number | null;
  HDL: number | null;
  LDL: number | null;
  Trigliceridos: number | null;
  Glicemia: number | null;
  Acido_Urico: number | null;
  Albumina: number | null;
  Nitrogeno_Ureico: number | null;
  Creatinina: number | null;
  TSH: number | null;
  T4: number | null;
  T3: number | null;
  Vitamina_D: number | null;
  Vitamina_B12: number | null;
  Observaciones: string;
}

// ── Historia Clínica ────────────────────────────────

export const getHistoriaClinica = async (idUsuario: number): Promise<HistoriaClinicaResponse> => {
  const response = await apiClient.get(`/HistoriaClinica/${idUsuario}`);
  return response.data as HistoriaClinicaResponse;
};

export const saveHistoriaClinica = async (data: SaveHistoriaClinicaData & { Id_Usuario: number }): Promise<any> => {
  const { Id_Historia, IdUsuario_Modificacion, ...rest } = data;
  const response = await apiClient.post('/HistoriaClinica', rest);
  return response.data;
};

export const updateHistoriaClinica = async (idUsuario: number, data: SaveHistoriaClinicaData): Promise<any> => {
  const response = await apiClient.put(`/HistoriaClinica/${idUsuario}`, data);
  return response.data;
};

// ── Evaluación Cuantitativa ─────────────────────────

export const getEvaluacionCuantitativa = async (usuarioId: number): Promise<EvaluacionCuantitativaItem[]> => {
  const response = await apiClient.get('/EvaluacionCuantitativa', {
    params: { usuarioId },
  });
  return response.data as EvaluacionCuantitativaItem[];
};

export const saveEvaluacionCuantitativaBatch = async (data: SaveEvaluacionCuantitativaData & { Id_Usuario: number }): Promise<any> => {
  const response = await apiClient.post('/EvaluacionCuantitativa/batch', data);
  return response.data;
};

// ── Análisis Bioquímico ─────────────────────────────

export const getAnalisisBioquimicoList = async (idUsuario: number): Promise<AnalisisBioquimicoResponse[]> => {
  const response = await apiClient.get('/AnalisisBioquimico', {
    params: { idUsuario },
  });
  return response.data as AnalisisBioquimicoResponse[];
};

export const saveAnalisisBioquimico = async (data: SaveAnalisisBioquimicoData & { Id_Usuario: number; IdUsuario_Registro: number }): Promise<any> => {
  const response = await apiClient.post('/AnalisisBioquimico', data);
  return response.data;
};
