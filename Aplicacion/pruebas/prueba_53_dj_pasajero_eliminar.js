/**
 * Prueba: eliminar la DJ de un pasajero.
 *
 * Sube una DJ, después la elimina. Verifica que el nodo DJ
 * se destruye (no quedan huérfanos) y que el pasajero queda
 * sin declaracion_jurada.
 *
 * @version 1.5plugin.5s
 */

import { CODIGO_ADMIN } from "../ConfPlugin.js";
import { cerrar_modales_si_abiertos } from "./_helpers.js";
import {
    PNG_TRANSPARENTE_B64,
    primer_dueno_para_pruebas,
    crear_pasajero_de_prueba_admin,
    eliminar_pasajero_por_post,
    leer_pasajero,
    contar_huerfanos,
    dni_unico_para_pruebas
} from "./_pasajeros_helpers.js";

export const prueba = {
    id: "dj_pasajero_eliminar",
    nombre: "Declaraciones: eliminar DJ del pasajero",
    descripcion: "Verifica que eliminar la DJ destruye el nodo y limpia el enlace del pasajero.",
    async ejecutar(ctx) {
        await ctx.asegurar_login(CODIGO_ADMIN);
        await cerrar_modales_si_abiertos(ctx);

        const r_nombre = await ctx.nombre_usuario_actual();
        if (!r_nombre || !r_nombre.exito) {
            throw new Error("No se pudo leer el nombre de usuario del admin");
        }
        const nombre_admin = r_nombre.nombre_usuario;

        const nombre_dueno = await primer_dueno_para_pruebas(ctx, nombre_admin);
        const dni = dni_unico_para_pruebas();

        await crear_pasajero_de_prueba_admin(ctx, nombre_admin, nombre_dueno, dni);

        // 1. Subir una DJ.
        const nombre_archivo = "djdel_" + dni + ".png";
        const rSubir = await ctx.subir_archivo(
            "pasajeros/subir_declaracion",
            { nombre_dueno, dni },
            { nombre: nombre_archivo, tipo: "image/png", contenido_base64: PNG_TRANSPARENTE_B64 }
        );
        ctx.assert(rSubir && rSubir.exito && rSubir.json && rSubir.json.exito,
            "Falló la subida de la DJ: "
            + (rSubir && rSubir.json && rSubir.json.error ? rSubir.json.error : "(sin detalle)"));

        const H1 = await contar_huerfanos(ctx, nombre_admin);

        // 2. Eliminar la DJ.
        const rElim = await ctx.pedir_post("index.php", {
            accion: "pasajeros/eliminar_declaracion",
            nombre_solicitante: nombre_admin,
            nombre_dueno,
            dni
        });
        ctx.assert(rElim && rElim.exito && rElim.json && rElim.json.exito,
            "Falló eliminar_declaracion: "
            + (rElim && rElim.json && rElim.json.error ? rElim.json.error : "(sin detalle)"));

        const H2 = await contar_huerfanos(ctx, nombre_admin);
        ctx.assert(H2 === H1,
            "Eliminar la DJ dejó huérfanos (el nodo no se destruyó). "
            + "H1=" + H1 + ", H2=" + H2 + ", dif=" + (H2 - H1));

        // 3. Verificar que el pasajero ya no tiene DJ.
        const pasajero = await leer_pasajero(ctx, nombre_admin, nombre_dueno, dni);
        ctx.assert(!pasajero.declaracion_jurada,
            "El pasajero todavía tiene declaracion_jurada tras eliminarla.");

        await eliminar_pasajero_por_post(ctx, nombre_admin, nombre_dueno, dni);
    }
};