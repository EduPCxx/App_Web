import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';

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

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/products" element={<ProductsListPage />} />
        {/* `new` queda fuera del formato ObjectId usado por la ruta dinámica. */}
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
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/roles/new" element={<RolesPage />} />
        <Route path="/roles/:id/edit" element={<RolesPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/new" element={<UsersPage />} />
        <Route path="/users/:id/edit" element={<UsersPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
