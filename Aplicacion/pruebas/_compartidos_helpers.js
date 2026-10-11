/**
 * Helpers compartidos por las pruebas 60-64.
 *
 * Todas las funciones reciben el `ctx` del service worker.
 * Se apoyan en POST directo al backend (no en la UI) porque
 * las operaciones de viajes/terminales son costosas en UI
 * y no necesitan verificación visual.
 *
 * @version 1.5plugin.6h
 */

// ============================================================
// Resolución de nombres de usuario
// ============================================================

/**
 * Login y devuelve el nombre de usuario real.
 * Útil porque los códigos de acceso NO son nombres de usuario.
 */
export async function login_y_nombre(ctx, codigo) {
    await ctx.asegurar_login(codigo);
    const r = await ctx.nombre_usuario_actual();
    if (!r || !r.exito || !r.nombre_usuario) {
        throw new Error("No se pudo resolver el nombre de usuario tras login");
    }
    return r.nombre_usuario;
}

// ============================================================
// Viajes (POST directo)
// ============================================================

/**
 * Crea un viaje vacío con nombre único. Devuelve el nombre del viaje.
 */
export async function crear_viaje_vacio(ctx, nombre_dueno, prefijo = "viajeauto") {
    const nombre_viaje = prefijo + "_" + Date.now();
    const r = await ctx.pedir_post("index.php", {
        accion: "viajes/guardar",
        nombre_dueno: nombre_dueno,
        nombre_viaje: nombre_viaje,
        nombre: "Viaje de prueba " + nombre_viaje,
        fecha: "a confirmar",
        hora: "a confirmar",
        origen: "Origen de prueba",
        destino: "Destino de prueba"
    });
    if (!r || !r.json || !r.json.exito) {
        throw new Error("No se pudo crear el viaje: " + JSON.stringify(r && r.json ? r.json : r));
    }
    return nombre_viaje;
}

/**
 * Elimina un viaje si existe. Best-effort (no lanza).
 */
export async function eliminar_viaje_si_existe(ctx, nombre_dueno, nombre_viaje) {
    if (!nombre_viaje) return;
    try {
        await ctx.pedir_post("index.php", {
            accion: "viajes/eliminar",
            nombre_dueno: nombre_dueno,
            nombre_viaje: nombre_viaje
        });
    } catch (e) { /* best-effort */ }
}

/**
 * Autoriza una terminal en un viaje.
 */
export async function autorizar_terminal(ctx, nombre_dueno, nombre_viaje, nombre_terminal) {
    const r = await ctx.pedir_post("index.php", {
        accion: "viajes/agregar_terminal",
        nombre_dueno: nombre_dueno,
        nombre_viaje: nombre_viaje,
        nombre_terminal: nombre_terminal
    });
    if (!r || !r.json || !r.json.exito) {
        throw new Error("No se pudo autorizar: " + JSON.stringify(r && r.json ? r.json : r));
    }
}

/**
 * Desautoriza una terminal en un viaje.
 */
export async function desautorizar_terminal(ctx, nombre_dueno, nombre_viaje, nombre_terminal) {
    const r = await ctx.pedir_post("index.php", {
        accion: "viajes/eliminar_terminal",
        nombre_dueno: nombre_dueno,
        nombre_viaje: nombre_viaje,
        nombre_terminal: nombre_terminal
    });
    if (!r || !r.json || !r.json.exito) {
        throw new Error("No se pudo desautorizar: " + JSON.stringify(r && r.json ? r.json : r));
    }
}

/**
 * Devuelve true si el viaje aparece en el listado del terminal.
 */
export async function terminal_ve_viaje(ctx, nombre_terminal, nombre_viaje) {
    const r = await ctx.pedir_post("index.php", {
        accion: "viajes/listar_por_terminal",
        nombre_terminal: nombre_terminal
    });
    if (!r || !r.json || !r.json.exito) {
        throw new Error("No se pudo listar viajes del terminal: "
            + JSON.stringify(r && r.json ? r.json : r));
    }
    const viajes = r.json.viajes || [];
    return viajes.some(v => v && v.nombre_viaje === nombre_viaje);
}

/**
 * Lista las empresas que ve un terminal (con su contexto).
 * Devuelve un array de nombres de empresa.
 */
export async function listar_empresas_del_terminal(ctx, nombre_dueno, nombre_terminal) {
    const r = await ctx.pedir_post("index.php", {
        accion: "empresas/listar",
        nombre_dueno: nombre_dueno,
        nombre_solicitante: nombre_terminal
    });
    if (!r || !r.json || !r.json.exito) {
        throw new Error("No se pudo listar empresas: "
            + JSON.stringify(r && r.json ? r.json : r));
    }
    return (r.json.empresas || []).map(e => (e && e.nombre_empresa) || "");
}

/**
 * Busca una empresa del dueño que tenga al menos un vehículo con
 * asientos configurados. Devuelve { nombre_empresa, nombre_vehiculo }
 * o null si no encuentra ninguna.
 *
 * `excluir` es una lista opcional de nombres de empresa a saltear
 * (útil cuando el test necesita una empresa que el terminal no
 * vea todavía).
 */
export async function buscar_empresa_con_vehiculo_configurado(ctx, nombre_dueno, excluir = []) {
    const r_emp = await ctx.pedir_post("index.php", {
        accion: "empresas/listar",
        nombre_dueno: nombre_dueno
    });
    if (!r_emp || !r_emp.json || !r_emp.json.exito) return null;
    const empresas = r_emp.json.empresas || [];
    for (const e of empresas) {
        const nombre_emp = e && e.nombre_empresa;
        if (!nombre_emp) continue;
        if (excluir.includes(nombre_emp)) continue;
        const r_veh = await ctx.pedir_post("index.php", {
            accion: "vehiculos/listar",
            nombre_empresa: nombre_emp
        });
        if (!r_veh || !r_veh.json || !r_veh.json.exito) continue;
        const vehiculos = r_veh.json.vehiculos || [];
        for (const v of vehiculos) {
            if (v && v.nombre_vehiculo && v.asientos && parseInt(v.asientos) > 0) {
                return { nombre_empresa: nombre_emp, nombre_vehiculo: v.nombre_vehiculo };
            }
        }
    }
    return null;
}