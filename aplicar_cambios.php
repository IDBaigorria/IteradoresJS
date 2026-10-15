<?php
/**
 * Aplicador — Ajuste de layout de la ventana del plugin.
 *
 * 1. Ancho: min-width 600px -> 720px.
 * 2. Botones globales (Limpiar, Copiar) en paralelo horizontal.
 *
 * Los IDs de los elementos de estado y salida (limpieza_estado,
 * copiar_estado, limpieza_log, copiar_pre, copiar_textarea) no
 * cambian, asi que ventana.js sigue funcionando igual.
 *
 * Uso (raiz del proyecto plugin): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.7t';
$htmls_a_bumpear = [];

$cambios = [

    // 1. Ancho de la ventana.
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.html',
        'descripcion' => 'ventana.html: ancho 720px',
        'buscar' => [
            '    body { font-family: sans-serif; margin: 0; padding: 12px; min-width: 600px; }',
        ],
        'reemplazar' => [
            '    body { font-family: sans-serif; margin: 0; padding: 12px; min-width: 720px; }',
        ],
    ],

    // 2. CSS: reemplazar .limpieza-header por .acciones-globales.
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.html',
        'descripcion' => 'ventana.html: CSS unificado de acciones globales',
        'buscar' => [
            '    /* Limpieza de datos de prueba */',
            '    .limpieza-header {',
            '      display: flex;',
            '      justify-content: space-between;',
            '      align-items: center;',
            '      padding: 8px 10px;',
            '      margin-bottom: 8px;',
            '      background: #f8f9fa;',
            '      border: 1px solid #e0e0e0;',
            '      border-radius: 6px;',
            '    }',
            '    .limpieza-header button {',
            '      font-size: 12px;',
            '      padding: 4px 12px;',
            '    }',
        ],
        'reemplazar' => [
            '    /* Acciones globales (limpiar y copiar), en paralelo */',
            '    .acciones-globales {',
            '      display: flex;',
            '      gap: 20px;',
            '      align-items: center;',
            '      padding: 8px 10px;',
            '      margin-bottom: 12px;',
            '      background: #f8f9fa;',
            '      border: 1px solid #e0e0e0;',
            '      border-radius: 6px;',
            '    }',
            '    .accion-item {',
            '      display: flex;',
            '      align-items: center;',
            '      gap: 8px;',
            '    }',
            '    .accion-item button {',
            '      font-size: 12px;',
            '      padding: 4px 12px;',
            '    }',
        ],
    ],

    // 3. CSS: eliminar .copiar-header.
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.html',
        'descripcion' => 'ventana.html: quitar CSS de .copiar-header',
        'buscar' => [
            '    /* Copiar tabla de pasajeros */',
            '    .copiar-header {',
            '      display: flex;',
            '      justify-content: space-between;',
            '      align-items: center;',
            '      padding: 8px 10px;',
            '      margin-bottom: 12px;',
            '      background: #f8f9fa;',
            '      border: 1px solid #e0e0e0;',
            '      border-radius: 6px;',
            '    }',
            '    .copiar-header button {',
            '      font-size: 12px;',
            '      padding: 4px 12px;',
            '    }',
            '    #copiar_estado {',
        ],
        'reemplazar' => [
            '    #copiar_estado {',
        ],
    ],

    // 4. HTML: unificar los dos bloques en uno.
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.html',
        'descripcion' => 'ventana.html: botones globales en paralelo',
        'buscar' => [
            '  <div class="limpieza-header">',
            '    <button id="btn_limpiar_datos_prueba">Limpiar datos de prueba</button>',
            '    <span id="limpieza_estado"></span>',
            '  </div>',
            '  <pre id="limpieza_log" style="display:none"></pre>',
            '',
            '  <div class="copiar-header">',
            '    <button id="btn_copiar_pasajeros">Copiar tabla de pasajeros</button>',
            '    <span id="copiar_estado"></span>',
            '  </div>',
            '  <pre id="copiar_pre" style="display:none"></pre>',
            '  <textarea id="copiar_textarea" style="display:none" readonly></textarea>',
        ],
        'reemplazar' => [
            '  <div class="acciones-globales">',
            '    <div class="accion-item">',
            '      <button id="btn_limpiar_datos_prueba">Limpiar datos de prueba</button>',
            '      <span id="limpieza_estado"></span>',
            '    </div>',
            '    <div class="accion-item">',
            '      <button id="btn_copiar_pasajeros">Copiar tabla de pasajeros</button>',
            '      <span id="copiar_estado"></span>',
            '    </div>',
            '  </div>',
            '  <pre id="limpieza_log" style="display:none"></pre>',
            '  <pre id="copiar_pre" style="display:none"></pre>',
            '  <textarea id="copiar_textarea" style="display:none" readonly></textarea>',
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