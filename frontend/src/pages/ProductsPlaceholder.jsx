import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function ProductsPlaceholder() {
  // Datos exactos de la Pantalla 4 del Mockup
  const initialProducts = [
    {
      id: 1,
      sku: 'LP-001',
      imagen: '💻',
      nombre: 'Laptop Pro',
      categoria: 'Electrónica',
      stock: 25,
      precio: '$1,200.00',
      estado: 'Activo'
    },
    {
      id: 2,
      sku: 'MI-002',
      imagen: '🖱️',
      nombre: 'Mouse Inalámbrico',
      categoria: 'Accesorios',
      stock: 0,
      precio: '$25.00',
      estado: 'Bajo stock'
    },
    {
      id: 3,
      sku: 'TM-003',
      imagen: '⌨️',
      nombre: 'Teclado Mecánico',
      categoria: 'Accesorios',
      stock: 15,
      precio: '$85.00',
      estado: 'Activo'
    },
    {
      id: 4,
      sku: 'MN-004',
      imagen: '🖥️',
      nombre: 'Monitor 24"',
      categoria: 'Electrónica',
      stock: 8,
      precio: '$180.00',
      estado: 'Activo'
    },
    {
      id: 5,
      sku: 'SO-005',
      imagen: '🪑',
      nombre: 'Silla de Oficina',
      categoria: 'Muebles',
      stock: 3,
      precio: '$120.00',
      estado: 'Bajo stock'
    }
  ];

  const [products] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === 'ALL' || p.categoria === selectedCat;
    const matchesStatus = selectedStatus === 'ALL' || p.estado === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header (Mockup Pantalla 4) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Productos</h1>
          <p className="text-sm text-slate-500">Gestiona el catálogo de productos</p>
        </div>

        <button
          onClick={() => alert('Módulo de Nuevo Producto asignado a Integrante 2 (feature/frontend-productos)')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1D68EC] hover:bg-[#1555C0] text-white text-sm font-semibold rounded-lg shadow-sm shadow-[#1D68EC]/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </button>
      </div>

      {/* Filtros de Búsqueda (Mockup Pantalla 4) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Buscador */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, categoría o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
          />
        </div>

        {/* Filtros Categoría y Estado */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full sm:w-44 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
          >
            <option value="ALL">Todas las categorías</option>
            <option value="Electrónica">Electrónica</option>
            <option value="Accesorios">Accesorios</option>
            <option value="Muebles">Muebles</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-40 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D68EC]/20 focus:border-[#1D68EC]"
          >
            <option value="ALL">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Bajo stock">Bajo stock</option>
          </select>
        </div>
      </div>

      {/* Tabla de Productos (Mockup Pantalla 4) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/70 text-slate-700 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-5 py-3.5">ID</th>
                <th scope="col" className="px-5 py-3.5 text-center">Imagen</th>
                <th scope="col" className="px-5 py-3.5">Nombre</th>
                <th scope="col" className="px-5 py-3.5">Categoría</th>
                <th scope="col" className="px-5 py-3.5 text-center">Stock</th>
                <th scope="col" className="px-5 py-3.5">Precio</th>
                <th scope="col" className="px-5 py-3.5 text-center">Estado</th>
                <th scope="col" className="px-5 py-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-800">{item.id}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-lg mx-auto border border-slate-200/60">
                      {item.imagen}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800">{item.nombre}</td>
                  <td className="px-5 py-4 text-slate-500">{item.categoria}</td>
                  <td className="px-5 py-4 text-center font-semibold text-slate-700">{item.stock}</td>
                  <td className="px-5 py-4 font-semibold text-slate-800">{item.precio}</td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 text-[11px] font-semibold rounded-full ${
                        item.estado === 'Activo'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}
                    >
                      {item.estado}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-md">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md">
                        <Trash2 className="w-4 h-4" />
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
          {[1, 2, 3, 4].map((page) => (
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
