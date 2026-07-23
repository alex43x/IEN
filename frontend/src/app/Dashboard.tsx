import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import {
  CheckCircle2, Heart, Package, Activity, TrendingUp,
  BookOpen, ChevronDown, ChevronUp, CalendarDays, Flame, Pill, ShieldCheck,
} from "lucide-react";

import { C } from "@/constants/colors";
import { BLOCKS } from "@/constants/program";
import type { Tone } from "@/constants/colors";
import TestInicialResultados from "@/components/TestInicialResultados";
import ActividadesDiariasLista from "@/components/ActividadesDiariasLista";
import { planService } from "../services/plan.service";
import { useToneColors, useGray, type GrayColors } from "../hooks/useToneColors";

import type { Leccion, PlanProfileResponse, TestInicialResponse, DiaPlan } from "../types/api.types";

const SUPPLEMENT_ICONS: Record<string, any> = {
  'Ashwagandha': TrendingUp,
  'Magnesio': Activity,
  'L-Teanina': Heart,
  'Omega': Activity,
  'Rhodiola': TrendingUp,
  'Cardiosmile': Heart,
  'Coenzima': Package,
  'Complejo': Package,
  'Proteína': Package,
  'Melatonina': Heart,
  'Ginkgo': Activity,
};

const SUPPLEMENT_TONES: Record<string, string> = {
  'Ashwagandha': 'green',
  'Magnesio': 'green',
  'Omega': 'red',
  'Rhodiola': 'green',
  'Cardiosmile': 'red',
  'L-Teanina': 'green',
};



const r = 36;
const circ = 2 * Math.PI * r;

function ProgressBlock({ block, isDone, isNow, TODAY, gray }: { block: typeof BLOCKS[number]; isDone: boolean; isNow: boolean; TODAY: number; gray: GrayColors }) {
  const bc = useToneColors(block.tone);
  const total = block.end - block.start + 1;
  const done = isDone ? total : isNow ? TODAY - block.start : 0;
  const p = Math.round((done / total) * 100);
  const Icon = block.icon;
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: isDone || isNow ? bc.soft : gray.faint }}>
        <Icon size={12} style={{ color: isDone || isNow ? bc.color : gray.mid }} />
      </div>
      <div className="flex-1">
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: gray.faint }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p}%`, backgroundColor: bc.color }} />
        </div>
      </div>
      <span className="text-[10px] font-mono w-7 text-right" style={{ color: isDone || isNow ? bc.color : gray.mid }}>{p}%</span>
    </div>
  );
}

function BlockGridItem({ block, isDone, isNow, TODAY, gray }: { block: typeof BLOCKS[number]; isDone: boolean; isNow: boolean; TODAY: number; gray: GrayColors }) {
  const bc = useToneColors(block.tone);
  const Icon = block.icon;
  return (
    <div
      className="rounded-xl p-3 transition-all"
      style={{
        backgroundColor: isNow ? bc.bg : isDone ? `${bc.soft}88` : gray.faint,
        border: isNow ? `1.5px solid ${bc.border}` : `1px solid ${gray.light}`,
      }}>
      <div className="flex items-center justify-between mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: isDone || isNow ? bc.soft : gray.light }}>
          <Icon size={13} style={{ color: isDone || isNow ? bc.color : gray.mid }} />
        </div>
        {isDone && <CheckCircle2 size={12} style={{ color: bc.color }} />}
        {isNow && <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: bc.color }} />}
      </div>
      <p className="text-xs font-semibold text-foreground leading-tight">{block.title}</p>
      <p className="text-[10px] font-mono mt-0.5" style={{ color: gray.mid }}>Días {block.start}–{block.end}</p>
      <div className="flex gap-0.5 mt-2 flex-wrap">
        {Array.from({ length: block.end - block.start + 1 }).map((_, i) => {
          const dayN = block.start + i;
          const filled = dayN < TODAY;
          return (
            <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
              style={{ backgroundColor: filled ? bc.color : bc.soft }} />
          );
        })}
      </div>
    </div>
  );
}

function SupplementItem({ sup, checked, onToggle, gray }: { sup: any; checked: boolean; onToggle: () => void; gray: GrayColors }) {
  const toneKey = Object.keys(SUPPLEMENT_TONES).find(k => sup.nombre.includes(k)) ?? sup.nombre;
  const st = (SUPPLEMENT_TONES[toneKey] ?? 'green') as Tone;
  const bc = useToneColors(st);
  const Icon = Object.keys(SUPPLEMENT_ICONS).find(k => sup.nombre.includes(k))
    ? SUPPLEMENT_ICONS[Object.keys(SUPPLEMENT_ICONS).find(k => sup.nombre.includes(k))!]
    : Pill;
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl transition-shadow hover:shadow-sm cursor-pointer"
      onClick={onToggle}
      style={{ backgroundColor: checked ? bc.bg : gray.faint }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bc.soft }}>
        <Icon size={14} style={{ color: bc.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">{sup.nombre}</p>
        <p className="text-[10px] font-mono text-muted-foreground">{sup.dosis} · {sup.horario}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95"
        style={{ borderColor: bc.color, backgroundColor: checked ? bc.color : "transparent" }}>
        <CheckCircle2 size={13} color={checked ? 'var(--background)' : bc.color} />
      </button>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [leccion, setLeccion] = useState<Leccion | null>(null);
  const [profile, setProfile] = useState<PlanProfileResponse | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [planError, setPlanError] = useState<string | null>(null);
  const [hitoAlcanzado, setHitoAlcanzado] = useState<number | null>(null);

  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const [testInicial, setTestInicial] = useState<TestInicialResponse | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testOpen, setTestOpen] = useState(false);

  const [actividades, setActividades] = useState<DiaPlan[]>([]);
  const [actividadesLoading, setActividadesLoading] = useState(false);
  const [actividadesOpen, setActividadesOpen] = useState(false);


  useEffect(() => {
    const load = async () => {
      try {
        setPlanLoading(true);
        const [todayData, profileData] = await Promise.all([
          planService.getTodayPlan(),
          planService.getProfile(),
        ]);
        setLeccion(todayData.leccion);
        setProfile(profileData);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setPlanError("no_plan");
        } else {
          setPlanError("error");
        }
      } finally {
        setPlanLoading(false);
      }
    };
    load();
  }, []);

  const loadTestInicial = async () => {
    if (testInicial || testLoading) return;
    setTestLoading(true);
    try {
      const data = await planService.getTestInicial();
      setTestInicial(data);
    } catch (_) {
    } finally {
      setTestLoading(false);
    }
  };

  const loadActividades = async () => {
    if (actividades.length > 0 || actividadesLoading) return;
    setActividadesLoading(true);
    try {
      const data = await planService.getDays(true);
      setActividades(data.dias);
    } catch (_) {
    } finally {
      setActividadesLoading(false);
    }
  };

  const TODAY = Math.min(profile?.dia_actual ?? 1, 30);
  const diasCompletados = profile?.dias_completados ?? 0;
  const pct = Math.round((diasCompletados / 30) * 100);
  const completedPlan = profile?.estado === 'completado';
  const ACTIVE = completedPlan
    ? BLOCKS[BLOCKS.length - 1]
    : BLOCKS.find((b) => TODAY >= b.start && TODAY <= b.end) ?? BLOCKS[0];
  const tone = useToneColors(ACTIVE.tone);
  const gray = useGray();
  const greenTone = useToneColors("green");
  const yellowTone = useToneColors("yellow");
  const redTone = useToneColors("red");

  const BlockIcon = ACTIVE.icon;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

      <div className="flex justify-end gap-2">
        <button
          onClick={async () => {
            try {
              await planService.autocompleteTest();
              const [todayPlan, profileData] = await Promise.all([
                planService.getTodayPlan(),
                planService.getProfile()
              ]);
              setLeccion(todayPlan.leccion);
              setProfile(profileData);
              setHitoAlcanzado(null);
            } catch (error) {
              console.error("Error auto-completing test:", error);
            }
          }}
          title="Auto-completar test inicial"
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all"
        >
          AUTO TEST
        </button>
        <button
          onClick={async () => {
            try {
              await planService.retreatDay();
              const [todayPlan, profileData] = await Promise.all([
                planService.getTodayPlan(),
                planService.getProfile()
              ]);
              setLeccion(todayPlan.leccion);
              setProfile(profileData);
              setHitoAlcanzado(null);
            } catch (error) {
              console.error("Error retreating day:", error);
            }
          }}
          title="Retroceder día"
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all"
        >
          RETROCEDER
        </button>
        <button
          onClick={async () => {
            try {
              await planService.advanceDay();
              const [todayPlan, profileData] = await Promise.all([
                planService.getTodayPlan(),
                planService.getProfile()
              ]);
              setLeccion(todayPlan.leccion);
              setProfile(profileData);
              setHitoAlcanzado(null);
            } catch (error) {
              console.error("Error advancing day:", error);
            }
          }}
          title="Avanzar día"
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all"
        >
          AVANZAR DÍA
        </button>
      </div>

      {/* ── Estado del plan ── */}
      {profile && !planLoading && (
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Estado del plan</p>
            <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${profile.estado === 'activo' ? 'text-accent' :
                profile.estado === 'completado' ? 'text-primary' : 'text-destructive'
              }`}
              style={{
                backgroundColor: profile.estado === 'activo' ? greenTone.bg :
                  profile.estado === 'completado' ? yellowTone.soft : redTone.bg,
              }}>
              {profile.estado === 'activo' ? 'Activo' : profile.estado === 'completado' ? 'Completado' : 'Abandonado'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl p-3" style={{ backgroundColor: greenTone.bg }}>
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays size={13} style={{ color: greenTone.color }} />
                <p className="text-[10px] font-mono" style={{ color: greenTone.text }}>Inicio</p>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {new Date(profile.fecha_inicio).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
              </p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: yellowTone.bg }}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={13} style={{ color: yellowTone.color }} />
                <p className="text-[10px] font-mono" style={{ color: yellowTone.text }}>Completados</p>
              </div>
              <p className="text-sm font-semibold text-foreground">{profile.dias_completados} / {profile.dias_totales}</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: redTone.bg }}>
              <div className="flex items-center gap-2 mb-1">
                <Flame size={13} style={{ color: redTone.color }} />
                <p className="text-[10px] font-mono" style={{ color: redTone.text }}>Racha actual</p>
              </div>
              <p className="text-sm font-semibold text-foreground">{profile.racha_dias} días</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: greenTone.bg }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={13} style={{ color: greenTone.color }} />
                <p className="text-[10px] font-mono" style={{ color: greenTone.text }}>Mejor racha</p>
              </div>
              <p className="text-sm font-semibold text-foreground">{profile.racha_maxima} días</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Row 1: Hero card + Progress + Supplements ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Today block card */}
        <div
          className="lg:col-span-1 rounded-2xl p-5 flex flex-col justify-between shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${tone.bg} 0%, var(--card) 80%)`,
            border: `1.5px solid ${tone.border}`,
          }}>
          {planLoading ? (
            <div className="flex-1 flex items-center justify-center py-8">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
          ) : planError === 'no_plan' ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: tone.soft }}>
                <BookOpen size={28} style={{ color: tone.color }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Completá el test inicial</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[220px]">Respondé algunas preguntas para personalizar tu programa de 30 días</p>
              </div>
              <button onClick={() => navigate('/preguntas')} className="mt-1 px-5 py-2.5 rounded-xl text-xs font-semibold text-background shadow-sm transition-all hover:opacity-90" style={{ backgroundColor: tone.color }}>Iniciar test</button>
            </div>
          ) : profile?.estado === 'completado' ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: greenTone.soft }}>
                <CheckCircle2 size={28} style={{ color: greenTone.color }} />
              </div>
              <div>
                <p className="font-['Lora'] text-base font-semibold text-foreground">¡Programa completado!</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[220px]">Completaste los 30 días del programa. ¡Felicitaciones!</p>
              </div>
            </div>
          ) : profile?.actividad_completada_hoy ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: tone.soft }}>
                <CheckCircle2 size={28} style={{ color: tone.color }} />
              </div>
              <p className="font-['Lora'] text-base font-semibold text-foreground">¡Actividad completada!</p>
              <p className="text-xs text-muted-foreground">Volvé mañana para el día {TODAY}</p>
              {hitoAlcanzado && (
                <div
                  className="mt-1 rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm"
                  style={{ backgroundColor: tone.soft, color: tone.text }}>
                  🏅 ¡Racha de {hitoAlcanzado} días!
                </div>
              )}
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: tone.soft }}>
                    <BlockIcon size={22} style={{ color: tone.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-mono uppercase tracking-wider mb-0.5" style={{ color: tone.text }}>
                      Bloque {ACTIVE.id} · Días {ACTIVE.start}–{ACTIVE.end}
                    </p>
                    <p className="font-['Lora'] text-lg font-semibold text-foreground leading-tight">
                      {leccion?.titulo || ACTIVE.title}
                    </p>
                  </div>
                </div>
                {leccion?.datos_leccion?.concepto && (
                  <p className="font-['Lora'] text-sm italic text-muted-foreground leading-relaxed">
                    {leccion.datos_leccion.concepto}
                  </p>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate("/bloque-intro")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-background transition-all hover:opacity-90 shadow-sm"
                  style={{ backgroundColor: tone.color }}>
                  <BookOpen size={13} />
                  Lectura del día
                </button>
              </div>
            </>
          )}
        </div>

        {/* Progress */}
        <div
          className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-5">Progreso del programa</p>

          <div className="flex items-center gap-5 mb-5">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90 drop-shadow-sm">
                   <circle cx="44" cy="44" r={r} fill="none" stroke={gray.faint} strokeWidth="8" />
                <circle cx="44" cy="44" r={r} fill="none" stroke={C.yellow.color} strokeWidth="8"
                  strokeDasharray={`${circ * pct / 100} ${circ}`} strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 0.6s ease" }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-['Lora'] text-lg font-semibold text-foreground">{pct}%</span>
              </div>
            </div>
            <div>
              <p className="font-['Lora'] text-3xl font-semibold text-foreground">{diasCompletados} <span className="text-base text-muted-foreground font-normal">/ 30</span></p>
              <p className="text-xs text-muted-foreground mt-0.5">días completados</p>
              <div className="flex gap-4 mt-3">
                <div>
                  <p className="font-['Lora'] font-semibold text-foreground text-sm">{profile?.racha_dias ?? '—'}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">racha</p>
                </div>
                <div className="w-px" style={{ backgroundColor: gray.light }} />
                <div>
                  <p className="font-['Lora'] font-semibold text-foreground text-sm">{pct}%</p>
                  <p className="text-[10px] font-mono text-muted-foreground">adherencia</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {BLOCKS.map((b) => (
              <ProgressBlock key={b.id} block={b} isDone={completedPlan || b.id < ACTIVE.id} isNow={!completedPlan && b.id === ACTIVE.id} TODAY={TODAY} gray={gray} />
            ))}
          </div>
        </div>

        {/* Supplements */}
        <div
          className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-4">Suplementos · hoy</p>
          <div className="space-y-3">
            {(leccion?.datos_leccion?.suplementacion ?? []).map((sup, i) => (
              <SupplementItem key={i} sup={sup} checked={!!checked[i]} onToggle={() => setChecked((p) => ({ ...p, [i]: !p[i] }))} gray={gray} />
            ))}
            {(!leccion?.datos_leccion?.suplementacion || leccion.datos_leccion.suplementacion.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-4">Sin suplementación para hoy</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Block overview ── */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-4">Los 6 bloques</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {BLOCKS.map((b) => (
            <BlockGridItem key={b.id} block={b} isDone={b.id < ACTIVE.id} isNow={b.id === ACTIVE.id} TODAY={TODAY} gray={gray} />
          ))}
        </div>
      </div>

      {/* ── Test Inicial + Actividades Diarias ── */}
      {profile && !planError && (
        <div className="space-y-6">

          {/* Test Inicial */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <button
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-card transition-colors"
              onClick={() => { setTestOpen(!testOpen); if (!testOpen) loadTestInicial(); }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: redTone.soft }}>
                <ShieldCheck size={16} style={{ color: redTone.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Evaluación</p>
                <p className="font-['Lora'] font-semibold text-foreground truncate mt-0.5">Mi Test Inicial</p>
              </div>
              {testOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </button>
            {testOpen && (
              <div className="border-t border-border px-5 pb-5 pt-4">
                {testLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                  </div>
                ) : testInicial ? (
                  <TestInicialResultados data={testInicial} />
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">No disponible</p>
                )}
              </div>
            )}
          </div>

          {/* Actividades Diarias */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <button
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-card transition-colors"
              onClick={() => { setActividadesOpen(!actividadesOpen); if (!actividadesOpen) loadActividades(); }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: greenTone.soft }}>
                <CheckCircle2 size={16} style={{ color: greenTone.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Actividades</p>
                <p className="font-['Lora'] font-semibold text-foreground truncate mt-0.5">Mis Actividades Diarias</p>
              </div>
              {actividadesOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </button>
            {actividadesOpen && (
              <div className="border-t border-border px-5 pb-5 pt-4">
                {actividadesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                  </div>
                ) : (
                  <ActividadesDiariasLista dias={actividades} />
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
