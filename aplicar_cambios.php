<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda v1.5plugin.4c — fix de timing en seleccion de asientos.
 *
 * Problema: `seleccionar_n_asientos` hacia clic y esperaba 300ms
 * fijos. Entre el clic y la aparicion del boton Vender hay un fetch
 * al backend (`seleccionar_asiento`), que a veces tarda mas. Con 2
 * o mas asientos, el segundo clic podia pisar el primero. La prueba
 * `venta_cuotas` fallaba intermitentemente con "No aparecio el boton
 * Vender".
 *
 * Fix: despues de cada clic, esperar a que el asiento pase a
 * `seat-seleccionado-propio` (con timeout). Recien al final esperar
 * el boton Vender.
 *
 * Uso (parado en iteradoresJS/):
 *   php aplicar_cambios.php
 */

// ============================================================
// Configuración
// ============================================================

$modo_estricto = true;
$raiz_proyecto = __DIR__;

// ============================================================
// Cambios a aplicar
// ============================================================

$cambios = [

    // ============================================================
    // Aplicacion/pruebas/_helpers.js
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: bump a 1.5plugin.4c',
        'buscar' => [
            ' * @version 1.5plugin.4b',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4c',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: seleccionar_n_asientos espera a que cada asiento este seleccionado',
        'buscar' => [
            'export async function seleccionar_n_asientos(ctx, n) {',
            '    const libres = await ctx.obtener_atributos(".seat.seat-libre", "data-numero");',
            '    if (libres.length < n) {',
            '        throw new Error("Solo hay " + libres.length + " asientos libres, se necesitan " + n);',
            '    }',
            '    const elegidos = libres.slice(0, n);',
            '    for (const numero of elegidos) {',
            '        await ctx.clic(`.seat[data-numero="${numero}"]`);',
            '        await ctx.pausa(300);',
            '    }',
            '    const boton = await ctx.esperar_visible("#contenedor_boton_confirmar_venta", 5000);',
            '    if (!boton || !boton.exito) throw new Error("No aparecio el boton Vender");',
            '    return elegidos;',
            '}',
        ],
        'reemplazar' => [
            '// Espera a que un asiento tenga la clase "seat-seleccionado-propio".',
            '// El piloto hace un fetch al backend por cada clic, que puede',
            '// tardar mas de lo que dura un ciclo de UI. Sin esta espera,',
            '// clics consecutivos pueden pisarse.',
            'async function esperar_asiento_seleccionado(ctx, numero, timeout_ms = 5000) {',
            '    const inicio = Date.now();',
            '    while (Date.now() - inicio < timeout_ms) {',
            '        const clases = await ctx.obtener_atributos(`.seat[data-numero="${numero}"]`, "class");',
            '        if (clases.length > 0 && String(clases[0]).indexOf("seat-seleccionado-propio") !== -1) {',
            '            return true;',
            '        }',
            '        await ctx.pausa(150);',
            '    }',
            '    return false;',
            '}',
            '',
            'export async function seleccionar_n_asientos(ctx, n) {',
            '    const libres = await ctx.obtener_atributos(".seat.seat-libre", "data-numero");',
            '    if (libres.length < n) {',
            '        throw new Error("Solo hay " + libres.length + " asientos libres, se necesitan " + n);',
            '    }',
            '    const elegidos = libres.slice(0, n);',
            '    for (const numero of elegidos) {',
            '        await ctx.clic(`.seat[data-numero="${numero}"]`);',
            '        const ok = await esperar_asiento_seleccionado(ctx, numero, 5000);',
            '        if (!ok) throw new Error("El asiento " + numero + " no quedo seleccionado");',
            '    }',
            '    const boton = await ctx.esperar_visible("#contenedor_boton_confirmar_venta", 5000);',
            '    if (!boton || !boton.exito) throw new Error("No aparecio el boton Vender");',
            '    return elegidos;',
            '}',
        ],
    ],

    // ============================================================
    // Bumps varios
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: bump a 1.5plugin.4c',
        'buscar' => [
            ' * @version 1.5plugin.4b',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4c',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_APP a 1.5plugin.4c',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.4b";',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.4c";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_PLUGIN a 1.5plugin.4c',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4b";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4c";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'contenido.js: bump a 1.5plugin.4c',
        'buscar' => [
            ' * @version 1.5plugin.4b',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4c',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: bump a 1.5plugin.4c',
        'buscar' => [
            ' * @version 1.5plugin.4b',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4c',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo.js: bump a 1.5plugin.4c',
        'buscar' => [
            ' * @version 1.5plugin.4b',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4c',
        ],
    ],

    // ============================================================
    // prompts/prompt_plugin_piloto.md
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: bump a v1.5plugin.4c',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.4b (fix de',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.4c (fix de',
            'timing en `seleccionar_n_asientos`: después de cada clic espera',
            'a que el asiento pase a `seat-seleccionado-propio`. Antes',
            'esperaba 300 ms fijos y con 2+ asientos el segundo clic podía',
            'pisar el primero, fallando con "No apareció el botón Vender").',
            'Antes: v1.5plugin.4b (fix de',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: leccion de polling vs timeouts fijos',
        'buscar' => [
            '- **Los datos generados por el plugin deben pasar los validadores',
        ],
        'reemplazar' => [
            '- **Evitar timeouts fijos entre acciones del piloto.** El piloto',
            '  hace un `fetch` por cada clic en un asiento. Los `pausa(300)`',
            '  fijos no alcanzan cuando el fetch tarda más. En cambio,',
            '  esperar a que el DOM refleje el cambio (polling de clase o',
            '  atributo). Bug en v1.5plugin.4: `seleccionar_n_asientos`',
            '  fallaba intermitentemente. Fix en v1.5plugin.4c:',
            '  `esperar_asiento_seleccionado` hace polling de la clase',
            '  `seat-seleccionado-propio` con timeout de 5 s.',
            '- **Los datos generados por el plugin deben pasar los validadores',
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