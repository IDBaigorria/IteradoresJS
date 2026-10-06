/**
 * Prueba: eliminar_micro_de_viaje limpia el subárbol completo.
 *
 * Verifica la Fase 2 del plan de optimización del grafo
 * (v1.5piloto.74s). Antes, `eliminar_micro_de_viaje` solo
 * desenlazaba el micro del contenedor `micros` del viaje:
 * el nodo micro, su copia de vehículo, sus pisos y todos
 * sus asientos quedaban huérfanos (~100 nodos por micro).
 * Ahora los destruye reutilizando `_destruir_micro`.
 *
 * Mide cuatro estados con `grafo/resumen`:
 *   N0: antes de crear nada.
 *   N1: después de crear el viaje.
 *   N2: después de agregar el micro. Assert N2 > N1.
 *   N3: después de eliminar el micro. Assert N3 === N1.
 *   N4: después de eliminar el viaje. Assert N4 === N0.
 *
 * Requisito de entorno: el dueño elegido (el primero de
 * `administrador/listar_duenos`) debe tener al menos una
 * empresa con al menos un vehículo con asientos configurados.
 * La prueba itera empresas × vehículos intentando agregar
 * el micro; si ninguno anda, falla con mensaje claro.
 *
 * @version 1.5plugin.5g
 */

import { CODIGO_ADMIN } from "../ConfiguracionApli.js";

// ============================================================
// Helpers internos
// ============================================================

// Pide grafo/resumen y devuelve el total de nodos.
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
// primer dueño.
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
    const lista = r.json.duenos || r.json.usuarios || r.json.lista || [];
    if (!Array.isArray(lista) || lista.length === 0) {
        throw new Error("No hay dueños disponibles para la prueba.");
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

// Pide empresas/listar y devuelve el array de empresas.
// Cada empresa puede ser un string o un objeto; se normaliza.
async function _empresas_del_dueno(ctx, nombre_solicitante, nombre_dueno) {
    const r = await ctx.pedir_post("index.php", {
        accion: "empresas/listar",
        nombre_solicitante,
        nombre_dueno
    });
    if (!r || !r.exito || !r.json || !r.json.exito) {
        return [];
    }
    const lista = r.json.empresas || [];
    return lista.map(function (e) {
        if (typeof e === "string") return e;
        return e.nombre_usuario || e.nombre_empresa || e.nombre || null;
    }).filter(function (n) { return !!n; });
}

// Pide vehiculos/listar para una empresa y devuelve el
// array de patentes.
async function _vehiculos_de_empresa(ctx, nombre_solicitante, nombre_empresa) {
    const r = await ctx.pedir_post("index.php", {
        accion: "vehiculos/listar",
        nombre_solicitante,
        nombre_empresa
    });
    if (!r || !r.exito || !r.json || !r.json.exito) {
        return [];
    }
    const lista = r.json.vehiculos || [];
    return lista.map(function (v) {
        if (typeof v === "string") return v;
        return v.patente || v.nombre_vehiculo || v.nombre || null;
    }).filter(function (n) { return !!n; });
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
    id: "eliminar_micro_limpia_nodos",
    nombre: "Grafo: eliminar micro limpia los nodos",
    descripcion: "Verifica que eliminar un micro destruye el subárbol completo (copia de vehículo, pisos, asientos, campos). Fase 2 del plan de optimización, v1.5piloto.74s. Mide nodos en 4 estados con grafo/resumen.",
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

        // Crear viaje de prueba.
        const sufijo = String(Date.now()).slice(-8);
        const nombre_viaje = "viajemicrograf" + sufijo;

        const rc = await ctx.pedir_post("index.php", {
            accion: "viajes/guardar",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje,
            nombre: "Viaje de prueba (eliminar micro)",
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

        // Buscar una empresa con un vehículo con asientos. Se
        // itera intentando agregar el micro hasta que uno pase.
        const empresas = await _empresas_del_dueno(ctx, nombre_admin, nombre_dueno);
        if (empresas.length === 0) {
            throw new Error("El dueño " + nombre_dueno + " no tiene empresas. Creá una antes de correr esta prueba.");
        }

        let nombre_micro = null;
        let ultimo_error = "";
        let intentos = 0;
        for (const empresa of empresas) {
            const vehiculos = await _vehiculos_de_empresa(ctx, nombre_admin, empresa);
            for (const patente of vehiculos) {
                intentos++;
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
                    break;
                }
                const err = (r_ag && r_ag.json && r_ag.json.error) ? r_ag.json.error : "(sin detalle)";
                ultimo_error = err;
                // Si el error es "no tiene asientos configurados",
                // seguir con el próximo vehículo. Si es otro,
                // probablemente sea algo que rompe la prueba.
                if (!/asientos configurados/i.test(err)) {
                    // Otros errores: seguimos intentando por si
                    // es un vehículo particular. Pero guardamos
                    // el error para reportarlo si ninguno anda.
                }
            }
            if (nombre_micro) break;
        }

        if (!nombre_micro) {
            throw new Error("Ningún vehículo del dueño " + nombre_dueno + " pudo agregarse como micro."
                + " Probados " + intentos + " vehículos."
                + " Último error: " + ultimo_error
                + " — Asegurate de que el dueño tenga al menos una empresa con un vehículo con asientos configurados.");
        }

        const N2 = await _contar_nodos(ctx, nombre_admin);
        ctx.assert(N2 > N1,
            "Agregar el micro no agregó nodos (N1=" + N1 + ", N2=" + N2 + ").");

        // Eliminar el micro.
        const re = await ctx.pedir_post("index.php", {
            accion: "viajes/eliminar_micro",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_viaje,
            nombre_micro
        });
        if (!re || !re.exito || !re.json || !re.json.exito) {
            throw new Error("No se pudo eliminar el micro: "
                + ((re && re.json && re.json.error) ? re.json.error : "(sin detalle)"));
        }

        const N3 = await _contar_nodos(ctx, nombre_admin);
        const dif_micro = N3 - N1;
        ctx.assert(N3 === N1,
            "eliminar_micro_de_viaje no limpió todos los nodos del micro. "
            + "N1=" + N1 + ", N2=" + N2 + ", N3=" + N3
            + ", diferencia vs N1=" + dif_micro + "."
            + (dif_micro > 0 ? " Quedaron " + dif_micro + " nodos huérfanos del micro." : " Algo inesperado."));

        // Eliminar el viaje para dejar el entorno limpio.
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
        const dif_viaje = N4 - N0;
        ctx.assert(N4 === N0,
            "El flujo completo (crear viaje + agregar micro + eliminar micro + eliminar viaje) no volvió al estado inicial. "
            + "N0=" + N0 + ", N4=" + N4 + ", diferencia=" + dif_viaje + ".");
    }
};