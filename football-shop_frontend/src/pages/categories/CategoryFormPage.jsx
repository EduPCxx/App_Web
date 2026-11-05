import CatalogFormPage from '@/features/catalog/components/CatalogFormPage';
import useCategories from '@/hooks/useCategories';

export default function CategoryFormPage() {
  return <CatalogFormPage type="categories" useResource={useCategories} />;
}
