import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  FileText,
  Filter,
  Layers,
  Loader2,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function formatCurrency(amount) {
  const val = Number(amount) || 0;
  return `S/ ${val.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return 'No especificada';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

const statusOptions = [
  { value: 'PENDIENTE', label: 'Pendiente', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  { value: 'EN_PREPARACION', label: 'En Preparación', bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  { value: 'EN_RUTA', label: 'En Ruta', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  { value: 'ENTREGADO', label: 'Entregado', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  { value: 'CANCELADO', label: 'Cancelado', bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
];

function getStatusBadge(status) {
  const found = statusOptions.find((s) => s.value === status) || statusOptions[0];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${found.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${found.dot}`}></span>
      {found.label}
    </span>
  );
}

export default function OrdersPlaceholder() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal Detalle
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentOrderDetails, setCurrentOrderDetails] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Modal Nuevo Pedido Manual
  const [newOrderModalOpen, setNewOrderModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [observations, setObservations] = useState('');
  const [orderItems, setOrderItems] = useState([]); // [{ productId, quantity, price, sku, name }]
  const [selectedProdId, setSelectedProdId] = useState('');
  const [selectedProdQty, setSelectedProdQty] = useState(1);
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Cargar datos
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [ordRes, cliRes, prodRes] = await Promise.allSettled([
        api.get('/pedidos'),
        api.get('/clientes'),
        api.get('/productos/activos'),
      ]);

      if (ordRes.status === 'fulfilled' && Array.isArray(ordRes.value.data)) {
        setOrders(ordRes.value.data);
      }
      if (cliRes.status === 'fulfilled' && Array.isArray(cliRes.value.data)) {
        setClients(cliRes.value.data);
      }
      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value.data)) {
        setProducts(prodRes.value.data);
      }
    } catch {
      setErrorMsg('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Filtrado de pedidos
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'ALL' && o.estado !== statusFilter) return false;
      if (q) {
        const matchCode = (o.codigoPedido || '').toLowerCase().includes(q);
        const matchClient = (o.cliente?.razonSocial || '').toLowerCase().includes(q);
        const matchRuc = (o.cliente?.ruc || '').toLowerCase().includes(q);
        const matchAddress = (o.direccionEntrega || '').toLowerCase().includes(q);
        return matchCode || matchClient || matchRuc || matchAddress;
      }
      return true;
    });
  }, [orders, search, statusFilter]);

  // Contadores KPI
  const kpis = useMemo(() => {
    const total = orders.length;
    const pendientes = orders.filter((o) => o.estado === 'PENDIENTE').length;
    const preparacion = orders.filter((o) => o.estado === 'EN_PREPARACION').length;
    const enRuta = orders.filter((o) => o.estado === 'EN_RUTA').length;
    const entregados = orders.filter((o) => o.estado === 'ENTREGADO').length;
    const totalMonto = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    return { total, pendientes, preparacion, enRuta, entregados, totalMonto };
  }, [orders]);

  // Ver Detalle
  const handleViewDetails = async (orderId) => {
    setLoadingDetail(true);
    setDetailModalOpen(true);
    try {
      const res = await api.get(`/pedidos/${orderId}`);
      setCurrentOrderDetails(res.data);
    } catch (err) {
      alert('Error al cargar detalle del pedido.');
      setDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Cambiar Estado
  const handleChangeStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await api.put(`/pedidos/${orderId}/estado`, { estado: newStatus });
      // Actualizar estado local
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, estado: newStatus } : o))
      );
      if (currentOrderDetails?.cabecera?.id === orderId) {
        setCurrentOrderDetails((prev) => ({
          ...prev,
          cabecera: { ...prev.cabecera, estado: newStatus },
        }));
      }
    } catch {
      alert('No se pudo actualizar el estado.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Agregar item en nuevo pedido manual
  const handleAddItemToNewOrder = () => {
    if (!selectedProdId) return;
    const prod = products.find((p) => String(p.id) === String(selectedProdId));
    if (!prod) return;

    setOrderItems((prev) => {
      const existing = prev.find((i) => i.productId === prod.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === prod.id ? { ...i, quantity: i.quantity + Number(selectedProdQty) } : i
        );
      }
      return [
        ...prev,
        {
          productId: prod.id,
          sku: prod.codigoSku,
          name: prod.nombre,
          price: prod.precioUnitario || 0,
          quantity: Number(selectedProdQty),
        },
      ];
    });
    setSelectedProdId('');
    setSelectedProdQty(1);
  };

  const handleRemoveItemFromNewOrder = (prodId) => {
    setOrderItems((prev) => prev.filter((i) => i.productId !== prodId));
  };

  // Crear pedido manual
  const handleCreateManualOrder = async (e) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      alert('Añade al menos un producto al pedido.');
      return;
    }
    if (!selectedClientId) {
      alert('Selecciona un cliente.');
      return;
    }

    setCreatingOrder(true);
    try {
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const codigoPedido = `PED-${new Date().getFullYear()}-${randomSeq}`;

      const payload = {
        pedido: {
          codigoPedido,
          cliente: { id: Number(selectedClientId) },
          usuario: user?.id || 1,
          direccionEntrega: shippingAddress || 'Almacén Central',
          fechaEntregaEstimada: estimatedDelivery ? `${estimatedDelivery}T10:00:00` : null,
          observaciones: observations || 'Pedido registrado desde Gestión de Pedidos.',
        },
        detalles: orderItems.map((item) => ({
          producto: item.productId,
          cantidad: item.quantity,
          precioUnitario: item.price,
        })),
      };

      const res = await api.post('/pedidos', payload);
      setOrders((prev) => [res.data, ...prev]);
      setNewOrderModalOpen(false);
      setOrderItems([]);
      setObservations('');
      alert(`¡Pedido ${codigoPedido} registrado exitosamente!`);
    } catch {
      alert('Error al registrar el pedido.');
    } finally {
      setCreatingOrder(false);
    }
  };

  // Cálculos del nuevo pedido manual
  const newOrderSubtotal = orderItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const newOrderIgv = newOrderSubtotal * 0.18;
  const newOrderTotal = newOrderSubtotal + newOrderIgv;

  return (
    <div className="w-full min-h-screen bg-[#F4F6F9] p-6 lg:p-8 space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 text-[#1D68EC] text-xs font-bold uppercase tracking-wider mb-1">
            <ShoppingCart className="w-3.5 h-3.5" /> Módulo de Operaciones
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión y Trazabilidad de Pedidos</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de órdenes de compra, validación de stock, picking y seguimiento de despacho.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setRefreshing(true);
              loadOrders();
            }}
            title="Recargar órdenes"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setNewOrderModalOpen(true);
              if (clients.length > 0 && !selectedClientId) {
                setSelectedClientId(clients[0].id);
                setShippingAddress(clients[0].direccionFiscal || '');
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D68EC] text-white text-xs font-bold hover:bg-[#1554C2] transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Registrar Nuevo Pedido
          </button>
        </div>
      </div>

      {/* 2. KPIs Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">Total Órdenes</span>
          <span className="text-xl font-bold text-slate-900">{kpis.total}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-600 block uppercase">Pendientes</span>
          <span className="text-xl font-bold text-amber-700">{kpis.pendientes}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-600 block uppercase">En Preparación</span>
          <span className="text-xl font-bold text-blue-700">{kpis.preparacion}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-indigo-600 block uppercase">En Ruta</span>
          <span className="text-xl font-bold text-indigo-700">{kpis.enRuta}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 block uppercase">Entregados</span>
          <span className="text-xl font-bold text-emerald-700">{kpis.entregados}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">Total Facturado</span>
          <span className="text-sm font-bold text-[#1D68EC]">{formatCurrency(kpis.totalMonto)}</span>
        </div>
      </div>

      {/* 3. Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, cliente o RUC..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#1D68EC]"
          />
        </div>

        {/* Pestañas de Estado */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {['ALL', 'PENDIENTE', 'EN_PREPARACION', 'EN_RUTA', 'ENTREGADO', 'CANCELADO'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#1D68EC] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Todos' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tabla de Pedidos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#1D68EC]" />
            <span className="text-xs">Cargando pedidos...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ShoppingCart className="w-12 h-12 mx-auto text-slate-200 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No se encontraron pedidos</p>
            <p className="text-xs text-slate-400 mt-1">Prueba cambiando el filtro de búsqueda o estado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Cliente / Razón Social</th>
                  <th className="py-3 px-4">Fecha Pedido</th>
                  <th className="py-3 px-4">Entrega Estimada</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-center">Cambiar Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1D68EC]">{o.codigoPedido}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{o.cliente?.razonSocial || 'Cliente General'}</div>
                      <div className="text-[11px] text-slate-400">RUC: {o.cliente?.ruc || 'No registrado'}</div>
                    </td>
                    <td className="py-3.5 px-4">{formatDate(o.fechaPedido)}</td>
                    <td className="py-3.5 px-4">{formatDate(o.fechaEntregaEstimada)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(o.total)}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(o.estado)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <select
                        value={o.estado || 'PENDIENTE'}
                        onChange={(e) => handleChangeStatus(o.id, e.target.value)}
                        className="text-[11px] font-semibold rounded-md border border-slate-200 px-2 py-1 bg-white text-slate-700 focus:outline-none focus:border-[#1D68EC] cursor-pointer"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleViewDetails(o.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" /> Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Modal Detalle de Pedido */}
      {detailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1D68EC]" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Pedido <span className="font-mono text-[#1D68EC]">{currentOrderDetails?.cabecera?.codigoPedido}</span>
                  </h3>
                  <p className="text-xs text-slate-500">Desglose de artículos y estado operativo</p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {loadingDetail || !currentOrderDetails ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1D68EC]" />
                  <p className="text-xs">Cargando...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 block">Cliente:</span>
                      <span className="font-bold text-slate-800">
                        {currentOrderDetails.cabecera?.cliente?.razonSocial || 'No indicado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">RUC:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {currentOrderDetails.cabecera?.cliente?.ruc || 'No registrado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Dirección de Entrega:</span>
                      <span className="font-medium text-slate-800">
                        {currentOrderDetails.cabecera?.direccionEntrega || 'No indicada'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Estado Actual:</span>
                      <div className="mt-0.5">{getStatusBadge(currentOrderDetails.cabecera?.estado)}</div>
                    </div>
                    {currentOrderDetails.cabecera?.observaciones && (
                      <div className="col-span-2 pt-2 border-t border-slate-200">
                        <span className="text-slate-400 block">Observaciones:</span>
                        <span className="text-slate-700 italic">"{currentOrderDetails.cabecera?.observaciones}"</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Artículos en Picking</h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Item / Suministro</th>
                            <th className="py-2.5 px-3 text-center">Cant.</th>
                            <th className="py-2.5 px-3 text-right">Precio Unit.</th>
                            <th className="py-2.5 px-3 text-right">Subtotal</th>
                            <th className="py-2.5 px-3 text-center">Estado Picking</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {(currentOrderDetails.detalle_pedidos || []).map((d) => (
                            <tr key={d.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-medium text-slate-800">Suministro #{d.producto || d.productoId}</td>
                              <td className="py-2.5 px-3 text-center font-bold">{d.cantidad}</td>
                              <td className="py-2.5 px-3 text-right">{formatCurrency(d.precioUnitario)}</td>
                              <td className="py-2.5 px-3 text-right font-semibold">{formatCurrency(d.subtotal)}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  {d.estadoPicking || 'PENDIENTE'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <div className="w-64 space-y-1.5 text-xs text-slate-600 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(currentOrderDetails.cabecera?.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IGV (18%):</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(currentOrderDetails.cabecera?.igv)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                        <span>Total:</span>
                        <span className="text-[#1D68EC]">{formatCurrency(currentOrderDetails.cabecera?.total)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Actualizar Estado:</span>
                <select
                  disabled={updatingStatus}
                  value={currentOrderDetails?.cabecera?.estado || 'PENDIENTE'}
                  onChange={(e) => handleChangeStatus(currentOrderDetails.cabecera.id, e.target.value)}
                  className="text-xs rounded-lg border border-slate-300 p-1.5 bg-white text-slate-800"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal Registrar Nuevo Pedido Manual */}
      {newOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#1D68EC]" />
                <h3 className="text-base font-bold text-slate-900">Registrar Nuevo Pedido Operativo</h3>
              </div>
              <button
                onClick={() => setNewOrderModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cliente Corporativo *</label>
                  <select
                    required
                    value={selectedClientId}
                    onChange={(e) => {
                      setSelectedClientId(e.target.value);
                      const cli = clients.find((c) => String(c.id) === String(e.target.value));
                      if (cli && cli.direccionFiscal) setShippingAddress(cli.direccionFiscal);
                    }}
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white text-slate-800"
                  >
                    <option value="">-- Seleccionar Cliente --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.ruc} - {c.razonSocial}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha Entrega Estimada</label>
                  <input
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dirección de Entrega *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Ej. Almacén Central de Obra"
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5"
                  />
                </div>
              </div>

              {/* Selector de Items */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700">Agregar Artículos al Pedido</h4>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <select
                    value={selectedProdId}
                    onChange={(e) => setSelectedProdId(e.target.value)}
                    className="flex-1 w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800"
                  >
                    <option value="">-- Seleccionar Producto del Catálogo --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.codigoSku} - {p.nombre} (Stock: {p.stockActual} | {formatCurrency(p.precioUnitario)})
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="number"
                      min="1"
                      value={selectedProdQty}
                      onChange={(e) => setSelectedProdQty(e.target.value)}
                      className="w-20 text-xs rounded-lg border border-slate-300 p-2 text-center"
                    />
                    <button
                      type="button"
                      onClick={handleAddItemToNewOrder}
                      className="px-3 py-2 rounded-lg bg-[#1D68EC] text-white text-xs font-bold hover:bg-[#1554C2] cursor-pointer"
                    >
                      Añadir
                    </button>
                  </div>
                </div>

                {/* Lista de Items agregados */}
                {orderItems.length > 0 && (
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white overflow-hidden text-xs">
                    {orderItems.map((item) => (
                      <div key={item.productId} className="p-2.5 flex items-center justify-between gap-2">
                        <div>
                          <span className="font-mono font-bold text-[#1D68EC]">{item.sku}</span> - {item.name}
                          <div className="text-[11px] text-slate-400">
                            {item.quantity} x {formatCurrency(item.price)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-800">{formatCurrency(item.price * item.quantity)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromNewOrder(item.productId)}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Notas para el equipo de picking y despacho..."
                  className="w-full text-xs rounded-lg border border-slate-200 p-2"
                />
              </div>

              {/* Totales */}
              {orderItems.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-500">Subtotal: {formatCurrency(newOrderSubtotal)}</span> |{' '}
                    <span className="text-slate-500">IGV (18%): {formatCurrency(newOrderIgv)}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    Total: <span className="text-[#1D68EC]">{formatCurrency(newOrderTotal)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewOrderModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingOrder || orderItems.length === 0}
                  className="px-5 py-2.5 rounded-lg bg-[#1D68EC] text-white text-xs font-bold hover:bg-[#1554C2] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {creatingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Guardar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
