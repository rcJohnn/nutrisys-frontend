import { apiClient } from './client';

export interface Consulta {
  Id_Consulta: number;
  Id_Usuario: number;
  Id_Medico: number;
  Id_Clinica?: number;
  Fecha_Cita: string;
  Duracion_Minutos: number;
  Estado: string;
  Motivo: string;
  NombreUsuario: string;
  NombreMedico: string;
  CedulaUsuario?: string;
  CorreoUsuario?: string;
  CorreoMedico?: string;
}

export interface ConsultaDetalle extends Consulta {
  Peso_kg: number;
  Estatura_cm: number;
  IMC: number;
  Grasa_g: number;
  Musculo_g: number;
  Circunferencia_Cintura_cm: number;
  Circunferencia_Cadera_cm: number;
  Presion_Arterial_Sistolica: number;
  Presion_Arterial_Diastolica: number;
  Grasa_Porcentaje?: number;
  Circunferencia_Muneca_cm?: number;
  Agua_Corporal_Pct?: number;
  Edad_Metabolica?: number;
  Masa_Osea_g?: number;
  Grasa_Visceral?: number;
  Observaciones_Medico: string;
  Recomendaciones: string;
  Proxima_Cita?: string;
}

export interface AntropometriaData {
  Id_Consulta: number;
  Circunferencia_Brazo_cm: number;
  Circunferencia_Pantorrilla_cm: number;
  Altura_Rodilla_cm: number;
  Raza: string;
  Antrop_ATB: number;
  Antrop_CMB: number;
  Antrop_AMB: number;
  Antrop_AGB: number;
  Peso_Estimado_kg: number;
  Talla_Estimada_cm: number;
  Edad_Calculada: number;
  PCT_cm_Usado: number;
}

export interface DistribucionMacrosData {
  Id_Distribucion: number;
  Id_Consulta: number;
  Formula_Usada: string;
  REE: number;
  CHO_g: number;
  Prot_g: number;
  Grasa_g: number;
  Fibra_g: number;
  Desayuno_CHO_g: number;
  Desayuno_Prot_g: number;
  Desayuno_Grasa_g: number;
  Desayuno_Fibra_g: number;
  MeriendaAM_CHO_g: number;
  MeriendaAM_Prot_g: number;
  MeriendaAM_Grasa_g: number;
  MeriendaAM_Fibra_g: number;
  Almuerzo_CHO_g: number;
  Almuerzo_Prot_g: number;
  Almuerzo_Grasa_g: number;
  Almuerzo_Fibra_g: number;
  MeriendaPM_CHO_g: number;
  MeriendaPM_Prot_g: number;
  MeriendaPM_Grasa_g: number;
  MeriendaPM_Fibra_g: number;
  Cena_CHO_g: number;
  Cena_Prot_g: number;
  Cena_Grasa_g: number;
  Cena_Fibra_g: number;
}

export interface ConsultaFiltros {
  Id_Usuario?: number;
  Id_Medico?: number;
  Estado?: string;
  FechaInicio?: string;
  FechaFin?: string;
}

export interface CreateConsultaData {
  Id_Usuario: number;
  Id_Medico: number;
  Id_Clinica?: number;
  Fecha_Cita: string;
  Duracion_Minutos: number;
  Motivo?: string;
  Forzar?: boolean;
}

export interface UpdateConsultaData {
  Id_Usuario: number;
  Id_Medico: number;
  Id_Clinica?: number;
  Fecha_Cita: string;
  Duracion_Minutos: number;
  Estado: string;
  Motivo?: string;
  Forzar?: boolean;
}

export interface ClinicaConsulta {
  id: number;
  nombre: string;
  direccion: string;
  Logo_Url: string;
  Latitud?: number;
  Longitud?: number;
}

export const getConsultas = async (filtros: ConsultaFiltros = {}) => {
  const params = new URLSearchParams();
  if (filtros.Id_Usuario) params.append('Id_Usuario', String(filtros.Id_Usuario));
  if (filtros.Id_Medico)  params.append('Id_Medico',  String(filtros.Id_Medico));
  if (filtros.Estado)     params.append('Estado',     filtros.Estado);
  if (filtros.FechaInicio) params.append('FechaInicio', filtros.FechaInicio);
  if (filtros.FechaFin)    params.append('FechaFin',    filtros.FechaFin);
  const response = await apiClient.get(`/Consultas?${params.toString()}`);
  return response.data as Consulta[];
};

export const getConsultaById = async (id: number) => {
  const response = await apiClient.get(`/Consultas/${id}`);
  return response.data as ConsultaDetalle;
};

export const getAntropometria = async (idConsulta: number) => {
  const response = await apiClient.get(`/Antropometria?idConsulta=${idConsulta}`);
  return response.data as AntropometriaData;
};

export const getDistribucionMacros = async (idConsulta: number) => {
  const response = await apiClient.get(`/DistribucionMacros/consulta/${idConsulta}`);
  return response.data as DistribucionMacrosData;
};

export const createConsulta = async (data: CreateConsultaData) => {
  const response = await apiClient.post('/Consultas', data);
  return response.data;
};

export const updateConsulta = async (id: number, data: UpdateConsultaData) => {
  const response = await apiClient.put(`/Consultas/${id}`, data);
  return response.data;
};

export const cancelarConsulta = async (id: number) => {
  const response = await apiClient.post(`/Consultas/${id}/cancelar`);
  return response.data;
};

export interface FinalizarConsultaData {
  Observaciones_Medico: string;
  Recomendaciones: string;
  Proxima_Cita?: string;
}

export const finalizarConsulta = async (id: number, data: FinalizarConsultaData) => {
  const response = await apiClient.post(`/Consultas/${id}/completar`, data);
  return response.data;
};

export const marcarNoAsistio = async (id: number) => {
  const response = await apiClient.post(`/Consultas/${id}/noasistio`);
  return response.data;
};

export const getClinicasMedico = async (idMedico: number) => {
  const response = await apiClient.get(`/MedicoClinica/consulta/${idMedico}`);
  return response.data as ClinicaConsulta[];
};
