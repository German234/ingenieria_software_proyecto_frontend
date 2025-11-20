"use client";

import { RoleValues, ROLES } from "@/app/constants/roles";
import { useAuth } from "./useAuth";

// This hook provides role-based access control functionality
export const useRole = () => {
  const { user, authenticated } = useAuth();
  
  const hasRole = (allowedRoles: RoleValues[]) => {
    if (!authenticated || !user) {
      return false;
    }
    
    return allowedRoles.includes(user.role as RoleValues);
  };

  const isAdmin = user?.role === ROLES.ADMIN;
  const isRecomendador = user?.role === ROLES.RECOMENDADOR;
  const isAlumno = user?.role === ROLES.ALUMNO;
  const isTutor = user?.role === ROLES.TUTOR;
  const isProfesor = user?.role === ROLES.PROFESOR;

  return {
    hasRole,
    isAdmin,
    isRecomendador,
    isAlumno,
    isTutor,
    isProfesor,
    role: user?.role || null,
  };
};