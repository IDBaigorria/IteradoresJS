/**
 * Monto mayor al total.
 * @version 1.5plugin.4l
 */
import {
    login_terminal, ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres, seleccionar_n_asientos,
    abrir_modal_confirmacion, llenar_comprador, llenar_pasajero,
    setear_metodo_y_cuotas, setear_monto_pagado,
    datos_comprador_aleatorio, datos_pasajero_aleatorio,
    cerrar_form_venta_y_liberar
} from "./_helpers.js";

export const prueba = {
    id: "venta_monto_mayor_total",
    nombre: "Venta: monto mayor al total (rechazo)",
    descripcion: "Intenta pagar mas que el total. El piloto debe rechazarlo.",

    async ejecutar(ctx) {
        await login_terminal(ctx);
        await ir_a_viajes_y_abrir_primero(ctx);
        await abrir_primer_micro_con_libres(ctx);
        await seleccionar_n_asientos(ctx, 1);
        await abrir_modal_confirmacion(ctx);

        await llenar_comprador(ctx, datos_comprador_aleatorio());
        await llenar_pasajero(ctx, 0, datos_pasajero_aleatorio(0));

        // 2 cuotas para que el input de monto este habilitado
        await setear_metodo_y_cuotas(ctx, "efectivo", 2);
        await setear_monto_pagado(ctx, "999999999");

        await ctx.clic("#confirmar_venta");
        await ctx.pausa(600);

        const aviso = await ctx.leer_aviso();
        ctx.assert(aviso && (aviso.includes("superar") || aviso.includes("no puede")),
            "No se detecto el rechazo por monto mayor: " + JSON.stringify(aviso));

        await cerrar_form_venta_y_liberar(ctx);
    }
};