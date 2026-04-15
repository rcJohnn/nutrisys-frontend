import { apiClient } from './client';

export interface ModuloItem {
  Id_Modulo: number;
  Nombre_Modulo: string;
  Icono: string;
  Path: string;
  Orden: number;
}

export const getModulos = async (idUsuario: number, tipo: string): Promise<ModuloItem[]> => {
  const response = await apiClient.get(`/Sesion/modulos`, {
    params: { id: idUsuario, tipo },
  });
  return response.data as ModuloItem[];
};
