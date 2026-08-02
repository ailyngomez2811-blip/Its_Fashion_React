import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public Pages
import Welcome from './pages/Welcome';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminCategorias from './pages/admin/Categorias';
import AdminProductos from './pages/admin/Productos';
import AdminProveedores from './pages/admin/Proveedores';
import AdminCompras from './pages/admin/Compras';
import AdminVentas from './pages/admin/Ventas';
import AdminDevoluciones from './pages/admin/Devoluciones';
import AdminCaja from './pages/admin/Caja';
import AdminInventario from './pages/admin/Inventario';
import AdminUsuarios from './pages/admin/Usuarios';
import AdminClientes from './pages/admin/Clientes';
import AdminReportes from './pages/admin/Reportes';

// Empleado Pages
import EmpleadoDashboard from './pages/empleado/Dashboard';
import EmpleadoCaja from './pages/empleado/Caja';
import EmpleadoCompras from './pages/empleado/Compras';
import EmpleadoInventario from './pages/empleado/Inventario';
import EmpleadoVentas from './pages/empleado/Ventas';

// Cliente Pages
import ClienteDashboard from './pages/cliente/Dashboard';
import ClienteMisCompras from './pages/cliente/MisCompras';
import ClienteMisDevoluciones from './pages/cliente/MisDevoluciones';
import ClientePerfil from './pages/cliente/Perfil';

// Selectores Dinámicos de Componentes por Rol
const DashboardSelector = () => {
  const { user } = useContext(AuthContext);
  if (user?.rol === 'Administrador') return <AdminDashboard />;
  if (user?.rol === 'Empleado') return <EmpleadoDashboard />;
  if (user?.rol === 'Cliente') return <ClienteDashboard />;
  return null;
};

const CajaSelector = () => {
  const { user } = useContext(AuthContext);
  if (user?.rol === 'Administrador') return <AdminCaja />;
  if (user?.rol === 'Empleado') return <EmpleadoCaja />;
  return <Navigate to="/dashboard" replace />;
};

const ComprasSelector = () => {
  const { user } = useContext(AuthContext);
  if (user?.rol === 'Administrador') return <AdminCompras />;
  if (user?.rol === 'Empleado') return <EmpleadoCompras />;
  return <Navigate to="/dashboard" replace />;
};

const InventarioSelector = () => {
  const { user } = useContext(AuthContext);
  if (user?.rol === 'Administrador') return <AdminInventario />;
  if (user?.rol === 'Empleado') return <EmpleadoInventario />;
  return <Navigate to="/dashboard" replace />;
};

const VentasSelector = () => {
  const { user } = useContext(AuthContext);
  if (user?.rol === 'Administrador') return <AdminVentas />;
  if (user?.rol === 'Empleado') return <EmpleadoVentas />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta Pública Principal */}
          <Route path="/" element={<Welcome />} />

          {/* Ruta Pública: Login */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Públicas de Registro y Recuperación */}
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Dashboard Dinámico */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout title="Dashboard">
                  <DashboardSelector />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Rutas de Gestión Administrativa */}
          <Route 
            path="/usuarios" 
            element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <Layout title="Usuarios">
                  <AdminUsuarios />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/clientes" 
            element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <Layout title="Clientes">
                  <AdminClientes />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/productos" 
            element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <Layout title="Productos">
                  <AdminProductos />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/categorias" 
            element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <Layout title="Categorías">
                  <AdminCategorias />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Rutas de Operaciones (Compartidas/Diferenciadas) */}
          <Route 
            path="/ventas" 
            element={
              <ProtectedRoute allowedRoles={['Administrador', 'Empleado']}>
                <Layout title="Facturación de Ventas">
                  <VentasSelector />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/compras" 
            element={
              <ProtectedRoute allowedRoles={['Administrador', 'Empleado']}>
                <Layout title="Abastecimiento">
                  <ComprasSelector />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/inventario" 
            element={
              <ProtectedRoute allowedRoles={['Administrador', 'Empleado']}>
                <Layout title="Kardex de Inventario">
                  <InventarioSelector />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/caja" 
            element={
              <ProtectedRoute allowedRoles={['Administrador', 'Empleado']}>
                <Layout title="Control de Caja">
                  <CajaSelector />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Devoluciones Administrativas */}
          <Route 
            path="/devoluciones" 
            element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <Layout title="Devoluciones">
                  <AdminDevoluciones />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/proveedores" 
            element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <Layout title="Proveedores">
                  <AdminProveedores />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Rutas de Análisis */}
          <Route 
            path="/reportes" 
            element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <Layout title="Reportes">
                  <AdminReportes />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Rutas exclusivas del perfil Cliente */}
          <Route 
            path="/mis-compras" 
            element={
              <ProtectedRoute allowedRoles={['Cliente']}>
                <Layout title="Mis Compras">
                  <ClienteMisCompras />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/mis-devoluciones" 
            element={
              <ProtectedRoute allowedRoles={['Cliente']}>
                <Layout title="Mis Devoluciones">
                  <ClienteMisDevoluciones />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/perfil" 
            element={
              <ProtectedRoute allowedRoles={['Cliente']}>
                <Layout title="Mi Perfil">
                  <ClientePerfil />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
