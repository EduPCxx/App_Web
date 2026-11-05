import useCatalogResource from '@/hooks/useCatalogResource';
import { roleService } from '@/services/roleService';

export default function useRoles(options) {
  return useCatalogResource(roleService, 'los roles', options);
}
