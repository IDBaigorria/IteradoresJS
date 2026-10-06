/**
 * Prueba: alta de empresa con modal genérico.
 *
 * Verifica el flujo feliz de v1.5piloto.76c. Abre el modal
 * desde #boton_agregar_empresa_micros, llena los campos,
 * guarda, y verifica que la empresa aparece en el selector.
 *
 * Nota: el frontend cierra el modal ANTES de recargar el
 * selector de empresas. Por eso, después de guardar, hay
 * que hacer polling hasta que la nueva opción aparezca.
 *
 * @version 1.5plugin.5t
 */

import { CODIGO_ADMIN } from "../ConfiguracionApli.js";
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

        const sufijo = String(Date.now()).slice(-8);
        const nombre_empresa = "empauto" + sufijo;

        await abrir_modal_agregar_empresa(ctx);
        await ctx.escribir("#modal_nueva_empresa_nombre", nombre_empresa);
        await ctx.escribir("#modal_nueva_empresa_nombre_real", "Empresa automática");
        await ctx.clic("#modal_btn_guardar_empresa");

        const cerrado = await ctx.esperar_oculto("#modal_generico", 8000);
        ctx.assert(cerrado && cerrado.exito,
            "El modal no se cerró tras guardar la empresa");

        // El frontend cierra el modal y DESPUÉS recarga el
        // selector. Polling hasta que la empresa aparezca.
        let encontrado = false;
        let opciones_vistas = 0;
        const inicio = Date.now();
        while (Date.now() - inicio < 8000) {
            const opciones = await ctx.leer_opciones("#selector_empresa_micros");
            opciones_vistas = opciones.length;
            if (opciones.some(o => o.valor === nombre_empresa)) {
                encontrado = true;
                break;
            }
            await ctx.pausa(300);
        }
        ctx.assert(encontrado,
            "La empresa " + nombre_empresa + " no apareció en el selector."
            + " Opciones vistas: " + opciones_vistas);

        await eliminar_empresa_por_post(ctx, nombre_dueno, nombre_empresa);
    }
};