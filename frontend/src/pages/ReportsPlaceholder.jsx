import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  FileSpreadsheet,
  Filter,
  Layers,
  Loader2,
  Package,
  Printer,
  RefreshCw,
  Search,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users
} from 'lucide-react';
import api from '../api/axios';

function formatCurrency(amount) {
  const val = Number(amount) || 0;
  return `S/ ${val.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export default function ReportsPlaceholder() {
  const [activeTab, setActiveTab] = useState('financiero'); // 'financiero' | 'inventario' | 'despachos'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Datos
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [despachos, setDespachos] = useState([]);
  const [clientes, setClientes] = useState([]);

  // Filtros
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL');

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [pedRes, prodRes, movRes, despRes, cliRes] = await Promise.allSettled([
        api.get('/pedidos'),
        api.get('/productos'),
        api.get('/inventario/movimientos'),
        api.get('/despachos'),
        api.get('/clientes')
      ]);

      setPedidos(pedRes.status === 'fulfilled' && Array.isArray(pedRes.value.data) ? pedRes.value.data : []);
      setProductos(prodRes.status === 'fulfilled' && Array.isArray(prodRes.value.data) ? prodRes.value.data : []);
      setMovimientos(movRes.status === 'fulfilled' && Array.isArray(movRes.value.data) ? movRes.value.data : []);
      setDespachos(despRes.status === 'fulfilled' && Array.isArray(despRes.value.data) ? despRes.value.data : []);
      setClientes(cliRes.status === 'fulfilled' && Array.isArray(cliRes.value.data) ? cliRes.value.data : []);
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudieron cargar todos los datos de reportes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // KPIs Globales
  const totalFacturado = useMemo(() => {
    return pedidos.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
  }, [pedidos]);

  const totalIgv = useMemo(() => {
    return pedidos.reduce((acc, p) => acc + (Number(p.igv) || 0), 0);
  }, [pedidos]);

  const valorInventario = useMemo(() => {
    return productos.reduce((acc, p) => acc + ((Number(p.stockActual) || 0) * (Number(p.precioUnitario) || 0)), 0);
  }, [productos]);

  const tasaCumplimiento = useMemo(() => {
    if (despachos.length === 0) return 100;
    const entregados = despachos.filter(d => d.estado === 'ENTREGADO').length;
    return Math.round((entregados / despachos.length) * 100);
  }, [despachos]);

  // Filtrado de pedidos
  const pedidosFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pedidos;
    return pedidos.filter(p => {
      const cod = (p.codigoPedido || '').toLowerCase();
      const cli = (p.cliente?.razonSocial || '').toLowerCase();
      const dir = (p.direccionEntrega || '').toLowerCase();
      return cod.includes(q) || cli.includes(q) || dir.includes(q);
    });
  }, [pedidos, search]);

  // Filtrado de inventario
  const productosFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return productos;
    return productos.filter(p => {
      const sku = (p.codigoSku || '').toLowerCase();
      const nom = (p.nombre || '').toLowerCase();
      const cat = (p.categoria?.nombre || '').toLowerCase();
      return sku.includes(q) || nom.includes(q) || cat.includes(q);
    });
  }, [productos, search]);

  // Filtrado de despachos
  const despachosFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return despachos;
    return despachos.filter(d => {
      const guia = (d.guiaRemision || '').toLowerCase();
      const transp = (d.transportistaRazonSocial || '').toLowerCase();
      const cond = (d.conductorNombre || '').toLowerCase();
      return guia.includes(q) || transp.includes(q) || cond.includes(q);
    });
  }, [despachos, search]);

  // Exportar a CSV
  const exportToCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `reporte_nexuslogix_${activeTab}_${Date.now()}.csv`;

    if (activeTab === 'financiero') {
      headers = ['ID', 'Codigo Pedido', 'Cliente', 'Fecha', 'Subtotal', 'IGV (18%)', 'Total', 'Estado'];
      rows = pedidosFiltrados.map(p => [
        p.id,
        p.codigoPedido,
        p.cliente?.razonSocial || 'Cliente General',
        formatDate(p.fechaPedido),
        p.subtotal,
        p.igv,
        p.total,
        p.estado
      ]);
    } else if (activeTab === 'inventario') {
      headers = ['ID', 'SKU', 'Producto', 'Categoria', 'Precio Unitario', 'Stock Actual', 'Stock Minimo', 'Valorizado'];
      rows = productosFiltrados.map(p => [
        p.id,
        p.codigoSku,
        p.nombre,
        p.categoria?.nombre || 'General',
        p.precioUnitario,
        p.stockActual,
        p.stockMinimo,
        ((Number(p.stockActual) || 0) * (Number(p.precioUnitario) || 0)).toFixed(2)
      ]);
    } else {
      headers = ['ID', 'Guia Remision', 'Pedido Codigo', 'Transportista', 'Placa', 'Conductor', 'Estado', 'Fecha Salida'];
      rows = despachosFiltrados.map(d => [
        d.id,
        d.guiaRemision,
        d.pedido?.codigoPedido || '—',
        d.transportistaRazonSocial,
        d.placaVehiculo,
        d.conductorNombre,
        d.estado,
        formatDate(d.fechaSalida)
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-h-screen bg-[#F4F6F9] p-6 lg:p-8 space-y-6 print:p-0 print:bg-white print:min-h-0">
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 12mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
        }
      `}</style>

      {/* Header Corporativo para Impresión Formal */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">NexusLogix Perú S.A.C.</h1>
            <p className="text-xs text-slate-600">RUC: 20608945123 · Centro de Distribución y Almacén Central Lurín</p>
            <h2 className="text-sm font-bold text-slate-800 mt-2 uppercase tracking-wide">
              REPORTE EJECUTIVO: {activeTab === 'financiero' ? 'VENTAS Y FACTURACIÓN' : activeTab === 'inventario' ? 'VALORIZACIÓN DE EXISTENCIAS (KÁRDEX)' : 'DESPACHOS Y GUÍAS DE REMISIÓN'}
            </h2>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-semibold">Fecha de Emisión: {new Date().toLocaleDateString('es-PE')}</p>
            <p>Generado por: Auditoría del Sistema WMS</p>
          </div>
        </div>
      </div>

      {/* Header Web */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-3.5 h-3.5" /> Módulo de Inteligencia Operativa
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reportes y Métricas Ejecutivas</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidado general de operaciones comerciales, inventario, valorizaciones y despachos en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setRefreshing(true); loadData(); }}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>

          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#1D68EC] hover:bg-[#1555C0] rounded-lg shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs print:p-3 print:border-slate-300">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide print:text-slate-700">Facturación Total</p>
          <p className="text-2xl font-black text-slate-900 mt-1 print:text-xl">{formatCurrency(totalFacturado)}</p>
          <p className="mt-2 text-xs text-emerald-600 font-medium print:text-slate-600">
            IGV recaudado: {formatCurrency(totalIgv)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs print:p-3 print:border-slate-300">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide print:text-slate-700">Valorización Inventario</p>
          <p className="text-2xl font-black text-slate-900 mt-1 print:text-xl">{formatCurrency(valorInventario)}</p>
          <p className="mt-2 text-xs text-slate-500 font-medium print:text-slate-600">
            {productos.length} productos registrados
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs print:p-3 print:border-slate-300">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide print:text-slate-700">Órdenes Comerciales</p>
          <p className="text-2xl font-black text-slate-900 mt-1 print:text-xl">{pedidos.length}</p>
          <p className="mt-2 text-xs text-amber-600 font-medium print:text-slate-600">
            {pedidos.filter(p => p.estado === 'PENDIENTE' || p.estado === 'EN_PREPARACION').length} en curso
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs print:p-3 print:border-slate-300">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide print:text-slate-700">Cumplimiento Logístico</p>
          <p className="text-2xl font-black text-emerald-600 mt-1 print:text-xl">{tasaCumplimiento}%</p>
          <p className="mt-2 text-xs text-slate-500 font-medium print:text-slate-600">
            {despachos.filter(d => d.estado === 'ENTREGADO').length} de {despachos.length} entregados
          </p>
        </div>
      </div>

      {/* Tabs Selector & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('financiero')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition ${
              activeTab === 'financiero'
                ? 'bg-white text-[#1D68EC] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reporte Financiero / Ventas
          </button>
          <button
            onClick={() => setActiveTab('inventario')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition ${
              activeTab === 'inventario'
                ? 'bg-white text-[#1D68EC] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reporte de Existencias / Kardex
          </button>
          <button
            onClick={() => setActiveTab('despachos')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition ${
              activeTab === 'despachos'
                ? 'bg-white text-[#1D68EC] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reporte de Despachos y Guías
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código, cliente o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#1D68EC] focus:ring-1 focus:ring-[#1D68EC]"
          />
        </div>
      </div>

      {/* Content Table by Tab */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1D68EC]" />
            <p className="text-xs">Cargando métricas y reportes del sistema...</p>
          </div>
        ) : activeTab === 'financiero' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Código</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Fecha Emisión</th>
                  <th className="px-5 py-3 text-right">Subtotal</th>
                  <th className="px-5 py-3 text-right">IGV (18%)</th>
                  <th className="px-5 py-3 text-right">Total Facturado</th>
                  <th className="px-5 py-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pedidosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-400">
                      No se encontraron registros de pedidos.
                    </td>
                  </tr>
                ) : (
                  pedidosFiltrados.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3.5 font-bold text-slate-900 font-mono">{p.codigoPedido}</td>
                      <td className="px-5 py-3.5 text-slate-700">{p.cliente?.razonSocial || 'Cliente General'}</td>
                      <td className="px-5 py-3.5 text-slate-500">{formatDate(p.fechaPedido)}</td>
                      <td className="px-5 py-3.5 text-right text-slate-600">{formatCurrency(p.subtotal)}</td>
                      <td className="px-5 py-3.5 text-right text-slate-600">{formatCurrency(p.igv)}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900">{formatCurrency(p.total)}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {p.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'inventario' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3">Descripción Producto</th>
                  <th className="px-5 py-3">Categoría</th>
                  <th className="px-5 py-3 text-right">Precio Unitario</th>
                  <th className="px-5 py-3 text-right">Stock Actual</th>
                  <th className="px-5 py-3 text-right">Stock Mínimo</th>
                  <th className="px-5 py-3 text-right">Valorización</th>
                  <th className="px-5 py-3 text-center">Estado Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {productosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-slate-400">
                      No se encontraron registros de inventario.
                    </td>
                  </tr>
                ) : (
                  productosFiltrados.map((prod) => {
                    const isLow = (prod.stockActual || 0) <= (prod.stockMinimo || 0);
                    const valItem = (Number(prod.stockActual) || 0) * (Number(prod.precioUnitario) || 0);
                    return (
                      <tr key={prod.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5 font-bold font-mono text-slate-700">{prod.codigoSku}</td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900">{prod.nombre}</td>
                        <td className="px-5 py-3.5 text-slate-600">{prod.categoria?.nombre || 'General'}</td>
                        <td className="px-5 py-3.5 text-right text-slate-600">{formatCurrency(prod.precioUnitario)}</td>
                        <td className="px-5 py-3.5 text-right font-bold text-slate-900">{prod.stockActual ?? 0}</td>
                        <td className="px-5 py-3.5 text-right text-slate-500">{prod.stockMinimo ?? 0}</td>
                        <td className="px-5 py-3.5 text-right font-bold text-indigo-700">{formatCurrency(valItem)}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                              isLow
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isLow ? 'CRÍTICO' : 'ÓPTIMO'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Guía Remisión</th>
                  <th className="px-5 py-3">Pedido Vinculado</th>
                  <th className="px-5 py-3">Transportista</th>
                  <th className="px-5 py-3">Placa / Conductor</th>
                  <th className="px-5 py-3">Fecha Salida</th>
                  <th className="px-5 py-3 text-center">Estado</th>
                  <th className="px-5 py-3">Conformidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {despachosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-400">
                      No se encontraron registros de despachos.
                    </td>
                  </tr>
                ) : (
                  despachosFiltrados.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3.5 font-bold font-mono text-indigo-700">{d.guiaRemision}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-800">{d.pedido?.codigoPedido || '—'}</td>
                      <td className="px-5 py-3.5 text-slate-700">{d.transportistaRazonSocial || 'Flota Propia'}</td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {d.placaVehiculo} · {d.conductorNombre}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{formatDate(d.fechaSalida)}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                            d.estado === 'ENTREGADO'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {d.estado}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {d.conformidadRecepcion || 'Pendiente de entrega'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Formal para Impresión */}
      <div className="hidden print:flex justify-between items-center text-xs text-slate-600 pt-8 mt-6 border-t border-slate-300">
        <p>Documento oficial emitido por NexusLogix WMS Enterprise · Control Interno de Almacén y Distribución.</p>
        <div className="text-center">
          <div className="w-56 border-t border-slate-500 mb-1"></div>
          <p className="text-[11px] font-semibold text-slate-700">Firma de Auditoría / Gerencia de Operaciones</p>
        </div>
      </div>
    </div>
  );
}
