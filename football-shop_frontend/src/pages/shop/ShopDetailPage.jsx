import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import ShopHeader from '@/components/shop/ShopHeader';
import { shopService } from '@/services/shopService';
import { formatPrice, getProductPrice, getProductStock } from '@/utils/format';

const sizeOrder = ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const variantValue = (variant) =>
  String(variant.attributes?.color || variant.attributes?.size || variant.name || '')
    .replace(/^talla\s*/i, '')
    .trim();

const compareVariants = (left, right) => {
  const leftValue = variantValue(left);
  const rightValue = variantValue(right);
  const leftNumber = Number(leftValue);
  const rightNumber = Number(rightValue);
  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) return leftNumber - rightNumber;

  const leftSize = sizeOrder.indexOf(leftValue.toUpperCase());
  const rightSize = sizeOrder.indexOf(rightValue.toUpperCase());
  if (leftSize !== -1 && rightSize !== -1) return leftSize - rightSize;

  return leftValue.localeCompare(rightValue, 'es', { numeric: true, sensitivity: 'base' });
};

const sortVariants = (variants = []) => [...variants].sort(compareVariants);

export default function ShopDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setProduct(null);
    setSelectedVariant(null);
    shopService.getProductBySlug(slug)
      .then((data) => {
        if (!active) return;
        setProduct(data);
        setSelectedVariant(null);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [slug]);

  const primaryImage = product?.images?.find((image) => image.is_primary)?.url || product?.images?.[0]?.url;
  const variants = sortVariants(product?.variants);
  const stock = selectedVariant
    ? Number(selectedVariant.stock || 0)
    : variants.length > 1
      ? null
      : product
        ? getProductStock(product)
        : 0;
  const price = selectedVariant?.price ?? (variants.length > 1 ? null : product ? getProductPrice(product) : 0);

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-white">
      <ShopHeader compact />

      <div className="mx-auto max-w-[1200px] px-5 py-8">
        <Button asChild variant="ghost" className="-ml-3 mb-5">
          <Link to="/shop"><FiArrowLeft aria-hidden="true" /> Volver al catálogo</Link>
        </Button>

        {loading && <div className="h-96 animate-pulse rounded-3xl bg-white/5" />}
        {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-200">{error}</div>}

        {!loading && product && (
          <section className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
            <div className="grid aspect-square place-items-center overflow-hidden rounded-3xl border border-white/10 bg-[#151516]">
              {primaryImage ? (
                <img src={primaryImage} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <FiShoppingBag size={72} className="text-white/15" />
              )}
            </div>

            <div className="lg:py-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[hsl(var(--gold))]">
                {product.brand_id?.name || product.category_id?.name}
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight">{product.name}</h1>
              {product.description && <p className="mt-5 leading-7 text-white/65">{product.description}</p>}

              {variants.length > 1 && (
                <div className="mt-7">
                  <label htmlFor="product-variant" className="mb-2 block text-sm font-semibold">
                    Variante
                  </label>
                  <Select
                    id="product-variant"
                    value={selectedVariant?._id || ''}
                    onChange={(event) => {
                      const variant = variants.find((item) => item._id === event.target.value);
                      setSelectedVariant(variant || null);
                    }}
                    className="h-12 border-white/10 bg-[#151516] text-white"
                  >
                    <option value="" disabled>Selecciona una variante</option>
                    {variants.map((variant) => (
                      <option key={variant._id} value={variant._id}>
                        {variant.name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-3xl font-bold">{price === null ? '—' : formatPrice(price)}</p>
                <p className={`mt-2 text-sm ${stock === null ? 'text-white/55' : stock > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {stock === null
                    ? 'Selecciona una variante'
                    : stock > 0
                      ? `${stock} unidades disponibles`
                      : 'Agotado'}
                </p>
                <Button size="lg" className="mt-6 w-full" disabled={stock === null || stock <= 0}>
                  Añadir al carrito
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
