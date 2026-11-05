import { cva } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold', {
  variants: {
    variant: {
      default: 'border-emerald-400/25 bg-emerald-500/15 text-emerald-300',
      secondary: 'border-red-400/25 bg-red-500/15 text-red-300',
      outline: 'border border-border text-foreground',
      destructive: 'border-red-400/25 bg-red-500/15 text-red-300'
    }
  },
  defaultVariants: { variant: 'default' }
});

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
