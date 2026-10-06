/**
 * Prueba: autocompletado por DNI con usuario terminal desde
 * la pestaña Pasajeros/Clientes.
 *
 * Cubre el fix v74h del piloto PHP: cuando el usuario es terminal
 * y no hay un viaje seleccionado, el modal de alta de pasajero
 * resolvía el dueño desde `viaje_seleccionado.dueno`, que podía
 * ser undefined. El fix usa `usuario_actual.dueno` como fallback.
 *
 * Flujo:
 *   1. Login como terminal.
 *   2. Ir a la pestaña Pasajeros/Clientes.
 *   3. Crear un pasajero de prueba con un DNI único.
 *   4. Abrir el modal de alta.
 *   5. Escribir el DNI.
 *   6. Verificar que apellido y nombres se autocompletan.
 *   7. Cerrar el modal.
 *
 * @version 1.5plugin.4p
 */

import { CODIGO_TERMINAL1 } from "../ConfiguracionApli.js";

export const prueba = {
    id: "autocompletado_dni_terminal_clientes",
    nombre: "Autocompletado por DNI desde Clientes (terminal)",
    descripcion: "Verifica que el autocompletado por DNI funcione con usuario terminal desde la pestaña Pasajeros/Clientes, sin depender de que haya un viaje seleccionado. Cubre el fix v74h del piloto PHP.",

    async ejecutar(ctx) {
        // 1. Login como terminal.
        await ctx.asegurar_login(CODIGO_TERMINAL1);

        // 2. Activar la pestaña Pasajeros/Clientes.
        const activacion = await ctx.activar_pestana_piloto("pasajeros");
        ctx.assert(activacion && activacion.exito, "No se pudo activar la pestaña Pasajeros: " + (activacion && activacion.error ? activacion.error : "sin detalle"));

        // 3. Esperar el botón de alta.
        const espera_boton = await ctx.esperar("#boton_agregar_pasajero", 5000);
        ctx.assert(espera_boton && espera_boton.exito, "No apareció el botón #boton_agregar_pasajero");

        // 4. Crear un pasajero de prueba con un DNI único. Este helper
        //    resuelve el dueño desde el page (usuario_actual.dueno para
        //    terminal).
        const dni = ctx.dni_unico();
        const apellido = "Prueba";
        const nombres = "Autocompletado";

        const creacion = await ctx.crear_pasajero_de_prueba({
            dni,
            apellido,
            nombres,
            email: "",
            celular: "2983123456",
            celular_emergencia: "2983654321",
            fecha_nacimiento: "1990-01-01",
            direccion: "Calle Falsa 123",
            localidad: "Tres Arroyos"
        });

        ctx.assert(creacion && creacion.exito, "No se pudo crear el pasajero de prueba: " + (creacion && creacion.error ? creacion.error : "sin detalle"));

        // 5. Abrir el modal de alta.
        const clic_agregar = await ctx.clic("#boton_agregar_pasajero");
        ctx.assert(clic_agregar && clic_agregar.exito, "No se pudo hacer clic en Agregar pasajero");

        // 6. Esperar el campo DNI dentro del modal.
        const espera_dni = await ctx.esperar("#pasajero_dni_0", 5000);
        ctx.assert(espera_dni && espera_dni.exito, "No apareció el campo #pasajero_dni_0 en el modal de alta");

        // 7. Escribir el DNI completo. El piloto dispara la búsqueda al
        //    llegar a 7-8 dígitos desde el listener de `input`.
        const escritura = await ctx.escribir("#pasajero_dni_0", dni);
        ctx.assert(escritura && escritura.exito, "No se pudo escribir en el campo DNI");

        // 8. Esperar a que se autocomplete el apellido. Polling hasta 6s.
        let apellido_leido = "";
        const inicio = Date.now();
        while (Date.now() - inicio < 6000) {
            apellido_leido = (await ctx.valor("#pasajero_apellido_0")) || "";
            if (apellido_leido.trim() !== "") break;
            await ctx.pausa(200);
        }

        ctx.assert(
            apellido_leido.trim() !== "",
            "El apellido no se autocompletó. Revisá: (a) que el fix v74h esté aplicado en el piloto PHP, (b) que el pasajero de prueba se haya creado OK, (c) que el listener de input del DNI esté conectado."
        );

        ctx.assert(
            apellido_leido === apellido,
            "El apellido autocompletado ('" + apellido_leido + "') no coincide con el esperado ('" + apellido + "')"
        );

        // 9. Verificar nombres también.
        const nombres_leidos = (await ctx.valor("#pasajero_nombres_0")) || "";
        ctx.assert(
            nombres_leidos === nombres,
            "Los nombres autocompletados ('" + nombres_leidos + "') no coinciden con los esperados ('" + nombres + "')"
        );

        // 10. Cerrar el modal.
        const clic_cerrar = await ctx.clic("#boton_cancelar_nuevo_pasajero");
        ctx.assert(clic_cerrar && clic_cerrar.exito, "No se pudo cerrar el modal de alta de pasajero");
    }
};