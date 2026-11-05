import { useCallback } from 'react';
import useAppContext from '@/hooks/useAppContext';
import { productService } from '@/services/productService';
import { notifyError } from '@/utils/alerts';

export default function useProducts() {
  const { products, setProducts, loading, error, loadProducts } = useAppContext();

  const replaceProduct = useCallback(
    (updated) =>
      setProducts((current) => current.map((product) => (product._id === updated._id ? updated : product))),
    [setProducts]
  );

  const createProduct = useCallback(async (form) => {
    try {
      const created = await productService.create(form);
      setProducts((current) => [created, ...current]);
      return created;
    } catch (err) {
      await notifyError(err, 'No se pudo crear el producto');
      return null;
    }
  }, [setProducts]);

  const updateProduct = useCallback(async (id, form) => {
    try {
      const updated = await productService.update(id, form);
      replaceProduct(updated);
      return updated;
    } catch (err) {
      await notifyError(err, 'No se pudo actualizar el producto');
      return null;
    }
  }, [replaceProduct]);

  const setProductActive = useCallback(async (id, isActive) => {
    try {
      const updated = await productService.setActive(id, isActive);
      replaceProduct(updated);
      return updated;
    } catch (err) {
      await notifyError(err, 'No se pudo cambiar el estado del producto');
      return null;
    }
  }, [replaceProduct]);

  const removeProduct = useCallback(async (id) => {
    try {
      await productService.remove(id);
      setProducts((current) => current.filter((product) => product._id !== id));
      return true;
    } catch (err) {
      await notifyError(err, 'No se pudo eliminar el producto');
      return false;
    }
  }, [setProducts]);

  return {
    products,
    loading,
    error,
    loadProducts,
    createProduct,
    updateProduct,
    setProductActive,
    removeProduct,
  };
}
