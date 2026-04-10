import { apiClient } from './client';

export interface HubResumenMedico {
  PacientesSinSeguimiento30: number;
  ConsultasHoy: number;
  ConsultasPendientes: number;
  TotalPacientes: number;
}

export interface HubAgendaItem {
  Id_Consulta: number;
  Fecha_Cita: string;
  HoraCita: string;
  NombrePaciente: string;
  NombreClinica: string;
  Motivo: string;
  EstadoCodigo: string;
  EstadoTexto: string;
}

export interface HubInfoUsuario {
  Tipo: string;
  Id_Consulta: number;
  Fecha_Cita: string;
  EstadoTexto: string;
  NombreMedico: string;
  Peso: string;
  DiasDesde: number;
}

export const getHubResumen = async (medicoId: number): Promise<HubResumenMedico> => {
  const response = await apiClient.get('/Consultas/hub-resumen', {
    params: { medicoId },
  });
  return response.data as HubResumenMedico;
};

export const getHubAgenda = async (medicoId: number): Promise<HubAgendaItem[]> => {
  const response = await apiClient.get('/Consultas/hub-agenda', {
    params: { medicoId },
  });
  return response.data as HubAgendaItem[];
};

export const getHubUsuario = async (usuarioId: number): Promise<HubInfoUsuario[]> => {
  const response = await apiClient.get('/Consultas/hub-usuario', {
    params: { usuarioId },
  });
  return response.data as HubInfoUsuario[];
};
