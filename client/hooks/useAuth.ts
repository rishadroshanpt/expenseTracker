import { useState, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { SignUpRequest, LoginRequest } from "@shared/api";

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL || "",
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          setState({
            user: null,
            loading: false,
            error: null,
          });
        } else {
          setState({
            user: {
              id: session.user.id,
              email: session.user.email || "",
            },
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setState({
          user: null,
          loading: false,
          error: null,
        });
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setState({
          user: {
            id: session.user.id,
            email: session.user.email || "",
          },
          loading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signup = useCallback(async (data: SignUpRequest) => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (authData.user) {
        setState({
          user: {
            id: authData.user.id,
            email: authData.user.email || "",
          },
          loading: false,
          error: null,
        });
      }

      return { user: authData.user };
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
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (authData.user) {
        setState({
          user: {
            id: authData.user.id,
            email: authData.user.email || "",
          },
          loading: false,
          error: null,
        });
      }

      return { user: authData.user };
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

  const logout = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      setState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Logout failed";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signup,
    login,
    logout,
    isAuthenticated: !!state.user,
  };
}
