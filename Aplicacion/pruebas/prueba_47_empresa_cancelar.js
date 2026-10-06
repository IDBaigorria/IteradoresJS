/**
 * Prueba: cancelar el alta de empresa.
 *
 * Verifica que el botón Cancelar cierra el modal sin crear
 * nada, incluso con datos cargados en los campos.
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
    id: "empresa_cancelar",
    nombre: "Empresas: cancelar no crea nada",
    descripcion: "Verifica que el botón Cancelar cierra el modal sin crear la empresa.",
    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_ADMIN);
        await cerrar_modales_si_abiertos(ctx);

        await ir_a_micros_y_elegir_dueno(ctx);

        const cantidad_antes = (await ctx.leer_opciones("#selector_empresa_micros")).length;

        await abrir_modal_agregar_empresa(ctx);
        await ctx.escribir("#modal_nueva_empresa_nombre", "empcancela" + String(Date.now()).slice(-8));
        await ctx.clic("#modal_btn_cancelar_empresa");

        const cerrado = await ctx.esperar_oculto("#modal_generico", 3000);
        ctx.assert(cerrado && cerrado.exito,
            "El modal no se cerró al apretar Cancelar");

        const cantidad_despues = (await ctx.leer_opciones("#selector_empresa_micros")).length;
        ctx.assert(cantidad_despues === cantidad_antes,
            "Cancelar creó una empresa (antes " + cantidad_antes
            + ", después " + cantidad_despues + ")");
    }
};