import { useCallback, useEffect, useRef } from 'react'

const useIntersectionPagination = (
  loadMore,
  enabled = true,
  rootRef = null
) => {
  const observer = useRef(null)
  const loadMoreRef = useRef(loadMore)
  const requestInFlight = useRef(false)
  const ObserverConstructor = globalThis.IntersectionObserver
  const supportsIntersectionObserver = Boolean(ObserverConstructor)

  useEffect(() => {
    loadMoreRef.current = loadMore
  }, [loadMore])

  const sentinelRef = useCallback(
    (node) => {
      observer.current?.disconnect()
      if (!node || !enabled || !ObserverConstructor) return

      observer.current = new ObserverConstructor(
        ([entry]) => {
          if (entry.isIntersecting && !requestInFlight.current) {
            requestInFlight.current = true
            loadMoreRef.current?.()
          }
        },
        { root: rootRef?.current || null, rootMargin: '200px 0px' }
      )
      observer.current.observe(node)
    },
    [enabled, ObserverConstructor, rootRef]
  )

  useEffect(() => {
    if (!enabled) requestInFlight.current = false
  }, [enabled])

  useEffect(() => () => observer.current?.disconnect(), [])

  return {
    sentinelRef,
    supportsIntersectionObserver
  }
}

export default useIntersectionPagination
