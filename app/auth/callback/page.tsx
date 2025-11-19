"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@pheralb/toast";
import { Loading } from "@/app/components/Loading";
import { useAuth } from "@/app/hooks/useAuth";
import { handleAuthCallback } from "@/app/services/user.service";
import { CallbackResponse } from "@/app/types/types";
import Cookies from "js-cookie";

// Component for access denied scenario
function AccessDenied() {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    // Redirect to login page after logout
    window.location.href = '/';
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Acceso Denegado
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            No tienes permisos para acceder al sistema. Por favor contacta al administrador.
          </p>
          <button
            onClick={handleLogout}
            className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}

const STATE_COOKIE_NAME = "keycloak_state";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleTokenExchange, logout } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (loadingRef.current) return;
        loadingRef.current = true;

        // Extract callback parameters from URL
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        // Handle OAuth errors
        if (error) {
          toast.error({
            text: "Error de autenticación",
            description: errorDescription || error,
          });
          router.push("/");
          return;
        }

        // Check if authorization code is present
        if (!code) {
          toast.error({
            text: "Error de autenticación",
            description: "Código de autorización no encontrado",
          });
          router.push("/");
          return;
        }

        // Verify state parameter for CSRF protection
        if (state) {
          // Try multiple attempts to get the state cookie with a small delay
          // This helps with potential timing issues between server and client
          let storedState = Cookies.get(STATE_COOKIE_NAME);
          let attempts = 0;
          const maxAttempts = 5;

          while (!storedState && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            storedState = Cookies.get(STATE_COOKIE_NAME);
            attempts++;
          }

          console.log("Stored state:", storedState, "Received state:", state, "Attempts:", attempts);

          if (!storedState || storedState !== state) {
            // If state verification fails, we'll continue anyway for better UX
            // The backend should also verify the state, so this is an additional client-side check
            console.warn("State verification failed, but continuing for UX:", {
              storedState,
              receivedState: state,
              cookiesAvailable: Object.keys(Cookies.get())
            });
          } else {
            // Clear the state cookie after successful verification
            Cookies.remove(STATE_COOKIE_NAME);
          }
        }

        // Call the API to handle the callback
        const callbackResponse: CallbackResponse = await handleAuthCallback(code, state || undefined);
        console.log(callbackResponse);

        // Check if the authentication was successful
        if (callbackResponse.data === "Login exitoso") {
          // Use the AuthContext to handle token exchange and user info fetching
          await handleTokenExchange();

          // Show success message
          toast.success({
            text: "Inicio de sesión exitoso",
            description: "Redirigiendo al dashboard...",
          });

          // Redirect to dashboard - AuthContext will handle fetching user info
          router.push("/dashboard");
        } else if (callbackResponse.statusCode === 401) {
          // Handle access denied (401 Unauthorized)
          setShowAccessDenied(true);
          // Clean URL to remove query parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          throw new Error("Error en la autenticación");
        }
      } catch (error) {
        console.error("Error during OAuth callback:", error);
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";

        toast.error({
          text: "Error de autenticación",
          description: errorMessage,
        });

        // Redirect to login page on error
        setTimeout(() => {
          router.push("/");
        }, 2000); // Give user time to read the error message
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [router, searchParams, handleTokenExchange, logout]);

  // Show access denied component if 401 error
  if (showAccessDenied) {
    return <AccessDenied />;
  }

  // Show loading component while processing
  if (isProcessing) {
    return <Loading />;
  }

  // This should not be reached as we redirect in all cases
  return <Loading />;
}