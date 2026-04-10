import { apiClient } from './client';

export interface Usuario {
  Id_Usuario: number;
  Nombre: string;
  Prim_Apellido: string;
  Seg_Apellido: string;
  Cedula: string;
  FechaNacimiento: string;
  Sexo: string;
  Telefono: string;
  Correo: string;
  Observaciones: string;
  Estado: string;
}

export interface UsuarioFiltros {
  correo?: string;
  nombre?: string;
  estado?: string;
}

export const getUsuarios = async (filtros: UsuarioFiltros = {}) => {
  const params = new URLSearchParams();
  if (filtros.correo) params.append('correo', filtros.correo);
  if (filtros.nombre) params.append('nombre', filtros.nombre);
  if (filtros.estado) params.append('estado', filtros.estado);
  
  const response = await apiClient.get(`/Usuarios?${params.toString()}`);
  return response.data;
};

export const getUsuarioById = async (id: number) => {
  const response = await apiClient.get(`/Usuarios/${id}`);
  return response.data;
};

export const createUsuario = async (data: Omit<Usuario, 'Id_Usuario'>) => {
  const response = await apiClient.post('/Usuarios', data);
  return response.data;
};

export const updateUsuario = async (id: number, data: Partial<Usuario>) => {
  const response = await apiClient.put(`/Usuarios/${id}`, data);
  return response.data;
};

export const deleteUsuario = async (id: number, force: boolean = false) => {
  const response = await apiClient.delete(`/Usuarios/${id}?force=${force}`);
  return response.data;
};
