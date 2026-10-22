import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import ProductList from '../pages/ProductList';
import ProductDetails from '../pages/ProductDetails';
import ProductCreate from '../pages/ProductCreate';
import ProductEdit from '../pages/ProductEdit';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={<ProductCreate />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/products/:id/edit" element={<ProductEdit />} />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Route>
    </Routes>
  );
}
