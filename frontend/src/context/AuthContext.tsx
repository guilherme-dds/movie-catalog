import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User, AuthResponse } from "../types";
import { loginApi, registerApi, refreshTokenApi } from "../api/backend";

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (nome: string, email: string, pass: string) => Promise<void>;
  refreshSession: () => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_refresh_token");
    localStorage.removeItem("auth_user");
  }, []);

  const refreshSession = useCallback(async (): Promise<string | null> => {
    const storedRefreshToken = refreshToken || localStorage.getItem("auth_refresh_token");
    if (!storedRefreshToken) {
      logout();
      return null;
    }

    try {
      const data = await refreshTokenApi(storedRefreshToken);
      setToken(data.token);
      localStorage.setItem("auth_token", data.token);

      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
        localStorage.setItem("auth_refresh_token", data.refreshToken);
      }

      return data.token;
    } catch (err) {
      console.error("Erro ao renovar token de acesso:", err);
      logout();
      return null;
    }
  }, [refreshToken, logout]);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedRefreshToken = localStorage.getItem("auth_refresh_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Erro ao restaurar sessão:", err);
        logout();
      }
    }
    setIsLoading(false);
  }, [logout]);

  const login = async (email: string, pass: string) => {
    const data: AuthResponse = await loginApi(email, pass);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));

    if (data.refreshToken) {
      setRefreshToken(data.refreshToken);
      localStorage.setItem("auth_refresh_token", data.refreshToken);
    }
  };

  const register = async (nome: string, email: string, pass: string) => {
    await registerApi(nome, email, pass);
    // Auto login after registration
    await login(email, pass);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
