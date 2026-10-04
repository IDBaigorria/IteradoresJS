<?php
/**
 * Aplicador de cambios automáticos — proyecto iteradoresJS (plugin Chrome).
 *
 * Tanda v1.5plugin.4r: prueba de alta de terminal.
 *
 * - Nueva prueba 19: login dueño + pestaña Puntos de venta + alta de
 *   terminal. Nueva sección "Puntos de venta" en la ventana.
 * - Nuevos helpers ctx.sobrescribir_alertas() / ctx.restaurar_alertas()
 *   para flujos que disparan alert() nativo.
 * - Bumps de versión a 1.5plugin.4r.
 * - Aprendizaje 29 en el prompt del plugin.
 *
 * Uso (parado en la raíz de iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    // --------------------------------------------------------
    // Archivo nuevo: prueba_19
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_19_alta_terminal.js',
        'descripcion' => 'Nueva prueba: alta de terminal',
        'contenido' => [
            "/**",
            " * Prueba: alta de terminal por parte de un dueño.",
            " *",
            " * Flujo:",
            " *   1. Login como dueño.",
            " *   2. Ir a la pestaña Puntos de venta (id \"terminales\" en",
            " *      el HTML del piloto).",
            " *   3. Click en \"Agregar punto de venta\".",
            " *   4. Llenar el formulario con datos únicos.",
            " *   5. Guardar. El botón dispara un alert() con el código",
            " *      generado; hay que sobrescribir window.alert para no",
            " *      bloquear.",
            " *   6. Verificar que la nueva terminal aparezca en la tabla.",
            " *",
            " * IMPORTANTE: cada corrida crea una terminal nueva con un",
            " * nombre único (prefijo \"termprueba\"). El test NO la",
            " * elimina; las corridas sucesivas van acumulando terminales",
            " * de prueba. Limpiar manualmente desde la misma pestaña",
            " * cuando molesten.",
            " *",
            " * @version 1.5plugin.4r",
            " */",
            "",
            'import { CODIGO_DUENO } from "../ConfPlugin.js";',
            "",
            "export const prueba = {",
            '    id: "alta_terminal",',
            '    nombre: "Alta de terminal (dueño)",',
            '    descripcion: "Verifica que un dueño pueda crear una terminal desde la pestaña Puntos de venta. Cubre el flujo de alta y su reflejo en la tabla. Cada corrida crea una terminal nueva (prefijo termprueba).",',
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
            "        // 4. Sobrescribir alert/confirm. El Guardar dispara alert()",
            "        //    con el código generado; las extensiones no pueden",
            "        //    manejar dialogs nativos. La sobrescritura tiene que",
            "        //    estar activa durante toda la operación.",
            "        await ctx.sobrescribir_alertas();",
            "",
            "        try {",
            "            // 5. Click en Agregar punto de venta.",
            '            const clic_agregar = await ctx.clic("#boton_agregar_terminal");',
            '            ctx.assert(clic_agregar && clic_agregar.exito, "No se pudo hacer clic en Agregar punto de venta");',
            "",
            "            // 6. Esperar el formulario.",
            '            const espera_form = await ctx.esperar("#nuevo_terminal_nombre_usuario", 5000);',
            '            ctx.assert(espera_form && espera_form.exito, "No apareció el formulario de alta de terminal");',
            "",
            "            // 7. Llenar el formulario con datos únicos.",
            "            const sufijo = String(Date.now()).slice(-8);",
            '            const nombre_usuario = "termprueba" + sufijo;',
            '            const codigo_acceso = "cod" + sufijo;',
            '            const nombre_real = "Terminal Prueba " + sufijo;',
            "",
            '            await ctx.escribir("#nuevo_terminal_nombre_usuario", nombre_usuario);',
            '            await ctx.escribir("#nuevo_terminal_nombre_real", nombre_real);',
            '            await ctx.escribir("#nuevo_terminal_codigo_acceso", codigo_acceso);',
            '            await ctx.escribir("#nuevo_terminal_banco_nombre", "Banco Test");',
            '            await ctx.escribir("#nuevo_terminal_banco_cuenta", "12345678");',
            "",
            "            // 8. Guardar.",
            '            const clic_guardar = await ctx.clic("#boton_guardar_terminal");',
            '            ctx.assert(clic_guardar && clic_guardar.exito, "No se pudo hacer clic en Guardar");',
            "",
            "            // 9. Esperar a que la tabla se actualice. Verificamos que la",
            "            //    nueva terminal aparezca en #tabla_terminales_dueno.",
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
    // servicio.js — agregar helpers de alert/confirm
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio: agregar helpers sobrescribir_alertas / restaurar_alertas',
        'buscar' => [
            '        activar_pestana_piloto: async (nombre) => {',
            '            // Activa una pestaña del piloto desde el page context.',
            '            // Las pestañas se generan dinámicamente, así que no hay',
            '            // un selector estable; se llama a `activar_pestana`',
            '            // (global del piloto) vía chrome.scripting en MAIN world.',
            '            try {',
            '                const r = await chrome.scripting.executeScript({',
            '                    target: { tabId: pestana_id },',
            '                    world: "MAIN",',
            '                    func: (n) => {',
            '                        if (typeof activar_pestana === "function") {',
            '                            activar_pestana(n);',
            '                            return { exito: true };',
            '                        }',
            '                        return { exito: false, error: "activar_pestana no existe en el page" };',
            '                    },',
            '                    args: [nombre]',
            '                });',
            '                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };',
            '            } catch (e) {',
            '                return { exito: false, error: e.message };',
            '            }',
            '        },',
            '',
            '        // === helpers de sesion ===',
        ],
        'reemplazar' => [
            '        activar_pestana_piloto: async (nombre) => {',
            '            // Activa una pestaña del piloto desde el page context.',
            '            // Las pestañas se generan dinámicamente, así que no hay',
            '            // un selector estable; se llama a `activar_pestana`',
            '            // (global del piloto) vía chrome.scripting en MAIN world.',
            '            try {',
            '                const r = await chrome.scripting.executeScript({',
            '                    target: { tabId: pestana_id },',
            '                    world: "MAIN",',
            '                    func: (n) => {',
            '                        if (typeof activar_pestana === "function") {',
            '                            activar_pestana(n);',
            '                            return { exito: true };',
            '                        }',
            '                        return { exito: false, error: "activar_pestana no existe en el page" };',
            '                    },',
            '                    args: [nombre]',
            '                });',
            '                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };',
            '            } catch (e) {',
            '                return { exito: false, error: e.message };',
            '            }',
            '        },',
            '        sobrescribir_alertas: async () => {',
            '            // Sobrescribe window.alert y window.confirm del page',
            '            // con no-ops. Necesario para flujos que disparan',
            '            // dialogs nativos (por ejemplo, el alta de terminal',
            '            // muestra alert() con el código generado). La',
            '            // sobrescritura tiene que estar activa durante toda',
            '            // la operación, no solo durante el click: el alert',
            '            // se dispara después de que el fetch resuelve.',
            '            // Idempotente: guarda los originales la primera vez',
            '            // y no los pisa en llamadas sucesivas.',
            '            try {',
            '                const r = await chrome.scripting.executeScript({',
            '                    target: { tabId: pestana_id },',
            '                    world: "MAIN",',
            '                    func: () => {',
            '                        if (!window.__plugin_alert_override) {',
            '                            window.__plugin_alert_override = {',
            '                                alert: window.alert,',
            '                                confirm: window.confirm',
            '                            };',
            '                            window.alert = () => {};',
            '                            window.confirm = () => true;',
            '                        }',
            '                        return { exito: true };',
            '                    }',
            '                });',
            '                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };',
            '            } catch (e) {',
            '                return { exito: false, error: e.message };',
            '            }',
            '        },',
            '        restaurar_alertas: async () => {',
            '            // Restaura window.alert y window.confirm originales.',
            '            // Idempotente: si no había override activo, no hace',
            '            // nada.',
            '            try {',
            '                const r = await chrome.scripting.executeScript({',
            '                    target: { tabId: pestana_id },',
            '                    world: "MAIN",',
            '                    func: () => {',
            '                        if (window.__plugin_alert_override) {',
            '                            window.alert = window.__plugin_alert_override.alert;',
            '                            window.confirm = window.__plugin_alert_override.confirm;',
            '                            delete window.__plugin_alert_override;',
            '                        }',
            '                        return { exito: true };',
            '                    }',
            '                });',
            '                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };',
            '            } catch (e) {',
            '                return { exito: false, error: e.message };',
            '            }',
            '        },',
            '',
            '        // === helpers de sesion ===',
        ],
    ],

    // --------------------------------------------------------
    // servicio.js — bump de version
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio: bump @version a 1.5plugin.4r',
        'buscar' => [
            ' * @version 1.5plugin.4o',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4r',
        ],
    ],

    // --------------------------------------------------------
    // catalogo.js — import + seccion nueva + bump
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: import de la prueba 19',
        'buscar' => [
            'import { prueba as autocompletado_dni_terminal_clientes } from "./prueba_18_autocompletado_dni_terminal_clientes.js";',
        ],
        'reemplazar' => [
            'import { prueba as autocompletado_dni_terminal_clientes } from "./prueba_18_autocompletado_dni_terminal_clientes.js";',
            'import { prueba as alta_terminal } from "./prueba_19_alta_terminal.js";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: agregar seccion Puntos de venta',
        'buscar' => [
            '    {',
            '        id: "autocompletado",',
            '        nombre: "Autocompletado",',
            '        pruebas: [',
            '            autocompletado_dni_terminal_clientes',
            '        ]',
            '    },',
        ],
        'reemplazar' => [
            '    {',
            '        id: "autocompletado",',
            '        nombre: "Autocompletado",',
            '        pruebas: [',
            '            autocompletado_dni_terminal_clientes',
            '        ]',
            '    },',
            '    {',
            '        id: "puntos_de_venta",',
            '        nombre: "Puntos de venta",',
            '        pruebas: [',
            '            alta_terminal',
            '        ]',
            '    },',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: bump @version a 1.5plugin.4r',
        'buscar' => [
            ' * @version 1.5plugin.4p',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4r',
        ],
    ],

    // --------------------------------------------------------
    // ConfPlugin.js — bumps
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin: bump VERSION_APP a 1.5plugin.4r',
        'buscar' => [
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.4p";',
        ],
        'reemplazar' => [
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.4r";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin: bump VERSION_PLUGIN a 1.5plugin.4r',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4p";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4r";',
        ],
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §7 estado actual
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §7 bump a 4r con 19 pruebas',
        'buscar' => [
            '**Proyecto en v1.5plugin.4p.** El esqueleto del plugin está',
            'armado y funcional, tiene 18 pruebas (base + autocompletado',
            '+ ventas) y las agrupa en secciones.',
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.4r.** El esqueleto del plugin está',
            'armado y funcional, tiene 19 pruebas (base + autocompletado',
            '+ puntos de venta + ventas) y las agrupa en secciones.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §7 actualizar lista de secciones',
        'buscar' => [
            '**Secciones actuales:**',
            '',
            '- `base`: `arranque`, `login_admin`.',
            '- `ventas`: 15 pruebas (básica, cuotas, transferencia,',
            '  asientos múltiples, ligaduras, duplicado, corrección de',
            '  DNI, montos inválidos, sin comprador, cancelar-reabrir,',
            '  sin asientos).',
        ],
        'reemplazar' => [
            '**Secciones actuales:**',
            '',
            '- `base`: `arranque`, `login`.',
            '- `autocompletado`: `autocompletado_dni_terminal_clientes`.',
            '- `puntos_de_venta`: `alta_terminal`.',
            '- `ventas`: 15 pruebas (básica, cuotas, transferencia,',
            '  asientos múltiples, ligaduras, duplicado, corrección de',
            '  DNI, montos inválidos, sin comprador, cancelar-reabrir,',
            '  sin asientos).',
        ],
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §9 cabecera
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §9 cabecera bump a 4r',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.4q (nueva',
            'sección 10 "Reglas de trabajo": cada `aplicar_cambios.php` va',
            'con su commit sugerido, y cada cambio del piloto PHP trae su',
            'espejo de pruebas acá).',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.4r (nueva',
            'prueba `alta_terminal`: login dueño, pestaña Puntos de',
            'venta, alta de terminal con datos únicos, verificación en',
            'la tabla. Nueva sección "Puntos de venta" en la ventana.',
            'Se agregan los helpers `ctx.sobrescribir_alertas()` y',
            '`ctx.restaurar_alertas()` al service worker para flujos que',
            'disparan dialogs nativos. Nuevo aprendizaje 29).',
            'Antes: v1.5plugin.4q (nueva',
            'sección 10 "Reglas de trabajo": cada `aplicar_cambios.php` va',
            'con su commit sugerido, y cada cambio del piloto PHP trae su',
            'espejo de pruebas acá).',
        ],
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §8.8 aprendizaje 29
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §8.8 agregar aprendizaje 29',
        'buscar' => [
            '28. **Los bloques `buscar` del `aplicar_cambios.php`',
            '    deben incluir la línea completa, no un prefijo.** Un',
            '    `return (r && r[0] && r[0].result) ? ... : ...` no',
            '    matchea con un `return { exito: false }`. Cuando se',
            '    arma un bloque, verificarlo contra el archivo real,',
            '    no contra el recuerdo de lo que uno escribió. Si el',
            '    bloque falla, pedir el fragmento exacto del archivo',
            '    al usuario antes de ajustar.',
        ],
        'reemplazar' => [
            '28. **Los bloques `buscar` del `aplicar_cambios.php`',
            '    deben incluir la línea completa, no un prefijo.** Un',
            '    `return (r && r[0] && r[0].result) ? ... : ...` no',
            '    matchea con un `return { exito: false }`. Cuando se',
            '    arma un bloque, verificarlo contra el archivo real,',
            '    no contra el recuerdo de lo que uno escribió. Si el',
            '    bloque falla, pedir el fragmento exacto del archivo',
            '    al usuario antes de ajustar.',
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
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §9 estado de la conversacion
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §9 agregar entrada de alta_terminal',
        'buscar' => [
            '- El plugin tiene 18 pruebas que corren OK contra el piloto',
            '  PHP. La más reciente es `autocompletado_dni_terminal_clientes`',
            '  (v1.5plugin.4o), que verifica el fix v74h del piloto (el',
            '  autocompletado por DNI desde la pestaña Clientes con usuario',
            '  terminal, sin depender de que haya un viaje seleccionado).',
        ],
        'reemplazar' => [
            '- El plugin tiene 19 pruebas que corren OK contra el piloto',
            '  PHP. Las más recientes son `autocompletado_dni_terminal_clientes`',
            '  (v1.5plugin.4p), que verifica el fix v74h del piloto (el',
            '  autocompletado por DNI desde la pestaña Clientes con usuario',
            '  terminal), y `alta_terminal` (v1.5plugin.4r), que cubre el',
            '  alta de terminal desde la pestaña Puntos de venta.',
            '- Nota sobre `alta_terminal`: cada corrida crea una terminal',
            '  nueva con prefijo `termprueba`. El test NO la elimina;',
            '  limpiar manualmente cuando molesten. Se puede agregar la',
            '  eliminación al final del test cuando tengamos el selector',
            '  del botón de eliminar de cada fila.',
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