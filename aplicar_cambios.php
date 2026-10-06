<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda V1.5plugin.5s:
 *   - Helper multipart en el plugin: ctx.subir_archivo().
 *   - Nueva sección "declaraciones_juradas" con 3 pruebas:
 *     subir, reemplazar, eliminar la DJ del pasajero.
 *   - Sección "base" sigue con 3 pruebas, "grafo" con 14, etc.
 *   - Bump de ConfPlugin, servicio.js, contenido.js, catálogo
 *     y prompt.
 *
 * Uso:
 *   php aplicar_cambios.php
 *
 * Correr parado en la raíz de iteradoresJS/.
 */

// ============================================================
// Configuración
// ============================================================

$modo_estricto = true;
$raiz_proyecto = __DIR__;

// ============================================================
// Cambios a aplicar
// ============================================================

$cambios = [

    // --------------------------------------------------------
    // ConfPlugin.js
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'Bump VERSION_APP a 5s',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.5r";',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.5s";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'Bump VERSION_PLUGIN a 5s',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5r";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5s";',
        ],
    ],

    // --------------------------------------------------------
    // servicio.js
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'Bump @version de servicio.js a 5s',
        'buscar' => [
            ' * @version 1.5plugin.5f',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.5s',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'Agregar helper ctx.subir_archivo',
        'buscar' => [
            '        nombre_usuario_actual: async () => {',
        ],
        'reemplazar' => [
            '        subir_archivo: async (accion, campos, archivo_info) => {',
            '            // Sube un archivo vía multipart al piloto. El fetch',
            '            // lo hace el content script (no el SW) porque las',
            '            // cookies del piloto solo viajan desde el origen',
            '            // del piloto.',
            '            //',
            '            // `archivo_info` es { nombre, tipo, contenido_base64 }.',
            '            try {',
            '                const r = await enviar("subir_archivo", {',
            '                    accion,',
            '                    campos: campos || {},',
            '                    archivo: archivo_info',
            '                });',
            '                return r || { exito: false, error: "sin respuesta" };',
            '            } catch (e) {',
            '                return { exito: false, error: e.message };',
            '            }',
            '        },',
            '        nombre_usuario_actual: async () => {',
        ],
    ],

    // --------------------------------------------------------
    // contenido.js
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'Bump @version de contenido.js a 5s',
        'buscar' => [
            ' * @version 1.5plugin.4nml',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.5s',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'Agregar caso subir_archivo al content script',
        'buscar' => [
            '            case "obtener_id_ultima_venta_terminal": {',
        ],
        'reemplazar' => [
            '            case "subir_archivo": {',
            '                // Sube un archivo al piloto vía multipart.',
            '                // Recibe { accion, campos, archivo: { nombre, tipo, contenido_base64 } }.',
            '                // Decodifica el base64, arma un Blob y hace el fetch.',
            '                // Corre en el content script para que las cookies',
            '                // del piloto viajen con la petición.',
            '                try {',
            '                    const binario = atob(datos.archivo.contenido_base64);',
            '                    const bytes = new Uint8Array(binario.length);',
            '                    for (let i = 0; i < binario.length; i++) {',
            '                        bytes[i] = binario.charCodeAt(i);',
            '                    }',
            '                    const blob = new Blob([bytes], { type: datos.archivo.tipo });',
            '',
            '                    const fd = new FormData();',
            '                    fd.append("accion", datos.accion);',
            '                    const campos = datos.campos || {};',
            '                    for (const k in campos) {',
            '                        if (Object.prototype.hasOwnProperty.call(campos, k)) {',
            '                            fd.append(k, campos[k]);',
            '                        }',
            '                    }',
            '                    fd.append("archivo", blob, datos.archivo.nombre);',
            '',
            '                    const resp = await fetch("index.php", {',
            '                        method: "POST",',
            '                        body: fd',
            '                    });',
            '                    const texto = await resp.text();',
            '                    let json = null;',
            '                    try { json = JSON.parse(texto); } catch (e) { /* no era JSON */ }',
            '                    return { exito: true, status: resp.status, texto, json };',
            '                } catch (e) {',
            '                    return { exito: false, error: e.message };',
            '                }',
            '            }',
            '',
            '            case "obtener_id_ultima_venta_terminal": {',
        ],
    ],

    // --------------------------------------------------------
    // _pasajeros_helpers.js (nuevo)
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/_pasajeros_helpers.js',
        'descripcion' => 'Helpers compartidos para pruebas de pasajeros',
        'contenido' => [
            '/**',
            ' * Helpers compartidos por las pruebas de pasajeros.',
            ' *',
            ' * Todos usan `ctx` (el service worker) y son async. Lanzan',
            ' * Error si algo falla, para que la prueba que los usa no siga',
            ' * adelante con datos inconsistentes.',
            ' *',
            ' * @version 1.5plugin.5s',
            ' */',
            '',
            '// PNG 1x1 transparente (67 bytes). Sirve para las pruebas de',
            '// subida de archivo.',
            'export const PNG_TRANSPARENTE_B64 =',
            '    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";',
            '',
            '// Otro PNG 1x1 (para el test de reemplazo, así el nombre cambia).',
            'export const PNG_ALTERNATIVO_B64 =',
            '    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";',
            '',
            '/**',
            ' * Resuelve el primer dueño vía POST.',
            ' *',
            ' * @param {object} ctx',
            ' * @param {string} nombre_solicitante',
            ' */',
            'export async function primer_dueno_para_pruebas(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "administrador/listar_duenos",',
            '        nombre_solicitante',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo listar dueños: "',
            '            + ((r && r.json && r.json.error) ? r.json.error : "(sin detalle)"));',
            '    }',
            '    const lista = r.json.duenos || [];',
            '    if (!Array.isArray(lista) || lista.length === 0) {',
            '        throw new Error("No hay dueños disponibles.");',
            '    }',
            '    const primero = lista[0];',
            '    const nombre = typeof primero === "string"',
            '        ? primero',
            '        : (primero.nombre_usuario || primero.nombre || primero.usuario);',
            '    if (!nombre) {',
            '        throw new Error("No se pudo determinar el nombre del dueño.");',
            '    }',
            '    return nombre;',
            '}',
            '',
            '/**',
            ' * Crea un pasajero de prueba y devuelve { dni }.',
            ' *',
            ' * @param {object} ctx',
            ' * @param {string} nombre_solicitante',
            ' * @param {string} nombre_dueno',
            ' * @param {string} dni',
            ' */',
            'export async function crear_pasajero_de_prueba_admin(ctx, nombre_solicitante, nombre_dueno, dni) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "pasajeros/crear",',
            '        nombre_solicitante,',
            '        nombre_dueno,',
            '        dni,',
            '        apellido: "Djtest",',
            '        nombres: "Pasajero",',
            '        email: "dj_" + dni + "@test.local",',
            '        celular: "2983555123",',
            '        celular_emergencia: "2983555222",',
            '        fecha_nacimiento: "1990-06-15",',
            '        direccion: "Calle Dj 1",',
            '        localidad: "Tres Arroyos"',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo crear el pasajero: "',
            '            + ((r && r.json && r.json.error) ? r.json.error : "(sin detalle)"));',
            '    }',
            '}',
            '',
            '/**',
            ' * Elimina un pasajero vía POST. Silencioso si falla.',
            ' *',
            ' * @param {object} ctx',
            ' * @param {string} nombre_solicitante',
            ' * @param {string} nombre_dueno',
            ' * @param {string} dni',
            ' */',
            'export async function eliminar_pasajero_por_post(ctx, nombre_solicitante, nombre_dueno, dni) {',
            '    try {',
            '        await ctx.pedir_post("index.php", {',
            '            accion: "pasajeros/eliminar",',
            '            nombre_solicitante,',
            '            nombre_dueno,',
            '            dni',
            '        });',
            '    } catch (e) {',
            '        console.warn("No se pudo eliminar el pasajero de prueba:", e);',
            '    }',
            '}',
            '',
            '/**',
            ' * Lee el pasajero por DNI y devuelve el objeto. Falla si no',
            ' * existe.',
            ' *',
            ' * @param {object} ctx',
            ' * @param {string} nombre_solicitante',
            ' * @param {string} nombre_dueno',
            ' * @param {string} dni',
            ' */',
            'export async function leer_pasajero(ctx, nombre_solicitante, nombre_dueno, dni) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "pasajeros/obtener",',
            '        nombre_solicitante,',
            '        nombre_dueno,',
            '        dni',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo leer el pasajero " + dni + ": "',
            '            + ((r && r.json && r.json.error) ? r.json.error : "(sin detalle)"));',
            '    }',
            '    return r.json.pasajero;',
            '}',
            '',
            '/**',
            ' * Cuenta huérfanos con grafo/resumen. Falla si no se puede leer.',
            ' *',
            ' * @param {object} ctx',
            ' * @param {string} nombre_solicitante',
            ' */',
            'export async function contar_huerfanos(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen",',
            '        nombre_solicitante',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo consultar grafo/resumen: "',
            '            + ((r && r.json && r.json.error) ? r.json.error : "(sin detalle)"));',
            '    }',
            '    return r.json.resumen.huerfanos;',
            '}',
            '',
            '/**',
            ' * DNI único de 8 dígitos.',
            ' */',
            'export function dni_unico_para_pruebas() {',
            '    const base = Date.now() % 90000000;',
            '    return String(base + 10000000);',
            '}',
        ],
    ],

    // --------------------------------------------------------
    // catalogo.js
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Bump @version de catalogo.js a 5s',
        'buscar' => [
            ' * @version 1.5plugin.5r',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.5s',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar imports de las pruebas 51-53',
        'buscar' => [
            'import { prueba as vehiculo_cancelar } from "./prueba_50_vehiculo_cancelar.js";',
            '',
            'export const SECCIONES = [',
        ],
        'reemplazar' => [
            'import { prueba as vehiculo_cancelar } from "./prueba_50_vehiculo_cancelar.js";',
            'import { prueba as dj_pasajero_subir } from "./prueba_51_dj_pasajero_subir.js";',
            'import { prueba as dj_pasajero_reemplazar } from "./prueba_52_dj_pasajero_reemplazar.js";',
            'import { prueba as dj_pasajero_eliminar } from "./prueba_53_dj_pasajero_eliminar.js";',
            '',
            'export const SECCIONES = [',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar sección declaraciones_juradas',
        'buscar' => [
            '    {',
            '        id: "grafo",',
            '        nombre: "Grafo",',
        ],
        'reemplazar' => [
            '    {',
            '        id: "declaraciones_juradas",',
            '        nombre: "Declaraciones juradas",',
            '        pruebas: [',
            '            dj_pasajero_subir,',
            '            dj_pasajero_reemplazar,',
            '            dj_pasajero_eliminar',
            '        ]',
            '    },',
            '    {',
            '        id: "grafo",',
            '        nombre: "Grafo",',
        ],
    ],

    // --------------------------------------------------------
    // Prueba 51
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_51_dj_pasajero_subir.js',
        'descripcion' => 'Prueba 51: subir DJ del pasajero',
        'contenido' => [
            '/**',
            ' * Prueba: subir la declaración jurada de un pasajero.',
            ' *',
            ' * Verifica el flujo feliz de pasajeros/subir_declaracion',
            ' * (v1.5piloto.76). Crea un pasajero, sube un PNG de prueba,',
            ' * verifica que el nodo DJ queda con los metadatos',
            ' * correctos, y que no deja huérfanos.',
            ' *',
            ' * @version 1.5plugin.5s',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            'import { cerrar_modales_si_abiertos } from "./_helpers.js";',
            'import {',
            '    PNG_TRANSPARENTE_B64,',
            '    primer_dueno_para_pruebas,',
            '    crear_pasajero_de_prueba_admin,',
            '    eliminar_pasajero_por_post,',
            '    leer_pasajero,',
            '    contar_huerfanos,',
            '    dni_unico_para_pruebas',
            '} from "./_pasajeros_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "dj_pasajero_subir",',
            '    nombre: "Declaraciones: subir DJ del pasajero",',
            '    descripcion: "Verifica que subir la declaración jurada de un pasajero guarda el nodo con sus metadatos.",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '        await cerrar_modales_si_abiertos(ctx);',
            '',
            '        const r_nombre = await ctx.nombre_usuario_actual();',
            '        if (!r_nombre || !r_nombre.exito) {',
            '            throw new Error("No se pudo leer el nombre de usuario del admin");',
            '        }',
            '        const nombre_admin = r_nombre.nombre_usuario;',
            '',
            '        const nombre_dueno = await primer_dueno_para_pruebas(ctx, nombre_admin);',
            '        const dni = dni_unico_para_pruebas();',
            '',
            '        await crear_pasajero_de_prueba_admin(ctx, nombre_admin, nombre_dueno, dni);',
            '',
            '        const H0 = await contar_huerfanos(ctx, nombre_admin);',
            '',
            '        const nombre_archivo = "dj_" + dni + ".png";',
            '        const r_subir = await ctx.subir_archivo(',
            '            "pasajeros/subir_declaracion",',
            '            { nombre_dueno, dni },',
            '            { nombre: nombre_archivo, tipo: "image/png", contenido_base64: PNG_TRANSPARENTE_B64 }',
            '        );',
            '        ctx.assert(r_subir && r_subir.exito,',
            '            "Falló la subida multipart: " + (r_subir && r_subir.error ? r_subir.error : "sin detalle"));',
            '        ctx.assert(r_subir.json && r_subir.json.exito,',
            '            "El backend rechazó la subida: "',
            '            + (r_subir.json && r_subir.json.error ? r_subir.json.error : "(sin detalle)"));',
            '',
            '        const H1 = await contar_huerfanos(ctx, nombre_admin);',
            '        ctx.assert(H1 === H0,',
            '            "Subir la DJ dejó huérfanos. H0=" + H0 + ", H1=" + H1);',
            '',
            '        const pasajero = await leer_pasajero(ctx, nombre_admin, nombre_dueno, dni);',
            '        ctx.assert(pasajero.declaracion_jurada,',
            '            "El pasajero no tiene declaracion_jurada después de subirla.");',
            '        ctx.assert(pasajero.declaracion_jurada.nombre_original === nombre_archivo,',
            '            "nombre_original no coincide. Esperado: " + nombre_archivo',
            '            + ", obtenido: " + pasajero.declaracion_jurada.nombre_original);',
            '        ctx.assert(pasajero.declaracion_jurada.tipo === "image/png",',
            '            "tipo no coincide. Esperado: image/png, obtenido: " + pasajero.declaracion_jurada.tipo);',
            '        ctx.assert(pasajero.declaracion_jurada.es_imagen === true,',
            '            "es_imagen debería ser true.");',
            '',
            '        await eliminar_pasajero_por_post(ctx, nombre_admin, nombre_dueno, dni);',
            '    }',
            '};',
        ],
    ],

    // --------------------------------------------------------
    // Prueba 52
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_52_dj_pasajero_reemplazar.js',
        'descripcion' => 'Prueba 52: reemplazar DJ del pasajero',
        'contenido' => [
            '/**',
            ' * Prueba: reemplazar la DJ de un pasajero.',
            ' *',
            ' * Sube una DJ A, después una DJ B con distinto nombre. Verifica',
            ' * que el nodo DJ viejo se destruye (no quedan huérfanos) y',
            ' * que los metadatos corresponden a la B.',
            ' *',
            ' * @version 1.5plugin.5s',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            'import { cerrar_modales_si_abiertos } from "./_helpers.js";',
            'import {',
            '    PNG_TRANSPARENTE_B64,',
            '    PNG_ALTERNATIVO_B64,',
            '    primer_dueno_para_pruebas,',
            '    crear_pasajero_de_prueba_admin,',
            '    eliminar_pasajero_por_post,',
            '    leer_pasajero,',
            '    contar_huerfanos,',
            '    dni_unico_para_pruebas',
            '} from "./_pasajeros_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "dj_pasajero_reemplazar",',
            '    nombre: "Declaraciones: reemplazar DJ del pasajero",',
            '    descripcion: "Verifica que reemplazar la DJ destruye el nodo viejo y guarda los metadatos del nuevo.",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '        await cerrar_modales_si_abiertos(ctx);',
            '',
            '        const r_nombre = await ctx.nombre_usuario_actual();',
            '        if (!r_nombre || !r_nombre.exito) {',
            '            throw new Error("No se pudo leer el nombre de usuario del admin");',
            '        }',
            '        const nombre_admin = r_nombre.nombre_usuario;',
            '',
            '        const nombre_dueno = await primer_dueno_para_pruebas(ctx, nombre_admin);',
            '        const dni = dni_unico_para_pruebas();',
            '',
            '        await crear_pasajero_de_prueba_admin(ctx, nombre_admin, nombre_dueno, dni);',
            '',
            '        // 1. Subir la DJ A.',
            '        const nombre_a = "djA_" + dni + ".png";',
            '        const rA = await ctx.subir_archivo(',
            '            "pasajeros/subir_declaracion",',
            '            { nombre_dueno, dni },',
            '            { nombre: nombre_a, tipo: "image/png", contenido_base64: PNG_TRANSPARENTE_B64 }',
            '        );',
            '        ctx.assert(rA && rA.exito && rA.json && rA.json.exito,',
            '            "Falló la subida de la DJ A: "',
            '            + (rA && rA.json && rA.json.error ? rA.json.error : "(sin detalle)"));',
            '',
            '        const H1 = await contar_huerfanos(ctx, nombre_admin);',
            '',
            '        // 2. Subir la DJ B (reemplaza la A).',
            '        const nombre_b = "djB_" + dni + ".png";',
            '        const rB = await ctx.subir_archivo(',
            '            "pasajeros/subir_declaracion",',
            '            { nombre_dueno, dni },',
            '            { nombre: nombre_b, tipo: "image/png", contenido_base64: PNG_ALTERNATIVO_B64 }',
            '        );',
            '        ctx.assert(rB && rB.exito && rB.json && rB.json.exito,',
            '            "Falló la subida de la DJ B: "',
            '            + (rB && rB.json && rB.json.error ? rB.json.error : "(sin detalle)"));',
            '',
            '        const H2 = await contar_huerfanos(ctx, nombre_admin);',
            '        ctx.assert(H2 === H1,',
            '            "Reemplazar la DJ dejó huérfanos (el nodo viejo no se destruyó). "',
            '            + "H1=" + H1 + ", H2=" + H2 + ", dif=" + (H2 - H1));',
            '',
            '        // 3. Verificar metadatos de la DJ B.',
            '        const pasajero = await leer_pasajero(ctx, nombre_admin, nombre_dueno, dni);',
            '        ctx.assert(pasajero.declaracion_jurada,',
            '            "El pasajero no tiene declaracion_jurada tras el reemplazo.");',
            '        ctx.assert(pasajero.declaracion_jurada.nombre_original === nombre_b,',
            '            "nombre_original no es el de la DJ B. Esperado: " + nombre_b',
            '            + ", obtenido: " + pasajero.declaracion_jurada.nombre_original);',
            '',
            '        await eliminar_pasajero_por_post(ctx, nombre_admin, nombre_dueno, dni);',
            '    }',
            '};',
        ],
    ],

    // --------------------------------------------------------
    // Prueba 53
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_53_dj_pasajero_eliminar.js',
        'descripcion' => 'Prueba 53: eliminar DJ del pasajero',
        'contenido' => [
            '/**',
            ' * Prueba: eliminar la DJ de un pasajero.',
            ' *',
            ' * Sube una DJ, después la elimina. Verifica que el nodo DJ',
            ' * se destruye (no quedan huérfanos) y que el pasajero queda',
            ' * sin declaracion_jurada.',
            ' *',
            ' * @version 1.5plugin.5s',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            'import { cerrar_modales_si_abiertos } from "./_helpers.js";',
            'import {',
            '    PNG_TRANSPARENTE_B64,',
            '    primer_dueno_para_pruebas,',
            '    crear_pasajero_de_prueba_admin,',
            '    eliminar_pasajero_por_post,',
            '    leer_pasajero,',
            '    contar_huerfanos,',
            '    dni_unico_para_pruebas',
            '} from "./_pasajeros_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "dj_pasajero_eliminar",',
            '    nombre: "Declaraciones: eliminar DJ del pasajero",',
            '    descripcion: "Verifica que eliminar la DJ destruye el nodo y limpia el enlace del pasajero.",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '        await cerrar_modales_si_abiertos(ctx);',
            '',
            '        const r_nombre = await ctx.nombre_usuario_actual();',
            '        if (!r_nombre || !r_nombre.exito) {',
            '            throw new Error("No se pudo leer el nombre de usuario del admin");',
            '        }',
            '        const nombre_admin = r_nombre.nombre_usuario;',
            '',
            '        const nombre_dueno = await primer_dueno_para_pruebas(ctx, nombre_admin);',
            '        const dni = dni_unico_para_pruebas();',
            '',
            '        await crear_pasajero_de_prueba_admin(ctx, nombre_admin, nombre_dueno, dni);',
            '',
            '        // 1. Subir una DJ.',
            '        const nombre_archivo = "djdel_" + dni + ".png";',
            '        const rSubir = await ctx.subir_archivo(',
            '            "pasajeros/subir_declaracion",',
            '            { nombre_dueno, dni },',
            '            { nombre: nombre_archivo, tipo: "image/png", contenido_base64: PNG_TRANSPARENTE_B64 }',
            '        );',
            '        ctx.assert(rSubir && rSubir.exito && rSubir.json && rSubir.json.exito,',
            '            "Falló la subida de la DJ: "',
            '            + (rSubir && rSubir.json && rSubir.json.error ? rSubir.json.error : "(sin detalle)"));',
            '',
            '        const H1 = await contar_huerfanos(ctx, nombre_admin);',
            '',
            '        // 2. Eliminar la DJ.',
            '        const rElim = await ctx.pedir_post("index.php", {',
            '            accion: "pasajeros/eliminar_declaracion",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            dni',
            '        });',
            '        ctx.assert(rElim && rElim.exito && rElim.json && rElim.json.exito,',
            '            "Falló eliminar_declaracion: "',
            '            + (rElim && rElim.json && rElim.json.error ? rElim.json.error : "(sin detalle)"));',
            '',
            '        const H2 = await contar_huerfanos(ctx, nombre_admin);',
            '        ctx.assert(H2 === H1,',
            '            "Eliminar la DJ dejó huérfanos (el nodo no se destruyó). "',
            '            + "H1=" + H1 + ", H2=" + H2 + ", dif=" + (H2 - H1));',
            '',
            '        // 3. Verificar que el pasajero ya no tiene DJ.',
            '        const pasajero = await leer_pasajero(ctx, nombre_admin, nombre_dueno, dni);',
            '        ctx.assert(!pasajero.declaracion_jurada,',
            '            "El pasajero todavía tiene declaracion_jurada tras eliminarla.");',
            '',
            '        await eliminar_pasajero_por_post(ctx, nombre_admin, nombre_dueno, dni);',
            '    }',
            '};',
        ],
    ],

    // --------------------------------------------------------
    // Prompt del plugin
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: estado a 5s con 53 pruebas',
        'buscar' => [
            '**Proyecto en v1.5plugin.5r.** El esqueleto del plugin está',
            'armado y funcional, tiene 50 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + empresas',
            '+ vehículos + grafo) y las agrupa en secciones.',
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.5s.** El esqueleto del plugin está',
            'armado y funcional, tiene 53 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + empresas',
            '+ vehículos + declaraciones juradas + grafo) y las agrupa',
            'en secciones.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: agregar sección declaraciones_juradas a la lista',
        'buscar' => [
            '- `vehiculos`: 3 pruebas. `alta_vehiculo` (flujo feliz),',
            '  `vehiculo_patente_vacia` (validación local),',
            '  `vehiculo_cancelar`. Crea una empresa de setup para cada',
            '  prueba y la elimina al final (arrastra el vehículo).',
        ],
        'reemplazar' => [
            '- `vehiculos`: 3 pruebas. `alta_vehiculo` (flujo feliz),',
            '  `vehiculo_patente_vacia` (validación local),',
            '  `vehiculo_cancelar`. Crea una empresa de setup para cada',
            '  prueba y la elimina al final (arrastra el vehículo).',
            '- `declaraciones_juradas`: 3 pruebas. `dj_pasajero_subir`',
            '  (flujo feliz con multipart), `dj_pasajero_reemplazar`',
            '  (subir una DJ nueva destruye la vieja),',
            '  `dj_pasajero_eliminar` (destruye el nodo y limpia el',
            '  enlace). Usan el helper `ctx.subir_archivo`.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: agregar ctx.subir_archivo a la lista de helpers',
        'buscar' => [
            '**Fetch y datos:**',
            '- `ctx.pedir_post(url, body)` → {exito, status, texto, json}.',
            '- `ctx.enviar(tipo, datos)` — mensaje crudo al content script.',
        ],
        'reemplazar' => [
            '**Fetch y datos:**',
            '- `ctx.pedir_post(url, body)` → {exito, status, texto, json}.',
            '- `ctx.enviar(tipo, datos)` — mensaje crudo al content script.',
            '- `ctx.subir_archivo(accion, campos, archivo_info)` → sube un',
            '  archivo por multipart al piloto. `archivo_info` es',
            '  `{nombre, tipo, contenido_base64}`. El fetch lo hace el',
            '  content script (las cookies del piloto solo viajan desde',
            '  el origen del piloto).',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: última actualización a 5s',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.5r',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.5s',
            '(helper multipart `ctx.subir_archivo` + sección',
            '"declaraciones_juradas" con 3 pruebas: subir, reemplazar y',
            'eliminar la DJ del pasajero. Cubre el fix de v1.5piloto.76',
            'que destruye el nodo DJ con sus 4 sub-campos. Nuevo',
            'archivo de helpers `_pasajeros_helpers.js` con PNGs de',
            'prueba embebidos.).',
            'Antes: v1.5plugin.5r',
        ],
    ],

];

// ============================================================
// Runner
// ============================================================

echo "=== Aplicador de cambios ===\n\n";

function detectar_eol(string $contenido): string {
    return (strpos($contenido, "\r\n") !== false) ? "\r\n" : "\n";
}
function normalizar_a_unix(string $contenido): string {
    return str_replace("\r\n", "\n", $contenido);
}
function normalizar_a_original(string $contenido, string $eol): string {
    if ($eol === "\n") return $contenido;
    return str_replace("\n", "\r\n", $contenido);
}
function contar_ocurrencias(string $contenido, string $bloque): int {
    if ($bloque === '') return 0;
    $count = 0;
    $offset = 0;
    while (($pos = strpos($contenido, $bloque, $offset)) !== false) {
        $count++;
        $offset = $pos + strlen($bloque);
    }
    return $count;
}

$creaciones = [];
$eliminaciones = [];
$reemplazos_por_archivo = [];

foreach ($cambios as $cambio) {
    $tipo = $cambio['tipo'] ?? 'reemplazar';
    if ($tipo === 'crear') { $creaciones[] = $cambio; continue; }
    if ($tipo === 'eliminar') { $eliminaciones[] = $cambio; continue; }
    if (!isset($cambio['archivo']) || !isset($cambio['buscar']) || !isset($cambio['reemplazar'])) {
        echo "[FALLO] Cambio mal formado (faltan campos).\n";
        exit(1);
    }
    $reemplazos_por_archivo[$cambio['archivo']][] = $cambio;
}

$total_reemplazos = 0;
foreach ($reemplazos_por_archivo as $lista) { $total_reemplazos += count($lista); }

echo "[INFO] " . count($creaciones) . " archivo(s) a crear, "
    . $total_reemplazos . " reemplazo(s) en "
    . count($reemplazos_por_archivo) . " archivo(s), "
    . count($eliminaciones) . " archivo(s) a eliminar.\n\n";

$archivos_a_escribir = [];
$bloques_ok = 0;
$bloques_fallidos = [];

foreach ($reemplazos_por_archivo as $archivo_rel => $lista_cambios) {
    $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
    if (!file_exists($ruta_abs)) {
        $bloques_fallidos[] = "Archivo no encontrado: $archivo_rel";
        foreach ($lista_cambios as $c) $bloques_fallidos[] = "  - {$c['descripcion']}";
        continue;
    }
    $contenido_original = file_get_contents($ruta_abs);
    if ($contenido_original === false) { $bloques_fallidos[] = "No se pudo leer: $archivo_rel"; continue; }

    $eol = detectar_eol($contenido_original);
    $contenido = normalizar_a_unix($contenido_original);
    $contenido_antes = $contenido;
    $hubo_error = false;

    foreach ($lista_cambios as $cambio) {
        $buscar_str = implode("\n", $cambio['buscar']);
        $reemplazar_str = implode("\n", $cambio['reemplazar']);
        $ocurrencias = contar_ocurrencias($contenido, $buscar_str);
        if ($ocurrencias === 0) {
            $bloques_fallidos[] = "$archivo_rel: bloque no encontrado - {$cambio['descripcion']}";
            $hubo_error = true; continue;
        }
        if ($ocurrencias > 1) {
            $bloques_fallidos[] = "$archivo_rel: bloque ambiguo ($ocurrencias ocurrencias) - {$cambio['descripcion']}";
            $hubo_error = true; continue;
        }
        $contenido = str_replace($buscar_str, $reemplazar_str, $contenido);
        $bloques_ok++;
    }
    if (!$hubo_error && $contenido !== $contenido_antes) {
        $archivos_a_escribir[$ruta_abs] = normalizar_a_original($contenido, $eol);
    }
}

if ($modo_estricto && !empty($bloques_fallidos)) {
    echo "=== ABORTADO ===\n";
    echo "Se detectaron " . count($bloques_fallidos) . " problema(s). No se escribió ningún archivo.\n\n";
    foreach ($bloques_fallidos as $f) echo "  [FALLO] $f\n";
    echo "\nSugerencia: revisá que el bloque a buscar coincida exactamente con el archivo actual.\n";
    exit(1);
}

foreach ($archivos_a_escribir as $ruta_abs => $contenido_final) {
    if (file_put_contents($ruta_abs, $contenido_final) === false) {
        echo "[FALLO] No se pudo escribir: " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n";
        continue;
    }
    echo "[OK] " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n";
}

foreach ($creaciones as $creacion) {
    $ruta_abs = $raiz_proyecto . '/' . $creacion['archivo'];
    $dir_destino = dirname($ruta_abs);
    if (!is_dir($dir_destino)) mkdir($dir_destino, 0777, true);
    $contenido_nuevo = implode("\n", $creacion['contenido']);
    $ya_existia = file_exists($ruta_abs);
    if (file_put_contents($ruta_abs, $contenido_nuevo) === false) {
        echo "[FALLO] No se pudo crear: {$creacion['archivo']}\n"; continue;
    }
    $accion = $ya_existia ? 'sobrescrito' : 'creado';
    echo "[OK] {$creacion['archivo']} ($accion)\n";
}

foreach ($eliminaciones as $elim) {
    $ruta_abs = $raiz_proyecto . '/' . $elim['archivo'];
    if (!file_exists($ruta_abs)) {
        echo "[INFO] " . $elim['archivo'] . " no existía (nada que eliminar).\n";
        continue;
    }
    if (unlink($ruta_abs)) {
        echo "[OK] " . $elim['archivo'] . " (eliminado)\n";
    } else {
        echo "[FALLO] No se pudo eliminar: " . $elim['archivo'] . "\n";
    }
}

echo "\n=== Resumen ===\n";
echo "Bloques aplicados: $bloques_ok\n";
echo "Archivos nuevos:   " . count($creaciones) . "\n";
if (!empty($bloques_fallidos)) {
    echo "Fallos: " . count($bloques_fallidos) . "\n";
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";