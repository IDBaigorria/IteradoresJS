/**
 * Prueba: cambiar de micro a mitad de selección limpia los
 * asientos-en-venta viejos.
 *
 * Verifica la Fase 2 del plan de optimización del grafo
 * (v1.5piloto.74x). Antes, `seleccionar_asiento_micro` con
 * `limpiar_lista = true` (cuando la terminal selecciona un
 * asiento de otro micro) solo desenlazaba el `primer` de la
 * cabeza de la lista de asientos-en-venta. Los nodos viejos
 * quedaban huérfanos con sus campos.
 *
 * Mide huérfanos con `grafo/resumen`:
 *   H0: antes de nada.
 *   Después: crear viaje + 2 micros, seleccionar 1 asiento
 *            del micro 1, y seleccionar 1 asiento del micro 2.
 *            El segundo dispara `limpiar_lista = true`.
 *   H1: después del segundo seleccionar. Assert H1 === H0.
 *
 * Nota: la prueba deja la venta_actual colgada de la terminal
 * con el último asiento seleccionado. Es alcanzable, no es
 * huérfano. No se limpia el viaje al final para no dejar
 * referencias colgando.
 *
 * Requisitos de entorno: el dueño elegido debe tener al menos
 * una terminal, y al menos DOS vehículos con asientos
 * configurados (en una o más empresas). Si solo hay uno,
 * la prueba falla con mensaje claro.
 *
 * @version 1.5plugin.5j
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

async function _empresas_del_dueno(ctx, nombre_solicitante, nombre_dueno) {
    const r = await ctx.pedir_post("index.php", {
        accion: "empresas/listar",
        nombre_solicitante,
        nombre_dueno
    });
    if (!r || !r.exito || !r.json || !r.json.exito) return [];
    const lista = r.json.empresas || [];
    return lista.map(function (e) {
        if (typeof e === "string") return e;
        return e.nombre_usuario || e.nombre_empresa || e.nombre || null;
    }).filter(function (n) { return !!n; });
}

async function _vehiculos_de_empresa(ctx, nombre_solicitante, nombre_empresa) {
    const r = await ctx.pedir_post("index.php", {
        accion: "vehiculos/listar",
        nombre_solicitante,
        nombre_empresa
    });
    if (!r || !r.exito || !r.json || !r.json.exito) return [];
    const lista = r.json.vehiculos || [];
    return lista.map(function (v) {
        if (typeof v === "string") return v;
        return v.patente || v.nombre_vehiculo || v.nombre || null;
    }).filter(function (n) { return !!n; });
}

function _fecha_manana() {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return d.getFullYear() + "-"
        + String(d.getMonth() + 1).padStart(2, "0") + "-"
        + String(d.getDate()).padStart(2, "0");
}

async function _primer_asiento_libre(ctx, nombre_solicitante, nombre_dueno, nombre_viaje, nombre_micro) {
    const r = await ctx.pedir_post("index.php", {
        accion: "viajes/estado_asientos",
        nombre_solicitante,
        nombre_dueno,
        nombre_viaje,
        nombre_micro
    });
    if (!r || !r.exito || !r.json || !r.json.exito) {
        throw new Error("No se pudieron leer los asientos: "
            + ((r && r.json && r.json.error) ? r.json.error : "(sin detalle)"));
    }
    const asientos = r.json.asientos || [];
    for (const a of asientos) {
        if (a.estado === "libre") {
            return { fila: String(a.fila), columna: String(a.columna) };
        }
    }
    throw new Error("No hay asientos libres en el micro " + nombre_micro);
}

// ============================================================
// Prueba
// ============================================================

export const prueba = {
    id: "cambiar_micro_a_mitad_limpia_nodos",
    nombre: "Grafo: cambiar de micro limpia los asientos-en-venta viejos",
    descripcion: "Verifica que cambiar de micro a mitad de selección destruye los asientos-en-venta viejos (Fase 2 del plan de optimización, v1.5piloto.74x). Requiere un viaje con 2 micros. Mide huérfanos con grafo/resumen antes y después.",
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

        // Requisito: al menos 2 vehículos con asientos.
        const empresas = await _empresas_del_dueno(ctx, nombre_admin, nombre_dueno);
        if (empresas.length === 0) {
            throw new Error("El dueño " + nombre_dueno + " no tiene empresas.");
        }
        const candidatos = [];  // {empresa, patente}
        for (const empresa of empresas) {
            const vehiculos = await _vehiculos_de_empresa(ctx, nombre_admin, empresa);
            for (const patente of vehiculos) {
                candidatos.push({ empresa, patente });
            }
        }
        if (candidatos.length < 2) {
            throw new Error("Se necesitan al menos 2 vehículos configurados en las empresas del dueño " + nombre_dueno + ". Encontrados: " + candidatos.length + ". Cargá más vehículos o ajustá la prueba.");
        }

        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;

        // Crear viaje de prueba.
        const sufijo = String(Date.now()).slice(-8);
        const nombre_viaje = "viajecambiomicro" + sufijo;

        const rc = await ctx.pedir_post("index.php", {
            accion: "viajes/guardar",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje,
            nombre: "Viaje de prueba (cambiar micro)",
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

        // Agregar los dos primeros micros.
        const micros = [];
        for (let i = 0; i < 2; i++) {
            const c = candidatos[i];
            const r_ag = await ctx.pedir_post("index.php", {
                accion: "viajes/agregar_micro",
                nombre_solicitante: nombre_admin,
                nombre_dueno,
                nombre_viaje,
                nombre_empresa: c.empresa,
                nombre_vehiculo: c.patente,
                monto: "1000"
            });
            if (!r_ag || !r_ag.exito || !r_ag.json || !r_ag.json.exito) {
                throw new Error("No se pudo agregar el micro " + c.patente + ": "
                    + ((r_ag && r_ag.json && r_ag.json.error) ? r_ag.json.error : "(sin detalle)"));
            }
            micros.push(r_ag.json.nombre_micro);
        }

        // Seleccionar un asiento del primer micro.
        const a1 = await _primer_asiento_libre(ctx, nombre_admin, nombre_dueno, nombre_viaje, micros[0]);
        const rs1 = await ctx.pedir_post("index.php", {
            accion: "viajes/seleccionar_asiento",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje,
            nombre_micro: micros[0],
            fila: a1.fila,
            columna: a1.columna,
            nombre_terminal
        });
        if (!rs1 || !rs1.exito || !rs1.json || !rs1.json.exito) {
            throw new Error("No se pudo seleccionar el primer asiento: "
                + ((rs1 && rs1.json && rs1.json.error) ? rs1.json.error : "(sin detalle)"));
        }

        // Seleccionar un asiento del segundo micro. Esto dispara
        // limpiar_lista = true en seleccionar_asiento_micro, porque
        // el micro de la venta_actual cambia.
        const a2 = await _primer_asiento_libre(ctx, nombre_admin, nombre_dueno, nombre_viaje, micros[1]);
        const rs2 = await ctx.pedir_post("index.php", {
            accion: "viajes/seleccionar_asiento",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje,
            nombre_micro: micros[1],
            fila: a2.fila,
            columna: a2.columna,
            nombre_terminal
        });
        if (!rs2 || !rs2.exito || !rs2.json || !rs2.json.exito) {
            throw new Error("No se pudo seleccionar el segundo asiento: "
                + ((rs2 && rs2.json && rs2.json.error) ? rs2.json.error : "(sin detalle)"));
        }

        const H1 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;
        const dif = H1 - H0;
        ctx.assert(H1 === H0,
            "Cambiar de micro a mitad de selección dejó nodos huérfanos. "
            + "H0=" + H0 + ", H1=" + H1 + ", diferencia=" + dif + "."
            + (dif > 0 ? " Quedaron " + dif + " nodos huérfanos de los asientos-en-venta viejos." : " Algo inesperado."));
    }
};