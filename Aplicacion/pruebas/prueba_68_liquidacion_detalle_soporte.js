/**
 * Prueba: el detalle de una liquidación se abre para el
 * usuario soporte. Espejo de la prueba 67.
 *
 * Cubre el fix v81i en `liquidaciones/obtener`.
 *
 * @version 1.5plugin.8f
 * @since 1.5plugin.8f
 */

import {
    login_soporte,
    esperar_opciones_dueno,
    esperar_detalle_o_vacio,
    abrir_primer_detalle
} from "./_rendiciones_liquidaciones_helpers.js";
import { cerrar_modales_si_abiertos, ir_a_tab } from "./_helpers.js";

export const prueba = {
    id: "liquidacion_detalle_soporte",
    nombre: "Liquidaciones: detalle se abre para soporte",
    descripcion: "Login soporte, pestaña Liquidaciones, elegir un dueño, click en Ver detalle. Verifica que el modal se abre con contenido (fix v81i).",
    async ejecutar(ctx) {
        await cerrar_modales_si_abiertos(ctx);
        await login_soporte(ctx);
        await ir_a_tab(ctx, "liquidaciones");

        const hay_duenos = await esperar_opciones_dueno(ctx, "#selector_dueno_liquidaciones", 8000);
        if (!hay_duenos) {
            console.warn("[P68] El soporte no tiene dueños asignados; se omite.");
            return;
        }

        const r_sel = await ctx.seleccionar_indice("#selector_dueno_liquidaciones", 1);
        if (!r_sel || !r_sel.exito) {
            throw new Error("No se pudo elegir un dueño en el select de Liquidaciones");
        }

        const r_tabla = await esperar_detalle_o_vacio(
            ctx, ".ver_detalle_liquidacion",
            "#tabla_liquidaciones_container", 20000
        );
        if (!r_tabla.hay) {
            console.warn("[P68] El dueño " + r_sel.texto + " no tiene liquidaciones; se omite.");
            return;
        }

        const contenido = await abrir_primer_detalle(ctx, ".ver_detalle_liquidacion", "Liquidación");
        ctx.assert(contenido.length > 0, "Contenido del modal vacío");

        await ctx.clic("#cerrar_modal_generico");
        await ctx.pausa(300);
    }
};