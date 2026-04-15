// Tipos TypeScript para el endpoint de disponibilidad de agendamiento
// Corresponden a las DTOs de C# implementadas en el backend

export interface DisponibilidadRequest {
  Id_Medico: number;
  FechaInicio: string; // Formato: YYYY-MM-DD
  FechaFin: string;    // Formato: YYYY-MM-DD
  DuracionMinutos?: number;
}

export interface DisponibilidadResponse {
  MedicoId: number;
  DuracionSlotMin: number;
  DisponibilidadPorDia: DisponibilidadDia[];
}

export interface DisponibilidadDia {
  Fecha: string; // Formato: YYYY-MM-DD
  DiaSemana: number; // 1=Lunes, 7=Domingo
  HorarioLaboral?: HorarioLaboral;
  Disponible: boolean;
  SlotsDisponibles: SlotDisponible[];
  Bloqueos: BloqueoDia[];
  TiemposComida: TiempoComidaDia[];
}

export interface HorarioLaboral {
  Inicio: string; // Formato: HH:mm
  Fin: string;    // Formato: HH:mm
}

export interface SlotDisponible {
  Inicio: string; // Formato: HH:mm
  Fin: string;    // Formato: HH:mm
  DuracionMinutos: number;
}

export interface BloqueoDia {
  Tipo: 'D' | 'H'; // 'D' = día completo, 'H' = por horas
  Inicio: string;   // Formato: HH:mm (solo si Tipo = 'H')
  Fin: string;      // Formato: HH:mm (solo si Tipo = 'H')
  Motivo: string;
}

export interface TiempoComidaDia {
  TipoComida: string;
  Inicio: string; // Formato: HH:mm
  Fin: string;    // Formato: HH:mm
}

// Tipos para el estado del hook
export interface DisponibilidadState {
  data: DisponibilidadResponse | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Tipos para los códigos de error del backend
export type CodigoErrorAgenda = -1 | -2 | -3 | -4 | -5;

export const MensajesErrorAgenda: Record<CodigoErrorAgenda, string> = {
  [-1]: 'El médico ya tiene una cita en ese horario.',
  [-2]: 'El horario solicitado está fuera del horario laboral del médico.',
  [-3]: 'El médico tiene un bloqueo en ese horario.',
  [-4]: 'El horario cae dentro de un tiempo de comida configurado por el médico.',
  [-5]: 'El horario seleccionado termina muy cerca de un bloqueo del médico. Por favor, seleccione un horario que termine al menos 30 minutos antes del bloqueo.',
};

// Helper para formatear fechas
export const formatFechaDisplay = (fecha: string): string => {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-CR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper para formatear horas
export const formatHoraDisplay = (hora: string): string => {
  if (!hora) return '';
  const [hours, minutes] = hora.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
  return date.toLocaleTimeString('es-CR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Helper para calcular si un día está disponible
export const calcularDisponibilidadDia = (dia: DisponibilidadDia): {
  disponible: boolean;
  slotsCount: number;
  tieneBloqueos: boolean;
  tieneTiemposComida: boolean;
} => {
  return {
    disponible: dia.Disponible && dia.SlotsDisponibles.length > 0,
    slotsCount: dia.SlotsDisponibles.length,
    tieneBloqueos: dia.Bloqueos.length > 0,
    tieneTiemposComida: dia.TiemposComida.length > 0,
  };
};

// Helper para obtener el color del día según disponibilidad
export const obtenerColorDia = (dia: DisponibilidadDia): string => {
  const { disponible, slotsCount } = calcularDisponibilidadDia(dia);
  
  if (!disponible) return 'rojo';
  if (slotsCount < 3) return 'amarillo';
  return 'verde';
};