/**
 * Sin datos del comprador.
 * @version 1.5plugin.4l
 */
import {
    login_terminal, ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres, seleccionar_n_asientos,
    abrir_modal_confirmacion, cerrar_form_venta_y_liberar
} from "./_helpers.js";

export const prueba = {
    id: "venta_sin_comprador",
    nombre: "Venta: sin datos del comprador (rechazo)",
    descripcion: "Intenta confirmar sin llenar el comprador. El piloto debe rechazarlo.",

    async ejecutar(ctx) {
        await login_terminal(ctx);
        await ir_a_viajes_y_abrir_primero(ctx);
        await abrir_primer_micro_con_libres(ctx);
        await seleccionar_n_asientos(ctx, 1);
        await abrir_modal_confirmacion(ctx);

        // NO llenamos comprador ni pasajero.
        await ctx.clic("#confirmar_venta");
        await ctx.pausa(600);

        const aviso = await ctx.leer_aviso();
        ctx.assert(aviso && (aviso.includes("DNI") || aviso.includes("obligatorio") || aviso.includes("Comprador")),
            "No se detecto el rechazo por falta de comprador: " + JSON.stringify(aviso));

        await cerrar_form_venta_y_liberar(ctx);
    }
};