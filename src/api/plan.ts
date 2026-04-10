import { apiClient } from './client';

export interface AlimentoDisponible {
  Id_Alimento: number;
  Nombre: string;
  Categoria: string;
  Energia_kcal: number;
}

export interface GenerarPlanRequest {
  IdUsuario: number;
  TiempoComida: string;
  MetaCarbohidratos: number;
  MetaProteina: number;
  MetaGrasa: number;
  MetaFibra: number;
  EsVegano: boolean;
}

export interface AlimentoSeleccionado {
  Id_Alimento: number;
  Nombre: string;
  Categoria: string;
  Porcion_g: number;
  Energia_kcal: number;
}

export interface PlanNutricionalResponse {
  Alimentos: AlimentoSeleccionado[];
  TotalCarbohidratos: number;
  TotalProteina: number;
  TotalGrasa: number;
  TotalFibra: number;
  TotalEnergia: number;
}

export const getAlimentosDisponibles = async (idUsuario: number, tiempoComida: string) => {
  const resp = await apiClient.get(`/PlanNutricional/alimentos`, {
    params: { idUsuario, tiempoComida },
  });
  // backend returns a list-like payload
  return resp.data as AlimentoDisponible[];
};

export const generarPlan = async (payload: GenerarPlanRequest) => {
  const resp = await apiClient.post('/PlanNutricional/generar', payload);
  return resp.data as PlanNutricionalResponse;
};

export const generarPlanConFiltro = async (payload: any) => {
  const resp = await apiClient.post('/PlanNutricional/generar-con-filtro', payload);
  return resp.data as PlanNutricionalResponse;
};
