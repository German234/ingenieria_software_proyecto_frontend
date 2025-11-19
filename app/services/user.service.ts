import { api } from "../lib/api";

import {
  ActivateAccountRequirements,
  AuthResponse,
  CallbackResponse,
  RequestPassResponse,
  UserEdited,
  KeycloakTokenResponse,
  KeycloakUserInfo,
  UserInfo,
  KeycloakConfig,
} from "../types/types";

export const activeProfile = async (
  usuario: ActivateAccountRequirements
): Promise<ActivateAccountRequirements> => {
  const response = await api.put<ActivateAccountRequirements>(
    "/users/profile/me",
    usuario
  );

  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const updateUser = async (user: UserEdited): Promise<UserEdited> => {
  const response = await api.patch<UserEdited>(`/users/${user._id}`, user);
  return response.data;
};

export const requestPasswordReset = async (
  email: string,
  token: string
): Promise<RequestPassResponse> => {
  const response = await api.post<RequestPassResponse>(
    "/users/request-password-reset",
    { email, token },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  try {
    const response = await api.post("/users/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  } catch {
    throw new Error("Error al restablecer la contraseña");
  }
};

export const login = async (
  email: string,
  password: string,
  recaptchaToken: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/users/login",
    { email, password, recaptchaToken },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

export const getLogin = async (): Promise<any> => {
  try {
    const response = await api.get<any>("/auth/login");
    return response.data;
  }
  catch (error) {
    console.error(error);
    throw new Error("Error al iniciar sesión con Keycloak");
  }
}

// Keycloak configuration
const getKeycloakConfig = (): KeycloakConfig => {
  // Use a default value for redirectUri if we're in a server context
  const redirectUri = process.env.NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI ||
    (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'http://localhost:3000/auth/callback');

  return {
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'frontend-client',
    clientSecret: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET || '',
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'refuerzo',
    serverUrl: process.env.NEXT_PUBLIC_KEYCLOAK_SERVER_URL || 'https://auth.refuerzo-mendoza.me',
    redirectUri
  };
};

/**
 * Exchange authorization code for access tokens with Keycloak
 */
export const exchangeCodeForTokens = async (code: string): Promise<KeycloakTokenResponse> => {
  const config = getKeycloakConfig();
  const tokenEndpoint = `${config.serverUrl}/realms/${config.realm}/protocol/openid-connect/token`;

  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', config.redirectUri);
  params.append('client_id', config.clientId);

  if (config.clientSecret) {
    params.append('client_secret', config.clientSecret);
  }

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<KeycloakTokenResponse>;
};

/**
 * Get user information from Keycloak
 */
export const getKeycloakUserInfo = async (accessToken: string): Promise<KeycloakUserInfo> => {
  const config = getKeycloakConfig();
  const userInfoEndpoint = `${config.serverUrl}/realms/${config.realm}/protocol/openid-connect/userinfo`;

  const response = await fetch(userInfoEndpoint, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get user info: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<KeycloakUserInfo>;
};

/**
 * Convert Keycloak user info to application UserInfo format
 */
export const convertKeycloakUserToAppUser = (keycloakUser: KeycloakUserInfo): UserInfo => {
  // Extract roles from Keycloak user or use default role
  const roles = keycloakUser.roles || [];
  const role = roles.includes('admin') ? 'admin' :
    roles.includes('tutor') ? 'tutor' :
      roles.includes('alumno') ? 'alumno' : 'user';

  return {
    id: keycloakUser.sub,
    nombreCompleto: keycloakUser.name || keycloakUser.preferred_username || 'Unknown User',
    email: keycloakUser.email || '',
    image: keycloakUser.picture || '/default-avatar.jpg',
    isActive: true,
    role: role
  };
};

/**
 * Refresh Keycloak access token
 */
export const refreshKeycloakToken = async (refreshToken: string): Promise<KeycloakTokenResponse> => {
  const config = getKeycloakConfig();
  const tokenEndpoint = `${config.serverUrl}/realms/${config.realm}/protocol/openid-connect/token`;

  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);
  params.append('client_id', config.clientId);

  if (config.clientSecret) {
    params.append('client_secret', config.clientSecret);
  }

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refresh token: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<KeycloakTokenResponse>;
};

/**
 * Handle OAuth callback by calling the API endpoint
 */
export const handleAuthCallback = async (code: string, state?: string): Promise<CallbackResponse> => {
  try {
    const response = await api.get<CallbackResponse>(
      `/auth/callback?code=${code}${state ? `&state=${state}` : ''}`
    );

    return response.data;
  } catch (error: any) {
    // Handle HTTP errors and extract status code
    if (error.response) {
      return {
        statusCode: error.response.status,
        data: error.response.data?.message || "Error en la autenticación",
      };
    }
    
    // Handle network errors or other exceptions
    return {
      statusCode: 500,
      data: error.message || "Error desconocido",
    };
  }
};

/**
 * Get user information from the API using the access token
 */
export const getUserInfo = async (): Promise<UserInfo> => {
  const response = await api.get<UserInfo>("/auth/me");
  return response.data;
};
