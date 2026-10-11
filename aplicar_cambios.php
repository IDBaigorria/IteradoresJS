<?php
/**
 * Aplicador de cambios — Proyecto iteradoresJS (plugin de pruebas).
 *
 * Tanda V1.5plugin.5y (fix de la prueba 57).
 *   - Aplicacion/pruebas/prueba_57_enlace_dueno_apunta_al_compartido.js:
 *     reescribir la prueba para usar el campo `destino_es_compartido`
 *     que expone `grafo:nodo` desde v1.5piloto.77k. Una sola
 *     consulta, sin seguir IDs numéricos (que no son estables
 *     entre cargas del grafo).
 *
 * Uso (parado en iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_57_enlace_dueno_apunta_al_compartido.js',
        'descripcion' => 'Prueba 57: reescrita con destino_es_compartido',
        'contenido' => [
            '/**',
            ' * Prueba: el enlace `dueno` de un terminal apunta a un',
            ' * nodo marcado con `_es_compartido`.',
            ' *',
            ' * Verifica la Fase B2.3.5 (v1.5piloto.77f-k): después del',
            ' * repuntado, el enlace `dueno` del terminal apunta al',
            ' * contenedor `compartido_con_us_termX`, no al nodo del',
            ' * dueño real.',
            ' *',
            ' * Usa el campo `destino_es_compartido` que expone',
            ' * `grafo:nodo` desde v1.5piloto.77k. Es una sola consulta,',
            ' * sin seguir IDs numéricos (que no son estables entre',
            ' * cargas del grafo).',
            ' *',
            ' * Flujo: login terminal para leer su nombre de usuario,',
            ' * después login admin (porque `grafo/nodo` exige nivel',
            ' * admin/soporte) para consultar el grafo.',
            ' *',
            ' * @version 1.5plugin.5y',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfiguracionApli.js";',
            'import { login_terminal } from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "enlace_dueno_apunta_al_compartido",',
            '    nombre: "Grafo: enlace dueno del terminal apunta al compartido",',
            '    descripcion: "Verifica que después del repuntado (v1.5piloto.77f-k), el enlace `dueno` de cada terminal apunta a un contenedor compartido (campo destino_es_compartido).",',
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
            '        // 4. Verificar que el destino sea un compartido.',
            '        // El campo `destino_es_compartido` lo calcula el comando',
            '        // grafo:nodo (framework 1.5i.7m). No es necesario seguir',
            '        // el id_destino: los IDs numéricos no son estables entre',
            '        // cargas del grafo.',
            '        ctx.assert(enlace_dueno.destino_es_compartido === true,',
            '            "El enlace `dueno` del terminal us_" + nombre_term + " NO apunta a un compartido. "',
            '            + "Dato del destino: " + JSON.stringify(enlace_dueno.dato_destino) + ". "',
            '            + "¿Corriste ?repuntar_terminales_compartido=1 (v77l)? "',
            '            + "¿El framework tiene la versión 1.5i.7m (campo destino_es_compartido)?");',
            '',
            '        // 5. Sanity: el destino debe tener el nombre del dueño como dato.',
            '        // (Opción A del modelo: el compartido lleva el dato del dueño.)',
            '        ctx.assert(typeof enlace_dueno.dato_destino === "string" && enlace_dueno.dato_destino !== "",',
            '            "El compartido destino no tiene `dato` = nombre del dueño (opción A). "',
            '            + "Dato actual: " + JSON.stringify(enlace_dueno.dato_destino));',
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