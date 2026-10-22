import { createContext, useCallback, useMemo, useState } from 'react';
import { productService } from '../services/productService';

export const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setProducts(await productService.list());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Las mutaciones lanzan el error para que cada pantalla lo muestre.
  const createProduct = useCallback(async (form) => {
    const created = await productService.create(form);
    setProducts((current) => [created, ...current]);
    return created;
  }, []);

  const updateProduct = useCallback(async (id, form) => {
    const updated = await productService.update(id, form);
    setProducts((current) => current.map((p) => (p._id === id ? updated : p)));
    return updated;
  }, []);

  const removeProduct = useCallback(async (id) => {
    await productService.remove(id);
    setProducts((current) => current.filter((p) => p._id !== id));
  }, []);

  const value = useMemo(
    () => ({ products, loading, error, loadProducts, createProduct, updateProduct, removeProduct }),
    [products, loading, error, loadProducts, createProduct, updateProduct, removeProduct]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}
