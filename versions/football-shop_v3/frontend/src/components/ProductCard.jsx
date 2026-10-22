import { Link } from 'react-router-dom';
import StockBadge from './StockBadge';
import { formatPrice } from '../utils/format';

export default function ProductCard({ product, onDelete }) {
  return (
    <article className="card product-card">
      <div className="product-topline">
        <span className="tag">{product.category}</span>
        <strong>{formatPrice(product.price)}</strong>
      </div>
      <h2>{product.name}</h2>
      <p className="muted">{product.team} · {product.brand} · Talla {product.size}</p>
      <StockBadge stock={product.stock} />
      <div className="card-actions">
        <Link className="button button-secondary" to={`/products/${product._id}`}>Ver detalle</Link>
        <Link className="button button-ghost" to={`/products/${product._id}/edit`}>Editar</Link>
        <button className="button button-danger" onClick={() => onDelete(product)}>Eliminar</button>
      </div>
    </article>
  );
}
