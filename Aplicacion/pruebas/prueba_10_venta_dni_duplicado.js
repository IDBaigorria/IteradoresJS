/**
 * DNI duplicado entre pasajeros.
 * @version 1.5plugin.4
 */
import {
    login_terminal, ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres, seleccionar_n_asientos,
    abrir_modal_confirmacion, llenar_pasajero, dni_unico
} from "./_helpers.js";

export const prueba = {
    id: "venta_dni_duplicado",
    nombre: "Venta: DNI duplicado entre pasajeros",
    descripcion: "Dos pasajeros con el mismo DNI. El segundo debe mostrar aviso de duplicado.",

    async ejecutar(ctx) {
        await login_terminal(ctx);
        await ir_a_viajes_y_abrir_primero(ctx);
        await abrir_primer_micro_con_libres(ctx);
        await seleccionar_n_asientos(ctx, 2);
        await abrir_modal_confirmacion(ctx);

        const dni_repetido = dni_unico();
        await llenar_pasajero(ctx, 0, {
            dni: dni_repetido,
            apellido: "Uno",
            nombres: "Pasajero",
            email: "",
            celular: "2983555001",
            celular_emergencia: "2983111001",
            fecha_nacimiento: "1990-01-01",
            direccion: "Calle 1",
            localidad: "Tres Arroyos"
        });

        // Poner el mismo DNI en el pasajero 1
        await ctx.escribir("#pasajero_dni_1", dni_repetido);
        await ctx.pausa(800);

        const aviso = await ctx.texto("#pasajero_aviso_1");
        ctx.assert(aviso && (aviso.includes("otro pasajero") || aviso.includes("duplicado")),
            "No se detecto DNI duplicado: " + JSON.stringify(aviso));

        await ctx.clic("#cancelar_venta_modal");
    }
};