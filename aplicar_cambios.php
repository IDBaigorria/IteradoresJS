<?php
/**
 * Aplicador — Fase 2c.2b: migracion de pruebas 53, 54, 55 a
 * ctx.post_accion.
 *
 * Misma tecnica que 2c.2a. Casos especiales:
 *   - prueba_54: los POST a autenticar/verificar van con
 *     sin_solicitante: true (no hay sesion). Los de grafo y
 *     administrador van con solicitante admin.
 *   - prueba_55: usa ctx.subir_archivo (que NO pasa por
 *     post_accion, no se toca). Los 3 pedir_post con
 *     solicitante admin si se migran.
 *
 * Uso (raiz del proyecto plugin): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.7g';

$htmls_a_bumpear = [];

$cambios = [

    // ============================================================
    // PRUEBA 53
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_53_dj_pasajero_eliminar.js',
        'descripcion' => 'P53: pasajeros/eliminar_declaracion con post_accion',
        'buscar' => [
            '        const rElim = await ctx.pedir_post("index.php", {',
            '            accion: "pasajeros/eliminar_declaracion",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            dni',
            '        });',
        ],
        'reemplazar' => [
            '        const rElim = await ctx.post_accion("pasajeros/eliminar_declaracion", {',
            '            nombre_dueno,',
            '            dni',
            '        });',
        ],
    ],

    // ============================================================
    // PRUEBA 54
    // ============================================================

    // 54.1: _contar_huerfanos_credenciales
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_54_bloqueo_expirado_permite_login.js',
        'descripcion' => 'P54: _contar_huerfanos_credenciales con post_accion',
        'buscar' => [
            'async function _contar_huerfanos_credenciales(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen_credenciales",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _contar_huerfanos_credenciales(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("grafo/resumen_credenciales", {});',
        ],
    ],

    // 54.2: administrador/agregar_usuario
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_54_bloqueo_expirado_permite_login.js',
        'descripcion' => 'P54: administrador/agregar_usuario con post_accion',
        'buscar' => [
            '            const r_crear = await ctx.pedir_post("index.php", {',
            '                accion: "administrador/agregar_usuario",',
            '                nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '            const r_crear = await ctx.post_accion("administrador/agregar_usuario", {',
        ],
    ],

    // 54.3: primer autenticar/verificar (intentos fallidos)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_54_bloqueo_expirado_permite_login.js',
        'descripcion' => 'P54: intentos fallidos con post_accion sin_solicitante',
        'buscar' => [
            '                const r = await ctx.pedir_post("index.php", {',
            '                    accion: "autenticar/verificar",',
            '                    usuario: nombre_prueba,',
            '                    contrasena: "mala_" + i + "_" + sufijo',
            '                });',
        ],
        'reemplazar' => [
            '                const r = await ctx.post_accion("autenticar/verificar", {',
            '                    usuario: nombre_prueba,',
            '                    contrasena: "mala_" + i + "_" + sufijo',
            '                }, { sin_solicitante: true });',
        ],
    ],

    // 54.4: autenticar/verificar (bloqueado)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_54_bloqueo_expirado_permite_login.js',
        'descripcion' => 'P54: intento bloqueado con post_accion sin_solicitante',
        'buscar' => [
            '            const r_bloqueado = await ctx.pedir_post("index.php", {',
            '                accion: "autenticar/verificar",',
            '                usuario: nombre_prueba,',
            '                contrasena: contrasena_correcta',
            '            });',
        ],
        'reemplazar' => [
            '            const r_bloqueado = await ctx.post_accion("autenticar/verificar", {',
            '                usuario: nombre_prueba,',
            '                contrasena: contrasena_correcta',
            '            }, { sin_solicitante: true });',
        ],
    ],

    // 54.5: autenticar/verificar (login exitoso)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_54_bloqueo_expirado_permite_login.js',
        'descripcion' => 'P54: login exitoso con post_accion sin_solicitante',
        'buscar' => [
            '            const r_ok = await ctx.pedir_post("index.php", {',
            '                accion: "autenticar/verificar",',
            '                usuario: nombre_prueba,',
            '                contrasena: contrasena_correcta',
            '            });',
        ],
        'reemplazar' => [
            '            const r_ok = await ctx.post_accion("autenticar/verificar", {',
            '                usuario: nombre_prueba,',
            '                contrasena: contrasena_correcta',
            '            }, { sin_solicitante: true });',
        ],
    ],

    // 54.6: administrador/eliminar_usuario (finally)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_54_bloqueo_expirado_permite_login.js',
        'descripcion' => 'P54: administrador/eliminar_usuario con post_accion',
        'buscar' => [
            '                await ctx.pedir_post("index.php", {',
            '                    accion: "administrador/eliminar_usuario",',
            '                    nombre_solicitante: nombre_admin,',
            '                    nombre_usuario: nombre_prueba',
            '                });',
        ],
        'reemplazar' => [
            '                await ctx.post_accion("administrador/eliminar_usuario", {',
            '                    nombre_usuario: nombre_prueba',
            '                });',
        ],
    ],

    // ============================================================
    // PRUEBA 55
    // ============================================================

    // 55.1: _contar_huerfanos
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_55_subir_foto_reemplazo_limpia_nodos.js',
        'descripcion' => 'P55: _contar_huerfanos con post_accion',
        'buscar' => [
            'async function _contar_huerfanos(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen",',
            '        nombre_solicitante',
            '    });',
        ],
        'reemplazar' => [
            'async function _contar_huerfanos(ctx, nombre_solicitante) {',
            '    const r = await ctx.post_accion("grafo/resumen", {});',
        ],
    ],

    // 55.2: empresas/agregar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_55_subir_foto_reemplazo_limpia_nodos.js',
        'descripcion' => 'P55: empresas/agregar con post_accion',
        'buscar' => [
            '        const r_emp = await ctx.pedir_post("index.php", {',
            '            accion: "empresas/agregar",',
            '            nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '        const r_emp = await ctx.post_accion("empresas/agregar", {',
        ],
    ],

    // 55.3: vehiculos/agregar
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_55_subir_foto_reemplazo_limpia_nodos.js',
        'descripcion' => 'P55: vehiculos/agregar con post_accion',
        'buscar' => [
            '            const r_veh = await ctx.pedir_post("index.php", {',
            '                accion: "vehiculos/agregar",',
            '                nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '            const r_veh = await ctx.post_accion("vehiculos/agregar", {',
        ],
    ],

    // 55.4: primer vehiculos/listar (foto A)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_55_subir_foto_reemplazo_limpia_nodos.js',
        'descripcion' => 'P55: primer vehiculos/listar con post_accion',
        'buscar' => [
            '            const r_listar_a = await ctx.pedir_post("index.php", {',
            '                accion: "vehiculos/listar",',
            '                nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '            const r_listar_a = await ctx.post_accion("vehiculos/listar", {',
        ],
    ],

    // 55.5: segundo vehiculos/listar (foto B)
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_55_subir_foto_reemplazo_limpia_nodos.js',
        'descripcion' => 'P55: segundo vehiculos/listar con post_accion',
        'buscar' => [
            '            const r_listar = await ctx.pedir_post("index.php", {',
            '                accion: "vehiculos/listar",',
            '                nombre_solicitante: nombre_admin,',
        ],
        'reemplazar' => [
            '            const r_listar = await ctx.post_accion("vehiculos/listar", {',
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