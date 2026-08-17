import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowRight, Scan, ChevronLeft } from "lucide-react";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import CodeInput from "../components/CodeInput";

export default function Activar() {
  const navigate = useNavigate();
  const location = useLocation();
  const regData = (location.state as { nombre?: string; email?: string; password?: string }) || {};
  const [codigoActivacion, setCodigoActivacion] = useState("");

  const canContinue = codigoActivacion.length === 7 && (regData.nombre && regData.email && regData.password);

  const handleSubmit = () => {
    if (!canContinue) return;
    navigate("/horario", {
      state: {
        nombre: regData.nombre,
        email: regData.email,
        password: regData.password,
        codigo_activacion: codigoActivacion.toUpperCase(),
      },
    });
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/register")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={20} />
          </button>
          <img src="/imports/logo_ien-03.png" alt="IEN" className="h-10 w-auto" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="w-4 h-4 rounded-full bg-foreground text-background text-[9px] flex items-center justify-center font-bold">2</span>
            Activación de productos
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="max-w-lg w-full">

          <div className="mb-8">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Paso 2 de 3</p>
            <h1 className="font-['Lora'] text-2xl font-semibold text-foreground">Activa tus productos</h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Introduce el código de activación que recibiste para comenzar el programa.
            </p>
          </div>

          {/* Activation code */}
          <div className="bg-card rounded-2xl border border-border p-5 mb-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
                <Scan size={15} className="text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Código de activación</p>
            </div>
            <CodeInput
              onChange={(v) => setCodigoActivacion(v)}
            />
            <div className="mt-4 flex items-center justify-center gap-6 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="font-mono font-bold">ABC</span> letras</span>
              <span className="text-border">-</span>
              <span className="flex items-center gap-1"><span className="font-mono font-bold">123</span> números</span>
            </div>
          </div>

          {/* Continue */}
          <button
            disabled={!canContinue}
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-primary-foreground bg-foreground transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
