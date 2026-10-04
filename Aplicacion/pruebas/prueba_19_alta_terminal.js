/**
 * Prueba: alta de terminal por parte de un dueño.
 *
 * Flujo:
 *   1. Login como dueño.
 *   2. Ir a la pestaña Puntos de venta (id "terminales").
 *   3. Click en "Agregar punto de venta". El botón abre un
 *      modal genérico (aplicacion.js, función
 *      abrir_modal_agregar_usuario_generico). Los campos del
 *      modal tienen IDs con prefijo "modal_agregar_*", no
 *      "nuevo_terminal_*" (los del formulario embebido en el
 *      HTML, que quedó sin uso desde v73g).
 *   4. Llenar los campos del modal con datos únicos.
 *   5. Guardar. El modal cierra con alert() mostrando el
 *      código asignado; hay que sobrescribir window.alert.
 *   6. Verificar que la nueva terminal aparezca en la tabla
 *      #tabla_terminales_dueno.
 *
 * IMPORTANTE: cada corrida crea una terminal nueva con un
 * nombre único (prefijo "termprueba"). El test NO la
 * elimina; las corridas sucesivas van acumulando terminales
 * de prueba. Limpiar manualmente desde la misma pestaña.
 *
 * @version 1.5plugin.4s
 */

import { CODIGO_DUENO } from "../ConfPlugin.js";

export const prueba = {
    id: "alta_terminal",
    nombre: "Alta de terminal (dueño)",
    descripcion: "Verifica que un dueño pueda crear una terminal desde la pestaña Puntos de venta. Cubre el alta vía modal genérico y su reflejo en la tabla. Cada corrida crea una terminal nueva (prefijo termprueba).",

    async ejecutar(ctx) {
        // 1. Login como dueño.
        await ctx.asegurar_login(CODIGO_DUENO);

        // 2. Activar la pestaña Puntos de venta.
        const activacion = await ctx.activar_pestana_piloto("terminales");
        ctx.assert(activacion && activacion.exito, "No se pudo activar la pestaña Puntos de venta: " + (activacion && activacion.error ? activacion.error : "sin detalle"));

        // 3. Esperar el botón de alta.
        const espera_boton = await ctx.esperar("#boton_agregar_terminal", 5000);
        ctx.assert(espera_boton && espera_boton.exito, "No apareció el botón #boton_agregar_terminal");

        // 4. Sobrescribir alert/confirm durante todo el flujo.
        //    El modal de alta cierra con alert() mostrando el
        //    código asignado; las extensiones no pueden manejar
        //    dialogs nativos.
        await ctx.sobrescribir_alertas();

        try {
            // 5. Click en Agregar punto de venta (abre el modal).
            const clic_agregar = await ctx.clic("#boton_agregar_terminal");
            ctx.assert(clic_agregar && clic_agregar.exito, "No se pudo hacer clic en Agregar punto de venta");

            // 6. Esperar el campo Nombre de usuario dentro del modal.
            const espera_modal = await ctx.esperar("#modal_agregar_nombre_usuario", 5000);
            ctx.assert(espera_modal && espera_modal.exito, "No apareció el modal de alta de terminal (campo #modal_agregar_nombre_usuario)");

            // 7. Esperar que el campo Banco sea visible. En el modal
            //    con nivel terminal, actualizar_visibilidad() lo
            //    desoculta. Es un buen ancla de que el modal ya está
            //    listo para llenarse.
            const espera_banco = await ctx.esperar_visible("#modal_agregar_banco_nombre", 3000);
            ctx.assert(espera_banco && espera_banco.exito, "El campo Banco del modal no se hizo visible (¿nivel no quedó en terminal?)");

            // 8. Llenar los campos con datos únicos.
            const sufijo = String(Date.now()).slice(-8);
            const nombre_usuario = "termprueba" + sufijo;
            const codigo_acceso = "cod" + sufijo;
            const nombre_real = "Terminal Prueba " + sufijo;

            await ctx.escribir("#modal_agregar_nombre_usuario", nombre_usuario);
            await ctx.escribir("#modal_agregar_codigo", codigo_acceso);
            await ctx.escribir("#modal_agregar_nombre_real", nombre_real);
            await ctx.escribir("#modal_agregar_banco_nombre", "Banco Test");
            await ctx.escribir("#modal_agregar_banco_cuenta", "12345678");

            // 9. Guardar.
            const clic_guardar = await ctx.clic("#modal_btn_guardar_alta");
            ctx.assert(clic_guardar && clic_guardar.exito, "No se pudo hacer clic en Guardar");

            // 10. Esperar a que el modal se cierre. Con alert
            //     sobrescrito no se bloquea; el modal cierra
            //     enseguida.
            const espera_cierre = await ctx.esperar_oculto("#modal_agregar_nombre_usuario", 5000);
            ctx.assert(espera_cierre && espera_cierre.exito, "El modal no se cerró después de Guardar (¿falló el alta?)");

            // 11. Verificar que la nueva terminal aparezca en la tabla.
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