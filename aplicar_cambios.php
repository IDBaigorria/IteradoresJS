<?php
/**
 * Aplicador — Fase 2c.3 (cierre): migracion de pruebas 57, 58,
 * 60, 61, 63, 64, 65 a ctx.post_accion.
 *
 * Ultima tanda de la Fase 2c. En todas, el logueado al momento
 * del POST es el usuario apropiado para `nombre_solicitante`
 * (terminal cuando opera el terminal, dueno cuando opera el
 * dueno, admin cuando opera el admin). No hace falta
 * sin_solicitante: true.
 *
 * Casos con cambio de sesion (57): los `ctx.nombre_usuario_actual()`
 * previos al cambio de login NO se tocan.
 *
 * Uso (raiz del proyecto plugin): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.7j';

$htmls_a_bumpear = [];

$cambios = [

    // ============================================================
    // PRUEBA 57
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_57_enlace_dueno_apunta_al_compartido.js',
        'descripcion' => 'P57: grafo/nodo con post_accion',
        'buscar' => [
            '        const r_nodo = await ctx.pedir_post("index.php", {',
            '            accion: "grafo/nodo",',
            '            nombre_solicitante: nombre_admin,',
            '            id: "us_" + nombre_term',
            '        });',
        ],
        'reemplazar' => [
            '        const r_nodo = await ctx.post_accion("grafo/nodo", {',
            '            id: "us_" + nombre_term',
            '        });',
        ],
    ],

    // ============================================================
    // PRUEBA 58
    // ============================================================

    // 58.1: usuarios/mi_perfil
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_58_venta_terminal_arbol_dual.js',
        'descripcion' => 'P58: usuarios/mi_perfil con post_accion',
        'buscar' => [
            '        const r_perfil = await ctx.pedir_post("index.php", {',
            '            accion: "usuarios/mi_perfil",',
            '            nombre_solicitante: nombre_term',
            '        });',
        ],
        'reemplazar' => [
            '        const r_perfil = await ctx.post_accion("usuarios/mi_perfil", {});',
        ],
    ],

    // 58.2: ventas/listar (dueno)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_58_venta_terminal_arbol_dual.js',
        'descripcion' => 'P58: ventas/listar dueno con post_accion',
        'buscar' => [
            '        const r_dueno = await ctx.pedir_post("index.php", {',
            '            accion: "ventas/listar",',
            '            tipo: "dueno",',
            '            nombre: nombre_dueno',
            '        });',
        ],
        'reemplazar' => [
            '        const r_dueno = await ctx.post_accion("ventas/listar", {',
            '            tipo: "dueno",',
            '            nombre: nombre_dueno',
            '        });',
        ],
    ],

    // 58.3: ventas/listar (terminal)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_58_venta_terminal_arbol_dual.js',
        'descripcion' => 'P58: ventas/listar terminal con post_accion',
        'buscar' => [
            '        const r_term = await ctx.pedir_post("index.php", {',
            '            accion: "ventas/listar",',
            '            tipo: "terminal",',
            '            nombre: nombre_term',
            '        });',
        ],
        'reemplazar' => [
            '        const r_term = await ctx.post_accion("ventas/listar", {',
            '            tipo: "terminal",',
            '            nombre: nombre_term',
            '        });',
        ],
    ],

    // ============================================================
    // PRUEBA 60
    // ============================================================

    // 60.1: helper _en_ambos (2 POSTs)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_60_cancelar_venta_arbol_dual.js',
        'descripcion' => 'P60: _en_ambos con post_accion',
        'buscar' => [
            '    const r_d = await ctx.pedir_post("index.php", {',
            '        accion: "ventas/listar", tipo: "dueno", nombre: nombre_dueno',
            '    });',
            '    const r_t = await ctx.pedir_post("index.php", {',
            '        accion: "ventas/listar", tipo: "terminal", nombre: nombre_term',
            '    });',
        ],
        'reemplazar' => [
            '    const r_d = await ctx.post_accion("ventas/listar", { tipo: "dueno", nombre: nombre_dueno });',
            '    const r_t = await ctx.post_accion("ventas/listar", { tipo: "terminal", nombre: nombre_term });',
        ],
    ],

    // 60.2: usuarios/mi_perfil
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_60_cancelar_venta_arbol_dual.js',
        'descripcion' => 'P60: usuarios/mi_perfil con post_accion',
        'buscar' => [
            '        const r_perfil = await ctx.pedir_post("index.php", {',
            '            accion: "usuarios/mi_perfil",',
            '            nombre_solicitante: nombre_term',
            '        });',
        ],
        'reemplazar' => [
            '        const r_perfil = await ctx.post_accion("usuarios/mi_perfil", {});',
        ],
    ],

    // ============================================================
    // PRUEBA 61
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_61_eliminar_viaje_con_terminal.js',
        'descripcion' => 'P61: viajes/eliminar con post_accion',
        'buscar' => [
            '            const r_elim = await ctx.pedir_post("index.php", {',
            '                accion: "viajes/eliminar",',
            '                nombre_dueno: nombre_dueno,',
            '                nombre_viaje: nombre_viaje',
            '            });',
        ],
        'reemplazar' => [
            '            const r_elim = await ctx.post_accion("viajes/eliminar", {',
            '                nombre_dueno: nombre_dueno,',
            '                nombre_viaje: nombre_viaje',
            '            });',
        ],
    ],

    // ============================================================
    // PRUEBA 63
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_63_desautorizar_terminal_compartido.js',
        'descripcion' => 'P63: viajes/listar_por_dueno con post_accion',
        'buscar' => [
            '            const r_dueno = await ctx.pedir_post("index.php", {',
            '                accion: "viajes/listar_por_dueno",',
            '                nombre_dueno: nombre_dueno',
            '            });',
        ],
        'reemplazar' => [
            '            const r_dueno = await ctx.post_accion("viajes/listar_por_dueno", {',
            '                nombre_dueno: nombre_dueno',
            '            });',
        ],
    ],

    // ============================================================
    // PRUEBA 64
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_64_agregar_micro_empresa_compartido.js',
        'descripcion' => 'P64: viajes/agregar_micro con post_accion',
        'buscar' => [
            '            const r_micro = await ctx.pedir_post("index.php", {',
            '                accion: "viajes/agregar_micro",',
            '                nombre_dueno: nombre_dueno,',
            '                nombre_viaje: nombre_viaje,',
            '                nombre_empresa: empresa.nombre_empresa,',
            '                nombre_vehiculo: empresa.nombre_vehiculo,',
            '                monto: "100"',
            '            });',
        ],
        'reemplazar' => [
            '            const r_micro = await ctx.post_accion("viajes/agregar_micro", {',
            '                nombre_dueno: nombre_dueno,',
            '                nombre_viaje: nombre_viaje,',
            '                nombre_empresa: empresa.nombre_empresa,',
            '                nombre_vehiculo: empresa.nombre_vehiculo,',
            '                monto: "100"',
            '            });',
        ],
    ],

    // ============================================================
    // PRUEBA 65
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_65_cambiar_asiento_desde_clientes.js',
        'descripcion' => 'P65: ventas/obtener con post_accion',
        'buscar' => [
            '            const r_nombre = await ctx.nombre_usuario_actual();',
            '            const nombre_term = r_nombre && r_nombre.nombre_usuario;',
            '',
            '            // Pausa inicial para dejar que el backend se estabilice.',
            '            await ctx.pausa(2000);',
            '',
            '            let asientos = [];',
            '            let ultimo_json = null;',
            '            const MAX_INTENTOS = 5;',
            '            for (let intento = 0; intento < MAX_INTENTOS; intento++) {',
            '                const r = await ctx.pedir_post("index.php", {',
            '                    accion: "ventas/obtener",',
            '                    id_venta,',
            '                    nombre_solicitante: nombre_term',
            '                });',
        ],
        'reemplazar' => [
            '            // Pausa inicial para dejar que el backend se estabilice.',
            '            await ctx.pausa(2000);',
            '',
            '            let asientos = [];',
            '            let ultimo_json = null;',
            '            const MAX_INTENTOS = 5;',
            '            for (let intento = 0; intento < MAX_INTENTOS; intento++) {',
            '                const r = await ctx.post_accion("ventas/obtener", { id_venta });',
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