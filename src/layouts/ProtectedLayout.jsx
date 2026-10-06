import { Outlet } from 'react-router-dom'
import Navigate from '@/ui/Navigate'
import useTableCards from '@/hooks/useTableCards'

const ProtectedLayout = () => {
  useTableCards()
  return (
    <>
      <Navigate />
      <main className="min-h-dvh bg-[var(--bg-page)] pt-16">
        <Outlet />
      </main>
    </>
  )
}

export default ProtectedLayout
