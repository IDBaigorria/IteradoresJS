/**
 * Prueba: cancelar_venta limpia el subárbol de la venta.
 *
 * Verifica la Fase 2 del plan de optimización del grafo
 * (v1.5piloto.74v). Antes, `cancelar_venta` dejaba huérfanos:
 *  - los asientos-en-venta (la lista cuelga con
 *    `primer`/`siguiente`, no con `hmi`/`hd`, así que
 *    `eliminar_hmi` no los alcanzaba),
 *  - los campos de cada cupón (`numero`, `monto`, etc.),
 *  - los campos hoja del nodo venta,
 *  - el sub-nodo `opciones_cobro` con sus 4 hijos.
 *
 * Mide huérfanos con `grafo/resumen` (no el total, porque
 * cancelar crea intencionalmente un nodo Cancelación):
 *   H0: antes de nada.
 *   H1: después de hacer una venta. Assert H1 === H0.
 *   H2: después de cancelarla. Assert H2 === H0.
 *
 * Todo el flujo se corre con admin logueado, sin cambios de
 * sesión, todo POST. El admin actúa de terminal: usa el
 * nombre de una terminal real del dueño (que tiene `dueno`
 * colgando, como exige `confirmar_venta_actual`).
 *
 * Requisitos de entorno: el dueño elegido debe tener al menos
 * una terminal (con dueño asignado) y una empresa con un
 * vehículo con asientos configurados.
 *
 * @version 1.5plugin.5i
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

// DNI único de 8 dígitos.
function _dni_unico() {
    const base = Date.now() % 90000000;
    return String(base + 10000000);
}

// Elige el primer asiento libre del micro y devuelve {fila, columna}.
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
    id: "cancelar_venta_limpia_nodos",
    nombre: "Grafo: cancelar venta limpia los nodos",
    descripcion: "Verifica que cancelar una venta no deja nodos huérfanos (Fase 2 del plan de optimización, v1.5piloto.74v). Mide huérfanos con grafo/resumen antes, después de vender, y después de cancelar.",
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

        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;

        // 1. Crear viaje de prueba.
        const sufijo = String(Date.now()).slice(-8);
        const nombre_viaje = "viajeventgraf" + sufijo;

        const rc = await ctx.pedir_post("index.php", {
            accion: "viajes/guardar",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje,
            nombre: "Viaje de prueba (cancelar venta)",
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

        // 2. Agregar micro.
        const empresas = await _empresas_del_dueno(ctx, nombre_admin, nombre_dueno);
        if (empresas.length === 0) {
            throw new Error("El dueño " + nombre_dueno + " no tiene empresas.");
        }
        let nombre_micro = null;
        let monto_micro = null;
        let ultimo_error = "";
        for (const empresa of empresas) {
            const vehiculos = await _vehiculos_de_empresa(ctx, nombre_admin, empresa);
            for (const patente of vehiculos) {
                const r_ag = await ctx.pedir_post("index.php", {
                    accion: "viajes/agregar_micro",
                    nombre_solicitante: nombre_admin,
                    nombre_dueno,
                    nombre_viaje,
                    nombre_empresa: empresa,
                    nombre_vehiculo: patente,
                    monto: "1000"
                });
                if (r_ag && r_ag.json && r_ag.json.exito) {
                    nombre_micro = r_ag.json.nombre_micro;
                    monto_micro = "1000";
                    break;
                }
                ultimo_error = (r_ag && r_ag.json && r_ag.json.error) ? r_ag.json.error : "(sin detalle)";
            }
            if (nombre_micro) break;
        }
        if (!nombre_micro) {
            throw new Error("Ningún vehículo pudo agregarse como micro. Último error: " + ultimo_error);
        }

        // 3. Seleccionar un asiento.
        const asiento = await _primer_asiento_libre(ctx, nombre_admin, nombre_dueno, nombre_viaje, nombre_micro);
        const rs = await ctx.pedir_post("index.php", {
            accion: "viajes/seleccionar_asiento",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje,
            nombre_micro,
            fila: asiento.fila,
            columna: asiento.columna,
            nombre_terminal
        });
        if (!rs || !rs.exito || !rs.json || !rs.json.exito) {
            throw new Error("No se pudo seleccionar el asiento: "
                + ((rs && rs.json && rs.json.error) ? rs.json.error : "(sin detalle)"));
        }

        // 4. Confirmar la venta. Un comprador, un pasajero (mismo DNI).
        const dni_comprador = _dni_unico();
        const pasajero = {
            dni: dni_comprador,
            apellido: "Prueba",
            nombres: "Cancelar",
            email: "cancelar_" + dni_comprador + "@test.local",
            celular: "2983555123",
            celular_emergencia: "2983555222",
            fecha_nacimiento: "1990-06-15",
            direccion: "Calle Cancelar 1",
            localidad: "Tres Arroyos"
        };

        const rv = await ctx.pedir_post("index.php", {
            accion: "ventas/confirmar",
            nombre_solicitante: nombre_admin,
            nombre_terminal,
            metodo_pago: "efectivo",
            cuotas: "1",
            monto_pagado: monto_micro,
            comprador_dni: dni_comprador,
            comprador_apellido: pasajero.apellido,
            comprador_nombres: pasajero.nombres,
            comprador_email: pasajero.email,
            comprador_celular: pasajero.celular,
            pasajeros: JSON.stringify([pasajero])
        });
        if (!rv || !rv.exito || !rv.json || !rv.json.exito) {
            throw new Error("No se pudo confirmar la venta: "
                + ((rv && rv.json && rv.json.error) ? rv.json.error : "(sin detalle)"));
        }
        const id_venta = rv.json.id_venta;
        if (!id_venta) {
            throw new Error("La venta no devolvió id_venta. Respuesta: " + JSON.stringify(rv.json).slice(0, 200));
        }

        const H1 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;
        const dif_venta = H1 - H0;
        ctx.assert(H1 === H0,
            "Crear la venta agregó huérfanos. "
            + "H0=" + H0 + ", H1=" + H1 + ", diferencia=" + dif_venta + ".");

        // 5. Cancelar la venta.
        const rcan = await ctx.pedir_post("index.php", {
            accion: "ventas/cancelar",
            nombre_solicitante: nombre_admin,
            id_venta,
            motivo: "Prueba automática (limpieza de nodos)"
        });
        if (!rcan || !rcan.exito || !rcan.json || !rcan.json.exito) {
            throw new Error("No se pudo cancelar la venta: "
                + ((rcan && rcan.json && rcan.json.error) ? rcan.json.error : "(sin detalle)"));
        }

        const H2 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;
        const dif_cancel = H2 - H0;
        ctx.assert(H2 === H0,
            "cancelar_venta dejó nodos huérfanos. "
            + "H0=" + H0 + ", H1=" + H1 + ", H2=" + H2
            + ", diferencia vs H0=" + dif_cancel + "."
            + (dif_cancel > 0 ? " Quedaron " + dif_cancel + " nodos huérfanos." : " Algo inesperado."));

        // 6. Limpieza: eliminar el viaje.
        await ctx.pedir_post("index.php", {
            accion: "viajes/eliminar",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje
        });
    }
};