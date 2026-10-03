<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda v1.5plugin.4b — fix de apellidos en datos_pasajero_aleatorio.
 *
 * Problema: el helper generaba `apellido: "Pasajero" + index` (por
 * ejemplo "Pasajero0"), y el validador del piloto rechaza numeros en
 * apellidos: "Solo puede tener letras, espacios, apostrofes y guiones".
 *
 * Fix: usar apellidos reales sin tildes ni numeros, tomados de un array.
 *
 * Uso (parado en iteradoresJS/):
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

    // ============================================================
    // Aplicacion/pruebas/_helpers.js
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: bump a 1.5plugin.4b',
        'buscar' => [
            ' * @version 1.5plugin.4a',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4b',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: apellidos sin numeros en datos_pasajero_aleatorio',
        'buscar' => [
            'export function datos_pasajero_aleatorio(index = 0) {',
            '    const dni = dni_unico();',
            '    return {',
            '        dni,',
            '        apellido: "Pasajero" + index,',
            '        nombres: "Auto",',
            '        email: "pas_" + dni + "@test.local",',
            '        celular: "2983555" + String(dni).slice(-3),',
            '        celular_emergencia: "2983111" + String(dni).slice(-3),',
            '        fecha_nacimiento: "1990-01-15",',
            '        direccion: "Calle Prueba 123",',
            '        localidad: "Tres Arroyos"',
            '    };',
            '}',
        ],
        'reemplazar' => [
            '// Apellidos validos para el piloto: solo letras, sin tildes,',
            '// sin numeros. Se rotan por indice para que pasajeros distintos',
            '// tengan apellidos distintos (util para debugear).',
            'const _APELLIDOS = ["Gomez", "Fernandez", "Rodriguez", "Lopez", "Martinez", "Perez", "Sanchez", "Ramirez"];',
            '',
            'export function datos_pasajero_aleatorio(index = 0) {',
            '    const dni = dni_unico();',
            '    const apellido = _APELLIDOS[index % _APELLIDOS.length];',
            '    return {',
            '        dni,',
            '        apellido,',
            '        nombres: "Auto",',
            '        email: "pas_" + dni + "@test.local",',
            '        celular: "2983555" + String(dni).slice(-3),',
            '        celular_emergencia: "2983111" + String(dni).slice(-3),',
            '        fecha_nacimiento: "1990-01-15",',
            '        direccion: "Calle Prueba 123",',
            '        localidad: "Tres Arroyos"',
            '    };',
            '}',
        ],
    ],

    // ============================================================
    // Bumps varios
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: bump a 1.5plugin.4b',
        'buscar' => [
            ' * @version 1.5plugin.4a',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4b',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_APP a 1.5plugin.4b',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.4a";',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.4b";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_PLUGIN a 1.5plugin.4b',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4a";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4b";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'contenido.js: bump a 1.5plugin.4b',
        'buscar' => [
            ' * @version 1.5plugin.4a',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4b',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: bump a 1.5plugin.4b',
        'buscar' => [
            ' * @version 1.5plugin.4a',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4b',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo.js: bump a 1.5plugin.4b',
        'buscar' => [
            ' * @version 1.5plugin.4a',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4b',
        ],
    ],

    // ============================================================
    // prompts/prompt_plugin_piloto.md
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: bump a v1.5plugin.4b',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.4a (fix de',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.4b (fix de',
            'apellidos en `datos_pasajero_aleatorio`: el helper generaba',
            '"Pasajero0", "Pasajero1", etc. y el validador del piloto',
            'rechaza números en apellidos. Ahora usa apellidos reales sin',
            'tildes ni números de un array rotativo). Antes: v1.5plugin.4a (fix de',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: leccion de validaciones del piloto',
        'buscar' => [
            '- **Los helpers que llenan formularios con autocompletado por',
        ],
        'reemplazar' => [
            '- **Los datos generados por el plugin deben pasar los validadores',
            '  del piloto.** El piloto valida apellidos y nombres con',
            '  `/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\'\\- \\t]+$/`: solo letras, espacios,',
            '  apóstrofes y guiones. Nada de números, ni siquiera como sufijo',
            '  ("Pasajero0" no pasa). Los helpers deben generar datos que',
            '  pasen. Bug en v1.5plugin.4: `datos_pasajero_aleatorio` generaba',
            '  `"Pasajero" + index`. Fix en v1.5plugin.4b: array rotativo de',
            '  apellidos sin tildes.',
            '- **Los helpers que llenan formularios con autocompletado por',
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