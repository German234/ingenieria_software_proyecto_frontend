"use client"
import useAuth from "@/app/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { toast } from "@pheralb/toast";
import Cookies from "js-cookie";

const LoginKeycloak: React.FC = () => {
    const { loginKeycloak } = useAuth();
    const [isLoggingIn, setIsLoggingIn] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = useCallback(async () => {
        try {
            setIsLoggingIn(true);
            setError(null);
            
            // Generate and store state parameter for CSRF protection
            const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            Cookies.set('keycloak_state', state, {
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                expires: 1/24 // 1 hour
            });
            
            // The loginKeycloak function doesn't return a response directly
            // It handles the redirection internally
            await loginKeycloak();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error al iniciar sesión con Keycloak";
            setError(errorMessage);
            
            toast.error({
                text: "Error de autenticación",
                description: errorMessage,
            });
        } finally {
            setIsLoggingIn(false);
        }
    }, [loginKeycloak]);

    useEffect(() => {
        handleLogin();
    }, [handleLogin]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <div className="text-red-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Error de autenticación</h2>
                <p className="text-gray-500 text-center mb-4">{error}</p>
                <button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoggingIn ? "Intentando..." : "Reintentar"}
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Iniciando sesión</h2>
            <p className="text-gray-500 text-center">Redirigiendo al sistema de autenticación...</p>
        </div>
    );
};

export default LoginKeycloak;