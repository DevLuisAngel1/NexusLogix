import React from 'react';
import {
  ShoppingCart,
  ClipboardList,
  FileText,
  Headphones,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function B2BPortal() {
  return (
    <div className="space-y-6">
      {/* Header (Mockup Pantalla 9) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Portal B2B</h1>
          <p className="text-sm text-slate-500">Para clientes empresariales</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-50 text-[#1D68EC] border border-blue-200 text-xs font-semibold rounded-lg">
            Empresa SAC (Cliente Corporativo)
          </span>
        </div>
      </div>

      {/* Grid: 4 Action Cards (Left) + Hero Banner (Right) (Mockup Pantalla 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 4 Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-[#1D68EC] transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1D68EC] flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Realizar pedido</h3>
                <p className="text-xs text-slate-400 mt-1">Compra rápida y segura</p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-[#1D68EC] transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Ver pedidos</h3>
                <p className="text-xs text-slate-400 mt-1">Consulta el estado de tus pedidos</p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-[#1D68EC] transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Descargar facturas</h3>
                <p className="text-xs text-slate-400 mt-1">Accede a tus comprobantes</p>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-[#1D68EC] transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Soporte</h3>
                <p className="text-xs text-slate-400 mt-1">Estamos para ayudarte</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Hero Warehouse Banner (Mockup Pantalla 9) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="h-44 rounded-xl overflow-hidden relative mb-4">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80')",
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              Tu socio en soluciones logísticas
            </h2>
            <p className="text-xs text-slate-500">
              Ofrecemos productos de calidad y un servicio logístico confiable para tu empresa.
            </p>
          </div>

          <div className="pt-4">
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D68EC] hover:bg-[#1555C0] text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              Ver catálogo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
