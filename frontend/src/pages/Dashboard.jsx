import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/authService';
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  Truck,
  TrendingUp,
  ArrowUpRight,
  UserPlus,
  ArrowDownLeft,
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalProductos: 0,
    totalStockBajo: 0,
    totalPedidosPendientes: 0,
    totalDespachosEnCurso: 0,
    pedidos: [],
    despachos: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    const data = await authService.getDashboardMetrics();
    setMetrics(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const metricCards = [
    {
      title: 'Total Productos',
      value: metrics.totalProductos || 248,
      change: '+12% vs. mes anterior',
      icon: Package,
      bg: 'bg-blue-500/10 text-blue-600',
      border: 'border-blue-100',
      badgeBg: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Stock Bajo',
      value: metrics.totalStockBajo || 18,
      change: '+5% vs. mes anterior',
      icon: AlertTriangle,
      bg: 'bg-emerald-500/10 text-emerald-600',
      border: 'border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Pedidos Pendientes',
      value: metrics.totalPedidosPendientes || 32,
      change: 'Requieren preparación',
      icon: ShoppingCart,
      bg: 'bg-amber-500/10 text-amber-600',
      border: 'border-amber-100',
      badgeBg: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Despachos en Curso',
      value: metrics.totalDespachosEnCurso || 12,
      change: '+10% vs. mes anterior',
      icon: Truck,
      bg: 'bg-purple-500/10 text-purple-600',
      border: 'border-purple-100',
      badgeBg: 'bg-purple-50 text-purple-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Resumen general del sistema logístico NexusLogix WMS
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`bg-white p-5 rounded-2xl border ${card.border} shadow-xs hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {card.value}
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                <span className={`px-2 py-0.5 rounded-full font-medium ${card.badgeBg}`}>
                  {card.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Grid: Activity Chart & Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Actividad del Sistema Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Actividad del sistema</h2>
              <p className="text-xs text-slate-400">Tendencia semanal de operaciones logísticas</p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Pedidos
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Despachos
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Usuarios
              </span>
            </div>
          </div>

          {/* SVG Vector Chart matching Mockup */}
          <div className="h-64 w-full relative">
            <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
              {/* Background horizontal grid lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <text x="30" y="24" fill="#94a3b8" fontSize="10" textAnchor="end">100</text>

              <line x1="40" y1="65" x2="580" y2="65" stroke="#f1f5f9" strokeWidth="1" />
              <text x="30" y="69" fill="#94a3b8" fontSize="10" textAnchor="end">75</text>

              <line x1="40" y1="110" x2="580" y2="110" stroke="#f1f5f9" strokeWidth="1" />
              <text x="30" y="114" fill="#94a3b8" fontSize="10" textAnchor="end">50</text>

              <line x1="40" y1="155" x2="580" y2="155" stroke="#f1f5f9" strokeWidth="1" />
              <text x="30" y="159" fill="#94a3b8" fontSize="10" textAnchor="end">25</text>

              <line x1="40" y1="190" x2="580" y2="190" stroke="#e2e8f0" strokeWidth="1" />
              <text x="30" y="193" fill="#94a3b8" fontSize="10" textAnchor="end">0</text>

              {/* Day Labels */}
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, idx) => (
                <text
                  key={idx}
                  x={70 + idx * 80}
                  y="215"
                  fill="#64748b"
                  fontSize="10.5"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {day}
                </text>
              ))}

              {/* Line 1: Pedidos (Blue) */}
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                points="70,140 150,110 230,85 310,95 390,45 470,60 550,35"
              />

              {/* Line 2: Despachos (Emerald) */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                points="70,160 150,135 230,120 310,110 390,75 470,85 550,55"
              />

              {/* Line 3: Usuarios (Purple) */}
              <polyline
                fill="none"
                stroke="#a855f7"
                strokeWidth="2"
                strokeDasharray="4 4"
                points="70,175 150,165 230,150 310,140 390,120 470,125 550,110"
              />

              {/* Points for Pedidos */}
              {[
                [70, 140], [150, 110], [230, 85], [310, 95], [390, 45], [470, 60], [550, 35]
              ].map(([cx, cy], idx) => (
                <circle key={idx} cx={cx} cy={cy} r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
              ))}
            </svg>
          </div>
        </div>

        {/* Right (1 col): Últimos Movimientos */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Últimos movimientos</h2>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                En vivo
              </span>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: 'Nuevo usuario registrado',
                  sub: 'Ana Torres - 10:24',
                  icon: UserPlus,
                  color: 'text-blue-600 bg-blue-50',
                },
                {
                  title: 'Pedido #P-1042 creado',
                  sub: 'Cliente Empresa SAC - 09:58',
                  icon: ShoppingCart,
                  color: 'text-purple-600 bg-purple-50',
                },
                {
                  title: 'Stock bajo en producto XYZ',
                  sub: 'Quedan 5 unidades - 08:32',
                  icon: AlertTriangle,
                  color: 'text-amber-600 bg-amber-50',
                },
                {
                  title: 'Despacho #D-003 entregado',
                  sub: 'Cliente Lima SAC - 07:15',
                  icon: CheckCircle2,
                  color: 'text-emerald-600 bg-emerald-50',
                },
              ].map((ev, idx) => {
                const EvIcon = ev.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 text-xs pb-3 border-b border-slate-100 last:border-none last:pb-0">
                    <div className={`w-8 h-8 rounded-lg ${ev.color} flex items-center justify-center shrink-0`}>
                      <EvIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 leading-tight truncate">{ev.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ev.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <NavLink
              to="/productos"
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/60 py-2 rounded-lg transition-colors"
            >
              Ver registro completo de almacén
              <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
