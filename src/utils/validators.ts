/**
 * Valida UUID
 */
export const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };
  
  /**
   * Valida longitud mínima de string
   */
  export const hasMinLength = (str: string, min: number): boolean => {
    return str.trim().length >= min;
  };
  
  /**
   * Valida que una fecha sea futura
   */
  export const isFutureDate = (date: Date): boolean => {
    return date.getTime() > Date.now();
  };
  
  /**
   * Valida que una fecha tenga anticipación mínima
   */
  export const hasMinimumAdvance = (date: Date, hours: number): boolean => {
    const minTime = Date.now() + hours * 60 * 60 * 1000;
    return date.getTime() >= minTime;
  };