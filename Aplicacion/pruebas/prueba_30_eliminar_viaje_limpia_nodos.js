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
 * @version 1.5plugin.5e
 */

import { CODIGO_ADMIN } from "../ConfPlugin.js";

// ============================================================
// Helpers internos
// ============================================================

// Pide grafo/resumen y devuelve el total de nodos.
// Acepta varias formas de la respuesta por si el comando
// devuelve el resumen anidado o plano.
async function _contar_nodos(ctx) {
    const r = await ctx.pedir_post("index.php", { accion: "grafo/resumen" });
    if (!r || !r.exito) {
        throw new Error("Error de red al consultar grafo/resumen: " + (r && r.error ? r.error : "(sin detalle)"));
    }
    if (!r.json || !r.json.exito) {
        throw new Error("grafo/resumen devolvió error: " + (r.json && r.json.error ? r.json.error : "(sin detalle)")
            + " — ¿está logueado el admin?");
    }
    const j = r.json;
    let total = null;
    if (typeof j.total_nodos === "number") total = j.total_nodos;
    else if (j.resumen && typeof j.resumen.total_nodos === "number") total = j.resumen.total_nodos;
    else if (typeof j.total === "number") total = j.total;
    if (total === null || total <= 0) {
        throw new Error("No se pudo leer el total de nodos. Respuesta: " + JSON.stringify(j).slice(0, 200));
    }
    return total;
}

// Pide administrador/listar_duenos y devuelve el nombre del
// primer dueño. Acepta varias formas de la respuesta.
async function _primer_dueno(ctx) {
    const r = await ctx.pedir_post("index.php", { accion: "administrador/listar_duenos" });
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
        : (primero.nombre || primero.usuario || primero.nombre_usuario);
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

        const nombre_dueno = await _primer_dueno(ctx);
        const N0 = await _contar_nodos(ctx);

        // Crear viaje de prueba.
        const sufijo = String(Date.now()).slice(-8);
        const nombre_viaje = "viajelimpia" + sufijo;

        const rc = await ctx.pedir_post("index.php", {
            accion: "viajes/agregar",
            nombre_dueno,
            nombre_viaje,
            nombre: "Viaje de prueba (limpieza de nodos)",
            fecha: _fecha_manana(),
            hora: "08:00",
            origen: "Origen Test",
            destino: "Destino Test"
        });
        if (!rc || !rc.exito) {
            throw new Error("Error de red al crear viaje: " + (rc && rc.error ? rc.error : "(sin detalle)"));
        }
        if (!rc.json || !rc.json.exito) {
            throw new Error("viajes/agregar devolvió error: "
                + (rc.json && rc.json.error ? rc.json.error : "(sin detalle)"));
        }

        const N1 = await _contar_nodos(ctx);
        ctx.assert(N1 > N0,
            "Crear el viaje no agregó nodos (N0=" + N0 + ", N1=" + N1 + ")."
            + " ¿La acción viajes/agregar es la correcta?");

        // Eliminar el viaje.
        const rd = await ctx.pedir_post("index.php", {
            accion: "viajes/eliminar",
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

        const N2 = await _contar_nodos(ctx);
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