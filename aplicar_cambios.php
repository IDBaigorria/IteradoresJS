<?php
/**
 * Aplicador de cambios automáticos — proyecto iteradoresJS (plugin Chrome).
 *
 * Tanda v1.5plugin.5d: timeouts más largos mientras el piloto se
 * aliviana con la limpieza de viajes de prueba.
 *
 * Uso (parado en la raíz de iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    // --------------------------------------------------------
    // _helpers.js — timeouts más largos
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers: subir timeouts del listado de viajes',
        'buscar' => [
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
        ],
        'reemplazar' => [
            '    // Timeouts largos para tolerar grafos grandes. El fetch del',
            '    // listado tarda segundos cuando hay muchos viajes y ventas,',
            '    // porque formatear_viaje escala con V x W (viajes x ventas).',
            '    // Con la limpieza de viajes de prueba del piloto (v74n)',
            '    // esto se va a aliviar, pero los timeouts quedan como red',
            '    // de seguridad.',
            '    const hay = await ctx.esperar(".btn-detalle-viaje", 40000);',
            '    if (!hay || !hay.exito) throw new Error("No hay viajes disponibles");',
            '',
            '    await ctx.clic(".btn-detalle-viaje");',
            '    const modal = await ctx.esperar_visible("#modal_generico", 30000);',
            '    if (!modal || !modal.exito) throw new Error("No se abrio el modal del viaje");',
            '    const micros = await ctx.esperar(".btn-ver-pasaje", 30000);',
            '    if (!micros || !micros.exito) throw new Error("El viaje no tiene micros");',
        ],
    ],

    // --------------------------------------------------------
    // _helpers.js — bump version interna
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers: bump @version a 1.5plugin.5d',
        'buscar' => [
            ' * @version 1.5plugin.5c',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.5d',
        ],
    ],

    // --------------------------------------------------------
    // ConfPlugin.js — bumps a 5d
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin: bump VERSION_APP a 1.5plugin.5d',
        'buscar' => [
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.5c";',
        ],
        'reemplazar' => [
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.5d";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin: bump VERSION_PLUGIN a 1.5plugin.5d',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5c";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5d";',
        ],
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §7
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §7 bump a 5d',
        'buscar' => [
            '**Proyecto en v1.5plugin.5c.** El esqueleto del plugin está',
            'armado y funcional, tiene 29 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas) y las agrupa',
            'en secciones. Las pruebas de venta son independientes: cada',
            'una cierra los modales al terminar, fuerza el refresh del',
            'croquis y espera activamente por asientos libres. El viaje',
            'de setup tiene 2 micros de 44 asientos cada uno (88 en',
            'total). `ir_a_tab` no clickea la tab si ya está activa',
            '(evita reiniciar la carga de datos). Timeouts del primer',
            'load: 25s para la lista de viajes, 10s para el modal, 15s',
            'para los micros. Timeouts del flujo de venta: 25s para el',
            'panel de opciones de impresión, 15s para abrir el modal de',
            'confirmación, 12s para el botón Vender.',
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.5d.** El esqueleto del plugin está',
            'armado y funcional, tiene 29 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas) y las agrupa',
            'en secciones. Las pruebas de venta son independientes: cada',
            'una cierra los modales al terminar, fuerza el refresh del',
            'croquis y espera activamente por asientos libres. El viaje',
            'de setup tiene 2 micros de 44 asientos cada uno (88 en',
            'total). `ir_a_tab` no clickea la tab si ya está activa',
            '(evita reiniciar la carga de datos). Timeouts: lista de',
            'viajes 40s, modal del viaje 30s, micros 30s (subidos en 5d',
            'para tolerar grafos grandes mientras el piloto se aliviana',
            'con la limpieza de viajes de prueba de v74n).',
        ],
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §8.8 aprendizaje 44
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §8.8 agregar aprendizaje 44',
        'buscar' => [
            '43. **El flujo de confirmación de venta tiene dos fetch',
            '    en serie.** Después de mostrar el toast "Venta',
            '    confirmada", el piloto hace `solicitar_estado_asientos`',
            '    y después `refrescar_contadores_viaje_actual`, y recién',
            '    después muestra el panel `#opciones_impresion`. Con el',
            '    grafo grande, cada fetch puede tardar 5-10s. Regla:',
            '    esperar el panel con timeout de 25s, y aceptar el toast',
            '    como señal alternativa (el toast aparece antes). Si el',
            '    toast aparece pero el panel no, hacer una espera corta',
            '    extra para que el panel termine de aparecer y',
            '    `obtener_id_ultima_venta` lo pueda cerrar.',
        ],
        'reemplazar' => [
            '43. **El flujo de confirmación de venta tiene dos fetch',
            '    en serie.** Después de mostrar el toast "Venta',
            '    confirmada", el piloto hace `solicitar_estado_asientos`',
            '    y después `refrescar_contadores_viaje_actual`, y recién',
            '    después muestra el panel `#opciones_impresion`. Con el',
            '    grafo grande, cada fetch puede tardar 5-10s. Regla:',
            '    esperar el panel con timeout de 25s, y aceptar el toast',
            '    como señal alternativa (el toast aparece antes). Si el',
            '    toast aparece pero el panel no, hacer una espera corta',
            '    extra para que el panel termine de aparecer y',
            '    `obtener_id_ultima_venta` lo pueda cerrar.',
            '44. **Los timeouts largos son una curita, no una solución.**',
            '    Cada vez que subimos timeouts (5b, 5c, 5d) es porque el',
            '    piloto se puso más lento por acumulación de datos en el',
            '    grafo. La causa raíz está en `formatear_viaje` del',
            '    piloto: escala con V × W (viajes × ventas), porque por',
            '    cada viaje recorre todas las ventas del dueño dos veces',
            '    (`viaje_tiene_ventas` y `vendidos_por_micro`). Con 21',
            '    viajes × 24 ventas, eso son ~500 iteraciones por cada',
            '    listado. La limpieza de viajes de prueba (v74n del',
            '    piloto) alivia el problema. La optimización real',
            '    (índice de ventas por viaje, cacheo de contadores) es',
            '    una tanda aparte del piloto. Regla del plugin: aceptar',
            '    timeouts largos como paliativo, pero anotar la causa',
            '    raíz cuando se identifique.',
        ],
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §9 cabecera
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §9 cabecera bump a 5d',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.5c (suben',
            'los timeouts del flujo de venta. `confirmar_venta` espera',
            'hasta 25s al panel `#opciones_impresion` y acepta el toast',
            '"Venta confirmada" como señal alternativa. `abrir_modal_confirmacion`',
            '15s, botón Vender 12s. Nuevo aprendizaje 43).',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.5d (suben',
            'los timeouts del listado de viajes: 40s para la lista, 30s',
            'para el modal del viaje y 30s para los micros. Paliativo',
            'mientras el piloto se aliviana con la limpieza de viajes de',
            'prueba (v74n del piloto). Nuevo aprendizaje 44: la causa',
            'raíz está en `formatear_viaje` del piloto, que escala con',
            'V × W).',
            'Antes: v1.5plugin.5c (suben',
            'los timeouts del flujo de venta. `confirmar_venta` espera',
            'hasta 25s al panel `#opciones_impresion` y acepta el toast',
            '"Venta confirmada" como señal alternativa. `abrir_modal_confirmacion`',
            '15s, botón Vender 12s. Nuevo aprendizaje 43).',
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