import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api, setToken, removeToken, getToken } from '@/api/httpClient';
import { setCurrentUserEmail } from '@/utils/currentUser';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const checkUserAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return;
    }
    try {
      setIsLoadingAuth(true);
      const { user: me } = await api.get('/auth/me');
      setUser(me);
      setIsAuthenticated(true);
      setCurrentUserEmail(me.email);
    } catch {
      removeToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  const login = async (email, password) => {
    const { user: me, token } = await api.post('/auth/login', { email, password });
    setToken(token);
    setUser(me);
    setIsAuthenticated(true);
    setCurrentUserEmail(me.email);
    return me;
  };

  const register = async (fullName, email, password) => {
    const { user: me, token } = await api.post('/auth/register', { full_name: fullName, email, password });
    setToken(token);
    setUser(me);
    setIsAuthenticated(true);
    setCurrentUserEmail(me.email);
    return me;
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      // kept for compatibility with existing components that destructure these:
      isLoadingPublicSettings: false,
      authError: null,
      authChecked,
      login,
      register,
      logout,
      navigateToLogin,
      checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
