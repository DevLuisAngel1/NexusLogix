import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Cargando NexusLogix WMS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const roleStr = String(user?.rol || user?.role || '').toUpperCase();
    const userStr = String(user?.username || '').toLowerCase();

    const isAdmin = roleStr.includes('ADMIN') || userStr === 'admin' || userStr === 'administrador';
    const isCliente = roleStr.includes('CLIENTE') || userStr.includes('cliente') || userStr.includes('minero');

    const currentRole = isAdmin ? 'ADMIN' : (isCliente ? 'CLIENTE' : 'OPERADOR');

    if (!allowedRoles.includes(currentRole)) {
      const fallback = isCliente ? '/portal-b2b' : '/dashboard';
      return <Navigate to={fallback} replace />;
    }
  }

  return children ? children : <Outlet />;
}
