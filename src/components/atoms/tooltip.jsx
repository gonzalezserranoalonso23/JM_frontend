'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Tooltip as TooltipPrimitive } from 'radix-ui'

const coarsePointerQuery = '(hover: none) and (pointer: coarse)'

const isCoarsePointer = () =>
  window.matchMedia?.(coarsePointerQuery)?.matches === true

function useCoarsePointer() {
  const [coarse, setCoarse] = React.useState(isCoarsePointer)

  React.useEffect(() => {
    const query = window.matchMedia?.(coarsePointerQuery)
    if (!query) return undefined
    const sync = () => setCoarse(query.matches === true)
    sync()
    query.addEventListener?.('change', sync)
    return () => query.removeEventListener?.('change', sync)
  }, [])

  return coarse
}

function TooltipProvider({ delayDuration = 0, ...props }) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({ ...props }) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ asChild = false, children, ...props }) {
  const coarse = useCoarsePointer()
  if (coarse) {
    if (asChild && React.isValidElement(children)) return children
    return (
      <button type="button" {...props}>
        {children}
      </button>
    )
  }
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      asChild={asChild}
      {...props}
    >
      {children}
    </TooltipPrimitive.Trigger>
  )
}

function TooltipContent({ className, sideOffset = 0, children, ...props }) {
  const coarse = useCoarsePointer()
  if (coarse) return null
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-fit origin-(--radix-tooltip-content-transform-origin) animate-in rounded-md bg-foreground px-3 py-1.5 text-xs text-balance text-background fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
