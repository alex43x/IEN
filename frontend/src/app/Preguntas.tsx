import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, CheckCircle2, Send, ShieldCheck, BookOpen } from "lucide-react";
import { useToneColors, useGray } from "../hooks/useToneColors";
import { planService } from "../services/plan.service";
import type { SetupTestResponse } from "../types/api.types";

const TONO = "red" as const;

interface DBQuestion {
  numero: number;
  texto: string;
  competencia: string;
  competencia_label: string;
}

export default function Preguntas() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<DBQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [testResult, setTestResult] = useState<SetupTestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tone = useToneColors(TONO);
  const gray = useGray();
  const greenTone = useToneColors("green");
  const yellowTone = useToneColors("yellow");
  const redTone = useToneColors("red");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const data = await planService.getTestPreguntas();
        setQuestions(data);
      } catch (err) {
        console.error("Error fetching diagnostic questions:", err);
        setError("No se pudieron cargar las preguntas del test. Intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
        <BookOpen size={48} className="text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold text-foreground">{error || "No hay preguntas disponibles"}</h2>
        <button onClick={() => navigate("/dashboard")} className="mt-4 px-4 py-2 bg-foreground text-background text-xs font-semibold rounded-xl">Volver al Dashboard</button>
      </div>
    );
  }

  const q = questions[current];
  const total = questions.length;
  const progress = (current / total) * 100;
  const answer = answers[q.numero];
  const canAdvance = answer !== undefined;

  const next = () => {
    if (current < total - 1) {
      setCurrent((c) => c + 1);
    } else {
      handleSubmit();
    }
  };

  const prev = () => setCurrent((c) => Math.max(0, c));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        respuestas: questions.map((item) => ({
          numero: item.numero,
          score: answers[item.numero] || 3 // Fallback prudente
        })),
        emociones_a_mejorar: [] // El backend lo deriva o requiere vacío
      };

      const result = await planService.setupTest(payload);
      setTestResult(result);
      setSubmitted(true);
    } catch (err: any) {
      console.error("Error setting up plan:", err);
      setError(err.response?.data?.error || "Ocurrió un error al procesar tus respuestas.");
      setSubmitting(false);
    }
  };

  if (submitted && testResult) {
    const puntuaciones = testResult.puntuaciones_por_competencia ?? [];
    const maxScore = 25;
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: greenTone.soft }}>
              <CheckCircle2 size={36} style={{ color: greenTone.color }} />
            </div>
            <h1 className="font-['Lora'] text-3xl font-semibold text-foreground mb-3">¡Plan Creado!</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hemos analizado tus respuestas. Estos son tus resultados por competencia:
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 mb-4 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-4">Tus puntuaciones</p>
            <div className="space-y-4">
              {puntuaciones.map((p) => {
                const pct = Math.round((p.puntuacion / maxScore) * 100);
                const isBaja = p.puntuacion < 20;
                const color = isBaja ? redTone : p.puntuacion >= 22 ? greenTone : yellowTone;
                return (
                  <div key={p.competencia}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground">{p.competencia_label}</p>
                      <p className="text-xs font-mono font-semibold" style={{ color: color.color }}>
                        {p.puntuacion}/{maxScore}
                      </p>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: gray.light }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {testResult.competencias_a_mejorar && testResult.competencias_a_mejorar.length > 0 && (
            <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: yellowTone.bg, border: `1px solid ${yellowTone.soft}` }}>
              <p className="text-xs font-semibold text-foreground mb-1">Áreas a mejorar</p>
              <p className="text-xs text-muted-foreground">
                Tu plan se enfocará en: <span className="font-semibold text-foreground">{testResult.competencias_a_mejorar.join(', ')}</span>
              </p>
            </div>
          )}

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-background transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--foreground)' }}>
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="bg-card border-b border-border px-5 py-3 flex items-center gap-4 flex-shrink-0">
        <button onClick={() => current > 0 ? prev() : navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: tone.soft }}>
              <ShieldCheck size={11} style={{ color: tone.color }} />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{q.competencia_label}</p>
          </div>
          <p className="text-sm font-semibold text-foreground mt-0.5">Test de Diagnóstico Inicial</p>
        </div>
        <span className="text-xs font-mono text-muted-foreground flex-shrink-0">{current + 1}/{total}</span>
      </header>

      {/* Progress */}
      <div className="h-1 bg-secondary flex-shrink-0">
        <div className="h-full transition-all duration-500" style={{ width: `${progress + (100 / total)}%`, backgroundColor: tone.color }} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="max-w-lg w-full">
          {/* Question number */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-['Lora'] font-semibold text-sm"
              style={{ backgroundColor: tone.soft, color: tone.color }}>
              {current + 1}
            </div>
            <p className="text-xs font-mono text-muted-foreground">Pregunta de Evaluación</p>
          </div>

          {/* Question */}
          <h2 className="font-['Lora'] text-xl font-semibold text-foreground leading-snug mb-8">
            {q.texto}
          </h2>

          {/* Scale Answer input (1 to 5) */}
          <div className="bg-card rounded-2xl border border-border p-4 md:p-6">
            <div className="flex gap-1.5 md:gap-2 justify-between mb-4">
              {[1, 2, 3, 4, 5].map((val) => {
                const selected = answer === val;
                return (
                  <button
                    key={val}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.numero]: val }))}
                    className="flex-1 aspect-square rounded-xl font-mono font-semibold text-sm transition-all hover:scale-105"
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
            <div className="flex justify-between">
              <span className="text-xs font-mono text-muted-foreground">Totalmente en desacuerdo</span>
              <span className="text-xs font-mono text-muted-foreground">Totalmente de acuerdo</span>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              {error}
            </p>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {current > 0 && (
              <button
                onClick={prev}
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-medium text-muted-foreground border border-border bg-card hover:bg-background transition-all">
                <ChevronLeft size={15} />
                Anterior
              </button>
            )}
            <button
              disabled={!canAdvance || submitting}
              onClick={next}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-background transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: tone.color }}>
              {submitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : current === total - 1 ? (
                <><Send size={14} /> Crear mi plan</>
              ) : (
                <>Siguiente <ChevronRight size={15} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}