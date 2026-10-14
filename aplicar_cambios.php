<?php
/**
 * Aplicador — Fase 2a+2b: infraestructura de _post y migración
 * de cancelar_venta / obtener_venta_por_id.
 *
 * Uso (raíz del proyecto plugin): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.7a';

// El plugin no usa ?v= en su HTML.
$htmls_a_bumpear = [];

$cambios = [

    // ============================================================
    // 1. servicio.js: cache de modulo.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: declarar cache de modulo',
        'buscar' => [
            'const URLS_PILOTO = ["http://localhost/", "http://127.0.0.1/"];',
        ],
        'reemplazar' => [
            'const URLS_PILOTO = ["http://localhost/", "http://127.0.0.1/"];',
            '',
            '// ============================================================',
            '// Cache del solicitante y del dueno',
            '// ============================================================',
            '//',
            '// `ctx.post_accion` inyecta automaticamente `nombre_solicitante`',
            '// (y opcionalmente `nombre_dueno`) en cada POST. Ambos se leen',
            '// del page context con `chrome.scripting.executeScript` (MAIN',
            '// world), que es costoso. Con 65 pruebas x varios POST cada',
            '// una, el costo se nota. Cacheamos en variables de modulo y',
            '// las invalidamos cuando cambia la sesion (login / logout).',
            'let _cache_nombre_solicitante = null;',
            'let _cache_dueno_actual = null;',
        ],
    ],

    // ============================================================
    // 2. servicio.js: nuevos metodos del ctx.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: agregar dueno_actual, post_accion, refrescar_solicitante',
        'buscar' => [
            '                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };',
            '            } catch (e) {',
            '                return { exito: false, error: e.message };',
            '            }',
            '        },',
            '        liberar_asientos_propios: async () => {',
        ],
        'reemplazar' => [
            '                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };',
            '            } catch (e) {',
            '                return { exito: false, error: e.message };',
            '            }',
            '        },',
            '        dueno_actual: async () => {',
            '            // Lee el nombre del dueno activo desde el page',
            '            // context. Para un dueno, es su propio nombre;',
            '            // para un terminal, es el de su dueno. Se usa',
            '            // para inyectar `nombre_dueno` en los POST que',
            '            // lo requieren sin que la prueba tenga que',
            '            // pasarlo a mano.',
            '            try {',
            '                const r = await chrome.scripting.executeScript({',
            '                    target: { tabId: pestana_id },',
            '                    world: "MAIN",',
            '                    func: () => {',
            '                        if (typeof usuario_actual === "undefined" || !usuario_actual) {',
            '                            return { exito: false, error: "sin usuario_actual en el page" };',
            '                        }',
            '                        const dueno = usuario_actual.dueno || usuario_actual.nombre_usuario;',
            '                        if (!dueno) {',
            '                            return { exito: false, error: "usuario_actual sin dueno ni nombre_usuario" };',
            '                        }',
            '                        return { exito: true, dueno: dueno };',
            '                    }',
            '                });',
            '                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };',
            '            } catch (e) {',
            '                return { exito: false, error: e.message };',
            '            }',
            '        },',
            '        refrescar_solicitante: () => {',
            '            // Fuerza la relectura del solicitante y del dueno',
            '            // en la proxima llamada a post_accion. Se llama',
            '            // automaticamente desde asegurar_login /',
            '            // cerrar_sesion; queda expuesto por si algun',
            '            // test necesita forzarlo.',
            '            _cache_nombre_solicitante = null;',
            '            _cache_dueno_actual = null;',
            '            return { exito: true };',
            '        },',
            '        async post_accion(accion, params = {}, opts = {}) {',
            '            // POST generico con inyeccion de `nombre_solicitante`',
            '            // y (opcionalmente) `nombre_dueno`. Centraliza el',
            '            // patron que estaba repetido a mano en varias',
            '            // pruebas y helpers.',
            '            //',
            '            // opts:',
            '            //   - sin_solicitante (bool): no inyectar.',
            '            //   - sin_dueno (bool): no inyectar.',
            '            //   - (devolver_crudo / lanzar_en_error_backend los',
            '            //     maneja el wrapper _post en _helpers.js, no',
            '            //     este metodo).',
            '            //',
            '            // Devuelve la respuesta cruda de pedir_post:',
            '            //   { exito, status, texto, json } o',
            '            //   { exito: false, error: "..." } si falla la red.',
            '            let nombre_solicitante = null;',
            '            if (!opts.sin_solicitante) {',
            '                if (_cache_nombre_solicitante === null) {',
            '                    const r_nombre = await this.nombre_usuario_actual();',
            '                    if (!r_nombre || !r_nombre.exito || !r_nombre.nombre_usuario) {',
            '                        throw new Error("No se pudo resolver el nombre de usuario del solicitante");',
            '                    }',
            '                    _cache_nombre_solicitante = r_nombre.nombre_usuario;',
            '                }',
            '                nombre_solicitante = _cache_nombre_solicitante;',
            '            }',
            '',
            '            const tiene_dueno = params',
            '                && params.nombre_dueno !== undefined',
            '                && params.nombre_dueno !== "";',
            '            let nombre_dueno = null;',
            '            if (!opts.sin_dueno && !tiene_dueno) {',
            '                if (_cache_dueno_actual === null) {',
            '                    const r_dueno = await this.dueno_actual();',
            '                    if (r_dueno && r_dueno.exito) {',
            '                        _cache_dueno_actual = r_dueno.dueno;',
            '                    }',
            '                }',
            '                nombre_dueno = _cache_dueno_actual;',
            '            }',
            '',
            '            const body = Object.assign({}, params);',
            '            if (nombre_solicitante) body.nombre_solicitante = nombre_solicitante;',
            '            if (nombre_dueno) body.nombre_dueno = nombre_dueno;',
            '',
            '            return await enviar("pedir_post", { url: "index.php", body });',
            '        },',
            '        liberar_asientos_propios: async () => {',
        ],
    ],

    // ============================================================
    // 3. servicio.js: invalidar cache en cerrar_sesion.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: invalidar cache en cerrar_sesion',
        'buscar' => [
            '        async cerrar_sesion() {',
            '            const app_visible = await this.esta_visible("#aplicacion");',
            '            if (!app_visible) return true;',
            '            await this.clic("#boton_salir");',
            '            const r = await this.esperar_visible("#pantalla_login", 5000);',
            '            return r && r.exito === true;',
            '        },',
        ],
        'reemplazar' => [
            '        async cerrar_sesion() {',
            '            // Invalidar el cache del solicitante y del dueno:',
            '            // la sesion puede cambiar con el login siguiente.',
            '            _cache_nombre_solicitante = null;',
            '            _cache_dueno_actual = null;',
            '',
            '            const app_visible = await this.esta_visible("#aplicacion");',
            '            if (!app_visible) return true;',
            '            await this.clic("#boton_salir");',
            '            const r = await this.esperar_visible("#pantalla_login", 5000);',
            '            return r && r.exito === true;',
            '        },',
        ],
    ],

    // ============================================================
    // 4. servicio.js: invalidar cache en asegurar_login.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: invalidar cache en asegurar_login',
        'buscar' => [
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
        ],
        'reemplazar' => [
            '        async asegurar_login(codigo) {',
            '            // Invalidar el cache del solicitante antes de',
            '            // loguear: si ya habia sesion, el usuario que',
            '            // entra es otro.',
            '            _cache_nombre_solicitante = null;',
            '            _cache_dueno_actual = null;',
            '',
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
        ],
    ],

    // ============================================================
    // 5. _helpers.js: agregar _post.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: agregar _post',
        'buscar' => [
            'import { CODIGO_TERMINAL1 } from "../ConfiguracionApli.js";',
            '',
            '// ============================================================',
            '// Generadores de datos unicos',
            '// ============================================================',
        ],
        'reemplazar' => [
            'import { CODIGO_TERMINAL1 } from "../ConfiguracionApli.js";',
            '',
            '// ============================================================',
            '// POST generico con inyeccion de solicitante y dueno',
            '// ============================================================',
            '//',
            '// `_post` centraliza el patron que estaba repetido a mano en',
            '// varias pruebas y helpers: resolver el nombre de usuario del',
            '// solicitante desde el page, resolver el dueno activo, armar',
            '// el body, hacer el POST y devolver el JSON.',
            '//',
            '// Delega en `ctx.post_accion(accion, params, opts)`, que ya',
            '// cachea el solicitante y el dueno entre llamadas.',
            '//',
            '// Parametros:',
            '//   - accion: string "modulo/subaccion".',
            '//   - params: object con los parametros del POST.',
            '//   - opts.sin_solicitante (bool): no inyectar',
            '//       nombre_solicitante. Util para acciones previas al',
            '//       login (autenticar).',
            '//   - opts.sin_dueno (bool): no inyectar nombre_dueno.',
            '//   - opts.devolver_crudo (bool): devolver la respuesta cruda',
            '//       de pedir_post ({exito, status, texto, json}), no solo',
            '//       el JSON.',
            '//   - opts.lanzar_en_error_backend (bool): si el backend',
            '//       responde {exito: false}, lanzar Error en lugar de',
            '//       devolver el JSON. Default: false (el test decide).',
            '//',
            '// Devuelve:',
            '//   - El JSON del backend (objeto con exito: true/false).',
            '//   - O la respuesta cruda si devolver_crudo: true.',
            '//',
            '// Lanza Error si:',
            '//   - No hay pestana del piloto.',
            '//   - Falla la red (r.exito === false).',
            '//   - lanzar_en_error_backend y el backend devolvio exito: false.',
            '//',
            '// @since 1.5plugin.7a',
            'export async function _post(ctx, accion, params = {}, opts = {}) {',
            '    const r = await ctx.post_accion(accion, params, opts);',
            '',
            '    if (opts.devolver_crudo) return r;',
            '',
            '    if (!r || !r.exito) {',
            '        throw new Error(',
            '            "Error de red en " + accion + ": "',
            '            + (r && r.error ? r.error : "(sin detalle)")',
            '        );',
            '    }',
            '',
            '    if (!r.json) {',
            '        throw new Error("Respuesta sin JSON en " + accion);',
            '    }',
            '',
            '    if (opts.lanzar_en_error_backend && !r.json.exito) {',
            '        throw new Error(',
            '            "Backend rechazo " + accion + ": "',
            '            + (r.json.error || "(sin detalle)")',
            '        );',
            '    }',
            '',
            '    return r.json;',
            '}',
            '',
            '// ============================================================',
            '// Generadores de datos unicos',
            '// ============================================================',
        ],
    ],

    // ============================================================
    // 6. _helpers.js: refactor cancelar_venta.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: refactor cancelar_venta con _post',
        'buscar' => [
            'export async function cancelar_venta(ctx, id_venta, motivo = "Cancelada por prueba automatica") {',
            '    // El backend necesita nombre_solicitante para saber qué',
            '    // contexto cargar y qué terminal es el solicitante. Sin',
            '    // él, cae al fallback que itera sobre `usuarios` y, con',
            '    // carga parcial, devuelve "Venta no encontrada".',
            '    //',
            '    // Ojo: ctx.nombre_usuario_actual() devuelve un objeto',
            '    // `{exito, nombre_usuario}`. Hay que extraer el string.',
            '    // Si se pasa el objeto directo, se serializa como',
            '    // "[object Object]" y el backend muere con 500.',
            '    const r_nombre = await ctx.nombre_usuario_actual();',
            '    if (!r_nombre || !r_nombre.exito || !r_nombre.nombre_usuario) {',
            '        throw new Error("No se pudo resolver el nombre de usuario del solicitante");',
            '    }',
            '    const nombre_sol = r_nombre.nombre_usuario;',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "ventas/cancelar",',
            '        id_venta,',
            '        motivo,',
            '        nombre_solicitante: nombre_sol',
            '    });',
            '    if (!r || !r.exito) {',
            '        throw new Error("Error de red al cancelar: " + (r && r.error ? r.error : "(sin detalle)"));',
            '    }',
            '    if (!r.json || !r.json.exito) {',
            '        throw new Error("No se pudo cancelar: " + (r.json && r.json.error ? r.json.error : "(sin detalle)"));',
            '    }',
            '    // Refrescar el croquis del page para que no quede congelado',
            '    // mostrando el asiento como vendido. Es no bloqueante: si',
            '    // falla, la venta ya esta cancelada, solo se ve el croquis',
            '    // viejo hasta el proximo polling.',
            '    const rf = await ctx.refrescar_asientos_pagina();',
            '    if (!rf || !rf.exito) {',
            '        console.warn("No se pudo refrescar el croquis tras cancelar:", rf && rf.error ? rf.error : "(sin detalle)");',
            '    }',
            '    return r.json;',
            '}',
        ],
        'reemplazar' => [
            'export async function cancelar_venta(ctx, id_venta, motivo = "Cancelada por prueba automatica") {',
            '    // `_post` inyecta el nombre_solicitante y el nombre_dueno.',
            '    // El backend los necesita para saber que contexto cargar',
            '    // y que terminal es el solicitante.',
            '    const r = await _post(ctx, "ventas/cancelar", {',
            '        id_venta,',
            '        motivo',
            '    }, { lanzar_en_error_backend: true });',
            '',
            '    // Refrescar el croquis del page para que no quede congelado',
            '    // mostrando el asiento como vendido. Es no bloqueante: si',
            '    // falla, la venta ya esta cancelada, solo se ve el croquis',
            '    // viejo hasta el proximo polling.',
            '    const rf = await ctx.refrescar_asientos_pagina();',
            '    if (!rf || !rf.exito) {',
            '        console.warn("No se pudo refrescar el croquis tras cancelar:", rf && rf.error ? rf.error : "(sin detalle)");',
            '    }',
            '    return r;',
            '}',
        ],
    ],

    // ============================================================
    // 7. _helpers.js: refactor obtener_venta_por_id.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: refactor obtener_venta_por_id con _post',
        'buscar' => [
            'export async function obtener_venta_por_id(ctx, id_venta) {',
            '    // Mismo motivo que cancelar_venta: el backend necesita',
            '    // nombre_solicitante para resolver el contexto del terminal.',
            '    // Y mismo detalle: hay que extraer `.nombre_usuario`.',
            '    const r_nombre = await ctx.nombre_usuario_actual();',
            '    if (!r_nombre || !r_nombre.exito || !r_nombre.nombre_usuario) {',
            '        throw new Error("No se pudo resolver el nombre de usuario del solicitante");',
            '    }',
            '    const nombre_sol = r_nombre.nombre_usuario;',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "ventas/obtener",',
            '        id_venta,',
            '        nombre_solicitante: nombre_sol',
            '    });',
            '    if (!r || !r.exito) {',
            '        throw new Error("Error de red al obtener la venta: " + (r && r.error ? r.error : "(sin detalle)"));',
            '    }',
            '    if (!r.json || !r.json.exito) {',
            '        throw new Error("No se pudo obtener la venta: " + (r.json && r.json.error ? r.json.error : "(sin detalle)"));',
            '    }',
            '    return r.json.venta;',
            '}',
        ],
        'reemplazar' => [
            'export async function obtener_venta_por_id(ctx, id_venta) {',
            '    const r = await _post(ctx, "ventas/obtener", {',
            '        id_venta',
            '    }, { lanzar_en_error_backend: true });',
            '    return r.venta;',
            '}',
        ],
    ],

];

// ============================================================
// Runner v2
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

// --- Fase 1: aplicar reemplazos ---
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

// --- Fase 2: bumps automaticos ---
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

// --- Fase 3: escribir ---
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
    if (!file_exists($ruta_abs)) { echo "[INFO] " . $elim['archivo'] . " no existia.\n"; continue; }
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