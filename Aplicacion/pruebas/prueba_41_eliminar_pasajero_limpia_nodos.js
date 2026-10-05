/**
 * Prueba: eliminar_pasajero limpia el subárbol del pasajero.
 *
 * Verifica la Fase 2 del plan de optimización del grafo
 * (v1.5piloto.76). Antes, `eliminar_pasajero` destruía el
 * nodo pasajero pero dejaba huérfanos sus campos
 * (nombres, apellido, email, celular, celular_emergencia,
 * fecha_nacimiento, localidad, direccion,
 * fecha_ultima_modificacion) y la declaración jurada
 * adjunta si la había. ~12-15 nodos por pasajero.
 *
 * Mide huérfanos con `grafo/resumen`:
 *   H0: antes de nada.
 *   H1: después de crear el pasajero. Assert H1 === H0.
 *   H2: después de eliminarlo. Assert H2 === H0.
 *
 * Nota: la prueba NO cubre la declaración jurada adjunta
 * (subir / reemplazar / eliminar archivo). Subir archivos
 * desde el plugin requiere FormData con multipart, que
 * hoy no está entre los helpers de `ctx`. Queda anotado
 * como pendiente en el prompt del plugin.
 *
 * Requisitos de entorno: al menos un dueño existente.
 *
 * @version 1.5plugin.5n
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

// DNI único de 8 dígitos.
function _dni_unico() {
    const base = Date.now() % 90000000;
    return String(base + 10000000);
}

// ============================================================
// Prueba
// ============================================================

export const prueba = {
    id: "eliminar_pasajero_limpia_nodos",
    nombre: "Grafo: eliminar pasajero limpia los nodos",
    descripcion: "Verifica que eliminar un pasajero destruye su subárbol completo (campos personales + fecha_ultima_modificacion) (Fase 2 del plan de optimización, v1.5piloto.76). No cubre la DJ adjunta. Mide huérfanos con grafo/resumen.",
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

        // 1. Crear pasajero con todos los campos.
        const dni = _dni_unico();
        const sufijo = String(Date.now()).slice(-8);

        const rc = await ctx.pedir_post("index.php", {
            accion: "pasajeros/crear",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            dni,
            apellido: "Prueba",
            nombres: "Grafo",
            email: "pasgraf_" + sufijo + "@test.local",
            celular: "2983555123",
            celular_emergencia: "2983555222",
            fecha_nacimiento: "1990-06-15",
            direccion: "Calle Grafo 1",
            localidad: "Tres Arroyos"
        });
        if (!rc || !rc.exito || !rc.json || !rc.json.exito) {
            throw new Error("No se pudo crear el pasajero: "
                + ((rc && rc.json && rc.json.error) ? rc.json.error : "(sin detalle)"));
        }

        const H1 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;
        ctx.assert(H1 === H0,
            "Crear el pasajero dejó huérfanos. "
            + "H0=" + H0 + ", H1=" + H1 + ", diferencia=" + (H1 - H0) + ".");

        // 2. Eliminar el pasajero.
        const rd = await ctx.pedir_post("index.php", {
            accion: "pasajeros/eliminar",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            dni
        });
        if (!rd || !rd.exito || !rd.json || !rd.json.exito) {
            throw new Error("No se pudo eliminar el pasajero: "
                + ((rd && rd.json && rd.json.error) ? rd.json.error : "(sin detalle)"));
        }

        const H2 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;
        const dif = H2 - H0;
        ctx.assert(H2 === H0,
            "eliminar_pasajero dejó nodos huérfanos. "
            + "H0=" + H0 + ", H1=" + H1 + ", H2=" + H2
            + ", diferencia vs H0=" + dif + "."
            + (dif > 0 ? " Quedaron " + dif + " nodos huérfanos." : " Algo inesperado."));
    }
};