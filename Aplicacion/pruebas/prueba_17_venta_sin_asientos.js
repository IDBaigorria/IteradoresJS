/**
 * Sin asientos seleccionados: el boton Vender no debe aparecer.
 * @version 1.5plugin.4
 */
import {
    login_terminal, ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres
} from "./_helpers.js";

export const prueba = {
    id: "venta_sin_asientos",
    nombre: "Venta: sin asientos seleccionados (boton oculto)",
    descripcion: "Sin asientos seleccionados, el boton Vender debe estar oculto.",

    async ejecutar(ctx) {
        await login_terminal(ctx);
        await ir_a_viajes_y_abrir_primero(ctx);
        await abrir_primer_micro_con_libres(ctx);

        // NO seleccionamos asientos
        const visible = await ctx.esta_visible("#contenedor_boton_confirmar_venta");
        ctx.assert(!visible, "El boton Vender deberia estar oculto sin asientos seleccionados");
    }
};