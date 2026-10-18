import { lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Auth
import Protected from './auth/Protected'

// Unprotected Routes
import Login from './pages/Login'

// Protected Roues
const Home = lazy(() => import('./pages/home/Home'))
const Entries = lazy(() => import('./pages/entries/Entries'))
const EntryDetails = lazy(() => import('./pages/entries/EntryDetails'))
const Issues = lazy(() => import('./pages/issues/Issues'))
const IssueDetails = lazy(() => import('./pages/issues/IssueDetails'))
const Orders = lazy(() => import('./pages/orders/Orders'))
const OrderDetails = lazy(() => import('./pages/orders/OrderDetails'))
const Reports = lazy(() => import('./pages/reports/Reports'))
const ReportDetails = lazy(() => import('./pages/reports/ReportDetails'))
const ToDoList = lazy(() => import('./pages/todolist/ToDoList'))
const ToDoListDetails = lazy(() => import('./pages/todolist/ToDoListDetails'))
const Catalog = lazy(() => import('./pages/catalogs/Catalogs'))
const Users = lazy(() => import('./pages/users/Users'))
const UserDetails = lazy(() => import('./pages/users/UserDetails'))
const Products = lazy(() => import('./pages/products/Products'))
const Suppliers = lazy(() => import('./pages/suppliers/Suppliers'))
const SupplierDetails = lazy(() => import('./pages/suppliers/SupplierDetails'))
const Categories = lazy(() => import('./pages/categories/Categories'))
const PaymentTypes = lazy(() => import('./pages/payment-types/PaymentTypes'))
const DailyInformation = lazy(
  () => import('./pages/daily-information/DailyInformation')
)
const Cash = lazy(() => import('./pages/cash/Cash'))
const Shortages = lazy(() => import('./pages/shortages/Shortages'))

import { Toaster } from 'react-hot-toast'
import ProtectedLayout from './layouts/ProtectedLayout'
import useNetworkToasts from './hooks/useNetworkToasts'
import useServiceWorkerUpdate from './hooks/useServiceWorkerUpdate'

const App = () => {
  useNetworkToasts()
  useServiceWorkerUpdate()

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        containerStyle={{
          position: 'fixed',
          zIndex: 10000,
          top: 'max(1rem, env(safe-area-inset-top))'
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route element={<Protected />}>
            <Route element={<ProtectedLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/entries" element={<Entries />} />
              <Route path="/entries/:id" element={<EntryDetails />} />
              <Route path="/issues" element={<Issues />} />
              <Route path="/issues/:id" element={<IssueDetails />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/:id" element={<ReportDetails />} />
              <Route path="/todolist" element={<ToDoList />} />
              <Route path="/todolist/:id" element={<ToDoListDetails />} />
              <Route element={<Protected adminOnly />}>
                <Route path="/catalogs" element={<Catalog />} />
                <Route path="/payment-types" element={<PaymentTypes />} />
                <Route path="/users" element={<Users />} />
                <Route path="/users/:id" element={<UserDetails />} />
              </Route>
              <Route path="/products" element={<Products />} />

              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/suppliers/:id" element={<SupplierDetails />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/daily-information" element={<DailyInformation />} />
              <Route path="/shortages" element={<Shortages />} />
              <Route path="/cash" element={<Cash />} />
            </Route>
          </Route>
          <Route path="*" element={<h1>Not Found!</h1>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
export default App
