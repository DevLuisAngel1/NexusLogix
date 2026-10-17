import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../api/authService';
import {
  CheckCircle2,
  AlertCircle,
  Lock,
  Key,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
    rol: user?.rol || user?.role || 'Usuario',
  });

  const [passwordData, setPasswordData] = useState({
    passwordActual: '',
    nuevaPassword: '',
    confirmarPassword: '',
  });

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [profileNotification, setProfileNotification] = useState(null);
  const [passwordNotification, setPasswordNotification] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        rol: user.rol || user.role || 'Usuario',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileNotification(null);
    setLoadingProfile(true);

    try {
      if (!user?.id) {
        throw new Error('Identificador de usuario no disponible.');
      }

      const res = await authService.updateUser(user.id, {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
      });

      const updatedUser = {
        ...user,
        ...(res.data || {}),
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
      };

      updateUser(updatedUser);

      setProfileNotification({
        type: 'success',
        text: 'Información de perfil actualizada exitosamente en el sistema.',
      });
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      const serverMsg = err.response?.data?.mensaje || err.message;
      setProfileNotification({
        type: 'error',
        text: serverMsg || 'Error al actualizar la información de perfil.',
      });
    } finally {
      setLoadingProfile(false);
      setTimeout(() => setProfileNotification(null), 4500);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordNotification(null);

    if (!passwordData.passwordActual) {
      setPasswordNotification({
        type: 'error',
        text: 'Por favor ingresa tu contraseña actual.',
      });
      return;
    }

    if (passwordData.nuevaPassword.length < 6) {
      setPasswordNotification({
        type: 'error',
        text: 'La nueva contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    if (passwordData.nuevaPassword !== passwordData.confirmarPassword) {
      setPasswordNotification({
        type: 'error',
        text: 'La confirmación no coincide con la nueva contraseña.',
      });
      return;
    }

    setLoadingPassword(true);

    try {
      if (!user?.id) {
        throw new Error('Identificador de usuario no disponible.');
      }

      await authService.updateUser(user.id, {
        passwordActual: passwordData.passwordActual,
        password: passwordData.nuevaPassword,
      });

      setPasswordData({
        passwordActual: '',
        nuevaPassword: '',
        confirmarPassword: '',
      });

      setPasswordNotification({
        type: 'success',
        text: 'Contraseña actualizada exitosamente en la base de datos.',
      });
    } catch (err) {
      console.error('Error al actualizar contraseña:', err);
      const serverMsg = err.response?.data?.mensaje || err.message;
      setPasswordNotification({
        type: 'error',
        text: serverMsg || 'Error al actualizar la contraseña.',
      });
    } finally {
      setLoadingPassword(false);
      setTimeout(() => setPasswordNotification(null), 5000);
    }
  };

  const formatRoleName = (role) => {
    if (!role) return 'Usuario';
    const r = role.toUpperCase();
    if (r.includes('ADMIN')) return 'Administrador';
    if (r.includes('JEFE_ALMACEN')) return 'Jefe de Almacén';
    if (r.includes('OPERADOR_DESPACHO')) return 'Operador de Despacho';
    if (r.includes('CLIENTE')) return 'Cliente Comercial B2B';
    return role;
  };

  const fullName = `${formData.nombre || ''} ${formData.apellido || ''}`.trim() || user?.username || 'Usuario';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mi perfil</h1>
        <p className="text-sm text-slate-500">Gestiona tu información personal y credenciales de acceso</p>
      </div>

      {profileNotification && (
        <div
          className={`flex items-center gap-3 p-3.5 rounded-lg text-sm font-medium border ${
            profileNotification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {profileNotification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{profileNotification.text}</span>
        </div>
      )}

      {/* Tarjeta de Información de Perfil */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-[#1D68EC] text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-[#1D68EC]/20 shrink-0">
            {formData.nombre?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {fullName}
            </h2>
            <p className="text-sm text-slate-400">{formData.email || 'Sin correo asignado'}</p>
            <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#1D68EC] border border-blue-100">
              {formatRoleName(formData.rol)}
            </span>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Nombres
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
                Apellidos
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC] transition-all"
                required
              />
            </div>
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
            <p className="text-[11px] text-slate-400 mt-1">
              Este correo se utiliza para recibir notificaciones de pedidos y despachos.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Rol en el Sistema
              </label>
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Lock className="w-3 h-3 text-slate-400" />
                Solo lectura (Asignado por Administrador)
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={formatRoleName(formData.rol)}
                disabled
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm bg-slate-100 font-medium cursor-not-allowed select-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wide">
                <ShieldCheck className="w-3 h-3 text-slate-500" />
                Protegido
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Por políticas de seguridad y control de acceso (RBAC), los roles solo pueden ser modificados por un Administrador desde el módulo de Usuarios.
            </p>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loadingProfile}
              className="px-6 py-2.5 bg-[#1D68EC] hover:bg-[#1555C0] text-white text-sm font-semibold rounded-lg shadow-sm shadow-[#1D68EC]/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
            >
              {loadingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando cambios...
                </>
              ) : (
                'Guardar cambios'
              )}
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
          Actualiza tu clave periódicamente para proteger tu acceso al sistema.
        </p>

        {passwordNotification && (
          <div
            className={`mb-5 flex items-center gap-3 p-3.5 rounded-lg text-sm font-medium border ${
              passwordNotification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {passwordNotification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{passwordNotification.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                type={showCurrentPass ? 'text' : 'password'}
                placeholder="Ingresa tu contraseña actual"
                value={passwordData.passwordActual}
                onChange={(e) => setPasswordData({ ...passwordData, passwordActual: e.target.value })}
                className="w-full px-4 py-2 pr-10 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showNewPass ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={passwordData.nuevaPassword}
                onChange={(e) => setPasswordData({ ...passwordData, nuevaPassword: e.target.value })}
                className="w-full px-4 py-2 pr-10 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirmPass ? 'text' : 'password'}
                placeholder="Repite la nueva contraseña"
                value={passwordData.confirmarPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmarPassword: e.target.value })}
                className="w-full px-4 py-2 pr-10 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loadingPassword}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loadingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Actualizando contraseña...
                </>
              ) : (
                'Actualizar Clave'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}