import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Layers,
  Loader2,
  MapPin,
  Navigation,
  Package,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
  User,
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
    return d.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

const dispatchStatusConfig = {
  EN_RUTA: {
    label: 'En Ruta',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500 animate-pulse',
  },
  ENTREGADO: {
    label: 'Entregado',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  INCIDENCIA: {
    label: 'Incidencia',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
};

export default function DispatchPlaceholder() {
  const { user } = useAuth();

  const [dispatches, setDispatches] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal Nueva Guía / Despacho
  const [newDispatchModal, setNewDispatchModal] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState('');
  const [guiaRemision, setGuiaRemision] = useState('');
  const [transpRazon, setTranspRazon] = useState('');
  const [transpRuc, setTranspRuc] = useState('');
  const [placaVehiculo, setPlacaVehiculo] = useState('');
  const [conductorNombre, setConductorNombre] = useState('');
  const [conductorLicencia, setConductorLicencia] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [creatingDispatch, setCreatingDispatch] = useState(false);

  // Modal Ver Guía Electrónica (SUNAT Style)
  const [viewGuiaModal, setViewGuiaModal] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);

  // Modal Confirmar Entrega
  const [deliveryModal, setDeliveryModal] = useState(false);
  const [deliveryDispatch, setDeliveryDispatch] = useState(null);
  const [conformidadText, setConformidadText] = useState('');
  const [deliveryObs, setDeliveryObs] = useState('');
  const [submittingDelivery, setSubmittingDelivery] = useState(false);

  // Cargar datos
  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [dispRes, ordRes] = await Promise.allSettled([
        api.get('/despachos'),
        api.get('/pedidos'),
      ]);

      if (dispRes.status === 'fulfilled' && Array.isArray(dispRes.value.data)) {
        setDispatches(dispRes.value.data);
      }
      if (ordRes.status === 'fulfilled' && Array.isArray(ordRes.value.data)) {
        setOrders(ordRes.value.data);
      }
    } catch {
      setErrorMsg('No se pudo conectar con el servidor de despachos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Pedidos elegibles para despacho (ej. PENDIENTE, EN_PREPARACION, o todos los que no tienen despacho aún)
  const availableOrdersForDispatch = useMemo(() => {
    const dispatchedOrderIds = new Set(dispatches.map((d) => d.pedido?.id).filter(Boolean));
    return orders.filter((o) => !dispatchedOrderIds.has(o.id));
  }, [orders, dispatches]);

  // Filtros de tabla
  const filteredDispatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    return dispatches.filter((d) => {
      if (statusFilter !== 'ALL' && d.estado !== statusFilter) return false;
      if (q) {
        const matchGuia = (d.guiaRemision || '').toLowerCase().includes(q);
        const matchPlaca = (d.placaVehiculo || '').toLowerCase().includes(q);
        const matchTransp = (d.transportistaRazonSocial || '').toLowerCase().includes(q);
        const matchDriver = (d.conductorNombre || '').toLowerCase().includes(q);
        const matchOrder = (d.pedido?.codigoPedido || '').toLowerCase().includes(q);
        const matchClient = (d.pedido?.cliente?.razonSocial || '').toLowerCase().includes(q);
        return matchGuia || matchPlaca || matchTransp || matchDriver || matchOrder || matchClient;
      }
      return true;
    });
  }, [dispatches, search, statusFilter]);

  // KPIs
  const kpis = useMemo(() => {
    const total = dispatches.length;
    const enRuta = dispatches.filter((d) => d.estado === 'EN_RUTA').length;
    const entregados = dispatches.filter((d) => d.estado === 'ENTREGADO').length;
    const transportistas = new Set(dispatches.map((d) => d.transportistaRazonSocial).filter(Boolean)).size;
    return { total, enRuta, entregados, transportistas };
  }, [dispatches]);

  // Sugerir datos de transporte predefinidos
  const handleSelectPresetTransport = (companyKey) => {
    if (companyKey === 'transp1') {
      setTranspRazon('Transportes Mineros del Sur S.A.C.');
      setTranspRuc('20549182736');
      setPlacaVehiculo('V7T-842');
      setConductorNombre('Juan Carlos Quispe');
      setConductorLicencia('Q45129834');
    } else if (companyKey === 'transp2') {
      setTranspRazon('Carga Pesada Andina Express S.A.');
      setTranspRuc('20601928374');
      setPlacaVehiculo('B9C-715');
      setConductorNombre('Marcos Antonio Villegas');
      setConductorLicencia('V12398457');
    } else if (companyKey === 'propio') {
      setTranspRazon('Flota Propia NexusLogix Perú S.A.C.');
      setTranspRuc('20608765432');
      setPlacaVehiculo('NEX-101');
      setConductorNombre('Jorge Quispe (Operador Logístico)');
      setConductorLicencia('Q78912345');
    }
  };

  // Crear Despacho / Emitir Guía
  const handleCreateDispatch = async (e) => {
    e.preventDefault();
    if (!selectedPedidoId) {
      alert('Selecciona un pedido para despachar.');
      return;
    }

    setCreatingDispatch(true);
    try {
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const codigoGuia = guiaRemision || `GR-2026-${randomSeq}`;
      const tokenQr = `NEXUS-GRE-${codigoGuia}-${Date.now()}`;

      const payload = {
        guiaRemision: codigoGuia,
        pedido: { id: Number(selectedPedidoId) },
        operador: user?.id || 1,
        transportistaRazonSocial: transpRazon || 'Flota Propia NexusLogix',
        transportistaRuc: transpRuc || '20608765432',
        placaVehiculo: placaVehiculo || 'NEX-001',
        conductorNombre: conductorNombre || 'Conductor Asignado',
        conductorLicencia: conductorLicencia || 'LIC-00000',
        codigoQr: tokenQr,
        estado: 'EN_RUTA',
        observaciones: observaciones || 'Despacho con precinto de seguridad verificado en andén de carga.',
      };

      const res = await api.post('/despachos', payload);
      setDispatches((prev) => [res.data, ...prev]);

      // Actualizar estado del pedido a EN_RUTA también
      await api.put(`/pedidos/${selectedPedidoId}/estado`, { estado: 'EN_RUTA' });

      setNewDispatchModal(false);
      setSelectedPedidoId('');
      setGuiaRemision('');
      setObservaciones('');
      alert(`¡Guía de Remisión ${codigoGuia} emitida con éxito! El pedido pasa a estado EN RUTA.`);
    } catch {
      alert('Error al emitir el despacho. Comprueba que el pedido no tenga ya un despacho asignado.');
    } finally {
      setCreatingDispatch(false);
    }
  };

  // Registrar Entrega
  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    if (!deliveryDispatch) return;

    setSubmittingDelivery(true);
    try {
      const payload = {
        conformidadRecepcion:
          conformidadText || 'Recibido conforme en destino sin mermas ni observaciones.',
        observaciones:
          deliveryObs || 'Mercadería entregada e inspeccionada en obra/campamento.',
      };

      const res = await api.put(`/despachos/${deliveryDispatch.id}/entregar`, payload);
      setDispatches((prev) =>
        prev.map((d) => (d.id === deliveryDispatch.id ? res.data : d))
      );

      // Si tiene pedido asociado, marcar pedido como ENTREGADO
      if (deliveryDispatch.pedido?.id) {
        await api.put(`/pedidos/${deliveryDispatch.pedido.id}/estado`, { estado: 'ENTREGADO' });
      }

      setDeliveryModal(false);
      setDeliveryDispatch(null);
      setConformidadText('');
      setDeliveryObs('');
      alert('¡Despacho marcado como ENTREGADO conforme!');
    } catch {
      alert('Error al registrar la conformidad de entrega.');
    } finally {
      setSubmittingDelivery(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F4F6F9] p-6 lg:p-8 space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Truck className="w-3.5 h-3.5" /> Logística y Despacho
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Control de Despachos y Guías de Remisión
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Emisión de Guías de Remisión Electrónicas (GRE), asignación de flotas, conductores y registro de actas de entrega.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setRefreshing(true);
              loadData();
            }}
            title="Recargar despachos"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setNewDispatchModal(true);
              const randomSeq = Math.floor(1000 + Math.random() * 9000);
              setGuiaRemision(`GR-${new Date().getFullYear()}-${randomSeq}`);
              handleSelectPresetTransport('propio');
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D68EC] text-white text-xs font-bold hover:bg-[#1554C2] transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Emitir Guía / Nuevo Despacho
          </button>
        </div>
      </div>

      {/* 2. KPIs Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">Guías Emitidas</span>
            <span className="text-2xl font-bold text-slate-900 mt-0.5 block">{kpis.total}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-600 block uppercase">En Ruta / Tránsito</span>
            <span className="text-2xl font-bold text-indigo-700 mt-0.5 block">{kpis.enRuta}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Truck className="w-5 h-5 animate-bounce" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600 block uppercase">Entregados Conforme</span>
            <span className="text-2xl font-bold text-emerald-700 mt-0.5 block">{kpis.entregados}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">Empresas de Carga</span>
            <span className="text-2xl font-bold text-slate-900 mt-0.5 block">{kpis.transportistas}</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Guía, Placa, Transportista o Pedido..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#1D68EC]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['ALL', 'EN_RUTA', 'ENTREGADO'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#1D68EC] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Todos los Estados' : st === 'EN_RUTA' ? 'En Ruta' : 'Entregados'}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tabla de Despachos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#1D68EC]" />
            <span className="text-xs">Cargando despachos...</span>
          </div>
        ) : filteredDispatches.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Truck className="w-12 h-12 mx-auto text-slate-200 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No se encontraron registros de despacho</p>
            <p className="text-xs text-slate-400 mt-1">
              Haz clic en "Emitir Guía / Nuevo Despacho" para asignar transporte a una orden preparada.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Guía Remisión</th>
                  <th className="py-3 px-4">Pedido / Cliente</th>
                  <th className="py-3 px-4">Transportista & Placa</th>
                  <th className="py-3 px-4">Conductor</th>
                  <th className="py-3 px-4">Fecha Salida</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDispatches.map((d) => {
                  const isDelivered = d.estado === 'ENTREGADO';
                  const st = dispatchStatusConfig[d.estado] || dispatchStatusConfig.EN_RUTA;

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition">
                      {/* Guía */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#1D68EC]" />
                          <span>{d.guiaRemision}</span>
                        </div>
                        <span className="text-[10px] font-sans font-medium text-slate-400 block mt-0.5">
                          SUNAT GRE Remitente
                        </span>
                      </td>

                      {/* Pedido y Cliente */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1D68EC] font-mono">
                          {d.pedido?.codigoPedido || `Orden #${d.pedido?.id || 'N/A'}`}
                        </div>
                        <div className="text-[11px] text-slate-700 truncate max-w-[200px]" title={d.pedido?.cliente?.razonSocial}>
                          {d.pedido?.cliente?.razonSocial || 'Cliente General'}
                        </div>
                      </td>

                      {/* Transportista y Placa */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 truncate max-w-[180px]">
                          {d.transportistaRazonSocial || 'Transporte no especificado'}
                        </div>
                        <div className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-indigo-200">
                          {d.placaVehiculo || 'SIN PLACA'}
                        </div>
                      </td>

                      {/* Conductor */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{d.conductorNombre || 'No asignado'}</div>
                        <div className="text-[11px] text-slate-400">Lic: {d.conductorLicencia || 'N/D'}</div>
                      </td>

                      {/* Salida */}
                      <td className="py-3.5 px-4">{formatDate(d.fechaSalida)}</td>

                      {/* Estado */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${st.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                          {st.label}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedDispatch(d);
                            setViewGuiaModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" /> Ver Guía
                        </button>

                        {!isDelivered && (
                          <button
                            onClick={() => {
                              setDeliveryDispatch(d);
                              setConformidadText(
                                `Recibido conforme en ${d.pedido?.direccionEntrega || 'destino'} por supervisor a cargo.`
                              );
                              setDeliveryModal(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Entregar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Modal EMITIR GUÍA DE REMISIÓN / NUEVO DESPACHO */}
      {newDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-[#1D68EC]" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Emisión de Guía de Remisión y Despacho
                  </h3>
                  <p className="text-xs text-slate-500">
                    Asignación de unidad de transporte, conductor y autorización de salida
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNewDispatchModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="p-6 overflow-y-auto space-y-4">
              {/* Selección de Pedido */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Orden de Pedido a Despachar *
                </label>
                <select
                  required
                  value={selectedPedidoId}
                  onChange={(e) => setSelectedPedidoId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white text-slate-800 focus:outline-none focus:border-[#1D68EC]"
                >
                  <option value="">-- Selecciona una orden lista para salida --</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.codigoPedido} - {o.cliente?.razonSocial || 'Cliente'} ({formatCurrency(o.total)} | Estado: {o.estado})
                    </option>
                  ))}
                </select>
              </div>

              {/* Número de Guía y Presets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    N° Guía de Remisión Electrónica *
                  </label>
                  <input
                    type="text"
                    required
                    value={guiaRemision}
                    onChange={(e) => setGuiaRemision(e.target.value)}
                    placeholder="Ej. GR-2026-0042"
                    className="w-full text-xs font-mono font-bold rounded-lg border border-slate-200 p-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cargar Flota / Transportista Frecuente
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSelectPresetTransport('propio')}
                      className="flex-1 py-2 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 cursor-pointer"
                    >
                      Flota Propia
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectPresetTransport('transp1')}
                      className="flex-1 py-2 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 cursor-pointer"
                    >
                      Mineros del Sur
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectPresetTransport('transp2')}
                      className="flex-1 py-2 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 cursor-pointer"
                    >
                      Andina Express
                    </button>
                  </div>
                </div>
              </div>

              {/* Datos de Transporte */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Datos de la Empresa de Transporte y Unidad
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Razón Social Transportista
                    </label>
                    <input
                      type="text"
                      required
                      value={transpRazon}
                      onChange={(e) => setTranspRazon(e.target.value)}
                      placeholder="Ej. Transportes Mineros del Sur S.A.C."
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">RUC Transportista</label>
                    <input
                      type="text"
                      required
                      value={transpRuc}
                      onChange={(e) => setTranspRuc(e.target.value)}
                      placeholder="Ej. 20549182736"
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Placa del Vehículo</label>
                    <input
                      type="text"
                      required
                      value={placaVehiculo}
                      onChange={(e) => setPlacaVehiculo(e.target.value)}
                      placeholder="Ej. V7T-842"
                      className="w-full text-xs font-mono font-bold rounded-lg border border-slate-300 p-2 bg-white uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Nombre del Conductor</label>
                    <input
                      type="text"
                      required
                      value={conductorNombre}
                      onChange={(e) => setConductorNombre(e.target.value)}
                      placeholder="Ej. Juan Carlos Quispe"
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Licencia de Conducir</label>
                    <input
                      type="text"
                      required
                      value={conductorLicencia}
                      onChange={(e) => setConductorLicencia(e.target.value)}
                      placeholder="Ej. Q45129834"
                      className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Precintos y Observaciones de Seguridad
                </label>
                <textarea
                  rows={2}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej. Precinto de seguridad #008427 verificado antes del sellado del furgón."
                  className="w-full text-xs rounded-lg border border-slate-200 p-2"
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewDispatchModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingDispatch}
                  className="px-5 py-2.5 rounded-lg bg-[#1D68EC] hover:bg-[#1554C2] text-white text-xs font-bold shadow-md shadow-[#1D68EC]/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {creatingDispatch ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Emitiendo Guía...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Emitir Guía y Autorizar Salida
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal VER GUÍA DE REMISIÓN ELECTRÓNICA (SUNAT Style) */}
      {viewGuiaModal && selectedDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Guía */}
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold tracking-wider text-blue-300 uppercase">
                  NexusLogix Perú S.A.C. · RUC: 20608765432
                </div>
                <h3 className="text-xl font-bold mt-1">GUÍA DE REMISIÓN ELECTRÓNICA - REMITENTE</h3>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  NÚMERO DE GUÍA: {selectedDispatch.guiaRemision}
                </p>
              </div>
              <button
                onClick={() => setViewGuiaModal(false)}
                className="text-white/60 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuerpo Guía */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Bloque 1: Datos del Destinatario y Pedido */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">Destinatario / Empresa:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedDispatch.pedido?.cliente?.razonSocial || 'Cliente General'}
                  </span>
                  <span className="text-slate-500 block font-mono">
                    RUC: {selectedDispatch.pedido?.cliente?.ruc || '20XXXXXXXXX'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Orden de Pedido Vinculada:</span>
                  <span className="font-mono font-bold text-[#1D68EC] text-sm">
                    {selectedDispatch.pedido?.codigoPedido}
                  </span>
                  <span className="text-slate-500 block">
                    Monto Declarado: {formatCurrency(selectedDispatch.pedido?.total)}
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block font-medium">Punto de Llegada (Obra / Almacén):</span>
                  <span className="font-semibold text-slate-800">
                    {selectedDispatch.pedido?.direccionEntrega || 'Almacén Central'}
                  </span>
                </div>
              </div>

              {/* Bloque 2: Datos del Transporte */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">Empresa Transportista:</span>
                  <span className="font-bold text-slate-800">{selectedDispatch.transportistaRazonSocial}</span>
                  <span className="text-slate-500 block font-mono">RUC: {selectedDispatch.transportistaRuc}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Placa del Vehículo / Unidad:</span>
                  <span className="font-mono font-bold text-sm text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-md inline-block">
                    {selectedDispatch.placaVehiculo}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Conductor Autorizado:</span>
                  <span className="font-semibold text-slate-800">{selectedDispatch.conductorNombre}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Licencia de Conducir:</span>
                  <span className="font-mono font-medium text-slate-800">{selectedDispatch.conductorLicencia}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Fecha y Hora de Salida:</span>
                  <span className="font-medium text-slate-800">{formatDate(selectedDispatch.fechaSalida)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Estado de Despacho:</span>
                  <div className="mt-0.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        dispatchStatusConfig[selectedDispatch.estado]?.bg || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {dispatchStatusConfig[selectedDispatch.estado]?.label || selectedDispatch.estado}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bloque 3: Conformidad y QR */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/60 border border-blue-200 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-blue-900 font-bold">
                    <ShieldCheck className="w-4 h-4 text-[#1D68EC]" /> Validación Digital SUNAT / NexusLogix
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Guía firmada digitalmente con precinto de custodia. Código de verificación:{' '}
                    <span className="font-mono font-semibold">
                      {selectedDispatch.codigoQr || 'NEXUS-VALID-2026'}
                    </span>
                  </p>
                  {selectedDispatch.conformidadRecepcion && (
                    <div className="pt-2 text-emerald-800 font-medium">
                      ✓ Conformidad de Recepción: "{selectedDispatch.conformidadRecepcion}"
                    </div>
                  )}
                </div>
                <div className="w-16 h-16 rounded-lg bg-white border border-blue-200 p-1 flex items-center justify-center shrink-0">
                  <QrCode className="w-12 h-12 text-slate-800" />
                </div>
              </div>
            </div>

            {/* Footer Guía */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-mono">
                Documento de Traslado Oficial - NexusLogix WMS
              </span>
              <button
                onClick={() => setViewGuiaModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal REGISTRAR ENTREGA / CONFORMIDAD */}
      {deliveryModal && deliveryDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Acta de Conformidad de Entrega</h3>
                  <p className="text-xs text-slate-500">
                    Guía: <span className="font-mono font-bold text-slate-800">{deliveryDispatch.guiaRemision}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeliveryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDelivery} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Declaración de Recepción Conforme *
                </label>
                <textarea
                  required
                  rows={3}
                  value={conformidadText}
                  onChange={(e) => setConformidadText(e.target.value)}
                  placeholder="Ej. Recibido conforme en almacén de Mina Cuajone por Ing. Roberto Alarcón con guía firmada."
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observaciones de Descarga / Estado de Bultos
                </label>
                <textarea
                  rows={2}
                  value={deliveryObs}
                  onChange={(e) => setDeliveryObs(e.target.value)}
                  placeholder="Ej. Descarga realizada sin daños en embalaje. Precinto intacto."
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-[11px] leading-relaxed">
                  Al confirmar, el despacho y la orden vinculada quedarán marcados automáticamente como <strong>ENTREGADO</strong> en el sistema.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeliveryModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingDelivery}
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingDelivery ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Registrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Confirmar Entrega
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
