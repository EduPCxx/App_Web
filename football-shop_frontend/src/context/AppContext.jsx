import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { productService } from '@/services/productService';
import { notifyError } from '@/utils/alerts';

export const AppContext = createContext(null);

// Estado global del catálogo: se carga una sola vez y se reutiliza en todas las pantallas.
// Las acciones capturan sus errores (red, HTTP, validación), los muestran con SweetAlert2 y
// devuelven null/false si fallan, así que las pantallas no necesitan su propio try/catch.
export function AppProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loaded = useRef(false);
  const inFlight = useRef(null);

  const loadProducts = useCallback(({ force = false } = {}) => {
    if (inFlight.current) return inFlight.current; // evita peticiones duplicadas (p. ej. StrictMode)
    if (loaded.current && !force) return Promise.resolve();

    const request = (async () => {
      let failure = null;
      setLoading(true);
      setError(null);
      try {
        setProducts(await productService.list());
        loaded.current = true;
      } catch (err) {
        failure = err;
        setError(err.message);
      } finally {
        setLoading(false);
        inFlight.current = null;
      }
      if (failure) await notifyError(failure, 'No se pudieron cargar los productos');
    })();

    inFlight.current = request;
    return request;
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const replaceProduct = (updated) =>
    setProducts((current) => current.map((p) => (p._id === updated._id ? updated : p)));

  const createProduct = useCallback(async (form) => {
    try {
      const created = await productService.create(form);
      setProducts((current) => [created, ...current]);
      return created;
    } catch (err) {
      await notifyError(err, 'No se pudo crear el producto');
      return null;
    }
  }, []);

  // Si cambia el nombre, el backend regenera el slug: se sustituye por _id, no por slug.
  const updateProduct = useCallback(async (slug, form) => {
    try {
      const updated = await productService.update(slug, form);
      replaceProduct(updated);
      return updated;
    } catch (err) {
      await notifyError(err, 'No se pudo actualizar el producto');
      return null;
    }
  }, []);

  const setProductActive = useCallback(async (slug, isActive) => {
    try {
      const updated = await productService.setActive(slug, isActive);
      replaceProduct(updated);
      return updated;
    } catch (err) {
      await notifyError(err, 'No se pudo cambiar el estado del producto');
      return null;
    }
  }, []);

  // Borrado lógico en la API; aquí se quita del estado global.
  const removeProduct = useCallback(async (slug) => {
    try {
      await productService.remove(slug);
      setProducts((current) => current.filter((p) => p.slug !== slug));
      return true;
    } catch (err) {
      await notifyError(err, 'No se pudo eliminar el producto');
      return false;
    }
  }, []);

  const value = useMemo(
    () => ({ products, loading, error, loadProducts, createProduct, updateProduct, setProductActive, removeProduct }),
    [products, loading, error, loadProducts, createProduct, updateProduct, setProductActive, removeProduct]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
