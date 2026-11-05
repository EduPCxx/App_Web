import CatalogFormPage from '@/features/catalog/components/CatalogFormPage';
import useImages from '@/hooks/useImages';

export default function ImageFormPage() {
  return <CatalogFormPage type="images" useResource={useImages} />;
}
