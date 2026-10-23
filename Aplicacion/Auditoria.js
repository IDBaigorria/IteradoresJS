/**
 * Cliente de la auditoría topológica del piloto.
 *
 * Hace un GET a index.php?auditar_topologia=1 dentro
 * del page context (para que viajen las cookies del
 * piloto), y devuelve el reporte parseado.
 *
 * El endpoint es de solo lectura. No modifica nada.
 * El solicitante (nombre_solicitante) se resuelve con
 * ctx.nombre_usuario_actual() y se manda por GET: el
 * piloto valida que sea admin o soporte. En local se
 * puede omitir.
 *
 * @version 1.5plugin.9n
 * @since 1.5plugin.9n
 */

import { URL_PILOTO } from "./ConfiguracionApli.js";

/**
 * Ejecuta la auditoría contra el piloto.
 *
 * @param {Object} ctx  Contexto del SW (con pestana_id y
 *                       nombre_usuario_actual()).
 * @returns {Promise<{exito: boolean, reporte?: Object,
 *   entorno?: string, duracion_ms?: number, error?: string}>}
 */
export async function ejecutar_auditoria(ctx) {
    const es_local = URL_PILOTO.indexOf("localhost") !== -1
                  || URL_PILOTO.indexOf("127.0.0.1") !== -1;
    const entorno = es_local ? "local" : "remoto";

    // Resolver el nombre del solicitante (logueado).
    let nombre_solicitante = "";
    try {
        const r_nombre = await ctx.nombre_usuario_actual();
        if (r_nombre && r_nombre.exito && r_nombre.nombre_usuario) {
            nombre_solicitante = r_nombre.nombre_usuario;
        }
    } catch (e) {
        // Sin nombre. En local se permite; en remoto, error
        // claro abajo.
    }

    if (!es_local && !nombre_solicitante) {
        return {
            exito: false,
            error: "No se pudo resolver el nombre del solicitante. Logueate como admin o soporte antes de auditar.",
            entorno: entorno,
        };
    }

    let url = URL_PILOTO + "index.php?auditar_topologia=1";
    if (nombre_solicitante) {
        url += "&nombre_solicitante=" + encodeURIComponent(nombre_solicitante);
    }

    const inicio = Date.now();
    let r;
    try {
        r = await _pedir_get_json(ctx, url);
    } catch (e) {
        return {
            exito: false,
            error: "Error de red: " + (e && e.message ? e.message : String(e)),
            entorno: entorno,
            duracion_ms: Date.now() - inicio,
        };
    }
    const duracion_ms = Date.now() - inicio;

    if (!r || !r.status) {
        return {
            exito: false,
            error: "Sin respuesta del servidor: " + (r && r.error ? r.error : "desconocido"),
            entorno: entorno,
            duracion_ms: duracion_ms,
        };
    }
    if (r.status === 403) {
        const msg = (r.json && r.json.error) ? r.json.error : "Permiso denegado (403). Necesitás estar logueado como admin o soporte.";
        return { exito: false, error: msg, entorno: entorno, duracion_ms: duracion_ms };
    }
    if (r.status !== 200) {
        return {
            exito: false,
            error: "HTTP " + r.status + (r.json && r.json.error ? ": " + r.json.error : ""),
            entorno: entorno,
            duracion_ms: duracion_ms,
        };
    }

    const reporte = r.json;
    if (!reporte || !reporte.exito) {
        return {
            exito: false,
            error: (reporte && reporte.error) || "Respuesta inesperada del servidor (no era JSON válido).",
            entorno: entorno,
            duracion_ms: duracion_ms,
        };
    }

    return {
        exito: true,
        reporte: reporte,
        entorno: entorno,
        duracion_ms: duracion_ms,
    };
}

/**
 * GET con cookies dentro del page context. Devuelve
 * { status, texto, json, error? }.
 *
 * @param {Object} ctx
 * @param {string} url_absoluta
 * @returns {Promise<Object>}
 */
async function _pedir_get_json(ctx, url_absoluta) {
    const r = await chrome.scripting.executeScript({
        target: { tabId: ctx.pestana_id },
        world: "MAIN",
        func: (url) => {
            return fetch(url, { credentials: "include" })
                .then(resp => resp.text().then(texto => {
                    let json = null;
                    try { json = JSON.parse(texto); } catch (e) { /* no era JSON */ }
                    return { status: resp.status, texto: texto, json: json };
                }))
                .catch(e => ({ status: 0, texto: "", json: null, error: e.message }));
        },
        args: [url_absoluta],
    });
    return (r && r[0] && r[0].result) ? r[0].result : { status: 0, error: "sin resultado" };
}