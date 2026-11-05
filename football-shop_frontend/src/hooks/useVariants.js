import useCatalogResource from '@/hooks/useCatalogResource';
import { variantService } from '@/services/variantService';

export default function useVariants(options) {
  return useCatalogResource(variantService, 'las variantes', options);
}
