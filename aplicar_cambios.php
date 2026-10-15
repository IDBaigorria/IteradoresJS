<?php
/**
 * Aplicador — Actualizar prompt_plugin_piloto.md con el cierre
 * de la Fase 2c.
 *
 * Solo documentacion. No bumpea @version (los .md no lo tienen).
 *
 * Uso (raiz del proyecto plugin): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '';
$htmls_a_bumpear = [];

$cambios = [

    // 1. §5: documentar ctx.post_accion, dueno_actual, refrescar_solicitante
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt_plugin: §5 documentar post_accion',
        'buscar' => [
            '**Fetch y datos:**',
            '- `ctx.pedir_post(url, body)` → {exito, status, texto, json}.',
            '- `ctx.enviar(tipo, datos)` — mensaje crudo al content script.',
        ],
        'reemplazar' => [
            '**Fetch y datos:**',
            '- `ctx.pedir_post(url, body)` → {exito, status, texto, json}.',
            '  Transporte crudo. Preferir `ctx.post_accion` (abajo)',
            '  para POST a `index.php`.',
            '- `ctx.post_accion(accion, params, opts)` → igual que',
            '  `pedir_post`, pero con `url: "index.php"` por defecto',
            '  e inyectando `nombre_solicitante` (del logueado,',
            '  cacheado) y `nombre_dueno` (si no viene en `params`).',
            '  Soporta `opts.sin_solicitante`, `opts.sin_dueno`,',
            '  `opts.devolver_crudo`, `opts.lanzar_en_error_backend`.',
            '  Es el que usa el wrapper `_post` de `_helpers.js`.',
            '- `ctx.dueno_actual()` → lee `usuario_actual.dueno` o',
            '  `usuario_actual.nombre_usuario`.',
            '- `ctx.refrescar_solicitante()` → invalida el cache del',
            '  solicitante y del dueño.',
            '- `ctx.enviar(tipo, datos)` — mensaje crudo al content script.',
        ],
    ],

    // 2. §8: lección 57
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt_plugin: lección 57',
        'buscar' => [
            '56. **Los asserts sobre nombres de archivos subidos',
            '    son frágiles.** El backend puede renombrar los',
            '    archivos subidos (sanitización, timestamp,',
            '    colisión). Caso real v6z: la prueba 55 chequeaba',
            '    que la ruta de la foto contuviera `fotoB_`, pero',
            '    `vehiculos/subir_foto` guarda con nombre derivado',
            '    del vehículo + timestamp',
            '    (`FOTO<patente>_<unix>.png`). Fix: capturar la ruta',
            '    de la foto A antes de subir la B, y verificar que',
            '    la ruta cambió. Es más robusto y sigue validando',
            '    el fix (reemplazo destruye la vieja).',
            '',
            '---',
            '',
            '## 10. REGLAS DE TRABAJO',
        ],
        'reemplazar' => [
            '56. **Los asserts sobre nombres de archivos subidos',
            '    son frágiles.** El backend puede renombrar los',
            '    archivos subidos (sanitización, timestamp,',
            '    colisión). Caso real v6z: la prueba 55 chequeaba',
            '    que la ruta de la foto contuviera `fotoB_`, pero',
            '    `vehiculos/subir_foto` guarda con nombre derivado',
            '    del vehículo + timestamp',
            '    (`FOTO<patente>_<unix>.png`). Fix: capturar la ruta',
            '    de la foto A antes de subir la B, y verificar que',
            '    la ruta cambió. Es más robusto y sigue validando',
            '    el fix (reemplazo destruye la vieja).',
            '',
            '57. **`post_accion` cambia el modo de carga del backend.**',
            '    Con `ctx.pedir_post` sin `nombre_solicitante`, el',
            '    backend hacía **carga total** (grafo completo en',
            '    memoria). Con `ctx.post_accion`, el backend hace',
            '    **carga parcial** (`us_<sol>`) y no puede navegar',
            '    `us_<dueño>` si el logueado no es el dueño.',
            '    Caso real v1.5plugin.7k: la prueba 58',
            '    (`venta_terminal_arbol_dual`) fallaba con "la venta',
            '    NO aparece en el árbol del dueño. Total: 0" porque',
            '    `ventas/listar` con `tipo: "dueno"` se llamaba',
            '    desde un terminal logueado. Fix: usar',
            '    `{sin_solicitante: true, sin_dueno: true}` en esos',
            '    POSTs para forzar carga total. Regla: cualquier',
            '    POST que navegue por una parte del grafo que NO es',
            '    del solicitante logueado necesita esos dos flags.',
            '',
            '---',
            '',
            '## 10. REGLAS DE TRABAJO',
        ],
    ],

    // 3. §9: nuevo estado + historial congelado
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt_plugin: §9 nuevo estado + historial',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.6z.',
            'Cierre de la línea grafo + plugin + scripts (v6w-v6z).',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.7l.',
            'Cierre de la Fase 2c (migración del plugin a `_post`/`post_accion`).',
            '',
            '**Estado al cierre de v1.5plugin.7l:**',
            '',
            '- **Fase 2c cerrada.** Las ~50 pruebas y los 3 helpers',
            '  auxiliares usan `_post` (de `_helpers.js`), que delega',
            '  en `ctx.post_accion` (del SW). Ninguna prueba usa',
            '  `ctx.pedir_post` directo.',
            '- **Cambios del refactor:**',
            '  - `ctx.post_accion(accion, params, opts)`: inyecta',
            '    `nombre_solicitante` (con cache) y `nombre_dueno`',
            '    (si no viene en params). Soporta `sin_solicitante`,',
            '    `sin_dueno`, `devolver_crudo`, `lanzar_en_error_backend`.',
            '  - `_post(ctx, accion, params, opts)`: wrapper de',
            '    `_helpers.js` que devuelve `r.json` pelado y',
            '    opcionalmente lanza en error de backend.',
            '  - `ctx.dueno_actual()`, `ctx.refrescar_solicitante()`.',
            '  - Cache invalidado en `asegurar_login` y `cerrar_sesion`.',
            '- **Pendientes del plugin:**',
            '  - **Verificación final:** correr las 65 pruebas',
            '    completas después del refactor.',
            '  - **Refactor de la ventana en pestañas por rol.** Idea',
            '    anotada al cierre de v1.5plugin.7a.',
            '',
            '---',
            '',
            '### Historial (congelado desde v1.5plugin.6z)',
            '',
            'Lo que sigue es histórico. La fuente de verdad sobre',
            'dónde quedamos es el bloque de estado de arriba. El',
            'detalle completo de la Fase 2c está en el',
            '`plan_actual.md` §1.11 del proyecto piloto.',
            '',
            '**Última actualización de este prompt:** v1.5plugin.6z.',
            'Cierre de la línea grafo + plugin + scripts (v6w-v6z).',
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

echo "\n=== Resumen ===\n";
echo "Bloques aplicados: $bloques_ok\n";
echo "Archivos escritos: $archivos_escritos\n";
if (!empty($bloques_fallidos)) {
    echo "Fallos: " . count($bloques_fallidos) . "\n";
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";