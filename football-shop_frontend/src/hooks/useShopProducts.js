import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '@/services/productService';

const PAGE_SIZE = 12;

const positiveInteger = (value, fallback = 1) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const validPrice = (value) => {
  if (value === null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

export default function useShopProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = useMemo(() => ({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('category') || '',
    brandId: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    page: positiveInteger(searchParams.get('page'))
  }), [searchParams]);

  const updateQuery = (updates, { replace = false, resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) next.delete(key);
      else next.set(key, String(value));
    });
    if (resetPage && !Object.prototype.hasOwnProperty.call(updates, 'page')) next.delete('page');
    setSearchParams(next, { replace });
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    const timer = window.setTimeout(() => {
      const params = {
        page: filters.page,
        limit: PAGE_SIZE,
        sortBy: 'createdAt',
        order: 'desc'
      };
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.categoryId) params.category_id = filters.categoryId;
      if (filters.brandId) params.brand_id = filters.brandId;
      const minPrice = validPrice(filters.minPrice);
      const maxPrice = validPrice(filters.maxPrice);
      if (minPrice !== undefined) params.minPrice = minPrice;
      if (maxPrice !== undefined) params.maxPrice = maxPrice;

      productService.search(params)
        .then((response) => {
          if (!active) return;
          setProducts(response.data);
          setPagination(response.pagination);
        })
        .catch((requestError) => {
          if (active) setError(requestError.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, filters.search ? 300 : 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [filters]);

  return {
    products,
    pagination,
    loading,
    error,
    filters,
    setSearch: (value) => updateQuery({ search: value }, { replace: true }),
    setFilter: (key, value) => updateQuery({ [key]: value }),
    setPage: (page) => updateQuery({ page }, { resetPage: false }),
    clearFilters: () => setSearchParams(new URLSearchParams())
  };
}
