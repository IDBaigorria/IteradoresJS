/**
 * Correccion de DNI del comprador.
 * @version 1.5plugin.4i
 */
import {
    login_terminal, ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres, seleccionar_n_asientos,
    abrir_modal_confirmacion, crear_pasajero_de_prueba, dni_unico,
    esperar_valor, esperar_valor_vacio
} from "./_helpers.js";

export const prueba = {
    id: "venta_correccion_dni_comprador",
    nombre: "Venta: correccion de DNI del comprador",
    descripcion: "Con un DNI registrado se autocompletan los campos del comprador. Al cambiarlo por uno no registrado, se limpian.",

    async ejecutar(ctx) {
        await login_terminal(ctx);

        const dni_registrado = dni_unico();
        await crear_pasajero_de_prueba(ctx, dni_registrado, {
            apellido: "CompradorPrueba",
            nombres: "Auto",
            celular: "2983555432"
        });

        await ir_a_viajes_y_abrir_primero(ctx);
        await abrir_primer_micro_con_libres(ctx);
        await seleccionar_n_asientos(ctx, 1);
        await abrir_modal_confirmacion(ctx);

        // Escribir el DNI registrado en el comprador. La
        // autocompletada ocurre cuando vuelve el fetch.
        await ctx.escribir("#comprador_dni", dni_registrado);
        ctx.assert(await esperar_valor(ctx, "#comprador_apellido", "CompradorPrueba", 5000),
            "No se autocompleto el apellido del comprador");

        // Cambiar por uno no registrado. El piloto limpia los
        // campos cuando vuelve el fetch del DNI nuevo.
        const dni_nuevo = dni_unico();
        await ctx.escribir("#comprador_dni", dni_nuevo);
        ctx.assert(await esperar_valor_vacio(ctx, "#comprador_apellido", 5000),
            "El apellido del comprador no se limpio");

        await ctx.clic("#cancelar_venta_modal");
    }
};