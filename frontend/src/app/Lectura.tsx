import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { ChevronLeft, BookOpen, ShieldCheck, Pill, CheckSquare, CheckCircle2, Square, Send } from "lucide-react";
import { useToneColors } from "@/hooks/useToneColors";
import { planService } from "../services/plan.service";
import api from "../services/api";
import type { Leccion } from "../types/api.types";

export default function Lectura() {
  const navigate = useNavigate();
  const location = useLocation();
  const { diaNumero } = useParams();
  const readOnly = !!diaNumero;
  const navState = location.state as { leccion?: Leccion; savedAnswers?: { id: string; valor: any; tipo: string }[]; returnTo?: string } | null;
  const returnTo = navState?.returnTo || "/dashboard";
  const [scrollPct, setScrollPct] = useState(0);
  const [leccion, setLeccion] = useState<Leccion | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [savedAnswers, setSavedAnswers] = useState<{ id: string; valor: any; tipo: string }[]>([]);
  const [completando, setCompletando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tone = useToneColors("green");

  const setAnswer = (id: string, value: any) => setAnswers(prev => ({ ...prev, [id]: value }));

  // Scroll progress
  useEffect(() => {
    if (readOnly) return;
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setScrollPct(Math.round((scrollTop / (scrollHeight - clientHeight)) * 100));
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [loading, readOnly]);

  // Load lesson from API
  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoading(true);

        if (readOnly) {
          if (navState?.leccion) {
            setLeccion(navState.leccion);
            if (navState.savedAnswers) {
              setSavedAnswers(navState.savedAnswers);
            }
            return;
          }

          const dayNum = parseInt(diaNumero!, 10);
          const response = await api.get('/plan/days');
          const allDays = response.data.dias || [];
          const targetDay = allDays.find((d: any) => d.dia_numero === dayNum);
          if (targetDay && targetDay.leccion) {
            setLeccion({
              dia_actual: targetDay.dia_numero,
              titulo: targetDay.leccion.titulo,
              tipo: targetDay.leccion.tipo,
              emociones_objetivo: targetDay.leccion.emociones_objetivo,
              respuesta_tipo: targetDay.leccion.respuesta_tipo,
              campos_respuesta: targetDay.leccion.campos_respuesta ?? [],
              datos_leccion: targetDay.leccion.datos_leccion
            });
            if (targetDay.respuesta_usuario) {
              setSavedAnswers(targetDay.respuesta_usuario);
            }
          }
          return;
        }

        const todayData = await planService.getTodayPlan();
        if (todayData.leccion) {
          setLeccion(todayData.leccion);
        } else {
          // Si ya se completó hoy, la lección viene como null en /today.
          // La buscamos en el historial completo de días para que el usuario pueda releerla.
          const profile = await planService.getProfile();
          const response = await api.get('/plan/days');
          const allDays = response.data.dias || [];
          const todayLesson = allDays.find((d: any) => d.dia_numero === profile.dia_actual);
          if (todayLesson && todayLesson.leccion) {
            setLeccion({
              dia_actual: todayLesson.dia_numero,
              titulo: todayLesson.leccion.titulo,
              tipo: todayLesson.leccion.tipo,
              emociones_objetivo: todayLesson.leccion.emociones_objetivo,
              respuesta_tipo: todayLesson.leccion.respuesta_tipo,
              campos_respuesta: todayLesson.leccion.campos_respuesta ?? [],
              datos_leccion: todayLesson.leccion.datos_leccion
            });
          }
        }
      } catch (err) {
        console.error("Error al cargar la lectura del día:", err);
      } finally {
        setLoading(false);
      }
    };
    loadLesson();
  }, []);

  const handleComplete = async () => {
    if (completando || !leccion) return;

    if (leccion.campos_respuesta && leccion.campos_respuesta.length > 0) {
      const faltan = leccion.campos_respuesta.filter(c => {
        const v = answers[c.id];
        if (c.tipo === 'escala') return v === undefined;
        if (c.tipo === 'accion') return !v;
        return v === undefined || v === '';
      });
      if (faltan.length > 0) {
        setError(`Completá: ${faltan.map(c => c.etiqueta).join(', ')}`);
        return;
      }
    }

    setCompletando(true);
    setError(null);
    try {
      const respuesta_usuario = leccion.campos_respuesta?.length
        ? leccion.campos_respuesta.map(c => ({
            id: c.id,
            valor: answers[c.id],
            tipo: c.tipo
          }))
        : undefined;

      await planService.completeDay(respuesta_usuario);
      navigate(returnTo);
    } catch (err) {
      console.error("Error al completar actividad:", err);
    } finally {
      setCompletando(false);
    }
  };

  const canContinue = scrollPct >= 80;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (!leccion) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
        <BookOpen size={48} className="text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold text-foreground">Lectura no disponible</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">No se encontró contenido activo para hoy. Asegúrate de tener un plan iniciado.</p>
        <button onClick={() => navigate("/dashboard")} className="mt-4 px-4 py-2 bg-foreground text-background text-xs font-semibold rounded-xl">Volver al Dashboard</button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <header className="bg-card border-b border-border px-5 py-3 flex items-center gap-4 flex-shrink-0">
        <button onClick={() => navigate(returnTo)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: tone.soft }}>
              <ShieldCheck size={11} style={{ color: tone.color }} />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Día {leccion.dia_actual} · {leccion.tipo}
            </p>
          </div>
          <p className="text-sm font-semibold text-foreground truncate mt-0.5">{leccion.titulo}</p>
        </div>
      </header>

      {/* Progress bar */}
      {!readOnly && (
        <div className="h-1 bg-secondary flex-shrink-0">
          <div className="h-full transition-all duration-300" style={{ width: `${scrollPct}%`, backgroundColor: tone.color }} />
        </div>
      )}

      {/* Reading content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-8">

          {/* Intro badge */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: tone.soft }}>
              <BookOpen size={13} style={{ color: tone.color }} />
            </div>
            <span className="text-xs font-mono font-semibold" style={{ color: tone.text }}>
              Lectura del día
            </span>
          </div>

          {/* Title */}
          <h1 className="font-['Lora'] text-3xl font-semibold text-foreground leading-tight mb-6">
            {leccion.titulo}
          </h1>

          {/* Concepto / Cita */}
          {leccion.datos_leccion?.concepto && (
            <div className="rounded-2xl p-5 mb-8" style={{ backgroundColor: tone.bg, borderLeft: `4px solid ${tone.color}` }}>
              <p className="font-['Lora'] text-lg italic text-foreground leading-relaxed">
                "{leccion.datos_leccion.concepto}"
              </p>
            </div>
          )}

          {/* Cuerpo principal del contenido */}
          {leccion.datos_leccion?.contenido && (
            <div className="space-y-5 mb-8">
              <p className="text-base text-muted-foreground leading-relaxed" style={{ fontFamily: "'Lora', serif" }}>
                {leccion.datos_leccion.contenido}
              </p>
            </div>
          )}

          {/* Ejercicio del día */}
          {leccion.datos_leccion?.ejercicio && (
            <div className="bg-card rounded-2xl border border-border p-5 mb-8">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Ejercicio del día</p>
              <h3 className="text-sm font-semibold text-foreground mb-3">{leccion.datos_leccion.ejercicio.nombre}</h3>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{leccion.datos_leccion.ejercicio.instruccion}</p>

              {readOnly && savedAnswers.length > 0 && (
                <div className="space-y-4">
                  {savedAnswers.map((saved, idx) => {
                    const campo = leccion.campos_respuesta?.find(c => c.id === saved.id);
                    const pasoTexto = leccion.datos_leccion?.ejercicio?.pasos?.[idx]?.texto;
                    return (
                      <div key={saved.id} className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-['Lora'] text-lg font-bold"
                          style={{ backgroundColor: tone.soft, color: tone.color }}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 pt-1.5">
                          <p className="text-sm font-medium text-foreground mb-2">{campo?.etiqueta || pasoTexto || saved.id}</p>
                          {saved.tipo === 'escala' && (
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2.5 rounded-full" style={{ backgroundColor: tone.bg }}>
                                <div className="h-full rounded-full" style={{ width: `${((saved.valor as number) / 10) * 100}%`, backgroundColor: tone.color }} />
                              </div>
                              <span className="text-sm font-mono font-bold" style={{ color: tone.color }}>{saved.valor}</span>
                            </div>
                          )}
                          {saved.tipo === 'texto' && (
                            <div className="rounded-xl p-3 text-sm italic text-muted-foreground leading-relaxed" style={{ backgroundColor: tone.bg, borderLeft: `3px solid ${tone.color}` }}>
                              "{saved.valor}"
                            </div>
                          )}
                          {saved.tipo === 'accion' && (
                            <div className="flex items-center gap-2">
                              {saved.valor ? (
                                <CheckCircle2 size={16} style={{ color: tone.color }} />
                              ) : (
                                <Square size={16} className="text-muted-foreground" />
                              )}
                              <span className="text-sm" style={{ color: saved.valor ? tone.color : 'var(--muted-foreground)' }}>
                                {saved.valor ? 'Completado' : 'No completado'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!readOnly && leccion.campos_respuesta && leccion.campos_respuesta.length > 0 && (
                <div className="space-y-4">
                  {leccion.campos_respuesta.map((campo, idx) => (
                    <div key={campo.id} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-['Lora'] text-lg font-bold"
                        style={{ backgroundColor: tone.soft, color: tone.color }}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 pt-1.5">
                        <p className="text-sm font-medium text-foreground mb-2">{campo.etiqueta}</p>
                        {campo.tipo === 'escala' && (
                          <div className="bg-background rounded-xl p-2 md:p-4">
                            <div className="grid grid-cols-5 gap-2 md:grid-cols-10 md:gap-1.5 justify-items-center mb-3">
                              {Array.from({ length: (campo.max ?? 10) - (campo.min ?? 1) + 1 }, (_, i) => (campo.min ?? 1) + i).map((val) => {
                                const selected = answers[campo.id] === val;
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setAnswer(campo.id, val)}
                                    className="w-full aspect-square max-w-[52px] rounded-xl font-mono font-semibold text-sm transition-all hover:scale-105"
                                    style={{
                                      backgroundColor: selected ? tone.color : tone.bg,
                                      color: selected ? 'var(--background)' : tone.color,
                                      border: `2px solid ${selected ? tone.color : tone.soft}`,
                                    }}>
                                    {val}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="text-xs text-muted-foreground text-center">Selecciona una opción</p>
                          </div>
                        )}
                        {campo.tipo === 'texto' && (
                          <textarea
                            className="w-full rounded-xl border text-sm text-foreground p-3 resize-none focus:outline-none bg-background transition-all focus:shadow-sm"
                            style={{ borderColor: 'var(--border)', minHeight: 80, fontFamily: "'Lora', serif" }}
                            placeholder="Escribe tu respuesta aquí..."
                            value={answers[campo.id] ?? ''}
                            onChange={(e) => setAnswer(campo.id, e.target.value)}
                          />
                        )}
                        {campo.tipo === 'accion' && (
                          <button
                            type="button"
                            onClick={() => setAnswer(campo.id, !answers[campo.id])}
                            className="flex items-center gap-3 p-3 rounded-xl w-full text-left transition-all hover:shadow-sm border"
                            style={{
                              backgroundColor: answers[campo.id] ? tone.bg : 'var(--secondary)',
                              borderColor: answers[campo.id] ? tone.color : 'var(--border)'
                            }}>
                            {answers[campo.id] ? (
                              <CheckSquare size={18} style={{ color: tone.color }} />
                            ) : (
                              <Square size={18} className="text-muted-foreground" />
                            )}
                            <span className="text-sm" style={{ color: answers[campo.id] ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                              {answers[campo.id] ? 'Completado' : 'Marcar como hecho'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Suplementación recomendada */}
          {leccion.datos_leccion?.suplementacion && leccion.datos_leccion.suplementacion.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-5 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Pill size={14} style={{ color: tone.color }} />
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Suplementación recomendada</p>
              </div>
              <div className="space-y-3">
                {leccion.datos_leccion.suplementacion.map((sup, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: tone.bg }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: tone.soft }}>
                      <Pill size={13} style={{ color: tone.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{sup.nombre}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{sup.dosis} · {sup.horario}</p>
                      <p className="text-xs text-muted-foreground mt-1">{sup.beneficio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Principio o recomendación */}
          {leccion.datos_leccion?.principio && (
            <p className="text-base font-['Lora'] italic text-muted-foreground leading-relaxed mb-10">
              💡 {leccion.datos_leccion.principio}
            </p>
          )}

          {/* CTA */}
          {!readOnly && (
            <div className="sticky bottom-0 pb-6 mt-8">
              {error && (
                <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive mb-3">
                  {error}
                </p>
              )}
              <div className={`transition-all duration-500 ${canContinue ? "opacity-100 translate-y-0" : "opacity-40 translate-y-2"}`}>
                <button
                  disabled={!canContinue || completando}
                  onClick={handleComplete}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold text-background transition-all hover:opacity-90 disabled:cursor-not-allowed shadow-lg"
                  style={{ backgroundColor: tone.color }}>
                  {completando
                    ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    : <><Send size={15} /> Completar actividad</>
                  }
                </button>
                {!canContinue && (
                  <p className="text-center text-xs font-mono text-muted-foreground mt-2">
                    Continúa leyendo para desbloquear ({scrollPct}%)
                  </p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}