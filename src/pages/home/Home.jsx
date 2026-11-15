import PageShell from '@/components/templates/PageShell'
import { hasFullAccess } from '@/auth/access'
import { useRoleName } from '@/features/users.features'
import { StaffClock } from '@/pages/attendance/Attendance'
import StockDashboard from './components/StockDashboard'

const PersonalHome = () => (
  <PageShell>
    <div className="w-full xl:max-w-md">
      <StaffClock />
    </div>
  </PageShell>
)

const Home = () => {
  const roleName = useRoleName()

  if (hasFullAccess(roleName)) return <StockDashboard />
  return <PersonalHome />
}

export default Home
