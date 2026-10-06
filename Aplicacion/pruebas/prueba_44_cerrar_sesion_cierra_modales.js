/**
 * Prueba: cerrar sesión cierra todos los modales.
 *
 * Verifica el fix de v1.5piloto.76b. Antes, al cerrar
 * sesión con un modal abierto, el overlay seguía visible
 * sobre la pantalla de login. `_limpiar_contenido_dinamico`
 * limpiaba el contenido interno (tablas, listas) pero no
 * los overlays.
 *
 * Pasos:
 *   1. Login admin.
 *   2. Click en #nombre_usuario_actual → abre modal
 *      "Mis datos" (modal genérico).
 *   3. Confirmar que #modal_generico está visible.
 *   4. Click en "Salir".
 *   5. Esperar #pantalla_login.
 *   6. Verificar que ningún modal quedó visible:
 *      #modal_generico, #modal_apilado,
 *      #opciones_impresion, y los 5 .modal-chico.
 *
 * Requisitos de entorno: ninguno más que el admin.
 *
 * @version 1.5plugin.5q
 */

import { CODIGO_ADMIN } from "../ConfiguracionApli.js";

// ============================================================
// Prueba
// ============================================================

export const prueba = {
    id: "cerrar_sesion_cierra_modales",
    nombre: "Base: cerrar sesión cierra los modales",
    descripcion: "Verifica que al cerrar sesión con un modal abierto, todos los overlays quedan ocultos (v1.5piloto.76b).",
    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_ADMIN);

        // 1. Abrir el modal "Mis datos" clickeando el nombre de
        //    usuario en el header.
        const click_nombre = await ctx.clic("#nombre_usuario_actual");
        ctx.assert(click_nombre && click_nombre.exito,
            "No se pudo clickear #nombre_usuario_actual: "
            + (click_nombre && click_nombre.error ? click_nombre.error : "(sin detalle)"));

        // El modal se abre después de un fetch (usuarios/mi_perfil).
        const abierto = await ctx.esperar_visible("#modal_generico", 5000);
        ctx.assert(abierto && abierto.exito,
            "El modal \"Mis datos\" no se abrió tras clickear el nombre de usuario.");

        // 2. Cerrar sesión.
        const click_salir = await ctx.clic("#boton_salir");
        ctx.assert(click_salir && click_salir.exito,
            "No se pudo clickear #boton_salir: "
            + (click_salir && click_salir.error ? click_salir.error : "(sin detalle)"));

        const login_visible = await ctx.esperar_visible("#pantalla_login", 5000);
        ctx.assert(login_visible && login_visible.exito,
            "No apareció la pantalla de login tras cerrar sesión.");

        // 3. Verificar que ningún modal quedó visible.
        //    Pequeño margen por si el cierre es asíncrono.
        await ctx.pausa(300);

        const generico = await ctx.esta_visible("#modal_generico");
        ctx.assert(!generico,
            "El modal genérico sigue visible tras cerrar sesión.");

        const apilado = await ctx.esta_visible("#modal_apilado");
        ctx.assert(!apilado,
            "El modal apilado sigue visible tras cerrar sesión.");

        const impresion = await ctx.esta_visible("#opciones_impresion");
        ctx.assert(!impresion,
            "El modal de post-venta (#opciones_impresion) sigue visible tras cerrar sesión.");

        // Los 5 modales chicos flotantes.
        const ids_chicos = [
            "modal_chico_impresion_reserva",
            "modal_chico_impresion_pasajero",
            "modal_chico_impresion_rendicion",
            "modal_chico_impresion_liquidacion",
            "modal_chico_impresion_cancelacion"
        ];
        for (const id of ids_chicos) {
            const visible = await ctx.esta_visible("#" + id);
            ctx.assert(!visible,
                "El modal chico #" + id + " sigue visible tras cerrar sesión.");
        }
    }
};