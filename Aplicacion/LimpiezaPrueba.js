/**
 * Limpieza de datos de prueba en el piloto.
 *
 * Version 2: acepta {categorias} para limpiar solo lo
 * relevante a una pestana (por ejemplo, solo ventas y
 * cancelaciones desde la pestana Ventas). Sin categorias,
 * limpia todo (comportamiento original).
 *
 * Categorias disponibles:
 *   ventas, cancelaciones, viajes, pasajeros,
 *   empresas, terminales, usuarios, huerfanos.
 *
 * El orden importa:
 *   - Ventas antes que cancelaciones (las cancelaciones
 *     se crean al limpiar las ventas de prueba).
 *   - Viajes antes que empresas (los micros del viaje
 *     referencian empresas).
 *   - Pasajeros y terminales antes que usuarios.
 *
 * @version 1.5plugin.7w
 * @since 1.5plugin.7m
 */

import { _post } from "./pruebas/_helpers.js";

// ============================================================
// Diccionario de acciones de limpieza
// ============================================================

const ACCIONES = {
    ventas:        { tipo: "por_dueno", endpoint: "ventas/limpiar_prueba",           etiqueta: "ventas" },
    cancelaciones: { tipo: "por_dueno", endpoint: "cancelaciones/limpiar_prueba",    etiqueta: "cancelaciones" },
    viajes:        { tipo: "por_dueno", endpoint: "viajes/limpiar_prueba",           etiqueta: "viajes" },
    pasajeros:     { tipo: "por_dueno", endpoint: "pasajeros/limpiar_prueba",        etiqueta: "pasajeros" },
    empresas:      { tipo: "por_dueno", endpoint: "empresas/limpiar_prueba",         etiqueta: "empresas" },
    terminales:    { tipo: "por_dueno", endpoint: "dueno/limpiar_terminales_prueba", etiqueta: "terminales" },
    usuarios:      { tipo: "global",    endpoint: "administrador/limpiar_usuarios_prueba", etiqueta: "usuarios" },
    huerfanos:     { tipo: "especial",  endpoint: "grafo/eliminar_huerfanos",         etiqueta: "huerfanos" }
};

const ORDEN_DEFAULT = [
    "ventas", "cancelaciones", "viajes", "pasajeros",
    "empresas", "terminales", "usuarios"
];

/**
 * Ordena las categorias segun ORDEN_DEFAULT (mantiene el
 * orden relativo y agrega "huerfanos" al final si esta).
 */
function _ordenar_categorias(categorias) {
    const set = new Set(categorias);
    const ordenadas = [];
    for (const cat of ORDEN_DEFAULT) {
        if (set.has(cat)) ordenadas.push(cat);
    }
    if (set.has("huerfanos")) ordenadas.push("huerfanos");
    return ordenadas;
}

/**
 * Ejecuta la limpieza.
 *
 * @param {object} ctx
 * @param {Function} [al_progreso]
 * @param {object} [opciones]  { categorias: [...] }
 * @returns {Promise<object>}
 */
export async function limpiar_datos_de_prueba(ctx, al_progreso, opciones = {}) {
    const progreso = (typeof al_progreso === "function")
        ? al_progreso
        : function () {};

    // Determinar categorias.
    let categorias = Array.isArray(opciones.categorias) && opciones.categorias.length > 0
        ? _ordenar_categorias(opciones.categorias)
        : ORDEN_DEFAULT.slice();

    // Descartar categorias desconocidas.
    categorias = categorias.filter((c) => ACCIONES[c]);

    if (categorias.length === 0) {
        return {
            exito: true,
            categorias: [],
            res_ini: {},
            res_fin: {},
            totales: { ventas: 0, cancelaciones: 0, viajes: 0, pasajeros: 0,
                       empresas: 0, vehiculos: 0, terminales: 0, usuarios: 0,
                       huerfanos: 0, salteados: 0 }
        };
    }

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

    // --- Duenos (solo si hay alguna categoria por_dueno) ---
    const hay_por_dueno = categorias.some((c) => ACCIONES[c].tipo === "por_dueno");
    let duenos = [];
    if (hay_por_dueno) {
        const r_duenos = await _post(ctx, "administrador/listar_duenos", {});
        if (!r_duenos.exito) {
            throw new Error("No se pudieron listar duenos: "
                + (r_duenos.error || "(sin detalle)"));
        }
        duenos = (r_duenos.duenos || []).map(function (d) {
            return typeof d === "string" ? d : d.nombre_usuario;
        });
    }

    const totales = {
        ventas: 0, cancelaciones: 0, viajes: 0, pasajeros: 0,
        empresas: 0, vehiculos: 0, terminales: 0, usuarios: 0,
        huerfanos: 0, salteados: 0
    };

    async function limpiar_por_dueno(etiqueta, endpoint, nombre_dueno) {
        const r = await _post(ctx, endpoint, { nombre_dueno: nombre_dueno });
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

    async function limpiar_global(etiqueta, endpoint) {
        const r = await _post(ctx, endpoint, {});
        if (!r.exito) {
            progreso({ tipo: "warning", etiqueta: etiqueta, error: r.error });
            return r;
        }
        const b = r.cantidad_borrados || 0;
        const s = r.cantidad_salteados || 0;
        progreso({
            tipo: "ok",
            etiqueta: etiqueta,
            borrados: b,
            salteados: s,
            extra: 0,
            salteados_detalle: r.salteados || [],
        });
        return r;
    }

    async function limpiar_huerfanos() {
        // El endpoint devuelve {exito, eliminados, total_huerfanos}.
        const r = await _post(ctx, "grafo/eliminar_huerfanos", {});
        if (!r.exito) {
            progreso({ tipo: "warning", etiqueta: "huerfanos", error: r.error });
            return r;
        }
        progreso({
            tipo: "ok",
            etiqueta: "huerfanos",
            borrados: r.eliminados || 0,
            salteados: 0,
            extra: 0,
            salteados_detalle: [],
        });
        return r;
    }

    // --- Categorias por dueno ---
    const categorias_por_dueno = categorias.filter((c) => ACCIONES[c].tipo === "por_dueno");
    if (categorias_por_dueno.length > 0) {
        for (const dueno of duenos) {
            progreso({ tipo: "dueno", nombre: dueno });

            for (const cat of categorias_por_dueno) {
                const acc = ACCIONES[cat];
                const r = await limpiar_por_dueno(acc.etiqueta, acc.endpoint, dueno);
                if (cat === "ventas") totales.ventas += r.cantidad_borrados || 0;
                if (cat === "cancelaciones") totales.cancelaciones += r.cantidad_borrados || 0;
                if (cat === "viajes") totales.viajes += r.cantidad_borrados || 0;
                if (cat === "pasajeros") totales.pasajeros += r.cantidad_borrados || 0;
                if (cat === "empresas") {
                    totales.empresas += r.cantidad_empresas_borradas || 0;
                    totales.vehiculos += r.cantidad_vehiculos_borrados || 0;
                }
                if (cat === "terminales") totales.terminales += r.cantidad_borrados || 0;
                totales.salteados += r.cantidad_salteados || 0;
            }
        }
    }

    // --- Categorias globales ---
    if (categorias.includes("usuarios")) {
        const r = await limpiar_global("usuarios", ACCIONES.usuarios.endpoint);
        totales.usuarios += r.cantidad_borrados || 0;
        totales.salteados += r.cantidad_salteados || 0;
    }

    // --- Huerfanos (especial, al final) ---
    if (categorias.includes("huerfanos")) {
        const r = await limpiar_huerfanos();
        totales.huerfanos += r.eliminados || 0;
    }

    // --- Estado final ---
    const r_fin = await _post(ctx, "grafo/resumen", {});
    const res_fin = r_fin.resumen || {};

    return {
        exito: true,
        categorias: categorias,
        duenos: duenos,
        res_ini: res_ini,
        res_fin: res_fin,
        totales: totales,
    };
}