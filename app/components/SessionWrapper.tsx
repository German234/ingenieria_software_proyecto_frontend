"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/app/contexts/AuthContext";

interface Props {
  children: ReactNode;
}

// This component wraps the application with the AuthProvider
// to provide authentication context throughout the app
export default function SessionWrapper({ children }: Props) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}