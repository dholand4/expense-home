import { storage } from '../utils/storage';
import { isSupabase } from './provider';
import { handleSupabaseRequest } from './supabase/adapter';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api';
const TIMEOUT_MS = 10_000;

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

// Handler registrado pelo AuthProvider para logout automático no 401
let _onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void) {
  _onUnauthorized = handler;
}

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  if (isSupabase) {
    return handleSupabaseRequest<T>(method, path, body);
  }

  const token = await storage.getToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      const errorBody = await response.json().catch(() => null);
      // Só trata como sessão expirada se havia token (requisição autenticada)
      if (token) {
        await storage.removeToken();
        _onUnauthorized?.();
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      // Login com credenciais erradas → usa mensagem do backend
      throw new Error(errorBody?.error ?? errorBody?.message ?? 'E-mail ou senha inválidos.');
    }

    if (response.status >= 500) {
      throw new Error('Servidor indisponível. Tente novamente.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.error ?? error?.message ?? 'Erro na requisição.');
    }

    if (response.status === 204) return undefined as unknown as T;
    return response.json();
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Conexão lenta. Verifique sua internet e tente novamente.');
      }
      // TypeError: Network request failed → sem internet
      if (err.message === 'Network request failed') {
        throw new Error('Sem conexão com a internet.');
      }
      throw err;
    }
    throw new Error('Erro inesperado.');
  }
}

export const http = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
