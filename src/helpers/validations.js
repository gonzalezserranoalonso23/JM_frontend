import { toast } from 'react-hot-toast'

export const verifyLogin = (values) => {
  if (!values.username) return toast.error('El usuario es requerido')
  if (values.username.length < 4)
    return toast.error('El usuario debe contener al menos 4 caracteres')
  if (values.username.includes(' '))
    return toast.error('El usuario no debe incluir espacios')
  if (!values.password) return toast.error('El password es requerido')
  if (values.password.length < 8)
    return toast.error('El password debe contener al menos 8 caracteres')
  if (values.password.includes(' '))
    return toast.error('El password no debe incluir espacios')
}

export const validateCategory = (values) => {
  if (!values.categories) return toast.error('La categoría es requerida')
  if (values.categories.length < 4)
    return toast.error('La categoría debe contener al menos 4 caracteres')
}

export const validateSupplier = (values) => {
  if (!values.suppliersName)
    return toast.error('El nombre del proveedor es requerido')
  if (values.suppliersName.length < 4)
    return toast.error(
      'El nombre del proveedor debe contener al menos 4 caracteres'
    )
}

export const validateProduct = (values) => {
  if (!values.productName)
    return toast.error('El nombre del producto es requerido')
  if (values.productName.length < 4)
    return toast.error(
      'El nombre del producto debe contener al menos 4 caracteres'
    )
  if (!values.productDescription)
    return toast.error('La descripción del producto es requerida')
  if (!values.purchasePrice)
    return toast.error('El precio de compra del producto es requerido')
  if (values.purchasePrice < 0)
    return toast.error('El precio de compra no puede ser negativo')
  if (!values.productPrice)
    return toast.error('El precio de venta del producto es requerido')
  if (values.productPrice < 0)
    return toast.error('El precio de venta no puede ser negativo')
  if (!values.productStock)
    return toast.error('El stock del producto es requerido')
  if (!values.minimumProductStock)
    return toast.error('El stock mínimo del producto es requerido')
  if (!values.supplier)
    return toast.error('El proveedor del producto es requerido')
  if (!values.category)
    return toast.error('La categoría del producto es requerida')
}
