import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedRoute({ adminOnly = false, catalogOnly = false }) {
  const { isAuthenticated, isAdmin, canManageCatalog } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/products" replace />;
  }

  if (catalogOnly && !canManageCatalog) {
    return <Navigate to="/products" replace />;
  }

  return <Outlet />;
}
