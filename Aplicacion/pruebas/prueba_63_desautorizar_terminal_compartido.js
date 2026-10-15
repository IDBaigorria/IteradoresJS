/**
 * Prueba: desautorizar una terminal en un viaje la saca
 * de su compartido.
 *
 * @version 1.5plugin.7j
 */

import { CODIGO_DUENO, CODIGO_TERMINAL1 } from "../ConfiguracionApli.js";
import {
    login_y_nombre,
    crear_viaje_vacio,
    eliminar_viaje_si_existe,
    autorizar_terminal,
    desautorizar_terminal,
    terminal_ve_viaje
} from "./_compartidos_helpers.js";

export const prueba = {
    id: "desautorizar_terminal_desaparece_del_compartido",
    nombre: "Grafo: desautorizar terminal la saca del compartido",
    descripcion: "Crea un viaje, autoriza el terminal, verifica que lo ve. Desautoriza el terminal y verifica que ya no lo ve. El viaje sigue existiendo. Verifica el fix v1.5piloto.77q de eliminar_terminal_autorizada.",
    async ejecutar(ctx) {
        const nombre_terminal = await login_y_nombre(ctx, CODIGO_TERMINAL1);
        const nombre_dueno = await login_y_nombre(ctx, CODIGO_DUENO);

        const nombre_viaje = await crear_viaje_vacio(ctx, nombre_dueno, "viajedesaut");
        try {
            await autorizar_terminal(ctx, nombre_dueno, nombre_viaje, nombre_terminal);

            const antes = await terminal_ve_viaje(ctx, nombre_terminal, nombre_viaje);
            ctx.assert(antes, "Antes de desautorizar: el terminal no ve el viaje. El setup falló.");

            await desautorizar_terminal(ctx, nombre_dueno, nombre_viaje, nombre_terminal);

            const despues = await terminal_ve_viaje(ctx, nombre_terminal, nombre_viaje);
            ctx.assert(!despues,
                "Después de desautorizar: el terminal TODAVÍA ve el viaje. "
                + "El fix v77q de eliminar_terminal_autorizada no está funcionando.");

            const r_dueno = await ctx.post_accion("viajes/listar_por_dueno", {
                nombre_dueno: nombre_dueno
            });
            const viajes_dueno = (r_dueno && r_dueno.json && r_dueno.json.viajes) || [];
            ctx.assert(viajes_dueno.some(v => v && v.nombre_viaje === nombre_viaje),
                "Después de desautorizar: el viaje desapareció del dueño.");
        } finally {
            await eliminar_viaje_si_existe(ctx, nombre_dueno, nombre_viaje);
        }
    }
};