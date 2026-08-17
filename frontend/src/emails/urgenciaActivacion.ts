import { wrap, header, brandFooter, card, spacer, label, heading, para, btn, C } from "./base";

export const urgenciaActivacion = (nombre: string) => wrap(`
  ${header()}
  ${card(`
    ${label("Activación", C.gold)}
    ${heading("Tu transformación te está esperando")}
    ${para(`Hola, <strong>${nombre}</strong>,`)}
    ${para(`Te registraste pero todavía no activaste tu programa. Los primeros 7 días son clave.`)}
    ${para(`Quienes empiezan en los primeros 7 días tienen <strong>3x más probabilidad</strong> de completar la transformación.`)}
    ${btn("Activar mi programa", "https://ien.app/dashboard", C.gold)}
  `, C.gold)}
  ${spacer()}
  ${brandFooter()}
`);
