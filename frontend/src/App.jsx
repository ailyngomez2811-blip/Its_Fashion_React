import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Páginas del Sistema
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import Categorias from './pages/Categorias';
import Ventas from './pages/Ventas';
import Compras from './pages/Compras';
import Inventario from './pages/Inventario';
import Devoluciones from './pages/Devoluciones';
import Proveedores from './pages/Proveedores';
import Caja from './pages/Caja';
import Reportes from './pages/Reportes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta Pública: Login */}
          <Route path="/login" element={<Login />} />

          {/* Ruta Protegida Principal: Dashboard */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout title="Dashboard">
                  <Dashboard />
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
                  <Usuarios />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/clientes" 
            element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <Layout title="Clientes">
                  <Clientes />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/productos" 
            element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <Layout title="Productos">
                  <Productos />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/categorias" 
            element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <Layout title="Categorías">
                  <Categorias />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Rutas de Operaciones */}
          <Route 
            path="/ventas" 
            element={
              <ProtectedRoute>
                <Layout title="Facturación de Ventas">
                  <Ventas />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/compras" 
            element={
              <ProtectedRoute>
                <Layout title="Abastecimiento">
                  <Compras />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/inventario" 
            element={
              <ProtectedRoute>
                <Layout title="Kardex de Inventario">
                  <Inventario />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/devoluciones" 
            element={
              <ProtectedRoute>
                <Layout title="Devoluciones">
                  <Devoluciones />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/proveedores" 
            element={
              <ProtectedRoute>
                <Layout title="Proveedores">
                  <Proveedores />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/caja" 
            element={
              <ProtectedRoute allowedRoles={['Administrador']}>
                <Layout title="Control de Caja">
                  <Caja />
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
                  <Reportes />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Rutas exclusivas del perfil Cliente (Placeholder) */}
          <Route 
            path="/mis-compras" 
            element={
              <ProtectedRoute allowedRoles={['Cliente']}>
                <Layout title="Mis Compras">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <h2 className="text-xl font-bold font-serif text-slate-800 mb-2">Mis Compras</h2>
                    <p className="text-slate-500 font-light">Sección en proceso de migración para clientes.</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/mis-devoluciones" 
            element={
              <ProtectedRoute allowedRoles={['Cliente']}>
                <Layout title="Mis Devoluciones">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <h2 className="text-xl font-bold font-serif text-slate-800 mb-2">Mis Devoluciones</h2>
                    <p className="text-slate-500 font-light">Sección en proceso de migración para clientes.</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/perfil" 
            element={
              <ProtectedRoute allowedRoles={['Cliente']}>
                <Layout title="Mi Perfil">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                    <h2 className="text-xl font-bold font-serif text-slate-800 mb-2">Mi Perfil</h2>
                    <p className="text-slate-500 font-light">Sección en proceso de migración para clientes.</p>
                  </div>
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
