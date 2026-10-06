/**
 * Prueba: limpiar_viajes_de_prueba limpia el subárbol.
 *
 * Verifica la Fase 2 del plan de optimización del grafo
 * (v1.5piloto.74z). Antes, `limpiar_viajes_de_prueba`
 * (llamada por el endpoint `viajes/limpiar_prueba`)
 * desenlazaba los viajes de prueba del contenedor del
 * dueño sin destruirlos, dejando el mismo subárbol
 * huérfano que `eliminar_viaje` antes de v74r
 * (~250 nodos por micro).
 *
 * Mide huérfanos con `grafo/resumen`:
 *   H0: antes de nada.
 *   H1: después de crear un viaje con prefijo
 *       "viajeprueba". Assert H1 === H0.
 *   H2: después de llamar a viajes/limpiar_prueba.
 *       Assert H2 <= H0.
 *
 * El assert H2 <= H0 (y no ===) es a propósito: si el
 * dueño tenía otros viajes de prueba huérfanos de
 * corridas anteriores, la limpieza los borra también.
 * Lo importante es que limpiar no agregue huérfanos.
 *
 * Requisitos de entorno: solo un dueño existente.
 *
 * @version 1.5plugin.5l
 */

import { CODIGO_ADMIN } from "../ConfiguracionApli.js";

// ============================================================
// Helpers internos
// ============================================================

async function _resumen_grafo(ctx, nombre_solicitante) {
    const r = await ctx.pedir_post("index.php", {
        accion: "grafo/resumen",
        nombre_solicitante
    });
    if (!r || !r.exito) {
        throw new Error("Error de red al consultar grafo/resumen: " + (r && r.error ? r.error : "(sin detalle)"));
    }
    if (!r.json || !r.json.exito) {
        throw new Error("grafo/resumen devolvió error: " + (r.json && r.json.error ? r.json.error : "(sin detalle)"));
    }
    const j = r.json.resumen || {};
    if (typeof j.huerfanos !== "number" || typeof j.total !== "number") {
        throw new Error("grafo/resumen no devolvió huerfanos/total. Respuesta: " + JSON.stringify(j).slice(0, 200));
    }
    return j;
}

async function _primer_dueno(ctx, nombre_solicitante) {
    const r = await ctx.pedir_post("index.php", {
        accion: "administrador/listar_duenos",
        nombre_solicitante
    });
    if (!r || !r.exito || !r.json || !r.json.exito) {
        throw new Error("No se pudo listar dueños: "
            + ((r && r.json && r.json.error) ? r.json.error : "(sin detalle)"));
    }
    const lista = r.json.duenos || [];
    if (!Array.isArray(lista) || lista.length === 0) {
        throw new Error("No hay dueños disponibles.");
    }
    const primero = lista[0];
    const nombre = typeof primero === "string"
        ? primero
        : (primero.nombre_usuario || primero.nombre || primero.usuario);
    if (!nombre) {
        throw new Error("No se pudo determinar el nombre del dueño: "
            + JSON.stringify(primero).slice(0, 200));
    }
    return nombre;
}

function _fecha_manana() {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return d.getFullYear() + "-"
        + String(d.getMonth() + 1).padStart(2, "0") + "-"
        + String(d.getDate()).padStart(2, "0");
}

// ============================================================
// Prueba
// ============================================================

export const prueba = {
    id: "limpiar_viajes_prueba_limpia_nodos",
    nombre: "Grafo: limpiar viajes de prueba limpia los nodos",
    descripcion: "Verifica que limpiar_viajes_de_prueba destruye el subárbol completo de cada viaje antes de desenlazarlo (Fase 2 del plan de optimización, v1.5piloto.74z). Usa el endpoint viajes/limpiar_prueba. Mide huérfanos con grafo/resumen.",
    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_ADMIN);

        const r_nombre = await ctx.nombre_usuario_actual();
        if (!r_nombre || !r_nombre.exito) {
            throw new Error("No se pudo leer el nombre de usuario del admin: "
                + (r_nombre && r_nombre.error ? r_nombre.error : "(sin detalle)"));
        }
        const nombre_admin = r_nombre.nombre_usuario;

        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);

        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;

        // 1. Crear viaje con prefijo "viajeprueba".
        const sufijo = String(Date.now()).slice(-8);
        const nombre_viaje = "viajeprueba" + sufijo;

        const rc = await ctx.pedir_post("index.php", {
            accion: "viajes/guardar",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje,
            nombre: "Viaje de prueba (limpieza)",
            fecha: _fecha_manana(),
            hora: "08:00",
            origen: "Origen Test",
            destino: "Destino Test",
            restriccion_edad: "0",
            edad_minima: "18",
            edad_maxima: "80",
            permite_efectivo: "1",
            cuotas_efectivo_max: "3",
            permite_transferencia: "1",
            cuotas_transferencia_max: "1",
            mostrar_dj_en_terminales: "0"
        });
        if (!rc || !rc.exito || !rc.json || !rc.json.exito) {
            throw new Error("No se pudo crear el viaje: "
                + ((rc && rc.json && rc.json.error) ? rc.json.error : "(sin detalle)"));
        }

        const H1 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;
        ctx.assert(H1 === H0,
            "Crear el viaje de prueba dejó huérfanos. "
            + "H0=" + H0 + ", H1=" + H1 + ", diferencia=" + (H1 - H0) + ".");

        // 2. Ejecutar la limpieza.
        const rl = await ctx.pedir_post("index.php", {
            accion: "viajes/limpiar_prueba",
            nombre_solicitante: nombre_admin,
            nombre_dueno
        });
        if (!rl || !rl.exito || !rl.json || !rl.json.exito) {
            throw new Error("No se pudo ejecutar la limpieza: "
                + ((rl && rl.json && rl.json.error) ? rl.json.error : "(sin detalle)"));
        }

        const H2 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;
        const dif = H2 - H0;
        ctx.assert(H2 <= H0,
            "limpiar_viajes_de_prueba dejó nodos huérfanos. "
            + "H0=" + H0 + ", H1=" + H1 + ", H2=" + H2
            + ", diferencia vs H0=" + dif + "."
            + (dif > 0 ? " Quedaron " + dif + " nodos huérfanos." : " Algo inesperado."));
    }
};