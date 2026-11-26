import { Link } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { formatPrice, getProductPrice, getProductStock } from '@/utils/format';

/**
 * @param {{ product: { _id: string, slug: string, name: string, images?: Array<{url: string, is_primary?: boolean}>, brand_id?: {name: string}, category_id?: {name: string}, variants?: Array<{price: number|string, stock: number, is_default?: boolean}> } }} props
 */
export default function ProductCard({ product }) {
  const image = product.images?.find((item) => item.is_primary)?.url || product.images?.[0]?.url;
  const stock = getProductStock(product);

  return (
    <Link
      to={`/shop/${product.slug}`}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-[#121213] hover:border-[hsl(var(--gold)/0.55)]"
    >
      <div className="aspect-[4/3] overflow-hidden bg-[#1a1a1b]">
        {image ? (
          <img src={image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="grid h-full place-items-center text-white/20"><FiShoppingBag size={42} aria-hidden="true" /></div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-[hsl(var(--gold))]">{product.brand_id?.name || product.category_id?.name || 'Football Shop'}</p>
        <h2 className="mt-1 text-lg font-bold">{product.name}</h2>
        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="text-xl font-bold">{formatPrice(getProductPrice(product))}</p>
          <p className={`text-xs ${stock > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
            {stock > 0 ? `${stock} en stock` : 'Agotado'}
          </p>
        </div>
      </div>
    </Link>
  );
}
