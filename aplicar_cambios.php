<?php
/**
 * Aplicador — Fix del helper _vehiculos_de_empresa.
 *
 * El script anterior agregó `nombre_dueno` al pedir_post del
 * helper, pero no cambió la firma ni las llamadas. El helper
 * seguía recibiendo (ctx, nombre_solicitante, nombre_empresa),
 * así que `nombre_dueno` era undefined.
 *
 * Fix: agregar `nombre_dueno` a la firma del helper y
 * propagarlo en todas las llamadas. 5 archivos.
 *
 * Uso (parado en iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

// Texto de la firma actual del helper y de la llamada.
$firma_vieja = [
    'async function _vehiculos_de_empresa(ctx, nombre_solicitante, nombre_empresa) {',
];
$firma_nueva = [
    'async function _vehiculos_de_empresa(ctx, nombre_solicitante, nombre_dueno, nombre_empresa) {',
];
$llamada_vieja = [
    '            const vehiculos = await _vehiculos_de_empresa(ctx, nombre_admin, empresa);',
];
$llamada_nueva = [
    '            const vehiculos = await _vehiculos_de_empresa(ctx, nombre_admin, nombre_dueno, empresa);',
];

$archivos = [
    'Aplicacion/pruebas/prueba_31_eliminar_micro_limpia_nodos.js',
    'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
    'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
    'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
    'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
];

$cambios = [];
foreach ($archivos as $archivo) {
    $cambios[] = [
        'tipo' => 'reemplazar',
        'archivo' => $archivo,
        'descripcion' => "Firma del helper en " . basename($archivo),
        'buscar' => $firma_vieja,
        'reemplazar' => $firma_nueva,
    ];
    $cambios[] = [
        'tipo' => 'reemplazar',
        'archivo' => $archivo,
        'descripcion' => "Llamada al helper en " . basename($archivo),
        'buscar' => $llamada_vieja,
        'reemplazar' => $llamada_nueva,
    ];
    $cambios[] = [
        'tipo' => 'reemplazar',
        'archivo' => $archivo,
        'descripcion' => "Bump de " . basename($archivo),
        'buscar' => [
            ' * @version 1.5plugin.6p',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.6q',
        ],
    ];
}

// ============================================================
// Runner
// ============================================================

echo "=== Aplicador — Fix _vehiculos_de_empresa ===\n\n";

function detectar_eol(string $c): string { return (strpos($c, "\r\n") !== false) ? "\r\n" : "\n"; }
function normalizar_a_unix(string $c): string { return str_replace("\r\n", "\n", $c); }
function normalizar_a_original(string $c, string $e): string { return $e === "\n" ? $c : str_replace("\n", "\r\n", $c); }
function contar_ocurrencias(string $c, string $b): int {
    if ($b === '') return 0;
    $n = 0; $o = 0;
    while (($p = strpos($c, $b, $o)) !== false) { $n++; $o = $p + strlen($b); }
    return $n;
}

$reemplazos_por_archivo = [];
foreach ($cambios as $cambio) {
    if (!isset($cambio['archivo']) || !isset($cambio['buscar']) || !isset($cambio['reemplazar'])) {
        echo "[FALLO] Cambio mal formado.\n"; exit(1);
    }
    $reemplazos_por_archivo[$cambio['archivo']][] = $cambio;
}

$archivos_a_escribir = [];
$bloques_ok = 0;
$bloques_fallidos = [];

foreach ($reemplazos_por_archivo as $archivo_rel => $lista) {
    $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
    if (!file_exists($ruta_abs)) {
        $bloques_fallidos[] = "Archivo no encontrado: $archivo_rel";
        continue;
    }
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
        $archivos_a_escribir[$ruta_abs] = normalizar_a_original($contenido, $eol);
    }
}

if ($modo_estricto && !empty($bloques_fallidos)) {
    echo "=== ABORTADO ===\n";
    foreach ($bloques_fallidos as $f) echo "  [FALLO] $f\n";
    exit(1);
}

foreach ($archivos_a_escribir as $ruta_abs => $contenido_final) {
    if (file_put_contents($ruta_abs, $contenido_final) === false) {
        echo "[FALLO] No se pudo escribir: " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n";
        continue;
    }
    echo "[OK] " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n";
}

echo "\n=== Resumen ===\nBloques aplicados: $bloques_ok\n";
if (!empty($bloques_fallidos)) { foreach ($bloques_fallidos as $f) echo "  - $f\n"; }
echo "\nListo.\n";