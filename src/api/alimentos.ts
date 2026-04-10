import { apiClient } from './client';

export interface AlimentoResponse {
  Id_Alimento: number;
  Nombre: string;
  Categoria: string;
  Macrogrupo: string;
  Marca: string;
  Energia_kcal: number;
  Proteina_g: number;
  Grasa_g: number;
  Carbohidratos_g: number;
  Fibra_g: number;
}

export interface AlimentoFilterRequest {
  nombre?: string;
}

export const getAlimentos = async (filter?: AlimentoFilterRequest): Promise<AlimentoResponse[]> => {
  const params = new URLSearchParams();
  if (filter?.nombre) params.append('nombre', filter.nombre);
  const query = params.toString();
  const url = query ? `/Alimentos?${query}` : '/Alimentos';
  const response = await apiClient.get(url);
  return response.data as AlimentoResponse[];
};

export const getAlimentoById = async (id: number): Promise<any> => {
  const response = await apiClient.get(`/Alimentos/${id}`);
  return response.data;
};

export interface CreateAlimentoRequest {
  Nombre: string;
  Energia_kcal: number;
  Proteina_g: number;
  Grasa_g: number;
  Carbohidratos_g: number;
  Fibra_g: number;
  Calcio_mg: number;
  Fosforo_mg: number;
  Hierro_mg: number;
  Potasio_mg: number;
  Zinc_mg: number;
  Magnesio_mg: number;
  Sodio_mg: number;
  Tiamina_mg: number;
  Riboflavina_mg: number;
  Niacina_mg: number;
  Vit_B6_mg: number;
  Vit_B12_ug: number;
  Vit_C_mg: number;
  Vit_A_ug: number;
  Ac_Folico_ug: number;
  Folato_ug: number;
  Agua_g: number;
  Ceniza_g: number;
  Colesterol_mg: number;
  Ac_Grasos_Saturados_g: number;
  Ac_Grasos_Monoinsaturados_g: number;
  Ac_Grasos_Poliinsaturados_g: number;
  Categoria: string;
  Macrogrupo: string;
  Marca: string;
  Presentacion: string;
}

export const createAlimento = async (data: CreateAlimentoRequest): Promise<any> => {
  const response = await apiClient.post('/Alimentos', data);
  return response.data;
};
