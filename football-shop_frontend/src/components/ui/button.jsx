import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/utils/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--gold))] focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[hsl(var(--gold))] text-[#111111] shadow-[0_12px_30px_-18px_hsl(var(--gold)/0.85)] hover:-translate-y-0.5 hover:bg-[#d8b563]',
        secondary: 'border border-white/10 bg-[#181818] text-white hover:-translate-y-0.5 hover:border-[#d8b563]/60 hover:bg-[#1f1f1f]',
        outline: 'border border-white/10 bg-transparent text-white hover:-translate-y-0.5 hover:border-[#d8b563]/60 hover:bg-[#181818]',
        ghost: 'text-white hover:-translate-y-0.5 hover:bg-white/5',
        destructive: 'border border-red-500/25 bg-[#2a1a1a] text-red-100 hover:-translate-y-0.5 hover:bg-[#341f1f]',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-11 px-4 text-base',
        sm: 'h-9 px-3 text-sm',
        lg: 'h-12 px-5 text-base',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: { variant: 'default', size: 'default' }
  }
);

export const Button = forwardRef(function Button({ className, variant, size, type = 'button', asChild = false, ...props }, ref) {
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} type={asChild ? undefined : type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
