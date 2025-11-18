import { api } from "./api";
import { toast } from "@pheralb/toast";

let isInterceptorSetup = false;

export const setupAxiosInterceptor = () => {
  if (typeof window === "undefined" || isInterceptorSetup) return;

  // Request interceptor
  api.interceptors.request.use(
    async (config) => {
      try {
        const { getSession } = await import("next-auth/react");
        const session = await getSession();

        console.log("Session data:", session);
        
        if (session?.token) {
          config.headers.Authorization = `Bearer ${session.token}`;
        }
      } catch (error) {
        console.error("Interceptor error (client-side only):", error);
      }
      return config;
    },
    (error) => {
      console.error("Request error:", error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("API Error:", error);

      if (error.response) {
        // El servidor respondió con un código de error
        const status = error.response.status;
        const message = error.response.data?.message || error.message;
        const url = error.config?.url || "";

        // Lista de endpoints que NO deben mostrar toast de error
        const silentEndpoints = [
          "/comments/support-material/",
          "/user-x-work-groups/me"
        ];

        // Verificar si el endpoint debe ser silencioso
        const isSilentEndpoint = silentEndpoints.some(endpoint => 
          url.includes(endpoint)
        );

        // Si es un endpoint silencioso y es 404 o 400, no mostrar toast
        if (isSilentEndpoint && (status === 404 || status === 400)) {
          console.log(`Silent ${status} for ${url}:`, message);
          return Promise.reject(error);
        }

        switch (status) {
          case 401:
            toast.error({
              text: "No autorizado",
              description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
            });
            break;
          case 403:
            toast.error({
              text: "Acceso denegado",
              description: "No tienes permisos para realizar esta acción. Verifica la configuración CORS del backend.",
            });
            break;
          case 404:
            toast.error({
              text: "No encontrado",
              description: message || "El recurso solicitado no existe.",
            });
            break;
          case 500:
            toast.error({
              text: "Error del servidor",
              description: "Ocurrió un error en el servidor. Intenta nuevamente más tarde.",
            });
            break;
          default:
            toast.error({
              text: `Error ${status}`,
              description: message || "Ocurrió un error inesperado.",
            });
        }
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        toast.error({
          text: "Error de conexión",
          description: "No se pudo conectar con el servidor. Verifica que el backend esté corriendo.",
        });
      } else {
        // Algo pasó al configurar la petición
        toast.error({
          text: "Error",
          description: error.message || "Ocurrió un error inesperado.",
        });
      }

      return Promise.reject(error);
    }
  );

  isInterceptorSetup = true;
};