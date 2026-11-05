import useCatalogResource from '@/hooks/useCatalogResource';
import { userService } from '@/services/userService';

export default function useUsers(options) {
  return useCatalogResource(userService, 'los usuarios', options);
}
