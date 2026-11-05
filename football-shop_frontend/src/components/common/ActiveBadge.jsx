import { Badge } from '@/components/ui/badge';

export default function ActiveBadge({ active }) {
  return (
    <Badge
      variant="outline"
      className={active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}
    >
      {active ? 'Sí' : 'No'}
    </Badge>
  );
}
