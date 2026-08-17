import { wrap, header, brandFooter, card, spacer, label, heading, para, btn, muted, C } from "./base";

export const recuperacionContrasena = (nombre: string, resetUrl: string) => wrap(`
  ${header()}
  ${card(`
    ${label("Contraseña", C.red)}
    ${heading("Recuperá tu contraseña")}
    ${para(`Hola, <strong>${nombre}</strong>,`)}
    ${para(`Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el botón de abajo para crear una nueva.`)}
    ${btn("Restablecer contraseña", resetUrl, C.red)}
    ${muted("Este enlace expira en 15 minutos.")}
    ${muted("Si no solicitaste este cambio, podés ignorar este mensaje. Tu contraseña permanecerá igual.")}
  `, C.red)}
  ${spacer()}
  ${brandFooter()}
`);
