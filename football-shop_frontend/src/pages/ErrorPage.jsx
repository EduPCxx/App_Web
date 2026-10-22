import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Pantalla de error inesperado (la muestra ErrorBoundary cuando una página falla al renderizar)
export default function ErrorPage({ onRetry }) {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <p className="text-5xl font-bold text-destructive">Error</p>
      <h2 className="mt-3 text-2xl font-bold">Algo ha salido mal</h2>
      <p className="mt-2 text-sm text-muted-foreground">Ha ocurrido un error inesperado. Puedes reintentarlo o volver al panel.</p>
      <div className="mt-8 flex gap-2">
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Reintentar
          </Button>
        )}
        <Button asChild>
          <Link to="/">Ir al dashboard</Link>
        </Button>
      </div>
    </section>
  );
}
