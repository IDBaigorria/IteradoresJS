<?php
/**
 * Diagnóstico — P55 sin nombre_campo.
 *
 * No modifica nada. Solo inspecciona:
 *   1. Si el archivo existe en el path esperado.
 *   2. Cuántas veces aparece "nombre_campo".
 *   3. Cuántas veces aparece el bloque `buscar` del script de P55.
 *   4. Las 3 líneas alrededor de cada "PNG_TRANSPARENTE_B64" y
 *      "PNG_ALTERNATIVO_B64" en la prueba.
 *   5. El @version actual del archivo.
 */

$raiz = __DIR__;
$path = 'Aplicacion/pruebas/prueba_55_subir_foto_reemplazo_limpia_nodos.js';
$ruta = $raiz . '/' . $path;

echo "=== Diagnóstico P55 ===\n\n";

if (!file_exists($ruta)) {
    echo "[FALLO] No existe: $ruta\n";
    exit(1);
}

$contenido = file_get_contents($ruta);

echo "Path absoluto: $ruta\n";
echo "Tamaño: " . strlen($contenido) . " bytes\n";
echo "Last write: " . date('Y-m-d H:i:s', filemtime($ruta)) . "\n\n";

// 1. Contar nombre_campo
$n_nc = substr_count($contenido, 'nombre_campo');
echo "Ocurrencias de 'nombre_campo': $n_nc\n";

// 2. Contar los bloques buscar del script de P55
$buscar_a = '                { nombre: "fotoA_" + sufijo + ".png", tipo: "image/png", contenido_base64: PNG_TRANSPARENTE_B64 }';
$buscar_b = '                { nombre: "fotoB_" + sufijo + ".png", tipo: "image/png", contenido_base64: PNG_ALTERNATIVO_B64 }';
$n_a = substr_count($contenido, $buscar_a);
$n_b = substr_count($contenido, $buscar_b);
echo "Bloque buscar de fotoA (sin nombre_campo): $n_a ocurrencias\n";
echo "Bloque buscar de fotoB (sin nombre_campo): $n_b ocurrencias\n";

// 3. Buscar las líneas con PNG_TRANSPARENTE_B64 y PNG_ALTERNATIVO_B64
$lineas = explode("\n", $contenido);
echo "\nLíneas con PNG_TRANSPARENTE_B64 o PNG_ALTERNATIVO_B64:\n";
foreach ($lineas as $i => $linea) {
    if (strpos($linea, 'PNG_TRANSPARENTE_B64') !== false || strpos($linea, 'PNG_ALTERNATIVO_B64') !== false) {
        echo "  [" . ($i + 1) . "] " . $linea . "\n";
    }
}

// 4. @version
if (preg_match('/(\*\s+@version\s+)(\S+)/', $contenido, $m)) {
    echo "\n@version actual: " . $m[2] . "\n";
} else {
    echo "\n[WARN] No se encontró @version\n";
}

// 5. Contar imports
$n_import = substr_count($contenido, 'import ');
echo "Imports: $n_import\n";

// 6. Primeras 30 líneas, para ver el header completo
echo "\n--- Primeras 30 líneas ---\n";
foreach (array_slice($lineas, 0, 30) as $i => $linea) {
    echo str_pad($i + 1, 4, ' ', STR_PAD_LEFT) . " | " . $linea . "\n";
}

echo "\n--- Últimas 5 líneas ---\n";
$total = count($lineas);
$inicio = max(0, $total - 5);
foreach (array_slice($lineas, $inicio, 5) as $i => $linea) {
    echo str_pad($inicio + $i + 1, 4, ' ', STR_PAD_LEFT) . " | " . $linea . "\n";
}

echo "\nListo.\n";