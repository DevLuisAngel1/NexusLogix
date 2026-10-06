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
  CheckCircle2
} from 'lucide-react';
import authService from '../api/authService';

export default function Users() {
  // Datos iniciales idénticos a la Pantalla 3 del Mockup
  const initialUsers = [
    { id: 1, nombre: 'Admin', email: 'admin@empresa.com', rol: 'ADMIN', estado: 'Activo' },
    { id: 2, nombre: 'María López', email: 'maria@empresa.com', rol: 'OPERADOR', estado: 'Activo' },
    { id: 3, nombre: 'Carlos Ruiz', email: 'carlos@empresa.com', rol: 'CLIENTE', estado: 'Activo' },
    { id: 4, nombre: 'Ana Torres', email: 'ana@empresa.com', rol: 'OPERADOR', estado: 'Inactivo' },
    { id: 5, nombre: 'Luis Pérez', email: 'luis@empresa.com', rol: 'CLIENTE', estado: 'Activo' },
  ];

  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);

  const [newUser, setNewUser] = useState({
    nombre: '',
    email: '',
    username: '',
    password: '',
    rol: 'OPERADOR',
    estado: 'Activo'
  });

  // Intentar cargar usuarios del backend si están disponibles
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await authService.getAllUsers();
        if (data && data.length > 0) {
          const mapped = data.map((u) => ({
            id: u.id,
            nombre: u.nombre || u.username,
            email: u.email || `${u.username}@empresa.com`,
            rol: u.rol?.replace('ROLE_', '') || 'OPERADOR',
            estado: u.estado || (u.activo ? 'Activo' : 'Inactivo')
          }));
          setUsers(mapped);
        }
      } catch (err) {
        console.warn('Usando datos de usuarios del diseño mockup:', err);
      }
    };
    loadUsers();
  }, []);

  // Filtrado
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.rol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || u.rol === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Crear Usuario
  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUser.nombre || !newUser.email) return;

    const created = {
      id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
      nombre: newUser.nombre,
      email: newUser.email,
      rol: newUser.rol,
      estado: newUser.estado
    };

    setUsers([created, ...users]);
    setModalOpen(false);
    setNewUser({
      nombre: '',
      email: '',
      username: '',
      password: '',
      rol: 'OPERADOR',
      estado: 'Activo'
    });
    setAlert({ type: 'success', text: 'Usuario registrado exitosamente.' });
    setTimeout(() => setAlert(null), 3500);
  };

  // Eliminar Usuario
  const handleDeleteUser = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      setUsers(users.filter((u) => u.id !== id));
      setAlert({ type: 'success', text: 'Usuario eliminado.' });
      setTimeout(() => setAlert(null), 3500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header (Mockup Pantalla 3) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
          <p className="text-sm text-slate-500">Administra los usuarios del sistema</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1D68EC] hover:bg-[#1555C0] text-white text-sm font-semibold rounded-lg shadow-sm shadow-[#1D68EC]/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo usuario
        </button>
      </div>

      {/* Alerta */}
      {alert && (
        <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{alert.text}</span>
        </div>
      )}

      {/* Filtros de Búsqueda (Mockup Pantalla 3) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Buscador */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
          />
        </div>

        {/* Selector de Roles */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full sm:w-44 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
          >
            <option value="ALL">Todos los roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="OPERADOR">OPERADOR</option>
            <option value="CLIENTE">CLIENTE</option>
          </select>
        </div>
      </div>

      {/* Tabla de Usuarios (Mockup Pantalla 3) */}
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    No se encontraron usuarios coincidentes.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {user.nombre}
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
                          onClick={() => alert(`Editar usuario: ${user.nombre}`)}
                          className="p-1.5 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                          title="Eliminar"
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

        {/* Paginación idéntica al Mockup: < [1] 2 3 > */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-center gap-1.5">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(1)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
              currentPage === 1
                ? 'bg-[#1D68EC] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            1
          </button>
          <button
            onClick={() => setCurrentPage(2)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
              currentPage === 2
                ? 'bg-[#1D68EC] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            2
          </button>
          <button
            onClick={() => setCurrentPage(3)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
              currentPage === 3
                ? 'bg-[#1D68EC] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            3
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal: Nuevo Usuario */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Registrar Nuevo Usuario</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
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
                  Contraseña Temporal
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
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1D68EC] hover:bg-[#1555C0] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
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
