import { formatQty } from '@/utils/commonFunctions'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const normalize = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const ProductCombobox = ({
  id,
  products,
  value,
  onValueChange,
  placeholder = 'Buscar producto',
  showStock = false
}) => {
  const productList = products ?? []
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [listPos, setListPos] = useState(null)
  const inputRef = useRef(null)
  const optionRefs = useRef([])
  const selectedProduct = productList.find((product) => product._id === value)
  const selectedLabel = selectedProduct
    ? `${selectedProduct.productName}${
        showStock ? ` (Stock: ${formatQty(selectedProduct.productStock)})` : ''
      }`
    : ''
  const searchedProducts = productList.filter((product) => {
    const query = normalize(search.trim())
    return (
      !query ||
      normalize(product.productName).includes(query) ||
      normalize(product.productDescription).includes(query)
    )
  })
  const activeProduct = searchedProducts[activeIndex]

  useEffect(() => {
    setActiveIndex(0)
  }, [search])

  useEffect(() => {
    if (!isOpen) return
    optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const input = inputRef.current
    const dialog = input?.closest('[role="dialog"]')
    if (!input || !dialog) return

    const GAP = 4
    let frame = 0
    const place = () => {
      const footer = dialog.querySelector('footer')
      const viewport = window.visualViewport
      const dialogRect = dialog.getBoundingClientRect()
      const footerTop = footer?.getBoundingClientRect().top ?? dialogRect.bottom
      const visibleBottom = Math.min(
        footerTop,
        (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight)
      )
      const inputRect = input.getBoundingClientRect()
      const freshDialog = dialog.getBoundingClientRect()
      const spaceBelow = visibleBottom - inputRect.bottom - GAP
      const width = Math.min(inputRect.width, freshDialog.width - 16)
      const left = Math.min(
        Math.max(inputRect.left - freshDialog.left, 8),
        Math.max(freshDialog.width - width - 8, 8)
      )

      setListPos({
        dialog,
        left,
        width,
        maxHeight: Math.min(Math.max(spaceBelow, 120), 280),
        top: inputRect.bottom - freshDialog.top + GAP
      })
    }

    const schedule = (event) => {
      const target = event?.target
      if (target instanceof Element && target.closest('[role="listbox"]')) return
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(place)
    }

    place()
    window.addEventListener('resize', schedule)
    window.visualViewport?.addEventListener('resize', schedule)
    document.addEventListener('scroll', schedule, true)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', schedule)
      window.visualViewport?.removeEventListener('resize', schedule)
      document.removeEventListener('scroll', schedule, true)
    }
  }, [isOpen])

  const suppressOpen = useRef(false)
  const listTouch = useRef({ y: 0, moved: false, active: false })

  const handleSelect = (product, { pointer = false } = {}) => {
    suppressOpen.current = true
    onValueChange(product._id)
    setIsOpen(false)
    setSearch('')
    setActiveIndex(0)
    const touch =
      window.matchMedia?.('(hover: none) and (pointer: coarse)')?.matches ===
      true
    if (pointer || touch) inputRef.current?.blur()
    else document.getElementById('quantity')?.focus()
    window.setTimeout(() => {
      suppressOpen.current = false
    }, 400)
  }

  const moveActive = (direction) => {
    if (!searchedProducts.length) return
    setIsOpen(true)
    setActiveIndex((current) => {
      const next = current + direction
      if (next < 0) return searchedProducts.length - 1
      if (next >= searchedProducts.length) return 0
      return next
    })
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveActive(1)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveActive(-1)
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      setIsOpen(false)
      return
    }
    if (event.key !== 'Enter') return

    event.preventDefault()
    if (activeProduct) handleSelect(activeProduct)
  }

  return (
    <>
      <Input
        id={id}
        ref={inputRef}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={`${id}-options`}
        aria-activedescendant={
          isOpen && activeProduct ? `${id}-option-${activeProduct._id}` : undefined
        }
        autoComplete="off"
        className={`truncate ${isOpen && selectedLabel ? 'placeholder:text-foreground' : ''}`}
        value={isOpen ? search : selectedLabel}
        placeholder={isOpen && selectedLabel ? selectedLabel : placeholder}
        onFocus={(event) => {
          if (
            suppressOpen.current ||
            event.currentTarget.dataset.keepClosed === 'true'
          ) {
            delete event.currentTarget.dataset.keepClosed
            return
          }
          setSearch('')
          setActiveIndex(0)
          setIsOpen(true)
        }}
        onClick={() => {
          if (suppressOpen.current) return
          setSearch('')
          setActiveIndex(0)
          setIsOpen(true)
        }}
        onChange={(event) => {
          setSearch(event.target.value)
          setIsOpen(true)
        }}
        onBlur={(event) => {
          const next = event.relatedTarget
          if (next instanceof Element && next.closest('[role="listbox"]')) return
          window.setTimeout(() => {
            if (listTouch.current.active) return
            if (document.activeElement === inputRef.current) return
            setIsOpen(false)
          }, 200)
        }}
        onKeyDown={handleKeyDown}
      />
      {isOpen &&
        listPos &&
        createPortal(
          <div
            id={`${id}-options`}
            role="listbox"
            style={{
              position: 'absolute',
              left: listPos.left,
              width: listPos.width,
              top: listPos.top,
              maxHeight: listPos.maxHeight
            }}
            className="z-[100] touch-pan-y overflow-y-auto overscroll-contain rounded-md border bg-popover text-popover-foreground shadow-lg [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2"
            onPointerDown={(event) => {
              if (event.pointerType !== 'touch') return
              listTouch.current = { y: event.clientY, moved: false, active: true }
            }}
            onPointerMove={(event) => {
              if (!listTouch.current.active) return
              if (Math.abs(event.clientY - listTouch.current.y) > 8) {
                listTouch.current.moved = true
              }
            }}
            onPointerUp={() => {
              window.setTimeout(() => {
                listTouch.current.active = false
              }, 250)
            }}
            onPointerCancel={() => {
              listTouch.current = { y: 0, moved: false, active: false }
            }}
          >
            {searchedProducts.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Sin resultados
              </div>
            ) : (
              searchedProducts.map((product, index) => (
                <button
                  type="button"
                  role="option"
                  id={`${id}-option-${product._id}`}
                  aria-selected={index === activeIndex}
                  key={product._id}
                  ref={(node) => {
                    optionRefs.current[index] = node
                  }}
                  className={cn(
                    'block w-full min-h-11 min-w-0 touch-pan-y px-3 py-2 text-left',
                    index === activeIndex && 'bg-accent text-accent-foreground'
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => {
                    if (event.pointerType === 'touch') return
                    event.preventDefault()
                  }}
                  onClick={() => {
                    if (listTouch.current.moved) {
                      listTouch.current.moved = false
                      return
                    }
                    handleSelect(product, { pointer: true })
                  }}
                >
                  <span className="block truncate text-sm">
                    {product.productName}
                    {showStock &&
                      ` (Stock: ${formatQty(product.productStock)})`}
                  </span>
                  {product.productDescription && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {product.productDescription}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>,
          listPos.dialog
        )}
    </>
  )
}

export default ProductCombobox
