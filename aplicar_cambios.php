<?php
/**
 * Aplicador de cambios — Proyecto iteradoresJS (plugin de pruebas).
 *
 * Tanda V1.5plugin.6a (prueba 58 corregida, enfoque de navegación).
 *   - Aplicacion/pruebas/prueba_58_venta_terminal_arbol_dual.js:
 *     reescrita. En lugar de buscar el nodo venta por ID (que no es
 *     estable entre cargas), verifica la pertenencia navegando por
 *     los dos árboles con la subacción que ya existe:
 *       - `ventas/listar` con tipo=dueno recorre privado/ventas con
 *         hmi/hd/p.
 *       - `ventas/listar` con tipo=terminal recorre el compartido del
 *         terminal con hmi_<term>/hd_<term>/p_<term>.
 *     Si la venta aparece en los dos listados, está en los dos árboles.
 *
 * Uso (parado en iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_58_venta_terminal_arbol_dual.js',
        'descripcion' => 'Prueba 58: reescrita con navegación por árboles',
        'contenido' => [
            '/**',
            ' * Prueba: una venta hecha por un terminal aparece en',
            ' * AMBOS árboles paralelos.',
            ' *',
            ' * Verifica la Fase B2.3.4 (v1.5piloto.77e): al vender,',
            ' * la venta se inserta en el árbol del dueño (enlaces',
            ' * `hmi`/`hd`/`p`) Y en el árbol del compartido del terminal',
            ' * (enlaces `hmi_<term>`/`hd_<term>`/`p_<term>`).',
            ' *',
            ' * Enfoque: no se busca el nodo venta por ID (los IDs',
            ' * no-especiales no son estables entre cargas del grafo).',
            ' * Se verifica la pertenencia navegando desde la raíz:',
            ' *   - `ventas/listar` con tipo=dueno recorre el árbol del',
            ' *     dueño (privado/ventas) con hmi/hd/p.',
            ' *   - `ventas/listar` con tipo=terminal recorre el árbol del',
            ' *     compartido del terminal con hmi_<term>/hd_<term>/p_<term>.',
            ' * Si la venta aparece en los dos listados, está en los dos',
            ' * árboles.',
            ' *',
            ' * @version 1.5plugin.6a',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfiguracionApli.js";',
            'import {',
            '    login_terminal,',
            '    ir_a_viajes_y_abrir_primero,',
            '    abrir_primer_micro_con_libres,',
            '    seleccionar_n_asientos,',
            '    abrir_modal_confirmacion,',
            '    setear_metodo_y_cuotas,',
            '    confirmar_venta,',
            '    obtener_id_ultima_venta,',
            '    cancelar_venta,',
            '    cerrar_form_venta_y_liberar,',
            '    datos_comprador_aleatorio,',
            '    datos_pasajero_aleatorio,',
            '    llenar_comprador,',
            '    llenar_pasajero',
            '} from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "venta_terminal_arbol_dual",',
            '    nombre: "Grafo: venta del terminal aparece en ambos árboles",',
            '    descripcion: "Verifica que al vender un terminal, la venta aparece tanto en el listado del dueño (árbol hmi/hd/p) como en el listado del propio terminal (árbol hmi_<term>/hd_<term>/p_<term> del compartido). Fase B2.3.4, v1.5piloto.77e.",',
            '    async ejecutar(ctx) {',
            '        // 1. Login terminal y hacer una venta rápida.',
            '        await login_terminal(ctx);',
            '',
            '        await ir_a_viajes_y_abrir_primero(ctx);',
            '        await abrir_primer_micro_con_libres(ctx);',
            '        await seleccionar_n_asientos(ctx, 1);',
            '        await abrir_modal_confirmacion(ctx);',
            '',
            '        const comprador = datos_comprador_aleatorio();',
            '        const pasajero = datos_pasajero_aleatorio(0);',
            '        await llenar_comprador(ctx, comprador);',
            '        await llenar_pasajero(ctx, 0, pasajero);',
            '',
            '        await setear_metodo_y_cuotas(ctx, "efectivo", 1);',
            '        await confirmar_venta(ctx);',
            '',
            '        const id_venta = await obtener_id_ultima_venta(ctx);',
            '        if (!id_venta) throw new Error("No se obtuvo id_venta");',
            '',
            '        // 2. Leer el nombre del terminal y resolver su dueño desde',
            '        // el page (usuarios/mi_perfil devuelve `dueno` para terminal).',
            '        const r_nombre_term = await ctx.nombre_usuario_actual();',
            '        if (!r_nombre_term || !r_nombre_term.exito) {',
            '            throw new Error("No se pudo leer el nombre del terminal");',
            '        }',
            '        const nombre_term = r_nombre_term.nombre_usuario;',
            '',
            '        const r_perfil = await ctx.pedir_post("index.php", {',
            '            accion: "usuarios/mi_perfil",',
            '            nombre_solicitante: nombre_term',
            '        });',
            '        if (!r_perfil || !r_perfil.json || !r_perfil.json.exito || !r_perfil.json.perfil) {',
            '            throw new Error("No se pudo leer el perfil del terminal: "',
            '                + JSON.stringify(r_perfil && r_perfil.json ? r_perfil.json : r_perfil));',
            '        }',
            '        const nombre_dueno = r_perfil.json.perfil.dueno || "";',
            '        ctx.assert(nombre_dueno !== "",',
            '            "El perfil del terminal no incluye el dueño.");',
            '',
            '        // 3. Verificar que la venta esté en el árbol del DUEÑO.',
            '        // `ventas/listar` con tipo=dueno recorre privado/ventas',
            '        // (hmi/hd/p) desde la raíz `usuarios`.',
            '        const r_dueno = await ctx.pedir_post("index.php", {',
            '            accion: "ventas/listar",',
            '            tipo: "dueno",',
            '            nombre: nombre_dueno',
            '        });',
            '        if (!r_dueno || !r_dueno.json || !r_dueno.json.exito) {',
            '            throw new Error("ventas/listar (dueno) devolvió error: "',
            '                + JSON.stringify(r_dueno && r_dueno.json ? r_dueno.json : r_dueno));',
            '        }',
            '        const ventas_dueno = r_dueno.json.ventas || [];',
            '        const esta_en_arbol_dueno = ventas_dueno.some(v => v && v.id_venta === id_venta);',
            '        ctx.assert(esta_en_arbol_dueno,',
            '            "La venta " + id_venta + " NO aparece en el árbol del dueño (privado/ventas). "',
            '            + "Total de ventas listadas para el dueño: " + ventas_dueno.length + ". "',
            '            + "¿Se insertó correctamente en el árbol hmi/hd/p del dueño?");',
            '',
            '        // 4. Verificar que la venta esté en el árbol del COMPARTIDO',
            '        // del terminal. `ventas/listar` con tipo=terminal navega',
            '        // por `_contexto_terminal`, que después del repuntado es',
            '        // el compartido, y recorre su árbol con hmi_<term>/hd_<term>/p_<term>.',
            '        const r_term = await ctx.pedir_post("index.php", {',
            '            accion: "ventas/listar",',
            '            tipo: "terminal",',
            '            nombre: nombre_term',
            '        });',
            '        if (!r_term || !r_term.json || !r_term.json.exito) {',
            '            throw new Error("ventas/listar (terminal) devolvió error: "',
            '                + JSON.stringify(r_term && r_term.json ? r_term.json : r_term));',
            '        }',
            '        const ventas_term = r_term.json.ventas || [];',
            '        const esta_en_arbol_term = ventas_term.some(v => v && v.id_venta === id_venta);',
            '        ctx.assert(esta_en_arbol_term,',
            '            "La venta " + id_venta + " NO aparece en el árbol del compartido del terminal " + nombre_term + ". "',
            '            + "Total de ventas listadas para el terminal: " + ventas_term.length + ". "',
            '            + "¿Se insertó correctamente en el árbol hmi_<term>/hd_<term>/p_<term> del compartido?");',
            '',
            '        // 5. Cerrar modales y cancelar la venta para limpiar el estado.',
            '        // El admin no es necesario para cancelar: el terminal puede',
            '        // cancelar sus propias ventas (viene con la sesión activa).',
            '        await cerrar_form_venta_y_liberar(ctx);',
            '        await cancelar_venta(ctx, id_venta, "Cancelada por prueba automatica (arbol_dual)");',
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
        $ocurrencias = contar_ocurrencias($contenido, $buscar_str);
        if ($ocurrencias === 0) { $bloques_fallidos[] = "$archivo_rel: NO ENCONTRADO - {$cambio['descripcion']}"; $hubo_error = true; continue; }
        if ($ocurrencias > 1) { $bloques_fallidos[] = "$archivo_rel: AMBIGUO ($ocurrencias) - {$cambio['descripcion']}"; $hubo_error = true; continue; }
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
foreach ($creaciones as $c) { $r = $raiz_proyecto.'/'.$c['archivo']; if (!is_dir(dirname($r))) mkdir(dirname($r), 0777, true); if (file_put_contents($r, implode("\n", $c['contenido']))===false){echo "[FALLO] Crear: {$c['archivo']}\n";continue;} echo "[OK] {$c['archivo']} (sobrescrito)\n"; }
echo "\n=== Resumen ===\nBloques aplicados: $bloques_ok\nArchivos nuevos:   " . count($creaciones) . "\n";
if (!empty($bloques_fallidos)) { echo "Fallos: " . count($bloques_fallidos) . "\n"; foreach ($bloques_fallidos as $f) echo "  - $f\n"; }
echo "\nListo.\n";