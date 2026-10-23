<?php
/**
 * Aplicador — Tanda C.1c: auditorías como 1 nodo JSON en grafo propio.
 *
 * Motivo: cada auditoría creaba ~58 nodos (9 campos + 3 contenedores
 * + 15 items + 30 campos). Con varias corridas, el grafo de pruebas
 * crecía a miles de nodos y la carga se volvía lenta. El popup
 * quedaba en "Cargando estado..." mientras el framework iteraba
 * todo.
 *
 * Cambios:
 * 1. NOMBRE_GRAFO_AUDITORIAS = "plugin_auditorias" (grafo propio,
 *    separado de plugin_pruebas).
 * 2. _grafo_cargado (bool) -> _grafo_cargado_actual (string|null).
 * 3. _asegurar_grafo_auditorias_cargado() para el nuevo grafo.
 * 4. registrar_auditoria guarda UNA sola cadena JSON en UN nodo
 *    (auditoria_<ts>). Sin hijos.
 * 5. obtener_estado_auditorias parsea el JSON de cada nodo.
 * 6. Se eliminan _agregar_primeros_auditoria, _leer_primeros_auditoria
 *    y _formatear_auditoria. _destruir_auditoria se simplifica.
 *
 * Resultado: cada auditoría suma 1 nodo (antes 58). Con 10 auditorías:
 * 13 nodos en plugin_auditorias (raíz + contenedor + 10 + actual).
 *
 * Uso (raíz del repo iteradoresJS/): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.9o';

$htmls_a_bumpear = [];

$cambios = [

// ============================================================
// 1. ConfiguracionApli.js: NOMBRE_GRAFO_AUDITORIAS
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/ConfiguracionApli.js',
    'descripcion' => 'Agregar NOMBRE_GRAFO_AUDITORIAS',
    'buscar' => [
        'export const NOMBRE_GRAFO = "plugin_pruebas";',
    ],
    'reemplazar' => [
        'export const NOMBRE_GRAFO = "plugin_pruebas";',
        'export const NOMBRE_GRAFO_AUDITORIAS = "plugin_auditorias";',
    ],
],
[
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/ConfiguracionApli.js',
    'descripcion' => 'Bump VERSION_APP a 9o',
    'buscar' => [
        'export const VERSION_APP = "1.5plugin.9n";',
    ],
    'reemplazar' => [
        'export const VERSION_APP = "1.5plugin.9o";',
    ],
],
[
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/ConfiguracionApli.js',
    'descripcion' => 'Bump VERSION_PLUGIN a 9o',
    'buscar' => [
        'export const VERSION_PLUGIN = "1.5plugin.9n";',
    ],
    'reemplazar' => [
        'export const VERSION_PLUGIN = "1.5plugin.9o";',
    ],
],

// ============================================================
// 2. GrafoPlugin.js: import de NOMBRE_GRAFO_AUDITORIAS
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/GrafoPlugin.js',
    'descripcion' => 'Import de NOMBRE_GRAFO_AUDITORIAS',
    'buscar' => [
        'import { NOMBRE_GRAFO, CORRIDAS_POR_PRUEBA_MAX } from "./ConfiguracionApli.js";',
    ],
    'reemplazar' => [
        'import { NOMBRE_GRAFO, NOMBRE_GRAFO_AUDITORIAS, CORRIDAS_POR_PRUEBA_MAX } from "./ConfiguracionApli.js";',
    ],
],

// ============================================================
// 3. GrafoPlugin.js: _grafo_cargado -> _grafo_cargado_actual
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/GrafoPlugin.js',
    'descripcion' => 'Cambiar cache de grafo a string|null',
    'buscar' => [
        'let _grafo_cargado = false;',
    ],
    'reemplazar' => [
        'let _grafo_cargado_actual = null; // null | NOMBRE_GRAFO | NOMBRE_GRAFO_AUDITORIAS',
    ],
],
[
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/GrafoPlugin.js',
    'descripcion' => 'asegurar_grafo_cargado con _grafo_cargado_actual',
    'buscar' => [
        'export async function asegurar_grafo_cargado() {',
        '    if (_grafo_cargado) return;',
        '',
        '    const Controlador = await obtener_controlador();',
        '    const existe = await Controlador.existe(NOMBRE_GRAFO);',
        '',
        '    if (existe) {',
        '        const ok = await Controlador.cargar(NOMBRE_GRAFO);',
        '        if (!ok) {',
        '            throw new Error("El grafo existe pero no se pudo cargar");',
        '        }',
        '        const migrado = _migrar_estructura_si_hace_falta();',
        '        if (migrado) {',
        '            await Controlador.guardar(NOMBRE_GRAFO);',
        '        }',
        '    } else {',
        '        Nodo.vaciar_superestructura(Controlador.token);',
        '        _crear_estructura_inicial();',
        '        const ok = await Controlador.guardar(NOMBRE_GRAFO);',
        '        if (!ok) {',
        '            throw new Error("No se pudo guardar el grafo inicial");',
        '        }',
        '    }',
        '',
        '    _grafo_cargado = true;',
        '}',
    ],
    'reemplazar' => [
        'export async function asegurar_grafo_cargado() {',
        '    if (_grafo_cargado_actual === NOMBRE_GRAFO) return;',
        '',
        '    const Controlador = await obtener_controlador();',
        '    const existe = await Controlador.existe(NOMBRE_GRAFO);',
        '',
        '    if (existe) {',
        '        const ok = await Controlador.cargar(NOMBRE_GRAFO);',
        '        if (!ok) {',
        '            throw new Error("El grafo existe pero no se pudo cargar");',
        '        }',
        '        const migrado = _migrar_estructura_si_hace_falta();',
        '        if (migrado) {',
        '            await Controlador.guardar(NOMBRE_GRAFO);',
        '        }',
        '    } else {',
        '        Nodo.vaciar_superestructura(Controlador.token);',
        '        _crear_estructura_inicial();',
        '        const ok = await Controlador.guardar(NOMBRE_GRAFO);',
        '        if (!ok) {',
        '            throw new Error("No se pudo guardar el grafo inicial");',
        '        }',
        '    }',
        '',
        '    _grafo_cargado_actual = NOMBRE_GRAFO;',
        '}',
        '',
        '/**',
        ' * Carga el grafo de auditorías (separado del de pruebas).',
        ' * Si no existe, crea el nodo raíz plugin.',
        ' */',
        'async function _asegurar_grafo_auditorias_cargado() {',
        '    if (_grafo_cargado_actual === NOMBRE_GRAFO_AUDITORIAS) return;',
        '    const Controlador = await obtener_controlador();',
        '    const existe = await Controlador.existe(NOMBRE_GRAFO_AUDITORIAS);',
        '    if (existe) {',
        '        const ok = await Controlador.cargar(NOMBRE_GRAFO_AUDITORIAS);',
        '        if (!ok) {',
        '            throw new Error("El grafo de auditorías existe pero no se pudo cargar");',
        '        }',
        '    } else {',
        '        Nodo.vaciar_superestructura(Controlador.token);',
        '        Nodo.crear_con_id("plugin");',
        '        const ok = await Controlador.guardar(NOMBRE_GRAFO_AUDITORIAS);',
        '        if (!ok) {',
        '            throw new Error("No se pudo guardar el grafo de auditorías inicial");',
        '        }',
        '    }',
        '    _grafo_cargado_actual = NOMBRE_GRAFO_AUDITORIAS;',
        '}',
    ],
],

// ============================================================
// 4. GrafoPlugin.js: registrar_auditoria con JSON string
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/GrafoPlugin.js',
    'descripcion' => 'registrar_auditoria: 1 nodo JSON en plugin_auditorias',
    'buscar' => [
        'export async function registrar_auditoria(datos) {',
        '    await asegurar_grafo_cargado();',
        '    const Controlador = await obtener_controlador();',
        '',
        '    const raiz = Nodo.nodo_por_id("plugin");',
        '    if (!raiz) throw new Error("Sin raíz del plugin");',
        '',
        '    let auditorias = raiz.adyacente("auditorias");',
        '    if (!auditorias) {',
        '        auditorias = Nodo.crear_con_dato("");',
        '        raiz._adyacente_en(auditorias, "auditorias");',
        '    }',
        '',
        '    if (auditorias.adyacente("actual")) {',
        '        auditorias.eliminar_adyacente("actual");',
        '    }',
        '',
        '    const id_corrida = "auditoria_" + Date.now();',
        '    const corrida = Nodo.crear_con_dato(id_corrida);',
        '    auditorias._adyacente_en(corrida, id_corrida);',
        '    auditorias._adyacente_en(corrida, "actual");',
        '',
        '    corrida._adyacente_en(Nodo.crear_con_dato(String(datos.fecha_hora)), "fecha_hora");',
        '    corrida._adyacente_en(Nodo.crear_con_dato(String(datos.entorno || "")), "entorno");',
        '    corrida._adyacente_en(Nodo.crear_con_dato(String(datos.duracion_ms || 0)), "duracion_ms");',
        '',
        '    const rep = datos.reporte || {};',
        '    const res = rep.resumen || {};',
        '    corrida._adyacente_en(Nodo.crear_con_dato(String(res.nodos_total || 0)), "nodos_total");',
        '    corrida._adyacente_en(Nodo.crear_con_dato(String(res.aristas_total || 0)), "aristas_total");',
        '    corrida._adyacente_en(Nodo.crear_con_dato(String(res.criticos || 0)), "criticos_count");',
        '    corrida._adyacente_en(Nodo.crear_con_dato(String(res.errores || 0)), "errores_count");',
        '    corrida._adyacente_en(Nodo.crear_con_dato(String(res.warnings || 0)), "warnings_count");',
        '',
        '    const truncado = ((res.criticos || 0) > AUDITORIA_PRIMEROS_N)',
        '                  || ((res.errores || 0) > AUDITORIA_PRIMEROS_N)',
        '                  || ((res.warnings || 0) > AUDITORIA_PRIMEROS_N);',
        '    corrida._adyacente_en(Nodo.crear_con_dato(truncado ? "1" : "0"), "truncado");',
        '',
        '    _agregar_primeros_auditoria(corrida, "primeros_criticos", rep.criticos || [], AUDITORIA_PRIMEROS_N);',
        '    _agregar_primeros_auditoria(corrida, "primeros_errores", rep.errores || [], AUDITORIA_PRIMEROS_N);',
        '    _agregar_primeros_auditoria(corrida, "primeros_warnings", rep.warnings || [], AUDITORIA_PRIMEROS_N);',
        '',
        '    _podar_auditorias(auditorias);',
        '',
        '    const ok = await Controlador.guardar(NOMBRE_GRAFO);',
        '    if (!ok) throw new Error("No se pudo guardar la auditoría");',
        '    return id_corrida;',
        '}',
    ],
    'reemplazar' => [
        'export async function registrar_auditoria(datos) {',
        '    await _asegurar_grafo_auditorias_cargado();',
        '    const Controlador = await obtener_controlador();',
        '',
        '    const raiz = Nodo.nodo_por_id("plugin");',
        '    if (!raiz) throw new Error("Sin raíz del plugin");',
        '',
        '    let auditorias = raiz.adyacente("auditorias");',
        '    if (!auditorias) {',
        '        auditorias = Nodo.crear_con_dato("");',
        '        raiz._adyacente_en(auditorias, "auditorias");',
        '    }',
        '',
        '    if (auditorias.adyacente("actual")) {',
        '        auditorias.eliminar_adyacente("actual");',
        '    }',
        '',
        '    const id_corrida = "auditoria_" + Date.now();',
        '    const rep = datos.reporte || {};',
        '    const res = rep.resumen || {};',
        '    const contenido_json = JSON.stringify({',
        '        fecha_hora: String(datos.fecha_hora || ""),',
        '        entorno: String(datos.entorno || ""),',
        '        duracion_ms: Number(datos.duracion_ms) || 0,',
        '        nodos_total: Number(res.nodos_total) || 0,',
        '        aristas_total: Number(res.aristas_total) || 0,',
        '        criticos_count: Number(res.criticos) || 0,',
        '        errores_count: Number(res.errores) || 0,',
        '        warnings_count: Number(res.warnings) || 0,',
        '        criticos: (rep.criticos || []).slice(0, AUDITORIA_PRIMEROS_N),',
        '        errores: (rep.errores || []).slice(0, AUDITORIA_PRIMEROS_N),',
        '        warnings: (rep.warnings || []).slice(0, AUDITORIA_PRIMEROS_N),',
        '    });',
        '',
        '    const corrida = Nodo.crear_con_dato(contenido_json);',
        '    auditorias._adyacente_en(corrida, id_corrida);',
        '    auditorias._adyacente_en(corrida, "actual");',
        '',
        '    _podar_auditorias(auditorias);',
        '',
        '    const ok = await Controlador.guardar(NOMBRE_GRAFO_AUDITORIAS);',
        '    if (!ok) throw new Error("No se pudo guardar la auditoría");',
        '    return id_corrida;',
        '}',
    ],
],

// ============================================================
// 5. GrafoPlugin.js: obtener_estado_auditorias parsea JSON
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/GrafoPlugin.js',
    'descripcion' => 'obtener_estado_auditorias: parsear JSON de cada nodo',
    'buscar' => [
        'export async function obtener_estado_auditorias() {',
        '    await asegurar_grafo_cargado();',
        '    const raiz = Nodo.nodo_por_id("plugin");',
        '    if (!raiz) return { actual: null, historial: [] };',
        '    const auditorias = raiz.adyacente("auditorias");',
        '    if (!auditorias) return { actual: null, historial: [] };',
        '',
        '    let actual = null;',
        '    const historial = [];',
        '    const ady = auditorias.adyacentes();',
        '    if (ady) {',
        '        for (const [nombre, corrida] of ady) {',
        '            if (nombre === "actual") {',
        '                actual = _formatear_auditoria(nombre, corrida);',
        '                continue;',
        '            }',
        '            if (!nombre.startsWith("auditoria_")) continue;',
        '            historial.push(_formatear_auditoria(nombre, corrida));',
        '        }',
        '    }',
        '',
        '    historial.sort((a, b) => (b.fecha_hora || "").localeCompare(a.fecha_hora || ""));',
        '    return { actual, historial: historial.slice(0, 5) };',
        '}',
    ],
    'reemplazar' => [
        'export async function obtener_estado_auditorias() {',
        '    await _asegurar_grafo_auditorias_cargado();',
        '    const raiz = Nodo.nodo_por_id("plugin");',
        '    if (!raiz) return { actual: null, historial: [] };',
        '    const auditorias = raiz.adyacente("auditorias");',
        '    if (!auditorias) return { actual: null, historial: [] };',
        '',
        '    let actual = null;',
        '    const historial = [];',
        '    const ady = auditorias.adyacentes();',
        '    if (ady) {',
        '        for (const [nombre, corrida] of ady) {',
        '            const raw = corrida.dato();',
        '            if (!raw) continue;',
        '            let datos;',
        '            try {',
        '                datos = JSON.parse(raw);',
        '            } catch (e) {',
        '                continue;',
        '            }',
        '            datos.id = nombre;',
        '            datos.truncado = (Number(datos.criticos_count) > (datos.criticos || []).length)',
        '                          || (Number(datos.errores_count) > (datos.errores || []).length)',
        '                          || (Number(datos.warnings_count) > (datos.warnings || []).length);',
        '            if (nombre === "actual") {',
        '                actual = datos;',
        '            } else if (nombre.startsWith("auditoria_")) {',
        '                historial.push(datos);',
        '            }',
        '        }',
        '    }',
        '',
        '    historial.sort((a, b) => (b.fecha_hora || "").localeCompare(a.fecha_hora || ""));',
        '    return { actual, historial: historial.slice(0, 5) };',
        '}',
    ],
],

// ============================================================
// 6. GrafoPlugin.js: simplificar _destruir_auditoria
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/GrafoPlugin.js',
    'descripcion' => 'Simplificar _destruir_auditoria',
    'buscar' => [
        'function _destruir_auditoria(auditorias, item) {',
        '    const corrida = item.corrida;',
        '    const ady = corrida.adyacentes();',
        '    if (ady) {',
        '        for (const [nombre, hijo] of ady) {',
        '            const ady_h = hijo.adyacentes();',
        '            if (ady_h) {',
        '                for (const [nh, n] of ady_h) {',
        '                    hijo.eliminar_adyacente(nh);',
        '                    Nodo.eliminar(n);',
        '                }',
        '            }',
        '            corrida.eliminar_adyacente(nombre);',
        '            Nodo.eliminar(hijo);',
        '        }',
        '    }',
        '    auditorias.eliminar_adyacente(item.nombre);',
        '    Nodo.eliminar(corrida);',
        '}',
    ],
    'reemplazar' => [
        'function _destruir_auditoria(auditorias, item) {',
        '    auditorias.eliminar_adyacente(item.nombre);',
        '    Nodo.eliminar(item.corrida);',
        '}',
    ],
],

// ============================================================
// 7. GrafoPlugin.js: eliminar _agregar_primeros_auditoria
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/GrafoPlugin.js',
    'descripcion' => 'Eliminar _agregar_primeros_auditoria',
    'buscar' => [
        'function _agregar_primeros_auditoria(corrida, nombre_contenedor, lista, n) {',
        '    if (!Array.isArray(lista) || lista.length === 0) return;',
        '    const cont = Nodo.crear_con_dato("");',
        '    const primeros = lista.slice(0, n);',
        '    for (let i = 0; i < primeros.length; i++) {',
        '        const item = Nodo.crear_con_dato("");',
        '        item._adyacente_en(Nodo.crear_con_dato(String(primeros[i].tipo || "")), "tipo");',
        '        item._adyacente_en(Nodo.crear_con_dato(String(primeros[i].detalle || "")), "detalle");',
        '        cont._adyacente_en(item, "item_" + i);',
        '    }',
        '    corrida._adyacente_en(cont, nombre_contenedor);',
        '}',
    ],
    'reemplazar' => [
        '// _agregar_primeros_auditoria eliminada en v1.5plugin.9o (JSON string en su lugar).',
    ],
],

// ============================================================
// 8. GrafoPlugin.js: eliminar _formatear_auditoria
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/GrafoPlugin.js',
    'descripcion' => 'Eliminar _formatear_auditoria',
    'buscar' => [
        'function _formatear_auditoria(nombre, corrida) {',
        '    return {',
        '        id: nombre,',
        '        fecha_hora: _dato_adyacente(corrida, "fecha_hora"),',
        '        entorno: _dato_adyacente(corrida, "entorno"),',
        '        duracion_ms: _dato_adyacente(corrida, "duracion_ms"),',
        '        nodos_total: _dato_adyacente(corrida, "nodos_total"),',
        '        aristas_total: _dato_adyacente(corrida, "aristas_total"),',
        '        criticos_count: _dato_adyacente(corrida, "criticos_count"),',
        '        errores_count: _dato_adyacente(corrida, "errores_count"),',
        '        warnings_count: _dato_adyacente(corrida, "warnings_count"),',
        '        truncado: _dato_adyacente(corrida, "truncado") === "1",',
        '        criticos: _leer_primeros_auditoria(corrida, "primeros_criticos"),',
        '        errores: _leer_primeros_auditoria(corrida, "primeros_errores"),',
        '        warnings: _leer_primeros_auditoria(corrida, "primeros_warnings"),',
        '    };',
        '}',
    ],
    'reemplazar' => [
        '// _formatear_auditoria eliminada en v1.5plugin.9o.',
    ],
],

// ============================================================
// 9. GrafoPlugin.js: eliminar _leer_primeros_auditoria
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/GrafoPlugin.js',
    'descripcion' => 'Eliminar _leer_primeros_auditoria',
    'buscar' => [
        'function _leer_primeros_auditoria(corrida, nombre_contenedor) {',
        '    const cont = corrida.adyacente(nombre_contenedor);',
        '    if (!cont) return [];',
        '    const out = [];',
        '    const ady = cont.adyacentes();',
        '    if (!ady) return out;',
        '    for (const [nombre, item] of ady) {',
        '        if (!nombre.startsWith("item_")) continue;',
        '        out.push({',
        '            tipo: _dato_adyacente(item, "tipo"),',
        '            detalle: _dato_adyacente(item, "detalle"),',
        '        });',
        '    }',
        '    return out;',
        '}',
    ],
    'reemplazar' => [
        '// _leer_primeros_auditoria eliminada en v1.5plugin.9o (JSON string en su lugar).',
    ],
],

];

// ============================================================
// Runner v2 (textual, ver prompt_sistema_scripts_v2.md §14)
// ============================================================

echo "=== Aplicador ===\n\n";

function detectar_eol(string $c): string { return (strpos($c, "\r\n") !== false) ? "\r\n" : "\n"; }
function normalizar_a_unix(string $c): string { return str_replace("\r\n", "\n", $c); }
function normalizar_a_original(string $c, string $e): string { return $e === "\n" ? $c : str_replace("\n", "\r\n", $c); }
function contar_ocurrencias(string $c, string $b): int {
    if ($b === '') return 0;
    $n = 0; $o = 0;
    while (($p = strpos($c, $b, $o)) !== false) { $n++; $o = $p + strlen($b); }
    return $n;
}

if (!isset($htmls_a_bumpear) || !is_array($htmls_a_bumpear)) {
    $htmls_a_bumpear = ['aplicacion_GET.html'];
}
if (!isset($version_nueva)) $version_nueva = '';
$version_nueva = trim((string)$version_nueva);
$bumpear = ($version_nueva !== '');

$creaciones = [];
$eliminaciones = [];
$reemplazos_por_archivo = [];

foreach ($cambios as $cambio) {
    $tipo = $cambio['tipo'] ?? 'reemplazar';
    if ($tipo === 'crear') { $creaciones[] = $cambio; continue; }
    if ($tipo === 'eliminar') { $eliminaciones[] = $cambio; continue; }
    if (!isset($cambio['archivo']) || !isset($cambio['buscar']) || !isset($cambio['reemplazar'])) {
        echo "[FALLO] Cambio mal formado.\n"; exit(1);
    }
    $reemplazos_por_archivo[$cambio['archivo']][] = $cambio;
}

$total_reemplazos = 0;
foreach ($reemplazos_por_archivo as $l) $total_reemplazos += count($l);
echo "[INFO] " . count($reemplazos_por_archivo) . " archivo(s) a reemplazar, "
    . count($creaciones) . " a crear, " . count($eliminaciones) . " a eliminar.\n\n";

$archivos_a_escribir = [];
$bloques_ok = 0;
$bloques_fallidos = [];

foreach ($reemplazos_por_archivo as $archivo_rel => $lista) {
    $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
    if (!file_exists($ruta_abs)) { $bloques_fallidos[] = "Archivo no encontrado: $archivo_rel"; continue; }
    $contenido_original = file_get_contents($ruta_abs);
    if ($contenido_original === false) { $bloques_fallidos[] = "No se pudo leer: $archivo_rel"; continue; }
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
        $archivos_a_escribir[$ruta_abs] = [$contenido, $eol];
    }
}

if ($modo_estricto && !empty($bloques_fallidos)) {
    echo "=== ABORTADO ===\n";
    foreach ($bloques_fallidos as $f) echo "  [FALLO] $f\n";
    exit(1);
}

$archivos_bump_php_js = [];
$archivos_bump_js_css = [];
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    $rel = substr($ruta_abs, strlen($raiz_proyecto) + 1);
    $ext = strtolower(pathinfo($ruta_abs, PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump_php_js[] = $rel;
    if ($ext === 'js' || $ext === 'css') $archivos_bump_js_css[] = $rel;
}
foreach ($creaciones as $cr) {
    $ext = strtolower(pathinfo($cr['archivo'], PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump_php_js[] = $cr['archivo'];
    if ($ext === 'js' || $ext === 'css') $archivos_bump_js_css[] = $cr['archivo'];
}

$bumps_atversion = 0;
$bumps_qv = 0;
$bumps_detalle = [];
$info_bumps = [];

if ($bumpear) {
    foreach (array_unique($archivos_bump_php_js) as $archivo_rel) {
        $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
        if (!file_exists($ruta_abs)) continue;
        if (isset($archivos_a_escribir[$ruta_abs])) {
            list($contenido, $eol) = $archivos_a_escribir[$ruta_abs];
        } else {
            $contenido_original = file_get_contents($ruta_abs);
            $eol = detectar_eol($contenido_original);
            $contenido = normalizar_a_unix($contenido_original);
        }
        $patron = '/(\*\s+@version\s+)(\S+)/';
        $viejo = '';
        $nuevo = preg_replace_callback($patron, function($m) use ($version_nueva, &$viejo) {
            $viejo = $m[2];
            return $m[1] . $version_nueva;
        }, $contenido, 1, $count);
        if ($count === 0) { $info_bumps[] = "$archivo_rel (sin @version)"; continue; }
        if ($viejo === $version_nueva) { continue; }
        $archivos_a_escribir[$ruta_abs] = [normalizar_a_unix($nuevo), $eol];
        $bumps_atversion++;
        $bumps_detalle[] = "$archivo_rel  @version $viejo -> $version_nueva";
    }

    foreach ($htmls_a_bumpear as $html_rel) {
        $html_abs = $raiz_proyecto . '/' . $html_rel;
        if (!file_exists($html_abs)) { $info_bumps[] = "$html_rel (no encontrado)"; continue; }
        if (isset($archivos_a_escribir[$html_abs])) {
            list($html, $eol) = $archivos_a_escribir[$html_abs];
        } else {
            $html_orig = file_get_contents($html_abs);
            $eol = detectar_eol($html_orig);
            $html = normalizar_a_unix($html_orig);
        }
        $html_antes = $html;
        foreach (array_unique($archivos_bump_js_css) as $archivo_rel) {
            $base = basename($archivo_rel);
            $base_esc = preg_quote($base, '/');
            $patron = '/(' . $base_esc . '\?v=)([^"\'\s>]+)/';
            $viejo_qv = '';
            $html = preg_replace_callback($patron, function($m) use ($version_nueva, &$viejo_qv) {
                $viejo_qv = $m[2];
                return $m[1] . $version_nueva;
            }, $html, 1, $c_qv);
            if ($c_qv > 0 && $viejo_qv !== $version_nueva) {
                $bumps_qv++;
                $bumps_detalle[] = "$html_rel  $base ?v= $viejo_qv -> $version_nueva";
            }
        }
        if ($html !== $html_antes) {
            $archivos_a_escribir[$html_abs] = [normalizar_a_unix($html), $eol];
        }
    }
}

$archivos_escritos = 0;
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    list($contenido_unix, $eol) = $info;
    $contenido_final = normalizar_a_original($contenido_unix, $eol);
    if (file_put_contents($ruta_abs, $contenido_final) === false) {
        echo "[FALLO] No se pudo escribir: " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n";
        continue;
    }
    $archivos_escritos++;
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
    if (!file_exists($ruta_abs)) { echo "[INFO] " . $elim['archivo'] . " no existía.\n"; continue; }
    if (unlink($ruta_abs)) echo "[OK] " . $elim['archivo'] . " (eliminado)\n";
    else echo "[FALLO] No se pudo eliminar: " . $elim['archivo'] . "\n";
}

if ($bumpear && (!empty($bumps_detalle) || !empty($info_bumps))) {
    echo "\n--- Bumps ---\n";
    foreach ($bumps_detalle as $d) echo "[BUMP] $d\n";
    foreach ($info_bumps as $i) echo "[INFO] $i\n";
}

echo "\n=== Resumen ===\n";
echo "Bloques aplicados: $bloques_ok\n";
echo "Archivos escritos: $archivos_escritos\n";
if ($bumpear) {
    echo "Bumps @version:    $bumps_atversion\n";
    echo "Bumps ?v=:         $bumps_qv\n";
}
if (!empty($bloques_fallidos)) {
    echo "Fallos: " . count($bloques_fallidos) . "\n";
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";