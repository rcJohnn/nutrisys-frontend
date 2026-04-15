// Exportación del componente CalendarioDisponibilidad
import CalendarioDisponibilidad from './CalendarioDisponibilidad';
import type { CalendarioDisponibilidadProps } from './CalendarioDisponibilidad';

export default CalendarioDisponibilidad;
export type { CalendarioDisponibilidadProps };

// Re-exportar tipos relacionados
export type {
  DisponibilidadRequest,
  DisponibilidadResponse,
  DisponibilidadDia,
  SlotDisponible,
  BloqueoDia,
  TiempoComidaDia,
  HorarioLaboral,
  CodigoErrorAgenda,
  MensajesErrorAgenda
} from '../../types/disponibilidad';

// Re-exportar hooks relacionados
export {
  useDisponibilidadMedico,
  useDisponibilidadMes,
  useDisponibilidadTresMeses
} from '../../hooks/useDisponibilidadMedico';

// Re-exportar funciones API relacionadas
export {
  getDisponibilidadMedico,
  getDisponibilidadMes,
  getDisponibilidadTresMeses,
  getSlotsDisponiblesPorFecha,
  isFechaDisponible,
  getHorarioLaboralPorFecha,
  getBloqueosPorFecha,
  getTiemposComidaPorFecha,
  calcularPorcentajeDisponibilidad,
  generarResumenDisponibilidad
} from '../../api/disponibilidad';