/**
 * Ligadura comprador-pasajero: mismo DNI.
 * El comprador tiene datos; al poner el mismo DNI en el pasajero,
 * los campos comunes deben copiarse. Caso reportado del bug 2.
 * @version 1.5plugin.4
 */
import {
    login_terminal, ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres, seleccionar_n_asientos,
    abrir_modal_confirmacion, llenar_comprador, dni_unico
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

        // Ahora el pasajero con el mismo DNI
        await ctx.escribir("#pasajero_dni_0", dni_compartido);
        await ctx.pausa(800);

        const apellido_pas = await ctx.valor("#pasajero_apellido_0");
        const nombres_pas = await ctx.valor("#pasajero_nombres_0");
        const email_pas = await ctx.valor("#pasajero_email_0");
        const celular_pas = await ctx.valor("#pasajero_celular_0");

        ctx.assert(apellido_pas === "Garcia", "Apellido no se copio: " + JSON.stringify(apellido_pas));
        ctx.assert(nombres_pas === "Maria", "Nombres no se copiaron: " + JSON.stringify(nombres_pas));
        ctx.assert(email_pas === "maria@test.local", "Email no se copio: " + JSON.stringify(email_pas));
        ctx.assert(celular_pas === "2983555111", "Celular no se copio: " + JSON.stringify(celular_pas));

        // Cerrar sin confirmar
        await ctx.clic("#cancelar_venta_modal");
    }
};