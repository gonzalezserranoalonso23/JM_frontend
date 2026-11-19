import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '@/components/templates/PageShell'
import { hasFullAccess } from '@/auth/access'
import { useRoleName } from '@/features/users.features'
import { useGetPendingTasks } from '@/features/tasks.features'
import { Alert } from '@/components/atoms/alert'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/atoms/card'
import { cn } from '@/lib/utils'
import Skeleton from '@/components/atoms/skeleton'
import StockDashboard from './components/StockDashboard'

const StaffClock = lazy(() =>
  import('@/pages/attendance/Attendance').then((module) => ({
    default: module.StaffClock
  }))
)

const AttendancePunch = lazy(() =>
  import('@/pages/attendance/Attendance').then((module) => ({
    default: module.AttendancePunch
  }))
)

const PersonalHome = () => (
  <PageShell>
    <div className="w-full xl:max-w-md">
      <Suspense fallback={null}>
        <StaffClock />
      </Suspense>
    </div>
  </PageShell>
)

const StaffHome = () => {
  const { total, isLoading, isError } = useGetPendingTasks()
  const showTaskPanel = isLoading || isError || total > 0

  return (
    <PageShell>
      <div
        className={cn(
          'mx-auto grid w-full justify-center justify-items-center gap-4 lg:grid-cols-[minmax(0,50vw)_minmax(18rem,1fr)]',
          !showTaskPanel && 'lg:grid-cols-1'
        )}
      >
        <div className="w-full md:w-[50vw]">
          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            <AttendancePunch />
          </Suspense>
        </div>
        {showTaskPanel && (
          <div className="w-full max-w-md">
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : isError ? (
              <Alert variant="destructive">
                No se pudieron cargar tus pendientes
              </Alert>
            ) : (
              <Card className="gap-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">Pendientes</h2>
                    <p className="text-sm text-muted-foreground">
                      {total} por atender
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/todolist">Ver pendientes</Link>
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </PageShell>
  )
}

const Home = () => {
  const roleName = useRoleName()

  if (hasFullAccess(roleName)) return <StockDashboard />
  if (roleName === 'Staff') return <StaffHome />
  return <PersonalHome />
}

export default Home
