<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda v1.5plugin.4i — esperar valor en lugar de leer tras pausa fija.
 *
 * Problema: las pruebas de ligadura y de correccion de DNI leian
 * `ctx.valor(...)` una sola vez despues de una pausa fija de 800 ms.
 * Si el fetch del DNI tardaba mas, la copia todavia no habia ocurrido
 * y la prueba leia "" (aunque el usuario, mirando despues, ve el
 * valor).
 *
 * Fix: agregar helpers `esperar_valor` y `esperar_valor_vacio` que
 * hacen polling hasta que el valor sea el esperado o se agote el
 * timeout. Usarlos en las 4 pruebas afectadas.
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
    // Aplicacion/pruebas/_helpers.js — nuevos helpers
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: bump a 1.5plugin.4i',
        'buscar' => [
            ' * @version 1.5plugin.4h',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4i',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: helpers esperar_valor y esperar_valor_vacio',
        'buscar' => [
            'const _TEXTOS_REGISTRADO = ["actualizados", "actualizado"];',
            '',
            'function _aviso_esta_resuelto(texto) {',
        ],
        'reemplazar' => [
            'const _TEXTOS_REGISTRADO = ["actualizados", "actualizado"];',
            '',
            '// Espera a que el valor de un input sea exactamente el esperado.',
            '// Util cuando el valor se completa por un fetch asincrono y no',
            '// sabemos cuanto va a tardar.',
            'export async function esperar_valor(ctx, sel, valor_esperado, timeout_ms = 5000) {',
            '    const inicio = Date.now();',
            '    while (Date.now() - inicio < timeout_ms) {',
            '        const v = await ctx.valor(sel);',
            '        if (v === valor_esperado) return true;',
            '        await ctx.pausa(150);',
            '    }',
            '    return false;',
            '}',
            '',
            '// Espera a que el valor de un input quede vacio (o null).',
            'export async function esperar_valor_vacio(ctx, sel, timeout_ms = 5000) {',
            '    const inicio = Date.now();',
            '    while (Date.now() - inicio < timeout_ms) {',
            '        const v = await ctx.valor(sel);',
            '        if (v === "" || v === null) return true;',
            '        await ctx.pausa(150);',
            '    }',
            '    return false;',
            '}',
            '',
            'function _aviso_esta_resuelto(texto) {',
        ],
    ],

    // ============================================================
    // prueba_08: usar esperar_valor
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_08_venta_ligadura_dni_igual.js',
        'descripcion' => 'prueba_08: bump a 1.5plugin.4i',
        'buscar' => [
            ' * @version 1.5plugin.4',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4i',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_08_venta_ligadura_dni_igual.js',
        'descripcion' => 'prueba_08: importar esperar_valor',
        'buscar' => [
            '    abrir_modal_confirmacion, llenar_comprador, dni_unico',
            '} from "./_helpers.js";',
        ],
        'reemplazar' => [
            '    abrir_modal_confirmacion, llenar_comprador, dni_unico,',
            '    esperar_valor',
            '} from "./_helpers.js";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_08_venta_ligadura_dni_igual.js',
        'descripcion' => 'prueba_08: usar esperar_valor en lugar de leer una sola vez',
        'buscar' => [
            '        // Ahora el pasajero con el mismo DNI',
            '        await ctx.escribir("#pasajero_dni_0", dni_compartido);',
            '        await ctx.pausa(800);',
            '',
            '        const apellido_pas = await ctx.valor("#pasajero_apellido_0");',
            '        const nombres_pas = await ctx.valor("#pasajero_nombres_0");',
            '        const email_pas = await ctx.valor("#pasajero_email_0");',
            '        const celular_pas = await ctx.valor("#pasajero_celular_0");',
            '',
            '        ctx.assert(apellido_pas === "Garcia", "Apellido no se copio: " + JSON.stringify(apellido_pas));',
            '        ctx.assert(nombres_pas === "Maria", "Nombres no se copiaron: " + JSON.stringify(nombres_pas));',
            '        ctx.assert(email_pas === "maria@test.local", "Email no se copio: " + JSON.stringify(email_pas));',
            '        ctx.assert(celular_pas === "2983555111", "Celular no se copio: " + JSON.stringify(celular_pas));',
        ],
        'reemplazar' => [
            '        // Ahora el pasajero con el mismo DNI. La copia ocurre cuando',
            '        // vuelve el fetch del DNI del pasajero, que puede tardar.',
            '        await ctx.escribir("#pasajero_dni_0", dni_compartido);',
            '',
            '        ctx.assert(await esperar_valor(ctx, "#pasajero_apellido_0", "Garcia", 5000),',
            '            "Apellido no se copio");',
            '        ctx.assert(await esperar_valor(ctx, "#pasajero_nombres_0", "Maria", 5000),',
            '            "Nombres no se copiaron");',
            '        ctx.assert(await esperar_valor(ctx, "#pasajero_email_0", "maria@test.local", 5000),',
            '            "Email no se copio");',
            '        ctx.assert(await esperar_valor(ctx, "#pasajero_celular_0", "2983555111", 5000),',
            '            "Celular no se copio");',
        ],
    ],

    // ============================================================
    // prueba_09: usar esperar_valor
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_09_venta_comprador_lleno_pasajero_vacio.js',
        'descripcion' => 'prueba_09: bump a 1.5plugin.4i',
        'buscar' => [
            ' * @version 1.5plugin.4',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4i',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_09_venta_comprador_lleno_pasajero_vacio.js',
        'descripcion' => 'prueba_09: importar esperar_valor',
        'buscar' => [
            '    abrir_modal_confirmacion, llenar_pasajero, dni_unico',
            '} from "./_helpers.js";',
        ],
        'reemplazar' => [
            '    abrir_modal_confirmacion, llenar_pasajero, dni_unico,',
            '    esperar_valor',
            '} from "./_helpers.js";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_09_venta_comprador_lleno_pasajero_vacio.js',
        'descripcion' => 'prueba_09: usar esperar_valor',
        'buscar' => [
            '        // Ahora el comprador con el mismo DNI',
            '        await ctx.escribir("#comprador_dni", dni_compartido);',
            '        await ctx.pausa(800);',
            '',
            '        const apellido_comp = await ctx.valor("#comprador_apellido");',
            '        const nombres_comp = await ctx.valor("#comprador_nombres");',
            '        const email_comp = await ctx.valor("#comprador_email");',
            '        const celular_comp = await ctx.valor("#comprador_celular");',
            '',
            '        ctx.assert(apellido_comp === "Lopez", "Apellido no se copio: " + JSON.stringify(apellido_comp));',
            '        ctx.assert(nombres_comp === "Juan", "Nombres no se copiaron: " + JSON.stringify(nombres_comp));',
            '        ctx.assert(email_comp === "juan@test.local", "Email no se copio: " + JSON.stringify(email_comp));',
            '        ctx.assert(celular_comp === "2983555222", "Celular no se copio: " + JSON.stringify(celular_comp));',
        ],
        'reemplazar' => [
            '        // Ahora el comprador con el mismo DNI. La copia ocurre cuando',
            '        // vuelve el fetch del DNI del comprador, que puede tardar.',
            '        await ctx.escribir("#comprador_dni", dni_compartido);',
            '',
            '        ctx.assert(await esperar_valor(ctx, "#comprador_apellido", "Lopez", 5000),',
            '            "Apellido no se copio");',
            '        ctx.assert(await esperar_valor(ctx, "#comprador_nombres", "Juan", 5000),',
            '            "Nombres no se copiaron");',
            '        ctx.assert(await esperar_valor(ctx, "#comprador_email", "juan@test.local", 5000),',
            '            "Email no se copio");',
            '        ctx.assert(await esperar_valor(ctx, "#comprador_celular", "2983555222", 5000),',
            '            "Celular no se copio");',
        ],
    ],

    // ============================================================
    // prueba_11: usar esperar_valor y esperar_valor_vacio
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_11_venta_correccion_dni_pasajero.js',
        'descripcion' => 'prueba_11: bump a 1.5plugin.4i',
        'buscar' => [
            ' * @version 1.5plugin.4',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4i',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_11_venta_correccion_dni_pasajero.js',
        'descripcion' => 'prueba_11: importar esperar_valor y esperar_valor_vacio',
        'buscar' => [
            '    abrir_modal_confirmacion, crear_pasajero_de_prueba, dni_unico',
            '} from "./_helpers.js";',
        ],
        'reemplazar' => [
            '    abrir_modal_confirmacion, crear_pasajero_de_prueba, dni_unico,',
            '    esperar_valor, esperar_valor_vacio',
            '} from "./_helpers.js";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_11_venta_correccion_dni_pasajero.js',
        'descripcion' => 'prueba_11: usar esperar_valor y esperar_valor_vacio',
        'buscar' => [
            '        // Escribir el DNI registrado',
            '        await ctx.escribir("#pasajero_dni_0", dni_registrado);',
            '        await ctx.pausa(800);',
            '',
            '        const apellido = await ctx.valor("#pasajero_apellido_0");',
            '        ctx.assert(apellido === "Correccion", "No se autocompleto: " + JSON.stringify(apellido));',
            '',
            '        // Cambiar por un DNI no registrado',
            '        const dni_nuevo = dni_unico();',
            '        await ctx.escribir("#pasajero_dni_0", dni_nuevo);',
            '        await ctx.pausa(800);',
            '',
            '        const apellido_limpiado = await ctx.valor("#pasajero_apellido_0");',
            '        ctx.assert(apellido_limpiado === "" || apellido_limpiado === null,',
            '            "El apellido no se limpio: " + JSON.stringify(apellido_limpiado));',
        ],
        'reemplazar' => [
            '        // Escribir el DNI registrado. La autocompletada ocurre cuando',
            '        // vuelve el fetch, que puede tardar.',
            '        await ctx.escribir("#pasajero_dni_0", dni_registrado);',
            '        ctx.assert(await esperar_valor(ctx, "#pasajero_apellido_0", "Correccion", 5000),',
            '            "No se autocompleto el apellido del pasajero");',
            '',
            '        // Cambiar por un DNI no registrado. El piloto limpia los',
            '        // campos cuando vuelve el fetch del DNI nuevo.',
            '        const dni_nuevo = dni_unico();',
            '        await ctx.escribir("#pasajero_dni_0", dni_nuevo);',
            '        ctx.assert(await esperar_valor_vacio(ctx, "#pasajero_apellido_0", 5000),',
            '            "El apellido del pasajero no se limpio");',
        ],
    ],

    // ============================================================
    // prueba_12: usar esperar_valor y esperar_valor_vacio
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_12_venta_correccion_dni_comprador.js',
        'descripcion' => 'prueba_12: bump a 1.5plugin.4i',
        'buscar' => [
            ' * @version 1.5plugin.4',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4i',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_12_venta_correccion_dni_comprador.js',
        'descripcion' => 'prueba_12: importar esperar_valor y esperar_valor_vacio',
        'buscar' => [
            '    abrir_modal_confirmacion, crear_pasajero_de_prueba, dni_unico',
            '} from "./_helpers.js";',
        ],
        'reemplazar' => [
            '    abrir_modal_confirmacion, crear_pasajero_de_prueba, dni_unico,',
            '    esperar_valor, esperar_valor_vacio',
            '} from "./_helpers.js";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_12_venta_correccion_dni_comprador.js',
        'descripcion' => 'prueba_12: usar esperar_valor y esperar_valor_vacio',
        'buscar' => [
            '        // Escribir el DNI registrado en el comprador',
            '        await ctx.escribir("#comprador_dni", dni_registrado);',
            '        await ctx.pausa(800);',
            '',
            '        const apellido = await ctx.valor("#comprador_apellido");',
            '        ctx.assert(apellido === "CompradorPrueba", "No se autocompleto: " + JSON.stringify(apellido));',
            '',
            '        // Cambiar por uno no registrado',
            '        const dni_nuevo = dni_unico();',
            '        await ctx.escribir("#comprador_dni", dni_nuevo);',
            '        await ctx.pausa(800);',
            '',
            '        const apellido_limpiado = await ctx.valor("#comprador_apellido");',
            '        ctx.assert(apellido_limpiado === "" || apellido_limpiado === null,',
            '            "El apellido del comprador no se limpio: " + JSON.stringify(apellido_limpiado));',
        ],
        'reemplazar' => [
            '        // Escribir el DNI registrado en el comprador. La',
            '        // autocompletada ocurre cuando vuelve el fetch.',
            '        await ctx.escribir("#comprador_dni", dni_registrado);',
            '        ctx.assert(await esperar_valor(ctx, "#comprador_apellido", "CompradorPrueba", 5000),',
            '            "No se autocompleto el apellido del comprador");',
            '',
            '        // Cambiar por uno no registrado. El piloto limpia los',
            '        // campos cuando vuelve el fetch del DNI nuevo.',
            '        const dni_nuevo = dni_unico();',
            '        await ctx.escribir("#comprador_dni", dni_nuevo);',
            '        ctx.assert(await esperar_valor_vacio(ctx, "#comprador_apellido", 5000),',
            '            "El apellido del comprador no se limpio");',
        ],
    ],

    // ============================================================
    // Bumps varios
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: bump a 1.5plugin.4i',
        'buscar' => [
            ' * @version 1.5plugin.4h',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4i',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_APP a 1.5plugin.4i',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.4h";',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.4i";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_PLUGIN a 1.5plugin.4i',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4h";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4i";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'contenido.js: bump a 1.5plugin.4i',
        'buscar' => [
            ' * @version 1.5plugin.4h',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4i',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: bump a 1.5plugin.4i',
        'buscar' => [
            ' * @version 1.5plugin.4h',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4i',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo.js: bump a 1.5plugin.4i',
        'buscar' => [
            ' * @version 1.5plugin.4h',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4i',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_04_venta_cuotas.js',
        'descripcion' => 'prueba_04: bump a 1.5plugin.4i',
        'buscar' => [
            ' * @version 1.5plugin.4h',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4i',
        ],
    ],

    // ============================================================
    // prompts/prompt_plugin_piloto.md
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: bump a v1.5plugin.4i',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.4h (verificar',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.4i (helpers',
            '`esperar_valor` y `esperar_valor_vacio` que hacen polling',
            'hasta que el valor del input sea el esperado. Usados en las',
            '4 pruebas que dependen del fetch del DNI (ligadura x2,',
            'corrección de DNI x2). Antes leían `ctx.valor` una sola vez',
            'tras una pausa fija de 800 ms, y fallaban intermitentemente',
            'cuando el fetch tardaba más).',
            'Antes: v1.5plugin.4h (verificar',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: leccion sobre polling de valores',
        'buscar' => [
            '- **Preferir verificar por backend antes que por DOM.** Cuando',
        ],
        'reemplazar' => [
            '- **Nunca leer un valor después de un fetch con una pausa',
            '  fija.** El fetch del DNI en el piloto tarda un tiempo',
            '  variable (JIT, carga del servidor, red). Leer después de',
            '  una pausa de 800 ms falla intermitentemente. Usar polling',
            '  (`esperar_valor`, `esperar_valor_vacio`) hasta que el valor',
            '  sea el esperado, con timeout de 5 s. Bug en v1.5plugin.4h:',
            '  las pruebas de ligadura y de corrección de DNI leían',
            '  `ctx.valor` una sola vez y fallaban intermitentemente.',
            '  Fix en v1.5plugin.4i.',
            '- **Preferir verificar por backend antes que por DOM.** Cuando',
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