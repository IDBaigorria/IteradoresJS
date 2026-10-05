/**
 * Helpers compartidos por las pruebas de empresas y vehículos.
 *
 * Todos usan `ctx` (el service worker) y son async. Lanzan
 * Error si algo falla, para que la prueba que los usa no siga
 * adelante con datos inconsistentes.
 *
 * @version 1.5plugin.5r
 */

/**
 * Va a la pestaña Micros, elige el primer dueño, espera a que
 * aparezca el panel de empresas y a que el selector de
 * empresas esté poblado. Devuelve { nombre_dueno }.
 *
 * @param {object} ctx
 */
export async function ir_a_micros_y_elegir_dueno(ctx) {
    await ctx.activar_pestana_piloto("micros");

    const espera_selector = await ctx.esperar("#selector_dueno_micros", 5000);
    if (!espera_selector || !espera_selector.exito) {
        throw new Error("No aparece #selector_dueno_micros");
    }

    // Esperar a que el selector tenga al menos 2 opciones
    // (placeholder + un dueño real).
    let opciones = [];
    const inicio = Date.now();
    while (Date.now() - inicio < 8000) {
        opciones = await ctx.leer_opciones("#selector_dueno_micros");
        if (opciones.length >= 2) break;
        await ctx.pausa(300);
    }
    if (opciones.length < 2) {
        throw new Error("No hay dueños cargados en #selector_dueno_micros");
    }

    const sel = await ctx.seleccionar_indice("#selector_dueno_micros", 1);
    if (!sel || !sel.exito) {
        throw new Error("No se pudo seleccionar un dueño: " + (sel && sel.error ? sel.error : "sin detalle"));
    }

    const panel = await ctx.esperar_visible("#panel_empresas_micros", 5000);
    if (!panel || !panel.exito) {
        throw new Error("No apareció #panel_empresas_micros tras elegir dueño");
    }

    // Esperar a que el selector de empresas esté poblado.
    const inicio2 = Date.now();
    while (Date.now() - inicio2 < 8000) {
        const emps = await ctx.leer_opciones("#selector_empresa_micros");
        if (emps.length >= 1) break;
        await ctx.pausa(300);
    }

    return { nombre_dueno: sel.valor };
}

/**
 * Abre el modal de alta de empresa y espera a que esté listo.
 *
 * @param {object} ctx
 */
export async function abrir_modal_agregar_empresa(ctx) {
    await ctx.clic("#boton_agregar_empresa_micros");
    const modal = await ctx.esperar_visible("#modal_generico", 3000);
    if (!modal || !modal.exito) throw new Error("No se abrió el modal de alta de empresa");
    const campo = await ctx.esperar("#modal_nueva_empresa_nombre", 2000);
    if (!campo || !campo.exito) throw new Error("No aparece el campo #modal_nueva_empresa_nombre");
}

/**
 * Abre el modal de alta de vehículo y espera a que esté listo.
 * Asume que ya hay una empresa seleccionada.
 *
 * @param {object} ctx
 */
export async function abrir_modal_agregar_vehiculo(ctx) {
    await ctx.clic("#boton_agregar_vehiculo_micros");
    const modal = await ctx.esperar_visible("#modal_generico", 3000);
    if (!modal || !modal.exito) throw new Error("No se abrió el modal de alta de vehículo");
    const campo = await ctx.esperar("#modal_nuevo_vehiculo_nombre", 2000);
    if (!campo || !campo.exito) throw new Error("No aparece el campo #modal_nuevo_vehiculo_nombre");
}

/**
 * Crea una empresa de prueba mediante el modal. Devuelve cuando
 * la empresa aparece en el selector.
 *
 * @param {object} ctx
 * @param {string} nombre_empresa
 */
export async function crear_empresa_de_prueba(ctx, nombre_empresa) {
    await abrir_modal_agregar_empresa(ctx);
    await ctx.escribir("#modal_nueva_empresa_nombre", nombre_empresa);
    await ctx.escribir("#modal_nueva_empresa_nombre_real", "Empresa de prueba");
    await ctx.clic("#modal_btn_guardar_empresa");

    const cerrado = await ctx.esperar_oculto("#modal_generico", 8000);
    if (!cerrado || !cerrado.exito) {
        throw new Error("El modal de alta de empresa no se cerró tras guardar");
    }

    const inicio = Date.now();
    while (Date.now() - inicio < 5000) {
        const opciones = await ctx.leer_opciones("#selector_empresa_micros");
        if (opciones.some(o => o.valor === nombre_empresa)) return;
        await ctx.pausa(300);
    }
    throw new Error("La empresa " + nombre_empresa + " no apareció en el selector tras crearla");
}

/**
 * Selecciona una empresa por valor en #selector_empresa_micros y
 * espera a que se muestre el panel de vehículos.
 *
 * @param {object} ctx
 * @param {string} nombre_empresa
 */
export async function seleccionar_empresa_por_valor(ctx, nombre_empresa) {
    const opciones = await ctx.leer_opciones("#selector_empresa_micros");
    const idx = opciones.findIndex(o => o.valor === nombre_empresa);
    if (idx === -1) throw new Error("Empresa " + nombre_empresa + " no está en el selector");
    const sel = await ctx.seleccionar_indice("#selector_empresa_micros", idx);
    if (!sel || !sel.exito) throw new Error("No se pudo seleccionar la empresa");

    const panel = await ctx.esperar_visible("#panel_vehiculos_micros", 5000);
    if (!panel || !panel.exito) throw new Error("No apareció el panel de vehículos");

    const inicio = Date.now();
    while (Date.now() - inicio < 5000) {
        const vs = await ctx.leer_opciones("#selector_vehiculo_micros");
        if (vs.length >= 1) return;
        await ctx.pausa(300);
    }
    throw new Error("El selector de vehículos no se pobló");
}

/**
 * Elimina una empresa por POST (para limpieza). Silencioso.
 *
 * @param {object} ctx
 * @param {string} nombre_dueno
 * @param {string} nombre_empresa
 */
export async function eliminar_empresa_por_post(ctx, nombre_dueno, nombre_empresa) {
    try {
        await ctx.pedir_post("index.php", {
            accion: "empresas/eliminar",
            nombre_dueno,
            nombre_empresa
        });
    } catch (e) {
        console.warn("No se pudo eliminar la empresa de prueba:", e);
    }
}