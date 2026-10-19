/**
 * Helpers compartidos por las pruebas del detalle de
 * rendiciones y liquidaciones.
 *
 * Las pruebas de estas secciones ejecutan el flujo real
 * del usuario: login, ir a la pestaña, elegir un dueño
 * en el select, esperar a que la tabla cargue, hacer clic
 * en "Ver detalle" y verificar que el modal se abre con
 * contenido. No alcanza con un POST al backend: el bug
 * v81i (frontend no mandaba `nombre_dueno` en el POST)
 * solo se detecta con el flujo completo.
 *
 * @version 1.5plugin.8f
 * @since 1.5plugin.8f
 */

import { CODIGO_SOPORTE } from "../ConfiguracionApli.js";

/**
 * Login como soporte.
 *
 * @param {Object} ctx
 * @returns {Promise<void>}
 */
export async function login_soporte(ctx) {
    await ctx.asegurar_login(CODIGO_SOPORTE);
}

/**
 * Espera a que el select de dueño tenga más de una opción
 * (la opción 0 es "Seleccione dueño..."). Devuelve true
 * si tiene al menos un dueño real.
 *
 * @param {Object} ctx
 * @param {string} selector
 * @param {number} [timeout_ms=8000]
 * @returns {Promise<boolean>}
 */
export async function esperar_opciones_dueno(ctx, selector, timeout_ms = 8000) {
    const inicio = Date.now();
    while (Date.now() - inicio < timeout_ms) {
        const opciones = await ctx.leer_opciones(selector);
        if (opciones.length > 1) return true;
        await ctx.pausa(200);
    }
    return false;
}

/**
 * Espera a que la tabla tenga al menos un botón de
 * detalle, o a que el contenedor muestre el mensaje
 * "Sin ... registradas". Devuelve:
 *   { hay: true,  cantidad: N }   → hay datos.
 *   { hay: false, cantidad: 0 }   → no hay datos.
 *
 * @param {Object} ctx
 * @param {string} selector_boton
 * @param {string} selector_vacio
 * @param {number} [timeout_ms=20000]
 * @returns {Promise<{hay: boolean, cantidad: number}>}
 */
export async function esperar_detalle_o_vacio(ctx, selector_boton, selector_vacio, timeout_ms = 20000) {
    const inicio = Date.now();
    while (Date.now() - inicio < timeout_ms) {
        const cantidad = await ctx.contar(selector_boton);
        if (cantidad > 0) return { hay: true, cantidad };
        const texto = await ctx.texto(selector_vacio);
        if (texto && /sin .* registrad/i.test(texto)) {
            return { hay: false, cantidad: 0 };
        }
        await ctx.pausa(300);
    }
    return { hay: false, cantidad: 0 };
}

/**
 * Hace clic en el primer botón "Ver detalle" de la tabla,
 * espera a que se abra el modal genérico, y verifica que
 * el contenido no esté vacío y contenga una palabra
 * esperada ("Rendición" o "Liquidación").
 *
 * @param {Object} ctx
 * @param {string} selector_boton
 * @param {string} palabra_esperada
 * @returns {Promise<string>}
 */
export async function abrir_primer_detalle(ctx, selector_boton, palabra_esperada) {
    const btn = await ctx.esperar_visible(selector_boton, 5000);
    if (!btn || !btn.exito) {
        throw new Error("No apareció el botón " + selector_boton);
    }
    await ctx.clic(selector_boton);

    const modal = await ctx.esperar_visible("#modal_generico", 8000);
    if (!modal || !modal.exito) {
        throw new Error("No se abrió el modal del detalle (" + palabra_esperada + ")");
    }

    const inicio = Date.now();
    let contenido = null;
    while (Date.now() - inicio < 5000) {
        contenido = await ctx.texto("#modal_generico_contenido");
        if (contenido && contenido.trim().length > 0) break;
        await ctx.pausa(200);
    }
    if (!contenido || contenido.trim().length === 0) {
        throw new Error("El modal se abrió pero el contenido está vacío");
    }
    if (contenido.indexOf(palabra_esperada) === -1) {
        throw new Error(
            "El modal no contiene la palabra \"" + palabra_esperada + "\". "
            + "Primeros 200 chars: " + contenido.slice(0, 200)
        );
    }
    return contenido;
}