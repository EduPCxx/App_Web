import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import EntityCarousel from '@/components/shop/EntityCarousel';
import ProductCarousel from '@/components/shop/ProductCarousel';
import ShopHeader from '@/components/shop/ShopHeader';
import { productService } from '@/services/productService';
import { shopService } from '@/services/shopService';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      productService.search({ page: 1, limit: 8, sortBy: 'createdAt', order: 'desc' }),
      shopService.listCategories(),
      shopService.listBrands()
    ])
      .then(([productResponse, categoryItems, brandItems]) => {
        if (!active) return;
        setProducts(productResponse.data);
        setCategories(categoryItems.filter((item) => item.isActive !== false && item.status === 'published'));
        setBrands(brandItems.filter((item) => item.isActive !== false && item.status === 'published'));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-white">
      <ShopHeader />
      <div className="mx-auto max-w-[1440px] space-y-12 px-5 py-8 md:py-12">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#24211a] via-[#161514] to-[#101011] px-6 py-12 md:px-12 md:py-20">
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[hsl(var(--gold))]">Football Shop</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-6xl">Todo empieza en el campo.</h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/65 md:text-lg">
              Equipaciones, botas y accesorios para vivir el fútbol dentro y fuera del terreno de juego.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link to="/shop">Explorar la tienda <FiArrowRight aria-hidden="true" /></Link>
            </Button>
          </div>
          <div aria-hidden="true" className="absolute -right-20 -top-24 h-80 w-80 rounded-full border-[40px] border-[hsl(var(--gold)/0.08)] md:h-[30rem] md:w-[30rem]" />
          <div aria-hidden="true" className="absolute -bottom-36 right-40 h-64 w-64 rounded-full bg-[hsl(var(--gold)/0.08)] blur-3xl" />
        </section>

        {error && <p role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}

        {loading ? (
          <section aria-label="Cargando productos destacados" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
            ))}
          </section>
        ) : products.length > 0 ? (
          <ProductCarousel products={products} />
        ) : !error ? (
          <section className="rounded-2xl border border-white/10 bg-[#121213] p-8 text-center">
            <h2 className="text-xl font-semibold">Próximamente</h2>
            <p className="mt-2 text-sm text-white/60">Estamos preparando los productos destacados.</p>
          </section>
        ) : null}

        {!loading && (
          <>
            <EntityCarousel title="Categorías" entities={categories} filter="category" />
            <EntityCarousel title="Marcas" entities={brands} filter="brand" />
          </>
        )}
      </div>
    </main>
  );
}
