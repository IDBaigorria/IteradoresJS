<?php
/**
 * Aplicador — Tanda B: auditoría topológica en el plugin.
 *
 * Crea Aplicacion/Auditoria.js, agrega persistencia en
 * GrafoPlugin.js, cases en servicio.js, botón + panel en
 * ventana.js, y bump de versión en ConfiguracionApli.js.
 *
 * Uso (raíz del repo iteradoresJS/): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.9n';

// El plugin no usa ?v= en HTML.
$htmls_a_bumpear = [];

$cambios = [

// ============================================================
// 1. Nuevo: Aplicacion/Auditoria.js
// ============================================================
[
    'tipo' => 'crear',
    'archivo' => 'Aplicacion/Auditoria.js',
    'descripcion' => 'GET a ?auditar_topologia=1 dentro del page context',
    'contenido' => [
        '/**',
        ' * Cliente de la auditoría topológica del piloto.',
        ' *',
        ' * Hace un GET a index.php?auditar_topologia=1 dentro',
        ' * del page context (para que viajen las cookies del',
        ' * piloto), y devuelve el reporte parseado.',
        ' *',
        ' * El endpoint es de solo lectura. No modifica nada.',
        ' * El solicitante (nombre_solicitante) se resuelve con',
        ' * ctx.nombre_usuario_actual() y se manda por GET: el',
        ' * piloto valida que sea admin o soporte. En local se',
        ' * puede omitir.',
        ' *',
        ' * @version 1.5plugin.9n',
        ' * @since 1.5plugin.9n',
        ' */',
        '',
        'import { URL_PILOTO } from "./ConfiguracionApli.js";',
        '',
        '/**',
        ' * Ejecuta la auditoría contra el piloto.',
        ' *',
        ' * @param {Object} ctx  Contexto del SW (con pestana_id y',
        ' *                       nombre_usuario_actual()).',
        ' * @returns {Promise<{exito: boolean, reporte?: Object,',
        ' *   entorno?: string, duracion_ms?: number, error?: string}>}',
        ' */',
        'export async function ejecutar_auditoria(ctx) {',
        '    const es_local = URL_PILOTO.indexOf("localhost") !== -1',
        '                  || URL_PILOTO.indexOf("127.0.0.1") !== -1;',
        '    const entorno = es_local ? "local" : "remoto";',
        '',
        '    // Resolver el nombre del solicitante (logueado).',
        '    let nombre_solicitante = "";',
        '    try {',
        '        const r_nombre = await ctx.nombre_usuario_actual();',
        '        if (r_nombre && r_nombre.exito && r_nombre.nombre_usuario) {',
        '            nombre_solicitante = r_nombre.nombre_usuario;',
        '        }',
        '    } catch (e) {',
        '        // Sin nombre. En local se permite; en remoto, error',
        '        // claro abajo.',
        '    }',
        '',
        '    if (!es_local && !nombre_solicitante) {',
        '        return {',
        '            exito: false,',
        '            error: "No se pudo resolver el nombre del solicitante. Logueate como admin o soporte antes de auditar.",',
        '            entorno: entorno,',
        '        };',
        '    }',
        '',
        '    let url = URL_PILOTO + "index.php?auditar_topologia=1";',
        '    if (nombre_solicitante) {',
        '        url += "&nombre_solicitante=" + encodeURIComponent(nombre_solicitante);',
        '    }',
        '',
        '    const inicio = Date.now();',
        '    let r;',
        '    try {',
        '        r = await _pedir_get_json(ctx, url);',
        '    } catch (e) {',
        '        return {',
        '            exito: false,',
        '            error: "Error de red: " + (e && e.message ? e.message : String(e)),',
        '            entorno: entorno,',
        '            duracion_ms: Date.now() - inicio,',
        '        };',
        '    }',
        '    const duracion_ms = Date.now() - inicio;',
        '',
        '    if (!r || !r.status) {',
        '        return {',
        '            exito: false,',
        '            error: "Sin respuesta del servidor: " + (r && r.error ? r.error : "desconocido"),',
        '            entorno: entorno,',
        '            duracion_ms: duracion_ms,',
        '        };',
        '    }',
        '    if (r.status === 403) {',
        '        const msg = (r.json && r.json.error) ? r.json.error : "Permiso denegado (403). Necesitás estar logueado como admin o soporte.";',
        '        return { exito: false, error: msg, entorno: entorno, duracion_ms: duracion_ms };',
        '    }',
        '    if (r.status !== 200) {',
        '        return {',
        '            exito: false,',
        '            error: "HTTP " + r.status + (r.json && r.json.error ? ": " + r.json.error : ""),',
        '            entorno: entorno,',
        '            duracion_ms: duracion_ms,',
        '        };',
        '    }',
        '',
        '    const reporte = r.json;',
        '    if (!reporte || !reporte.exito) {',
        '        return {',
        '            exito: false,',
        '            error: (reporte && reporte.error) || "Respuesta inesperada del servidor (no era JSON válido).",',
        '            entorno: entorno,',
        '            duracion_ms: duracion_ms,',
        '        };',
        '    }',
        '',
        '    return {',
        '        exito: true,',
        '        reporte: reporte,',
        '        entorno: entorno,',
        '        duracion_ms: duracion_ms,',
        '    };',
        '}',
        '',
        '/**',
        ' * GET con cookies dentro del page context. Devuelve',
        ' * { status, texto, json, error? }.',
        ' *',
        ' * @param {Object} ctx',
        ' * @param {string} url_absoluta',
        ' * @returns {Promise<Object>}',
        ' */',
        'async function _pedir_get_json(ctx, url_absoluta) {',
        '    const r = await chrome.scripting.executeScript({',
        '        target: { tabId: ctx.pestana_id },',
        '        world: "MAIN",',
        '        func: (url) => {',
        '            return fetch(url, { credentials: "include" })',
        '                .then(resp => resp.text().then(texto => {',
        '                    let json = null;',
        '                    try { json = JSON.parse(texto); } catch (e) { /* no era JSON */ }',
        '                    return { status: resp.status, texto: texto, json: json };',
        '                }))',
        '                .catch(e => ({ status: 0, texto: "", json: null, error: e.message }));',
        '        },',
        '        args: [url_absoluta],',
        '    });',
        '    return (r && r[0] && r[0].result) ? r[0].result : { status: 0, error: "sin resultado" };',
        '}',
    ],
],

// ============================================================
// 2. GrafoPlugin.js: persistencia de auditorías
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/GrafoPlugin.js',
    'descripcion' => 'Agregar registrar_auditoria + obtener_estado_auditorias al final',
    'buscar' => [
        'function _destruir_corrida_mig(migraciones, item) {',
        '    const corrida = item.corrida;',
        '    const ady = corrida.adyacentes();',
        '    if (ady) {',
        '        for (const [nombre, hijo] of ady) {',
        '            const ady_h = hijo.adyacentes();',
        '            if (ady_h) {',
        '                for (const [nh, n] of ady_h) {',
        '                    hijo.eliminar_adyacente(nh);',
        '                    Nodo.eliminar(n);',
        '                }',
        '            }',
        '            corrida.eliminar_adyacente(nombre);',
        '            Nodo.eliminar(hijo);',
        '        }',
        '    }',
        '    migraciones.eliminar_adyacente(item.nombre);',
        '    Nodo.eliminar(corrida);',
        '}',
    ],
    'reemplazar' => [
        'function _destruir_corrida_mig(migraciones, item) {',
        '    const corrida = item.corrida;',
        '    const ady = corrida.adyacentes();',
        '    if (ady) {',
        '        for (const [nombre, hijo] of ady) {',
        '            const ady_h = hijo.adyacentes();',
        '            if (ady_h) {',
        '                for (const [nh, n] of ady_h) {',
        '                    hijo.eliminar_adyacente(nh);',
        '                    Nodo.eliminar(n);',
        '                }',
        '            }',
        '            corrida.eliminar_adyacente(nombre);',
        '            Nodo.eliminar(hijo);',
        '        }',
        '    }',
        '    migraciones.eliminar_adyacente(item.nombre);',
        '    Nodo.eliminar(corrida);',
        '}',
        '',
        '// ============================================================',
        '// Auditorías topológicas (v1.5plugin.9n)',
        '// ============================================================',
        '//',
        '// Estructura en el grafo:',
        '//   plugin',
        '//   └── auditorias',
        '//       ├── actual → auditoria_<ts>   (autoenlace, la última)',
        '//       └── auditoria_<ts>',
        '//           ├── fecha_hora',
        '//           ├── entorno',
        '//           ├── duracion_ms',
        '//           ├── nodos_total',
        '//           ├── aristas_total',
        '//           ├── criticos_count',
        '//           ├── errores_count',
        '//           ├── warnings_count',
        '//           ├── truncado',
        '//           ├── primeros_criticos → item_0, item_1, ...',
        '//           ├── primeros_errores  → item_0, item_1, ...',
        '//           └── primeros_warnings → item_0, item_1, ...',
        '//',
        '// Se guardan solo los primeros N de cada severidad. El',
        '// reporte completo se muestra en la UI en vivo; el',
        '// historial guarda solo el resumen.',
        '//',
        '// Se conservan las últimas 10 auditorías.',
        '',
        'const AUDITORIA_CORRIDAS_MAX = 10;',
        'const AUDITORIA_PRIMEROS_N = 5;',
        '',
        '/**',
        ' * Registra una auditoría. Devuelve el id.',
        ' *',
        ' * @param {Object} datos',
        ' * @param {string} datos.fecha_hora  ISO',
        ' * @param {string} datos.entorno     "local" | "remoto"',
        ' * @param {number} datos.duracion_ms',
        ' * @param {Object} datos.reporte     respuesta del piloto',
        ' * @returns {Promise<string>}',
        ' */',
        'export async function registrar_auditoria(datos) {',
        '    await asegurar_grafo_cargado();',
        '    const Controlador = await obtener_controlador();',
        '',
        '    const raiz = Nodo.nodo_por_id("plugin");',
        '    if (!raiz) throw new Error("Sin raíz del plugin");',
        '',
        '    let auditorias = raiz.adyacente("auditorias");',
        '    if (!auditorias) {',
        '        auditorias = Nodo.crear_con_dato("");',
        '        raiz._adyacente_en(auditorias, "auditorias");',
        '    }',
        '',
        '    if (auditorias.adyacente("actual")) {',
        '        auditorias.eliminar_adyacente("actual");',
        '    }',
        '',
        '    const id_corrida = "auditoria_" + Date.now();',
        '    const corrida = Nodo.crear_con_dato(id_corrida);',
        '    auditorias._adyacente_en(corrida, id_corrida);',
        '    auditorias._adyacente_en(corrida, "actual");',
        '',
        '    corrida._adyacente_en(Nodo.crear_con_dato(String(datos.fecha_hora)), "fecha_hora");',
        '    corrida._adyacente_en(Nodo.crear_con_dato(String(datos.entorno || "")), "entorno");',
        '    corrida._adyacente_en(Nodo.crear_con_dato(String(datos.duracion_ms || 0)), "duracion_ms");',
        '',
        '    const rep = datos.reporte || {};',
        '    const res = rep.resumen || {};',
        '    corrida._adyacente_en(Nodo.crear_con_dato(String(res.nodos_total || 0)), "nodos_total");',
        '    corrida._adyacente_en(Nodo.crear_con_dato(String(res.aristas_total || 0)), "aristas_total");',
        '    corrida._adyacente_en(Nodo.crear_con_dato(String(res.criticos || 0)), "criticos_count");',
        '    corrida._adyacente_en(Nodo.crear_con_dato(String(res.errores || 0)), "errores_count");',
        '    corrida._adyacente_en(Nodo.crear_con_dato(String(res.warnings || 0)), "warnings_count");',
        '',
        '    const truncado = ((res.criticos || 0) > AUDITORIA_PRIMEROS_N)',
        '                  || ((res.errores || 0) > AUDITORIA_PRIMEROS_N)',
        '                  || ((res.warnings || 0) > AUDITORIA_PRIMEROS_N);',
        '    corrida._adyacente_en(Nodo.crear_con_dato(truncado ? "1" : "0"), "truncado");',
        '',
        '    _agregar_primeros_auditoria(corrida, "primeros_criticos", rep.criticos || [], AUDITORIA_PRIMEROS_N);',
        '    _agregar_primeros_auditoria(corrida, "primeros_errores", rep.errores || [], AUDITORIA_PRIMEROS_N);',
        '    _agregar_primeros_auditoria(corrida, "primeros_warnings", rep.warnings || [], AUDITORIA_PRIMEROS_N);',
        '',
        '    _podar_auditorias(auditorias);',
        '',
        '    const ok = await Controlador.guardar(NOMBRE_GRAFO);',
        '    if (!ok) throw new Error("No se pudo guardar la auditoría");',
        '    return id_corrida;',
        '}',
        '',
        'function _agregar_primeros_auditoria(corrida, nombre_contenedor, lista, n) {',
        '    if (!Array.isArray(lista) || lista.length === 0) return;',
        '    const cont = Nodo.crear_con_dato("");',
        '    const primeros = lista.slice(0, n);',
        '    for (let i = 0; i < primeros.length; i++) {',
        '        const item = Nodo.crear_con_dato("");',
        '        item._adyacente_en(Nodo.crear_con_dato(String(primeros[i].tipo || "")), "tipo");',
        '        item._adyacente_en(Nodo.crear_con_dato(String(primeros[i].detalle || "")), "detalle");',
        '        cont._adyacente_en(item, "item_" + i);',
        '    }',
        '    corrida._adyacente_en(cont, nombre_contenedor);',
        '}',
        '',
        'function _podar_auditorias(auditorias) {',
        '    const actual = auditorias.adyacente("actual");',
        '    const todas = [];',
        '    const ady = auditorias.adyacentes();',
        '    if (!ady) return;',
        '    for (const [nombre, corrida] of ady) {',
        '        if (nombre === "actual") continue;',
        '        if (!nombre.startsWith("auditoria_")) continue;',
        '        todas.push({ nombre: nombre, corrida: corrida });',
        '    }',
        '    if (todas.length <= AUDITORIA_CORRIDAS_MAX) return;',
        '',
        '    todas.sort((a, b) => b.nombre.localeCompare(a.nombre));',
        '    for (let i = AUDITORIA_CORRIDAS_MAX; i < todas.length; i++) {',
        '        if (actual && todas[i].corrida.id() === actual.id()) continue;',
        '        _destruir_auditoria(auditorias, todas[i]);',
        '    }',
        '}',
        '',
        'function _destruir_auditoria(auditorias, item) {',
        '    const corrida = item.corrida;',
        '    const ady = corrida.adyacentes();',
        '    if (ady) {',
        '        for (const [nombre, hijo] of ady) {',
        '            const ady_h = hijo.adyacentes();',
        '            if (ady_h) {',
        '                for (const [nh, n] of ady_h) {',
        '                    hijo.eliminar_adyacente(nh);',
        '                    Nodo.eliminar(n);',
        '                }',
        '            }',
        '            corrida.eliminar_adyacente(nombre);',
        '            Nodo.eliminar(hijo);',
        '        }',
        '    }',
        '    auditorias.eliminar_adyacente(item.nombre);',
        '    Nodo.eliminar(corrida);',
        '}',
        '',
        '/**',
        ' * Devuelve { actual, historial }. El historial va de la',
        ' * más reciente a la más vieja, hasta 5 entradas.',
        ' *',
        ' * @returns {Promise<{actual: Object|null, historial: Object[]}>}',
        ' */',
        'export async function obtener_estado_auditorias() {',
        '    await asegurar_grafo_cargado();',
        '    const raiz = Nodo.nodo_por_id("plugin");',
        '    if (!raiz) return { actual: null, historial: [] };',
        '    const auditorias = raiz.adyacente("auditorias");',
        '    if (!auditorias) return { actual: null, historial: [] };',
        '',
        '    let actual = null;',
        '    const historial = [];',
        '    const ady = auditorias.adyacentes();',
        '    if (ady) {',
        '        for (const [nombre, corrida] of ady) {',
        '            if (nombre === "actual") {',
        '                actual = _formatear_auditoria(nombre, corrida);',
        '                continue;',
        '            }',
        '            if (!nombre.startsWith("auditoria_")) continue;',
        '            historial.push(_formatear_auditoria(nombre, corrida));',
        '        }',
        '    }',
        '',
        '    historial.sort((a, b) => (b.fecha_hora || "").localeCompare(a.fecha_hora || ""));',
        '    return { actual, historial: historial.slice(0, 5) };',
        '}',
        '',
        'function _formatear_auditoria(nombre, corrida) {',
        '    return {',
        '        id: nombre,',
        '        fecha_hora: _dato_adyacente(corrida, "fecha_hora"),',
        '        entorno: _dato_adyacente(corrida, "entorno"),',
        '        duracion_ms: _dato_adyacente(corrida, "duracion_ms"),',
        '        nodos_total: _dato_adyacente(corrida, "nodos_total"),',
        '        aristas_total: _dato_adyacente(corrida, "aristas_total"),',
        '        criticos_count: _dato_adyacente(corrida, "criticos_count"),',
        '        errores_count: _dato_adyacente(corrida, "errores_count"),',
        '        warnings_count: _dato_adyacente(corrida, "warnings_count"),',
        '        truncado: _dato_adyacente(corrida, "truncado") === "1",',
        '        criticos: _leer_primeros_auditoria(corrida, "primeros_criticos"),',
        '        errores: _leer_primeros_auditoria(corrida, "primeros_errores"),',
        '        warnings: _leer_primeros_auditoria(corrida, "primeros_warnings"),',
        '    };',
        '}',
        '',
        'function _leer_primeros_auditoria(corrida, nombre_contenedor) {',
        '    const cont = corrida.adyacente(nombre_contenedor);',
        '    if (!cont) return [];',
        '    const out = [];',
        '    const ady = cont.adyacentes();',
        '    if (!ady) return out;',
        '    for (const [nombre, item] of ady) {',
        '        if (!nombre.startsWith("item_")) continue;',
        '        out.push({',
        '            tipo: _dato_adyacente(item, "tipo"),',
        '            detalle: _dato_adyacente(item, "detalle"),',
        '        });',
        '    }',
        '    return out;',
        '}',
    ],
],

// ============================================================
// 3. servicio.js: imports, funciones y cases
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/servicio.js',
    'descripcion' => 'Imports de Auditoria + GrafoPlugin',
    'buscar' => [
        'import { URL_PILOTO } from "./ConfiguracionApli.js";',
        'import { registrar_corrida, marcar_en_vivo, limpiar_en_vivo, limpiar_autoenlaces_colgados, obtener_estado_por_prueba,',
        '         registrar_migracion, actualizar_paso_migracion, finalizar_migracion, obtener_estado_migracion } from "./GrafoPlugin.js";',
    ],
    'reemplazar' => [
        'import { URL_PILOTO } from "./ConfiguracionApli.js";',
        'import { registrar_corrida, marcar_en_vivo, limpiar_en_vivo, limpiar_autoenlaces_colgados, obtener_estado_por_prueba,',
        '         registrar_migracion, actualizar_paso_migracion, finalizar_migracion, obtener_estado_migracion,',
        '         registrar_auditoria, obtener_estado_auditorias } from "./GrafoPlugin.js";',
        'import { ejecutar_auditoria } from "./Auditoria.js";',
    ],
],
[
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/servicio.js',
    'descripcion' => 'Agregar _ejecutar_auditoria y _notificar_auditoria',
    'buscar' => [
        'function _notificar_corrida_iniciada(id_prueba) {',
    ],
    'reemplazar' => [
        '// ============================================================',
        '// Auditoría topológica (v1.5plugin.9n)',
        '// ============================================================',
        '',
        'function _notificar_auditoria(payload) {',
        '    try {',
        '        chrome.runtime.sendMessage(payload).catch(function () { /* nadie escuchando */ });',
        '    } catch (e) { /* ignorar */ }',
        '}',
        '',
        'async function _ejecutar_auditoria() {',
        '    const pestana = await _obtener_pestana_piloto();',
        '    if (!pestana) {',
        '        return { exito: false, error: "No hay una pestaña del piloto abierta. Abrí " + URL_PILOTO + " y reintentá." };',
        '    }',
        '    if (!pestana.url || !pestana.url.startsWith(URL_PILOTO)) {',
        '        return { exito: false, error: "La pestaña seleccionada apunta a " + (pestana.url || "(desconocida)") + " en lugar de " + URL_PILOTO + "." };',
        '    }',
        '    const ctx = _crear_ctx(pestana.id);',
        '',
        '    let resultado;',
        '    try {',
        '        resultado = await ejecutar_auditoria(ctx);',
        '    } catch (e) {',
        '        return { exito: false, error: e.message };',
        '    }',
        '',
        '    if (!resultado.exito) {',
        '        _notificar_auditoria({ tipo: "auditoria_terminada", exito: false, error: resultado.error });',
        '        return resultado;',
        '    }',
        '',
        '    let id_corrida = null;',
        '    try {',
        '        id_corrida = await registrar_auditoria({',
        '            fecha_hora: new Date().toISOString(),',
        '            entorno: resultado.entorno,',
        '            duracion_ms: resultado.duracion_ms,',
        '            reporte: resultado.reporte,',
        '        });',
        '    } catch (e) {',
        '        console.error("No se pudo persistir la auditoría:", e);',
        '    }',
        '',
        '    _notificar_auditoria({ tipo: "auditoria_terminada", exito: true, id_corrida: id_corrida });',
        '    return {',
        '        exito: true,',
        '        id_corrida: id_corrida,',
        '        entorno: resultado.entorno,',
        '        duracion_ms: resultado.duracion_ms,',
        '        reporte: resultado.reporte,',
        '    };',
        '}',
        '',
        'function _notificar_corrida_iniciada(id_prueba) {',
    ],
],
[
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/servicio.js',
    'descripcion' => 'Cases auditar_topologia y estado_auditorias',
    'buscar' => [
        '                case "abandonar_migracion": {',
        '                    const id_ab = mensaje.id_corrida;',
        '                    if (!id_ab) { sendResponse({ exito: false, error: "falta id_corrida" }); break; }',
        '                    try {',
        '                        await finalizar_migracion(id_ab, {',
        '                            estado_global: "abandonada",',
        '                            fecha_fin: new Date().toISOString(),',
        '                        });',
        '                        sendResponse({ exito: true });',
        '                    } catch (e) {',
        '                        sendResponse({ exito: false, error: e.message });',
        '                    }',
        '                    break;',
        '                }',
        '',
        '                default:',
    ],
    'reemplazar' => [
        '                case "abandonar_migracion": {',
        '                    const id_ab = mensaje.id_corrida;',
        '                    if (!id_ab) { sendResponse({ exito: false, error: "falta id_corrida" }); break; }',
        '                    try {',
        '                        await finalizar_migracion(id_ab, {',
        '                            estado_global: "abandonada",',
        '                            fecha_fin: new Date().toISOString(),',
        '                        });',
        '                        sendResponse({ exito: true });',
        '                    } catch (e) {',
        '                        sendResponse({ exito: false, error: e.message });',
        '                    }',
        '                    break;',
        '                }',
        '',
        '                case "auditar_topologia": {',
        '                    sendResponse(await _ejecutar_auditoria());',
        '                    break;',
        '                }',
        '',
        '                case "estado_auditorias": {',
        '                    try {',
        '                        const estado_aud = await obtener_estado_auditorias();',
        '                        sendResponse({ exito: true, estado: estado_aud });',
        '                    } catch (e) {',
        '                        sendResponse({ exito: false, error: e.message });',
        '                    }',
        '                    break;',
        '                }',
        '',
        '                default:',
    ],
],

// ============================================================
// 4. ventana.js: botón + panel + correr auditoría
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/ventana.js',
    'descripcion' => 'Bloque de auditoría al final del DOMContentLoaded',
    'buscar' => [
        '    async function _arrancar() {',
        '        await renderizar();',
        '        await _cargar_estado_inicial();',
        '    }',
        '',
        '    _arrancar();',
        '});',
    ],
    'reemplazar' => [
        '    async function _arrancar() {',
        '        await renderizar();',
        '        await _cargar_estado_inicial();',
        '    }',
        '',
        '    _arrancar();',
        '',
        '    // ============================================================',
        '    // Auditoría topológica (v1.5plugin.9n)',
        '    // ============================================================',
        '',
        '    let _auditoria_panel_abierto = false;',
        '',
        '    (function _inyectar_boton_y_panel_auditoria() {',
        '        const btn_mig = document.getElementById("btn_toggle_migraciones");',
        '        if (btn_mig) {',
        '            btn_mig.insertAdjacentHTML(',
        '                "afterend",',
        '                \' <button id="btn_toggle_auditoria" type="button" title="Auditar la topología del grafo del piloto (solo lectura)">\\uD83D\\uDD0D Auditar topolog\\u00EDa</button>\'',
        '            );',
        '        }',
        '        const panel_mig = document.getElementById("migraciones_panel");',
        '        if (panel_mig) {',
        '            panel_mig.insertAdjacentHTML(',
        '                "afterend",',
        '                \'<div id="auditoria_panel" style="display:none; margin-top:12px; padding:10px; border:1px solid #ccc; border-radius:6px; background:#fafafa;"></div>\'',
        '            );',
        '        }',
        '    })();',
        '',
        '    async function _toggle_auditoria() {',
        '        _auditoria_panel_abierto = !_auditoria_panel_abierto;',
        '        const panel = document.getElementById("auditoria_panel");',
        '        if (!panel) return;',
        '        if (_auditoria_panel_abierto) {',
        '            panel.style.display = "block";',
        '            await _renderizar_auditorias();',
        '        } else {',
        '            panel.style.display = "none";',
        '        }',
        '    }',
        '',
        '    async function _renderizar_auditorias() {',
        '        const panel = document.getElementById("auditoria_panel");',
        '        if (!panel) return;',
        '        panel.innerHTML = \'<div class="estado">Cargando estado...</div>\';',
        '',
        '        let resp;',
        '        try {',
        '            resp = await enviar({ tipo: "estado_auditorias" });',
        '        } catch (e) {',
        '            panel.innerHTML = \'<div class="estado">Error: \' + _escapar_html(e.message) + \'</div>\';',
        '            return;',
        '        }',
        '        if (!resp || !resp.exito) {',
        '            const msg = (resp && resp.error) ? resp.error : "desconocido";',
        '            panel.innerHTML = \'<div class="estado">Error: \' + _escapar_html(msg) + \'</div>\';',
        '            return;',
        '        }',
        '',
        '        const estado = resp.estado || { actual: null, historial: [] };',
        '        const actual = estado.actual;',
        '        const historial = estado.historial || [];',
        '',
        '        let html = "";',
        '        html += \'<div style="margin-bottom:8px;">\';',
        '        html += \'<button id="btn_correr_auditoria" class="btn-correr-todas">\\uD83D\\uDD0D Auditar ahora</button>\';',
        '        html += \' <span class="estado" id="auditoria_estado"></span>\';',
        '        html += \'</div>\';',
        '',
        '        if (actual) {',
        '            html += _renderizar_resultado_auditoria(actual);',
        '        } else {',
        '            html += \'<div class="estado">Sin auditorías registradas. Click en "Auditar ahora" para correr la primera.</div>\';',
        '        }',
        '',
        '        if (historial.length > 1) {',
        '            html += \'<h3>Historial</h3>\';',
        '            for (const h of historial.slice(0, 5)) {',
        '                html += \'<div class="migracion-hist-item">\';',
        '                html += \'<span>\' + _formatear_fecha(h.fecha_hora) + \' \\u00B7 \' + _escapar_html(h.entorno || "") + \'</span>\';',
        '                html += \'<span>\' + _escapar_html(h.criticos_count) + \' crit / \' + _escapar_html(h.errores_count) + \' err / \' + _escapar_html(h.warnings_count) + \' warn</span>\';',
        '                html += \'</div>\';',
        '            }',
        '        }',
        '',
        '        panel.innerHTML = html;',
        '',
        '        const btn = document.getElementById("btn_correr_auditoria");',
        '        if (btn) btn.addEventListener("click", _correr_auditoria);',
        '    }',
        '',
        '    function _renderizar_resultado_auditoria(a) {',
        '        const n_crit = parseInt(a.criticos_count, 10) || 0;',
        '        const n_err  = parseInt(a.errores_count, 10) || 0;',
        '        const n_warn = parseInt(a.warnings_count, 10) || 0;',
        '        const color_crit = (n_crit > 0) ? "#c5221f" : "#188038";',
        '        const color_err  = (n_err  > 0) ? "#b06000" : "#188038";',
        '        const color_warn = (n_warn > 0) ? "#b06000" : "#188038";',
        '',
        '        let html = "";',
        '        html += \'<div style="background:#fff; padding:8px; border-radius:4px; margin-bottom:8px; border:1px solid #ddd;">\';',
        '        html += \'<div style="font-weight:bold; margin-bottom:4px;">Auditoría del \' + _formatear_fecha(a.fecha_hora) + \' (\' + _escapar_html(a.entorno || "") + \', \' + _escapar_html(a.duracion_ms) + \' ms)</div>\';',
        '        html += \'<div>Nodos: <b>\' + _escapar_html(a.nodos_total) + \'</b> \\u00B7 Aristas: <b>\' + _escapar_html(a.aristas_total) + \'</b></div>\';',
        '        html += \'<div style="margin-top:6px;">\';',
        '        html += \'<span style="color:\' + color_crit + \'; font-weight:bold;">\' + n_crit + \' cr\\u00EDticos</span> \\u00B7 \';',
        '        html += \'<span style="color:\' + color_err + \'; font-weight:bold;">\' + n_err + \' errores</span> \\u00B7 \';',
        '        html += \'<span style="color:\' + color_warn + \'; font-weight:bold;">\' + n_warn + \' warnings</span>\';',
        '        html += \'</div>\';',
        '        html += \'</div>\';',
        '',
        '        html += _renderizar_seccion_auditoria("Cr\\u00EDticos", a.criticos, n_crit, a.truncado, "#c5221f");',
        '        html += _renderizar_seccion_auditoria("Errores", a.errores, n_err, a.truncado, "#b06000");',
        '        html += _renderizar_seccion_auditoria("Warnings", a.warnings, n_warn, a.truncado, "#8a6d00");',
        '',
        '        return html;',
        '    }',
        '',
        '    function _renderizar_seccion_auditoria(titulo, items, total, truncado, color) {',
        '        if (!items || items.length === 0) return "";',
        '        let html = \'<h4 style="margin:8px 0 4px 0; color:\' + color + \';">\' + titulo + \' (\' + total + \')</h4>\';',
        '        html += \'<ul style="margin:0 0 8px 16px; padding:0; font-size:11px;">\';',
        '        for (const it of items) {',
        '            html += \'<li><b>\' + _escapar_html(it.tipo) + \':</b> \' + _escapar_html(it.detalle) + \'</li>\';',
        '        }',
        '        html += \'</ul>\';',
        '        if (truncado && total > items.length) {',
        '            html += \'<div style="font-size:10px; color:#666;">(mostrando \' + items.length + \' de \' + total + \')</div>\';',
        '        }',
        '        return html;',
        '    }',
        '',
        '    async function _correr_auditoria() {',
        '        const est_el = document.getElementById("auditoria_estado");',
        '        const btn = document.getElementById("btn_correr_auditoria");',
        '        if (btn) btn.disabled = true;',
        '        if (est_el) est_el.textContent = "Auditando...";',
        '',
        '        let es_local = true;',
        '        try {',
        '            const r_env = await enviar({ tipo: "entorno_actual" });',
        '            es_local = r_env && r_env.entorno === "local";',
        '        } catch (e) { es_local = false; }',
        '',
        '        if (es_local) {',
        '            if (!confirm("\\u00BFCorrer la auditor\\u00EDa topol\\u00F3gica del grafo?\\n\\nSolo lectura. No modifica nada. Tarda 5-15s seg\\u00FAn el tama\\u00F1o del grafo.")) {',
        '                if (btn) btn.disabled = false;',
        '                if (est_el) est_el.textContent = "";',
        '                return;',
        '            }',
        '        } else {',
        '            const resp = prompt("ATENCI\\u00D3N: entorno REMOTO.\\n\\nLa auditor\\u00EDa es solo lectura.\\n\\nEscrib\\u00ED AUDITAR (may\\u00FAsculas) para confirmar:");',
        '            if (resp !== "AUDITAR") {',
        '                if (btn) btn.disabled = false;',
        '                if (est_el) est_el.textContent = "";',
        '                return;',
        '            }',
        '        }',
        '',
        '        try {',
        '            const r = await enviar({ tipo: "auditar_topologia" });',
        '            if (!r || !r.exito) {',
        '                alert("Error: " + (r && r.error ? r.error : "desconocido"));',
        '            }',
        '        } catch (e) {',
        '            alert("Error: " + e.message);',
        '        } finally {',
        '            if (btn) btn.disabled = false;',
        '            if (est_el) est_el.textContent = "";',
        '            await _renderizar_auditorias();',
        '        }',
        '    }',
        '',
        '    (function _conectar_boton_auditoria() {',
        '        const btn = document.getElementById("btn_toggle_auditoria");',
        '        if (btn) btn.addEventListener("click", _toggle_auditoria);',
        '    })();',
        '',
        '    chrome.runtime.onMessage.addListener((msg) => {',
        '        if (!msg) return;',
        '        if (msg.tipo === "auditoria_terminada") {',
        '            if (_auditoria_panel_abierto) _renderizar_auditorias();',
        '        }',
        '    });',
        '});',
    ],
],

// ============================================================
// 5. ConfiguracionApli.js: bump de versión
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/ConfiguracionApli.js',
    'descripcion' => 'Bump de VERSION_APP y VERSION_PLUGIN a 1.5plugin.9n',
    'buscar' => [
        'export const VERSION_APP = "1.5plugin.9m";',
    ],
    'reemplazar' => [
        'export const VERSION_APP = "1.5plugin.9n";',
    ],
],
[
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/ConfiguracionApli.js',
    'descripcion' => 'Bump de VERSION_PLUGIN',
    'buscar' => [
        'export const VERSION_PLUGIN = "1.5plugin.9m";',
    ],
    'reemplazar' => [
        'export const VERSION_PLUGIN = "1.5plugin.9n";',
    ],
],

];

// ============================================================
// Runner v2 (textual, ver prompt_sistema_scripts_v2.md §14)
// ============================================================

echo "=== Aplicador ===\n\n";

function detectar_eol(string $c): string { return (strpos($c, "\r\n") !== false) ? "\r\n" : "\n"; }
function normalizar_a_unix(string $c): string { return str_replace("\r\n", "\n", $c); }
function normalizar_a_original(string $c, string $e): string { return $e === "\n" ? $c : str_replace("\n", "\r\n", $c); }
function contar_ocurrencias(string $c, string $b): int {
    if ($b === '') return 0;
    $n = 0; $o = 0;
    while (($p = strpos($c, $b, $o)) !== false) { $n++; $o = $p + strlen($b); }
    return $n;
}

if (!isset($htmls_a_bumpear) || !is_array($htmls_a_bumpear)) {
    $htmls_a_bumpear = ['aplicacion_GET.html'];
}
if (!isset($version_nueva)) $version_nueva = '';
$version_nueva = trim((string)$version_nueva);
$bumpear = ($version_nueva !== '');

$creaciones = [];
$eliminaciones = [];
$reemplazos_por_archivo = [];

foreach ($cambios as $cambio) {
    $tipo = $cambio['tipo'] ?? 'reemplazar';
    if ($tipo === 'crear') { $creaciones[] = $cambio; continue; }
    if ($tipo === 'eliminar') { $eliminaciones[] = $cambio; continue; }
    if (!isset($cambio['archivo']) || !isset($cambio['buscar']) || !isset($cambio['reemplazar'])) {
        echo "[FALLO] Cambio mal formado.\n"; exit(1);
    }
    $reemplazos_por_archivo[$cambio['archivo']][] = $cambio;
}

$total_reemplazos = 0;
foreach ($reemplazos_por_archivo as $l) $total_reemplazos += count($l);
echo "[INFO] " . count($reemplazos_por_archivo) . " archivo(s) a reemplazar, "
    . count($creaciones) . " a crear, " . count($eliminaciones) . " a eliminar.\n\n";

$archivos_a_escribir = [];
$bloques_ok = 0;
$bloques_fallidos = [];

foreach ($reemplazos_por_archivo as $archivo_rel => $lista) {
    $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
    if (!file_exists($ruta_abs)) { $bloques_fallidos[] = "Archivo no encontrado: $archivo_rel"; continue; }
    $contenido_original = file_get_contents($ruta_abs);
    if ($contenido_original === false) { $bloques_fallidos[] = "No se pudo leer: $archivo_rel"; continue; }
    $eol = detectar_eol($contenido_original);
    $contenido = normalizar_a_unix($contenido_original);
    $contenido_antes = $contenido;
    $hubo_error = false;
    foreach ($lista as $cambio) {
        $buscar_str = implode("\n", $cambio['buscar']);
        $reemplazar_str = implode("\n", $cambio['reemplazar']);
        $n = contar_ocurrencias($contenido, $buscar_str);
        if ($n === 0) { $bloques_fallidos[] = "$archivo_rel: no encontrado - {$cambio['descripcion']}"; $hubo_error = true; continue; }
        if ($n > 1) { $bloques_fallidos[] = "$archivo_rel: ambiguo ($n) - {$cambio['descripcion']}"; $hubo_error = true; continue; }
        $contenido = str_replace($buscar_str, $reemplazar_str, $contenido);
        $bloques_ok++;
    }
    if (!$hubo_error && $contenido !== $contenido_antes) {
        $archivos_a_escribir[$ruta_abs] = [$contenido, $eol];
    }
}

if ($modo_estricto && !empty($bloques_fallidos)) {
    echo "=== ABORTADO ===\n";
    foreach ($bloques_fallidos as $f) echo "  [FALLO] $f\n";
    exit(1);
}

$archivos_bump_php_js = [];
$archivos_bump_js_css = [];
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    $rel = substr($ruta_abs, strlen($raiz_proyecto) + 1);
    $ext = strtolower(pathinfo($ruta_abs, PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump_php_js[] = $rel;
    if ($ext === 'js' || $ext === 'css') $archivos_bump_js_css[] = $rel;
}
foreach ($creaciones as $cr) {
    $ext = strtolower(pathinfo($cr['archivo'], PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump_php_js[] = $cr['archivo'];
    if ($ext === 'js' || $ext === 'css') $archivos_bump_js_css[] = $cr['archivo'];
}

$bumps_atversion = 0;
$bumps_qv = 0;
$bumps_detalle = [];
$info_bumps = [];

if ($bumpear) {
    foreach (array_unique($archivos_bump_php_js) as $archivo_rel) {
        $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
        if (!file_exists($ruta_abs)) continue;
        if (isset($archivos_a_escribir[$ruta_abs])) {
            list($contenido, $eol) = $archivos_a_escribir[$ruta_abs];
        } else {
            $contenido_original = file_get_contents($ruta_abs);
            $eol = detectar_eol($contenido_original);
            $contenido = normalizar_a_unix($contenido_original);
        }
        $patron = '/(\*\s+@version\s+)(\S+)/';
        $viejo = '';
        $nuevo = preg_replace_callback($patron, function($m) use ($version_nueva, &$viejo) {
            $viejo = $m[2];
            return $m[1] . $version_nueva;
        }, $contenido, 1, $count);
        if ($count === 0) { $info_bumps[] = "$archivo_rel (sin @version)"; continue; }
        if ($viejo === $version_nueva) { continue; }
        $archivos_a_escribir[$ruta_abs] = [normalizar_a_unix($nuevo), $eol];
        $bumps_atversion++;
        $bumps_detalle[] = "$archivo_rel  @version $viejo -> $version_nueva";
    }

    foreach ($htmls_a_bumpear as $html_rel) {
        $html_abs = $raiz_proyecto . '/' . $html_rel;
        if (!file_exists($html_abs)) { $info_bumps[] = "$html_rel (no encontrado)"; continue; }
        if (isset($archivos_a_escribir[$html_abs])) {
            list($html, $eol) = $archivos_a_escribir[$html_abs];
        } else {
            $html_orig = file_get_contents($html_abs);
            $eol = detectar_eol($html_orig);
            $html = normalizar_a_unix($html_orig);
        }
        $html_antes = $html;
        foreach (array_unique($archivos_bump_js_css) as $archivo_rel) {
            $base = basename($archivo_rel);
            $base_esc = preg_quote($base, '/');
            $patron = '/(' . $base_esc . '\?v=)([^"\'\s>]+)/';
            $viejo_qv = '';
            $html = preg_replace_callback($patron, function($m) use ($version_nueva, &$viejo_qv) {
                $viejo_qv = $m[2];
                return $m[1] . $version_nueva;
            }, $html, 1, $c_qv);
            if ($c_qv > 0 && $viejo_qv !== $version_nueva) {
                $bumps_qv++;
                $bumps_detalle[] = "$html_rel  $base ?v= $viejo_qv -> $version_nueva";
            }
        }
        if ($html !== $html_antes) {
            $archivos_a_escribir[$html_abs] = [normalizar_a_unix($html), $eol];
        }
    }
}

$archivos_escritos = 0;
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    list($contenido_unix, $eol) = $info;
    $contenido_final = normalizar_a_original($contenido_unix, $eol);
    if (file_put_contents($ruta_abs, $contenido_final) === false) {
        echo "[FALLO] No se pudo escribir: " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n";
        continue;
    }
    $archivos_escritos++;
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
    if (!file_exists($ruta_abs)) { echo "[INFO] " . $elim['archivo'] . " no existía.\n"; continue; }
    if (unlink($ruta_abs)) echo "[OK] " . $elim['archivo'] . " (eliminado)\n";
    else echo "[FALLO] No se pudo eliminar: " . $elim['archivo'] . "\n";
}

if ($bumpear && (!empty($bumps_detalle) || !empty($info_bumps))) {
    echo "\n--- Bumps ---\n";
    foreach ($bumps_detalle as $d) echo "[BUMP] $d\n";
    foreach ($info_bumps as $i) echo "[INFO] $i\n";
}

echo "\n=== Resumen ===\n";
echo "Bloques aplicados: $bloques_ok\n";
echo "Archivos escritos: $archivos_escritos\n";
if ($bumpear) {
    echo "Bumps @version:    $bumps_atversion\n";
    echo "Bumps ?v=:         $bumps_qv\n";
}
if (!empty($bloques_fallidos)) {
    echo "Fallos: " . count($bloques_fallidos) . "\n";
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";