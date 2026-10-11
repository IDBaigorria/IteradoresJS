<?php
/**
 * Aplicador de cambios — Proyecto iteradoresJS (plugin de pruebas).
 *
 * Tanda V1.5plugin.6f (actualización de prompt).
 *   - prompts/prompt_plugin_piloto.md: agregar entrada
 *     "Antes: v1.5plugin.6f" al historial de §9 + actualizar
 *     pendientes.
 *
 * Uso (parado en iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    // ============================================================
    // prompt_plugin_piloto.md — pendientes del §9
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'plugin: §9 pendientes con Tanda A',
        'buscar' => [
            '**Pendientes del plugin:**',
            '',
            '- Prueba espejo de "cambiar de asiento" desde la pestaña',
            '  Clientes (el flujo del `ver_detalle_pasaje_individual`',
            '  en `pasajeros.js`, v77c/d).',
            '- A medida que avance B2.4 y B3, agregar pruebas espejo',
            '  para las operaciones que mantienen vivos los compartidos.',
        ],
        'reemplazar' => [
            '**Pendientes del plugin:**',
            '',
            '- Prueba espejo de "cambiar de asiento" desde la pestaña',
            '  Clientes (el flujo del `ver_detalle_pasaje_individual`',
            '  en `pasajeros.js`, v77c/d).',
            '- Pruebas espejo de la Tanda A del piloto (B2.4.2 + B2.4.5):',
            '  - 60 `cancelar_venta_desaparece_de_ambos_arboles`:',
            '    simétrica de la 58.',
            '  - 61 `eliminar_viaje_con_terminal_autorizado`.',
            '  - 62 `autorizar_terminal_aparece_en_compartido`.',
            '  - 63 `desautorizar_terminal_desaparece_del_compartido`.',
            '  - 64 `agregar_micro_actualiza_empresas_compartido`.',
            '- A medida que avance B2.4 y B3, seguir agregando pruebas',
            '  espejo para las operaciones que mantienen vivos los',
            '  compartidos.',
        ],
    ],

    // ============================================================
    // prompt_plugin_piloto.md — historial: agregar "Antes: 6f"
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'plugin: §9 agregar "Antes: v1.5plugin.6f"',
        'buscar' => [
            '**Lecciones de esta sesión:** ver las 6 nuevas (47-52)',
            'agregadas en §8. Destacan: navegar siempre desde una raíz,',
            'no seguir IDs numéricos entre POSTs, acotar selectores a',
            '`#modal_apilado_contenido`, chequear efectos visuales en',
            'vez de atributos booleanos, no tocar el monto con cuotas=1,',
            'y usar polling activo en vez de pausas fijas.',
            '',
            'Antes: v1.5plugin.5w',
        ],
        'reemplazar' => [
            '**Lecciones de esta sesión:** ver las 6 nuevas (47-52)',
            'agregadas en §8. Destacan: navegar siempre desde una raíz,',
            'no seguir IDs numéricos entre POSTs, acotar selectores a',
            '`#modal_apilado_contenido`, chequear efectos visuales en',
            'vez de atributos booleanos, no tocar el monto con cuotas=1,',
            'y usar polling activo en vez de pausas fijas.',
            '',
            'Antes: v1.5plugin.6f',
            '(cierre de la fase de pruebas del aislamiento por topología.',
            'Las 3 pruebas nuevas (57, 58, 59) verifican la fase B2.3.5',
            'del piloto: enlace `dueno` del terminal apunta al compartido,',
            'venta del terminal aparece en ambos árboles paralelos, y',
            'flujo completo de cambiar de asiento desde el croquis. La',
            'sección "grafo" pasa a 18 pruebas.).',
            'Antes: v1.5plugin.5w',
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