<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda v1.5plugin.4 — pruebas de venta.
 *
 * Contenido:
 * - ConfPlugin.js: NOMBRE_DUENO_PRUEBA + bump de version.
 * - contenido.js: mensajes obtener_valor, obtener_atributos, leer_toast.
 * - servicio.js: ctx ampliado (valor, obtener_atributos, leer_aviso,
 *   pausa).
 * - _helpers.js: helpers compartidos de las pruebas de venta.
 * - prueba_03..17: 15 pruebas de venta y casos borde.
 * - catalogo.js: incluye las pruebas nuevas.
 * - Prompt del plugin: v1.5plugin.4.
 *
 * NO se toca manifest.json (regla del proyecto).
 *
 * Uso (parado en iteradoresJS/):
 *   php aplicar_cambios.php
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

    // ============================================================
    // Aplicacion/ConfPlugin.js — reescritura
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js con NOMBRE_DUENO_PRUEBA',
        'contenido' => [
            '/**',
            ' * Configuracion propia del plugin de pruebas.',
            ' *',
            ' * Modifica los valores estaticos de la clase `Conf` compartida',
            ' * por el framework. Se llama desde `arranque.js` *antes* de',
            ' * importar el Controlador, para que la persistencia tome el',
            ' * nombre de la BD correcto.',
            ' *',
            ' * @version 1.5plugin.4',
            ' */',
            '',
            'export function configurar_conf(Conf) {',
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.4";',
            '    Conf.NOMBRE_BD_INDEXEDDB = "IteradoresPluginPruebas";',
            '    Conf.SUPERESTRUCTURA_NOMBRE_BD_INDEXEDDB = "IteradoresPluginPruebas";',
            '    Conf.SUPERESTRUCTURA_METODO_PERDURAR = "IndexedDB";',
            '}',
            '',
            'export const NOMBRE_GRAFO = "plugin_pruebas";',
            'export const VERSION_PLUGIN = "1.5plugin.4";',
            '',
            '// URL del piloto PHP. Debe estar cubierta por host_permissions',
            '// y content_scripts.matches en manifest.json.',
            'export const URL_PILOTO = "http://localhost/iteradores/codigo.worktrees/v1.5i/";',
            '',
            '// Codigos de acceso de los usuarios del piloto, para las pruebas.',
            'export const CODIGO_ADMIN     = "IDB";',
            'export const CODIGO_DUENO     = "carmen1";',
            'export const CODIGO_TERMINAL1 = "carmen2";',
            'export const CODIGO_TERMINAL2 = "lujan2";',
            'export const CODIGO_SOPORTE   = "manolo3";',
            '',
            '// Nombre de usuario del dueno de las terminales de prueba.',
            '// Se usa para crear pasajeros de prueba antes de las ventas.',
            '// Si el nombre de usuario del dueno es distinto del codigo,',
            '// cambiá este valor.',
            'export const NOMBRE_DUENO_PRUEBA = "carmen1";',
        ],
    ],

    // ============================================================
    // Aplicacion/contenido.js — agregar mensajes nuevos
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'contenido.js: bump de version a 1.5plugin.4',
        'buscar' => [
            ' * @version 1.5plugin.3f',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'contenido.js: nuevos casos obtener_valor, obtener_atributos, leer_toast',
        'buscar' => [
            '            case "obtener_texto": {',
            '                const el = _query(datos.selector);',
            '                if (!el) return { exito: false, error: "No existe: " + datos.selector };',
            '                return { exito: true, valor: el.textContent || "" };',
            '            }',
            '',
            '            case "obtener_html": {',
        ],
        'reemplazar' => [
            '            case "obtener_texto": {',
            '                const el = _query(datos.selector);',
            '                if (!el) return { exito: false, error: "No existe: " + datos.selector };',
            '                return { exito: true, valor: el.textContent || "" };',
            '            }',
            '',
            '            case "obtener_valor": {',
            '                const el = _query(datos.selector);',
            '                if (!el) return { exito: false, error: "No existe: " + datos.selector };',
            '                return { exito: true, valor: el.value !== undefined ? String(el.value) : (el.textContent || "") };',
            '            }',
            '',
            '            case "obtener_atributos": {',
            '                const elementos = document.querySelectorAll(datos.selector);',
            '                const valores = [];',
            '                elementos.forEach(el => valores.push(el.getAttribute(datos.atributo) || ""));',
            '                return { exito: true, valores };',
            '            }',
            '',
            '            case "leer_toast": {',
            '                const el = document.getElementById("toast");',
            '                return {',
            '                    exito: true,',
            '                    texto: el ? (el.textContent || "") : "",',
            '                    visible: el ? el.classList.contains("show") : false',
            '                };',
            '            }',
            '',
            '            case "obtener_html": {',
        ],
    ],

    // ============================================================
    // Aplicacion/servicio.js — ampliar ctx
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: bump de version a 1.5plugin.4',
        'buscar' => [
            ' * @version 1.5plugin.3f',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: ctx ampliado con valor, atributos, toast, pausa',
        'buscar' => [
            '        texto: async (sel) => {',
            '            const r = await enviar("obtener_texto", { selector: sel });',
            '            return r && r.exito ? r.valor : null;',
            '        },',
            '        html: async (sel) => {',
            '            const r = await enviar("obtener_html", { selector: sel });',
            '            return r && r.exito ? r.valor : null;',
            '        },',
        ],
        'reemplazar' => [
            '        texto: async (sel) => {',
            '            const r = await enviar("obtener_texto", { selector: sel });',
            '            return r && r.exito ? r.valor : null;',
            '        },',
            '        valor: async (sel) => {',
            '            const r = await enviar("obtener_valor", { selector: sel });',
            '            return r && r.exito ? r.valor : null;',
            '        },',
            '        obtener_atributos: async (sel, attr) => {',
            '            const r = await enviar("obtener_atributos", { selector: sel, atributo: attr });',
            '            return r && r.exito ? r.valores : [];',
            '        },',
            '        leer_aviso: async () => {',
            '            const r = await enviar("leer_toast", {});',
            '            return r && r.exito ? r.texto : "";',
            '        },',
            '        pausa: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),',
            '        html: async (sel) => {',
            '            const r = await enviar("obtener_html", { selector: sel });',
            '            return r && r.exito ? r.valor : null;',
            '        },',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/_helpers.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => 'Helpers compartidos de las pruebas de venta',
        'contenido' => [
            '/**',
            ' * Helpers compartidos por las pruebas de venta.',
            ' *',
            ' * Todas las funciones reciben el `ctx` del service worker.',
            ' *',
            ' * @version 1.5plugin.4',
            ' */',
            '',
            'import { CODIGO_TERMINAL1, NOMBRE_DUENO_PRUEBA } from "../ConfPlugin.js";',
            '',
            '// ============================================================',
            '// Generadores de datos unicos',
            '// ============================================================',
            '',
            'let _contador_dni = 0;',
            '',
            'export function dni_unico() {',
            '    _contador_dni++;',
            '    const ts = String(Date.now()).slice(-3);',
            '    const cnt = String(_contador_dni % 100000).padStart(5, "0");',
            '    return ts + cnt;',
            '}',
            '',
            'export function datos_comprador_aleatorio() {',
            '    const dni = dni_unico();',
            '    return {',
            '        dni,',
            '        apellido: "Prueba",',
            '        nombres: "Auto",',
            '        email: "auto_" + dni + "@test.local",',
            '        celular: "2983555" + String(dni).slice(-3)',
            '    };',
            '}',
            '',
            'export function datos_pasajero_aleatorio(index = 0) {',
            '    const dni = dni_unico();',
            '    return {',
            '        dni,',
            '        apellido: "Pasajero" + index,',
            '        nombres: "Auto",',
            '        email: "pas_" + dni + "@test.local",',
            '        celular: "2983555" + String(dni).slice(-3),',
            '        celular_emergencia: "2983111" + String(dni).slice(-3),',
            '        fecha_nacimiento: "1990-01-15",',
            '        direccion: "Calle Prueba 123",',
            '        localidad: "Tres Arroyos"',
            '    };',
            '}',
            '',
            '// ============================================================',
            '// Navegacion',
            '// ============================================================',
            '',
            'export async function login_terminal(ctx) {',
            '    await ctx.asegurar_login(CODIGO_TERMINAL1);',
            '}',
            '',
            'export async function ir_a_tab(ctx, id_tab) {',
            '    const selector = `.tab[data-tab="${id_tab}"]`;',
            '    const existe = await ctx.esperar(selector, 3000);',
            '    if (!existe || !existe.exito) throw new Error("No existe el tab " + id_tab);',
            '    await ctx.clic(selector);',
            '    const seccion = await ctx.esperar_visible("#" + id_tab, 5000);',
            '    if (!seccion || !seccion.exito) throw new Error("El tab " + id_tab + " no quedo visible");',
            '    await ctx.pausa(300);',
            '}',
            '',
            'export async function ir_a_viajes_y_abrir_primero(ctx) {',
            '    await ir_a_tab(ctx, "viajes");',
            '    const hay = await ctx.esperar(".btn-detalle-viaje", 8000);',
            '    if (!hay || !hay.exito) throw new Error("No hay viajes disponibles");',
            '',
            '    await ctx.clic(".btn-detalle-viaje");',
            '    const modal = await ctx.esperar_visible("#modal_generico", 8000);',
            '    if (!modal || !modal.exito) throw new Error("No se abrio el modal del viaje");',
            '    const micros = await ctx.esperar(".btn-ver-pasaje", 8000);',
            '    if (!micros || !micros.exito) throw new Error("El viaje no tiene micros");',
            '}',
            '',
            'export async function abrir_primer_micro_con_libres(ctx) {',
            '    const nombres = await ctx.obtener_atributos(".btn-ver-pasaje", "data-micro");',
            '    if (nombres.length === 0) throw new Error("No hay micros en el viaje");',
            '',
            '    for (const nombre of nombres) {',
            '        await ctx.clic(`.btn-ver-pasaje[data-micro="${nombre}"]`);',
            '        const asientos = await ctx.esperar("#croquis_pasaje_micro .seat", 8000);',
            '        if (!asientos || !asientos.exito) continue;',
            '',
            '        const libres = await ctx.obtener_atributos(".seat.seat-libre", "data-numero");',
            '        if (libres.length > 0) {',
            '            return { micro: nombre, libres };',
            '        }',
            '    }',
            '    throw new Error("Ningun micro del viaje tiene asientos libres");',
            '}',
            '',
            'export async function seleccionar_n_asientos(ctx, n) {',
            '    const libres = await ctx.obtener_atributos(".seat.seat-libre", "data-numero");',
            '    if (libres.length < n) {',
            '        throw new Error("Solo hay " + libres.length + " asientos libres, se necesitan " + n);',
            '    }',
            '    const elegidos = libres.slice(0, n);',
            '    for (const numero of elegidos) {',
            '        await ctx.clic(`.seat[data-numero="${numero}"]`);',
            '        await ctx.pausa(300);',
            '    }',
            '    const boton = await ctx.esperar_visible("#contenedor_boton_confirmar_venta", 5000);',
            '    if (!boton || !boton.exito) throw new Error("No aparecio el boton Vender");',
            '    return elegidos;',
            '}',
            '',
            'export async function abrir_modal_confirmacion(ctx) {',
            '    await ctx.clic("#boton_confirmar_venta");',
            '    const form = await ctx.esperar_visible("#formulario_confirmacion_venta", 8000);',
            '    if (!form || !form.exito) throw new Error("No se abrio el formulario de confirmacion");',
            '}',
            '',
            '// ============================================================',
            '// Llenado de formularios',
            '// ============================================================',
            '',
            'export async function llenar_comprador(ctx, datos) {',
            '    if (datos.dni !== undefined) {',
            '        await ctx.escribir("#comprador_dni", datos.dni);',
            '        await ctx.pausa(600);',
            '    }',
            '    if (datos.apellido !== undefined) await ctx.escribir("#comprador_apellido", datos.apellido);',
            '    if (datos.nombres !== undefined) await ctx.escribir("#comprador_nombres", datos.nombres);',
            '    if (datos.email !== undefined) await ctx.escribir("#comprador_email", datos.email);',
            '    if (datos.celular !== undefined) await ctx.escribir("#comprador_celular", datos.celular);',
            '}',
            '',
            'export async function llenar_pasajero(ctx, index, datos) {',
            '    if (datos.dni !== undefined) {',
            '        await ctx.escribir(`#pasajero_dni_${index}`, datos.dni);',
            '        await ctx.pausa(600);',
            '    }',
            '    if (datos.apellido !== undefined) await ctx.escribir(`#pasajero_apellido_${index}`, datos.apellido);',
            '    if (datos.nombres !== undefined) await ctx.escribir(`#pasajero_nombres_${index}`, datos.nombres);',
            '    if (datos.email !== undefined) await ctx.escribir(`#pasajero_email_${index}`, datos.email);',
            '    if (datos.celular !== undefined) await ctx.escribir(`#pasajero_celular_${index}`, datos.celular);',
            '    if (datos.celular_emergencia !== undefined) await ctx.escribir(`#pasajero_emergencia_${index}`, datos.celular_emergencia);',
            '    if (datos.fecha_nacimiento !== undefined) await ctx.escribir(`#pasajero_fecha_nacimiento_${index}`, datos.fecha_nacimiento);',
            '    if (datos.direccion !== undefined) await ctx.escribir(`#pasajero_direccion_${index}`, datos.direccion);',
            '    if (datos.localidad !== undefined) await ctx.escribir(`#pasajero_localidad_${index}`, datos.localidad);',
            '}',
            '',
            '// ============================================================',
            '// Metodos y montos',
            '// ============================================================',
            '',
            'export async function setear_metodo_y_cuotas(ctx, metodo, cuotas) {',
            '    await ctx.escribir("#metodo_pago", metodo);',
            '    await ctx.pausa(400);',
            '    if (cuotas !== undefined) {',
            '        await ctx.escribir("#cuotas_venta", String(cuotas));',
            '        await ctx.pausa(400);',
            '    }',
            '}',
            '',
            'export async function setear_monto_pagado(ctx, monto) {',
            '    await ctx.escribir("#monto_pagado", String(monto));',
            '}',
            '',
            'export async function confirmar_venta(ctx) {',
            '    await ctx.clic("#confirmar_venta");',
            '    const ok = await ctx.esperar_visible("#opciones_impresion", 8000);',
            '    if (!ok || !ok.exito) {',
            '        const aviso = await ctx.leer_aviso();',
            '        throw new Error("No se confirmo la venta. Aviso: " + (aviso || "(sin aviso)"));',
            '    }',
            '}',
            '',
            '// ============================================================',
            '// Cierre y cancelacion',
            '// ============================================================',
            '',
            'export async function obtener_id_ultima_venta(ctx) {',
            '    const visible = await ctx.esta_visible("#opciones_impresion");',
            '    if (visible) {',
            '        await ctx.clic("#btn_cerrar_opciones");',
            '        await ctx.pausa(300);',
            '    }',
            '    await ir_a_tab(ctx, "vendidos");',
            '    const hay = await ctx.esperar(".sale-card", 8000);',
            '    if (!hay || !hay.exito) throw new Error("No hay ventas en la pestana Vendidos");',
            '    const ids = await ctx.obtener_atributos(".sale-card", "data-id-venta");',
            '    if (ids.length === 0) throw new Error("No se pudo leer el id de la venta");',
            '    return ids[0];',
            '}',
            '',
            'export async function cancelar_venta(ctx, id_venta, motivo = "Cancelada por prueba automatica") {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "ventas/cancelar",',
            '        id_venta,',
            '        motivo',
            '    });',
            '    if (!r || !r.exito) {',
            '        throw new Error("Error de red al cancelar: " + (r && r.error ? r.error : "(sin detalle)"));',
            '    }',
            '    if (!r.json || !r.json.exito) {',
            '        throw new Error("No se pudo cancelar: " + (r.json && r.json.error ? r.json.error : "(sin detalle)"));',
            '    }',
            '    return r.json;',
            '}',
            '',
            'export async function crear_pasajero_de_prueba(ctx, dni, datos = {}) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "pasajeros/crear",',
            '        nombre_dueno: NOMBRE_DUENO_PRUEBA,',
            '        dni,',
            '        apellido: datos.apellido || "Correccion",',
            '        nombres: datos.nombres || "Auto",',
            '        email: datos.email || "",',
            '        celular: datos.celular || "2983555123",',
            '        celular_emergencia: datos.celular_emergencia || "2983555222",',
            '        fecha_nacimiento: datos.fecha_nacimiento || "1990-06-15",',
            '        direccion: datos.direccion || "Calle Correccion 1",',
            '        localidad: datos.localidad || "Tres Arroyos"',
            '    });',
            '    if (!r || !r.exito) throw new Error("Error de red al crear pasajero: " + (r && r.error ? r.error : ""));',
            '    if (!r.json || !r.json.exito) {',
            '        const msg = r.json && r.json.error ? r.json.error : "";',
            '        if (!/ya existe/i.test(msg)) {',
            '            throw new Error("No se pudo crear el pasajero: " + msg);',
            '        }',
            '    }',
            '    return r.json;',
            '}',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/prueba_03_venta_basica.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_03_venta_basica.js',
        'descripcion' => 'Prueba venta_basica',
        'contenido' => [
            '/**',
            ' * Venta basica: 1 asiento, efectivo, 1 cuota, pago total.',
            ' * @version 1.5plugin.4',
            ' */',
            'import {',
            '    login_terminal, ir_a_viajes_y_abrir_primero,',
            '    abrir_primer_micro_con_libres, seleccionar_n_asientos,',
            '    abrir_modal_confirmacion, llenar_comprador, llenar_pasajero,',
            '    setear_metodo_y_cuotas, confirmar_venta,',
            '    obtener_id_ultima_venta, cancelar_venta,',
            '    datos_comprador_aleatorio, datos_pasajero_aleatorio',
            '} from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "venta_basica",',
            '    nombre: "Venta: basica (1 asiento, efectivo, pago total)",',
            '    descripcion: "Vende 1 asiento con 1 pasajero en efectivo al contado, verifica el flujo y cancela.",',
            '',
            '    async ejecutar(ctx) {',
            '        await login_terminal(ctx);',
            '        await ir_a_viajes_y_abrir_primero(ctx);',
            '        await abrir_primer_micro_con_libres(ctx);',
            '        await seleccionar_n_asientos(ctx, 1);',
            '        await abrir_modal_confirmacion(ctx);',
            '',
            '        await llenar_comprador(ctx, datos_comprador_aleatorio());',
            '        await llenar_pasajero(ctx, 0, datos_pasajero_aleatorio(0));',
            '',
            '        await setear_metodo_y_cuotas(ctx, "efectivo", 1);',
            '        await confirmar_venta(ctx);',
            '',
            '        const id_venta = await obtener_id_ultima_venta(ctx);',
            '        ctx.assert(id_venta, "No se obtuvo el id de la venta");',
            '        await cancelar_venta(ctx, id_venta);',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/prueba_04_venta_cuotas.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_04_venta_cuotas.js',
        'descripcion' => 'Prueba venta_cuotas',
        'contenido' => [
            '/**',
            ' * Venta en cuotas: 1 asiento, efectivo, 2 cuotas, pago parcial.',
            ' * @version 1.5plugin.4',
            ' */',
            'import {',
            '    login_terminal, ir_a_viajes_y_abrir_primero,',
            '    abrir_primer_micro_con_libres, seleccionar_n_asientos,',
            '    abrir_modal_confirmacion, llenar_comprador, llenar_pasajero,',
            '    setear_metodo_y_cuotas, setear_monto_pagado, confirmar_venta,',
            '    obtener_id_ultima_venta, cancelar_venta,',
            '    datos_comprador_aleatorio, datos_pasajero_aleatorio',
            '} from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "venta_cuotas",',
            '    nombre: "Venta: en cuotas (2 cuotas, pago parcial)",',
            '    descripcion: "Vende 1 asiento en efectivo a 2 cuotas con pago parcial. La venta queda con cupon pendiente.",',
            '',
            '    async ejecutar(ctx) {',
            '        await login_terminal(ctx);',
            '        await ir_a_viajes_y_abrir_primero(ctx);',
            '        await abrir_primer_micro_con_libres(ctx);',
            '        await seleccionar_n_asientos(ctx, 1);',
            '        await abrir_modal_confirmacion(ctx);',
            '',
            '        await llenar_comprador(ctx, datos_comprador_aleatorio());',
            '        await llenar_pasajero(ctx, 0, datos_pasajero_aleatorio(0));',
            '',
            '        await setear_metodo_y_cuotas(ctx, "efectivo", 2);',
            '        // El input ya tiene el valor por defecto (total/2). Lo dejamos.',
            '        await confirmar_venta(ctx);',
            '',
            '        const id_venta = await obtener_id_ultima_venta(ctx);',
            '        ctx.assert(id_venta, "No se obtuvo el id de la venta");',
            '',
            '        // Verificar que la tarjeta muestra cuotas pendientes',
            '        const texto = await ctx.texto(`.sale-card[data-id-venta="${id_venta}"]`);',
            '        ctx.assert(texto && (texto.includes("pendiente") || texto.includes("Cuotas")),',
            '            "La tarjeta no muestra info de cuotas: " + JSON.stringify(texto ? texto.substring(0, 200) : null));',
            '',
            '        await cancelar_venta(ctx, id_venta);',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/prueba_05_venta_transferencia.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_05_venta_transferencia.js',
        'descripcion' => 'Prueba venta_transferencia',
        'contenido' => [
            '/**',
            ' * Venta por transferencia.',
            ' * @version 1.5plugin.4',
            ' */',
            'import {',
            '    login_terminal, ir_a_viajes_y_abrir_primero,',
            '    abrir_primer_micro_con_libres, seleccionar_n_asientos,',
            '    abrir_modal_confirmacion, llenar_comprador, llenar_pasajero,',
            '    setear_metodo_y_cuotas, confirmar_venta,',
            '    obtener_id_ultima_venta, cancelar_venta,',
            '    datos_comprador_aleatorio, datos_pasajero_aleatorio',
            '} from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "venta_transferencia",',
            '    nombre: "Venta: por transferencia",',
            '    descripcion: "Vende 1 asiento por transferencia al contado.",',
            '',
            '    async ejecutar(ctx) {',
            '        await login_terminal(ctx);',
            '        await ir_a_viajes_y_abrir_primero(ctx);',
            '        await abrir_primer_micro_con_libres(ctx);',
            '        await seleccionar_n_asientos(ctx, 1);',
            '        await abrir_modal_confirmacion(ctx);',
            '',
            '        await llenar_comprador(ctx, datos_comprador_aleatorio());',
            '        await llenar_pasajero(ctx, 0, datos_pasajero_aleatorio(0));',
            '',
            '        await setear_metodo_y_cuotas(ctx, "transferencia", 1);',
            '        await confirmar_venta(ctx);',
            '',
            '        const id_venta = await obtener_id_ultima_venta(ctx);',
            '        ctx.assert(id_venta, "No se obtuvo el id de la venta");',
            '        await cancelar_venta(ctx, id_venta);',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/prueba_06_venta_dos_asientos.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_06_venta_dos_asientos.js',
        'descripcion' => 'Prueba venta_dos_asientos',
        'contenido' => [
            '/**',
            ' * Venta de 2 asientos con 2 pasajeros distintos.',
            ' * @version 1.5plugin.4',
            ' */',
            'import {',
            '    login_terminal, ir_a_viajes_y_abrir_primero,',
            '    abrir_primer_micro_con_libres, seleccionar_n_asientos,',
            '    abrir_modal_confirmacion, llenar_comprador, llenar_pasajero,',
            '    setear_metodo_y_cuotas, confirmar_venta,',
            '    obtener_id_ultima_venta, cancelar_venta,',
            '    datos_comprador_aleatorio, datos_pasajero_aleatorio',
            '} from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "venta_dos_asientos",',
            '    nombre: "Venta: 2 asientos, 2 pasajeros distintos",',
            '    descripcion: "Vende 2 asientos con 2 pasajeros con DNIs distintos.",',
            '',
            '    async ejecutar(ctx) {',
            '        await login_terminal(ctx);',
            '        await ir_a_viajes_y_abrir_primero(ctx);',
            '        await abrir_primer_micro_con_libres(ctx);',
            '        await seleccionar_n_asientos(ctx, 2);',
            '        await abrir_modal_confirmacion(ctx);',
            '',
            '        await llenar_comprador(ctx, datos_comprador_aleatorio());',
            '        await llenar_pasajero(ctx, 0, datos_pasajero_aleatorio(0));',
            '        await llenar_pasajero(ctx, 1, datos_pasajero_aleatorio(1));',
            '',
            '        await setear_metodo_y_cuotas(ctx, "efectivo", 1);',
            '        await confirmar_venta(ctx);',
            '',
            '        const id_venta = await obtener_id_ultima_venta(ctx);',
            '        ctx.assert(id_venta, "No se obtuvo el id de la venta");',
            '        await cancelar_venta(ctx, id_venta);',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/prueba_07_venta_tres_asientos.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_07_venta_tres_asientos.js',
        'descripcion' => 'Prueba venta_tres_asientos',
        'contenido' => [
            '/**',
            ' * Venta de 3 asientos con 3 pasajeros distintos.',
            ' * @version 1.5plugin.4',
            ' */',
            'import {',
            '    login_terminal, ir_a_viajes_y_abrir_primero,',
            '    abrir_primer_micro_con_libres, seleccionar_n_asientos,',
            '    abrir_modal_confirmacion, llenar_comprador, llenar_pasajero,',
            '    setear_metodo_y_cuotas, confirmar_venta,',
            '    obtener_id_ultima_venta, cancelar_venta,',
            '    datos_comprador_aleatorio, datos_pasajero_aleatorio',
            '} from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "venta_tres_asientos",',
            '    nombre: "Venta: 3 asientos, 3 pasajeros distintos",',
            '    descripcion: "Vende 3 asientos con 3 pasajeros con DNIs distintos.",',
            '',
            '    async ejecutar(ctx) {',
            '        await login_terminal(ctx);',
            '        await ir_a_viajes_y_abrir_primero(ctx);',
            '        await abrir_primer_micro_con_libres(ctx);',
            '        await seleccionar_n_asientos(ctx, 3);',
            '        await abrir_modal_confirmacion(ctx);',
            '',
            '        await llenar_comprador(ctx, datos_comprador_aleatorio());',
            '        await llenar_pasajero(ctx, 0, datos_pasajero_aleatorio(0));',
            '        await llenar_pasajero(ctx, 1, datos_pasajero_aleatorio(1));',
            '        await llenar_pasajero(ctx, 2, datos_pasajero_aleatorio(2));',
            '',
            '        await setear_metodo_y_cuotas(ctx, "efectivo", 1);',
            '        await confirmar_venta(ctx);',
            '',
            '        const id_venta = await obtener_id_ultima_venta(ctx);',
            '        ctx.assert(id_venta, "No se obtuvo el id de la venta");',
            '        await cancelar_venta(ctx, id_venta);',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/prueba_08_venta_ligadura_dni_igual.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_08_venta_ligadura_dni_igual.js',
        'descripcion' => 'Prueba venta_ligadura_dni_igual',
        'contenido' => [
            '/**',
            ' * Ligadura comprador-pasajero: mismo DNI.',
            ' * El comprador tiene datos; al poner el mismo DNI en el pasajero,',
            ' * los campos comunes deben copiarse. Caso reportado del bug 2.',
            ' * @version 1.5plugin.4',
            ' */',
            'import {',
            '    login_terminal, ir_a_viajes_y_abrir_primero,',
            '    abrir_primer_micro_con_libres, seleccionar_n_asientos,',
            '    abrir_modal_confirmacion, llenar_comprador, dni_unico',
            '} from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "venta_ligadura_dni_igual",',
            '    nombre: "Venta: ligadura comprador-pasajero con mismo DNI",',
            '    descripcion: "Carga el comprador con datos, despues pone el mismo DNI en el pasajero. Los campos comunes deben copiarse.",',
            '',
            '    async ejecutar(ctx) {',
            '        await login_terminal(ctx);',
            '        await ir_a_viajes_y_abrir_primero(ctx);',
            '        await abrir_primer_micro_con_libres(ctx);',
            '        await seleccionar_n_asientos(ctx, 1);',
            '        await abrir_modal_confirmacion(ctx);',
            '',
            '        const dni_compartido = dni_unico();',
            '        await llenar_comprador(ctx, {',
            '            dni: dni_compartido,',
            '            apellido: "Garcia",',
            '            nombres: "Maria",',
            '            email: "maria@test.local",',
            '            celular: "2983555111"',
            '        });',
            '',
            '        // Ahora el pasajero con el mismo DNI',
            '        await ctx.escribir("#pasajero_dni_0", dni_compartido);',
            '        await ctx.pausa(800);',
            '',
            '        const apellido_pas = await ctx.valor("#pasajero_apellido_0");',
            '        const nombres_pas = await ctx.valor("#pasajero_nombres_0");',
            '        const email_pas = await ctx.valor("#pasajero_email_0");',
            '        const celular_pas = await ctx.valor("#pasajero_celular_0");',
            '',
            '        ctx.assert(apellido_pas === "Garcia", "Apellido no se copio: " + JSON.stringify(apellido_pas));',
            '        ctx.assert(nombres_pas === "Maria", "Nombres no se copiaron: " + JSON.stringify(nombres_pas));',
            '        ctx.assert(email_pas === "maria@test.local", "Email no se copio: " + JSON.stringify(email_pas));',
            '        ctx.assert(celular_pas === "2983555111", "Celular no se copio: " + JSON.stringify(celular_pas));',
            '',
            '        // Cerrar sin confirmar',
            '        await ctx.clic("#cancelar_venta_modal");',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/prueba_09_venta_comprador_lleno_pasajero_vacio.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_09_venta_comprador_lleno_pasajero_vacio.js',
        'descripcion' => 'Prueba venta_comprador_lleno_pasajero_vacio',
        'contenido' => [
            '/**',
            ' * Ligadura inversa: el pasajero se llena primero.',
            ' * Al poner el mismo DNI en el comprador, los datos comunes',
            ' * deben copiarse pasajero -> comprador.',
            ' * @version 1.5plugin.4',
            ' */',
            'import {',
            '    login_terminal, ir_a_viajes_y_abrir_primero,',
            '    abrir_primer_micro_con_libres, seleccionar_n_asientos,',
            '    abrir_modal_confirmacion, llenar_pasajero, dni_unico',
            '} from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "venta_comprador_lleno_pasajero_vacio",',
            '    nombre: "Venta: pasajero lleno, comprador con el mismo DNI",',
            '    descripcion: "Carga el pasajero primero, despues pone el mismo DNI en el comprador. Los campos comunes deben copiarse.",',
            '',
            '    async ejecutar(ctx) {',
            '        await login_terminal(ctx);',
            '        await ir_a_viajes_y_abrir_primero(ctx);',
            '        await abrir_primer_micro_con_libres(ctx);',
            '        await seleccionar_n_asientos(ctx, 1);',
            '        await abrir_modal_confirmacion(ctx);',
            '',
            '        const dni_compartido = dni_unico();',
            '        await llenar_pasajero(ctx, 0, {',
            '            dni: dni_compartido,',
            '            apellido: "Lopez",',
            '            nombres: "Juan",',
            '            email: "juan@test.local",',
            '            celular: "2983555222",',
            '            celular_emergencia: "2983111333",',
            '            fecha_nacimiento: "1985-03-10",',
            '            direccion: "Calle Falsa 742",',
            '            localidad: "Tres Arroyos"',
            '        });',
            '',
            '        // Ahora el comprador con el mismo DNI',
            '        await ctx.escribir("#comprador_dni", dni_compartido);',
            '        await ctx.pausa(800);',
            '',
            '        const apellido_comp = await ctx.valor("#comprador_apellido");',
            '        const nombres_comp = await ctx.valor("#comprador_nombres");',
            '        const email_comp = await ctx.valor("#comprador_email");',
            '        const celular_comp = await ctx.valor("#comprador_celular");',
            '',
            '        ctx.assert(apellido_comp === "Lopez", "Apellido no se copio: " + JSON.stringify(apellido_comp));',
            '        ctx.assert(nombres_comp === "Juan", "Nombres no se copiaron: " + JSON.stringify(nombres_comp));',
            '        ctx.assert(email_comp === "juan@test.local", "Email no se copio: " + JSON.stringify(email_comp));',
            '        ctx.assert(celular_comp === "2983555222", "Celular no se copio: " + JSON.stringify(celular_comp));',
            '',
            '        await ctx.clic("#cancelar_venta_modal");',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/prueba_10_venta_dni_duplicado.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_10_venta_dni_duplicado.js',
        'descripcion' => 'Prueba venta_dni_duplicado',
        'contenido' => [
            '/**',
            ' * DNI duplicado entre pasajeros.',
            ' * @version 1.5plugin.4',
            ' */',
            'import {',
            '    login_terminal, ir_a_viajes_y_abrir_primero,',
            '    abrir_primer_micro_con_libres, seleccionar_n_asientos,',
            '    abrir_modal_confirmacion, llenar_pasajero, dni_unico',
            '} from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "venta_dni_duplicado",',
            '    nombre: "Venta: DNI duplicado entre pasajeros",',
            '    descripcion: "Dos pasajeros con el mismo DNI. El segundo debe mostrar aviso de duplicado.",',
            '',
            '    async ejecutar(ctx) {',
            '        await login_terminal(ctx);',
            '        await ir_a_viajes_y_abrir_primero(ctx);',
            '        await abrir_primer_micro_con_libres(ctx);',
            '        await seleccionar_n_asientos(ctx, 2);',
            '        await abrir_modal_confirmacion(ctx);',
            '',
            '        const dni_repetido = dni_unico();',
            '        await llenar_pasajero(ctx, 0, {',
            '            dni: dni_repetido,',
            '            apellido: "Uno",',
            '            nombres: "Pasajero",',
            '            email: "",',
            '            celular: "2983555001",',
            '            celular_emergencia: "2983111001",',
            '            fecha_nacimiento: "1990-01-01",',
            '            direccion: "Calle 1",',
            '            localidad: "Tres Arroyos"',
            '        });',
            '',
            '        // Poner el mismo DNI en el pasajero 1',
            '        await ctx.escribir("#pasajero_dni_1", dni_repetido);',
            '        await ctx.pausa(800);',
            '',
            '        const aviso = await ctx.texto("#pasajero_aviso_1");',
            '        ctx.assert(aviso && (aviso.includes("otro pasajero") || aviso.includes("duplicado")),',
            '            "No se detecto DNI duplicado: " + JSON.stringify(aviso));',
            '',
            '        await ctx.clic("#cancelar_venta_modal");',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/prueba_11_venta_correccion_dni_pasajero.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_11_venta_correccion_dni_pasajero.js',
        'descripcion' => 'Prueba venta_correccion_dni_pasajero',
        'contenido' => [
            '/**',
            ' * Correccion de DNI del pasajero:',
            ' * DNI registrado -> se autocompleta. Despues se cambia por uno',
            ' * no registrado -> se limpian los campos.',
            ' * @version 1.5plugin.4',
            ' */',
            'import {',
            '    login_terminal, ir_a_viajes_y_abrir_primero,',
            '    abrir_primer_micro_con_libres, seleccionar_n_asientos,',
            '    abrir_modal_confirmacion, crear_pasajero_de_prueba, dni_unico',
            '} from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "venta_correccion_dni_pasajero",',
            '    nombre: "Venta: correccion de DNI del pasajero",',
            '    descripcion: "Con un DNI registrado se autocompletan los campos. Al cambiar a uno no registrado, se limpian.",',
            '',
            '    async ejecutar(ctx) {',
            '        await login_terminal(ctx);',
            '',
            '        // Crear un pasajero de prueba con un DNI registrado',
            '        const dni_registrado = dni_unico();',
            '        await crear_pasajero_de_prueba(ctx, dni_registrado);',
            '',
            '        await ir_a_viajes_y_abrir_primero(ctx);',
            '        await abrir_primer_micro_con_libres(ctx);',
            '        await seleccionar_n_asientos(ctx, 1);',
            '        await abrir_modal_confirmacion(ctx);',
            '',
            '        // Escribir el DNI registrado',
            '        await ctx.escribir("#pasajero_dni_0", dni_registrado);',
            '        await ctx.pausa(800);',
            '',
            '        const apellido = await ctx.valor("#pasajero_apellido_0");',
            '        ctx.assert(apellido === "Correccion", "No se autocompleto: " + JSON.stringify(apellido));',
            '',
            '        // Cambiar por un DNI no registrado',
            '        const dni_nuevo = dni_unico();',
            '        await ctx.escribir("#pasajero_dni_0", dni_nuevo);',
            '        await ctx.pausa(800);',
            '',
            '        const apellido_limpiado = await ctx.valor("#pasajero_apellido_0");',
            '        ctx.assert(apellido_limpiado === "" || apellido_limpiado === null,',
            '            "El apellido no se limpio: " + JSON.stringify(apellido_limpiado));',
            '',
            '        await ctx.clic("#cancelar_venta_modal");',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/prueba_12_venta_correccion_dni_comprador.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_12_venta_correccion_dni_comprador.js',
        'descripcion' => 'Prueba venta_correccion_dni_comprador',
        'contenido' => [
            '/**',
            ' * Correccion de DNI del comprador.',
            ' * @version 1.5plugin.4',
            ' */',
            'import {',
            '    login_terminal, ir_a_viajes_y_abrir_primero,',
            '    abrir_primer_micro_con_libres, seleccionar_n_asientos,',
            '    abrir_modal_confirmacion, crear_pasajero_de_prueba, dni_unico',
            '} from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "venta_correccion_dni_comprador",',
            '    nombre: "Venta: correccion de DNI del comprador",',
            '    descripcion: "Con un DNI registrado se autocompletan los campos del comprador. Al cambiarlo por uno no registrado, se limpian.",',
            '',
            '    async ejecutar(ctx) {',
            '        await login_terminal(ctx);',
            '',
            '        const dni_registrado = dni_unico();',
            '        await crear_pasajero_de_prueba(ctx, dni_registrado, {',
            '            apellido: "CompradorPrueba",',
            '            nombres: "Auto",',
            '            celular: "2983555432"',
            '        });',
            '',
            '        await ir_a_viajes_y_abrir_primero(ctx);',
            '        await abrir_primer_micro_con_libres(ctx);',
            '        await seleccionar_n_asientos(ctx, 1);',
            '        await abrir_modal_confirmacion(ctx);',
            '',
            '        // Escribir el DNI registrado en el comprador',
            '        await ctx.escribir("#comprador_dni", dni_registrado);',
            '        await ctx.pausa(800);',
            '',
            '        const apellido = await ctx.valor("#comprador_apellido");',
            '        ctx.assert(apellido === "CompradorPrueba", "No se autocompleto: " + JSON.stringify(apellido));',
            '',
            '        // Cambiar por uno no registrado',
            '        const dni_nuevo = dni_unico();',
            '        await ctx.escribir("#comprador_dni", dni_nuevo);',
            '        await ctx.pausa(800);',
            '',
            '        const apellido_limpiado = await ctx.valor("#comprador_apellido");',
            '        ctx.assert(apellido_limpiado === "" || apellido_limpiado === null,',
            '            "El apellido del comprador no se limpio: " + JSON.stringify(apellido_limpiado));',
            '',
            '        await ctx.clic("#cancelar_venta_modal");',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/prueba_13_venta_monto_mayor_total.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_13_venta_monto_mayor_total.js',
        'descripcion' => 'Prueba venta_monto_mayor_total',
        'contenido' => [
            '/**',
            ' * Monto mayor al total.',
            ' * @version 1.5plugin.4',
            ' */',
            'import {',
            '    login_terminal, ir_a_viajes_y_abrir_primero,',
            '    abrir_primer_micro_con_libres, seleccionar_n_asientos,',
            '    abrir_modal_confirmacion, llenar_comprador, llenar_pasajero,',
            '    setear_metodo_y_cuotas, setear_monto_pagado,',
            '    datos_comprador_aleatorio, datos_pasajero_aleatorio',
            '} from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "venta_monto_mayor_total",',
            '    nombre: "Venta: monto mayor al total (rechazo)",',
            '    descripcion: "Intenta pagar mas que el total. El piloto debe rechazarlo.",',
            '',
            '    async ejecutar(ctx) {',
            '        await login_terminal(ctx);',
            '        await ir_a_viajes_y_abrir_primero(ctx);',
            '        await abrir_primer_micro_con_libres(ctx);',
            '        await seleccionar_n_asientos(ctx, 1);',
            '        await abrir_modal_confirmacion(ctx);',
            '',
            '        await llenar_comprador(ctx, datos_comprador_aleatorio());',
            '        await llenar_pasajero(ctx, 0, datos_pasajero_aleatorio(0));',
            '',
            '        // 2 cuotas para que el input de monto este habilitado',
            '        await setear_metodo_y_cuotas(ctx, "efectivo", 2);',
            '        await setear_monto_pagado(ctx, "999999999");',
            '',
            '        await ctx.clic("#confirmar_venta");',
            '        await ctx.pausa(600);',
            '',
            '        const aviso = await ctx.leer_aviso();',
            '        ctx.assert(aviso && (aviso.includes("superar") || aviso.includes("no puede")),',
            '            "No se detecto el rechazo por monto mayor: " + JSON.stringify(aviso));',
            '',
            '        await ctx.clic("#cancelar_venta_modal");',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/prueba_14_venta_monto_cero.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_14_venta_monto_cero.js',
        'descripcion' => 'Prueba venta_monto_cero',
        'contenido' => [
            '/**',
            ' * Monto cero.',
            ' * @version 1.5plugin.4',
            ' */',
            'import {',
            '    login_terminal, ir_a_viajes_y_abrir_primero,',
            '    abrir_primer_micro_con_libres, seleccionar_n_asientos,',
            '    abrir_modal_confirmacion, llenar_comprador, llenar_pasajero,',
            '    setear_metodo_y_cuotas, setear_monto_pagado,',
            '    datos_comprador_aleatorio, datos_pasajero_aleatorio',
            '} from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "venta_monto_cero",',
            '    nombre: "Venta: monto cero (rechazo)",',
            '    descripcion: "Intenta pagar cero. El piloto debe rechazarlo.",',
            '',
            '    async ejecutar(ctx) {',
            '        await login_terminal(ctx);',
            '        await ir_a_viajes_y_abrir_primero(ctx);',
            '        await abrir_primer_micro_con_libres(ctx);',
            '        await seleccionar_n_asientos(ctx, 1);',
            '        await abrir_modal_confirmacion(ctx);',
            '',
            '        await llenar_comprador(ctx, datos_comprador_aleatorio());',
            '        await llenar_pasajero(ctx, 0, datos_pasajero_aleatorio(0));',
            '',
            '        await setear_metodo_y_cuotas(ctx, "efectivo", 2);',
            '        await setear_monto_pagado(ctx, "0");',
            '',
            '        await ctx.clic("#confirmar_venta");',
            '        await ctx.pausa(600);',
            '',
            '        const aviso = await ctx.leer_aviso();',
            '        ctx.assert(aviso && (aviso.includes("valido") || aviso.includes("mayor") || aviso.includes("monto")),',
            '            "No se detecto el rechazo por monto cero: " + JSON.stringify(aviso));',
            '',
            '        await ctx.clic("#cancelar_venta_modal");',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/prueba_15_venta_sin_comprador.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_15_venta_sin_comprador.js',
        'descripcion' => 'Prueba venta_sin_comprador',
        'contenido' => [
            '/**',
            ' * Sin datos del comprador.',
            ' * @version 1.5plugin.4',
            ' */',
            'import {',
            '    login_terminal, ir_a_viajes_y_abrir_primero,',
            '    abrir_primer_micro_con_libres, seleccionar_n_asientos,',
            '    abrir_modal_confirmacion',
            '} from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "venta_sin_comprador",',
            '    nombre: "Venta: sin datos del comprador (rechazo)",',
            '    descripcion: "Intenta confirmar sin llenar el comprador. El piloto debe rechazarlo.",',
            '',
            '    async ejecutar(ctx) {',
            '        await login_terminal(ctx);',
            '        await ir_a_viajes_y_abrir_primero(ctx);',
            '        await abrir_primer_micro_con_libres(ctx);',
            '        await seleccionar_n_asientos(ctx, 1);',
            '        await abrir_modal_confirmacion(ctx);',
            '',
            '        // NO llenamos comprador ni pasajero.',
            '        await ctx.clic("#confirmar_venta");',
            '        await ctx.pausa(600);',
            '',
            '        const aviso = await ctx.leer_aviso();',
            '        ctx.assert(aviso && (aviso.includes("DNI") || aviso.includes("obligatorio") || aviso.includes("Comprador")),',
            '            "No se detecto el rechazo por falta de comprador: " + JSON.stringify(aviso));',
            '',
            '        await ctx.clic("#cancelar_venta_modal");',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/prueba_16_venta_cancelar_reabrir.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_16_venta_cancelar_reabrir.js',
        'descripcion' => 'Prueba venta_cancelar_reabrir',
        'contenido' => [
            '/**',
            ' * Cancelar el form de venta y reabrir. Los campos deben estar limpios.',
            ' * @version 1.5plugin.4',
            ' */',
            'import {',
            '    login_terminal, ir_a_viajes_y_abrir_primero,',
            '    abrir_primer_micro_con_libres, seleccionar_n_asientos,',
            '    abrir_modal_confirmacion, llenar_comprador,',
            '    datos_comprador_aleatorio',
            '} from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "venta_cancelar_reabrir",',
            '    nombre: "Venta: cancelar y reabrir el formulario",',
            '    descripcion: "Llena el form, cancela, reabre. Los campos deben estar limpios.",',
            '',
            '    async ejecutar(ctx) {',
            '        await login_terminal(ctx);',
            '        await ir_a_viajes_y_abrir_primero(ctx);',
            '        await abrir_primer_micro_con_libres(ctx);',
            '        await seleccionar_n_asientos(ctx, 1);',
            '        await abrir_modal_confirmacion(ctx);',
            '',
            '        await llenar_comprador(ctx, datos_comprador_aleatorio());',
            '',
            '        // Cancelar',
            '        await ctx.clic("#cancelar_venta_modal");',
            '        const oculto = await ctx.esperar_oculto("#formulario_confirmacion_venta", 3000);',
            '        ctx.assert(oculto && oculto.exito, "El formulario no se oculto");',
            '',
            '        // Reabrir',
            '        await ctx.clic("#boton_confirmar_venta");',
            '        const form_visible = await ctx.esperar_visible("#formulario_confirmacion_venta", 5000);',
            '        ctx.assert(form_visible && form_visible.exito, "El formulario no se reabrio");',
            '',
            '        const dni_comp = await ctx.valor("#comprador_dni");',
            '        ctx.assert(dni_comp === "" || dni_comp === null,',
            '            "El DNI del comprador no se limpio: " + JSON.stringify(dni_comp));',
            '',
            '        // Cerrar',
            '        await ctx.clic("#cancelar_venta_modal");',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/prueba_17_venta_sin_asientos.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_17_venta_sin_asientos.js',
        'descripcion' => 'Prueba venta_sin_asientos',
        'contenido' => [
            '/**',
            ' * Sin asientos seleccionados: el boton Vender no debe aparecer.',
            ' * @version 1.5plugin.4',
            ' */',
            'import {',
            '    login_terminal, ir_a_viajes_y_abrir_primero,',
            '    abrir_primer_micro_con_libres',
            '} from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "venta_sin_asientos",',
            '    nombre: "Venta: sin asientos seleccionados (boton oculto)",',
            '    descripcion: "Sin asientos seleccionados, el boton Vender debe estar oculto.",',
            '',
            '    async ejecutar(ctx) {',
            '        await login_terminal(ctx);',
            '        await ir_a_viajes_y_abrir_primero(ctx);',
            '        await abrir_primer_micro_con_libres(ctx);',
            '',
            '        // NO seleccionamos asientos',
            '        const visible = await ctx.esta_visible("#contenedor_boton_confirmar_venta");',
            '        ctx.assert(!visible, "El boton Vender deberia estar oculto sin asientos seleccionados");',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/catalogo.js — actualizar
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo.js con pruebas de venta',
        'contenido' => [
            '/**',
            ' * Catalogo de pruebas disponibles.',
            ' *',
            ' * Cada prueba exporta un objeto `{ id, nombre, descripcion,',
            ' * ejecutar(ctx) }`. Aca se importan y se listan.',
            ' *',
            ' * @version 1.5plugin.4',
            ' */',
            '',
            'import { prueba as arranque } from "./prueba_01_arranque.js";',
            'import { prueba as login } from "./prueba_02_login.js";',
            'import { prueba as venta_basica } from "./prueba_03_venta_basica.js";',
            'import { prueba as venta_cuotas } from "./prueba_04_venta_cuotas.js";',
            'import { prueba as venta_transferencia } from "./prueba_05_venta_transferencia.js";',
            'import { prueba as venta_dos_asientos } from "./prueba_06_venta_dos_asientos.js";',
            'import { prueba as venta_tres_asientos } from "./prueba_07_venta_tres_asientos.js";',
            'import { prueba as venta_ligadura_dni_igual } from "./prueba_08_venta_ligadura_dni_igual.js";',
            'import { prueba as venta_comprador_lleno_pasajero_vacio } from "./prueba_09_venta_comprador_lleno_pasajero_vacio.js";',
            'import { prueba as venta_dni_duplicado } from "./prueba_10_venta_dni_duplicado.js";',
            'import { prueba as venta_correccion_dni_pasajero } from "./prueba_11_venta_correccion_dni_pasajero.js";',
            'import { prueba as venta_correccion_dni_comprador } from "./prueba_12_venta_correccion_dni_comprador.js";',
            'import { prueba as venta_monto_mayor_total } from "./prueba_13_venta_monto_mayor_total.js";',
            'import { prueba as venta_monto_cero } from "./prueba_14_venta_monto_cero.js";',
            'import { prueba as venta_sin_comprador } from "./prueba_15_venta_sin_comprador.js";',
            'import { prueba as venta_cancelar_reabrir } from "./prueba_16_venta_cancelar_reabrir.js";',
            'import { prueba as venta_sin_asientos } from "./prueba_17_venta_sin_asientos.js";',
            '',
            'export const CATALOGO = [',
            '    arranque,',
            '    login,',
            '    venta_basica,',
            '    venta_cuotas,',
            '    venta_transferencia,',
            '    venta_dos_asientos,',
            '    venta_tres_asientos,',
            '    venta_ligadura_dni_igual,',
            '    venta_comprador_lleno_pasajero_vacio,',
            '    venta_dni_duplicado,',
            '    venta_correccion_dni_pasajero,',
            '    venta_correccion_dni_comprador,',
            '    venta_monto_mayor_total,',
            '    venta_monto_cero,',
            '    venta_sin_comprador,',
            '    venta_cancelar_reabrir,',
            '    venta_sin_asientos',
            '];',
        ],
    ],

    // ============================================================
    // prompts/prompt_plugin_piloto.md
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: bump de ultima actualizacion a v1.5plugin.4',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.3f',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.4 (pruebas de',
            'venta: 15 pruebas nuevas que cubren ventas básicas, cuotas,',
            'transferencia, múltiples asientos, ligaduras comprador-pasajero,',
            'DNI duplicado, corrección de DNI, montos inválidos, cancelar y',
            'reabrir. Antes: v1.5plugin.3f',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: catalogo actual',
        'buscar' => [
            '**Catálogo actual:**',
            '',
            '- `arranque` — verifica SW ↔ contenido ↔ página.',
            '- `login_admin` — entra con código del admin, verifica nivel.',
            '',
            '**Pendiente:**',
            '',
            '- **v1.5plugin.4:** pruebas de altas (pasajero, viaje, micro,',
            '  terminal autorizada) con datos únicos. Cada prueba limpia lo',
            '  que crea.',
            '- **v1.5plugin.5:** pruebas de ventas y casos borde (ligaduras',
            '  comprador↔pasajero, DNI duplicado, cupones, deshabilitar',
            '  método). Es el objetivo que motivó el plugin.',
            '- **v1.5plugin.6 (opcional):** historial de corridas en la',
            '  ventana del plugin.',
            '- Revisar los permisos del manifest cuando se pruebe contra',
            '  un dominio real (hoy solo `localhost` / `127.0.0.1`).',
        ],
        'reemplazar' => [
            '**Catálogo actual:**',
            '',
            '- `arranque` — verifica SW ↔ contenido ↔ página.',
            '- `login_admin` — entra con código del admin, verifica nivel.',
            '- `venta_basica` — 1 asiento, efectivo, pago total.',
            '- `venta_cuotas` — 1 asiento, efectivo, 2 cuotas, pago parcial.',
            '- `venta_transferencia` — 1 asiento por transferencia.',
            '- `venta_dos_asientos` — 2 asientos, 2 pasajeros.',
            '- `venta_tres_asientos` — 3 asientos, 3 pasajeros.',
            '- `venta_ligadura_dni_igual` — comprador y pasajero mismo DNI.',
            '- `venta_comprador_lleno_pasajero_vacio` — pasajero primero.',
            '- `venta_dni_duplicado` — dos pasajeros mismo DNI.',
            '- `venta_correccion_dni_pasajero` — DNI registrado → no registrado.',
            '- `venta_correccion_dni_comprador` — idem comprador.',
            '- `venta_monto_mayor_total` — rechazo por monto.',
            '- `venta_monto_cero` — rechazo por monto cero.',
            '- `venta_sin_comprador` — rechazo por falta de datos.',
            '- `venta_cancelar_reabrir` — cancelar y reabrir el form.',
            '- `venta_sin_asientos` — botón Vender oculto.',
            '',
            '**Pendiente:**',
            '',
            '- **v1.5plugin.5 (opcional):** pruebas de altas (pasajero, viaje,',
            '  micro, terminal autorizada). Menos críticas ahora que las de',
            '  venta están.',
            '- **v1.5plugin.6 (opcional):** historial de corridas en la',
            '  ventana del plugin.',
            '- Revisar los permisos del manifest cuando se pruebe contra',
            '  un dominio real (hoy solo `localhost` / `127.0.0.1`).',
            '',
            '**Notas sobre las pruebas de venta:**',
            '',
            '- Usan el terminal `carmen2` (código `carmen2`).',
            '- El dueño de las terminales de prueba debe ser `carmen1`.',
            '  Si el nombre de usuario del dueño es distinto, ajustar',
            '  `NOMBRE_DUENO_PRUEBA` en `Aplicacion/ConfPlugin.js`.',
            '- Todas las ventas se cancelan al final (Opción B).',
            '- La prueba `venta_correccion_dni_pasajero` crea un pasajero',
            '  de prueba antes de empezar. La prueba `venta_correccion_dni_comprador`',
            '  también.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: listado de archivos actualizado',
        'buscar' => [
            '- `Aplicacion/pruebas/prueba_01_arranque.js` — prueba de',
            '  arranque.',
            '- `Aplicacion/pruebas/prueba_02_login.js` — prueba de login.',
            '- `auditar_plugin.php` — auditoría con 6 secciones.',
        ],
        'reemplazar' => [
            '- `Aplicacion/pruebas/prueba_01_arranque.js` — prueba de',
            '  arranque.',
            '- `Aplicacion/pruebas/prueba_02_login.js` — prueba de login.',
            '- `Aplicacion/pruebas/_helpers.js` — helpers compartidos de',
            '  las pruebas de venta.',
            '- `Aplicacion/pruebas/prueba_03..17_venta_*.js` — 15 pruebas',
            '  de venta y casos borde.',
            '- `auditar_plugin.php` — auditoría con 6 secciones.',
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