/**
 * Prueba: "Cambiar de asiento" desde el croquis (v1.5piloto.77b/c).
 *
 * Flujo: terminal vende un asiento, lo abre desde el
 * croquis ("Ver pasaje"), aprieta "Cambiar de asiento",
 * elige un asiento libre en el modal apilado, confirma,
 * y verifica por backend que la venta ahora apunta al
 * asiento nuevo.
 *
 * Al final cancela la venta para limpiar.
 *
 * @version 1.5plugin.5x
 */

import {
    login_terminal,
    ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres,
    seleccionar_n_asientos,
    abrir_modal_confirmacion,
    setear_metodo_y_cuotas,
    setear_monto_pagado,
    confirmar_venta,
    obtener_id_ultima_venta,
    cancelar_venta,
    cerrar_modales_si_abiertos,
    datos_comprador_aleatorio,
    datos_pasajero_aleatorio,
    llenar_comprador,
    llenar_pasajero,
    obtener_venta_por_id
} from "./_helpers.js";

export const prueba = {
    id: "cambiar_asiento_desde_croquis",
    nombre: "Cambiar de asiento: desde el croquis",
    descripcion: "Vende un asiento con un terminal, lo abre con Ver pasaje desde el croquis, aprieta Cambiar de asiento, elige un asiento libre, confirma y verifica que la venta apunta al asiento nuevo.",
    async ejecutar(ctx) {
        // 1. Login terminal y vender un asiento.
        await login_terminal(ctx);
        await ir_a_viajes_y_abrir_primero(ctx);
        await abrir_primer_micro_con_libres(ctx);
        const asientos_sel = await seleccionar_n_asientos(ctx, 1);
        const numero_viejo = asientos_sel[0];

        await abrir_modal_confirmacion(ctx);
        const comprador = datos_comprador_aleatorio();
        const pasajero = datos_pasajero_aleatorio(0);
        await llenar_comprador(ctx, comprador);
        await llenar_pasajero(ctx, 0, pasajero);
        await setear_metodo_y_cuotas(ctx, "efectivo", 1);
        await setear_monto_pagado(ctx, 1000);
        await confirmar_venta(ctx);

        const id_venta = await obtener_id_ultima_venta(ctx);
        if (!id_venta) throw new Error("No se obtuvo id_venta");

        // 2. Click en el asiento vendido en el croquis.
        await ctx.clic(`.seat[data-numero="${numero_viejo}"]`);

        const btn_ver = await ctx.esperar(".btn-ver-pasaje-asiento", 8000);
        if (!btn_ver || !btn_ver.exito) {
            throw new Error("No apareció el botón Ver pasaje en la tarjeta del asiento");
        }
        await ctx.clic(".btn-ver-pasaje-asiento");

        const modal_pasaje = await ctx.esperar_visible("#modal_apilado", 6000);
        if (!modal_pasaje || !modal_pasaje.exito) {
            throw new Error("No se abrió el modal de Ver pasaje");
        }
        const btn_cambiar = await ctx.esperar("#btn_cambiar_asiento_pasaje", 6000);
        if (!btn_cambiar || !btn_cambiar.exito) {
            throw new Error("No apareció el botón Cambiar de asiento");
        }

        // 3. Click en "Cambiar de asiento".
        await ctx.clic("#btn_cambiar_asiento_pasaje");
        await ctx.pausa(1500);

        const elegibles = await ctx.obtener_atributos(".seat.seat-elegible", "data-numero");
        ctx.assert(elegibles.length > 0,
            "No hay asientos elegibles para el cambio. ¿La migración de repuntado está aplicada?");
        const numero_nuevo = elegibles[0];

        await ctx.clic(`.seat[data-numero="${numero_nuevo}"]`);
        await ctx.pausa(300);

        // 4. Confirmar el cambio.
        await ctx.clic("#btn_confirmar_cambiar_asiento");

        const cerrado = await ctx.esperar_oculto("#modal_apilado", 15000);
        if (!cerrado || !cerrado.exito) {
            const aviso = await ctx.leer_aviso();
            throw new Error("El modal de cambio de asiento no se cerró. Aviso: " + (aviso || "(sin aviso)"));
        }

        // 5. Verificar por backend que la venta ahora apunta al asiento nuevo.
        const venta = await obtener_venta_por_id(ctx, id_venta);
        ctx.assert(venta && Array.isArray(venta.asientos), "La venta no tiene asientos");
        ctx.assert(venta.asientos.length === 1, "Se esperaba 1 asiento, hay " + venta.asientos.length);
        const asiento_actual = venta.asientos[0];
        ctx.assert(String(asiento_actual.numero) === String(numero_nuevo),
            "El asiento de la venta no es el nuevo. Esperado: " + numero_nuevo
            + ", actual: " + asiento_actual.numero);

        // 6. Cancelar la venta para limpiar.
        await cerrar_modales_si_abiertos(ctx);
        await cancelar_venta(ctx, id_venta, "Cancelada por prueba automatica (cambiar_asiento)");
    }
};