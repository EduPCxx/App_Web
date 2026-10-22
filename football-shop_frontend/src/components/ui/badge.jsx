import { cva } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-muted text-muted-foreground',
      outline: 'border border-border text-foreground',
      destructive: 'bg-destructive/10 text-destructive'
    }
  },
  defaultVariants: { variant: 'default' }
});

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
