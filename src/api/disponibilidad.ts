import { apiClient } from './client';
import type {
  DisponibilidadRequest,
  DisponibilidadResponse,
  DisponibilidadDia,
  SlotDisponible,
  BloqueoDia,
  TiempoComidaDia,
  HorarioLaboral
} from '../types/disponibilidad';

// Re-exportar tipos para facilitar el uso
export type {
  DisponibilidadRequest,
  DisponibilidadResponse,
  DisponibilidadDia,
  SlotDisponible,
  BloqueoDia,
  TiempoComidaDia,
  HorarioLaboral
} from '../types/disponibilidad';

/**
 * Obtiene la disponibilidad de un médico en un rango de fechas
 * @param params Parámetros de la consulta de disponibilidad
 * @returns Respuesta con disponibilidad por día
 */
export const getDisponibilidadMedico = async (
  params: DisponibilidadRequest
): Promise<DisponibilidadResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('Id_Medico', params.Id_Medico.toString());
  queryParams.append('FechaInicio', params.FechaInicio);
  queryParams.append('FechaFin', params.FechaFin);
  
  if (params.DuracionMinutos) {
    queryParams.append('DuracionMinutos', params.DuracionMinutos.toString());
  }

  const response = await apiClient.get(`/Consultas/disponibilidad?${queryParams.toString()}`);
  return response.data as DisponibilidadResponse;
};

/**
 * Obtiene la disponibilidad de un médico para un mes específico
 * @param medicoId ID del médico
 * @param year Año
 * @param month Mes (1-12)
 * @param duracionMinutos Duración de la cita en minutos (opcional)
 * @returns Respuesta con disponibilidad para el mes
 */
export const getDisponibilidadMes = async (
  medicoId: number,
  year: number,
  month: number,
  duracionMinutos?: number
): Promise<DisponibilidadResponse> => {
  // Calcular primer y último día del mes
  const fechaInicio = `${year}-${month.toString().padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const fechaFin = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

  return getDisponibilidadMedico({
    Id_Medico: medicoId,
    FechaInicio: fechaInicio,
    FechaFin: fechaFin,
    DuracionMinutos: duracionMinutos
  });
};

/**
 * Obtiene la disponibilidad de un médico para un rango de 3 meses (mes actual + 2 siguientes)
 * @param medicoId ID del médico
 * @param duracionMinutos Duración de la cita en minutos (opcional)
 * @returns Array de respuestas de disponibilidad por mes
 */
export const getDisponibilidadTresMeses = async (
  medicoId: number,
  duracionMinutos?: number
): Promise<DisponibilidadResponse[]> => {
  const hoy = new Date();
  const meses: Promise<DisponibilidadResponse>[] = [];

  for (let i = 0; i < 3; i++) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1);
    const year = fecha.getFullYear();
    const month = fecha.getMonth() + 1;
    
    meses.push(getDisponibilidadMes(medicoId, year, month, duracionMinutos));
  }

  return Promise.all(meses);
};

/**
 * Filtra los slots disponibles para una fecha específica
 * @param disponibilidad Respuesta completa de disponibilidad
 * @param fecha Fecha en formato YYYY-MM-DD
 * @returns Array de slots disponibles para esa fecha
 */
export const getSlotsDisponiblesPorFecha = (
  disponibilidad: DisponibilidadResponse,
  fecha: string
): SlotDisponible[] => {
  const dia = disponibilidad.DisponibilidadPorDia.find(d => d.Fecha === fecha);
  return dia?.SlotsDisponibles || [];
};

/**
 * Verifica si una fecha específica está disponible
 * @param disponibilidad Respuesta completa de disponibilidad
 * @param fecha Fecha en formato YYYY-MM-DD
 * @returns true si la fecha tiene slots disponibles
 */
export const isFechaDisponible = (
  disponibilidad: DisponibilidadResponse,
  fecha: string
): boolean => {
  const dia = disponibilidad.DisponibilidadPorDia.find(d => d.Fecha === fecha);
  return dia?.Disponible === true && (dia?.SlotsDisponibles?.length || 0) > 0;
};

/**
 * Obtiene el horario laboral para una fecha específica
 * @param disponibilidad Respuesta completa de disponibilidad
 * @param fecha Fecha en formato YYYY-MM-DD
 * @returns Horario laboral o undefined si no existe
 */
export const getHorarioLaboralPorFecha = (
  disponibilidad: DisponibilidadResponse,
  fecha: string
): HorarioLaboral | undefined => {
  const dia = disponibilidad.DisponibilidadPorDia.find(d => d.Fecha === fecha);
  return dia?.HorarioLaboral;
};

/**
 * Obtiene los bloqueos para una fecha específica
 * @param disponibilidad Respuesta completa de disponibilidad
 * @param fecha Fecha en formato YYYY-MM-DD
 * @returns Array de bloqueos para esa fecha
 */
export const getBloqueosPorFecha = (
  disponibilidad: DisponibilidadResponse,
  fecha: string
): BloqueoDia[] => {
  const dia = disponibilidad.DisponibilidadPorDia.find(d => d.Fecha === fecha);
  return dia?.Bloqueos || [];
};

/**
 * Obtiene los tiempos de comida para una fecha específica
 * @param disponibilidad Respuesta completa de disponibilidad
 * @param fecha Fecha en formato YYYY-MM-DD
 * @returns Array de tiempos de comida para esa fecha
 */
export const getTiemposComidaPorFecha = (
  disponibilidad: DisponibilidadResponse,
  fecha: string
): TiempoComidaDia[] => {
  const dia = disponibilidad.DisponibilidadPorDia.find(d => d.Fecha === fecha);
  return dia?.TiemposComida || [];
};

/**
 * Calcula el porcentaje de disponibilidad para un rango de fechas
 * @param disponibilidad Respuesta completa de disponibilidad
 * @returns Porcentaje de días con disponibilidad
 */
export const calcularPorcentajeDisponibilidad = (
  disponibilidad: DisponibilidadResponse
): number => {
  if (!disponibilidad.DisponibilidadPorDia.length) return 0;
  
  const diasDisponibles = disponibilidad.DisponibilidadPorDia.filter(dia => 
    dia.Disponible && dia.SlotsDisponibles.length > 0
  ).length;
  
  return Math.round((diasDisponibles / disponibilidad.DisponibilidadPorDia.length) * 100);
};

/**
 * Genera un resumen de disponibilidad para mostrar en UI
 * @param disponibilidad Respuesta completa de disponibilidad
 * @returns Objeto con resumen estadístico
 */
export const generarResumenDisponibilidad = (
  disponibilidad: DisponibilidadResponse
): {
  totalDias: number;
  diasDisponibles: number;
  porcentajeDisponible: number;
  totalSlots: number;
  slotsPorDiaPromedio: number;
} => {
  const totalDias = disponibilidad.DisponibilidadPorDia.length;
  const diasDisponibles = disponibilidad.DisponibilidadPorDia.filter(dia => 
    dia.Disponible && dia.SlotsDisponibles.length > 0
  ).length;
  
  const totalSlots = disponibilidad.DisponibilidadPorDia.reduce(
    (sum, dia) => sum + dia.SlotsDisponibles.length,
    0
  );
  
  return {
    totalDias,
    diasDisponibles,
    porcentajeDisponible: Math.round((diasDisponibles / totalDias) * 100),
    totalSlots,
    slotsPorDiaPromedio: totalDias > 0 ? Math.round(totalSlots / totalDias) : 0
  };
};