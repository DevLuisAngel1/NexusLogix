import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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

function DefaultRedirect() {
  const { user } = useAuth();
  const roleStr = String(user?.rol || user?.role || '').toUpperCase();
  const userStr = String(user?.username || '').toLowerCase();
  const isCliente = roleStr.includes('CLIENTE') || userStr.includes('cliente') || userStr.includes('minero');

  return <Navigate to={isCliente ? '/portal-b2b' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DefaultRedirect />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Users />
                </ProtectedRoute>
              }
            />
            
            <Route path="/perfil" element={<Profile />} />
            
            <Route
              path="/productos"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}>
                  <ProductsPlaceholder />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/pedidos"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}>
                  <OrdersPlaceholder />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/portal-b2b"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'CLIENTE']}>
                  <B2BPortal />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/despachos"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'OPERADOR']}>
                  <DispatchPlaceholder />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/reportes"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ReportsPlaceholder />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
