import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

// The filter lives in the query param so the view can be shared or reloaded.
const useFilterQuery = (key = 'q') => {
  const [searchParams, setSearchParams] = useSearchParams()
  const value = searchParams.get(key) || ''

  const setValue = useCallback(
    (next) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev)
          if (next) params.set(key, next)
          else params.delete(key)
          return params
        },
        { replace: true }
      )
    },
    [key, setSearchParams]
  )

  return [value, setValue]
}

export default useFilterQuery
