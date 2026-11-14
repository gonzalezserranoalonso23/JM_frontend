import { roundTo } from '@/utils/commonFunctions'

export const idOf = (value) => {
  if (!value) return ''
  if (typeof value === 'object') return String(value._id || '')
  return String(value)
}

const relation = (nextValue, currentValue, catalog, labelKey) => {
  if (nextValue && typeof nextValue === 'object' && nextValue[labelKey]) {
    return nextValue
  }
  const nextId = idOf(nextValue)
  if (!nextId) return currentValue
  if (
    nextId === idOf(currentValue) &&
    currentValue &&
    typeof currentValue === 'object'
  ) {
    return currentValue
  }
  return (
    (catalog || []).find((item) => String(item._id) === nextId) || currentValue
  )
}

const mapRows = (current, mapRow) => {
  if (!current) return current
  if (Array.isArray(current)) return current.map(mapRow)
  if (Array.isArray(current.pages)) {
    return {
      ...current,
      pages: current.pages.map((page) =>
        Array.isArray(page?.data)
          ? { ...page, data: page.data.map(mapRow) }
          : page
      )
    }
  }
  if (Array.isArray(current.data)) {
    return { ...current, data: current.data.map(mapRow) }
  }
  return current
}

// Pinta el cambio en las páginas ya cargadas antes de que responda el listado.
export const applyProductUpdate = (current, updated, catalogs = {}) => {
  if (!current || !updated?._id) return current
  return mapRows(current, (row) => {
    if (idOf(row) !== idOf(updated)) return row
    return {
      ...row,
      ...updated,
      supplier: relation(
        updated.supplier,
        row.supplier,
        catalogs.suppliers,
        'suppliersName'
      ),
      category: relation(
        updated.category,
        row.category,
        catalogs.categories,
        'categories'
      )
    }
  })
}

export const withRelations = (product, catalogs = {}) => {
  if (!product) return product
  return {
    ...product,
    supplier: relation(
      product.supplier,
      null,
      catalogs.suppliers,
      'suppliersName'
    ),
    category: relation(
      product.category,
      null,
      catalogs.categories,
      'categories'
    )
  }
}

export const prependProduct = (current, product) => {
  if (!product?._id) return current
  if (Array.isArray(current)) {
    if (current.some((row) => idOf(row) === idOf(product))) return current
    return [product, ...current]
  }
  if (!current?.pages?.length) return current
  if (
    current.pages.some((page) =>
      (page.data || []).some((row) => idOf(row) === idOf(product))
    )
  ) {
    return current
  }
  return {
    ...current,
    pages: current.pages.map((page, index) => ({
      ...page,
      total: (page.total ?? 0) + 1,
      data: index === 0 ? [product, ...(page.data || [])] : page.data
    }))
  }
}

export const removeProduct = (current, id) => {
  const target = idOf(id)
  if (!target || !current) return current
  if (Array.isArray(current)) {
    return current.filter((row) => idOf(row) !== target)
  }
  if (Array.isArray(current.pages)) {
    let removed = 0
    const pages = current.pages.map((page) => ({
      ...page,
      data: (page.data || []).filter((row) => {
        const drop = idOf(row) === target
        if (drop) removed += 1
        return !drop
      })
    }))
    if (!removed) return current
    return {
      ...current,
      pages: pages.map((page) => ({
        ...page,
        total: Math.max(0, (page.total ?? 0) - removed)
      }))
    }
  }
  if (Array.isArray(current.data)) {
    return {
      ...current,
      data: current.data.filter((row) => idOf(row) !== target)
    }
  }
  return current
}

export const applyStockDeltas = (current, deltas) => {
  if (!current || !deltas) return current
  return mapRows(current, (row) => {
    const delta = deltas[idOf(row)]
    if (!delta) return row
    return {
      ...row,
      productStock: roundTo(Number(row.productStock) + delta, 3)
    }
  })
}

export const stockDelta = (direction, quantity) => {
  const change = Number(direction) * Number(quantity)
  if (!Number.isFinite(change)) return 0
  return roundTo(change, 3)
}

const listRows = (current) =>
  (current?.pages || []).flatMap((page) => page.data || [])

export const prependInventoryRecords = (current, records) => {
  if (!current?.pages?.length || !records?.length) return current
  const existing = new Set(listRows(current).map((row) => String(row._id)))
  const fresh = records.filter(
    (row) => row?._id && !existing.has(String(row._id))
  )
  if (!fresh.length) return current
  return {
    ...current,
    pages: current.pages.map((page, index) => ({
      ...page,
      total: (page.total ?? 0) + fresh.length,
      data: index === 0 ? [...fresh, ...(page.data || [])] : page.data
    }))
  }
}

export const replaceInventoryRecord = (current, id, next) => {
  const target = String(id)
  if (!current?.pages || !target) return current
  return {
    ...current,
    pages: current.pages.map((page) => ({
      ...page,
      data: (page.data || []).map((row) =>
        String(row._id) === target ? next : row
      )
    }))
  }
}

export const removeInventoryRecord = (current, id) => {
  const target = String(id)
  if (!current?.pages || !target) return current
  let removed = 0
  const pages = current.pages.map((page) => ({
    ...page,
    data: (page.data || []).filter((row) => {
      const drop = String(row._id) === target
      if (drop) removed += 1
      return !drop
    })
  }))
  if (!removed) return current
  return {
    ...current,
    pages: pages.map((page) => ({
      ...page,
      total: Math.max(0, (page.total ?? 0) - 1)
    }))
  }
}

// La lista filtrada por texto se deja al refetch. Sin búsqueda, el renglón
// entra, se actualiza o sale según la dirección y el tipo de pago.
export const fitsMovementList = (queryKey, record) => {
  const [, , direction, search, paymentType] = queryKey
  if (search) return null
  const recordDirection = Number(record?.typeInventory?.stockDirection)
  if (
    direction !== undefined &&
    direction !== '' &&
    Number.isFinite(recordDirection) &&
    Number(direction) !== recordDirection
  ) {
    return false
  }
  if (paymentType && idOf(record?.paymentType) !== String(paymentType)) {
    return false
  }
  return true
}
