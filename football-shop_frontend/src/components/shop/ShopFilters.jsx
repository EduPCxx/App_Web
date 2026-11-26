import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

/**
 * @param {{ categories: Array<{_id: string, name: string}>, brands: Array<{_id: string, name: string}>, filters: {categoryId: string, brandId: string, minPrice: string, maxPrice: string}, onFilterChange: (key: string, value: string) => void, onClear: () => void }} props
 */
export default function ShopFilters({ categories, brands, filters, onFilterChange, onClear }) {
  return (
    <aside className="h-fit rounded-2xl border border-white/10 bg-[#121213] p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Filtros</h2>
        <button type="button" onClick={onClear} className="text-xs text-[hsl(var(--gold))]">Limpiar</button>
      </div>

      <label htmlFor="shop-category" className="block text-xs font-semibold text-white/60">Categoría</label>
      <Select
        id="shop-category"
        value={filters.categoryId}
        onChange={(event) => onFilterChange('category', event.target.value)}
        className="mt-2 border-white/10 bg-[#1b1b1c]"
      >
        <option value="">Todas</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>{category.name}</option>
        ))}
      </Select>

      <label htmlFor="shop-brand" className="mt-5 block text-xs font-semibold text-white/60">Marca</label>
      <Select
        id="shop-brand"
        value={filters.brandId}
        onChange={(event) => onFilterChange('brand', event.target.value)}
        className="mt-2 border-white/10 bg-[#1b1b1c]"
      >
        <option value="">Todas</option>
        {brands.map((brand) => (
          <option key={brand._id} value={brand._id}>{brand.name}</option>
        ))}
      </Select>

      <fieldset className="mt-5">
        <legend className="text-xs font-semibold text-white/60">Precio (€)</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="Mín."
            aria-label="Precio mínimo"
            value={filters.minPrice}
            onChange={(event) => onFilterChange('minPrice', event.target.value)}
          />
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="Máx."
            aria-label="Precio máximo"
            value={filters.maxPrice}
            onChange={(event) => onFilterChange('maxPrice', event.target.value)}
          />
        </div>
      </fieldset>
    </aside>
  );
}
