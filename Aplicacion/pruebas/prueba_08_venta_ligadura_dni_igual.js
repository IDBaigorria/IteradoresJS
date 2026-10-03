/**
 * Ligadura comprador-pasajero: mismo DNI.
 * El comprador tiene datos; al poner el mismo DNI en el pasajero,
 * los campos comunes deben copiarse. Caso reportado del bug 2.
 * @version 1.5plugin.4k
 */
import {
    login_terminal, ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres, seleccionar_n_asientos,
    abrir_modal_confirmacion, llenar_comprador, dni_unico,
    esperar_valor, cerrar_form_venta_y_liberar
} from "./_helpers.js";

export const prueba = {
    id: "venta_ligadura_dni_igual",
    nombre: "Venta: ligadura comprador-pasajero con mismo DNI",
    descripcion: "Carga el comprador con datos, despues pone el mismo DNI en el pasajero. Los campos comunes deben copiarse.",

    async ejecutar(ctx) {
        await login_terminal(ctx);
        await ir_a_viajes_y_abrir_primero(ctx);
        await abrir_primer_micro_con_libres(ctx);
        await seleccionar_n_asientos(ctx, 1);
        await abrir_modal_confirmacion(ctx);

        const dni_compartido = dni_unico();
        await llenar_comprador(ctx, {
            dni: dni_compartido,
            apellido: "Garcia",
            nombres: "Maria",
            email: "maria@test.local",
            celular: "2983555111"
        });

        // Ahora el pasajero con el mismo DNI. La copia ocurre cuando
        // vuelve el fetch del DNI del pasajero, que puede tardar.
        await ctx.escribir("#pasajero_dni_0", dni_compartido);

        ctx.assert(await esperar_valor(ctx, "#pasajero_apellido_0", "Garcia", 5000),
            "Apellido no se copio");
        ctx.assert(await esperar_valor(ctx, "#pasajero_nombres_0", "Maria", 5000),
            "Nombres no se copiaron");
        ctx.assert(await esperar_valor(ctx, "#pasajero_email_0", "maria@test.local", 5000),
            "Email no se copio");
        ctx.assert(await esperar_valor(ctx, "#pasajero_celular_0", "2983555111", 5000),
            "Celular no se copio");

        // Cerrar sin confirmar y liberar los asientos seleccionados.
        await cerrar_form_venta_y_liberar(ctx);
    }
};