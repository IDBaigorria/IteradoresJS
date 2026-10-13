<?php
/**
 * Aplicador de cambios — Prompt del plugin.
 *
 * Anota la idea de dividir la ventana del plugin en
 * pestañas, una por rol.
 *
 * Uso (raíz de iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Pendientes: idea de pestañas por rol',
        'buscar' => [
            '**Pendiente:**',
            '',
            '- Más pruebas (altas de pasajero, viaje, micro, terminal).',
            '- Historial de corridas en la ventana.',
            '- Revisar los permisos del manifest cuando se pruebe contra',
            '  un dominio real (hoy solo `localhost` / `127.0.0.1`).',
            '- Explorar el sistema de comandos y el motor para ejecución',
            '  por fases (opcional, si hace falta).',
        ],
        'reemplazar' => [
            '**Pendiente:**',
            '',
            '- **Dividir la ventana en pestañas, una por rol.** Idea',
            '  anotada al cierre de V1.5plugin.7a. Objetivo: cubrir la',
            '  batería completa de pruebas de la aplicación con vistas',
            '  organizadas: base + admin + dueño + terminal + soporte +',
            '  multi-rol. Cada pestaña agrupa las pruebas de ese rol y',
            '  sus flujos cruzados. Diseño a discutir en la próxima',
            '  tanda del plugin.',
            '- Más pruebas (altas de pasajero, viaje, micro, terminal).',
            '- Historial de corridas en la ventana.',
            '- Revisar los permisos del manifest cuando se pruebe contra',
            '  un dominio real (hoy solo `localhost` / `127.0.0.1`).',
            '- Explorar el sistema de comandos y el motor para ejecución',
            '  por fases (opcional, si hace falta).',
        ],
    ],
];

// ============================================================
// Runner
// ============================================================

echo "=== Aplicador de cambios — prompt del plugin ===\n\n";

function detectar_eol(string $c): string { return (strpos($c, "\r\n") !== false) ? "\r\n" : "\n"; }
function normalizar_a_unix(string $c): string { return str_replace("\r\n", "\n", $c); }
function normalizar_a_original(string $c, string $e): string { return $e === "\n" ? $c : str_replace("\n", "\r\n", $c); }
function contar_ocurrencias(string $c, string $b): int {
    if ($b === '') return 0;
    $n = 0; $o = 0;
    while (($p = strpos($c, $b, $o)) !== false) { $n++; $o = $p + strlen($b); }
    return $n;
}

$bloques_ok = 0;
$bloques_fallidos = [];

foreach ($cambios as $cambio) {
    $ruta_abs = $raiz_proyecto . '/' . $cambio['archivo'];
    if (!file_exists($ruta_abs)) {
        $bloques_fallidos[] = "Archivo no encontrado: {$cambio['archivo']}";
        continue;
    }
    $contenido_original = file_get_contents($ruta_abs);
    $eol = detectar_eol($contenido_original);
    $contenido = normalizar_a_unix($contenido_original);
    $buscar_str = implode("\n", $cambio['buscar']);
    $reemplazar_str = implode("\n", $cambio['reemplazar']);
    $ocurrencias = contar_ocurrencias($contenido, $buscar_str);
    if ($ocurrencias === 0) {
        $bloques_fallidos[] = "bloque no encontrado: {$cambio['descripcion']}";
        continue;
    }
    if ($ocurrencias > 1) {
        $bloques_fallidos[] = "bloque ambiguo: {$cambio['descripcion']}";
        continue;
    }
    $contenido = str_replace($buscar_str, $reemplazar_str, $contenido);
    $bloques_ok++;
    file_put_contents($ruta_abs, normalizar_a_original($contenido, $eol));
    echo "[OK] {$cambio['archivo']}\n";
}

echo "\n=== Resumen ===\n";
echo "Bloques aplicados: $bloques_ok\n";
if (!empty($bloques_fallidos)) {
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";