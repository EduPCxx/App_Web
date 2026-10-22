import useAppContext from '@/hooks/useAppContext';

// Catálogo global + acciones (crear, actualizar, activar/desactivar, eliminar)
export default function useProducts() {
  return useAppContext();
}
