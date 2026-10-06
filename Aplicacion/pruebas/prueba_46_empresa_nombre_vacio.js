/**
 * Prueba: alta de empresa con nombre vacío.
 *
 * Verifica que la validación local del frontend impide
 * guardar sin nombre: modal no se cierra, no se crea nada,
 * y sale un toast de error.
 *
 * @version 1.5plugin.5r
 */

import { CODIGO_ADMIN } from "../ConfiguracionApli.js";
import { cerrar_modales_si_abiertos } from "./_helpers.js";
import {
    ir_a_micros_y_elegir_dueno,
    abrir_modal_agregar_empresa
} from "./_empresas_helpers.js";

export const prueba = {
    id: "empresa_nombre_vacio",
    nombre: "Empresas: nombre vacío rechazado",
    descripcion: "Verifica que el alta de empresa con nombre vacío no se envía y muestra error.",
    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_ADMIN);
        await cerrar_modales_si_abiertos(ctx);

        await ir_a_micros_y_elegir_dueno(ctx);

        const cantidad_antes = (await ctx.leer_opciones("#selector_empresa_micros")).length;

        await abrir_modal_agregar_empresa(ctx);
        // No escribimos nada en el nombre.
        await ctx.clic("#modal_btn_guardar_empresa");
        await ctx.pausa(500);

        const modal_abierto = await ctx.esta_visible("#modal_generico");
        ctx.assert(modal_abierto,
            "El modal se cerró a pesar del nombre vacío");

        const cantidad_despues = (await ctx.leer_opciones("#selector_empresa_micros")).length;
        ctx.assert(cantidad_despues === cantidad_antes,
            "Se creó una empresa a pesar del nombre vacío (antes "
            + cantidad_antes + ", después " + cantidad_despues + ")");

        const aviso = await ctx.leer_aviso();
        ctx.assert(aviso && aviso.toLowerCase().indexOf("obligatorio") !== -1,
            "El aviso no menciona que el nombre es obligatorio. Aviso: " + JSON.stringify(aviso));

        await cerrar_modales_si_abiertos(ctx);
    }
};