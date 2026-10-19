/**
 * Prueba: el detalle de una rendición se abre para el
 * usuario soporte.
 *
 * Verifica el fix v81i: el frontend no mandaba
 * `nombre_dueno` en el POST `rendiciones/obtener`, y el
 * backend (carga parcial del soporte sin `usuarios`) no
 * encontraba la rendición. Síntoma: "Rendición no
 * encontrada" al hacer click en "Ver detalle".
 *
 * Flujo real del usuario:
 *   1. Login soporte.
 *   2. Ir a la pestaña Rendiciones.
 *   3. Elegir un dueño en el select.
 *   4. Esperar a que la tabla cargue.
 *   5. Click en "Ver detalle" del primer resultado.
 *   6. Verificar que el modal se abre con contenido.
 *   7. Cerrar el modal.
 *
 * Precondición: el dueño elegido debe tener al menos
 * una rendición creada. Si no, la prueba pasa con
 * console.warn (lección 38 del prompt del plugin).
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
    id: "rendicion_detalle_soporte",
    nombre: "Rendiciones: detalle se abre para soporte",
    descripcion: "Login soporte, pestaña Rendiciones, elegir un dueño, click en Ver detalle. Verifica que el modal se abre con contenido (fix v81i).",
    async ejecutar(ctx) {
        await cerrar_modales_si_abiertos(ctx);
        await login_soporte(ctx);
        await ir_a_tab(ctx, "rendiciones");

        const hay_duenos = await esperar_opciones_dueno(ctx, "#selector_dueno_rendiciones", 8000);
        if (!hay_duenos) {
            console.warn("[P67] El soporte no tiene dueños asignados; se omite.");
            return;
        }

        const r_sel = await ctx.seleccionar_indice("#selector_dueno_rendiciones", 1);
        if (!r_sel || !r_sel.exito) {
            throw new Error("No se pudo elegir un dueño en el select de Rendiciones");
        }

        const r_tabla = await esperar_detalle_o_vacio(
            ctx, ".ver_detalle_rendicion",
            "#tabla_rendiciones_container", 20000
        );
        if (!r_tabla.hay) {
            console.warn("[P67] El dueño " + r_sel.texto + " no tiene rendiciones; se omite.");
            return;
        }

        const contenido = await abrir_primer_detalle(ctx, ".ver_detalle_rendicion", "Rendición");
        ctx.assert(contenido.length > 0, "Contenido del modal vacío");

        await ctx.clic("#cerrar_modal_generico");
        await ctx.pausa(300);
    }
};