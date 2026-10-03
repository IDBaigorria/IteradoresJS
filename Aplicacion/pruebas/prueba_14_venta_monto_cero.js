/**
 * Monto cero.
 * @version 1.5plugin.4
 */
import {
    login_terminal, ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres, seleccionar_n_asientos,
    abrir_modal_confirmacion, llenar_comprador, llenar_pasajero,
    setear_metodo_y_cuotas, setear_monto_pagado,
    datos_comprador_aleatorio, datos_pasajero_aleatorio
} from "./_helpers.js";

export const prueba = {
    id: "venta_monto_cero",
    nombre: "Venta: monto cero (rechazo)",
    descripcion: "Intenta pagar cero. El piloto debe rechazarlo.",

    async ejecutar(ctx) {
        await login_terminal(ctx);
        await ir_a_viajes_y_abrir_primero(ctx);
        await abrir_primer_micro_con_libres(ctx);
        await seleccionar_n_asientos(ctx, 1);
        await abrir_modal_confirmacion(ctx);

        await llenar_comprador(ctx, datos_comprador_aleatorio());
        await llenar_pasajero(ctx, 0, datos_pasajero_aleatorio(0));

        await setear_metodo_y_cuotas(ctx, "efectivo", 2);
        await setear_monto_pagado(ctx, "0");

        await ctx.clic("#confirmar_venta");
        await ctx.pausa(600);

        const aviso = await ctx.leer_aviso();
        ctx.assert(aviso && (aviso.includes("valido") || aviso.includes("mayor") || aviso.includes("monto")),
            "No se detecto el rechazo por monto cero: " + JSON.stringify(aviso));

        await ctx.clic("#cancelar_venta_modal");
    }
};