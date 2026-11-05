import { FiLock } from 'react-icons/fi';
import { Card } from '@/components/ui/card';
import { catalogEntities } from '@/features/catalog/catalogEntities';

export default function ProtectedModelPage({ type }) {
  const { label } = catalogEntities[type];

  return (
    <section className="mx-auto max-w-2xl p-4 sm:p-6">
      <Card className="flex flex-col items-center gap-3 p-8 text-center">
        <FiLock size={24} aria-hidden="true" />
        <h1 className="text-xl font-bold">Gestión de {label.toLowerCase()} deshabilitada</h1>
        <p className="text-sm text-muted-foreground">
          La API todavía no expone este recurso. Se habilitará cuando el backend tenga autenticación y autorización.
        </p>
      </Card>
    </section>
  );
}
