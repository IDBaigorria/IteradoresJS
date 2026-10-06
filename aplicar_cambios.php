<?php
/**
 * Aplicador de cambios — Plugin de pruebas (iteradoresJS).
 *
 * Tanda V1.5plugin.5w:
 *   - Nueva prueba 56: eliminar_huerfanos_limpia_grafo.
 *   - Bumps.
 *
 * Uso: php aplicar_cambios.php (parado en iteradoresJS/)
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    // ------------------------------------------------------------
    // ConfiguracionApli.js — bump
    // ------------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'ConfiguracionApli: bump a 5w',
        'todos' => true,
        'buscar' => ['1.5plugin.5v'],
        'reemplazar' => ['1.5plugin.5w'],
    ],

    // ------------------------------------------------------------
    // catalogo.js — bump @version
    // ------------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: bump @version a 5w',
        'buscar' => [' * @version 1.5plugin.5v'],
        'reemplazar' => [' * @version 1.5plugin.5w'],
    ],

    // ------------------------------------------------------------
    // catalogo.js — import de prueba 56
    // ------------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: import de prueba 56',
        'buscar' => [
            'import { prueba as subir_foto_reemplazo_limpia_nodos } from "./prueba_55_subir_foto_reemplazo_limpia_nodos.js";',
        ],
        'reemplazar' => [
            'import { prueba as subir_foto_reemplazo_limpia_nodos } from "./prueba_55_subir_foto_reemplazo_limpia_nodos.js";',
            'import { prueba as eliminar_huerfanos_limpia_grafo } from "./prueba_56_eliminar_huerfanos_limpia_grafo.js";',
        ],
    ],

    // ------------------------------------------------------------
    // catalogo.js — sumar prueba 56 al final de la sección grafo
    // ------------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: sumar prueba 56 a sección grafo',
        'buscar' => [
            '            editar_paradas_sin_hora_limpia_nodos,',
            '            listar_viajes_indice_comportamiento',
            '        ]',
            '    }',
            '];',
        ],
        'reemplazar' => [
            '            editar_paradas_sin_hora_limpia_nodos,',
            '            listar_viajes_indice_comportamiento,',
            '            eliminar_huerfanos_limpia_grafo',
            '        ]',
            '    }',
            '];',
        ],
    ],

    // ------------------------------------------------------------
    // Prueba 56 (nueva)
    // ------------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_56_eliminar_huerfanos_limpia_grafo.js',
        'descripcion' => 'Prueba 56: eliminar huérfanos limpia el grafo',
        'contenido' => [
            '/**',
            ' * Prueba: eliminar huérfanos deja el grafo sin basura.',
            ' *',
            ' * Llama al endpoint `grafo/eliminar_huerfanos` del piloto y',
            ' * verifica que después no queden huérfanos. El test depende',
            ' * del estado: si el grafo ya está limpio, pasa con',
            ' * console.warn. El plugin no puede crear huérfanos',
            ' * artificialmente (no tiene acceso directo al grafo).',
            ' *',
            ' * @version 1.5plugin.5w',
            ' * @since 1.5plugin.5w',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfiguracionApli.js";',
            'import { cerrar_modales_si_abiertos } from "./_helpers.js";',
            '',
            'async function _contar_huerfanos(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen",',
            '        nombre_solicitante',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo consultar grafo/resumen: "',
            '            + (r && r.json && r.json.error ? r.json.error : "(sin detalle)"));',
            '    }',
            '    return r.json.resumen.huerfanos;',
            '}',
            '',
            'export const prueba = {',
            '    id: "eliminar_huerfanos_limpia_grafo",',
            '    nombre: "Grafo: eliminar huérfanos",',
            '    descripcion: "Verifica que grafo/eliminar_huerfanos deja el grafo sin huérfanos.",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '        await cerrar_modales_si_abiertos(ctx);',
            '',
            '        const r_nombre = await ctx.nombre_usuario_actual();',
            '        if (!r_nombre || !r_nombre.exito) {',
            '            throw new Error("No se pudo leer el nombre del admin");',
            '        }',
            '        const nombre_admin = r_nombre.nombre_usuario;',
            '',
            '        const H0 = await _contar_huerfanos(ctx, nombre_admin);',
            '',
            '        if (H0 === 0) {',
            '            console.warn("El grafo ya estaba limpio. Prueba saltada.");',
            '            return;',
            '        }',
            '',
            '        const r_elim = await ctx.pedir_post("index.php", {',
            '            accion: "grafo/eliminar_huerfanos",',
            '            nombre_solicitante: nombre_admin',
            '        });',
            '        ctx.assert(r_elim && r_elim.exito && r_elim.json && r_elim.json.exito,',
            '            "Falló eliminar_huerfanos: "',
            '            + (r_elim && r_elim.json && r_elim.json.error ? r_elim.json.error : "(sin detalle)"));',
            '',
            '        const H1 = await _contar_huerfanos(ctx, nombre_admin);',
            '        ctx.assert(H1 === 0,',
            '            "Después de eliminar siguen habiendo huérfanos. "',
            '            + "Antes: " + H0 + ", después: " + H1',
            '            + ", eliminados reportados: " + (r_elim.json.eliminados || 0));',
            '    }',
            '};',
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
echo "[INFO] $total_reemplazos reemplazo(s) en " . count($reemplazos_por_archivo) . " archivo(s), " . count($creaciones) . " a crear.\n\n";
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
        $es_todos = !empty($cambio['todos']);
        $ocurrencias = contar_ocurrencias($contenido, $buscar_str);
        if ($ocurrencias === 0) { $bloques_fallidos[] = "$archivo_rel: NO ENCONTRADO - {$cambio['descripcion']}"; $hubo_error = true; continue; }
        if (!$es_todos && $ocurrencias > 1) { $bloques_fallidos[] = "$archivo_rel: AMBIGUO ($ocurrencias) - {$cambio['descripcion']}"; $hubo_error = true; continue; }
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