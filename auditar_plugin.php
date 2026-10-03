<?php
/**
 * Auditoría del plugin de pruebas.
 *
 * NO modifica nada. Solo lee y reporta:
 *
 * 1. Todos los .js y .html del plugin (recursivo sobre Aplicacion/,
 *    mas el manifest.json de la raiz).
 * 2. Los imports de cada .js: verifica que cada path relativo
 *    (`./` o `../`) resuelva a un archivo existente.
 * 3. Los paths declarados en manifest.json (service_worker,
 *    default_popup, content_scripts): verifica que existan.
 * 4. Referencias a nombres viejos del rename de v1.5plugin.2:
 *    bootstrap.js, background.js, content.js, popup.html, popup.js,
 *    prueba_01_smoke, y los strings "ping" / "pong" / "click" /
 *    "fetch_post".
 * 5. Listado completo de archivos presentes en Aplicacion/.
 *
 * Uso (parado en iteradoresJS/):
 *   php auditar_plugin.php
 */

$raiz = __DIR__;

echo "=== Auditoria del plugin ===\n\n";

// ============================================================
// Utilidades
// ============================================================

function leer_archivo($ruta) {
    if (!file_exists($ruta)) return null;
    return file_get_contents($ruta);
}

function listar_recursivo($dir, $extensiones) {
    $out = [];
    if (!is_dir($dir)) return $out;
    $it = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS)
    );
    foreach ($it as $f) {
        if (!$f->isFile()) continue;
        $ext = strtolower($f->getExtension());
        if (!in_array($ext, $extensiones, true)) continue;
        $out[] = str_replace('\\', '/', $f->getPathname());
    }
    sort($out);
    return $out;
}

function ruta_relativa($abs, $raiz) {
    return ltrim(str_replace('\\', '/', substr($abs, strlen($raiz))), '/');
}

// ============================================================
// Inventario de archivos
// ============================================================

echo "=== 1. Inventario de archivos ===\n\n";

$manifest_path = $raiz . '/manifest.json';
if (!file_exists($manifest_path)) {
    echo "[FATAL] No se encontro manifest.json en la raiz.\n";
    echo "        Corre este script parado en iteradoresJS/.\n";
    exit(1);
}

$archivos_js   = listar_recursivo($raiz . '/Aplicacion', ['js']);
$archivos_html = listar_recursivo($raiz . '/Aplicacion', ['html']);

echo "manifest.json: " . (file_exists($manifest_path) ? 'OK' : 'FALTA') . "\n";
echo "Archivos .js en Aplicacion/: " . count($archivos_js) . "\n";
foreach ($archivos_js as $a) echo "  " . ruta_relativa($a, $raiz) . "\n";
echo "\nArchivos .html en Aplicacion/: " . count($archivos_html) . "\n";
foreach ($archivos_html as $a) echo "  " . ruta_relativa($a, $raiz) . "\n";
echo "\n";

// ============================================================
// Manifest: verificar paths declarados
// ============================================================

echo "=== 2. Manifest: paths declarados ===\n\n";

$manifest_raw = leer_archivo($manifest_path);
$manifest = json_decode($manifest_raw, true);
if (!is_array($manifest)) {
    echo "[FATAL] manifest.json no parsea como JSON. Error: " . json_last_error_msg() . "\n";
    exit(1);
}

$paths_manifest = [];

if (isset($manifest['background']['service_worker'])) {
    $paths_manifest[] = ['background.service_worker', $manifest['background']['service_worker']];
}
if (isset($manifest['action']['default_popup'])) {
    $paths_manifest[] = ['action.default_popup', $manifest['action']['default_popup']];
}
if (isset($manifest['content_scripts']) && is_array($manifest['content_scripts'])) {
    foreach ($manifest['content_scripts'] as $i => $cs) {
        if (isset($cs['js']) && is_array($cs['js'])) {
            foreach ($cs['js'] as $j) {
                $paths_manifest[] = ["content_scripts[$i].js", $j];
            }
        }
    }
}

foreach ($paths_manifest as [$clave, $path]) {
    $abs = $raiz . '/' . ltrim($path, '/');
    $ok = file_exists($abs) ? 'OK' : 'NO EXISTE';
    printf("  [%s] %s = %s\n", $ok, $clave, $path);
}
echo "\n";

// ============================================================
// Imports de cada .js
// ============================================================

echo "=== 3. Imports de cada archivo .js ===\n\n";

$patrones_import = [
    // import X from "path"  /  import {X} from "path"
    '/\bfrom\s+[\'"]([^\'"]+)[\'"]/',
    // import "path"
    '/\bimport\s+[\'"]([^\'"]+)[\'"]/',
    // import("path")
    '/\bimport\(\s*[\'"]([^\'"]+)[\'"]\s*\)/',
];

$total_imports = 0;
$total_rotos = 0;

foreach ($archivos_js as $archivo_abs) {
    $rel = ruta_relativa($archivo_abs, $raiz);
    $cont = leer_archivo($archivo_abs);
    if ($cont === null) continue;

    $lineas = explode("\n", $cont);
    $imports_encontrados = [];

    foreach ($lineas as $nro => $linea) {
        foreach ($patrones_import as $pat) {
            if (preg_match_all($pat, $linea, $m)) {
                foreach ($m[1] as $destino) {
                    $imports_encontrados[] = [$nro + 1, trim($destino), trim($linea)];
                }
            }
        }
    }

    if (empty($imports_encontrados)) {
        echo "  $rel\n";
        echo "    (sin imports)\n";
        continue;
    }

    echo "  $rel\n";
    foreach ($imports_encontrados as [$nro, $destino, $linea_completa]) {
        $total_imports++;

        // Solo auditar paths relativos.
        if (strpos($destino, './') !== 0 && strpos($destino, '../') !== 0) {
            printf("    [SKIP] L%d  %s  (no es path relativo)\n", $nro, $destino);
            continue;
        }

        $destino_abs = realpath(dirname($archivo_abs) . '/' . $destino);
        if ($destino_abs === false || !file_exists($destino_abs)) {
            $total_rotos++;
            printf("    [ROTO] L%d  %s  -> NO EXISTE\n", $nro, $destino);
            printf("           %s\n", trim($linea_completa));
        } else {
            printf("    [OK]   L%d  %s\n", $nro, $destino);
        }
    }
}

echo "\n";
echo "Imports totales: $total_imports   |   rotos: $total_rotos\n\n";

// ============================================================
// Nombres viejos (post-rename de v1.5plugin.2)
// ============================================================

echo "=== 4. Referencias a nombres viejos ===\n\n";

$nombres_viejos = [
    'bootstrap.js',
    'background.js',
    'content.js',
    'popup.html',
    'popup.js',
    'prueba_01_smoke',
    '"ping"',
    "'ping'",
    '"pong"',
    "'pong'",
    '"click"',
    "'click'",
    '"fetch_post"',
    "'fetch_post'",
];

$archivos_a_auditar = array_merge($archivos_js, $archivos_html, [$manifest_path]);
$hallazgos = 0;

foreach ($archivos_a_auditar as $archivo_abs) {
    $rel = ruta_relativa($archivo_abs, $raiz);
    $cont = leer_archivo($archivo_abs);
    if ($cont === null) continue;
    $lineas = explode("\n", $cont);

    $encontrados = [];
    foreach ($lineas as $nro => $linea) {
        foreach ($nombres_viejos as $patron) {
            if (strpos($linea, $patron) !== false) {
                $encontrados[] = [$nro + 1, $patron, trim($linea)];
            }
        }
    }

    if (!empty($encontrados)) {
        echo "  $rel\n";
        foreach ($encontrados as [$nro, $patron, $linea_completa]) {
            printf("    L%d  [%s]\n", $nro, $patron);
            printf("         %s\n", $linea_completa);
            $hallazgos++;
        }
        echo "\n";
    }
}

if ($hallazgos === 0) {
    echo "  (sin hallazgos)\n\n";
} else {
    echo "  Total de hallazgos: $hallazgos\n\n";
}

// ============================================================
// Resumen final
// ============================================================

echo "=== Resumen ===\n\n";
echo "  Imports rotos: " . $total_rotos . "\n";
echo "  Referencias a nombres viejos: " . $hallazgos . "\n";
echo "\n";
echo "Fin de la auditoria. No se modifico ningun archivo.\n";