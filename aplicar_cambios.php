<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda v1.5plugin.2 — limpieza de anglicismos.
 *
 * Renombres:
 * - Aplicacion/bootstrap.js        -> Aplicacion/arranque.js
 * - Aplicacion/background.js       -> Aplicacion/servicio.js
 * - Aplicacion/content.js          -> Aplicacion/contenido.js
 * - Aplicacion/popup.html          -> Aplicacion/ventana.html
 * - Aplicacion/popup.js            -> Aplicacion/ventana.js
 * - Aplicacion/pruebas/prueba_01_smoke.js
 *                                  -> Aplicacion/pruebas/prueba_01_arranque.js
 *
 * Cambios internos:
 * - Mensajes SW <-> contenido: "ping" -> "saludo", "pong" -> "respuesta",
 *   "click" -> "clic", "fetch_post" -> "pedir_post".
 * - ctx de las pruebas: `click` -> `clic`, `fetch_post` -> `pedir_post`.
 * - Prueba "smoke" -> "arranque".
 * - manifest.json: paths y version 1.5.2.
 * - Prompt del plugin: reescrito en v1.5plugin.2.
 *
 * Lo que NO se toca: "plugin" se mantiene (nombre muy conocido), las
 * claves del manifest y la API de Chrome son fijas, y en comentarios se
 * siguen usando "service worker", "content script" y "popup" como
 * términos técnicos del ecosistema.
 *
 * Uso (parado en iteradoresJS/):
 *   php aplicar_cambios.php
 *
 * Si PHP no está en el PATH del sistema:
 *   C:\xampp\php\php.exe aplicar_cambios.php
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
    // manifest.json — reemplazo de paths y bump de version
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'manifest.json',
        'descripcion' => 'manifest.json: version 1.5.2',
        'buscar' => [
            '  "version": "1.5.1",',
        ],
        'reemplazar' => [
            '  "version": "1.5.2",',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'manifest.json',
        'descripcion' => 'manifest.json: apuntar a ventana.html',
        'buscar' => [
            '    "default_popup": "Aplicacion/popup.html",',
        ],
        'reemplazar' => [
            '    "default_popup": "Aplicacion/ventana.html",',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'manifest.json',
        'descripcion' => 'manifest.json: apuntar a servicio.js',
        'buscar' => [
            '    "service_worker": "Aplicacion/background.js",',
        ],
        'reemplazar' => [
            '    "service_worker": "Aplicacion/servicio.js",',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'manifest.json',
        'descripcion' => 'manifest.json: apuntar a contenido.js',
        'buscar' => [
            '      "js": ["Aplicacion/content.js"],',
        ],
        'reemplazar' => [
            '      "js": ["Aplicacion/contenido.js"],',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/catalogo.js — reemplazo del import
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo.js: apuntar a prueba_01_arranque',
        'buscar' => [
            'import { prueba as smoke } from "./prueba_01_smoke.js";',
            '',
            'export const CATALOGO = [',
            '    smoke',
            '];',
        ],
        'reemplazar' => [
            'import { prueba as arranque } from "./prueba_01_arranque.js";',
            '',
            'export const CATALOGO = [',
            '    arranque',
            '];',
        ],
    ],

    // ============================================================
    // Archivos nuevos (renombrados con contenido actualizado)
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/arranque.js',
        'descripcion' => 'arranque.js (era bootstrap.js)',
        'contenido' => [
            '/**',
            ' * Arranque del framework Iteradores en el service worker.',
            ' *',
            ' * Responsabilidades:',
            ' * - Forzar salida en modo consola (el SW no tiene document).',
            ' * - Fijar modo desarrollo (habilita `permite_pruebas`).',
            ' * - Configurar `Conf` con valores propios del plugin.',
            ' * - Cargar el Controlador dinamicamente despues de configurar',
            ' *   Conf, para que la persistencia tome el nombre correcto',
            ' *   de la BD IndexedDB.',
            ' *',
            ' * @version 1.5plugin.2',
            ' */',
            '',
            'import { Conf, Entorno } from "../Configuracion/index.js";',
            'import { configurar_conf } from "./ConfPlugin.js";',
            '',
            '// Salida consola: los caminos HTML del framework tocan document,',
            '// que no existe en el service worker.',
            'Entorno.establecer_salida(Entorno.SALIDA_CONSOLA);',
            'Entorno.establecer_modo(Entorno.MODO_DESARROLLO);',
            '',
            '// Config propia del plugin.',
            'configurar_conf(Conf);',
            '',
            'let _controlador = null;',
            '',
            '/**',
            ' * Devuelve el Controlador ya inicializado. La primera llamada',
            ' * dispara el import dinamico del modulo `Controlador`, que',
            ' * a su vez llama a `Controlador.inicializar()` al final de su',
            ' * evaluacion.',
            ' *',
            ' * Espera activamente a que `clase_actual` quede seteada como',
            ' * senal de que la inicializacion termino. Despues fuerza el',
            ' * metodo de persistencia a `IndexedDB` (el framework por',
            ' * defecto usa `EIndexedDB`).',
            ' *',
            ' * @returns {Promise<typeof Controlador>}',
            ' */',
            'export async function obtener_controlador() {',
            '    if (_controlador && _controlador.clase_actual) return _controlador;',
            '',
            '    const mod = await import("../Controlador/index.js");',
            '    _controlador = mod.Controlador;',
            '',
            '    const inicio = Date.now();',
            '    while (!_controlador.clase_actual) {',
            '        if (Date.now() - inicio > 5000) {',
            '            throw new Error("El Controlador no termino de inicializar en 5s");',
            '        }',
            '        await new Promise((r) => setTimeout(r, 20));',
            '    }',
            '',
            '    try {',
            '        _controlador.establecer_metodo("IndexedDB");',
            '    } catch (e) {',
            '        console.warn("No se pudo forzar IndexedDB:", e);',
            '    }',
            '',
            '    return _controlador;',
            '}',
        ],
    ],

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js (era background.js)',
        'contenido' => [
            '/**',
            ' * Service worker del plugin de pruebas.',
            ' *',
            ' * Escucha mensajes de la ventana del plugin (popup):',
            ' * - `listar_pruebas`  -> devuelve el catalogo.',
            ' * - `correr_prueba`   -> ejecuta una prueba y persiste el resultado.',
            ' * - `listar_corridas` -> devuelve las ultimas corridas del grafo.',
            ' *',
            ' * @version 1.5plugin.2',
            ' */',
            '',
            'import { obtener_controlador } from "./arranque.js";',
            'import { registrar_corrida, listar_ultimas_corridas } from "./GrafoPlugin.js";',
            'import { CATALOGO } from "./pruebas/catalogo.js";',
            '',
            'const URLS_PILOTO = ["http://localhost/", "http://127.0.0.1/"];',
            '',
            'function _es_url_piloto(url) {',
            '    if (!url) return false;',
            '    return URLS_PILOTO.some((prefijo) => url.startsWith(prefijo));',
            '}',
            '',
            'async function _obtener_pestana_piloto() {',
            '    const pestanas = await chrome.tabs.query({});',
            '    return pestanas.find((t) => _es_url_piloto(t.url)) || null;',
            '}',
            '',
            'async function _enviar_a_pestana(pestana_id, tipo, datos) {',
            '    try {',
            '        return await chrome.tabs.sendMessage(pestana_id, { tipo, datos });',
            '    } catch (e) {',
            '        return {',
            '            exito: false,',
            '            error: "No se pudo contactar al script de contenido: " + e.message +',
            '                   " (probá recargar la pestaña del piloto)"',
            '        };',
            '    }',
            '}',
            '',
            '/**',
            ' * Construye el objeto `ctx` que reciben las pruebas.',
            ' */',
            'function _crear_ctx(pestana_id) {',
            '    async function enviar(tipo, datos) {',
            '        return await _enviar_a_pestana(pestana_id, tipo, datos);',
            '    }',
            '    return {',
            '        pestana_id,',
            '        enviar,',
            '        clic: (sel) => enviar("clic", { selector: sel }),',
            '        escribir: (sel, txt) => enviar("escribir", { selector: sel, texto: txt }),',
            '        esperar: (sel, timeout_ms = 5000) => enviar("esperar_elemento", { selector: sel, timeout_ms }),',
            '        texto: (sel) => enviar("obtener_texto", { selector: sel }),',
            '        html: (sel) => enviar("obtener_html", { selector: sel }),',
            '        pedir_post: (url, body) => enviar("pedir_post", { url, body }),',
            '        assert(cond, msg) {',
            '            if (!cond) throw new Error(msg || "Aserción fallida");',
            '        }',
            '    };',
            '}',
            '',
            'async function _correr_prueba(id_prueba) {',
            '    const prueba = CATALOGO.find((p) => p.id === id_prueba);',
            '    if (!prueba) {',
            '        return { exito: false, error: "Prueba no encontrada: " + id_prueba };',
            '    }',
            '',
            '    const pestana = await _obtener_pestana_piloto();',
            '    if (!pestana) {',
            '        return { exito: false, error: "No hay una pestaña del piloto abierta" };',
            '    }',
            '',
            '    const ctx = _crear_ctx(pestana.id);',
            '    const inicio = Date.now();',
            '    let resultado = "ok";',
            '    let detalle = "";',
            '',
            '    try {',
            '        await prueba.ejecutar(ctx);',
            '    } catch (e) {',
            '        resultado = "fallo";',
            '        detalle = e && e.message ? e.message : String(e);',
            '    }',
            '',
            '    const duracion_ms = Date.now() - inicio;',
            '',
            '    try {',
            '        await registrar_corrida({',
            '            id_prueba,',
            '            fecha_hora: new Date().toISOString(),',
            '            resultado,',
            '            duracion_ms,',
            '            detalle',
            '        });',
            '    } catch (e) {',
            '        console.error("No se pudo persistir la corrida:", e);',
            '    }',
            '',
            '    return { exito: true, resultado, detalle, duracion_ms };',
            '}',
            '',
            'chrome.runtime.onMessage.addListener((mensaje, sender, sendResponse) => {',
            '    if (!mensaje || !mensaje.tipo) return false;',
            '',
            '    (async () => {',
            '        try {',
            '            switch (mensaje.tipo) {',
            '                case "listar_pruebas":',
            '                    sendResponse({',
            '                        exito: true,',
            '                        pruebas: CATALOGO.map((p) => ({',
            '                            id: p.id,',
            '                            nombre: p.nombre,',
            '                            descripcion: p.descripcion || ""',
            '                        }))',
            '                    });',
            '                    break;',
            '',
            '                case "correr_prueba":',
            '                    sendResponse(await _correr_prueba(mensaje.id_prueba));',
            '                    break;',
            '',
            '                case "listar_corridas":',
            '                    await obtener_controlador();',
            '                    const corridas = await listar_ultimas_corridas(mensaje.limite || 20);',
            '                    sendResponse({ exito: true, corridas });',
            '                    break;',
            '',
            '                default:',
            '                    sendResponse({ exito: false, error: "Mensaje desconocido: " + mensaje.tipo });',
            '            }',
            '        } catch (e) {',
            '            sendResponse({ exito: false, error: e && e.message ? e.message : String(e) });',
            '        }',
            '    })();',
            '',
            '    return true; // mantener canal abierto para respuesta async',
            '});',
        ],
    ],

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'contenido.js (era content.js)',
        'contenido' => [
            '/**',
            ' * Script de contenido del plugin de pruebas.',
            ' *',
            ' * Se inyecta en la pagina del piloto (localhost / 127.0.0.1).',
            ' * No puede ser module: la API de Chrome no lo permite para',
            ' * scripts de contenido.',
            ' *',
            ' * Escucha mensajes del service worker y ejecuta operaciones',
            ' * basicas sobre el DOM de la pagina. Todas las respuestas',
            ' * son objetos `{ exito, ... }`.',
            ' *',
            ' * @version 1.5plugin.2',
            ' */',
            '',
            '(function () {',
            '    "use strict";',
            '',
            '    function _query(selector) {',
            '        return document.querySelector(selector);',
            '    }',
            '',
            '    function _disparar(el, tipo) {',
            '        const ev = new Event(tipo, { bubbles: true, cancelable: true });',
            '        el.dispatchEvent(ev);',
            '    }',
            '',
            '    function _esperar_elemento(selector, timeout_ms) {',
            '        return new Promise((resolve) => {',
            '            const existente = _query(selector);',
            '            if (existente) {',
            '                resolve({ exito: true });',
            '                return;',
            '            }',
            '            const inicio = Date.now();',
            '            const intervalo = setInterval(() => {',
            '                const el = _query(selector);',
            '                if (el) {',
            '                    clearInterval(intervalo);',
            '                    resolve({ exito: true });',
            '                } else if (Date.now() - inicio > timeout_ms) {',
            '                    clearInterval(intervalo);',
            '                    resolve({ exito: false, error: "timeout esperando " + selector });',
            '                }',
            '            }, 100);',
            '        });',
            '    }',
            '',
            '    async function _manejar(tipo, datos) {',
            '        switch (tipo) {',
            '            case "saludo":',
            '                return { exito: true, respuesta: true, url: location.href };',
            '',
            '            case "clic": {',
            '                const el = _query(datos.selector);',
            '                if (!el) return { exito: false, error: "No existe: " + datos.selector };',
            '                el.click();',
            '                return { exito: true };',
            '            }',
            '',
            '            case "escribir": {',
            '                const el = _query(datos.selector);',
            '                if (!el) return { exito: false, error: "No existe: " + datos.selector };',
            '                el.focus();',
            '                el.value = datos.texto;',
            '                _disparar(el, "input");',
            '                _disparar(el, "change");',
            '                return { exito: true };',
            '            }',
            '',
            '            case "esperar_elemento":',
            '                return await _esperar_elemento(datos.selector, datos.timeout_ms || 5000);',
            '',
            '            case "obtener_texto": {',
            '                const el = _query(datos.selector);',
            '                if (!el) return { exito: false, error: "No existe: " + datos.selector };',
            '                return { exito: true, valor: el.textContent || "" };',
            '            }',
            '',
            '            case "obtener_html": {',
            '                const el = _query(datos.selector);',
            '                if (!el) return { exito: false, error: "No existe: " + datos.selector };',
            '                return { exito: true, valor: el.outerHTML || "" };',
            '            }',
            '',
            '            case "pedir_post": {',
            '                try {',
            '                    const resp = await fetch(datos.url, {',
            '                        method: "POST",',
            '                        headers: { "Content-Type": "application/x-www-form-urlencoded" },',
            '                        body: new URLSearchParams(datos.body || {}).toString(),',
            '                        credentials: "same-origin"',
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
            '            default:',
            '                return { exito: false, error: "Tipo desconocido: " + tipo };',
            '        }',
            '    }',
            '',
            '    chrome.runtime.onMessage.addListener((mensaje, sender, sendResponse) => {',
            '        if (!mensaje || !mensaje.tipo) return false;',
            '        _manejar(mensaje.tipo, mensaje.datos || {}).then(sendResponse);',
            '        return true; // respuesta asincrona',
            '    });',
            '})();',
        ],
    ],

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/ventana.html',
        'descripcion' => 'ventana.html (era popup.html)',
        'contenido' => [
            '<!DOCTYPE html>',
            '<html lang="es">',
            '<head>',
            '  <meta charset="UTF-8">',
            '  <title>Iteradores Pruebas</title>',
            '  <style>',
            '    body { font-family: sans-serif; margin: 0; padding: 12px; min-width: 340px; }',
            '    h1 { font-size: 14px; margin: 0 0 8px 0; }',
            '    ul { list-style: none; padding: 0; margin: 0; }',
            '    li { padding: 8px 0; border-bottom: 1px solid #eee; }',
            '    .prueba-nombre { font-weight: 600; }',
            '    .prueba-desc { font-size: 11px; color: #666; margin: 2px 0 4px 0; }',
            '    .acciones { display: flex; gap: 8px; align-items: center; margin-top: 4px; }',
            '    .resultado { font-size: 11px; padding: 3px 8px; border-radius: 4px; background: #f1f1f1; color: #555; }',
            '    .resultado-ok { background: #e6f4ea; color: #137333; }',
            '    .resultado-fallo { background: #fce8e6; color: #c5221f; }',
            '    .resultado-error { background: #fef7e0; color: #b06000; }',
            '    button { cursor: pointer; padding: 2px 10px; }',
            '    .estado { font-size: 11px; color: #888; margin-bottom: 6px; }',
            '  </style>',
            '</head>',
            '<body>',
            '  <h1>Iteradores Pruebas</h1>',
            '  <div class="estado" id="mensaje_estado">Cargando...</div>',
            '  <ul id="lista_pruebas"></ul>',
            '  <script src="ventana.js"></script>',
            '</body>',
            '</html>',
        ],
    ],

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/ventana.js',
        'descripcion' => 'ventana.js (era popup.js)',
        'contenido' => [
            '/**',
            ' * Logica de la ventana del plugin (popup de Chrome).',
            ' *',
            ' * Pide al service worker la lista de pruebas, las renderiza',
            ' * con un boton play cada una, y muestra el resultado de la',
            ' * corrida al lado. No usa imports (no es module).',
            ' *',
            ' * @version 1.5plugin.2',
            ' */',
            '',
            'document.addEventListener("DOMContentLoaded", () => {',
            '    const lista = document.getElementById("lista_pruebas");',
            '    const estado = document.getElementById("mensaje_estado");',
            '',
            '    function mostrar_estado(texto) {',
            '        estado.textContent = texto;',
            '    }',
            '',
            '    async function correr(id, li) {',
            '        const el = li.querySelector(".resultado");',
            '        el.textContent = "Corriendo...";',
            '        el.className = "resultado";',
            '',
            '        const resp = await chrome.runtime.sendMessage({',
            '            tipo: "correr_prueba",',
            '            id_prueba: id',
            '        });',
            '',
            '        if (!resp || !resp.exito) {',
            '            el.textContent = "Error: " + (resp && resp.error ? resp.error : "desconocido");',
            '            el.className = "resultado resultado-error";',
            '            return;',
            '        }',
            '',
            '        if (resp.resultado === "ok") {',
            '            el.textContent = "OK (" + resp.duracion_ms + " ms)";',
            '            el.className = "resultado resultado-ok";',
            '        } else {',
            '            el.textContent = "Fallo: " + (resp.detalle || "sin detalle");',
            '            el.className = "resultado resultado-fallo";',
            '        }',
            '    }',
            '',
            '    async function renderizar() {',
            '        const resp = await chrome.runtime.sendMessage({ tipo: "listar_pruebas" });',
            '        lista.innerHTML = "";',
            '',
            '        if (!resp || !resp.exito) {',
            '            mostrar_estado("Error: " + (resp && resp.error ? resp.error : "desconocido"));',
            '            return;',
            '        }',
            '',
            '        mostrar_estado(resp.pruebas.length + " prueba(s) disponibles");',
            '',
            '        resp.pruebas.forEach((p) => {',
            '            const li = document.createElement("li");',
            '            li.innerHTML =',
            '                \'<div class="prueba-nombre">\' + p.nombre + \'</div>\' +',
            '                \'<div class="prueba-desc">\' + (p.descripcion || "") + \'</div>\' +',
            '                \'<div class="acciones">\' +',
            '                \'  <button data-id="\' + p.id + \'">▶</button>\' +',
            '                \'  <span class="resultado">—</span>\' +',
            '                \'</div>\';',
            '            li.querySelector("button").addEventListener("click", () => correr(p.id, li));',
            '            lista.appendChild(li);',
            '        });',
            '    }',
            '',
            '    renderizar();',
            '});',
        ],
    ],

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_01_arranque.js',
        'descripcion' => 'prueba_01_arranque.js (era prueba_01_smoke.js)',
        'contenido' => [
            '/**',
            ' * Prueba de arranque: verifica que la extension habla con el',
            ' * script de contenido y que la pagina del piloto esta cargada.',
            ' *',
            ' * @version 1.5plugin.2',
            ' */',
            '',
            'export const prueba = {',
            '    id: "arranque",',
            '    nombre: "Arranque: plugin y script de contenido",',
            '    descripcion: "Verifica que el script de contenido responde al saludo y que la pantalla de login existe.",',
            '',
            '    async ejecutar(ctx) {',
            '        const saludo = await ctx.enviar("saludo", {});',
            '        ctx.assert(saludo && saludo.exito, "El script de contenido no respondio al saludo: " + (saludo && saludo.error ? saludo.error : ""));',
            '        ctx.assert(saludo.respuesta === true, "El script de contenido devolvio una respuesta inesperada");',
            '',
            '        const login = await ctx.esperar("#pantalla_login", 3000);',
            '        ctx.assert(login && login.exito, "No se encontro #pantalla_login en la pagina del piloto");',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // Prompt del plugin — reescritura completa
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt del plugin (v1.5plugin.2)',
        'contenido' => [
            '# Prompt de trabajo — Plugin de pruebas (Chrome MV3)',
            '',
            'Este es un prompt autocontenido con todo lo que sabemos sobre el',
            '**plugin piloto**: una extensión de Chrome (manifest v3) que corre',
            'pruebas automatizadas sobre la página del piloto PHP, usando el',
            'framework Iteradores JS para persistir su propia información.',
            '',
            'Vive en el propio proyecto, en',
            '`iteradoresJS/prompts/prompt_plugin_piloto.md`. El proyecto',
            '`iteradoresJS/` es un repo independiente del proyecto PHP; el',
            'prompt del framework Iteradores y el del sistema de scripts',
            'siguen viviendo en el proyecto PHP (`iteradores/prompts/`).',
            '',
            'Se actualiza con **cada tanda de código**. La sección',
            '**Discusión actual** (al final) es la fuente de verdad sobre',
            'dónde quedamos.',
            '',
            'Los scripts de aplicación de cambios se corren parados en la',
            'raíz de `iteradoresJS/` y usan el mismo formato y runner que en',
            'el proyecto PHP (ver `prompt_sistema_scripts.md` en el proyecto',
            'PHP).',
            '',
            '---',
            '',
            '## 1. VISIÓN DEL PLUGIN',
            '',
            '### 1.1 Objetivo',
            '',
            'Extensión de Chrome que permite correr pruebas automatizadas',
            'sobre la página del piloto PHP (agencia de viajes). El usuario',
            'abre la ventana del plugin (popup), ve una lista de pruebas',
            'disponibles, y aprieta un botón play en la que quiere correr.',
            'La extensión ejecuta la prueba contra la pestaña activa del',
            'piloto, y guarda el resultado en su propio grafo.',
            '',
            '### 1.2 Objetivos secundarios',
            '',
            '- Servir de ejercicio real del framework Iteradores JS',
            '  (persistido en IndexedDB del contexto de la extensión).',
            '- Aprovechar el sistema de comandos y el motor (comandos +',
            '  péndulo) cuando haga falta ejecución por fases.',
            '- Ser la base de una herramienta más amplia: inspeccionar el',
            '  grafo del piloto, generar reportes, correr tandas completas.',
            '',
            '### 1.3 Relación con el piloto PHP',
            '',
            'El plugin **no modifica** el piloto PHP. Solo lo observa y lo',
            'maneja como un usuario. Puede:',
            '',
            '- Leer el DOM de la página.',
            '- Hacer clics, escribir, esperar.',
            '- Hacer `fetch` a `index.php` con la sesión del usuario actual',
            '  (las cookies viajan por estar en el mismo origen que la',
            '  pestaña, siempre que el `fetch` se haga desde el script de',
            '  contenido).',
            '',
            '---',
            '',
            '## 2. ESTRUCTURA DE ARCHIVOS',
            '',
            '**Raíz de `iteradoresJS/`:**',
            '',
            '- `manifest.json` — manifiesto MV3. **Debe estar en la raíz**',
            '  del directorio cargado como extensión; Chrome no acepta',
            '  manifiestos anidados. El código apunta a `Aplicacion/...`',
            '  vía paths relativos.',
            '- Framework (`Nodos/`, `Iteradores/`, `Controlador/`,',
            '  `Configuracion/`, `miscelaneas/`, `Persistencia/`, etc.) —',
            '  sin tocar.',
            '- `index.html`, `index.js` — entrada web actual del framework,',
            '  sin tocar.',
            '',
            '**`prompts/`:**',
            '',
            '- `prompt_plugin_piloto.md` — este archivo.',
            '',
            '**`Aplicacion/`:**',
            '',
            '- `servicio.js` — service worker. **Module** (`type: "module"`',
            '  en el manifest). Arranca el framework, importa el catálogo',
            '  de pruebas y las corre por pedido de la ventana.',
            '- `contenido.js` — script de contenido clásico. Se inyecta en',
            '  la página del piloto. Expone funciones vía mensajería.',
            '- `ventana.html` / `ventana.js` — interfaz de la ventana',
            '  (popup de Chrome). Lista las pruebas, muestra el resultado',
            '  de la última corrida.',
            '- `arranque.js` — arranque del framework en el service worker.',
            '  Fuerza `Entorno` a modo consola y `salida=consola`, y',
            '  configura `ConfPlugin`.',
            '- `ConfPlugin.js` — configuración propia del plugin (nombre de',
            '  app, nombre de la BD IndexedDB).',
            '- `GrafoPlugin.js` — capa fina sobre el framework: persistir',
            '  corridas, leer historial, etc.',
            '- `pruebas/` — catálogo de pruebas. Cada prueba es un módulo ES',
            '  que exporta un objeto `{id, nombre, descripcion, ejecutar}`.',
            '  `pruebas/catalogo.js` las lista.',
            '',
            '---',
            '',
            '## 3. LIMITACIONES Y DECISIONES TÉCNICAS',
            '',
            '### 3.1 Manifest en la raíz',
            '',
            'Chrome MV3 exige que `manifest.json` esté en la raíz del',
            'directorio que se carga como extensión. Como el plugin necesita',
            'importar `../Nodos/Nodo.js` y demás archivos del framework, el',
            'manifest tiene que estar un nivel arriba de `Aplicacion/`,',
            'esto es, en la raíz del proyecto `iteradoresJS/`.',
            '',
            'Los paths del manifest son relativos a esa raíz:',
            '',
            '    "background": { "service_worker": "Aplicacion/servicio.js", "type": "module" }',
            '    "action":     { "default_popup":    "Aplicacion/ventana.html" }',
            '    "content_scripts": [{ "js": ["Aplicacion/contenido.js"] }]',
            '',
            '### 3.2 Service worker en modo consola',
            '',
            'En un service worker no existe `document`. Los caminos HTML del',
            'framework (`_imprimir_errores_html`, `html_errores`,',
            '`_imprimir_alertas_html`, `html_alertas`, `Nodo._imprimir_html`,',
            '`Controlador.imprimir_superestructura`) tocan `document` y',
            'romperían. Se evitan asegurando que `Entorno.es_consola()`',
            'devuelva `true` en el arranque del SW.',
            '',
            '### 3.3 Script de contenido clásico',
            '',
            'Los scripts de contenido de MV3 no pueden ser módulos ES. Se',
            'comunican con el service worker por mensajería:',
            '',
            '- SW → contenido: `chrome.tabs.sendMessage(pestana_id, { tipo, datos })`.',
            '- Contenido → SW: `chrome.runtime.sendMessage({ tipo, datos })`.',
            '',
            'El SW hace de orquestador: importa las pruebas, coordina las',
            'llamadas al script de contenido, persiste resultados.',
            '',
            '### 3.4 Token de seguridad',
            '',
            'El plugin **no maneja el token** del framework. El Controlador',
            'lo recibe automáticamente cuando el módulo `Controlador` se',
            'evalúa (vía `Nodo.registrar_controlador`). Para código que',
            'necesite el token, se usa:',
            '',
            '    await Controlador.ejecutar_prueba((token) => {',
            '        // usar token',
            '    });',
            '',
            '### 3.5 Motor (comandos + péndulo)',
            '',
            'El motor y el sistema de comandos **no se usan en la primera',
            'versión**. Quedan disponibles para cuando haga falta ejecución',
            'por fases. Recordatorio sobre la config:',
            '',
            '- `MOTOR_MAX_CICLOS` — ciclos **totales** que ejecuta el motor',
            '  antes de detenerse. `0` = infinito.',
            '- `MOTOR_QUANTUM` — comandos ejecutados por ciclo.',
            '- `MOTOR_CICLOS_POR_MINUTO` — frecuencia.',
            '',
            '### 3.6 Geolocalización',
            '',
            '`Controlador.inicializar()` intenta obtener coordenadas',
            '(navegador → IP → fallback). En el SW puede fallar. Ya tiene',
            'fallback a coordenadas predeterminadas en `Conf`, así que no',
            'es bloqueante.',
            '',
            '### 3.7 Vocabulario',
            '',
            'Preferimos español para todo lo propio del plugin. Las palabras',
            'que Chrome impone (`manifest.json`, claves del manifest, API de',
            '`chrome.*`) quedan como están. En comentarios se aceptan los',
            'términos técnicos del ecosistema: "service worker", "script de',
            'contenido" (o "content script"), "popup" (o "ventana"),',
            '"plugin". Los archivos propios llevan nombres en español:',
            '`arranque.js`, `servicio.js`, `contenido.js`, `ventana.html`,',
            '`ventana.js`.',
            '',
            '---',
            '',
            '## 4. FORMATO DE PRUEBA',
            '',
            'Cada prueba es un módulo ES con un objeto exportado:',
            '',
            '    export const prueba = {',
            '        id: "arranque",',
            '        nombre: "Arranque: plugin y script de contenido",',
            '        descripcion: "Verifica que el script de contenido responde...",',
            '        async ejecutar(ctx) {',
            '            // ctx.pestana_id  -> id de la pestaña del piloto',
            '            // ctx.enviar      -> envía un mensaje crudo al script de contenido',
            '            // ctx.clic        -> click sobre un selector',
            '            // ctx.escribir    -> escribe en un input',
            '            // ctx.esperar     -> espera a que exista un selector',
            '            // ctx.texto       -> devuelve el textContent de un selector',
            '            // ctx.html        -> devuelve el outerHTML de un selector',
            '            // ctx.pedir_post  -> POST urlencoded a index.php',
            '            // ctx.assert      -> aserción simple',
            '        }',
            '    };',
            '',
            '`ctx` lo provee el service worker. La prueba no habla',
            'directamente con la API de Chrome; todo pasa por `ctx`.',
            '',
            '### 4.1 Resultado',
            '',
            'Cada corrida persiste un nodo en el grafo del plugin con:',
            '',
            '- `id_prueba`',
            '- `fecha_hora` (ISO)',
            '- `resultado` (`"ok"` / `"fallo"` / `"error"`)',
            '- `duracion_ms`',
            '- `detalle` (texto libre)',
            '',
            '---',
            '',
            '## 5. ESTADO ACTUAL',
            '',
            '**Proyecto en v1.5plugin.2.** El esqueleto del plugin está',
            'armado y funcional, con nombres en español. Archivos:',
            '',
            '- `manifest.json` — manifiesto MV3 en la raíz.',
            '- `Aplicacion/servicio.js` — service worker (module).',
            '- `Aplicacion/contenido.js` — script de contenido clásico.',
            '- `Aplicacion/ventana.html` / `ventana.js` — interfaz de la',
            '  ventana.',
            '- `Aplicacion/arranque.js` — arranque del framework en el SW.',
            '- `Aplicacion/ConfPlugin.js` — configuración propia.',
            '- `Aplicacion/GrafoPlugin.js` — capa sobre el framework.',
            '- `Aplicacion/pruebas/catalogo.js` — catálogo de pruebas.',
            '- `Aplicacion/pruebas/prueba_01_arranque.js` — primera prueba.',
            '',
            '---',
            '',
            '## 6. DISCUSIÓN ACTUAL',
            '',
            '**Última actualización de este prompt:** v1.5plugin.2 (limpieza',
            'de anglicismos: archivos, mensajes internos y ctx renombrados',
            'al español).',
            '',
            '**Decisiones tomadas:**',
            '',
            '- Manifest en la raíz de `iteradoresJS/` (opción A).',
            '- Código del plugin en `Aplicacion/`.',
            '- Persistencia con `PerdurarSuperestructuraStringIndexedDB`.',
            '- Salida en modo consola dentro del service worker.',
            '- Script de contenido clásico, comunicación por mensajería.',
            '- Formato de prueba declarativo con objeto `{id, nombre,',
            '  ejecutar(ctx)}`.',
            '- El motor y los comandos no se usan en la primera versión.',
            '- Nombre de app del plugin: `IteradoresPluginPruebas`.',
            '- Prefijo de versión del plugin: `v1.5plugin.*`.',
            '- Español para nombres propios del plugin. "Plugin" se mantiene',
            '  (nombre muy conocido). Las palabras del ecosistema Chrome',
            '  (`manifest`, `service worker`, `content script`, `popup`)',
            '  se aceptan en comentarios y en el manifest.',
            '',
            '**Permisos del manifest (borrador):**',
            '',
            '- `host_permissions`: `http://localhost/*` y',
            '  `http://127.0.0.1/*`. Si se prueba contra producción, se',
            '  agrega el dominio.',
            '- `permissions`: `activeTab`, `tabs`.',
            '',
            '**Vocabulario consolidado (v1.5plugin.2):**',
            '',
            '| Concepto | Nombre en el proyecto |',
            '|---|---|',
            '| Archivo de arranque | `arranque.js` |',
            '| Service worker | archivo `servicio.js` |',
            '| Content script | archivo `contenido.js` |',
            '| Popup | archivo `ventana.html` / `ventana.js` |',
            '| Mensaje de saludo SW→contenido | `"saludo"` (respuesta `respuesta`) |',
            '| Clic desde ctx | `ctx.clic(sel)` |',
            '| POST desde ctx | `ctx.pedir_post(url, body)` |',
            '| Prueba inicial | id `"arranque"` |',
            '',
            '**Pendiente:**',
            '',
            '- Escribir más pruebas en `Aplicacion/pruebas/` (más allá de la',
            '  de arranque).',
            '- Implementar el historial de corridas en la ventana (hoy solo',
            '  muestra el resultado de la corrida actual).',
            '- Definir la convención de nombres de prueba y de aserciones.',
            '- Revisar los permisos del manifest cuando se pruebe contra',
            '  un dominio real (hoy solo `localhost` / `127.0.0.1`).',
            '',
            '---',
            '',
            '**FIN DEL PROMPT**',
        ],
    ],

    // ============================================================
    // Eliminacion de los archivos con nombres viejos
    // ============================================================

    [
        'tipo' => 'eliminar',
        'archivo' => 'Aplicacion/bootstrap.js',
        'descripcion' => 'Renombrado a arranque.js',
    ],

    [
        'tipo' => 'eliminar',
        'archivo' => 'Aplicacion/background.js',
        'descripcion' => 'Renombrado a servicio.js',
    ],

    [
        'tipo' => 'eliminar',
        'archivo' => 'Aplicacion/content.js',
        'descripcion' => 'Renombrado a contenido.js',
    ],

    [
        'tipo' => 'eliminar',
        'archivo' => 'Aplicacion/popup.html',
        'descripcion' => 'Renombrado a ventana.html',
    ],

    [
        'tipo' => 'eliminar',
        'archivo' => 'Aplicacion/popup.js',
        'descripcion' => 'Renombrado a ventana.js',
    ],

    [
        'tipo' => 'eliminar',
        'archivo' => 'Aplicacion/pruebas/prueba_01_smoke.js',
        'descripcion' => 'Renombrado a prueba_01_arranque.js',
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