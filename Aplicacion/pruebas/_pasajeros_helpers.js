/**
 * Helpers compartidos por las pruebas de pasajeros.
 *
 * Todos usan `ctx` (el service worker) y son async. Lanzan
 * Error si algo falla, para que la prueba que los usa no siga
 * adelante con datos inconsistentes.
 *
 * @version 1.5plugin.7d
 */

import { _post } from "./_helpers.js";

// PNG 1x1 transparente (67 bytes). Sirve para las pruebas de
// subida de archivo.
export const PNG_TRANSPARENTE_B64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

// Otro PNG 1x1 (para el test de reemplazo, así el nombre cambia).
export const PNG_ALTERNATIVO_B64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

/**
 * Resuelve el primer dueño vía POST.
 *
 * @param {object} ctx
 * @param {string} nombre_solicitante
 */
export async function primer_dueno_para_pruebas(ctx, nombre_solicitante) {
    const r = await _post(ctx, "administrador/listar_duenos",
        { nombre_solicitante },
        { sin_solicitante: true, lanzar_en_error_backend: true });
    const lista = r.duenos || [];
    if (!Array.isArray(lista) || lista.length === 0) {
        throw new Error("No hay dueños disponibles.");
    }
    const primero = lista[0];
    const nombre = typeof primero === "string"
        ? primero
        : (primero.nombre_usuario || primero.nombre || primero.usuario);
    if (!nombre) {
        throw new Error("No se pudo determinar el nombre del dueño.");
    }
    return nombre;
}

/**
 * Crea un pasajero de prueba y devuelve { dni }.
 *
 * @param {object} ctx
 * @param {string} nombre_solicitante
 * @param {string} nombre_dueno
 * @param {string} dni
 */
export async function crear_pasajero_de_prueba_admin(ctx, nombre_solicitante, nombre_dueno, dni) {
    await _post(ctx, "pasajeros/crear", {
        nombre_solicitante,
        nombre_dueno,
        dni,
        apellido: "Djtest",
        nombres: "Pasajero",
        email: "dj_" + dni + "@test.local",
        celular: "2983555123",
        celular_emergencia: "2983555222",
        fecha_nacimiento: "1990-06-15",
        direccion: "Calle Dj 1",
        localidad: "Tres Arroyos"
    }, { sin_solicitante: true, lanzar_en_error_backend: true });
}

/**
 * Elimina un pasajero vía POST. Silencioso si falla.
 *
 * @param {object} ctx
 * @param {string} nombre_solicitante
 * @param {string} nombre_dueno
 * @param {string} dni
 */
export async function eliminar_pasajero_por_post(ctx, nombre_solicitante, nombre_dueno, dni) {
    try {
        await _post(ctx, "pasajeros/eliminar", {
            nombre_solicitante,
            nombre_dueno,
            dni
        }, { sin_solicitante: true });
    } catch (e) {
        console.warn("No se pudo eliminar el pasajero de prueba:", e);
    }
}

/**
 * Lee el pasajero por DNI y devuelve el objeto. Falla si no
 * existe.
 *
 * @param {object} ctx
 * @param {string} nombre_solicitante
 * @param {string} nombre_dueno
 * @param {string} dni
 */
export async function leer_pasajero(ctx, nombre_solicitante, nombre_dueno, dni) {
    const r = await _post(ctx, "pasajeros/obtener", {
        nombre_solicitante,
        nombre_dueno,
        dni
    }, { sin_solicitante: true, lanzar_en_error_backend: true });
    return r.pasajero;
}

/**
 * Cuenta huérfanos con grafo/resumen. Falla si no se puede leer.
 *
 * @param {object} ctx
 * @param {string} nombre_solicitante
 */
export async function contar_huerfanos(ctx, nombre_solicitante) {
    const r = await _post(ctx, "grafo/resumen",
        { nombre_solicitante },
        { sin_solicitante: true, lanzar_en_error_backend: true });
    return r.resumen.huerfanos;
}

/**
 * DNI único de 8 dígitos.
 */
export function dni_unico_para_pruebas() {
    const base = Date.now() % 90000000;
    return String(base + 10000000);
}