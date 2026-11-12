import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { toast } from 'react-hot-toast'
import { handleErrors, notifyError } from '@/libs/handleErrors'

const PERSIST_KEY = 'jm-query-cache'
const DAY = 24 * 60 * 60 * 1000
const CACHE_VERSION = 'v1'

const isCanceled = (error) =>
  error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError'

export const shouldRetryQuery = (failureCount, error) => {
  if (
    isCanceled(error) ||
    error?.code === 'ECONNABORTED' ||
    error?.code === 'ERR_NETWORK' ||
    !error?.response
  ) {
    return false
  }
  return failureCount < 1
}

const reportQueryError = (error, query) => {
  const handled = handleErrors(error)
  if (handled.ignore || handled.offline || query.state.data !== undefined)
    return
  toast.error(handled.message || 'No se pudo cargar la información', {
    id: 'query-load-error'
  })
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: reportQueryError }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.options.onError) return
      notifyError(error)
    }
  }),
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    }
  }
})

const PERSISTED_KEYS = new Set([
  'PaymentTypes',
  'TypeInventories',
  'Categories',
  'Roles',
  'Suppliers',
  'InventoryStats',
  'LiveInformation',
  'pendingTasks'
])

const isPersistable = (query) => {
  if (query.state.status !== 'success') return false
  if (query.queryKey.includes('pages')) return false
  if (query.queryKey[0] === 'users') return query.queryKey[1] === 'me'
  return PERSISTED_KEYS.has(query.queryKey[0])
}

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

export const clearQueryCache = () => {
  queryClient.clear()
  try {
    window.localStorage.removeItem(PERSIST_KEY)
  } catch {
    // no-op
  }
}
