import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export const Label = forwardRef(function Label({ className, ...props }, ref) {
  return <label ref={ref} className={cn('text-sm font-semibold leading-none', className)} {...props} />;
});
