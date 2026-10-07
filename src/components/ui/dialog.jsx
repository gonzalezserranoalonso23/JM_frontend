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
    const [content, setContent] = React.useState(null)

    React.useEffect(() => {
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

      const FIELD = 'input, textarea, select, [contenteditable="true"]'
      let fieldFocused = false
      let blurTimer
      let syncViewport = () => {}
      const handleFocus = (event) => {
        window.clearTimeout(focusTimer)
        window.clearTimeout(blurTimer)
        fieldFocused = Boolean(event.target.matches?.(FIELD))
        syncViewport()
        focusTimer = window.setTimeout(revealFocusedField, 250)
      }
      const handleBlur = () => {
        window.clearTimeout(blurTimer)
        blurTimer = window.setTimeout(() => {
          fieldFocused = Boolean(document.activeElement?.matches?.(FIELD))
          syncViewport()
        }, 100)
      }

      // Closed keyboard: fixed-size sheet. Open keyboard: sheet fills the visible viewport
      const isMobile = window.matchMedia('(max-width: 639px)').matches
      const { body } = document
      const previousBody = {
        position: body.style.position,
        top: body.style.top,
        width: body.style.width
      }
      const lockedScrollY = window.scrollY
      const openHeight = window.innerHeight
      content.style.setProperty('--dialog-h', `${openHeight}px`)
      let syncFrame
      let lastKey = ''
      const applyViewport = () => {
        const vv = window.visualViewport
        if (!vv) return
        // Focusing a field or opening the keyboard turns the sheet into the whole visible viewport
        const visualHeight = vv.height * vv.scale
        const open = fieldFocused || openHeight - visualHeight > 120
        const key = `${open}|${vv.offsetTop}|${visualHeight}`
        if (key === lastKey) return
        lastKey = key
        content.dataset.keyboard = String(open)
        content.style.setProperty('--vv-top', `${vv.offsetTop}px`)
        content.style.setProperty('--vv-h', `${visualHeight}px`)
      }
      // iOS pans the visual viewport without timely events, so poll every frame while typing
      const tick = () => {
        applyViewport()
        syncFrame = window.requestAnimationFrame(tick)
      }
      syncViewport = () => {
        window.cancelAnimationFrame(syncFrame)
        if (fieldFocused) tick()
        else applyViewport()
      }
      let resizeTimer
      const handleResize = () => {
        syncViewport()
        window.clearTimeout(resizeTimer)
        resizeTimer = window.setTimeout(revealFocusedField, 150)
      }
      if (isMobile) {
        body.style.position = 'fixed'
        body.style.top = `-${lockedScrollY}px`
        body.style.width = '100%'
        syncViewport()
        window.visualViewport?.addEventListener('resize', handleResize)
        window.visualViewport?.addEventListener('scroll', syncViewport)
      }

      content.addEventListener('focusin', handleFocus)
      content.addEventListener('focusout', handleBlur)

      return () => {
        content.removeEventListener('focusin', handleFocus)
        content.removeEventListener('focusout', handleBlur)
        window.clearTimeout(blurTimer)
        if (isMobile) {
          window.visualViewport?.removeEventListener('resize', handleResize)
          window.visualViewport?.removeEventListener('scroll', syncViewport)
          body.style.position = previousBody.position
          body.style.top = previousBody.top
          body.style.width = previousBody.width
          window.scrollTo(0, lockedScrollY)
        }
        window.cancelAnimationFrame(frameId)
        window.cancelAnimationFrame(syncFrame)
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
            'fixed z-50 flex flex-col bg-[var(--bg-card)] text-[var(--text-primary)] shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95',
            'left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border-0 max-h-[90vh] overflow-hidden',
            // Mobile: bottom sheet instead of a centered dialog
            'max-sm:inset-x-0 max-sm:bottom-auto max-sm:top-[var(--vv-top,0px)] max-sm:mt-2 max-sm:h-[calc(var(--dialog-h,100svh)-1rem)] max-sm:max-h-[calc(var(--dialog-h,100svh)-1rem)] max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-2xl max-sm:transition-none max-sm:overscroll-contain',
            'max-sm:data-[keyboard=true]:mt-0 max-sm:data-[keyboard=true]:h-[var(--vv-h)] max-sm:data-[keyboard=true]:max-h-[var(--vv-h)] max-sm:data-[keyboard=true]:rounded-none',
            'max-sm:data-[state=open]:slide-in-from-bottom-0 max-sm:data-[state=closed]:slide-out-to-bottom-0',
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
      'flex shrink-0 flex-row justify-end gap-3 border-t border-black bg-black p-5 max-sm:gap-2 max-sm:p-3 max-sm:[&_button]:flex-1 max-sm:pb-[max(1rem,env(safe-area-inset-bottom))] max-sm:[&_button]:h-12',
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
