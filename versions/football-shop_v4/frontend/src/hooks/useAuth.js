import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
}
