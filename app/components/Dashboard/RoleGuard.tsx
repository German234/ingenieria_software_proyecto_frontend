'use client';

import { ReactNode } from 'react';
import { useRole } from '@/app/hooks/useRole';
import { RoleValues } from '@/app/constants/roles';

interface RoleGuardProps {
  allowedRoles: RoleValues[];
  children: ReactNode;
  loadingFallback?: ReactNode;
  fallback?: ReactNode;
  mode?: 'any' | 'all';
}

export const RoleGuard = ({
  allowedRoles,
  children,
  loadingFallback = null,
  fallback = null,
  mode = 'any'
}: RoleGuardProps) => {
  const { hasRole, } = useRole();
  
  // TODO: Replace with your own authentication state
  const status = "unauthenticated" as "loading" | "authenticated" | "unauthenticated"; // Placeholder

  if (status === 'loading') {
    return <>{loadingFallback}</>;
  }

  const hasPermission = mode === 'any'
    ? allowedRoles.some(r => hasRole([r]))
    : allowedRoles.every(r => hasRole([r]));

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};