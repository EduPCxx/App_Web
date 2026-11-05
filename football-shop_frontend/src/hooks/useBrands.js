import useCatalogResource from '@/hooks/useCatalogResource';
import { brandService } from '@/services/brandService';

export default function useBrands(options) {
  return useCatalogResource(brandService, 'las marcas', options);
}
