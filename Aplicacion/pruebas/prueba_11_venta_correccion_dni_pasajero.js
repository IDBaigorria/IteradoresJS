/**
 * Correccion de DNI del pasajero:
 * DNI registrado -> se autocompleta. Despues se cambia por uno
 * no registrado -> se limpian los campos.
 * @version 1.5plugin.4l
 */
import {
    login_terminal, ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres, seleccionar_n_asientos,
    abrir_modal_confirmacion, crear_pasajero_de_prueba, dni_unico,
    esperar_valor, esperar_valor_vacio, cerrar_form_venta_y_liberar
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

        // Escribir el DNI registrado. La autocompletada ocurre cuando
        // vuelve el fetch, que puede tardar.
        await ctx.escribir("#pasajero_dni_0", dni_registrado);
        ctx.assert(await esperar_valor(ctx, "#pasajero_apellido_0", "Correccion", 5000),
            "No se autocompleto el apellido del pasajero");

        // Cambiar por un DNI no registrado. El piloto limpia los
        // campos cuando vuelve el fetch del DNI nuevo.
        const dni_nuevo = dni_unico();
        await ctx.escribir("#pasajero_dni_0", dni_nuevo);
        ctx.assert(await esperar_valor_vacio(ctx, "#pasajero_apellido_0", 5000),
            "El apellido del pasajero no se limpio");

        await cerrar_form_venta_y_liberar(ctx);
    }
};