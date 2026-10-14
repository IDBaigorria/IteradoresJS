<?php
/**
 * Aplicador — P55: comparar rutas en vez de nombres originales.
 *
 * El backend guarda la foto con nombre derivado del vehículo +
 * timestamp (ej: FOTO<patente>_<unix>.png), no con el nombre
 * original del archivo subido. El assert final de P55 chequeaba
 * que la ruta contuviera "fotoB_", lo cual nunca es cierto.
 *
 * Fix: capturar la ruta de la foto A antes de subir la B, y
 * verificar que la ruta cambió. Es más robusto y sigue validando
 * el fix v75a (reemplazo destruye la vieja).
 *
 * Uso (parado en iteradoresJS/): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.6z';
$htmls_a_bumpear = [];

$cambios = [
    // ============================================================
    // 1. Insertar captura de la foto A antes de H1.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_55_subir_foto_reemplazo_limpia_nodos.js',
        'descripcion' => 'P55: capturar ruta de la foto A',
        'buscar' => [
            '            ctx.assert(r_foto_a && r_foto_a.exito && r_foto_a.json && r_foto_a.json.exito,',
            '                "Falló la subida de la foto A: "',
            '                + (r_foto_a && r_foto_a.json && r_foto_a.json.error ? r_foto_a.json.error : "(sin detalle)"));',
            '',
            '            const H1 = await _contar_huerfanos(ctx, nombre_admin);',
        ],
        'reemplazar' => [
            '            ctx.assert(r_foto_a && r_foto_a.exito && r_foto_a.json && r_foto_a.json.exito,',
            '                "Falló la subida de la foto A: "',
            '                + (r_foto_a && r_foto_a.json && r_foto_a.json.error ? r_foto_a.json.error : "(sin detalle)"));',
            '',
            '            // Capturar la ruta de la foto A. El backend guarda',
            '            // con nombre derivado del vehículo + timestamp, no',
            '            // con el nombre original del archivo. Para verificar',
            '            // que la B reemplazó a la A, comparamos las rutas.',
            '            const r_listar_a = await ctx.pedir_post("index.php", {',
            '                accion: "vehiculos/listar",',
            '                nombre_solicitante: nombre_admin,',
            '                nombre_dueno,',
            '                nombre_empresa',
            '            });',
            '            ctx.assert(r_listar_a && r_listar_a.exito && r_listar_a.json && r_listar_a.json.exito,',
            '                "No se pudieron listar los vehículos tras la foto A: "',
            '                + (r_listar_a && r_listar_a.json && r_listar_a.json.error ? r_listar_a.json.error : "(sin detalle)"));',
            '            const veh_a = (r_listar_a.json.vehiculos || []).find(v => v.nombre_vehiculo === nombre_vehiculo);',
            '            ctx.assert(veh_a && veh_a.foto, "El vehículo no tiene foto tras subir la A.");',
            '            const foto_a_path = veh_a.foto;',
            '',
            '            const H1 = await _contar_huerfanos(ctx, nombre_admin);',
        ],
    ],

    // ============================================================
    // 2. Reemplazar el assert final.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_55_subir_foto_reemplazo_limpia_nodos.js',
        'descripcion' => 'P55: assert final compara rutas',
        'buscar' => [
            '            const veh = (r_listar.json.vehiculos || []).find(v => v.nombre_vehiculo === nombre_vehiculo);',
            '            ctx.assert(veh && veh.foto,',
            '                "El vehículo no tiene foto tras la subida.");',
            '            ctx.assert(veh.foto.indexOf("fotoB_") !== -1,',
            '                "La foto del vehículo no es la B. Ruta: " + veh.foto);',
        ],
        'reemplazar' => [
            '            const veh = (r_listar.json.vehiculos || []).find(v => v.nombre_vehiculo === nombre_vehiculo);',
            '            ctx.assert(veh && veh.foto,',
            '                "El vehículo no tiene foto tras la subida.");',
            '            // La ruta debe haber cambiado respecto a la foto A.',
            '            // El backend genera el nombre (vehículo + timestamp),',
            '            // así que no se puede chequear contra el nombre',
            '            // original del archivo. Comparamos rutas.',
            '            ctx.assert(veh.foto !== foto_a_path,',
            '                "La foto del vehículo no cambió tras subir la B. "',
            '                + "Ruta actual: " + veh.foto',
            '                + " (era: " + foto_a_path + ")");',
        ],
    ],
];

// ============================================================
// Runner v2
// ============================================================

echo "=== Aplicador — P55: comparar rutas ===\n\n";

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
    $htmls_a_bumpear = [];
}
if (!isset($version_nueva)) $version_nueva = '';
$version_nueva = trim((string)$version_nueva);
$bumpear = ($version_nueva !== '');

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

$archivos_bump_php_js = [];
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    $rel = substr($ruta_abs, strlen($raiz_proyecto) + 1);
    $ext = strtolower(pathinfo($ruta_abs, PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump_php_js[] = $rel;
}

$bumps_atversion = 0;
$bumps_detalle = [];

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
        if ($count === 0) continue;
        if ($viejo === $version_nueva) continue;
        $archivos_a_escribir[$ruta_abs] = [normalizar_a_unix($nuevo), $eol];
        $bumps_atversion++;
        $bumps_detalle[] = "$archivo_rel  @version $viejo → $version_nueva";
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

if (!empty($bumps_detalle)) {
    echo "\n--- Bumps ---\n";
    foreach ($bumps_detalle as $d) echo "[BUMP] $d\n";
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