import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { setApiToken } from '@/services/apiService';

const AUTH_STORAGE_KEY = 'football-shop-auth';

const readStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw);
    return { token: parsed.token || null, user: parsed.user || null };
  } catch {
    return { token: null, user: null };
  }
};

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const initialAuth = useMemo(() => readStoredAuth(), []);
  const [token, setToken] = useState(initialAuth.token);
  const [user, setUser] = useState(initialAuth.user);

  useEffect(() => {
    setApiToken(token);

    if (typeof window !== 'undefined') {
      if (token && user) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, [token, user]);

  useEffect(() => {
    const handleSessionExpired = () => {
      setToken(null);
      setUser(null);
      setApiToken(null);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        window.location.assign('/login');
      }
    };

    window.addEventListener('auth:expired', handleSessionExpired);
    return () => window.removeEventListener('auth:expired', handleSessionExpired);
  }, []);

  const login = useCallback(({ token: nextToken, user: nextUser }) => {
    setToken(nextToken || null);
    setUser(nextUser || null);
    setApiToken(nextToken || null);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setApiToken(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const logoutAll = useCallback(async () => {
    if (!token) {
      return { success: true, message: 'No hay sesión activa' };
    }

    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/logout-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
    } catch {
      // Si la API falla, seguimos limpiando la sesión local.
    }

    logout();
    return { success: true, message: 'Sesión cerrada correctamente' };
  }, [token, logout]);

  const role =
    typeof user?.role === 'string'
      ? user.role
      : typeof user?.role_id?.name === 'string'
        ? user.role_id.name
        : null;
  const normalizedRole = role?.toLowerCase();

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      role,
      isAdmin: normalizedRole === 'admin',
      isEditor: normalizedRole === 'editor',
      canManageCatalog: normalizedRole === 'admin' || normalizedRole === 'editor',
      login,
      logout,
      logoutAll
    }),
    [token, user, role, normalizedRole, login, logout, logoutAll]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
