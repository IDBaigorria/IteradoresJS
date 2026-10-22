<?php
/**
 * Aplicador — v1.5plugin.9f: resumen final persistente + error
 * del drenado visible.
 *
 * Uso (raíz de iteradoresJS/): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.9f';
$htmls_a_bumpear = [];

$cambios = [

    // ============================================================
    // 1. ventana.js: resumen final expandido en el panel
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.js',
        'descripcion' => 'ventana.js: resumen expandido de última corrida',
        'buscar' => [
            '            if (actual && actual.estado_global !== "en_curso") {',
            '                html += \'<h3>Última migración</h3>\';',
            '                html += \'<div class="migracion-hist-item">\';',
            '                html += \'<span>\' + _formatear_fecha(actual.fecha_inicio) + \' · \' + (actual.entorno || "") + \'</span>\';',
            '                html += \'<span class="migracion-hist-estado-\' + actual.estado_global + \'">\' + actual.estado_global + \'</span>\';',
            '                html += \'</div>\';',
            '            }',
        ],
        'reemplazar' => [
            '            if (actual && actual.estado_global !== "en_curso") {',
            '                html += \'<h3>Última migración</h3>\';',
            '                html += \'<div class="migracion-hist-item">\';',
            '                html += \'<span>\' + _formatear_fecha(actual.fecha_inicio) + \' · \' + (actual.entorno || "") + \'</span>\';',
            '                html += \'<span class="migracion-hist-estado-\' + actual.estado_global + \'">\' + actual.estado_global + \'</span>\';',
            '                html += \'</div>\';',
            '',
            '                // v1.5plugin.9f: mostrar todos los pasos con sus',
            '                // estados y, si hubo errores, sus mensajes y',
            '                // outputs. Antes solo se veía el resumen de una',
            '                // línea y los detalles se perdían al re-renderizar.',
            '                const pasos_c = actual.pasos || {};',
            '                const total_pasos = _pasos_migracion.length + 1; // + drenar',
            '                const ok_count = Object.values(pasos_c).filter(function(p) { return p.estado === "ok"; }).length;',
            '                const salt_count = Object.values(pasos_c).filter(function(p) { return p.estado === "saltado"; }).length;',
            '                const err_count = Object.values(pasos_c).filter(function(p) { return p.estado === "error"; }).length;',
            '                html += \'<div class="migracion-hist-item" style="background:#f8f9fa;">\';',
            '                html += \'<span>\' + ok_count + \' OK · \' + salt_count + \' saltados · \' + err_count + \' errores</span>\';',
            '                html += \'</div>\';',
            '',
            '                if (err_count > 0 || (actual.estado_global === "error")) {',
            '                    html += \'<div class="migracion-aviso" style="margin-top:8px;">\';',
            '                    html += \'<strong>Detalle de errores:</strong>\';',
            '                    for (let i = 0; i < _pasos_migracion.length; i++) {',
            '                        const p = _pasos_migracion[i];',
            '                        const pe = pasos_c[p.id];',
            '                        if (!pe || pe.estado !== "error") continue;',
            '                        html += \'<div style="margin-top:6px;"><b>\' + (i+1) + \'. \' + _escapar_html(p.nombre) + \':</b> \';',
            '                        html += _escapar_html(pe.mensaje || "(sin mensaje)");',
            '                        html += \'</div>\';',
            '                        if (pe.output) {',
            '                            html += \'<pre style="background:#1e1e1e; color:#d4d4d4; padding:6px; border-radius:4px; max-height:200px; overflow:auto; font-size:10px; white-space:pre-wrap; margin:4px 0 0 0;">\' + _escapar_html(pe.output) + \'</pre>\';',
            '                        }',
            '                    }',
            '                    const pe_dr = pasos_c["drenar_buzon"];',
            '                    if (pe_dr && pe_dr.estado === "error") {',
            '                        html += \'<div style="margin-top:6px;"><b>10. Drenar buzón:</b> \';',
            '                        html += _escapar_html(pe_dr.mensaje || "(sin mensaje)");',
            '                        html += \'</div>\';',
            '                    }',
            '                    html += \'</div>\';',
            '                }',
            '            }',
        ],
    ],

    // ============================================================
    // 2. ventana.js: mostrar output de drenado en el alert final
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.js',
        'descripcion' => 'ventana.js: mostrar error del drenado en alert final',
        'buscar' => [
            '    function _mostrar_output_pasos_fallidos(respuesta) {',
            '        const resultados = respuesta && respuesta.resultados ? respuesta.resultados : [];',
            '        const fallidos = resultados.filter(function (p) { return p.estado === "error" && p.output; });',
            '        if (fallidos.length === 0) {',
            '            const err = respuesta && respuesta.error ? respuesta.error : "(sin detalle)";',
            '            alert("Migración falló.\\n\\n" + err + "\\n\\nAbrí la consola del SW (chrome://extensions → plugin → Service Worker) para más detalle.");',
            '            return;',
            '        }',
            '        const panel = document.getElementById("migraciones_panel");',
            '        if (!panel) return;',
            '        let html = \'<h3>Output de pasos fallidos</h3>\';',
            '        for (const f of fallidos) {',
            '            html += \'<div class="migracion-aviso">\';',
            '            html += \'<strong>Paso: \' + _escapar_html(f.paso) + \'</strong>\';',
            '            if (f.mensaje) html += \'<br>\' + _escapar_html(f.mensaje);',
            '            html += \'</div>\';',
            '            html += \'<pre style="background:#1e1e1e; color:#d4d4d4; padding:8px; border-radius:4px; max-height:300px; overflow:auto; font-size:11px; white-space:pre-wrap; margin-bottom:12px;">\' + _escapar_html(f.output) + \'</pre>\';',
            '        }',
            '        panel.insertAdjacentHTML("beforeend", html);',
            '    }',
        ],
        'reemplazar' => [
            '    function _mostrar_output_pasos_fallidos(respuesta) {',
            '        const resultados = respuesta && respuesta.resultados ? respuesta.resultados : [];',
            '        // v1.5plugin.9f: mostrar TODOS los errores, tengan o no',
            '        // output. El drenado no hace GET, así que su error solo',
            '        // tiene mensaje. Antes se filtraba por p.output, y el',
            '        // error del drenado quedaba invisible.',
            '        const fallidos = resultados.filter(function (p) { return p.estado === "error"; });',
            '        if (fallidos.length === 0) {',
            '            const err = respuesta && respuesta.error ? respuesta.error : "(sin detalle)";',
            '            alert("Migración falló.\\n\\n" + err + "\\n\\nAbrí la consola del SW (chrome://extensions → plugin → Service Worker) para más detalle.");',
            '            return;',
            '        }',
            '        // Alert principal con la lista de errores.',
            '        let txt = "Migración terminó con errores:\\n";',
            '        for (const f of fallidos) {',
            '            txt += "\\n• " + f.paso + ": " + (f.mensaje || "(sin detalle)");',
            '        }',
            '        alert(txt);',
            '',
            '        // Además, insertar los outputs (si los hay) en el panel.',
            '        const con_output = fallidos.filter(function (f) { return f.output; });',
            '        if (con_output.length === 0) return;',
            '        const panel = document.getElementById("migraciones_panel");',
            '        if (!panel) return;',
            '        let html = \'<h3>Output de pasos fallidos</h3>\';',
            '        for (const f of con_output) {',
            '            html += \'<div class="migracion-aviso">\';',
            '            html += \'<strong>Paso: \' + _escapar_html(f.paso) + \'</strong>\';',
            '            if (f.mensaje) html += \'<br>\' + _escapar_html(f.mensaje);',
            '            html += \'</div>\';',
            '            html += \'<pre style="background:#1e1e1e; color:#d4d4d4; padding:8px; border-radius:4px; max-height:300px; overflow:auto; font-size:11px; white-space:pre-wrap; margin-bottom:12px;">\' + _escapar_html(f.output) + \'</pre>\';',
            '        }',
            '        panel.insertAdjacentHTML("beforeend", html);',
            '    }',
        ],
    ],

    // ============================================================
    // 3. Migraciones.js: mensaje más claro en fallo de drenado
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/Migraciones.js',
        'descripcion' => 'Migraciones.js: mensaje más claro en fallo de drenado',
        'buscar' => [
            'export async function drenar_buzon(ctx) {',
            '    // 1. Login como dueño de prueba.',
            '    try {',
            '        await ctx.asegurar_login(CODIGO_DUENO);',
            '    } catch (e) {',
            '        return { exito: false, error: "Login dueño falló: " + e.message + ". Drenar manualmente." };',
            '    }',
            '',
            '    // 2. Ir a Vendidos.',
            '    try {',
            '        await ctx.activar_pestana_piloto("vendidos");',
            '    } catch (e) {',
            '        try { await ctx.clic(\'.tab[data-tab="vendidos"]\'); }',
            '        catch (e2) {',
            '            try { await ctx.cerrar_sesion(); } catch (e3) {}',
            '            return { exito: false, error: "No se pudo abrir Vendidos" };',
            '        }',
            '    }',
            '',
            '    // 3. Esperar a que la lista cargue (o a que aparezca el mensaje de vacío).',
            '    try {',
            '        await ctx.esperar("#lista_ventas", 30000);',
            '    } catch (e) { /* no es crítico */ }',
            '    await ctx.pausa(2000);',
            '',
            '    // 4. Logout.',
            '    try {',
            '        await ctx.cerrar_sesion();',
            '    } catch (e) { /* no es crítico */ }',
            '',
            '    return { exito: true };',
            '}',
        ],
        'reemplazar' => [
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
            '',
            '    // 2. Ir a Vendidos.',
            '    try {',
            '        await ctx.activar_pestana_piloto("vendidos");',
            '    } catch (e) {',
            '        try { await ctx.clic(\'.tab[data-tab="vendidos"]\'); }',
            '        catch (e2) {',
            '            try { await ctx.cerrar_sesion(); } catch (e3) {}',
            '            return { exito: false, error: "No se pudo abrir la pestaña Vendidos. Drenar manualmente: login dueño → Vendidos → logout." };',
            '        }',
            '    }',
            '',
            '    // 3. Esperar a que la lista cargue (o a que aparezca el mensaje de vacío).',
            '    try {',
            '        await ctx.esperar("#lista_ventas", 30000);',
            '    } catch (e) { /* no es crítico */ }',
            '    await ctx.pausa(2000);',
            '',
            '    // 4. Logout.',
            '    try {',
            '        await ctx.cerrar_sesion();',
            '    } catch (e) { /* no es crítico */ }',
            '',
            '    return { exito: true };',
            '}',
        ],
    ],

    // ============================================================
    // 4. ConfiguracionApli.js: bump a 9f
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'ConfiguracionApli.js: bump VERSION_APP a 9f',
        'buscar' => [
            'export const VERSION_APP = "1.5plugin.9e";',
        ],
        'reemplazar' => [
            'export const VERSION_APP = "1.5plugin.9f";',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'ConfiguracionApli.js: bump VERSION_PLUGIN a 9f',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.9e";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.9f";',
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