/**
 * Prueba: subir la declaración jurada de un pasajero.
 *
 * Verifica el flujo feliz de pasajeros/subir_declaracion
 * (v1.5piloto.76). Crea un pasajero, sube un PNG de prueba,
 * verifica que el nodo DJ queda con los metadatos
 * correctos, y que no deja huérfanos.
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
    id: "dj_pasajero_subir",
    nombre: "Declaraciones: subir DJ del pasajero",
    descripcion: "Verifica que subir la declaración jurada de un pasajero guarda el nodo con sus metadatos.",
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

        const H0 = await contar_huerfanos(ctx, nombre_admin);

        const nombre_archivo = "dj_" + dni + ".png";
        const r_subir = await ctx.subir_archivo(
            "pasajeros/subir_declaracion",
            { nombre_dueno, dni },
            { nombre: nombre_archivo, tipo: "image/png", contenido_base64: PNG_TRANSPARENTE_B64 }
        );
        ctx.assert(r_subir && r_subir.exito,
            "Falló la subida multipart: " + (r_subir && r_subir.error ? r_subir.error : "sin detalle"));
        ctx.assert(r_subir.json && r_subir.json.exito,
            "El backend rechazó la subida: "
            + (r_subir.json && r_subir.json.error ? r_subir.json.error : "(sin detalle)"));

        const H1 = await contar_huerfanos(ctx, nombre_admin);
        ctx.assert(H1 === H0,
            "Subir la DJ dejó huérfanos. H0=" + H0 + ", H1=" + H1);

        const pasajero = await leer_pasajero(ctx, nombre_admin, nombre_dueno, dni);
        ctx.assert(pasajero.declaracion_jurada,
            "El pasajero no tiene declaracion_jurada después de subirla.");
        ctx.assert(pasajero.declaracion_jurada.nombre_original === nombre_archivo,
            "nombre_original no coincide. Esperado: " + nombre_archivo
            + ", obtenido: " + pasajero.declaracion_jurada.nombre_original);
        ctx.assert(pasajero.declaracion_jurada.tipo === "image/png",
            "tipo no coincide. Esperado: image/png, obtenido: " + pasajero.declaracion_jurada.tipo);
        ctx.assert(pasajero.declaracion_jurada.es_imagen === true,
            "es_imagen debería ser true.");

        await eliminar_pasajero_por_post(ctx, nombre_admin, nombre_dueno, dni);
    }
};