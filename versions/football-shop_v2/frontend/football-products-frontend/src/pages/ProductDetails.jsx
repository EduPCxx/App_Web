import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Loading from '../components/Loading';
import StockBadge from '../components/StockBadge';
import useProduct from '../hooks/useProduct';
import useProducts from '../hooks/useProducts';
import { formatDate, formatPrice } from '../utils/format';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(id);
  const { removeProduct } = useProducts();
  const [actionError, setActionError] = useState('');

  async function remove() {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await removeProduct(id);
      navigate('/products');
    } catch (err) {
      setActionError(err.message);
    }
  }

  if (loading) return <Loading />;
  if (error) return <div className="alert error">{error}<Link to="/products">Volver al listado</Link></div>;

  return (
    <section className="detail-page">
      <Link className="back-link" to="/products">← Volver a productos</Link>
      {actionError && <div className="alert error">{actionError}</div>}

      <div className="detail-hero card">
        <span className="tag">{product.category}</span>
        <h1>{product.name}</h1>
        <p className="muted">{product.team} · {product.brand}</p>
        <div className="price">{formatPrice(product.price)} <StockBadge stock={product.stock} /></div>
      </div>

      <div className="card detail-body">
        <h2>Descripción</h2>
        <p>{product.description}</p>
        <dl className="metadata">
          <div><dt>Talla / tamaño</dt><dd>{product.size}</dd></div>
          <div><dt>Stock</dt><dd>{product.stock}</dd></div>
          <div><dt>ID</dt><dd>{product._id}</dd></div>
          <div><dt>Creado</dt><dd>{formatDate(product.createdAt)}</dd></div>
          <div><dt>Última actualización</dt><dd>{formatDate(product.updatedAt)}</dd></div>
        </dl>
        <div className="form-actions">
          <Link className="button" to={`/products/${id}/edit`}>Editar</Link>
          <button className="button button-danger" onClick={remove}>Eliminar</button>
        </div>
      </div>
    </section>
  );
}
