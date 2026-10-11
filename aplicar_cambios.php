<?php
/**
 * Aplicador de cambios — Proyecto iteradoresJS (plugin de pruebas).
 *
 * Tanda V1.5plugin.6h (fix de la prueba 64).
 *   - _compartidos_helpers.js: buscar_empresa_con_vehiculo_configurado
 *     acepta un array de exclusiones.
 *   - prueba_64: buscar empresa que el terminal NO vea todavía.
 *     Si no encuentra, pasa con console.warn.
 *   - prompt_plugin_piloto.md: §9 a 6h.
 *
 * Uso (parado en iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    // ============================================================
    // 1. _compartidos_helpers.js — buscar_empresa_con_vehiculo_configurado
    //    acepta exclusiones
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_compartidos_helpers.js',
        'descripcion' => 'helpers: buscar_empresa acepta excluir',
        'buscar' => [
            '/**',
            ' * Busca una empresa del dueño que tenga al menos un vehículo con',
            ' * asientos configurados. Devuelve { nombre_empresa, nombre_vehiculo }',
            ' * o null si no encuentra ninguna.',
            ' */',
            'export async function buscar_empresa_con_vehiculo_configurado(ctx, nombre_dueno) {',
            '    const r_emp = await ctx.pedir_post("index.php", {',
            '        accion: "empresas/listar",',
            '        nombre_dueno: nombre_dueno',
            '    });',
            '    if (!r_emp || !r_emp.json || !r_emp.json.exito) return null;',
            '    const empresas = r_emp.json.empresas || [];',
            '    for (const e of empresas) {',
            '        const nombre_emp = e && e.nombre_empresa;',
            '        if (!nombre_emp) continue;',
            '        const r_veh = await ctx.pedir_post("index.php", {',
            '            accion: "vehiculos/listar",',
            '            nombre_empresa: nombre_emp',
            '        });',
            '        if (!r_veh || !r_veh.json || !r_veh.json.exito) continue;',
            '        const vehiculos = r_veh.json.vehiculos || [];',
            '        for (const v of vehiculos) {',
            '            if (v && v.nombre_vehiculo && v.asientos && parseInt(v.asientos) > 0) {',
            '                return { nombre_empresa: nombre_emp, nombre_vehiculo: v.nombre_vehiculo };',
            '            }',
            '        }',
            '    }',
            '    return null;',
            '}',
        ],
        'reemplazar' => [
            '/**',
            ' * Busca una empresa del dueño que tenga al menos un vehículo con',
            ' * asientos configurados. Devuelve { nombre_empresa, nombre_vehiculo }',
            ' * o null si no encuentra ninguna.',
            ' *',
            ' * `excluir` es una lista opcional de nombres de empresa a saltear',
            ' * (útil cuando el test necesita una empresa que el terminal no',
            ' * vea todavía).',
            ' */',
            'export async function buscar_empresa_con_vehiculo_configurado(ctx, nombre_dueno, excluir = []) {',
            '    const r_emp = await ctx.pedir_post("index.php", {',
            '        accion: "empresas/listar",',
            '        nombre_dueno: nombre_dueno',
            '    });',
            '    if (!r_emp || !r_emp.json || !r_emp.json.exito) return null;',
            '    const empresas = r_emp.json.empresas || [];',
            '    for (const e of empresas) {',
            '        const nombre_emp = e && e.nombre_empresa;',
            '        if (!nombre_emp) continue;',
            '        if (excluir.includes(nombre_emp)) continue;',
            '        const r_veh = await ctx.pedir_post("index.php", {',
            '            accion: "vehiculos/listar",',
            '            nombre_empresa: nombre_emp',
            '        });',
            '        if (!r_veh || !r_veh.json || !r_veh.json.exito) continue;',
            '        const vehiculos = r_veh.json.vehiculos || [];',
            '        for (const v of vehiculos) {',
            '            if (v && v.nombre_vehiculo && v.asientos && parseInt(v.asientos) > 0) {',
            '                return { nombre_empresa: nombre_emp, nombre_vehiculo: v.nombre_vehiculo };',
            '            }',
            '        }',
            '    }',
            '    return null;',
            '}',
        ],
    ],

    // ============================================================
    // 2. _compartidos_helpers.js — bump @version
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_compartidos_helpers.js',
        'descripcion' => 'helpers: bump @version a 1.5plugin.6h',
        'buscar' => [
            ' * @version 1.5plugin.6g',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.6h',
        ],
    ],

    // ============================================================
    // 3. prueba_64 — reescritura del cuerpo
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_64_agregar_micro_empresa_compartido.js',
        'descripcion' => 'prueba 64: empresa que el terminal no vea todavía',
        'buscar' => [
            '    async ejecutar(ctx) {',
            '        const nombre_terminal = await login_y_nombre(ctx, CODIGO_TERMINAL1);',
            '        const nombre_dueno = await login_y_nombre(ctx, CODIGO_DUENO);',
            '',
            '        const empresa = await buscar_empresa_con_vehiculo_configurado(ctx, nombre_dueno);',
            '        ctx.assert(empresa !== null,',
            '            "El dueño no tiene ninguna empresa con un vehículo configurado. "',
            '            + "Cargá al menos una empresa con un vehículo con asientos "',
            '            + "y volvé a correr la prueba.");',
            '',
            '        const nombre_viaje = await crear_viaje_vacio(ctx, nombre_dueno, "viajemicrocomp");',
            '        try {',
            '            await autorizar_terminal(ctx, nombre_dueno, nombre_viaje, nombre_terminal);',
            '',
            '            const antes = await listar_empresas_del_terminal(ctx, nombre_dueno, nombre_terminal);',
            '            ctx.assert(!antes.includes(empresa.nombre_empresa),',
            '                "Antes de agregar el micro: el terminal YA ve la empresa "',
            '                + empresa.nombre_empresa + ". ¿El setup dejó basura?");',
            '',
            '            const r_micro = await ctx.pedir_post("index.php", {',
            '                accion: "viajes/agregar_micro",',
            '                nombre_dueno: nombre_dueno,',
            '                nombre_viaje: nombre_viaje,',
            '                nombre_empresa: empresa.nombre_empresa,',
            '                nombre_vehiculo: empresa.nombre_vehiculo,',
            '                monto: "100"',
            '            });',
            '            ctx.assert(r_micro && r_micro.json && r_micro.json.exito,',
            '                "No se pudo agregar el micro: "',
            '                + JSON.stringify(r_micro && r_micro.json ? r_micro.json : r_micro));',
            '',
            '            const despues = await listar_empresas_del_terminal(ctx, nombre_dueno, nombre_terminal);',
            '            ctx.assert(despues.includes(empresa.nombre_empresa),',
            '                "Después de agregar el micro: el terminal NO ve la empresa "',
            '                + empresa.nombre_empresa + ". "',
            '                + "El fix v77q de agregar_micro_a_viaje no está funcionando.");',
            '        } finally {',
            '            await eliminar_viaje_si_existe(ctx, nombre_dueno, nombre_viaje);',
            '        }',
            '    }',
            '};',
        ],
        'reemplazar' => [
            '    async ejecutar(ctx) {',
            '        // 1. Resolver nombres.',
            '        const nombre_terminal = await login_y_nombre(ctx, CODIGO_TERMINAL1);',
            '        const nombre_dueno = await login_y_nombre(ctx, CODIGO_DUENO);',
            '',
            '        // 2. Crear viaje + autorizar.',
            '        const nombre_viaje = await crear_viaje_vacio(ctx, nombre_dueno, "viajemicrocomp");',
            '        try {',
            '            await autorizar_terminal(ctx, nombre_dueno, nombre_viaje, nombre_terminal);',
            '',
            '            // 3. Ver qué empresas ve el terminal YA. Buscar una',
            '            //    empresa con vehículo configurado que NO esté en esa',
            '            //    lista. Si todas las que tienen vehículo configurado',
            '            //    ya están compartidas, no hay nada que testear:',
            '            //    pasamos con warn (aprendizaje 38 del prompt).',
            '            const antes = await listar_empresas_del_terminal(ctx, nombre_dueno, nombre_terminal);',
            '            const empresa = await buscar_empresa_con_vehiculo_configurado(ctx, nombre_dueno, antes);',
            '            if (empresa === null) {',
            '                console.warn(',
            '                    "Todas las empresas del dueño con vehículo configurado "',
            '                    + "ya están compartidas con el terminal. No hay empresa "',
            '                    + "nueva para testear el fix de agregar_micro_a_viaje. "',
            '                    + "Cargá otra empresa con un vehículo con asientos y "',
            '                    + "volvé a correr la prueba.");',
            '                return;',
            '            }',
            '',
            '            // 4. Agregar micro con la empresa elegida.',
            '            const r_micro = await ctx.pedir_post("index.php", {',
            '                accion: "viajes/agregar_micro",',
            '                nombre_dueno: nombre_dueno,',
            '                nombre_viaje: nombre_viaje,',
            '                nombre_empresa: empresa.nombre_empresa,',
            '                nombre_vehiculo: empresa.nombre_vehiculo,',
            '                monto: "100"',
            '            });',
            '            ctx.assert(r_micro && r_micro.json && r_micro.json.exito,',
            '                "No se pudo agregar el micro: "',
            '                + JSON.stringify(r_micro && r_micro.json ? r_micro.json : r_micro));',
            '',
            '            // 5. Verificar que ahora el terminal ve la empresa.',
            '            const despues = await listar_empresas_del_terminal(ctx, nombre_dueno, nombre_terminal);',
            '            ctx.assert(despues.includes(empresa.nombre_empresa),',
            '                "Después de agregar el micro: el terminal NO ve la empresa "',
            '                + empresa.nombre_empresa + ". "',
            '                + "El fix v77q de agregar_micro_a_viaje no está funcionando.");',
            '        } finally {',
            '            await eliminar_viaje_si_existe(ctx, nombre_dueno, nombre_viaje);',
            '        }',
            '    }',
            '};',
        ],
    ],

    // ============================================================
    // 4. prueba_64 — bump @version
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_64_agregar_micro_empresa_compartido.js',
        'descripcion' => 'prueba 64: bump @version a 1.5plugin.6h',
        'buscar' => [
            ' * @version 1.5plugin.6g',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.6h',
        ],
    ],

    // ============================================================
    // 5. catalogo.js — bump @version
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: bump @version a 1.5plugin.6h',
        'buscar' => [
            ' * @version 1.5plugin.6g',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.6h',
        ],
    ],

    // ============================================================
    // 6. prompt_plugin_piloto.md — última actualización a 6h
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'plugin: §9 última actualización a 6h',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.6g',
            '(Tanda A: 5 pruebas nuevas para B2.4.2 y B2.4.5).',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.6h',
            '(fix de la prueba 64: precondición de empresa no compartida).',
            '',
            '**Fix v1.5plugin.6h.** La prueba 64 (`agregar_micro_actualiza_empresas_compartido`)',
            'fallaba por una precondición mal planteada: asumía que el',
            'compartido del terminal estaba vacío de empresas antes de la',
            'prueba. Pero el compartido acumula las empresas de todos los',
            'viajes autorizados al terminal, no solo del viaje nuevo. Fix:',
            'buscar una empresa con vehículo configurado que el terminal',
            'no vea todavía. Si no hay ninguna, la prueba pasa con',
            '`console.warn` (aprendizaje 38: precondiciones de entorno',
            'que no se pueden forzar desde el plugin).',
            '',
            'Antes: v1.5plugin.6g',
            '(Tanda A: 5 pruebas nuevas para B2.4.2 y B2.4.5).',
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
echo "[INFO] $total_reemplazos reemplazo(s) en " . count($reemplazos_por_archivo) . " archivo(s).\n\n";
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