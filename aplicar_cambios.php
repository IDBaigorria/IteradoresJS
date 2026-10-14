<?php
/**
 * Aplicador — P34: monto_pagado robusto.
 *
 * La prueba 34 pasa `monto_pagado: monto_micro` (= "1000"
 * hardcodeado). Con `cuotas: "1"`, el backend valida
 * `monto_pagado >= total` (v77m). Si el total del viaje
 * no es exactamente 1000 (por ejemplo, porque el micro
 * tiene un monto distinto al que se pasó), falla con
 * "Con 1 sola cuota, el monto a pagar debe cubrir el total".
 *
 * Fix: usar un monto grande. El backend ajusta al total real.
 *
 * Uso (parado en iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: monto_pagado grande',
        'buscar' => [
            '        const rv = await ctx.pedir_post("index.php", {',
            '            accion: "ventas/confirmar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_terminal,',
            '            metodo_pago: "efectivo",',
            '            cuotas: "1",',
            '            monto_pagado: monto_micro,',
        ],
        'reemplazar' => [
            '        const rv = await ctx.pedir_post("index.php", {',
            '            accion: "ventas/confirmar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_terminal,',
            '            metodo_pago: "efectivo",',
            '            cuotas: "1",',
            '            // Un monto grande evita la validación de v77m',
            '            // ("con 1 cuota el monto debe cubrir el total").',
            '            // El backend ajusta al total real.',
            '            monto_pagado: "999999",',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: bump',
        'buscar' => [' * @version 1.5plugin.6s'],
        'reemplazar' => [' * @version 1.5plugin.6t'],
    ],
];

// ============================================================
// Runner
// ============================================================

echo "=== Aplicador — P34: monto_pagado grande ===\n\n";

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