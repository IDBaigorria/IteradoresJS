<?php
/**
 * Aplicador — nombre_dueno en el resto de los POSTs de vehiculos/*.
 *
 * Continúa el fix del script anterior. Los POSTs de
 * vehiculos/listar, vehiculos/actualizar_configuracion y
 * vehiculos/subir_foto en varias pruebas todavía no mandaban
 * `nombre_dueno`. El piloto lo exige desde v77v.
 *
 * Uso (parado en iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [
    // ============================================================
    // Prueba 31
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_31_eliminar_micro_limpia_nodos.js',
        'descripcion' => 'P31: vehiculos/listar con nombre_dueno',
        'buscar' => [
            '        accion: "vehiculos/listar",',
            '        nombre_solicitante,',
            '        nombre_empresa',
            '    });',
        ],
        'reemplazar' => [
            '        accion: "vehiculos/listar",',
            '        nombre_solicitante,',
            '        nombre_dueno,',
            '        nombre_empresa',
            '    });',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_31_eliminar_micro_limpia_nodos.js',
        'descripcion' => 'P31: bump',
        'buscar' => [
            ' * @version 1.5plugin.5g',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.6p',
        ],
    ],

    // ============================================================
    // Prueba 34
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: vehiculos/listar con nombre_dueno',
        'buscar' => [
            '        accion: "vehiculos/listar",',
            '        nombre_solicitante,',
            '        nombre_empresa',
            '    });',
        ],
        'reemplazar' => [
            '        accion: "vehiculos/listar",',
            '        nombre_solicitante,',
            '        nombre_dueno,',
            '        nombre_empresa',
            '    });',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: bump',
        'buscar' => [
            ' * @version 1.5plugin.5i',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.6p',
        ],
    ],

    // ============================================================
    // Prueba 35
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: vehiculos/listar con nombre_dueno',
        'buscar' => [
            '        accion: "vehiculos/listar",',
            '        nombre_solicitante,',
            '        nombre_empresa',
            '    });',
        ],
        'reemplazar' => [
            '        accion: "vehiculos/listar",',
            '        nombre_solicitante,',
            '        nombre_dueno,',
            '        nombre_empresa',
            '    });',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: bump',
        'buscar' => [
            ' * @version 1.5plugin.5j',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.6p',
        ],
    ],

    // ============================================================
    // Prueba 36
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: vehiculos/listar con nombre_dueno',
        'buscar' => [
            '        accion: "vehiculos/listar",',
            '        nombre_solicitante,',
            '        nombre_empresa',
            '    });',
        ],
        'reemplazar' => [
            '        accion: "vehiculos/listar",',
            '        nombre_solicitante,',
            '        nombre_dueno,',
            '        nombre_empresa',
            '    });',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: bump',
        'buscar' => [
            ' * @version 1.5plugin.5j',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.6p',
        ],
    ],

    // ============================================================
    // Prueba 38: actualizar_configuracion
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_38_eliminar_empresa_limpia_nodos.js',
        'descripcion' => 'P38: actualizar_configuracion con nombre_dueno',
        'buscar' => [
            '                accion: "vehiculos/actualizar_configuracion",',
            '                nombre_solicitante: nombre_admin,',
            '                nombre_empresa,',
            '                nombre_vehiculo,',
            '                configuracion: _config_asientos_2x2()',
        ],
        'reemplazar' => [
            '                accion: "vehiculos/actualizar_configuracion",',
            '                nombre_solicitante: nombre_admin,',
            '                nombre_dueno,',
            '                nombre_empresa,',
            '                nombre_vehiculo,',
            '                configuracion: _config_asientos_2x2()',
        ],
    ],

    // ============================================================
    // Prueba 43
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
        'descripcion' => 'P43: vehiculos/listar con nombre_dueno',
        'buscar' => [
            '        accion: "vehiculos/listar",',
            '        nombre_solicitante,',
            '        nombre_empresa',
            '    });',
        ],
        'reemplazar' => [
            '        accion: "vehiculos/listar",',
            '        nombre_solicitante,',
            '        nombre_dueno,',
            '        nombre_empresa',
            '    });',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
        'descripcion' => 'P43: bump',
        'buscar' => [
            ' * @version 1.5plugin.5p',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.6p',
        ],
    ],

    // ============================================================
    // Prueba 55: subir_foto x2 (agregar nombre_dueno a campos)
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_55_subir_foto_reemplazo_limpia_nodos.js',
        'descripcion' => 'P55: subir_foto A con nombre_dueno',
        'buscar' => [
            '                "vehiculos/subir_foto",',
            '                { nombre_empresa, nombre_vehiculo },',
            '                { nombre: "fotoA_" + sufijo + ".png", tipo: "image/png", contenido_base64: PNG_TRANSPARENTE_B64 }',
        ],
        'reemplazar' => [
            '                "vehiculos/subir_foto",',
            '                { nombre_empresa, nombre_vehiculo, nombre_dueno },',
            '                { nombre: "fotoA_" + sufijo + ".png", tipo: "image/png", contenido_base64: PNG_TRANSPARENTE_B64 }',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_55_subir_foto_reemplazo_limpia_nodos.js',
        'descripcion' => 'P55: subir_foto B con nombre_dueno',
        'buscar' => [
            '                "vehiculos/subir_foto",',
            '                { nombre_empresa, nombre_vehiculo },',
            '                { nombre: "fotoB_" + sufijo + ".png", tipo: "image/png", contenido_base64: PNG_ALTERNATIVO_B64 }',
        ],
        'reemplazar' => [
            '                "vehiculos/subir_foto",',
            '                { nombre_empresa, nombre_vehiculo, nombre_dueno },',
            '                { nombre: "fotoB_" + sufijo + ".png", tipo: "image/png", contenido_base64: PNG_ALTERNATIVO_B64 }',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_55_subir_foto_reemplazo_limpia_nodos.js',
        'descripcion' => 'P55: vehiculos/listar con nombre_solicitante y nombre_dueno',
        'buscar' => [
            '                accion: "vehiculos/listar",',
            '                nombre_empresa',
            '            });',
        ],
        'reemplazar' => [
            '                accion: "vehiculos/listar",',
            '                nombre_solicitante: nombre_admin,',
            '                nombre_dueno,',
            '                nombre_empresa',
            '            });',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_55_subir_foto_reemplazo_limpia_nodos.js',
        'descripcion' => 'P55: bump',
        'buscar' => [
            ' * @version 1.5plugin.5u',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.6p',
        ],
    ],
];

// ============================================================
// Runner
// ============================================================

echo "=== Aplicador — nombre_dueno en el resto de vehiculos/* ===\n\n";

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