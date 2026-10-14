<?php
/**
 * Aplicador — Cierre documental (paso 3/3): prompt_plugin_piloto.md.
 *
 * Actualiza:
 *   1. Cabecera: referencia al prompt de scripts v2.
 *   2. §7 ESTADO ACTUAL: bump de versión + resumen del cierre.
 *   3. §8: lecciones nuevas (54, 55, 56).
 *   4. §9 DISCUSIÓN ACTUAL: reemplazar con la entrada de v6z.
 *
 * Uso (parado en iteradoresJS/): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '';
$htmls_a_bumpear = [];

$cambios = [
    // ============================================================
    // 1. Cabecera: referencia al prompt de scripts v2
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Cabecera: referencia a scripts v2',
        'buscar' => [
            'Los scripts de aplicación de cambios se corren parados en la',
            'raíz de `iteradoresJS/` y usan el mismo formato y runner que en',
            'el proyecto PHP (ver `prompt_sistema_scripts.md` en el proyecto',
            'PHP).',
        ],
        'reemplazar' => [
            'Los scripts de aplicación de cambios se corren parados en la',
            'raíz de `iteradoresJS/` y usan el mismo formato y runner que en',
            'el proyecto PHP (ver `prompt_sistema_scripts_v2.md` en el',
            'proyecto PHP). El runner v2 tiene bumps automáticos: cada',
            'script declara `$version_nueva` en la cabecera y el runner',
            'bumpea `@version` solo. Para el plugin, declarar',
            '`$htmls_a_bumpear = []` (el HTML del plugin no usa `?v=`).',
        ],
    ],

    // ============================================================
    // 2. §7 ESTADO ACTUAL: bump + resumen
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§7 ESTADO ACTUAL al cierre',
        'buscar' => [
            '**Proyecto en v1.5plugin.6i.** El esqueleto del plugin está',
            'armado y funcional, tiene 65 pruebas (base + autocompletado',
            '+ autenticación + puntos de venta + viajes + micros +',
            'ventas + empresas + vehículos + declaraciones juradas +',
            'grafo) y las agrupa en secciones.',
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.6z.** El plugin está armado y',
            'funcional, tiene 65 pruebas (base + autocompletado +',
            'autenticación + puntos de venta + viajes + micros +',
            'ventas + empresas + vehículos + declaraciones juradas +',
            'grafo) y las agrupa en secciones.',
            '',
            '**Cierre de la línea grafo + plugin + scripts (v6w-v6z).**',
            'Se agregó `try/finally` a las pruebas 34, 35 y 36 (cleanup',
            'best-effort incluso si el flujo falla a mitad). Se corrigió',
            'la prueba 55 (subida de foto): el `nombre_campo: "foto"`',
            'faltaba en las llamadas a `ctx.subir_archivo`, y el assert',
            'final comparaba el nombre original del archivo en vez de la',
            'ruta generada por el backend. Ver §9 para el detalle.',
        ],
    ],

    // ============================================================
    // 3. §8: lecciones 54, 55, 56 (después de la 53)
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§8 lecciones 54-56',
        'buscar' => [
            '53. **`ctx.escribir` no dispara el evento `input`.**',
            '    El helper asigna `input.value` pero no emite el',
            '    evento, así que los listeners de tipo `input` en el',
            '    piloto (por ejemplo, el filtro de la tabla de',
            '    Clientes en `pasajeros.js`) no corren. Regla: si',
            '    una prueba depende de que un filtro en vivo se',
            '    aplique después de escribir, no cuentes con eso.',
            '    Buscá el elemento directamente por un atributo',
            '    único (`data-dni`, `data-venta-id`, etc.) o usá un',
            '    helper que dispare el evento (a futuro).',
            '    Detectado en la prueba 65: buscaba el botón "Ver',
            '    pasajes" con `.ver_pasajes_pasajero` genérico, sin',
            '    filtrar, y tomaba el primero de la tabla. Ahora usa',
            '    `.ver_pasajes_pasajero[data-dni="..."]`.',
        ],
        'reemplazar' => [
            '53. **`ctx.escribir` no dispara el evento `input`.**',
            '    El helper asigna `input.value` pero no emite el',
            '    evento, así que los listeners de tipo `input` en el',
            '    piloto (por ejemplo, el filtro de la tabla de',
            '    Clientes en `pasajeros.js`) no corren. Regla: si',
            '    una prueba depende de que un filtro en vivo se',
            '    aplique después de escribir, no cuentes con eso.',
            '    Buscá el elemento directamente por un atributo',
            '    único (`data-dni`, `data-venta-id`, etc.) o usá un',
            '    helper que dispare el evento (a futuro).',
            '    Detectado en la prueba 65: buscaba el botón "Ver',
            '    pasajes" con `.ver_pasajes_pasajero` genérico, sin',
            '    filtrar, y tomaba el primero de la tabla. Ahora usa',
            '    `.ver_pasajes_pasajero[data-dni="..."]`.',
            '',
            '54. **Cada prueba que crea recursos de setup debe',
            '    envolver el cuerpo en `try/finally`.** Si una prueba',
            '    falla a mitad, los recursos que creó (viajes,',
            '    empresa, vehículo, venta_actual colgada) quedan',
            '    vivos y la próxima corrida acumula sobre eso.',
            '    Caso real v6w: las pruebas 34, 35 y 36 dejaban la',
            '    `venta_actual` colgada de la terminal si fallaban,',
            '    y la siguiente corrida fallaba con "Pasajero 2 - El',
            '    DNI es obligatorio" (el backend contaba más',
            '    pasajeros que asientos declarados). El `finally`',
            '    limpia con `viajes/reiniciar_seleccion_completa` +',
            '    `viajes/eliminar`, en best-effort (los errores no',
            '    se propagan para no tapar el error original).',
            '',
            '55. **`ctx.subir_archivo` respeta `nombre_campo`.**',
            '    El helper pasa `archivo_info` al content script, que',
            '    usa `datos.archivo.nombre_campo || "archivo"` para',
            '    el `formData.append(...)`. Si el endpoint del piloto',
            '    lee `$_FILES[\'foto\']` (por ejemplo,',
            '    `vehiculos/subir_foto`), hay que pasar',
            '    `nombre_campo: "foto"` explícito. Caso real v6x: la',
            '    prueba 55 fallaba con "Archivo no enviado" porque',
            '    no pasaba `nombre_campo`. El endpoint',
            '    `pasajeros/subir_declaracion` sí funciona con el',
            '    default (`archivo`) porque lee',
            '    `$_FILES[\'archivo\']`.',
            '',
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
        ],
    ],

    // ============================================================
    // 4. §9 DISCUSIÓN ACTUAL: reemplazar la entrada de v6l por v6z
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§9 DISCUSIÓN ACTUAL al cierre',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.6l',
            '(fix real de la prueba 65: el filtro de la tabla de',
            'Clientes no se aplicaba porque `ctx.escribir` no dispara',
            'el evento `input`).',
            '',
            '**Fix v1.5plugin.6l.** La prueba 65 fallaba con un',
            'diagnóstico difícil: el modal mostraba el asiento nuevo,',
            'pero el backend devolvía el viejo. El problema real era',
            'que el test pegaba el DNI en `#buscar_pasajero` y esperaba',
            'que la tabla se filtrara, pero `ctx.escribir` asigna el',
            '`value` sin disparar el evento `input`, así que el',
            'listener de `pasajeros.js` no corría. El test tomaba el',
            'primer `.ver_pasajes_pasajero` (de otro pasajero), le',
            'cambiaba el asiento a ESA venta, y después verificaba',
            'contra el `id_venta` del test — que nadie había tocado.',
            'Fix: buscar el botón por `[data-dni="..."]`, que es único.',
            'Se agregó la lección 53 al prompt.',
            '',
            'Antes: v1.5plugin.6i',
            '(prueba 65: cambiar de asiento desde Clientes).',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.6z.',
            'Cierre de la línea grafo + plugin + scripts (v6w-v6z).',
            '',
            '**Cambios de esta sesión:**',
            '',
            '- **v6w** (`try/finally` en 34, 35, 36). Las tres pruebas',
            '  envuelven el cuerpo en try/finally. El cleanup corre',
            '  incluso si el flujo falla a mitad. Antes, una corrida',
            '  fallida dejaba la `venta_actual` colgada de la',
            '  terminal, y la siguiente corrida acumulaba asientos y',
            '  fallaba con "Pasajero 2 - El DNI es obligatorio".',
            '  Prueba 36: el sufijo y las variables `_creado_*`',
            '  se movieron afuera del try. Prueba 35: header',
            '  actualizado (antes decía que no limpiaba el viaje al',
            '  final; ahora sí lo hace).',
            '',
            '- **v6x** (`nombre_campo` en P55). La prueba 55',
            '  (`subir_foto_reemplazo_limpia_nodos`) pasaba',
            '  `archivo_info` sin `nombre_campo`, así que el content',
            '  script usaba el default (`archivo`) y el endpoint',
            '  `vehiculos/subir_foto` respondía "Archivo no enviado"',
            '  (lee `$_FILES[\'foto\']`). Fix: pasar',
            '  `nombre_campo: "foto"` en las dos subidas.',
            '',
            '- **v6y** (fix del bloque `finally` mal armado en P35).',
            '  El script v6w dejó a P35 sin la línea `} finally {`.',
            '  VSCode marcaba el archivo en rojo. Fix quirúrgico',
            '  insertando las líneas faltantes.',
            '',
            '- **v6z** (P55 compara rutas en vez de nombres originales).',
            '  El assert final chequeaba que la ruta de la foto',
            '  contuviera `fotoB_`, pero el backend genera el nombre',
            '  (`FOTO<patente>_<unix>.png`). Fix: capturar la ruta de',
            '  la foto A antes de subir la B, y verificar que la ruta',
            '  cambió. Lección 56 agregada.',
            '',
            '**Estado del plugin:** 65 pruebas en 11 secciones (base,',
            'empresas, vehículos, declaraciones_juradas, autenticación,',
            'autocompletado, puntos_de_venta, viajes, micros, ventas,',
            'grafo). Todas las pruebas del grafo corren en verde.',
            'El plugin usa el runner v2 con bumps automáticos del',
            'prompt de scripts (declarar `$htmls_a_bumpear = []`).',
            '',
            '**Pendientes del plugin (heredados):**',
            '',
            '- División de la ventana en pestañas por rol (base +',
            '  admin + dueño + terminal + soporte + multi-rol). Idea',
            '  anotada al cierre de V1.5plugin.7a.',
            '- Refactor del payload: helper `_post(ctx, accion, params)`',
            '  que inyecte `nombre_solicitante` y `nombre_dueno`',
            '  automáticamente. Evita bugs como el de v6q (campo',
            '  agregado al POST pero no a la firma).',
            '- Test de "linting": verificar que ningún `pedir_post` a',
            '  acciones que requieren `nombre_dueno` salga sin él.',
            '- Historial de corridas en la ventana.',
            '- Revisar los permisos del manifest cuando se pruebe',
            '  contra un dominio real.',
            '',
            'Antes: v1.5plugin.6l (fix de la prueba 65: el filtro',
            'de la tabla de Clientes no se aplicaba porque',
            '`ctx.escribir` no dispara el evento `input`).',
        ],
    ],
];

// ============================================================
// Runner v2
// ============================================================

echo "=== Aplicador — Cierre documental (paso 3/3): prompt_plugin_piloto.md ===\n\n";

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

echo "[INFO] " . count($reemplazos_por_archivo) . " archivo(s) a reemplazar.\n\n";

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