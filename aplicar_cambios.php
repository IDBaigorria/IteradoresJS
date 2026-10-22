<?php
/**
 * Aplicador — v1.5plugin.9e: fix del parser de migraciones.
 *
 * Uso (raíz de iteradoresJS/): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.9e';
$htmls_a_bumpear = [];

$cambios = [

    // ============================================================
    // 1. Migraciones.js: parser estricto
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/Migraciones.js',
        'descripcion' => 'Migraciones.js: parser estricto de output',
        'buscar' => [
            'function _parsear_output(paso, r) {',
            '    const texto = (r && r.texto) ? r.texto : "";',
            '    const status = (r && r.status) ? r.status : 0;',
            '',
            '    if (r && r.error) return { estado: "error", mensaje: "Red: " + r.error };',
            '    if (status >= 500) {',
            '        const m = texto.match(/(?:ERROR|Fatal error)[^\\n]*/i);',
            '        return { estado: "error", mensaje: m ? m[0].slice(0, 120) : "HTTP " + status };',
            '    }',
            '',
            '    const err_match = texto.match(/(?:ERROR|Fatal error)[^\\n]*/i);',
            '    if (err_match) return { estado: "error", mensaje: err_match[0].slice(0, 120) };',
            '',
            '    if (/Saltados?:\\s+[1-9]/i.test(texto)) return { estado: "saltado", mensaje: "Ya estaba migrado" };',
            '    if (/Cambios aplicados:\\s+0/i.test(texto)) return { estado: "saltado", mensaje: "Sin cambios" };',
            '    if (/no existe en SQL\\. Se saltea/i.test(texto)) return { estado: "saltado", mensaje: "No existe en SQL" };',
            '',
            '    if (/Listo\\./i.test(texto) || /Guardado\\./i.test(texto)) {',
            '        return { estado: "ok", mensaje: "" };',
            '    }',
            '',
            '    if (status === 200) return { estado: "ambiguo", mensaje: "Output no reconocido" };',
            '    return { estado: "error", mensaje: "HTTP " + status };',
            '}',
        ],
        'reemplazar' => [
            'function _parsear_output(paso, r) {',
            '    const texto = (r && r.texto) ? r.texto : "";',
            '    const status = (r && r.status) ? r.status : 0;',
            '',
            '    if (r && r.error) return { estado: "error", mensaje: "Red: " + r.error };',
            '    if (status >= 500) {',
            '        const m = texto.match(/(?:Fatal error|^ERROR:)[^\\n]*/im);',
            '        return { estado: "error", mensaje: m ? m[0].slice(0, 120) : "HTTP " + status };',
            '    }',
            '',
            '    // v1.5plugin.9e: solo matchear errores reales. El piloto',
            '    // imprime "errores:" (vacío, lowercase) y "Errores:" (label',
            '    // de array con contenido abajo) en outputs exitosos. El',
            '    // regex anterior era case-insensitive y matcheaba "errores"',
            '    // como si fuera un error. Ahora solo "ERROR:" (mayúscula',
            '    // al principio de línea) y "Fatal error" son errores.',
            '    const err_match = texto.match(/(?:Fatal error|^ERROR:)[^\\n]*/im);',
            '    if (err_match) return { estado: "error", mensaje: err_match[0].slice(0, 120) };',
            '',
            '    // Saltado: "saltados => N", "Saltados: N", "cambios aplicados: N"',
            '    // (N>0). El piloto usa "=>" en algunas migraciones y ":" en',
            '    // otras; el regex acepta los dos formatos.',
            '    if (/(?:saltados?|cambios aplicados)\\s*(?:=>|:)\\s*[1-9]/i.test(texto)) {',
            '        return { estado: "saltado", mensaje: "Ya estaba migrado / sin cambios" };',
            '    }',
            '    if (/no existe en SQL\\. Se saltea/i.test(texto)) return { estado: "saltado", mensaje: "No existe en SQL" };',
            '',
            '    if (/Listo\\./i.test(texto) || /Guardado\\./i.test(texto)) {',
            '        return { estado: "ok", mensaje: "" };',
            '    }',
            '',
            '    if (status === 200) return { estado: "ambiguo", mensaje: "Output no reconocido" };',
            '    return { estado: "error", mensaje: "HTTP " + status };',
            '}',
        ],
    ],

    // ============================================================
    // 2. ConfiguracionApli.js: bump a 9e
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'ConfiguracionApli.js: bump VERSION_APP a 9e',
        'buscar' => [
            'export const VERSION_APP = "1.5plugin.9d";',
        ],
        'reemplazar' => [
            'export const VERSION_APP = "1.5plugin.9e";',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'ConfiguracionApli.js: bump VERSION_PLUGIN a 9e',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.9d";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.9e";',
        ],
    ],

];

// ============================================================
// Runner v2 (estándar)
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