import { Button } from '@/components/atoms/button'
import Loading from '@/components/atoms/Loading'
import useIntersectionPagination from '@/hooks/useIntersectionPagination'

// Shared infinite-scroll footer: observer, spinner, and a fallback button.
const InfiniteScrollFooter = ({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage
}) => {
  const { sentinelRef, supportsIntersectionObserver } =
    useIntersectionPagination(
      fetchNextPage,
      Boolean(hasNextPage) && !isFetchingNextPage
    )

  if (!hasNextPage && !isFetchingNextPage) return null

  return (
    <div className="flex min-h-24 flex-col items-center justify-center">
      {hasNextPage && supportsIntersectionObserver && (
        <div ref={sentinelRef} className="h-1" aria-hidden="true" />
      )}
      {isFetchingNextPage && <Loading fullScreen={false} />}
      {hasNextPage && !supportsIntersectionObserver && (
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          Cargar más
        </Button>
      )}
    </div>
  )
}

export default InfiniteScrollFooter
