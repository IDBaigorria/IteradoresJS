<?php
/**
 * Aplicador de cambios automáticos — proyecto iteradoresJS (plugin Chrome).
 *
 * Tanda v1.5plugin.4s: fix de la prueba de alta de terminal.
 *
 * El botón "#boton_agregar_terminal" ya no desoculta un formulario
 * embebido en el HTML: abre un modal genérico (vía
 * abrir_modal_agregar_usuario_generico en aplicacion.js). Los IDs
 * de los campos del modal son "modal_agregar_*", no "nuevo_terminal_*".
 *
 * Uso (parado en la raíz de iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    // --------------------------------------------------------
    // prueba_19 — reescribir con los selectores del modal
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_19_alta_terminal.js',
        'descripcion' => 'Prueba 19 v2: selectores del modal generico',
        'contenido' => [
            "/**",
            " * Prueba: alta de terminal por parte de un dueño.",
            " *",
            " * Flujo:",
            " *   1. Login como dueño.",
            " *   2. Ir a la pestaña Puntos de venta (id \"terminales\").",
            " *   3. Click en \"Agregar punto de venta\". El botón abre un",
            " *      modal genérico (aplicacion.js, función",
            " *      abrir_modal_agregar_usuario_generico). Los campos del",
            " *      modal tienen IDs con prefijo \"modal_agregar_*\", no",
            " *      \"nuevo_terminal_*\" (los del formulario embebido en el",
            " *      HTML, que quedó sin uso desde v73g).",
            " *   4. Llenar los campos del modal con datos únicos.",
            " *   5. Guardar. El modal cierra con alert() mostrando el",
            " *      código asignado; hay que sobrescribir window.alert.",
            " *   6. Verificar que la nueva terminal aparezca en la tabla",
            " *      #tabla_terminales_dueno.",
            " *",
            " * IMPORTANTE: cada corrida crea una terminal nueva con un",
            " * nombre único (prefijo \"termprueba\"). El test NO la",
            " * elimina; las corridas sucesivas van acumulando terminales",
            " * de prueba. Limpiar manualmente desde la misma pestaña.",
            " *",
            " * @version 1.5plugin.4s",
            " */",
            "",
            'import { CODIGO_DUENO } from "../ConfPlugin.js";',
            "",
            "export const prueba = {",
            '    id: "alta_terminal",',
            '    nombre: "Alta de terminal (dueño)",',
            '    descripcion: "Verifica que un dueño pueda crear una terminal desde la pestaña Puntos de venta. Cubre el alta vía modal genérico y su reflejo en la tabla. Cada corrida crea una terminal nueva (prefijo termprueba).",',
            "",
            "    async ejecutar(ctx) {",
            "        // 1. Login como dueño.",
            "        await ctx.asegurar_login(CODIGO_DUENO);",
            "",
            "        // 2. Activar la pestaña Puntos de venta.",
            '        const activacion = await ctx.activar_pestana_piloto("terminales");',
            '        ctx.assert(activacion && activacion.exito, "No se pudo activar la pestaña Puntos de venta: " + (activacion && activacion.error ? activacion.error : "sin detalle"));',
            "",
            "        // 3. Esperar el botón de alta.",
            '        const espera_boton = await ctx.esperar("#boton_agregar_terminal", 5000);',
            '        ctx.assert(espera_boton && espera_boton.exito, "No apareció el botón #boton_agregar_terminal");',
            "",
            "        // 4. Sobrescribir alert/confirm durante todo el flujo.",
            "        //    El modal de alta cierra con alert() mostrando el",
            "        //    código asignado; las extensiones no pueden manejar",
            "        //    dialogs nativos.",
            "        await ctx.sobrescribir_alertas();",
            "",
            "        try {",
            "            // 5. Click en Agregar punto de venta (abre el modal).",
            '            const clic_agregar = await ctx.clic("#boton_agregar_terminal");',
            '            ctx.assert(clic_agregar && clic_agregar.exito, "No se pudo hacer clic en Agregar punto de venta");',
            "",
            "            // 6. Esperar el campo Nombre de usuario dentro del modal.",
            '            const espera_modal = await ctx.esperar("#modal_agregar_nombre_usuario", 5000);',
            '            ctx.assert(espera_modal && espera_modal.exito, "No apareció el modal de alta de terminal (campo #modal_agregar_nombre_usuario)");',
            "",
            "            // 7. Esperar que el campo Banco sea visible. En el modal",
            "            //    con nivel terminal, actualizar_visibilidad() lo",
            "            //    desoculta. Es un buen ancla de que el modal ya está",
            "            //    listo para llenarse.",
            '            const espera_banco = await ctx.esperar_visible("#modal_agregar_banco_nombre", 3000);',
            '            ctx.assert(espera_banco && espera_banco.exito, "El campo Banco del modal no se hizo visible (¿nivel no quedó en terminal?)");',
            "",
            "            // 8. Llenar los campos con datos únicos.",
            "            const sufijo = String(Date.now()).slice(-8);",
            '            const nombre_usuario = "termprueba" + sufijo;',
            '            const codigo_acceso = "cod" + sufijo;',
            '            const nombre_real = "Terminal Prueba " + sufijo;',
            "",
            '            await ctx.escribir("#modal_agregar_nombre_usuario", nombre_usuario);',
            '            await ctx.escribir("#modal_agregar_codigo", codigo_acceso);',
            '            await ctx.escribir("#modal_agregar_nombre_real", nombre_real);',
            '            await ctx.escribir("#modal_agregar_banco_nombre", "Banco Test");',
            '            await ctx.escribir("#modal_agregar_banco_cuenta", "12345678");',
            "",
            "            // 9. Guardar.",
            '            const clic_guardar = await ctx.clic("#modal_btn_guardar_alta");',
            '            ctx.assert(clic_guardar && clic_guardar.exito, "No se pudo hacer clic en Guardar");',
            "",
            "            // 10. Esperar a que el modal se cierre. Con alert",
            "            //     sobrescrito no se bloquea; el modal cierra",
            "            //     enseguida.",
            '            const espera_cierre = await ctx.esperar_oculto("#modal_agregar_nombre_usuario", 5000);',
            '            ctx.assert(espera_cierre && espera_cierre.exito, "El modal no se cerró después de Guardar (¿falló el alta?)");',
            "",
            "            // 11. Verificar que la nueva terminal aparezca en la tabla.",
            "            let encontrada = false;",
            "            const inicio = Date.now();",
            "            while (Date.now() - inicio < 8000) {",
            '                const html_tabla = await ctx.html("#tabla_terminales_dueno");',
            "                if (html_tabla && html_tabla.includes(nombre_usuario)) {",
            "                    encontrada = true;",
            "                    break;",
            "                }",
            "                await ctx.pausa(300);",
            "            }",
            "",
            '            ctx.assert(encontrada, "La nueva terminal (" + nombre_usuario + ") no apareció en la tabla #tabla_terminales_dueno después del alta");',
            "        } finally {",
            "            await ctx.restaurar_alertas();",
            "        }",
            "    }",
            "};",
        ],
    ],

    // --------------------------------------------------------
    // catalogo.js — bump @version a 4s
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: bump @version a 1.5plugin.4s',
        'buscar' => [
            ' * @version 1.5plugin.4r',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4s',
        ],
    ],

    // --------------------------------------------------------
    // ConfPlugin.js — bumps a 4s
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin: bump VERSION_APP a 1.5plugin.4s',
        'buscar' => [
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.4r";',
        ],
        'reemplazar' => [
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.4s";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin: bump VERSION_PLUGIN a 1.5plugin.4s',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4r";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4s";',
        ],
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §8.8 aprendizaje 30
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §8.8 agregar aprendizaje 30',
        'buscar' => [
            '29. **`window.alert` y `window.confirm` nativos bloquean',
            '    la extensión.** Para flujos que disparan dialogs',
            '    nativos (por ejemplo, el alta de terminal muestra',
            '    `alert()` con el código generado), sobrescribir ambos',
            '    antes de la acción y restaurarlos al final. Los',
            '    helpers `ctx.sobrescribir_alertas()` y',
            '    `ctx.restaurar_alertas()` encapsulan esto. La',
            '    sobrescritura tiene que estar activa durante toda la',
            '    operación, no solo durante el click: el `alert` puede',
            '    dispararse después de que el fetch resuelva. Ver',
            '    también el aprendizaje 10 (confirm nativo).',
        ],
        'reemplazar' => [
            '29. **`window.alert` y `window.confirm` nativos bloquean',
            '    la extensión.** Para flujos que disparan dialogs',
            '    nativos (por ejemplo, el alta de terminal muestra',
            '    `alert()` con el código generado), sobrescribir ambos',
            '    antes de la acción y restaurarlos al final. Los',
            '    helpers `ctx.sobrescribir_alertas()` y',
            '    `ctx.restaurar_alertas()` encapsulan esto. La',
            '    sobrescritura tiene que estar activa durante toda la',
            '    operación, no solo durante el click: el `alert` puede',
            '    dispararse después de que el fetch resuelva. Ver',
            '    también el aprendizaje 10 (confirm nativo).',
            '30. **Verificar los selectores reales antes de escribir',
            '    una prueba sobre un modal.** Los formularios embebidos',
            '    en el HTML del piloto quedaron sin uso en v73g: el',
            '    alta/edición de usuarios y terminales pasó a modales',
            '    genéricos (`abrir_modal_agregar_usuario_generico` y',
            '    `abrir_modal_editar_usuario_generico`, en',
            '    `aplicacion.js`). Los IDs de los campos del modal',
            '    tienen prefijo `modal_agregar_*` o `modal_editar_*`,',
            '    no los IDs del formulario viejo (`nuevo_terminal_*`,',
            '    `nuevo_*`). Antes de escribir un test que toque un',
            '    modal, revisar el archivo del módulo',
            '    (`Aplicacion/terminales.js`, `Aplicacion/admin.js`) y',
            '    `aplicacion.js`. Los IDs viejos siguen existiendo en',
            '    el HTML pero están ocultos; escribir en ellos no',
            '    tiene efecto. Nota de riesgo: el usuario suele dar el',
            '    HTML estático cuando se le pide "el archivo del',
            '    módulo", y eso puede inducir a error.',
        ],
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §9 cabecera
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §9 cabecera bump a 4s',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.4r (nueva',
            'prueba `alta_terminal`: login dueño, pestaña Puntos de',
            'venta, alta de terminal con datos únicos, verificación en',
            'la tabla. Nueva sección "Puntos de venta" en la ventana.',
            'Se agregan los helpers `ctx.sobrescribir_alertas()` y',
            '`ctx.restaurar_alertas()` al service worker para flujos que',
            'disparan dialogs nativos. Nuevo aprendizaje 29).',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.4s (fix',
            'de la prueba `alta_terminal`: los selectores del formulario',
            'de alta eran los del modal genérico (`modal_agregar_*`),',
            'no los del formulario embebido sin uso (`nuevo_terminal_*`).',
            'Se agrega el aprendizaje 30 sobre verificar selectores',
            'reales antes de escribir una prueba sobre un modal).',
            'Antes: v1.5plugin.4r (nueva',
            'prueba `alta_terminal`: login dueño, pestaña Puntos de',
            'venta, alta de terminal con datos únicos, verificación en',
            'la tabla. Nueva sección "Puntos de venta" en la ventana.',
            'Se agregan los helpers `ctx.sobrescribir_alertas()` y',
            '`ctx.restaurar_alertas()` al service worker para flujos que',
            'disparan dialogs nativos. Nuevo aprendizaje 29).',
        ],
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §9 estado de la conversacion
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §9 agregar nota de fix v4s',
        'buscar' => [
            '- Nota sobre `alta_terminal`: cada corrida crea una terminal',
            '  nueva con prefijo `termprueba`. El test NO la elimina;',
            '  limpiar manualmente cuando molesten. Se puede agregar la',
            '  eliminación al final del test cuando tengamos el selector',
            '  del botón de eliminar de cada fila.',
        ],
        'reemplazar' => [
            '- Nota sobre `alta_terminal`: cada corrida crea una terminal',
            '  nueva con prefijo `termprueba`. El test NO la elimina;',
            '  limpiar manualmente cuando molesten. Se puede agregar la',
            '  eliminación al final del test cuando tengamos el selector',
            '  del botón de eliminar de cada fila (hoy:',
            '  `button.btn_eliminar_terminal[data-usuario="..."]`, con',
            '  `confirm()` nativo).',
            '- Fix v1.5plugin.4s: la prueba `alta_terminal` escribía en',
            '  los inputs del formulario embebido en el HTML',
            '  (`#nuevo_terminal_*`), que quedaron sin uso desde v73g',
            '  del piloto. El botón de alta abre un modal genérico con',
            '  IDs `#modal_agregar_*`; la prueba se corrigió para usar',
            '  esos. Aprendizaje 30 en §8.8.',
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