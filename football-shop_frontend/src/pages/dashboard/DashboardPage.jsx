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
    gold: 'from-[#63502a] via-[#79602e] to-[#403724]',
    charcoal: 'from-[#303136] via-[#27282d] to-[#25252a]',
    muted: 'from-[#292a2f] via-[#303034] to-[#242428]'
  };
  const content = (
    <div className={`group relative flex min-h-[104px] items-center justify-between overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-br ${tones[tone]} p-4 shadow-[0_16px_38px_-24px_rgba(0,0,0,0.8)] transition duration-200 hover:-translate-y-0.5 hover:border-amber-200/30 sm:min-h-[116px] sm:p-5`}>
      <div className="relative z-10 min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-amber-100/65 sm:text-[10px]">{label}</p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-white tabular-nums sm:text-3xl">{value}</p>
      </div>
      <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-100/[0.14] bg-black/[0.12] text-amber-100 shadow-inner sm:h-11 sm:w-11">
        <Icon size={19} aria-hidden="true" />
      </span>
      <span className="absolute -bottom-12 -right-7 h-28 w-28 rounded-full bg-white/[0.06] blur-2xl transition group-hover:bg-white/[0.1]" />
      {to && <FiArrowUpRight className="absolute right-3 top-3 text-white/35 transition group-hover:text-white/90" size={14} aria-hidden="true" />}
    </div>
  );
  return to ? <Link to={to} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">{content}</Link> : content;
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
    <Card className="overflow-hidden rounded-[1.4rem] border-white/[0.09] bg-[#1b1b1d]/90 shadow-[0_24px_70px_-46px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-200/60">Actividad de catálogo</p>
          <h3 className="mt-1 text-sm font-bold text-slate-100 sm:text-base">Productos por categoría</h3>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200/10 bg-amber-300/[0.08] text-amber-200">
          <FiActivity size={17} aria-hidden="true" />
        </span>
      </div>

      <div className="px-3 pb-3 pt-1 sm:px-5 sm:pb-4">
        {points.length === 0 ? (
          <p className="m-2 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
            Todavía no hay productos para mostrar.
          </p>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-[205px] w-full sm:h-[238px]"
            role="img"
            aria-label={`Productos por categoría: ${categories.map(({ category, count }) => `${category}, ${count}`).join('; ')}`}
          >
            <defs>
              <linearGradient id="chart-stroke" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#b58a3a" />
                <stop offset="55%" stopColor="#e0bd69" />
                <stop offset="100%" stopColor="#f4dfa1" />
              </linearGradient>
              <linearGradient id="chart-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#d7ae55" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#d7ae55" stopOpacity="0" />
              </linearGradient>
              <filter id="chart-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {[top, top + (bottom - top) / 3, top + (2 * (bottom - top)) / 3, bottom].map((y) => (
              <line key={y} x1={left} x2={right} y1={y} y2={y} stroke="#d7c18d" strokeOpacity="0.12" strokeDasharray="3 8" />
            ))}
            {area && <path d={area} fill="url(#chart-area)" />}
            {points.length > 1 && (
              <path d={line} fill="none" stroke="url(#chart-stroke)" strokeWidth="3.5" strokeLinecap="round" filter="url(#chart-glow)" />
            )}
            {points.map(({ category, count, x, y }, index) => (
              <g key={category}>
                <circle cx={x} cy={y} r="9" fill="#23221e" stroke={index % 2 ? '#edcf82' : '#bd9142'} strokeWidth="3" />
                <text x={x} y={Math.max(top + 10, y - 16)} textAnchor="middle" fill="#f3eee1" className="text-[12px] font-semibold">
                  {count}
                </text>
                <text x={x} y="222" textAnchor="middle" fill="#aaa69c" className="text-[10px]">
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
    <Card className="overflow-hidden rounded-[1.4rem] border-white/[0.09] bg-[#1a1a1b]/95 shadow-[0_24px_70px_-46px_rgba(0,0,0,0.82)]">
      <div className="border-b border-white/[0.08] px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-200/10 bg-gradient-to-br from-amber-200/15 to-yellow-700/15 text-amber-100">
            <IoFootballOutline size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-100">Football Shop</p>
            <p className="mt-0.5 text-[10px] text-slate-500">Resumen de inventario</p>
          </div>
          <span className="ml-auto h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(217,172,73,0.8)]" title="Catálogo cargado" />
        </div>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div className="rounded-2xl border border-amber-100/[0.09] bg-gradient-to-br from-amber-300/[0.09] to-white/[0.02] p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-amber-100/60">Valor del inventario</p>
          <p className="mt-2 break-words text-xl font-bold tracking-tight text-white tabular-nums">{formatPrice(stats.inventoryValue)}</p>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
            <FiLayers size={13} aria-hidden="true" />
            {formatNumber(stats.units)} unidades registradas
          </div>
        </div>

        <div>
          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Detalles de tienda</p>
          <dl>
            {details.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 border-b border-white/[0.06] py-3 last:border-0">
                <dt className="text-[10px] text-slate-400">{label}</dt>
                <dd className="max-w-[52%] truncate text-right text-[11px] font-semibold text-slate-200 tabular-nums" title={value}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="border-t border-white/[0.08] pt-4">
          <div className="mb-4 flex items-center gap-2">
            <FiTrendingUp size={13} className="text-amber-300" aria-hidden="true" />
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Indicadores clave</p>
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
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-amber-200/55">Dashboard</p>
            <h1 className="mt-1 text-base font-bold tracking-wide text-slate-100">SUMMARY</h1>
          </div>
          <span className="hidden h-8 w-px bg-white/[0.1] sm:block" />
          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-full bg-gradient-to-r from-amber-300 to-yellow-600 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-[#211b0d] shadow-[0_4px_18px_-8px_rgba(217,172,73,0.8)]">Overview</span>
            <Link to="/products" className="rounded-full border border-white/[0.08] px-3 py-1.5 text-[9px] font-semibold text-slate-400 transition hover:border-amber-200/30 hover:text-slate-100">
              Products
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[10px] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(217,172,73,0.8)]" />
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

            <Card className="rounded-[1.4rem] border-white/[0.09] bg-[#1b1b1d]/90 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.19em] text-amber-200/55">Stock health</p>
                  <h3 className="mt-1 text-xs font-bold text-slate-200">Estado de disponibilidad</h3>
                </div>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-2.5 py-1 text-[9px] text-slate-400">
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
