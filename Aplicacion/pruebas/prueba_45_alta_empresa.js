/**
 * Prueba: alta de empresa con modal genérico.
 *
 * Verifica el flujo feliz de v1.5piloto.76c. Abre el modal
 * desde #boton_agregar_empresa_micros, llena los campos,
 * guarda, y verifica que la empresa aparece en el selector.
 *
 * @version 1.5plugin.5r
 */

import { CODIGO_ADMIN } from "../ConfPlugin.js";
import { cerrar_modales_si_abiertos } from "./_helpers.js";
import {
    ir_a_micros_y_elegir_dueno,
    abrir_modal_agregar_empresa,
    eliminar_empresa_por_post
} from "./_empresas_helpers.js";

export const prueba = {
    id: "alta_empresa",
    nombre: "Empresas: alta con modal",
    descripcion: "Verifica que el alta de empresa funciona desde el modal genérico.",
    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_ADMIN);
        await cerrar_modales_si_abiertos(ctx);

        const { nombre_dueno } = await ir_a_micros_y_elegir_dueno(ctx);

        const opciones_antes = await ctx.leer_opciones("#selector_empresa_micros");
        const cantidad_antes = opciones_antes.length;

        const sufijo = String(Date.now()).slice(-8);
        const nombre_empresa = "empauto" + sufijo;

        await abrir_modal_agregar_empresa(ctx);
        await ctx.escribir("#modal_nueva_empresa_nombre", nombre_empresa);
        await ctx.escribir("#modal_nueva_empresa_nombre_real", "Empresa automática");
        await ctx.clic("#modal_btn_guardar_empresa");

        const cerrado = await ctx.esperar_oculto("#modal_generico", 8000);
        ctx.assert(cerrado && cerrado.exito,
            "El modal no se cerró tras guardar la empresa");

        const opciones_despues = await ctx.leer_opciones("#selector_empresa_micros");
        ctx.assert(opciones_despues.length === cantidad_antes + 1,
            "Cantidad de empresas no cambió correctamente: antes "
            + cantidad_antes + ", después " + opciones_despues.length);

        const encontrado = opciones_despues.some(o => o.valor === nombre_empresa);
        ctx.assert(encontrado,
            "La empresa " + nombre_empresa + " no aparece en el selector");

        await eliminar_empresa_por_post(ctx, nombre_dueno, nombre_empresa);
    }
};