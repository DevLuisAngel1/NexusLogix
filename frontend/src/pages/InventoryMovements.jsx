import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ClipboardList, RefreshCw, Search } from 'lucide-react';
import api from '../api/axios';

const emptyFilters = { fechaDesde: '', fechaHasta: '', productoId: '', usuarioId: '', tipoMovimiento: '' };
const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100';

function errorMessage(error) {
  return error.response?.data?.message || error.response?.data?.mensaje || 'No se pudo completar la operación. Intenta nuevamente.';
}

export default function InventoryMovements() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [responsibles, setResponsibles] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kind, setKind] = useState('INGRESO');
  const [form, setForm] = useState({ productoId: '', cantidad: '', motivo: '', referenciaDocumento: '' });
  const [notice, setNotice] = useState(null);

  const loadProducts = useCallback(async () => {
    const response = await api.get('/productos/activos');
    setProducts(Array.isArray(response.data) ? response.data : []);
  }, []);

  const loadMovements = useCallback(async (activeFilters = filters) => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(activeFilters).filter(([, value]) => value !== ''));
      const { data } = await api.get('/inventario/kardex', { params });
      const rows = Array.isArray(data) ? data : [];
      setMovements(rows);
      setResponsibles((previous) => {
        const all = new Map(previous.map((item) => [item.usuarioId, item.responsable]));
        rows.forEach((item) => all.set(item.usuarioId, item.responsable));
        return [...all].map(([usuarioId, responsable]) => ({ usuarioId, responsable }));
      });
    } catch (error) {
      setNotice({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProducts().catch((error) => setNotice({ type: 'error', text: errorMessage(error) }));
    loadMovements(emptyFilters);
  }, []);

  const selectedProduct = useMemo(() => products.find((product) => String(product.id) === String(form.productoId)), [products, form.productoId]);

  const submitMovement = async (event) => {
    event.preventDefault();
    const quantity = Number(form.cantidad);
    if (!selectedProduct) return setNotice({ type: 'error', text: 'Selecciona un producto válido.' });
    if (!Number.isInteger(quantity) || quantity <= 0) return setNotice({ type: 'error', text: 'La cantidad debe ser un entero positivo.' });
    if (kind === 'SALIDA' && quantity > Number(selectedProduct.stockActual || 0)) return setNotice({ type: 'error', text: 'La cantidad supera el stock disponible.' });

    setSubmitting(true);
    setNotice(null);
    try {
      await api.post('/inventario/movimientos', {
        productoId: Number(form.productoId), tipoMovimiento: kind, cantidad: quantity,
        motivo: form.motivo.trim() || null, referenciaDocumento: form.referenciaDocumento.trim() || null,
      });
      setForm({ productoId: '', cantidad: '', motivo: '', referenciaDocumento: '' });
      await Promise.all([loadProducts(), loadMovements()]);
      setNotice({ type: 'success', text: `${kind === 'INGRESO' ? 'Entrada' : 'Salida'} registrada. El stock y el Kardex se actualizaron.` });
    } catch (error) {
      setNotice({ type: 'error', text: errorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Almacén</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Movimientos de inventario</h1><p className="mt-1 text-sm text-slate-500">Registra entradas y salidas, y consulta el historial Kardex.</p></div>
        <button onClick={() => { loadProducts(); loadMovements(); }} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"><RefreshCw className="h-4 w-4" />Actualizar</button>
      </header>

      {notice && <div role="status" className={`rounded-lg border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>{notice.text}</div>}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <form onSubmit={submitMovement} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="font-bold text-slate-800">Registrar movimiento</h2><p className="mt-1 text-xs text-slate-500">El cambio de stock se aplica en el servidor.</p></div><ClipboardList className="h-5 w-5 text-blue-600" /></div>
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            {['INGRESO', 'SALIDA'].map((item) => <button type="button" key={item} onClick={() => setKind(item)} className={`rounded-md px-3 py-2 text-sm font-semibold ${kind === item ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>{item === 'INGRESO' ? 'Entrada' : 'Salida'}</button>)}
          </div>
          <div className="space-y-4">
            <label className="block space-y-1.5 text-xs font-semibold text-slate-600">Producto<select required className={inputClass} value={form.productoId} onChange={(event) => setForm({ ...form, productoId: event.target.value })}><option value="">Seleccionar producto</option>{products.map((product) => <option key={product.id} value={product.id}>{product.codigoSku} · {product.nombre}</option>)}</select></label>
            {selectedProduct && <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2.5 text-sm"><span className="text-slate-600">Stock disponible</span><strong className="text-blue-800">{selectedProduct.stockActual ?? 0} {selectedProduct.unidadMedida || 'unidades'}</strong></div>}
            <label className="block space-y-1.5 text-xs font-semibold text-slate-600">Cantidad<input required type="number" min="1" step="1" inputMode="numeric" className={inputClass} value={form.cantidad} onChange={(event) => setForm({ ...form, cantidad: event.target.value })} placeholder="Ej. 12" /></label>
            <label className="block space-y-1.5 text-xs font-semibold text-slate-600">Referencia (opcional)<input maxLength="50" className={inputClass} value={form.referenciaDocumento} onChange={(event) => setForm({ ...form, referenciaDocumento: event.target.value })} placeholder="Orden o documento" /></label>
            <label className="block space-y-1.5 text-xs font-semibold text-slate-600">Observación (opcional)<textarea maxLength="200" rows="2" className={inputClass} value={form.motivo} onChange={(event) => setForm({ ...form, motivo: event.target.value })} placeholder="Motivo del movimiento" /></label>
            <button disabled={submitting || products.length === 0} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{kind === 'INGRESO' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}{submitting ? 'Registrando…' : `Registrar ${kind === 'INGRESO' ? 'entrada' : 'salida'}`}</button>
          </div>
        </form>

        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4"><h2 className="font-bold text-slate-800">Filtros del Kardex</h2><p className="mt-1 text-xs text-slate-500">Consulta movimientos por fecha, producto, responsable o tipo.</p></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-semibold text-slate-600">Desde<input type="date" className={inputClass} value={filters.fechaDesde} onChange={(event) => updateFilter('fechaDesde', event.target.value)} /></label>
            <label className="space-y-1 text-xs font-semibold text-slate-600">Hasta<input type="date" className={inputClass} value={filters.fechaHasta} onChange={(event) => updateFilter('fechaHasta', event.target.value)} /></label>
            <label className="space-y-1 text-xs font-semibold text-slate-600">Producto<select className={inputClass} value={filters.productoId} onChange={(event) => updateFilter('productoId', event.target.value)}><option value="">Todos</option>{products.map((product) => <option key={product.id} value={product.id}>{product.codigoSku} · {product.nombre}</option>)}</select></label>
            <label className="space-y-1 text-xs font-semibold text-slate-600">Responsable<select className={inputClass} value={filters.usuarioId} onChange={(event) => updateFilter('usuarioId', event.target.value)}><option value="">Todos</option>{responsibles.map((item) => <option key={item.usuarioId} value={item.usuarioId}>{item.responsable}</option>)}</select></label>
            <label className="space-y-1 text-xs font-semibold text-slate-600 sm:col-span-2">Tipo de movimiento<select className={inputClass} value={filters.tipoMovimiento} onChange={(event) => updateFilter('tipoMovimiento', event.target.value)}><option value="">Todos</option><option value="INGRESO">Entrada</option><option value="SALIDA">Salida</option><option value="AJUSTE">Ajuste</option></select></label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => loadMovements()} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"><Search className="h-4 w-4" />Aplicar filtros</button><button onClick={() => { setFilters(emptyFilters); loadMovements(emptyFilters); }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Limpiar</button></div>
        </section>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-slate-800">Historial de movimientos</h2><p className="mt-0.5 text-xs text-slate-500">{movements.length} registros · más recientes primero</p></div><ClipboardList className="h-5 w-5 text-slate-400" /></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Fecha y hora</th><th className="px-4 py-3">Producto</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3 text-right">Cantidad</th><th className="px-4 py-3">Responsable</th><th className="px-4 py-3">Observación</th></tr></thead><tbody className="divide-y divide-slate-100">
          {loading ? <tr><td colSpan="6" className="px-4 py-12 text-center text-slate-500">Cargando movimientos…</td></tr> : movements.length === 0 ? <tr><td colSpan="6" className="px-4 py-12 text-center text-slate-500">No hay movimientos que coincidan con los filtros.</td></tr> : movements.map((movement) => <tr key={movement.id} className="hover:bg-slate-50/70"><td className="whitespace-nowrap px-4 py-3 text-slate-600">{movement.fecha ? new Date(movement.fecha).toLocaleString('es-PE') : '—'}</td><td className="px-4 py-3"><span className="font-medium text-slate-800">{movement.productoNombre}</span><span className="block font-mono text-xs text-slate-400">{movement.codigoSku}</span></td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${movement.tipoMovimiento === 'INGRESO' ? 'bg-emerald-50 text-emerald-700' : movement.tipoMovimiento === 'SALIDA' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{movement.tipoMovimiento === 'INGRESO' ? 'Entrada' : movement.tipoMovimiento === 'SALIDA' ? 'Salida' : 'Ajuste'}</span></td><td className="px-4 py-3 text-right font-semibold text-slate-800">{movement.cantidad}</td><td className="px-4 py-3 text-slate-600">{movement.responsable}</td><td className="max-w-52 truncate px-4 py-3 text-slate-500" title={movement.motivo || ''}>{movement.motivo || '—'}</td></tr>)}
        </tbody></table></div>
      </section>
    </div>
  );
}
