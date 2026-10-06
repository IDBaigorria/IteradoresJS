/**
 * Prueba: eliminar huérfanos deja el grafo sin basura.
 *
 * Llama al endpoint `grafo/eliminar_huerfanos` del piloto y
 * verifica que después no queden huérfanos. El test depende
 * del estado: si el grafo ya está limpio, pasa con
 * console.warn. El plugin no puede crear huérfanos
 * artificialmente (no tiene acceso directo al grafo).
 *
 * @version 1.5plugin.5w
 * @since 1.5plugin.5w
 */

import { CODIGO_ADMIN } from "../ConfiguracionApli.js";
import { cerrar_modales_si_abiertos } from "./_helpers.js";

async function _contar_huerfanos(ctx, nombre_solicitante) {
    const r = await ctx.pedir_post("index.php", {
        accion: "grafo/resumen",
        nombre_solicitante
    });
    if (!r || !r.exito || !r.json || !r.json.exito) {
        throw new Error("No se pudo consultar grafo/resumen: "
            + (r && r.json && r.json.error ? r.json.error : "(sin detalle)"));
    }
    return r.json.resumen.huerfanos;
}

export const prueba = {
    id: "eliminar_huerfanos_limpia_grafo",
    nombre: "Grafo: eliminar huérfanos",
    descripcion: "Verifica que grafo/eliminar_huerfanos deja el grafo sin huérfanos.",
    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_ADMIN);
        await cerrar_modales_si_abiertos(ctx);

        const r_nombre = await ctx.nombre_usuario_actual();
        if (!r_nombre || !r_nombre.exito) {
            throw new Error("No se pudo leer el nombre del admin");
        }
        const nombre_admin = r_nombre.nombre_usuario;

        const H0 = await _contar_huerfanos(ctx, nombre_admin);

        if (H0 === 0) {
            console.warn("El grafo ya estaba limpio. Prueba saltada.");
            return;
        }

        const r_elim = await ctx.pedir_post("index.php", {
            accion: "grafo/eliminar_huerfanos",
            nombre_solicitante: nombre_admin
        });
        ctx.assert(r_elim && r_elim.exito && r_elim.json && r_elim.json.exito,
            "Falló eliminar_huerfanos: "
            + (r_elim && r_elim.json && r_elim.json.error ? r_elim.json.error : "(sin detalle)"));

        const H1 = await _contar_huerfanos(ctx, nombre_admin);
        ctx.assert(H1 === 0,
            "Después de eliminar siguen habiendo huérfanos. "
            + "Antes: " + H0 + ", después: " + H1
            + ", eliminados reportados: " + (r_elim.json.eliminados || 0));
    }
};