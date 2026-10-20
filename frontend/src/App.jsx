import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Profile from './pages/Profile';
import ProductsPlaceholder from './pages/ProductsPlaceholder';
import OrdersPlaceholder from './pages/OrdersPlaceholder';
import DispatchPlaceholder from './pages/DispatchPlaceholder';
import B2BPortal from './pages/B2BPortal';
import ReportsPlaceholder from './pages/ReportsPlaceholder';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública (Pantalla 1) */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas dentro del Dashboard Layout */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* Pantalla 2 */}
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Pantalla 3 */}
            <Route path="/usuarios" element={<Users />} />
            {/* Pantalla 11 */}
            <Route path="/perfil" element={<Profile />} />
            
            {/* Pantalla 4-6 (Productos) */}
            <Route path="/productos" element={<ProductsPlaceholder />} />
            {/* Pantalla 7-8 (Pedidos) */}
            <Route path="/pedidos" element={<OrdersPlaceholder />} />
            {/* Pantalla 9 (Portal B2B) */}
            <Route path="/portal-b2b" element={<B2BPortal />} />
            {/* Pantalla 10 (Despachos) */}
            <Route path="/despachos" element={<DispatchPlaceholder />} />
            {/* Reportes */}
            <Route path="/reportes" element={<ReportsPlaceholder />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
