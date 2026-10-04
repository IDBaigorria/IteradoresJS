/**
 * Prueba: alta de terminal por parte de un dueño.
 *
 * Flujo:
 *   1. Login como dueño.
 *   2. Ir a la pestaña Puntos de venta (id "terminales" en
 *      el HTML del piloto).
 *   3. Click en "Agregar punto de venta".
 *   4. Llenar el formulario con datos únicos.
 *   5. Guardar. El botón dispara un alert() con el código
 *      generado; hay que sobrescribir window.alert para no
 *      bloquear.
 *   6. Verificar que la nueva terminal aparezca en la tabla.
 *
 * IMPORTANTE: cada corrida crea una terminal nueva con un
 * nombre único (prefijo "termprueba"). El test NO la
 * elimina; las corridas sucesivas van acumulando terminales
 * de prueba. Limpiar manualmente desde la misma pestaña
 * cuando molesten.
 *
 * @version 1.5plugin.4r
 */

import { CODIGO_DUENO } from "../ConfPlugin.js";

export const prueba = {
    id: "alta_terminal",
    nombre: "Alta de terminal (dueño)",
    descripcion: "Verifica que un dueño pueda crear una terminal desde la pestaña Puntos de venta. Cubre el flujo de alta y su reflejo en la tabla. Cada corrida crea una terminal nueva (prefijo termprueba).",

    async ejecutar(ctx) {
        // 1. Login como dueño.
        await ctx.asegurar_login(CODIGO_DUENO);

        // 2. Activar la pestaña Puntos de venta.
        const activacion = await ctx.activar_pestana_piloto("terminales");
        ctx.assert(activacion && activacion.exito, "No se pudo activar la pestaña Puntos de venta: " + (activacion && activacion.error ? activacion.error : "sin detalle"));

        // 3. Esperar el botón de alta.
        const espera_boton = await ctx.esperar("#boton_agregar_terminal", 5000);
        ctx.assert(espera_boton && espera_boton.exito, "No apareció el botón #boton_agregar_terminal");

        // 4. Sobrescribir alert/confirm. El Guardar dispara alert()
        //    con el código generado; las extensiones no pueden
        //    manejar dialogs nativos. La sobrescritura tiene que
        //    estar activa durante toda la operación.
        await ctx.sobrescribir_alertas();

        try {
            // 5. Click en Agregar punto de venta.
            const clic_agregar = await ctx.clic("#boton_agregar_terminal");
            ctx.assert(clic_agregar && clic_agregar.exito, "No se pudo hacer clic en Agregar punto de venta");

            // 6. Esperar el formulario.
            const espera_form = await ctx.esperar("#nuevo_terminal_nombre_usuario", 5000);
            ctx.assert(espera_form && espera_form.exito, "No apareció el formulario de alta de terminal");

            // 7. Llenar el formulario con datos únicos.
            const sufijo = String(Date.now()).slice(-8);
            const nombre_usuario = "termprueba" + sufijo;
            const codigo_acceso = "cod" + sufijo;
            const nombre_real = "Terminal Prueba " + sufijo;

            await ctx.escribir("#nuevo_terminal_nombre_usuario", nombre_usuario);
            await ctx.escribir("#nuevo_terminal_nombre_real", nombre_real);
            await ctx.escribir("#nuevo_terminal_codigo_acceso", codigo_acceso);
            await ctx.escribir("#nuevo_terminal_banco_nombre", "Banco Test");
            await ctx.escribir("#nuevo_terminal_banco_cuenta", "12345678");

            // 8. Guardar.
            const clic_guardar = await ctx.clic("#boton_guardar_terminal");
            ctx.assert(clic_guardar && clic_guardar.exito, "No se pudo hacer clic en Guardar");

            // 9. Esperar a que la tabla se actualice. Verificamos que la
            //    nueva terminal aparezca en #tabla_terminales_dueno.
            let encontrada = false;
            const inicio = Date.now();
            while (Date.now() - inicio < 8000) {
                const html_tabla = await ctx.html("#tabla_terminales_dueno");
                if (html_tabla && html_tabla.includes(nombre_usuario)) {
                    encontrada = true;
                    break;
                }
                await ctx.pausa(300);
            }

            ctx.assert(encontrada, "La nueva terminal (" + nombre_usuario + ") no apareció en la tabla #tabla_terminales_dueno después del alta");
        } finally {
            await ctx.restaurar_alertas();
        }
    }
};