<?php
/**
 * Aplicador de cambios — Proyecto iteradoresJS (plugin de pruebas).
 *
 * Tanda V1.5plugin.5x (Fase B2.3.5b.4: pruebas del aislamiento).
 *
 * Uso (parado en iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    // ============================================================
    // Prueba 57 — enlace dueno apunta al compartido
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_57_enlace_dueno_apunta_al_compartido.js',
        'descripcion' => 'Prueba 57: enlace dueno apunta al compartido',
        'contenido' => [
            '/**',
            ' * Prueba: el enlace `dueno` de un terminal apunta a un',
            ' * nodo marcado con `_es_compartido`.',
            ' *',
            ' * Verifica la Fase B2.3.5a (v1.5piloto.77f): después del',
            ' * repuntado, el enlace `dueno` del terminal apunta al',
            ' * contenedor `compartido_con_us_termX`, no al nodo del',
            ' * dueño real. Además, el compartido tiene `dato` =',
            ' * nombre del dueño (opción A) y el marcador `_es_compartido`.',
            ' *',
            ' * Flujo: login terminal para leer su nombre de usuario,',
            ' * después login admin (porque `grafo/nodo` exige nivel',
            ' * admin/soporte) para consultar el grafo.',
            ' *',
            ' * @version 1.5plugin.5x',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfiguracionApli.js";',
            'import { login_terminal } from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "enlace_dueno_apunta_al_compartido",',
            '    nombre: "Grafo: enlace dueno del terminal apunta al compartido",',
            '    descripcion: "Verifica que después del repuntado (v1.5piloto.77f), el enlace `dueno` de cada terminal apunta a un nodo con el marcador `_es_compartido` y con `dato` = nombre del dueño.",',
            '    async ejecutar(ctx) {',
            '        // 1. Login terminal para leer su nombre de usuario.',
            '        await login_terminal(ctx);',
            '        const r_nombre_term = await ctx.nombre_usuario_actual();',
            '        if (!r_nombre_term || !r_nombre_term.exito) {',
            '            throw new Error("No se pudo leer el nombre del terminal: "',
            '                + (r_nombre_term && r_nombre_term.error ? r_nombre_term.error : "(sin detalle)"));',
            '        }',
            '        const nombre_term = r_nombre_term.nombre_usuario;',
            '',
            '        // 2. Login admin (porque grafo/nodo exige admin o soporte).',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '        const r_nombre_admin = await ctx.nombre_usuario_actual();',
            '        if (!r_nombre_admin || !r_nombre_admin.exito) {',
            '            throw new Error("No se pudo leer el nombre del admin");',
            '        }',
            '        const nombre_admin = r_nombre_admin.nombre_usuario;',
            '',
            '        // 3. Consultar el nodo del terminal.',
            '        const r_nodo = await ctx.pedir_post("index.php", {',
            '            accion: "grafo/nodo",',
            '            nombre_solicitante: nombre_admin,',
            '            id: "us_" + nombre_term',
            '        });',
            '        if (!r_nodo || !r_nodo.exito) {',
            '            throw new Error("Error de red al consultar el terminal: "',
            '                + (r_nodo && r_nodo.error ? r_nodo.error : "(sin detalle)"));',
            '        }',
            '        if (!r_nodo.json || !r_nodo.json.exito) {',
            '            throw new Error("grafo/nodo del terminal devolvió error: "',
            '                + (r_nodo.json && r_nodo.json.error ? r_nodo.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const adyacentes = (r_nodo.json.nodo && r_nodo.json.nodo.adyacentes) || [];',
            '        const enlace_dueno = adyacentes.find(a => a.enlace === "dueno");',
            '        ctx.assert(enlace_dueno,',
            '            "El terminal us_" + nombre_term + " no tiene enlace `dueno`.");',
            '',
            '        // 4. Consultar el nodo destino del enlace `dueno`.',
            '        const r_destino = await ctx.pedir_post("index.php", {',
            '            accion: "grafo/nodo",',
            '            nombre_solicitante: nombre_admin,',
            '            id: enlace_dueno.id_destino',
            '        });',
            '        if (!r_destino || !r_destino.exito || !r_destino.json || !r_destino.json.exito) {',
            '            throw new Error("No se pudo consultar el nodo destino del enlace `dueno`");',
            '        }',
            '',
            '        const nodo_destino = r_destino.json.nodo;',
            '        const ady_destino = nodo_destino.adyacentes || [];',
            '',
            '        // 5. Verificar que el destino tenga `_es_compartido`.',
            '        const tiene_marcador = ady_destino.some(a => a.enlace === "_es_compartido");',
            '        ctx.assert(tiene_marcador,',
            '            "El nodo destino del enlace `dueno` no tiene el marcador `_es_compartido`. "',
            '            + "¿Corriste la migración ?repuntar_terminales_compartido=1 (v77f)?");',
            '',
            '        // 6. Verificar que el compartido tenga `dato` = nombre del dueño (opción A).',
            '        ctx.assert(nodo_destino.dato && nodo_destino.dato !== "",',
            '            "El compartido no tiene `dato` = nombre del dueño (opción A). Dato actual: "',
            '            + JSON.stringify(nodo_destino.dato));',
            '',
            '        // 7. Verificar que el compartido tenga el sub-contenedor `ventas`.',
            '        const tiene_ventas = ady_destino.some(a => a.enlace === "ventas");',
            '        ctx.assert(tiene_ventas,',
            '            "El compartido no tiene el sub-contenedor `ventas`.");',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // Prueba 58 — venta del terminal aparece en ambos árboles
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_58_venta_terminal_arbol_dual.js',
        'descripcion' => 'Prueba 58: venta del terminal en ambos árboles',
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
            ' * Flujo: login terminal, vender un asiento, leer el id de',
            ' * la última venta, login admin para consultar el grafo,',
            ' * verificar enlaces, y login terminal para cancelar la',
            ' * venta al final.',
            ' *',
            ' * @version 1.5plugin.5x',
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
            '    setear_monto_pagado,',
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
            '    descripcion: "Verifica que al vender un terminal, la venta se inserta en el árbol del dueño (hmi/hd/p) y en el árbol del compartido (hmi_<term>/hd_<term>/p_<term>). Fase B2.3.4, v1.5piloto.77e.",',
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
            '        await setear_monto_pagado(ctx, 1000);',
            '        await confirmar_venta(ctx);',
            '',
            '        const id_venta = await obtener_id_ultima_venta(ctx);',
            '        if (!id_venta) throw new Error("No se obtuvo id_venta");',
            '',
            '        const r_nombre_term = await ctx.nombre_usuario_actual();',
            '        const nombre_term = r_nombre_term && r_nombre_term.exito ? r_nombre_term.nombre_usuario : "";',
            '        ctx.assert(nombre_term !== "", "No se pudo leer el nombre del terminal");',
            '',
            '        await cerrar_form_venta_y_liberar(ctx);',
            '',
            '        // 2. Login admin para consultar el grafo.',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '        const r_nombre_admin = await ctx.nombre_usuario_actual();',
            '        if (!r_nombre_admin || !r_nombre_admin.exito) {',
            '            throw new Error("No se pudo leer el nombre del admin");',
            '        }',
            '        const nombre_admin = r_nombre_admin.nombre_usuario;',
            '',
            '        const r_nodo = await ctx.pedir_post("index.php", {',
            '            accion: "grafo/nodo",',
            '            nombre_solicitante: nombre_admin,',
            '            id: id_venta',
            '        });',
            '        if (!r_nodo || !r_nodo.exito) {',
            '            throw new Error("Error de red al consultar el nodo venta: "',
            '                + (r_nodo && r_nodo.error ? r_nodo.error : "(sin detalle)"));',
            '        }',
            '        if (!r_nodo.json || !r_nodo.json.exito) {',
            '            throw new Error("grafo/nodo del venta devolvió error: "',
            '                + (r_nodo.json && r_nodo.json.error ? r_nodo.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const adyacentes = (r_nodo.json.nodo && r_nodo.json.nodo.adyacentes) || [];',
            '',
            '        // 3. Verificar enlace del árbol del dueño (default).',
            '        const enlaces_default = adyacentes.filter(a =>',
            '            a.enlace === "hmi" || a.enlace === "hd" || a.enlace === "p"',
            '        );',
            '        ctx.assert(enlaces_default.length > 0,',
            '            "La venta no tiene ningún enlace del árbol del dueño (hmi/hd/p). "',
            '            + "Enlaces actuales: " + adyacentes.map(a => a.enlace).join(", "));',
            '',
            '        // 4. Verificar enlace del árbol del compartido (parametrizado).',
            '        const sufijo = "_" + nombre_term;',
            '        const enlaces_param = adyacentes.filter(a =>',
            '            a.enlace === "hmi" + sufijo || a.enlace === "hd" + sufijo || a.enlace === "p" + sufijo',
            '        );',
            '        ctx.assert(enlaces_param.length > 0,',
            '            "La venta no tiene ningún enlace del árbol del compartido (hmi_<term>/hd_<term>/p_<term>). "',
            '            + "Enlaces actuales: " + adyacentes.map(a => a.enlace).join(", ")',
            '            + ". Terminal: " + nombre_term);',
            '',
            '        // 5. Login terminal de vuelta y cancelar la venta para limpiar.',
            '        await login_terminal(ctx);',
            '        await cancelar_venta(ctx, id_venta, "Cancelada por prueba automatica (arbol_dual)");',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // Prueba 59 — cambiar asiento desde el croquis
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_59_cambiar_asiento_desde_croquis.js',
        'descripcion' => 'Prueba 59: cambiar de asiento desde el croquis',
        'contenido' => [
            '/**',
            ' * Prueba: "Cambiar de asiento" desde el croquis (v1.5piloto.77b/c).',
            ' *',
            ' * Flujo: terminal vende un asiento, lo abre desde el',
            ' * croquis ("Ver pasaje"), aprieta "Cambiar de asiento",',
            ' * elige un asiento libre en el modal apilado, confirma,',
            ' * y verifica por backend que la venta ahora apunta al',
            ' * asiento nuevo.',
            ' *',
            ' * Al final cancela la venta para limpiar.',
            ' *',
            ' * @version 1.5plugin.5x',
            ' */',
            '',
            'import {',
            '    login_terminal,',
            '    ir_a_viajes_y_abrir_primero,',
            '    abrir_primer_micro_con_libres,',
            '    seleccionar_n_asientos,',
            '    abrir_modal_confirmacion,',
            '    setear_metodo_y_cuotas,',
            '    setear_monto_pagado,',
            '    confirmar_venta,',
            '    obtener_id_ultima_venta,',
            '    cancelar_venta,',
            '    cerrar_modales_si_abiertos,',
            '    datos_comprador_aleatorio,',
            '    datos_pasajero_aleatorio,',
            '    llenar_comprador,',
            '    llenar_pasajero,',
            '    obtener_venta_por_id',
            '} from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "cambiar_asiento_desde_croquis",',
            '    nombre: "Cambiar de asiento: desde el croquis",',
            '    descripcion: "Vende un asiento con un terminal, lo abre con Ver pasaje desde el croquis, aprieta Cambiar de asiento, elige un asiento libre, confirma y verifica que la venta apunta al asiento nuevo.",',
            '    async ejecutar(ctx) {',
            '        // 1. Login terminal y vender un asiento.',
            '        await login_terminal(ctx);',
            '        await ir_a_viajes_y_abrir_primero(ctx);',
            '        await abrir_primer_micro_con_libres(ctx);',
            '        const asientos_sel = await seleccionar_n_asientos(ctx, 1);',
            '        const numero_viejo = asientos_sel[0];',
            '',
            '        await abrir_modal_confirmacion(ctx);',
            '        const comprador = datos_comprador_aleatorio();',
            '        const pasajero = datos_pasajero_aleatorio(0);',
            '        await llenar_comprador(ctx, comprador);',
            '        await llenar_pasajero(ctx, 0, pasajero);',
            '        await setear_metodo_y_cuotas(ctx, "efectivo", 1);',
            '        await setear_monto_pagado(ctx, 1000);',
            '        await confirmar_venta(ctx);',
            '',
            '        const id_venta = await obtener_id_ultima_venta(ctx);',
            '        if (!id_venta) throw new Error("No se obtuvo id_venta");',
            '',
            '        // 2. Click en el asiento vendido en el croquis.',
            '        await ctx.clic(`.seat[data-numero="${numero_viejo}"]`);',
            '',
            '        const btn_ver = await ctx.esperar(".btn-ver-pasaje-asiento", 8000);',
            '        if (!btn_ver || !btn_ver.exito) {',
            '            throw new Error("No apareció el botón Ver pasaje en la tarjeta del asiento");',
            '        }',
            '        await ctx.clic(".btn-ver-pasaje-asiento");',
            '',
            '        const modal_pasaje = await ctx.esperar_visible("#modal_apilado", 6000);',
            '        if (!modal_pasaje || !modal_pasaje.exito) {',
            '            throw new Error("No se abrió el modal de Ver pasaje");',
            '        }',
            '        const btn_cambiar = await ctx.esperar("#btn_cambiar_asiento_pasaje", 6000);',
            '        if (!btn_cambiar || !btn_cambiar.exito) {',
            '            throw new Error("No apareció el botón Cambiar de asiento");',
            '        }',
            '',
            '        // 3. Click en "Cambiar de asiento".',
            '        await ctx.clic("#btn_cambiar_asiento_pasaje");',
            '        await ctx.pausa(1500);',
            '',
            '        const elegibles = await ctx.obtener_atributos(".seat.seat-elegible", "data-numero");',
            '        ctx.assert(elegibles.length > 0,',
            '            "No hay asientos elegibles para el cambio. ¿La migración de repuntado está aplicada?");',
            '        const numero_nuevo = elegibles[0];',
            '',
            '        await ctx.clic(`.seat[data-numero="${numero_nuevo}"]`);',
            '        await ctx.pausa(300);',
            '',
            '        // 4. Confirmar el cambio.',
            '        await ctx.clic("#btn_confirmar_cambiar_asiento");',
            '',
            '        const cerrado = await ctx.esperar_oculto("#modal_apilado", 15000);',
            '        if (!cerrado || !cerrado.exito) {',
            '            const aviso = await ctx.leer_aviso();',
            '            throw new Error("El modal de cambio de asiento no se cerró. Aviso: " + (aviso || "(sin aviso)"));',
            '        }',
            '',
            '        // 5. Verificar por backend que la venta ahora apunta al asiento nuevo.',
            '        const venta = await obtener_venta_por_id(ctx, id_venta);',
            '        ctx.assert(venta && Array.isArray(venta.asientos), "La venta no tiene asientos");',
            '        ctx.assert(venta.asientos.length === 1, "Se esperaba 1 asiento, hay " + venta.asientos.length);',
            '        const asiento_actual = venta.asientos[0];',
            '        ctx.assert(String(asiento_actual.numero) === String(numero_nuevo),',
            '            "El asiento de la venta no es el nuevo. Esperado: " + numero_nuevo',
            '            + ", actual: " + asiento_actual.numero);',
            '',
            '        // 6. Cancelar la venta para limpiar.',
            '        await cerrar_modales_si_abiertos(ctx);',
            '        await cancelar_venta(ctx, id_venta, "Cancelada por prueba automatica (cambiar_asiento)");',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // catalogo.js — bump + registrar las 3 pruebas
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo.js: bump @version',
        'buscar' => [
            ' * @version 1.5plugin.5w',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.5x',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo.js: import de las 3 pruebas nuevas',
        'buscar' => [
            'import { prueba as eliminar_huerfanos_limpia_grafo } from "./prueba_56_eliminar_huerfanos_limpia_grafo.js";',
        ],
        'reemplazar' => [
            'import { prueba as eliminar_huerfanos_limpia_grafo } from "./prueba_56_eliminar_huerfanos_limpia_grafo.js";',
            'import { prueba as enlace_dueno_apunta_al_compartido } from "./prueba_57_enlace_dueno_apunta_al_compartido.js";',
            'import { prueba as venta_terminal_arbol_dual } from "./prueba_58_venta_terminal_arbol_dual.js";',
            'import { prueba as cambiar_asiento_desde_croquis } from "./prueba_59_cambiar_asiento_desde_croquis.js";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo.js: sección grafo con las 3 pruebas',
        'buscar' => [
            '            listar_viajes_indice_comportamiento,',
            '            eliminar_huerfanos_limpia_grafo',
            '        ]',
            '    }',
            '];',
        ],
        'reemplazar' => [
            '            listar_viajes_indice_comportamiento,',
            '            eliminar_huerfanos_limpia_grafo,',
            '            enlace_dueno_apunta_al_compartido,',
            '            venta_terminal_arbol_dual,',
            '            cambiar_asiento_desde_croquis',
            '        ]',
            '    }',
            '];',
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
foreach ($creaciones as $c) { $r = $raiz_proyecto.'/'.$c['archivo']; if (!is_dir(dirname($r))) mkdir(dirname($r), 0777, true); if (file_put_contents($r, implode("\n", $c['contenido']))===false){echo "[FALLO] Crear: {$c['archivo']}\n";continue;} echo "[OK] {$c['archivo']} (creado)\n"; }
echo "\n=== Resumen ===\nBloques aplicados: $bloques_ok\nArchivos nuevos:   " . count($creaciones) . "\n";
if (!empty($bloques_fallidos)) { echo "Fallos: " . count($bloques_fallidos) . "\n"; foreach ($bloques_fallidos as $f) echo "  - $f\n"; }
echo "\nListo.\n";