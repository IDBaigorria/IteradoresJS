/**
 * Prueba: alta de vehículo con modal genérico.
 *
 * Verifica el flujo feliz de v1.5piloto.76c. Crea una
 * empresa de setup, la selecciona, abre el modal de alta de
 * vehículo, lo llena, y verifica que aparece en el selector.
 *
 * Nota: el frontend cierra el modal ANTES de recargar el
 * selector de vehículos. Por eso hay polling.
 *
 * @version 1.5plugin.5r-fix
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
    id: "alta_vehiculo",
    nombre: "Vehículos: alta con modal",
    descripcion: "Verifica que el alta de vehículo funciona desde el modal genérico.",
    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_ADMIN);
        await cerrar_modales_si_abiertos(ctx);

        const { nombre_dueno } = await ir_a_micros_y_elegir_dueno(ctx);

        const sufijo = String(Date.now()).slice(-8);
        const nombre_empresa = "empveh" + sufijo;
        await crear_empresa_de_prueba(ctx, nombre_empresa);
        await seleccionar_empresa_por_valor(ctx, nombre_empresa);

        const nombre_vehiculo = "patauto" + sufijo;
        await abrir_modal_agregar_vehiculo(ctx);
        await ctx.escribir("#modal_nuevo_vehiculo_nombre", nombre_vehiculo);
        await ctx.escribir("#modal_nuevo_vehiculo_nombre_real", "Vehículo automático");
        await ctx.clic("#modal_btn_guardar_vehiculo");

        const cerrado = await ctx.esperar_oculto("#modal_generico", 8000);
        ctx.assert(cerrado && cerrado.exito,
            "El modal no se cerró tras guardar el vehículo");

        // El frontend cierra el modal y DESPUÉS recarga el
        // selector. Polling hasta que el vehículo aparezca.
        let encontrado = false;
        let opciones_vistas = 0;
        const inicio = Date.now();
        while (Date.now() - inicio < 8000) {
            const opciones = await ctx.leer_opciones("#selector_vehiculo_micros");
            opciones_vistas = opciones.length;
            if (opciones.some(o => o.valor === nombre_vehiculo)) {
                encontrado = true;
                break;
            }
            await ctx.pausa(300);
        }
        ctx.assert(encontrado,
            "El vehículo " + nombre_vehiculo + " no apareció en el selector."
            + " Opciones vistas: " + opciones_vistas);

        // Limpieza: eliminar la empresa arrastra el vehículo.
        await eliminar_empresa_por_post(ctx, nombre_dueno, nombre_empresa);
    }
};