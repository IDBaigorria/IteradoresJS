<?php
/**
 * Aplicador — Fase 2d: boton "Limpiar datos de prueba" en el plugin.
 *
 * Agrega:
 *   - Nuevo modulo Aplicacion/LimpiezaPrueba.js con la logica
 *     (itera duenos, llama los 6 endpoints + global).
 *   - servicio.js: import + handler + caso en el switch +
 *     globalThis.limpiar_prueba.
 *   - ventana.html: boton + <pre> para el log + estilos.
 *   - ventana.js: listener del boton + progreso incremental +
 *     resumen final.
 *
 * Uso (raiz del proyecto plugin): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.7m';

$htmls_a_bumpear = [];

$cambios = [

    // ============================================================
    // 1. NUEVO: Aplicacion/LimpiezaPrueba.js
    // ============================================================
    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/LimpiezaPrueba.js',
        'descripcion' => 'Nuevo LimpiezaPrueba.js',
        'contenido' => [
            '/**',
            ' * Limpieza de datos de prueba en el piloto.',
            ' *',
            ' * Ejecuta en orden los 6 endpoints de limpieza por cada',
            ' * dueno (ventas, cancelaciones, viajes, pasajeros,',
            ' * empresas/vehiculos, terminales), mas el global de',
            ' * usuarios. Verifica modo pruebas + nivel admin antes de',
            ' * empezar.',
            ' *',
            ' * El orden importa:',
            ' *   - Ventas antes que cancelaciones (las cancelaciones',
            ' *     se crean al limpiar las ventas de prueba).',
            ' *   - Viajes antes que empresas (borrar un viaje destruye',
            ' *     sus micros, que son los que referencian empresas).',
            ' *   - Pasajeros y terminales antes que usuarios',
            ' *     (limpiar_usuarios_de_prueba los saltea si tienen',
            ' *     referencias).',
            ' *',
            ' * @version 1.5plugin.7m',
            ' * @since 1.5plugin.7m',
            ' */',
            '',
            'import { _post } from "./pruebas/_helpers.js";',
            '',
            '/**',
            ' * Ejecuta la limpieza. Devuelve un objeto con:',
            ' *   { exito, duenos, res_ini, res_fin, totales }',
            ' *',
            ' * `al_progreso(evento)` es opcional. Se llama despues de',
            ' * cada endpoint con un evento tipo:',
            ' *   { tipo: "dueno", nombre }',
            ' *   { tipo: "ok", etiqueta, borrados, salteados, extra }',
            ' *   { tipo: "warning", etiqueta, error }',
            ' *',
            ' * @param {object} ctx',
            ' * @param {Function} [al_progreso]',
            ' * @returns {Promise<object>}',
            ' */',
            'export async function limpiar_datos_de_prueba(ctx, al_progreso) {',
            '    const progreso = (typeof al_progreso === "function")',
            '        ? al_progreso',
            '        : function () {};',
            '',
            '    // --- Chequeos previos ---',
            '    const entorno = await _post(ctx, "entorno/info", {},',
            '        { sin_solicitante: true, sin_dueno: true });',
            '    if (!entorno.exito || !entorno.es_pruebas) {',
            '        throw new Error("Abortado: el piloto no esta en modo pruebas.");',
            '    }',
            '',
            '    const perfil_resp = await _post(ctx, "usuarios/mi_perfil", {});',
            '    if (!perfil_resp.exito || !perfil_resp.perfil',
            '        || perfil_resp.perfil.nivel !== "admin") {',
            '        throw new Error("Abortado: solo un admin puede correr la limpieza.");',
            '    }',
            '',
            '    // --- Estado inicial ---',
            '    const r_ini = await _post(ctx, "grafo/resumen", {});',
            '    const res_ini = r_ini.resumen || {};',
            '',
            '    // --- Duenos ---',
            '    const r_duenos = await _post(ctx, "administrador/listar_duenos", {});',
            '    if (!r_duenos.exito) {',
            '        throw new Error("No se pudieron listar duenos: "',
            '            + (r_duenos.error || "(sin detalle)"));',
            '    }',
            '    const duenos = (r_duenos.duenos || []).map(function (d) {',
            '        return typeof d === "string" ? d : d.nombre_usuario;',
            '    });',
            '',
            '    // --- Acumuladores ---',
            '    const totales = {',
            '        ventas: 0,',
            '        cancelaciones: 0,',
            '        viajes: 0,',
            '        pasajeros: 0,',
            '        empresas: 0,',
            '        vehiculos: 0,',
            '        terminales: 0,',
            '        usuarios: 0,',
            '        salteados: 0,',
            '    };',
            '',
            '    async function limpiar(etiqueta, accion, params) {',
            '        const r = await _post(ctx, accion, params || {});',
            '        if (!r.exito) {',
            '            progreso({ tipo: "warning", etiqueta: etiqueta, error: r.error });',
            '            return r;',
            '        }',
            '        const b = (r.cantidad_borrados !== undefined)',
            '            ? r.cantidad_borrados',
            '            : (r.cantidad_empresas_borradas || 0);',
            '        const s = r.cantidad_salteados || 0;',
            '        progreso({',
            '            tipo: "ok",',
            '            etiqueta: etiqueta,',
            '            borrados: b,',
            '            salteados: s,',
            '            extra: r.cantidad_vehiculos_borrados || 0,',
            '            salteados_detalle: r.salteados || [],',
            '        });',
            '        return r;',
            '    }',
            '',
            '    // --- Por cada dueno ---',
            '    for (const dueno of duenos) {',
            '        progreso({ tipo: "dueno", nombre: dueno });',
            '',
            '        const rv = await limpiar("ventas", "ventas/limpiar_prueba",',
            '            { nombre_dueno: dueno });',
            '        totales.ventas += rv.cantidad_borrados || 0;',
            '        totales.salteados += rv.cantidad_salteados || 0;',
            '',
            '        const rc = await limpiar("cancelaciones",',
            '            "cancelaciones/limpiar_prueba", { nombre_dueno: dueno });',
            '        totales.cancelaciones += rc.cantidad_borrados || 0;',
            '        totales.salteados += rc.cantidad_salteados || 0;',
            '',
            '        const rvia = await limpiar("viajes", "viajes/limpiar_prueba",',
            '            { nombre_dueno: dueno });',
            '        totales.viajes += rvia.cantidad_borrados || 0;',
            '',
            '        const rp = await limpiar("pasajeros", "pasajeros/limpiar_prueba",',
            '            { nombre_dueno: dueno });',
            '        totales.pasajeros += rp.cantidad_borrados || 0;',
            '',
            '        const re = await limpiar("empresas", "empresas/limpiar_prueba",',
            '            { nombre_dueno: dueno });',
            '        totales.empresas += re.cantidad_empresas_borradas || 0;',
            '        totales.vehiculos += re.cantidad_vehiculos_borrados || 0;',
            '        totales.salteados += re.cantidad_salteados || 0;',
            '',
            '        const rt = await limpiar("terminales",',
            '            "dueno/limpiar_terminales_prueba", { nombre_dueno: dueno });',
            '        totales.terminales += rt.cantidad_borrados || 0;',
            '        totales.salteados += rt.cantidad_salteados || 0;',
            '    }',
            '',
            '    // --- Global: usuarios ---',
            '    const ru = await limpiar("usuarios",',
            '        "administrador/limpiar_usuarios_prueba", {});',
            '    totales.usuarios += ru.cantidad_borrados || 0;',
            '    totales.salteados += ru.cantidad_salteados || 0;',
            '',
            '    // --- Estado final ---',
            '    const r_fin = await _post(ctx, "grafo/resumen", {});',
            '    const res_fin = r_fin.resumen || {};',
            '',
            '    return {',
            '        exito: true,',
            '        duenos: duenos,',
            '        res_ini: res_ini,',
            '        res_fin: res_fin,',
            '        totales: totales,',
            '    };',
            '}',
        ],
    ],

    // ============================================================
    // 2. servicio.js: import de LimpiezaPrueba
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio: import de LimpiezaPrueba',
        'buscar' => [
            'import { CATALOGO, SECCIONES } from "./pruebas/catalogo.js";',
        ],
        'reemplazar' => [
            'import { CATALOGO, SECCIONES } from "./pruebas/catalogo.js";',
            'import { limpiar_datos_de_prueba } from "./LimpiezaPrueba.js";',
        ],
    ],

    // ============================================================
    // 3. servicio.js: funcion _ejecutar_limpieza antes del listener
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio: funcion _ejecutar_limpieza',
        'buscar' => [
            'chrome.runtime.onMessage.addListener((mensaje, sender, sendResponse) => {',
            '    if (!mensaje || !mensaje.tipo) return false;',
        ],
        'reemplazar' => [
            '/**',
            ' * Ejecuta la limpieza de datos de prueba en la pestana',
            ' * activa del piloto. Manda eventos de progreso a la',
            ' * ventana por broadcast (chrome.runtime.sendMessage).',
            ' * Si no hay ventana escuchando, el sendMessage falla y',
            ' * se traga el error (es best-effort).',
            ' */',
            'async function _ejecutar_limpieza() {',
            '    const pestana = await _obtener_pestana_piloto();',
            '    if (!pestana) {',
            '        return { exito: false, error: "No hay una pestana del piloto abierta" };',
            '    }',
            '    const ctx = _crear_ctx(pestana.id);',
            '',
            '    function al_progreso(evento) {',
            '        try {',
            '            chrome.runtime.sendMessage(',
            '                { tipo: "limpieza_progreso", evento: evento }',
            '            ).catch(function () { /* nadie escuchando */ });',
            '        } catch (e) { /* ignorar */ }',
            '    }',
            '',
            '    try {',
            '        return await limpiar_datos_de_prueba(ctx, al_progreso);',
            '    } catch (e) {',
            '        return { exito: false, error: e.message };',
            '    }',
            '}',
            '',
            'chrome.runtime.onMessage.addListener((mensaje, sender, sendResponse) => {',
            '    if (!mensaje || !mensaje.tipo) return false;',
        ],
    ],

    // ============================================================
    // 4. servicio.js: caso en el switch
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio: caso limpiar_datos_prueba',
        'buscar' => [
            '                case "listar_corridas":',
            '                    const corridas = await listar_ultimas_corridas(mensaje.limite || 20);',
            '                    sendResponse({ exito: true, corridas });',
            '                    break;',
        ],
        'reemplazar' => [
            '                case "listar_corridas":',
            '                    const corridas = await listar_ultimas_corridas(mensaje.limite || 20);',
            '                    sendResponse({ exito: true, corridas });',
            '                    break;',
            '',
            '                case "limpiar_datos_prueba":',
            '                    sendResponse(await _ejecutar_limpieza());',
            '                    break;',
        ],
    ],

    // ============================================================
    // 5. servicio.js: exponer global para la consola del SW
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio: global limpiar_prueba',
        'buscar' => [
            '    return true; // mantener canal abierto para respuesta async',
            '});',
        ],
        'reemplazar' => [
            '    return true; // mantener canal abierto para respuesta async',
            '});',
            '',
            '// ============================================================',
            '// Handler global para debug desde la consola del SW.',
            '// ============================================================',
            '//',
            '// `await globalThis.limpiar_prueba()` ejecuta la misma',
            '// rutina que el boton del popup. En MV3 no se puede hacer',
            '// import() dinamico desde la consola del SW, por eso',
            '// exponerlo en globalThis es la via.',
            'globalThis.limpiar_prueba = async () => {',
            '    return await _ejecutar_limpieza();',
            '};',
        ],
    ],

    // ============================================================
    // 6. ventana.html: CSS para la limpieza
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.html',
        'descripcion' => 'ventana.html: CSS de limpieza',
        'buscar' => [
            '    li.corriendo .resultado { background: #fff3cd; color: #7a4f00; }',
            '  </style>',
        ],
        'reemplazar' => [
            '    li.corriendo .resultado { background: #fff3cd; color: #7a4f00; }',
            '',
            '    /* Limpieza de datos de prueba */',
            '    .limpieza-header {',
            '      display: flex;',
            '      justify-content: space-between;',
            '      align-items: center;',
            '      padding: 8px 10px;',
            '      margin-bottom: 12px;',
            '      background: #f8f9fa;',
            '      border: 1px solid #e0e0e0;',
            '      border-radius: 6px;',
            '    }',
            '    .limpieza-header button {',
            '      font-size: 12px;',
            '      padding: 4px 12px;',
            '    }',
            '    #limpieza_estado {',
            '      font-size: 11px;',
            '      color: #666;',
            '    }',
            '    #limpieza_log {',
            '      font-family: Consolas, Monaco, monospace;',
            '      font-size: 11px;',
            '      line-height: 1.4;',
            '      background: #1e1e1e;',
            '      color: #d4d4d4;',
            '      padding: 8px;',
            '      border-radius: 4px;',
            '      margin: 0 0 12px 0;',
            '      max-height: 260px;',
            '      overflow-y: auto;',
            '      white-space: pre-wrap;',
            '    }',
            '  </style>',
        ],
    ],

    // ============================================================
    // 7. ventana.html: HTML del boton + pre
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.html',
        'descripcion' => 'ventana.html: boton + pre',
        'buscar' => [
            '  <h1>Iteradores Pruebas</h1>',
            '  <div class="estado" id="mensaje_estado">Cargando...</div>',
        ],
        'reemplazar' => [
            '  <h1>Iteradores Pruebas</h1>',
            '',
            '  <div class="limpieza-header">',
            '    <button id="btn_limpiar_datos_prueba">Limpiar datos de prueba</button>',
            '    <span id="limpieza_estado"></span>',
            '  </div>',
            '  <pre id="limpieza_log" style="display:none"></pre>',
            '',
            '  <div class="estado" id="mensaje_estado">Cargando...</div>',
        ],
    ],

    // ============================================================
    // 8. ventana.js: logica del boton + progreso
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.js',
        'descripcion' => 'ventana.js: logica del boton de limpieza',
        'buscar' => [
            '    function aplicar_resultado(el, resp) {',
        ],
        'reemplazar' => [
            '    // ============================================================',
            '    // Limpieza de datos de prueba',
            '    // ============================================================',
            '',
            '    function _log_agregar(texto) {',
            '        const log = document.getElementById("limpieza_log");',
            '        if (!log) return;',
            '        log.textContent += texto + "\\n";',
            '        log.scrollTop = log.scrollHeight;',
            '    }',
            '',
            '    function _procesar_progreso(evento) {',
            '        if (!evento) return;',
            '        if (evento.tipo === "dueno") {',
            '            _log_agregar("");',
            '            _log_agregar("=== Dueno: " + evento.nombre + " ===");',
            '        } else if (evento.tipo === "ok") {',
            '            let linea = "  [ok] " + evento.etiqueta + ": "',
            '                + evento.borrados + " borrados";',
            '            if (evento.extra && evento.extra > 0) {',
            '                linea += " (+" + evento.extra + " vehiculos)";',
            '            }',
            '            if (evento.salteados && evento.salteados > 0) {',
            '                linea += ", " + evento.salteados + " salteados";',
            '            }',
            '            _log_agregar(linea);',
            '        } else if (evento.tipo === "warning") {',
            '            _log_agregar("  [warn] " + evento.etiqueta + ": " + evento.error);',
            '        }',
            '    }',
            '',
            '    function _mostrar_resumen(resp) {',
            '        const ini = resp.res_ini || {};',
            '        const fin = resp.res_fin || {};',
            '        const t = resp.totales || {};',
            '        const d_total = (fin.total || 0) - (ini.total || 0);',
            '        const d_huer = (fin.huerfanos || 0) - (ini.huerfanos || 0);',
            '',
            '        _log_agregar("");',
            '        _log_agregar("=== RESUMEN ===");',
            '        _log_agregar("Nodos:     " + (ini.total || 0) + " -> "',
            '            + (fin.total || 0) + " (" + d_total + ")");',
            '        _log_agregar("Huerfanos: " + (ini.huerfanos || 0) + " -> "',
            '            + (fin.huerfanos || 0) + " (" + d_huer + ")");',
            '        _log_agregar("");',
            '        _log_agregar("Borrados por categoria:");',
            '        _log_agregar("  ventas:        " + (t.ventas || 0));',
            '        _log_agregar("  cancelaciones: " + (t.cancelaciones || 0));',
            '        _log_agregar("  viajes:        " + (t.viajes || 0));',
            '        _log_agregar("  pasajeros:     " + (t.pasajeros || 0));',
            '        _log_agregar("  empresas:      " + (t.empresas || 0));',
            '        _log_agregar("  vehiculos:     " + (t.vehiculos || 0));',
            '        _log_agregar("  terminales:    " + (t.terminales || 0));',
            '        _log_agregar("  usuarios:      " + (t.usuarios || 0));',
            '        if (t.salteados > 0) {',
            '            _log_agregar("  salteados:     " + t.salteados);',
            '        }',
            '    }',
            '',
            '    async function limpiar_datos_de_prueba() {',
            '        const ok = confirm(',
            '            "Limpiar todos los datos de prueba?\\n\\n"',
            '            + "Esta accion borra ventas, cancelaciones, viajes, "',
            '            + "pasajeros, empresas, vehiculos y terminales de "',
            '            + "prueba.\\n\\n"',
            '            + "No toca datos reales."',
            '        );',
            '        if (!ok) return;',
            '',
            '        const btn = document.getElementById("btn_limpiar_datos_prueba");',
            '        const log = document.getElementById("limpieza_log");',
            '        const estado_l = document.getElementById("limpieza_estado");',
            '',
            '        btn.disabled = true;',
            '        log.style.display = "block";',
            '        log.textContent = "";',
            '        estado_l.textContent = "Limpiando...";',
            '',
            '        try {',
            '            const resp = await enviar({ tipo: "limpiar_datos_prueba" });',
            '            if (!resp || !resp.exito) {',
            '                _log_agregar("");',
            '                _log_agregar("ERROR: " + (resp && resp.error ? resp.error : "desconocido"));',
            '                estado_l.textContent = "Error";',
            '                return;',
            '            }',
            '            _mostrar_resumen(resp);',
            '            estado_l.textContent = "Listo";',
            '        } catch (e) {',
            '            _log_agregar("");',
            '            _log_agregar("ERROR: " + e.message);',
            '            estado_l.textContent = "Error";',
            '        } finally {',
            '            btn.disabled = false;',
            '        }',
            '    }',
            '',
            '    // Listener de progreso (broadcast desde el SW).',
            '    chrome.runtime.onMessage.addListener((msg) => {',
            '        if (msg && msg.tipo === "limpieza_progreso") {',
            '            _procesar_progreso(msg.evento);',
            '        }',
            '    });',
            '',
            '    document.addEventListener("DOMContentLoaded", () => {',
            '        const btn = document.getElementById("btn_limpiar_datos_prueba");',
            '        if (btn) btn.addEventListener("click", limpiar_datos_de_prueba);',
            '    });',
            '',
            '    function aplicar_resultado(el, resp) {',
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
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    $rel = substr($ruta_abs, strlen($raiz_proyecto) + 1);
    $ext = strtolower(pathinfo($ruta_abs, PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump_php_js[] = $rel;
}
foreach ($creaciones as $cr) {
    $ext = strtolower(pathinfo($cr['archivo'], PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump_php_js[] = $cr['archivo'];
}

$bumps_atversion = 0;
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

if ($bumpear && (!empty($bumps_detalle) || !empty($info_bumps))) {
    echo "\n--- Bumps ---\n";
    foreach ($bumps_detalle as $d) echo "[BUMP] $d\n";
    foreach ($info_bumps as $i) echo "[INFO] $i\n";
}

echo "\n=== Resumen ===\n";
echo "Bloques aplicados: $bloques_ok\n";
echo "Archivos escritos: $archivos_escritos\n";
if ($bumpear) echo "Bumps @version:    $bumps_atversion\n";
if (!empty($bloques_fallidos)) {
    echo "Fallos: " . count($bloques_fallidos) . "\n";
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";