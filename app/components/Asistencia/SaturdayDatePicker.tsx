"use client";

import React, { useMemo } from "react";
import { CalendarDate } from "@internationalized/date";
import {
  getSaturdaysOfMonth,
  isToday,
  isPast,
  isFuture,
  isSameDay,
  formatSaturdaySpanish,
  calendarDateToISOString,
} from "@/app/utils/dateUtils";

interface SaturdayDatePickerProps {
  /** Fecha seleccionada actualmente */
  selectedDate?: CalendarDate;
  /** Función que se ejecuta al seleccionar una fecha */
  onDateSelect?: (date: CalendarDate) => void;
  /** Mes y año a mostrar (por defecto usa el mes actual) */
  displayMonth?: { year: number; month: number };
  /** Permitir seleccionar fechas futuras */
  allowFutureDates?: boolean;
  /** Permitir seleccionar fechas pasadas */
  allowPastDates?: boolean;
  /** Clases CSS adicionales para el contenedor principal */
  className?: string;
}

export default function SaturdayDatePicker({
  selectedDate,
  onDateSelect,
  displayMonth,
  allowFutureDates = true,
  allowPastDates = true,
  className = "",
}: SaturdayDatePickerProps) {
  // Obtener el mes y año a mostrar
  const currentDate = new Date();
  const { year, month } = displayMonth || {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1, // Los meses en CalendarDate son 1-12
  };

  // Obtener todos los sábados del mes
  const saturdays = useMemo(() => {
    return getSaturdaysOfMonth(year, month);
  }, [year, month]);

  // Manejar la selección de una fecha
  const handleDateSelect = (date: CalendarDate) => {
    // Validar si la fecha puede ser seleccionada
    if (!allowFutureDates && isFuture(date)) {
      return;
    }
    if (!allowPastDates && isPast(date)) {
      return;
    }

    onDateSelect?.(date);
  };

  // Obtener el estilo para un botón de fecha específico
  const getButtonStyles = (date: CalendarDate): string => {
    const baseStyles = "relative px-4 py-3 rounded-lg font-medium transition-all duration-200 border-2 ";
    
    // Si está seleccionado
    if (selectedDate && isSameDay(date, selectedDate)) {
      return baseStyles + "bg-[#003C71] text-white border-[#003C71] shadow-lg transform scale-105";
    }
    
    // Si es hoy
    if (isToday(date)) {
      return baseStyles + "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100";
    }
    
    // Si es pasado
    if (isPast(date)) {
      return baseStyles + "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100";
    }
    
    // Si es futuro
    if (isFuture(date)) {
      return baseStyles + "bg-green-50 text-green-600 border-green-200 hover:bg-green-100";
    }
    
    // Estado por defecto
    return baseStyles + "bg-white text-gray-700 border-gray-200 hover:bg-gray-50";
  };


  // Obtener el texto del mes y año para el encabezado
  const getHeaderText = (): string => {
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    return `${monthNames[month - 1]} ${year}`;
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {/* Encabezado con el mes y año */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 text-center">
          Sábados de {getHeaderText()}
        </h3>
      </div>

      {/* Grid con los sábados del mes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {saturdays.map((saturday) => {
          const isDisabled = (!allowFutureDates && isFuture(saturday)) || 
                           (!allowPastDates && isPast(saturday));
          
          return (
            <button
              key={calendarDateToISOString(saturday)}
              onClick={() => handleDateSelect(saturday)}
              disabled={isDisabled}
              className={`
                ${getButtonStyles(saturday)}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                flex flex-col items-center justify-center min-h-[80px]
                whitespace-pre-line text-center
              `}
              title={formatSaturdaySpanish(saturday)}
            >
              <span className="text-lg font-bold">
                {saturday.day}
              </span>
              {isToday(saturday) && (
                <span className="text-xs font-semibold">
                  HOY
                </span>
              )}
              {isPast(saturday) && !isToday(saturday) && (
                <span className="text-xs opacity-75">
                  Pasado
                </span>
              )}
              {isFuture(saturday) && (
                <span className="text-xs opacity-75">
                  Futuro
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-50 border-2 border-blue-300 rounded"></div>
            <span className="text-gray-600">Hoy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-50 border-2 border-gray-200 rounded"></div>
            <span className="text-gray-600">Pasado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-50 border-2 border-green-200 rounded"></div>
            <span className="text-gray-600">Futuro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#003C71] border-2 border-[#003C71] rounded"></div>
            <span className="text-gray-600">Seleccionado</span>
          </div>
        </div>
      </div>

      {/* Información de la fecha seleccionada */}
      {selectedDate && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            <span className="font-semibold">Fecha seleccionada:</span>{" "}
            {formatSaturdaySpanish(selectedDate)}
          </p>
        </div>
      )}
    </div>
  );
}