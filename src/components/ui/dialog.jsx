import * as React from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/50', className)}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef(
  (
    { className, children, onInteractOutside, onEscapeKeyDown, ...props },
    ref
  ) => {
    const [content, setContent] = React.useState(null)
    const dirtyRef = React.useRef(false)

    // Pide confirmación solo si el usuario ya capturó algo; true = se puede cerrar.
    const canDiscard = () =>
      !dirtyRef.current ||
      window.confirm('Hay cambios sin guardar. ¿Deseas cerrar y descartarlos?')

    React.useEffect(() => {
      if (!content) return

      let frameId
      let focusTimer

      dirtyRef.current = false
      const markDirty = () => {
        dirtyRef.current = true
      }
      content.addEventListener('input', markDirty)
      content.addEventListener('change', markDirty)

      const revealFocusedField = () => {
        window.cancelAnimationFrame(frameId)
        frameId = window.requestAnimationFrame(() => {
          const focused = document.activeElement
          const HTMLElementConstructor =
            content.ownerDocument.defaultView?.HTMLElement
          if (
            !HTMLElementConstructor ||
            !(focused instanceof HTMLElementConstructor) ||
            !content.contains(focused) ||
            !focused.matches(
              'input, textarea, select, [contenteditable="true"]'
            )
          ) {
            return
          }

          let scrollArea = focused.parentElement
          while (scrollArea && scrollArea !== content) {
            const { overflowY } = window.getComputedStyle(scrollArea)
            if (
              /(auto|scroll)/.test(overflowY) &&
              scrollArea.scrollHeight > scrollArea.clientHeight
            ) {
              break
            }
            scrollArea = scrollArea.parentElement
          }

          if (!scrollArea || scrollArea === content) return

          const viewportTop = window.visualViewport?.offsetTop || 0
          const viewportBottom =
            viewportTop + (window.visualViewport?.height || window.innerHeight)
          const areaBounds = scrollArea.getBoundingClientRect()
          const fieldBounds = focused.getBoundingClientRect()
          const visibleTop = Math.max(areaBounds.top, viewportTop) + 12
          const visibleBottom = Math.min(areaBounds.bottom, viewportBottom) - 12

          if (fieldBounds.bottom > visibleBottom) {
            scrollArea.scrollTop += fieldBounds.bottom - visibleBottom
          } else if (fieldBounds.top < visibleTop) {
            scrollArea.scrollTop -= visibleTop - fieldBounds.top
          }
        })
      }

      const FIELD = 'input, textarea, select, [contenteditable="true"]'
      const handleFocus = (event) => {
        window.clearTimeout(focusTimer)
        if (!event.target.matches?.(FIELD)) return
        focusTimer = window.setTimeout(revealFocusedField, 250)
      }

      const isMobile = window.matchMedia('(max-width: 639px)').matches
      const { body } = document
      const previousBody = {
        position: body.style.position,
        top: body.style.top,
        width: body.style.width
      }
      const lockedScrollY = window.scrollY
      content.style.setProperty('--dialog-h', `${window.innerHeight}px`)
      let resizeTimer
      const handleResize = () => {
        window.clearTimeout(resizeTimer)
        resizeTimer = window.setTimeout(revealFocusedField, 150)
      }
      if (isMobile) {
        body.style.position = 'fixed'
        body.style.top = `-${lockedScrollY}px`
        body.style.width = '100%'
        window.visualViewport?.addEventListener('resize', handleResize)
        window.visualViewport?.addEventListener('scroll', revealFocusedField)
      }

      content.addEventListener('focusin', handleFocus)

      return () => {
        content.removeEventListener('focusin', handleFocus)
        content.removeEventListener('input', markDirty)
        content.removeEventListener('change', markDirty)
        if (isMobile) {
          window.visualViewport?.removeEventListener('resize', handleResize)
          window.visualViewport?.removeEventListener(
            'scroll',
            revealFocusedField
          )
          body.style.position = previousBody.position
          body.style.top = previousBody.top
          body.style.width = previousBody.width
          window.scrollTo(0, lockedScrollY)
        }
        window.cancelAnimationFrame(frameId)
        window.clearTimeout(focusTimer)
        window.clearTimeout(resizeTimer)
      }
    }, [content])

    const setContentRef = React.useCallback(
      (node) => {
        setContent(node)
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref]
    )

    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={setContentRef}
          className={cn(
            'fixed z-50 flex flex-col bg-background text-foreground shadow-lg',
            'left-1/2 top-1/2 w-full max-w-lg sm:max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border max-h-[90vh] overflow-hidden',
            // Mobile: static full-screen sheet; no animations or movement
            'max-sm:inset-x-0 max-sm:bottom-auto max-sm:top-0 max-sm:h-[var(--dialog-h,100svh)] max-sm:max-h-[var(--dialog-h,100svh)] max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none max-sm:overscroll-contain',
            className
          )}
          onInteractOutside={(event) => {
            onInteractOutside?.(event)
            event.preventDefault()
          }}
          onEscapeKeyDown={(event) => {
            onEscapeKeyDown?.(event)
            // Escape cierra el combo abierto en vez del modal
            const listOpen = content?.querySelector('[aria-expanded="true"]')
            if (listOpen || !canDiscard()) event.preventDefault()
          }}
          aria-describedby={undefined}
          {...props}
        >
          {children}
          <DialogPrimitive.Close
            onClick={(event) => {
              if (!canDiscard()) event.preventDefault()
            }}
            className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground opacity-80 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none max-sm:right-1 max-sm:top-1"
          >
            <X className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Cerrar</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    )
  }
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }) => (
  <header
    className={cn(
      'flex shrink-0 flex-col gap-1.5 border-b p-5 pr-14 max-sm:p-4 max-sm:pr-14',
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogBody = ({ className, ...props }) => (
  <div
    className={cn(
      'min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-5 [overflow-anchor:none] max-sm:p-4',
      // Los hijos de grid/flex no deben ensanchar la columna más allá de la pantalla
      '[&_.grid>*]:min-w-0 [&_.flex>*]:min-w-0 [&_input]:max-w-full [&_textarea]:max-w-full [&_button[role=combobox]]:max-w-full',
      className
    )}
    {...props}
  />
)
DialogBody.displayName = 'DialogBody'

const DialogFooter = ({ className, ...props }) => (
  <footer
    className={cn(
      'flex shrink-0 flex-row justify-end gap-3 border-t p-5 max-sm:gap-2 max-sm:p-3 max-sm:[&_button]:flex-1 max-sm:pb-[max(1rem,env(safe-area-inset-bottom))] max-sm:[&_button]:h-12',
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none', className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription
}
