/**
 * Prueba: empresa y vehículo elegidos, monto vacío. El
 * frontend debe rechazarlo.
 *
 * @version 1.5plugin.4y
 */

import { CODIGO_DUENO } from "../ConfiguracionApli.js";
import {
    crear_viaje_de_prueba,
    abrir_detalle_viaje,
    abrir_formulario_agregar_micro,
    elegir_empresa_y_vehiculo,
    cerrar_modal_apilado_si_abierto,
    leer_aviso_actual
} from "./_micros_helpers.js";

export const prueba = {
    id: "micro_monto_vacio",
    nombre: "Micro: empresa + vehículo, monto vacío",
    descripcion: "Con empresa y vehículo elegidos, dejar el monto vacío y Confirmar. Debe rechazar con aviso.",

    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_DUENO);
        await ctx.activar_pestana_piloto("viajes");
        await ctx.esperar("#boton_agregar_viaje", 5000);

        try {
            const { nombre_viaje } = await crear_viaje_de_prueba(ctx, "viajeval");
            await abrir_detalle_viaje(ctx, nombre_viaje);
            await abrir_formulario_agregar_micro(ctx);
            await elegir_empresa_y_vehiculo(ctx, 1, 1);

            // No escribir monto. Confirmar.
            const micros_antes = await ctx.contar("#lista_micros_viaje .micro-item");
            await ctx.clic("#boton_confirmar_micro");
            await ctx.pausa(800);

            const modal_abierto = await ctx.esta_visible("#selector_empresa_micro_viaje");
            ctx.assert(modal_abierto, "El modal se cerró pese a que el monto estaba vacío");

            const aviso = await leer_aviso_actual(ctx);
            ctx.assert(
                aviso.toLowerCase().includes("monto"),
                "El toast no menciona el monto. Aviso actual: '" + aviso + "'"
            );

            const micros_despues = await ctx.contar("#lista_micros_viaje .micro-item");
            ctx.assert(micros_despues === micros_antes, "La cantidad de micros cambió: antes=" + micros_antes + " despues=" + micros_despues);
        } finally {
            await cerrar_modal_apilado_si_abierto(ctx);
        }
    }
};