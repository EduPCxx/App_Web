import { createContext, useCallback, useMemo, useState } from 'react';
import { setApiToken } from '@/services/apiService';

export const AuthContext = createContext(null);

// Arquitectura de autenticación preparada, sin implementar: cuando exista login en la API basta con
// llamar a login({ token, profile }). El token se añade a todas las peticiones (apiService)
// y `user` se muestra en la barra superior.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback(({ token, profile }) => {
    setApiToken(token);
    setUser(profile || null);
  }, []);

  const logout = useCallback(() => {
    setApiToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, isAuthenticated: Boolean(user), login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
