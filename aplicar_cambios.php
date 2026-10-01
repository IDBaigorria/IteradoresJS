<?php
/**
 * Aplicador de cambios automáticos — Framework Iteradores (PHP).
 *
 * Tanda V1.5i.7d: fix del script Pruebas/prueba_deposito.php.
 *
 * El script anterior no tenía `use` ni `require_once`, así que PHP
 * no encontraba la clase `Controlador` (está en el namespace
 * Iteradores\Controlador). Se reescribe siguiendo el patrón del test
 * viejo: require_once de las dependencias + use de las clases.
 *
 * Uso:
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
        'tipo' => 'crear',
        'archivo' => 'Pruebas/prueba_deposito.php',
        'descripcion' => 'Fix del script: agregar use y require_once',
        'contenido' => [
            '<?php',
            '/**',
            ' * Prueba del depósito de IDs del framework Iteradores (PHP).',
            ' *',
            ' * Verifica que al cargar una superestructura el depósito de IDs',
            ' * especiales se limpia correctamente, permitiendo recrear nodos',
            ' * con los mismos IDs especiales.',
            ' *',
            ' * Se ejecuta como bloque temporal desde index.php:',
            ' *   http://localhost/.../index.php?probar_deposito=1',
            ' *',
            ' * @package   Iteradores',
            ' * @since     1.5i.7a',
            ' */',
            '',
            'require_once __DIR__ . \'/../Controlador/Controlador.php\';',
            'require_once __DIR__ . \'/../Configuracion/Configuracion.php\';',
            'require_once __DIR__ . \'/../Nodos/Nodo.php\';',
            'require_once __DIR__ . \'/../Nucleo/Objeto.php\';',
            '',
            'use Iteradores\\Controlador\\Controlador;',
            'use Iteradores\\Nodos\\Nodo;',
            'use Iteradores\\Nucleo\\Objeto;',
            '',
            'header(\'Content-Type: text/plain; charset=utf-8\');',
            '',
            'echo "=== PRUEBA DEL DEPOSITO DE IDS (PHP) ===\\n\\n";',
            '',
            '$id_prueba = \'test_especial_deposito\';',
            '$nombre_prueba = \'prueba_deposito_php\';',
            '',
            '// Limpieza por si la prueba se corrió antes.',
            'if (Controlador::existe($nombre_prueba)) {',
            '    Controlador::eliminar($nombre_prueba);',
            '}',
            '',
            '// 1. Crear un nodo especial.',
            '$n1 = Nodo::crear_con_id($id_prueba);',
            'echo "1. Crear \'{$id_prueba}\' (1ra vez): " . ($n1 ? \'OK\' : \'FALLO\') . "\\n";',
            '',
            '// 2. Guardar la superestructura.',
            'guardar_ambos($nombre_prueba);',
            'echo "2. Guardar \'{$nombre_prueba}\': OK\\n";',
            '',
            '// 3. Cargar (esto debe vaciar y limpiar el depósito).',
            '$cargado = Controlador::cargar($nombre_prueba);',
            'echo "3. Cargar \'{$nombre_prueba}\': " . ($cargado ? \'OK\' : \'FALLO\') . "\\n";',
            '',
            '// 4. Intentar crear el mismo id especial otra vez.',
            '$n2 = Nodo::crear_con_id($id_prueba);',
            'echo "4. Crear \'{$id_prueba}\' (2da vez tras cargar): " . ($n2 ? \'OK\' : \'FALLO\') . "\\n";',
            '',
            '// 5. Limpieza.',
            'Controlador::eliminar($nombre_prueba);',
            'echo "5. Eliminar \'{$nombre_prueba}\': OK\\n";',
            '',
            'echo "\\n=== RESULTADO ===\\n";',
            'if ($n2) {',
            '    echo "SIN BUG: el depósito de IDs se limpió correctamente.\\n";',
            '} else {',
            '    echo "BUG PRESENTE: el depósito NO se limpió.\\n";',
            '    echo "El id \'{$id_prueba}\' sigue registrado en Objeto::\\$deposito_de_ids.\\n";',
            '    echo "\\nErrores:\\n";',
            '    echo Objeto::json_errores() . "\\n";',
            '    echo "\\nAlertas:\\n";',
            '    echo Objeto::json_alertas() . "\\n";',
            '}',
            'echo "\\n=== FIN DE LA PRUEBA ===\\n";',
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