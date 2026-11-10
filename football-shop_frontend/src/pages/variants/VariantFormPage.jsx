import CatalogFormPage from '@/features/catalog/components/CatalogFormPage';
import useProducts from '@/hooks/useProducts';
import useVariants from '@/hooks/useVariants';

export default function VariantFormPage() {
  const { products, loading: loadingProducts, error: productsError } = useProducts();

  return (
    <CatalogFormPage
      type="variants"
      useResource={useVariants}
      relationOptions={{ products }}
      loadingRelationOptions={loadingProducts}
      relationError={productsError}
    />
  );
}
