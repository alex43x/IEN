import { wrap, header, brandFooter, card, spacer, label, heading, para, signoff, C } from "./base";

function competencia(nombre: string, desc: string, bg: string) {
  return `
  <tr>
    <td style="padding:14px 0;border-bottom:1px solid ${C.border};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="8" valign="top">
            <div style="width:6px;height:6px;border-radius:50%;background:${bg};margin-top:7px;"></div>
          </td>
          <td style="padding-left:10px;">
            <p style="margin:0;font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:500;color:${C.text};">${nombre}</p>
            <p style="margin:4px 0 0;font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:${C.muted};line-height:1.6;">${desc}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

export const bienvenida = (nombre: string, tienda: string) => wrap(`
  ${header()}
  ${card(`
    ${label("Día 0", C.gold)}
    ${heading("Tu mente y tu corazón inician un viaje integral hoy")}
    ${para(`Hola, <strong>${nombre}</strong>,`)}
    ${para(`Gracias por activar tu programa en <strong>${tienda}</strong>.`)}
    ${para(`Bienvenido/a a <strong>"Cuidamos de tu mente y de tu corazón"</strong>. Estamos muy felices de que hayas decidido dar este paso hacia una salud integral.`)}
    ${para(`Durante los próximos 30 días, con 5 a 10 min al día, vamos a trabajar el eslabón perdido de la vitalidad: la <strong>Inteligencia Emocional aplicada a la salud</strong>.`)}
  `, C.gold)}
  ${spacer(8)}
  ${card(`
    <p style="margin:0 0 16px;font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;font-weight:500;color:${C.text};">Nuestra Hoja de Ruta de Bienestar</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${competencia("Autoconciencia", "Aprender a escuchar las señales de tu cuerpo y tus emociones.", C.gold)}
      ${competencia("Autoconfianza", "Reconstruir la relación con vos mismo/a y confiar en tu capacidad de cambio.", C.teal)}
      ${competencia("Autocontrol", "Sostener la pausa poderosa frente al estrés y los impulsos.", C.red)}
      ${competencia("Automotivación", "Mantener el fuego interno aunque los resultados tardén en llegar.", C.gold)}
      ${competencia("Empatía", "Entender a los demás para fortalecer tus relaciones.", C.teal)}
      ${competencia("Competencia Social", "Comunicarte con impacto y construir vínculos saludables.", C.red)}
    </table>
  `, C.teal)}
  ${spacer(8)}
  ${card(`
    ${signoff(tienda)}
  `, C.teal)}
  ${spacer()}
  ${brandFooter()}
`);
