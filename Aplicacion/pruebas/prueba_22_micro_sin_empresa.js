/**
 * Prueba: confirmar el alta de micro sin elegir empresa ni
 * vehículo. El frontend debe rechazarlo con un toast y no
 * agregar nada al viaje.
 *
 * @version 1.5plugin.4y
 */

import { CODIGO_DUENO } from "../ConfiguracionApli.js";
import {
    crear_viaje_de_prueba,
    abrir_detalle_viaje,
    abrir_formulario_agregar_micro,
    cerrar_modal_apilado_si_abierto,
    leer_aviso_actual
} from "./_micros_helpers.js";

export const prueba = {
    id: "micro_sin_empresa",
    nombre: "Micro: confirmar sin empresa ni vehículo",
    descripcion: "Con el formulario de agregar micro abierto y sin seleccionar nada, apretar Confirmar. Debe rechazar con aviso y no agregar nada.",

    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_DUENO);
        await ctx.activar_pestana_piloto("viajes");
        await ctx.esperar("#boton_agregar_viaje", 5000);

        try {
            const { nombre_viaje } = await crear_viaje_de_prueba(ctx, "viajeval");
            await abrir_detalle_viaje(ctx, nombre_viaje);
            await abrir_formulario_agregar_micro(ctx);

            // No elegir nada. Confirmar directo.
            const micros_antes = await ctx.contar("#lista_micros_viaje .micro-item");
            await ctx.clic("#boton_confirmar_micro");
            await ctx.pausa(800);

            // El modal apilado debe seguir abierto.
            const modal_abierto = await ctx.esta_visible("#selector_empresa_micro_viaje");
            ctx.assert(modal_abierto, "El modal de agregar micro se cerró pese a que no se eligió nada");

            // El toast debe tener el aviso.
            const aviso = await leer_aviso_actual(ctx);
            ctx.assert(
                aviso.toLowerCase().includes("empresa") || aviso.toLowerCase().includes("veh"),
                "El toast no menciona empresa/vehículo. Aviso actual: '" + aviso + "'"
            );

            // No debe haberse agregado ningún micro.
            const micros_despues = await ctx.contar("#lista_micros_viaje .micro-item");
            ctx.assert(micros_despues === micros_antes, "La cantidad de micros cambió: antes=" + micros_antes + " despues=" + micros_despues);
        } finally {
            await cerrar_modal_apilado_si_abierto(ctx);
        }
    }
};