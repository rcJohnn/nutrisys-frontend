import type { LoginResponse } from '../types/auth';

export interface LoginRequest {
  Correo: string;
  Password: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch('http://localhost:5159/api/sesion/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  const responseData = await response.json();
  
  if (!response.ok) {
    console.error('Login error response:', responseData);
    throw new Error(responseData.mensaje || responseData.title || 'Credenciales inválidas');
  }
  
  // Normalizar respuesta (el backend devuelve lowercase)
  return {
    Exito: responseData.exito,
    Mensaje: responseData.mensaje,
    Id: responseData.id,
    Tipo: responseData.tipo,
    NombreCompleto: responseData.nombreCompleto,
    Correo: responseData.correo
  };
};

export const logout = async (id: number, tipo: string): Promise<void> => {
  await fetch('http://localhost:5159/api/sesion/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Id: id, Tipo: tipo }),
  });
  localStorage.removeItem('token');
};