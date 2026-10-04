/**
 * Prueba: alta de viaje por parte de un dueño.
 *
 * Flujo:
 *   1. Login como dueño.
 *   2. Ir a la pestaña Viajes.
 *   3. Click en "Agregar viaje". Abre el modal genérico
 *      (viajes-opciones.js, función abrir_modal_viaje).
 *   4. Llenar el formulario con datos únicos.
 *   5. Guardar. El alta NO dispara alert() (usa
 *      mostrar_aviso / toast). No hace falta ni override de
 *      alert ni bandera de modo prueba.
 *   6. Verificar que el viaje aparezca en #lista_viajes.
 *
 * IMPORTANTE: cada corrida crea un viaje nuevo con un
 * nombre único (prefijo "viajeprueba"). El test NO lo
 * elimina; las corridas sucesivas van acumulando viajes de
 * prueba. Limpiar manualmente desde la misma pestaña.
 *
 * @version 1.5plugin.4w
 */

import { CODIGO_DUENO } from "../ConfPlugin.js";

export const prueba = {
    id: "alta_viaje",
    nombre: "Alta de viaje (dueño)",
    descripcion: "Verifica que un dueño pueda crear un viaje desde la pestaña Viajes. Cubre el alta vía modal genérico y su reflejo en la lista. Cada corrida crea un viaje nuevo (prefijo viajeprueba).",

    async ejecutar(ctx) {
        // 1. Login como dueño.
        await ctx.asegurar_login(CODIGO_DUENO);

        // 2. Activar la pestaña Viajes.
        const activacion = await ctx.activar_pestana_piloto("viajes");
        ctx.assert(activacion && activacion.exito, "No se pudo activar la pestaña Viajes: " + (activacion && activacion.error ? activacion.error : "sin detalle"));

        // 3. Esperar el botón de alta (visible solo para dueño).
        const espera_boton = await ctx.esperar("#boton_agregar_viaje", 5000);
        ctx.assert(espera_boton && espera_boton.exito, "No apareció el botón #boton_agregar_viaje");

        // 4. Abrir el modal de alta.
        const clic_agregar = await ctx.clic("#boton_agregar_viaje");
        ctx.assert(clic_agregar && clic_agregar.exito, "No se pudo hacer clic en Agregar viaje");

        // 5. Esperar el campo Nombre dentro del modal.
        const espera_modal = await ctx.esperar("#modal_viaje_nombre", 5000);
        ctx.assert(espera_modal && espera_modal.exito, "No apareció el modal de alta de viaje (campo #modal_viaje_nombre)");

        // 6. Llenar el formulario con datos únicos.
        const sufijo = String(Date.now()).slice(-8);
        const nombre_viaje = "viajeprueba" + sufijo;
        const origen = "Origen Test";
        const destino = "Destino Test";

        // Fecha futura (mañana). El input es type="date", espera
        // YYYY-MM-DD. La fecha 'a confirmar' se maneja con el
        // select #modal_viaje_fecha_estado, que por defecto está
        // en 'confirmada'.
        const fecha_futura = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const fecha_str = fecha_futura.getFullYear() + '-'
            + String(fecha_futura.getMonth() + 1).padStart(2, '0') + '-'
            + String(fecha_futura.getDate()).padStart(2, '0');

        await ctx.escribir("#modal_viaje_nombre", nombre_viaje);
        await ctx.escribir("#modal_viaje_fecha", fecha_str);
        await ctx.escribir("#modal_viaje_hora", "08:00");
        await ctx.escribir("#modal_viaje_origen", origen);
        await ctx.escribir("#modal_viaje_destino", destino);

        // 7. Guardar.
        const clic_guardar = await ctx.clic("#guardar_modal_viaje");
        ctx.assert(clic_guardar && clic_guardar.exito, "No se pudo hacer clic en Guardar");

        // 8. Verificar que el viaje aparezca en #lista_viajes.
        //    El backend recarga la lista al guardar. El texto del
        //    viaje se muestra en el <strong> de cada .viaje-card.
        //    Buscamos el nombre único en el HTML de la lista.
        let encontrado = false;
        const inicio = Date.now();
        while (Date.now() - inicio < 15000) {
            const html_lista = await ctx.html("#lista_viajes");
            if (html_lista && html_lista.includes(nombre_viaje)) {
                encontrado = true;
                break;
            }
            await ctx.pausa(300);
        }

        ctx.assert(encontrado, "El nuevo viaje (" + nombre_viaje + ") no apareció en #lista_viajes después del alta");
    }
};