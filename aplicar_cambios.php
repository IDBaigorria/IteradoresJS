<?php
/**
 * Aplicador — prompt_plugin_piloto.md: cierre del arco del plugin.
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

    // 1. §5: agregar módulos del plugin.
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'plugin: §5 agregar modulos del plugin',
        'buscar' => [
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
        'reemplazar' => [
            '**Utilidades del plugin (no del ctx):**',
            '- `Aplicacion/LimpiezaPrueba.js`: módulo con',
            '  `limpiar_datos_de_prueba(ctx, al_progreso, opciones)`.',
            '  Limpia los datos de prueba del piloto. Acepta',
            '  `opciones.categorias` (array de strings) para',
            '  limpiar solo un subconjunto: `ventas`,',
            '  `cancelaciones`, `viajes`, `pasajeros`, `empresas`,',
            '  `terminales`, `usuarios`, `huerfanos`. Sin',
            '  categorías, limpia todo (comportamiento original).',
            '  Chequea modo pruebas + admin antes de empezar.',
            '  Devuelve `{exito, categorias, duenos, res_ini,',
            '  res_fin, totales}`.',
            '- `Aplicacion/CopiarPasajeros.js`: módulo con',
            '  `copiar_pasajeros_del_micro(ctx)`. Lee',
            '  `viaje_seleccionado` y `micro_seleccionado` del',
            '  page, pide `viajes/estado_asientos`, arma una tabla',
            '  TSV (Excel-friendly) con columnas (nombre,',
            '  apellido, DNI, documento, género, franja etaria).',
            '  Género por heurística (terminación en `a`/`o`).',
            '  Franja etaria desde `fecha_nacimiento` contra hoy.',
            '- `globalThis.limpiar_prueba()` — handler para la',
            '  consola del SW.',
            '- `globalThis.copiar_pasajeros()` — idem para copiar.',
        ],
    ],

    // 2. §8: lecciones nuevas.
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'plugin: lecciones 60-63',
        'buscar' => [
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
        'reemplazar' => [
            '59. **`chrome.runtime.sendMessage` desde el SW devuelve',
            '    una promesa.** Si nadie escucha (por ejemplo, el',
            '    popup está cerrado), la promesa se rechaza con',
            '    "Could not establish connection". Para broadcast',
            '    de progreso donde el emisor no necesita acuse,',
            '    tragarse el rechazo: `.catch(() => {})`.',
            '',
            '60. **La UI de la ventana crece con la cantidad de',
            '    pruebas.** Una lista plana se vuelve inservible',
            '    cuando hay 60+ pruebas. La solución es pestañas',
            '    temáticas que sigan la estructura de la app, y',
            '    dentro de cada pestaña, tarjetas agrupadas por rol',
            '    (admin, dueño, terminal, soporte, multi-rol) en',
            '    una grilla de 2 columnas. Criterio del grupo:',
            '    el rol con el que la prueba hace login primero.',
            '    Si la prueba cambia de sesión entre roles, va a',
            '    "Multi-rol".',
            '',
            '61. **Los botones contextuales van dentro del contexto.**',
            '    "Ejecutar todos los roles" y "Limpiar pruebas"',
            '    tienen sentido dentro de la pestaña activa, no',
            '    arriba. Los botones globales (limpiar todo,',
            '    copiar tabla) sí van arriba porque son',
            '    transversales. Menos ruido visual, cada botón',
            '    donde se usa.',
            '',
            '62. **La limpieza por categorías reusa el mismo endpoint.**',
            '    `LimpiezaPrueba.js` recibe `{categorias}` y limpia',
            '    solo ese subconjunto. El orden importa: ventas',
            '    antes que cancelaciones (que se crean al limpiar',
            '    las ventas), viajes antes que empresas (los',
            '    micros referencian empresas), pasajeros y',
            '    terminales antes que usuarios.',
            '',
            '63. **Persistencia en `localStorage` es un paliativo.**',
            '    La pestaña activa del plugin se guarda en',
            '    `localStorage[\'plugin_tab_activa\']`. Está anotado',
            '    en el código como `ANOTADO`: hay que migrarlo a',
            '    la persistencia del framework (IndexedDB del',
            '    contexto de la extensión).',
            '',
            '---',
            '',
            '## 10. REGLAS DE TRABAJO',
        ],
    ],

    // 3. §9: estado al cierre de v1.5plugin.7x.
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'plugin: §9 estado al cierre',
        'buscar' => [
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
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.7y.',
            'Cierre del arco de la interfaz del plugin.',
            '',
            '**Estado al cierre de v1.5plugin.7y:**',
            '',
            '- **Fase 2c cerrada.** Las ~50 pruebas y los 3 helpers',
            '  auxiliares usan `_post` (de `_helpers.js`), que delega',
            '  en `ctx.post_accion` (del SW). Ninguna prueba usa',
            '  `ctx.pedir_post` directo.',
            '- **Verificación final:** las **65 pruebas corrieron',
            '  en verde** después del refactor. Con la prueba 66',
            '  nueva, son **66 pruebas**.',
            '',
            '- **UI reorganizada en pestañas temáticas** (v7s-7v).',
            '  10 pestañas que siguen la estructura de la app:',
            '  Base, Administrador, Puntos de venta,',
            '  Empresas/Micros, Viajes, Ventas, Rendiciones,',
            '  Liquidaciones, Pasajeros, Grafo. Cada pestaña tiene',
            '  grupos por rol (Admin, Dueño, Terminal, Soporte,',
            '  Multi-rol) en una grilla de 2 columnas. Pestaña',
            '  activa en `localStorage`.',
            '',
            '- **Botones por pestaña** (v7w): "Ejecutar todos los',
            '  roles" (corre todas las pruebas de la pestaña) y',
            '  "Limpiar pruebas" (limpia solo lo relevante:',
            '  Viajes limpia viajes, Ventas limpia',
            '  ventas+cancelaciones, etc.).',
            '',
            '- **Botones globales** (v7x): "Limpiar todas las',
            '  pruebas" y "Copiar tabla de pasajeros", en paralelo',
            '  arriba.',
            '',
            '- **Copiar tabla de pasajeros** (v7p): lee el micro',
            '  del page, pide `viajes/estado_asientos`, arma una',
            '  tabla TSV lista para Excel con franja etaria y',
            '  género inferido.',
            '',
            '- **Prueba 66** (v7r): verifica que al hacer login',
            '  como terminal se limpia la venta_actual colgada',
            '  (fix v1.5piloto.80h en el piloto).',
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
            '- **Batería de pruebas exhaustivas.** Falta correr la',
            '  suite completa (66 pruebas) después de todos los',
            '  cambios de UI. Es el último paso para cerrar',
            '  formalmente el plan. Se hace más adelante.',
            '- **Persistencia de la pestaña activa:** migrar de',
            '  `localStorage` a la persistencia del framework.',
            '  Anotado en el código como `ANOTADO`.',
            '- **Pruebas 37 y 38 sin `try/finally`:** si el flujo',
            '  falla a mitad, la empresa/vehículo de setup queda',
            '  colgada. Los limpiadores ahora la agarran, pero la',
            '  prueba debería limpiar por su cuenta.',
            '- **Centralizar prefijos de prueba.** Hoy cada',
            '  limpiador tiene su lista hardcodeada. Idea: una',
            '  constante compartida o que las pruebas registren',
            '  su prefijo.',
            '- **Secciones vacías** (Rendiciones, Liquidaciones):',
            '  quedan a la espera de pruebas nuevas.',
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