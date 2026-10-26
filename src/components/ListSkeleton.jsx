import { Card, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/ui/skeleton'

const ROWS = 6

const ListSkeleton = ({ rows = ROWS }) => (
  <div role="status" aria-label="Cargando">
    <div className="space-y-3 xl:hidden">
      {Array.from({ length: rows }, (_, index) => (
        <Card key={index} className="gap-3 py-4">
          <CardContent className="space-y-3 px-4">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="hidden overflow-hidden rounded-lg border xl:block">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0"
        >
          <Skeleton className="h-4 w-24 shrink-0" />
          <Skeleton className="h-4 min-w-0 flex-1" />
          <Skeleton className="h-4 w-16 shrink-0" />
          <Skeleton className="h-4 w-20 shrink-0" />
        </div>
      ))}
    </div>
  </div>
)

export default ListSkeleton
