<?php
/**
 * Aplicador — Tanda 1: miscelaneas/Arbol.js + barrel de miscelaneas.
 *
 * Uso (raíz de iteradoresJS/): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.7aa';

// El plugin no usa ?v= en HTML.
$htmls_a_bumpear = [];

$cambios = [
    // ============================================================
    // A) Nuevo módulo miscelaneas/Arbol.js (espejo de Arbol.php)
    // ============================================================
    [
        'tipo' => 'crear',
        'archivo' => 'miscelaneas/Arbol.js',
        'descripcion' => 'Nuevo módulo Arbol.js (espejo de Arbol.php)',
        'contenido' => [
            '/**',
            ' * Funciones para manejo de árbol general usando nodos.',
            " * Utiliza enlaces 'hmi' (hijo más izquierdo), 'hd' (hermano derecho) y 'p' (padre).",
            ' *',
            ' * Espejo de `miscelaneas/Arbol.php` del proyecto PHP.',
            ' * No incluye las funciones específicas del piloto',
            ' * (_nombres_arbol_para_contexto, _nombre_terminal_de_compartido):',
            ' * esas viven en el proyecto PHP.',
            ' *',
            ' * @namespace miscelaneas.Arbol',
            ' * @author Ignacio David Baigorria',
            ' * @version 1.5plugin.7aa',
            ' * @since 1.5plugin.7aa',
            ' */',
            '',
            '/**',
            ' * Normaliza el array de nombres de enlace para las operaciones',
            ' * de árbol. Si es null, devuelve los nombres default.',
            ' *',
            ' * @param {Object|null} nombres',
            ' * @returns {Object}',
            ' */',
            'export function _arbol_nombres(nombres) {',
            '    if (nombres === null || nombres === undefined) {',
            "        return { p: 'p', hd: 'hd', hmi: 'hmi' };",
            '    }',
            '    return {',
            "        p:   (nombres.p   != null && nombres.p   !== '') ? String(nombres.p)   : 'p',",
            "        hd:  (nombres.hd  != null && nombres.hd  !== '') ? String(nombres.hd)  : 'hd',",
            "        hmi: (nombres.hmi != null && nombres.hmi !== '') ? String(nombres.hmi) : 'hmi',",
            '    };',
            '}',
            '',
            '/**',
            ' * Agrega un hijo como hijo más izquierdo del nodo padre.',
            ' *',
            ' * @param {Nodo} padre',
            ' * @param {Nodo} hijo',
            ' * @param {Object|null} [nombres=null]',
            ' * @returns {void}',
            ' */',
            'export function _hmi(padre, hijo, nombres = null) {',
            '    const n = _arbol_nombres(nombres);',
            '    const antiguo_hmi = padre.adyacente(n.hmi);',
            '    if (antiguo_hmi) {',
            '        hijo._adyacente_en(antiguo_hmi, n.hd, true);',
            '    }',
            '    padre._adyacente_en(hijo, n.hmi, true);',
            '    hijo._adyacente_en(padre, n.p, true);',
            '}',
            '',
            '/**',
            ' * Agrega un hermano derecho inmediato al nodo actual.',
            ' *',
            ' * @param {Nodo} nodo_actual',
            ' * @param {Nodo} nuevo_hermano',
            ' * @param {Object|null} [nombres=null]',
            ' * @returns {void}',
            ' */',
            'export function _hd(nodo_actual, nuevo_hermano, nombres = null) {',
            '    const n = _arbol_nombres(nombres);',
            '    const padre = nodo_actual.adyacente(n.p);',
            '    if (!padre) return;',
            '',
            '    const hermano_derecho_actual = nodo_actual.adyacente(n.hd);',
            '    if (hermano_derecho_actual) {',
            '        nuevo_hermano._adyacente_en(hermano_derecho_actual, n.hd, true);',
            '    }',
            '    nodo_actual._adyacente_en(nuevo_hermano, n.hd, true);',
            '    nuevo_hermano._adyacente_en(padre, n.p, true);',
            '}',
            '',
            '/**',
            ' * Obtiene el hijo más izquierdo de un nodo.',
            ' *',
            ' * @param {Nodo} nodo',
            ' * @param {Object|null} [nombres=null]',
            ' * @returns {Nodo|null}',
            ' */',
            'export function hmi(nodo, nombres = null) {',
            '    const n = _arbol_nombres(nombres);',
            '    return nodo.adyacente(n.hmi);',
            '}',
            '',
            '/**',
            ' * Obtiene el hermano derecho de un nodo.',
            ' *',
            ' * @param {Nodo} nodo',
            ' * @param {Object|null} [nombres=null]',
            ' * @returns {Nodo|null}',
            ' */',
            'export function hd(nodo, nombres = null) {',
            '    const n = _arbol_nombres(nombres);',
            '    return nodo.adyacente(n.hd);',
            '}',
            '',
            '/**',
            ' * Obtiene el padre de un nodo.',
            ' *',
            ' * @param {Nodo} nodo',
            ' * @param {Object|null} [nombres=null]',
            ' * @returns {Nodo|null}',
            ' */',
            'export function p(nodo, nombres = null) {',
            '    const n = _arbol_nombres(nombres);',
            '    return nodo.adyacente(n.p);',
            '}',
            '',
            '/**',
            ' * Elimina el hijo más izquierdo de un nodo padre.',
            ' * Si el hijo tiene hermano derecho, ese hermano se convierte',
            ' * en el nuevo hmi.',
            ' *',
            ' * @param {Nodo} padre',
            ' * @param {Object|null} [nombres=null]',
            ' * @returns {Nodo|null}',
            ' */',
            'export function eliminar_hmi(padre, nombres = null) {',
            '    const n = _arbol_nombres(nombres);',
            '    const hijo = padre.adyacente(n.hmi);',
            '    if (!hijo) return null;',
            '',
            '    const hermano = hijo.adyacente(n.hd);',
            '',
            '    hijo.eliminar_adyacente(n.p);',
            '    hijo.eliminar_adyacente(n.hd);',
            '',
            '    if (hermano) {',
            '        padre._adyacente_en(hermano, n.hmi, true);',
            '    } else {',
            '        padre.eliminar_adyacente(n.hmi);',
            '    }',
            '',
            '    return hijo;',
            '}',
            '',
            '/**',
            ' * Elimina el hermano derecho inmediato de un nodo.',
            ' * Si el hermano derecho tiene a su vez hermano derecho,',
            ' * se enlaza correctamente.',
            ' *',
            ' * @param {Nodo} nodo_actual',
            ' * @param {Object|null} [nombres=null]',
            ' * @returns {Nodo|null}',
            ' */',
            'export function eliminar_hd(nodo_actual, nombres = null) {',
            '    const n = _arbol_nombres(nombres);',
            '    const hermano = nodo_actual.adyacente(n.hd);',
            '    if (!hermano) return null;',
            '',
            '    const siguiente_hermano = hermano.adyacente(n.hd);',
            '',
            '    hermano.eliminar_adyacente(n.p);',
            '    hermano.eliminar_adyacente(n.hd);',
            '',
            '    if (siguiente_hermano) {',
            '        nodo_actual._adyacente_en(siguiente_hermano, n.hd, true);',
            '    } else {',
            '        nodo_actual.eliminar_adyacente(n.hd);',
            '    }',
            '',
            '    return hermano;',
            '}',
        ],
    ],

    // ============================================================
    // B) Barrel de miscelaneas (sobrescribe el stub actual)
    // ============================================================
    [
        'tipo' => 'crear',
        'archivo' => 'miscelaneas/index.js',
        'descripcion' => 'Barrel de miscelaneas (generarUUID, mixin, Arbol)',
        'contenido' => [
            '/**',
            ' * @namespace miscelaneas',
            ' *',
            ' * @author Ignacio David Baigorria',
            ' */',
            '',
            "export { generarUUID } from './generarUUID.js';",
            "export { mezclar_clase_con_interfaces } from './mixin.js';",
            'export {',
            '    _arbol_nombres,',
            '    _hmi,',
            '    _hd,',
            '    hmi,',
            '    hd,',
            '    p,',
            '    eliminar_hmi,',
            '    eliminar_hd,',
            "} from './Arbol.js';",
        ],
    ],

    // ============================================================
    // C) Bump de VERSION_APP y VERSION_PLUGIN (regla de §10 del prompt)
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'Bump VERSION_APP a 1.5plugin.7aa',
        'buscar' => [
            'export const VERSION_APP = "1.5plugin.6l";',
        ],
        'reemplazar' => [
            'export const VERSION_APP = "1.5plugin.7aa";',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'Bump VERSION_PLUGIN a 1.5plugin.7aa',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.6l";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.7aa";',
        ],
    ],
];

// ============================================================
// Runner v2 (copiar textual de §14 del prompt_sistema_scripts_v2)
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

// --- Fase 1: aplicar reemplazos ---
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

// --- Fase 2: bumps automáticos ---
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
        $bumps_detalle[] = "$archivo_rel  @version $viejo → $version_nueva";
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
                $bumps_detalle[] = "$html_rel  $base ?v= $viejo_qv → $version_nueva";
            }
        }
        if ($html !== $html_antes) {
            $archivos_a_escribir[$html_abs] = [normalizar_a_unix($html), $eol];
        }
    }
}

// --- Fase 3: escribir ---
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

// --- Reporte de bumps ---
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