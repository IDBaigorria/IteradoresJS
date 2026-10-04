<?php
/**
 * Aplicador de cambios automáticos — proyecto iteradoresJS (plugin Chrome).
 *
 * Tanda v1.5plugin.4p:
 * - Corregir la prueba 18: quitar el check de `disabled` mal planteado
 *   (obtener_atributos devuelve [null], no [] cuando el atributo no está).
 * - Mover la prueba 18 de la sección "base" a una sección propia
 *   "Autocompletado".
 * - Bumps de versión.
 *
 * Uso (parado en la raíz de iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    // --------------------------------------------------------
    // prueba_18 — sobrescribir sin el check de disabled
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_18_autocompletado_dni_terminal_clientes.js',
        'descripcion' => 'Prueba 18 v2: sin el check de disabled',
        'contenido' => [
            "/**",
            " * Prueba: autocompletado por DNI con usuario terminal desde",
            " * la pestaña Pasajeros/Clientes.",
            " *",
            " * Cubre el fix v74h del piloto PHP: cuando el usuario es terminal",
            " * y no hay un viaje seleccionado, el modal de alta de pasajero",
            " * resolvía el dueño desde `viaje_seleccionado.dueno`, que podía",
            " * ser undefined. El fix usa `usuario_actual.dueno` como fallback.",
            " *",
            " * Flujo:",
            " *   1. Login como terminal.",
            " *   2. Ir a la pestaña Pasajeros/Clientes.",
            " *   3. Crear un pasajero de prueba con un DNI único.",
            " *   4. Abrir el modal de alta.",
            " *   5. Escribir el DNI.",
            " *   6. Verificar que apellido y nombres se autocompletan.",
            " *   7. Cerrar el modal.",
            " *",
            " * @version 1.5plugin.4p",
            " */",
            "",
            'import { CODIGO_TERMINAL1 } from "../ConfPlugin.js";',
            "",
            "export const prueba = {",
            '    id: "autocompletado_dni_terminal_clientes",',
            '    nombre: "Autocompletado por DNI desde Clientes (terminal)",',
            '    descripcion: "Verifica que el autocompletado por DNI funcione con usuario terminal desde la pestaña Pasajeros/Clientes, sin depender de que haya un viaje seleccionado. Cubre el fix v74h del piloto PHP.",',
            "",
            "    async ejecutar(ctx) {",
            "        // 1. Login como terminal.",
            "        await ctx.asegurar_login(CODIGO_TERMINAL1);",
            "",
            "        // 2. Activar la pestaña Pasajeros/Clientes.",
            '        const activacion = await ctx.activar_pestana_piloto("pasajeros");',
            '        ctx.assert(activacion && activacion.exito, "No se pudo activar la pestaña Pasajeros: " + (activacion && activacion.error ? activacion.error : "sin detalle"));',
            "",
            "        // 3. Esperar el botón de alta.",
            '        const espera_boton = await ctx.esperar("#boton_agregar_pasajero", 5000);',
            '        ctx.assert(espera_boton && espera_boton.exito, "No apareció el botón #boton_agregar_pasajero");',
            "",
            "        // 4. Crear un pasajero de prueba con un DNI único. Este helper",
            "        //    resuelve el dueño desde el page (usuario_actual.dueno para",
            "        //    terminal).",
            "        const dni = ctx.dni_unico();",
            '        const apellido = "Prueba";',
            '        const nombres = "Autocompletado";',
            "",
            "        const creacion = await ctx.crear_pasajero_de_prueba({",
            "            dni,",
            "            apellido,",
            "            nombres,",
            '            email: "",',
            '            celular: "2983123456",',
            '            celular_emergencia: "2983654321",',
            '            fecha_nacimiento: "1990-01-01",',
            '            direccion: "Calle Falsa 123",',
            '            localidad: "Tres Arroyos"',
            "        });",
            "",
            '        ctx.assert(creacion && creacion.exito, "No se pudo crear el pasajero de prueba: " + (creacion && creacion.error ? creacion.error : "sin detalle"));',
            "",
            "        // 5. Abrir el modal de alta.",
            '        const clic_agregar = await ctx.clic("#boton_agregar_pasajero");',
            '        ctx.assert(clic_agregar && clic_agregar.exito, "No se pudo hacer clic en Agregar pasajero");',
            "",
            "        // 6. Esperar el campo DNI dentro del modal.",
            '        const espera_dni = await ctx.esperar("#pasajero_dni_0", 5000);',
            '        ctx.assert(espera_dni && espera_dni.exito, "No apareció el campo #pasajero_dni_0 en el modal de alta");',
            "",
            "        // 7. Escribir el DNI completo. El piloto dispara la búsqueda al",
            "        //    llegar a 7-8 dígitos desde el listener de `input`.",
            '        const escritura = await ctx.escribir("#pasajero_dni_0", dni);',
            '        ctx.assert(escritura && escritura.exito, "No se pudo escribir en el campo DNI");',
            "",
            "        // 8. Esperar a que se autocomplete el apellido. Polling hasta 6s.",
            '        let apellido_leido = "";',
            "        const inicio = Date.now();",
            "        while (Date.now() - inicio < 6000) {",
            '            apellido_leido = (await ctx.valor("#pasajero_apellido_0")) || "";',
            '            if (apellido_leido.trim() !== "") break;',
            "            await ctx.pausa(200);",
            "        }",
            "",
            "        ctx.assert(",
            '            apellido_leido.trim() !== "",',
            '            "El apellido no se autocompletó. Revisá: (a) que el fix v74h esté aplicado en el piloto PHP, (b) que el pasajero de prueba se haya creado OK, (c) que el listener de input del DNI esté conectado."',
            "        );",
            "",
            "        ctx.assert(",
            "            apellido_leido === apellido,",
            '            "El apellido autocompletado (\'" + apellido_leido + "\') no coincide con el esperado (\'" + apellido + "\')"',
            "        );",
            "",
            "        // 9. Verificar nombres también.",
            '        const nombres_leidos = (await ctx.valor("#pasajero_nombres_0")) || "";',
            "        ctx.assert(",
            "            nombres_leidos === nombres,",
            '            "Los nombres autocompletados (\'" + nombres_leidos + "\') no coinciden con los esperados (\'" + nombres + "\')"',
            "        );",
            "",
            "        // 10. Cerrar el modal.",
            '        const clic_cerrar = await ctx.clic("#boton_cancelar_nuevo_pasajero");',
            '        ctx.assert(clic_cerrar && clic_cerrar.exito, "No se pudo cerrar el modal de alta de pasajero");',
            "    }",
            "};",
        ],
    ],

    // --------------------------------------------------------
    // catalogo.js — quitar prueba de base, crear sección nueva
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: sacar prueba 18 de base, agregar seccion autocompletado',
        'buscar' => [
            '        id: "base",',
            '        nombre: "Base",',
            '        pruebas: [',
            '            arranque,',
            '            login,',
            '            autocompletado_dni_terminal_clientes',
            '        ]',
            '    },',
        ],
        'reemplazar' => [
            '        id: "base",',
            '        nombre: "Base",',
            '        pruebas: [',
            '            arranque,',
            '            login',
            '        ]',
            '    },',
            '    {',
            '        id: "autocompletado",',
            '        nombre: "Autocompletado",',
            '        pruebas: [',
            '            autocompletado_dni_terminal_clientes',
            '        ]',
            '    },',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: bump @version a 1.5plugin.4p',
        'buscar' => [
            ' * @version 1.5plugin.4o',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4p',
        ],
    ],

    // --------------------------------------------------------
    // ConfPlugin.js — bumps
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin: bump VERSION_APP a 1.5plugin.4p',
        'buscar' => [
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.4o";',
        ],
        'reemplazar' => [
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.4p";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin: bump VERSION_PLUGIN a 1.5plugin.4p',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4o";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4p";',
        ],
    ],

    // --------------------------------------------------------
    // prompt_plugin_piloto.md — §7 y §9
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §7 bump a 4p',
        'buscar' => [
            '**Proyecto en v1.5plugin.4o.** El esqueleto del plugin está',
            'armado y funcional, tiene 18 pruebas (base + ventas) y las',
            'agrupa en secciones.',
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.4p.** El esqueleto del plugin está',
            'armado y funcional, tiene 18 pruebas (base + autocompletado',
            '+ ventas) y las agrupa en secciones.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt: §9 bump cabecera a 4p',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.4o (nueva',
            'prueba `autocompletado_dni_terminal_clientes`: login como',
            'terminal, ir a la pestaña Pasajeros/Clientes, crear un',
            'pasajero de prueba, abrir el modal de alta, escribir el DNI',
            'y verificar que apellido y nombres se autocompletan. Cubre',
            'el fix v74h del piloto PHP. Se agrega el helper',
            '`ctx.activar_pestana_piloto(nombre)` al service worker, que',
            'invoca `activar_pestana` del page context vía',
            '`chrome.scripting.executeScript` en MAIN world).',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.4p (se',
            'quita el check de `disabled` de la prueba',
            '`autocompletado_dni_terminal_clientes`: el helper',
            '`obtener_atributos` devuelve `[null]` cuando el atributo no',
            'existe, no `[]`; el check no aportaba valor y daba falso',
            'negativo. Además, la prueba se mueve a una sección propia',
            '`autocompletado` en la ventana).',
            'Antes: v1.5plugin.4o (nueva',
            'prueba `autocompletado_dni_terminal_clientes`: login como',
            'terminal, ir a la pestaña Pasajeros/Clientes, crear un',
            'pasajero de prueba, abrir el modal de alta, escribir el DNI',
            'y verificar que apellido y nombres se autocompletan. Cubre',
            'el fix v74h del piloto PHP. Se agrega el helper',
            '`ctx.activar_pestana_piloto(nombre)` al service worker, que',
            'invoca `activar_pestana` del page context vía',
            '`chrome.scripting.executeScript` en MAIN world).',
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