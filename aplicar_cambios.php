<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda v1.5plugin.4a — fix de timing en el llenado de pasajeros.
 *
 * Problema: cuando se escribe el DNI del pasajero, se dispara
 * `_buscar_pasajero_por_dni` (fetch). Al volver, si el pasajero no
 * existe, el piloto hace `_limpiar_campos_pasajero(index)` y borra
 * todo lo que hayamos escrito. El helper `llenar_pasajero` escribía
 * el apellido a los 600ms y el fetch podía tardar más, así que el
 * apellido quedaba borrado y la venta fallaba con "Apellido: Este
 * campo es obligatorio".
 *
 * Fix: `llenar_pasajero` y `llenar_comprador` esperan a que el aviso
 * del DNI se resuelva (a "no registrado" o a "Datos actualizados…")
 * antes de escribir el resto de los campos.
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
    // Aplicacion/pruebas/_helpers.js — reemplazo de llenar_pasajero
    // y llenar_comprador + helper nuevo esperar_aviso_dni
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: bump de version a 1.5plugin.4a',
        'buscar' => [
            ' * @version 1.5plugin.4',
            ' */',
            '',
            'import { CODIGO_TERMINAL1, NOMBRE_DUENO_PRUEBA } from "../ConfPlugin.js";',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4a',
            ' */',
            '',
            'import { CODIGO_TERMINAL1, NOMBRE_DUENO_PRUEBA } from "../ConfPlugin.js";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: helper esperar_aviso_dni',
        'buscar' => [
            'export async function llenar_comprador(ctx, datos) {',
        ],
        'reemplazar' => [
            '// ============================================================',
            '// Espera a que el aviso del DNI se resuelva',
            '// ============================================================',
            '',
            '// Texto esperado en el aviso del pasajero/comprador cuando el',
            '// DNI no esta registrado.',
            'const _TEXTOS_NO_REGISTRADO = ["no registrado", "complete los datos"];',
            '// Textos esperados cuando el DNI SI esta registrado (vienen de',
            '// _calcular_antiguedad_datos: "Datos actualizados hoy / ayer /',
            '// hace N dias / meses / anios").',
            'const _TEXTOS_REGISTRADO = ["actualizados", "actualizado"];',
            '',
            'function _aviso_esta_resuelto(texto) {',
            '    if (!texto) return false;',
            '    const t = String(texto).toLowerCase();',
            '    for (const frag of _TEXTOS_NO_REGISTRADO) {',
            '        if (t.indexOf(frag) !== -1) return true;',
            '    }',
            '    for (const frag of _TEXTOS_REGISTRADO) {',
            '        if (t.indexOf(frag) !== -1) return true;',
            '    }',
            '    return false;',
            '}',
            '',
            '// Espera hasta que el aviso de un pasajero o del comprador',
            '// deje de decir "Buscando..." y muestre una resolucion.',
            'async function esperar_aviso_dni(ctx, selector_aviso, timeout_ms = 5000) {',
            '    const inicio = Date.now();',
            '    while (Date.now() - inicio < timeout_ms) {',
            '        const texto = await ctx.texto(selector_aviso);',
            '        if (_aviso_esta_resuelto(texto)) return texto;',
            '        await ctx.pausa(150);',
            '    }',
            '    return null;',
            '}',
            '',
            'export async function llenar_comprador(ctx, datos) {',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: llenar_comprador espera aviso antes de escribir el resto',
        'buscar' => [
            'export async function llenar_comprador(ctx, datos) {',
            '    if (datos.dni !== undefined) {',
            '        await ctx.escribir("#comprador_dni", datos.dni);',
            '        await ctx.pausa(600);',
            '    }',
            '    if (datos.apellido !== undefined) await ctx.escribir("#comprador_apellido", datos.apellido);',
            '    if (datos.nombres !== undefined) await ctx.escribir("#comprador_nombres", datos.nombres);',
            '    if (datos.email !== undefined) await ctx.escribir("#comprador_email", datos.email);',
            '    if (datos.celular !== undefined) await ctx.escribir("#comprador_celular", datos.celular);',
            '}',
        ],
        'reemplazar' => [
            'export async function llenar_comprador(ctx, datos) {',
            '    if (datos.dni !== undefined) {',
            '        await ctx.escribir("#comprador_dni", datos.dni);',
            '        // Esperar a que la busqueda del DNI termine antes de',
            '        // escribir el resto, porque si el DNI no esta registrado',
            '        // el piloto limpia los campos.',
            '        await esperar_aviso_dni(ctx, "#comprador_aviso_autocompletado", 5000);',
            '    }',
            '    if (datos.apellido !== undefined) await ctx.escribir("#comprador_apellido", datos.apellido);',
            '    if (datos.nombres !== undefined) await ctx.escribir("#comprador_nombres", datos.nombres);',
            '    if (datos.email !== undefined) await ctx.escribir("#comprador_email", datos.email);',
            '    if (datos.celular !== undefined) await ctx.escribir("#comprador_celular", datos.celular);',
            '}',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: llenar_pasajero espera aviso antes de escribir el resto',
        'buscar' => [
            'export async function llenar_pasajero(ctx, index, datos) {',
            '    if (datos.dni !== undefined) {',
            '        await ctx.escribir(`#pasajero_dni_${index}`, datos.dni);',
            '        await ctx.pausa(600);',
            '    }',
            '    if (datos.apellido !== undefined) await ctx.escribir(`#pasajero_apellido_${index}`, datos.apellido);',
            '    if (datos.nombres !== undefined) await ctx.escribir(`#pasajero_nombres_${index}`, datos.nombres);',
            '    if (datos.email !== undefined) await ctx.escribir(`#pasajero_email_${index}`, datos.email);',
            '    if (datos.celular !== undefined) await ctx.escribir(`#pasajero_celular_${index}`, datos.celular);',
            '    if (datos.celular_emergencia !== undefined) await ctx.escribir(`#pasajero_emergencia_${index}`, datos.celular_emergencia);',
            '    if (datos.fecha_nacimiento !== undefined) await ctx.escribir(`#pasajero_fecha_nacimiento_${index}`, datos.fecha_nacimiento);',
            '    if (datos.direccion !== undefined) await ctx.escribir(`#pasajero_direccion_${index}`, datos.direccion);',
            '    if (datos.localidad !== undefined) await ctx.escribir(`#pasajero_localidad_${index}`, datos.localidad);',
            '}',
        ],
        'reemplazar' => [
            'export async function llenar_pasajero(ctx, index, datos) {',
            '    if (datos.dni !== undefined) {',
            '        await ctx.escribir(`#pasajero_dni_${index}`, datos.dni);',
            '        // Esperar a que la busqueda del DNI termine antes de',
            '        // escribir el resto, porque si el DNI no esta registrado',
            '        // el piloto limpia los campos.',
            '        await esperar_aviso_dni(ctx, `#pasajero_aviso_${index}`, 5000);',
            '    }',
            '    if (datos.apellido !== undefined) await ctx.escribir(`#pasajero_apellido_${index}`, datos.apellido);',
            '    if (datos.nombres !== undefined) await ctx.escribir(`#pasajero_nombres_${index}`, datos.nombres);',
            '    if (datos.email !== undefined) await ctx.escribir(`#pasajero_email_${index}`, datos.email);',
            '    if (datos.celular !== undefined) await ctx.escribir(`#pasajero_celular_${index}`, datos.celular);',
            '    if (datos.celular_emergencia !== undefined) await ctx.escribir(`#pasajero_emergencia_${index}`, datos.celular_emergencia);',
            '    if (datos.fecha_nacimiento !== undefined) await ctx.escribir(`#pasajero_fecha_nacimiento_${index}`, datos.fecha_nacimiento);',
            '    if (datos.direccion !== undefined) await ctx.escribir(`#pasajero_direccion_${index}`, datos.direccion);',
            '    if (datos.localidad !== undefined) await ctx.escribir(`#pasajero_localidad_${index}`, datos.localidad);',
            '}',
        ],
    ],

    // ============================================================
    // Bump de version en los archivos tocados por v1.5plugin.4
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: bump a 1.5plugin.4a',
        'buscar' => [
            ' * @version 1.5plugin.4',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4a',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_APP a 1.5plugin.4a',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.4";',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.4a";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_PLUGIN a 1.5plugin.4a',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4a";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'contenido.js: bump a 1.5plugin.4a',
        'buscar' => [
            ' * @version 1.5plugin.4',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4a',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: bump a 1.5plugin.4a',
        'buscar' => [
            ' * @version 1.5plugin.4',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4a',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo.js: bump a 1.5plugin.4a',
        'buscar' => [
            ' * @version 1.5plugin.4',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4a',
        ],
    ],

    // ============================================================
    // prompts/prompt_plugin_piloto.md
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: bump a v1.5plugin.4a',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.4 (pruebas de',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.4a (fix de',
            'timing en `_helpers.js`: `llenar_pasajero` y `llenar_comprador`',
            'ahora esperan a que la búsqueda del DNI se resuelva antes de',
            'escribir el resto de los campos. Antes se escribían a los 600ms',
            'y si el fetch tardaba más, el piloto limpiaba los campos al',
            'recibir "no registrado", dejando apellido vacío y la venta',
            'fallando con "Apellido: Este campo es obligatorio").',
            'Antes: v1.5plugin.4 (pruebas de',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: leccion de timing',
        'buscar' => [
            '- **`offsetParent` no sirve para chequear visibilidad de',
        ],
        'reemplazar' => [
            '- **Los helpers que llenan formularios con autocompletado por',
            '  DNI deben esperar a que la búsqueda se resuelva antes de',
            '  escribir el resto.** El piloto limpia los campos del pasajero',
            '  cuando el DNI no está registrado (`_limpiar_campos_pasajero`).',
            '  Si el helper escribe el apellido antes de que vuelva el fetch,',
            '  el piloto lo borra y la venta falla con "Apellido: Este campo',
            '  es obligatorio". Fix en v1.5plugin.4a: helper',
            '  `esperar_aviso_dni` que espera a que el aviso diga',
            '  "no registrado" o "Datos actualizados...".',
            '- **`offsetParent` no sirve para chequear visibilidad de',
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