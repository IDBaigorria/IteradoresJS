<?php
/**
 * Aplicador de cambios — Proyecto iteradoresJS (plugin de pruebas).
 *
 * Tanda V1.5plugin.6l (fix real de la prueba 65).
 *   - prueba_65: buscar el botón "Ver pasajes" del pasajero
 *     correcto por `data-dni`, sin depender del filtro de la
 *     tabla de Clientes. El filtro no se aplica porque
 *     `ctx.escribir` no dispara el evento `input`.
 *
 * Uso (parado en iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_65_cambiar_asiento_desde_clientes.js',
        'descripcion' => 'prueba 65: buscar botón por data-dni',
        'buscar' => [
            '            // 4. Buscar el DNI del pasajero en el filtro.',
            '            const input = await ctx.esperar_visible("#buscar_pasajero", 8000);',
            '            if (!input || !input.exito) {',
            '                throw new Error("No aparece el buscador de pasajeros");',
            '            }',
            '            await ctx.escribir("#buscar_pasajero", dni_pasajero);',
            '',
            '            // 5. Esperar el botón "Ver pasajes" del pasajero.',
            '            const inicio_ver = Date.now();',
            '            let boton_ver = null;',
            '            while (Date.now() - inicio_ver < 15000) {',
            '                const r = await ctx.esperar_visible(".ver_pasajes_pasajero", 500);',
            '                if (r && r.exito) { boton_ver = true; break; }',
            '                await ctx.pausa(300);',
            '            }',
            '            ctx.assert(boton_ver,',
            '                "No aparece el botón Ver pasajes para el DNI " + dni_pasajero',
            '                + ". ¿La venta no es activa, o el pasajero no se cargó?");',
            '',
            '            await ctx.clic(".ver_pasajes_pasajero");',
        ],
        'reemplazar' => [
            '            // 4. Asegurar que la tabla de Clientes esté cargada.',
            '            //    No filtramos por el input de búsqueda: el helper',
            '            //    `ctx.escribir` asigna el value pero no dispara el',
            '            //    evento `input`, así que el listener de',
            '            //    `pasajeros.js` no corre y la tabla queda con',
            '            //    TODOS los pasajeros. Por eso buscamos el botón',
            '            //    directamente por su `data-dni` (que es único).',
            '            const input = await ctx.esperar_visible("#buscar_pasajero", 8000);',
            '            if (!input || !input.exito) {',
            '                throw new Error("No aparece el buscador de pasajeros");',
            '            }',
            '            await ctx.escribir("#buscar_pasajero", dni_pasajero);',
            '',
            '            // 5. Esperar el botón "Ver pasajes" del pasajero',
            '            //    correcto, por su data-dni.',
            '            const selector_ver = `.ver_pasajes_pasajero[data-dni="${dni_pasajero}"]`;',
            '            const inicio_ver = Date.now();',
            '            let boton_ver = null;',
            '            while (Date.now() - inicio_ver < 15000) {',
            '                const r = await ctx.esperar_visible(selector_ver, 500);',
            '                if (r && r.exito) { boton_ver = true; break; }',
            '                await ctx.pausa(300);',
            '            }',
            '            ctx.assert(boton_ver,',
            '                "No aparece el botón Ver pasajes para el DNI " + dni_pasajero',
            '                + ". ¿La venta no es activa, o el pasajero no se cargó?");',
            '',
            '            await ctx.clic(selector_ver);',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_65_cambiar_asiento_desde_clientes.js',
        'descripcion' => 'prueba 65: bump a 1.5plugin.6l',
        'buscar' => [
            ' * @version 1.5plugin.6k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.6l',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'ConfiguracionApli: VERSION_APP a 6l',
        'buscar' => [
            'export const VERSION_APP = "1.5plugin.6k";',
        ],
        'reemplazar' => [
            'export const VERSION_APP = "1.5plugin.6l";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'ConfiguracionApli: VERSION_PLUGIN a 6l',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.6k";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.6l";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'ConfiguracionApli: bump @version a 6l',
        'buscar' => [
            ' * @version 1.5plugin.6k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.6l',
        ],
    ],

    // ============================================================
    // 6. prompt_plugin_piloto.md — nueva lección 53
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'plugin: agregar lección 53',
        'buscar' => [
            '52. **Polling activo en lugar de pausas fijas.** Los',
            '    modales del piloto hacen varios fetches en serie',
            '    antes de renderizar. Una pausa fija de 1.5s o 3s',
            '    puede quedarse corta con un grafo grande. Regla:',
            '    esperar activamente por el efecto deseado (que',
            '    aparezca el elemento, que se habilite el botón, que',
            '    la clase esperada esté presente) con un timeout',
            '    holgado (15-25s), y fallar con un mensaje claro si',
            '    no llega.',
        ],
        'reemplazar' => [
            '52. **Polling activo en lugar de pausas fijas.** Los',
            '    modales del piloto hacen varios fetches en serie',
            '    antes de renderizar. Una pausa fija de 1.5s o 3s',
            '    puede quedarse corta con un grafo grande. Regla:',
            '    esperar activamente por el efecto deseado (que',
            '    aparezca el elemento, que se habilite el botón, que',
            '    la clase esperada esté presente) con un timeout',
            '    holgado (15-25s), y fallar con un mensaje claro si',
            '    no llega.',
            '',
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
    ],

    // ============================================================
    // 7. prompt_plugin_piloto.md — §9 última actualización a 6l
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'plugin: §9 última actualización a 6l',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.6i',
            '(prueba 65: cambiar de asiento desde Clientes).',
        ],
        'reemplazar' => [
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
echo "[INFO] $total_reemplazos reemplazo(s) en " . count($reemplazos_por_archivo) . " archivo(s).\n\n";
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
        $ocurrencias = contar_ocurrencias($contenido, $buscar_str);
        if ($ocurrencias === 0) { $bloques_fallidos[] = "$archivo_rel: NO ENCONTRADO - {$cambio['descripcion']}"; $hubo_error = true; continue; }
        if ($ocurrencias > 1) { $bloques_fallidos[] = "$archivo_rel: AMBIGUO ($ocurrencias) - {$cambio['descripcion']}"; $hubo_error = true; continue; }
        $contenido = str_replace($buscar_str, $reemplazar_str, $contenido);
        $bloques_ok++;
    }
    if (!$hubo_error && $contenido !== $contenido_antes) $archivos_a_escribir[$ruta_abs] = normalizar_a_original($contenido, $eol);
}
if ($modo_estricto && !empty($bloques_fallidos)) { echo "=== ABORTADO ===\n"; foreach ($bloques_fallidos as $f) echo "  [FALLO] $f\n"; exit(1); }
foreach ($archivos_a_escribir as $ruta_abs => $contenido_final) {
    if (file_put_contents($ruta_abs, $contenido_final) === false) { echo "[FALLO] Escribir: " . substr($ruta_abs, strlen($raiz_proyecto)+1) . "\n"; continue; }
    echo "[OK] " . substr($ruta_abs, strlen($raiz_proyecto)+1) . "\n";
}
foreach ($creaciones as $c) { $r = $raiz_proyecto.'/'.$c['archivo']; if (!is_dir(dirname($r))) mkdir(dirname($r), 0777, true); if (file_put_contents($r, implode("\n", $c['contenido']))===false){echo "[FALLO] Crear: {$c['archivo']}\n";continue;} echo "[OK] {$c['archivo']} (creado)\n"; }
echo "\n=== Resumen ===\nBloques aplicados: $bloques_ok\nArchivos nuevos:   " . count($creaciones) . "\n";
if (!empty($bloques_fallidos)) { echo "Fallos: " . count($bloques_fallidos) . "\n"; foreach ($bloques_fallidos as $f) echo "  - $f\n"; }
echo "\nListo.\n";