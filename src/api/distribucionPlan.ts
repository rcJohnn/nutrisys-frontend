import { apiClient } from './client';
import type { DistribucionMacrosData } from './consultas';

const MEAL_KEYS = ['Desayuno', 'MeriendaAM', 'Almuerzo', 'MeriendaPM', 'Cena'] as const;
export type TiempoComidaKey = (typeof MEAL_KEYS)[number];

function pickDistribucionForMeal(d: DistribucionMacrosData, meal: TiempoComidaKey) {
  // Mapear tiempo de comida a los campos del DTO (snake_case del backend, mayúsculas en CHO/PROT/GRASA/FIBRA)
  const map: Record<TiempoComidaKey, [string, string, string, string]> = {
    Desayuno:   ['desayuno_CHO_g',   'desayuno_Prot_g',   'desayuno_Grasa_g',   'desayuno_Fibra_g'],
    MeriendaAM: ['meriendaAM_CHO_g', 'meriendaAM_Prot_g', 'meriendaAM_Grasa_g', 'meriendaAM_Fibra_g'],
    Almuerzo:   ['almuerzo_CHO_g',   'almuerzo_Prot_g',   'almuerzo_Grasa_g',   'almuerzo_Fibra_g'],
    MeriendaPM: ['meriendaPM_CHO_g', 'meriendaPM_Prot_g', 'meriendaPM_Grasa_g', 'meriendaPM_Fibra_g'],
    Cena:       ['cena_CHO_g',       'cena_Prot_g',       'cena_Grasa_g',       'cena_Fibra_g'],
  };
  const [kCho, kProt, kGrasa, kFibra] = map[meal];
  return {
    cho:   Number(d[kCho as keyof DistribucionMacrosData] ?? 0) || 0,
    prot:  Number(d[kProt as keyof DistribucionMacrosData] ?? 0) || 0,
    grasa: Number(d[kGrasa as keyof DistribucionMacrosData] ?? 0) || 0,
    fibra: Number(d[kFibra as keyof DistribucionMacrosData] ?? 0) || 0,
  };
}

/**
 * Obtiene la distribución de macros de la última cita del usuario.
 * Usa el endpoint /DistribucionMacros/usuario/{idUsuario} (1 query en vez de N+1).
 */
export const getUltimaDistribucionPorTiempo = async (
  idUsuario: number,
  meal: TiempoComidaKey,
): Promise<{ cho: number; prot: number; grasa: number; fibra: number; fechaRegistro: string }> => {
  try {
    const response = await apiClient.get(`/DistribucionMacros/usuario/${idUsuario}`);
    const d = response.data as DistribucionMacrosData;
    const m = pickDistribucionForMeal(d, meal);
    
    if (m.cho + m.prot + m.grasa + m.fibra <= 0) {
      throw new Error('No hay distribuciones registradas para este usuario con datos en este tiempo de comida.');
    }
    
    return {
      ...m,
      fechaRegistro: d.Id_Distribucion
        ? new Date().toLocaleDateString('es-CR')
        : '',
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('No hay distribuciones registradas para este usuario con datos en este tiempo de comida.');
    }
    throw error;
  }
};
