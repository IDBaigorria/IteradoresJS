/**
 * Prueba: editar las paradas de un viaje limpia las viejas.
 *
 * Verifica la Fase 2 del plan de optimización del grafo
 * (v1.5piloto.74u). Antes, `_guardar_paradas_intermedias`
 * vaciaba la lista de paradas pero dejaba los nodos viejos
 * vivos ("los nodos en sí quedan vivos hasta que se
 * reutilicen o queden huérfanos"). Cada edición con paradas
 * distintas dejaba huérfanas las que ya no se usaban.
 * Ahora las destruye.
 *
 * Diseño:
 *   N0: antes de crear nada.
 *   N1: después de crear el viaje con 3 paradas (A, B, C).
 *   N2: después de editar con las MISMAS 3 paradas.
 *       Assert N2 === N1 (no debe crecer).
 *   N3: después de editar con 3 paradas DISTINTAS (X, Y, Z).
 *       Assert N3 === N1 (destruyó 3 viejas, creó 3 nuevas).
 *       Si hay fuga, N3 = N1 + 3.
 *   N4: después de eliminar el viaje. Assert N4 === N0.
 *
 * @version 1.5plugin.5h
 */

import { CODIGO_ADMIN } from "../ConfPlugin.js";

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

function _fecha_manana() {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return d.getFullYear() + "-"
        + String(d.getMonth() + 1).padStart(2, "0") + "-"
        + String(d.getDate()).padStart(2, "0");
}

// Arma el body de viajes/guardar con paradas.
function _body_viaje(nombre_admin, nombre_dueno, nombre_viaje, paradas, sufijo) {
    return {
        accion: "viajes/guardar",
        nombre_solicitante: nombre_admin,
        nombre_dueno,
        nombre_viaje,
        nombre: "Viaje de prueba (paradas) " + sufijo,
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
        mostrar_dj_en_terminales: "0",
        paradas_intermedias: JSON.stringify(paradas)
    };
}

// ============================================================
// Prueba
// ============================================================

export const prueba = {
    id: "editar_paradas_limpia_nodos",
    nombre: "Grafo: editar paradas limpia los nodos viejos",
    descripcion: "Verifica que editar las paradas de un viaje destruye las viejas no reutilizadas (Fase 2 del plan de optimización, v1.5piloto.74u). Mide nodos en 4 estados con grafo/resumen.",
    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_ADMIN);

        const r_nombre = await ctx.nombre_usuario_actual();
        if (!r_nombre || !r_nombre.exito) {
            throw new Error("No se pudo leer el nombre de usuario del admin: "
                + (r_nombre && r_nombre.error ? r_nombre.error : "(sin detalle)"));
        }
        const nombre_admin = r_nombre.nombre_usuario;

        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);
        const N0 = await _contar_nodos(ctx, nombre_admin);

        const sufijo = String(Date.now()).slice(-8);
        const nombre_viaje = "viajeparadgraf" + sufijo;

        // 1. Crear viaje con 3 paradas: A, B, C.
        const paradas_abc = ["Parada A", "Parada B", "Parada C"];
        const rc = await ctx.pedir_post("index.php",
            _body_viaje(nombre_admin, nombre_dueno, nombre_viaje, paradas_abc, sufijo));
        if (!rc || !rc.exito || !rc.json || !rc.json.exito) {
            throw new Error("No se pudo crear el viaje: "
                + ((rc && rc.json && rc.json.error) ? rc.json.error : "(sin detalle)"));
        }

        const N1 = await _contar_nodos(ctx, nombre_admin);
        ctx.assert(N1 > N0, "Crear el viaje no agregó nodos (N0=" + N0 + ", N1=" + N1 + ").");

        // 2. Editar con las MISMAS 3 paradas. Debe reutilizar los
        //    nodos existentes, sin cambiar el total.
        const re = await ctx.pedir_post("index.php",
            _body_viaje(nombre_admin, nombre_dueno, nombre_viaje, paradas_abc, sufijo));
        if (!re || !re.exito || !re.json || !re.json.exito) {
            throw new Error("No se pudo editar el viaje (mismas paradas): "
                + ((re && re.json && re.json.error) ? re.json.error : "(sin detalle)"));
        }

        const N2 = await _contar_nodos(ctx, nombre_admin);
        ctx.assert(N2 === N1,
            "Editar con las mismas paradas no debe cambiar el total de nodos. "
            + "N1=" + N1 + ", N2=" + N2 + ", diferencia=" + (N2 - N1) + ".");

        // 3. Editar con 3 paradas DISTINTAS: X, Y, Z. Debe destruir
        //    las 3 viejas y crear 3 nuevas. Total debe quedar igual.
        const paradas_xyz = ["Parada X", "Parada Y", "Parada Z"];
        const rx = await ctx.pedir_post("index.php",
            _body_viaje(nombre_admin, nombre_dueno, nombre_viaje, paradas_xyz, sufijo));
        if (!rx || !rx.exito || !rx.json || !rx.json.exito) {
            throw new Error("No se pudo editar el viaje (paradas nuevas): "
                + ((rx && rx.json && rx.json.error) ? rx.json.error : "(sin detalle)"));
        }

        const N3 = await _contar_nodos(ctx, nombre_admin);
        const dif = N3 - N1;
        ctx.assert(N3 === N1,
            "Editar con 3 paradas distintas no debe cambiar el total de nodos (destruye 3, crea 3). "
            + "N1=" + N1 + ", N3=" + N3 + ", diferencia=" + dif + "."
            + (dif > 0
                ? " Quedaron " + dif + " nodos huérfanos de las paradas viejas."
                : " Algo inesperado."));

        // 4. Limpieza.
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