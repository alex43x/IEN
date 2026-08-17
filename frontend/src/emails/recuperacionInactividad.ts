import { wrap, header, brandFooter, card, spacer, label, heading, para, btn, C } from "./base";

export const recuperacionInactividad = (nombre: string, dia: number) => wrap(`
  ${header()}
  ${card(`
    ${label(`Día ${dia}`, C.teal)}
    ${heading("Te extrañamos en tu programa")}
    ${para(`Hola, <strong>${nombre}</strong>,`)}
    ${para(`Notamos que llevás varios días sin completar una actividad. Estás en el <strong>Día ${dia}</strong> — retomarlo hoy hace toda la diferencia.`)}
    ${para(`No importa cuántos días hayan pasado. Lo que importa es que hoy elegís volver.`)}
    ${btn("Reanudar mi programa", "https://ien.app/dashboard", C.teal)}
  `, C.teal)}
  ${spacer()}
  ${brandFooter()}
`);
