import CatalogFormPage from '@/features/catalog/components/CatalogFormPage';
import useVariants from '@/hooks/useVariants';

export default function VariantFormPage() {
  return <CatalogFormPage type="variants" useResource={useVariants} />;
}
