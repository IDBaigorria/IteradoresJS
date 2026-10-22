/**
 * Módulo de migraciones del piloto PHP.
 *
 * Ejecuta la secuencia completa de migraciones (8 pasos sin
 * migrar_topologia, más el drenado del buzón). Cada paso es
 * un GET a un endpoint de index.php del piloto.
 *
 * La secuencia vive acá. El estado se persiste en el grafo
 * vía GrafoPlugin.js.
 *
 * @version 1.5plugin.9e
 */

import { URL_PILOTO, CODIGO_DUENO } from "./ConfiguracionApli.js";

// ============================================================
// Lista de pasos
// ============================================================
//
// Cada paso: { id, url, nombre, peligroso, default, tooltip }.
// - peligroso: muestra un ícono de advertencia en el popup.
// - default: si viene activado en el form.
// - tooltip: texto de la advertencia.
export const PASOS_MIGRACION = [
    {
        id: "migrar_a_sql64",
        url: "index.php?migrar_a_sql64=1",
        nombre: "Migrar SQL → SQL64",
        peligroso: true,
        default: true,
        tooltip: "Reemplaza SQL64 con lo que hay en SQL. Solo correr en un reset fresco: si la app se usó desde la última migración, los cambios en SQL64 se pierden.",
    },
    {
        id: "migrar_usuarios_especiales",
        url: "index.php?migrar_usuarios_especiales=1",
        nombre: "Usuarios a IDs especiales (us_<nombre>)",
        default: true,
    },
    {
        id: "migrar_niveles_usuario",
        url: "index.php?migrar_niveles_usuario=1",
        nombre: "Contenedores publico/privado",
        default: true,
    },
    {
        id: "migrar_compartidos_terminal",
        url: "index.php?migrar_compartidos_terminal=1",
        nombre: "Compartidos por terminal",
        default: true,
    },
    {
        id: "construir_arboles_compartidos",
        url: "index.php?construir_arboles_compartidos=1",
        nombre: "Árboles parametrizados en compartidos",
        default: true,
    },
    {
        id: "repuntar_terminales_compartido",
        url: "index.php?repuntar_terminales_compartido=1",
        nombre: "Repuntar terminales al compartido",
        default: true,
    },
    {
        id: "migrar_topologia",
        url: "index.php?migrar_topologia=1",
        nombre: "Migración topológica (admin + soporte singular)",
        peligroso: true,
        default: false,
        tooltip: "Crea el enlace soporte (singular, legacy). No correr si ya tenés soportes con el diseño nuevo (soportes plural). El admin link lo cubre el paso reparar_topologia.",
    },
    {
        id: "reparar_topologia",
        url: "index.php?reparar_topologia=1",
        nombre: "Reparar topología",
        default: true,
    },
    {
        id: "reparar_arboles",
        url: "index.php?reparar_arboles=1",
        nombre: "Reparar árboles hmi/hd/p",
        default: true,
    },
];

// ============================================================
// Ejecución
// ============================================================

/**
 * Ejecuta la secuencia de migraciones seleccionada.
 *
 * @param {Object}   ctx           Contexto del SW (con pestana_id).
 * @param {Object}   opciones      { pasos: {id: bool}, drenar_buzon: bool }
 * @param {Function} al_progreso   cb(evento) con {paso_id, estado, mensaje, duracion_ms, output?}.
 * @param {Function} debe_cancelar cb() -> bool. Si devuelve true, se aborta entre pasos.
 * @param {Object}   pasos_ya_ok   {id: true} de pasos ya completados (para reanudar).
 * @returns {Promise<{exito: boolean, resultados: Array, cancelada: boolean, error?: string}>}
 */
export async function ejecutar_migracion(ctx, opciones, al_progreso, debe_cancelar, pasos_ya_ok) {
    pasos_ya_ok = pasos_ya_ok || {};
    const resultados = [];

    for (const paso of PASOS_MIGRACION) {
        if (debe_cancelar && debe_cancelar()) {
            for (const p of PASOS_MIGRACION.slice(PASOS_MIGRACION.indexOf(paso))) {
                resultados.push({ paso: p.id, estado: "pendiente", mensaje: "Cancelado" });
            }
            return { exito: false, cancelada: true, resultados };
        }

        if (!opciones.pasos[paso.id]) {
            resultados.push({ paso: paso.id, estado: "saltado", mensaje: "No seleccionado" });
            await al_progreso({ paso_id: paso.id, estado: "saltado", mensaje: "No seleccionado" });
            continue;
        }

        if (pasos_ya_ok[paso.id]) {
            resultados.push({ paso: paso.id, estado: "ok", mensaje: "Ya estaba OK" });
            await al_progreso({ paso_id: paso.id, estado: "ok", mensaje: "Ya estaba OK" });
            continue;
        }

        await al_progreso({ paso_id: paso.id, estado: "corriendo" });
        const inicio = Date.now();
        let r;
        try {
            r = await _pedir_get_pagina(ctx, paso.url);
        } catch (e) {
            r = { status: 0, texto: "", error: e.message };
        }
        const duracion_ms = Date.now() - inicio;
        const parsed = _parsear_output(paso, r);
        resultados.push({
            paso: paso.id,
            estado: parsed.estado,
            mensaje: parsed.mensaje,
            output: r.texto,
            duracion_ms: duracion_ms,
        });
        await al_progreso({
            paso_id: paso.id,
            estado: parsed.estado,
            mensaje: parsed.mensaje,
            duracion_ms: duracion_ms,
            output: r.texto,
        });

        if (parsed.estado === "error") {
            const idx_actual = PASOS_MIGRACION.indexOf(paso);
            for (const p of PASOS_MIGRACION.slice(idx_actual + 1)) {
                resultados.push({ paso: p.id, estado: "pendiente", mensaje: "Abortado por error previo" });
                await al_progreso({ paso_id: p.id, estado: "pendiente", mensaje: "Abortado por error previo" });
            }
            return { exito: false, resultados, error: "Paso " + paso.id + ": " + parsed.mensaje };
        }
    }

    if (opciones.drenar_buzon) {
        await al_progreso({ paso_id: "drenar_buzon", estado: "corriendo" });
        const inicio = Date.now();
        let r;
        try {
            r = await drenar_buzon(ctx);
        } catch (e) {
            r = { exito: false, error: e.message };
        }
        const duracion_ms = Date.now() - inicio;
        resultados.push({
            paso: "drenar_buzon",
            estado: r.exito ? "ok" : "error",
            mensaje: r.exito ? "Buzón drenado" : (r.error || "Error desconocido"),
            duracion_ms: duracion_ms,
        });
        await al_progreso({
            paso_id: "drenar_buzon",
            estado: r.exito ? "ok" : "error",
            mensaje: r.exito ? "Buzón drenado" : (r.error || "Error desconocido"),
            duracion_ms: duracion_ms,
        });
    } else {
        await al_progreso({ paso_id: "drenar_buzon", estado: "saltado", mensaje: "No seleccionado" });
    }

    return { exito: true, resultados };
}

// ============================================================
// GET dentro del page context (para enviar cookies)
// ============================================================
async function _pedir_get_pagina(ctx, path) {
    const r = await chrome.scripting.executeScript({
        target: { tabId: ctx.pestana_id },
        world: "MAIN",
        func: (url) => {
            return fetch(url, { credentials: "include" })
                .then(r => r.text().then(texto => ({ status: r.status, texto: texto })))
                .catch(e => ({ status: 0, texto: "", error: e.message }));
        },
        args: [URL_PILOTO + path],
    });
    return (r && r[0] && r[0].result) ? r[0].result : { status: 0, texto: "", error: "sin resultado" };
}

// ============================================================
// Parser de output
// ============================================================
function _parsear_output(paso, r) {
    const texto = (r && r.texto) ? r.texto : "";
    const status = (r && r.status) ? r.status : 0;

    if (r && r.error) return { estado: "error", mensaje: "Red: " + r.error };
    if (status >= 500) {
        const m = texto.match(/(?:Fatal error|^ERROR:)[^\n]*/im);
        return { estado: "error", mensaje: m ? m[0].slice(0, 120) : "HTTP " + status };
    }

    // v1.5plugin.9e: solo matchear errores reales. El piloto
    // imprime "errores:" (vacío, lowercase) y "Errores:" (label
    // de array con contenido abajo) en outputs exitosos. El
    // regex anterior era case-insensitive y matcheaba "errores"
    // como si fuera un error. Ahora solo "ERROR:" (mayúscula
    // al principio de línea) y "Fatal error" son errores.
    const err_match = texto.match(/(?:Fatal error|^ERROR:)[^\n]*/im);
    if (err_match) return { estado: "error", mensaje: err_match[0].slice(0, 120) };

    // Saltado: "saltados => N", "Saltados: N", "cambios aplicados: N"
    // (N>0). El piloto usa "=>" en algunas migraciones y ":" en
    // otras; el regex acepta los dos formatos.
    if (/(?:saltados?|cambios aplicados)\s*(?:=>|:)\s*[1-9]/i.test(texto)) {
        return { estado: "saltado", mensaje: "Ya estaba migrado / sin cambios" };
    }
    if (/no existe en SQL\. Se saltea/i.test(texto)) return { estado: "saltado", mensaje: "No existe en SQL" };

    if (/Listo\./i.test(texto) || /Guardado\./i.test(texto)) {
        return { estado: "ok", mensaje: "" };
    }

    if (status === 200) return { estado: "ambiguo", mensaje: "Output no reconocido" };
    return { estado: "error", mensaje: "HTTP " + status };
}

// ============================================================
// Drenar buzón
// ============================================================
//
// Logout + login dueño + ir a Vendidos + esperar + logout.
//
// Al terminar, el usuario queda deslogueado. El panel lo
// advierte antes de correr.
export async function drenar_buzon(ctx) {
    // 1. Login como dueño de prueba.
    try {
        await ctx.asegurar_login(CODIGO_DUENO);
    } catch (e) {
        return { exito: false, error: "Login dueño falló: " + e.message + ". Drenar manualmente." };
    }

    // 2. Ir a Vendidos.
    try {
        await ctx.activar_pestana_piloto("vendidos");
    } catch (e) {
        try { await ctx.clic('.tab[data-tab="vendidos"]'); }
        catch (e2) {
            try { await ctx.cerrar_sesion(); } catch (e3) {}
            return { exito: false, error: "No se pudo abrir Vendidos" };
        }
    }

    // 3. Esperar a que la lista cargue (o a que aparezca el mensaje de vacío).
    try {
        await ctx.esperar("#lista_ventas", 30000);
    } catch (e) { /* no es crítico */ }
    await ctx.pausa(2000);

    // 4. Logout.
    try {
        await ctx.cerrar_sesion();
    } catch (e) { /* no es crítico */ }

    return { exito: true };
}