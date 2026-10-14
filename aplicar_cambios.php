<?php
/**
 * Aplicador — Fix del helper cancelar_venta.
 *
 * El helper llamaba a ctx.nombre_usuario_actual() sin extraer
 * `.nombre_usuario`. El objeto se serializaba como
 * "[object Object]" al hacer el POST. El backend buscaba
 * us_[object Object], no lo encontraba, y moría con 500.
 *
 * Uso (parado en iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [
    // ============================================================
    // 1. cancelar_venta: extraer .nombre_usuario
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => 'cancelar_venta: extraer nombre_usuario',
        'buscar' => [
            '    // El backend necesita nombre_solicitante para saber qué',
            '    // contexto cargar y qué terminal es el solicitante. Sin',
            '    // él, cae al fallback que itera sobre `usuarios` y, con',
            '    // carga parcial, devuelve "Venta no encontrada".',
            '    const nombre_sol = await ctx.nombre_usuario_actual();',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "ventas/cancelar",',
            '        id_venta,',
            '        motivo,',
            '        nombre_solicitante: nombre_sol',
            '    });',
        ],
        'reemplazar' => [
            '    // El backend necesita nombre_solicitante para saber qué',
            '    // contexto cargar y qué terminal es el solicitante. Sin',
            '    // él, cae al fallback que itera sobre `usuarios` y, con',
            '    // carga parcial, devuelve "Venta no encontrada".',
            '    //',
            '    // Ojo: ctx.nombre_usuario_actual() devuelve un objeto',
            '    // `{exito, nombre_usuario}`. Hay que extraer el string.',
            '    // Si se pasa el objeto directo, se serializa como',
            '    // "[object Object]" y el backend muere con 500.',
            '    const r_nombre = await ctx.nombre_usuario_actual();',
            '    if (!r_nombre || !r_nombre.exito || !r_nombre.nombre_usuario) {',
            '        throw new Error("No se pudo resolver el nombre de usuario del solicitante");',
            '    }',
            '    const nombre_sol = r_nombre.nombre_usuario;',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "ventas/cancelar",',
            '        id_venta,',
            '        motivo,',
            '        nombre_solicitante: nombre_sol',
            '    });',
        ],
    ],

    // ============================================================
    // 2. obtener_venta_por_id: mismo fix
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => 'obtener_venta_por_id: extraer nombre_usuario',
        'buscar' => [
            '    // Mismo motivo que cancelar_venta: el backend necesita',
            '    // nombre_solicitante para resolver el contexto del terminal.',
            '    const nombre_sol = await ctx.nombre_usuario_actual();',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "ventas/obtener",',
            '        id_venta,',
            '        nombre_solicitante: nombre_sol',
            '    });',
        ],
        'reemplazar' => [
            '    // Mismo motivo que cancelar_venta: el backend necesita',
            '    // nombre_solicitante para resolver el contexto del terminal.',
            '    // Y mismo detalle: hay que extraer `.nombre_usuario`.',
            '    const r_nombre = await ctx.nombre_usuario_actual();',
            '    if (!r_nombre || !r_nombre.exito || !r_nombre.nombre_usuario) {',
            '        throw new Error("No se pudo resolver el nombre de usuario del solicitante");',
            '    }',
            '    const nombre_sol = r_nombre.nombre_usuario;',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "ventas/obtener",',
            '        id_venta,',
            '        nombre_solicitante: nombre_sol',
            '    });',
        ],
    ],

    // ============================================================
    // 3. Bump
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => 'Bump _helpers.js',
        'buscar' => [
            ' * @version 1.5plugin.6m',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.6n',
        ],
    ],
];

// ============================================================
// Runner
// ============================================================

echo "=== Aplicador — Fix helper cancelar_venta ===\n\n";

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