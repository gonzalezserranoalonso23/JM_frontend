import { cn } from '@/lib/utils'

const PageShell = ({ children, className }) => (
  <div className={cn('page-content-shell', className)}>{children}</div>
)

export default PageShell
