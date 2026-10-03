/**
 * Correccion de DNI del pasajero:
 * DNI registrado -> se autocompleta. Despues se cambia por uno
 * no registrado -> se limpian los campos.
 * @version 1.5plugin.4
 */
import {
    login_terminal, ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres, seleccionar_n_asientos,
    abrir_modal_confirmacion, crear_pasajero_de_prueba, dni_unico
} from "./_helpers.js";

export const prueba = {
    id: "venta_correccion_dni_pasajero",
    nombre: "Venta: correccion de DNI del pasajero",
    descripcion: "Con un DNI registrado se autocompletan los campos. Al cambiar a uno no registrado, se limpian.",

    async ejecutar(ctx) {
        await login_terminal(ctx);

        // Crear un pasajero de prueba con un DNI registrado
        const dni_registrado = dni_unico();
        await crear_pasajero_de_prueba(ctx, dni_registrado);

        await ir_a_viajes_y_abrir_primero(ctx);
        await abrir_primer_micro_con_libres(ctx);
        await seleccionar_n_asientos(ctx, 1);
        await abrir_modal_confirmacion(ctx);

        // Escribir el DNI registrado
        await ctx.escribir("#pasajero_dni_0", dni_registrado);
        await ctx.pausa(800);

        const apellido = await ctx.valor("#pasajero_apellido_0");
        ctx.assert(apellido === "Correccion", "No se autocompleto: " + JSON.stringify(apellido));

        // Cambiar por un DNI no registrado
        const dni_nuevo = dni_unico();
        await ctx.escribir("#pasajero_dni_0", dni_nuevo);
        await ctx.pausa(800);

        const apellido_limpiado = await ctx.valor("#pasajero_apellido_0");
        ctx.assert(apellido_limpiado === "" || apellido_limpiado === null,
            "El apellido no se limpio: " + JSON.stringify(apellido_limpiado));

        await ctx.clic("#cancelar_venta_modal");
    }
};