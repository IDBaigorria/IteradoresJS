<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda V1.5plugin.5r:
 *   - Pruebas espejo de v1.5piloto.76c (B2: alta de empresa y
 *     vehículo por modal). Se cubren: happy path, campo vacío, y
 *     cancelar, para cada una.
 *   - Nueva sección "empresas" (3 pruebas) y "vehiculos" (3 pruebas).
 *   - Nuevo archivo de helpers _empresas_helpers.js.
 *   - Bump de ConfPlugin, catálogo y prompt.
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
        'descripcion' => 'Bump VERSION_APP a 5r',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.5q";',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.5r";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'Bump VERSION_PLUGIN a 5r',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5q";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5r";',
        ],
    ],

    // --------------------------------------------------------
    // catalogo.js
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Bump @version de catalogo.js a 5r',
        'buscar' => [
            ' * @version 1.5plugin.5q',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.5r',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar imports de las pruebas 45-50',
        'buscar' => [
            'import { prueba as cerrar_sesion_cierra_modales } from "./prueba_44_cerrar_sesion_cierra_modales.js";',
            '',
            'export const SECCIONES = [',
        ],
        'reemplazar' => [
            'import { prueba as cerrar_sesion_cierra_modales } from "./prueba_44_cerrar_sesion_cierra_modales.js";',
            'import { prueba as alta_empresa } from "./prueba_45_alta_empresa.js";',
            'import { prueba as empresa_nombre_vacio } from "./prueba_46_empresa_nombre_vacio.js";',
            'import { prueba as empresa_cancelar } from "./prueba_47_empresa_cancelar.js";',
            'import { prueba as alta_vehiculo } from "./prueba_48_alta_vehiculo.js";',
            'import { prueba as vehiculo_patente_vacia } from "./prueba_49_vehiculo_patente_vacia.js";',
            'import { prueba as vehiculo_cancelar } from "./prueba_50_vehiculo_cancelar.js";',
            '',
            'export const SECCIONES = [',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar secciones empresas y vehiculos',
        'buscar' => [
            '    {',
            '        id: "grafo",',
            '        nombre: "Grafo",',
        ],
        'reemplazar' => [
            '    {',
            '        id: "empresas",',
            '        nombre: "Empresas",',
            '        pruebas: [',
            '            alta_empresa,',
            '            empresa_nombre_vacio,',
            '            empresa_cancelar',
            '        ]',
            '    },',
            '    {',
            '        id: "vehiculos",',
            '        nombre: "Vehículos",',
            '        pruebas: [',
            '            alta_vehiculo,',
            '            vehiculo_patente_vacia,',
            '            vehiculo_cancelar',
            '        ]',
            '    },',
            '    {',
            '        id: "grafo",',
            '        nombre: "Grafo",',
        ],
    ],

    // --------------------------------------------------------
    // _empresas_helpers.js (nuevo)
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/_empresas_helpers.js',
        'descripcion' => 'Helpers compartidos para pruebas de empresas y vehículos',
        'contenido' => [
            '/**',
            ' * Helpers compartidos por las pruebas de empresas y vehículos.',
            ' *',
            ' * Todos usan `ctx` (el service worker) y son async. Lanzan',
            ' * Error si algo falla, para que la prueba que los usa no siga',
            ' * adelante con datos inconsistentes.',
            ' *',
            ' * @version 1.5plugin.5r',
            ' */',
            '',
            '/**',
            ' * Va a la pestaña Micros, elige el primer dueño, espera a que',
            ' * aparezca el panel de empresas y a que el selector de',
            ' * empresas esté poblado. Devuelve { nombre_dueno }.',
            ' *',
            ' * @param {object} ctx',
            ' */',
            'export async function ir_a_micros_y_elegir_dueno(ctx) {',
            '    await ctx.activar_pestana_piloto("micros");',
            '',
            '    const espera_selector = await ctx.esperar("#selector_dueno_micros", 5000);',
            '    if (!espera_selector || !espera_selector.exito) {',
            '        throw new Error("No aparece #selector_dueno_micros");',
            '    }',
            '',
            '    // Esperar a que el selector tenga al menos 2 opciones',
            '    // (placeholder + un dueño real).',
            '    let opciones = [];',
            '    const inicio = Date.now();',
            '    while (Date.now() - inicio < 8000) {',
            '        opciones = await ctx.leer_opciones("#selector_dueno_micros");',
            '        if (opciones.length >= 2) break;',
            '        await ctx.pausa(300);',
            '    }',
            '    if (opciones.length < 2) {',
            '        throw new Error("No hay dueños cargados en #selector_dueno_micros");',
            '    }',
            '',
            '    const sel = await ctx.seleccionar_indice("#selector_dueno_micros", 1);',
            '    if (!sel || !sel.exito) {',
            '        throw new Error("No se pudo seleccionar un dueño: " + (sel && sel.error ? sel.error : "sin detalle"));',
            '    }',
            '',
            '    const panel = await ctx.esperar_visible("#panel_empresas_micros", 5000);',
            '    if (!panel || !panel.exito) {',
            '        throw new Error("No apareció #panel_empresas_micros tras elegir dueño");',
            '    }',
            '',
            '    // Esperar a que el selector de empresas esté poblado.',
            '    const inicio2 = Date.now();',
            '    while (Date.now() - inicio2 < 8000) {',
            '        const emps = await ctx.leer_opciones("#selector_empresa_micros");',
            '        if (emps.length >= 1) break;',
            '        await ctx.pausa(300);',
            '    }',
            '',
            '    return { nombre_dueno: sel.valor };',
            '}',
            '',
            '/**',
            ' * Abre el modal de alta de empresa y espera a que esté listo.',
            ' *',
            ' * @param {object} ctx',
            ' */',
            'export async function abrir_modal_agregar_empresa(ctx) {',
            '    await ctx.clic("#boton_agregar_empresa_micros");',
            '    const modal = await ctx.esperar_visible("#modal_generico", 3000);',
            '    if (!modal || !modal.exito) throw new Error("No se abrió el modal de alta de empresa");',
            '    const campo = await ctx.esperar("#modal_nueva_empresa_nombre", 2000);',
            '    if (!campo || !campo.exito) throw new Error("No aparece el campo #modal_nueva_empresa_nombre");',
            '}',
            '',
            '/**',
            ' * Abre el modal de alta de vehículo y espera a que esté listo.',
            ' * Asume que ya hay una empresa seleccionada.',
            ' *',
            ' * @param {object} ctx',
            ' */',
            'export async function abrir_modal_agregar_vehiculo(ctx) {',
            '    await ctx.clic("#boton_agregar_vehiculo_micros");',
            '    const modal = await ctx.esperar_visible("#modal_generico", 3000);',
            '    if (!modal || !modal.exito) throw new Error("No se abrió el modal de alta de vehículo");',
            '    const campo = await ctx.esperar("#modal_nuevo_vehiculo_nombre", 2000);',
            '    if (!campo || !campo.exito) throw new Error("No aparece el campo #modal_nuevo_vehiculo_nombre");',
            '}',
            '',
            '/**',
            ' * Crea una empresa de prueba mediante el modal. Devuelve cuando',
            ' * la empresa aparece en el selector.',
            ' *',
            ' * @param {object} ctx',
            ' * @param {string} nombre_empresa',
            ' */',
            'export async function crear_empresa_de_prueba(ctx, nombre_empresa) {',
            '    await abrir_modal_agregar_empresa(ctx);',
            '    await ctx.escribir("#modal_nueva_empresa_nombre", nombre_empresa);',
            '    await ctx.escribir("#modal_nueva_empresa_nombre_real", "Empresa de prueba");',
            '    await ctx.clic("#modal_btn_guardar_empresa");',
            '',
            '    const cerrado = await ctx.esperar_oculto("#modal_generico", 8000);',
            '    if (!cerrado || !cerrado.exito) {',
            '        throw new Error("El modal de alta de empresa no se cerró tras guardar");',
            '    }',
            '',
            '    const inicio = Date.now();',
            '    while (Date.now() - inicio < 5000) {',
            '        const opciones = await ctx.leer_opciones("#selector_empresa_micros");',
            '        if (opciones.some(o => o.valor === nombre_empresa)) return;',
            '        await ctx.pausa(300);',
            '    }',
            '    throw new Error("La empresa " + nombre_empresa + " no apareció en el selector tras crearla");',
            '}',
            '',
            '/**',
            ' * Selecciona una empresa por valor en #selector_empresa_micros y',
            ' * espera a que se muestre el panel de vehículos.',
            ' *',
            ' * @param {object} ctx',
            ' * @param {string} nombre_empresa',
            ' */',
            'export async function seleccionar_empresa_por_valor(ctx, nombre_empresa) {',
            '    const opciones = await ctx.leer_opciones("#selector_empresa_micros");',
            '    const idx = opciones.findIndex(o => o.valor === nombre_empresa);',
            '    if (idx === -1) throw new Error("Empresa " + nombre_empresa + " no está en el selector");',
            '    const sel = await ctx.seleccionar_indice("#selector_empresa_micros", idx);',
            '    if (!sel || !sel.exito) throw new Error("No se pudo seleccionar la empresa");',
            '',
            '    const panel = await ctx.esperar_visible("#panel_vehiculos_micros", 5000);',
            '    if (!panel || !panel.exito) throw new Error("No apareció el panel de vehículos");',
            '',
            '    const inicio = Date.now();',
            '    while (Date.now() - inicio < 5000) {',
            '        const vs = await ctx.leer_opciones("#selector_vehiculo_micros");',
            '        if (vs.length >= 1) return;',
            '        await ctx.pausa(300);',
            '    }',
            '    throw new Error("El selector de vehículos no se pobló");',
            '}',
            '',
            '/**',
            ' * Elimina una empresa por POST (para limpieza). Silencioso.',
            ' *',
            ' * @param {object} ctx',
            ' * @param {string} nombre_dueno',
            ' * @param {string} nombre_empresa',
            ' */',
            'export async function eliminar_empresa_por_post(ctx, nombre_dueno, nombre_empresa) {',
            '    try {',
            '        await ctx.pedir_post("index.php", {',
            '            accion: "empresas/eliminar",',
            '            nombre_dueno,',
            '            nombre_empresa',
            '        });',
            '    } catch (e) {',
            '        console.warn("No se pudo eliminar la empresa de prueba:", e);',
            '    }',
            '}',
        ],
    ],

    // --------------------------------------------------------
    // Prueba 45
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_45_alta_empresa.js',
        'descripcion' => 'Prueba 45: alta de empresa con modal',
        'contenido' => [
            '/**',
            ' * Prueba: alta de empresa con modal genérico.',
            ' *',
            ' * Verifica el flujo feliz de v1.5piloto.76c. Abre el modal',
            ' * desde #boton_agregar_empresa_micros, llena los campos,',
            ' * guarda, y verifica que la empresa aparece en el selector.',
            ' *',
            ' * @version 1.5plugin.5r',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            'import { cerrar_modales_si_abiertos } from "./_helpers.js";',
            'import {',
            '    ir_a_micros_y_elegir_dueno,',
            '    abrir_modal_agregar_empresa,',
            '    eliminar_empresa_por_post',
            '} from "./_empresas_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "alta_empresa",',
            '    nombre: "Empresas: alta con modal",',
            '    descripcion: "Verifica que el alta de empresa funciona desde el modal genérico.",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '        await cerrar_modales_si_abiertos(ctx);',
            '',
            '        const { nombre_dueno } = await ir_a_micros_y_elegir_dueno(ctx);',
            '',
            '        const opciones_antes = await ctx.leer_opciones("#selector_empresa_micros");',
            '        const cantidad_antes = opciones_antes.length;',
            '',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_empresa = "empauto" + sufijo;',
            '',
            '        await abrir_modal_agregar_empresa(ctx);',
            '        await ctx.escribir("#modal_nueva_empresa_nombre", nombre_empresa);',
            '        await ctx.escribir("#modal_nueva_empresa_nombre_real", "Empresa automática");',
            '        await ctx.clic("#modal_btn_guardar_empresa");',
            '',
            '        const cerrado = await ctx.esperar_oculto("#modal_generico", 8000);',
            '        ctx.assert(cerrado && cerrado.exito,',
            '            "El modal no se cerró tras guardar la empresa");',
            '',
            '        const opciones_despues = await ctx.leer_opciones("#selector_empresa_micros");',
            '        ctx.assert(opciones_despues.length === cantidad_antes + 1,',
            '            "Cantidad de empresas no cambió correctamente: antes "',
            '            + cantidad_antes + ", después " + opciones_despues.length);',
            '',
            '        const encontrado = opciones_despues.some(o => o.valor === nombre_empresa);',
            '        ctx.assert(encontrado,',
            '            "La empresa " + nombre_empresa + " no aparece en el selector");',
            '',
            '        await eliminar_empresa_por_post(ctx, nombre_dueno, nombre_empresa);',
            '    }',
            '};',
        ],
    ],

    // --------------------------------------------------------
    // Prueba 46
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_46_empresa_nombre_vacio.js',
        'descripcion' => 'Prueba 46: nombre de empresa vacío rechazado',
        'contenido' => [
            '/**',
            ' * Prueba: alta de empresa con nombre vacío.',
            ' *',
            ' * Verifica que la validación local del frontend impide',
            ' * guardar sin nombre: modal no se cierra, no se crea nada,',
            ' * y sale un toast de error.',
            ' *',
            ' * @version 1.5plugin.5r',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            'import { cerrar_modales_si_abiertos } from "./_helpers.js";',
            'import {',
            '    ir_a_micros_y_elegir_dueno,',
            '    abrir_modal_agregar_empresa',
            '} from "./_empresas_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "empresa_nombre_vacio",',
            '    nombre: "Empresas: nombre vacío rechazado",',
            '    descripcion: "Verifica que el alta de empresa con nombre vacío no se envía y muestra error.",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '        await cerrar_modales_si_abiertos(ctx);',
            '',
            '        await ir_a_micros_y_elegir_dueno(ctx);',
            '',
            '        const cantidad_antes = (await ctx.leer_opciones("#selector_empresa_micros")).length;',
            '',
            '        await abrir_modal_agregar_empresa(ctx);',
            '        // No escribimos nada en el nombre.',
            '        await ctx.clic("#modal_btn_guardar_empresa");',
            '        await ctx.pausa(500);',
            '',
            '        const modal_abierto = await ctx.esta_visible("#modal_generico");',
            '        ctx.assert(modal_abierto,',
            '            "El modal se cerró a pesar del nombre vacío");',
            '',
            '        const cantidad_despues = (await ctx.leer_opciones("#selector_empresa_micros")).length;',
            '        ctx.assert(cantidad_despues === cantidad_antes,',
            '            "Se creó una empresa a pesar del nombre vacío (antes "',
            '            + cantidad_antes + ", después " + cantidad_despues + ")");',
            '',
            '        const aviso = await ctx.leer_aviso();',
            '        ctx.assert(aviso && aviso.toLowerCase().indexOf("obligatorio") !== -1,',
            '            "El aviso no menciona que el nombre es obligatorio. Aviso: " + JSON.stringify(aviso));',
            '',
            '        await cerrar_modales_si_abiertos(ctx);',
            '    }',
            '};',
        ],
    ],

    // --------------------------------------------------------
    // Prueba 47
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_47_empresa_cancelar.js',
        'descripcion' => 'Prueba 47: cancelar alta de empresa',
        'contenido' => [
            '/**',
            ' * Prueba: cancelar el alta de empresa.',
            ' *',
            ' * Verifica que el botón Cancelar cierra el modal sin crear',
            ' * nada, incluso con datos cargados en los campos.',
            ' *',
            ' * @version 1.5plugin.5r',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            'import { cerrar_modales_si_abiertos } from "./_helpers.js";',
            'import {',
            '    ir_a_micros_y_elegir_dueno,',
            '    abrir_modal_agregar_empresa',
            '} from "./_empresas_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "empresa_cancelar",',
            '    nombre: "Empresas: cancelar no crea nada",',
            '    descripcion: "Verifica que el botón Cancelar cierra el modal sin crear la empresa.",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '        await cerrar_modales_si_abiertos(ctx);',
            '',
            '        await ir_a_micros_y_elegir_dueno(ctx);',
            '',
            '        const cantidad_antes = (await ctx.leer_opciones("#selector_empresa_micros")).length;',
            '',
            '        await abrir_modal_agregar_empresa(ctx);',
            '        await ctx.escribir("#modal_nueva_empresa_nombre", "empcancela" + String(Date.now()).slice(-8));',
            '        await ctx.clic("#modal_btn_cancelar_empresa");',
            '',
            '        const cerrado = await ctx.esperar_oculto("#modal_generico", 3000);',
            '        ctx.assert(cerrado && cerrado.exito,',
            '            "El modal no se cerró al apretar Cancelar");',
            '',
            '        const cantidad_despues = (await ctx.leer_opciones("#selector_empresa_micros")).length;',
            '        ctx.assert(cantidad_despues === cantidad_antes,',
            '            "Cancelar creó una empresa (antes " + cantidad_antes',
            '            + ", después " + cantidad_despues + ")");',
            '    }',
            '};',
        ],
    ],

    // --------------------------------------------------------
    // Prueba 48
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_48_alta_vehiculo.js',
        'descripcion' => 'Prueba 48: alta de vehículo con modal',
        'contenido' => [
            '/**',
            ' * Prueba: alta de vehículo con modal genérico.',
            ' *',
            ' * Verifica el flujo feliz de v1.5piloto.76c. Crea una',
            ' * empresa de setup, la selecciona, abre el modal de alta de',
            ' * vehículo, lo llena, y verifica que aparece en el selector.',
            ' *',
            ' * @version 1.5plugin.5r',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            'import { cerrar_modales_si_abiertos } from "./_helpers.js";',
            'import {',
            '    ir_a_micros_y_elegir_dueno,',
            '    crear_empresa_de_prueba,',
            '    seleccionar_empresa_por_valor,',
            '    abrir_modal_agregar_vehiculo,',
            '    eliminar_empresa_por_post',
            '} from "./_empresas_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "alta_vehiculo",',
            '    nombre: "Vehículos: alta con modal",',
            '    descripcion: "Verifica que el alta de vehículo funciona desde el modal genérico.",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '        await cerrar_modales_si_abiertos(ctx);',
            '',
            '        const { nombre_dueno } = await ir_a_micros_y_elegir_dueno(ctx);',
            '',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_empresa = "empveh" + sufijo;',
            '        await crear_empresa_de_prueba(ctx, nombre_empresa);',
            '        await seleccionar_empresa_por_valor(ctx, nombre_empresa);',
            '',
            '        const opciones_antes = await ctx.leer_opciones("#selector_vehiculo_micros");',
            '        const cantidad_antes = opciones_antes.length;',
            '',
            '        const nombre_vehiculo = "patauto" + sufijo;',
            '        await abrir_modal_agregar_vehiculo(ctx);',
            '        await ctx.escribir("#modal_nuevo_vehiculo_nombre", nombre_vehiculo);',
            '        await ctx.escribir("#modal_nuevo_vehiculo_nombre_real", "Vehículo automático");',
            '        await ctx.clic("#modal_btn_guardar_vehiculo");',
            '',
            '        const cerrado = await ctx.esperar_oculto("#modal_generico", 8000);',
            '        ctx.assert(cerrado && cerrado.exito,',
            '            "El modal no se cerró tras guardar el vehículo");',
            '',
            '        const opciones_despues = await ctx.leer_opciones("#selector_vehiculo_micros");',
            '        ctx.assert(opciones_despues.length === cantidad_antes + 1,',
            '            "Cantidad de vehículos no cambió: antes " + cantidad_antes',
            '            + ", después " + opciones_despues.length);',
            '',
            '        const encontrado = opciones_despues.some(o => o.valor === nombre_vehiculo);',
            '        ctx.assert(encontrado,',
            '            "El vehículo " + nombre_vehiculo + " no aparece en el selector");',
            '',
            '        // Limpieza: eliminar la empresa arrastra el vehículo.',
            '        await eliminar_empresa_por_post(ctx, nombre_dueno, nombre_empresa);',
            '    }',
            '};',
        ],
    ],

    // --------------------------------------------------------
    // Prueba 49
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_49_vehiculo_patente_vacia.js',
        'descripcion' => 'Prueba 49: patente de vehículo vacía rechazada',
        'contenido' => [
            '/**',
            ' * Prueba: alta de vehículo con patente vacía.',
            ' *',
            ' * Verifica que la validación local del frontend impide',
            ' * guardar sin patente: modal no se cierra, no se crea nada,',
            ' * y sale un toast de error.',
            ' *',
            ' * @version 1.5plugin.5r',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            'import { cerrar_modales_si_abiertos } from "./_helpers.js";',
            'import {',
            '    ir_a_micros_y_elegir_dueno,',
            '    crear_empresa_de_prueba,',
            '    seleccionar_empresa_por_valor,',
            '    abrir_modal_agregar_vehiculo,',
            '    eliminar_empresa_por_post',
            '} from "./_empresas_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "vehiculo_patente_vacia",',
            '    nombre: "Vehículos: patente vacía rechazada",',
            '    descripcion: "Verifica que el alta de vehículo con patente vacía no se envía y muestra error.",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '        await cerrar_modales_si_abiertos(ctx);',
            '',
            '        const { nombre_dueno } = await ir_a_micros_y_elegir_dueno(ctx);',
            '',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_empresa = "empvehva" + sufijo;',
            '        await crear_empresa_de_prueba(ctx, nombre_empresa);',
            '        await seleccionar_empresa_por_valor(ctx, nombre_empresa);',
            '',
            '        const cantidad_antes = (await ctx.leer_opciones("#selector_vehiculo_micros")).length;',
            '',
            '        await abrir_modal_agregar_vehiculo(ctx);',
            '        await ctx.clic("#modal_btn_guardar_vehiculo");',
            '        await ctx.pausa(500);',
            '',
            '        const modal_abierto = await ctx.esta_visible("#modal_generico");',
            '        ctx.assert(modal_abierto,',
            '            "El modal se cerró a pesar de la patente vacía");',
            '',
            '        const cantidad_despues = (await ctx.leer_opciones("#selector_vehiculo_micros")).length;',
            '        ctx.assert(cantidad_despues === cantidad_antes,',
            '            "Se creó un vehículo a pesar de la patente vacía");',
            '',
            '        const aviso = await ctx.leer_aviso();',
            '        ctx.assert(aviso && aviso.toLowerCase().indexOf("patente") !== -1,',
            '            "El aviso no menciona la patente. Aviso: " + JSON.stringify(aviso));',
            '',
            '        await cerrar_modales_si_abiertos(ctx);',
            '',
            '        await eliminar_empresa_por_post(ctx, nombre_dueno, nombre_empresa);',
            '    }',
            '};',
        ],
    ],

    // --------------------------------------------------------
    // Prueba 50
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_50_vehiculo_cancelar.js',
        'descripcion' => 'Prueba 50: cancelar alta de vehículo',
        'contenido' => [
            '/**',
            ' * Prueba: cancelar el alta de vehículo.',
            ' *',
            ' * Verifica que el botón Cancelar del modal de vehículo no',
            ' * crea nada.',
            ' *',
            ' * @version 1.5plugin.5r',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            'import { cerrar_modales_si_abiertos } from "./_helpers.js";',
            'import {',
            '    ir_a_micros_y_elegir_dueno,',
            '    crear_empresa_de_prueba,',
            '    seleccionar_empresa_por_valor,',
            '    abrir_modal_agregar_vehiculo,',
            '    eliminar_empresa_por_post',
            '} from "./_empresas_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "vehiculo_cancelar",',
            '    nombre: "Vehículos: cancelar no crea nada",',
            '    descripcion: "Verifica que el botón Cancelar del modal de vehículo no crea nada.",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '        await cerrar_modales_si_abiertos(ctx);',
            '',
            '        const { nombre_dueno } = await ir_a_micros_y_elegir_dueno(ctx);',
            '',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_empresa = "empvehcan" + sufijo;',
            '        await crear_empresa_de_prueba(ctx, nombre_empresa);',
            '        await seleccionar_empresa_por_valor(ctx, nombre_empresa);',
            '',
            '        const cantidad_antes = (await ctx.leer_opciones("#selector_vehiculo_micros")).length;',
            '',
            '        await abrir_modal_agregar_vehiculo(ctx);',
            '        await ctx.escribir("#modal_nuevo_vehiculo_nombre", "patcancela" + sufijo);',
            '        await ctx.clic("#modal_btn_cancelar_vehiculo");',
            '',
            '        const cerrado = await ctx.esperar_oculto("#modal_generico", 3000);',
            '        ctx.assert(cerrado && cerrado.exito,',
            '            "El modal no se cerró al apretar Cancelar");',
            '',
            '        const cantidad_despues = (await ctx.leer_opciones("#selector_vehiculo_micros")).length;',
            '        ctx.assert(cantidad_despues === cantidad_antes,',
            '            "Cancelar creó un vehículo (antes " + cantidad_antes',
            '            + ", después " + cantidad_despues + ")");',
            '',
            '        await eliminar_empresa_por_post(ctx, nombre_dueno, nombre_empresa);',
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
        'descripcion' => 'Prompt plugin: estado a 5r con 50 pruebas',
        'buscar' => [
            '**Proyecto en v1.5plugin.5q.** El esqueleto del plugin está',
            'armado y funcional, tiene 44 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + grafo) y las agrupa',
            'en secciones.',
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.5r.** El esqueleto del plugin está',
            'armado y funcional, tiene 50 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + empresas',
            '+ vehículos + grafo) y las agrupa en secciones.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: agregar secciones empresas y vehiculos a la lista',
        'buscar' => [
            '- `base`: `arranque`, `login`, `cerrar_sesion_cierra_modales`.',
        ],
        'reemplazar' => [
            '- `base`: `arranque`, `login`, `cerrar_sesion_cierra_modales`.',
            '- `empresas`: 3 pruebas. `alta_empresa` (flujo feliz del modal',
            '  de v1.5piloto.76c), `empresa_nombre_vacio` (validación local',
            '  rechaza guardar sin nombre), `empresa_cancelar` (Cancelar',
            '  cierra sin crear nada).',
            '- `vehiculos`: 3 pruebas. `alta_vehiculo` (flujo feliz),',
            '  `vehiculo_patente_vacia` (validación local),',
            '  `vehiculo_cancelar`. Crea una empresa de setup para cada',
            '  prueba y la elimina al final (arrastra el vehículo).',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: última actualización a 5r',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.5q',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.5r',
            '(pruebas espejo de v1.5piloto.76c: sección "empresas" con 3',
            'pruebas (alta, nombre vacío, cancelar) y sección "vehículos"',
            'con 3 pruebas (alta, patente vacía, cancelar). Nuevo archivo',
            'de helpers `_empresas_helpers.js`. La sección "base" sigue',
            'con 3 pruebas, "grafo" con 14, y se suman las dos nuevas',
            'secciones.).',
            'Antes: v1.5plugin.5q',
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