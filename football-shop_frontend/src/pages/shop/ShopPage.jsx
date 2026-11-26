import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/shop/ProductCard';
import Pagination from '@/components/shop/Pagination';
import Search from '@/components/shop/Search';
import ShopFilters from '@/components/shop/ShopFilters';
import ShopHeader from '@/components/shop/ShopHeader';
import useShopProducts from '@/hooks/useShopProducts';
import { shopService } from '@/services/shopService';

export default function ShopPage() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categoryError, setCategoryError] = useState('');
  const {
    products,
    pagination,
    loading,
    error,
    filters,
    setSearch,
    setFilter,
    setPage,
    clearFilters
  } = useShopProducts();

  useEffect(() => {
    let active = true;
    Promise.all([shopService.listCategories(), shopService.listBrands()])
      .then(([categoryItems, brandItems]) => {
        if (!active) return;
        setCategories(categoryItems.filter((item) => item.isActive !== false && item.status === 'published'));
        setBrands(brandItems.filter((item) => item.isActive !== false && item.status === 'published'));
      })
      .catch((requestError) => {
        if (active) setCategoryError(requestError.message);
      });
    return () => { active = false; };
  }, []);

  const resultCount = pagination.total || 0;

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-white">
      <ShopHeader />
      <div className="mx-auto max-w-[1440px] px-5 py-8">
        <section className="mb-7 flex flex-wrap items-end justify-between gap-5 rounded-3xl border border-white/10 bg-gradient-to-r from-[#171718] to-[#111112] p-6 md:p-9">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[hsl(var(--gold))]">Catálogo</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Encuentra tu próximo fichaje.</h1>
          </div>
          <Link to="/" className="text-sm text-white/60 hover:text-white">Volver a inicio</Link>
        </section>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <ShopFilters
            categories={categories}
            brands={brands}
            filters={filters}
            onFilterChange={(key, value) => setFilter(key, value)}
            onClear={clearFilters}
          />

          <section aria-label="Resultados de productos">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-white/55" aria-live="polite">
                {resultCount} {resultCount === 1 ? 'producto' : 'productos'}
              </p>
              <Search value={filters.search} onChange={setSearch} />
            </div>

            {(error || categoryError) && (
              <div role="alert" className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                {error || categoryError}
              </div>
            )}

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-80 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#121213] p-10 text-center text-white/60">
                No hay productos que coincidan con los filtros.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => <ProductCard key={product._id} product={product} />)}
              </div>
            )}

            <Pagination page={filters.page} totalPages={pagination.totalPages} onPageChange={setPage} />
          </section>
        </div>
      </div>
    </main>
  );
}
