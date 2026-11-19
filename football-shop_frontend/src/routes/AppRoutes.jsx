import { lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import LoginPage from '@/pages/auth/LoginPage';
import ProtectedRoute from '@/routes/ProtectedRoute';
import MainLayout from '@/layouts/MainLayout';
import { useAuth } from '@/hooks/useAuth';

// Code splitting: cada pantalla es un chunk que se descarga al visitarla
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const ProductsListPage = lazy(() => import('@/pages/products/ProductsListPage'));
const ProductCreatePage = lazy(() => import('@/pages/products/ProductCreatePage'));
const ProductEditPage = lazy(() => import('@/pages/products/ProductEditPage'));
const CategoriesPage = lazy(() => import('@/pages/categories/CategoriesPage'));
const CategoryFormPage = lazy(() => import('@/pages/categories/CategoryFormPage'));
const BrandsPage = lazy(() => import('@/pages/brands/BrandsPage'));
const BrandFormPage = lazy(() => import('@/pages/brands/BrandFormPage'));
const VariantsPage = lazy(() => import('@/pages/variants/VariantsPage'));
const VariantFormPage = lazy(() => import('@/pages/variants/VariantFormPage'));
const ImagesPage = lazy(() => import('@/pages/images/ImagesPage'));
const ImageFormPage = lazy(() => import('@/pages/images/ImageFormPage'));
const RolesPage = lazy(() => import('@/pages/roles/RolesPage'));
const UsersPage = lazy(() => import('@/pages/users/UsersPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function PublicRoute() {
  const { isAuthenticated, isAdmin, canManageCatalog } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    const requestedPath = location.state?.from;
    const isAdminPath =
      requestedPath && ['/roles', '/users'].some((path) =>
        requestedPath === path || requestedPath.startsWith(`${path}/`)
      );
    const canOpenRequestedPath =
      requestedPath &&
      (isAdmin || (canManageCatalog && !isAdminPath) || requestedPath === '/products');
    const destination = canOpenRequestedPath
      ? requestedPath
      : canManageCatalog
        ? '/'
        : '/products';

    return <Navigate to={destination} replace />;
  }

  return <LoginPage />;
}

function RoleAwareNotFound() {
  const { isAdmin } = useAuth();
  return isAdmin ? <NotFoundPage /> : <Navigate to="/products" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/products" element={<ProductsListPage />} />

          <Route element={<ProtectedRoute catalogOnly />}>
            <Route index element={<DashboardPage />} />
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/products/new" element={<ProductCreatePage />} />
            <Route path="/products/:id/edit" element={<ProductEditPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/new" element={<CategoryFormPage />} />
            <Route path="/categories/:id/edit" element={<CategoryFormPage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/brands/new" element={<BrandFormPage />} />
            <Route path="/brands/:id/edit" element={<BrandFormPage />} />
            <Route path="/variants" element={<VariantsPage />} />
            <Route path="/variants/new" element={<VariantFormPage />} />
            <Route path="/variants/:id/edit" element={<VariantFormPage />} />
            <Route path="/images" element={<ImagesPage />} />
            <Route path="/images/new" element={<ImageFormPage />} />
            <Route path="/images/:id/edit" element={<ImageFormPage />} />
          </Route>

          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/roles/new" element={<RolesPage />} />
            <Route path="/roles/:id/edit" element={<RolesPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/new" element={<UsersPage />} />
            <Route path="/users/:id/edit" element={<UsersPage />} />
          </Route>

          <Route path="*" element={<RoleAwareNotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
