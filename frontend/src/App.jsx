import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import CustomerLayout from './components/CustomerLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import POS from './pages/POS';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerCatalog from './pages/CustomerCatalog';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Reports from './pages/Reports';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
}

function RoleBasedDashboard() {
  const user = getStoredUser();
  return user.role === 'customer' ? <CustomerDashboard /> : <Dashboard />;
}

function LayoutWrapper() {
  const user = getStoredUser();
  if (user.role === 'customer') {
    return (
      <CustomerLayout>
        <Outlet />
      </CustomerLayout>
    );
  }
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <LayoutWrapper />
          </ProtectedRoute>
        }
      >
        <Route index element={<RoleBasedDashboard />} />
        <Route path="catalog" element={<CustomerCatalog />} />
        <Route path="orders" element={<Orders />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="products" element={<Products />} />
        <Route path="customers" element={<Customers />} />
        <Route path="pos" element={<POS />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
