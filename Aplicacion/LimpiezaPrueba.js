/**
 * Limpieza de datos de prueba en el piloto.
 *
 * Ejecuta en orden los 6 endpoints de limpieza por cada
 * dueno (ventas, cancelaciones, viajes, pasajeros,
 * empresas/vehiculos, terminales), mas el global de
 * usuarios. Verifica modo pruebas + nivel admin antes de
 * empezar.
 *
 * El orden importa:
 *   - Ventas antes que cancelaciones (las cancelaciones
 *     se crean al limpiar las ventas de prueba).
 *   - Viajes antes que empresas (borrar un viaje destruye
 *     sus micros, que son los que referencian empresas).
 *   - Pasajeros y terminales antes que usuarios
 *     (limpiar_usuarios_de_prueba los saltea si tienen
 *     referencias).
 *
 * @version 1.5plugin.7m
 * @since 1.5plugin.7m
 */

import { _post } from "./pruebas/_helpers.js";

/**
 * Ejecuta la limpieza. Devuelve un objeto con:
 *   { exito, duenos, res_ini, res_fin, totales }
 *
 * `al_progreso(evento)` es opcional. Se llama despues de
 * cada endpoint con un evento tipo:
 *   { tipo: "dueno", nombre }
 *   { tipo: "ok", etiqueta, borrados, salteados, extra }
 *   { tipo: "warning", etiqueta, error }
 *
 * @param {object} ctx
 * @param {Function} [al_progreso]
 * @returns {Promise<object>}
 */
export async function limpiar_datos_de_prueba(ctx, al_progreso) {
    const progreso = (typeof al_progreso === "function")
        ? al_progreso
        : function () {};

    // --- Chequeos previos ---
    const entorno = await _post(ctx, "entorno/info", {},
        { sin_solicitante: true, sin_dueno: true });
    if (!entorno.exito || !entorno.es_pruebas) {
        throw new Error("Abortado: el piloto no esta en modo pruebas.");
    }

    const perfil_resp = await _post(ctx, "usuarios/mi_perfil", {});
    if (!perfil_resp.exito || !perfil_resp.perfil
        || perfil_resp.perfil.nivel !== "admin") {
        throw new Error("Abortado: solo un admin puede correr la limpieza.");
    }

    // --- Estado inicial ---
    const r_ini = await _post(ctx, "grafo/resumen", {});
    const res_ini = r_ini.resumen || {};

    // --- Duenos ---
    const r_duenos = await _post(ctx, "administrador/listar_duenos", {});
    if (!r_duenos.exito) {
        throw new Error("No se pudieron listar duenos: "
            + (r_duenos.error || "(sin detalle)"));
    }
    const duenos = (r_duenos.duenos || []).map(function (d) {
        return typeof d === "string" ? d : d.nombre_usuario;
    });

    // --- Acumuladores ---
    const totales = {
        ventas: 0,
        cancelaciones: 0,
        viajes: 0,
        pasajeros: 0,
        empresas: 0,
        vehiculos: 0,
        terminales: 0,
        usuarios: 0,
        salteados: 0,
    };

    async function limpiar(etiqueta, accion, params) {
        const r = await _post(ctx, accion, params || {});
        if (!r.exito) {
            progreso({ tipo: "warning", etiqueta: etiqueta, error: r.error });
            return r;
        }
        const b = (r.cantidad_borrados !== undefined)
            ? r.cantidad_borrados
            : (r.cantidad_empresas_borradas || 0);
        const s = r.cantidad_salteados || 0;
        progreso({
            tipo: "ok",
            etiqueta: etiqueta,
            borrados: b,
            salteados: s,
            extra: r.cantidad_vehiculos_borrados || 0,
            salteados_detalle: r.salteados || [],
        });
        return r;
    }

    // --- Por cada dueno ---
    for (const dueno of duenos) {
        progreso({ tipo: "dueno", nombre: dueno });

        const rv = await limpiar("ventas", "ventas/limpiar_prueba",
            { nombre_dueno: dueno });
        totales.ventas += rv.cantidad_borrados || 0;
        totales.salteados += rv.cantidad_salteados || 0;

        const rc = await limpiar("cancelaciones",
            "cancelaciones/limpiar_prueba", { nombre_dueno: dueno });
        totales.cancelaciones += rc.cantidad_borrados || 0;
        totales.salteados += rc.cantidad_salteados || 0;

        const rvia = await limpiar("viajes", "viajes/limpiar_prueba",
            { nombre_dueno: dueno });
        totales.viajes += rvia.cantidad_borrados || 0;

        const rp = await limpiar("pasajeros", "pasajeros/limpiar_prueba",
            { nombre_dueno: dueno });
        totales.pasajeros += rp.cantidad_borrados || 0;

        const re = await limpiar("empresas", "empresas/limpiar_prueba",
            { nombre_dueno: dueno });
        totales.empresas += re.cantidad_empresas_borradas || 0;
        totales.vehiculos += re.cantidad_vehiculos_borrados || 0;
        totales.salteados += re.cantidad_salteados || 0;

        const rt = await limpiar("terminales",
            "dueno/limpiar_terminales_prueba", { nombre_dueno: dueno });
        totales.terminales += rt.cantidad_borrados || 0;
        totales.salteados += rt.cantidad_salteados || 0;
    }

    // --- Global: usuarios ---
    const ru = await limpiar("usuarios",
        "administrador/limpiar_usuarios_prueba", {});
    totales.usuarios += ru.cantidad_borrados || 0;
    totales.salteados += ru.cantidad_salteados || 0;

    // --- Estado final ---
    const r_fin = await _post(ctx, "grafo/resumen", {});
    const res_fin = r_fin.resumen || {};

    return {
        exito: true,
        duenos: duenos,
        res_ini: res_ini,
        res_fin: res_fin,
        totales: totales,
    };
}