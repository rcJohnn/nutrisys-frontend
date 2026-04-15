import { apiClient } from './client';

export interface DashboardData {
  pacientesSinSeguimiento: number;
  consultasHoy: number;
  consultasPendientes: number;
  pacientesAtendidos: number;
}

export const getDashboard = async (): Promise<DashboardData> => {
  const response = await apiClient.get<DashboardData[]>('/principal/dashboard');
  
  if (response.data && response.data.length > 0) {
    const data = response.data[0];
    return {
      pacientesSinSeguimiento: parseInt(data.pacientesSinSeguimiento?.toString() || '0'),
      consultasHoy: parseInt(data.consultasHoy?.toString() || '0'),
      consultasPendientes: parseInt(data.consultasPendientes?.toString() || '0'),
      pacientesAtendidos: parseInt(data.pacientesAtendidos?.toString() || '0'),
    };
  }
  
  return {
    pacientesSinSeguimiento: 0,
    consultasHoy: 0,
    consultasPendientes: 0,
    pacientesAtendidos: 0,
  };
};