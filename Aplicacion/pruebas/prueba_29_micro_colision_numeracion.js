/**
 * Prueba: colisión de numeración al quitar un micro del medio.
 *
 * Reproduce el bug C (fix v74k). Antes del fix, el nombre
 * del micro se calculaba con count+1, así que:
 *
 *   1. Agregar 3 micros → micro_1, micro_2, micro_3.
 *   2. Quitar el del medio (micro_2).
 *   3. Agregar uno nuevo → count=2, +1=3, intenta micro_3
 *      (que ya existe). _adyacente_en falla silenciosamente,
 *      el micro queda huérfano, el backend devuelve exito:true
 *      pero el micro no aparece en la lista.
 *
 * Con el fix (max+1), el nuevo micro se llama micro_4 y
 * aparece correctamente.
 *
 * Precondición: la empresa elegida debe tener al menos 3
 * vehículos configurados. Si no, la prueba falla con mensaje.
 *
 * @version 1.5plugin.4z
 */

import { CODIGO_DUENO } from "../ConfPlugin.js";
import {
    crear_viaje_de_prueba,
    abrir_detalle_viaje,
    abrir_formulario_agregar_micro,
    elegir_empresa_y_vehiculo,
    quitar_micro_por_indice,
    cerrar_modal_apilado_si_abierto
} from "./_micros_helpers.js";

export const prueba = {
    id: "micro_colision_numeracion",
    nombre: "Micro: colisión de numeración al quitar del medio",
    descripcion: "Agrega 3 micros (3 vehículos distintos), quita el del medio, agrega uno nuevo. Verifica que el nuevo aparezca (fix v74k: nombre con max+1 en vez de count+1).",

    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_DUENO);
        await ctx.activar_pestana_piloto("viajes");
        await ctx.esperar("#boton_agregar_viaje", 5000);

        // Necesitamos al menos 3 vehículos distintos para agregar
        // 3 micros sin duplicar. Verificamos antes.
        let vehiculos_disponibles = [];
        // Abrimos el formulario una vez para inspeccionar los
        // vehículos de la primera empresa.
        const { nombre_viaje } = await crear_viaje_de_prueba(ctx, "viajecol");
        await abrir_detalle_viaje(ctx, nombre_viaje);
        await abrir_formulario_agregar_micro(ctx);
        await elegir_empresa_y_vehiculo(ctx, 1, 1);
        vehiculos_disponibles = await ctx.leer_opciones_con_disabled("#selector_vehiculo_micro_viaje");
        // Volvemos a cerrar el formulario (ya elegimos para
        // inspeccionar).
        await ctx.clic("#boton_cancelar_micro");
        await ctx.pausa(300);

        const vehiculos_ok = vehiculos_disponibles.filter(o => !o.disabled && o.valor !== "");
        ctx.assert(
            vehiculos_ok.length >= 3,
            "La primera empresa necesita al menos 3 vehículos con asientos configurados para esta prueba. Encontrados: " + vehiculos_ok.length + ". Cargá más vehículos o ajustá la prueba."
        );

        try {
            // Sobrescribir confirm() (el quitar micro usa confirm
            // nativo).
            await ctx.sobrescribir_alertas();

            // Agregar 3 micros con vehículos 1, 2, 3.
            for (let i = 1; i <= 3; i++) {
                await abrir_formulario_agregar_micro(ctx);
                await elegir_empresa_y_vehiculo(ctx, 1, i);
                await ctx.escribir("#monto_micro_viaje", "500");
                await ctx.clic("#boton_confirmar_micro");

                let items = 0;
                const inicio = Date.now();
                while (Date.now() - inicio < 10000) {
                    items = await ctx.contar("#lista_micros_viaje .micro-item");
                    if (items >= i) break;
                    await ctx.pausa(300);
                }
                ctx.assert(items === i, "Se esperaban " + i + " micros tras el alta " + i + ", hay " + items);
            }

            // Quitar el del medio (índice 1).
            await quitar_micro_por_indice(ctx, 1);
            await ctx.pausa(500);

            let items_tras_quitar = 0;
            const inicio_q = Date.now();
            while (Date.now() - inicio_q < 8000) {
                items_tras_quitar = await ctx.contar("#lista_micros_viaje .micro-item");
                if (items_tras_quitar === 2) break;
                await ctx.pausa(300);
            }
            ctx.assert(items_tras_quitar === 2, "Se esperaban 2 micros tras quitar el del medio, hay " + items_tras_quitar);

            // Agregar uno nuevo (vehículo del medio, libre ahora).
            await abrir_formulario_agregar_micro(ctx);
            await elegir_empresa_y_vehiculo(ctx, 1, 2);
            await ctx.escribir("#monto_micro_viaje", "600");
            await ctx.clic("#boton_confirmar_micro");

            let items_finales = 0;
            const inicio_f = Date.now();
            while (Date.now() - inicio_f < 12000) {
                items_finales = await ctx.contar("#lista_micros_viaje .micro-item");
                if (items_finales === 3) break;
                await ctx.pausa(300);
            }

            ctx.assert(
                items_finales === 3,
                "El nuevo micro no apareció (hay " + items_finales + ", se esperaban 3). Si el backend permite duplicados, revisá que el fix v74k (max+1) esté aplicado. Si el bug de colisión sigue activo, el micro se creó huérfano y el backend devolvió exito:true."
            );
        } finally {
            await ctx.restaurar_alertas();
            await cerrar_modal_apilado_si_abierto(ctx);
        }
    }
};