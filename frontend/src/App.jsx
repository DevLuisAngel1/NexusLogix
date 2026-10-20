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
import ReportsPlaceholder from './pages/ReportsPlaceholder';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/usuarios" element={<Users />} />
            <Route path="/perfil" element={<Profile />} />
            
            {/* Rutas asignadas a compañeros de equipo */}
            <Route path="/productos" element={<ProductsPlaceholder />} />
            <Route path="/pedidos" element={<OrdersPlaceholder />} />
            <Route path="/despachos" element={<DispatchPlaceholder />} />
            <Route path="/reportes" element={<ReportsPlaceholder />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
