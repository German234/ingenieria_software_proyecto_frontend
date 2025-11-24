import { getLocalTimeZone, today, CalendarDate } from "@internationalized/date";

/**
 * Obtiene el sábado más cercano a una fecha dada
 * @param date Fecha de referencia (por defecto usa la fecha actual)
 * @returns CalendarDate del sábado más cercano
 */
export function getClosestSaturday(date?: CalendarDate): CalendarDate {
  const referenceDate = date || today(getLocalTimeZone());
  const currentDay = referenceDate.toDate(getLocalTimeZone()).getDay(); // 0 = domingo, 6 = sábado
  
  // Si ya es sábado, retornar la misma fecha
  if (currentDay === 6) {
    return referenceDate;
  }
  
  // Calcular días hasta el próximo sábado
  const daysUntilSaturday = (6 - currentDay + 7) % 7;
  return referenceDate.add({ days: daysUntilSaturday });
}

/**
 * Verifica si una fecha es un sábado válido
 * @param date Fecha a verificar
 * @returns true si la fecha es un sábado
 */
export function isValidSaturday(date: CalendarDate): boolean {
  return date.toDate(getLocalTimeZone()).getDay() === 6;
}

/**
 * Obtiene todos los sábados de un mes específico
 * @param year Año del mes
 * @param month Mes (1-12)
 * @returns Array de CalendarDate con todos los sábados del mes
 */
export function getSaturdaysOfMonth(year: number, month: number): CalendarDate[] {
  const saturdays: CalendarDate[] = [];
  
  // Crear una fecha para el primer día del mes
  const firstDay = new CalendarDate(year, month, 1);
  
  // Encontrar el primer sábado del mes
  const firstSaturday = getClosestSaturday(firstDay);
  
  // Si el primer sábado está en el mes siguiente, retroceder una semana
  let currentSaturday = firstSaturday;
  if (currentSaturday.month > month) {
    currentSaturday = firstSaturday.subtract({ days: 7 });
  }
  
  // Recorrer el mes recolectando todos los sábados
  while (currentSaturday.month === month) {
    saturdays.push(currentSaturday);
    currentSaturday = currentSaturday.add({ days: 7 });
  }
  
  return saturdays;
}

/**
 * Obtiene todos los sábados del mes actual
 * @returns Array de CalendarDate con todos los sábados del mes actual
 */
export function getSaturdaysOfCurrentMonth(): CalendarDate[] {
  const todayDate = today(getLocalTimeZone());
  return getSaturdaysOfMonth(todayDate.year, todayDate.month);
}

/**
 * Convierte un CalendarDate a string en formato YYYY-MM-DD
 * @param date CalendarDate a convertir
 * @returns String en formato YYYY-MM-DD
 */
export function calendarDateToISOString(date: CalendarDate): string {
  return date.toString(); // CalendarDate ya tiene formato YYYY-MM-DD
}

/**
 * Convierte un string en formato YYYY-MM-DD a CalendarDate
 * @param dateString String en formato YYYY-MM-DD
 * @returns CalendarDate
 */
export function dateStringToCalendarDate(dateString: string): CalendarDate {
  const [year, month, day] = dateString.split('-').map(Number);
  return new CalendarDate(year, month, day);
}

/**
 * Compara si dos CalendarDate son el mismo día
 * @param date1 Primera fecha
 * @param date2 Segunda fecha
 * @returns true si son el mismo día
 */
export function isSameDay(date1: CalendarDate, date2: CalendarDate): boolean {
  return date1.year === date2.year && 
         date1.month === date2.month && 
         date1.day === date2.day;
}

/**
 * Verifica si una fecha es hoy
 * @param date Fecha a verificar
 * @returns true si la fecha es hoy
 */
export function isToday(date: CalendarDate): boolean {
  const todayDate = today(getLocalTimeZone());
  return isSameDay(date, todayDate);
}

/**
 * Verifica si una fecha es pasada (anterior a hoy)
 * @param date Fecha a verificar
 * @returns true si la fecha es pasada
 */
export function isPast(date: CalendarDate): boolean {
  const todayDate = today(getLocalTimeZone());
  return date.compare(todayDate) < 0;
}

/**
 * Verifica si una fecha es futura (posterior a hoy)
 * @param date Fecha a verificar
 * @returns true si la fecha es futura
 */
export function isFuture(date: CalendarDate): boolean {
  const todayDate = today(getLocalTimeZone());
  return date.compare(todayDate) > 0;
}

/**
 * Formatea una fecha para mostrarla en español
 * @param date Fecha a formatear
 * @returns String con la fecha formateada (ej: "Sábado, 25 de noviembre de 2023")
 */
export function formatSaturdaySpanish(date: CalendarDate): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  // Convertir a Date nativo para formatear
  const nativeDate = new Date(date.year, date.month - 1, date.day);
  return nativeDate.toLocaleDateString('es-ES', options);
}

/**
 * Obtiene el número del día de la semana (0=domingo, 6=sábado)
 * @param date Fecha a evaluar
 * @returns Número del día de la semana
 */
export function getDayOfWeek(date: CalendarDate): number {
  return date.toDate(getLocalTimeZone()).getDay();
}