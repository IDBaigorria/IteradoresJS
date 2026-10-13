<?php
/**
 * Aplicador — Espejo JS del fix v1.5i.8c.
 *
 * Propagación de máscaras a nodos nuevos por enlaces
 * entrantes en `#guardar_con_filtro`.
 *
 * Uso (parado en iteradoresJS/): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Persistencia/PerdurarSuperestructuraStringIndexedDB64.js',
        'descripcion' => 'Bump IndexedDB64 V1.5i.8b -> V1.5i.8c',
        'buscar' => [
            ' * @version V1.5i.8b',
        ],
        'reemplazar' => [
            ' * @version V1.5i.8c',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Persistencia/PerdurarSuperestructuraStringIndexedDB64.js',
        'descripcion' => 'Propagación de máscaras a nodos nuevos',
        'buscar' => [
            '        // Con filtro, unir con la máscara previa del nodo.',
            '        if (mascara_filtro !== 0) {',
            '            Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => {',
            '                const id = String(nodo.id());',
            '                const m_previa = Number(nodo.contexto_mascara() || 0) | 0;',
            '                const m_bfs = Number(mascaras.get(id) || 0) | 0;',
            '                mascaras.set(id, (m_previa | m_bfs) | 0);',
            '            }, null);',
            '        }',
            '',
            '        // Snapshot del mapa (id_nodo_framework -> id_fila).',
            '        const mapa_previo = Object.assign({}, this.#mapa_id_a_fila[nombre] || {});',
        ],
        'reemplazar' => [
            '        // Con filtro, unir con la máscara previa del nodo.',
            '        if (mascara_filtro !== 0) {',
            '            Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => {',
            '                const id = String(nodo.id());',
            '                const m_previa = Number(nodo.contexto_mascara() || 0) | 0;',
            '                const m_bfs = Number(mascaras.get(id) || 0) | 0;',
            '                mascaras.set(id, (m_previa | m_bfs) | 0);',
            '            }, null);',
            '        }',
            '',
            '        // Snapshot del mapa (id_nodo_framework -> id_fila).',
            '        const mapa_previo = Object.assign({}, this.#mapa_id_a_fila[nombre] || {});',
            '',
            '        // Propagar máscaras a nodos nuevos (los que no están',
            '        // en el mapa previo) a partir de enlaces entrantes.',
            '        // Iterar hasta punto fijo. Fix V1.5i.8c.',
            '        if (mascara_filtro !== 0 && Object.keys(mapa_previo).length > 0) {',
            '            const nuevos = new Set();',
            '            Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => {',
            '                const id = String(nodo.id());',
            '                if (!(id in mapa_previo)) {',
            '                    nuevos.add(id);',
            '                }',
            '            }, null);',
            '            if (nuevos.size > 0) {',
            '                let cambio = true;',
            '                let iter = 0;',
            '                while (cambio && iter < 10) {',
            '                    cambio = false;',
            '                    iter++;',
            '                    Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => {',
            '                        const id_origen = String(nodo.id());',
            '                        const m_origen = Number(mascaras.get(id_origen) || 0) | 0;',
            '                        if (m_origen === 0) return;',
            '                        const ady = nodo.adyacentes();',
            '                        if (!ady) return;',
            '                        for (const [, dest] of ady) {',
            '                            const id_dest = String(dest.id());',
            '                            if (!nuevos.has(id_dest)) continue;',
            '                            const m_dest = Number(mascaras.get(id_dest) || 0) | 0;',
            '                            const m_nueva = (m_dest | m_origen) | 0;',
            '                            if (m_nueva !== m_dest) {',
            '                                mascaras.set(id_dest, m_nueva);',
            '                                cambio = true;',
            '                            }',
            '                        }',
            '                    }, null);',
            '                }',
            '            }',
            '        }',
        ],
    ],
];

// ============================================================
// Runner
// ============================================================

echo "=== Aplicador — Espejo JS 1.5i.8c ===\n\n";

function detectar_eol(string $c): string { return (strpos($c, "\r\n") !== false) ? "\r\n" : "\n"; }
function normalizar_a_unix(string $c): string { return str_replace("\r\n", "\n", $c); }
function normalizar_a_original(string $c, string $e): string { return $e === "\n" ? $c : str_replace("\n", "\r\n", $c); }
function contar_ocurrencias(string $c, string $b): int {
    if ($b === '') return 0;
    $n = 0; $o = 0;
    while (($p = strpos($c, $b, $o)) !== false) { $n++; $o = $p + strlen($b); }
    return $n;
}

$reemplazos_por_archivo = [];
foreach ($cambios as $cambio) {
    if (!isset($cambio['archivo']) || !isset($cambio['buscar']) || !isset($cambio['reemplazar'])) {
        echo "[FALLO] Cambio mal formado.\n"; exit(1);
    }
    $reemplazos_por_archivo[$cambio['archivo']][] = $cambio;
}

$archivos_a_escribir = [];
$bloques_ok = 0;
$bloques_fallidos = [];

foreach ($reemplazos_por_archivo as $archivo_rel => $lista) {
    $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
    if (!file_exists($ruta_abs)) {
        $bloques_fallidos[] = "Archivo no encontrado: $archivo_rel";
        continue;
    }
    $contenido_original = file_get_contents($ruta_abs);
    $eol = detectar_eol($contenido_original);
    $contenido = normalizar_a_unix($contenido_original);
    $contenido_antes = $contenido;
    $hubo_error = false;

    foreach ($lista as $cambio) {
        $buscar_str = implode("\n", $cambio['buscar']);
        $reemplazar_str = implode("\n", $cambio['reemplazar']);
        $n = contar_ocurrencias($contenido, $buscar_str);
        if ($n === 0) { $bloques_fallidos[] = "$archivo_rel: no encontrado - {$cambio['descripcion']}"; $hubo_error = true; continue; }
        if ($n > 1) { $bloques_fallidos[] = "$archivo_rel: ambiguo ($n) - {$cambio['descripcion']}"; $hubo_error = true; continue; }
        $contenido = str_replace($buscar_str, $reemplazar_str, $contenido);
        $bloques_ok++;
    }
    if (!$hubo_error && $contenido !== $contenido_antes) {
        $archivos_a_escribir[$ruta_abs] = normalizar_a_original($contenido, $eol);
    }
}

if ($modo_estricto && !empty($bloques_fallidos)) {
    echo "=== ABORTADO ===\n";
    foreach ($bloques_fallidos as $f) echo "  [FALLO] $f\n";
    exit(1);
}

foreach ($archivos_a_escribir as $ruta_abs => $contenido_final) {
    if (file_put_contents($ruta_abs, $contenido_final) === false) {
        echo "[FALLO] No se pudo escribir: " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n";
        continue;
    }
    echo "[OK] " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n";
}

echo "\n=== Resumen ===\nBloques aplicados: $bloques_ok\n";
if (!empty($bloques_fallidos)) { foreach ($bloques_fallidos as $f) echo "  - $f\n"; }
echo "\nListo.\n";