<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda V1.5plugin.5m:
 *   - Prueba espejo de v1.5piloto.75:
 *     eliminar_usuario_limpia_nodos.
 *   - Sección "grafo" pasa a 11 pruebas.
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
        'descripcion' => 'Bump VERSION_APP a 5m',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.5l";',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.5m";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'Bump VERSION_PLUGIN a 5m',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5l";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5m";',
        ],
    ],

    // --------------------------------------------------------
    // catalogo.js
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Bump @version de catalogo.js a 5m',
        'buscar' => [
            ' * @version 1.5plugin.5l',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.5m',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar import de la prueba 40',
        'buscar' => [
            'import { prueba as limpiar_viajes_prueba_limpia_nodos } from "./prueba_39_limpiar_viajes_prueba_limpia_nodos.js";',
            '',
            'export const SECCIONES = [',
        ],
        'reemplazar' => [
            'import { prueba as limpiar_viajes_prueba_limpia_nodos } from "./prueba_39_limpiar_viajes_prueba_limpia_nodos.js";',
            'import { prueba as eliminar_usuario_limpia_nodos } from "./prueba_40_eliminar_usuario_limpia_nodos.js";',
            '',
            'export const SECCIONES = [',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar prueba 40 a la sección grafo',
        'buscar' => [
            '            eliminar_empresa_limpia_nodos,',
            '            limpiar_viajes_prueba_limpia_nodos',
            '        ]',
        ],
        'reemplazar' => [
            '            eliminar_empresa_limpia_nodos,',
            '            limpiar_viajes_prueba_limpia_nodos,',
            '            eliminar_usuario_limpia_nodos',
            '        ]',
        ],
    ],

    // --------------------------------------------------------
    // Prompt del plugin
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: estado a 5m con 40 pruebas',
        'buscar' => [
            '**Proyecto en v1.5plugin.5l.** El esqueleto del plugin está',
            'armado y funcional, tiene 39 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + grafo) y las agrupa',
            'en secciones.',
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.5m.** El esqueleto del plugin está',
            'armado y funcional, tiene 40 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + grafo) y las agrupa',
            'en secciones.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: corregir header grafo a 11 pruebas',
        'buscar' => [
            '- `grafo`: 10 pruebas. Cada una verifica la Fase 2 del',
            '  plan de optimización del grafo:',
        ],
        'reemplazar' => [
            '- `grafo`: 11 pruebas. Cada una verifica la Fase 2 del',
            '  plan de optimización del grafo:',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: agregar prueba 40 a la lista grafo',
        'buscar' => [
            '  - `limpiar_viajes_prueba_limpia_nodos`:',
            '    `limpiar_viajes_de_prueba` (v1.5piloto.74z) destruye',
            '    el subárbol completo de cada viaje antes de',
            '    desenlazarlo. Usa el endpoint `viajes/limpiar_prueba`.',
        ],
        'reemplazar' => [
            '  - `limpiar_viajes_prueba_limpia_nodos`:',
            '    `limpiar_viajes_de_prueba` (v1.5piloto.74z) destruye',
            '    el subárbol completo de cada viaje antes de',
            '    desenlazarlo. Usa el endpoint `viajes/limpiar_prueba`.',
            '  - `eliminar_usuario_limpia_nodos`: `eliminar_usuario`',
            '    (v1.5piloto.75) destruye los campos del nodo usuario,',
            '    el banco con sus hijos, el nodo credencial con sus',
            '    campos, y las sesiones activas del usuario.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: última actualización a 5m',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.5l',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.5m',
            '(prueba espejo de v1.5piloto.75:',
            '`eliminar_usuario_limpia_nodos`. Verifica que',
            '`eliminar_usuario` destruye los campos del nodo usuario,',
            'el banco con sus hijos, el nodo credencial con sus',
            'campos, y las sesiones activas. Mide huérfanos con',
            '`grafo/resumen`. La sección "grafo" pasa a 11 pruebas.).',
            'Antes: v1.5plugin.5l',
        ],
    ],

    // --------------------------------------------------------
    // Prueba 40
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_40_eliminar_usuario_limpia_nodos.js',
        'descripcion' => 'Prueba 40: eliminar usuario limpia nodos',
        'contenido' => [
            '/**',
            ' * Prueba: eliminar_usuario limpia el subárbol del usuario.',
            ' *',
            ' * Verifica la Fase 2 del plan de optimización del grafo',
            ' * (v1.5piloto.75). Antes, `eliminar_usuario` destruía el',
            ' * nodo usuario pero dejaba huérfanos:',
            ' *  - sus campos (nivel, nombre_real, email, efectivo),',
            ' *  - el contenedor `banco` con sus hijos (nombre, cuenta),',
            ' *  - el nodo credencial con sus campos (codigo_hash,',
            ' *    contrasena, intentos_fallidos, bloqueado_hasta,',
            ' *    ultimo_acceso, ip_ultimo_acceso),',
            ' *  - las sesiones activas del usuario.',
            ' *',
            ' * Mide huérfanos con `grafo/resumen`:',
            ' *   H0: antes de nada.',
            ' *   H1: después de crear el usuario. Assert H1 === H0.',
            ' *   H2: después de eliminarlo. Assert H2 === H0.',
            ' *',
            ' * Se crea un usuario nivel terminal colgando de un dueño',
            ' * existente. El alta escribe credenciales en el grafo',
            ' * aparte (codigo_hash, intentos_fallidos), así que esta',
            ' * prueba también ejerce la parte de credenciales del fix.',
            ' *',
            ' * Requisitos de entorno: al menos un dueño existente.',
            ' *',
            ' * @version 1.5plugin.5m',
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
            '// ============================================================',
            '// Prueba',
            '// ============================================================',
            '',
            'export const prueba = {',
            '    id: "eliminar_usuario_limpia_nodos",',
            '    nombre: "Grafo: eliminar usuario limpia los nodos",',
            '    descripcion: "Verifica que eliminar un usuario destruye su subárbol completo: campos del nodo usuario, banco con hijos, nodo credencial con sus campos, y sesiones activas (Fase 2 del plan de optimización, v1.5piloto.75). Mide huérfanos con grafo/resumen.",',
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
            '        // Usuario de prueba: nivel terminal, colgando del dueño.',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_usuario = "usuariograf" + sufijo;',
            '        const codigo_acceso = "cod" + sufijo;',
            '',
            '        // 1. Crear usuario.',
            '        const rc = await ctx.pedir_post("index.php", {',
            '            accion: "administrador/agregar_usuario",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_usuario,',
            '            nivel: "terminal",',
            '            dueno: nombre_dueno,',
            '            codigo_acceso,',
            '            banco_nombre: "Banco Prueba",',
            '            banco_cuenta: "0001"',
            '        });',
            '        if (!rc || !rc.exito || !rc.json || !rc.json.exito) {',
            '            throw new Error("No se pudo crear el usuario: "',
            '                + ((rc && rc.json && rc.json.error) ? rc.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const H1 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '        ctx.assert(H1 === H0,',
            '            "Crear el usuario dejó huérfanos. "',
            '            + "H0=" + H0 + ", H1=" + H1 + ", diferencia=" + (H1 - H0) + ".");',
            '',
            '        // 2. Eliminar usuario.',
            '        const rd = await ctx.pedir_post("index.php", {',
            '            accion: "administrador/eliminar_usuario",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_usuario',
            '        });',
            '        if (!rd || !rd.exito || !rd.json || !rd.json.exito) {',
            '            throw new Error("No se pudo eliminar el usuario: "',
            '                + ((rd && rd.json && rd.json.error) ? rd.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const H2 = (await _resumen_grafo(ctx, nombre_admin)).huerfanos;',
            '        const dif = H2 - H0;',
            '        ctx.assert(H2 === H0,',
            '            "eliminar_usuario dejó nodos huérfanos. "',
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