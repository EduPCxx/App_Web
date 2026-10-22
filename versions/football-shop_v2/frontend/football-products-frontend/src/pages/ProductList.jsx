import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import ProductCard from '../components/ProductCard';
import useProducts from '../hooks/useProducts';

export default function ProductList() {
  const { products, loading, error, loadProducts, removeProduct } = useProducts();
  const [actionError, setActionError] = useState('');

  useEffect(() => { loadProducts(); }, [loadProducts]);

  async function remove(product) {
    if (!window.confirm(`¿Eliminar “${product.name}”?`)) return;
    setActionError('');
    try {
      await removeProduct(product._id);
    } catch (err) {
      setActionError(err.message);
    }
  }

  const message = error || actionError;

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

      {message && <div className="alert error">{message}<button onClick={loadProducts}>Reintentar</button></div>}

      {loading ? <Loading /> : products.length === 0 ? (
        <div className="empty card">
          <h2>No hay productos todavía</h2>
          <p>Crea el primer producto para empezar.</p>
          <Link className="button" to="/products/new">Crear producto</Link>
        </div>
      ) : (
        <div className="product-list">
          {products.map((product) => <ProductCard key={product._id} product={product} onDelete={remove} />)}
        </div>
      )}
    </section>
  );
}
