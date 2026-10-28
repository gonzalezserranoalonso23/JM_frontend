import * as React from 'react'
import { Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const PICKER_TYPES = new Set(['date', 'time', 'datetime-local', 'month'])

function Input({ className, type, ...props }) {
  const field = (
    <input
      type={type}
      autoComplete="off"
      data-slot="input"
      className={cn(
        'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        className
      )}
      {...props}
    />
  )

  if (!PICKER_TYPES.has(type)) return field

  const Icon = type === 'time' ? Clock : Calendar

  return (
    <span className="relative block w-full min-w-0">
      {field}
      <Icon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 z-10 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </span>
  )
}

export { Input }
