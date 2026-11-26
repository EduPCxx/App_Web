import { useRef } from 'react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import ProductCard from '@/components/shop/ProductCard';

/**
 * @param {{ products: Array<object> }} props
 */
export default function ProductCarousel({ products }) {
  const trackRef = useRef(null);

  const scroll = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <section aria-label="Productos destacados">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[hsl(var(--gold))]">Selección de la tienda</p>
          <h2 className="mt-1 text-2xl font-bold">Destacados</h2>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => scroll(-1)} aria-label="Productos anteriores" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 hover:border-[hsl(var(--gold))]">
            <FiArrowLeft aria-hidden="true" />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Productos siguientes" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 hover:border-[hsl(var(--gold))]">
            <FiArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>
      <div ref={trackRef} className="grid auto-cols-[minmax(245px,1fr)] grid-flow-col gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:thin]">
        {products.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>
    </section>
  );
}
