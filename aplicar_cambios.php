<?php
/**
 * Aplicador — v1.5plugin.9m (v3): URLs nuevas + bump desde 9i.
 * Runner corregido para escribir cambios parciales en modo no estricto.
 *
 * Uso (raíz de iteradoresJS/): php aplicar_cambios.php
 */

$modo_estricto = false;
$raiz_proyecto = __DIR__;
$version_nueva = '';
$htmls_a_bumpear = [];

$cambios = [

    // ============================================================
    // 1. ConfiguracionApli.js: URLs de entorno
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'ConfiguracionApli.js: URLs de pruebas y producción',
        'buscar' => [
            'export const URL_PILOTO_PRUEBAS = "https://viajesdelcarmen.rf.gd/";',
            'export const URL_PILOTO_PRODUCCION = "https://viajesdelcarmen.click.gd/";',
        ],
        'reemplazar' => [
            'export const URL_PILOTO_PRUEBAS = "https://viajespquiadelcarmen.rf.gd/";',
            'export const URL_PILOTO_PRODUCCION = "https://viajespquiadelcarmen.infy.click/";',
        ],
    ],

    // ============================================================
    // 2. ConfiguracionApli.js: @version header
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'ConfiguracionApli.js: @version header 9i → 9m',
        'buscar' => [
            ' * @version 1.5plugin.9i',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.9m',
        ],
    ],

    // ============================================================
    // 3. ConfiguracionApli.js: VERSION_APP 9i → 9m
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'ConfiguracionApli.js: VERSION_APP 9i → 9m',
        'buscar' => [
            'export const VERSION_APP = "1.5plugin.9i";',
        ],
        'reemplazar' => [
            'export const VERSION_APP = "1.5plugin.9m";',
        ],
    ],

    // ============================================================
    // 4. ConfiguracionApli.js: VERSION_PLUGIN 9i → 9m
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'ConfiguracionApli.js: VERSION_PLUGIN 9i → 9m',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.9i";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.9m";',
        ],
    ],

];

// ============================================================
// Runner v2 (corregido)
// ============================================================
// Cambio respecto del runner estándar: en modo no estricto
// (strict=false), si hay fallos, los archivos con cambios
// efectivos SÍ se escriben. El bug anterior era que
// `$hubo_error` (por archivo) bloqueaba la escritura incluso
// cuando otros bloques del mismo archivo habían matcheado.
// En modo estricto, se sigue abortando antes de escribir.
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

if (!isset($htmls_a_bumpear) || !is_array($htmls_a_bumpear)) { $htmls_a_bumpear = []; }
if (!isset($version_nueva)) $version_nueva = '';
$version_nueva = trim((string)$version_nueva);
$bumpear = ($version_nueva !== '');

$creaciones = []; $eliminaciones = []; $reemplazos_por_archivo = [];
foreach ($cambios as $cambio) {
    $tipo = $cambio['tipo'] ?? 'reemplazar';
    if ($tipo === 'crear') { $creaciones[] = $cambio; continue; }
    if ($tipo === 'eliminar') { $eliminaciones[] = $cambio; continue; }
    if (!isset($cambio['buscar']) || !isset($cambio['reemplazar'])) continue;
    $reemplazos_por_archivo[$cambio['archivo']][] = $cambio;
}

echo "[INFO] " . count($reemplazos_por_archivo) . " archivo(s) a reemplazar, "
    . count($creaciones) . " a crear, " . count($eliminaciones) . " a eliminar.\n\n";

$archivos_a_escribir = []; $bloques_ok = 0; $bloques_fallidos = [];

foreach ($reemplazos_por_archivo as $archivo_rel => $lista) {
    $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
    if (!file_exists($ruta_abs)) { $bloques_fallidos[] = "Archivo no encontrado: $archivo_rel"; continue; }
    $contenido_original = file_get_contents($ruta_abs);
    $eol = detectar_eol($contenido_original);
    $contenido = normalizar_a_unix($contenido_original);
    $contenido_antes = $contenido;
    foreach ($lista as $cambio) {
        $buscar_str = implode("\n", $cambio['buscar']);
        $reemplazar_str = implode("\n", $cambio['reemplazar']);
        $n = contar_ocurrencias($contenido, $buscar_str);
        if ($n === 0) { $bloques_fallidos[] = "$archivo_rel: no encontrado - {$cambio['descripcion']}"; continue; }
        if ($n > 1) { $bloques_fallidos[] = "$archivo_rel: ambiguo ($n) - {$cambio['descripcion']}"; continue; }
        $contenido = str_replace($buscar_str, $reemplazar_str, $contenido);
        $bloques_ok++;
    }
    // CORRECCIÓN: escribir aunque haya fallos, si hubo cambios efectivos.
    if ($contenido !== $contenido_antes) {
        $archivos_a_escribir[$ruta_abs] = [$contenido, $eol];
    }
}

if ($modo_estricto && !empty($bloques_fallidos)) {
    echo "=== ABORTADO ===\n";
    foreach ($bloques_fallidos as $f) echo "  [FALLO] $f\n";
    exit(1);
}

$archivos_bump = [];
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    $ext = strtolower(pathinfo($ruta_abs, PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump[] = substr($ruta_abs, strlen($raiz_proyecto) + 1);
}

$bumps = 0; $bumps_detalle = []; $info_bumps = [];
if ($bumpear) {
    foreach (array_unique($archivos_bump) as $archivo_rel) {
        $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
        if (!file_exists($ruta_abs)) continue;
        if (isset($archivos_a_escribir[$ruta_abs])) { list($contenido, $eol) = $archivos_a_escribir[$ruta_abs]; }
        else { $contenido = normalizar_a_unix(file_get_contents($ruta_abs)); $eol = detectar_eol($contenido); }
        $viejo = '';
        $nuevo = preg_replace_callback('/(\*\s+@version\s+)(\S+)/', function($m) use ($version_nueva, &$viejo) {
            $viejo = $m[2]; return $m[1] . $version_nueva;
        }, $contenido, 1, $count);
        if ($count === 0) { $info_bumps[] = "$archivo_rel (sin @version)"; continue; }
        if ($viejo === $version_nueva) continue;
        $archivos_a_escribir[$ruta_abs] = [normalizar_a_unix($nuevo), $eol];
        $bumps++; $bumps_detalle[] = "$archivo_rel  @version $viejo → $version_nueva";
    }
}

$archivos_escritos = 0;
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    list($contenido_unix, $eol) = $info;
    if (file_put_contents($ruta_abs, normalizar_a_original($contenido_unix, $eol)) === false) {
        echo "[FALLO] No se pudo escribir: " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n"; continue;
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
if ($bumpear) echo "Bumps @version:    $bumps\n";
if (!empty($bloques_fallidos)) {
    echo "Fallos: " . count($bloques_fallidos) . "\n";
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";