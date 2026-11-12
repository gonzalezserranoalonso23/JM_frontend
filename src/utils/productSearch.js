const WORD = /[a-z0-9]+/g

export const foldText = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

// Words may sit apart and in any order. A name that starts with the text ranks first.
export const similarProducts = (products, query, limit = 20) => {
  const list = Array.isArray(products) ? products : []
  const foldedQuery = foldText(query).trim()
  const tokens = foldedQuery.match(WORD) ?? []
  if (!tokens.length) return list.slice(0, limit)

  const ranked = []
  for (const product of list) {
    const name = foldText(product?.productName)
    const description = foldText(product?.productDescription)
    const haystack = `${name} ${description}`
    if (!tokens.every((token) => haystack.includes(token))) continue
    let rank = 2
    if (name.startsWith(foldedQuery)) rank = 0
    else if (tokens.every((token) => name.includes(token))) rank = 1
    ranked.push({ product, rank, name })
  }

  ranked.sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name, 'es'))
  return ranked.slice(0, limit).map((item) => item.product)
}
