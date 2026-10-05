/**
 * Prueba: eliminar_vehiculo limpia el subárbol del vehículo.
 *
 * Verifica la Fase 2 del plan de optimización del grafo
 * (v1.5piloto.74y). Antes, `eliminar_vehiculo` solo
 * desenlazaba el vehículo del contenedor de la empresa:
 * el nodo vehículo, su contenedor de asientos, sus pisos
 * y todas sus listas circulares de asientos quedaban
 * huérfanos (~100 nodos por vehículo).
 *
 * Mide huérfanos con `grafo/resumen`:
 *   H0: antes de nada.
 *   H1: después de crear empresa + vehículo + configurar
 *       asientos. Assert H1 === H0.
 *   H2: después de eliminar el vehículo. Assert H2 === H0.
 *
 * La prueba deja la empresa (sin vehículos) al final y la
 * elimina en el paso de limpieza.
 *
 * Requisitos de entorno: solo un dueño existente.
 *
 * @version 1.5plugin.5k
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

// Configuración de asientos 2x2 (4 asientos). Devuelve el
// JSON que espera vehiculos/actualizar_configuracion.
function _config_asientos_2x2() {
    return JSON.stringify({
        pisos: [{
            filas: 2,
            columnas: 2,
            asientos: [
                { fila: "1", columna: "1", numero: "1" },
                { fila: "1", columna: "2", numero: "2" },
                { fila: "2", columna: "1", numero: "3" },
                { fila: "2", columna: "2", numero: "4" }
            ]
        }]
    });
}

// ============================================================
// Prueba
// ============================================================

export const prueba = {
    id: "eliminar_vehiculo_limpia_nodos",
    nombre: "Grafo: eliminar vehículo limpia los nodos",
    descripcion: "Verifica que eliminar un vehículo destruye su subárbol completo (Fase 2 del plan de optimización, v1.5piloto.74y). Mide huérfanos con grafo/resumen antes, después de crear, y después de eliminar.",
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
        const nombre_empresa = "emprevgraf" + sufijo;
        const nombre_vehiculo = "vehgraf" + sufijo;

        // 1. Crear empresa.
        const r_em = await ctx.pedir_post("index.php", {
            accion: "empresas/agregar",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_empresa,
            nombre_real: "Empresa prueba grafo"
        });
        if (!r_em || !r_em.exito || !r_em.json || !r_em.json.exito) {
            throw new Error("No se pudo crear la empresa: "
                + ((r_em && r_em.json && r_em.json.error) ? r_em.json.error : "(sin detalle)"));
        }

        // 2. Crear vehículo.
        const r_ve = await ctx.pedir_post("index.php", {
            accion: "vehiculos/agregar",
            nombre_solicitante: nombre_admin,
            nombre_empresa,
            nombre_vehiculo,
            nombre_real: "Vehículo prueba grafo"
        });
        if (!r_ve || !r_ve.exito || !r_ve.json || !r_ve.json.exito) {
            throw new Error("No se pudo crear el vehículo: "
                + ((r_ve && r_ve.json && r_ve.json.error) ? r_ve.json.error : "(sin detalle)"));
        }

        // 3. Configurar asientos.
        const r_cf = await ctx.pedir_post("index.php", {
            accion: "vehiculos/actualizar_configuracion",
            nombre_solicitante: nombre_admin,
            nombre_empresa,
            nombre_vehiculo,
            configuracion: _config_asientos_2x2()
        });
        if (!r_cf || !r_cf.exito || !r_cf.json || !r_cf.json.exito) {
            throw new Error("No se pudo configurar el vehículo: "
                + ((r_cf && r_cf.json && r_cf.json.error) ? r_cf.json.error : "(sin detalle)"));
        }

        const H1 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;
        const dif_crear = H1 - H0;
        ctx.assert(H1 === H0,
            "Crear empresa + vehículo + configuración dejó huérfanos. "
            + "H0=" + H0 + ", H1=" + H1 + ", diferencia=" + dif_crear + ".");

        // 4. Eliminar vehículo.
        const r_del = await ctx.pedir_post("index.php", {
            accion: "vehiculos/eliminar",
            nombre_solicitante: nombre_admin,
            nombre_empresa,
            nombre_vehiculo
        });
        if (!r_del || !r_del.exito || !r_del.json || !r_del.json.exito) {
            throw new Error("No se pudo eliminar el vehículo: "
                + ((r_del && r_del.json && r_del.json.error) ? r_del.json.error : "(sin detalle)"));
        }

        const H2 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;
        const dif_eliminar = H2 - H0;
        ctx.assert(H2 === H0,
            "eliminar_vehiculo dejó nodos huérfanos. "
            + "H0=" + H0 + ", H1=" + H1 + ", H2=" + H2
            + ", diferencia vs H0=" + dif_eliminar + "."
            + (dif_eliminar > 0 ? " Quedaron " + dif_eliminar + " nodos huérfanos." : " Algo inesperado."));

        // 5. Limpieza: eliminar la empresa.
        await ctx.pedir_post("index.php", {
            accion: "empresas/eliminar",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            nombre_empresa
        });
    }
};