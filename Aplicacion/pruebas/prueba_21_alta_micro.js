/**
 * Prueba: agregar un micro a un viaje (dueño).
 *
 * Autocontenida: crea un viaje nuevo, le agrega un micro y
 * verifica que aparezca en la lista de micros del viaje.
 *
 * Precondición: el dueño debe tener al menos una empresa con
 * un vehículo configurado. Si no, la prueba falla en el paso
 * de seleccionar empresa, con mensaje claro.
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
    id: "alta_micro",
    nombre: "Agregar micro a un viaje (dueño)",
    descripcion: "Crea un viaje, le agrega un micro (empresa + vehículo + monto) y verifica que aparezca en la lista de micros del viaje. Requiere que el dueño tenga al menos una empresa con un vehículo configurado. Cada corrida crea un viaje nuevo (prefijo viajemicro).",

    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_DUENO);

        const activacion = await ctx.activar_pestana_piloto("viajes");
        ctx.assert(activacion && activacion.exito, "No se pudo activar la pestaña Viajes: " + (activacion && activacion.error ? activacion.error : "sin detalle"));

        const espera_boton = await ctx.esperar("#boton_agregar_viaje", 5000);
        ctx.assert(espera_boton && espera_boton.exito, "No apareció el botón #boton_agregar_viaje");

        try {
            const { nombre_viaje } = await crear_viaje_de_prueba(ctx, "viajemicro");
            await abrir_detalle_viaje(ctx, nombre_viaje);
            await abrir_formulario_agregar_micro(ctx);

            const { patente } = await elegir_empresa_y_vehiculo(ctx, 1, 1);
            await ctx.escribir("#monto_micro_viaje", "1000");
            await ctx.clic("#boton_confirmar_micro");

            let micro_agregado = false;
            let monto_ok = false;
            const inicio = Date.now();
            while (Date.now() - inicio < 15000) {
                const html_micros = await ctx.html("#lista_micros_viaje");
                if (html_micros && html_micros.includes(patente)) {
                    micro_agregado = true;
                    monto_ok = html_micros.includes("1000");
                    break;
                }
                await ctx.pausa(300);
            }

            ctx.assert(micro_agregado, "El micro (patente " + patente + ") no apareció en #lista_micros_viaje después del alta");
            ctx.assert(monto_ok, "El micro se agregó pero el monto 1000 no se refleja en #lista_micros_viaje");
        } finally {
            await cerrar_modal_apilado_si_abierto(ctx);
        }
    }
};