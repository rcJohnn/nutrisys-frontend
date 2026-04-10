import { apiClient } from './client';

export interface ProgresoConsulta {
  Fecha: string;
  Peso: number | null;
  IMC: number | null;
  Grasa: number | null;
  Musculo: number | null;
  Cintura: number | null;
  Cadera: number | null;
  Sistolica: number | null;
  Diastolica: number | null;
  Observaciones: string;
  Recomendaciones: string;
  Medico: string;
}

export interface ProgresoBioquimico {
  Fecha: string;
  Hemoglobina: number | null;
  Hematocrito: number | null;
  ColesterolTotal: number | null;
  HDL: number | null;
  LDL: number | null;
  Trigliceridos: number | null;
  Glicemia: number | null;
  AcidoUrico: number | null;
  Albumina: number | null;
  Creatinina: number | null;
  TSH: number | null;
  VitaminaD: number | null;
  VitaminaB12: number | null;
  Observaciones: string;
}

export interface ProgresoHistoria {
  Objetivos: string;
  CalidadSueno: string;
  FuncionIntestinal: string;
  Fuma: boolean;
  Alcohol: boolean;
  FrecuenciaAlcohol: string;
  ActividadFisica: string;
  Medicamentos: string;
  Agua: string;
  Intolerancias: string;
  Alergias: string;
}

export const getConsultas = async (idUsuario: number): Promise<ProgresoConsulta[]> => {
  const { data } = await apiClient.get(`/Progreso/consultas?idUsuario=${idUsuario}`);
  return data;
};

export const getBioquimicos = async (idUsuario: number): Promise<ProgresoBioquimico[]> => {
  const { data } = await apiClient.get(`/Progreso/bioquimicos?idUsuario=${idUsuario}`);
  return data;
};

export const getHistoria = async (idUsuario: number): Promise<ProgresoHistoria[]> => {
  const { data } = await apiClient.get(`/Progreso/historia?idUsuario=${idUsuario}`);
  return data;
};
