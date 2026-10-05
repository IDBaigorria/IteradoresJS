/**
 * Prueba: eliminar_viaje limpia el subárbol completo.
 *
 * Verifica la Fase 2 del plan de optimización del grafo
 * (v1.5piloto.74r). Antes, `eliminar_viaje` solo
 * desenlazaba el viaje del contenedor del dueño: el nodo
 * viaje, sus micros, copias de vehículo, asientos,
 * TerminalViaje, paradas, DJs y opciones avanzadas
 * quedaban huérfanos. Ahora los destruye.
 *
 * Mide el total de nodos antes y después con
 * `grafo/resumen`, y compara. Se corre entera con admin
 * logueado: el admin tiene acceso al grafo y puede crear
 * y eliminar viajes de cualquier dueño vía POST.
 *
 * Nota: la prueba crea un viaje sin micros. Alcanza para
 * verificar que la destrucción del subárbol del viaje
 * (contenedores, campos, DJs, opciones) funciona. La parte
 * de micros + copia de vehículo + asientos se verifica
 * aparte (pendiente).
 *
 * @version 1.5plugin.5f
 */

import { CODIGO_ADMIN } from "../ConfPlugin.js";

// ============================================================
// Helpers internos
// ============================================================

// Pide grafo/resumen y devuelve el total de nodos.
// El módulo `grafo` del enrutador exige nombre_solicitante
// con nivel admin o soporte.
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

// Pide administrador/listar_duenos y devuelve el nombre del
// primer dueño. El módulo `administrador` exige
// nombre_solicitante con nivel admin o soporte.
async function _primer_dueno(ctx, nombre_solicitante) {
    const r = await ctx.pedir_post("index.php", {
        accion: "administrador/listar_duenos",
        nombre_solicitante
    });
    if (!r || !r.exito) {
        throw new Error("Error de red al listar dueños: " + (r && r.error ? r.error : "(sin detalle)"));
    }
    if (!r.json || !r.json.exito) {
        throw new Error("administrador/listar_duenos devolvió error: "
            + (r.json && r.json.error ? r.json.error : "(sin detalle)"));
    }
    const j = r.json;
    const lista = j.duenos || j.usuarios || j.lista || [];
    if (!Array.isArray(lista) || lista.length === 0) {
        throw new Error("No hay dueños disponibles para la prueba. Creá uno desde el panel admin.");
    }
    const primero = lista[0];
    const nombre = typeof primero === "string"
        ? primero
        : (primero.nombre_usuario || primero.nombre || primero.usuario);
    if (!nombre) {
        throw new Error("No se pudo determinar el nombre del dueño. Formato inesperado: "
            + JSON.stringify(primero).slice(0, 200));
    }
    return nombre;
}

// Arma una fecha YYYY-MM-DD para mañana.
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
    id: "eliminar_viaje_limpia_nodos",
    nombre: "Grafo: eliminar viaje limpia los nodos",
    descripcion: "Verifica que eliminar un viaje destruye el subárbol completo (Fase 2 del plan de optimización, v1.5piloto.74r). Mide el total de nodos con grafo/resumen antes y después, y compara.",
    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_ADMIN);

        // El nombre de usuario del admin no se conoce de antemano.
        // Se lee del page context (usuario_actual.nombre_usuario).
        const r_nombre = await ctx.nombre_usuario_actual();
        if (!r_nombre || !r_nombre.exito) {
            throw new Error("No se pudo leer el nombre de usuario del admin: "
                + (r_nombre && r_nombre.error ? r_nombre.error : "(sin detalle)"));
        }
        const nombre_admin = r_nombre.nombre_usuario;

        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);
        const N0 = await _contar_nodos(ctx, nombre_admin);

        // Crear viaje de prueba. La acción del enrutador es
        // viajes/guardar (alta o edición unificada).
        const sufijo = String(Date.now()).slice(-8);
        const nombre_viaje = "viajelimpia" + sufijo;

        const rc = await ctx.pedir_post("index.php", {
            accion: "viajes/guardar",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje,
            nombre: "Viaje de prueba (limpieza de nodos)",
            fecha: _fecha_manana(),
            hora: "08:00",
            origen: "Origen Test",
            destino: "Destino Test",
            // Defaults de opciones avanzadas (los exige
            // guardar_viaje_completo).
            restriccion_edad: "0",
            edad_minima: "18",
            edad_maxima: "80",
            permite_efectivo: "1",
            cuotas_efectivo_max: "3",
            permite_transferencia: "1",
            cuotas_transferencia_max: "1",
            mostrar_dj_en_terminales: "0"
        });
        if (!rc || !rc.exito) {
            throw new Error("Error de red al crear viaje: " + (rc && rc.error ? rc.error : "(sin detalle)"));
        }
        if (!rc.json || !rc.json.exito) {
            throw new Error("viajes/guardar devolvió error: "
                + (rc.json && rc.json.error ? rc.json.error : "(sin detalle)"));
        }

        const N1 = await _contar_nodos(ctx, nombre_admin);
        ctx.assert(N1 > N0,
            "Crear el viaje no agregó nodos (N0=" + N0 + ", N1=" + N1 + ")."
            + " ¿La acción viajes/guardar es la correcta?");

        // Eliminar el viaje.
        const rd = await ctx.pedir_post("index.php", {
            accion: "viajes/eliminar",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje
        });
        if (!rd || !rd.exito) {
            throw new Error("Error de red al eliminar viaje: " + (rd && rd.error ? rd.error : "(sin detalle)"));
        }
        if (!rd.json || !rd.json.exito) {
            throw new Error("viajes/eliminar devolvió error: "
                + (rd.json && rd.json.error ? rd.json.error : "(sin detalle)"));
        }

        const N2 = await _contar_nodos(ctx, nombre_admin);
        const dif = N2 - N0;
        ctx.assert(N2 === N0,
            "eliminar_viaje no limpió todos los nodos. "
            + "N0=" + N0 + ", N1=" + N1 + ", N2=" + N2
            + ", diferencia=" + dif + "."
            + (dif > 0
                ? " Quedaron " + dif + " nodos huérfanos."
                : " ¿Se creó o destruyó algo inesperado?"));
    }
};