import { useState, useEffect } from "react";
import { Plus, Power, PowerOff, QrCode, KeyRound } from "lucide-react";
import { adminService } from "../services/admin.service";
import type { CodigoActivacion, Sucursal, ProductoAdmin } from "../types/api.types";
import CodeInput from "../components/CodeInput";

export default function AdminCodes() {
  const [codes, setCodes] = useState<CodigoActivacion[]>([]);
  const [stores, setStores] = useState<Sucursal[]>([]);
  const [products, setProducts] = useState<ProductoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ codigo: "", producto_id: "", tienda_id: "" });

  const fetchData = async () => {
    try {
      const [c, s, p] = await Promise.allSettled([
        adminService.listarCodigos(),
        adminService.listarSucursales(),
        adminService.listarProductos(),
      ]);
      setCodes(c.status === "fulfilled" ? c.value : []);
      setStores(s.status === "fulfilled" ? s.value : []);
      setProducts(p.status === "fulfilled" ? p.value : []);
    } catch (err) {
      console.error("Error fetching codes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    try {
      await adminService.crearCodigo(form);
      setShowForm(false);
      setForm({ codigo: "", producto_id: "", tienda_id: "" });
      await fetchData();
    } catch (err) {
      console.error("Error creating code", err);
    }
  };

  const toggleCode = async (code: CodigoActivacion) => {
    try {
      if (code.activo) {
        await adminService.desactivarCodigo(code._id);
      } else {
        await adminService.activarCodigo(code._id);
      }
      await fetchData();
    } catch (err) {
      console.error("Error toggling code", err);
    }
  };

  const getTiendaNombre = (code: CodigoActivacion) => {
    const t = code.tienda_id;
    return typeof t === "object" && t !== null ? t.nombre_tienda : "—";
  };

  const getProductoNombre = (code: CodigoActivacion) => {
    const p = code.producto_id;
    return typeof p === "object" && p !== null ? p.nombre : "—";
  };

  const activos = codes.filter((c) => c.activo).length;

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
          <h1 className="font-['Lora'] text-2xl font-semibold text-foreground mt-1">Códigos de activación</h1>
          <p className="text-sm text-muted-foreground mt-1">{codes.length} códigos · {activos} activos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background hover:opacity-90 transition-all"
        >
          <Plus size={16} />
          Nuevo código
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-3xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-['Lora'] text-lg font-semibold text-foreground mb-4">Nuevo código de activación</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">Código</label>
                <CodeInput
                  onChange={(v) => setForm({ ...form, codigo: v })}
                />
                <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="font-mono font-bold">ABC</span> letras</span>
                  <span className="text-border">-</span>
                  <span className="flex items-center gap-1"><span className="font-mono font-bold">123</span> números</span>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">Sucursal</label>
                <select
                  value={form.tienda_id}
                  onChange={(e) => setForm({ ...form, tienda_id: e.target.value, producto_id: "" })}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                >
                  <option value="">Seleccionar sucursal</option>
                  {stores.map((s) => (
                    <option key={s._id} value={s._id}>{s.nombre_tienda}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">Producto</label>
                <select
                  value={form.producto_id}
                  onChange={(e) => setForm({ ...form, producto_id: e.target.value })}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                >
                  <option value="">Seleccionar producto</option>
                  {products.filter(p => {
                    const tid = typeof p.tienda_id === "string" ? p.tienda_id : p.tienda_id?._id;
                    return tid === form.tienda_id;
                  }).map((p) => (
                    <option key={p._id} value={p._id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-secondary transition-all">
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.codigo || !form.tienda_id || !form.producto_id || !/^[A-Z]{3}-\d{3}$/.test(form.codigo)}
                  className="flex-1 rounded-2xl bg-foreground px-4 py-3 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  Crear código
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {codes.map((code) => {
          const activo = code.activo;
          return (
            <div key={code._id} className="bg-card rounded-3xl border border-border p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: activo ? "var(--accent)/0.1" : "var(--destructive)/0.1", color: activo ? "var(--accent)" : "var(--destructive)" }}>
                  {activo ? <KeyRound size={20} /> : <QrCode size={20} />}
                </div>
                <button
                  onClick={() => toggleCode(code)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all ${activo ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-accent/10 text-accent hover:bg-accent/20"}`}
                >
                  {activo ? <PowerOff size={12} /> : <Power size={12} />}
                  {activo ? "Desactivar" : "Activar"}
                </button>
              </div>
              <p className="mt-4 font-mono font-semibold text-foreground">{code.codigo}</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span>{getTiendaNombre(code)}</span>
                <span className="text-border">·</span>
                <span>{getProductoNombre(code)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${activo ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
                  {activo ? "Activo" : "Inactivo"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(code.fecha_creacion).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
        {codes.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
            No hay códigos registrados
          </div>
        )}
      </div>
    </div>
  );
}
