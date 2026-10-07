<?php
/**
 * Aplicador de cambios — Prompt del plugin.
 *
 * Tanda: v1.5plugin.5w. Registra la prueba 56 y limpia el
 * duplicado de `ctx.subir_archivo` que quedó de la tanda
 * anterior.
 *
 * Uso: php aplicar_cambios.php (parado en iteradoresJS/)
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    // ------------------------------------------------------------
    // §5: limpiar el duplicado de subir_archivo
    // ------------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§5: limpiar duplicado de subir_archivo',
        'buscar' => [
            '  verificar que el ciclo de bloqueo no deja huérfanos en',
            '  credenciales (fix v75a de `bloqueado_hasta`).',
            '',
            '- `ctx.subir_archivo(accion, campos, archivo_info)` → sube un',
            '  archivo por multipart al piloto. `archivo_info` es',
            '  `{nombre, tipo, contenido_base64}`. El fetch lo hace el',
            '  content script (las cookies del piloto solo viajan desde',
            '  el origen del piloto).',
            '',
            '**Datos del page (via `chrome.scripting.executeScript` en',
        ],
        'reemplazar' => [
            '  verificar que el ciclo de bloqueo no deja huérfanos en',
            '  credenciales (fix v75a de `bloqueado_hasta`).',
            '',
            '**Datos del page (via `chrome.scripting.executeScript` en',
        ],
    ],

    // ------------------------------------------------------------
    // §7: bump a v1.5plugin.5w + 56 pruebas
    // ------------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§7: bump a 5w + 56 pruebas',
        'buscar' => [
            '**Proyecto en v1.5plugin.5s.** El esqueleto del plugin está',
            'armado y funcional, tiene 53 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + empresas',
            '+ vehículos + declaraciones juradas + grafo) y las agrupa',
            'en secciones.',
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.5w.** El esqueleto del plugin está',
            'armado y funcional, tiene 56 pruebas (base + autocompletado',
            '+ autenticación + puntos de venta + viajes + micros +',
            'ventas + empresas + vehículos + declaraciones juradas +',
            'grafo) y las agrupa en secciones.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§7: sumar autenticacion + prueba 55 en vehiculos',
        'buscar' => [
            '- `declaraciones_juradas`: 3 pruebas. `dj_pasajero_subir`',
            '  (flujo feliz con multipart), `dj_pasajero_reemplazar`',
            '  (subir una DJ nueva destruye la vieja),',
            '  `dj_pasajero_eliminar` (destruye el nodo y limpia el',
            '  enlace). Usan el helper `ctx.subir_archivo`.',
            '- `autocompletado`: `autocompletado_dni_terminal_clientes`.',
        ],
        'reemplazar' => [
            '- `declaraciones_juradas`: 3 pruebas. `dj_pasajero_subir`',
            '  (flujo feliz con multipart), `dj_pasajero_reemplazar`',
            '  (subir una DJ nueva destruye la vieja),',
            '  `dj_pasajero_eliminar` (destruye el nodo y limpia el',
            '  enlace). Usan el helper `ctx.subir_archivo`.',
            '- `autenticacion`: 1 prueba.',
            '  `bloqueo_expirado_permite_login`: verifica el rate',
            '  limiting del piloto con el bloqueo conmutable (2s en',
            '  modo pruebas). Mide huérfanos del grafo de',
            '  credenciales con el endpoint `grafo/resumen_credenciales`',
            '  (solo en modo pruebas) antes/después de los intentos,',
            '  del login bloqueado y del login exitoso. Verifica el',
            '  fix v75a de `bloqueado_hasta`.',
            '- `autocompletado`: `autocompletado_dni_terminal_clientes`.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§7: sumar subir_foto a vehiculos',
        'buscar' => [
            '- `vehiculos`: 3 pruebas. `alta_vehiculo` (flujo feliz),',
            '  `vehiculo_patente_vacia` (validación local),',
            '  `vehiculo_cancelar`. Crea una empresa de setup para cada',
            '  prueba y la elimina al final (arrastra el vehículo).',
        ],
        'reemplazar' => [
            '- `vehiculos`: 4 pruebas. `alta_vehiculo` (flujo feliz),',
            '  `vehiculo_patente_vacia` (validación local),',
            '  `vehiculo_cancelar`, `subir_foto_reemplazo_limpia_nodos`',
            '  (verifica el fix v75a de `foto`: al subir una foto nueva,',
            '  la vieja se destruye). Crea una empresa de setup para',
            '  cada prueba y la elimina al final (arrastra el vehículo).',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§7: sumar prueba 56 a la sección grafo',
        'buscar' => [
            '  - `listar_viajes_indice_comportamiento`: Fase 3',
            '    (v1.5piloto.76a). Verifica que el índice',
            '    precalculado de ventas por viaje no cambia el',
            '    comportamiento observable de `listar_viajes_*`:',
            '    `tiene_ventas` sigue siendo "0"/"1" correcto, y',
            '    `vendidos_aqui` sigue reflejando las ventas de la',
            '    terminal. La mejora de performance en sí no es',
            '    verificable de forma estable desde el plugin.',
            '  Todas miden nodos con `grafo/resumen` antes y después,',
            '  y comparan.',
        ],
        'reemplazar' => [
            '  - `listar_viajes_indice_comportamiento`: Fase 3',
            '    (v1.5piloto.76a). Verifica que el índice',
            '    precalculado de ventas por viaje no cambia el',
            '    comportamiento observable de `listar_viajes_*`:',
            '    `tiene_ventas` sigue siendo "0"/"1" correcto, y',
            '    `vendidos_aqui` sigue reflejando las ventas de la',
            '    terminal. La mejora de performance en sí no es',
            '    verificable de forma estable desde el plugin.',
            '  - `eliminar_huerfanos_limpia_grafo`: v1.5piloto.76g.',
            '    Llama al endpoint `grafo/eliminar_huerfanos` y',
            '    verifica que después no queden huérfanos. Depende',
            '    del estado: si el grafo ya está limpio, pasa con',
            '    `console.warn`. El plugin no puede crear huérfanos',
            '    artificialmente (no tiene acceso directo al grafo,',
            '    solo hace POST).',
            '  Todas miden nodos con `grafo/resumen` antes y después,',
            '  y comparan.',
        ],
    ],

    // ------------------------------------------------------------
    // §12: nueva "Última actualización"
    // ------------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§12: nueva Última actualización a 5w',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.5v',
            '(prueba 54 extendida: mide huérfanos del grafo de',
            'credenciales con el endpoint `grafo/resumen_credenciales`',
            'del piloto. Verifica el fix v75a de `bloqueado_hasta`.).',
            'Antes: v1.5plugin.5s',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.5w',
            '(prueba 56 `eliminar_huerfanos_limpia_grafo`: verifica',
            'que el endpoint `grafo/eliminar_huerfanos` del piloto',
            'deja el grafo sin huérfanos. El test depende del',
            'estado: si el grafo ya está limpio, pasa con',
            '`console.warn`. El plugin no puede crear huérfanos',
            'artificialmente porque no tiene acceso directo al',
            'grafo, solo hace POST.).',
            'Antes: v1.5plugin.5v',
            '(prueba 54 extendida: mide huérfanos del grafo de',
            'credenciales con el endpoint `grafo/resumen_credenciales`',
            'del piloto. Verifica el fix v75a de `bloqueado_hasta`.).',
            'Antes: v1.5plugin.5s',
        ],
    ],

];

// ============================================================
// Runner
// ============================================================
echo "=== Aplicador de cambios ===\n\n";
function detectar_eol(string $c): string { return (strpos($c, "\r\n") !== false) ? "\r\n" : "\n"; }
function normalizar_a_unix(string $c): string { return str_replace("\r\n", "\n", $c); }
function normalizar_a_original(string $c, string $e): string { if ($e === "\n") return $c; return str_replace("\n", "\r\n", $c); }
function contar_ocurrencias(string $c, string $b): int { if ($b === '') return 0; $n = 0; $o = 0; while (($p = strpos($c, $b, $o)) !== false) { $n++; $o = $p + strlen($b); } return $n; }
$creaciones = []; $eliminaciones = []; $reemplazos_por_archivo = [];
foreach ($cambios as $cambio) {
    $tipo = $cambio['tipo'] ?? 'reemplazar';
    if ($tipo === 'crear') { $creaciones[] = $cambio; continue; }
    if ($tipo === 'eliminar') { $eliminaciones[] = $cambio; continue; }
    if (!isset($cambio['archivo']) || !isset($cambio['buscar']) || !isset($cambio['reemplazar'])) { echo "[FALLO] Mal formado.\n"; exit(1); }
    $reemplazos_por_archivo[$cambio['archivo']][] = $cambio;
}
$total_reemplazos = 0;
foreach ($reemplazos_por_archivo as $lista) { $total_reemplazos += count($lista); }
echo "[INFO] $total_reemplazos reemplazo(s).\n\n";
$archivos_a_escribir = []; $bloques_ok = 0; $bloques_fallidos = [];
foreach ($reemplazos_por_archivo as $archivo_rel => $lista_cambios) {
    $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
    if (!file_exists($ruta_abs)) { $bloques_fallidos[] = "No encontrado: $archivo_rel"; foreach ($lista_cambios as $c) $bloques_fallidos[] = "  - {$c['descripcion']}"; continue; }
    $contenido_original = file_get_contents($ruta_abs);
    $eol = detectar_eol($contenido_original);
    $contenido = normalizar_a_unix($contenido_original);
    $contenido_antes = $contenido;
    $hubo_error = false;
    foreach ($lista_cambios as $cambio) {
        $buscar_str = implode("\n", $cambio['buscar']);
        $reemplazar_str = implode("\n", $cambio['reemplazar']);
        $es_todos = !empty($cambio['todos']);
        $ocurrencias = contar_ocurrencias($contenido, $buscar_str);
        if ($ocurrencias === 0) { $bloques_fallidos[] = "$archivo_rel: NO ENCONTRADO - {$cambio['descripcion']}"; $hubo_error = true; continue; }
        if (!$es_todos && $ocurrencias > 1) { $bloques_fallidos[] = "$archivo_rel: AMBIGUO ($ocurrencias) - {$cambio['descripcion']}"; $hubo_error = true; continue; }
        $contenido = str_replace($buscar_str, $reemplazar_str, $contenido);
        $bloques_ok++;
    }
    if (!$hubo_error && $contenido !== $contenido_antes) $archivos_a_escribir[$ruta_abs] = normalizar_a_original($contenido, $eol);
}
if ($modo_estricto && !empty($bloques_fallidos)) { echo "=== ABORTADO ===\n"; foreach ($bloques_fallidos as $f) echo "  [FALLO] $f\n"; exit(1); }
foreach ($archivos_a_escribir as $ruta_abs => $contenido_final) {
    if (file_put_contents($ruta_abs, $contenido_final) === false) { echo "[FALLO] Escribir.\n"; continue; }
    echo "[OK] " . substr($ruta_abs, strlen($raiz_proyecto)+1) . "\n";
}
echo "\n=== Resumen ===\nBloques aplicados: $bloques_ok\n";
if (!empty($bloques_fallidos)) { echo "Fallos: " . count($bloques_fallidos) . "\n"; foreach ($bloques_fallidos as $f) echo "  - $f\n"; }
echo "\nListo.\n";