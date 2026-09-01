import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-md border border-[var(--border-input)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10 disabled:cursor-not-allowed disabled:bg-[var(--bg-subtle)] disabled:opacity-100',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
