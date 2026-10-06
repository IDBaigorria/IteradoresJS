/**
 * Prueba: con empresa, vehículo y monto cargados, apretar
 * Cancelar. El modal debe cerrarse sin agregar nada al viaje.
 *
 * @version 1.5plugin.4y
 */

import { CODIGO_DUENO } from "../ConfiguracionApli.js";
import {
    crear_viaje_de_prueba,
    abrir_detalle_viaje,
    abrir_formulario_agregar_micro,
    elegir_empresa_y_vehiculo,
    cerrar_modal_apilado_si_abierto
} from "./_micros_helpers.js";

export const prueba = {
    id: "micro_cancelar",
    nombre: "Micro: cancelar el formulario",
    descripcion: "Con todos los datos cargados, apretar Cancelar. El modal debe cerrarse sin agregar nada.",

    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_DUENO);
        await ctx.activar_pestana_piloto("viajes");
        await ctx.esperar("#boton_agregar_viaje", 5000);

        try {
            const { nombre_viaje } = await crear_viaje_de_prueba(ctx, "viajeval");
            await abrir_detalle_viaje(ctx, nombre_viaje);
            await abrir_formulario_agregar_micro(ctx);
            await elegir_empresa_y_vehiculo(ctx, 1, 1);
            await ctx.escribir("#monto_micro_viaje", "500");

            const micros_antes = await ctx.contar("#lista_micros_viaje .micro-item");

            // Cancelar.
            await ctx.clic("#boton_cancelar_micro");
            await ctx.pausa(500);

            // El modal debe haberse cerrado.
            const modal_abierto = await ctx.esta_visible("#selector_empresa_micro_viaje");
            ctx.assert(!modal_abierto, "El modal de agregar micro sigue abierto después de Cancelar");

            // Nada se agregó.
            const micros_despues = await ctx.contar("#lista_micros_viaje .micro-item");
            ctx.assert(micros_despues === micros_antes, "La cantidad de micros cambió: antes=" + micros_antes + " despues=" + micros_despues);
        } finally {
            await cerrar_modal_apilado_si_abierto(ctx);
        }
    }
};