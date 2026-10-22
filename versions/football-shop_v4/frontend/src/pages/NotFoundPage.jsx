import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage({
  title = 'Página no encontrada',
  description = 'La dirección que buscas no existe o ya no está disponible.'
}) {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <p className="text-5xl font-bold text-primary">404</p>
      <h2 className="mt-3 text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <Button asChild className="mt-8">
        <Link to="/products">Ir a productos</Link>
      </Button>
    </section>
  );
}
