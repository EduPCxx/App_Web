export default function StockBadge({ stock }) {
  return stock > 0
    ? <span className="badge badge-ok">{stock} en stock</span>
    : <span className="badge badge-out">Agotado</span>;
}
