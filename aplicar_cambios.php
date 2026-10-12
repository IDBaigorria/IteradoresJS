<?php
/**
 * Aplicador de cambios automáticos — Proyecto iteradoresJS.
 *
 * Tanda 1a: guardar_parcial real en IndexedDB64.
 *
 * Uso (parado en el directorio del proyecto iteradoresJS):
 *   php aplicar_cambios.php
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

[
    'tipo' => 'reemplazar',
    'archivo' => 'Controlador/PerdurarSuperestructura/PerdurarSuperestructuraStringIndexedDB64.js',
    'descripcion' => 'IndexedDB64: bump @version a V1.5i.7o',
    'buscar' => [
        ' * @author Ignacio David Baigorria',
        ' * @version 1.5i.7k',
        ' * @since 1.5i.7k',
        ' */',
        'class PerdurarSuperestructuraStringIndexedDB64',
    ],
    'reemplazar' => [
        ' * @author Ignacio David Baigorria',
        ' * @version V1.5i.7o',
        ' * @since 1.5i.7k',
        ' */',
        'class PerdurarSuperestructuraStringIndexedDB64',
    ],
],

[
    'tipo' => 'reemplazar',
    'archivo' => 'Controlador/PerdurarSuperestructura/PerdurarSuperestructuraStringIndexedDB64.js',
    'descripcion' => 'IndexedDB64: guardar wrapper + #guardar_con_filtro',
    'buscar' => [
        '    static async guardar(nombre) {',
        '        if (!Nodo.hay_nodos_en_superestructura()) {',
        '            this._error("IndexedDB64::guardar: no hay nodos.");',
        '            return false;',
        '        }',
        '',
        '        let db = null;',
        '        try {',
        '            db = await this.#abrir_BD();',
        '',
        '            const mascaras = await this.#calcular_y_registrar_contextos(db, nombre);',
        '            if (mascaras === null) {',
        '                return false;',
        '            }',
        '',
        '            const nodos = this.#crear_datos_insertar_nodos(nombre, mascaras);',
        '            const adyacentes = this.#crear_datos_insertar_adyacentes(nombre);',
        '',
        '            await this.#reemplazar_en_transaccion(db, nombre, nodos, adyacentes);',
        '            return true;',
        '        } catch (error) {',
        '            this._error("Error en guardar (IndexedDB64): " + error.message);',
        '            return false;',
        '        } finally {',
        '            if (db) {',
        '                try { db.close(); } catch (e) { /* ignorar */ }',
        '            }',
        '        }',
        '    }',
    ],
    'reemplazar' => [
        '    static async guardar(nombre) {',
        '        if (!Nodo.hay_nodos_en_superestructura()) {',
        '            this._error("IndexedDB64::guardar: no hay nodos.");',
        '            return false;',
        '        }',
        '',
        '        let db = null;',
        '        try {',
        '            db = await this.#abrir_BD();',
        '            return await this.#guardar_con_filtro(db, nombre, 0);',
        '        } catch (error) {',
        '            this._error("Error en guardar (IndexedDB64): " + error.message);',
        '            return false;',
        '        } finally {',
        '            if (db) {',
        '                try { db.close(); } catch (e) { /* ignorar */ }',
        '            }',
        '        }',
        '    }',
        '',
        '    /**',
        '     * Implementación común de guardar y guardar_parcial.',
        '     *',
        '     * Con mascara_filtro === 0 reemplaza toda la',
        '     * superestructura (comportamiento de guardar).',
        '     *',
        '     * Con mascara_filtro !== 0 solo toca los nodos cuyo',
        '     * bitmask intersecta el filtro. Regla de borrado:',
        '     * se borran las aristas salientes de esos nodos',
        '     * (idnodo in filtro) y después los nodos. Las',
        '     * aristas entrantes desde nodos fuera del filtro',
        '     * no se tocan.',
        '     *',
        '     * @private',
        '     * @param {IDBDatabase} db',
        '     * @param {string} nombre',
        '     * @param {number} mascara_filtro',
        '     * @returns {Promise<boolean>}',
        '     */',
        '    static async #guardar_con_filtro(db, nombre, mascara_filtro) {',
        '        const mascaras = await this.#calcular_y_registrar_contextos(db, nombre);',
        '        if (mascaras === null) return false;',
        '',
        '        let ids_filtro = null;',
        '        if (mascara_filtro !== 0) {',
        '            ids_filtro = new Set();',
        '            for (const [id, m] of mascaras.entries()) {',
        '                if ((Number(m) | 0) & mascara_filtro) {',
        '                    ids_filtro.add(String(id));',
        '                }',
        '            }',
        '        }',
        '',
        '        const nodos = this.#crear_datos_insertar_nodos(nombre, mascaras, mascara_filtro);',
        '        const adyacentes = this.#crear_datos_insertar_adyacentes(nombre, mascaras, mascara_filtro);',
        '',
        '        await this.#reemplazar_en_transaccion(db, nombre, nodos, adyacentes, ids_filtro);',
        '        return true;',
        '    }',
    ],
],

[
    'tipo' => 'reemplazar',
    'archivo' => 'Controlador/PerdurarSuperestructura/PerdurarSuperestructuraStringIndexedDB64.js',
    'descripcion' => 'IndexedDB64: #crear_datos_insertar_nodos con filtro',
    'buscar' => [
        '    static #crear_datos_insertar_nodos(nombre, mascaras) {',
        '        const datos = Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => nodo.dato(), null) || {};',
        '        const nodos = [];',
        '',
        '        for (let [id, dato] of Object.entries(datos)) {',
        '            if (dato === null || dato === undefined) {',
        '                dato = "";',
        '            } else {',
        '                dato = String(dato);',
        '            }',
        '            const mascara = mascaras.get(String(id)) || 0;',
        '            nodos.push({',
        '                idsuperestructura: String(nombre),',
        '                idnodo: String(id),',
        '                dato: dato,',
        '                contexto_mascara: mascara',
        '            });',
        '        }',
        '',
        '        return nodos;',
        '    }',
    ],
    'reemplazar' => [
        '    static #crear_datos_insertar_nodos(nombre, mascaras, mascara_filtro = 0) {',
        '        const datos = Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => nodo.dato(), null) || {};',
        '        const nodos = [];',
        '',
        '        for (let [id, dato] of Object.entries(datos)) {',
        '            const mascara = Number(mascaras.get(String(id)) || 0) | 0;',
        '            if (mascara_filtro !== 0 && (mascara & mascara_filtro) === 0) {',
        '                continue;',
        '            }',
        '            if (dato === null || dato === undefined) {',
        '                dato = "";',
        '            } else {',
        '                dato = String(dato);',
        '            }',
        '            nodos.push({',
        '                idsuperestructura: String(nombre),',
        '                idnodo: String(id),',
        '                dato: dato,',
        '                contexto_mascara: mascara',
        '            });',
        '        }',
        '',
        '        return nodos;',
        '    }',
    ],
],

[
    'tipo' => 'reemplazar',
    'archivo' => 'Controlador/PerdurarSuperestructura/PerdurarSuperestructuraStringIndexedDB64.js',
    'descripcion' => 'IndexedDB64: #crear_datos_insertar_adyacentes con filtro',
    'buscar' => [
        '    static #crear_datos_insertar_adyacentes(nombre) {',
        '        const datos = Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => {',
        '            const enlaces = {};',
        '            const ady = nodo.adyacentes();',
        '            if (ady) {',
        '                for (const [enlace, adyacente] of ady) {',
        '                    enlaces[enlace] = adyacente.id();',
        '                }',
        '            }',
        '            return enlaces;',
        '        }, null) || {};',
        '',
        '        const adyacentes = [];',
        '        for (const [idnodo, enlaces] of Object.entries(datos)) {',
        '            for (const [enlace, idadyacente] of Object.entries(enlaces)) {',
        '                adyacentes.push({',
        '                    idsuperestructura: String(nombre),',
        '                    idnodo: String(idnodo),',
        '                    enlace: String(enlace),',
        '                    idadyacente: String(idadyacente)',
        '                });',
        '            }',
        '        }',
        '        return adyacentes;',
        '    }',
    ],
    'reemplazar' => [
        '    static #crear_datos_insertar_adyacentes(nombre, mascaras, mascara_filtro = 0) {',
        '        const datos = Nodo.por_cada_nodo_ejecutar(this.#token, (nodo) => {',
        '            const enlaces = {};',
        '            const ady = nodo.adyacentes();',
        '            if (ady) {',
        '                for (const [enlace, adyacente] of ady) {',
        '                    enlaces[enlace] = adyacente.id();',
        '                }',
        '            }',
        '            return enlaces;',
        '        }, null) || {};',
        '',
        '        const adyacentes = [];',
        '        for (const [idnodo, enlaces] of Object.entries(datos)) {',
        '            const idnodo_str = String(idnodo);',
        '            if (mascara_filtro !== 0) {',
        '                const m_origen = Number(mascaras.get(idnodo_str) || 0) | 0;',
        '                if ((m_origen & mascara_filtro) === 0) continue;',
        '            }',
        '            for (const [enlace, idadyacente] of Object.entries(enlaces)) {',
        '                const idady_str = String(idadyacente);',
        '                if (mascara_filtro !== 0) {',
        '                    const m_dest = Number(mascaras.get(idady_str) || 0) | 0;',
        '                    if ((m_dest & mascara_filtro) === 0) continue;',
        '                }',
        '                adyacentes.push({',
        '                    idsuperestructura: String(nombre),',
        '                    idnodo: idnodo_str,',
        '                    enlace: String(enlace),',
        '                    idadyacente: idady_str',
        '                });',
        '            }',
        '        }',
        '        return adyacentes;',
        '    }',
    ],
],

[
    'tipo' => 'reemplazar',
    'archivo' => 'Controlador/PerdurarSuperestructura/PerdurarSuperestructuraStringIndexedDB64.js',
    'descripcion' => 'IndexedDB64: #reemplazar_en_transaccion con ids_filtro',
    'buscar' => [
        '    static #reemplazar_en_transaccion(db, nombre, nodos, adyacentes) {',
        '        return new Promise((resolve, reject) => {',
        '            let tx;',
        '            try {',
        '                tx = db.transaction([this.#ALMACEN_NODOS, this.#ALMACEN_ADYACENTES], "readwrite");',
        '            } catch (e) {',
        '                reject(e);',
        '                return;',
        '            }',
        '',
        '            const almacen_nodos = tx.objectStore(this.#ALMACEN_NODOS);',
        '            const almacen_ady = tx.objectStore(this.#ALMACEN_ADYACENTES);',
        '            const rango = IDBKeyRange.only(String(nombre));',
        '',
        '            let pendientes_borrado = 2;',
        '            const al_terminar_borrado = () => {',
        '                pendientes_borrado--;',
        '                if (pendientes_borrado !== 0) return;',
        '                for (const n of nodos) almacen_nodos.add(n);',
        '                for (const a of adyacentes) almacen_ady.add(a);',
        '            };',
        '',
        '            const cursor_nodos = almacen_nodos.index("idsuperestructura").openCursor(rango);',
        '            cursor_nodos.onsuccess = (event) => {',
        '                const cursor = event.target.result;',
        '                if (cursor) {',
        '                    cursor.delete();',
        '                    cursor.continue();',
        '                } else {',
        '                    al_terminar_borrado();',
        '                }',
        '            };',
        '',
        '            const cursor_ady = almacen_ady.index("idsuperestructura").openCursor(rango);',
        '            cursor_ady.onsuccess = (event) => {',
        '                const cursor = event.target.result;',
        '                if (cursor) {',
        '                    cursor.delete();',
        '                    cursor.continue();',
        '                } else {',
        '                    al_terminar_borrado();',
        '                }',
        '            };',
        '',
        '            tx.oncomplete = () => resolve();',
        '            tx.onerror = (event) => reject(event.target.error || new Error("Error en transacción"));',
        '            tx.onabort = () => reject(new Error("Transacción abortada"));',
        '        });',
        '    }',
    ],
    'reemplazar' => [
        '    static #reemplazar_en_transaccion(db, nombre, nodos, adyacentes, ids_filtro = null) {',
        '        return new Promise((resolve, reject) => {',
        '            let tx;',
        '            try {',
        '                tx = db.transaction([this.#ALMACEN_NODOS, this.#ALMACEN_ADYACENTES], "readwrite");',
        '            } catch (e) {',
        '                reject(e);',
        '                return;',
        '            }',
        '',
        '            const almacen_nodos = tx.objectStore(this.#ALMACEN_NODOS);',
        '            const almacen_ady = tx.objectStore(this.#ALMACEN_ADYACENTES);',
        '            const rango = IDBKeyRange.only(String(nombre));',
        '',
        '            let pendientes_borrado = 2;',
        '            const al_terminar_borrado = () => {',
        '                pendientes_borrado--;',
        '                if (pendientes_borrado !== 0) return;',
        '                for (const n of nodos) almacen_nodos.add(n);',
        '                for (const a of adyacentes) almacen_ady.add(a);',
        '            };',
        '',
        '            const cursor_nodos = almacen_nodos.index("idsuperestructura").openCursor(rango);',
        '            cursor_nodos.onsuccess = (event) => {',
        '                const cursor = event.target.result;',
        '                if (cursor) {',
        '                    const id = String(cursor.value.idnodo);',
        '                    if (ids_filtro === null || ids_filtro.has(id)) {',
        '                        cursor.delete();',
        '                    }',
        '                    cursor.continue();',
        '                } else {',
        '                    al_terminar_borrado();',
        '                }',
        '            };',
        '',
        '            const cursor_ady = almacen_ady.index("idsuperestructura").openCursor(rango);',
        '            cursor_ady.onsuccess = (event) => {',
        '                const cursor = event.target.result;',
        '                if (cursor) {',
        '                    const idnodo = String(cursor.value.idnodo);',
        '                    if (ids_filtro === null || ids_filtro.has(idnodo)) {',
        '                        cursor.delete();',
        '                    }',
        '                    cursor.continue();',
        '                } else {',
        '                    al_terminar_borrado();',
        '                }',
        '            };',
        '',
        '            tx.oncomplete = () => resolve();',
        '            tx.onerror = (event) => reject(event.target.error || new Error("Error en transacción"));',
        '            tx.onabort = () => reject(new Error("Transacción abortada"));',
        '        });',
        '    }',
    ],
],

[
    'tipo' => 'reemplazar',
    'archivo' => 'Controlador/PerdurarSuperestructura/PerdurarSuperestructuraStringIndexedDB64.js',
    'descripcion' => 'IndexedDB64: guardar_parcial implementado',
    'buscar' => [
        '    /**',
        '     * Guarda solo el subgrafo en memoria filtrando por contextos.',
        '     * STUB en fase 2: devuelve error.',
        '     *',
        '     * @param {string} nombre',
        '     * @param {string[]} contextos',
        '     * @returns {Promise<boolean>}',
        '     */',
        '    static async guardar_parcial(nombre, contextos) {',
        '        this._error("IndexedDB64::guardar_parcial: aún no implementado (fase 2).");',
        '        return false;',
        '    }',
    ],
    'reemplazar' => [
        '    /**',
        '     * Guarda solo el subgrafo en memoria filtrando por',
        '     * contextos.',
        '     *',
        '     * Requiere que los contextos estén registrados',
        '     * previamente. Los registra el primer guardar.',
        '     *',
        '     * El guardado es total sobre los nodos cargados',
        '     * (modificados o no): el contrato es "persistir lo que',
        '     * tengo en memoria, restringido al filtro de',
        '     * contextos". No hace delta de cambios.',
        '     *',
        '     * @param {string} nombre',
        '     * @param {string[]} contextos',
        '     * @returns {Promise<boolean>}',
        '     */',
        '    static async guardar_parcial(nombre, contextos) {',
        '        if (typeof nombre !== "string") {',
        '            this._error("guardar_parcial (IndexedDB64): el identificador no es string.");',
        '            return false;',
        '        }',
        '        if (!Array.isArray(contextos) || contextos.length === 0) {',
        '            this._error("guardar_parcial (IndexedDB64): no se especificaron contextos.");',
        '            return false;',
        '        }',
        '',
        '        let db = null;',
        '        try {',
        '            db = await this.#abrir_BD();',
        '            const bits_registrados = await this.#obtener_contextos_registrados(db, nombre);',
        '            let mascara_pedida = 0;',
        '            for (const ctx of contextos) {',
        '                const ctx_str = String(ctx);',
        '                if (!bits_registrados.has(ctx_str)) {',
        '                    this._error("guardar_parcial (IndexedDB64): contexto \'" + ctx_str + "\' no registrado en \'" + nombre + "\'.");',
        '                    return false;',
        '                }',
        '                mascara_pedida |= (1 << bits_registrados.get(ctx_str));',
        '            }',
        '            return await this.#guardar_con_filtro(db, nombre, mascara_pedida);',
        '        } catch (error) {',
        '            this._error("Error en guardar_parcial (IndexedDB64): " + error.message);',
        '            return false;',
        '        } finally {',
        '            if (db) {',
        '                try { db.close(); } catch (e) { /* ignorar */ }',
        '            }',
        '        }',
        '    }',
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