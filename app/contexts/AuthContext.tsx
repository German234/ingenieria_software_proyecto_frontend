"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserInfo, AuthResponse } from "@/app/types/types";
import { login as loginService } from "@/app/services/user.service";
import { toast } from "@pheralb/toast";

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
  authenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, recaptchaToken: string) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "auth_session";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    authenticated: false,
  });

  // Load session from localStorage on mount
  useEffect(() => {
    const loadSession = () => {
      try {
        if (typeof window !== "undefined") {
          const storedSession = localStorage.getItem(STORAGE_KEY);
          if (storedSession) {
            const session = JSON.parse(storedSession);
            setState({
              user: session.user,
              token: session.token,
              loading: false,
              authenticated: !!session.token,
            });
          } else {
            setState(prev => ({ ...prev, loading: false }));
          }
        }
      } catch (error) {
        console.error("Error loading session:", error);
        localStorage.removeItem(STORAGE_KEY);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    loadSession();
  }, []);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (state.token && state.user) {
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            user: state.user,
            token: state.token,
          }));
        }
      } catch (error) {
        console.error("Error saving session:", error);
      }
    }
  }, [state.token, state.user]);

  const login = async (email: string, password: string, recaptchaToken: string) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const response: AuthResponse = await loginService(email, password, recaptchaToken);
      
      if (response.statusCode === 200 && response.data) {
        setState({
          user: response.data.info,
          token: response.data.token,
          loading: false,
          authenticated: true,
        });
        
        toast.success({
          text: "Inicio de sesión exitoso",
          description: `Bienvenido, ${response.data.info.nombreCompleto}`,
        });
      } else {
        throw new Error(response.message || "Error al iniciar sesión");
      }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const logout = () => {
    setState({
      user: null,
      token: null,
      loading: false,
      authenticated: false,
    });
    
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    
    toast.info({
      text: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};