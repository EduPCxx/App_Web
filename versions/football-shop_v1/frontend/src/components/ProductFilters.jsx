import { useState } from 'react';
import { CATEGORIES } from '../models/product';

export default function ProductFilters({ filters, onChange }) {
  const [search, setSearch] = useState(filters.search);

  function submit(event) {
    event.preventDefault();
    onChange({ search: search.trim() });
  }

  return (
    <form className="filters" onSubmit={submit}>
      <input
        type="search"
        placeholder="Buscar por nombre o descripción…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select value={filters.category} onChange={(e) => onChange({ category: e.target.value })}>
        <option value="">Todas las categorías</option>
        {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
      </select>
      <button className="button">Buscar</button>
    </form>
  );
}
