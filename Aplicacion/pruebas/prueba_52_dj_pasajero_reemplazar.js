/**
 * Prueba: reemplazar la DJ de un pasajero.
 *
 * Sube una DJ A, después una DJ B con distinto nombre. Verifica
 * que el nodo DJ viejo se destruye (no quedan huérfanos) y
 * que los metadatos corresponden a la B.
 *
 * @version 1.5plugin.5s
 */

import { CODIGO_ADMIN } from "../ConfPlugin.js";
import { cerrar_modales_si_abiertos } from "./_helpers.js";
import {
    PNG_TRANSPARENTE_B64,
    PNG_ALTERNATIVO_B64,
    primer_dueno_para_pruebas,
    crear_pasajero_de_prueba_admin,
    eliminar_pasajero_por_post,
    leer_pasajero,
    contar_huerfanos,
    dni_unico_para_pruebas
} from "./_pasajeros_helpers.js";

export const prueba = {
    id: "dj_pasajero_reemplazar",
    nombre: "Declaraciones: reemplazar DJ del pasajero",
    descripcion: "Verifica que reemplazar la DJ destruye el nodo viejo y guarda los metadatos del nuevo.",
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

        // 1. Subir la DJ A.
        const nombre_a = "djA_" + dni + ".png";
        const rA = await ctx.subir_archivo(
            "pasajeros/subir_declaracion",
            { nombre_dueno, dni },
            { nombre: nombre_a, tipo: "image/png", contenido_base64: PNG_TRANSPARENTE_B64 }
        );
        ctx.assert(rA && rA.exito && rA.json && rA.json.exito,
            "Falló la subida de la DJ A: "
            + (rA && rA.json && rA.json.error ? rA.json.error : "(sin detalle)"));

        const H1 = await contar_huerfanos(ctx, nombre_admin);

        // 2. Subir la DJ B (reemplaza la A).
        const nombre_b = "djB_" + dni + ".png";
        const rB = await ctx.subir_archivo(
            "pasajeros/subir_declaracion",
            { nombre_dueno, dni },
            { nombre: nombre_b, tipo: "image/png", contenido_base64: PNG_ALTERNATIVO_B64 }
        );
        ctx.assert(rB && rB.exito && rB.json && rB.json.exito,
            "Falló la subida de la DJ B: "
            + (rB && rB.json && rB.json.error ? rB.json.error : "(sin detalle)"));

        const H2 = await contar_huerfanos(ctx, nombre_admin);
        ctx.assert(H2 === H1,
            "Reemplazar la DJ dejó huérfanos (el nodo viejo no se destruyó). "
            + "H1=" + H1 + ", H2=" + H2 + ", dif=" + (H2 - H1));

        // 3. Verificar metadatos de la DJ B.
        const pasajero = await leer_pasajero(ctx, nombre_admin, nombre_dueno, dni);
        ctx.assert(pasajero.declaracion_jurada,
            "El pasajero no tiene declaracion_jurada tras el reemplazo.");
        ctx.assert(pasajero.declaracion_jurada.nombre_original === nombre_b,
            "nombre_original no es el de la DJ B. Esperado: " + nombre_b
            + ", obtenido: " + pasajero.declaracion_jurada.nombre_original);

        await eliminar_pasajero_por_post(ctx, nombre_admin, nombre_dueno, dni);
    }
};