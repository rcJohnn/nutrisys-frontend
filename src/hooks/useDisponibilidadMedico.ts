import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import {
  getDisponibilidadMedico,
  getDisponibilidadMes,
  getDisponibilidadTresMeses,
  type DisponibilidadRequest,
  type DisponibilidadResponse
} from '../api/disponibilidad';
import type { DisponibilidadDia } from '../types/disponibilidad';

// Clave base para las queries de disponibilidad
const DISPONIBILIDAD_QUERY_KEY = 'disponibilidad';

/**
 * Hook para obtener y gestionar la disponibilidad de un médico
 * Utiliza React Query para cache, revalidación y estados de loading/error
 */
export const useDisponibilidadMedico = (params: DisponibilidadRequest) => {
  const queryClient = useQueryClient();
  
  const queryKey = useMemo(() => 
    [DISPONIBILIDAD_QUERY_KEY, params.Id_Medico, params.FechaInicio, params.FechaFin, params.DuracionMinutos],
    [params.Id_Medico, params.FechaInicio, params.FechaFin, params.DuracionMinutos]
  );

  const query = useQuery<DisponibilidadResponse, Error>({
    queryKey,
    queryFn: () => getDisponibilidadMedico(params),
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    gcTime: 10 * 60 * 1000,   // 10 minutos en garbage collection
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: params.Id_Medico > 0 && params.FechaInicio <= params.FechaFin,
  });

  // Helper para obtener disponibilidad de un día específico
  const getDiaDisponibilidad = useCallback((fecha: string): DisponibilidadDia | undefined => {
    if (!query.data) return undefined;
    return query.data.DisponibilidadPorDia.find(dia => dia.Fecha === fecha);
  }, [query.data]);

  // Helper para verificar si una fecha está disponible
  const isFechaDisponible = useCallback((fecha: string): boolean => {
    const dia = getDiaDisponibilidad(fecha);
    return dia?.Disponible === true && (dia?.SlotsDisponibles?.length || 0) > 0;
  }, [getDiaDisponibilidad]);

  // Helper para obtener slots disponibles de una fecha
  const getSlotsDisponibles = useCallback((fecha: string) => {
    const dia = getDiaDisponibilidad(fecha);
    return dia?.SlotsDisponibles || [];
  }, [getDiaDisponibilidad]);

  // Helper para obtener horario laboral de una fecha
  const getHorarioLaboral = useCallback((fecha: string) => {
    const dia = getDiaDisponibilidad(fecha);
    return dia?.HorarioLaboral;
  }, [getDiaDisponibilidad]);

  // Helper para obtener bloqueos de una fecha
  const getBloqueos = useCallback((fecha: string) => {
    const dia = getDiaDisponibilidad(fecha);
    return dia?.Bloqueos || [];
  }, [getDiaDisponibilidad]);

  // Helper para obtener tiempos de comida de una fecha
  const getTiemposComida = useCallback((fecha: string) => {
    const dia = getDiaDisponibilidad(fecha);
    return dia?.TiemposComida || [];
  }, [getDiaDisponibilidad]);

  // Función para forzar revalidación de los datos
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  // Función para precargar disponibilidad de un mes
  const prefetchMes = useCallback(async (
    medicoId: number,
    year: number,
    month: number,
    duracionMinutos?: number
  ) => {
    const fechaInicio = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const fechaFin = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
    
    const prefetchKey = [DISPONIBILIDAD_QUERY_KEY, medicoId, fechaInicio, fechaFin, duracionMinutos];
    
    await queryClient.prefetchQuery({
      queryKey: prefetchKey,
      queryFn: () => getDisponibilidadMedico({
        Id_Medico: medicoId,
        FechaInicio: fechaInicio,
        FechaFin: fechaFin,
        DuracionMinutos: duracionMinutos
      }),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  // Función para precargar los próximos 3 meses
  const prefetchTresMeses = useCallback(async (
    medicoId: number,
    duracionMinutos?: number
  ) => {
    const hoy = new Date();
    const promises = [];

    for (let i = 0; i < 3; i++) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1);
      const year = fecha.getFullYear();
      const month = fecha.getMonth() + 1;
      
      promises.push(prefetchMes(medicoId, year, month, duracionMinutos));
    }

    await Promise.all(promises);
  }, [prefetchMes]);

  // Calcular estadísticas de disponibilidad
  const estadisticas = useMemo(() => {
    if (!query.data) return null;

    const totalDias = query.data.DisponibilidadPorDia.length;
    const diasDisponibles = query.data.DisponibilidadPorDia.filter(dia => 
      dia.Disponible && dia.SlotsDisponibles.length > 0
    ).length;
    
    const totalSlots = query.data.DisponibilidadPorDia.reduce(
      (sum, dia) => sum + dia.SlotsDisponibles.length,
      0
    );

    return {
      totalDias,
      diasDisponibles,
      porcentajeDisponible: totalDias > 0 ? Math.round((diasDisponibles / totalDias) * 100) : 0,
      totalSlots,
      slotsPorDiaPromedio: totalDias > 0 ? Math.round(totalSlots / totalDias) : 0,
      duracionSlotMin: query.data.DuracionSlotMin,
    };
  }, [query.data]);

  return {
    // Datos y estado de la query
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    isSuccess: query.isSuccess,
    
    // Helpers de disponibilidad
    getDiaDisponibilidad,
    isFechaDisponible,
    getSlotsDisponibles,
    getHorarioLaboral,
    getBloqueos,
    getTiemposComida,
    
    // Estadísticas
    estadisticas,
    
    // Gestión de cache
    invalidate,
    prefetchMes,
    prefetchTresMeses,
    
    // Refetch
    refetch: query.refetch,
  };
};

/**
 * Hook especializado para obtener disponibilidad de un mes específico
 */
export const useDisponibilidadMes = (
  medicoId: number,
  year: number,
  month: number,
  duracionMinutos?: number
) => {
  const fechaInicio = useMemo(() => 
    `${year}-${month.toString().padStart(2, '0')}-01`,
    [year, month]
  );
  
  const fechaFin = useMemo(() => {
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
  }, [year, month]);

  return useDisponibilidadMedico({
    Id_Medico: medicoId,
    FechaInicio: fechaInicio,
    FechaFin: fechaFin,
    DuracionMinutos: duracionMinutos
  });
};

/**
 * Hook para obtener disponibilidad de los próximos 3 meses
 */
export const useDisponibilidadTresMeses = (
  medicoId: number,
  duracionMinutos?: number
) => {
  const hoy = new Date();
  const queries = [];

  for (let i = 0; i < 3; i++) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1);
    const year = fecha.getFullYear();
    const month = fecha.getMonth() + 1;
    
    queries.push({
      key: [DISPONIBILIDAD_QUERY_KEY, medicoId, year, month, duracionMinutos],
      queryFn: () => getDisponibilidadMes(medicoId, year, month, duracionMinutos),
    });
  }

  const results = queries.map(({ key, queryFn }) => 
    useQuery({
      queryKey: key,
      queryFn,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: medicoId > 0,
    })
  );

  const isLoading = results.some(result => result.isLoading);
  const isError = results.some(result => result.isError);
  const isSuccess = results.every(result => result.isSuccess);
  const errors = results.map(result => result.error).filter(Boolean);
  
  const allData = results.map(result => result.data).filter(Boolean) as DisponibilidadResponse[];
  const combinedData = useMemo(() => {
    if (allData.length === 0) return null;
    
    // Combinar datos de todos los meses
    const disponibilidadPorDia = allData.flatMap(data => data.DisponibilidadPorDia);
    
    return {
      MedicoId: medicoId,
      DuracionSlotMin: allData[0]?.DuracionSlotMin || 30,
      DisponibilidadPorDia: disponibilidadPorDia.sort((a, b) => 
        a.Fecha.localeCompare(b.Fecha)
      ),
    };
  }, [allData, medicoId]);

  return {
    data: combinedData,
    isLoading,
    isError,
    isSuccess,
    errors,
    allData,
  };
};