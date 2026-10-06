/**
 * Prueba: agregar dos veces el mismo vehículo al mismo viaje.
 *
 * Verifica el fix v74k del piloto: `agregar_micro_a_viaje`
 * rechaza el duplicado y devuelve un error claro. Antes del
 * fix, el backend permitía duplicados silenciosamente (creaba
 * micro_1 y micro_2 con la misma patente).
 *
 * @version 1.5plugin.4z
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
    id: "micro_mismo_vehiculo_dos_veces",
    nombre: "Micro: mismo vehículo dos veces (rechazo)",
    descripcion: "Agrega el mismo vehículo dos veces al mismo viaje. El backend (v74k+) debe rechazar el segundo intento con un toast de error. La cantidad de micros debe quedar en 1.",

    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_DUENO);
        await ctx.activar_pestana_piloto("viajes");
        await ctx.esperar("#boton_agregar_viaje", 5000);

        try {
            const { nombre_viaje } = await crear_viaje_de_prueba(ctx, "viajedup");
            await abrir_detalle_viaje(ctx, nombre_viaje);

            // Primer alta: debe pasar.
            await abrir_formulario_agregar_micro(ctx);
            const info = await elegir_empresa_y_vehiculo(ctx, 1, 1);
            await ctx.escribir("#monto_micro_viaje", "700");
            await ctx.clic("#boton_confirmar_micro");

            let items1 = 0;
            const inicio1 = Date.now();
            while (Date.now() - inicio1 < 10000) {
                items1 = await ctx.contar("#lista_micros_viaje .micro-item");
                if (items1 >= 1) break;
                await ctx.pausa(300);
            }
            ctx.assert(items1 === 1, "Se esperaba 1 micro tras el primer alta, hay " + items1);

            // Segundo alta: mismo vehículo. Debe rechazarse.
            await abrir_formulario_agregar_micro(ctx);
            await elegir_empresa_y_vehiculo(ctx, 1, 1);
            await ctx.escribir("#monto_micro_viaje", "800");
            await ctx.clic("#boton_confirmar_micro");
            await ctx.pausa(1000);

            // La cantidad debe seguir en 1.
            const items2 = await ctx.contar("#lista_micros_viaje .micro-item");
            ctx.assert(
                items2 === 1,
                "El backend permitió el segundo alta con el mismo vehículo (patente " + info.patente + "). Cantidad actual: " + items2 + ". Revisá que el fix v74k esté aplicado."
            );

            // El toast debe mencionar el rechazo.
            const aviso = await leer_aviso_actual(ctx);
            ctx.assert(
                aviso.toLowerCase().includes("ya") || aviso.toLowerCase().includes("agregado"),
                "El toast no menciona el rechazo del duplicado. Aviso actual: '" + aviso + "'"
            );

            // El modal debe seguir abierto (el backend devolvió error).
            const modal_abierto = await ctx.esta_visible("#selector_empresa_micro_viaje");
            ctx.assert(modal_abierto, "El modal se cerró pese al rechazo del backend");
        } finally {
            await cerrar_modal_apilado_si_abierto(ctx);
        }
    }
};