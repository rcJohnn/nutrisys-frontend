import { apiClient } from './client';

// ── Types Historia Clínica principal (datos estables) ──────────────────────

export interface HistoriaClinicaResponse {
  Id_Historia: number;
  Id_Usuario: number;
  Fuma: boolean;
  Consume_Alcohol: boolean;
  Frecuencia_Alcohol: string;
  Embarazo: boolean;
  Lactancia: boolean;
  Intolerancias: string;
  Alergias_Alimentarias: string;
}

export interface SaveHistoriaClinicaData {
  Fuma: boolean;
  Consume_Alcohol: boolean;
  Frecuencia_Alcohol: string;
  Embarazo: boolean;
  Lactancia: boolean;
  Intolerancias: string;
  Alergias_Alimentarias: string;
  IdUsuario_Modificacion?: number;
}

// ── Types Análisis Bioquímico ───────────────────────────────────────────────

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

// ── Historia Clínica ────────────────────────────────────────────────────────

export const getHistoriaClinica = async (idUsuario: number): Promise<HistoriaClinicaResponse | null> => {
  try {
    const response = await apiClient.get(`/HistoriaClinica/${idUsuario}`);
    return response.data as HistoriaClinicaResponse;
  } catch {
    return null;
  }
};

export const updateHistoriaClinica = async (idUsuario: number, data: SaveHistoriaClinicaData): Promise<any> => {
  const response = await apiClient.put(`/HistoriaClinica/${idUsuario}`, { Id_Usuario: idUsuario, ...data });
  return response.data;
};

// ── Análisis Bioquímico ─────────────────────────────────────────────────────

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
