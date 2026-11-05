import CatalogListPage from '@/features/catalog/components/CatalogListPage';
import useCategories from '@/hooks/useCategories';

export default function CategoriesPage() {
  return <CatalogListPage type="categories" useResource={useCategories} />;
}
