/**
 * Ligadura inversa: el pasajero se llena primero.
 * Al poner el mismo DNI en el comprador, los datos comunes
 * deben copiarse pasajero -> comprador.
 * @version 1.5plugin.4
 */
import {
    login_terminal, ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres, seleccionar_n_asientos,
    abrir_modal_confirmacion, llenar_pasajero, dni_unico
} from "./_helpers.js";

export const prueba = {
    id: "venta_comprador_lleno_pasajero_vacio",
    nombre: "Venta: pasajero lleno, comprador con el mismo DNI",
    descripcion: "Carga el pasajero primero, despues pone el mismo DNI en el comprador. Los campos comunes deben copiarse.",

    async ejecutar(ctx) {
        await login_terminal(ctx);
        await ir_a_viajes_y_abrir_primero(ctx);
        await abrir_primer_micro_con_libres(ctx);
        await seleccionar_n_asientos(ctx, 1);
        await abrir_modal_confirmacion(ctx);

        const dni_compartido = dni_unico();
        await llenar_pasajero(ctx, 0, {
            dni: dni_compartido,
            apellido: "Lopez",
            nombres: "Juan",
            email: "juan@test.local",
            celular: "2983555222",
            celular_emergencia: "2983111333",
            fecha_nacimiento: "1985-03-10",
            direccion: "Calle Falsa 742",
            localidad: "Tres Arroyos"
        });

        // Ahora el comprador con el mismo DNI
        await ctx.escribir("#comprador_dni", dni_compartido);
        await ctx.pausa(800);

        const apellido_comp = await ctx.valor("#comprador_apellido");
        const nombres_comp = await ctx.valor("#comprador_nombres");
        const email_comp = await ctx.valor("#comprador_email");
        const celular_comp = await ctx.valor("#comprador_celular");

        ctx.assert(apellido_comp === "Lopez", "Apellido no se copio: " + JSON.stringify(apellido_comp));
        ctx.assert(nombres_comp === "Juan", "Nombres no se copiaron: " + JSON.stringify(nombres_comp));
        ctx.assert(email_comp === "juan@test.local", "Email no se copio: " + JSON.stringify(email_comp));
        ctx.assert(celular_comp === "2983555222", "Celular no se copio: " + JSON.stringify(celular_comp));

        await ctx.clic("#cancelar_venta_modal");
    }
};