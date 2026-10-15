<?php
/**
 * Aplicador — Fase 2e: boton "Copiar tabla de pasajeros".
 *
 * Agrega:
 *   - Nuevo modulo Aplicacion/CopiarPasajeros.js con la logica:
 *     lee viaje/micro del page, pide estado_asientos, arma la
 *     tabla TSV.
 *   - servicio.js: import + handler + caso en el switch +
 *     globalThis.copiar_pasajeros.
 *   - ventana.html: boton + <pre> + <textarea> fallback + CSS.
 *   - ventana.js: listener + copia al portapapeles.
 *
 * Uso (raiz del proyecto plugin): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.7p';

$htmls_a_bumpear = [];

$cambios = [

    // ============================================================
    // 1. NUEVO: Aplicacion/CopiarPasajeros.js
    // ============================================================
    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/CopiarPasajeros.js',
        'descripcion' => 'Nuevo CopiarPasajeros.js',
        'contenido' => [
            '/**',
            ' * Copiar tabla de pasajeros del micro abierto.',
            ' *',
            ' * Lee viaje_seleccionado y micro_seleccionado del page,',
            ' * pide viajes/estado_asientos, y arma una tabla TSV',
            ' * (tab-separado) lista para pegar en Excel.',
            ' *',
            ' * Columnas: nombre, apellido, tipo_documento, documento,',
            ' * genero, franja_etaria.',
            ' *',
            ' * Filas: una por asiento, ordenadas por numero.',
            ' * Asiento sin pasajero -> fila de columnas vacias.',
            ' *',
            ' * @version 1.5plugin.7p',
            ' * @since 1.5plugin.7p',
            ' */',
            '',
            'import { _post } from "./pruebas/_helpers.js";',
            '',
            '// ============================================================',
            '// Helpers de calculo',
            '// ============================================================',
            '',
            '/**',
            ' * Fecha de hoy en formato YYYY-MM-DD (hora local del navegador).',
            ' */',
            'function _hoy_iso() {',
            '    const d = new Date();',
            '    const y = d.getFullYear();',
            '    const m = String(d.getMonth() + 1).padStart(2, "0");',
            '    const dia = String(d.getDate()).padStart(2, "0");',
            '    return y + "-" + m + "-" + dia;',
            '}',
            '',
            '/**',
            ' * Edad exacta en anios entre dos fechas ISO YYYY-MM-DD.',
            ' * Devuelve -1 si la fecha es invalida.',
            ' */',
            'function _calcular_edad(fecha_nac_iso, hoy_iso) {',
            '    const m1 = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(fecha_nac_iso || "");',
            '    const m2 = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(hoy_iso || "");',
            '    if (!m1 || !m2) return -1;',
            '    const anio_n = parseInt(m1[1], 10);',
            '    const mes_n = parseInt(m1[2], 10);',
            '    const dia_n = parseInt(m1[3], 10);',
            '    const anio_h = parseInt(m2[1], 10);',
            '    const mes_h = parseInt(m2[2], 10);',
            '    const dia_h = parseInt(m2[3], 10);',
            '    let edad = anio_h - anio_n;',
            '    if (mes_h < mes_n || (mes_h === mes_n && dia_h < dia_n)) {',
            '        edad--;',
            '    }',
            '    if (edad < 0 || edad > 130) return -1;',
            '    return edad;',
            '}',
            '',
            '/**',
            ' * Franja etaria segun edad. Devuelve "" si edad < 0.',
            ' */',
            'function _franja_etaria(edad) {',
            '    if (edad < 0) return "";',
            '    if (edad <= 15) return "0-15";',
            '    if (edad <= 17) return "16-17";',
            '    if (edad <= 29) return "18-29";',
            '    if (edad <= 44) return "30-44";',
            '    if (edad <= 59) return "45-59";',
            '    if (edad <= 74) return "60-74";',
            '    return "75+";',
            '}',
            '',
            '/**',
            ' * Infiere genero por terminacion de las palabras del nombre.',
            ' * Cuenta palabras terminadas en "a"/"á" (femenino) y en',
            ' * "o"/"ó" (masculino). Devuelve "F" o "M" si hay mayoria',
            ' * clara, "" si empate o cero.',
            ' */',
            'function _inferir_genero(nombres) {',
            '    const texto = String(nombres || "").trim();',
            '    if (texto === "") return "";',
            '    const palabras = texto.split(/\\s+/);',
            '    let fem = 0;',
            '    let masc = 0;',
            '    for (const p of palabras) {',
            '        const ultima = p.slice(-1).toLowerCase();',
            '        if (ultima === "a" || ultima === "á") fem++;',
            '        else if (ultima === "o" || ultima === "ó") masc++;',
            '    }',
            '    if (fem > masc) return "F";',
            '    if (masc > fem) return "M";',
            '    return "";',
            '}',
            '',
            '// ============================================================',
            '// Armado de la tabla',
            '// ============================================================',
            '',
            '/**',
            ' * Arma la tabla TSV a partir del array de asientos.',
            ' *',
            ' * @param {Array} asientos Array de asientos de viajes/estado_asientos.',
            ' * @returns {string}',
            ' */',
            'function _armar_tabla(asientos) {',
            '    const hoy = _hoy_iso();',
            '    const filas = [];',
            '    for (const a of asientos) {',
            '        if (a && a.tiene_pasajero && a.pasajero) {',
            '            const p = a.pasajero;',
            '            const nombres = p.nombres || "";',
            '            const apellido = p.apellido || "";',
            '            const dni = p.dni || p.dni_visible || "";',
            '            const edad = _calcular_edad(p.fecha_nacimiento, hoy);',
            '            const franja = _franja_etaria(edad);',
            '            const genero = _inferir_genero(nombres);',
            '            filas.push([nombres, apellido, "DNI", dni, genero, franja].join("\\t"));',
            '        } else {',
            '            // Fila vacia: 6 columnas separadas por 5 tabs.',
            '            filas.push(["", "", "", "", "", ""].join("\\t"));',
            '        }',
            '    }',
            '    return filas.join("\\n");',
            '}',
            '',
            '/**',
            ' * Ordena por numero de asiento ascendente (numerico).',
            ' */',
            'function _ordenar_por_numero(asientos) {',
            '    const copia = (asientos || []).slice();',
            '    copia.sort(function (a, b) {',
            '        const na = parseInt(a && a.numero, 10);',
            '        const nb = parseInt(b && b.numero, 10);',
            '        if (isNaN(na) && isNaN(nb)) return 0;',
            '        if (isNaN(na)) return 1;',
            '        if (isNaN(nb)) return -1;',
            '        return na - nb;',
            '    });',
            '    return copia;',
            '}',
            '',
            '// ============================================================',
            '// API publica',
            '// ============================================================',
            '',
            '/**',
            ' * Lee el viaje/micro del page y devuelve la tabla TSV.',
            ' *',
            ' * @param {object} ctx',
            ' * @returns {Promise<object>} {exito, tabla, viaje, micro, cantidad_filas}',
            ' *                             o {exito: false, error}.',
            ' */',
            'export async function copiar_pasajeros_del_micro(ctx) {',
            '    // 1. Leer viaje y micro del page.',
            '    let info;',
            '    try {',
            '        const r = await chrome.scripting.executeScript({',
            '            target: { tabId: ctx.pestana_id },',
            '            world: "MAIN",',
            '            func: () => {',
            '                if (typeof viaje_seleccionado === "undefined" || !viaje_seleccionado) {',
            '                    return { exito: false, error: "sin viaje abierto en el croquis" };',
            '                }',
            '                if (typeof micro_seleccionado === "undefined" || !micro_seleccionado) {',
            '                    return { exito: false, error: "sin micro abierto en el croquis" };',
            '                }',
            '                const v = viaje_seleccionado;',
            '                return {',
            '                    exito: true,',
            '                    nombre_viaje: v.nombre_viaje,',
            '                    nombre_dueno: v.dueno,',
            '                    nombre_micro: micro_seleccionado,',
            '                };',
            '            }',
            '        });',
            '        info = (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };',
            '    } catch (e) {',
            '        return { exito: false, error: "Error al leer el page: " + e.message };',
            '    }',
            '    if (!info.exito) return { exito: false, error: info.error };',
            '',
            '    // 2. Pedir estado_asientos.',
            '    let datos;',
            '    try {',
            '        datos = await _post(ctx, "viajes/estado_asientos", {',
            '            nombre_viaje: info.nombre_viaje,',
            '            nombre_micro: info.nombre_micro,',
            '            nombre_dueno: info.nombre_dueno,',
            '        });',
            '    } catch (e) {',
            '        return { exito: false, error: "Error de red: " + e.message };',
            '    }',
            '    if (!datos.exito || !Array.isArray(datos.asientos)) {',
            '        return { exito: false, error: datos.error || "estado_asientos no devolvio asientos" };',
            '    }',
            '',
            '    // 3. Armar la tabla.',
            '    const ordenados = _ordenar_por_numero(datos.asientos);',
            '    const tabla = _armar_tabla(ordenados);',
            '',
            '    return {',
            '        exito: true,',
            '        tabla: tabla,',
            '        viaje: info.nombre_viaje,',
            '        micro: info.nombre_micro,',
            '        cantidad_filas: ordenados.length,',
            '    };',
            '}',
        ],
    ],

    // ============================================================
    // 2. servicio.js: import
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio: import CopiarPasajeros',
        'buscar' => [
            'import { limpiar_datos_de_prueba } from "./LimpiezaPrueba.js";',
        ],
        'reemplazar' => [
            'import { limpiar_datos_de_prueba } from "./LimpiezaPrueba.js";',
            'import { copiar_pasajeros_del_micro } from "./CopiarPasajeros.js";',
        ],
    ],

    // ============================================================
    // 3. servicio.js: caso en el switch
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio: caso copiar_tabla_pasajeros',
        'buscar' => [
            '                case "limpiar_datos_prueba":',
            '                    sendResponse(await _ejecutar_limpieza());',
            '                    break;',
        ],
        'reemplazar' => [
            '                case "limpiar_datos_prueba":',
            '                    sendResponse(await _ejecutar_limpieza());',
            '                    break;',
            '',
            '                case "copiar_tabla_pasajeros": {',
            '                    const pestana_cp = await _obtener_pestana_piloto();',
            '                    if (!pestana_cp) {',
            '                        sendResponse({ exito: false, error: "No hay una pestana del piloto abierta" });',
            '                        break;',
            '                    }',
            '                    const ctx_cp = _crear_ctx(pestana_cp.id);',
            '                    try {',
            '                        sendResponse(await copiar_pasajeros_del_micro(ctx_cp));',
            '                    } catch (e) {',
            '                        sendResponse({ exito: false, error: e.message });',
            '                    }',
            '                    break;',
            '                }',
        ],
    ],

    // ============================================================
    // 4. servicio.js: global
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio: global copiar_pasajeros',
        'buscar' => [
            'globalThis.limpiar_prueba = async () => {',
            '    return await _ejecutar_limpieza();',
            '};',
        ],
        'reemplazar' => [
            'globalThis.limpiar_prueba = async () => {',
            '    return await _ejecutar_limpieza();',
            '};',
            '',
            '// Copia la tabla de pasajeros del micro abierto. Mismo',
            '// mecanismo que el boton del popup, para la consola del',
            '// SW.',
            'globalThis.copiar_pasajeros = async () => {',
            '    const pestana = await _obtener_pestana_piloto();',
            '    if (!pestana) return { exito: false, error: "No hay una pestana del piloto abierta" };',
            '    const ctx = _crear_ctx(pestana.id);',
            '    return await copiar_pasajeros_del_micro(ctx);',
            '};',
        ],
    ],

    // ============================================================
    // 5. ventana.html: CSS
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.html',
        'descripcion' => 'ventana.html: CSS de copiar',
        'buscar' => [
            '    #limpieza_log {',
            '      font-family: Consolas, Monaco, monospace;',
            '      font-size: 11px;',
            '      line-height: 1.4;',
            '      background: #1e1e1e;',
            '      color: #d4d4d4;',
            '      padding: 8px;',
            '      border-radius: 4px;',
            '      margin: 0 0 12px 0;',
            '      max-height: 260px;',
            '      overflow-y: auto;',
            '      white-space: pre-wrap;',
            '    }',
            '  </style>',
        ],
        'reemplazar' => [
            '    #limpieza_log {',
            '      font-family: Consolas, Monaco, monospace;',
            '      font-size: 11px;',
            '      line-height: 1.4;',
            '      background: #1e1e1e;',
            '      color: #d4d4d4;',
            '      padding: 8px;',
            '      border-radius: 4px;',
            '      margin: 0 0 12px 0;',
            '      max-height: 260px;',
            '      overflow-y: auto;',
            '      white-space: pre-wrap;',
            '    }',
            '',
            '    /* Copiar tabla de pasajeros */',
            '    .copiar-header {',
            '      display: flex;',
            '      justify-content: space-between;',
            '      align-items: center;',
            '      padding: 8px 10px;',
            '      margin-bottom: 12px;',
            '      background: #f8f9fa;',
            '      border: 1px solid #e0e0e0;',
            '      border-radius: 6px;',
            '    }',
            '    .copiar-header button {',
            '      font-size: 12px;',
            '      padding: 4px 12px;',
            '    }',
            '    #copiar_estado {',
            '      font-size: 11px;',
            '      color: #666;',
            '    }',
            '    #copiar_pre {',
            '      font-family: Consolas, Monaco, monospace;',
            '      font-size: 11px;',
            '      line-height: 1.4;',
            '      background: #f5f5f5;',
            '      color: #222;',
            '      padding: 8px;',
            '      border-radius: 4px;',
            '      margin: 0 0 12px 0;',
            '      max-height: 260px;',
            '      overflow: auto;',
            '      white-space: pre;',
            '    }',
            '    #copiar_textarea {',
            '      width: 100%;',
            '      height: 80px;',
            '      font-family: Consolas, Monaco, monospace;',
            '      font-size: 11px;',
            '      margin: 0 0 12px 0;',
            '    }',
            '  </style>',
        ],
    ],

    // ============================================================
    // 6. ventana.html: HTML
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.html',
        'descripcion' => 'ventana.html: boton + pre + textarea',
        'buscar' => [
            '  <div class="limpieza-header">',
            '    <button id="btn_limpiar_datos_prueba">Limpiar datos de prueba</button>',
            '    <span id="limpieza_estado"></span>',
            '  </div>',
            '  <pre id="limpieza_log" style="display:none"></pre>',
        ],
        'reemplazar' => [
            '  <div class="limpieza-header">',
            '    <button id="btn_limpiar_datos_prueba">Limpiar datos de prueba</button>',
            '    <span id="limpieza_estado"></span>',
            '  </div>',
            '  <pre id="limpieza_log" style="display:none"></pre>',
            '',
            '  <div class="copiar-header">',
            '    <button id="btn_copiar_pasajeros">Copiar tabla de pasajeros</button>',
            '    <span id="copiar_estado"></span>',
            '  </div>',
            '  <pre id="copiar_pre" style="display:none"></pre>',
            '  <textarea id="copiar_textarea" style="display:none" readonly></textarea>',
        ],
    ],

    // ============================================================
    // 7. ventana.js: logica del boton
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.js',
        'descripcion' => 'ventana.js: logica del boton copiar',
        'buscar' => [
            '    // Listener de progreso (broadcast desde el SW).',
        ],
        'reemplazar' => [
            '    // ============================================================',
            '    // Copiar tabla de pasajeros',
            '    // ============================================================',
            '',
            '    async function copiar_pasajeros() {',
            '        const btn = document.getElementById("btn_copiar_pasajeros");',
            '        const pre = document.getElementById("copiar_pre");',
            '        const ta = document.getElementById("copiar_textarea");',
            '        const est = document.getElementById("copiar_estado");',
            '',
            '        btn.disabled = true;',
            '        pre.style.display = "none";',
            '        ta.style.display = "none";',
            '        est.textContent = "Leyendo...";',
            '',
            '        try {',
            '            const resp = await enviar({ tipo: "copiar_tabla_pasajeros" });',
            '            if (!resp || !resp.exito) {',
            '                est.textContent = "Error: " + (resp && resp.error ? resp.error : "desconocido");',
            '                return;',
            '            }',
            '',
            '            pre.textContent = resp.tabla;',
            '            pre.style.display = "block";',
            '',
            '            // Intentar copiar al portapapeles.',
            '            let copiado = false;',
            '            try {',
            '                await navigator.clipboard.writeText(resp.tabla);',
            '                copiado = true;',
            '            } catch (e) {',
            '                copiado = false;',
            '            }',
            '',
            '            if (copiado) {',
            '                est.textContent = "Copiado (" + resp.cantidad_filas + " filas)";',
            '                ta.style.display = "none";',
            '            } else {',
            '                // Fallback: mostrar la tabla en el textarea,',
            '                // seleccionarla, pedirle al usuario Ctrl+C.',
            '                ta.value = resp.tabla;',
            '                ta.style.display = "block";',
            '                ta.focus();',
            '                ta.select();',
            '                est.textContent = "Copiá con Ctrl+C (" + resp.cantidad_filas + " filas)";',
            '            }',
            '        } catch (e) {',
            '            est.textContent = "Error: " + e.message;',
            '        } finally {',
            '            btn.disabled = false;',
            '        }',
            '    }',
            '',
            '    (function _conectar_boton_copiar() {',
            '        const btn = document.getElementById("btn_copiar_pasajeros");',
            '        if (btn) btn.addEventListener("click", copiar_pasajeros);',
            '    })();',
            '',
            '    // Listener de progreso (broadcast desde el SW).',
        ],
    ],

];

// ============================================================
// Runner v2
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
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    $rel = substr($ruta_abs, strlen($raiz_proyecto) + 1);
    $ext = strtolower(pathinfo($ruta_abs, PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump_php_js[] = $rel;
}
foreach ($creaciones as $cr) {
    $ext = strtolower(pathinfo($cr['archivo'], PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump_php_js[] = $cr['archivo'];
}

$bumps_atversion = 0;
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

if ($bumpear && (!empty($bumps_detalle) || !empty($info_bumps))) {
    echo "\n--- Bumps ---\n";
    foreach ($bumps_detalle as $d) echo "[BUMP] $d\n";
    foreach ($info_bumps as $i) echo "[INFO] $i\n";
}

echo "\n=== Resumen ===\n";
echo "Bloques aplicados: $bloques_ok\n";
echo "Archivos escritos: $archivos_escritos\n";
if ($bumpear) echo "Bumps @version:    $bumps_atversion\n";
if (!empty($bloques_fallidos)) {
    echo "Fallos: " . count($bloques_fallidos) . "\n";
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";