/**
 * Prueba: eliminar un viaje con terminal autorizado lo
 * quita del compartido del terminal.
 *
 * @version 1.5plugin.7j
 */

import { CODIGO_DUENO, CODIGO_TERMINAL1 } from "../ConfiguracionApli.js";
import {
    login_y_nombre,
    crear_viaje_vacio,
    eliminar_viaje_si_existe,
    autorizar_terminal,
    terminal_ve_viaje
} from "./_compartidos_helpers.js";

export const prueba = {
    id: "eliminar_viaje_con_terminal_autorizado",
    nombre: "Grafo: eliminar viaje con terminal autorizado",
    descripcion: "Crea un viaje, autoriza una terminal, verifica que el terminal lo ve. Elimina el viaje y verifica que el terminal ya no lo ve. Verifica el fix v1.5piloto.77q de eliminar_viaje.",
    async ejecutar(ctx) {
        const nombre_terminal = await login_y_nombre(ctx, CODIGO_TERMINAL1);
        const nombre_dueno = await login_y_nombre(ctx, CODIGO_DUENO);

        const nombre_viaje = await crear_viaje_vacio(ctx, nombre_dueno, "viajeborrar");
        try {
            await autorizar_terminal(ctx, nombre_dueno, nombre_viaje, nombre_terminal);

            const antes = await terminal_ve_viaje(ctx, nombre_terminal, nombre_viaje);
            ctx.assert(antes,
                "Después de autorizar: el terminal NO ve el viaje en su listado.");

            const r_elim = await ctx.post_accion("viajes/eliminar", {
                nombre_dueno: nombre_dueno,
                nombre_viaje: nombre_viaje
            });
            ctx.assert(r_elim && r_elim.json && r_elim.json.exito,
                "No se pudo eliminar el viaje: "
                + JSON.stringify(r_elim && r_elim.json ? r_elim.json : r_elim));

            const despues = await terminal_ve_viaje(ctx, nombre_terminal, nombre_viaje);
            ctx.assert(!despues,
                "Después de eliminar: el terminal TODAVÍA ve el viaje. "
                + "El fix v77q de eliminar_viaje no está funcionando.");
        } finally {
            await eliminar_viaje_si_existe(ctx, nombre_dueno, nombre_viaje);
        }
    }
};