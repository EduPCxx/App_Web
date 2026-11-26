import { Button } from '@/components/ui/button';

/**
 * @param {{ page: number, totalPages: number, onPageChange: (page: number) => void }} props
 */
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-7 flex items-center justify-center gap-2" aria-label="Paginación de productos">
      <Button variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Anterior</Button>
      <span className="px-3 text-sm text-white/55" aria-live="polite">{page} / {totalPages}</span>
      <Button variant="outline" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Siguiente</Button>
    </nav>
  );
}
