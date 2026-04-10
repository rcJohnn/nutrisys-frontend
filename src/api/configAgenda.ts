import { apiClient } from './client';

// ── Config General ──────────────────────────────────────────

export interface ConfigMedicoResponse {
  Id_Medico: number;
  Permite_Autoagendamiento: boolean;
  Duracion_Slot_Min: number;
  Anticipacion_Min_Reserva: number;
  Max_Citas_Por_Dia: number | null;
  Max_Cancelaciones_Usuario: number;
  Periodo_Penalizacion_Dias: number;
  Meses_Inactividad_Usuario: number;
}

export interface UpdateConfigMedicoRequest {
  Permite_Autoagendamiento: boolean;
  Duracion_Slot_Min: number;
  Anticipacion_Min_Reserva: number;
  Max_Citas_Por_Dia: number | null;
  Max_Cancelaciones_Usuario: number;
  Periodo_Penalizacion_Dias: number;
  Meses_Inactividad_Usuario: number;
}

export const getConfigMedico = async (idMedico: number): Promise<ConfigMedicoResponse> => {
  const res = await apiClient.get(`/ConfigMedico/${idMedico}`);
  return res.data;
};

export const updateConfigMedico = async (idMedico: number, data: UpdateConfigMedicoRequest): Promise<ConfigMedicoResponse> => {
  const res = await apiClient.put(`/ConfigMedico/${idMedico}`, data);
  return res.data;
};

export const ejecutarInactivacion = async (idMedico: number, idUsuarioGlobal: number): Promise<{ success: boolean; valorScalar: string }> => {
  const res = await apiClient.post(`/ConfigMedico/Inactivar?idMedico=${idMedico}&idUsuarioGlobal=${idUsuarioGlobal}`);
  return res.data;
};

// ── Horario Semanal ────────────────────────────────────────

export interface HorarioSemanalItem {
  Id_Horario: number;
  Id_Medico: number;
  Dia_Semana: number;
  Hora_Inicio: string;
  Hora_Fin: string;
  Activo: boolean;
}

export interface GuardarHorarioSemanalRequest {
  Id_Horario: number;
  Id_Medico: number;
  Dia_Semana: number;
  Hora_Inicio: string;
  Hora_Fin: string;
  Activo: boolean;
  IdUsuarioGlobal: number;
}

export const getHorarioSemanal = async (idMedico: number): Promise<HorarioSemanalItem[]> => {
  const res = await apiClient.get(`/HorarioSemanal/${idMedico}`);
  return res.data;
};

export const guardarHorarioSemanal = async (data: GuardarHorarioSemanalRequest): Promise<HorarioSemanalItem[]> => {
  const res = await apiClient.post('/HorarioSemanal', data);
  return res.data;
};

// ── Tiempos de Comida ───────────────────────────────────────

export interface TiempoComidaItem {
  Tipo_Comida: string;
  Hora_Inicio: string;
  Hora_Fin: string;
  Activo: boolean;
}

export const getTiemposComida = async (idMedico: number): Promise<TiempoComidaItem[]> => {
  const res = await apiClient.get(`/TiemposComida?idMedico=${idMedico}`);
  return res.data;
};

export const guardarTiempoComida = async (data: {
  Id_Medico: number;
  Tipo_Comida: string;
  Hora_Inicio: string;
  Hora_Fin: string;
  Activo: boolean;
  IdUsuarioGlobal: number;
}): Promise<any> => {
  const res = await apiClient.post('/TiemposComida', data);
  return res.data;
};

// ── Bloqueos ───────────────────────────────────────────────

export interface BloqueoResponse {
  Id_Bloqueo: number;
  Id_Medico: number;
  Tipo_Bloqueo: string;
  Fecha_Inicio: string;
  Fecha_Fin: string;
  Motivo: string;
}

export interface CreateBloqueoRequest {
  Id_Medico: number;
  Tipo_Bloqueo: string;
  Fecha_Inicio: string;
  Fecha_Fin: string;
  Motivo: string;
}

export const getBloqueos = async (idMedico: number, fechaDesde?: string, fechaHasta?: string): Promise<BloqueoResponse[]> => {
  const params = new URLSearchParams({ idMedico: String(idMedico) });
  if (fechaDesde) params.append('fechaDesde', fechaDesde);
  if (fechaHasta) params.append('fechaHasta', fechaHasta);
  const res = await apiClient.get(`/Bloqueos?${params}`);
  return res.data;
};

export const createBloqueo = async (data: CreateBloqueoRequest, idUsuarioGlobal: number): Promise<BloqueoResponse> => {
  const res = await apiClient.post(`/Bloqueos?idUsuarioGlobal=${idUsuarioGlobal}`, data);
  return res.data;
};

export const deleteBloqueo = async (id: number): Promise<void> => {
  await apiClient.delete(`/Bloqueos/${id}`);
};

// ── Penalizaciones ──────────────────────────────────────────

export interface PenalizacionItem {
  Id_Usuario: number;
  NombreUsuario: string;
  Cant_Cancelaciones: number;
  Penalizado: boolean;
  Fecha_Fin_Penal: string | null;
}

export interface PenalizacionListResponse {
  Id_Usuario: number;
  NombreUsuario: string;
  Cant_Cancelaciones: number;
  Penalizado: boolean;
  Fecha_Fin_Penal: string | null;
}

export const levantarPenalizacion = async (idPenalizacion: number, idUsuarioGlobal: number): Promise<void> => {
  await apiClient.post('/Penalizaciones/levantar', { Id_Penalizacion: idPenalizacion, IdUsuarioGlobal: idUsuarioGlobal });
};

export const getPenalizacionesMedico = async (idMedico: number): Promise<PenalizacionListResponse[]> => {
  const res = await apiClient.get(`/Penalizaciones/por-medico?idMedico=${idMedico}`);
  return res.data;
};
