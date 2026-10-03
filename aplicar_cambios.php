<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda v1.5plugin.4e — reintento defensivo en seleccion de asientos.
 *
 * Problema: `seleccionar_n_asientos` fallaba intermitentemente con
 * "El asiento N no quedo seleccionado". Causa raiz: condicion de
 * carrera en el piloto entre el polling de asientos y el clic
 * (corregida en piloto v1.5piloto.74e). Igual, el plugin debe ser
 * robusto: si por algun motivo el asiento no queda seleccionado al
 * primer intento, reintentar (con verificacion de "ya esta
 * seleccionado" para no deseleccionar).
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
        'descripcion' => '_helpers.js: bump a 1.5plugin.4e',
        'buscar' => [
            ' * @version 1.5plugin.4d',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4e',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: seleccionar_n_asientos con reintentos',
        'buscar' => [
            'export async function seleccionar_n_asientos(ctx, n) {',
            '    // Esperar a que aparezcan N asientos libres (puede tardar si el',
            '    // croquis no se actualizo tras una cancelacion previa).',
            '    const libres = await esperar_n_asientos_libres(ctx, n, 10000);',
            '    if (libres.length < n) {',
            '        throw new Error("Solo hay " + libres.length + " asientos libres, se necesitan " + n);',
            '    }',
            '    const elegidos = libres.slice(0, n);',
            '    for (const numero of elegidos) {',
            '        // Verificar que el asiento este efectivamente libre antes',
            '        // de hacer clic. Si no, esperar a que el croquis se',
            '        // actualice (por ejemplo, por el polling del piloto o',
            '        // por un refresh manual).',
            '        const libre = await esperar_asiento_libre(ctx, numero, 8000);',
            '        if (!libre) throw new Error("El asiento " + numero + " no aparece como libre en el croquis");',
            '        await ctx.clic(`.seat[data-numero="${numero}"]`);',
            '        const ok = await esperar_asiento_seleccionado(ctx, numero, 5000);',
            '        if (!ok) throw new Error("El asiento " + numero + " no quedo seleccionado");',
            '    }',
            '    const boton = await ctx.esperar_visible("#contenedor_boton_confirmar_venta", 5000);',
            '    if (!boton || !boton.exito) throw new Error("No aparecio el boton Vender");',
            '    return elegidos;',
            '}',
        ],
        'reemplazar' => [
            '// Selecciona un asiento con reintentos. A veces el primer clic no',
            '// queda registrado en el DOM (condicion de carrera con el polling',
            '// del piloto, corregida en piloto v1.5piloto.74e, pero igual el',
            '// plugin debe ser robusto). Reintenta hasta `max_intentos` veces.',
            '// Verifica primero si ya esta seleccionado para no deseleccionarlo.',
            'async function seleccionar_un_asiento_con_reintentos(ctx, numero, max_intentos = 3) {',
            '    for (let intento = 0; intento < max_intentos; intento++) {',
            '        // Si ya quedo seleccionado de un intento anterior, listo.',
            '        const ya_seleccionado = await esperar_asiento_seleccionado(ctx, numero, 500);',
            '        if (ya_seleccionado) return true;',
            '',
            '        // Verificar que el asiento este libre antes de hacer clic.',
            '        const libre = await esperar_asiento_libre(ctx, numero, 5000);',
            '        if (!libre) {',
            '            // El croquis todavia no se actualizo o el asiento esta en',
            '            // otro estado. Esperar un poco y reintentar.',
            '            await ctx.pausa(600);',
            '            continue;',
            '        }',
            '',
            '        await ctx.clic(`.seat[data-numero="${numero}"]`);',
            '        const ok = await esperar_asiento_seleccionado(ctx, numero, 4000);',
            '        if (ok) return true;',
            '    }',
            '    return false;',
            '}',
            '',
            'export async function seleccionar_n_asientos(ctx, n) {',
            '    // Esperar a que aparezcan N asientos libres (puede tardar si el',
            '    // croquis no se actualizo tras una cancelacion previa).',
            '    const libres = await esperar_n_asientos_libres(ctx, n, 10000);',
            '    if (libres.length < n) {',
            '        throw new Error("Solo hay " + libres.length + " asientos libres, se necesitan " + n);',
            '    }',
            '    const elegidos = libres.slice(0, n);',
            '    for (const numero of elegidos) {',
            '        const ok = await seleccionar_un_asiento_con_reintentos(ctx, numero, 3);',
            '        if (!ok) throw new Error("El asiento " + numero + " no quedo seleccionado tras 3 intentos");',
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
        'descripcion' => 'ConfPlugin.js: bump a 1.5plugin.4e',
        'buscar' => [
            ' * @version 1.5plugin.4d',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4e',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_APP a 1.5plugin.4e',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.4d";',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.4e";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_PLUGIN a 1.5plugin.4e',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4d";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4e";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'contenido.js: bump a 1.5plugin.4e',
        'buscar' => [
            ' * @version 1.5plugin.4d',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4e',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: bump a 1.5plugin.4e',
        'buscar' => [
            ' * @version 1.5plugin.4d',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4e',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo.js: bump a 1.5plugin.4e',
        'buscar' => [
            ' * @version 1.5plugin.4d',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4e',
        ],
    ],

    // ============================================================
    // prompts/prompt_plugin_piloto.md
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: bump a v1.5plugin.4e',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.4d (robustez',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.4e (reintento',
            'defensivo en `seleccionar_un_asiento_con_reintentos`: si un',
            'clic no queda registrado en el DOM al primer intento,',
            'reintenta hasta 3 veces. Verifica primero si ya está',
            'seleccionado, para no deseleccionar. Causa raíz del fallo:',
            'condición de carrera en el piloto entre el polling de asientos',
            'y el clic (corregida en piloto v1.5piloto.74e). Antes: v1.5plugin.4d (robustez',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: leccion de reintentos',
        'buscar' => [
            '- **El plugin debe ser robusto ante bugs del piloto.** Cuando',
        ],
        'reemplazar' => [
            '- **Cuando un clic puede perderse por condiciones de carrera**',
            '  **del piloto, usar reintentos con verificación previa.** El',
            '  bug del polling de asientos (v1.5piloto.74e) hacía que un',
            '  asiento recién seleccionado volviera a verse libre. Si el',
            '  clic se da por perdido, reintentar; pero antes verificar si',
            '  ya está seleccionado, para no deseleccionar por accidente.',
            '- **El plugin debe ser robusto ante bugs del piloto.** Cuando',
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