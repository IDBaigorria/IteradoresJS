<?php
/**
 * Aplicador — Estado en vivo de la corrida en chrome.storage.session.
 *
 * Contexto: si el popup se cierra durante una corrida, al
 * reabrirlo no sabe que el SW sigue ejecutando. Este fix
 * persiste el estado "corriendo" en chrome.storage.session,
 * que sobrevive al cierre del popup. Al reabrir, el popup lee
 * el estado y pinta la prueba en curso.
 *
 * Arquitectura:
 *   - SW escribe {corriendo: true, id_prueba, inicio} al
 *     arrancar cada prueba, y lo limpia al terminar.
 *   - SW notifica al popup por sendMessage (best-effort).
 *   - Popup lee el estado al abrirse (pide al SW) y escucha
 *     las notificaciones para actualizar en vivo.
 *   - Al arrancar el SW, limpia cualquier estado colgado de
 *     una corrida anterior (SW reiniciado por inactividad).
 *
 * Uso (raiz del proyecto plugin): php aplicar_cambios.php
 *
 * PRERREQUISITO: el manifest.json debe tener el permiso
 * "storage" (chrome.storage.session). Ver el bloque al final.
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.7z';
$htmls_a_bumpear = [];

$cambios = [

    // ============================================================
    // 1. servicio.js: constantes y helpers de estado en vivo
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio: helpers de estado en vivo',
        'buscar' => [
            'let _cache_nombre_solicitante = null;',
            'let _cache_dueno_actual = null;',
        ],
        'reemplazar' => [
            'let _cache_nombre_solicitante = null;',
            'let _cache_dueno_actual = null;',
            '',
            '// ============================================================',
            '// Estado en vivo de la corrida',
            '// ============================================================',
            '//',
            '// Vive en chrome.storage.session: sobrevive al cierre del',
            '// popup (mientras el navegador este abierto), pero muere al',
            '// cerrar Chrome. El SW lo escribe cuando arranca una prueba',
            '// y lo limpia cuando termina. El popup lo lee al abrirse y',
            '// escucha las notificaciones para actualizar en vivo.',
            'const ESTADO_EN_VIVO_KEY = "plugin_estado_en_vivo";',
            '',
            'async function _guardar_estado_en_vivo(estado) {',
            '    try {',
            '        await chrome.storage.session.set({ [ESTADO_EN_VIVO_KEY]: estado });',
            '    } catch (e) {',
            '        console.warn("No se pudo guardar el estado en vivo:", e);',
            '    }',
            '}',
            '',
            'async function _leer_estado_en_vivo() {',
            '    try {',
            '        const r = await chrome.storage.session.get([ESTADO_EN_VIVO_KEY]);',
            '        return r[ESTADO_EN_VIVO_KEY] || null;',
            '    } catch (e) {',
            '        console.warn("No se pudo leer el estado en vivo:", e);',
            '        return null;',
            '    }',
            '}',
            '',
            'async function _limpiar_estado_en_vivo() {',
            '    try {',
            '        await chrome.storage.session.remove([ESTADO_EN_VIVO_KEY]);',
            '    } catch (e) {',
            '        console.warn("No se pudo limpiar el estado en vivo:", e);',
            '    }',
            '}',
            '',
            'function _notificar_estado_en_vivo(estado) {',
            '    try {',
            '        chrome.runtime.sendMessage(',
            '            { tipo: "estado_en_vivo_cambio", estado }',
            '        ).catch(function () { /* nadie escuchando */ });',
            '    } catch (e) { /* ignorar */ }',
            '}',
        ],
    ],

    // ============================================================
    // 2. servicio.js: limpiar estado huerfano al arrancar el SW
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio: limpiar estado huerfano al arrancar',
        'buscar' => [
            'async function _obtener_pestana_piloto() {',
        ],
        'reemplazar' => [
            '// Al arrancar el SW, limpiar cualquier estado en vivo',
            '// colgado de una corrida anterior. Si el SW se reinicio',
            '// por inactividad a mitad de una prueba, el estado queda',
            '// con corriendo: true sin que nadie lo haya terminado.',
            '// Solo limpiamos; el usuario vera el popup sin marcas.',
            '(async () => {',
            '    try {',
            '        const estado = await _leer_estado_en_vivo();',
            '        if (estado && estado.corriendo) {',
            '            await _limpiar_estado_en_vivo();',
            '        }',
            '    } catch (e) { /* ignorar */ }',
            '})();',
            '',
            'async function _obtener_pestana_piloto() {',
        ],
    ],

    // ============================================================
    // 3. servicio.js: marcar/limpiar estado en _correr_prueba
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio: estado en vivo en _correr_prueba',
        'buscar' => [
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
        ],
        'reemplazar' => [
            '    const ctx = _crear_ctx(pestana.id);',
            '    const inicio = Date.now();',
            '    let resultado = "ok";',
            '    let detalle = "";',
            '',
            '    // Estado en vivo: marcar "corriendo".',
            '    await _guardar_estado_en_vivo({ corriendo: true, id_prueba, inicio });',
            '    _notificar_estado_en_vivo({ corriendo: true, id_prueba, inicio });',
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
            '    // Estado en vivo: marcar "terminada".',
            '    await _limpiar_estado_en_vivo();',
            '    _notificar_estado_en_vivo({ corriendo: false, id_prueba, duracion_ms, resultado });',
            '',
            '    return { exito: true, resultado, detalle, duracion_ms };',
            '}',
        ],
    ],

    // ============================================================
    // 4. servicio.js: case "estado_en_vivo" en el listener
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio: case estado_en_vivo',
        'buscar' => [
            '                case "correr_prueba":',
            '                    sendResponse(await _correr_prueba(mensaje.id_prueba));',
            '                    break;',
        ],
        'reemplazar' => [
            '                case "correr_prueba":',
            '                    sendResponse(await _correr_prueba(mensaje.id_prueba));',
            '                    break;',
            '',
            '                case "estado_en_vivo": {',
            '                    const estado_ev = await _leer_estado_en_vivo();',
            '                    sendResponse({ exito: true, estado: estado_ev });',
            '                    break;',
            '                }',
        ],
    ],

    // ============================================================
    // 5. ventana.js: aplicar cambio de estado
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.js',
        'descripcion' => 'ventana: funcion _aplicar_cambio_estado',
        'buscar' => [
            '    chrome.runtime.onMessage.addListener((msg) => {',
            '        if (msg && msg.tipo === "limpieza_progreso") {',
            '            _procesar_progreso(msg.evento);',
            '        }',
            '    });',
        ],
        'reemplazar' => [
            '    chrome.runtime.onMessage.addListener((msg) => {',
            '        if (msg && msg.tipo === "limpieza_progreso") {',
            '            _procesar_progreso(msg.evento);',
            '        }',
            '        if (msg && msg.tipo === "estado_en_vivo_cambio") {',
            '            _aplicar_cambio_estado(msg.estado);',
            '        }',
            '    });',
            '',
            '    // ============================================================',
            '    // Estado en vivo de la corrida',
            '    // ============================================================',
            '    //',
            '    // El SW escribe el estado en chrome.storage.session y',
            '    // nos notifica por mensaje. Al abrir el popup, pedimos',
            '    // el estado para saber si hay algo corriendo.',
            '    function _aplicar_cambio_estado(estado) {',
            '        // Limpiar cualquier marca previa.',
            '        document.querySelectorAll("li.corriendo").forEach((li) => {',
            '            li.classList.remove("corriendo");',
            '            const el = li.querySelector(".resultado");',
            '            if (el && el.textContent === "Corriendo...") {',
            '                el.textContent = "\\u2014";',
            '                el.className = "resultado";',
            '            }',
            '        });',
            '',
            '        if (!estado || !estado.corriendo || !estado.id_prueba) return;',
            '',
            '        // Buscar la li de la prueba en curso.',
            '        const lis = document.querySelectorAll("li[data-id-prueba]");',
            '        for (const li of lis) {',
            '            if (li.dataset.idPrueba === estado.id_prueba) {',
            '                li.classList.add("corriendo");',
            '                const el = li.querySelector(".resultado");',
            '                if (el) {',
            '                    el.textContent = "Corriendo...";',
            '                    el.className = "resultado";',
            '                }',
            '                break;',
            '            }',
            '        }',
            '    }',
            '',
            '    async function _cargar_estado_inicial() {',
            '        let resp;',
            '        try {',
            '            resp = await enviar({ tipo: "estado_en_vivo" });',
            '        } catch (e) {',
            '            return;',
            '        }',
            '        if (resp && resp.exito) {',
            '            _aplicar_cambio_estado(resp.estado);',
            '        }',
            '    }',
        ],
    ],

    // ============================================================
    // 6. ventana.js: arrancar con carga de estado inicial
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.js',
        'descripcion' => 'ventana: arrancar con estado inicial',
        'buscar' => [
            '    renderizar();',
            '});',
        ],
        'reemplazar' => [
            '    async function _arrancar() {',
            '        await renderizar();',
            '        await _cargar_estado_inicial();',
            '    }',
            '',
            '    _arrancar();',
            '});',
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