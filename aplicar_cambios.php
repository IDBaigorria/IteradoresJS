<?php
/**
 * Aplicador — Agregar nombre_dueno a los POSTs de vehiculos/*.
 *
 * El piloto v77v cambió vehiculos/agregar, actualizar_configuracion,
 * eliminar y listar para exigir `nombre_dueno`. Los POSTs del
 * plugin no lo mandaban y el backend respondía
 * "Dueño no especificado" (o, en el caso de listar, devolvía
 * vacío, rompiendo las pruebas que buscan vehículos configurados).
 *
 * Uso (parado en iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [
    // ============================================================
    // 1. Prueba 37: vehiculos/agregar
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_37_eliminar_vehiculo_limpia_nodos.js',
        'descripcion' => 'P37: vehiculos/agregar con nombre_dueno',
        'buscar' => [
            '        const r_ve = await ctx.pedir_post("index.php", {',
            '            accion: "vehiculos/agregar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_empresa,',
            '            nombre_vehiculo,',
            '            nombre_real: "Vehículo prueba grafo"',
            '        });',
        ],
        'reemplazar' => [
            '        const r_ve = await ctx.pedir_post("index.php", {',
            '            accion: "vehiculos/agregar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_empresa,',
            '            nombre_vehiculo,',
            '            nombre_real: "Vehículo prueba grafo"',
            '        });',
        ],
    ],

    // ============================================================
    // 2. Prueba 37: vehiculos/actualizar_configuracion
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_37_eliminar_vehiculo_limpia_nodos.js',
        'descripcion' => 'P37: actualizar_configuracion con nombre_dueno',
        'buscar' => [
            '        const r_cf = await ctx.pedir_post("index.php", {',
            '            accion: "vehiculos/actualizar_configuracion",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_empresa,',
            '            nombre_vehiculo,',
            '            configuracion: _config_asientos_2x2()',
            '        });',
        ],
        'reemplazar' => [
            '        const r_cf = await ctx.pedir_post("index.php", {',
            '            accion: "vehiculos/actualizar_configuracion",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_empresa,',
            '            nombre_vehiculo,',
            '            configuracion: _config_asientos_2x2()',
            '        });',
        ],
    ],

    // ============================================================
    // 3. Prueba 37: vehiculos/eliminar
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_37_eliminar_vehiculo_limpia_nodos.js',
        'descripcion' => 'P37: eliminar con nombre_dueno',
        'buscar' => [
            '        const r_del = await ctx.pedir_post("index.php", {',
            '            accion: "vehiculos/eliminar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_empresa,',
            '            nombre_vehiculo',
            '        });',
        ],
        'reemplazar' => [
            '        const r_del = await ctx.pedir_post("index.php", {',
            '            accion: "vehiculos/eliminar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_empresa,',
            '            nombre_vehiculo',
            '        });',
        ],
    ],

    // ============================================================
    // 4. Prueba 37: bump
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_37_eliminar_vehiculo_limpia_nodos.js',
        'descripcion' => 'P37: bump',
        'buscar' => [
            ' * @version 1.5plugin.5k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.6o',
        ],
    ],

    // ============================================================
    // 5. Prueba 38: vehiculos/agregar
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_38_eliminar_empresa_limpia_nodos.js',
        'descripcion' => 'P38: vehiculos/agregar con nombre_dueno',
        'buscar' => [
            '            const r_ve = await ctx.pedir_post("index.php", {',
            '                accion: "vehiculos/agregar",',
            '                nombre_solicitante: nombre_admin,',
            '                nombre_empresa,',
            '                nombre_vehiculo,',
            '                nombre_real: "Vehículo prueba grafo"',
            '            });',
        ],
        'reemplazar' => [
            '            const r_ve = await ctx.pedir_post("index.php", {',
            '                accion: "vehiculos/agregar",',
            '                nombre_solicitante: nombre_admin,',
            '                nombre_dueno,',
            '                nombre_empresa,',
            '                nombre_vehiculo,',
            '                nombre_real: "Vehículo prueba grafo"',
            '            });',
        ],
    ],

    // ============================================================
    // 6. Prueba 38: bump
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_38_eliminar_empresa_limpia_nodos.js',
        'descripcion' => 'P38: bump',
        'buscar' => [
            ' * @version 1.5plugin.5k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.6o',
        ],
    ],

    // ============================================================
    // 7. _compartidos_helpers.js: vehiculos/listar
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_compartidos_helpers.js',
        'descripcion' => 'helpers compartidos: vehiculos/listar con nombre_dueno',
        'buscar' => [
            '        const r_veh = await ctx.pedir_post("index.php", {',
            '            accion: "vehiculos/listar",',
            '            nombre_empresa: nombre_emp',
            '        });',
        ],
        'reemplazar' => [
            '        const r_veh = await ctx.pedir_post("index.php", {',
            '            accion: "vehiculos/listar",',
            '            nombre_dueno: nombre_dueno,',
            '            nombre_empresa: nombre_emp',
            '        });',
        ],
    ],

    // ============================================================
    // 8. _compartidos_helpers.js: bump
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_compartidos_helpers.js',
        'descripcion' => 'helpers compartidos: bump',
        'buscar' => [
            ' * @version 1.5plugin.6h',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.6o',
        ],
    ],
];

// ============================================================
// Runner
// ============================================================

echo "=== Aplicador — nombre_dueno en vehiculos/* ===\n\n";

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