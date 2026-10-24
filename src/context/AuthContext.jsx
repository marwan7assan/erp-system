import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase, isSupabaseConfigured } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      const session = data?.session;

      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email,
              name:
                session.user.user_metadata?.name ||
                session.user.email,
            }
          : null
      );
    } catch (error) {
      console.error("Failed to restore session:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();

    if (!isSupabaseConfigured) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email,
              name:
                session.user.user_metadata?.name ||
                session.user.email,
            }
          : null
      );

      setIsLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, [refreshSession]);

  const login = async (email, password) => {
    if (!isSupabaseConfigured) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables."
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) throw error;

    const loggedInUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || data.user.email,
    };

    setUser(loggedInUser);
    return loggedInUser;
  };

  const signup = async (name, email, password) => {
    if (!isSupabaseConfigured) {
      throw new Error(
        "Supabase is not configured. Please check your environment variables."
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name.trim(),
        },
      },
    });

    if (error) throw error;

    // Supabase returns empty identities array when email confirmation is enabled and user already exists
    if (
      data.user &&
      Array.isArray(data.user.identities) &&
      data.user.identities.length === 0
    ) {
      throw new Error("This email is already registered.");
    }

    if (data.session && data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || data.user.email,
      });
    }

    return data;
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
