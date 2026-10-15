<?php
/**
 * Aplicador — prompt_plugin_piloto.md: cierre del botón de
 * limpieza y fix del listener.
 *
 * Solo documentacion. No bumpea @version.
 *
 * Uso (raiz del proyecto plugin): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '';
$htmls_a_bumpear = [];

$cambios = [

    // 1. §5: agregar LimpiezaPrueba
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'plugin: §5 agregar LimpiezaPrueba',
        'buscar' => [
            '- `ctx.enviar(tipo, datos)` — mensaje crudo al content script.',
        ],
        'reemplazar' => [
            '- `ctx.enviar(tipo, datos)` — mensaje crudo al content script.',
            '',
            '**Utilidades del plugin (no del ctx):**',
            '- `Aplicacion/LimpiezaPrueba.js`: módulo con',
            '  `limpiar_datos_de_prueba(ctx, al_progreso)`. Itera',
            '  dueños, llama los 6 endpoints por dueño + el global',
            '  de usuarios. Chequea modo pruebas + admin antes de',
            '  empezar. Devuelve `{exito, duenos, res_ini, res_fin,',
            '  totales}`.',
            '- `globalThis.limpiar_prueba()` — handler para la',
            '  consola del SW. En MV3 no se puede hacer import()',
            '  dinámico; exponerlo es la vía para debug.',
        ],
    ],

    // 2. §8: lección 58
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'plugin: lección 58',
        'buscar' => [
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
        'reemplazar' => [
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
            '58. **Un `addEventListener("DOMContentLoaded")` anidado',
            '    nunca dispara.** El evento ya ocurrió cuando el',
            '    bloque interno se registra (porque el bloque está',
            '    dentro del handler del evento original). Caso real',
            '    v1.5plugin.7n: el listener del botón "Limpiar datos',
            '    de prueba" quedó dentro de un DOMContentLoaded',
            '    anidado, y el botón no hacía nada. Fix: conectar',
            '    directo, ya que el DOM está listo en ese punto.',
            '    Regla general: si estás dentro de un handler de',
            '    DOMContentLoaded, no hace falta volver a esperarlo.',
            '',
            '59. **`chrome.runtime.sendMessage` desde el SW devuelve',
            '    una promesa.** Si nadie escucha (por ejemplo, el',
            '    popup está cerrado), la promesa se rechaza con',
            '    "Could not establish connection". Para broadcast',
            '    de progreso donde el emisor no necesita acuse,',
            '    tragarse el rechazo: `.catch(() => {})`.',
            '',
            '---',
            '',
            '## 10. REGLAS DE TRABAJO',
        ],
    ],

    // 3. §9: actualizar estado
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'plugin: §9 actualizar estado',
        'buscar' => [
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
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.7o.',
            'Cierre del botón de limpieza + fix del listener.',
            '',
            '**Estado al cierre de v1.5plugin.7o:**',
            '',
            '- **Fase 2c cerrada.** Las ~50 pruebas y los 3 helpers',
            '  auxiliares usan `_post` (de `_helpers.js`), que delega',
            '  en `ctx.post_accion` (del SW). Ninguna prueba usa',
            '  `ctx.pedir_post` directo.',
            '- **Verificación final:** las **65 pruebas corren en',
            '  verde** después del refactor.',
            '- **Botón "Limpiar datos de prueba" agregado** (v7m).',
            '  Módulo `Aplicacion/LimpiezaPrueba.js` + handler en',
            '  `servicio.js` + `globalThis.limpiar_prueba`. La UI',
            '  del popup tiene el botón + un `<pre>` para el log.',
            '  Confirm previo, progreso incremental y resumen final.',
            '- **v7n**: fix del listener del botón (un',
            '  `DOMContentLoaded` anidado nunca disparaba).',
            '',
            '**Cambios del refactor (Fase 2c):**',
            '',
            '- `ctx.post_accion(accion, params, opts)`: inyecta',
            '  `nombre_solicitante` (con cache) y `nombre_dueno`',
            '  (si no viene en params). Soporta `sin_solicitante`,',
            '  `sin_dueno`, `devolver_crudo`, `lanzar_en_error_backend`.',
            '- `_post(ctx, accion, params, opts)`: wrapper de',
            '  `_helpers.js` que devuelve `r.json` pelado y',
            '  opcionalmente lanza en error de backend.',
            '- `ctx.dueno_actual()`, `ctx.refrescar_solicitante()`.',
            '- Cache invalidado en `asegurar_login` y `cerrar_sesion`.',
            '',
            '**Pendientes del plugin:**',
            '',
            '- **Pruebas 37 y 38 sin `try/finally`:** si el flujo',
            '  falla a mitad, la empresa/vehículo de setup queda',
            '  colgada. Los limpiadores ahora la agarran, pero la',
            '  prueba debería limpiar por su cuenta.',
            '- **Refactor de la ventana en pestañas por rol.** Idea',
            '  anotada al cierre de v1.5plugin.7a.',
            '- **Centralizar prefijos de prueba.** Hoy cada',
            '  limpiador tiene su lista hardcodeada. Cuando una',
            '  prueba nueva usa un prefijo distinto, el limpiador',
            '  no lo reconoce. Idea: una constante compartida o',
            '  que las pruebas registren su prefijo.',
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