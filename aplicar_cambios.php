<?php
/**
 * Aplicador — Fixes pruebas 34, 35, 36.
 *
 * Pruebas 34 y 35: crean el viaje con el admin y seleccionan
 * asientos con `nombre_terminal`. Post repuntado B2.3.5,
 * `seleccionar_asiento_micro` navega por el compartido del
 * terminal, y el viaje recién creado no está ahí. Fix:
 * autorizar la terminal antes de la selección.
 *
 * Prueba 36: necesita 2 vehículos configurados. El dueño
 * tiene 1. Fix: crear empresa + vehículo extra si faltan,
 * y limpiar al final.
 *
 * Uso (parado en iteradoresJS/): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$autorizar_terminal = [
    '',
    '        // Autorizar la terminal en el viaje para que aparezca',
    '        // en su compartido. Post repuntado B2.3.5,',
    '        // seleccionar_asiento_micro navega por el compartido',
    '        // y no encuentra el viaje recién creado sin esto.',
    '        const rT = await ctx.pedir_post("index.php", {',
    '            accion: "viajes/agregar_terminal",',
    '            nombre_solicitante: nombre_admin,',
    '            nombre_dueno,',
    '            nombre_viaje,',
    '            nombre_terminal',
    '        });',
    '        if (!rT || !rT.exito || !rT.json || !rT.json.exito) {',
    '            throw new Error("No se pudo autorizar la terminal en el viaje: "',
    '                + ((rT && rT.json && rT.json.error) ? rT.json.error : "(sin detalle)"));',
    '        }',
];

$cambios = [
    // ============================================================
    // Prueba 34
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: autorizar terminal',
        'buscar' => [
            '        if (!nombre_micro) {',
            '            throw new Error("Ningún vehículo pudo agregarse como micro. Último error: " + ultimo_error);',
            '        }',
            '',
            '        // 3. Seleccionar un asiento.',
        ],
        'reemplazar' => array_merge(
            [
                '        if (!nombre_micro) {',
                '            throw new Error("Ningún vehículo pudo agregarse como micro. Último error: " + ultimo_error);',
                '        }',
            ],
            $autorizar_terminal,
            [
                '',
                '        // 3. Seleccionar un asiento.',
            ]
        ),
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: bump',
        'buscar' => [' * @version 1.5plugin.6q'],
        'reemplazar' => [' * @version 1.5plugin.6r'],
    ],

    // ============================================================
    // Prueba 35
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: autorizar terminal',
        'buscar' => [
            '        if (!nombre_micro) {',
            '            throw new Error("Ningún vehículo pudo agregarse como micro. Último error: " + ultimo_error);',
            '        }',
            '',
            '        // 3. Seleccionar un asiento.',
        ],
        'reemplazar' => array_merge(
            [
                '        if (!nombre_micro) {',
                '            throw new Error("Ningún vehículo pudo agregarse como micro. Último error: " + ultimo_error);',
                '        }',
            ],
            $autorizar_terminal,
            [
                '',
                '        // 3. Seleccionar un asiento.',
            ]
        ),
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: bump',
        'buscar' => [' * @version 1.5plugin.6q'],
        'reemplazar' => [' * @version 1.5plugin.6r'],
    ],

    // ============================================================
    // Prueba 36: crear vehículo extra si faltan
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: crear vehículo extra si faltan',
        'buscar' => [
            '        if (candidatos.length < 2) {',
            '            throw new Error("Se necesitan al menos 2 vehículos configurados en las empresas del dueño " + nombre_dueno + ". Encontrados: " + candidatos.length + ". Cargá más vehículos o ajustá la prueba.");',
            '        }',
        ],
        'reemplazar' => [
            '        // Garantizar al menos 2 vehículos configurados.',
            '        // Si el dueño tiene menos, creamos empresa + vehículo',
            '        // de prueba con 4 asientos 2x2, y los limpiamos al',
            '        // final.',
            '        const _nombre_empresa_auto = "viajecambiomicro_emp_" + String(Date.now()).slice(-8);',
            '        const _nombre_vehiculo_auto = "viajecambiomicro_veh_" + String(Date.now()).slice(-8);',
            '        let _creado_empresa_auto = false;',
            '        let _creado_vehiculo_auto = false;',
            '        if (candidatos.length < 2) {',
            '            const r_emp = await ctx.pedir_post("index.php", {',
            '                accion: "empresas/agregar",',
            '                nombre_solicitante: nombre_admin,',
            '                nombre_dueno,',
            '                nombre_empresa: _nombre_empresa_auto,',
            '                nombre_real: "Empresa setup cambiar micro"',
            '            });',
            '            if (!r_emp || !r_emp.exito || !r_emp.json || !r_emp.json.exito) {',
            '                throw new Error("No se pudo crear la empresa de setup: "',
            '                    + ((r_emp && r_emp.json && r_emp.json.error) ? r_emp.json.error : "(sin detalle)"));',
            '            }',
            '            _creado_empresa_auto = true;',
            '',
            '            const r_veh = await ctx.pedir_post("index.php", {',
            '                accion: "vehiculos/agregar",',
            '                nombre_solicitante: nombre_admin,',
            '                nombre_dueno,',
            '                nombre_empresa: _nombre_empresa_auto,',
            '                nombre_vehiculo: _nombre_vehiculo_auto,',
            '                nombre_real: "Vehículo setup cambiar micro"',
            '            });',
            '            if (!r_veh || !r_veh.exito || !r_veh.json || !r_veh.json.exito) {',
            '                throw new Error("No se pudo crear el vehículo de setup: "',
            '                    + ((r_veh && r_veh.json && r_veh.json.error) ? r_veh.json.error : "(sin detalle)"));',
            '            }',
            '            _creado_vehiculo_auto = true;',
            '',
            '            const _config_2x2 = JSON.stringify({',
            '                pisos: [{',
            '                    filas: 2,',
            '                    columnas: 2,',
            '                    asientos: [',
            '                        { fila: "1", columna: "1", numero: "1" },',
            '                        { fila: "1", columna: "2", numero: "2" },',
            '                        { fila: "2", columna: "1", numero: "3" },',
            '                        { fila: "2", columna: "2", numero: "4" }',
            '                    ]',
            '                }]',
            '            });',
            '            const r_cf = await ctx.pedir_post("index.php", {',
            '                accion: "vehiculos/actualizar_configuracion",',
            '                nombre_solicitante: nombre_admin,',
            '                nombre_dueno,',
            '                nombre_empresa: _nombre_empresa_auto,',
            '                nombre_vehiculo: _nombre_vehiculo_auto,',
            '                configuracion: _config_2x2',
            '            });',
            '            if (!r_cf || !r_cf.exito || !r_cf.json || !r_cf.json.exito) {',
            '                throw new Error("No se pudo configurar el vehículo de setup: "',
            '                    + ((r_cf && r_cf.json && r_cf.json.error) ? r_cf.json.error : "(sin detalle)"));',
            '            }',
            '',
            '            candidatos.push({ empresa: _nombre_empresa_auto, patente: _nombre_vehiculo_auto });',
            '        }',
            '        if (candidatos.length < 2) {',
            '            throw new Error("Se necesitan al menos 2 vehículos configurados en las empresas del dueño " + nombre_dueno + ". Encontrados: " + candidatos.length + ". Cargá más vehículos o ajustá la prueba.");',
            '        }',
        ],
    ],
    // Cleanup al final de la prueba 36.
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: cleanup de setup',
        'buscar' => [
            '        const H1 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '        const dif = H1 - H0;',
            '        ctx.assert(H1 === H0,',
        ],
        'reemplazar' => [
            '        // Cleanup del setup. Primero eliminamos el viaje',
            '        // (con sus micros). Después el vehículo y la',
            '        // empresa, si los creamos. Todo best-effort.',
            '        try {',
            '            await ctx.pedir_post("index.php", {',
            '                accion: "viajes/eliminar",',
            '                nombre_solicitante: nombre_admin,',
            '                nombre_dueno,',
            '                nombre_viaje',
            '            });',
            '        } catch (e) { /* best-effort */ }',
            '        if (_creado_vehiculo_auto) {',
            '            try {',
            '                await ctx.pedir_post("index.php", {',
            '                    accion: "vehiculos/eliminar",',
            '                    nombre_solicitante: nombre_admin,',
            '                    nombre_dueno,',
            '                    nombre_empresa: _nombre_empresa_auto,',
            '                    nombre_vehiculo: _nombre_vehiculo_auto',
            '                });',
            '            } catch (e) { /* best-effort */ }',
            '        }',
            '        if (_creado_empresa_auto) {',
            '            try {',
            '                await ctx.pedir_post("index.php", {',
            '                    accion: "empresas/eliminar",',
            '                    nombre_solicitante: nombre_admin,',
            '                    nombre_dueno,',
            '                    nombre_empresa: _nombre_empresa_auto',
            '                });',
            '            } catch (e) { /* best-effort */ }',
            '        }',
            '',
            '        const H1 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '        const dif = H1 - H0;',
            '        ctx.assert(H1 === H0,',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: bump',
        'buscar' => [' * @version 1.5plugin.6q'],
        'reemplazar' => [' * @version 1.5plugin.6r'],
    ],
];

// ============================================================
// Runner
// ============================================================

echo "=== Aplicador — Fixes 34, 35, 36 ===\n\n";

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