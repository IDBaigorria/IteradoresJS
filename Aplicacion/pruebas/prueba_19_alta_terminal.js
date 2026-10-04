/**
 * Prueba: alta de terminal por parte de un dueño.
 *
 * Flujo:
 *   1. Login como dueño.
 *   2. Activar modo prueba del piloto
 *      (window.__iteradores_modo_prueba = true). Esto evita
 *      que el alert() de "código de acceso" bloquee el page
 *      context. Requiere el helper _mostrar_alerta_critica
 *      en el piloto (v1.5piloto.74j+).
 *   3. Ir a la pestaña Puntos de venta.
 *   4. Click en "Agregar punto de venta" (abre modal).
 *   5. Llenar los campos del modal con datos únicos.
 *   6. Guardar. El modal cierra sin alert bloqueante.
 *   7. Verificar que la nueva terminal aparezca en la tabla.
 *   8. Desactivar modo prueba (finally).
 *
 * IMPORTANTE: cada corrida crea una terminal nueva con un
 * nombre único (prefijo "termprueba"). El test NO la
 * elimina; las corridas sucesivas van acumulando terminales
 * de prueba. Limpiar manualmente desde la misma pestaña.
 *
 * @version 1.5plugin.4u
 */

import { CODIGO_DUENO } from "../ConfPlugin.js";

export const prueba = {
    id: "alta_terminal",
    nombre: "Alta de terminal (dueño)",
    descripcion: "Verifica que un dueño pueda crear una terminal desde la pestaña Puntos de venta. Cubre el alta vía modal genérico y su reflejo en la tabla. Cada corrida crea una terminal nueva (prefijo termprueba).",

    async ejecutar(ctx) {
        // 1. Login como dueño.
        await ctx.asegurar_login(CODIGO_DUENO);

        // 2. Activar modo prueba ANTES de cualquier acción que
        //    pueda disparar un alert(). El piloto respeta la
        //    bandera en _mostrar_alerta_critica().
        const modo = await ctx.activar_modo_prueba();
        ctx.assert(modo && modo.exito, "No se pudo activar el modo prueba: " + (modo && modo.error ? modo.error : "sin detalle"));

        try {
            // 3. Activar la pestaña Puntos de venta.
            const activacion = await ctx.activar_pestana_piloto("terminales");
            ctx.assert(activacion && activacion.exito, "No se pudo activar la pestaña Puntos de venta: " + (activacion && activacion.error ? activacion.error : "sin detalle"));

            // 4. Esperar el botón de alta.
            const espera_boton = await ctx.esperar("#boton_agregar_terminal", 5000);
            ctx.assert(espera_boton && espera_boton.exito, "No apareció el botón #boton_agregar_terminal");

            // 5. Click en Agregar punto de venta (abre el modal).
            const clic_agregar = await ctx.clic("#boton_agregar_terminal");
            ctx.assert(clic_agregar && clic_agregar.exito, "No se pudo hacer clic en Agregar punto de venta");

            // 6. Esperar el campo Nombre de usuario dentro del modal.
            const espera_modal = await ctx.esperar("#modal_agregar_nombre_usuario", 5000);
            ctx.assert(espera_modal && espera_modal.exito, "No apareció el modal de alta de terminal (campo #modal_agregar_nombre_usuario)");

            // 7. Esperar que el campo Banco sea visible.
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

            // 10. Verificar que la nueva terminal aparezca en la tabla.
            //     Con el modo prueba, no hay alert bloqueante; el
            //     flujo es fluido.
            let encontrada = false;
            const inicio = Date.now();
            while (Date.now() - inicio < 10000) {
                const html_tabla = await ctx.html("#tabla_terminales_dueno");
                if (html_tabla && html_tabla.includes(nombre_usuario)) {
                    encontrada = true;
                    break;
                }
                await ctx.pausa(300);
            }

            ctx.assert(encontrada, "La nueva terminal (" + nombre_usuario + ") no apareció en la tabla #tabla_terminales_dueno después del alta");
        } finally {
            // 11. Desactivar modo prueba (idempotente).
            await ctx.desactivar_modo_prueba();
        }
    }
};