/**
 * Prueba: el detalle de una rendición se abre para el
 * dueño (regresión).
 *
 * Con dueño, el backend devolvía el nombre del solicitante
 * solo (`_nombre_dueno_solicitante` rama nivel=dueno), así
 * que el bug v81i no se manifestaba. Esta prueba verifica
 * que el flujo del dueño sigue funcionando tras el fix.
 *
 * @version 1.5plugin.8f
 * @since 1.5plugin.8f
 */

import { CODIGO_DUENO } from "../ConfiguracionApli.js";
import {
    esperar_detalle_o_vacio,
    abrir_primer_detalle
} from "./_rendiciones_liquidaciones_helpers.js";
import { cerrar_modales_si_abiertos, ir_a_tab } from "./_helpers.js";

export const prueba = {
    id: "rendicion_detalle_dueno",
    nombre: "Rendiciones: detalle se abre para el dueño",
    descripcion: "Regresión tras el fix v81i: login dueño, pestaña Rendiciones, click en Ver detalle. Verifica que el modal se abre con contenido.",
    async ejecutar(ctx) {
        await cerrar_modales_si_abiertos(ctx);
        await ctx.asegurar_login(CODIGO_DUENO);
        await ir_a_tab(ctx, "rendiciones");

        const r_tabla = await esperar_detalle_o_vacio(
            ctx, ".ver_detalle_rendicion",
            "#tabla_rendiciones_container", 20000
        );
        if (!r_tabla.hay) {
            console.warn("[P69] El dueño no tiene rendiciones; se omite.");
            return;
        }

        const contenido = await abrir_primer_detalle(ctx, ".ver_detalle_rendicion", "Rendición");
        ctx.assert(contenido.length > 0, "Contenido del modal vacío");

        await ctx.clic("#cerrar_modal_generico");
        await ctx.pausa(300);
    }
};