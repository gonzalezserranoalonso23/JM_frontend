import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const contentRef = React.useRef(null)

    React.useEffect(() => {
      const content = contentRef.current
      if (!content) return

      let frameId
      let focusTimer

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

      const handleFocus = () => {
        revealFocusedField()
        window.clearTimeout(focusTimer)
        focusTimer = window.setTimeout(revealFocusedField, 300)
      }

      // iOS pans the page when the keyboard opens; pin it so the sheet stays still
      const isMobile = window.matchMedia('(max-width: 639px)').matches
      const { body } = document
      const previousBody = {
        position: body.style.position,
        top: body.style.top,
        width: body.style.width
      }
      const lockedScrollY = window.scrollY
      const keepPinned = () => {
        if (window.scrollY !== 0 || window.visualViewport?.offsetTop) {
          window.scrollTo(0, 0)
        }
      }
      if (isMobile) {
        body.style.position = 'fixed'
        body.style.top = `-${lockedScrollY}px`
        body.style.width = '100%'
        window.visualViewport?.addEventListener('scroll', keepPinned)
      }

      content.addEventListener('focusin', handleFocus)
      window.visualViewport?.addEventListener('resize', revealFocusedField)
      window.addEventListener('resize', revealFocusedField)

      return () => {
        content.removeEventListener('focusin', handleFocus)
        window.visualViewport?.removeEventListener('resize', revealFocusedField)
        window.removeEventListener('resize', revealFocusedField)
        if (isMobile) {
          window.visualViewport?.removeEventListener('scroll', keepPinned)
          body.style.position = previousBody.position
          body.style.top = previousBody.top
          body.style.width = previousBody.width
          window.scrollTo(0, lockedScrollY)
        }
        window.cancelAnimationFrame(frameId)
        window.clearTimeout(focusTimer)
      }
    }, [])

    const setContentRef = React.useCallback(
      (node) => {
        contentRef.current = node
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
            'fixed z-50 flex flex-col bg-[var(--bg-card)] text-[var(--text-primary)] shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95',
            'left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border-0 max-h-[90vh] overflow-hidden',
            // Mobile: bottom sheet instead of a centered dialog
            'max-sm:inset-x-0 max-sm:bottom-[var(--app-viewport-bottom-gap,0px)] max-sm:transition-none max-sm:overscroll-contain max-sm:top-auto max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:max-h-[calc(var(--app-vh,1svh)*100-1.5rem)]',
            'max-sm:data-[state=open]:slide-in-from-bottom-full max-sm:data-[state=closed]:slide-out-to-bottom-full',
            className
          )}
          {...props}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm text-white opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none">
            <X className="h-4 w-4" />
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
      'flex shrink-0 flex-col gap-1.5 border-b border-black bg-black p-5 pr-12 text-white max-sm:p-4 max-sm:pr-12',
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogBody = ({ className, ...props }) => (
  <div
    className={cn(
      'min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 max-sm:p-4',
      className
    )}
    {...props}
  />
)
DialogBody.displayName = 'DialogBody'

const DialogFooter = ({ className, ...props }) => (
  <footer
    className={cn(
      'sticky bottom-0 flex shrink-0 flex-row justify-end gap-3 border-t border-black bg-black p-5 max-sm:flex-col-reverse max-sm:items-stretch max-sm:p-4 max-sm:pb-[max(1rem,env(safe-area-inset-bottom))] max-sm:[&_button]:h-12',
      '[&_button:not([type=submit])]:border-white/60 [&_button:not([type=submit])]:text-white [&_button:not([type=submit])]:hover:bg-white/10',
      '[&_button[type=submit]]:bg-gray-700 [&_button[type=submit]]:text-white [&_button[type=submit]]:hover:bg-gray-600',
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
    className={cn('text-sm text-[var(--text-muted)]', className)}
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
