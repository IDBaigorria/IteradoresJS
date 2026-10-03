/**
 * Correccion de DNI del comprador.
 * @version 1.5plugin.4
 */
import {
    login_terminal, ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres, seleccionar_n_asientos,
    abrir_modal_confirmacion, crear_pasajero_de_prueba, dni_unico
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

        // Escribir el DNI registrado en el comprador
        await ctx.escribir("#comprador_dni", dni_registrado);
        await ctx.pausa(800);

        const apellido = await ctx.valor("#comprador_apellido");
        ctx.assert(apellido === "CompradorPrueba", "No se autocompleto: " + JSON.stringify(apellido));

        // Cambiar por uno no registrado
        const dni_nuevo = dni_unico();
        await ctx.escribir("#comprador_dni", dni_nuevo);
        await ctx.pausa(800);

        const apellido_limpiado = await ctx.valor("#comprador_apellido");
        ctx.assert(apellido_limpiado === "" || apellido_limpiado === null,
            "El apellido del comprador no se limpio: " + JSON.stringify(apellido_limpiado));

        await ctx.clic("#cancelar_venta_modal");
    }
};