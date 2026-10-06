/**
 * Prueba: el índice precalculado no cambia el
 * comportamiento observable de `listar_viajes_*`.
 *
 * Verifica la Fase 3 del plan de optimización del grafo
 * (v1.5piloto.76a). `listar_viajes_de_dueno` y
 * `listar_viajes_de_terminal` construyen un índice de
 * ventas por viaje UNA VEZ antes del bucle, en lugar de
 * recorrer el contenedor de ventas por cada viaje.
 *
 * La optimización no cambia el resultado, solo el costo.
 * Esta prueba verifica que el resultado sigue siendo
 * correcto: `tiene_ventas` refleja si hay ventas, y
 * `vendidos_aqui` de cada micro refleja las ventas de la
 * terminal. La mejora de performance en sí no es
 * verificable de forma estable desde el plugin.
 *
 * Pasos:
 *   1. Crear viaje A sin ventas.
 *   2. Crear viaje B con una venta (1 asiento), y
 *      autorizar la terminal en el viaje B.
 *   3. `viajes/listar_por_dueno` → A.tiene_ventas="0",
 *      B.tiene_ventas="1".
 *   4. `viajes/listar_por_terminal` → B está en la lista
 *      y el micro vendido tiene `vendidos_aqui` > 0.
 *   5. Limpieza: cancelar la venta B y eliminar ambos
 *      viajes.
 *
 * Requisitos de entorno: el dueño elegido debe tener al
 * menos una terminal y una empresa con un vehículo con
 * asientos configurados.
 *
 * @version 1.5plugin.5p
 */

import { CODIGO_ADMIN } from "../ConfiguracionApli.js";

// ============================================================
// Helpers internos
// ============================================================

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
        throw new Error("No se pudo determinar el nombre del dueño.");
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
        throw new Error("El dueño " + nombre_dueno + " no tiene terminales.");
    }
    const primera = lista[0];
    return typeof primera === "string"
        ? primera
        : (primera.nombre_usuario || primera.nombre || primera.usuario);
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

function _dni_unico() {
    const base = Date.now() % 90000000;
    return String(base + 10000000);
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

// Arma el body de viajes/guardar.
function _body_viaje(nombre_admin, nombre_dueno, nombre_viaje) {
    return {
        accion: "viajes/guardar",
        nombre_solicitante: nombre_admin,
        nombre_dueno,
        nombre_viaje,
        nombre: "Viaje regresión (índice)",
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
    };
}

// ============================================================
// Prueba
// ============================================================

export const prueba = {
    id: "listar_viajes_indice_comportamiento",
    nombre: "Grafo: listar viajes mantiene comportamiento (Fase 3)",
    descripcion: "Verifica que el índice precalculado de ventas por viaje (Fase 3, v1.5piloto.76a) no cambió el comportamiento de listar_viajes_*: tiene_ventas y vendidos_aqui siguen siendo correctos. La mejora de performance en sí no es verificable de forma estable.",
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

        const sufijo = String(Date.now()).slice(-8);
        const viaje_a = "viajeregresA" + sufijo;
        const viaje_b = "viajeregresB" + sufijo;

        // 1. Crear viaje A (sin ventas).
        const rA = await ctx.pedir_post("index.php",
            _body_viaje(nombre_admin, nombre_dueno, viaje_a));
        if (!rA || !rA.exito || !rA.json || !rA.json.exito) {
            throw new Error("No se pudo crear viaje A: "
                + ((rA && rA.json && rA.json.error) ? rA.json.error : "(sin detalle)"));
        }

        // 2. Crear viaje B (con ventas).
        const rB = await ctx.pedir_post("index.php",
            _body_viaje(nombre_admin, nombre_dueno, viaje_b));
        if (!rB || !rB.exito || !rB.json || !rB.json.exito) {
            throw new Error("No se pudo crear viaje B: "
                + ((rB && rB.json && rB.json.error) ? rB.json.error : "(sin detalle)"));
        }

        // 3. Autorizar la terminal en el viaje B. Sin esto,
        //    listar_por_terminal filtra el viaje B y no aparece.
        const rT = await ctx.pedir_post("index.php", {
            accion: "viajes/agregar_terminal",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje: viaje_b,
            nombre_terminal
        });
        if (!rT || !rT.exito || !rT.json || !rT.json.exito) {
            throw new Error("No se pudo autorizar la terminal en viaje B: "
                + ((rT && rT.json && rT.json.error) ? rT.json.error : "(sin detalle)"));
        }

        // 4. Agregar micro al viaje B.
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
                    nombre_viaje: viaje_b,
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
            throw new Error("Ningún vehículo pudo agregarse como micro: " + ultimo_error);
        }

        // 5. Seleccionar asiento y confirmar venta.
        const asiento = await _primer_asiento_libre(ctx, nombre_admin, nombre_dueno, viaje_b, nombre_micro);
        const rs = await ctx.pedir_post("index.php", {
            accion: "viajes/seleccionar_asiento",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje: viaje_b,
            nombre_micro,
            fila: asiento.fila,
            columna: asiento.columna,
            nombre_terminal
        });
        if (!rs || !rs.exito || !rs.json || !rs.json.exito) {
            throw new Error("No se pudo seleccionar asiento: "
                + ((rs && rs.json && rs.json.error) ? rs.json.error : "(sin detalle)"));
        }

        const dni_comprador = _dni_unico();
        const pasajero = {
            dni: dni_comprador,
            apellido: "Regresion",
            nombres: "Indice",
            email: "regres_" + dni_comprador + "@test.local",
            celular: "2983555123",
            celular_emergencia: "2983555222",
            fecha_nacimiento: "1990-06-15",
            direccion: "Calle Regresion 1",
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

        // 6. Listar por dueño y verificar tiene_ventas.
        const rl = await ctx.pedir_post("index.php", {
            accion: "viajes/listar_por_dueno",
            nombre_solicitante: nombre_admin,
            nombre_dueno
        });
        if (!rl || !rl.exito || !rl.json || !rl.json.exito) {
            throw new Error("No se pudo listar viajes: "
                + ((rl && rl.json && rl.json.error) ? rl.json.error : "(sin detalle)"));
        }
        const viajes = rl.json.viajes || [];

        const info_a = viajes.find(function (v) { return v.nombre_viaje === viaje_a; });
        if (!info_a) {
            throw new Error("El viaje A (" + viaje_a + ") no aparece en listar_por_dueno.");
        }
        ctx.assert(info_a.tiene_ventas === "0",
            "El viaje A no tiene ventas pero tiene_ventas=\"" + info_a.tiene_ventas + "\". "
            + "Esperado: \"0\".");

        const info_b = viajes.find(function (v) { return v.nombre_viaje === viaje_b; });
        if (!info_b) {
            throw new Error("El viaje B (" + viaje_b + ") no aparece en listar_por_dueno.");
        }
        ctx.assert(info_b.tiene_ventas === "1",
            "El viaje B tiene ventas pero tiene_ventas=\"" + info_b.tiene_ventas + "\". "
            + "Esperado: \"1\".");

        // 7. Listar por terminal y verificar vendidos_aqui.
        const rt = await ctx.pedir_post("index.php", {
            accion: "viajes/listar_por_terminal",
            nombre_solicitante: nombre_admin,
            nombre_terminal
        });
        if (!rt || !rt.exito || !rt.json || !rt.json.exito) {
            throw new Error("No se pudo listar viajes por terminal: "
                + ((rt && rt.json && rt.json.error) ? rt.json.error : "(sin detalle)"));
        }
        const viajes_term = rt.json.viajes || [];
        const info_b_term = viajes_term.find(function (v) { return v.nombre_viaje === viaje_b; });
        if (!info_b_term) {
            throw new Error("El viaje B (" + viaje_b + ") no aparece en listar_por_terminal.");
        }

        // El micro que vendió debe tener vendidos_aqui > 0.
        let encontrado_micro_con_venta = false;
        const micros = info_b_term.micros || [];
        for (const m of micros) {
            if (m.nombre_micro === nombre_micro) {
                const va = parseInt(m.vendidos_aqui, 10);
                if (!isNaN(va) && va > 0) encontrado_micro_con_venta = true;
            }
        }
        ctx.assert(encontrado_micro_con_venta,
            "Ningún micro del viaje B tiene vendidos_aqui > 0 en listar_por_terminal.");

        // 8. Limpieza: cancelar la venta y eliminar los viajes.
        await ctx.pedir_post("index.php", {
            accion: "ventas/cancelar",
            nombre_solicitante: nombre_admin,
            id_venta,
            motivo: "Prueba automática (índice de viajes)"
        });
        await ctx.pedir_post("index.php", {
            accion: "viajes/eliminar",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje: viaje_a
        });
        await ctx.pedir_post("index.php", {
            accion: "viajes/eliminar",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje: viaje_b
        });
    }
};