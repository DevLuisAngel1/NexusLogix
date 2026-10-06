import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  ClipboardList,
  Truck,
  Users,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      const serverMsg = err.response?.data?.message || err.message;
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Credenciales inválidas. Verifica tu usuario y contraseña.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('No se pudo conectar con el servidor Spring Boot (puerto 8090). ¿Está iniciado?');
      } else {
        setError(serverMsg || 'Error inesperado al iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white">
      {/* Columna Izquierda: Banner Institucional NexusLogix (Mockup Pantalla 1) */}
      <div className="md:w-5/12 lg:w-4/12 bg-[#0C1E36] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden select-none">
        {/* Glow & Subtle Pattern */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#1D68EC]/15 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

        {/* Top: Logo NexusLogix */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1D68EC] flex items-center justify-center shadow-lg shadow-[#1D68EC]/40">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">NexusLogix</h1>
            </div>
          </div>
          <p className="text-sm text-slate-300 mt-2 font-normal">
            Gestión logística, más eficiente
          </p>
        </div>

        {/* Middle: Warehouse Graphic Banner */}
        <div className="my-8 relative z-10 rounded-2xl overflow-hidden border border-[#152E50] shadow-2xl bg-gradient-to-b from-[#102A4C] to-[#0A1A2E] p-5">
          <div className="relative h-44 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
            {/* Visual warehouse aesthetic illustration with racks & forklift lighting */}
            <div className="absolute inset-0 bg-cover bg-center opacity-70 mix-blend-luminosity" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C1E36] via-[#0C1E36]/40 to-transparent"></div>
            <div className="relative z-10 text-center px-4">
              <span className="inline-block px-3 py-1 bg-[#1D68EC]/80 backdrop-blur-md text-[11px] font-semibold text-white rounded-full uppercase tracking-wider mb-2">
                WMS Inteligente
              </span>
              <p className="text-xs text-slate-200">
                Optimización de rutas, control de stock en tiempo real y despacho automatizado.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom: Feature Bullets (Mockup Pantalla 1) */}
        <div className="space-y-3.5 relative z-10 pt-2 border-t border-[#152E50]/80">
          <div className="flex items-center gap-3 text-slate-300 text-sm">
            <div className="w-6 h-6 rounded-md bg-[#152E50] text-[#1D68EC] flex items-center justify-center shrink-0">
              <Package className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span>Control de inventario</span>
          </div>

          <div className="flex items-center gap-3 text-slate-300 text-sm">
            <div className="w-6 h-6 rounded-md bg-[#152E50] text-[#1D68EC] flex items-center justify-center shrink-0">
              <ClipboardList className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span>Gestión de pedidos</span>
          </div>

          <div className="flex items-center gap-3 text-slate-300 text-sm">
            <div className="w-6 h-6 rounded-md bg-[#152E50] text-[#1D68EC] flex items-center justify-center shrink-0">
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span>Despachos y entregas</span>
          </div>

          <div className="flex items-center gap-3 text-slate-300 text-sm">
            <div className="w-6 h-6 rounded-md bg-[#152E50] text-[#1D68EC] flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span>Usuarios y permisos</span>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Formulario de Inicio de Sesión (Mockup Pantalla 1) */}
      <div className="flex-1 flex flex-col justify-between p-8 sm:p-12 lg:p-16">
        <div className="max-w-md w-full mx-auto my-auto py-8">
          {/* Header Form */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Iniciar sesión
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Accede a tu cuenta para continuar
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Correo electrónico
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuario@empresa.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC] transition-all pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#1D68EC] border-slate-300 rounded focus:ring-[#1D68EC]"
                />
                <span>Recordar sesión</span>
              </label>
              <a href="#recuperar" onClick={(e) => { e.preventDefault(); alert('Por favor contacta al administrador del sistema para restablecer tu clave.'); }} className="text-[#1D68EC] hover:underline font-medium">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#1D68EC] hover:bg-[#1555C0] text-white text-sm font-semibold rounded-lg shadow-md shadow-[#1D68EC]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          {/* Quick Credential Shortcuts for testing */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-2.5 text-center">
              Credenciales de prueba rápida:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin123')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-medium text-slate-700 transition-colors text-center"
              >
                ADMIN
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('almacenero', 'almacen123')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-medium text-slate-700 transition-colors text-center"
              >
                ALMACENERO
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('supervisor', 'super123')}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-medium text-slate-700 transition-colors text-center"
              >
                SUPERVISOR
              </button>
            </div>
          </div>
        </div>

        {/* Footer in Login (Mockup Pantalla 1) */}
        <div className="text-center text-xs text-slate-400 select-none">
          NexusLogix v1.0
        </div>
      </div>
    </div>
  );
}
