"use client";

import { useAuthContext } from "@/app/contexts/AuthContext";
import { UserInfo } from "@/app/types/types";

interface UseAuthReturn {
  // Session data
  data: {
    user: UserInfo | null;
  } | null;
  // Session status
  status: "loading" | "authenticated" | "unauthenticated";
  // Authentication state
  loading: boolean;
  authenticated: boolean;
  // User info
  user: UserInfo | null;
  // Token
  token: string | null;
  // Actions
  login: (email: string, password: string, recaptchaToken: string) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Custom hook to access authentication context
 * Provides a similar interface to the old useSession hook from NextAuth
 */
export const useAuth = (): UseAuthReturn => {
  const { user, token, loading, authenticated, login, logout, setLoading } = useAuthContext();

  // Determine session status based on state
  let status: "loading" | "authenticated" | "unauthenticated";
  if (loading) {
    status = "loading";
  } else if (authenticated) {
    status = "authenticated";
  } else {
    status = "unauthenticated";
  }

  // Format data to match NextAuth useSession structure
  const data = user ? { user } : null;

  return {
    data,
    status,
    loading,
    authenticated,
    user,
    token,
    login,
    logout,
    setLoading,
  };
};

export default useAuth;