import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, Package, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import api from '../api/axios';

const emptyForm = {
  codigoSku: '', nombre: '', descripcion: '', unidadMedida: 'unidad',
  precioUnitario: '', stockActual: '0', stockMinimo: '0', ubicacionPasillo: '', pesokg: '0', categoriaId: '',
};

const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#1D68EC] focus:ring-2 focus:ring-[#1D68EC]/15';

function apiMessage(error) {
  if (!error.response) return 'No se pudo conectar con el servidor. Comprueba que el backend esté disponible.';
  if (error.response.status === 400) return 'Los datos no son válidos o el SKU ya está registrado.';
  if (error.response.status === 404) return 'El producto o la categoría ya no están disponibles. Actualiza el catálogo.';
  return error.response.data?.message || 'Ocurrió un error al procesar la solicitud. Inténtalo de nuevo.';
}

export default function ProductsPlaceholder() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadCatalog = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) setLoading(true);
    try {
      const [productResponse, categoryResponse] = await Promise.all([
        api.get('/productos/activos'),
        api.get('/categorias/activas'),
      ]);
      setLoadError('');
      setProducts(Array.isArray(productResponse.data) ? productResponse.data : []);
      setCategories(Array.isArray(categoryResponse.data) ? categoryResponse.data : []);
    } catch (error) {
      setLoadError(apiMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCatalog({ showLoading: false }); }, [loadCatalog]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return products;
    return products.filter((product) => [product.codigoSku, product.nombre, product.categoria?.nombre]
      .some((value) => String(value || '').toLocaleLowerCase().includes(query)));
  }, [products, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, categoriaId: categories[0]?.id ? String(categories[0].id) : '' });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      codigoSku: product.codigoSku || '', nombre: product.nombre || '', descripcion: product.descripcion || '',
      unidadMedida: product.unidadMedida || '', precioUnitario: String(product.precioUnitario ?? ''),
      stockActual: String(product.stockActual ?? 0), stockMinimo: String(product.stockMinimo ?? 0),
      ubicacionPasillo: product.ubicacionPasillo || '', pesokg: String(product.pesokg ?? 0),
      categoriaId: product.categoria?.id ? String(product.categoria.id) : '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setFormError('');
    const precio = Number(form.precioUnitario);
    const stock = Number(form.stockActual);
    const stockMinimo = Number(form.stockMinimo);
    const peso = Number(form.pesokg);
    if (!form.codigoSku.trim() || !form.nombre.trim() || !form.unidadMedida.trim() || !form.categoriaId) {
      setFormError('Completa el SKU, nombre, unidad de medida y categoría.'); return;
    }
    if (!Number.isFinite(precio) || precio < 0 || !Number.isInteger(stock) || stock < 0 || !Number.isInteger(stockMinimo) || stockMinimo < 0 || !Number.isFinite(peso) || peso < 0) {
      setFormError('Precio, stock mínimo y peso deben ser valores válidos no negativos; el stock debe ser un entero.'); return;
    }
    const payload = {
      codigoSku: form.codigoSku.trim(), nombre: form.nombre.trim(), descripcion: form.descripcion.trim(),
      unidadMedida: form.unidadMedida.trim(), precioUnitario: precio,
      ...(editing ? {} : { stockActual: stock }),
      stockMinimo, ubicacionPasillo: form.ubicacionPasillo.trim(), pesokg: peso,
      categoria: { id: Number(form.categoriaId) },
    };
    setSaving(true);
    try {
      if (editing) await api.put(`/productos/${editing.id}`, payload);
      else await api.post('/productos', payload);
      setModalOpen(false);
      setNotice(editing ? 'Producto actualizado correctamente.' : 'Producto registrado correctamente.');
      await loadCatalog();
    } catch (error) {
      setFormError(apiMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.delete(`/productos/${deleting.id}`);
      setNotice('Producto descontinuado correctamente.');
      setDeleting(null);
      await loadCatalog();
    } catch (error) {
      setDeleteError(apiMessage(error));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-slate-500">Catálogo</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Productos</h1>
          <p className="mt-1 text-sm text-slate-500">Consulta y administra los productos del almacén.</p>
        </div>
        <button onClick={openCreate} disabled={!categories.length} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1D68EC] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1555C0] disabled:cursor-not-allowed disabled:opacity-50">
          <Plus className="h-4 w-4" /> Registrar producto
        </button>
      </div>

      {notice && <div role="status" className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Cerrar aviso"><X className="h-4 w-4" /></button></div>}
      {loadError && <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{loadError}</span><button onClick={loadCatalog} className="inline-flex shrink-0 items-center gap-1 font-semibold"><RefreshCw className="h-3.5 w-3.5" /> Reintentar</button></div>}
      {!loading && !loadError && categories.length === 0 && <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">No hay categorías activas disponibles para registrar productos.</div>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-semibold text-slate-800">Catálogo de productos</h2><p className="mt-0.5 text-xs text-slate-500">{products.length} productos registrados</p></div>
          <label className="relative block w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar SKU, nombre o categoría" className={`${inputClass} pl-9`} /></label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">SKU</th><th className="px-5 py-3 font-semibold">Producto</th><th className="px-5 py-3 font-semibold">Categoría</th><th className="px-5 py-3 text-right font-semibold">Precio</th><th className="px-5 py-3 text-right font-semibold">Stock actual</th><th className="px-5 py-3 text-right font-semibold">Acciones</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <tr><td colSpan="6" className="px-5 py-14 text-center text-slate-500"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Cargando catálogo…</td></tr>
                : loadError ? <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-500">No se pudo cargar el catálogo.</td></tr>
                  : visibleProducts.length === 0 ? <tr><td colSpan="6" className="px-5 py-14 text-center text-slate-500"><Package className="mx-auto mb-2 h-6 w-6 text-slate-300" />{products.length ? 'No hay productos que coincidan con la búsqueda.' : 'Todavía no hay productos registrados.'}</td></tr>
                    : visibleProducts.map((product) => <tr key={product.id} className="hover:bg-slate-50/70"><td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-semibold text-slate-600">{product.codigoSku}</td><td className="px-5 py-4"><span className="font-medium text-slate-800">{product.nombre}</span>{product.unidadMedida && <span className="mt-0.5 block text-xs text-slate-400">Por {product.unidadMedida}</span>}</td><td className="px-5 py-4 text-slate-600">{product.categoria?.nombre || '—'}</td><td className="whitespace-nowrap px-5 py-4 text-right font-medium text-slate-700">S/ {Number(product.precioUnitario || 0).toFixed(2)}</td><td className="px-5 py-4 text-right"><span className={`inline-flex min-w-10 justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${(product.stockActual ?? 0) <= (product.stockMinimo ?? 0) ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{product.stockActual ?? 0}</span></td><td className="px-5 py-4 text-right"><div className="inline-flex items-center gap-1"><button onClick={() => openEdit(product)} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-[#1D68EC] hover:bg-blue-50"><Pencil className="h-3.5 w-3.5" />Editar</button><button onClick={() => { setDeleting(product); setDeleteError(''); }} aria-label={`Descontinuar ${product.nombre}`} title="Descontinuar producto" className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setModalOpen(false); }}>
        <div role="dialog" aria-modal="true" aria-labelledby="product-modal-title" className="my-auto w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4"><div><h2 id="product-modal-title" className="font-bold text-slate-900">{editing ? 'Editar producto' : 'Registrar producto'}</h2><p className="mt-0.5 text-xs text-slate-500">Los campos marcados con * son obligatorios.</p></div><button disabled={saving} onClick={() => setModalOpen(false)} aria-label="Cerrar" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button></div>
          <form onSubmit={submit} className="space-y-4 p-6">
            {formError && <div role="alert" className="flex gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{formError}</div>}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs font-semibold text-slate-600">SKU *<input required maxLength="50" value={form.codigoSku} onChange={(e) => setForm({ ...form, codigoSku: e.target.value })} className={inputClass} placeholder="Ej. MIN-001" /></label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-600">Nombre *<input required maxLength="150" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputClass} placeholder="Nombre del producto" /></label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-600">Categoría *<select required value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })} className={inputClass}><option value="">Seleccionar categoría</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.nombre}</option>)}</select></label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-600">Unidad de medida *<input required maxLength="30" value={form.unidadMedida} onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })} className={inputClass} placeholder="unidad, kg, caja…" /></label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-600">Precio unitario (S/) *<input required type="number" min="0" step="0.01" value={form.precioUnitario} onChange={(e) => setForm({ ...form, precioUnitario: e.target.value })} className={inputClass} /></label>
              {editing ? <div className="space-y-1.5 text-xs font-semibold text-slate-600">Stock actual<span className={`${inputClass} block bg-slate-50 text-slate-500`}>{form.stockActual} · Gestionado desde Inventario</span></div> : <label className="space-y-1.5 text-xs font-semibold text-slate-600">Stock inicial<input required type="number" min="0" step="1" value={form.stockActual} onChange={(e) => setForm({ ...form, stockActual: e.target.value })} className={inputClass} /></label>}
              <label className="space-y-1.5 text-xs font-semibold text-slate-600">Stock mínimo<input type="number" min="0" step="1" value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })} className={inputClass} /></label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-600">Peso (kg)<input type="number" min="0" step="0.001" value={form.pesokg} onChange={(e) => setForm({ ...form, pesokg: e.target.value })} className={inputClass} /></label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-600">Ubicación de pasillo<input maxLength="50" value={form.ubicacionPasillo} onChange={(e) => setForm({ ...form, ubicacionPasillo: e.target.value })} className={inputClass} placeholder="Ej. A-03" /></label>
              <label className="space-y-1.5 text-xs font-semibold text-slate-600 sm:col-span-2">Descripción<textarea maxLength="500" rows="3" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className={`${inputClass} resize-y`} /></label>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" disabled={saving} onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancelar</button><button type="submit" disabled={saving || !categories.length} className="inline-flex items-center gap-2 rounded-lg bg-[#1D68EC] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1555C0] disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Registrar producto'}</button></div>
          </form>
        </div>
      </div>}

      {deleting && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
        <div role="alertdialog" aria-modal="true" aria-labelledby="delete-product-title" className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600"><Trash2 className="h-5 w-5" /></div>
          <h2 id="delete-product-title" className="font-bold text-slate-900">Descontinuar producto</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">¿Deseas descontinuar <strong>{deleting.nombre}</strong> ({deleting.codigoSku})? Se conservará su historial y ya no aparecerá como producto activo.</p>
          {deleteError && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{deleteError}</p>}
          <div className="mt-6 flex justify-end gap-3"><button type="button" disabled={deleteLoading} onClick={() => setDeleting(null)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancelar</button><button type="button" disabled={deleteLoading} onClick={confirmDelete} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">{deleteLoading && <Loader2 className="h-4 w-4 animate-spin" />}{deleteLoading ? 'Procesando…' : 'Descontinuar'}</button></div>
        </div>
      </div>}
    </section>
  );
}
