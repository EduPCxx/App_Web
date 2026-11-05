import CatalogListPage from '@/features/catalog/components/CatalogListPage';
import useBrands from '@/hooks/useBrands';

export default function BrandsPage() {
  return <CatalogListPage type="brands" useResource={useBrands} />;
}
