import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '@/components/templates/PageShell'
import { hasFullAccess } from '@/auth/access'
import { useIsAdmin } from '@/features/users.features'
import { useGetPendingTasks } from '@/features/tasks.features'
import { Alert } from '@/components/atoms/alert'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/atoms/card'
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

  return (
    <PageShell>
      <div className="mx-auto grid w-full max-w-xl gap-4 md:max-w-5xl md:grid-cols-2">
        <Card as="section" className="gap-4 p-4 sm:p-6">
          <div>
            <h1 className="text-lg font-semibold">Registrar entrada</h1>
            <p className="text-sm text-muted-foreground">
              Registra tu entrada o salida desde tu ubicación de trabajo.
            </p>
          </div>
          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            <AttendancePunch showTitle={false} />
          </Suspense>
        </Card>
        <Card as="section" className="gap-3 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Pendientes</h2>
              {!isLoading && !isError && (
                <p className="text-sm text-muted-foreground">
                  {total} por atender
                </p>
              )}
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/todolist">Ver pendientes</Link>
            </Button>
          </div>
          {isLoading && <Skeleton className="h-16 w-full" />}
          {isError && (
            <Alert variant="destructive">
              No se pudieron cargar tus pendientes
            </Alert>
          )}
          {!isLoading && !isError && total === 0 && (
            <p className="text-sm text-muted-foreground">
              No tienes pendientes por atender.
            </p>
          )}
        </Card>
      </div>
    </PageShell>
  )
}

const Home = () => {
  const isAdmin = useIsAdmin()

  if (hasFullAccess(isAdmin)) return <StockDashboard />
  return <StaffHome />
}

export default Home
