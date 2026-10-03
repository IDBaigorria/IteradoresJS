/**
 * Cancelar el form de venta y reabrir. Los campos deben estar limpios.
 * @version 1.5plugin.4
 */
import {
    login_terminal, ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres, seleccionar_n_asientos,
    abrir_modal_confirmacion, llenar_comprador,
    datos_comprador_aleatorio
} from "./_helpers.js";

export const prueba = {
    id: "venta_cancelar_reabrir",
    nombre: "Venta: cancelar y reabrir el formulario",
    descripcion: "Llena el form, cancela, reabre. Los campos deben estar limpios.",

    async ejecutar(ctx) {
        await login_terminal(ctx);
        await ir_a_viajes_y_abrir_primero(ctx);
        await abrir_primer_micro_con_libres(ctx);
        await seleccionar_n_asientos(ctx, 1);
        await abrir_modal_confirmacion(ctx);

        await llenar_comprador(ctx, datos_comprador_aleatorio());

        // Cancelar
        await ctx.clic("#cancelar_venta_modal");
        const oculto = await ctx.esperar_oculto("#formulario_confirmacion_venta", 3000);
        ctx.assert(oculto && oculto.exito, "El formulario no se oculto");

        // Reabrir
        await ctx.clic("#boton_confirmar_venta");
        const form_visible = await ctx.esperar_visible("#formulario_confirmacion_venta", 5000);
        ctx.assert(form_visible && form_visible.exito, "El formulario no se reabrio");

        const dni_comp = await ctx.valor("#comprador_dni");
        ctx.assert(dni_comp === "" || dni_comp === null,
            "El DNI del comprador no se limpio: " + JSON.stringify(dni_comp));

        // Cerrar
        await ctx.clic("#cancelar_venta_modal");
    }
};