import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Input } from '@/components/ui/input'

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
  const [listPos, setListPos] = useState(null)
  const inputRef = useRef(null)
  const selectedProduct = productList.find((product) => product._id === value)
  const searchedProducts = productList.filter((product) => {
    const query = normalize(search.trim())
    return (
      !query ||
      normalize(product.productName).includes(query) ||
      normalize(product.productDescription).includes(query)
    )
  })

  useEffect(() => {
    if (!isOpen) return
    const input = inputRef.current
    const dialog = input?.closest('[role="dialog"]')
    if (!input || !dialog) return

    const inputRect = input.getBoundingClientRect()
    const dialogRect = dialog.getBoundingClientRect()
    const spaceBelow = dialogRect.bottom - inputRect.bottom
    const openUp =
      spaceBelow < 220 && inputRect.top - dialogRect.top > spaceBelow

    setListPos({
      dialog,
      left: inputRect.left - dialogRect.left,
      width: inputRect.width,
      ...(openUp
        ? { bottom: dialogRect.bottom - inputRect.top + 4 }
        : { top: inputRect.bottom - dialogRect.top + 4 })
    })
  }, [isOpen])

  const handleSelect = (product) => {
    onValueChange(product._id)
    setIsOpen(false)
    setSearch('')
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
        autoComplete="off"
        className="truncate"
        value={
          isOpen
            ? search
            : selectedProduct
              ? `${selectedProduct.productName}${
                  showStock ? ` (Stock: ${selectedProduct.productStock})` : ''
                }`
              : ''
        }
        placeholder={placeholder}
        onFocus={() => {
          setSearch('')
          setIsOpen(true)
        }}
        onChange={(event) => {
          setSearch(event.target.value)
          setIsOpen(true)
        }}
        onBlur={() => setIsOpen(false)}
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
              bottom: listPos.bottom
            }}
            className="z-[100] max-h-48 overflow-y-scroll rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2"
          >
            {searchedProducts.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Sin resultados
              </div>
            ) : (
              searchedProducts.map((product) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={product._id === value}
                  key={product._id}
                  className="block w-full min-w-0 px-3 py-2 text-left hover:bg-[var(--bg-subtle)]"
                  onMouseDown={(event) => {
                    event.preventDefault()
                    handleSelect(product)
                  }}
                >
                  <span className="block truncate text-sm">
                    {product.productName}
                    {showStock && ` (Stock: ${product.productStock})`}
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
