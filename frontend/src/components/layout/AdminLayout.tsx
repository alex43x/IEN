import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Store,
  Package,
  QrCode,
  Mail,
  Shield,
  LogOut,
  Menu,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ThemeToggle } from "../ui/ThemeToggle";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard, roles: ['admin_general', 'admin_negocio'] as string[] },
  { label: "Pacientes", path: "/admin/pacientes", icon: Users, roles: ['admin_general', 'admin_negocio'] as string[] },
  { label: "Reportes", path: "/admin/reportes", icon: BarChart3, roles: ['admin_general', 'admin_negocio'] as string[] },
  { label: "Sucursales", path: "/admin/sucursales", icon: Store, roles: ['admin_general', 'admin_negocio'] as string[] },
  { label: "Productos", path: "/admin/productos", icon: Package, roles: ['admin_general', 'admin_negocio', 'moderador_tienda'] as string[] },
  { label: "Códigos", path: "/admin/codigos", icon: QrCode, roles: ['admin_general', 'admin_negocio', 'moderador_tienda'] as string[] },
  { label: "Plantillas", path: "/admin/plantillas", icon: Mail, roles: ['admin_general'] as string[] },
  { label: "Usuarios", path: "/admin/usuarios", icon: Shield, roles: ['admin_general', 'admin_negocio'] as string[] },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex h-screen overflow-hidden">
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
              <img src="/imports/logo_ien-03.png" alt="IEN" className="h-8 w-auto" />
              <span className="text-sm font-semibold text-foreground">Admin</span>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {NAV_ITEMS.filter((item) => item.roles.includes(user?.rol || "")).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${active ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                  >
                    <Icon size={18} className={active ? "text-accent" : ""} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="p-3 border-t border-border">
              <div className="flex items-center justify-between rounded-xl bg-secondary p-3 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{user?.nombre}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {user?.rol === 'admin_general' ? 'Admin General' : user?.rol === 'admin_negocio' ? 'Admin de Negocio' : 'Moderador de Tienda'}
                  </p>
                </div>
                <ThemeToggle />
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <LogOut size={18} />
                Cerrar sesión
              </button>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-card border-b border-border px-4 lg:px-6 h-16 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground">
                <Menu size={20} />
              </button>
              <div>
                <p className="text-sm font-semibold text-foreground">Panel de administración</p>
                <p className="text-xs text-muted-foreground">Monitorea usuarios, respuestas y evaluaciones</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-accent bg-accent/10 border border-accent/20">
                <span className="w-2.5 h-2.5 rounded-full bg-accent" /> Admin activo
              </div>
              <button onClick={handleLogout} title="Cerrar sesión" className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
                <LogOut size={14} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
