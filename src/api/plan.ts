import { apiClient } from './client';

/** Fila de alimento en catálogo / lista nutricional (campos opcionales según endpoint). */
export interface AlimentoNutricional {
  Id_Alimento: number;
  Nombre: string;
  Categoria: string;
  Macrogrupo?: string;
  Marca?: string;
  Presentacion?: string;
  Fraccion_Comestible?: number;
  Energia_kcal: number;
  Proteina_g: number;
  Grasa_g: number;
  Carbohidratos_g: number;
  Fibra_g: number;
  Colesterol_mg?: number;
  Calcio_mg?: number;
  Fosforo_mg?: number;
  Hierro_mg?: number;
  Potasio_mg?: number;
  Zinc_mg?: number;
  Magnesio_mg?: number;
  Sodio_mg?: number;
  Vit_C_mg?: number;
  Vit_A_ug?: number;
  Tiamina_mg?: number;
  Riboflavina_mg?: number;
  Niacina_mg?: number;
  Vit_B6_mg?: number;
  Vit_B12_ug?: number;
  Folato_ug?: number;
  Ac_Folico_ug?: number;
  Ac_Grasos_Saturados_g?: number;
  Ac_Grasos_Monoinsaturados_g?: number;
  Ac_Grasos_Poliinsaturados_g?: number;
  Agua_g?: number;
  Ceniza_g?: number;
}

export type AlimentoDisponible = AlimentoNutricional;

export interface GenerarPlanRequest {
  IdUsuario: number;
  TiempoComida: string;
  MetaCarbohidratos: number;
  MetaProteina: number;
  MetaGrasa: number;
  MetaFibra: number;
  EsVegano: boolean;
}

export interface PlanAlimentoItem {
  Id_Alimento: number;
  Nombre: string;
  Categoria: string;
  Macrogrupo?: string;
  Porcion_g: number;
  Factor_Coccion?: number;
  Carbohidratos_g: number;
  Proteina_g: number;
  Grasa_g: number;
  Fibra_g: number;
  Energia_kcal: number;
}

export interface PlanNutricionalResponse {
  Error?: string;
  TiempoComida?: string;
  Alimentos: PlanAlimentoItem[];
  TotalCarbohidratos: number;
  TotalProteina: number;
  TotalGrasa: number;
  TotalFibra: number;
  TotalEnergia: number;
  MetaCarbohidratos?: number;
  MetaProteina?: number;
  MetaGrasa?: number;
  MetaFibra?: number;
}

export const getAlimentosDisponibles = async (idUsuario: number, tiempoComida: string) => {
  const resp = await apiClient.get(`/PlanNutricional/alimentos`, {
    params: { idUsuario, tiempoComida },
  });
  const data = resp.data;
  return Array.isArray(data) ? (data as AlimentoDisponible[]) : [];
};

/** Catálogo completo para lista / agregar alimento. */
export const getListaAlimentosNutricional = async (): Promise<AlimentoNutricional[]> => {
  const urls = ['/PlanNutricional/lista-alimentos', '/PlanNutricional/alimentos/todos', '/Alimentos'];
  for (const path of urls) {
    try {
      const resp = await apiClient.get(path);
      const data = resp.data;
      if (Array.isArray(data)) return data as AlimentoNutricional[];
    } catch {
      /* siguiente */
    }
  }
  return [];
};

export const generarPlan = async (payload: GenerarPlanRequest) => {
  const resp = await apiClient.post('/PlanNutricional/generar', payload);
  return resp.data as PlanNutricionalResponse;
};

export interface GenerarPlanConFiltroRequest extends GenerarPlanRequest {
  alimentosPermitidos: number[];
}

export const generarPlanConFiltro = async (payload: GenerarPlanConFiltroRequest) => {
  const { alimentosPermitidos, ...rest } = payload;
  const body = {
    ...rest,
    IdsAlimentosFiltrados: alimentosPermitidos,
  };
  const resp = await apiClient.post('/PlanNutricional/generar-con-filtro', body);
  return resp.data as PlanNutricionalResponse;
};

export interface CambiarAlimentoRequest {
  IdUsuario: number;
  TiempoComida: string;
  /** Macrogrupo destino (como en el BLL original). */
  CategoriaMacro: string;
  IdAlimentoOriginal: number;
  IdsEnPlan: number[];
  IdsFiltroDespensa: number[];
  FaltaCarb: number;
  FaltaProt: number;
  FaltaGrasa: number;
  FaltaFibra: number;
  EsVegano: boolean;
}

/** Respuesta parcial al cambiar un ítem del plan. */
export interface CambiarAlimentoResponse {
  Id_Alimento: number;
  Nombre: string;
  Categoria: string;
  Macrogrupo?: string;
  Porcion_g: number;
  Factor_Coccion: number;
  Carbohidratos_g: number;
  Proteina_g: number;
  Grasa_g: number;
  Fibra_g: number;
  Energia_kcal: number;
}

export const cambiarAlimentoPlan = async (body: CambiarAlimentoRequest): Promise<CambiarAlimentoResponse> => {
  const { data } = await apiClient.post('/PlanNutricional/cambiar-alimento', body);
  return data as CambiarAlimentoResponse;
};

export interface EnviarPlanCorreoBody {
  IdUsuario: number;
  IdMedico: number;
  TiempoComida: string;
  PlanJson: string;
}

export const enviarPlanPorCorreo = async (body: EnviarPlanCorreoBody) => {
  const { data } = await apiClient.post('/PlanNutricional/enviar-plan-correo', body);
  return String(data);
};

export const enviarPlanesMultiplesCorreo = async (idUsuario: number, idMedico: number, planesJson: string) => {
  const { data } = await apiClient.post('/PlanNutricional/enviar-planes-correo', {
    IdUsuario: idUsuario,
    IdMedico: idMedico,
    PlanesJson: planesJson,
  });
  return String(data);
};

export const generarRecetaIA = async (prompt: string): Promise<string> => {
  const { data } = await apiClient.post('/PlanNutricional/receta-ia', { Prompt: prompt });
  if (typeof data === 'string') return data;
  if (data && typeof (data as any).texto === 'string') return (data as any).texto;
  return String(data ?? '');
};

export const enviarRecetaCorreo = async (idUsuario: number, idMedico: number, recetaTexto: string) => {
  const { data } = await apiClient.post('/PlanNutricional/enviar-receta-correo', {
    IdUsuario: idUsuario,
    IdMedico: idMedico,
    Receta: recetaTexto,
  });
  return String(data);
};

/** Parsea respuestas tipo "1<SPLITER>mensaje" del legado. */
export function parseSpliterResponse(raw: string): { ok: boolean; parts: string[] } {
  const parts = String(raw).split('<SPLITER>');
  return { ok: parts[0] === '1', parts };
}
