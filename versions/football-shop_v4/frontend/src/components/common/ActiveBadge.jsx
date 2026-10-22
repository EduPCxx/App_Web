import { Badge } from '@/components/ui/badge';

export default function ActiveBadge({ active }) {
  return <Badge variant={active ? 'default' : 'secondary'}>{active ? 'Sí' : 'No'}</Badge>;
}
