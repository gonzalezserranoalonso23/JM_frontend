import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Auth
import Protected from './auth/Protected'

// Unprotected Routes
import Login from './pages/Login'

// Protected Roues
import Home from './pages/home/Home'
import Entries from './pages/entries/Entries'
import EntryDetails from './pages/entries/EntryDetails'
import Issues from './pages/issues/Issues'
import IssueDetails from './pages/issues/IssueDetails'
import Orders from './pages/orders/Orders'
import OrderDetails from './pages/orders/OrderDetails'
import Reports from './pages/reports/Reports'
import ReportDetails from './pages/reports/ReportDetails'
import ToDoList from './pages/todolist/ToDoList'
import ToDoListDetails from './pages/todolist/ToDoListDetails'
import Catalog from './pages/catalogs/Catalogs'
import Users from './pages/users/Users'
import UserDetails from './pages/users/UserDetails'
import Products from './pages/products/Products'
import ProductDetails from './pages/products/ProductDetails'
import Suppliers from './pages/suppliers/Suppliers'
import SupplierDetails from './pages/suppliers/SupplierDetails'
import Categories from './pages/categories/Categories'

// Store
import { useAuthStore } from './store/auth'
import { Toaster } from 'react-hot-toast'

const App = () => {
  const isLogged = useAuthStore((state) => state.isLogged)

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route element={<Protected isLogged={isLogged} />}>
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
            <Route path="/catalogs" element={<Catalog />} />

            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserDetails />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/suppliers/:id" element={<SupplierDetails />} />
            <Route path="/categories" element={<Categories />} />
          </Route>
          <Route path="*" element={<h1>Not Found!</h1>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
export default App
