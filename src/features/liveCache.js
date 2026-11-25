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

// Paint the change on pages already loaded before the list responds.
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

