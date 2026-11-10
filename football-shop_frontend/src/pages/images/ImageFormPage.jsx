import CatalogFormPage from '@/features/catalog/components/CatalogFormPage';
import useBrands from '@/hooks/useBrands';
import useCategories from '@/hooks/useCategories';
import useImages from '@/hooks/useImages';
import useProducts from '@/hooks/useProducts';
import useVariants from '@/hooks/useVariants';

export default function ImageFormPage() {
  const { products, loading: loadingProducts, error: productsError } = useProducts();
  const { items: variants, loading: loadingVariants, error: variantsError } = useVariants();
  const { items: brands, loading: loadingBrands, error: brandsError } = useBrands();
  const { items: categories, loading: loadingCategories, error: categoriesError } = useCategories();

  return (
    <CatalogFormPage
      type="images"
      useResource={useImages}
      relationOptions={{ products, variants, brands, categories }}
      loadingRelationOptions={loadingProducts || loadingVariants || loadingBrands || loadingCategories}
      relationError={productsError || variantsError || brandsError || categoriesError}
    />
  );
}
