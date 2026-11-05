import CatalogListPage from '@/features/catalog/components/CatalogListPage';
import useImages from '@/hooks/useImages';

export default function ImagesPage() {
  return <CatalogListPage type="images" useResource={useImages} />;
}
