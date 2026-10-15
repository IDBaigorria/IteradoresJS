/**
 * Prueba: al hacer login como terminal, se reinicia la
 * seleccion de asientos previa (por si el usuario cerro
 * el navegador a mitad de una venta).
 *
 * Verifica el fix v1.5piloto.80h: el arranque de la app
 * dispara viajes/reiniciar_seleccion_completa para
 * terminales, limpiando la venta_actual colgada.
 *
 * @version 1.5plugin.7r
 * @since 1.5plugin.7r
 */

import { CODIGO_TERMINAL1 } from "../ConfiguracionApli.js";
import {
    _post,
    login_terminal,
    ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres,
    seleccionar_n_asientos,
    cerrar_modales_si_abiertos
} from "./_helpers.js";

// Lee viaje_seleccionado y micro_seleccionado del page.
async function _leer_info_micro(ctx) {
    const r = await chrome.scripting.executeScript({
        target: { tabId: ctx.pestana_id },
        world: "MAIN",
        func: () => {
            if (typeof viaje_seleccionado === "undefined" || !viaje_seleccionado) return null;
            if (typeof micro_seleccionado === "undefined" || !micro_seleccionado) return null;
            return {
                nombre_viaje: viaje_seleccionado.nombre_viaje,
                nombre_dueno: viaje_seleccionado.dueno,
                nombre_micro: micro_seleccionado
            };
        }
    });
    return (r && r[0] && r[0].result) ? r[0].result : null;
}

// Cuenta cuantos asientos estan en "seleccionado" por el
// terminal dado. Devuelve -1 si falla la consulta.
async function _contar_seleccionados(ctx, info, nombre_terminal) {
    try {
        const r = await _post(ctx, "viajes/estado_asientos", {
            nombre_viaje: info.nombre_viaje,
            nombre_micro: info.nombre_micro,
            nombre_dueno: info.nombre_dueno
        });
        if (!r || !r.exito) return -1;
        return (r.asientos || []).filter(
            a => a.estado === "seleccionado" && a.seleccionado_por === nombre_terminal
        ).length;
    } catch (e) {
        return -1;
    }
}

export const prueba = {
    id: "reiniciar_seleccion_en_login",
    nombre: "Autenticacion: login de terminal limpia seleccion",
    descripcion: "Verifica que al hacer login como terminal se reinicia la venta_actual colgada: los asientos que quedaron en estado seleccionado vuelven a libre. Cubre el caso cierre de navegador a mitad de venta.",
    async ejecutar(ctx) {
        // 1. Login terminal + reset inicial por las dudas.
        await login_terminal(ctx);
        await cerrar_modales_si_abiertos(ctx);

        const r_nombre = await ctx.nombre_usuario_actual();
        ctx.assert(r_nombre && r_nombre.exito,
            "No se pudo leer el nombre del terminal");
        const nombre_terminal = r_nombre.nombre_usuario;

        // Limpieza defensiva por si una corrida anterior
        // dejo asientos colgados.
        await _post(ctx, "viajes/reiniciar_seleccion_completa", {
            nombre_terminal
        });

        // 2. Ir a Viajes y seleccionar 2 asientos.
        await ir_a_viajes_y_abrir_primero(ctx);
        await abrir_primer_micro_con_libres(ctx);
        await seleccionar_n_asientos(ctx, 2);

        // 3. Capturar info del viaje/micro.
        const info = await _leer_info_micro(ctx);
        ctx.assert(info && info.nombre_viaje && info.nombre_micro,
            "No se pudo leer el viaje/micro del page.");

        // 4. Sanity: hay al menos 2 asientos seleccionados.
        const n_antes = await _contar_seleccionados(ctx, info, nombre_terminal);
        ctx.assert(n_antes >= 2,
            "Antes de cerrar sesion deberia haber >=2 asientos seleccionados. Hay: " + n_antes);

        // 5. Cerrar modales y cerrar sesion (sin liberar los
        //    asientos). Los asientos quedan en estado
        //    "seleccionado" en el backend.
        await cerrar_modales_si_abiertos(ctx);
        const cerro = await ctx.cerrar_sesion();
        ctx.assert(cerro, "No se pudo cerrar la sesion.");

        // 6. Login terminal de nuevo. Aca es donde corre
        //    la limpieza (fix v1.5piloto.80h).
        await login_terminal(ctx);

        // 7. Poll: esperar a que no queden seleccionados.
        const inicio = Date.now();
        let n_despues = -1;
        while (Date.now() - inicio < 20000) {
            n_despues = await _contar_seleccionados(ctx, info, nombre_terminal);
            if (n_despues === 0) break;
            await ctx.pausa(500);
        }
        ctx.assert(n_despues === 0,
            "Despues del login, los asientos deberian estar libres. "
            + "Quedan " + n_despues + " asientos en estado seleccionado."
            + " El fix v1.5piloto.80h no esta funcionando.");
    }
};