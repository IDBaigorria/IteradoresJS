<?php
/**
 * Aplicador — try/finally en pruebas 34, 35, 36 (v2).
 *
 * Corrige el script anterior, que asumía que las 3 pruebas
 * terminaban con el mismo cleanup. P35 no tenía cleanup final
 * (decisión de diseño), y P36 tenía el cleanup en el cuerpo
 * en vez de en un finally.
 *
 * Uso (parado en iteradoresJS/): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.6w';
$htmls_a_bumpear = ['ventana.html'];

// ============================================================
// Bloques reutilizables
// ============================================================

// El finally común: reinicia selección + elimina viaje (si existe).
$finally_comun = [
    '        } finally {',
    '            // v79n: cleanup best-effort. Corre incluso si el flujo',
    '            // falló a mitad. Limpia la venta_actual colgada y el',
    '            // viaje de prueba. Los errores no se propagan para no',
    '            // tapar el error original del try.',
    '            try {',
    '                await ctx.pedir_post("index.php", {',
    '                    accion: "viajes/reiniciar_seleccion_completa",',
    '                    nombre_solicitante: nombre_admin,',
    '                    nombre_terminal',
    '                });',
    '            } catch (e) { /* best-effort */ }',
    '            if (nombre_viaje) {',
    '                try {',
    '                    await ctx.pedir_post("index.php", {',
    '                        accion: "viajes/eliminar",',
    '                        nombre_solicitante: nombre_admin,',
    '                        nombre_dueno,',
    '                        nombre_viaje',
    '                    });',
    '                } catch (e) { /* best-effort */ }',
    '            }',
    '        }',
    '    }',
    '};',
];

$cambios = [
    // ============================================================
    // Prueba 34
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: abrir try + declarar let nombre_viaje',
        'buscar' => [
            '        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);',
            '        const nombre_terminal = await _primera_terminal(ctx, nombre_admin, nombre_dueno);',
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
            '',
            '        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '',
            '        // 1. Crear viaje de prueba.',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_viaje = "viajeventgraf" + sufijo;',
        ],
        'reemplazar' => [
            '        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);',
            '        const nombre_terminal = await _primera_terminal(ctx, nombre_admin, nombre_dueno);',
            '',
            '        // v79n: declarar nombre_viaje afuera del try/finally para',
            '        // que el finally lo conozca aunque el flujo falle antes de',
            '        // crearlo.',
            '        let nombre_viaje = null;',
            '',
            '        try {',
            '        // Limpiar cualquier venta_actual colgada de la terminal.',
            '        // Si una corrida anterior falló a mitad de selección, la',
            '        // venta_actual quedó colgada con asientos temporales, y',
            '        // la próxima corrida acumula sobre eso. Idempotente.',
            '        await ctx.pedir_post("index.php", {',
            '            accion: "viajes/reiniciar_seleccion_completa",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_terminal',
            '        });',
            '',
            '        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '',
            '        // 1. Crear viaje de prueba.',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        nombre_viaje = "viajeventgraf" + sufijo;',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
        'descripcion' => 'P34: cerrar try/finally',
        'buscar' => [
            '        // 6. Limpieza: eliminar el viaje.',
            '        await ctx.pedir_post("index.php", {',
            '            accion: "viajes/eliminar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje',
            '        });',
            '    }',
            '};',
        ],
        'reemplazar' => $finally_comun,
    ],

    // ============================================================
    // Prueba 35
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: header obsoleto',
        'buscar' => [
            ' * Nota: la prueba deja la venta_actual colgada de la',
            ' * terminal (con los campos viaje y micro apuntando al viaje',
            ' * de prueba). Es alcanzable desde la terminal, no es un',
            ' * huérfano. No se limpia el viaje al final para no dejar',
            ' * la venta_actual con referencias colgando.',
        ],
        'reemplazar' => [
            ' * Nota: la prueba limpia la venta_actual y elimina el',
            ' * viaje de prueba en un bloque finally, así una corrida',
            ' * fallida no deja basura acumulada. El orden es: limpiar',
            ' * la venta_actual con `viajes/reiniciar_seleccion_completa`,',
            ' * después eliminar el viaje.',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: abrir try + declarar let nombre_viaje',
        'buscar' => [
            '        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);',
            '        const nombre_terminal = await _primera_terminal(ctx, nombre_admin, nombre_dueno);',
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
            '',
            '        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '',
            '        // 1. Crear viaje de prueba.',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_viaje = "viajedeselegraf" + sufijo;',
        ],
        'reemplazar' => [
            '        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);',
            '        const nombre_terminal = await _primera_terminal(ctx, nombre_admin, nombre_dueno);',
            '',
            '        // v79n: declarar nombre_viaje afuera del try/finally para',
            '        // que el finally lo conozca aunque el flujo falle antes de',
            '        // crearlo.',
            '        let nombre_viaje = null;',
            '',
            '        try {',
            '        // Limpiar cualquier venta_actual colgada de la terminal.',
            '        // Si una corrida anterior falló a mitad de selección, la',
            '        // venta_actual quedó colgada con asientos temporales, y',
            '        // la próxima corrida acumula sobre eso. Idempotente.',
            '        await ctx.pedir_post("index.php", {',
            '            accion: "viajes/reiniciar_seleccion_completa",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_terminal',
            '        });',
            '',
            '        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '',
            '        // 1. Crear viaje de prueba.',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        nombre_viaje = "viajedeselegraf" + sufijo;',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
        'descripcion' => 'P35: cerrar try/finally',
        'buscar' => [
            '        const H1 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '        const dif = H1 - H0;',
            '        ctx.assert(H1 === H0,',
            '            "deseleccionar_asiento_micro dejó nodos huérfanos. "',
            '            + "H0=" + H0 + ", H1=" + H1 + ", diferencia=" + dif + "."',
            '            + (dif > 0 ? " Quedaron " + dif + " nodos huérfanos." : " Algo inesperado."));',
            '    }',
            '};',
        ],
        'reemplazar' => [
            '        const H1 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '        const dif = H1 - H0;',
            '        ctx.assert(H1 === H0,',
            '            "deseleccionar_asiento_micro dejó nodos huérfanos. "',
            '            + "H0=" + H0 + ", H1=" + H1 + ", diferencia=" + dif + "."',
            '            + (dif > 0 ? " Quedaron " + dif + " nodos huérfanos." : " Algo inesperado."));',
        ] + $finally_comun,
    ],

    // ============================================================
    // Prueba 36
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: header obsoleto',
        'buscar' => [
            ' * Nota: la prueba deja la venta_actual colgada de la terminal',
            ' * con el último asiento seleccionado. Es alcanzable, no es',
            ' * huérfano. No se limpia el viaje al final para no dejar',
            ' * referencias colgando.',
        ],
        'reemplazar' => [
            ' * Nota: la prueba limpia la venta_actual y elimina el viaje',
            ' * de prueba (y la empresa/vehículo de setup, si se crearon)',
            ' * en un bloque finally.',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: abrir try + mover let/sufijo arriba',
        'buscar' => [
            '        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);',
            '        const nombre_terminal = await _primera_terminal(ctx, nombre_admin, nombre_dueno);',
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
            '',
            '        // Sufijo único para esta corrida. Se usa para los',
            '        // nombres de viaje, empresa y vehículo de setup.',
            '        const sufijo = String(Date.now()).slice(-8);',
            '',
            '        // Requisito: al menos 2 vehículos con asientos.',
            '        const empresas = await _empresas_del_dueno(ctx, nombre_admin, nombre_dueno);',
            '        if (empresas.length === 0) {',
            '            throw new Error("El dueño " + nombre_dueno + " no tiene empresas.");',
            '        }',
            '        const candidatos = [];  // {empresa, patente}',
            '        for (const empresa of empresas) {',
            '            const vehiculos = await _vehiculos_de_empresa(ctx, nombre_admin, nombre_dueno, empresa);',
            '            for (const patente of vehiculos) {',
            '                candidatos.push({ empresa, patente });',
            '            }',
            '        }',
            '',
            '        // Garantizar al menos 2 vehículos configurados.',
            '        // Si el dueño tiene menos, creamos uno de prueba con',
            '        // 4 asientos 2x2 y lo eliminamos al final.',
            '        const _prefijo_veh_auto = "viajecambiomicro_veh_" + sufijo;',
            '        const _nombre_empresa_auto = "viajecambiomicro_emp_" + sufijo;',
            '        let _creado_empresa_auto = false;',
            '        let _creado_vehiculo_auto = false;',
            '        if (candidatos.length < 2) {',
        ],
        'reemplazar' => [
            '        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);',
            '        const nombre_terminal = await _primera_terminal(ctx, nombre_admin, nombre_dueno);',
            '',
            '        // v79n: declarar afuera del try/finally para que el finally',
            '        // los conozca aunque el flujo falle antes de crearlos.',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        let nombre_viaje = null;',
            '        const _prefijo_veh_auto = "viajecambiomicro_veh_" + sufijo;',
            '        const _nombre_empresa_auto = "viajecambiomicro_emp_" + sufijo;',
            '        let _creado_empresa_auto = false;',
            '        let _creado_vehiculo_auto = false;',
            '',
            '        try {',
            '        // Limpiar cualquier venta_actual colgada de la terminal.',
            '        // Si una corrida anterior falló a mitad de selección, la',
            '        // venta_actual quedó colgada con asientos temporales, y',
            '        // la próxima corrida acumula sobre eso. Idempotente.',
            '        await ctx.pedir_post("index.php", {',
            '            accion: "viajes/reiniciar_seleccion_completa",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_terminal',
            '        });',
            '',
            '        // Requisito: al menos 2 vehículos con asientos.',
            '        const empresas = await _empresas_del_dueno(ctx, nombre_admin, nombre_dueno);',
            '        if (empresas.length === 0) {',
            '            throw new Error("El dueño " + nombre_dueno + " no tiene empresas.");',
            '        }',
            '        const candidatos = [];  // {empresa, patente}',
            '        for (const empresa of empresas) {',
            '            const vehiculos = await _vehiculos_de_empresa(ctx, nombre_admin, nombre_dueno, empresa);',
            '            for (const patente of vehiculos) {',
            '                candidatos.push({ empresa, patente });',
            '            }',
            '        }',
            '',
            '        // Garantizar al menos 2 vehículos configurados.',
            '        // Si el dueño tiene menos, creamos uno de prueba con',
            '        // 4 asientos 2x2.',
            '        if (candidatos.length < 2) {',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: cambiar const a assignment en nombre_viaje',
        'buscar' => [
            '        // Crear viaje de prueba.',
            '        const nombre_viaje = "viajecambiomicro" + sufijo;',
        ],
        'reemplazar' => [
            '        // Crear viaje de prueba.',
            '        nombre_viaje = "viajecambiomicro" + sufijo;',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
        'descripcion' => 'P36: cerrar try/finally (mover cleanup interno al finally)',
        'buscar' => [
            '        // Cleanup del setup. Si creamos empresa+vehículo, los',
            '        // eliminamos. Pero si el micro que agregamos al viaje',
            '        // usa ese vehículo, primero hay que quitar los micros',
            '        // del viaje. Y el viaje entero.',
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
            '                    nombre_vehiculo: _prefijo_veh_auto',
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
            '        ctx.assert(H1 === H0,',
            '            "Cambiar de micro a mitad de selección dejó nodos huérfanos. "',
            '            + "H0=" + H0 + ", H1=" + H1 + ", diferencia=" + dif + "."',
            '            + (dif > 0 ? " Quedaron " + dif + " nodos huérfanos de los asientos-en-venta viejos." : " Algo inesperado."));',
            '    }',
            '};',
        ],
        'reemplazar' => [
            '        ctx.assert(H1 === H0,',
            '            "Cambiar de micro a mitad de selección dejó nodos huérfanos. "',
            '            + "H0=" + H0 + ", H1=" + H1 + ", diferencia=" + dif + "."',
            '            + (dif > 0 ? " Quedaron " + dif + " nodos huérfanos de los asientos-en-venta viejos." : " Algo inesperado."));',
            '        } finally {',
            '            // v79n: cleanup best-effort. Corre incluso si el flujo',
            '            // falló a mitad. Orden: reiniciar selección, eliminar',
            '            // viaje, eliminar vehículo de setup, eliminar empresa',
            '            // de setup.',
            '            try {',
            '                await ctx.pedir_post("index.php", {',
            '                    accion: "viajes/reiniciar_seleccion_completa",',
            '                    nombre_solicitante: nombre_admin,',
            '                    nombre_terminal',
            '                });',
            '            } catch (e) { /* best-effort */ }',
            '            if (nombre_viaje) {',
            '                try {',
            '                    await ctx.pedir_post("index.php", {',
            '                        accion: "viajes/eliminar",',
            '                        nombre_solicitante: nombre_admin,',
            '                        nombre_dueno,',
            '                        nombre_viaje',
            '                    });',
            '                } catch (e) { /* best-effort */ }',
            '            }',
            '            if (_creado_vehiculo_auto) {',
            '                try {',
            '                    await ctx.pedir_post("index.php", {',
            '                        accion: "vehiculos/eliminar",',
            '                        nombre_solicitante: nombre_admin,',
            '                        nombre_dueno,',
            '                        nombre_empresa: _nombre_empresa_auto,',
            '                        nombre_vehiculo: _prefijo_veh_auto',
            '                    });',
            '                } catch (e) { /* best-effort */ }',
            '            }',
            '            if (_creado_empresa_auto) {',
            '                try {',
            '                    await ctx.pedir_post("index.php", {',
            '                        accion: "empresas/eliminar",',
            '                        nombre_solicitante: nombre_admin,',
            '                        nombre_dueno,',
            '                        nombre_empresa: _nombre_empresa_auto',
            '                    });',
            '                } catch (e) { /* best-effort */ }',
            '            }',
            '        }',
            '    }',
            '};',
        ],
    ],
];

// ============================================================
// Runner v2 (copiado textual de prompt_runner_aplicar_cambios.md)
// ============================================================

echo "=== Aplicador — try/finally en pruebas 34, 35, 36 (v2) ===\n\n";

function detectar_eol(string $c): string { return (strpos($c, "\r\n") !== false) ? "\r\n" : "\n"; }
function normalizar_a_unix(string $c): string { return str_replace("\r\n", "\n", $c); }
function normalizar_a_original(string $c, string $e): string { return $e === "\n" ? $c : str_replace("\n", "\r\n", $c); }
function contar_ocurrencias(string $c, string $b): int {
    if ($b === '') return 0;
    $n = 0; $o = 0;
    while (($p = strpos($c, $b, $o)) !== false) { $n++; $o = $p + strlen($b); }
    return $n;
}

if (!isset($htmls_a_bumpear) || !is_array($htmls_a_bumpear) || empty($htmls_a_bumpear)) {
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

$total_reemplazos = 0;
foreach ($reemplazos_por_archivo as $l) $total_reemplazos += count($l);
echo "[INFO] " . count($reemplazos_por_archivo) . " archivo(s) a reemplazar, "
    . count($creaciones) . " a crear, " . count($eliminaciones) . " a eliminar.\n\n";

$archivos_a_escribir = [];
$bloques_ok = 0;
$bloques_fallidos = [];

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

// Bumps
$archivos_bump_php_js = [];
$archivos_bump_js_css = [];
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    $rel = substr($ruta_abs, strlen($raiz_proyecto) + 1);
    $ext = strtolower(pathinfo($ruta_abs, PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump_php_js[] = $rel;
    if ($ext === 'js' || $ext === 'css') $archivos_bump_js_css[] = $rel;
}
foreach ($creaciones as $cr) {
    $ext = strtolower(pathinfo($cr['archivo'], PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump_php_js[] = $cr['archivo'];
    if ($ext === 'js' || $ext === 'css') $archivos_bump_js_css[] = $cr['archivo'];
}

$bumps_atversion = 0;
$bumps_qv = 0;
$bumps_detalle = [];
$info_bumps = [];

if ($bumpear) {
    foreach (array_unique($archivos_bump_php_js) as $archivo_rel) {
        $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
        if (!file_exists($ruta_abs)) continue;
        $contenido_original = file_get_contents($ruta_abs);
        $eol = detectar_eol($contenido_original);
        $contenido = normalizar_a_unix($contenido_original);
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
        $bumps_detalle[] = "$archivo_rel  @version $viejo → $version_nueva";
    }

    foreach ($htmls_a_bumpear as $html_rel) {
        $html_abs = $raiz_proyecto . '/' . $html_rel;
        if (!file_exists($html_abs)) { $info_bumps[] = "$html_rel (no encontrado)"; continue; }
        $html_orig = file_get_contents($html_abs);
        $eol = detectar_eol($html_orig);
        $html = normalizar_a_unix($html_orig);
        $html_antes = $html;
        foreach (array_unique($archivos_bump_js_css) as $archivo_rel) {
            $base = basename($archivo_rel);
            $base_esc = preg_quote($base, '/');
            $patron = '/(' . $base_esc . '\?v=)([^"\'\s>]+)/';
            $viejo_qv = '';
            $html = preg_replace_callback($patron, function($m) use ($version_nueva, &$viejo_qv) {
                $viejo_qv = $m[2];
                return $m[1] . $version_nueva;
            }, $html, 1, $c_qv);
            if ($c_qv > 0 && $viejo_qv !== $version_nueva) {
                $bumps_qv++;
                $bumps_detalle[] = "$html_rel  $base ?v= $viejo_qv → $version_nueva";
            }
        }
        if ($html !== $html_antes) {
            $archivos_a_escribir[$html_abs] = [normalizar_a_unix($html), $eol];
        }
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

foreach ($creaciones as $creacion) {
    $ruta_abs = $raiz_proyecto . '/' . $creacion['archivo'];
    $dir_destino = dirname($ruta_abs);
    if (!is_dir($dir_destino)) mkdir($dir_destino, 0777, true);
    $contenido_nuevo = implode("\n", $creacion['contenido']);
    $ya_existia = file_exists($ruta_abs);
    if (file_put_contents($ruta_abs, $contenido_nuevo) === false) {
        echo "[FALLO] No se pudo crear: {$creacion['archivo']}\n"; continue;
    }
    $accion = $ya_existia ? 'sobrescrito' : 'creado';
    echo "[OK] {$creacion['archivo']} ($accion)\n";
}

foreach ($eliminaciones as $elim) {
    $ruta_abs = $raiz_proyecto . '/' . $elim['archivo'];
    if (!file_exists($ruta_abs)) { echo "[INFO] " . $elim['archivo'] . " no existía.\n"; continue; }
    if (unlink($ruta_abs)) echo "[OK] " . $elim['archivo'] . " (eliminado)\n";
    else echo "[FALLO] No se pudo eliminar: " . $elim['archivo'] . "\n";
}

if ($bumpear && (!empty($bumps_detalle) || !empty($info_bumps))) {
    echo "\n--- Bumps ---\n";
    foreach ($bumps_detalle as $d) echo "[BUMP] $d\n";
    foreach ($info_bumps as $i) echo "[INFO] $i\n";
}

echo "\n=== Resumen ===\n";
echo "Bloques aplicados: $bloques_ok\n";
echo "Archivos escritos: $archivos_escritos\n";
if ($bumpear) {
    echo "Bumps @version:    $bumps_atversion\n";
    echo "Bumps ?v=:         $bumps_qv\n";
}
if (!empty($bloques_fallidos)) {
    echo "Fallos: " . count($bloques_fallidos) . "\n";
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";