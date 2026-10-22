import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';

// Code splitting: cada pantalla es un chunk que se descarga al visitarla
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const ProductsListPage = lazy(() => import('@/pages/products/ProductsListPage'));
const ProductDetailPage = lazy(() => import('@/pages/products/ProductDetailPage'));
const ProductCreatePage = lazy(() => import('@/pages/products/ProductCreatePage'));
const ProductEditPage = lazy(() => import('@/pages/products/ProductEditPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/products" element={<ProductsListPage />} />
        {/* `new` es un slug reservado en el backend: nunca choca con /products/:slug */}
        <Route path="/products/new" element={<ProductCreatePage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/products/:slug/edit" element={<ProductEditPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
