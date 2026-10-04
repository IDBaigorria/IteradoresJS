<?php
/**
 * Aplicador de cambios automáticos — proyecto iteradoresJS (plugin Chrome).
 *
 * Tanda v1.5plugin.5b: carga de viajes más robusta.
 *
 * - ir_a_tab no clickea la tab si ya está activa (evita reiniciar
 *   cargar_viajes y descartar el trabajo de la primera carga).
 * - Los timeouts del primer load suben (25s para la lista, 10-15s
 *   para el modal y los micros).
 *
 * Uso (parado en la raíz de iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    // --------------------------------------------------------
    // _helpers.js — ir_a_tab: no clickear si ya está activa
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers: ir_a_tab no clickea si la tab ya esta activa',
        'buscar' => [
            '    await cerrar_modales_si_abiertos(ctx);',
            '',
            '    const selector = `.tab[data-tab="${id_tab}"]`;',
            '    const existe = await ctx.esperar(selector, 3000);',
            '    if (!existe || !existe.exito) throw new Error("No existe el tab " + id_tab);',
            '    await ctx.clic(selector);',
            '    const seccion = await ctx.esperar_visible("#" + id_tab, 5000);',
        ],
        'reemplazar' => [
            '    await cerrar_modales_si_abiertos(ctx);',
            '',
            '    const selector = `.tab[data-tab="${id_tab}"]`;',
            '    const existe = await ctx.esperar(selector, 3000);',
            '    if (!existe || !existe.exito) throw new Error("No existe el tab " + id_tab);',
            '',
            '    // Si el tab ya esta activo, no clickear: evita reiniciar la',
            '    // carga de datos (el piloto limpia la lista al principio de',
            '    // cargar_viajes, y volver a clickear descarta lo que la carga',
            '    // anterior ya tenia listo). Despues del login, el piloto',
            '    // activa el primer tab automaticamente, asi que en la mayoria',
            '    // de los casos el tab ya esta activo al entrar aca.',
            '    const clases = await ctx.obtener_atributos(selector, "class");',
            '    const ya_activo = clases.length > 0 && String(clases[0]).indexOf("active") !== -1;',
            '    if (!ya_activo) {',
            '        await ctx.clic(selector);',
            '    }',
            '',
            '    const seccion = await ctx.esperar_visible("#" + id_tab, 5000);',
        ],
    ],

    // --------------------------------------------------------
    // _helpers.js — ir_a_viajes_y_abrir_primero: timeouts más largos
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers: ir_a_viajes_y_abrir_primero con timeouts largos',
        'buscar' => [
            'export async function ir_a_viajes_y_abrir_primero(ctx) {',
            '    await ir_a_tab(ctx, "viajes");',
            '    const hay = await ctx.esperar(".btn-detalle-viaje", 8000);',
            '    if (!hay || !hay.exito) throw new Error("No hay viajes disponibles");',
            '',
            '    await ctx.clic(".btn-detalle-viaje");',
            '    const modal = await ctx.esperar_visible("#modal_generico", 8000);',
            '    if (!modal || !modal.exito) throw new Error("No se abrio el modal del viaje");',
            '    const micros = await ctx.esperar(".btn-ver-pasaje", 8000);',
            '    if (!micros || !micros.exito) throw new Error("El viaje no tiene micros");',
            '}',
        ],
        'reemplazar' => [
            'export async function ir_a_viajes_y_abrir_primero(ctx) {',
            '    await ir_a_tab(ctx, "viajes");',
            '    // El primer load de la lista de viajes puede tardar bastante',
            '    // si el grafo acumulo muchos datos de corridas anteriores',
            '    // (viajes, ventas, micros). En la primera prueba de la corrida',
            '    // el fetch puede tardar 10-15s. Damos 25s para no fallar por',
            '    // timing.',
            '    const hay = await ctx.esperar(".btn-detalle-viaje", 25000);',
            '    if (!hay || !hay.exito) throw new Error("No hay viajes disponibles");',
            '',
            '    await ctx.clic(".btn-detalle-viaje");',
            '    const modal = await ctx.esperar_visible("#modal_generico", 10000);',
            '    if (!modal || !modal.exito) throw new Error("No se abrio el modal del viaje");',
            '    const micros = await ctx.esperar(".btn-ver-pasaje", 15000);',
            '    if (!micros || !micros.exito) throw new Error("El viaje no tiene micros");',
            '}',
        ],
    ],

    // --------------------------------------------------------
    // _helpers.js — bump version interna
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers: bump @version a 1.5plugin.5b',
        'buscar' => [
            ' * @version 1.5plugin.5a',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.5b',
        ],
    ],

    // --------------------------------------------------------
    // ConfPlugin.js — bumps a 5b
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin: bump VERSION_APP a 1.5plugin.5b',
        'buscar' => [
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.5a";',
        ],
        'reemplazar' => [
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.5b";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin: bump VERSION_PLUGIN a 1.5plugin.5b',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5a";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5b";',
        ],
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §7
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §7 bump a 5b',
        'buscar' => [
            '**Proyecto en v1.5plugin.5a.** El esqueleto del plugin está',
            'armado y funcional, tiene 29 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas) y las agrupa',
            'en secciones. Las pruebas de venta son independientes: cada',
            'una cierra los modales al terminar, fuerza el refresh del',
            'croquis y espera activamente por asientos libres. El viaje',
            'de setup tiene 2 micros de 44 asientos cada uno (88 en',
            'total).',
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.5b.** El esqueleto del plugin está',
            'armado y funcional, tiene 29 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas) y las agrupa',
            'en secciones. Las pruebas de venta son independientes: cada',
            'una cierra los modales al terminar, fuerza el refresh del',
            'croquis y espera activamente por asientos libres. El viaje',
            'de setup tiene 2 micros de 44 asientos cada uno (88 en',
            'total). `ir_a_tab` no clickea la tab si ya está activa',
            '(evita reiniciar la carga de datos). Timeouts del primer',
            'load: 25s para la lista de viajes, 10s para el modal, 15s',
            'para los micros.',
        ],
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §8.8 aprendizaje 42
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §8.8 agregar aprendizaje 42',
        'buscar' => [
            '41. **Un recurso compartido entre pruebas se agota si',
            '    nadie lo repone.** El viaje de setup de las pruebas',
            '    de venta empezó con 1 micro de 44 asientos y 9 libres.',
            '    Con 15 pruebas × 1-3 asientos por prueba, no alcanza.',
            '    Solución: 2 micros (88 asientos). Además, aunque las',
            '    pruebas cancelen al final, la cancelación no libera',
            '    los asientos en el croquis del frontend hasta el',
            '    próximo polling, así que las pruebas siguientes ven',
            '    el estado viejo. Combinación: pool grande + refresh',
            '    forzado + espera activa.',
        ],
        'reemplazar' => [
            '41. **Un recurso compartido entre pruebas se agota si',
            '    nadie lo repone.** El viaje de setup de las pruebas',
            '    de venta empezó con 1 micro de 44 asientos y 9 libres.',
            '    Con 15 pruebas × 1-3 asientos por prueba, no alcanza.',
            '    Solución: 2 micros (88 asientos). Además, aunque las',
            '    pruebas cancelen al final, la cancelación no libera',
            '    los asientos en el croquis del frontend hasta el',
            '    próximo polling, así que las pruebas siguientes ven',
            '    el estado viejo. Combinación: pool grande + refresh',
            '    forzado + espera activa.',
            '42. **El primer load del viaje puede tardar 10-15s.** El',
            '    grafo acumula viajes, micros, ventas y asientos de',
            '    corridas anteriores. `formatear_viaje` itera todos',
            '    los micros y todos los asientos para calcular los',
            '    contadores al vuelo, así que la respuesta de',
            '    `viajes/listar_por_terminal` se pone lenta cuando el',
            '    grafo crece. Un timeout de 8s es corto. Regla: 25s',
            '    para el primer load de la lista, y no clickear la tab',
            '    si ya está activa (el piloto la activa solo después',
            '    del login y arranca `cargar_viajes` — clickear de',
            '    nuevo limpia la lista y reinicia el fetch).',
        ],
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §9 cabecera
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §9 cabecera bump a 5b',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.5a (las',
            'pruebas de venta pasan a ser independientes. Nuevo helper',
            '`cerrar_modales_si_abiertos(ctx)` en `_helpers.js` que se',
            'llama al inicio y al final de cada prueba. `ir_a_tab`',
            'cierra modales antes de cambiar de pestaña.',
            '`abrir_primer_micro_con_libres` fuerza un refresh del',
            'croquis y espera activamente por asientos libres.',
            '`cerrar_form_venta_y_liberar` cierra también el modal del',
            'viaje. Nuevos aprendizajes 39-41).',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.5b (la',
            'carga de la lista de viajes pasa a ser más robusta.',
            '`ir_a_tab` no clickea la tab si ya está activa, así no',
            'reinicia `cargar_viajes` ni descarta la carga en curso.',
            'Timeouts del primer load subidos a 25s para la lista, 10s',
            'para el modal del viaje y 15s para la lista de micros.',
            'Nuevo aprendizaje 42).',
            'Antes: v1.5plugin.5a (las',
            'pruebas de venta pasan a ser independientes. Nuevo helper',
            '`cerrar_modales_si_abiertos(ctx)` en `_helpers.js` que se',
            'llama al inicio y al final de cada prueba. `ir_a_tab`',
            'cierra modales antes de cambiar de pestaña.',
            '`abrir_primer_micro_con_libres` fuerza un refresh del',
            'croquis y espera activamente por asientos libres.',
            '`cerrar_form_venta_y_liberar` cierra también el modal del',
            'viaje. Nuevos aprendizajes 39-41).',
        ],
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §9 estado de la conversación
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §9 agregar entrada de la tanda 5b',
        'buscar' => [
            '- Nota: el pool (los 2 micros) se agrega manualmente una',
            '  vez desde la pestaña Viajes del piloto. Si se vuelve a',
            '  agotar, hay que agregar un tercer micro o limpiar',
            '  ventas viejas desde la pestaña Vendidos.',
        ],
        'reemplazar' => [
            '- Nota: el pool (los 2 micros) se agrega manualmente una',
            '  vez desde la pestaña Viajes del piloto. Si se vuelve a',
            '  agotar, hay que agregar un tercer micro o limpiar',
            '  ventas viejas desde la pestaña Vendidos.',
            '- En v1.5plugin.5b, después de aplicar el fix, la prueba',
            '  `venta_basica` seguía fallando con "No hay viajes',
            '  disponibles". Diagnóstico: la lista tarda 10-15s en',
            '  cargar (el grafo acumuló mucho dato) y `ir_a_tab`',
            '  clickeaba la tab aunque ya estuviera activa, reiniciando',
            '  `cargar_viajes`. Se subieron los timeouts a 25s y se',
            '  evitó el click redundante. Con eso, la primera carga',
            '  tiene tiempo de terminar.',
        ],
    ],

];

// ============================================================
// Runner
// ============================================================

echo "=== Aplicador de cambios ===\n\n";

function detectar_eol(string $contenido): string {
    return (strpos($contenido, "\r\n") !== false) ? "\r\n" : "\n";
}
function normalizar_a_unix(string $contenido): string {
    return str_replace("\r\n", "\n", $contenido);
}
function normalizar_a_original(string $contenido, string $eol): string {
    if ($eol === "\n") return $contenido;
    return str_replace("\n", "\r\n", $contenido);
}
function contar_ocurrencias(string $contenido, string $bloque): int {
    if ($bloque === '') return 0;
    $count = 0;
    $offset = 0;
    while (($pos = strpos($contenido, $bloque, $offset)) !== false) {
        $count++;
        $offset = $pos + strlen($bloque);
    }
    return $count;
}

$creaciones = [];
$eliminaciones = [];
$reemplazos_por_archivo = [];

foreach ($cambios as $cambio) {
    $tipo = $cambio['tipo'] ?? 'reemplazar';
    if ($tipo === 'crear') { $creaciones[] = $cambio; continue; }
    if ($tipo === 'eliminar') { $eliminaciones[] = $cambio; continue; }
    if (!isset($cambio['archivo']) || !isset($cambio['buscar']) || !isset($cambio['reemplazar'])) {
        echo "[FALLO] Cambio mal formado (faltan campos).\n";
        exit(1);
    }
    $reemplazos_por_archivo[$cambio['archivo']][] = $cambio;
}

$total_reemplazos = 0;
foreach ($reemplazos_por_archivo as $lista) { $total_reemplazos += count($lista); }

echo "[INFO] " . count($creaciones) . " archivo(s) a crear, "
    . $total_reemplazos . " reemplazo(s) en "
    . count($reemplazos_por_archivo) . " archivo(s), "
    . count($eliminaciones) . " archivo(s) a eliminar.\n\n";

$archivos_a_escribir = [];
$bloques_ok = 0;
$bloques_fallidos = [];

foreach ($reemplazos_por_archivo as $archivo_rel => $lista_cambios) {
    $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
    if (!file_exists($ruta_abs)) {
        $bloques_fallidos[] = "Archivo no encontrado: $archivo_rel";
        foreach ($lista_cambios as $c) $bloques_fallidos[] = "  - {$c['descripcion']}";
        continue;
    }
    $contenido_original = file_get_contents($ruta_abs);
    if ($contenido_original === false) { $bloques_fallidos[] = "No se pudo leer: $archivo_rel"; continue; }

    $eol = detectar_eol($contenido_original);
    $contenido = normalizar_a_unix($contenido_original);
    $contenido_antes = $contenido;
    $hubo_error = false;

    foreach ($lista_cambios as $cambio) {
        $buscar_str = implode("\n", $cambio['buscar']);
        $reemplazar_str = implode("\n", $cambio['reemplazar']);
        $ocurrencias = contar_ocurrencias($contenido, $buscar_str);
        if ($ocurrencias === 0) {
            $bloques_fallidos[] = "$archivo_rel: bloque no encontrado - {$cambio['descripcion']}";
            $hubo_error = true; continue;
        }
        if ($ocurrencias > 1) {
            $bloques_fallidos[] = "$archivo_rel: bloque ambiguo ($ocurrencias ocurrencias) - {$cambio['descripcion']}";
            $hubo_error = true; continue;
        }
        $contenido = str_replace($buscar_str, $reemplazar_str, $contenido);
        $bloques_ok++;
    }
    if (!$hubo_error && $contenido !== $contenido_antes) {
        $archivos_a_escribir[$ruta_abs] = normalizar_a_original($contenido, $eol);
    }
}

if ($modo_estricto && !empty($bloques_fallidos)) {
    echo "=== ABORTADO ===\n";
    echo "Se detectaron " . count($bloques_fallidos) . " problema(s). No se escribió ningún archivo.\n\n";
    foreach ($bloques_fallidos as $f) echo "  [FALLO] $f\n";
    echo "\nSugerencia: revisá que el bloque a buscar coincida exactamente con el archivo actual.\n";
    exit(1);
}

foreach ($archivos_a_escribir as $ruta_abs => $contenido_final) {
    if (file_put_contents($ruta_abs, $contenido_final) === false) {
        echo "[FALLO] No se pudo escribir: " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n";
        continue;
    }
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
    if (!file_exists($ruta_abs)) {
        echo "[INFO] " . $elim['archivo'] . " no existía (nada que eliminar).\n";
        continue;
    }
    if (unlink($ruta_abs)) {
        echo "[OK] " . $elim['archivo'] . " (eliminado)\n";
    } else {
        echo "[FALLO] No se pudo eliminar: " . $elim['archivo'] . "\n";
    }
}

echo "\n=== Resumen ===\n";
echo "Bloques aplicados: $bloques_ok\n";
echo "Archivos nuevos:   " . count($creaciones) . "\n";
if (!empty($bloques_fallidos)) {
    echo "Fallos: " . count($bloques_fallidos) . "\n";
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";