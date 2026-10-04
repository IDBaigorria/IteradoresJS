/**
 * Helpers compartidos por las pruebas que tocan el alta de
 * micros dentro de un viaje (viajes-micros.js del piloto).
 *
 * Todos los helpers usan `ctx` (el objeto del service worker)
 * y son async. Lanzan Error si algo falla, para que la prueba
 * que los usa no siga adelante con datos inconsistentes.
 *
 * @version 1.5plugin.4y
 */

/**
 * Crea un viaje de prueba. Escribe el nombre, la fecha, la
 * hora, origen y destino, guarda, y espera a que el viaje
 * aparezca en #lista_viajes.
 *
 * Devuelve { nombre_viaje, sufijo }.
 *
 * @param {object} ctx
 * @param {string} prefijo Prefijo del nombre del viaje.
 */
export async function crear_viaje_de_prueba(ctx, prefijo = "viajeprueba") {
    const sufijo = String(Date.now()).slice(-8);
    const nombre_viaje = prefijo + sufijo;

    await ctx.clic("#boton_agregar_viaje");
    const espera = await ctx.esperar("#modal_viaje_nombre", 5000);
    if (!(espera && espera.exito)) throw new Error("No apareció el modal de alta de viaje");

    const fecha_futura = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const fecha_str = fecha_futura.getFullYear() + '-'
        + String(fecha_futura.getMonth() + 1).padStart(2, '0') + '-'
        + String(fecha_futura.getDate()).padStart(2, '0');

    await ctx.escribir("#modal_viaje_nombre", nombre_viaje);
    await ctx.escribir("#modal_viaje_fecha", fecha_str);
    await ctx.escribir("#modal_viaje_hora", "08:00");
    await ctx.escribir("#modal_viaje_origen", "Origen Test");
    await ctx.escribir("#modal_viaje_destino", "Destino Test");
    await ctx.clic("#guardar_modal_viaje");

    let ok = false;
    const inicio = Date.now();
    while (Date.now() - inicio < 15000) {
        const html = await ctx.html("#lista_viajes");
        if (html && html.includes(nombre_viaje)) { ok = true; break; }
        await ctx.pausa(300);
    }
    if (!ok) throw new Error("El viaje de setup (" + nombre_viaje + ") no apareció en #lista_viajes");

    return { nombre_viaje, sufijo };
}

/**
 * Abre el detalle de un viaje y espera a que aparezca el botón
 * de agregar micro.
 *
 * @param {object} ctx
 * @param {string} nombre_viaje
 */
export async function abrir_detalle_viaje(ctx, nombre_viaje) {
    const sel = '.btn-detalle-viaje[data-viaje="' + nombre_viaje + '"]';
    const espera = await ctx.esperar(sel, 3000);
    if (!(espera && espera.exito)) throw new Error("No apareció el botón Ver detalle del viaje " + nombre_viaje);

    await ctx.clic(sel);
    const espera_detalle = await ctx.esperar("#boton_agregar_micro_viaje", 6000);
    if (!(espera_detalle && espera_detalle.exito)) throw new Error("No apareció #boton_agregar_micro_viaje dentro del detalle");
}

/**
 * Abre el formulario de agregar micro (modal apilado) y espera a
 * que el select de empresas se llene con al menos 2 opciones
 * (placeholder + una empresa real).
 *
 * @param {object} ctx
 */
export async function abrir_formulario_agregar_micro(ctx) {
    await ctx.clic("#boton_agregar_micro_viaje");
    const espera = await ctx.esperar("#selector_empresa_micro_viaje", 5000);
    if (!(espera && espera.exito)) throw new Error("No apareció el formulario de agregar micro");

    let empresas = [];
    const inicio = Date.now();
    while (Date.now() - inicio < 8000) {
        empresas = await ctx.leer_opciones("#selector_empresa_micro_viaje");
        if (Array.isArray(empresas) && empresas.length >= 2) break;
        await ctx.pausa(300);
    }
    if (!(Array.isArray(empresas) && empresas.length >= 2)) {
        throw new Error("El select de empresas no se llenó. El dueño de prueba no tiene empresas con vehículos configurados.");
    }
}

/**
 * Elige la empresa y el vehículo en el formulario de agregar
 * micro. Espera a que el select de vehículos se llene después
 * de elegir empresa (el onchange del piloto lo dispara).
 *
 * Devuelve { empresa_valor, patente }.
 *
 * @param {object} ctx
 * @param {number} idx_empresa Índice de la empresa (0 es placeholder).
 * @param {number} idx_vehiculo Índice del vehículo (0 es placeholder).
 */
export async function elegir_empresa_y_vehiculo(ctx, idx_empresa = 1, idx_vehiculo = 1) {
    const sel_emp = await ctx.seleccionar_indice("#selector_empresa_micro_viaje", idx_empresa);
    if (!(sel_emp && sel_emp.exito)) throw new Error("No se pudo seleccionar empresa: " + (sel_emp && sel_emp.error ? sel_emp.error : "sin detalle"));

    let vehiculos = [];
    const inicio = Date.now();
    while (Date.now() - inicio < 8000) {
        vehiculos = await ctx.leer_opciones("#selector_vehiculo_micro_viaje");
        if (Array.isArray(vehiculos) && vehiculos.length >= 2) break;
        await ctx.pausa(300);
    }
    if (!(Array.isArray(vehiculos) && vehiculos.length >= 2)) {
        throw new Error("La empresa seleccionada no tiene vehículos.");
    }

    const sel_veh = await ctx.seleccionar_indice("#selector_vehiculo_micro_viaje", idx_vehiculo);
    if (!(sel_veh && sel_veh.exito)) throw new Error("No se pudo seleccionar vehículo: " + (sel_veh && sel_veh.error ? sel_veh.error : "sin detalle"));

    return { empresa_valor: sel_emp.valor, patente: sel_veh.valor };
}

/**
 * Cierra el modal apilado si quedó abierto (por ejemplo, si una
 * prueba anterior falló a mitad de camino). Idempotente.
 *
 * @param {object} ctx
 */
export async function cerrar_modal_apilado_si_abierto(ctx) {
    try {
        const visible = await ctx.esta_visible("#cerrar_modal_apilado");
        if (visible) await ctx.clic("#cerrar_modal_apilado");
    } catch (e) { /* no hacer nada */ }
}

/**
 * Verifica el mensaje del toast actual. Devuelve el texto
 * (puede ser string vacío si no hay aviso visible).
 *
 * @param {object} ctx
 */
export async function leer_aviso_actual(ctx) {
    const texto = await ctx.leer_aviso();
    return (texto || "").trim();
}