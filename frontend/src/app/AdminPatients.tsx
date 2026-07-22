import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react";
import { adminService } from "../services/admin.service";
import type { PaginacionPacientes } from "../types/api.types";
import { C, GRAY } from "../constants/colors";

export default function AdminPatients() {
  const navigate = useNavigate();
  const [data, setData] = useState<PaginacionPacientes | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const result = await adminService.listarPacientes(page, limit);
        setData(result);
      } catch (err) {
        console.error("Error fetching patients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [page]);

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  const statusColor = (plan: { estado: string; en_riesgo?: boolean } | null) => {
    if (plan?.estado === "activo" && plan.en_riesgo) return { bg: C.red.bg, text: C.red.text, label: "En riesgo" };
    if (plan?.estado === "activo") return { bg: C.green.bg, text: C.green.text, label: "Activo" };
    if (plan?.estado === "completado") return { bg: C.yellow.bg, text: C.yellow.text, label: "Completado" };
    if (plan?.estado === "abandonado") return { bg: GRAY.light, text: GRAY.base, label: "Abandonado" };
    return { bg: C.red.bg, text: C.red.text, label: "Sin plan" };
  };

  const filtered = data?.pacientes.filter((p) =>
    search ? p.nombre.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase()) : true
  );

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
          <h1 className="font-['Lora'] text-2xl font-semibold text-foreground mt-1">Pacientes</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users size={16} />
          <span>{data?.total || 0} registrados</span>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-border bg-card pl-10 pr-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
        />
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-foreground">
            <thead>
              <tr className="border-b border-border bg-background text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Nombre</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Sucursal</th>
                <th className="py-3 px-4">Registro</th>
                <th className="py-3 px-4">Día</th>
                <th className="py-3 px-4">Racha</th>
                <th className="py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered?.map((p) => {
                const sc = statusColor(p.plan);
                return (
                  <tr
                    key={p.id}
                    className="cursor-pointer hover:bg-background transition-colors"
                    onClick={() => navigate(`/admin/pacientes/${p.id}`)}
                  >
                    <td className="py-4 px-4 font-medium">{p.nombre}</td>
                    <td className="py-4 px-4 text-muted-foreground">{p.email}</td>
                    <td className="py-4 px-4 text-muted-foreground">{p.tienda?.nombre || "-"}</td>
                    <td className="py-4 px-4 text-muted-foreground">{new Date(p.fecha_registro).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-muted-foreground">{p.plan?.dia_actual || "-"}</td>
                    <td className="py-4 px-4 text-muted-foreground">{p.plan?.racha_dias || "-"}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold" style={{ backgroundColor: sc.bg, color: sc.text }}>
                        {sc.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {(!filtered || filtered.length === 0) && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No se encontraron pacientes</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const start = Math.max(1, page - 2);
            const p = start + i;
            if (p > totalPages) return null;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-xl text-sm font-medium ${p === page ? "bg-accent text-background" : "text-muted-foreground hover:bg-secondary"}`}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
