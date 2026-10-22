import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { cn } from '@/utils/cn';

const TONES = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-100 text-emerald-700',
  neutral: 'bg-slate-100 text-slate-600',
  danger: 'bg-red-100 text-red-600',
  warning: 'bg-amber-100 text-amber-700'
};

function StatCard({ label, value, icon: Icon, tone = 'primary', to }) {
  const card = (
    <Card className="flex items-center justify-between p-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-soft">
      <div>
        <p className="mb-1 text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold tabular-nums">{value}</p>
      </div>
      <span className={cn('flex h-12 w-12 items-center justify-center rounded-full', TONES[tone])}>
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
