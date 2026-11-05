import CatalogFormPage from '@/features/catalog/components/CatalogFormPage';
import useBrands from '@/hooks/useBrands';

export default function BrandFormPage() {
  return <CatalogFormPage type="brands" useResource={useBrands} />;
}
