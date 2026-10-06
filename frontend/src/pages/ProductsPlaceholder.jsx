import React from 'react';
import { Package, GitBranch, User, Plus, Search, Filter } from 'lucide-react';

export default function ProductsPlaceholder() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Catálogo de Productos</h1>
          <p className="text-sm text-slate-500">Gestión de inventario, stock, categorías y ubicaciones de almacén.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <GitBranch className="w-3.5 h-3.5" />
            feature/frontend-productos
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700">
            <User className="w-3.5 h-3.5" />
            Integrante 2
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-lg font-bold text-slate-800">Módulo de Inventario y Productos</h2>
          <p className="text-sm text-slate-500">
            Este módulo corresponde a las pantallas 4, 5 y 6 del diseño UI/UX (Listado de stock, Registro de producto y Control de ubicaciones).
          </p>
        </div>

        <div className="pt-4 flex justify-center gap-3">
          <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-sm font-medium cursor-not-allowed">
            Endpoints Backend: /api/productos
          </button>
        </div>
      </div>
    </div>
  );
}
