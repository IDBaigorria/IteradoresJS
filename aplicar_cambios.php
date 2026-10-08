<?php
/**
 * Aplicador de cambios — Proyecto iteradoresJS.
 *
 * Tanda V1.5i.7k (fix del BFS de contextos en IndexedDB64).
 *   - Reemplaza el paso 4 de #calcular_y_registrar_contextos:
 *     en vez de usar Nodo.nodo_por_id(id) durante el BFS (que
 *     falla si la clave original del Map es un número),
 *     construye un índice auxiliar id_string → nodo y lo usa.
 *
 * Uso: php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Controlador/PerdurarSuperestructura/PerdurarSuperestructuraStringIndexedDB64.js',
        'descripcion' => 'IndexedDB64: BFS con indice auxiliar (fix)',
        'buscar' => [
            '        // 4. BFS multi-fuente.',
            '        const mascaras = new Map();',
            '        const cola = [];',
            '        for (const id of especiales) {',
            '            mascaras.set(id, 1 << bits_por_contexto.get(id));',
            '            cola.push(id);',
            '        }',
            '        while (cola.length > 0) {',
            '            const id = cola.shift();',
            '            if (!Nodo.existe(id)) continue;',
            '            const nodo = Nodo.nodo_por_id(id);',
            '            if (!nodo) continue;',
            '            const adyacentes = nodo.adyacentes();',
            '            if (!adyacentes) continue;',
            '            for (const [, destino] of adyacentes) {',
            '                const id_dest = String(destino.id());',
            '                const actual = mascaras.get(id_dest) || 0;',
            '                const nueva = actual | mascaras.get(id);',
            '                if (nueva !== actual) {',
            '                    mascaras.set(id_dest, nueva);',
            '                    cola.push(id_dest);',
            '                }',
            '            }',
            '        }',
            '        return mascaras;',
        ],
        'reemplazar' => [
            '        // 4. Índice auxiliar: id_string → nodo. Necesario porque',
            '        //    Nodo.nodo_por_id(id) usa la clave original del Map de',
            '        //    superestructura, que puede ser número, mientras que el',
            '        //    BFS y las máscaras usan strings. Mezclar tipos en el',
            '        //    lookup hacía que nodos comunes quedaran sin máscara.',
            '        const nodos_por_id = new Map();',
            '        Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => {',
            '            nodos_por_id.set(String(nodo.id()), nodo);',
            '        }, null);',
            '',
            '        // 5. BFS multi-fuente.',
            '        const mascaras = new Map();',
            '        const cola = [];',
            '        for (const id of especiales) {',
            '            mascaras.set(id, 1 << bits_por_contexto.get(id));',
            '            cola.push(id);',
            '        }',
            '        while (cola.length > 0) {',
            '            const id = cola.shift();',
            '            const nodo = nodos_por_id.get(id);',
            '            if (!nodo) continue;',
            '            const adyacentes = nodo.adyacentes();',
            '            if (!adyacentes) continue;',
            '            for (const [, destino] of adyacentes) {',
            '                const id_dest = String(destino.id());',
            '                const actual = mascaras.get(id_dest) || 0;',
            '                const nueva = actual | mascaras.get(id);',
            '                if (nueva !== actual) {',
            '                    mascaras.set(id_dest, nueva);',
            '                    cola.push(id_dest);',
            '                }',
            '            }',
            '        }',
            '        return mascaras;',
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