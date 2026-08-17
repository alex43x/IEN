export { bienvenida } from "./bienvenida";
export { hito } from "./hito";
export { recordatorioDiario } from "./recordatorioDiario";
export { rachaRota } from "./rachaRota";
export { urgenciaActivacion } from "./urgenciaActivacion";
export { recuperacionInactividad } from "./recuperacionInactividad";
export { recuperacionContrasena } from "./recuperacionContrasena";

import { bienvenida } from "./bienvenida";
import { hito } from "./hito";
import { recordatorioDiario } from "./recordatorioDiario";
import { rachaRota } from "./rachaRota";
import { urgenciaActivacion } from "./urgenciaActivacion";
import { recuperacionInactividad } from "./recuperacionInactividad";
import { recuperacionContrasena } from "./recuperacionContrasena";

export const ALL_TEMPLATES = [
  { key: "bienvenida", label: "Bienvenida", render: (n: string) => bienvenida(n, "CardioSmille") },
  { key: "hito_7", label: "Hito — Semana 1", render: (n: string) => hito(n, 7, "CardioSmille") },
  { key: "hito_14", label: "Hito — Semana 2", render: (n: string) => hito(n, 14, "CardioSmille") },
  { key: "hito_21", label: "Hito — Semana 3", render: (n: string) => hito(n, 21, "CardioSmille") },
  { key: "hito_28", label: "Hito — Semana 4", render: (n: string) => hito(n, 28, "CardioSmille") },
  { key: "recordatorio_diario", label: "Recordatorio Diario", render: (n: string) => recordatorioDiario(n, 5) },
  { key: "racha_rota", label: "Racha Rota", render: (n: string) => rachaRota(n, 7) },
  { key: "urgencia_activacion", label: "Urgencia Activación", render: (n: string) => urgenciaActivacion(n) },
  { key: "recuperacion_inactividad", label: "Recuperación Inactividad", render: (n: string) => recuperacionInactividad(n, 10) },
  { key: "recuperacion_contrasena", label: "Recuperación Contraseña", render: (n: string) => recuperacionContrasena(n, "https://ien.app/reset-password?token=abc123") },
] as const;
