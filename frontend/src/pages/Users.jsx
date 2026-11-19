import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw
} from 'lucide-react';
import authService from '../api/authService';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [alert, setAlert] = useState(null);

  const [newUser, setNewUser] = useState({
    nombre: '',
    email: '',
    username: '',
    password: '',
    rol: 'OPERADOR',
    estado: 'Activo'
  });

  const showAlert = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 4000);
  };

  // Normaliza roles para badges
  const formatRolBadge = (rawRol) => {
    if (!rawRol) return 'OPERADOR';
    const r = rawRol.toUpperCase();
    if (r.includes('ADMIN')) return 'ADMIN';
    if (r.includes('CLIENTE')) return 'CLIENTE';
    return 'OPERADOR';
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await authService.getAllUsers();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((u) => {
          const nombreCompleto = u.nombre
            ? `${u.nombre} ${u.apellido && u.apellido !== '-' ? u.apellido : ''}`.trim()
            : u.username;

          return {
            id: u.id,
            username: u.username,
            nombre: nombreCompleto,
            email: u.email,
            rol: formatRolBadge(u.rol),
            rawRol: u.rol,
            estado: u.estado === 'INACTIVO' ? 'Inactivo' : 'Activo'
          };
        });
        setUsers(mapped);
      } else {
        setUsers([
          { id: 1, username: 'admin', nombre: 'Carlos Mendoza', email: 'admin@nexuslogix.pe', rol: 'ADMIN', estado: 'Activo' },
          { id: 2, username: 'almacen.lead', nombre: 'Manuel Rojas', email: 'm.rojas@nexuslogix.pe', rol: 'OPERADOR', estado: 'Activo' },
          { id: 3, username: 'despacho.op', nombre: 'Jorge Quispe', email: 'j.quispe@nexuslogix.pe', rol: 'OPERADOR', estado: 'Activo' },
          { id: 4, username: 'cliente.minero', nombre: 'Roberto Alarcón', email: 'r.alarcon@mineradelsur.pe', rol: 'CLIENTE', estado: 'Activo' },
        ]);
      }
    } catch (err) {
      console.error('Error al consultar usuarios desde backend:', err);
      showAlert('error', 'No se pudo conectar a la base de datos de usuarios. Verifique que Spring Boot esté activo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (u.nombre && u.nombre.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.rol && u.rol.toLowerCase().includes(term));

    const matchesRole = selectedRole === 'ALL' || u.rol === selectedRole;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const displayedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenEdit = (user) => {
    setEditingUser({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      username: user.username,
      rol: user.rol,
      estado: user.estado,
      password: ''
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await authService.updateUser(editingUser.id, {
        nombre: editingUser.nombre,
        email: editingUser.email,
        rol: editingUser.rol,
        estado: editingUser.estado,
        password: editingUser.password || undefined
      });

      setUsers(users.map((u) => (u.id === editingUser.id ? {
        ...u,
        nombre: editingUser.nombre,
        email: editingUser.email,
        rol: editingUser.rol,
        estado: editingUser.estado
      } : u)));

      setEditModalOpen(false);
      setEditingUser(null);
      showAlert('success', 'Usuario actualizado exitosamente.');
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      showAlert('error', err.response?.data?.mensaje || 'Error al actualizar usuario.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.nombre || !newUser.email) return;

    try {
      const payload = {
        nombre: newUser.nombre,
        email: newUser.email,
        username: newUser.username || newUser.email.split('@')[0],
        password: newUser.password || 'admin123password',
        rol: newUser.rol,
        estado: newUser.estado
      };

      const res = await authService.createUser(payload);
      const createdData = res.data;

      const created = {
        id: createdData?.id || (users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1),
        username: payload.username,
        nombre: payload.nombre,
        email: payload.email,
        rol: formatRolBadge(payload.rol),
        estado: payload.estado
      };

      setUsers([created, ...users]);
      setCreateModalOpen(false);
      setNewUser({
        nombre: '',
        email: '',
        username: '',
        password: '',
        rol: 'OPERADOR',
        estado: 'Activo'
      });
      showAlert('success', 'Usuario registrado exitosamente.');
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      showAlert('error', err.response?.data?.mensaje || 'Error al registrar nuevo usuario.');
    }
  };

  // Maneja soft delete si el usuario tiene transacciones históricas o hard delete si no
  const handleDeleteUser = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar o desactivar al usuario "${nombre}"?`)) {
      try {
        const res = await authService.deleteUser(id);
        const action = res.action;

        if (action === 'DEACTIVATED') {
          setUsers(users.map((u) => (u.id === id ? { ...u, estado: 'Inactivo' } : u)));
          showAlert('success', res.mensaje || `El usuario "${nombre}" ha sido cambiado a estado Inactivo.`);
        } else {
          setUsers(users.filter((u) => u.id !== id));
          showAlert('success', res.mensaje || `Usuario "${nombre}" eliminado permanentemente.`);
        }
      } catch (err) {
        console.error('Error al procesar eliminación:', err);
        const errorMsg = err.response?.data?.mensaje || 'No se pudo completar la operación en el servidor.';
        showAlert('error', errorMsg);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
          <p className="text-sm text-slate-500">Administra los usuarios del sistema</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadUsers}
            title="Recargar usuarios desde la base de datos"
            className="p-2.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#1D68EC]' : ''}`} />
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1D68EC] hover:bg-[#1555C0] text-white text-sm font-semibold rounded-lg shadow-sm shadow-[#1D68EC]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nuevo usuario
          </button>
        </div>
      </div>

      {alert && (
        <div
          className={`flex items-center gap-3 p-3.5 border rounded-lg text-sm font-medium ${
            alert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {alert.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{alert.text}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o rol..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-44 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
          >
            <option value="ALL">Todos los roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="OPERADOR">OPERADOR</option>
            <option value="CLIENTE">CLIENTE</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/70 text-slate-700 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3.5">ID</th>
                <th scope="col" className="px-6 py-3.5">Nombre</th>
                <th scope="col" className="px-6 py-3.5">Email</th>
                <th scope="col" className="px-6 py-3.5 text-center">Rol</th>
                <th scope="col" className="px-6 py-3.5 text-center">Estado</th>
                <th scope="col" className="px-6 py-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#1D68EC]" />
                      <span>Cargando usuarios desde la base de datos...</span>
                    </div>
                  </td>
                </tr>
              ) : displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    No se encontraron usuarios coincidentes.
                  </td>
                </tr>
              ) : (
                displayedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      <div>
                        <span>{user.nombre}</span>
                        {user.username && (
                          <span className="block text-[11px] text-slate-400 font-normal">
                            @{user.username}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 rounded-md border border-slate-200/80 uppercase">
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 text-[11px] font-semibold rounded-full ${
                          user.estado === 'Activo'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        }`}
                      >
                        {user.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-md transition-colors cursor-pointer"
                          title="Editar usuario"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.nombre)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Mostrando <span className="font-semibold text-slate-700">{displayedUsers.length}</span> de{' '}
            <span className="font-semibold text-slate-700">{filteredUsers.length}</span> usuarios
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(Math.max(1, validCurrentPage - 1))}
              disabled={validCurrentPage === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  validCurrentPage === page
                    ? 'bg-[#1D68EC] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, validCurrentPage + 1))}
              disabled={validCurrentPage === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {editModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Editar Usuario</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.nombre}
                  onChange={(e) => setEditingUser({ ...editingUser, nombre: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Rol Asignado
                  </label>
                  <select
                    value={editingUser.rol}
                    onChange={(e) => setEditingUser({ ...editingUser, rol: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="OPERADOR">OPERADOR</option>
                    <option value="CLIENTE">CLIENTE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Estado
                  </label>
                  <select
                    value={editingUser.estado}
                    onChange={(e) => setEditingUser({ ...editingUser, estado: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Nueva Contraseña <span className="font-normal text-slate-400">(Opcional)</span>
                </label>
                <input
                  type="password"
                  placeholder="Dejar en blanco para mantener la actual"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1D68EC] hover:bg-[#1555C0] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Registrar Nuevo Usuario</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Mendoza"
                  value={newUser.nombre}
                  onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  placeholder="laura@empresa.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Rol Asignado
                  </label>
                  <select
                    value={newUser.rol}
                    onChange={(e) => setNewUser({ ...newUser, rol: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
                  >
                    <option value="OPERADOR">OPERADOR</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="CLIENTE">CLIENTE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Estado Inicial
                  </label>
                  <select
                    value={newUser.estado}
                    onChange={(e) => setNewUser({ ...newUser, estado: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Contraseña Inicial
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1D68EC] hover:bg-[#1555C0] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
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
