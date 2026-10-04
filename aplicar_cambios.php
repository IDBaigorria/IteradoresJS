<?php
/**
 * Aplicador de cambios automáticos — proyecto iteradoresJS (plugin Chrome).
 *
 * Tanda v1.5plugin.4q (solo documentación):
 * - Incorpora al prompt del plugin las dos reglas nuevas del método de
 *   trabajo:
 *     1. Cada aplicar_cambios.php va acompañado de un commit sugerido.
 *     2. Cada cambio al piloto PHP lleva su espejo de pruebas del plugin
 *        (este repo). El plugin no arranca una tanda por su cuenta: la
 *        tanda del piloto trae su mitad JS.
 *
 * Uso (parado en la raíz de iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    // --------------------------------------------------------
    // Nueva sección 10: reglas de trabajo
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Nueva sección 10: reglas de trabajo',
        'buscar' => [
            '## 9. DISCUSIÓN ACTUAL',
        ],
        'reemplazar' => [
            '## 10. REGLAS DE TRABAJO',
            '',
            'Reglas del método que aplican específicamente a este',
            'proyecto.',
            '',
            '1. **Cada `aplicar_cambios.php` va acompañado de un commit',
            '   sugerido.** Siempre, sin excepción, tanto en este repo',
            '   (`iteradoresJS/`) como en el repo del piloto',
            '   (`iteradores/`). El título del commit arranca con',
            '   `V1.5plugin.XX:` acá y con `V1.5piloto.XX:` allá.',
            '',
            '2. **Este proyecto no arranca tandas por su cuenta cuando el',
            '   cambio es en el piloto.** Cada cambio del piloto PHP lleva',
            '   su espejo acá: la tanda del piloto entrega DOS',
            '   `aplicar_cambios.php` (uno por repo) y DOS commits (uno por',
            '   repo). El del plugin agrega las pruebas que verifican el',
            '   cambio hecho en el piloto. El plugin sí puede arrancar',
            '   tandas propias cuando el cambio es solo suyo (por ejemplo,',
            '   refactor interno del SW o de la ventana).',
            '',
            '3. **Cada cambio al plugin incrementa la versión.** En',
            '   `ConfPlugin.js` (`VERSION_APP` y `VERSION_PLUGIN`) y en',
            '   `@version` de los archivos que se tocan. El `manifest.json`',
            '   no se bumpea en cada letra (ver sección 3.12).',
            '',
            '4. **Los bloques `buscar` del `aplicar_cambios.php` deben',
            '   matchear exactamente el archivo en disco.** No alcanza con',
            '   el recuerdo de lo que uno escribió. Si un bloque falla,',
            '   pedir el fragmento exacto del archivo al usuario antes de',
            '   ajustarlo. Ver sección 8.8, aprendizaje 28.',
            '',
            '---',
            '',
            '## 9. DISCUSIÓN ACTUAL',
        ],
    ],

    // --------------------------------------------------------
    // §9 cabecera
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => '§9 cabecera: bump a 4q + registrar reglas nuevas',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.4p (se',
            'quita el check de `disabled` de la prueba',
            '`autocompletado_dni_terminal_clientes`: el helper',
            '`obtener_atributos` devuelve `[null]` cuando el atributo no',
            'existe, no `[]`; el check no aportaba valor y daba falso',
            'negativo. Además, la prueba se mueve a una sección propia',
            '`autocompletado` en la ventana).',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.4q (nueva',
            'sección 10 "Reglas de trabajo": cada `aplicar_cambios.php` va',
            'con su commit sugerido, y cada cambio del piloto PHP trae su',
            'espejo de pruebas acá).',
            'Antes: v1.5plugin.4p (se',
            'quita el check de `disabled` de la prueba',
            '`autocompletado_dni_terminal_clientes`: el helper',
            '`obtener_atributos` devuelve `[null]` cuando el atributo no',
            'existe, no `[]`; el check no aportaba valor y daba falso',
            'negativo. Además, la prueba se mueve a una sección propia',
            '`autocompletado` en la ventana).',
        ],
    ],

];

// ============================================================
// Runner (idéntico al del sistema de scripts)
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