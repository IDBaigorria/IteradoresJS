<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda V1.5plugin.5l:
 *   - Prueba espejo de v1.5piloto.74z:
 *     limpiar_viajes_prueba_limpia_nodos.
 *   - Sección "grafo" pasa a 10 pruebas.
 *   - Bump de ConfPlugin, catálogo y prompt.
 *   - Fix de documentación: el header de la sección grafo en el
 *     prompt decía "4 pruebas" (quedó desactualizado en 5i).
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
        'descripcion' => 'Bump VERSION_APP a 5l',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.5k";',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.5l";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'Bump VERSION_PLUGIN a 5l',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5k";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5l";',
        ],
    ],

    // --------------------------------------------------------
    // catalogo.js
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Bump @version de catalogo.js a 5l',
        'buscar' => [
            ' * @version 1.5plugin.5k',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.5l',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar import de la prueba 39',
        'buscar' => [
            'import { prueba as eliminar_empresa_limpia_nodos } from "./prueba_38_eliminar_empresa_limpia_nodos.js";',
            '',
            'export const SECCIONES = [',
        ],
        'reemplazar' => [
            'import { prueba as eliminar_empresa_limpia_nodos } from "./prueba_38_eliminar_empresa_limpia_nodos.js";',
            'import { prueba as limpiar_viajes_prueba_limpia_nodos } from "./prueba_39_limpiar_viajes_prueba_limpia_nodos.js";',
            '',
            'export const SECCIONES = [',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar prueba 39 a la sección grafo',
        'buscar' => [
            '            eliminar_vehiculo_limpia_nodos,',
            '            eliminar_empresa_limpia_nodos',
            '        ]',
        ],
        'reemplazar' => [
            '            eliminar_vehiculo_limpia_nodos,',
            '            eliminar_empresa_limpia_nodos,',
            '            limpiar_viajes_prueba_limpia_nodos',
            '        ]',
        ],
    ],

    // --------------------------------------------------------
    // Prompt del plugin
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: estado a 5l con 39 pruebas',
        'buscar' => [
            '**Proyecto en v1.5plugin.5k.** El esqueleto del plugin está',
            'armado y funcional, tiene 38 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + grafo) y las agrupa',
            'en secciones.',
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.5l.** El esqueleto del plugin está',
            'armado y funcional, tiene 39 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + grafo) y las agrupa',
            'en secciones.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: corregir header grafo a 10 pruebas',
        'buscar' => [
            '- `grafo`: 4 pruebas. Cada una verifica la Fase 2 del',
            '  plan de optimización del grafo:',
        ],
        'reemplazar' => [
            '- `grafo`: 10 pruebas. Cada una verifica la Fase 2 del',
            '  plan de optimización del grafo:',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: agregar prueba 39 a la lista grafo',
        'buscar' => [
            '  - `eliminar_empresa_limpia_nodos`: `eliminar_empresa`',
            '    (v1.5piloto.74y) destruye la empresa y todos sus',
            '    vehículos completos.',
        ],
        'reemplazar' => [
            '  - `eliminar_empresa_limpia_nodos`: `eliminar_empresa`',
            '    (v1.5piloto.74y) destruye la empresa y todos sus',
            '    vehículos completos.',
            '  - `limpiar_viajes_prueba_limpia_nodos`:',
            '    `limpiar_viajes_de_prueba` (v1.5piloto.74z) destruye',
            '    el subárbol completo de cada viaje antes de',
            '    desenlazarlo. Usa el endpoint `viajes/limpiar_prueba`.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: última actualización a 5l',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.5k',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.5l',
            '(prueba espejo de v1.5piloto.74z:',
            '`limpiar_viajes_prueba_limpia_nodos`. Verifica que',
            '`limpiar_viajes_de_prueba` destruye el subárbol completo',
            'de cada viaje de prueba antes de desenlazarlo. Mide',
            'huérfanos con `grafo/resumen`. La sección "grafo" pasa a',
            '10 pruebas.).',
            'Antes: v1.5plugin.5k',
        ],
    ],

    // --------------------------------------------------------
    // Prueba 39
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_39_limpiar_viajes_prueba_limpia_nodos.js',
        'descripcion' => 'Prueba 39: limpiar viajes de prueba limpia nodos',
        'contenido' => [
            '/**',
            ' * Prueba: limpiar_viajes_de_prueba limpia el subárbol.',
            ' *',
            ' * Verifica la Fase 2 del plan de optimización del grafo',
            ' * (v1.5piloto.74z). Antes, `limpiar_viajes_de_prueba`',
            ' * (llamada por el endpoint `viajes/limpiar_prueba`)',
            ' * desenlazaba los viajes de prueba del contenedor del',
            ' * dueño sin destruirlos, dejando el mismo subárbol',
            ' * huérfano que `eliminar_viaje` antes de v74r',
            ' * (~250 nodos por micro).',
            ' *',
            ' * Mide huérfanos con `grafo/resumen`:',
            ' *   H0: antes de nada.',
            ' *   H1: después de crear un viaje con prefijo',
            ' *       "viajeprueba". Assert H1 === H0.',
            ' *   H2: después de llamar a viajes/limpiar_prueba.',
            ' *       Assert H2 <= H0.',
            ' *',
            ' * El assert H2 <= H0 (y no ===) es a propósito: si el',
            ' * dueño tenía otros viajes de prueba huérfanos de',
            ' * corridas anteriores, la limpieza los borra también.',
            ' * Lo importante es que limpiar no agregue huérfanos.',
            ' *',
            ' * Requisitos de entorno: solo un dueño existente.',
            ' *',
            ' * @version 1.5plugin.5l',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            '',
            '// ============================================================',
            '// Helpers internos',
            '// ============================================================',
            '',
            'async function _resumen_grafo(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen",',
            '        nombre_solicitante',
            '    });',
            '    if (!r || !r.exito) {',
            '        throw new Error("Error de red al consultar grafo/resumen: " + (r && r.error ? r.error : "(sin detalle)"));',
            '    }',
            '    if (!r.json || !r.json.exito) {',
            '        throw new Error("grafo/resumen devolvió error: " + (r.json && r.json.error ? r.json.error : "(sin detalle)"));',
            '    }',
            '    const j = r.json.resumen || {};',
            '    if (typeof j.huerfanos !== "number" || typeof j.total !== "number") {',
            '        throw new Error("grafo/resumen no devolvió huerfanos/total. Respuesta: " + JSON.stringify(j).slice(0, 200));',
            '    }',
            '    return j;',
            '}',
            '',
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "administrador/listar_duenos",',
            '        nombre_solicitante',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo listar dueños: "',
            '            + ((r && r.json && r.json.error) ? r.json.error : "(sin detalle)"));',
            '    }',
            '    const lista = r.json.duenos || [];',
            '    if (!Array.isArray(lista) || lista.length === 0) {',
            '        throw new Error("No hay dueños disponibles.");',
            '    }',
            '    const primero = lista[0];',
            '    const nombre = typeof primero === "string"',
            '        ? primero',
            '        : (primero.nombre_usuario || primero.nombre || primero.usuario);',
            '    if (!nombre) {',
            '        throw new Error("No se pudo determinar el nombre del dueño: "',
            '            + JSON.stringify(primero).slice(0, 200));',
            '    }',
            '    return nombre;',
            '}',
            '',
            'function _fecha_manana() {',
            '    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);',
            '    return d.getFullYear() + "-"',
            '        + String(d.getMonth() + 1).padStart(2, "0") + "-"',
            '        + String(d.getDate()).padStart(2, "0");',
            '}',
            '',
            '// ============================================================',
            '// Prueba',
            '// ============================================================',
            '',
            'export const prueba = {',
            '    id: "limpiar_viajes_prueba_limpia_nodos",',
            '    nombre: "Grafo: limpiar viajes de prueba limpia los nodos",',
            '    descripcion: "Verifica que limpiar_viajes_de_prueba destruye el subárbol completo de cada viaje antes de desenlazarlo (Fase 2 del plan de optimización, v1.5piloto.74z). Usa el endpoint viajes/limpiar_prueba. Mide huérfanos con grafo/resumen.",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '',
            '        const r_nombre = await ctx.nombre_usuario_actual();',
            '        if (!r_nombre || !r_nombre.exito) {',
            '            throw new Error("No se pudo leer el nombre de usuario del admin: "',
            '                + (r_nombre && r_nombre.error ? r_nombre.error : "(sin detalle)"));',
            '        }',
            '        const nombre_admin = r_nombre.nombre_usuario;',
            '',
            '        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);',
            '',
            '        const H0 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '',
            '        // 1. Crear viaje con prefijo "viajeprueba".',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_viaje = "viajeprueba" + sufijo;',
            '',
            '        const rc = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/guardar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje,',
            '            nombre: "Viaje de prueba (limpieza)",',
            '            fecha: _fecha_manana(),',
            '            hora: "08:00",',
            '            origen: "Origen Test",',
            '            destino: "Destino Test",',
            '            restriccion_edad: "0",',
            '            edad_minima: "18",',
            '            edad_maxima: "80",',
            '            permite_efectivo: "1",',
            '            cuotas_efectivo_max: "3",',
            '            permite_transferencia: "1",',
            '            cuotas_transferencia_max: "1",',
            '            mostrar_dj_en_terminales: "0"',
            '        });',
            '        if (!rc || !rc.exito || !rc.json || !rc.json.exito) {',
            '            throw new Error("No se pudo crear el viaje: "',
            '                + ((rc && rc.json && rc.json.error) ? rc.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const H1 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '        ctx.assert(H1 === H0,',
            '            "Crear el viaje de prueba dejó huérfanos. "',
            '            + "H0=" + H0 + ", H1=" + H1 + ", diferencia=" + (H1 - H0) + ".");',
            '',
            '        // 2. Ejecutar la limpieza.',
            '        const rl = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/limpiar_prueba",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno',
            '        });',
            '        if (!rl || !rl.exito || !rl.json || !rl.json.exito) {',
            '            throw new Error("No se pudo ejecutar la limpieza: "',
            '                + ((rl && rl.json && rl.json.error) ? rl.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const H2 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '        const dif = H2 - H0;',
            '        ctx.assert(H2 <= H0,',
            '            "limpiar_viajes_de_prueba dejó nodos huérfanos. "',
            '            + "H0=" + H0 + ", H1=" + H1 + ", H2=" + H2',
            '            + ", diferencia vs H0=" + dif + "."',
            '            + (dif > 0 ? " Quedaron " + dif + " nodos huérfanos." : " Algo inesperado."));',
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