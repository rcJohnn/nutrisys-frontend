import React, { useState, useMemo, useCallback } from 'react';
import { useDisponibilidadMes } from '../../hooks/useDisponibilidadMedico';
import type { SlotDisponible, DisponibilidadDia } from '../../types/disponibilidad';
import './CalendarioDisponibilidad.css';

interface CalendarioDisponibilidadProps {
  medicoId: number;
  year: number;
  month: number;
  duracionMinutos?: number;
  onFechaSeleccionada?: (fecha: string, slots: SlotDisponible[]) => void;
  onMesCambiado?: (year: number, month: number) => void;
  className?: string;
}

interface DiaCalendario {
  type: 'empty' | 'day';
  fecha?: string;
  day?: number;
  diaDisponibilidad?: DisponibilidadDia;
  disponible?: boolean;
  slots?: SlotDisponible[];
}

const CalendarioDisponibilidad: React.FC<CalendarioDisponibilidadProps> = ({
  medicoId,
  year,
  month,
  duracionMinutos,
  onFechaSeleccionada,
  onMesCambiado,
  className = '',
}) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);
  
  // Obtener disponibilidad del mes
  const {
    data: disponibilidad,
    isLoading,
    isError,
    error,
    getDiaDisponibilidad,
    isFechaDisponible,
    getSlotsDisponibles,
    estadisticas,
  } = useDisponibilidadMes(medicoId, year, month, duracionMinutos);

  // Generar días del mes
  const diasDelMes = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    
    const days: DiaCalendario[] = [];
    
    // Días vacíos al inicio (para alinear el calendario)
    for (let i = 0; i < startingDay; i++) {
      days.push({ type: 'empty' });
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const fecha = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const diaDisponibilidad = getDiaDisponibilidad?.(fecha);
      const disponible = isFechaDisponible?.(fecha) ?? false;
      const slots = getSlotsDisponibles?.(fecha) ?? [];
      
      days.push({
        type: 'day',
        fecha,
        day,
        diaDisponibilidad,
        disponible,
        slots,
      });
    }
    
    return days;
  }, [year, month, getDiaDisponibilidad, isFechaDisponible, getSlotsDisponibles]);

  // Navegación entre meses
  const handleMesAnterior = useCallback(() => {
    let newYear = year;
    let newMonth = month - 1;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    
    onMesCambiado?.(newYear, newMonth);
  }, [year, month, onMesCambiado]);

  const handleMesSiguiente = useCallback(() => {
    let newYear = year;
    let newMonth = month + 1;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    
    onMesCambiado?.(newYear, newMonth);
  }, [year, month, onMesCambiado]);

  // Manejar clic en un día
  const handleDiaClick = useCallback((fecha: string, slots: SlotDisponible[]) => {
    setFechaSeleccionada(fecha);
    onFechaSeleccionada?.(fecha, slots);
  }, [onFechaSeleccionada]);

  // Obtener clase CSS para el día según disponibilidad
  const getClaseDia = useCallback((disponible: boolean, slotsCount: number, fecha: string) => {
    const clases = ['calendario-dia'];
    
    if (fecha === fechaSeleccionada) {
      clases.push('seleccionado');
    }
    
    if (!disponible) {
      clases.push('no-disponible');
    } else if (slotsCount < 3) {
      clases.push('limitado');
    } else {
      clases.push('disponible');
    }
    
    return clases.join(' ');
  }, [fechaSeleccionada]);

  // Obtener tooltip para el día
  const getTooltipDia = useCallback((dia: DiaCalendario) => {
    if (dia.type !== 'day') return '';
    
    if (!dia.disponible) {
      return 'No disponible';
    }
    
    const slotsCount = dia.slots?.length || 0;
    if (slotsCount === 0) {
      return 'Sin slots disponibles';
    }
    
    const horarioLaboral = dia.diaDisponibilidad?.HorarioLaboral;
    if (horarioLaboral) {
      return `${slotsCount} slot${slotsCount !== 1 ? 's' : ''} disponible${slotsCount !== 1 ? 's' : ''}\nHorario: ${horarioLaboral.Inicio} - ${horarioLaboral.Fin}`;
    }
    
    return `${slotsCount} slot${slotsCount !== 1 ? 's' : ''} disponible${slotsCount !== 1 ? 's' : ''}`;
  }, []);

  // Nombres de los días de la semana
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  // Nombres de los meses
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (isLoading) {
    return (
      <div className={`calendario-container ${className}`}>
        <div className="calendario-loading">
          <div className="spinner"></div>
          <p>Cargando disponibilidad...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`calendario-container ${className}`}>
        <div className="calendario-error">
          <p>Error al cargar la disponibilidad</p>
          <p className="error-details">{error?.message || 'Error desconocido'}</p>
          <button 
            className="btn-reintentar"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`calendario-container ${className}`}>
      {/* Header del calendario */}
      <div className="calendario-header">
        <button 
          className="btn-navegacion"
          onClick={handleMesAnterior}
          aria-label="Mes anterior"
        >
          {"<"}
        </button>
        
        <div className="calendario-titulo">
          <h3>{meses[month - 1]} {year}</h3>
          {estadisticas && (
            <div className="calendario-estadisticas">
              <span className="estadistica">
                {estadisticas.diasDisponibles}/{estadisticas.totalDias} días disponibles
              </span>
              <span className="estadistica">
                {estadisticas.porcentajeDisponible}% disponible
              </span>
            </div>
          )}
        </div>
        
        <button 
          className="btn-navegacion"
          onClick={handleMesSiguiente}
          aria-label="Mes siguiente"
        >
          {">"}
        </button>
      </div>

      {/* Leyenda de colores */}
      <div className="calendario-leyenda">
        <div className="leyenda-item">
          <div className="leyenda-color disponible"></div>
          <span>Disponible (3+ slots)</span>
        </div>
        <div className="leyenda-item">
          <div className="leyenda-color limitado"></div>
          <span>Limitado (1-2 slots)</span>
        </div>
        <div className="leyenda-item">
          <div className="leyenda-color no-disponible"></div>
          <span>No disponible</span>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="calendario-dias-semana">
        {diasSemana.map((dia, index) => (
          <div key={index} className="dia-semana">
            {dia}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="calendario-dias">
        {diasDelMes.map((dia, index) => {
          if (dia.type === 'empty') {
            return <div key={index} className="calendario-dia vacio"></div>;
          }
          
          const slotsCount = dia.slots?.length || 0;
          const tieneBloqueos = (dia.diaDisponibilidad?.Bloqueos?.length || 0) > 0;
          const tieneTiemposComida = (dia.diaDisponibilidad?.TiemposComida?.length || 0) > 0;
          
          return (
            <button
              key={index}
              className={getClaseDia(dia.disponible || false, slotsCount, dia.fecha || '')}
              onClick={() => handleDiaClick(dia.fecha || '', dia.slots || [])}
              disabled={!dia.disponible}
              title={getTooltipDia(dia)}
              aria-label={`${dia.day} de ${meses[month - 1]} - ${dia.disponible ? 'Disponible' : 'No disponible'}`}
            >
              <div className="dia-numero">{dia.day}</div>
              {dia.disponible && (
                <div className="dia-slots">
                  <span className="slots-count">{slotsCount}</span>
                  <span className="slots-text">slot{slotsCount !== 1 ? 's' : ''}</span>
                </div>
              )}
              {tieneBloqueos && (
                <div className="dia-bloqueo" title="Tiene bloqueos">🔒</div>
              )}
              {tieneTiemposComida && (
                <div className="dia-comida" title="Tiene tiempos de comida">🍽️</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Información de la fecha seleccionada */}
      {fechaSeleccionada && (
        <div className="calendario-detalle">
          <h4>Detalles para {fechaSeleccionada}</h4>
          {(() => {
            const dia = getDiaDisponibilidad?.(fechaSeleccionada);
            if (!dia) return <p>No hay información disponible para esta fecha.</p>;
            
            return (
              <div className="detalle-contenido">
                {dia.HorarioLaboral && (
                  <div className="detalle-item">
                    <strong>Horario laboral:</strong>
                    <span>{dia.HorarioLaboral.Inicio} - {dia.HorarioLaboral.Fin}</span>
                  </div>
                )}
                
                <div className="detalle-item">
                  <strong>Slots disponibles:</strong>
                  <span>{dia.SlotsDisponibles.length}</span>
                </div>
                
                {dia.SlotsDisponibles.length > 0 && (
                  <div className="detalle-slots">
                    <strong>Horarios disponibles:</strong>
                    <div className="slots-lista">
                      {dia.SlotsDisponibles.map((slot, index) => (
                        <div key={index} className="slot-item">
                          {slot.Inicio} - {slot.Fin} ({slot.DuracionMinutos} min)
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {dia.Bloqueos.length > 0 && (
                  <div className="detalle-bloqueos">
                    <strong>Bloqueos:</strong>
                    <div className="bloqueos-lista">
                      {dia.Bloqueos.map((bloqueo, index) => (
                        <div key={index} className="bloqueo-item">
                          {bloqueo.Tipo === 'D' ? 'Día completo' : `${bloqueo.Inicio} - ${bloqueo.Fin}`}: {bloqueo.Motivo}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {dia.TiemposComida.length > 0 && (
                  <div className="detalle-comidas">
                    <strong>Tiempos de comida:</strong>
                    <div className="comidas-lista">
                      {dia.TiemposComida.map((comida, index) => (
                        <div key={index} className="comida-item">
                          {comida.TipoComida}: {comida.Inicio} - {comida.Fin}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Información sobre duración de slot */}
      {disponibilidad?.DuracionSlotMin && (
        <div className="calendario-info">
          <p>
            <small>
              Duración de slot: {disponibilidad.DuracionSlotMin} minutos. 
              Las citas no pueden terminar dentro de {disponibilidad.DuracionSlotMin} minutos antes de un bloqueo.
            </small>
          </p>
        </div>
      )}
    </div>
  );
};

export default CalendarioDisponibilidad;