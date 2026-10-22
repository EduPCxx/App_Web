import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

// Error inline (p. ej. fallo al cargar datos) con reintento opcional
export default function ErrorState({ title = 'Algo ha salido mal', message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-14 text-center">
      <FiAlertTriangle size={24} className="mb-3 text-destructive" aria-hidden="true" />
      <h2 className="font-bold">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{message || 'Ha ocurrido un error inesperado.'}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          <FiRefreshCw aria-hidden="true" /> Reintentar
        </Button>
      )}
    </div>
  );
}
