import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const PERSIST_KEY = 'jm-query-cache'
const DAY = 24 * 60 * 60 * 1000
// Subir al cambiar la forma de los datos persistidos para descartar el caché viejo.
const CACHE_VERSION = 'v1'

// Los datos operativos (stock, movimientos) se refrescan con las
// invalidaciones de cada mutación; 1 min evita peticiones repetidas al navegar.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: DAY,
      retry: 1,
      refetchOnReconnect: true
    }
  }
})

// Solo se persisten catálogos casi estáticos: arrancan al instante y sirven offline.
const PERSISTED_KEYS = new Set([
  'PaymentTypes',
  'TypeInventories',
  'Categories',
  'Suppliers'
])

const isPersistable = (query) =>
  query.state.status === 'success' &&
  PERSISTED_KEYS.has(query.queryKey[0]) &&
  !query.queryKey.includes('pages')

export const persistOptions = {
  persister: createSyncStoragePersister({
    storage: typeof window === 'undefined' ? undefined : window.localStorage,
    key: PERSIST_KEY,
    throttleTime: 1000
  }),
  maxAge: DAY,
  buster: CACHE_VERSION,
  dehydrateOptions: { shouldDehydrateQuery: isPersistable }
}

// Se limpia al cerrar sesión o al vencer el token para no mezclar datos entre usuarios.
export const clearQueryCache = () => {
  queryClient.clear()
  try {
    window.localStorage.removeItem(PERSIST_KEY)
  } catch {
    // no-op
  }
}
