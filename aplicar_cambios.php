<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda v1.5plugin.3b — infra mínima + primera prueba real (login).
 * Corrección respecto de v1.5plugin.3a: bloques del prompt ajustados
 * al estado real del archivo, y bump de manifest.json pospuesto
 * (no se sabe la versión actual del archivo).
 *
 * Fix de la tanda:
 * - servicio.js: vuelve a imports estáticos. Chrome prohíbe
 *   `import()` dinámico en service workers por spec
 *   (w3c/ServiceWorker#1356).
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
    // Aplicacion/ConfPlugin.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js con URL_PILOTO y version 1.5plugin.3b',
        'contenido' => [
            '/**',
            ' * Configuracion propia del plugin de pruebas.',
            ' *',
            ' * Modifica los valores estaticos de la clase `Conf` compartida',
            ' * por el framework. Se llama desde `arranque.js` *antes* de',
            ' * importar el Controlador, para que la persistencia tome el',
            ' * nombre de la BD correcto.',
            ' *',
            ' * @version 1.5plugin.3b',
            ' */',
            '',
            'export function configurar_conf(Conf) {',
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.3b";',
            '    Conf.NOMBRE_BD_INDEXEDDB = "IteradoresPluginPruebas";',
            '    Conf.SUPERESTRUCTURA_NOMBRE_BD_INDEXEDDB = "IteradoresPluginPruebas";',
            '    Conf.SUPERESTRUCTURA_METODO_PERDURAR = "IndexedDB";',
            '}',
            '',
            'export const NOMBRE_GRAFO = "plugin_pruebas";',
            'export const VERSION_PLUGIN = "1.5plugin.3b";',
            '',
            '// URL del piloto PHP. Debe estar cubierta por host_permissions',
            '// y content_scripts.matches en manifest.json.',
            'export const URL_PILOTO = "http://localhost/iteradores/codigo.worktrees/v1.5i/";',
            '',
            '// Codigos de acceso de los usuarios del piloto, para las pruebas.',
            'export const CODIGO_ADMIN     = "IBD";',
            'export const CODIGO_DUENO     = "carmen1";',
            'export const CODIGO_TERMINAL1 = "carmen2";',
            'export const CODIGO_TERMINAL2 = "lujan2";',
            'export const CODIGO_SOPORTE   = "manolo3";',
        ],
    ],

    // ============================================================
    // Aplicacion/contenido.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'contenido.js con comandos de visibilidad',
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
            ' * @version 1.5plugin.3b',
            ' */',
            '',
            '(function () {',
            '    "use strict";',
            '',
            '    function _query(selector) {',
            '        return document.querySelector(selector);',
            '    }',
            '',
            '    function _es_visible(el) {',
            '        if (!el) return false;',
            '        if (el.offsetParent === null && el.tagName !== "BODY") return false;',
            '        const estilo = window.getComputedStyle(el);',
            '        if (estilo.display === "none") return false;',
            '        if (estilo.visibility === "hidden") return false;',
            '        if (parseFloat(estilo.opacity) === 0) return false;',
            '        return true;',
            '    }',
            '',
            '    function _disparar(el, tipo) {',
            '        const ev = new Event(tipo, { bubbles: true, cancelable: true });',
            '        el.dispatchEvent(ev);',
            '    }',
            '',
            '    function _esperar_condicion(predicado, timeout_ms) {',
            '        return new Promise((resolve) => {',
            '            if (predicado()) {',
            '                resolve({ exito: true });',
            '                return;',
            '            }',
            '            const inicio = Date.now();',
            '            const intervalo = setInterval(() => {',
            '                if (predicado()) {',
            '                    clearInterval(intervalo);',
            '                    resolve({ exito: true });',
            '                } else if (Date.now() - inicio > timeout_ms) {',
            '                    clearInterval(intervalo);',
            '                    resolve({ exito: false, error: "timeout" });',
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
            '            case "esperar_elemento": {',
            '                return await _esperar_condicion(',
            '                    () => _query(datos.selector) !== null,',
            '                    datos.timeout_ms || 5000',
            '                );',
            '            }',
            '',
            '            case "esta_visible": {',
            '                return { exito: true, visible: _es_visible(_query(datos.selector)) };',
            '            }',
            '',
            '            case "esperar_visible": {',
            '                return await _esperar_condicion(',
            '                    () => _es_visible(_query(datos.selector)),',
            '                    datos.timeout_ms || 5000',
            '                );',
            '            }',
            '',
            '            case "esperar_oculto": {',
            '                return await _esperar_condicion(',
            '                    () => !_es_visible(_query(datos.selector)),',
            '                    datos.timeout_ms || 5000',
            '                );',
            '            }',
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

    // ============================================================
    // Aplicacion/servicio.js — imports estáticos + ctx ampliado
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js con imports estaticos y ctx ampliado',
        'contenido' => [
            '/**',
            ' * Service worker del plugin de pruebas.',
            ' *',
            ' * Importante: los service workers de Chrome (MV3) NO permiten',
            ' * `import()` dinamico ("import() is disallowed on',
            ' * ServiceWorkerGlobalScope by the HTML specification"). Por eso',
            ' * este archivo usa imports ESTATICOS.',
            ' *',
            ' * El listener de mensajes se registra al final del archivo. Si',
            ' * alguno de los imports estaticos falla, el service worker no',
            ' * se registra en absoluto (Chrome muestra "unknown error when',
            ' * fetching the script"). Para detectar ese tipo de problemas',
            ' * esta `auditar_plugin.php` (seccion 5, archivos sospechosamente',
            ' * vacios; seccion 3, imports rotos).',
            ' *',
            ' * Mensajes que atiende:',
            ' * - `listar_pruebas`  -> devuelve el catalogo.',
            ' * - `correr_prueba`   -> ejecuta una prueba y persiste el resultado.',
            ' * - `listar_corridas` -> devuelve las ultimas corridas del grafo.',
            ' *',
            ' * @version 1.5plugin.3b',
            ' */',
            '',
            'import { URL_PILOTO } from "./ConfPlugin.js";',
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
            'function _crear_ctx(pestana_id) {',
            '    async function enviar(tipo, datos) {',
            '        return await _enviar_a_pestana(pestana_id, tipo, datos);',
            '    }',
            '    return {',
            '        pestana_id,',
            '        url_base: URL_PILOTO,',
            '        enviar,',
            '        // === comandos basicos ===',
            '        clic: (sel) => enviar("clic", { selector: sel }),',
            '        escribir: (sel, txt) => enviar("escribir", { selector: sel, texto: txt }),',
            '        esperar: (sel, timeout_ms = 5000) => enviar("esperar_elemento", { selector: sel, timeout_ms }),',
            '        esta_visible: async (sel) => {',
            '            const r = await enviar("esta_visible", { selector: sel });',
            '            return r && r.exito ? r.visible === true : false;',
            '        },',
            '        esperar_visible: (sel, timeout_ms = 5000) => enviar("esperar_visible", { selector: sel, timeout_ms }),',
            '        esperar_oculto: (sel, timeout_ms = 5000) => enviar("esperar_oculto", { selector: sel, timeout_ms }),',
            '        texto: async (sel) => {',
            '            const r = await enviar("obtener_texto", { selector: sel });',
            '            return r && r.exito ? r.valor : null;',
            '        },',
            '        html: async (sel) => {',
            '            const r = await enviar("obtener_html", { selector: sel });',
            '            return r && r.exito ? r.valor : null;',
            '        },',
            '        pedir_post: (url, body) => enviar("pedir_post", { url, body }),',
            '',
            '        // === helpers de sesion ===',
            '        async cerrar_sesion() {',
            '            const app_visible = await this.esta_visible("#aplicacion");',
            '            if (!app_visible) return true;',
            '            await this.clic("#boton_salir");',
            '            const r = await this.esperar_visible("#pantalla_login", 5000);',
            '            return r && r.exito === true;',
            '        },',
            '        async asegurar_login(codigo) {',
            '            await this.esperar("#pantalla_login, #aplicacion", 8000);',
            '            const app_visible = await this.esta_visible("#aplicacion");',
            '            if (app_visible) {',
            '                await this.clic("#boton_salir");',
            '                await this.esperar_visible("#pantalla_login", 5000);',
            '            }',
            '            await this.escribir("#codigo_acceso", codigo);',
            '            await this.clic("#boton_ingresar");',
            '            const r = await this.esperar_visible("#aplicacion", 8000);',
            '            if (!r || !r.exito) {',
            '                throw new Error("Login fallo. El codigo puede ser invalido o el usuario esta bloqueado.");',
            '            }',
            '        },',
            '',
            '        // === helpers de datos unicos ===',
            '        dni_unico: () => {',
            '            const base = Date.now() % 90000000;',
            '            return String(base + 10000000);',
            '        },',
            '        texto_unico: (prefijo = "TEST") => prefijo + "_" + Date.now(),',
            '',
            '        // === aserciones ===',
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

    // ============================================================
    // Aplicacion/pruebas/prueba_02_login.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_02_login.js',
        'descripcion' => 'prueba_02_login.js',
        'contenido' => [
            '/**',
            ' * Prueba de login: entra con código de admin, verifica que',
            ' * la app está visible y que el nivel mostrado es correcto.',
            ' *',
            ' * @version 1.5plugin.3b',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            '',
            'export const prueba = {',
            '    id: "login_admin",',
            '    nombre: "Login: admin con código",',
            '    descripcion: "Entra con el código del admin, verifica que #aplicacion esté visible y que el nivel sea admin.",',
            '',
            '    async ejecutar(ctx) {',
            '        // Asegurar que no queda sesión previa.',
            '        await ctx.cerrar_sesion();',
            '',
            '        // Login como admin.',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '',
            '        // La app debe estar visible.',
            '        const app_visible = await ctx.esta_visible("#aplicacion");',
            '        ctx.assert(app_visible, "La app no se mostró después del login");',
            '',
            '        // El nivel debe decir admin.',
            '        const nivel = await ctx.texto("#nivel_usuario_actual");',
            '        ctx.assert(nivel !== null, "No se encontró #nivel_usuario_actual");',
            '        ctx.assert(nivel.trim() === "admin", "El nivel mostrado no es admin: " + JSON.stringify(nivel));',
            '',
            '        // Cerrar sesión para dejar el piloto limpio.',
            '        const cerro = await ctx.cerrar_sesion();',
            '        ctx.assert(cerro, "No se pudo cerrar la sesión");',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/catalogo.js
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo.js con prueba_02_login',
        'contenido' => [
            '/**',
            ' * Catalogo de pruebas disponibles.',
            ' *',
            ' * Cada prueba exporta un objeto `{ id, nombre, descripcion,',
            ' * ejecutar(ctx) }`. Aca se importan y se listan.',
            ' *',
            ' * @version 1.5plugin.3b',
            ' */',
            '',
            'import { prueba as arranque } from "./prueba_01_arranque.js";',
            'import { prueba as login } from "./prueba_02_login.js";',
            '',
            'export const CATALOGO = [',
            '    arranque,',
            '    login',
            '];',
        ],
    ],

    // ============================================================
    // auditar_plugin.php — reescritura completa
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'auditar_plugin.php',
        'descripcion' => 'auditar_plugin.php con secciones 5 y 6',
        'contenido' => [
            '<?php',
            '/**',
            ' * Auditoría del plugin de pruebas.',
            ' *',
            ' * NO modifica nada. Solo lee y reporta:',
            ' *',
            ' * 1. Todos los .js y .html del plugin (recursivo sobre Aplicacion/,',
            ' *    mas el manifest.json de la raiz).',
            ' * 2. Los imports de cada .js: verifica que cada path relativo',
            ' *    (`./` o `../`) resuelva a un archivo existente.',
            ' * 3. Los paths declarados en manifest.json (service_worker,',
            ' *    default_popup, content_scripts): verifica que existan.',
            ' * 4. Referencias a nombres viejos del rename de v1.5plugin.2:',
            ' *    bootstrap.js, background.js, content.js, popup.html, popup.js,',
            ' *    prueba_01_smoke, y los strings "ping" / "pong" / "click" /',
            ' *    "fetch_post".',
            ' * 5. Archivos sospechosamente vacios: .js que despues de quitar',
            ' *    comentarios quedan sin lineas de codigo. Es la causa del',
            ' *    bug de v1.5plugin.2b (servicio.js comentado por error).',
            ' * 6. URL_PILOTO de ConfPlugin.js contra host_permissions y',
            ' *    content_scripts.matches del manifest.',
            ' *',
            ' * Uso (parado en iteradoresJS/):',
            ' *   php auditar_plugin.php',
            ' */',
            '',
            '$raiz = __DIR__;',
            '',
            'echo "=== Auditoria del plugin ===\\n\\n";',
            '',
            'function leer_archivo($ruta) {',
            '    if (!file_exists($ruta)) return null;',
            '    return file_get_contents($ruta);',
            '}',
            '',
            'function listar_recursivo($dir, $extensiones) {',
            '    $out = [];',
            '    if (!is_dir($dir)) return $out;',
            '    $it = new RecursiveIteratorIterator(',
            '        new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS)',
            '    );',
            '    foreach ($it as $f) {',
            '        if (!$f->isFile()) continue;',
            '        $ext = strtolower($f->getExtension());',
            '        if (!in_array($ext, $extensiones, true)) continue;',
            '        $out[] = str_replace(\'\\\\\', \'/\', $f->getPathname());',
            '    }',
            '    sort($out);',
            '    return $out;',
            '}',
            '',
            'function ruta_relativa($abs, $raiz) {',
            '    return ltrim(str_replace(\'\\\\\', \'/\', substr($abs, strlen($raiz))), \'/\');',
            '}',
            '',
            'echo "=== 1. Inventario de archivos ===\\n\\n";',
            '',
            '$manifest_path = $raiz . \'/manifest.json\';',
            'if (!file_exists($manifest_path)) {',
            '    echo "[FATAL] No se encontro manifest.json en la raiz.\\n";',
            '    echo "        Corre este script parado en iteradoresJS/.\\n";',
            '    exit(1);',
            '}',
            '',
            '$archivos_js   = listar_recursivo($raiz . \'/Aplicacion\', [\'js\']);',
            '$archivos_html = listar_recursivo($raiz . \'/Aplicacion\', [\'html\']);',
            '',
            'echo "manifest.json: " . (file_exists($manifest_path) ? \'OK\' : \'FALTA\') . "\\n";',
            'echo "Archivos .js en Aplicacion/: " . count($archivos_js) . "\\n";',
            'foreach ($archivos_js as $a) echo "  " . ruta_relativa($a, $raiz) . "\\n";',
            'echo "\\nArchivos .html en Aplicacion/: " . count($archivos_html) . "\\n";',
            'foreach ($archivos_html as $a) echo "  " . ruta_relativa($a, $raiz) . "\\n";',
            'echo "\\n";',
            '',
            'echo "=== 2. Manifest: paths declarados ===\\n\\n";',
            '',
            '$manifest_raw = leer_archivo($manifest_path);',
            '$manifest = json_decode($manifest_raw, true);',
            'if (!is_array($manifest)) {',
            '    echo "[FATAL] manifest.json no parsea como JSON. Error: " . json_last_error_msg() . "\\n";',
            '    exit(1);',
            '}',
            '',
            '$paths_manifest = [];',
            'if (isset($manifest[\'background\'][\'service_worker\'])) {',
            '    $paths_manifest[] = [\'background.service_worker\', $manifest[\'background\'][\'service_worker\']];',
            '}',
            'if (isset($manifest[\'action\'][\'default_popup\'])) {',
            '    $paths_manifest[] = [\'action.default_popup\', $manifest[\'action\'][\'default_popup\']];',
            '}',
            'if (isset($manifest[\'content_scripts\']) && is_array($manifest[\'content_scripts\'])) {',
            '    foreach ($manifest[\'content_scripts\'] as $i => $cs) {',
            '        if (isset($cs[\'js\']) && is_array($cs[\'js\'])) {',
            '            foreach ($cs[\'js\'] as $j) {',
            '                $paths_manifest[] = ["content_scripts[$i].js", $j];',
            '            }',
            '        }',
            '    }',
            '}',
            '',
            'foreach ($paths_manifest as [$clave, $path]) {',
            '    $abs = $raiz . \'/\' . ltrim($path, \'/\');',
            '    $ok = file_exists($abs) ? \'OK\' : \'NO EXISTE\';',
            '    printf("  [%s] %s = %s\\n", $ok, $clave, $path);',
            '}',
            'echo "\\n";',
            '',
            'echo "=== 3. Imports de cada archivo .js ===\\n\\n";',
            '',
            '$patrones_import = [',
            '    \'/\\bfrom\\s+[\\\'"]([^\\\'"]+)[\\\'"]/\',',
            '    \'/\\bimport\\s+[\\\'"]([^\\\'"]+)[\\\'"]/\',',
            '    \'/\\bimport\\(\\s*[\\\'"]([^\\\'"]+)[\\\'"]\\s*\\)/\',',
            '];',
            '',
            '$total_imports = 0;',
            '$total_rotos = 0;',
            '',
            'foreach ($archivos_js as $archivo_abs) {',
            '    $rel = ruta_relativa($archivo_abs, $raiz);',
            '    $cont = leer_archivo($archivo_abs);',
            '    if ($cont === null) continue;',
            '    $lineas = explode("\\n", $cont);',
            '    $imports_encontrados = [];',
            '    foreach ($lineas as $nro => $linea) {',
            '        foreach ($patrones_import as $pat) {',
            '            if (preg_match_all($pat, $linea, $m)) {',
            '                foreach ($m[1] as $destino) {',
            '                    $imports_encontrados[] = [$nro + 1, trim($destino), trim($linea)];',
            '                }',
            '            }',
            '        }',
            '    }',
            '    if (empty($imports_encontrados)) {',
            '        echo "  $rel\\n    (sin imports)\\n";',
            '        continue;',
            '    }',
            '    echo "  $rel\\n";',
            '    foreach ($imports_encontrados as [$nro, $destino, $linea_completa]) {',
            '        $total_imports++;',
            '        if (strpos($destino, \'./\') !== 0 && strpos($destino, \'../\') !== 0) {',
            '            printf("    [SKIP] L%d  %s  (no es path relativo)\\n", $nro, $destino);',
            '            continue;',
            '        }',
            '        $destino_abs = realpath(dirname($archivo_abs) . \'/\' . $destino);',
            '        if ($destino_abs === false || !file_exists($destino_abs)) {',
            '            $total_rotos++;',
            '            printf("    [ROTO] L%d  %s  -> NO EXISTE\\n", $nro, $destino);',
            '            printf("           %s\\n", trim($linea_completa));',
            '        } else {',
            '            printf("    [OK]   L%d  %s\\n", $nro, $destino);',
            '        }',
            '    }',
            '}',
            'echo "\\nImports totales: $total_imports   |   rotos: $total_rotos\\n\\n";',
            '',
            'echo "=== 4. Referencias a nombres viejos ===\\n\\n";',
            '',
            '$nombres_viejos = [',
            '    \'bootstrap.js\',',
            '    \'background.js\',',
            '    \'content.js\',',
            '    \'popup.html\',',
            '    \'popup.js\',',
            '    \'prueba_01_smoke\',',
            '];',
            '',
            '$archivos_a_auditar = array_merge($archivos_js, $archivos_html, [$manifest_path]);',
            '$hallazgos = 0;',
            'foreach ($archivos_a_auditar as $archivo_abs) {',
            '    $rel = ruta_relativa($archivo_abs, $raiz);',
            '    $cont = leer_archivo($archivo_abs);',
            '    if ($cont === null) continue;',
            '    $lineas = explode("\\n", $cont);',
            '    $encontrados = [];',
            '    foreach ($lineas as $nro => $linea) {',
            '        foreach ($nombres_viejos as $patron) {',
            '            if (strpos($linea, $patron) !== false) {',
            '                $encontrados[] = [$nro + 1, $patron, trim($linea)];',
            '            }',
            '        }',
            '    }',
            '    if (!empty($encontrados)) {',
            '        echo "  $rel\\n";',
            '        foreach ($encontrados as [$nro, $patron, $linea_completa]) {',
            '            printf("    L%d  [%s]\\n         %s\\n", $nro, $patron, $linea_completa);',
            '            $hallazgos++;',
            '        }',
            '        echo "\\n";',
            '    }',
            '}',
            'if ($hallazgos === 0) {',
            '    echo "  (sin hallazgos)\\n\\n";',
            '} else {',
            '    echo "  Total de hallazgos: $hallazgos\\n\\n";',
            '}',
            '',
            'echo "=== 5. Archivos sospechosamente vacios ===\\n\\n";',
            '',
            'function quitar_comentarios_js($contenido) {',
            '    $sin_bloque = preg_replace(\'#/\\*.*?\\*/#s\', \'\', $contenido);',
            '    $lineas = explode("\\n", $sin_bloque);',
            '    $out = [];',
            '    foreach ($lineas as $l) {',
            '        $pos = strpos($l, \'//\');',
            '        if ($pos !== false) {',
            '            $l = substr($l, 0, $pos);',
            '        }',
            '        $out[] = $l;',
            '    }',
            '    return implode("\\n", $out);',
            '}',
            '',
            '$vacios = 0;',
            'foreach ($archivos_js as $archivo_abs) {',
            '    $rel = ruta_relativa($archivo_abs, $raiz);',
            '    $cont = leer_archivo($archivo_abs);',
            '    if ($cont === null) continue;',
            '    $sin_com = quitar_comentarios_js($cont);',
            '    $lineas_codigo = 0;',
            '    foreach (explode("\\n", $sin_com) as $l) {',
            '        if (trim($l) !== \'\') $lineas_codigo++;',
            '    }',
            '    if ($lineas_codigo === 0) {',
            '        echo "  [SOSPECHOSO] $rel\\n";',
            '        echo "    El archivo no tiene lineas de codigo despues de quitar comentarios.\\n";',
            '        $vacios++;',
            '    }',
            '}',
            'if ($vacios === 0) {',
            '    echo "  (sin archivos sospechosos)\\n\\n";',
            '} else {',
            '    echo "  Total de archivos sospechosos: $vacios\\n\\n";',
            '}',
            '',
            'echo "=== 6. URL_PILOTO vs manifest ===\\n\\n";',
            '',
            '$conf_plugin_path = $raiz . \'/Aplicacion/ConfPlugin.js\';',
            '$url_piloto = null;',
            'if (file_exists($conf_plugin_path)) {',
            '    $conf_cont = file_get_contents($conf_plugin_path);',
            '    if (preg_match(\'/URL_PILOTO\\s*=\\s*["\\\']([^"\\\']+)["\\\']/\', $conf_cont, $m)) {',
            '        $url_piloto = $m[1];',
            '    }',
            '}',
            'if ($url_piloto === null) {',
            '    echo "  [INFO] No se encontro URL_PILOTO en ConfPlugin.js.\\n\\n";',
            '} else {',
            '    echo "  URL_PILOTO = $url_piloto\\n";',
            '    $partes = parse_url($url_piloto);',
            '    $host = isset($partes[\'host\']) ? $partes[\'host\'] : \'\';',
            '    $esquema = isset($partes[\'scheme\']) ? $partes[\'scheme\'] : \'http\';',
            '    $prefijo_esperado = $esquema . "://" . $host . "/";',
            '    echo "  Prefijo esperado en matches: $prefijo_esperado\\n\\n";',
            '    $hosts_manifest = isset($manifest[\'host_permissions\']) ? $manifest[\'host_permissions\'] : [];',
            '    $cubierto = false;',
            '    foreach ($hosts_manifest as $hp) {',
            '        if (strpos($prefijo_esperado, str_replace(\'*\', \'\', $hp)) === 0) {',
            '            $cubierto = true; break;',
            '        }',
            '    }',
            '    printf("  [%s] host_permissions cubre %s\\n", $cubierto ? \'OK\' : \'REVISAR\', $prefijo_esperado);',
            '    $matches_manifest = [];',
            '    if (isset($manifest[\'content_scripts\']) && is_array($manifest[\'content_scripts\'])) {',
            '        foreach ($manifest[\'content_scripts\'] as $cs) {',
            '            if (isset($cs[\'matches\']) && is_array($cs[\'matches\'])) {',
            '                $matches_manifest = array_merge($matches_manifest, $cs[\'matches\']);',
            '            }',
            '        }',
            '    }',
            '    $cubierto = false;',
            '    foreach ($matches_manifest as $m) {',
            '        if (strpos($prefijo_esperado, str_replace(\'*\', \'\', $m)) === 0) {',
            '            $cubierto = true; break;',
            '        }',
            '    }',
            '    printf("  [%s] content_scripts.matches cubre %s\\n", $cubierto ? \'OK\' : \'REVISAR\', $prefijo_esperado);',
            '    echo "\\n";',
            '}',
            '',
            'echo "=== Resumen ===\\n\\n";',
            'echo "  Imports rotos: " . $total_rotos . "\\n";',
            'echo "  Referencias a nombres viejos: " . $hallazgos . "\\n";',
            'echo "  Archivos sospechosamente vacios: " . $vacios . "\\n";',
            'echo "\\n";',
            'echo "Fin de la auditoria. No se modifico ningun archivo.\\n";',
        ],
    ],

    // ============================================================
    // prompts/prompt_plugin_piloto.md — ajustes
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: ultima actualizacion a v1.5plugin.3b',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.3 (infra',
            'mínima del catálogo + primera prueba real: `ConfPlugin.js`',
            'centraliza `URL_PILOTO` y los códigos de usuario; `contenido.js`',
            'suma comandos de visibilidad; `ctx` gana `url_base`, `login`,',
            '`cerrar_sesion`, `dni_unico`, `texto_unico`, `esta_visible`,',
            '`esperar_visible`, `esperar_oculto`; nueva prueba `login_admin`.',
            'La auditoría ahora chequea que `URL_PILOTO` esté cubierta por',
            '`host_permissions` y `content_scripts.matches` del manifest.).',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.3b (infra',
            'mínima del catálogo + primera prueba real `login_admin` + fix',
            'de `servicio.js`: había usado `import()` dinámico, prohibido',
            'en service workers por spec. Volvió a imports estáticos.).',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: Estado actual a v1.5plugin.3b',
        'buscar' => [
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
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.3b.** El esqueleto del plugin está',
            'armado y funcional, y ya tiene la primera prueba real (login',
            'de admin). Archivos:',
            '',
            '- `manifest.json` — manifiesto MV3 en la raíz.',
            '- `Aplicacion/servicio.js` — service worker (module, imports',
            '  estáticos).',
            '- `Aplicacion/contenido.js` — script de contenido clásico, con',
            '  comandos de visibilidad.',
            '- `Aplicacion/ventana.html` / `ventana.js` — interfaz de la',
            '  ventana (con reintentos de `sendMessage`).',
            '- `Aplicacion/arranque.js` — arranque del framework en el SW.',
            '- `Aplicacion/ConfPlugin.js` — configuración propia, URL del',
            '  piloto y códigos de usuario.',
            '- `Aplicacion/GrafoPlugin.js` — capa sobre el framework.',
            '- `Aplicacion/pruebas/catalogo.js` — catálogo de pruebas.',
            '- `Aplicacion/pruebas/prueba_01_arranque.js` — prueba de',
            '  arranque.',
            '- `Aplicacion/pruebas/prueba_02_login.js` — prueba de login.',
            '- `auditar_plugin.php` — auditoría con 6 secciones.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: lecciones de v1.5plugin.3b',
        'buscar' => [
            '- Si Chrome muestra "unknown error when fetching the script" al',
            '  registrar un service worker module, casi siempre es un import',
            '  que no se puede resolver en la cadena (nombre mal escrito,',
            '  archivo faltante). Diagnóstico rápido: reducir `servicio.js`',
            '  a un `console.log` y agregar imports de a uno hasta que',
            '  rompa.',
        ],
        'reemplazar' => [
            '- Si Chrome muestra "unknown error when fetching the script" al',
            '  registrar un service worker module, casi siempre es un import',
            '  que no se puede resolver en la cadena (nombre mal escrito,',
            '  archivo faltante). Diagnóstico rápido: reducir `servicio.js`',
            '  a un `console.log` y agregar imports de a uno hasta que',
            '  rompa.',
            '- **Los service workers de Chrome (MV3) NO permiten `import()`**',
            '  **dinámico.** La spec lo prohíbe: "import() is disallowed on',
            '  ServiceWorkerGlobalScope by the HTML specification"',
            '  (https://github.com/w3c/ServiceWorker/issues/1356). Se decidió',
            '  "throw on dynamic imports" para prevenir que un SW funcione',
            '  online y rompa offline. Los imports deben ser ESTÁTICOS.',
            '- **Regla de diseño (v1.5plugin.3b):** el service worker usa',
            '  imports estáticos. La defensa contra archivos comentados es',
            '  la auditoría (sección 5: archivos sospechosamente vacíos).',
            '  No hay forma de registrar el listener antes de los imports',
            '  en un SW con módulos.',
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