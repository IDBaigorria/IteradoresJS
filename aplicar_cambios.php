<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda v1.5plugin.4l (v3) — acceder a variables del page sin window.
 * Anclas con la indentación exacta del archivo real.
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
    // Aplicacion/servicio.js
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: bump a 1.5plugin.4l',
        'buscar' => [
            ' * @version 1.5plugin.4k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4l',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: chequeo de viaje y micro sin window.',
        'buscar' => [
            '            if (!window.viaje_seleccionado || !window.micro_seleccionado) {',
            '                return { exito: false, error: "sin viaje o micro abierto" };',
            '            }',
        ],
        'reemplazar' => [
            '            if (typeof viaje_seleccionado === "undefined" || !viaje_seleccionado) {',
            '                return { exito: false, error: "sin viaje abierto" };',
            '            }',
            '            if (typeof micro_seleccionado === "undefined" || !micro_seleccionado) {',
            '                return { exito: false, error: "sin micro abierto" };',
            '            }',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: const viaje sin window',
        'buscar' => [
            '            const viaje = window.viaje_seleccionado;',
        ],
        'reemplazar' => [
            '            const viaje = viaje_seleccionado;',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: const micro sin window',
        'buscar' => [
            '            const micro = window.micro_seleccionado;',
        ],
        'reemplazar' => [
            '            const micro = micro_seleccionado;',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: asignacion de estados_asientos_actuales sin window',
        'buscar' => [
            '                window.estados_asientos_actuales = datos.asientos;',
        ],
        'reemplazar' => [
            '                estados_asientos_actuales = datos.asientos;',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: chequeo de actualizar_colores_asientos sin window',
        'buscar' => [
            '                if (typeof window.actualizar_colores_asientos === "function") {',
        ],
        'reemplazar' => [
            '                if (typeof actualizar_colores_asientos === "function") {',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: llamada a actualizar_colores_asientos sin window',
        'buscar' => [
            '                    window.actualizar_colores_asientos(datos.asientos);',
        ],
        'reemplazar' => [
            '                    actualizar_colores_asientos(datos.asientos);',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: chequeo de refrescar_info_asientos_propios sin window',
        'buscar' => [
            '                if (typeof window.refrescar_info_asientos_propios === "function") {',
        ],
        'reemplazar' => [
            '                if (typeof refrescar_info_asientos_propios === "function") {',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: llamada a refrescar_info_asientos_propios sin window',
        'buscar' => [
            '                    window.refrescar_info_asientos_propios(true);',
        ],
        'reemplazar' => [
            '                    refrescar_info_asientos_propios(true);',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: usuario_actual sin window',
        'buscar' => [
            '                                const usuario = window.usuario_actual;',
            '                                if (!usuario) return { exito: false, error: "sin usuario_actual en el page" };',
        ],
        'reemplazar' => [
            '                                if (typeof usuario_actual === "undefined" || !usuario_actual) {',
            '                                    return { exito: false, error: "sin usuario_actual en el page" };',
            '                                }',
            '                                const usuario = usuario_actual;',
        ],
    ],

    // ============================================================
    // Bumps varios
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: bump a 1.5plugin.4l',
        'buscar' => [
            ' * @version 1.5plugin.4k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4l',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_APP a 1.5plugin.4l',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.4k";',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.4l";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_PLUGIN a 1.5plugin.4l',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4k";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4l";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'contenido.js: bump a 1.5plugin.4l',
        'buscar' => [
            ' * @version 1.5plugin.4k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4l',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo.js: bump a 1.5plugin.4l',
        'buscar' => [
            ' * @version 1.5plugin.4k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4l',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: bump a 1.5plugin.4l',
        'buscar' => [
            ' * @version 1.5plugin.4k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4l',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_04_venta_cuotas.js',
        'descripcion' => 'prueba_04: bump a 1.5plugin.4l',
        'buscar' => [
            ' * @version 1.5plugin.4k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4l',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_08_venta_ligadura_dni_igual.js',
        'descripcion' => 'prueba_08: bump a 1.5plugin.4l',
        'buscar' => [
            ' * @version 1.5plugin.4k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4l',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_09_venta_comprador_lleno_pasajero_vacio.js',
        'descripcion' => 'prueba_09: bump a 1.5plugin.4l',
        'buscar' => [
            ' * @version 1.5plugin.4k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4l',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_10_venta_dni_duplicado.js',
        'descripcion' => 'prueba_10: bump a 1.5plugin.4l',
        'buscar' => [
            ' * @version 1.5plugin.4k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4l',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_11_venta_correccion_dni_pasajero.js',
        'descripcion' => 'prueba_11: bump a 1.5plugin.4l',
        'buscar' => [
            ' * @version 1.5plugin.4k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4l',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_12_venta_correccion_dni_comprador.js',
        'descripcion' => 'prueba_12: bump a 1.5plugin.4l',
        'buscar' => [
            ' * @version 1.5plugin.4k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4l',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_13_venta_monto_mayor_total.js',
        'descripcion' => 'prueba_13: bump a 1.5plugin.4l',
        'buscar' => [
            ' * @version 1.5plugin.4k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4l',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_14_venta_monto_cero.js',
        'descripcion' => 'prueba_14: bump a 1.5plugin.4l',
        'buscar' => [
            ' * @version 1.5plugin.4k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4l',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_15_venta_sin_comprador.js',
        'descripcion' => 'prueba_15: bump a 1.5plugin.4l',
        'buscar' => [
            ' * @version 1.5plugin.4k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4l',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_16_venta_cancelar_reabrir.js',
        'descripcion' => 'prueba_16: bump a 1.5plugin.4l',
        'buscar' => [
            ' * @version 1.5plugin.4k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4l',
        ],
    ],

    // ============================================================
    // prompts/prompt_plugin_piloto.md
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: bump a v1.5plugin.4l',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.4k (crear',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.4l (acceder',
            'a variables del page sin `window.`. Las variables top-level',
            'del piloto (`usuario_actual`, `viaje_seleccionado`,',
            '`micro_seleccionado`, `estados_asientos_actuales`) están',
            'declaradas con `let`, que NO crea propiedades en `window`.',
            'Hay que accederlas directamente y chequear con `typeof`.',
            'Además: el refresh de asientos de v4g nunca funcionó,',
            'retornaba "sin viaje o micro abierto" en silencio).',
            'Antes: v1.5plugin.4k (crear',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: leccion sobre let y window',
        'buscar' => [
            '- **No adivinar nombres de usuario ni datos del entorno.** El',
        ],
        'reemplazar' => [
            '- **`let`/`const` top-level NO crean propiedades en `window`.**',
            '  En el page del piloto, `usuario_actual`, `viaje_seleccionado`,',
            '  `micro_seleccionado` y `estados_asientos_actuales` están',
            '  declaradas con `let`. `window.usuario_actual` es `undefined`',
            '  aunque la variable exista. En código inyectado por',
            '  `chrome.scripting.executeScript` en `world: "MAIN"`, hay',
            '  que accederlas directamente (`usuario_actual`, no',
            '  `window.usuario_actual`) y chequear con `typeof X !==',
            '  "undefined"` por si no están en el scope. Bug en',
            '  v1.5plugin.4k: `crear_pasajero_de_prueba` usaba',
            '  `window.usuario_actual`. Bug latente en v1.5plugin.4g:',
            '  `_refresh_asientos_main_world` usaba `window.viaje_seleccionado`,',
            '  retornando error silencioso desde entonces.',
            '- **No adivinar nombres de usuario ni datos del entorno.** El',
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