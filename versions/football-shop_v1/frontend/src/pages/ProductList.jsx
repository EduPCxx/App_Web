import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import { productService } from '../services/productService';

export default function ProductList() {
  const [filters, setFilters] = useState({ search: '', category: '', page: 1 });
  const [data, setData] = useState({ items: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    productService
      .list(filters)
      .then((result) => {
        if (ignore) return;
        // Si se vació la última página (p. ej. tras eliminar), retrocede una
        if (result.items.length === 0 && filters.page > 1) setFilters((f) => ({ ...f, page: f.page - 1 }));
        else setData(result);
      })
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));
    return () => { ignore = true; };
  }, [filters, reloadKey]);

  const updateFilters = (changes) => setFilters((current) => ({ ...current, page: 1, ...changes }));
  const reload = () => setReloadKey((key) => key + 1);

  async function remove(product) {
    if (!window.confirm(`¿Eliminar “${product.name}”?`)) return;
    try {
      await productService.remove(product._id);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">CATÁLOGO</p>
          <h1>Productos de fútbol</h1>
          <p className="muted">Camisetas, botas, balones, equipamiento y accesorios.</p>
        </div>
        <Link className="button" to="/products/new">+ Crear producto</Link>
      </div>

      <ProductFilters filters={filters} onChange={updateFilters} />

      {error && <div className="alert error">{error}<button onClick={reload}>Reintentar</button></div>}

      {loading ? <Loading /> : data.items.length === 0 ? (
        <div className="empty card">
          <h2>No se encontraron productos</h2>
          <p>Prueba con otros filtros o crea un producto nuevo.</p>
        </div>
      ) : (
        <>
          <div className="product-list">
            {data.items.map((product) => <ProductCard key={product._id} product={product} onDelete={remove} />)}
          </div>
          <Pagination pagination={data.pagination} onChange={(page) => updateFilters({ page })} />
        </>
      )}
    </section>
  );
}
