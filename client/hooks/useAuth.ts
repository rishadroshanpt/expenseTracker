import { useState, useCallback, useEffect } from "react";
import { User, AuthResponse, SignUpRequest, LoginRequest } from "@shared/api";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
    loading: true,
    error: null,
  });

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data: AuthResponse = await response.json();
            setState({
              user: data.user,
              token,
              loading: false,
              error: null,
            });
          } else {
            // Token is invalid, clear it
            localStorage.removeItem("token");
            setState({
              user: null,
              token: null,
              loading: false,
              error: null,
            });
          }
        } catch (error) {
          console.error("Auth check error:", error);
          setState({
            user: null,
            token: null,
            loading: false,
            error: null,
          });
        }
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
        }));
      }
    };

    checkAuth();
  }, []);

  const signup = useCallback(async (data: SignUpRequest) => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Signup failed");
      }

      const authData: AuthResponse = await response.json();
      localStorage.setItem("token", authData.token);

      setState({
        user: authData.user,
        token: authData.token,
        loading: false,
        error: null,
      });

      return authData;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Signup failed";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const authData: AuthResponse = await response.json();
      localStorage.setItem("token", authData.token);

      setState({
        user: authData.user,
        token: authData.token,
        loading: false,
        error: null,
      });

      return authData;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setState({
      user: null,
      token: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    signup,
    login,
    logout,
    isAuthenticated: !!state.user,
  };
}
