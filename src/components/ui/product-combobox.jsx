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
    const place = () => {
      const inputRect = input.getBoundingClientRect()
      const dialogRect = dialog.getBoundingClientRect()
      const viewport = window.visualViewport
      const visibleTop = Math.max(dialogRect.top, viewport?.offsetTop ?? 0)
      const visibleBottom = Math.min(
        dialogRect.bottom,
        (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight)
      )
      const spaceBelow = visibleBottom - inputRect.bottom - GAP
      const spaceAbove = inputRect.top - visibleTop - GAP
      const openUp = spaceBelow < 200 && spaceAbove > spaceBelow
      const width = Math.min(inputRect.width, dialogRect.width)
      const left = Math.min(
        Math.max(inputRect.left - dialogRect.left, 0),
        dialogRect.width - width
      )

      setListPos({
        dialog,
        left,
        width,
        maxHeight: Math.max(
          Math.min(openUp ? spaceAbove : spaceBelow, 192),
          96
        ),
        ...(openUp
          ? { bottom: dialogRect.bottom - inputRect.top + GAP }
          : { top: inputRect.bottom - dialogRect.top + GAP })
      })
    }

    place()
    window.addEventListener('resize', place)
    window.visualViewport?.addEventListener('resize', place)
    window.visualViewport?.addEventListener('scroll', place)
    document.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.visualViewport?.removeEventListener('resize', place)
      window.visualViewport?.removeEventListener('scroll', place)
      document.removeEventListener('scroll', place, true)
    }
  }, [isOpen])

  const handleSelect = (product) => {
    onValueChange(product._id)
    setIsOpen(false)
    setSearch('')
    setActiveIndex(0)
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
        onFocus={() => {
          setSearch('')
          setActiveIndex(0)
          setIsOpen(true)
        }}
        onChange={(event) => {
          setSearch(event.target.value)
          setIsOpen(true)
        }}
        onBlur={() => setIsOpen(false)}
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
              bottom: listPos.bottom,
              maxHeight: listPos.maxHeight
            }}
            className="z-[100] overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-lg [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2"
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
                    'block w-full min-w-0 px-3 py-2 text-left',
                    index === activeIndex && 'bg-accent text-accent-foreground'
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    handleSelect(product)
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
