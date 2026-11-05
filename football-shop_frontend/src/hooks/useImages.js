import useCatalogResource from '@/hooks/useCatalogResource';
import { imageService } from '@/services/imageService';

export default function useImages(options) {
  return useCatalogResource(imageService, 'las imágenes', options);
}
