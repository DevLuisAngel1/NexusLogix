import React, { useEffect, useState } from 'react';
import { authService } from '../api/authService';
import {
  Users as UsersIcon,
  Search,
  UserPlus,
  Shield,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Mail,
  UserCheck,
  Building2,
  X
} from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Formulario nuevo usuario
  const [newUserData, setNewUserData] = useState({
    nombre: '',
    apellido: '',
    username: '',
    email: '',
    area: '',
    role: 'OPERADOR_ALMACEN',
  });
  const [formSuccess, setFormSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await authService.getAllUsers();
      if (data && data.data && Array.isArray(data.data)) {
        setUsers(data.data);
        setFilteredUsers(data.data);
      } else {
        // Fallback de usuarios estándar del sistema
        const defaultUsers = [
          { id: 1, nombre: 'Carlos', apellido: 'Mendoza', username: 'admin', email: 'admin@nexuslogix.pe', role: 'ADMIN', area: 'Tecnología', estado: 'ACTIVO' },
          { id: 2, nombre: 'Juan', apellido: 'Ríos', username: 'almacen.lead', email: 'almacen@nexuslogix.pe', role: 'OPERADOR_ALMACEN', area: 'Logística', estado: 'ACTIVO' },
          { id: 3, nombre: 'Rosa', apellido: 'Flores', username: 'despacho.op', email: 'despacho@nexuslogix.pe', role: 'OPERADOR_DESPACHO', area: 'Despacho', estado: 'ACTIVO' },
          { id: 4, nombre: 'Minera', apellido: 'Antamina', username: 'cliente.minero', email: 'compras@antamina.com', role: 'CLIENTE', area: 'Compras', estado: 'ACTIVO' },
        ];
        setUsers(defaultUsers);
        setFilteredUsers(defaultUsers);
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtros de búsqueda
  useEffect(() => {
    let result = users;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.nombre?.toLowerCase().includes(q) ||
          u.apellido?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.username?.toLowerCase().includes(q) ||
          u.role?.toLowerCase().includes(q)
      );
    }

    if (selectedRole !== 'ALL') {
      result = result.filter((u) => u.role === selectedRole);
    }

    setFilteredUsers(result);
  }, [search, selectedRole, users]);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'OPERADOR_ALMACEN':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'OPERADOR_DESPACHO':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CLIENTE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    const newUser = {
      id: users.length + 1,
      ...newUserData,
      estado: 'ACTIVO',
    };
    const updated = [newUser, ...users];
    setUsers(updated);
    setFormSuccess('Usuario registrado localmente con éxito.');
    setTimeout(() => {
      setFormSuccess('');
      setModalOpen(false);
      setNewUserData({ nombre: '', apellido: '', username: '', email: '', area: '', role: 'OPERADOR_ALMACEN' });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Title & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Usuarios</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Administra los usuarios del sistema y sus roles de acceso
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-sm shadow-blue-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo usuario
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o rol..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
          />
        </div>

        {/* Role Selector */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Filtrar por rol:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium"
          >
            <option value="ALL">Todos los roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="OPERADOR_ALMACEN">OPERADOR_ALMACEN</option>
            <option value="OPERADOR_DESPACHO">OPERADOR_DESPACHO</option>
            <option value="CLIENTE">CLIENTE</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">ID</th>
                <th className="py-3 px-4">Nombre Completo</th>
                <th className="py-3 px-4">Email / Usuario</th>
                <th className="py-3 px-4">Área</th>
                <th className="py-3 px-4">Rol Asignado</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Cargando usuarios del sistema...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                      {u.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-600/10 text-blue-600 font-bold flex items-center justify-center text-xs">
                          {u.nombre ? u.nombre.charAt(0) : 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {u.nombre} {u.apellido}
                          </p>
                          <p className="text-[11px] text-slate-400">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {u.area || 'Operaciones'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getRoleBadge(
                          u.role
                        )}`}
                      >
                        <Shield className="w-3 h-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        Activo
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Editar usuario"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Desactivar usuario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Usuario */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Registrar Nuevo Usuario
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={newUserData.nombre}
                    onChange={(e) => setNewUserData({ ...newUserData, nombre: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Ej. Mario"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    value={newUserData.apellido}
                    onChange={(e) => setNewUserData({ ...newUserData, apellido: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Ej. Vargas"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="mario.vargas"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="mario.vargas@nexuslogix.pe"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Área</label>
                <input
                  type="text"
                  value={newUserData.area}
                  onChange={(e) => setNewUserData({ ...newUserData, area: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Almacén / Logística"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rol en NexusLogix</label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="OPERADOR_ALMACEN">OPERADOR_ALMACEN</option>
                  <option value="OPERADOR_DESPACHO">OPERADOR_DESPACHO</option>
                  <option value="CLIENTE">CLIENTE</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm shadow-blue-500/20"
                >
                  Guardar usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
