import { useState, useRef, type KeyboardEvent, type ChangeEvent } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight, Loader2, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../components/ui/ThemeToggle";

export default function Horario() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const regData = (location.state as {
    nombre?: string;
    email?: string;
    password?: string;
    codigo_activacion?: string;
  }) || {};

  const [hour, setHour] = useState(10);
  const [minute, setMinute] = useState(0);
  const [hourDir, setHourDir] = useState(1);
  const [minDir, setMinDir] = useState(1);
  const [editingHour, setEditingHour] = useState(false);
  const [editingMinute, setEditingMinute] = useState(false);
  const [rawHour, setRawHour] = useState("");
  const [rawMinute, setRawMinute] = useState("");
  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = regData.nombre && regData.email && regData.password && regData.codigo_activacion;

  const cycleHour = (dir: 1 | -1) => {
    setHourDir(dir);
    setHour((prev) => {
      const next = prev + dir;
      if (next < 0) return 23;
      if (next > 23) return 0;
      return next;
    });
  };

  const cycleMinute = (dir: 1 | -1) => {
    setMinDir(dir);
    setMinute((prev) => (prev === 0 ? 30 : 0));
  };

  const startEditHour = () => {
    setRawHour(String(hour));
    setEditingHour(true);
    setTimeout(() => hourInputRef.current?.select(), 0);
  };

  const startEditMinute = () => {
    setRawMinute(String(minute));
    setEditingMinute(true);
    setTimeout(() => minuteInputRef.current?.select(), 0);
  };

  const commitHour = () => {
    const n = parseInt(rawHour);
    if (!isNaN(n) && n >= 0 && n <= 23) setHour(n);
    setEditingHour(false);
  };

  const commitMinute = () => {
    const n = parseInt(rawMinute);
    if (n === 0 || n === 30) {
      setMinute(n);
    } else if (n < 15) {
      setMinute(0);
    } else {
      setMinute(30);
    }
    setEditingMinute(false);
  };

  const keyHour = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitHour();
    if (e.key === "Escape") setEditingHour(false);
  };

  const keyMinute = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitMinute();
    if (e.key === "Escape") setEditingMinute(false);
  };

  const handleSkip = () => {
    setHour(10);
    setMinute(0);
    setHourDir(-1);
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const payload: Record<string, any> = {
        nombre: regData.nombre,
        email: regData.email,
        password: regData.password,
        codigo_activacion: regData.codigo_activacion,
        hora_recordatorio: hour,
        minuto_recordatorio: minute,
      };
      await register(payload);
      navigate("/bienvenida");
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al crear la cuenta.");
      setSubmitting(false);
    }
  };

  const timeDisplay = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  const numberBox = (
    value: number,
    dir: number,
    editing: boolean,
    raw: string,
    onStartEdit: () => void,
    onChange: (e: ChangeEvent<HTMLInputElement>) => void,
    onCommit: () => void,
    onKey: (e: KeyboardEvent<HTMLInputElement>) => void,
    inputRef: React.RefObject<HTMLInputElement | null>,
    key: string,
    pad: number = 2,
  ) => (
    <div className="w-16 h-16 flex items-center justify-center">
      <AnimatePresence mode="wait" custom={dir}>
        {editing ? (
          <motion.input
            key={`${key}-input`}
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={raw}
            onChange={onChange}
            onBlur={onCommit}
            onKeyDown={onKey}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-full h-full text-center text-2xl font-mono font-bold bg-secondary rounded-xl border-2 border-primary outline-none text-foreground"
          />
        ) : (
          <motion.button
            key={`${key}-${value}`}
            custom={dir}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 24 }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: d * -24 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={onStartEdit}
            className="w-full h-full text-2xl font-mono font-bold rounded-xl bg-secondary/50 border border-border hover:border-foreground/25 transition-colors text-foreground"
          >
            {String(value).padStart(pad, "0")}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Inter', sans-serif" }}>

      <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/activar", { state: regData })} className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={20} />
          </button>
          <img src="/imports/logo_ien-03.png" alt="IEN" className="h-10 w-auto" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="w-4 h-4 rounded-full bg-foreground text-background text-[9px] flex items-center justify-center font-bold">3</span>
            Horario
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="max-w-lg w-full">

          <div className="mb-8">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Paso 3 de 3</p>
            <h1 className="font-['Lora'] text-2xl font-semibold text-foreground">Elegí tu horario</h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Recibirás tu recordatorio diario a esta hora.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 mb-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
                <Clock size={15} className="text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Hora del recordatorio</p>
            </div>

            {/* Hora */}
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3 text-center">
              Hora
            </p>
            <div className="flex items-center justify-center gap-3 mb-5">
              <button
                onClick={() => cycleHour(-1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {numberBox(hour, hourDir, editingHour, rawHour, startEditHour, (e: ChangeEvent<HTMLInputElement>) => setRawHour(e.target.value.replace(/[^0-9]/g, "")), commitHour, keyHour, hourInputRef, "hour")}
              <button
                onClick={() => cycleHour(1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Minuto */}
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3 text-center">
              Minuto
            </p>
            <div className="flex items-center justify-center gap-3 mb-5">
              <button
                onClick={() => cycleMinute(-1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {numberBox(minute, minDir, editingMinute, rawMinute, startEditMinute, (e: ChangeEvent<HTMLInputElement>) => setRawMinute(e.target.value.replace(/[^0-9]/g, "")), commitMinute, keyMinute, minuteInputRef, "min")}
              <button
                onClick={() => cycleMinute(1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Dots de horas */}
            <div className="flex items-center justify-center gap-1.5 mb-4">
              {Array.from({ length: 24 }, (_, h) => (
                <button
                  key={h}
                  onClick={() => setHour(h)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    h === hour ? "w-5 bg-primary" : "w-1.5 bg-muted hover:bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              {timeDisplay} ·{" "}
              {hour === 0 && minute === 0
                ? "Medianoche"
                : hour === 12 && minute === 0
                ? "Mediodía"
                : hour < 12
                ? "AM"
                : "PM"}
            </p>
          </div>

          {/* Sin preferencia */}
          <button
            onClick={handleSkip}
            className="w-full mb-4 py-2.5 rounded-xl text-sm text-muted-foreground border border-border bg-card hover:text-foreground hover:border-foreground/20 transition-colors"
          >
            Sin preferencia (10:00 AM)
          </button>

          {/* Submit */}
          <button
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-primary-foreground bg-foreground transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                Comenzar el programa
                <ArrowRight size={16} />
              </>
            )}
          </button>
          {error && (
            <p className="text-center text-xs font-medium text-destructive mt-2">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
