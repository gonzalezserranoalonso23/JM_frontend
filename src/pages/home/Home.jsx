import PageShell from '@/components/PageShell'
import { useAuthStore } from '@/store/auth'
import { StaffClock } from '@/pages/attendance/Attendance'
import { TaskBoard } from '@/pages/todolist/ToDoList'
import StockDashboard from './components/StockDashboard'

const StaffHome = () => (
  <PageShell>
    <div className="flex w-full flex-col items-stretch gap-4 xl:flex-row xl:items-start">
      <div className="w-full shrink-0 sm:max-w-md">
        <StaffClock />
      </div>
      <div className="min-w-0 w-full flex-1">
        <TaskBoard />
      </div>
    </div>
  </PageShell>
)

const Home = () => {
  const isAdmin = useAuthStore((state) => state.isAdmin)

  if (isAdmin) return <StockDashboard />

  return <StaffHome />
}

export default Home
