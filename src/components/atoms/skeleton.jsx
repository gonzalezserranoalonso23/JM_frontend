import { cn } from '@/lib/utils'

const Skeleton = ({ className }) => (
  <div
    className={cn('animate-pulse rounded-md bg-muted', className)}
    aria-hidden="true"
  />
)

export default Skeleton
