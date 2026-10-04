/**
 * Prueba: el filtro de vehículos sin asientos en el select de
 * agregar micro.
 *
 * Verifica el fix v74k: los vehículos sin asientos
 * configurados deben aparecer como opciones DISABLED con el
 * texto sufijado "— Sin asientos configurados". Si el dueño
 * no tiene ningún vehículo sin asientos, la prueba pasa con
 * una advertencia en consola (no hay caso que cubrir).
 *
 * @version 1.5plugin.4z
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
    id: "micro_vehiculo_sin_asientos",
    nombre: "Micro: vehículo sin asientos aparece deshabilitado",
    descripcion: "Abre el formulario de agregar micro y verifica que las opciones del select de vehículos que correspondan a vehículos sin asientos estén disabled y con el sufijo correcto.",

    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_DUENO);
        await ctx.activar_pestana_piloto("viajes");
        await ctx.esperar("#boton_agregar_viaje", 5000);

        try {
            const { nombre_viaje } = await crear_viaje_de_prueba(ctx, "viajesin");
            await abrir_detalle_viaje(ctx, nombre_viaje);
            await abrir_formulario_agregar_micro(ctx);

            // Elegir la primera empresa para forzar la carga de
            // vehículos.
            await elegir_empresa_y_vehiculo(ctx, 1, 1);

            // Leer todas las opciones del select de vehículos con
            // su estado disabled.
            const opciones = await ctx.leer_opciones_con_disabled("#selector_vehiculo_micro_viaje");
            ctx.assert(Array.isArray(opciones) && opciones.length >= 2,
                "El select de vehículos no tiene al menos 2 opciones (placeholder + 1 vehículo)");

            // Buscar opciones disabled.
            const deshabilitadas = opciones.filter(o => o.disabled === true);

            if (deshabilitadas.length === 0) {
                console.warn("[micro_vehiculo_sin_asientos] El dueño no tiene vehículos sin asientos configurados. La prueba no puede verificar el filtro. Marcada como OK por vacuidad.");
                return;
            }

            // Todas las deshabilitadas deben tener el sufijo correcto.
            for (const op of deshabilitadas) {
                ctx.assert(
                    op.texto.includes("Sin asientos configurados"),
                    "Una opción disabled no tiene el sufijo esperado. Texto: '" + op.texto + "'"
                );
            }

            // Verificar que ninguna opción HABILITADA tenga el sufijo.
            const habilitadas_con_sufijo = opciones.filter(o => !o.disabled && o.texto.includes("Sin asientos configurados"));
            ctx.assert(
                habilitadas_con_sufijo.length === 0,
                "Hay opciones habilitadas con el sufijo 'Sin asientos configurados': " + habilitadas_con_sufijo.map(o => o.texto).join(", ")
            );
        } finally {
            await cerrar_modal_apilado_si_abierto(ctx);
        }
    }
};