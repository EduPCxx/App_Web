import useCatalogResource from '@/hooks/useCatalogResource';
import { categoryService } from '@/services/categoryService';

export default function useCategories(options) {
  return useCatalogResource(categoryService, 'las categorías', options);
}
