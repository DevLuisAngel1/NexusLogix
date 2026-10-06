import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar
} from 'lucide-react';

export default function OrdersPlaceholder() {
  // Datos exactos de la Pantalla 7 del Mockup
  const initialOrders = [
    { id: 'P-1043', cliente: 'Empresa SAC', fecha: '15/10/2026', total: '$1,250.00', estado: 'Pendiente' },
    { id: 'P-1042', cliente: 'Global Tech', fecha: '14/10/2026', total: '$680.00', estado: 'En proceso' },
    { id: 'P-1041', cliente: 'Construye S.A.', fecha: '13/10/2026', total: '$320.00', estado: 'Despachado' },
    { id: 'P-1040', cliente: 'Distribuidora Norte', fecha: '12/10/2026', total: '$900.00', estado: 'Entregado' },
    { id: 'P-1039', cliente: 'Tech Solutions', fecha: '11/10/2026', total: '$450.00', estado: 'Cancelado' },
  ];

  const [orders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'En proceso':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'Despachado':
        return 'bg-teal-50 text-teal-700 border-teal-200/60';
      case 'Entregado':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'Cancelado':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || o.estado === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header (Mockup Pantalla 7) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pedidos</h1>
          <p className="text-sm text-slate-500">Lista de pedidos del sistema</p>
        </div>

        <button
          onClick={() => alert('Módulo de Pedidos asignado a Integrante 3 (feature/frontend-pedidos-despachos)')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1D68EC] hover:bg-[#1555C0] text-white text-sm font-semibold rounded-lg shadow-sm shadow-[#1D68EC]/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo pedido
        </button>
      </div>

      {/* Filtros de Búsqueda (Mockup Pantalla 7) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por número de pedido o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-44 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
          >
            <option value="ALL">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En proceso">En proceso</option>
            <option value="Despachado">Despachado</option>
            <option value="Entregado">Entregado</option>
            <option value="Cancelado">Cancelado</option>
          </select>

          <button className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Rango de fechas</span>
          </button>
        </div>
      </div>

      {/* Tabla de Pedidos (Mockup Pantalla 7) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/70 text-slate-700 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3.5">ID</th>
                <th scope="col" className="px-6 py-3.5">Cliente</th>
                <th scope="col" className="px-6 py-3.5">Fecha</th>
                <th scope="col" className="px-6 py-3.5">Total</th>
                <th scope="col" className="px-6 py-3.5 text-center">Estado</th>
                <th scope="col" className="px-6 py-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-[#1D68EC]">{item.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{item.cliente}</td>
                  <td className="px-6 py-4 text-slate-500">{item.fecha}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{item.total}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 text-[11px] font-semibold rounded-full border ${getStatusBadge(
                        item.estado
                      )}`}
                    >
                      {item.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-md">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-center gap-1.5">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold ${
                currentPage === page ? 'bg-[#1D68EC] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {page}
            </button>
          ))}
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
