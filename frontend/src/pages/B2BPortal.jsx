import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
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

const statusConfig = {
  PENDIENTE: {
    label: 'Pendiente',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  EN_PREPARACION: {
    label: 'En Preparación',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  EN_RUTA: {
    label: 'En Ruta',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
  },
  ENTREGADO: {
    label: 'Entregado',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  CANCELADO: {
    label: 'Cancelado',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
};

export default function B2BPortal() {
  const { user } = useAuth();

  // Estados de navegación interna
  const [activeTab, setActiveTab] = useState('catalogo'); // 'catalogo' | 'pedidos'

  // Datos principales
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);

  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Filtros del catálogo
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Carrito B2B
  const [cart, setCart] = useState({}); // { [productId]: { product, quantity } }
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // Formulario de Checkout / Envío de Pedido
  const [selectedClientId, setSelectedClientId] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [observations, setObservations] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Modal de Detalle de Pedido (Tab Pedidos)
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Cargar datos iniciales
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [prodRes, catRes, clientRes, ordersRes] = await Promise.allSettled([
        api.get('/productos/activos'),
        api.get('/categorias/activas'),
        api.get('/clientes'),
        api.get('/pedidos'),
      ]);

      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value.data)) {
        setProducts(prodRes.value.data);
      }
      if (catRes.status === 'fulfilled' && Array.isArray(catRes.value.data)) {
        setCategories(catRes.value.data);
      }
      if (clientRes.status === 'fulfilled' && Array.isArray(clientRes.value.data)) {
        setClients(clientRes.value.data);
        if (clientRes.value.data.length > 0 && !selectedClientId) {
          const firstClient = clientRes.value.data[0];
          setSelectedClientId(firstClient.id);
          setShippingAddress(firstClient.direccionFiscal || '');
        }
      }
      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value.data)) {
        setOrders(ordersRes.value.data);
      }
    } catch (err) {
      setErrorMsg('No se pudo conectar con el backend de NexusLogix.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    loadInitialData();
    // Default delivery date: 3 días a partir de hoy
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    setEstimatedDelivery(targetDate.toISOString().split('T')[0]);
  }, [loadInitialData]);

  // Al cambiar cliente seleccionado, autocompletar dirección fiscal
  const handleClientChange = (clientId) => {
    setSelectedClientId(clientId);
    const cli = clients.find((c) => String(c.id) === String(clientId));
    if (cli && cli.direccionFiscal) {
      setShippingAddress(cli.direccionFiscal);
    }
  };

  // Agregar al carrito
  const addToCart = (product, qty = 1) => {
    const pId = product.id;
    setCart((prev) => {
      const existingQty = prev[pId]?.quantity || 0;
      const maxStock = product.stockActual ?? 9999;
      const newQty = Math.min(existingQty + qty, maxStock);
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[pId];
        return next;
      }
      return {
        ...prev,
        [pId]: {
          product,
          quantity: newQty,
        },
      };
    });
  };

  // Quitar del carrito
  const removeFromCart = (productId) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  // Actualizar cantidad directa en carrito
  const updateCartQty = (productId, newQty, maxStock) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    const finalQty = Math.min(newQty, maxStock ?? 9999);
    setCart((prev) => {
      if (!prev[productId]) return prev;
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          quantity: finalQty,
        },
      };
    });
  };

  // Métricas del carrito
  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const cartCount = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
  const cartSubtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + (item.product.precioUnitario || 0) * item.quantity, 0),
    [cartItems]
  );
  const cartIgv = useMemo(() => cartSubtotal * 0.18, [cartSubtotal]);
  const cartTotal = useMemo(() => cartSubtotal + cartIgv, [cartSubtotal, cartIgv]);

  // Filtrado de productos en catálogo
  const visibleProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (onlyInStock && (p.stockActual || 0) <= 0) return false;
      if (selectedCategory !== 'ALL') {
        const catId = p.categoria?.id || p.categoriaId;
        if (String(catId) !== String(selectedCategory)) return false;
      }
      if (q) {
        const matchSku = (p.codigoSku || '').toLowerCase().includes(q);
        const matchName = (p.nombre || '').toLowerCase().includes(q);
        const matchDesc = (p.descripcion || '').toLowerCase().includes(q);
        const matchCat = (p.categoria?.nombre || '').toLowerCase().includes(q);
        return matchSku || matchName || matchDesc || matchCat;
      }
      return true;
    });
  }, [products, search, selectedCategory, onlyInStock]);

  // Enviar pedido B2B al backend
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Tu pedido no contiene suministros. Agrega al menos un producto.');
      return;
    }
    if (!selectedClientId) {
      alert('Por favor selecciona la empresa cliente para facturación.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const codigoPedido = `PED-B2B-${new Date().getFullYear()}-${randomSeq}`;

      const payload = {
        pedido: {
          codigoPedido,
          cliente: { id: Number(selectedClientId) },
          usuario: user?.id || 1,
          direccionEntrega: shippingAddress || 'Dirección de planta / campamento no especificada',
          fechaEntregaEstimada: estimatedDelivery ? `${estimatedDelivery}T10:00:00` : null,
          observaciones: observations || 'Solicitud generada a través del Portal Comercial B2B.',
        },
        detalles: cartItems.map((item) => ({
          producto: item.product.id,
          cantidad: item.quantity,
          precioUnitario: item.product.precioUnitario || 0,
        })),
      };

      const res = await api.post('/pedidos', payload);
      setOrderSuccess(res.data || { codigoPedido });
      setCart({});
      setCartDrawerOpen(false);
      setObservations('');

      // Recargar pedidos para ver la nueva orden en la lista
      const ordersRes = await api.get('/pedidos');
      if (Array.isArray(ordersRes.data)) {
        setOrders(ordersRes.data);
      }
    } catch (err) {
      console.error(err);
      alert('Error al procesar el pedido. Comprueba la conexión con el backend.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Ver detalle de un pedido
  const handleOpenOrderDetail = async (orderId) => {
    setLoadingDetails(true);
    setDetailModalOpen(true);
    try {
      const res = await api.get(`/pedidos/${orderId}`);
      setSelectedOrderDetails(res.data);
    } catch (err) {
      console.error('Error cargando detalle:', err);
      alert('No se pudo cargar el detalle del pedido.');
      setDetailModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F4F6F9] p-6 lg:p-8 space-y-6">
      {/* 1. Header / Hero B2B */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0C1E36] via-[#102a4c] to-[#1D68EC] p-6 lg:p-8 text-white shadow-xl shadow-[#0C1E36]/10">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide uppercase text-blue-200">
              <Building2 className="w-3.5 h-3.5" /> Portal Comercial B2B
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Suministros Industriales y Despacho Corporativo
            </h1>
            <p className="text-sm text-slate-200 leading-relaxed">
              Consulta de stock en tiempo real, cotización con IGV automatizado y generación de pedidos mayoristas con trazabilidad logística.
            </p>
          </div>

          {/* Botón flotante Carrito / Estado */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-white text-[#0C1E36] font-semibold text-sm shadow-lg hover:bg-blue-50 transition active:scale-95 cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-[#1D68EC]" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#1D68EC] text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="text-left">
                <div className="text-xs text-slate-500 font-medium">Mi Orden B2B</div>
                <div className="text-sm font-bold text-slate-900">{formatCurrency(cartTotal)}</div>
              </div>
            </button>

            <button
              onClick={() => {
                setRefreshing(true);
                loadInitialData();
              }}
              title="Recargar catálogo y pedidos"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tabs de Navegación */}
        <div className="mt-8 flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('catalogo')}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'catalogo'
                ? 'border-white text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" /> Catálogo de Suministros
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-white/15">
              {products.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'pedidos'
                ? 'border-white text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" /> Mis Solicitudes B2B
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-white/15">
              {orders.length}
            </span>
          </button>
        </div>
      </div>

      {/* Banner de Éxito al Crear Pedido */}
      {orderSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-900">
                ¡Solicitud de Pedido B2B Generada Exitosamente!
              </p>
              <p className="text-xs text-emerald-700">
                Código de Orden: <span className="font-semibold underline">{orderSuccess.codigoPedido}</span>. El equipo de despacho ya puede iniciar la preparación de la carga.
              </p>
            </div>
          </div>
          <button
            onClick={() => setOrderSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* 2. TAB: CATÁLOGO DE SUMINISTROS */}
      {activeTab === 'catalogo' && (
        <div className="space-y-6">
          {/* Barra de Filtros y Búsqueda */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Input de Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por SKU, producto o pasillo..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#1D68EC] focus:ring-2 focus:ring-[#1D68EC]/15 text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Filtro por Categorías y Stock */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#1D68EC]"
              >
                <option value="ALL">Todas las Categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-[#1D68EC] focus:ring-[#1D68EC]"
                />
                Solo con Stock
              </label>
            </div>
          </div>

          {/* Grilla de Productos */}
          {loading ? (
            <div className="min-h-[300px] flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#1D68EC]" />
              <p className="text-sm">Cargando catálogo en tiempo real...</p>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="min-h-[300px] bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center p-8 text-center">
              <Package className="w-12 h-12 text-slate-300 mb-2" />
              <h3 className="text-base font-semibold text-slate-800">No se encontraron suministros</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Intenta ajustando los términos de búsqueda o removiendo los filtros de categoría.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {visibleProducts.map((p) => {
                const stock = p.stockActual ?? 0;
                const minStock = p.stockMinimo ?? 10;
                const inCartQty = cart[p.id]?.quantity || 0;
                const isOutOfStock = stock <= 0;

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl border border-slate-200 hover:border-[#1D68EC]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-5 space-y-3">
                      {/* Cabecera Tarjeta: SKU y Categoría */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {p.codigoSku}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 truncate max-w-[130px]" title={p.categoria?.nombre}>
                          {p.categoria?.nombre || 'General'}
                        </span>
                      </div>

                      {/* Título y Descripción */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#1D68EC] transition line-clamp-2">
                          {p.nombre}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {p.descripcion || 'Sin descripción técnica registrada.'}
                        </p>
                      </div>

                      {/* Datos logísticos */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <div>
                          <span className="text-slate-400 block">Ubicación:</span>
                          <span className="font-medium text-slate-700">{p.ubicacionPasillo || 'Almacén Central'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Unidad:</span>
                          <span className="font-medium text-slate-700 uppercase">{p.unidadMedida || 'UNIDAD'}</span>
                        </div>
                      </div>

                      {/* Badge de Stock */}
                      <div>
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Agotado
                          </span>
                        ) : stock <= minStock ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Stock Crítico: {stock} {p.unidadMedida}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Disponible: {stock} {p.unidadMedida}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Tarjeta: Precio y Acción de compra */}
                    <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium">Precio Unit. (+IGV)</div>
                        <div className="text-base font-bold text-slate-900">{formatCurrency(p.precioUnitario)}</div>
                      </div>

                      {inCartQty > 0 ? (
                        <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg p-1">
                          <button
                            onClick={() => addToCart(p, -1)}
                            className="w-7 h-7 rounded bg-white text-blue-700 font-bold hover:bg-blue-100 flex items-center justify-center text-sm shadow-xs cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-blue-900 px-1.5">{inCartQty}</span>
                          <button
                            onClick={() => addToCart(p, 1)}
                            disabled={inCartQty >= stock}
                            className="w-7 h-7 rounded bg-[#1D68EC] text-white font-bold hover:bg-blue-700 flex items-center justify-center text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(p, 1)}
                          disabled={isOutOfStock}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1D68EC] text-white text-xs font-semibold shadow-xs hover:bg-[#1554C2] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Agregar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. TAB: MIS SOLICITUDES B2B */}
      {activeTab === 'pedidos' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Historial de Órdenes Corporativas</h2>
                <p className="text-xs text-slate-500">
                  Seguimiento de pedidos registrados y estado de despacho hacia obras y campamentos.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 px-2.5 py-1 bg-slate-100 rounded-md">
                Total: {orders.length} pedidos
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Aún no hay órdenes registradas</p>
                <p className="text-xs text-slate-500 mt-1">
                  Genera una solicitud desde la pestaña "Catálogo de Suministros".
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Código Orden</th>
                      <th className="py-3 px-4">Cliente / Razón Social</th>
                      <th className="py-3 px-4">Fecha Solicitud</th>
                      <th className="py-3 px-4">Entrega Estimada</th>
                      <th className="py-3 px-4">Total (+IGV)</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {orders.map((o) => {
                      const st = statusConfig[o.estado] || statusConfig.PENDIENTE;
                      return (
                        <tr key={o.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#1D68EC]">
                            {o.codigoPedido}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">
                              {o.cliente?.razonSocial || 'Cliente General'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              RUC: {o.cliente?.ruc || '20XXXXXXXXX'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">{formatDate(o.fechaPedido)}</td>
                          <td className="py-3.5 px-4">{formatDate(o.fechaEntregaEstimada)}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {formatCurrency(o.total)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${st.bg}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                              {st.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleOpenOrderDetail(o.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" /> Ver Detalle
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. DRAWER / MODAL LATERAL DE PEDIDO B2B (CHECKOUT) */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Cabecera del Drawer */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#1D68EC]" />
                <h3 className="text-base font-bold text-slate-900">Solicitud de Pedido Mayorista</h3>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {cartItems.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <ShoppingCart className="w-12 h-12 mx-auto text-slate-200 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">El carrito de pedido está vacío</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Explora el catálogo y añade los insumos que tu operación requiere.
                  </p>
                </div>
              ) : (
                <>
                  {/* Lista de Items */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Suministros Seleccionados ({cartCount})
                    </h4>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {cartItems.map((item) => {
                        const itemSub = (item.product.precioUnitario || 0) * item.quantity;
                        return (
                          <div key={item.product.id} className="p-3.5 bg-white flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-mono font-bold text-[#1D68EC] block">
                                {item.product.codigoSku}
                              </span>
                              <h5 className="text-xs font-bold text-slate-900 truncate">
                                {item.product.nombre}
                              </h5>
                              <p className="text-[11px] text-slate-500">
                                {formatCurrency(item.product.precioUnitario)} / {item.product.unidadMedida}
                              </p>
                            </div>

                            {/* Control de Cantidad */}
                            <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-slate-50">
                              <button
                                onClick={() => addToCart(item.product, -1)}
                                className="w-6 h-6 rounded bg-white text-slate-700 font-bold hover:bg-slate-200 text-xs flex items-center justify-center cursor-pointer"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold text-slate-800 w-6 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => addToCart(item.product, 1)}
                                disabled={item.quantity >= (item.product.stockActual ?? 999)}
                                className="w-6 h-6 rounded bg-white text-slate-700 font-bold hover:bg-slate-200 text-xs flex items-center justify-center disabled:opacity-40 cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            {/* Subtotal Item & Borrar */}
                            <div className="text-right">
                              <div className="text-xs font-bold text-slate-900">{formatCurrency(itemSub)}</div>
                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="text-rose-500 hover:text-rose-700 p-1 text-[11px] inline-flex items-center gap-0.5 mt-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Formulario de Facturación y Despacho */}
                  <form id="b2b-order-form" onSubmit={handleSubmitOrder} className="space-y-4 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Datos de Despacho y Facturación
                    </h4>

                    {/* Cliente Corporativo */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Empresa Cliente (RUC / Razón Social) *
                      </label>
                      <select
                        required
                        value={selectedClientId}
                        onChange={(e) => handleClientChange(e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white text-slate-800 focus:outline-none focus:border-[#1D68EC]"
                      >
                        <option value="">-- Selecciona una empresa cliente --</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.ruc} - {c.razonSocial}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dirección de Entrega */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Dirección de Entrega (Obra / Almacén / Campamento) *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder="Ej. Campamento Mina Cuajone - Nivel 3, Moquegua"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#1D68EC]"
                        />
                      </div>
                    </div>

                    {/* Fecha de Entrega Estimada */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Fecha Requerida de Llegada
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="date"
                          value={estimatedDelivery}
                          onChange={(e) => setEstimatedDelivery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#1D68EC]"
                        />
                      </div>
                    </div>

                    {/* Observaciones */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Observaciones Operativas / Requisitos de Guía
                      </label>
                      <textarea
                        rows={2}
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        placeholder="Ej. Entrega con orden de compra física. Contactar al supervisor de turno."
                        className="w-full p-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#1D68EC]"
                      />
                    </div>
                  </form>
                </>
              )}
            </div>

            {/* Footer con Resumen Financiero y Botón */}
            {cartItems.length > 0 && (
              <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal Neto:</span>
                    <span className="font-medium text-slate-900">{formatCurrency(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IGV (18%):</span>
                    <span className="font-medium text-slate-900">{formatCurrency(cartIgv)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                    <span>Total a Facturar:</span>
                    <span className="text-[#1D68EC]">{formatCurrency(cartTotal)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  form="b2b-order-form"
                  disabled={submittingOrder}
                  className="w-full py-3 rounded-xl bg-[#1D68EC] hover:bg-[#1554C2] text-white font-bold text-xs tracking-wide uppercase shadow-md shadow-[#1D68EC]/20 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Registrando Orden B2B...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Confirmar Solicitud de Pedido
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. MODAL DE DETALLE DE PEDIDO */}
      {detailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Cabecera Modal */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#1D68EC]" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Detalle del Pedido{' '}
                    <span className="text-[#1D68EC] font-mono">
                      {selectedOrderDetails?.cabecera?.codigoPedido || ''}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">Desglose de suministros y estado de entrega</p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido Modal */}
            <div className="p-6 overflow-y-auto space-y-5">
              {loadingDetails || !selectedOrderDetails ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1D68EC]" />
                  <p className="text-xs">Cargando desglose de la orden...</p>
                </div>
              ) : (
                <>
                  {/* Datos generales */}
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 block">Cliente:</span>
                      <span className="font-bold text-slate-800">
                        {selectedOrderDetails.cabecera?.cliente?.razonSocial || 'Cliente no asignado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">RUC:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {selectedOrderDetails.cabecera?.cliente?.ruc || 'No registrado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Dirección de Despacho:</span>
                      <span className="font-medium text-slate-800">
                        {selectedOrderDetails.cabecera?.direccionEntrega || 'No indicada'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Fecha Estimada de Llegada:</span>
                      <span className="font-medium text-slate-800">
                        {formatDate(selectedOrderDetails.cabecera?.fechaEntregaEstimada)}
                      </span>
                    </div>
                    {selectedOrderDetails.cabecera?.observaciones && (
                      <div className="col-span-2 pt-2 border-t border-slate-200">
                        <span className="text-slate-400 block">Observaciones:</span>
                        <span className="text-slate-700 italic">
                          "{selectedOrderDetails.cabecera?.observaciones}"
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tabla de Artículos */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Artículos Solicitados
                    </h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                          <tr>
                            <th className="py-2.5 px-3">Item / ID</th>
                            <th className="py-2.5 px-3 text-center">Cant.</th>
                            <th className="py-2.5 px-3 text-right">Precio Unit.</th>
                            <th className="py-2.5 px-3 text-right">Subtotal</th>
                            <th className="py-2.5 px-3 text-center">Picking</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {(selectedOrderDetails.detalle_pedidos || []).map((d) => (
                            <tr key={d.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-medium text-slate-800">
                                Suministro #{d.producto || d.productoId}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                                {d.cantidad}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {formatCurrency(d.precioUnitario)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                                {formatCurrency(d.subtotal)}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  {d.estadoPicking || 'PENDIENTE'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totales */}
                  <div className="flex justify-end pt-2">
                    <div className="w-64 space-y-1.5 text-xs text-slate-600 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(selectedOrderDetails.cabecera?.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>IGV (18%):</span>
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(selectedOrderDetails.cabecera?.igv)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                        <span>Total:</span>
                        <span className="text-[#1D68EC]">
                          {formatCurrency(selectedOrderDetails.cabecera?.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
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
    </div>
  );
}
