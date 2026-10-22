<?php
/**
 * Aplicador — v1.5plugin.9g: código configurable de drenado +
 * drenado como paso opcional.
 *
 * Uso (raíz de iteradoresJS/): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.9g';
$htmls_a_bumpear = [];

$cambios = [

    // ============================================================
    // 1. Migraciones.js: drenar_buzon acepta código, falla como advertencia
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/Migraciones.js',
        'descripcion' => 'Migraciones.js: drenar_buzon con código configurable',
        'buscar' => [
            '// ============================================================',
            '// Drenar buzón',
            '// ============================================================',
            '//',
            '// Logout + login dueño + ir a Vendidos + esperar + logout.',
            '//',
            '// Al terminar, el usuario queda deslogueado. El panel lo',
            '// advierte antes de correr.',
            'export async function drenar_buzon(ctx) {',
            '    // 1. Login como dueño de prueba.',
            '    try {',
            '        await ctx.asegurar_login(CODIGO_DUENO);',
            '    } catch (e) {',
            '        return {',
            '            exito: false,',
            '            error: "Login dueño falló: " + (e && e.message ? e.message : "desconocido")',
            '                   + " (código intentado: " + CODIGO_DUENO + ")."',
            '                   + " Verificá que el usuario dueño exista en este grafo, o drená manualmente: login dueño → Vendidos → logout.",',
            '        };',
            '    }',
        ],
        'reemplazar' => [
            '// ============================================================',
            '// Drenar buzón',
            '// ============================================================',
            '//',
            '// Logout + login dueño + ir a Vendidos + esperar + logout.',
            '//',
            '// Al terminar, el usuario queda deslogueado. El panel lo',
            '// advierte antes de correr.',
            '//',
            '// v1.5plugin.9g: acepta un código de dueño configurable. Si no',
            '// viene, usa CODIGO_DUENO (el de los datos de prueba locales).',
            '// En producción o pruebas, el código real del dueño puede ser',
            '// otro; el panel ahora lo permite editar.',
            'export async function drenar_buzon(ctx, codigo_dueno) {',
            '    const codigo = codigo_dueno || CODIGO_DUENO;',
            '',
            '    // 1. Login como dueño.',
            '    try {',
            '        await ctx.asegurar_login(codigo);',
            '    } catch (e) {',
            '        return {',
            '            exito: false,',
            '            error: "Login dueño falló con código \\"" + codigo + "\\": "',
            '                   + (e && e.message ? e.message : "desconocido")',
            '                   + ". Verificá que el código sea el correcto en este grafo, o drená manualmente: login dueño → Vendidos → logout.",',
            '        };',
            '    }',
        ],
    ],

    // ============================================================
    // 2. Migraciones.js: drenado como advertencia + exito ajustado
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/Migraciones.js',
        'descripcion' => 'Migraciones.js: drenado como advertencia + exito por errores críticos',
        'buscar' => [
            '    if (opciones.drenar_buzon) {',
            '        await al_progreso({ paso_id: "drenar_buzon", estado: "corriendo" });',
            '        const inicio = Date.now();',
            '        let r;',
            '        try {',
            '            r = await drenar_buzon(ctx);',
            '        } catch (e) {',
            '            r = { exito: false, error: e.message };',
            '        }',
            '        const duracion_ms = Date.now() - inicio;',
            '        resultados.push({',
            '            paso: "drenar_buzon",',
            '            estado: r.exito ? "ok" : "error",',
            '            mensaje: r.exito ? "Buzón drenado" : (r.error || "Error desconocido"),',
            '            duracion_ms: duracion_ms,',
            '        });',
            '        await al_progreso({',
            '            paso_id: "drenar_buzon",',
            '            estado: r.exito ? "ok" : "error",',
            '            mensaje: r.exito ? "Buzón drenado" : (r.error || "Error desconocido"),',
            '            duracion_ms: duracion_ms,',
            '        });',
            '    } else {',
            '        await al_progreso({ paso_id: "drenar_buzon", estado: "saltado", mensaje: "No seleccionado" });',
            '    }',
            '',
            '    return { exito: true, resultados };',
            '}',
        ],
        'reemplazar' => [
            '    if (opciones.drenar_buzon) {',
            '        await al_progreso({ paso_id: "drenar_buzon", estado: "corriendo" });',
            '        const inicio = Date.now();',
            '        let r;',
            '        try {',
            '            r = await drenar_buzon(ctx, opciones.codigo_dueno);',
            '        } catch (e) {',
            '            r = { exito: false, error: e.message };',
            '        }',
            '        const duracion_ms = Date.now() - inicio;',
            '        // v1.5plugin.9g: el drenado es opcional. Si falla, se',
            '        // marca como "advertencia" (amarillo) en vez de "error"',
            '        // (rojo). No afecta el estado_global de la migración.',
            '        const estado_paso = r.exito ? "ok" : "advertencia";',
            '        const msg_paso = r.exito ? "Buzón drenado" : (r.error || "Error desconocido");',
            '        resultados.push({',
            '            paso: "drenar_buzon",',
            '            estado: estado_paso,',
            '            mensaje: msg_paso,',
            '            duracion_ms: duracion_ms,',
            '        });',
            '        await al_progreso({',
            '            paso_id: "drenar_buzon",',
            '            estado: estado_paso,',
            '            mensaje: msg_paso,',
            '            duracion_ms: duracion_ms,',
            '        });',
            '    } else {',
            '        await al_progreso({ paso_id: "drenar_buzon", estado: "saltado", mensaje: "No seleccionado" });',
            '    }',
            '',
            '    // v1.5plugin.9g: exito = true si no hubo errores críticos',
            '    // (los "advertencia" no cuentan). Solo los pasos con estado',
            '    // "error" (los 9 del piloto) hacen que la migración falle.',
            '    const hubo_error_critico = resultados.some(function (r) { return r.estado === "error"; });',
            '    return { exito: !hubo_error_critico, resultados };',
            '}',
        ],
    ],

    // ============================================================
    // 3. Migraciones.js: exportar código por defecto
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/Migraciones.js',
        'descripcion' => 'Migraciones.js: exportar CODIGO_DRENADO_DEFAULT',
        'buscar' => [
            'import { URL_PILOTO, CODIGO_DUENO } from "./ConfiguracionApli.js";',
        ],
        'reemplazar' => [
            'import { URL_PILOTO, CODIGO_DUENO } from "./ConfiguracionApli.js";',
            '',
            '// v1.5plugin.9g: exportado para que ventana.js pueda mostrar',
            '// el default del input de código de drenado.',
            'export const CODIGO_DRENADO_DEFAULT = CODIGO_DUENO;',
        ],
    ],

    // ============================================================
    // 4. ventana.js: input de código al lado del checkbox de drenar
    // ============================================================
    // ============================================================
    // 4. ventana.js: input de código al lado del checkbox de drenar
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.js',
        'descripcion' => 'ventana.js: input de código de drenado',
        'buscar' => [
            '            html += \'<li class="migracion-paso">\';',
            '            html += \'<label>\';',
            '            html += \'<input type="checkbox" id="migracion_check_drenar" checked>\';',
            '            html += \'<span>10. Drenar buzón al final</span>\';',
            '            html += \'<span class="tooltip-icon" title="Login como dueño con el código configurado. Si falla, drenar manualmente.">⚠️</span>\';            html += \'</label>\';',
            '            html += \'</li>\';',
        ],
        'reemplazar' => [
            '            html += \'<li class="migracion-paso">\';',
            '            html += \'<label style="flex:1;">\';',
            '            html += \'<input type="checkbox" id="migracion_check_drenar" checked>\';',
            '            html += \'<span>10. Drenar buzón al final</span>\';',
            '            html += \'<span class="tooltip-icon" title="Login como dueño, ir a Vendidos, logout.">⚠️</span>\';',
            '            html += \'</label>\';',
            '            html += \'<input type="text" id="migracion_codigo_drenar" placeholder="código dueño" style="width:90px; padding:2px 4px; font-size:11px; font-family:Consolas,monospace;" title="Código de acceso del dueño en este grafo.">\';',
            '            html += \'</li>\';',
        ],
    ],

    // ============================================================
    // 5. ventana.js: leer código de drenado
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.js',
        'descripcion' => 'ventana.js: leer código de drenado',
        'buscar' => [
            '        const drenar = document.getElementById("migracion_check_drenar").checked;',
        ],
        'reemplazar' => [
            '        const drenar = document.getElementById("migracion_check_drenar").checked;',
            '        const codigo_drenar = (document.getElementById("migracion_codigo_drenar")?.value || "").trim();',
        ],
    ],

    // ============================================================
    // 6. ventana.js: pasar código en opciones
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.js',
        'descripcion' => 'ventana.js: pasar código en opciones',
        'buscar' => [
            '            const r = await enviar({',
            '                tipo: "correr_migraciones",',
            '                opciones: { pasos: pasos, drenar_buzon: drenar },',
            '            });',
        ],
        'reemplazar' => [
            '            const opciones_envio = { pasos: pasos, drenar_buzon: drenar };',
            '            if (codigo_drenar) opciones_envio.codigo_dueno = codigo_drenar;',
            '            const r = await enviar({',
            '                tipo: "correr_migraciones",',
            '                opciones: opciones_envio,',
            '            });',
        ],
    ],

    // ============================================================
    // 7. ventana.js: contador de advertencias en resumen
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.js',
        'descripcion' => 'ventana.js: contador de advertencias en resumen',
        'buscar' => [
            '                const err_count = Object.values(pasos_c).filter(function(p) { return p.estado === "error"; }).length;',
            '                html += \'<div class="migracion-hist-item" style="background:#f8f9fa;">\';',
            '                html += \'<span>\' + ok_count + \' OK · \' + salt_count + \' saltados · \' + err_count + \' errores</span>\';',
            '                html += \'</div>\';',
        ],
        'reemplazar' => [
            '                const err_count = Object.values(pasos_c).filter(function(p) { return p.estado === "error"; }).length;',
            '                const adv_count = Object.values(pasos_c).filter(function(p) { return p.estado === "advertencia"; }).length;',
            '                html += \'<div class="migracion-hist-item" style="background:#f8f9fa;">\';',
            '                html += \'<span>\' + ok_count + \' OK · \' + salt_count + \' saltados · \' + err_count + \' errores\';',
            '                if (adv_count > 0) html += \' · \' + adv_count + \' advertencias\';',
            '                html += \'</span>\';',
            '                html += \'</div>\';',
        ],
    ],

    // ============================================================
    // 8. ventana.js: detalle de advertencias en el panel
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.js',
        'descripcion' => 'ventana.js: detalle de advertencias en el panel',
        'buscar' => [
            '                    const pe_dr = pasos_c["drenar_buzon"];',
            '                    if (pe_dr && pe_dr.estado === "error") {',
            '                        html += \'<div style="margin-top:6px;"><b>10. Drenar buzón:</b> \';',
            '                        html += _escapar_html(pe_dr.mensaje || "(sin mensaje)");',
            '                        html += \'</div>\';',
            '                    }',
            '                    html += \'</div>\';',
            '                }',
        ],
        'reemplazar' => [
            '                    const pe_dr = pasos_c["drenar_buzon"];',
            '                    if (pe_dr && (pe_dr.estado === "error" || pe_dr.estado === "advertencia")) {',
            '                        const color = pe_dr.estado === "advertencia" ? "#b06000" : "#c5221f";',
            '                        html += \'<div style="margin-top:6px; color:\' + color + \';"><b>10. Drenar buzón (\' + pe_dr.estado + \'):</b> \';',
            '                        html += _escapar_html(pe_dr.mensaje || "(sin mensaje)");',
            '                        html += \'</div>\';',
            '                    }',
            '                    html += \'</div>\';',
            '                }',
            '                // v1.5plugin.9g: si la migración fue completa pero',
            '                // el drenado quedó como advertencia, avisar sin',
            '                // bloquear. Los pasos 1-9 fueron exitosos.',
            '                if (adv_count > 0 && err_count === 0) {',
            '                    html += \'<div class="migracion-aviso" style="background:#fef7e0; border-color:#ffc107; margin-top:8px;">\';',
            '                    html += \'<strong>Migración completa.</strong> El drenado del buzón falló (código inválido o red). \';',
            '                    html += \'Podés drenar a mano: login con el código del dueño → Vendidos → logout.\';',
            '                    html += \'</div>\';',
            '                }',
        ],
    ],

    // ============================================================
    // 9. ventana.js: pre-cargar el código por defecto al abrir el panel
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.js',
        'descripcion' => 'ventana.js: pre-cargar código default del drenado',
        'buscar' => [
            '        panel.innerHTML = html;',
            '',
            '        if (en_curso) {',
        ],
        'reemplazar' => [
            '        panel.innerHTML = html;',
            '',
            '        // v1.5plugin.9g: pre-cargar el input del código de drenado',
            '        // con el default (carmen1). Si el usuario lo cambia, queda',
            '        // hasta la próxima re-renderización del panel.',
            '        const input_cod = document.getElementById("migracion_codigo_drenar");',
            '        if (input_cod && !input_cod.value) {',
            '            input_cod.value = "carmen1";',
            '        }',
            '',
            '        if (en_curso) {',
        ],
    ],

    // ============================================================
    // 10. ConfiguracionApli.js: bump a 9g
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'ConfiguracionApli.js: bump VERSION_APP a 9g',
        'buscar' => [
            'export const VERSION_APP = "1.5plugin.9f";',
        ],
        'reemplazar' => [
            'export const VERSION_APP = "1.5plugin.9g";',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'ConfiguracionApli.js: bump VERSION_PLUGIN a 9g',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.9f";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.9g";',
        ],
    ],

];

// ============================================================
// Runner v2 (estándar)
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

if (!isset($htmls_a_bumpear) || !is_array($htmls_a_bumpear)) { $htmls_a_bumpear = []; }
if (!isset($version_nueva)) $version_nueva = '';
$version_nueva = trim((string)$version_nueva);
$bumpear = ($version_nueva !== '');

$creaciones = []; $eliminaciones = []; $reemplazos_por_archivo = [];
foreach ($cambios as $cambio) {
    $tipo = $cambio['tipo'] ?? 'reemplazar';
    if ($tipo === 'crear') { $creaciones[] = $cambio; continue; }
    if ($tipo === 'eliminar') { $eliminaciones[] = $cambio; continue; }
    if (!isset($cambio['buscar']) || !isset($cambio['reemplazar'])) continue;
    $reemplazos_por_archivo[$cambio['archivo']][] = $cambio;
}

echo "[INFO] " . count($reemplazos_por_archivo) . " archivo(s) a reemplazar, "
    . count($creaciones) . " a crear, " . count($eliminaciones) . " a eliminar.\n\n";

$archivos_a_escribir = []; $bloques_ok = 0; $bloques_fallidos = [];

foreach ($reemplazos_por_archivo as $archivo_rel => $lista) {
    $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
    if (!file_exists($ruta_abs)) { $bloques_fallidos[] = "Archivo no encontrado: $archivo_rel"; continue; }
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
        $archivos_a_escribir[$ruta_abs] = [$contenido, $eol];
    }
}

if ($modo_estricto && !empty($bloques_fallidos)) {
    echo "=== ABORTADO ===\n";
    foreach ($bloques_fallidos as $f) echo "  [FALLO] $f\n";
    exit(1);
}

$archivos_bump = [];
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    $ext = strtolower(pathinfo($ruta_abs, PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump[] = substr($ruta_abs, strlen($raiz_proyecto) + 1);
}

$bumps = 0; $bumps_detalle = []; $info_bumps = [];
if ($bumpear) {
    foreach (array_unique($archivos_bump) as $archivo_rel) {
        $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
        if (!file_exists($ruta_abs)) continue;
        if (isset($archivos_a_escribir[$ruta_abs])) { list($contenido, $eol) = $archivos_a_escribir[$ruta_abs]; }
        else { $contenido = normalizar_a_unix(file_get_contents($ruta_abs)); $eol = detectar_eol($contenido); }
        $viejo = '';
        $nuevo = preg_replace_callback('/(\*\s+@version\s+)(\S+)/', function($m) use ($version_nueva, &$viejo) {
            $viejo = $m[2]; return $m[1] . $version_nueva;
        }, $contenido, 1, $count);
        if ($count === 0) { $info_bumps[] = "$archivo_rel (sin @version)"; continue; }
        if ($viejo === $version_nueva) continue;
        $archivos_a_escribir[$ruta_abs] = [normalizar_a_unix($nuevo), $eol];
        $bumps++; $bumps_detalle[] = "$archivo_rel  @version $viejo → $version_nueva";
    }
}

$archivos_escritos = 0;
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    list($contenido_unix, $eol) = $info;
    if (file_put_contents($ruta_abs, normalizar_a_original($contenido_unix, $eol)) === false) {
        echo "[FALLO] No se pudo escribir: " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n"; continue;
    }
    $archivos_escritos++;
    echo "[OK] " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n";
}

if ($bumpear && (!empty($bumps_detalle) || !empty($info_bumps))) {
    echo "\n--- Bumps ---\n";
    foreach ($bumps_detalle as $d) echo "[BUMP] $d\n";
    foreach ($info_bumps as $i) echo "[INFO] $i\n";
}

echo "\n=== Resumen ===\n";
echo "Bloques aplicados: $bloques_ok\n";
echo "Archivos escritos: $archivos_escritos\n";
if ($bumpear) echo "Bumps @version:    $bumps\n";
if (!empty($bloques_fallidos)) {
    echo "Fallos: " . count($bloques_fallidos) . "\n";
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";