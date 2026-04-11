import { apiClient } from './client';

/**
 * Filas del endpoint Progreso: el backend devuelve dtDatos con nombres de columna variables.
 * Tras el interceptor (normalizeKeys) las claves quedan en PascalCase / mixtas según el origen.
 * La forma canónica para la UI es la que producen mapConsulta / mapBioquimico / mapHistoria en Progreso.tsx.
 */
export type ProgresoConsultaApiRow = Record<string, unknown>;
export type ProgresoBioquimicoApiRow = Record<string, unknown>;
export type ProgresoHistoriaApiRow = Record<string, unknown>;

export const getConsultas = async (idUsuario: number): Promise<ProgresoConsultaApiRow[]> => {
  const { data } = await apiClient.get(`/Progreso/consultas?idUsuario=${idUsuario}`);
  return Array.isArray(data) ? data : [];
};

export const getBioquimicos = async (idUsuario: number): Promise<ProgresoBioquimicoApiRow[]> => {
  const { data } = await apiClient.get(`/Progreso/bioquimicos?idUsuario=${idUsuario}`);
  return Array.isArray(data) ? data : [];
};

export const getHistoria = async (idUsuario: number): Promise<ProgresoHistoriaApiRow[]> => {
  const { data } = await apiClient.get(`/Progreso/historia?idUsuario=${idUsuario}`);
  return Array.isArray(data) ? data : [];
};
