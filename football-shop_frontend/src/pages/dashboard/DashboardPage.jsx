import { Link } from 'react-router-dom';
import {
  FiActivity,
  FiAlertCircle,
  FiArrowUpRight,
  FiCheckCircle,
  FiLayers,
  FiPackage,
  FiTrendingUp
} from 'react-icons/fi';
import { IoFootballOutline } from 'react-icons/io5';
import { Card } from '@/components/ui/card';
import ErrorState from '@/components/common/ErrorState';
import { StatsSkeleton } from '@/components/common/Skeletons';
import useDashboardStats from '@/hooks/useDashboardStats';
import { formatNumber, formatPrice } from '@/utils/format';

const percentage = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0);

const smoothPath = (points) => {
  if (points.length < 2) return '';
  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const midpoint = (previous.x + point.x) / 2;
    return `${path} C ${midpoint},${previous.y} ${midpoint},${point.y} ${point.x},${point.y}`;
  }, `M ${points[0].x},${points[0].y}`);
};

function MetricTile({ label, value, icon: Icon, tone, to }) {
  const tones = {
    gold: 'border-[#d8b563]/40 bg-[#191919]',
    charcoal: 'border-white/10 bg-[#171717]',
    muted: 'border-white/10 bg-[#141414]'
  };
  const content = (
    <div className={`group relative flex min-h-[104px] items-center justify-between overflow-hidden rounded-2xl border ${tones[tone]} p-4 shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-[#d8b563]/60 sm:min-h-[116px] sm:p-5`}>
      <div className="relative z-10 min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-white/60 sm:text-[10px]">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-white tabular-nums sm:text-3xl">{value}</p>
      </div>
      <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d8b563]/25 bg-[#111111] text-[#f5d789] shadow-[0_12px_24px_-18px_rgba(245,215,137,0.9)] sm:h-11 sm:w-11">
        <Icon size={19} aria-hidden="true" />
      </span>
      {to && <FiArrowUpRight className="absolute right-3 top-3 text-white/35 transition group-hover:text-white/90" size={14} aria-hidden="true" />}
    </div>
  );
  return to ? <Link to={to} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))]">{content}</Link> : content;
}

function CategoryChart({ items }) {
  const width = 640;
  const height = 245;
  const left = 32;
  const right = 608;
  const top = 24;
  const bottom = 178;
  const categories = [...items].sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...categories.map(({ count }) => count));
  const points = categories.map((item, index) => ({
    ...item,
    x: categories.length > 1 ? left + (index / (categories.length - 1)) * (right - left) : width / 2,
    y: bottom - (item.count / max) * (bottom - top)
  }));
  const line = smoothPath(points);
  const area = points.length
    ? `${line} L ${points[points.length - 1].x},${bottom} L ${points[0].x},${bottom} Z`
    : '';

  return (
    <Card className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#111111] shadow-soft">
      <div className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#f5d789]">Actividad de catálogo</p>
          <h3 className="mt-1 text-sm font-semibold text-white sm:text-base">Productos por categoría</h3>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d8b563]/30 bg-[#1a1a1a] text-[#f5d789]">
          <FiActivity size={17} aria-hidden="true" />
        </span>
      </div>

      <div className="px-3 pb-3 pt-1 sm:px-5 sm:pb-4">
        {points.length === 0 ? (
          <p className="m-2 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/55">
            Todavía no hay productos para mostrar.
          </p>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-[205px] w-full sm:h-[238px]"
            role="img"
            aria-label={`Productos por categoría: ${categories.map(({ category, count }) => `${category}, ${count}`).join('; ')}`}
          >
            {[top, top + (bottom - top) / 3, top + (2 * (bottom - top)) / 3, bottom].map((y) => (
              <line key={y} x1={left} x2={right} y1={y} y2={y} stroke="#ffffff" strokeOpacity="0.08" strokeDasharray="3 8" />
            ))}
            {area && <path d={area} fill="#d8b563" fillOpacity="0.12" />}
            {points.length > 1 && (
              <path d={line} fill="none" stroke="#d8b563" strokeWidth="3.5" strokeLinecap="round" />
            )}
            {points.map(({ category, count, x, y }, index) => (
              <g key={category}>
                <circle cx={x} cy={y} r="9" fill="#101010" stroke={index % 2 ? '#f0d38a' : '#b78b36'} strokeWidth="3" />
                <text x={x} y={Math.max(top + 10, y - 16)} textAnchor="middle" fill="#f5f6f7" className="text-[12px] font-semibold">
                  {count}
                </text>
                <text x={x} y="222" textAnchor="middle" fill="#d3d3d3" className="text-[10px]">
                  {category.length > 13 ? `${category.slice(0, 12)}…` : category}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>
    </Card>
  );
}

function RingMetric({ label, value, caption, color }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <div className="relative flex h-[78px] w-[78px] items-center justify-center sm:h-[86px] sm:w-[86px]">
        <svg viewBox="0 0 78 78" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="39" cy="39" r={radius} fill="none" stroke="#c8c0ab" strokeOpacity="0.16" strokeWidth="4" />
          <circle
            cx="39"
            cy="39"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference - progress}`}
          />
        </svg>
        <span className="text-base font-bold text-slate-100 tabular-nums">{value}%</span>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-200">{label}</p>
        <p className="mt-0.5 text-[9px] text-slate-500">{caption}</p>
      </div>
    </div>
  );
}

function InventoryPanel({ stats }) {
  const leadingCategory = [...stats.byCategory].sort((a, b) => b.count - a.count)[0];
  const availability = percentage(Math.max(0, stats.total - stats.outOfStock), stats.total);
  const details = [
    ['Productos activos', `${formatNumber(stats.active)} / ${formatNumber(stats.total)}`],
    ['Unidades en stock', formatNumber(stats.units)],
    ['Productos agotados', formatNumber(stats.outOfStock)],
    ['Categorías', formatNumber(stats.byCategory.length)]
  ];

  return (
    <Card className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#111111] shadow-soft">
      <div className="border-b border-white/10 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8b563]/30 bg-[#1a1a1a] text-[#f5d789]">
            <IoFootballOutline size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white">Football Shop</p>
            <p className="mt-0.5 text-[10px] text-white/55">Resumen de inventario</p>
          </div>
          <span className="ml-auto h-2 w-2 rounded-full bg-[#d8b563] shadow-[0_0_12px_rgba(216,181,99,0.8)]" title="Catálogo cargado" />
        </div>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div className="rounded-2xl border border-[#d8b563]/20 bg-[#181818] p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#f5d789]">Valor del inventario</p>
          <p className="mt-2 break-words text-xl font-semibold tracking-tight text-white tabular-nums">{formatPrice(stats.inventoryValue)}</p>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-white/55">
            <FiLayers size={13} aria-hidden="true" />
            {formatNumber(stats.units)} unidades registradas
          </div>
        </div>

        <div>
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/50">Detalles de tienda</p>
          <dl>
            {details.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 border-b border-white/8 py-3 last:border-0">
                <dt className="text-[10px] text-white/55">{label}</dt>
                <dd className="max-w-[52%] truncate text-right text-[11px] font-semibold text-white tabular-nums" title={value}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="mb-4 flex items-center gap-2">
            <FiTrendingUp size={13} className="text-[#f5d789]" aria-hidden="true" />
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/50">Indicadores clave</p>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <RingMetric label="Activos" value={percentage(stats.active, stats.total)} caption="catálogo" color="#e2bd65" />
            <RingMetric label="Stock" value={availability} caption="disponible" color="#f0d98f" />
            <RingMetric label="Líder" value={percentage(leadingCategory?.count || 0, stats.total)} caption={leadingCategory?.category || 'categoría'} color="#b88d42" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { stats, loading, error, reload } = useDashboardStats();

  return (
    <section className="min-h-screen space-y-5 bg-transparent px-4 py-4 sm:px-5 lg:px-7 lg:py-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#f5d789]">Dashboard</p>
            <h1 className="mt-1 text-base font-semibold tracking-tight text-white">Resumen</h1>
          </div>
          <span className="hidden h-8 w-px bg-white/10 sm:block" />
          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-full border border-[#d8b563]/35 bg-[#181818] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-[#f5d789] shadow-[0_4px_18px_-8px_rgba(216,181,99,0.8)]">Overview</span>
            <Link to="/products" className="rounded-full border border-white/10 px-3 py-1.5 text-[9px] font-semibold text-white/60 transition duration-300 hover:border-[#d8b563]/50 hover:text-white">
              Products
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#181818] px-3 py-1.5 text-[10px] text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-[#d8b563] shadow-[0_0_10px_rgba(216,181,99,0.8)]" />
          Live catalog
        </div>
      </header>

      {loading && !stats && <StatsSkeleton />}
      {error && !stats && <ErrorState title="No se pudieron cargar las estadísticas" message={error} onRetry={reload} />}

      {stats && (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_290px] 2xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricTile label="Productos totales" value={formatNumber(stats.total)} icon={FiPackage} tone="gold" to="/products" />
              <MetricTile label="Productos activos" value={formatNumber(stats.active)} icon={FiCheckCircle} tone="charcoal" to="/products" />
              <MetricTile label="Agotados" value={formatNumber(stats.outOfStock)} icon={FiAlertCircle} tone="muted" to="/products" />
            </div>

            <Card className="rounded-[1.4rem] border border-white/10 bg-[#111111] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.19em] text-[#f5d789]">Stock health</p>
                  <h3 className="mt-1 text-xs font-semibold text-white">Estado de disponibilidad</h3>
                </div>
                <span className="rounded-full border border-white/10 bg-[#181818] px-2.5 py-1 text-[9px] text-white/60">
                  {formatNumber(stats.units)} unidades
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-5">
                <RingMetric label="Activos" value={percentage(stats.active, stats.total)} caption={`${formatNumber(stats.active)} productos`} color="#e2bd65" />
                <RingMetric label="Disponibles" value={percentage(Math.max(0, stats.total - stats.outOfStock), stats.total)} caption="con stock" color="#f0d98f" />
                <RingMetric label="Inactivos" value={percentage(stats.inactive, stats.total)} caption={`${formatNumber(stats.inactive)} productos`} color="#b88d42" />
              </div>
            </Card>

            <CategoryChart items={stats.byCategory} />
          </div>

          <InventoryPanel stats={stats} />
        </div>
      )}
    </section>
  );
}
