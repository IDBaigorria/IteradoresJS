/**
 * Prueba: alta de terminal por parte de un dueño.
 *
 * Flujo:
 *   1. Login como dueño.
 *   2. Doble protección contra el alert del código de acceso:
 *      a. ctx.activar_modo_prueba() -> setea
 *         window.__iteradores_modo_prueba = true, que el
 *         helper _mostrar_alerta_critica() del piloto respeta
 *         (aplicado en v1.5piloto.74j).
 *      b. ctx.sobrescribir_alertas() -> override de
 *         window.alert y window.confirm en el page context.
 *      Si una capa falla, la otra cubre. El override fue lo
 *      que funcionó en v1.5plugin.4t; la bandera es refuerzo.
 *   3. Ir a la pestaña Puntos de venta.
 *   4. Click en "Agregar punto de venta" (abre modal).
 *   5. Llenar los campos del modal con datos únicos.
 *   6. Guardar.
 *   7. Verificar que la nueva terminal aparezca en la tabla.
 *   8. Restaurar (finally).
 *
 * IMPORTANTE: cada corrida crea una terminal nueva con un
 * nombre único (prefijo "termprueba"). El test NO la
 * elimina; las corridas sucesivas van acumulando terminales
 * de prueba. Limpiar manualmente desde la misma pestaña.
 *
 * @version 1.5plugin.4v
 */

import { CODIGO_DUENO } from "../ConfPlugin.js";

export const prueba = {
    id: "alta_terminal",
    nombre: "Alta de terminal (dueño)",
    descripcion: "Verifica que un dueño pueda crear una terminal desde la pestaña Puntos de venta. Cubre el alta vía modal genérico y su reflejo en la tabla. Cada corrida crea una terminal nueva (prefijo termprueba).",

    async ejecutar(ctx) {
        // 1. Login como dueño.
        await ctx.asegurar_login(CODIGO_DUENO);

        // 2a. Bandera de modo prueba (refuerzo, requiere piloto
        //     v74j+).
        const modo = await ctx.activar_modo_prueba();
        ctx.assert(modo && modo.exito, "No se pudo activar el modo prueba: " + (modo && modo.error ? modo.error : "sin detalle"));

        // 2b. Override de window.alert / window.confirm. Este es el
        //     que ya funcionó en v1.5plugin.4t. Se aplica SIEMPRE,
        //     independientemente de si la bandera del piloto está
        //     activa.
        const override = await ctx.sobrescribir_alertas();
        ctx.assert(override && override.exito, "sobrescribir_alertas falló: " + (override && override.error ? override.error : "sin detalle"));

        try {
            // 3. Activar la pestaña Puntos de venta.
            const activacion = await ctx.activar_pestana_piloto("terminales");
            ctx.assert(activacion && activacion.exito, "No se pudo activar la pestaña Puntos de venta: " + (activacion && activacion.error ? activacion.error : "sin detalle"));

            // 4. Esperar el botón de alta.
            const espera_boton = await ctx.esperar("#boton_agregar_terminal", 5000);
            ctx.assert(espera_boton && espera_boton.exito, "No apareció el botón #boton_agregar_terminal");

            // 5. Click en Agregar punto de venta.
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
            //     Timeout holgado (25s) e intervalo de 500ms.
            let encontrada = false;
            const inicio = Date.now();
            while (Date.now() - inicio < 25000) {
                const html_tabla = await ctx.html("#tabla_terminales_dueno");
                if (html_tabla && html_tabla.includes(nombre_usuario)) {
                    encontrada = true;
                    break;
                }
                await ctx.pausa(500);
            }

            ctx.assert(encontrada, "La nueva terminal (" + nombre_usuario + ") no apareció en la tabla #tabla_terminales_dueno después del alta");
        } finally {
            // 11. Restaurar (idempotente).
            await ctx.restaurar_alertas();
            await ctx.desactivar_modo_prueba();
        }
    }
};