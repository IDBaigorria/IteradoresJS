/**
 * Prueba: cancelar el alta de vehículo.
 *
 * Verifica que el botón Cancelar del modal de vehículo no
 * crea nada.
 *
 * @version 1.5plugin.5r
 */

import { CODIGO_ADMIN } from "../ConfPlugin.js";
import { cerrar_modales_si_abiertos } from "./_helpers.js";
import {
    ir_a_micros_y_elegir_dueno,
    crear_empresa_de_prueba,
    seleccionar_empresa_por_valor,
    abrir_modal_agregar_vehiculo,
    eliminar_empresa_por_post
} from "./_empresas_helpers.js";

export const prueba = {
    id: "vehiculo_cancelar",
    nombre: "Vehículos: cancelar no crea nada",
    descripcion: "Verifica que el botón Cancelar del modal de vehículo no crea nada.",
    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_ADMIN);
        await cerrar_modales_si_abiertos(ctx);

        const { nombre_dueno } = await ir_a_micros_y_elegir_dueno(ctx);

        const sufijo = String(Date.now()).slice(-8);
        const nombre_empresa = "empvehcan" + sufijo;
        await crear_empresa_de_prueba(ctx, nombre_empresa);
        await seleccionar_empresa_por_valor(ctx, nombre_empresa);

        const cantidad_antes = (await ctx.leer_opciones("#selector_vehiculo_micros")).length;

        await abrir_modal_agregar_vehiculo(ctx);
        await ctx.escribir("#modal_nuevo_vehiculo_nombre", "patcancela" + sufijo);
        await ctx.clic("#modal_btn_cancelar_vehiculo");

        const cerrado = await ctx.esperar_oculto("#modal_generico", 3000);
        ctx.assert(cerrado && cerrado.exito,
            "El modal no se cerró al apretar Cancelar");

        const cantidad_despues = (await ctx.leer_opciones("#selector_vehiculo_micros")).length;
        ctx.assert(cantidad_despues === cantidad_antes,
            "Cancelar creó un vehículo (antes " + cantidad_antes
            + ", después " + cantidad_despues + ")");

        await eliminar_empresa_por_post(ctx, nombre_dueno, nombre_empresa);
    }
};