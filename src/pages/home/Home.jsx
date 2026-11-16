import { lazy, Suspense } from 'react'
import PageShell from '@/components/templates/PageShell'
import { hasFullAccess } from '@/auth/access'
import { useRoleName } from '@/features/users.features'
import StockDashboard from './components/StockDashboard'

const StaffClock = lazy(() =>
  import('@/pages/attendance/Attendance').then((module) => ({
    default: module.StaffClock
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

const Home = () => {
  const roleName = useRoleName()

  if (hasFullAccess(roleName)) return <StockDashboard />
  return <PersonalHome />
}

export default Home
