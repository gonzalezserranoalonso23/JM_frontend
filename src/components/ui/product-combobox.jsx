import { formatQty } from '@/utils/commonFunctions'
import { useEffect, useRef, useState } from 'react'
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
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const optionRefs = useRef([])
  const suppressOpen = useRef(false)
  const listTouch = useRef({ y: 0, moved: false, active: false })
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
    const list = listRef.current
    const option = optionRefs.current[activeIndex]
    if (!isOpen || !list || !option) return
    const listRect = list.getBoundingClientRect()
    const optionRect = option.getBoundingClientRect()
    if (optionRect.bottom > listRect.bottom) {
      list.scrollTop += optionRect.bottom - listRect.bottom
    } else if (optionRect.top < listRect.top) {
      list.scrollTop -= listRect.top - optionRect.top
    }
  }, [activeIndex, isOpen])

  const openList = () => {
    setSearch('')
    setActiveIndex(0)
    setIsOpen(true)
  }

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
    }, 300)
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
    <div className="relative">
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
          openList()
        }}
        onClick={() => {
          if (suppressOpen.current) return
          openList()
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
          }, 150)
        }}
        onKeyDown={handleKeyDown}
      />
      {isOpen && (
        <div
          id={`${id}-options`}
          ref={listRef}
          role="listbox"
          className="z-[100] mt-1 max-h-60 touch-pan-y overflow-y-auto overscroll-contain rounded-md border bg-popover text-popover-foreground shadow-md [-webkit-overflow-scrolling:touch]"
          onPointerDown={(event) => {
            if (event.pointerType !== 'touch') return
            listTouch.current = {
              y: event.clientY,
              moved: false,
              active: true
            }
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
                  {showStock && ` (Stock: ${formatQty(product.productStock)})`}
                </span>
                {product.productDescription && (
                  <span className="block truncate text-xs text-muted-foreground">
                    {product.productDescription}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default ProductCombobox
