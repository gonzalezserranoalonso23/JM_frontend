import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Protected from './auth/Protected'
import { appRoutes } from './auth/appRoutes'
import Login from './pages/Login'
import ProtectedLayout from '@/components/templates/ProtectedLayout'
import useNetworkToasts from './hooks/useNetworkToasts'
import useServiceWorkerUpdate from './hooks/useServiceWorkerUpdate'
import { useAppStatus } from '@/features/app.features'
import { useAppState } from '@/store/appState'
import DisconnectedScreen from '@/components/organisms/DisconnectedScreen'

const App = () => {
  useNetworkToasts()
  useServiceWorkerUpdate()
  useAppStatus()
  const shutdown = useAppState((state) => state.shutdown)
  const ready = useAppState((state) => state.ready)

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        containerStyle={{
          position: 'fixed',
          zIndex: 10000,
          top: 'calc(var(--app-nav-height) + 0.5rem)'
        }}
      />
      <BrowserRouter>
        {!ready ? (
          <main className="h-dvh w-full bg-background" />
        ) : shutdown ? (
          <DisconnectedScreen />
        ) : (
          <Routes>
            <Route path="/" element={<Login />} />

            <Route element={<Protected />}>
              <Route element={<ProtectedLayout />}>
                {appRoutes.map(({ path, Component }) => (
                  <Route key={path} path={path} element={<Component />} />
                ))}
              </Route>
            </Route>
            <Route
              path="*"
              element={
                <main className="flex flex-1 items-center justify-center p-6">
                  <h1 className="text-2xl font-semibold">Not Found!</h1>
                </main>
              }
            />
          </Routes>
        )}
      </BrowserRouter>
    </>
  )
}
export default App
