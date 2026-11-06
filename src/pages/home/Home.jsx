import PageShell from '@/components/PageShell'
import { hasFullAccess } from '@/auth/access'
import { useRoleName } from '@/features/users.features'
import { StaffClock } from '@/pages/attendance/Attendance'
import { TaskBoard } from '@/pages/todolist/ToDoList'
import StockDashboard from './components/StockDashboard'

const PersonalHome = () => (
  <PageShell>
    <div className="flex w-full flex-col items-stretch gap-4 xl:flex-row xl:items-start">
      <div className="w-full shrink-0 xl:max-w-md">
        <StaffClock />
      </div>
      <div className="min-w-0 w-full flex-1">
        <TaskBoard />
      </div>
    </div>
  </PageShell>
)

const Home = () => {
  const roleName = useRoleName()

  if (hasFullAccess(roleName)) return <StockDashboard />
  return <PersonalHome />
}

export default Home
