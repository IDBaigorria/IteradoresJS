<?php
/**
 * Aplicador de cambios — Framework JS (iteradoresJS).
 *
 * Tanda V1.5i.7i:
 *   - Espejar el módulo grafo completo desde PHP:
 *     4 comandos + 3 helpers privados.
 *   - En JS, `Nodo.por_cada_nodo_ejecutar` devuelve un objeto
 *     plano `{id: resultado}`, no un Map.
 *   - Bump a 1.5i.7i.
 *
 * Uso: php aplicar_cambios.php (parado en iteradoresJS/)
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Controlador/Controlador.js',
        'descripcion' => 'Controlador.js: bump @version a 1.5i.7i',
        'buscar' => [' * @version 1.5i.5'],
        'reemplazar' => [' * @version 1.5i.7i'],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Controlador/Controlador.js',
        'descripcion' => 'Controlador.js: agregar módulo grafo (comandos + helpers)',
        'buscar' => [
            '    // ══════════════════════════════════════════════════════',
            '    // INTERFAZ DOMINIOS',
            '    // ══════════════════════════════════════════════════════',
            '',
            '    /**',
            '     * Dominio actualmente activo (null = modo global).',
        ],
        'reemplazar' => [
            '    // ══════════════════════════════════════════════════════',
            '    // COMANDOS DEL VISUALIZADOR DE GRAFO (v1.5i.7i)',
            '    // ══════════════════════════════════════════════════════',
            '',
            '    /**',
            '     * Registra los comandos del visualizador de grafo.',
            '     *',
            '     * Estos comandos exponen operaciones sobre la',
            '     * superestructura sin revelar el token de seguridad.',
            '     * El token queda encapsulado en los closures.',
            '     *',
            '     * @returns {void}',
            '     */',
            '    static _registrar_comandos_grafo() {',
            '        // ─── grafo:resumen ─────────────────────────────',
            '        this.registrar_comando(\'grafo:resumen\', (token, args) => {',
            '            const nodos = Controlador._grafo_cargar_estructura(token);',
            '            const alcanzables = Controlador._grafo_bfs_desde_raices(nodos);',
            '            const total = Object.keys(nodos).length;',
            '            const huerfanos = total - Object.keys(alcanzables).length;',
            '',
            '            const refs = {};',
            '            for (const id in nodos) {',
            '                const ady = nodos[id].ady;',
            '                for (const enlace in ady) {',
            '                    const destino = ady[enlace];',
            '                    refs[destino] = (refs[destino] || 0) + 1;',
            '                }',
            '            }',
            '            const top = Object.entries(refs)',
            '                .sort((a, b) => b[1] - a[1])',
            '                .slice(0, 20);',
            '',
            '            return {',
            '                total,',
            '                alcanzables: Object.keys(alcanzables).length,',
            '                huerfanos,',
            '                top_referencias: Object.fromEntries(top),',
            '            };',
            '        }, null, false);',
            '',
            '        // ─── grafo:listar ──────────────────────────────',
            '        this.registrar_comando(\'grafo:listar\', (token, args) => {',
            '            const opciones = (args && args[0]) || {};',
            '            const filtro = String(opciones.filtro || \'todos\');',
            '            const filtro_enlace = String(opciones.enlace || \'\');',
            '            const filtro_texto = String(opciones.texto || \'\');',
            '            const offset = Math.max(0, parseInt(opciones.offset, 10) || 0);',
            '            const limite = Math.max(1, Math.min(500, parseInt(opciones.limite, 10) || 50));',
            '',
            '            const nodos = Controlador._grafo_cargar_estructura(token);',
            '            const alcanzables = (filtro !== \'todos\')',
            '                ? Controlador._grafo_bfs_desde_raices(nodos)',
            '                : {};',
            '',
            '            const refs_count = {};',
            '            for (const id in nodos) {',
            '                const ady = nodos[id].ady;',
            '                for (const enlace in ady) {',
            '                    const destino = ady[enlace];',
            '                    refs_count[destino] = (refs_count[destino] || 0) + 1;',
            '                }',
            '            }',
            '',
            '            const resultados = [];',
            '            for (const id in nodos) {',
            '                const info = nodos[id];',
            '                if (filtro === \'huerfanos\' && alcanzables[id]) continue;',
            '                if (filtro === \'alcanzables\' && !alcanzables[id]) continue;',
            '                if (filtro_enlace !== \'\' && !(filtro_enlace in info.ady)) continue;',
            '                if (filtro_texto !== \'\' && String(info.dato).toLowerCase().indexOf(filtro_texto.toLowerCase()) === -1) continue;',
            '',
            '                resultados.push({',
            '                    id: id,',
            '                    dato: String(info.dato).slice(0, 100),',
            '                    es_especial: isNaN(Number(id)),',
            '                    n_adyacentes: Object.keys(info.ady).length,',
            '                    n_referencias: refs_count[id] || 0,',
            '                    tipo: Controlador._grafo_inferir_tipo(id, info.ady),',
            '                });',
            '            }',
            '',
            '            return {',
            '                total: resultados.length,',
            '                offset: offset,',
            '                limite: limite,',
            '                nodos: resultados.slice(offset, offset + limite),',
            '            };',
            '        }, null, false);',
            '',
            '        // ─── grafo:nodo ────────────────────────────────',
            '        this.registrar_comando(\'grafo:nodo\', (token, args) => {',
            '            const id = String((args && args[0]) || \'\');',
            '            if (id === \'\') return null;',
            '',
            '            const nodo = Nodo.nodo_por_id(id);',
            '            if (!nodo) return null;',
            '',
            '            const adyacentes = [];',
            '            const ady = nodo.adyacentes();',
            '            if (ady) {',
            '                for (const [enlace, destino] of ady) {',
            '                    adyacentes.push({',
            '                        enlace: String(enlace),',
            '                        id_destino: destino.id(),',
            '                        dato_destino: String(destino.dato() || \'\').slice(0, 80),',
            '                    });',
            '                }',
            '            }',
            '',
            '            const referencias = [];',
            '            Nodo.por_cada_nodo_ejecutar(token, (otro) => {',
            '                const ady2 = otro.adyacentes();',
            '                if (!ady2) return;',
            '                for (const [enlace, destino] of ady2) {',
            '                    if (destino.id() === id) {',
            '                        referencias.push({',
            '                            id_origen: otro.id(),',
            '                            enlace: String(enlace),',
            '                            dato_origen: String(otro.dato() || \'\').slice(0, 80),',
            '                        });',
            '                    }',
            '                }',
            '            }, null);',
            '',
            '            return {',
            '                id: id,',
            '                dato: String(nodo.dato() || \'\'),',
            '                es_especial: isNaN(Number(id)),',
            '                adyacentes: adyacentes,',
            '                referencias: referencias,',
            '            };',
            '        }, null, false);',
            '',
            '        // ─── grafo:eliminar_huerfanos ──────────────────',
            '        //',
            '        // Elimina todos los nodos no alcanzables desde las',
            '        // raíces (IDs especiales) del grafo. Solo lo llama el',
            '        // enrutador del piloto (admin o soporte).',
            '        //',
            '        // No lleva chequeo de es_pruebas: se usa en producción',
            '        // para limpiar la acumulación de nodos basura. El',
            '        // enrutador es quien decide cuándo exponerlo.',
            '        this.registrar_comando(\'grafo:eliminar_huerfanos\', (token, args) => {',
            '            const nodos = Controlador._grafo_cargar_estructura(token);',
            '            const alcanzables = Controlador._grafo_bfs_desde_raices(nodos);',
            '',
            '            const huerfanos = {};',
            '            for (const id in nodos) {',
            '                if (!alcanzables[id]) huerfanos[id] = true;',
            '            }',
            '',
            '            const total_huerfanos = Object.keys(huerfanos).length;',
            '            if (total_huerfanos === 0) {',
            '                return { eliminados: 0, total_huerfanos: 0 };',
            '            }',
            '',
            '            for (const id in huerfanos) {',
            '                const nodo = Nodo.nodo_por_id(id);',
            '                if (!nodo) continue;',
            '                const ady = nodo.adyacentes();',
            '                if (!ady) continue;',
            '                for (const [enlace, destino] of ady) {',
            '                    if (huerfanos[destino.id()]) {',
            '                        nodo.eliminar_adyacente(String(enlace));',
            '                    }',
            '                }',
            '            }',
            '',
            '            let eliminados = 0;',
            '            for (const id in huerfanos) {',
            '                const nodo = Nodo.nodo_por_id(id);',
            '                if (nodo && Nodo.eliminar(nodo)) eliminados++;',
            '            }',
            '',
            '            return {',
            '                eliminados: eliminados,',
            '                total_huerfanos: total_huerfanos,',
            '            };',
            '        }, null, false);',
            '    }',
            '',
            '    /**',
            '     * Carga la estructura básica de la superestructura en memoria.',
            '     *',
            '     * Devuelve { id: { dato, ady: { enlace: id_destino } } }.',
            '     *',
            '     * @param {string} token',
            '     * @returns {Object}',
            '     */',
            '    static _grafo_cargar_estructura(token) {',
            '        const nodos = {};',
            '        Nodo.por_cada_nodo_ejecutar(token, (nodo) => {',
            '            const ady = {};',
            '            const adyacentes = nodo.adyacentes();',
            '            if (adyacentes) {',
            '                for (const [enlace, destino] of adyacentes) {',
            '                    ady[String(enlace)] = destino.id();',
            '                }',
            '            }',
            '            nodos[nodo.id()] = {',
            '                dato: String(nodo.dato() || \'\'),',
            '                ady: ady,',
            '            };',
            '        }, null);',
            '        return nodos;',
            '    }',
            '',
            '    /**',
            '     * BFS desde los nodos especiales (raíces del grafo).',
            '     *',
            '     * @param {Object} nodos',
            '     * @returns {Object} { id: true }',
            '     */',
            '    static _grafo_bfs_desde_raices(nodos) {',
            '        const alcanzables = {};',
            '        const cola = [];',
            '        for (const id in nodos) {',
            '            if (isNaN(Number(id))) {',
            '                alcanzables[id] = true;',
            '                cola.push(id);',
            '            }',
            '        }',
            '        while (cola.length > 0) {',
            '            const id = cola.shift();',
            '            if (!nodos[id]) continue;',
            '            const ady = nodos[id].ady;',
            '            for (const enlace in ady) {',
            '                const destino = ady[enlace];',
            '                if (!alcanzables[destino]) {',
            '                    alcanzables[destino] = true;',
            '                    cola.push(destino);',
            '                }',
            '            }',
            '        }',
            '        return alcanzables;',
            '    }',
            '',
            '    /**',
            '     * Infiere un tipo legible para un nodo a partir de sus enlaces.',
            '     * Heurística. Se puede refinar con el tiempo.',
            '     *',
            '     * @param {string} id',
            '     * @param {Object} ady',
            '     * @returns {string}',
            '     */',
            '    static _grafo_inferir_tipo(id, ady) {',
            '        if (id === \'usuarios\') return \'Contenedor raíz: usuarios\';',
            '        if (id === \'sesiones\') return \'Contenedor raíz: sesiones\';',
            '        if (isNaN(Number(id))) return \'Especial\';',
            '',
            '        if (ady.nivel) return \'Usuario\';',
            '        if (ady.apellido && ady.nombres) return \'Pasajero\';',
            '        if (ady.origen && ady.destino && ady.micros) return \'Viaje\';',
            '        if (ady.vehiculo_copia && ady.monto) return \'Micro\';',
            '        if (ady.total && ady.comprador) return \'Venta\';',
            '        if (ady.numero && ady.estado) return \'Cupón\';',
            '        if (ady.detalle_terminales && ady.detalle_cupones) return \'Rendición\';',
            '        if (ady.monto_efectivo && ady.monto_banco) return \'Liquidación\';',
            '        if (ady.id_venta && ady.motivo) return \'Cancelación\';',
            '        if (ady.usuario && ady.creado_en) return \'Sesión\';',
            '        if (ady.asientos && ady.foto) return \'Vehículo/Copia\';',
            '        if (ady.asientos) return \'Vehículo\';',
            '        if (ady.vehiculos) return \'Empresa\';',
            '        if (ady.filas && ady.columnas) return \'Piso\';',
            '        if (ady.fila && ady.columna) return \'Asiento\';',
            '        return \'?\';',
            '    }',
            '',
            '    // ══════════════════════════════════════════════════════',
            '    // INTERFAZ DOMINIOS',
            '    // ══════════════════════════════════════════════════════',
            '',
            '    /**',
            '     * Dominio actualmente activo (null = modo global).',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Controlador/Controlador.js',
        'descripcion' => 'Controlador.js: llamar _registrar_comandos_grafo en inicializar',
        'buscar' => [
            '            // ─── Registrar comandos genéricos de dominio ──',
            '            this._registrar_comandos_dominio();',
            '            this.inicializo = true;',
        ],
        'reemplazar' => [
            '            // ─── Registrar comandos genéricos de dominio ──',
            '            this._registrar_comandos_dominio();',
            '            // ─── Comandos del visualizador de grafo ────────',
            '            this._registrar_comandos_grafo();',
            '            this.inicializo = true;',
        ],
    ],

];

// ============================================================
// Runner (idéntico al anterior)
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
echo "\n=== Resumen ===\nBloques aplicados: $bloques_ok\n";
if (!empty($bloques_fallidos)) { echo "Fallos: " . count($bloques_fallidos) . "\n"; foreach ($bloques_fallidos as $f) echo "  - $f\n"; }
echo "\nListo.\n";