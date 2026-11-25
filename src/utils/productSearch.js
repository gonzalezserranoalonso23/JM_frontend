const WORD = /[a-z0-9]+/g
const FILLER = new Set([
  'de',
  'del',
  'la',
  'el',
  'los',
  'las',
  'y',
  'a',
  'en',
  'con',
  'un',
  'una',
  'por',
  'para',
  'al',
  'lo'
])

export const foldText = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

// "coca de 600" keeps coca and 600. Filler words are not required in the name.
export const searchTokens = (query) => {
  const tokens = foldText(query).trim().match(WORD) ?? []
  return tokens.filter((token) => token.length > 1 && !FILLER.has(token))
}

// Words may sit apart and in any order. A name that starts with the text ranks first.
export const similarProducts = (products, query, limit = 20) => {
  const list = Array.isArray(products) ? products : []
  const foldedQuery = foldText(query).trim()
  const tokens = searchTokens(query)
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
