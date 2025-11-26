"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserInfo, AuthResponse } from "@/app/types/types";
import { getLogin, login as loginService, getUserInfo } from "@/app/services/user.service";
import { toast } from "@pheralb/toast";
import Cookies from "js-cookie";
import { api } from "@/app/lib/api";

interface AuthState {
  user: UserInfo | null;
  loading: boolean;
  authenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, recaptchaToken: string) => Promise<void>;
  logout: () => void;
  loginKeycloak: () => Promise<void>;
  handleTokenExchange: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOKIE_NAME = "auth_session";
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    authenticated: false,
  });

  // Load session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        if (typeof window !== "undefined") {
          const storedSession = Cookies.get(COOKIE_NAME);
          if (storedSession) {
            // Verify session by calling getUserInfo
            try {
              const userInfo = await getUserInfo();
              console.log("Loaded user info from session:", userInfo);
              setState({
                user: userInfo,
                loading: false,
                authenticated: true,
              });
              
              // Update cookie with user info
              Cookies.set(COOKIE_NAME, JSON.stringify({
                user: userInfo,
                hasValidSession: true
              }), COOKIE_OPTIONS);
            } catch (error) {
              // Session is invalid
              console.error("Session validation failed:", error);
              Cookies.remove(COOKIE_NAME);
              setState({
                user: null,
                loading: false,
                authenticated: false,
              });
            }
          } else {
            setState(prev => ({
              ...prev,
              loading: false,
              authenticated: false
            }));
          }
        }
      } catch (error) {
        console.error("Error loading session:", error);
        Cookies.remove(COOKIE_NAME);
        setState(prev => ({
          ...prev,
          loading: false,
          authenticated: false
        }));
      }
    };

    loadSession();
  }, []);

  // Save session to cookies whenever it changes
  useEffect(() => {
    if (state.authenticated && state.user) {
      try {
        if (typeof window !== "undefined") {
          Cookies.set(COOKIE_NAME, JSON.stringify({
            user: state.user,
            hasValidSession: true
          }), COOKIE_OPTIONS);
        }
      } catch (error) {
        console.error("Error saving session:", error);
      }
    }
  }, [state.authenticated, state.user]);

  const login = async (email: string, password: string, recaptchaToken: string) => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const response: AuthResponse = await loginService(email, password, recaptchaToken);

      if (response.statusCode === 200 && response.data) {
        setState({
          user: response.data.info,
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

  const loginKeycloak = async () => {
    try {
      const state = Cookies.get('keycloak_state');
      const response = await getLogin();
      
      let redirectUrl: string | null = null;
      
      if (typeof response === 'string') {
        redirectUrl = response;
      } else if (response && typeof response === 'object' && 'data' in response && typeof response.data === 'string') {
        redirectUrl = response.data;
      } else if (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'url' in response.data && typeof response.data.url === 'string') {
        redirectUrl = response.data.url;
      }
      
      if (redirectUrl) {
        if (state) {
          const separator = redirectUrl.includes('?') ? '&' : '?';
          redirectUrl = `${redirectUrl}${separator}state=${state}`;
        }
        
        if (typeof window !== 'undefined') {
          window.location.href = redirectUrl;
        }
      } else {
        throw new Error("URL de autenticación no recibida del servidor");
      }
    } catch (error) {
      console.error("Error en loginKeycloak:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (error) {
      console.error("Error during logout:", error);
    }

    setState({
      user: null,
      loading: false,
      authenticated: false,
    });

    if (typeof window !== "undefined") {
      Cookies.remove(COOKIE_NAME);
    }

    toast.info({
      text: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  const handleTokenExchange = async () => {
    try {
      // Fetch user info using the token that was set in the HTTP-only cookie
      const userInfo = await getUserInfo();

      setState({
        user: userInfo,
        loading: false,
        authenticated: true,
      });

      // Store user info in client-side cookie
      Cookies.set(COOKIE_NAME, JSON.stringify({
        user: userInfo,
        hasValidSession: true
      }), COOKIE_OPTIONS);
    } catch (error) {
      console.error("Error handling token exchange:", error);
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        loginKeycloak,
        handleTokenExchange
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