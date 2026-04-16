import { apiClient } from './client';

export interface Medico {
  Id_Medico: number;
  Nombre: string;
  Prim_Apellido: string;
  Seg_Apellido: string;
  Cedula: string;
  Telefono: string;
  Correo: string;
  Estado: string;
}

export interface MedicoClinica {
  Id_Medico: number;
  Id_Clinica: number;
  NombreClinica: string;
  Direccion: string;
  Latitud: string;
  Longitud: string;
  LogoUrl: string;
}

export interface MedicoFiltros {
  correo?: string;
  nombre?: string;
  estado?: string;
}

export const getMedicos = async (filtros: MedicoFiltros = {}) => {
  const params = new URLSearchParams();
  if (filtros.correo) params.append('correo', filtros.correo);
  if (filtros.nombre) params.append('nombre', filtros.nombre);
  if (filtros.estado) params.append('estado', filtros.estado);
  
  const response = await apiClient.get(`/Medicos?${params.toString()}`);
  return response.data;
};

export const getMedicoById = async (id: number) => {
  const response = await apiClient.get(`/Medicos/${id}`);
  return response.data;
};

export const createMedico = async (data: Omit<Medico, 'Id_Medico'>) => {
  const response = await apiClient.post('/Medicos', data);
  return response.data;
};

export const updateMedico = async (id: number, data: Partial<Medico>) => {
  const response = await apiClient.put(`/Medicos/${id}`, data);
  return response.data;
};

export const deleteMedico = async (id: number, idUsuarioGlobal: number, forzarEliminacion: boolean = false) => {
  const response = await apiClient.delete(`/Medicos/${id}?idUsuarioGlobal=${idUsuarioGlobal}&forzarEliminacion=${forzarEliminacion}`);
  return response.data;
};

<<<<<<< HEAD
export const uploadLogoClinica = async (idClinica: number, file: File, logoAnterior?: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  if (logoAnterior) formData.append('logoAnterior', logoAnterior);
  const response = await apiClient.post(`/Clinicas/${idClinica}/logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.LogoUrl ?? response.data.logoUrl ?? '';
};

export const getMedicosConAutoagendamiento = async () => {
  const response = await apiClient.get('/Medicos/ConAutoagendamiento');
  return response.data as Medico[];
};

=======
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
export const getMedicoClinicas = async (idMedico: number) => {
  const response = await apiClient.get(`/MedicoClinica/clinicas/${idMedico}`);
  return response.data;
};

export const addMedicoClinica = async (data: MedicoClinica) => {
  const response = await apiClient.post('/MedicoClinica', data);
  return response.data;
};

export const deleteMedicoClinica = async (idMedicoClinica: number) => {
  const idUsuarioGlobal = Number(localStorage.getItem('userId') || '0');
  const response = await apiClient.delete(`/MedicoClinica/${idMedicoClinica}?idUsuarioGlobal=${idUsuarioGlobal}`);
  return response.data;
};
