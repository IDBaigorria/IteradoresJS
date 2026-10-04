<?php
/**
 * Aplicador de cambios automáticos — proyecto iteradoresJS (plugin Chrome).
 *
 * Tanda v1.5plugin.4v: prueba de alta de terminal con doble protección.
 *
 * - La prueba vuelve a usar `sobrescribir_alertas()` (que fue lo que
 *   funcionó en v4t) ADEMÁS de `activar_modo_prueba()` (bandera del
 *   piloto). Cinturón y tiradores: si una capa falla, la otra cubre.
 * - Se sube el timeout de la tabla a 25s y se baja el intervalo de
 *   polling a 500ms, para tolerar latencias.
 *
 * Uso (parado en la raíz de iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    // --------------------------------------------------------
    // prueba_19 — reescribir con doble protección y timeouts holgados
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_19_alta_terminal.js',
        'descripcion' => 'Prueba 19 v5: override + bandera, timeouts holgados',
        'contenido' => [
            "/**",
            " * Prueba: alta de terminal por parte de un dueño.",
            " *",
            " * Flujo:",
            " *   1. Login como dueño.",
            " *   2. Doble protección contra el alert del código de acceso:",
            " *      a. ctx.activar_modo_prueba() -> setea",
            " *         window.__iteradores_modo_prueba = true, que el",
            " *         helper _mostrar_alerta_critica() del piloto respeta",
            " *         (aplicado en v1.5piloto.74j).",
            " *      b. ctx.sobrescribir_alertas() -> override de",
            " *         window.alert y window.confirm en el page context.",
            " *      Si una capa falla, la otra cubre. El override fue lo",
            " *      que funcionó en v1.5plugin.4t; la bandera es refuerzo.",
            " *   3. Ir a la pestaña Puntos de venta.",
            " *   4. Click en \"Agregar punto de venta\" (abre modal).",
            " *   5. Llenar los campos del modal con datos únicos.",
            " *   6. Guardar.",
            " *   7. Verificar que la nueva terminal aparezca en la tabla.",
            " *   8. Restaurar (finally).",
            " *",
            " * IMPORTANTE: cada corrida crea una terminal nueva con un",
            " * nombre único (prefijo \"termprueba\"). El test NO la",
            " * elimina; las corridas sucesivas van acumulando terminales",
            " * de prueba. Limpiar manualmente desde la misma pestaña.",
            " *",
            " * @version 1.5plugin.4v",
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
            "        // 2a. Bandera de modo prueba (refuerzo, requiere piloto",
            "        //     v74j+).",
            "        const modo = await ctx.activar_modo_prueba();",
            '        ctx.assert(modo && modo.exito, "No se pudo activar el modo prueba: " + (modo && modo.error ? modo.error : "sin detalle"));',
            "",
            "        // 2b. Override de window.alert / window.confirm. Este es el",
            "        //     que ya funcionó en v1.5plugin.4t. Se aplica SIEMPRE,",
            "        //     independientemente de si la bandera del piloto está",
            "        //     activa.",
            "        const override = await ctx.sobrescribir_alertas();",
            '        ctx.assert(override && override.exito, "sobrescribir_alertas falló: " + (override && override.error ? override.error : "sin detalle"));',
            "",
            "        try {",
            "            // 3. Activar la pestaña Puntos de venta.",
            '            const activacion = await ctx.activar_pestana_piloto("terminales");',
            '            ctx.assert(activacion && activacion.exito, "No se pudo activar la pestaña Puntos de venta: " + (activacion && activacion.error ? activacion.error : "sin detalle"));',
            "",
            "            // 4. Esperar el botón de alta.",
            '            const espera_boton = await ctx.esperar("#boton_agregar_terminal", 5000);',
            '            ctx.assert(espera_boton && espera_boton.exito, "No apareció el botón #boton_agregar_terminal");',
            "",
            "            // 5. Click en Agregar punto de venta.",
            '            const clic_agregar = await ctx.clic("#boton_agregar_terminal");',
            '            ctx.assert(clic_agregar && clic_agregar.exito, "No se pudo hacer clic en Agregar punto de venta");',
            "",
            "            // 6. Esperar el campo Nombre de usuario dentro del modal.",
            '            const espera_modal = await ctx.esperar("#modal_agregar_nombre_usuario", 5000);',
            '            ctx.assert(espera_modal && espera_modal.exito, "No apareció el modal de alta de terminal (campo #modal_agregar_nombre_usuario)");',
            "",
            "            // 7. Esperar que el campo Banco sea visible.",
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
            "            // 10. Verificar que la nueva terminal aparezca en la tabla.",
            "            //     Timeout holgado (25s) e intervalo de 500ms.",
            "            let encontrada = false;",
            "            const inicio = Date.now();",
            "            while (Date.now() - inicio < 25000) {",
            '                const html_tabla = await ctx.html("#tabla_terminales_dueno");',
            "                if (html_tabla && html_tabla.includes(nombre_usuario)) {",
            "                    encontrada = true;",
            "                    break;",
            "                }",
            "                await ctx.pausa(500);",
            "            }",
            "",
            '            ctx.assert(encontrada, "La nueva terminal (" + nombre_usuario + ") no apareció en la tabla #tabla_terminales_dueno después del alta");',
            "        } finally {",
            "            // 11. Restaurar (idempotente).",
            "            await ctx.restaurar_alertas();",
            "            await ctx.desactivar_modo_prueba();",
            "        }",
            "    }",
            "};",
        ],
    ],

    // --------------------------------------------------------
    // catalogo.js — bump @version
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: bump @version a 1.5plugin.4v',
        'buscar' => [
            ' * @version 1.5plugin.4u',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4v',
        ],
    ],

    // --------------------------------------------------------
    // ConfPlugin.js — bumps
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin: bump VERSION_APP a 1.5plugin.4v',
        'buscar' => [
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.4u";',
        ],
        'reemplazar' => [
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.4v";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin: bump VERSION_PLUGIN a 1.5plugin.4v',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4u";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4v";',
        ],
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §8.8 aprendizaje 32 actualizado
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §8.8 actualizar aprendizaje 32',
        'buscar' => [
            '32. **Un alert nativo congela el page context entero.**',
            '    Mientras el alert está abierto, cualquier sendMessage o',
            '    executeScript que toque ese page queda en cola. El',
            '    popup del plugin pierde foco y se cierra (Chrome cierra',
            '    los popups al perder foco); los resultados de la prueba',
            '    se siguen persistiendo en IndexedDB, pero el usuario no',
            '    los ve en vivo. Moraleja: las pruebas que disparan',
            '    flujos con alert() deben evitarlo con la bandera de',
            '    modo prueba, no depender del override. Ver',
            '    aprendizaje 31.',
        ],
        'reemplazar' => [
            '32. **Un alert nativo congela el page context entero.**',
            '    Mientras el alert está abierto, cualquier sendMessage o',
            '    executeScript que toque ese page queda en cola. El',
            '    popup del plugin pierde foco y se cierra (Chrome cierra',
            '    los popups al perder foco); los resultados de la prueba',
            '    se siguen persistiendo en IndexedDB, pero el usuario no',
            '    los ve en vivo. Moraleja: las pruebas que disparan',
            '    flujos con alert() deben evitarlo con override Y, si',
            '    está disponible, con la bandera de modo prueba.',
            '    **Actualización v1.5plugin.4v:** usar AMBOS métodos en',
            '    conjunto (cinturón y tiradores). El override de',
            '    `window.alert` fue el que funcionó en v4t; la bandera',
            '    de modo prueba del piloto es un refuerzo adicional.',
            '    Activarlos juntos y restaurarlos juntos en el finally.',
            '    Ver aprendizaje 31.',
        ],
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §9 cabecera
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §9 cabecera bump a 4v',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.4u (modo',
            'prueba del piloto: el override de `window.alert` no alcanza,',
            'el alert nativo sigue apareciendo y bloquea el page context.',
            'Solución: el piloto PHP respeta una bandera',
            '`window.__iteradores_modo_prueba` (helper',
            '`_mostrar_alerta_critica()` en `aplicacion.js`, aplicado en',
            'v1.5piloto.74j). El plugin setea/limpia la bandera con',
            '`ctx.activar_modo_prueba()` / `ctx.desactivar_modo_prueba()`.',
            'La prueba `alta_terminal` usa ese modo. Nuevos aprendizajes',
            '31 (actualizado) y 32).',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.4v (la',
            'prueba `alta_terminal` usa AMBOS métodos juntos para',
            'suprimir el alert del código de acceso:',
            '`ctx.sobrescribir_alertas()` (el que funcionó en v4t) y',
            '`ctx.activar_modo_prueba()` (bandera del piloto, refuerzo).',
            'Timeouts holgados: 25s para la verificación en la tabla,',
            'polling cada 500ms).',
            'Antes: v1.5plugin.4u (modo',
            'prueba del piloto: el override de `window.alert` no alcanza,',
            'el alert nativo sigue apareciendo y bloquea el page context.',
            'Solución: el piloto PHP respeta una bandera',
            '`window.__iteradores_modo_prueba` (helper',
            '`_mostrar_alerta_critica()` en `aplicacion.js`, aplicado en',
            'v1.5piloto.74j). El plugin setea/limpia la bandera con',
            '`ctx.activar_modo_prueba()` / `ctx.desactivar_modo_prueba()`.',
            'La prueba `alta_terminal` usa ese modo. Nuevos aprendizajes',
            '31 (actualizado) y 32).',
        ],
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §9 nota del fix
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §9 agregar nota del fix v4v',
        'buscar' => [
            '- Fix v1.5plugin.4u: aun con `Object.defineProperty` y',
            '  `activo === true`, el alert nativo sigue apareciendo en',
            '  algunos contextos. Se adopta la bandera de modo prueba',
            '  del piloto (`window.__iteradores_modo_prueba`), que el',
            '  propio `_mostrar_alerta_critica()` del piloto respeta.',
            '  La prueba `alta_terminal` activa el modo antes de',
            '  cualquier acción que dispare alert. Aprendizajes 31',
            '  (actualizado) y 32 en §8.8.',
        ],
        'reemplazar' => [
            '- Fix v1.5plugin.4u: aun con `Object.defineProperty` y',
            '  `activo === true`, el alert nativo sigue apareciendo en',
            '  algunos contextos. Se adopta la bandera de modo prueba',
            '  del piloto (`window.__iteradores_modo_prueba`), que el',
            '  propio `_mostrar_alerta_critica()` del piloto respeta.',
            '  La prueba `alta_terminal` activa el modo antes de',
            '  cualquier acción que dispare alert. Aprendizajes 31',
            '  (actualizado) y 32 en §8.8.',
            '- Fix v1.5plugin.4v: el override de `window.alert` (v4t)',
            '  sí funcionaba; la bandera de modo prueba (v4u) fue',
            '  insuficiente por sí sola. Se combinan AMBOS:',
            '  `sobrescribir_alertas()` + `activar_modo_prueba()`. El',
            '  piloto mantiene `_mostrar_alerta_critica()` y la',
            '  bandera, pero la prueba no depende de ellos. Se suben',
            '  los timeouts (25s) por si la red del backend tarda.',
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