<?php
/**
 * Aplicador — Reiniciar selección en pruebas 34, 35, 36 (v2).
 *
 * El script anterior abortó por bumps mal calculados. Este
 * usa las versiones reales:
 *   P34: 6u → 6v
 *   P35: 6r → 6s
 *   P36: 6t → 6u
 *
 * Inserta la llamada a viajes/reiniciar_seleccion_completa al
 * inicio de cada prueba.
 *
 * Requiere el endpoint del piloto V1.5piloto.79h. Correr el
 * script A (piloto) ANTES que este.
 *
 * Uso (parado en iteradoresJS/): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$reinicio = [
    '',
    '        // Limpiar cualquier venta_actual colgada de la terminal.',
    '        // Si una corrida anterior falló a mitad de selección, la',
    '        // venta_actual quedó colgada con asientos temporales, y',
    '        // la próxima corrida acumula sobre eso. Idempotente.',
    '        await ctx.pedir_post("index.php", {',
    '            accion: "viajes/reiniciar_seleccion_completa",',
    '            nombre_solicitante: nombre_admin,',
    '            nombre_terminal',
    '        });',
];

$cambios = [
    // ============================================================
    // Prueba 34
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: reiniciar selección al inicio',
        'buscar' => [
            '        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);',
            '        const nombre_terminal = await _primera_terminal(ctx, nombre_admin, nombre_dueno);',
            '',
            '        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
        ],
        'reemplazar' => array_merge(
            [
                '        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);',
                '        const nombre_terminal = await _primera_terminal(ctx, nombre_admin, nombre_dueno);',
            ],
            $reinicio,
            [
                '',
                '        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            ]
        ),
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: bump 6u → 6v',
        'buscar' => [' * @version 1.5plugin.6u'],
        'reemplazar' => [' * @version 1.5plugin.6v'],
    ],

    // ============================================================
    // Prueba 35
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: reiniciar selección al inicio',
        'buscar' => [
            '        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);',
            '        const nombre_terminal = await _primera_terminal(ctx, nombre_admin, nombre_dueno);',
            '',
            '        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
        ],
        'reemplazar' => array_merge(
            [
                '        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);',
                '        const nombre_terminal = await _primera_terminal(ctx, nombre_admin, nombre_dueno);',
            ],
            $reinicio,
            [
                '',
                '        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            ]
        ),
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: bump 6r → 6s',
        'buscar' => [' * @version 1.5plugin.6r'],
        'reemplazar' => [' * @version 1.5plugin.6s'],
    ],

    // ============================================================
    // Prueba 36
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: reiniciar selección al inicio',
        'buscar' => [
            '        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);',
            '        const nombre_terminal = await _primera_terminal(ctx, nombre_admin, nombre_dueno);',
            '',
            '        // Sufijo único para esta corrida. Se usa para los',
            '        // nombres de viaje, empresa y vehículo de setup.',
            '        const sufijo = String(Date.now()).slice(-8);',
        ],
        'reemplazar' => array_merge(
            [
                '        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);',
                '        const nombre_terminal = await _primera_terminal(ctx, nombre_admin, nombre_dueno);',
            ],
            $reinicio,
            [
                '',
                '        // Sufijo único para esta corrida. Se usa para los',
                '        // nombres de viaje, empresa y vehículo de setup.',
                '        const sufijo = String(Date.now()).slice(-8);',
            ]
        ),
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: bump 6t → 6u',
        'buscar' => [' * @version 1.5plugin.6t'],
        'reemplazar' => [' * @version 1.5plugin.6u'],
    ],
];

// ============================================================
// Runner
// ============================================================

echo "=== Aplicador — Reiniciar selección en pruebas 34, 35, 36 (v2) ===\n\n";

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