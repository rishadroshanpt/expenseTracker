import { useState, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { SignUpRequest, LoginRequest } from "@shared/api";

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "Missing Supabase environment variables. Make sure VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY are set."
  );
}

const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_ANON_KEY || "placeholder-key"
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
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
          console.error(
            "Supabase credentials missing:",
            { SUPABASE_URL, SUPABASE_ANON_KEY }
          );
          setState({
            user: null,
            loading: false,
            error:
              "Supabase not configured. Check environment variables.",
          });
          return;
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session check error:", error);
          setState({
            user: null,
            loading: false,
            error: null,
          });
        } else if (session) {
          console.log("User session found:", session.user.email);
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
      console.log("Attempting signup with email:", data.email);
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error("Signup error from Supabase:", error);
        throw new Error(error.message);
      }

      console.log("Signup successful:", authData.user?.email);

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
      console.error("Signup catch error:", errorMessage);
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
