import { wrap, header, brandFooter, card, spacer, label, heading, para, btn, C } from "./base";

export const recordatorioDiario = (nombre: string, dia: number) => wrap(`
  ${header()}
  ${card(`
    ${label(`Día ${dia}`, C.gold)}
    ${heading("No olvides tu actividad de hoy")}
    ${para(`Hola, <strong>${nombre}</strong>,`)}
    ${para(`Aún no completaste tu actividad del <strong>Día ${dia}</strong>. Son solo unos minutos — hacelo ahora y no pierdas tu racha.`)}
    ${para(`Cada día que completás es un paso más hacia tu mejor versión. Tu cuerpo y tu mente te lo van a agradecer.`)}
    ${btn("Completar ahora", "https://ien.app/dashboard", C.gold)}
  `, C.gold)}
  ${spacer()}
  ${brandFooter()}
`);
