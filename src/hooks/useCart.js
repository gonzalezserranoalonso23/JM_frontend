import { useCallback, useState } from 'react'
import { createTempId, sumBy } from '@/utils/commonFunctions'

// Carrito local: cada línea agregada conserva su posición, aunque se repita el producto.
export const useCart = () => {
  const [cart, setCart] = useState([])

  const addItem = useCallback(
    (item) => setCart((prev) => [...prev, { ...item, tempId: createTempId() }]),
    []
  )

  const removeItem = useCallback((tempId) => {
    if (!window.confirm('¿Quitar este producto del carrito?')) return
    setCart((prev) => prev.filter((item) => item.tempId !== tempId))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const total = sumBy(cart, (item) => item.totalAmount)

  return { cart, addItem, removeItem, clearCart, total }
}
