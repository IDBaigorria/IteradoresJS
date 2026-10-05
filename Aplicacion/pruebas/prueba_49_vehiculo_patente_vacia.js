/**
 * Prueba: alta de vehículo con patente vacía.
 *
 * Verifica que la validación local del frontend impide
 * guardar sin patente: modal no se cierra, no se crea nada,
 * y sale un toast de error.
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
    id: "vehiculo_patente_vacia",
    nombre: "Vehículos: patente vacía rechazada",
    descripcion: "Verifica que el alta de vehículo con patente vacía no se envía y muestra error.",
    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_ADMIN);
        await cerrar_modales_si_abiertos(ctx);

        const { nombre_dueno } = await ir_a_micros_y_elegir_dueno(ctx);

        const sufijo = String(Date.now()).slice(-8);
        const nombre_empresa = "empvehva" + sufijo;
        await crear_empresa_de_prueba(ctx, nombre_empresa);
        await seleccionar_empresa_por_valor(ctx, nombre_empresa);

        const cantidad_antes = (await ctx.leer_opciones("#selector_vehiculo_micros")).length;

        await abrir_modal_agregar_vehiculo(ctx);
        await ctx.clic("#modal_btn_guardar_vehiculo");
        await ctx.pausa(500);

        const modal_abierto = await ctx.esta_visible("#modal_generico");
        ctx.assert(modal_abierto,
            "El modal se cerró a pesar de la patente vacía");

        const cantidad_despues = (await ctx.leer_opciones("#selector_vehiculo_micros")).length;
        ctx.assert(cantidad_despues === cantidad_antes,
            "Se creó un vehículo a pesar de la patente vacía");

        const aviso = await ctx.leer_aviso();
        ctx.assert(aviso && aviso.toLowerCase().indexOf("patente") !== -1,
            "El aviso no menciona la patente. Aviso: " + JSON.stringify(aviso));

        await cerrar_modales_si_abiertos(ctx);

        await eliminar_empresa_por_post(ctx, nombre_dueno, nombre_empresa);
    }
};