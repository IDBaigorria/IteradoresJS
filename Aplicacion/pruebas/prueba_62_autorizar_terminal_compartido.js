/**
 * Prueba: autorizar una terminal en un viaje la hace
 * aparecer en su compartido.
 *
 * @version 1.5plugin.6g
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
    id: "autorizar_terminal_aparece_en_compartido",
    nombre: "Grafo: autorizar terminal aparece en compartido",
    descripcion: "Crea un viaje vacío, verifica que el terminal no lo ve. Autoriza el terminal y verifica que ahora sí lo ve. Verifica el fix v1.5piloto.77q de agregar_terminal_autorizada.",
    async ejecutar(ctx) {
        const nombre_terminal = await login_y_nombre(ctx, CODIGO_TERMINAL1);
        const nombre_dueno = await login_y_nombre(ctx, CODIGO_DUENO);

        const nombre_viaje = await crear_viaje_vacio(ctx, nombre_dueno, "viajeauto");
        try {
            const antes = await terminal_ve_viaje(ctx, nombre_terminal, nombre_viaje);
            ctx.assert(!antes,
                "Antes de autorizar: el terminal YA ve el viaje.");

            await autorizar_terminal(ctx, nombre_dueno, nombre_viaje, nombre_terminal);

            const despues = await terminal_ve_viaje(ctx, nombre_terminal, nombre_viaje);
            ctx.assert(despues,
                "Después de autorizar: el terminal NO ve el viaje. "
                + "El fix v77q de agregar_terminal_autorizada no está funcionando.");
        } finally {
            await eliminar_viaje_si_existe(ctx, nombre_dueno, nombre_viaje);
        }
    }
};