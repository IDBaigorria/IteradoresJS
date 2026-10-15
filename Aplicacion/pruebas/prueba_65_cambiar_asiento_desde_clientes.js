/**
 * Prueba: cambiar de asiento desde la pestaña Clientes.
 *
 * Cubre el flujo completo del botón "Cambiar de asiento"
 * dentro del detalle de un pasaje individual. Es la prueba
 * espejo de la 59 (que usa el croquis).
 *
 * Verifica especialmente el fix v1.5piloto.77d: el callback
 * `on_exito` re-abre el modal del detalle con el asiento
 * nuevo (antes quedaba con el viejo).
 *
 * @version 1.5plugin.7j
 */

import { CODIGO_TERMINAL1 } from "../ConfiguracionApli.js";
import {
    login_terminal,
    ir_a_tab,
    ir_a_viajes_y_abrir_primero,
    abrir_primer_micro_con_libres,
    seleccionar_n_asientos,
    abrir_modal_confirmacion,
    setear_metodo_y_cuotas,
    confirmar_venta,
    obtener_id_ultima_venta,
    cerrar_form_venta_y_liberar,
    cancelar_venta,
    cerrar_modales_si_abiertos,
    datos_comprador_aleatorio,
    datos_pasajero_aleatorio,
    llenar_comprador,
    llenar_pasajero
} from "./_helpers.js";

/**
 * Lee el número de asiento mostrado en el detalle del pasaje
 * dentro del modal genérico. Devuelve el string o null.
 *
 * El modal tiene un `<div class="detail-line">` con
 * `<span>Asiento:</span><strong>NN</strong>`. No hay ID, así
 * que se busca por texto.
 */
async function _leer_numero_asiento_modal(ctx) {
    const texto = await ctx.texto("#modal_generico_contenido");
    if (!texto) return null;
    const m = String(texto).match(/Asiento:\s*(\d+)/);
    return m ? m[1] : null;
}

export const prueba = {
    id: "cambiar_asiento_desde_clientes",
    nombre: "Clientes: cambiar de asiento desde el detalle del pasaje",
    descripcion: "Vende un asiento con un terminal. Va a la pestaña Clientes, busca el pasajero, abre su detalle de pasaje, aprieta Cambiar de asiento, elige un asiento nuevo y verifica que el modal se actualiza con el asiento nuevo (fix v1.5piloto.77d) y que el backend lo registra. Prueba espejo de la 59.",
    async ejecutar(ctx) {
        // 1. Vender como terminal.
        await login_terminal(ctx);
        await ir_a_viajes_y_abrir_primero(ctx);
        await abrir_primer_micro_con_libres(ctx);
        await seleccionar_n_asientos(ctx, 1);
        await abrir_modal_confirmacion(ctx);

        const comprador = datos_comprador_aleatorio();
        const pasajero = datos_pasajero_aleatorio(0);
        await llenar_comprador(ctx, comprador);
        await llenar_pasajero(ctx, 0, pasajero);

        await setear_metodo_y_cuotas(ctx, "efectivo", 1);
        await confirmar_venta(ctx);

        const id_venta = await obtener_id_ultima_venta(ctx);
        if (!id_venta) throw new Error("No se obtuvo id_venta");

        const dni_pasajero = pasajero.dni;

        // 2. Cerrar modales de venta.
        await cerrar_form_venta_y_liberar(ctx);

        let exito = false;
        try {
            // 3. Ir a la pestaña Clientes.
            await ir_a_tab(ctx, "pasajeros");

            // 4. Asegurar que la tabla de Clientes esté cargada.
            //    No filtramos por el input de búsqueda: el helper
            //    `ctx.escribir` asigna el value pero no dispara el
            //    evento `input`, así que el listener de
            //    `pasajeros.js` no corre y la tabla queda con
            //    TODOS los pasajeros. Por eso buscamos el botón
            //    directamente por su `data-dni` (que es único).
            const input = await ctx.esperar_visible("#buscar_pasajero", 8000);
            if (!input || !input.exito) {
                throw new Error("No aparece el buscador de pasajeros");
            }
            await ctx.escribir("#buscar_pasajero", dni_pasajero);

            // 5. Esperar el botón "Ver pasajes" del pasajero
            //    correcto, por su data-dni.
            const selector_ver = `.ver_pasajes_pasajero[data-dni="${dni_pasajero}"]`;
            const inicio_ver = Date.now();
            let boton_ver = null;
            while (Date.now() - inicio_ver < 15000) {
                const r = await ctx.esperar_visible(selector_ver, 500);
                if (r && r.exito) { boton_ver = true; break; }
                await ctx.pausa(300);
            }
            ctx.assert(boton_ver,
                "No aparece el botón Ver pasajes para el DNI " + dni_pasajero
                + ". ¿La venta no es activa, o el pasajero no se cargó?");

            await ctx.clic(selector_ver);

            // 6. Esperar la tarjeta del pasaje.
            const tarjeta = await ctx.esperar_visible(
                "#modal_generico_contenido .pasaje-card", 15000
            );
            ctx.assert(tarjeta && tarjeta.exito,
                "No aparece la tarjeta del pasaje en el modal del pasajero.");
            await ctx.clic("#modal_generico_contenido .pasaje-card");

            // 7. Esperar el botón Cambiar de asiento.
            const btn_cambiar = await ctx.esperar_visible(
                "#modal_generico_contenido .btn_cambiar_asiento_individual", 15000
            );
            ctx.assert(btn_cambiar && btn_cambiar.exito,
                "No aparece el botón Cambiar de asiento. "
                + "¿La venta no es de este terminal?");

            // 8. Leer el número viejo del asiento (del modal genérico).
            const numero_viejo = await _leer_numero_asiento_modal(ctx);
            ctx.assert(numero_viejo !== null,
                "No se pudo leer el número del asiento viejo del modal.");

            // 9. Abrir el modal apilado.
            await ctx.clic("#modal_generico_contenido .btn_cambiar_asiento_individual");

            // 10. Esperar asiento elegible en el modal apilado.
            const inicio_eleg = Date.now();
            let elegibles = [];
            while (Date.now() - inicio_eleg < 25000) {
                elegibles = await ctx.obtener_atributos(
                    "#modal_apilado_contenido .seat.seat-elegible",
                    "data-numero"
                );
                if (elegibles.length > 0) break;
                await ctx.pausa(300);
            }
            ctx.assert(elegibles.length > 0,
                "No hay asientos elegibles en el modal de cambio tras 25s.");
            const numero_nuevo = elegibles[0];

            // 11. Elegir el asiento.
            await ctx.clic(
                `#modal_apilado_contenido .seat.seat-elegible[data-numero="${numero_nuevo}"]`
            );

            // 12. Esperar a que quede marcado como elegido.
            const inicio_marca = Date.now();
            let marcado = false;
            while (Date.now() - inicio_marca < 5000) {
                const marcados = await ctx.obtener_atributos(
                    `#modal_apilado_contenido .seat.seat-elegido[data-numero="${numero_nuevo}"]`,
                    "data-numero"
                );
                if (marcados.length > 0) { marcado = true; break; }
                await ctx.pausa(150);
            }
            ctx.assert(marcado,
                "El asiento elegido no quedó marcado con .seat-elegido.");

            // 13. Confirmar el cambio.
            await ctx.clic("#modal_apilado_contenido #btn_confirmar_cambiar_asiento");

            // 14. Esperar a que se cierre el modal apilado.
            const inicio_oc = Date.now();
            let cerrado = false;
            while (Date.now() - inicio_oc < 15000) {
                const visible = await ctx.esta_visible("#modal_apilado");
                if (!visible) { cerrado = true; break; }
                await ctx.pausa(300);
            }
            ctx.assert(cerrado, "El modal apilado no se cerró tras confirmar.");

            // 15. Esperar a que el modal genérico muestre el asiento nuevo
            //     (fix v1.5piloto.77d: el on_exito re-abre el detalle
            //     con el asiento nuevo).
            const inicio_nuevo = Date.now();
            let numero_actual = null;
            while (Date.now() - inicio_nuevo < 15000) {
                numero_actual = await _leer_numero_asiento_modal(ctx);
                if (numero_actual === numero_nuevo) break;
                await ctx.pausa(300);
            }
            console.log("[test65] modal numero:", numero_actual, "esperado:", numero_nuevo);
            const texto_modal = await ctx.texto("#modal_generico_contenido");
            console.log("[test65] modal texto (primeros 300):",
                String(texto_modal || "").slice(0, 300));
            ctx.assert(numero_actual === numero_nuevo,
                "El modal genérico no muestra el asiento nuevo. "
                + "Esperado: " + numero_nuevo
                + ", obtenido: " + (numero_actual || "(vacío)")
                + ". ¿El fix v77d del on_exito no está funcionando?");

            // 16. Verificación secundaria por backend, con retry.
            //     El POST cambiar_asiento puede tardar en verse
            //     reflejado por otros fetches del page (on_exito,
            //     polling del croquis). Se reintenta con backoff.
            // Pausa inicial para dejar que el backend se estabilice.
            await ctx.pausa(2000);

            let asientos = [];
            let ultimo_json = null;
            const MAX_INTENTOS = 5;
            for (let intento = 0; intento < MAX_INTENTOS; intento++) {
                const r = await ctx.post_accion("ventas/obtener", { id_venta });
                if (r && r.json && r.json.exito) {
                    ultimo_json = r.json;
                    asientos = r.json.venta.asientos || [];
                    console.log("[test65] intento " + (intento + 1) + "/" + MAX_INTENTOS,
                        "asientos:", JSON.stringify(asientos.map(a => a.numero)),
                        "esperado:", numero_nuevo);
                    if (asientos.some(a => a.numero === numero_nuevo)) break;
                } else {
                    console.log("[test65] intento " + (intento + 1) + "/" + MAX_INTENTOS,
                        "error:", JSON.stringify(r && r.json ? r.json : r));
                }
                if (intento < MAX_INTENTOS - 1) {
                    await ctx.pausa(500);
                }
            }

            if (!asientos.some(a => a.numero === numero_nuevo)) {
                // Diagnóstico adicional: log del JSON completo del último intento.
                console.log("[test65] ULTIMO JSON:", JSON.stringify(ultimo_json, null, 2));
            }

            ctx.assert(asientos.some(a => a.numero === numero_nuevo),
                "El backend no registró el asiento nuevo " + numero_nuevo
                + " tras " + MAX_INTENTOS + " intentos. "
                + "Asientos: " + asientos.map(a => a.numero).join(","));

            exito = true;
        } finally {
            // 17. Limpieza.
            await cerrar_modales_si_abiertos(ctx);
            try {
                await cancelar_venta(ctx, id_venta, "Cancelada por prueba 65");
            } catch (e) {
                console.warn("No se pudo cancelar la venta:", e.message);
            }
            if (!exito) {
                console.warn("La prueba 65 falló antes de completar el flujo.");
            }
        }
    }
};