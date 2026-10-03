/**
 * Venta en cuotas: 1 asiento, efectivo, 2 cuotas, pago parcial.
 * Verifica que la venta queda con cupones pendientes (por
 * backend, no por DOM, porque no navegamos a Vendidos).
 * @version 1.5plugin.4k
 */
import {
    login_terminal, ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres, seleccionar_n_asientos,
    abrir_modal_confirmacion, llenar_comprador, llenar_pasajero,
    setear_metodo_y_cuotas, confirmar_venta,
    obtener_id_ultima_venta, obtener_venta_por_id, cancelar_venta,
    datos_comprador_aleatorio, datos_pasajero_aleatorio
} from "./_helpers.js";

export const prueba = {
    id: "venta_cuotas",
    nombre: "Venta: en cuotas (2 cuotas, pago parcial)",
    descripcion: "Vende 1 asiento en efectivo a 2 cuotas con pago parcial. Verifica que queden cupones pendientes y cancela.",

    async ejecutar(ctx) {
        await login_terminal(ctx);
        await ir_a_viajes_y_abrir_primero(ctx);
        await abrir_primer_micro_con_libres(ctx);
        await seleccionar_n_asientos(ctx, 1);
        await abrir_modal_confirmacion(ctx);

        await llenar_comprador(ctx, datos_comprador_aleatorio());
        await llenar_pasajero(ctx, 0, datos_pasajero_aleatorio(0));

        await setear_metodo_y_cuotas(ctx, "efectivo", 2);
        // El input ya tiene el valor por defecto (total/2). Lo dejamos.
        await confirmar_venta(ctx);

        const id_venta = await obtener_id_ultima_venta(ctx);
        ctx.assert(id_venta, "No se obtuvo el id de la venta");

        // Verificar por backend que la venta tiene cupones pendientes.
        const venta = await obtener_venta_por_id(ctx, id_venta);
        ctx.assert(venta && Array.isArray(venta.cupones),
            "La venta no trae cupones: " + JSON.stringify(venta ? Object.keys(venta) : null));

        const pendientes = venta.cupones.filter(c => c.estado === "pendiente");
        ctx.assert(pendientes.length > 0,
            "La venta no tiene cupones pendientes. Cupones: " + JSON.stringify(venta.cupones));

        await cancelar_venta(ctx, id_venta);
    }
};