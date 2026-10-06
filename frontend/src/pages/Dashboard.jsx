import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  ShoppingCart,
  AlertTriangle,
  Truck,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import authService from '../api/authService';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalProductos: 248,
    stockBajo: 18,
    pedidosPendientes: 32,
    despachosEnCurso: 12,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await authService.getDashboardMetrics();
        if (data) {
          setMetrics(prev => ({
            ...prev,
            totalProductos: data.totalProductos ?? 248,
            pedidosPendientes: data.pedidosPendientes ?? 32,
            despachosEnCurso: data.despachosEnCurso ?? 12,
            stockBajo: data.stockBajo ?? 18
          }));
        }
      } catch (err) {
        console.warn('Usando métricas del diseño mockup:', err);
      }
    };
    fetchStats();
  }, []);

  // Datos para el gráfico de líneas (Mockup Pantalla 2)
  // Días: Lun, Mar, Mié, Jue, Vie, Sáb, Dom
  // Y: 0 a 100
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Puntos de datos aproximados al mockup
  const pedidosData = [20, 32, 45, 62, 70, 85, 92]; // Blue line
  const despachosData = [15, 25, 38, 48, 55, 65, 80]; // Green line
  const usuariosData = [10, 18, 28, 35, 42, 50, 68]; // Cyan line

  // Helper para convertir coordenadas en SVG
  const getCoordinates = (dataArr) => {
    const width = 580;
    const height = 200;
    const stepX = width / (dataArr.length - 1);

    return dataArr.map((val, idx) => {
      const x = idx * stepX + 40;
      const y = height - (val / 100) * (height - 30) - 20;
      return { x, y, val };
    });
  };

  const pedidosCoords = getCoordinates(pedidosData);
  const despachosCoords = getCoordinates(despachosData);
  const usuariosCoords = getCoordinates(usuariosData);

  const makePath = (coords) => {
    return coords.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');
  };

  return (
    <div className="space-y-6">
      {/* Header del Dashboard (Mockup Pantalla 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">Resumen general del sistema</p>
        </div>
      </div>

      {/* 4 Tarjetas de Métricas con Fondos Sólidos Vibrantes (Exacto al Mockup Pantalla 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Productos (Azul Sólido) */}
        <div className="bg-[#1D68EC] text-white rounded-xl p-5 shadow-sm relative overflow-hidden transition-transform hover:-translate-y-0.5">
          <div className="space-y-1">
            <p className="text-xs font-medium text-blue-100 uppercase tracking-wide">
              Total Productos
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight">
              {metrics.totalProductos}
            </h2>
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-blue-200">
                +12% vs. mes anterior
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Stock Bajo (Verde Sólido) */}
        <div className="bg-[#10B981] text-white rounded-xl p-5 shadow-sm relative overflow-hidden transition-transform hover:-translate-y-0.5">
          <div className="space-y-1">
            <p className="text-xs font-medium text-emerald-100 uppercase tracking-wide">
              Stock Bajo
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight">
              {metrics.stockBajo}
            </h2>
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-emerald-200">
                -5% vs. mes anterior
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Pedidos Pendientes (Naranja Sólido) */}
        <div className="bg-[#F59E0B] text-white rounded-xl p-5 shadow-sm relative overflow-hidden transition-transform hover:-translate-y-0.5">
          <div className="space-y-1">
            <p className="text-xs font-medium text-amber-100 uppercase tracking-wide">
              Pedidos Pendientes
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight">
              {metrics.pedidosPendientes}
            </h2>
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-amber-100">
                +8% vs. mes anterior
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Despachos en Curso (Morado/Púrpura Sólido) */}
        <div className="bg-[#7C3AED] text-white rounded-xl p-5 shadow-sm relative overflow-hidden transition-transform hover:-translate-y-0.5">
          <div className="space-y-1">
            <p className="text-xs font-medium text-purple-100 uppercase tracking-wide">
              Despachos en Curso
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight">
              {metrics.despachosEnCurso}
            </h2>
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-purple-200">
                +3% vs. mes anterior
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección Gráfico y Últimos Movimientos (Mockup Pantalla 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico: Actividad del sistema (2 columnas) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3">
            <h3 className="font-bold text-slate-800 text-base">Actividad del sistema</h3>
            
            {/* Leyenda idéntica al mockup */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1D68EC]"></span>
                Pedidos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                Despachos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]"></span>
                Usuarios
              </span>
            </div>
          </div>

          {/* Gráfico SVG de Líneas */}
          <div className="w-full overflow-x-auto pt-2">
            <svg viewBox="0 0 660 230" className="w-full h-56 select-none font-sans">
              {/* Ejes y Líneas horizontales de referencia */}
              {[100, 75, 50, 25, 0].map((val) => {
                const y = 200 - (val / 100) * 170 - 20;
                return (
                  <g key={val}>
                    <text x="10" y={y + 4} className="text-[11px] fill-slate-400" textAnchor="start">
                      {val}
                    </text>
                    <line x1="35" y1={y} x2="650" y2={y} stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" />
                  </g>
                );
              })}

              {/* Etiquetas Eje X (Días) */}
              {days.map((day, idx) => {
                const x = idx * (580 / 6) + 40;
                return (
                  <text key={day} x={x} y="222" className="text-[11px] fill-slate-500 font-medium" textAnchor="middle">
                    {day}
                  </text>
                );
              })}

              {/* Línea Usuarios (Cyan) */}
              <path
                d={makePath(usuariosCoords)}
                fill="none"
                stroke="#06B6D4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {usuariosCoords.map((pt, i) => (
                <circle key={`u-${i}`} cx={pt.x} cy={pt.y} r="4" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="2" />
              ))}

              {/* Línea Despachos (Verde) */}
              <path
                d={makePath(despachosCoords)}
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {despachosCoords.map((pt, i) => (
                <circle key={`d-${i}`} cx={pt.x} cy={pt.y} r="4" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
              ))}

              {/* Línea Pedidos (Azul) */}
              <path
                d={makePath(pedidosCoords)}
                fill="none"
                stroke="#1D68EC"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {pedidosCoords.map((pt, i) => (
                <circle key={`p-${i}`} cx={pt.x} cy={pt.y} r="4" fill="#1D68EC" stroke="#FFFFFF" strokeWidth="2" />
              ))}
            </svg>
          </div>
        </div>

        {/* Últimos Movimientos (1 columna, idéntico al Mockup Pantalla 2) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 text-base mb-4">Últimos movimientos</h3>

          <div className="space-y-4">
            {/* Movimiento 1 */}
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1D68EC] flex items-center justify-center shrink-0 mt-0.5">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-snug">
                  Nuevo usuario registrado
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ana Torres - 10:24
                </p>
              </div>
            </div>

            {/* Movimiento 2 */}
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-snug">
                  Pedido #P-1042 creado
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cliente Empresa SAC - 09:58
                </p>
              </div>
            </div>

            {/* Movimiento 3 */}
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-snug">
                  Stock bajo en producto XYZ
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Quedan 5 unidades - 08:32
                </p>
              </div>
            </div>

            {/* Movimiento 4 */}
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-snug">
                  Despacho #D-003 entregado
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cliente Lima SAC - 07:15
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
