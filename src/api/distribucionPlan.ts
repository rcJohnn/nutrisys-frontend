import { apiClient } from './client';
import type { DistribucionMacrosData } from './consultas';

const MEAL_KEYS = ['Desayuno', 'MeriendaAM', 'Almuerzo', 'MeriendaPM', 'Cena'] as const;
export type TiempoComidaKey = (typeof MEAL_KEYS)[number];

function pickDistribucionForMeal(d: DistribucionMacrosData, meal: TiempoComidaKey) {
  // Las keys llegan normalizadas por el interceptor de axios (normalizeKeys):
  // _([a-z]) → UpperCase, primer letra → Mayúscula.
  // Ejemplo: desayuno_CHO_g → _g (minúscula) → G → Desayuno_CHOG
  const map: Record<TiempoComidaKey, [string, string, string, string]> = {
    Desayuno:   ['Desayuno_CHOG',   'Desayuno_ProtG',   'Desayuno_GrasaG',   'Desayuno_FibraG'],
    MeriendaAM: ['MeriendaAM_CHOG', 'MeriendaAM_ProtG', 'MeriendaAM_GrasaG', 'MeriendaAM_FibraG'],
    Almuerzo:   ['Almuerzo_CHOG',   'Almuerzo_ProtG',   'Almuerzo_GrasaG',   'Almuerzo_FibraG'],
    MeriendaPM: ['MeriendaPM_CHOG', 'MeriendaPM_ProtG', 'MeriendaPM_GrasaG', 'MeriendaPM_FibraG'],
    Cena:       ['Cena_CHOG',       'Cena_ProtG',       'Cena_GrasaG',       'Cena_FibraG'],
  };
  const [kCho, kProt, kGrasa, kFibra] = map[meal];
  const raw = d as any;
  return {
    cho:   Number(raw[kCho]   ?? 0) || 0,
    prot:  Number(raw[kProt]  ?? 0) || 0,
    grasa: Number(raw[kGrasa] ?? 0) || 0,
    fibra: Number(raw[kFibra] ?? 0) || 0,
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
