import { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  PowerOff,
  RotateCcw,
  Store,
  MapPin,
} from "lucide-react";
import { adminService } from "../services/admin.service";
import type { Sucursal } from "../types/api.types";
import { useAuth } from "../context/AuthContext";

export default function AdminStores() {
  const { user } = useAuth();
  const isGeneral = user?.rol === 'admin_general';
  const isNegocio = user?.rol === 'admin_negocio';
  const canManage = isGeneral || isNegocio;
  const [stores, setStores] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Sucursal | null>(null);
  const [form, setForm] = useState({ nombre_tienda: "", ciudad: "" });

  const fetchStores = async () => {
    try {
      const data = await adminService.listarSucursales(true);
      setStores(data);
    } catch (err) {
      console.error("Error fetching stores", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStores(); }, []);

  const handleSave = async () => {
    try {
      if (editing) {
        await adminService.actualizarSucursal(editing._id, form);
      } else {
        await adminService.crearSucursal(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ nombre_tienda: "", ciudad: "" });
      await fetchStores();
    } catch (err) {
      console.error("Error saving store", err);
    }
  };

  const handleEdit = (store: Sucursal) => {
    setEditing(store);
    setForm({ nombre_tienda: store.nombre_tienda, ciudad: store.ciudad });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Desactivar esta sucursal?")) return;
    try {
      await adminService.eliminarSucursal(id);
      await fetchStores();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error al desactivar la sucursal");
    }
  };

  const handleReactivar = async (id: string) => {
    try {
      await adminService.reactivarSucursal(id);
      await fetchStores();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error al reactivar la sucursal");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre_tienda: "", ciudad: "" });
    setShowForm(true);
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
          <h1 className="font-['Lora'] text-2xl font-semibold text-foreground mt-1">Sucursales</h1>
          <p className="text-sm text-muted-foreground mt-1">{stores.length} sucursales registradas</p>
        </div>
        {isGeneral && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background hover:opacity-90 transition-all"
          >
            <Plus size={16} />
            Nueva sucursal
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-3xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-['Lora'] text-lg font-semibold text-foreground mb-4">{editing ? "Editar sucursal" : "Nueva sucursal"}</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">Nombre</label>
                <input
                  type="text"
                  value={form.nombre_tienda}
                  onChange={(e) => setForm({ ...form, nombre_tienda: e.target.value })}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                  placeholder="Nombre de la sucursal"
                />
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">Ciudad</label>
                <input
                  type="text"
                  value={form.ciudad}
                  onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                  placeholder="Ciudad"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-secondary transition-all">Cancelar</button>
                <button onClick={handleSave} disabled={!form.nombre_tienda || !form.ciudad} className="flex-1 rounded-2xl bg-foreground px-4 py-3 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50 transition-all">
                  {editing ? "Guardar cambios" : "Crear sucursal"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((store) => (
          <div key={store._id} className="bg-card rounded-3xl border border-border p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-accent/10 text-accent">
                <Store size={20} />
              </div>
              <div className="flex items-center gap-1">
                {canManage && (
                  <button onClick={() => handleEdit(store)} className="p-2 rounded-xl text-muted-foreground hover:bg-secondary transition-all">
                    <Edit3 size={14} />
                  </button>
                )}
                {canManage && store.activo && (
                  <button onClick={() => handleDelete(store._id)} className="p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
                    <PowerOff size={14} />
                  </button>
                )}
                {canManage && !store.activo && (
                  <button onClick={() => handleReactivar(store._id)} className="p-2 rounded-xl text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500 transition-all">
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>
            </div>
            <span className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${store.activo ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${store.activo ? 'bg-emerald-500' : 'bg-destructive'}`} />
              {store.activo ? 'Activa' : 'Inactiva'}
            </span>
            <h3 className="mt-4 font-semibold text-foreground">{store.nombre_tienda}</h3>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={14} />
              {store.ciudad}
            </div>
          </div>
        ))}
        {stores.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
            No hay sucursales registradas
          </div>
        )}
      </div>
    </div>
  );
}
