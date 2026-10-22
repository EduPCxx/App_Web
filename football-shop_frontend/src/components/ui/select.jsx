import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

// <select> nativo con el estilo de shadcn: accesible, sin dependencias extra y compatible con react-hook-form
export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
