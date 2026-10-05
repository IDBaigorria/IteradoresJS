/**
 * Prueba: quitarle la hora a una parada destruye la hoja.
 *
 * Verifica la Fase 2 del plan de optimización del grafo
 * (v1.5piloto.75a). Antes, `_guardar_paradas_intermedias`
 * desenlazaba el enlace `hora_estimada` del nodo parada
 * sin destruir la hoja: cada edición que quitaba la hora
 * dejaba 1 nodo huérfano por parada.
 *
 * Mide huérfanos con `grafo/resumen`:
 *   H0: antes de nada.
 *   H1: después de crear el viaje con 2 paradas CON hora.
 *       Assert H1 === H0.
 *   H2: después de editar el viaje con las mismas 2
 *       paradas SIN hora. Assert H2 === H0.
 *
 * El paso 4 dispara la destrucción de las 2 hojas
 * `hora_estimada` (una por parada). Sin el fix, H2 = H0 + 2.
 *
 * Requisitos de entorno: al menos un dueño existente.
 *
 * @version 1.5plugin.5o
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

function _fecha_manana() {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return d.getFullYear() + "-"
        + String(d.getMonth() + 1).padStart(2, "0") + "-"
        + String(d.getDate()).padStart(2, "0");
}

// Arma el body de viajes/guardar con las paradas dadas.
function _body_viaje(nombre_admin, nombre_dueno, nombre_viaje, paradas) {
    return {
        accion: "viajes/guardar",
        nombre_solicitante: nombre_admin,
        nombre_dueno,
        nombre_viaje,
        nombre: "Viaje de prueba (paradas sin hora)",
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
    id: "editar_paradas_sin_hora_limpia_nodos",
    nombre: "Grafo: editar paradas sin hora limpia los nodos",
    descripcion: "Verifica que quitarle la hora a una parada destruye su hoja hora_estimada (Fase 2 del plan de optimización, v1.5piloto.75a). Mide huérfanos con grafo/resumen antes y después.",
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

        const sufijo = String(Date.now()).slice(-8);
        const nombre_viaje = "viajeparahora" + sufijo;

        // 1. Crear viaje con 2 paradas CON hora.
        const paradas_con_hora = [
            { nombre: "Parada A", hora_estimada: "09:30" },
            { nombre: "Parada B", hora_estimada: "10:45" }
        ];
        const rc = await ctx.pedir_post("index.php",
            _body_viaje(nombre_admin, nombre_dueno, nombre_viaje, paradas_con_hora));
        if (!rc || !rc.exito || !rc.json || !rc.json.exito) {
            throw new Error("No se pudo crear el viaje: "
                + ((rc && rc.json && rc.json.error) ? rc.json.error : "(sin detalle)"));
        }

        const H1 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;
        ctx.assert(H1 === H0,
            "Crear el viaje con paradas (con hora) dejó huérfanos. "
            + "H0=" + H0 + ", H1=" + H1 + ", diferencia=" + (H1 - H0) + ".");

        // 2. Editar el viaje: mismas paradas, SIN hora.
        //    Dispara _guardar_paradas_intermedias, que reutiliza
        //    los nodos parada existentes y le quita la hora a cada uno.
        //    Sin el fix, las 2 hojas `hora_estimada` quedan huérfanas.
        const paradas_sin_hora = [
            { nombre: "Parada A" },
            { nombre: "Parada B" }
        ];
        const re = await ctx.pedir_post("index.php",
            _body_viaje(nombre_admin, nombre_dueno, nombre_viaje, paradas_sin_hora));
        if (!re || !re.exito || !re.json || !re.json.exito) {
            throw new Error("No se pudo editar el viaje: "
                + ((re && re.json && re.json.error) ? re.json.error : "(sin detalle)"));
        }

        const H2 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;
        const dif = H2 - H0;
        ctx.assert(H2 === H0,
            "Quitarle la hora a las paradas dejó nodos huérfanos. "
            + "H0=" + H0 + ", H1=" + H1 + ", H2=" + H2
            + ", diferencia vs H0=" + dif + "."
            + (dif > 0 ? " Quedaron " + dif + " nodos huérfanos." : " Algo inesperado."));

        // 3. Limpieza: eliminar el viaje.
        await ctx.pedir_post("index.php", {
            accion: "viajes/eliminar",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje
        });
    }
};