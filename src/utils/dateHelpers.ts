/**
 * Valida si una fecha es válida
 */
export const isValidDate = (date: any): boolean => {
    return date instanceof Date && !isNaN(date.getTime());
  };
  
  /**
   * Verifica si una fecha es un día laboral (Lunes-Viernes)
   */
  export const isWorkingDay = (date: Date): boolean => {
    const day = date.getDay();
    return day >= 1 && day <= 5; // 1=Lunes, 5=Viernes
  };
  
  /**
   * Verifica si una hora está en horario laboral (8AM-6PM)
   */
  export const isWorkingHour = (date: Date): boolean => {
    const hour = date.getHours();
    return hour >= 8 && hour < 18;
  };
  
  /**
   * Formatea una fecha a formato ISO
   */
  export const formatToISO = (date: Date): string => {
    return date.toISOString();
  };
  
  /**
   * Formatea una fecha a formato legible
   */
  export const formatToReadable = (date: Date): string => {
    return date.toLocaleString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  /**
   * Añade minutos a una fecha
   */
  export const addMinutes = (date: Date, minutes: number): Date => {
    return new Date(date.getTime() + minutes * 60000);
  };
  
  /**
   * Obtiene el inicio del día
   */
  export const getStartOfDay = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };
  
  /**
   * Obtiene el fin del día
   */
  export const getEndOfDay = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  };
  
  /**
   * Calcula la diferencia en minutos entre dos fechas
   */
  export const getDifferenceInMinutes = (date1: Date, date2: Date): number => {
    return Math.abs(date1.getTime() - date2.getTime()) / 60000;
  };