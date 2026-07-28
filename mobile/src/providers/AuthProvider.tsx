import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { IUser } from '../@types/models';
import { authService } from '../services/authService';
import { setUnauthorizedHandler } from '../services/httpClient';
import { storage } from '../utils/storage';

interface IAuthContext {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await storage.removeToken();
      setUser(null);
    });
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const token = await storage.getToken();
      if (!token) return;
      const me = await authService.me();
      setUser(me);
    } catch {
      await storage.removeToken();
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: loggedUser } = await authService.login({ email, password });
    await storage.setToken(token);
    setUser(loggedUser);
  }, []);

  const register = useCallback(async (full_name: string, email: string, password: string) => {
    const { token, user: newUser } = await authService.register({ full_name, email, password });
    await storage.setToken(token);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    await storage.removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoadingAuth,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): IAuthContext {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
