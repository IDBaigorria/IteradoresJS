/**
 * Prueba: elegir empresa pero no vehículo, confirmar. El
 * frontend debe rechazarlo igual que sin empresa.
 *
 * @version 1.5plugin.4y
 */

import { CODIGO_DUENO } from "../ConfPlugin.js";
import {
    crear_viaje_de_prueba,
    abrir_detalle_viaje,
    abrir_formulario_agregar_micro,
    cerrar_modal_apilado_si_abierto,
    leer_aviso_actual
} from "./_micros_helpers.js";

export const prueba = {
    id: "micro_sin_vehiculo",
    nombre: "Micro: elegir empresa pero no vehículo",
    descripcion: "Elegir empresa, dejar el vehículo en blanco, apretar Confirmar. Debe rechazar con aviso y no agregar nada.",

    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_DUENO);
        await ctx.activar_pestana_piloto("viajes");
        await ctx.esperar("#boton_agregar_viaje", 5000);

        try {
            const { nombre_viaje } = await crear_viaje_de_prueba(ctx, "viajeval");
            await abrir_detalle_viaje(ctx, nombre_viaje);
            await abrir_formulario_agregar_micro(ctx);

            // Elegir empresa (dispara la carga de vehículos) pero no
            // seleccionar vehículo: dejamos selectedIndex = 0
            // (placeholder).
            const sel_emp = await ctx.seleccionar_indice("#selector_empresa_micro_viaje", 1);
            ctx.assert(sel_emp && sel_emp.exito, "No se pudo seleccionar empresa");

            // Esperar a que se llenen los vehículos (para que el
            // test sea realista).
            let vehiculos = [];
            const inicio = Date.now();
            while (Date.now() - inicio < 8000) {
                vehiculos = await ctx.leer_opciones("#selector_vehiculo_micro_viaje");
                if (Array.isArray(vehiculos) && vehiculos.length >= 2) break;
                await ctx.pausa(300);
            }
            ctx.assert(Array.isArray(vehiculos) && vehiculos.length >= 2, "No se llenó el select de vehículos");

            // Dejar el vehículo en el placeholder (índice 0).
            await ctx.seleccionar_indice("#selector_vehiculo_micro_viaje", 0);

            const micros_antes = await ctx.contar("#lista_micros_viaje .micro-item");
            await ctx.clic("#boton_confirmar_micro");
            await ctx.pausa(800);

            const modal_abierto = await ctx.esta_visible("#selector_empresa_micro_viaje");
            ctx.assert(modal_abierto, "El modal se cerró pese a que no se eligió vehículo");

            const aviso = await leer_aviso_actual(ctx);
            ctx.assert(
                aviso.toLowerCase().includes("empresa") || aviso.toLowerCase().includes("veh"),
                "El toast no menciona empresa/vehículo. Aviso actual: '" + aviso + "'"
            );

            const micros_despues = await ctx.contar("#lista_micros_viaje .micro-item");
            ctx.assert(micros_despues === micros_antes, "La cantidad de micros cambió: antes=" + micros_antes + " despues=" + micros_despues);
        } finally {
            await cerrar_modal_apilado_si_abierto(ctx);
        }
    }
};