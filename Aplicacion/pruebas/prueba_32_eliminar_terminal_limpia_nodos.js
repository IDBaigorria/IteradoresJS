/**
 * Prueba: eliminar_terminal_autorizada limpia el TerminalViaje.
 *
 * Verifica la Fase 2 del plan de optimización del grafo
 * (v1.5piloto.74u). Antes, `eliminar_terminal_autorizada`
 * desenlazaba el TerminalViaje del contenedor
 * `terminales_autorizadas` pero no lo destruía. El nodo
 * TerminalViaje (con sus campos: terminal,
 * cambiar_punto_predeterminado, overrides de pago) quedaba
 * huérfano. Ahora lo destruye reutilizando
 * `_destruir_terminal_viaje`.
 *
 * Requisito de entorno: el dueño elegido debe tener al
 * menos una terminal (creada con `dueno/agregar_terminal`).
 * Si no la tiene, la prueba falla con mensaje claro
 * pidiendo crearla.
 *
 * @version 1.5plugin.5h
 */

import { CODIGO_ADMIN } from "../ConfiguracionApli.js";

// ============================================================
// Helpers internos
// ============================================================

async function _contar_nodos(ctx, nombre_solicitante) {
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
    const j = r.json;
    let total = null;
    if (j.resumen && typeof j.resumen.total_nodos === "number") total = j.resumen.total_nodos;
    else if (typeof j.resumen.total === "number") total = j.resumen.total;
    else if (typeof j.total_nodos === "number") total = j.total_nodos;
    else if (typeof j.total === "number") total = j.total;
    if (total === null || total <= 0) {
        throw new Error("No se pudo leer el total de nodos. Respuesta: " + JSON.stringify(j).slice(0, 200));
    }
    return total;
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

async function _primera_terminal(ctx, nombre_solicitante, nombre_dueno) {
    const r = await ctx.pedir_post("index.php", {
        accion: "dueno/listar_terminales",
        nombre_solicitante,
        nombre_dueno
    });
    if (!r || !r.exito || !r.json || !r.json.exito) {
        throw new Error("No se pudo listar terminales: "
            + ((r && r.json && r.json.error) ? r.json.error : "(sin detalle)"));
    }
    const lista = r.json.terminales || [];
    if (!Array.isArray(lista) || lista.length === 0) {
        throw new Error("El dueño " + nombre_dueno + " no tiene terminales."
            + " Creá una desde la pestaña Puntos de venta antes de correr esta prueba.");
    }
    const primera = lista[0];
    const nombre = typeof primera === "string"
        ? primera
        : (primera.nombre_usuario || primera.nombre || primera.usuario);
    if (!nombre) {
        throw new Error("No se pudo determinar el nombre de la terminal: "
            + JSON.stringify(primera).slice(0, 200));
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
    id: "eliminar_terminal_limpia_nodos",
    nombre: "Grafo: eliminar terminal limpia los nodos",
    descripcion: "Verifica que eliminar_terminal_autorizada destruye el TerminalViaje (Fase 2 del plan de optimización, v1.5piloto.74u). Mide nodos con grafo/resumen antes y después.",
    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_ADMIN);

        const r_nombre = await ctx.nombre_usuario_actual();
        if (!r_nombre || !r_nombre.exito) {
            throw new Error("No se pudo leer el nombre de usuario del admin: "
                + (r_nombre && r_nombre.error ? r_nombre.error : "(sin detalle)"));
        }
        const nombre_admin = r_nombre.nombre_usuario;

        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);
        const nombre_terminal = await _primera_terminal(ctx, nombre_admin, nombre_dueno);

        const N0 = await _contar_nodos(ctx, nombre_admin);

        // Crear viaje de prueba.
        const sufijo = String(Date.now()).slice(-8);
        const nombre_viaje = "viajetermgraf" + sufijo;

        const rc = await ctx.pedir_post("index.php", {
            accion: "viajes/guardar",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje,
            nombre: "Viaje de prueba (eliminar terminal)",
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

        const N1 = await _contar_nodos(ctx, nombre_admin);
        ctx.assert(N1 > N0, "Crear el viaje no agregó nodos (N0=" + N0 + ", N1=" + N1 + ").");

        // Autorizar la terminal.
        const ra = await ctx.pedir_post("index.php", {
            accion: "viajes/agregar_terminal",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje,
            nombre_terminal
        });
        if (!ra || !ra.exito || !ra.json || !ra.json.exito) {
            throw new Error("No se pudo autorizar la terminal: "
                + ((ra && ra.json && ra.json.error) ? ra.json.error : "(sin detalle)"));
        }

        const N2 = await _contar_nodos(ctx, nombre_admin);
        ctx.assert(N2 > N1,
            "Autorizar la terminal no agregó nodos (N1=" + N1 + ", N2=" + N2 + ").");

        // Desautorizar la terminal.
        const rd = await ctx.pedir_post("index.php", {
            accion: "viajes/eliminar_terminal",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje,
            nombre_terminal
        });
        if (!rd || !rd.exito || !rd.json || !rd.json.exito) {
            throw new Error("No se pudo desautorizar la terminal: "
                + ((rd && rd.json && rd.json.error) ? rd.json.error : "(sin detalle)"));
        }

        const N3 = await _contar_nodos(ctx, nombre_admin);
        const dif = N3 - N1;
        ctx.assert(N3 === N1,
            "eliminar_terminal_autorizada no limpió los nodos del TerminalViaje. "
            + "N1=" + N1 + ", N2=" + N2 + ", N3=" + N3
            + ", diferencia vs N1=" + dif + "."
            + (dif > 0 ? " Quedaron " + dif + " nodos huérfanos." : " Algo inesperado."));

        // Limpieza: eliminar el viaje.
        const rv = await ctx.pedir_post("index.php", {
            accion: "viajes/eliminar",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje
        });
        if (!rv || !rv.exito || !rv.json || !rv.json.exito) {
            throw new Error("No se pudo eliminar el viaje de limpieza: "
                + ((rv && rv.json && rv.json.error) ? rv.json.error : "(sin detalle)"));
        }

        const N4 = await _contar_nodos(ctx, nombre_admin);
        ctx.assert(N4 === N0,
            "El flujo completo no volvió al estado inicial. "
            + "N0=" + N0 + ", N4=" + N4 + ", diferencia=" + (N4 - N0) + ".");
    }
};