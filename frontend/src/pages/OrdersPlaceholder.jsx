import React from 'react';
import { ShoppingCart, GitBranch, User } from 'lucide-react';

export default function OrdersPlaceholder() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Pedidos</h1>
          <p className="text-sm text-slate-500">Recepción, validación y seguimiento de pedidos de clientes.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <GitBranch className="w-3.5 h-3.5" />
            feature/frontend-pedidos-despachos
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700">
            <User className="w-3.5 h-3.5" />
            Integrante 3
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-lg font-bold text-slate-800">Módulo de Pedidos</h2>
          <p className="text-sm text-slate-500">
            Este módulo corresponde a las pantallas 7 y 8 del diseño UI/UX (Tabla de pedidos por estado, detalle de líneas de pedido y emisión).
          </p>
        </div>

        <div className="pt-4 flex justify-center gap-3">
          <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-sm font-medium cursor-not-allowed">
            Endpoints Backend: /api/pedidos
          </button>
        </div>
      </div>
    </div>
  );
}
