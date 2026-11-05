import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { productService } from '@/services/productService';
import { notifyError } from '@/utils/alerts';

export const AppContext = createContext(null);

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

  return (
    <AppContext.Provider value={{ products, setProducts, loading, error, loadProducts }}>
      {children}
    </AppContext.Provider>
  );
}
