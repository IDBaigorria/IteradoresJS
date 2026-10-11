/**
 * Prueba: agregar un micro a un viaje ya autorizado
 * propaga la empresa del micro al `empresas` del
 * compartido del terminal.
 *
 * @version 1.5plugin.6h
 */

import { CODIGO_DUENO, CODIGO_TERMINAL1 } from "../ConfiguracionApli.js";
import {
    login_y_nombre,
    crear_viaje_vacio,
    eliminar_viaje_si_existe,
    autorizar_terminal,
    listar_empresas_del_terminal,
    buscar_empresa_con_vehiculo_configurado
} from "./_compartidos_helpers.js";

export const prueba = {
    id: "agregar_micro_actualiza_empresas_compartido",
    nombre: "Grafo: agregar micro propaga empresa al compartido",
    descripcion: "Crea un viaje, autoriza el terminal, agrega un micro con una empresa, y verifica que el terminal ve esa empresa en su listado de empresas compartidas. Verifica el fix v1.5piloto.77q de agregar_micro_a_viaje.",
    async ejecutar(ctx) {
        // 1. Resolver nombres.
        const nombre_terminal = await login_y_nombre(ctx, CODIGO_TERMINAL1);
        const nombre_dueno = await login_y_nombre(ctx, CODIGO_DUENO);

        // 2. Crear viaje + autorizar.
        const nombre_viaje = await crear_viaje_vacio(ctx, nombre_dueno, "viajemicrocomp");
        try {
            await autorizar_terminal(ctx, nombre_dueno, nombre_viaje, nombre_terminal);

            // 3. Ver qué empresas ve el terminal YA. Buscar una
            //    empresa con vehículo configurado que NO esté en esa
            //    lista. Si todas las que tienen vehículo configurado
            //    ya están compartidas, no hay nada que testear:
            //    pasamos con warn (aprendizaje 38 del prompt).
            const antes = await listar_empresas_del_terminal(ctx, nombre_dueno, nombre_terminal);
            const empresa = await buscar_empresa_con_vehiculo_configurado(ctx, nombre_dueno, antes);
            if (empresa === null) {
                console.warn(
                    "Todas las empresas del dueño con vehículo configurado "
                    + "ya están compartidas con el terminal. No hay empresa "
                    + "nueva para testear el fix de agregar_micro_a_viaje. "
                    + "Cargá otra empresa con un vehículo con asientos y "
                    + "volvé a correr la prueba.");
                return;
            }

            // 4. Agregar micro con la empresa elegida.
            const r_micro = await ctx.pedir_post("index.php", {
                accion: "viajes/agregar_micro",
                nombre_dueno: nombre_dueno,
                nombre_viaje: nombre_viaje,
                nombre_empresa: empresa.nombre_empresa,
                nombre_vehiculo: empresa.nombre_vehiculo,
                monto: "100"
            });
            ctx.assert(r_micro && r_micro.json && r_micro.json.exito,
                "No se pudo agregar el micro: "
                + JSON.stringify(r_micro && r_micro.json ? r_micro.json : r_micro));

            // 5. Verificar que ahora el terminal ve la empresa.
            const despues = await listar_empresas_del_terminal(ctx, nombre_dueno, nombre_terminal);
            ctx.assert(despues.includes(empresa.nombre_empresa),
                "Después de agregar el micro: el terminal NO ve la empresa "
                + empresa.nombre_empresa + ". "
                + "El fix v77q de agregar_micro_a_viaje no está funcionando.");
        } finally {
            await eliminar_viaje_si_existe(ctx, nombre_dueno, nombre_viaje);
        }
    }
};