import { isSupabase } from './provider';
import { handleSupabaseRequest } from './supabaseAdapter';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';
const TOKEN_KEY = 'auth_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(method, path, body) {
  if (isSupabase) {
    return handleSupabaseRequest(method, path, body);
  }

  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (res.status === 401) {
    // Se havia token é sessão expirada, senão são credenciais inválidas
    if (getToken()) {
      removeToken();
      window.location.href = '/login';
    }
    throw new Error(data?.error ?? data?.message ?? 'E-mail ou senha inválidos.');
  }

  if (!res.ok) {
    throw new Error(data?.error ?? data?.message ?? `Erro ${res.status}.`);
  }

  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
};
