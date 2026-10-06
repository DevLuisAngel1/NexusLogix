import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  AlertCircle,
  Save,
  ChevronDown,
  Key
} from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    nombre: user?.nombre || 'Administrador',
    email: user?.email || 'admin@empresa.com',
    rol: user?.rol || 'Administrador',
    passwordActual: '',
    nuevaPassword: '',
  });

  const [notification, setNotification] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser({
      ...user,
      nombre: formData.nombre,
      email: formData.email,
    });
    setNotification({ type: 'success', text: 'Cambios guardados exitosamente.' });
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header (Mockup Pantalla 11) */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mi perfil</h1>
        <p className="text-sm text-slate-500">Gestiona tu información personal</p>
      </div>

      {/* Alerta de confirmación */}
      {notification && (
        <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Tarjeta Principal de Perfil (Mockup Pantalla 11) */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
        {/* Avatar y Datos del Encabezado */}
        <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-[#1D68EC] text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-[#1D68EC]/20 shrink-0">
            {formData.nombre?.charAt(0) || 'A'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{formData.nombre}</h2>
            <p className="text-sm text-slate-400">{formData.email}</p>
          </div>
        </div>

        {/* Formulario de Perfil (Mockup Pantalla 11) */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC] transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC] transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Rol
            </label>
            <div className="relative">
              <select
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC] appearance-none"
              >
                <option value="Administrador">Administrador</option>
                <option value="Operador">Operador</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Cliente">Cliente</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Botón Guardar cambios (Azul Sólido exacto al Mockup) */}
          <div className="pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1D68EC] hover:bg-[#1555C0] text-white text-sm font-semibold rounded-lg shadow-sm shadow-[#1D68EC]/20 transition-all cursor-pointer"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>

      {/* Tarjeta de Seguridad y Cambio de Clave */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm max-w-xl">
        <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Key className="w-4 h-4 text-[#1D68EC]" />
          Seguridad de la Cuenta
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Actualiza tu clave periódicamente para proteger tu acceso.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Contraseña Actual
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.passwordActual}
              onChange={(e) => setFormData({ ...formData, passwordActual: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nueva Contraseña
            </label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.nuevaPassword}
              onChange={(e) => setFormData({ ...formData, nuevaPassword: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              if (formData.nuevaPassword.length < 6) {
                alert('La nueva contraseña debe tener al menos 6 caracteres.');
                return;
              }
              setFormData({ ...formData, passwordActual: '', nuevaPassword: '' });
              setNotification({ type: 'success', text: 'Contraseña actualizada correctamente.' });
              setTimeout(() => setNotification(null), 3500);
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Actualizar Clave
          </button>
        </div>
      </div>
    </div>
  );
}
