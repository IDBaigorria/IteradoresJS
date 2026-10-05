/**
 * Prueba: eliminar_usuario limpia el subárbol del usuario.
 *
 * Verifica la Fase 2 del plan de optimización del grafo
 * (v1.5piloto.75). Antes, `eliminar_usuario` destruía el
 * nodo usuario pero dejaba huérfanos:
 *  - sus campos (nivel, nombre_real, email, efectivo),
 *  - el contenedor `banco` con sus hijos (nombre, cuenta),
 *  - el nodo credencial con sus campos (codigo_hash,
 *    contrasena, intentos_fallidos, bloqueado_hasta,
 *    ultimo_acceso, ip_ultimo_acceso),
 *  - las sesiones activas del usuario.
 *
 * Mide huérfanos con `grafo/resumen`:
 *   H0: antes de nada.
 *   H1: después de crear el usuario. Assert H1 === H0.
 *   H2: después de eliminarlo. Assert H2 === H0.
 *
 * Se crea un usuario nivel terminal colgando de un dueño
 * existente. El alta escribe credenciales en el grafo
 * aparte (codigo_hash, intentos_fallidos), así que esta
 * prueba también ejerce la parte de credenciales del fix.
 *
 * Requisitos de entorno: al menos un dueño existente.
 *
 * @version 1.5plugin.5m
 */

import { CODIGO_ADMIN } from "../ConfPlugin.js";

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

// ============================================================
// Prueba
// ============================================================

export const prueba = {
    id: "eliminar_usuario_limpia_nodos",
    nombre: "Grafo: eliminar usuario limpia los nodos",
    descripcion: "Verifica que eliminar un usuario destruye su subárbol completo: campos del nodo usuario, banco con hijos, nodo credencial con sus campos, y sesiones activas (Fase 2 del plan de optimización, v1.5piloto.75). Mide huérfanos con grafo/resumen.",
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

        // Usuario de prueba: nivel terminal, colgando del dueño.
        const sufijo = String(Date.now()).slice(-8);
        const nombre_usuario = "usuariograf" + sufijo;
        const codigo_acceso = "cod" + sufijo;

        // 1. Crear usuario.
        const rc = await ctx.pedir_post("index.php", {
            accion: "administrador/agregar_usuario",
            nombre_solicitante: nombre_admin,
            nombre_usuario,
            nivel: "terminal",
            dueno: nombre_dueno,
            codigo_acceso,
            banco_nombre: "Banco Prueba",
            banco_cuenta: "0001"
        });
        if (!rc || !rc.exito || !rc.json || !rc.json.exito) {
            throw new Error("No se pudo crear el usuario: "
                + ((rc && rc.json && rc.json.error) ? rc.json.error : "(sin detalle)"));
        }

        const H1 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;
        ctx.assert(H1 === H0,
            "Crear el usuario dejó huérfanos. "
            + "H0=" + H0 + ", H1=" + H1 + ", diferencia=" + (H1 - H0) + ".");

        // 2. Eliminar usuario.
        const rd = await ctx.pedir_post("index.php", {
            accion: "administrador/eliminar_usuario",
            nombre_solicitante: nombre_admin,
            nombre_usuario
        });
        if (!rd || !rd.exito || !rd.json || !rd.json.exito) {
            throw new Error("No se pudo eliminar el usuario: "
                + ((rd && rd.json && rd.json.error) ? rd.json.error : "(sin detalle)"));
        }

        const H2 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;
        const dif = H2 - H0;
        ctx.assert(H2 === H0,
            "eliminar_usuario dejó nodos huérfanos. "
            + "H0=" + H0 + ", H1=" + H1 + ", H2=" + H2
            + ", diferencia vs H0=" + dif + "."
            + (dif > 0 ? " Quedaron " + dif + " nodos huérfanos." : " Algo inesperado."));
    }
};