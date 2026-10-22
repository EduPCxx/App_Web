import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TableSkeleton({ rows = 6, columns = 6 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border" aria-busy="true" aria-label="Cargando tabla">
      <div className="space-y-2 p-3">
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }, (__, col) => (
              <Skeleton key={col} className="h-10 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Cargando estadísticas">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} className="flex items-center justify-between p-5">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </Card>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando producto">
      <Skeleton className="h-5 w-32" />
      <Card className="space-y-4 p-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <Card className="space-y-6 p-6" aria-busy="true" aria-label="Cargando formulario">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-28 w-full" />
    </Card>
  );
}

// Fallback de Suspense mientras se descarga el chunk de una página
export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando página">
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-56" />
      </div>
      <TableSkeleton rows={5} columns={5} />
    </div>
  );
}
