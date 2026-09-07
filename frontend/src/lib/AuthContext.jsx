import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api, setToken, removeToken, getToken } from '@/api/httpClient';
import { setCurrentUserEmail } from '@/utils/currentUser';
import { isSupabase } from '@/api/provider';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Helper para buscar o perfil em public.users no Supabase
  const fetchSupabaseProfile = async (authUser) => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      return {
        id: authUser.id,
        email: authUser.email,
        full_name: data?.full_name || authUser.user_metadata?.full_name || authUser.email.split('@')[0],
        role: data?.role || 'user',
        status: data?.status || 'active',
      };
    } catch {
      return {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
        role: 'user',
        status: 'active',
      };
    }
  };

  const checkUserAuth = useCallback(async () => {
    if (isSupabase) {
      if (!supabase) {
        setIsLoadingAuth(false);
        setAuthChecked(true);
        return;
      }
      try {
        setIsLoadingAuth(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) {
          setUser(null);
          setIsAuthenticated(false);
        } else {
          const profile = await fetchSupabaseProfile(session.user);
          setUser(profile);
          setIsAuthenticated(true);
          setCurrentUserEmail(session.user.email);
        }
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuth(false);
        setAuthChecked(true);
      }
      return;
    }

    // Provedor Custom (Backend Express atual)
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

    if (isSupabase && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profile = await fetchSupabaseProfile(session.user);
          setUser(profile);
          setIsAuthenticated(true);
          setCurrentUserEmail(session.user.email);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [checkUserAuth]);

  const login = async (email, password) => {
    if (isSupabase) {
      if (!supabase) throw new Error('Supabase não está configurado. Verifique as variáveis de ambiente.');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });
      if (error) {
        throw new Error(error.message === 'Invalid login credentials' ? 'E-mail ou senha inválidos.' : error.message);
      }
      const profile = await fetchSupabaseProfile(data.user);
      setUser(profile);
      setIsAuthenticated(true);
      setCurrentUserEmail(data.user.email);
      return profile;
    }

    // Provedor Custom (Express)
    const { user: me, token } = await api.post('/auth/login', { email, password });
    setToken(token);
    setUser(me);
    setIsAuthenticated(true);
    setCurrentUserEmail(me.email);
    return me;
  };

  const register = async (fullName, email, password) => {
    if (isSupabase) {
      if (!supabase) throw new Error('Supabase não está configurado. Verifique as variáveis de ambiente.');
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) throw new Error(error.message);
      const profile = await fetchSupabaseProfile(data.user);
      setUser(profile);
      setIsAuthenticated(true);
      setCurrentUserEmail(data.user.email);
      return profile;
    }

    // Provedor Custom (Express)
    const { user: me, token } = await api.post('/auth/register', { full_name: fullName, email, password });
    setToken(token);
    setUser(me);
    setIsAuthenticated(true);
    setCurrentUserEmail(me.email);
    return me;
  };

  const logout = async () => {
    if (isSupabase && supabase) {
      await supabase.auth.signOut();
    } else {
      removeToken();
    }
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
