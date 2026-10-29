import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { cn } from '@/utils/cn';

const TONES = {
  primary: 'bg-primary text-primary-foreground shadow-glow',
  success: 'bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/15',
  neutral: 'bg-white/[0.05] text-slate-300 ring-1 ring-inset ring-white/[0.06]',
  danger: 'bg-red-400/10 text-red-300 ring-1 ring-inset ring-red-400/15',
  warning: 'bg-amber-400/10 text-amber-300 ring-1 ring-inset ring-amber-400/15'
};

function StatCard({ label, value, icon: Icon, tone = 'primary', to }) {
  const card = (
    <Card className="group/card relative flex min-h-32 items-center justify-between overflow-hidden rounded-3xl border-white/[0.09] bg-white/[0.035] p-5 transition-all duration-200 hover:border-white/[0.16] hover:bg-white/[0.055] group-hover:-translate-y-0.5 group-hover:shadow-soft">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
      </div>
      <span className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', TONES[tone])}>
        <Icon size={22} aria-hidden="true" />
      </span>
    </Card>
  );

  if (!to) return card;
  return (
    <Link to={to} className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {card}
    </Link>
  );
}

export default memo(StatCard);
