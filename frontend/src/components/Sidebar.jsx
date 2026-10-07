import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Truck,
  BarChart3,
  Building2,
  User,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();

  // Control de Acceso por Roles (RBAC):
  // Solo los Administradores tienen acceso al módulo de gestión de usuarios.
  const isAdmin =
    user?.rol === 'ROLE_ADMINISTRADOR' ||
    user?.rol === 'ADMIN' ||
    user?.username === 'admin';

  // Módulos del sistema:
  // - Dashboard, Perfil: Habilitados para usuarios autenticados.
  // - Usuarios: Habilitado únicamente para Administradores.
  // - Productos, Pedidos, Despachos, Portal B2B, Reportes: Deshabilitados temporalmente para desarrollo de compañeros.
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, enabled: true },
    { name: 'Usuarios', path: '/usuarios', icon: Users, enabled: isAdmin },
    { name: 'Productos', path: '/productos', icon: Package, enabled: false },
    { name: 'Pedidos', path: '/pedidos', icon: ShoppingCart, enabled: false },
    { name: 'Portal B2B', path: '/portal-b2b', icon: Building2, enabled: false },
    { name: 'Despachos', path: '/despachos', icon: Truck, enabled: false },
    { name: 'Reportes', path: '/reportes', icon: BarChart3, enabled: false },
    { name: 'Perfil', path: '/perfil', icon: User, enabled: true },
  ];

  const getInitial = (name) => {
    return (name && name.charAt(0)) ? name.charAt(0).toUpperCase() : 'A';
  };

  return (
    <aside className="w-64 bg-[#0C1E36] text-white flex flex-col shrink-0 min-h-screen border-r border-[#152E50] select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-[#152E50]/70">
        <div className="w-9 h-9 rounded-lg bg-[#1D68EC] flex items-center justify-center shadow-lg shadow-[#1D68EC]/30">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-white block leading-tight">NexusLogix</span>
          <span className="text-[10px] text-cyan-400 tracking-wider font-semibold uppercase">WMS Enterprise</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-5 px-3.5 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <div
                key={item.name}
                className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-500 opacity-35 cursor-not-allowed select-none"
                aria-disabled="true"
                title={item.name === 'Usuarios' ? 'Acceso restringido a Administradores' : 'Módulo en desarrollo'}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1D68EC] text-white shadow-md shadow-[#1D68EC]/25'
                    : 'text-slate-400 hover:text-white hover:bg-[#152E50]/70'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile in Sidebar */}
      <div className="p-3.5 border-t border-[#152E50]/70 bg-[#0A1A2E]">
        <div className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-[#152E50]/50 transition-colors">
          <NavLink to="/perfil" className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full bg-[#1D68EC] border-2 border-[#152E50] flex items-center justify-center text-white font-bold text-sm shrink-0">
              {getInitial(user?.nombre || user?.username)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {user?.nombre || 'Administrador'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || 'admin@empresa.com'}
              </p>
            </div>
          </NavLink>

          <button
            onClick={logout}
            title="Cerrar sesión"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
