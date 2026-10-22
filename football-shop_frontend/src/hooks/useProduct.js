import { useCallback, useEffect, useRef, useState } from 'react';
import useAppContext from '@/hooks/useAppContext';
import { productService } from '@/services/productService';
import { notifyError } from '@/utils/alerts';

const LOADING = { product: null, loading: true, error: null, notFound: false };

// Producto por slug. Reutiliza el catálogo global si ya lo contiene; si no (enlace directo, más de
// 100 productos...) lo pide a la API. Un 404 no es un error de red: se expone como `notFound`.
export default function useProduct(slug) {
  const { products } = useAppContext();
  const cached = products.find((p) => p.slug === slug) ?? null;
  const cachedRef = useRef(cached);
  cachedRef.current = cached;

  const [remote, setRemote] = useState({ ...LOADING, slug: null });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    if (cachedRef.current) return undefined;

    let ignore = false;
    setRemote({ ...LOADING, slug });

    (async () => {
      try {
        const product = await productService.getBySlug(slug);
        if (!ignore) setRemote({ slug, product, loading: false, error: null, notFound: false });
      } catch (err) {
        if (ignore) return;
        const notFound = err.status === 404;
        setRemote({ slug, product: null, loading: false, error: notFound ? null : err.message, notFound });
        if (!notFound) await notifyError(err, 'No se pudo cargar el producto');
      }
    })();

    return () => {
      ignore = true;
    };
  }, [slug, attempt]);

  if (cached) return { product: cached, loading: false, error: null, notFound: false, retry };
  if (remote.slug !== slug) return { ...LOADING, retry };
  return { ...remote, retry };
}
