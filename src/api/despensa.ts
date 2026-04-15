import { apiClient } from './client';

const LS_PREFIX = 'nutrisys_despensa_';

export const despensaLocalGet = (idUsuario: number): number[] => {
  try {
    const raw = localStorage.getItem(LS_PREFIX + idUsuario);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map(Number).filter((n) => !Number.isNaN(n)) : [];
  } catch {
    return [];
  }
};

export const despensaLocalSet = (idUsuario: number, ids: number[]) => {
  localStorage.setItem(LS_PREFIX + idUsuario, JSON.stringify(ids));
};

/** Intenta servidor; si falla devuelve null (el caller usa local). */
export const fetchDespensaIds = async (idUsuario: number): Promise<number[] | null> => {
  try {
    const { data } = await apiClient.get(`/Despensa/usuario/${idUsuario}`);
    const raw =
      (data as any)?.Ids ??
      (data as any)?.ids ??
      (data as any)?.IdsAlimentos ??
      (data as any)?.Ids_Alimentos ??
      (data as any)?.Id_Alimentos ??
      data;
    if (Array.isArray(raw)) return raw.map((x: any) => Number(x)).filter((n: number) => !Number.isNaN(n));
    if (typeof raw === 'string' && raw.trim()) return raw.split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
    return [];
  } catch {
    return null;
  }
};

export const saveDespensaIds = async (idUsuario: number, ids: number[]): Promise<boolean> => {
  try {
    await apiClient.put(`/Despensa/usuario/${idUsuario}`, { Ids: ids });
    return true;
  } catch {
    despensaLocalSet(idUsuario, ids);
    return false;
  }
};
