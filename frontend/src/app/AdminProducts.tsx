import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Package } from "lucide-react";
import { adminService } from "../services/admin.service";
import type { ProductoAdmin, Sucursal } from "../types/api.types";

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductoAdmin[]>([]);
  const [stores, setStores] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductoAdmin | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", tienda_id: "" });

  const fetchData = async () => {
    try {
      const [p, s] = await Promise.allSettled([
        adminService.listarProductos(),
        adminService.listarSucursales(),
      ]);
      setProducts(p.status === "fulfilled" ? p.value : []);
      setStores(s.status === "fulfilled" ? s.value : []);
    } catch (err) {
      console.error("Error fetching products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    try {
      if (editing) {
        await adminService.actualizarProducto(editing._id, form);
      } else {
        await adminService.crearProducto(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ nombre: "", descripcion: "", tienda_id: "" });
      await fetchData();
    } catch (err) {
      console.error("Error saving product", err);
    }
  };

  const handleEdit = (product: ProductoAdmin) => {
    const tienda = product.tienda_id
      ? (typeof product.tienda_id === "string" ? product.tienda_id : product.tienda_id._id)
      : "";
    setEditing(product);
    setForm({ nombre: product.nombre, descripcion: product.descripcion || "", tienda_id: tienda });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await adminService.eliminarProducto(id);
      await fetchData();
    } catch (err) {
      console.error("Error deleting product", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Gestión</p>
          <h1 className="font-['Lora'] text-2xl font-semibold text-foreground mt-1">Productos</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} productos registrados</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm({ nombre: "", descripcion: "", tienda_id: "" }); setShowForm(true); }}
          className="flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background hover:opacity-90 transition-all"
        >
          <Plus size={16} />
          Nuevo producto
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-3xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-['Lora'] text-lg font-semibold text-foreground mb-4">{editing ? "Editar producto" : "Nuevo producto"}</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">Nombre</label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                  placeholder="Nombre del producto" />
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">Descripción</label>
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                  placeholder="Descripción opcional" rows={3} />
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">Sucursal</label>
                <select
                  value={form.tienda_id}
                  onChange={(e) => setForm({ ...form, tienda_id: e.target.value })}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                >
                  <option value="">Seleccionar sucursal</option>
                  {stores.map((s) => (
                    <option key={s._id} value={s._id}>{s.nombre_tienda}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-secondary transition-all">Cancelar</button>
                <button onClick={handleSave} disabled={!form.nombre} className="flex-1 rounded-2xl bg-foreground px-4 py-3 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50 transition-all">
                  {editing ? "Guardar cambios" : "Crear producto"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const tiendaNombre = product.tienda_id
            ? (typeof product.tienda_id === "string" ? null : product.tienda_id.nombre_tienda)
            : null;
          return (
            <div key={product._id} className="bg-card rounded-3xl border border-border p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-primary/10 text-primary">
                  <Package size={20} />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(product)} className="p-2 rounded-xl text-muted-foreground hover:bg-secondary transition-all">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDelete(product._id)} className="p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{product.nombre}</h3>
              {product.descripcion && <p className="mt-1 text-sm text-muted-foreground">{product.descripcion}</p>}
              {tiendaNombre && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium text-muted-foreground">{tiendaNombre}</span>
                </div>
              )}
            </div>
          );
        })}
        {products.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-muted-foreground">No hay productos registrados</div>
        )}
      </div>
    </div>
  );
}
