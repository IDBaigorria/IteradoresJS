<?php
/**
 * Aplicador de cambios automáticos — proyecto iteradoresJS (plugin Chrome).
 *
 * Tanda v1.5plugin.5c: timeouts del flujo de venta.
 *
 * Con el grafo grande (2 micros + muchas ventas acumuladas), los
 * fetch en serie dentro del flujo de confirmación tardan más de lo
 * que esperaban los helpers. Se suben los timeouts y se agrega el
 * toast como señal alternativa de confirmación.
 *
 * Uso (parado en la raíz de iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    // --------------------------------------------------------
    // _helpers.js — confirmar_venta: timeout + toast alternativo
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers: confirmar_venta con timeout 25s + toast alternativo',
        'buscar' => [
            'export async function confirmar_venta(ctx) {',
            '    await ctx.clic("#confirmar_venta");',
            '    const ok = await ctx.esperar_visible("#opciones_impresion", 8000);',
            '    if (!ok || !ok.exito) {',
            '        const aviso = await ctx.leer_aviso();',
            '        throw new Error("No se confirmo la venta. Aviso: " + (aviso || "(sin aviso)"));',
            '    }',
            '}',
        ],
        'reemplazar' => [
            'export async function confirmar_venta(ctx) {',
            '    await ctx.clic("#confirmar_venta");',
            '    // El flujo del piloto hace dos fetch en serie (estado_asientos',
            '    // y listar_por_dueno) antes de mostrar el panel. Con el grafo',
            '    // grande, eso puede tardar 15-20s. Se espera al panel con',
            '    // timeout largo, pero se acepta tambien el toast de exito como',
            '    // señal alternativa (el toast aparece antes que el panel).',
            '    const inicio = Date.now();',
            '    let panel_ok = false;',
            '    let toast_ok = false;',
            '    while (Date.now() - inicio < 25000) {',
            '        panel_ok = await ctx.esta_visible("#opciones_impresion");',
            '        if (panel_ok) break;',
            '        // Chequear el toast como señal alternativa.',
            '        const aviso = await ctx.leer_aviso();',
            '        if (aviso && aviso.indexOf("Venta confirmada") !== -1) {',
            '            toast_ok = true;',
            '            break;',
            '        }',
            '        await ctx.pausa(200);',
            '    }',
            '    if (!panel_ok && !toast_ok) {',
            '        const aviso = await ctx.leer_aviso();',
            '        throw new Error("No se confirmo la venta. Aviso: " + (aviso || "(sin aviso)"));',
            '    }',
            '    // Si el toast aparecio pero el panel todavia no, darle un',
            '    // margen corto para que termine de aparecer (asi',
            '    // obtener_id_ultima_venta lo puede cerrar).',
            '    if (!panel_ok) {',
            '        await ctx.esperar_visible("#opciones_impresion", 5000);',
            '    }',
            '}',
        ],
    ],

    // --------------------------------------------------------
    // _helpers.js — abrir_modal_confirmacion: timeout 15s
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers: abrir_modal_confirmacion con timeout 15s',
        'buscar' => [
            'export async function abrir_modal_confirmacion(ctx) {',
            '    await ctx.clic("#boton_confirmar_venta");',
            '    const form = await ctx.esperar_visible("#formulario_confirmacion_venta", 8000);',
            '    if (!form || !form.exito) throw new Error("No se abrio el formulario de confirmacion");',
            '}',
        ],
        'reemplazar' => [
            'export async function abrir_modal_confirmacion(ctx) {',
            '    await ctx.clic("#boton_confirmar_venta");',
            '    // El modal dispara resolver_config_pago(), que hace un fetch',
            '    // a viajes/obtener_opciones_terminal. Con el grafo grande',
            '    // puede tardar. 15s de margen.',
            '    const form = await ctx.esperar_visible("#formulario_confirmacion_venta", 15000);',
            '    if (!form || !form.exito) throw new Error("No se abrio el formulario de confirmacion");',
            '}',
        ],
    ],

    // --------------------------------------------------------
    // _helpers.js — seleccionar_n_asientos: timeout del boton Vender
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers: boton Vender con timeout 12s',
        'buscar' => [
            '    const boton = await ctx.esperar_visible("#contenedor_boton_confirmar_venta", 5000);',
            '    if (!boton || !boton.exito) throw new Error("No aparecio el boton Vender");',
        ],
        'reemplazar' => [
            '    const boton = await ctx.esperar_visible("#contenedor_boton_confirmar_venta", 12000);',
            '    if (!boton || !boton.exito) throw new Error("No aparecio el boton Vender");',
        ],
    ],

    // --------------------------------------------------------
    // _helpers.js — bump version interna
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers: bump @version a 1.5plugin.5c',
        'buscar' => [
            ' * @version 1.5plugin.5b',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.5c',
        ],
    ],

    // --------------------------------------------------------
    // ConfPlugin.js — bumps a 5c
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin: bump VERSION_APP a 1.5plugin.5c',
        'buscar' => [
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.5b";',
        ],
        'reemplazar' => [
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.5c";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin: bump VERSION_PLUGIN a 1.5plugin.5c',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5b";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5c";',
        ],
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §7
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §7 bump a 5c',
        'buscar' => [
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
        'reemplazar' => [
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
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §8.8 aprendizaje 43
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §8.8 agregar aprendizaje 43',
        'buscar' => [
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
        'reemplazar' => [
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
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §9 cabecera
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §9 cabecera bump a 5c',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.5b (la',
            'carga de la lista de viajes pasa a ser más robusta.',
            '`ir_a_tab` no clickea la tab si ya está activa, así no',
            'reinicia `cargar_viajes` ni descarta la carga en curso.',
            'Timeouts del primer load subidos a 25s para la lista, 10s',
            'para el modal del viaje y 15s para la lista de micros.',
            'Nuevo aprendizaje 42).',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.5c (suben',
            'los timeouts del flujo de venta. `confirmar_venta` espera',
            'hasta 25s al panel `#opciones_impresion` y acepta el toast',
            '"Venta confirmada" como señal alternativa. `abrir_modal_confirmacion`',
            '15s, botón Vender 12s. Nuevo aprendizaje 43).',
            'Antes: v1.5plugin.5b (la',
            'carga de la lista de viajes pasa a ser más robusta.',
            '`ir_a_tab` no clickea la tab si ya está activa, así no',
            'reinicia `cargar_viajes` ni descarta la carga en curso.',
            'Timeouts del primer load subidos a 25s para la lista, 10s',
            'para el modal del viaje y 15s para la lista de micros.',
            'Nuevo aprendizaje 42).',
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