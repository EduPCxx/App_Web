import CatalogListPage from '@/features/catalog/components/CatalogListPage';
import useVariants from '@/hooks/useVariants';

export default function VariantsPage() {
  return <CatalogListPage type="variants" useResource={useVariants} />;
}
