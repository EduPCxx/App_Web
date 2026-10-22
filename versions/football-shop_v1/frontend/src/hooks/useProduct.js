import { useEffect, useState } from 'react';
import { productService } from '../services/productService';

export default function useProduct(id) {
  const [state, setState] = useState({ product: null, loading: true, error: '' });

  useEffect(() => {
    let ignore = false;
    setState({ product: null, loading: true, error: '' });
    productService
      .get(id)
      .then((product) => !ignore && setState({ product, loading: false, error: '' }))
      .catch((err) => !ignore && setState({ product: null, loading: false, error: err.message }));
    return () => { ignore = true; };
  }, [id]);

  return state;
}
