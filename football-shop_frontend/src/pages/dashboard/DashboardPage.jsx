import { FiAlertCircle, FiCheckCircle, FiLayers, FiPackage, FiTrendingUp, FiXCircle } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ErrorState from '@/components/common/ErrorState';
import PageHeader from '@/components/common/PageHeader';
import { StatsSkeleton } from '@/components/common/Skeletons';
import StatCard from '@/components/common/StatCard';
import useDashboardStats from '@/hooks/useDashboardStats';
import { formatNumber, formatPrice } from '@/utils/format';

function CategoryBreakdown({ items }) {
  const max = Math.max(1, ...items.map((item) => item.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos por categoría</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay productos.</p>
        ) : (
          <ul className="space-y-4">
            {items.map(({ category, count }) => (
              <li key={category}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-semibold">{category}</span>
                  <span className="tabular-nums text-muted-foreground">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted" role="presentation">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(count / max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { stats, loading, error, reload } = useDashboardStats();

  return (
    <section className="space-y-6">
      <PageHeader eyebrow="Resumen" title="Dashboard Overview" />

      {loading && !stats && <StatsSkeleton />}
      {error && !stats && <ErrorState title="No se pudieron cargar las estadísticas" message={error} onRetry={reload} />}

      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Productos" value={formatNumber(stats.total)} icon={FiPackage} tone="primary" to="/products" />
            <StatCard label="Activos" value={formatNumber(stats.active)} icon={FiCheckCircle} tone="success" to="/products" />
            <StatCard label="Inactivos" value={formatNumber(stats.inactive)} icon={FiXCircle} tone="neutral" to="/products" />
            <StatCard label="Agotados" value={formatNumber(stats.outOfStock)} icon={FiAlertCircle} tone="danger" to="/products" />
            <StatCard label="Unidades en stock" value={formatNumber(stats.units)} icon={FiLayers} tone="warning" />
            <StatCard label="Valor del inventario" value={formatPrice(stats.inventoryValue)} icon={FiTrendingUp} tone="primary" />
          </div>
          <CategoryBreakdown items={stats.byCategory} />
        </>
      )}
    </section>
  );
}
