/**
 * Venta de 2 asientos con 2 pasajeros distintos.
 * @version 1.5plugin.4
 */
import {
    login_terminal, ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres, seleccionar_n_asientos,
    abrir_modal_confirmacion, llenar_comprador, llenar_pasajero,
    setear_metodo_y_cuotas, confirmar_venta,
    obtener_id_ultima_venta, cancelar_venta,
    datos_comprador_aleatorio, datos_pasajero_aleatorio
} from "./_helpers.js";

export const prueba = {
    id: "venta_dos_asientos",
    nombre: "Venta: 2 asientos, 2 pasajeros distintos",
    descripcion: "Vende 2 asientos con 2 pasajeros con DNIs distintos.",

    async ejecutar(ctx) {
        await login_terminal(ctx);
        await ir_a_viajes_y_abrir_primero(ctx);
        await abrir_primer_micro_con_libres(ctx);
        await seleccionar_n_asientos(ctx, 2);
        await abrir_modal_confirmacion(ctx);

        await llenar_comprador(ctx, datos_comprador_aleatorio());
        await llenar_pasajero(ctx, 0, datos_pasajero_aleatorio(0));
        await llenar_pasajero(ctx, 1, datos_pasajero_aleatorio(1));

        await setear_metodo_y_cuotas(ctx, "efectivo", 1);
        await confirmar_venta(ctx);

        const id_venta = await obtener_id_ultima_venta(ctx);
        ctx.assert(id_venta, "No se obtuvo el id de la venta");
        await cancelar_venta(ctx, id_venta);
    }
};