/**
 * Prueba: agregar dos veces el mismo vehículo al mismo viaje.
 *
 * DOCUMENTA EL COMPORTAMIENTO ACTUAL del backend:
 * `agregar_micro_a_viaje` no rechaza vehículos duplicados en
 * el mismo viaje; crea `micro_1` y `micro_2` con copias del
 * mismo vehículo. Si en el futuro el backend cambia y los
 * rechaza, esta prueba va a fallar y habrá que decidir qué
 * hacer (actualizarla o agregar la validación).
 *
 * @version 1.5plugin.4y
 */

import { CODIGO_DUENO } from "../ConfPlugin.js";
import {
    crear_viaje_de_prueba,
    abrir_detalle_viaje,
    abrir_formulario_agregar_micro,
    elegir_empresa_y_vehiculo,
    cerrar_modal_apilado_si_abierto
} from "./_micros_helpers.js";

export const prueba = {
    id: "micro_mismo_vehiculo_dos_veces",
    nombre: "Micro: mismo vehículo dos veces (documenta backend)",
    descripcion: "Agrega el mismo vehículo dos veces al mismo viaje. El backend actual lo permite: se crean micro_1 y micro_2. La prueba verifica ese comportamiento. Si el backend cambia a rechazar duplicados, esta prueba falla.",

    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_DUENO);
        await ctx.activar_pestana_piloto("viajes");
        await ctx.esperar("#boton_agregar_viaje", 5000);

        try {
            const { nombre_viaje } = await crear_viaje_de_prueba(ctx, "viajedup");
            await abrir_detalle_viaje(ctx, nombre_viaje);

            // Primer alta.
            await abrir_formulario_agregar_micro(ctx);
            const info1 = await elegir_empresa_y_vehiculo(ctx, 1, 1);
            await ctx.escribir("#monto_micro_viaje", "700");
            await ctx.clic("#boton_confirmar_micro");

            // Esperar a que se agregue (1 .micro-item).
            let items1 = 0;
            const inicio1 = Date.now();
            while (Date.now() - inicio1 < 10000) {
                items1 = await ctx.contar("#lista_micros_viaje .micro-item");
                if (items1 >= 1) break;
                await ctx.pausa(300);
            }
            ctx.assert(items1 === 1, "Se esperaba 1 micro tras el primer alta, hay " + items1);

            // Segundo alta: mismo vehículo.
            await abrir_formulario_agregar_micro(ctx);
            await elegir_empresa_y_vehiculo(ctx, 1, 1);
            await ctx.escribir("#monto_micro_viaje", "700");
            await ctx.clic("#boton_confirmar_micro");

            // Esperar a que se agregue el segundo (2 .micro-item).
            let items2 = 0;
            const inicio2 = Date.now();
            while (Date.now() - inicio2 < 10000) {
                items2 = await ctx.contar("#lista_micros_viaje .micro-item");
                if (items2 >= 2) break;
                await ctx.pausa(300);
            }

            ctx.assert(
                items2 === 2,
                "El backend no permitió el segundo alta con el mismo vehículo (patente " + info1.patente + "). Si esto es intencional, actualizar esta prueba. Micros actuales: " + items2
            );
        } finally {
            await cerrar_modal_apilado_si_abierto(ctx);
        }
    }
};