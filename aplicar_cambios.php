<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda V1.5plugin.5q:
 *   - Prueba espejo de v1.5piloto.76b:
 *     cerrar_sesion_cierra_modales.
 *   - Sección "base" pasa a 3 pruebas.
 *   - Bump de ConfPlugin, catálogo y prompt.
 *
 * Uso:
 *   php aplicar_cambios.php
 *
 * Correr parado en la raíz de iteradoresJS/.
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

    // --------------------------------------------------------
    // ConfPlugin.js
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'Bump VERSION_APP a 5q',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.5p";',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.5q";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'Bump VERSION_PLUGIN a 5q',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5p";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5q";',
        ],
    ],

    // --------------------------------------------------------
    // catalogo.js
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Bump @version de catalogo.js a 5q',
        'buscar' => [
            ' * @version 1.5plugin.5p',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.5q',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar import de la prueba 44',
        'buscar' => [
            'import { prueba as listar_viajes_indice_comportamiento } from "./prueba_43_listar_viajes_indice_comportamiento.js";',
            '',
            'export const SECCIONES = [',
        ],
        'reemplazar' => [
            'import { prueba as listar_viajes_indice_comportamiento } from "./prueba_43_listar_viajes_indice_comportamiento.js";',
            'import { prueba as cerrar_sesion_cierra_modales } from "./prueba_44_cerrar_sesion_cierra_modales.js";',
            '',
            'export const SECCIONES = [',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar prueba 44 a la sección base',
        'buscar' => [
            '        id: "base",',
            '        nombre: "Base",',
            '        pruebas: [',
            '            arranque,',
            '            login',
            '        ]',
        ],
        'reemplazar' => [
            '        id: "base",',
            '        nombre: "Base",',
            '        pruebas: [',
            '            arranque,',
            '            login,',
            '            cerrar_sesion_cierra_modales',
            '        ]',
        ],
    ],

    // --------------------------------------------------------
    // Prompt del plugin
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: estado a 5q con 44 pruebas',
        'buscar' => [
            '**Proyecto en v1.5plugin.5p.** El esqueleto del plugin está',
            'armado y funcional, tiene 43 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + grafo) y las agrupa',
            'en secciones.',
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.5q.** El esqueleto del plugin está',
            'armado y funcional, tiene 44 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + grafo) y las agrupa',
            'en secciones.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: sección base a 3 pruebas',
        'buscar' => [
            '- `base`: `arranque`, `login`.',
        ],
        'reemplazar' => [
            '- `base`: `arranque`, `login`, `cerrar_sesion_cierra_modales`.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: última actualización a 5q',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.5p',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.5q',
            '(prueba espejo de v1.5piloto.76b:',
            '`cerrar_sesion_cierra_modales`. Verifica que al cerrar',
            'sesión con un modal abierto, todos los overlays quedan',
            'ocultos: `#modal_generico`, `#modal_apilado`,',
            '`#opciones_impresion` y los `.modal-chico`. La sección',
            '"base" pasa a 3 pruebas.).',
            'Antes: v1.5plugin.5p',
        ],
    ],

    // --------------------------------------------------------
    // Prueba 44
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_44_cerrar_sesion_cierra_modales.js',
        'descripcion' => 'Prueba 44: cerrar sesión cierra modales',
        'contenido' => [
            '/**',
            ' * Prueba: cerrar sesión cierra todos los modales.',
            ' *',
            ' * Verifica el fix de v1.5piloto.76b. Antes, al cerrar',
            ' * sesión con un modal abierto, el overlay seguía visible',
            ' * sobre la pantalla de login. `_limpiar_contenido_dinamico`',
            ' * limpiaba el contenido interno (tablas, listas) pero no',
            ' * los overlays.',
            ' *',
            ' * Pasos:',
            ' *   1. Login admin.',
            ' *   2. Click en #nombre_usuario_actual → abre modal',
            ' *      "Mis datos" (modal genérico).',
            ' *   3. Confirmar que #modal_generico está visible.',
            ' *   4. Click en "Salir".',
            ' *   5. Esperar #pantalla_login.',
            ' *   6. Verificar que ningún modal quedó visible:',
            ' *      #modal_generico, #modal_apilado,',
            ' *      #opciones_impresion, y los 5 .modal-chico.',
            ' *',
            ' * Requisitos de entorno: ninguno más que el admin.',
            ' *',
            ' * @version 1.5plugin.5q',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            '',
            '// ============================================================',
            '// Prueba',
            '// ============================================================',
            '',
            'export const prueba = {',
            '    id: "cerrar_sesion_cierra_modales",',
            '    nombre: "Base: cerrar sesión cierra los modales",',
            '    descripcion: "Verifica que al cerrar sesión con un modal abierto, todos los overlays quedan ocultos (v1.5piloto.76b).",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '',
            '        // 1. Abrir el modal "Mis datos" clickeando el nombre de',
            '        //    usuario en el header.',
            '        const click_nombre = await ctx.clic("#nombre_usuario_actual");',
            '        ctx.assert(click_nombre && click_nombre.exito,',
            '            "No se pudo clickear #nombre_usuario_actual: "',
            '            + (click_nombre && click_nombre.error ? click_nombre.error : "(sin detalle)"));',
            '',
            '        // El modal se abre después de un fetch (usuarios/mi_perfil).',
            '        const abierto = await ctx.esperar_visible("#modal_generico", 5000);',
            '        ctx.assert(abierto && abierto.exito,',
            '            "El modal \\"Mis datos\\" no se abrió tras clickear el nombre de usuario.");',
            '',
            '        // 2. Cerrar sesión.',
            '        const click_salir = await ctx.clic("#boton_salir");',
            '        ctx.assert(click_salir && click_salir.exito,',
            '            "No se pudo clickear #boton_salir: "',
            '            + (click_salir && click_salir.error ? click_salir.error : "(sin detalle)"));',
            '',
            '        const login_visible = await ctx.esperar_visible("#pantalla_login", 5000);',
            '        ctx.assert(login_visible && login_visible.exito,',
            '            "No apareció la pantalla de login tras cerrar sesión.");',
            '',
            '        // 3. Verificar que ningún modal quedó visible.',
            '        //    Pequeño margen por si el cierre es asíncrono.',
            '        await ctx.pausa(300);',
            '',
            '        const generico = await ctx.esta_visible("#modal_generico");',
            '        ctx.assert(!generico,',
            '            "El modal genérico sigue visible tras cerrar sesión.");',
            '',
            '        const apilado = await ctx.esta_visible("#modal_apilado");',
            '        ctx.assert(!apilado,',
            '            "El modal apilado sigue visible tras cerrar sesión.");',
            '',
            '        const impresion = await ctx.esta_visible("#opciones_impresion");',
            '        ctx.assert(!impresion,',
            '            "El modal de post-venta (#opciones_impresion) sigue visible tras cerrar sesión.");',
            '',
            '        // Los 5 modales chicos flotantes.',
            '        const ids_chicos = [',
            '            "modal_chico_impresion_reserva",',
            '            "modal_chico_impresion_pasajero",',
            '            "modal_chico_impresion_rendicion",',
            '            "modal_chico_impresion_liquidacion",',
            '            "modal_chico_impresion_cancelacion"',
            '        ];',
            '        for (const id of ids_chicos) {',
            '            const visible = await ctx.esta_visible("#" + id);',
            '            ctx.assert(!visible,',
            '                "El modal chico #" + id + " sigue visible tras cerrar sesión.");',
            '        }',
            '    }',
            '};',
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