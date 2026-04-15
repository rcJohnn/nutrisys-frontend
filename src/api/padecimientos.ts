import { apiClient } from './client';

export interface PadecimientoAvailable {
  Id_Padecimiento: number;
  Descripcion: string;
  Estado: string;
}

export interface PadecimientoAsignado {
  Id_Usuario: number;
  Id_Padecimiento: number;
  Descripcion: string;
  Asignado?: string;
}

export const getPadecimientosDisponibles = async (): Promise<PadecimientoAvailable[]> => {
  const response = await apiClient.get('/PadecimientosUsuario/Padecimientos');
  return response.data as PadecimientoAvailable[];
};

export const getPadecimientosUsuario = async (idUsuario: number): Promise<PadecimientoAsignado[]> => {
  const response = await apiClient.get(`/PadecimientosUsuario/${idUsuario}`);
  const data = response.data as any[];
  // Filter only assigned (Asignado = 'S') — the API returns all but we need only assigned
  return (data || []).filter((p: any) => p.Asignado === 'S') as PadecimientoAsignado[];
};

export const asignarPadecimiento = async (idUsuario: number, idPadecimiento: number): Promise<number> => {
  const response = await apiClient.post('/PadecimientosUsuario', {
    Id_Usuario: idUsuario,
    Id_Padecimiento: idPadecimiento,
  });
  // Returns the ID or -1 if already assigned
  return response.data?.id ?? 0;
};

export const eliminarPadecimiento = async (idUsuario: number, idPadecimiento: number, idUsuarioGlobal: number): Promise<void> => {
  await apiClient.delete('/PadecimientosUsuario', {
    params: { idUsuario, idPadecimiento, idUsuarioGlobal },
  });
};

