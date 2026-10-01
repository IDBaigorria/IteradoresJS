<?php
/**
 * Aplicador de cambios automáticos — Framework JS (espejo navegador).
 *
 * Tanda V1.5i.7f: fix del bug latente `if (elemento)` en Iterador.js.
 *
 * Espejo del fix PHP 1.5i.7f. Los 4 usos de `if (elemento)` en
 * `_crear_interno`, `_cargar_interno` y `_iterador_interno` (dos
 * veces) se cambian por `if (elemento !== null && elemento !==
 * undefined)`.
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
        'tipo' => 'reemplazar',
        'archivo' => 'Iteradores/Iterador.js',
        'descripcion' => 'Bump de version a 1.5i.7f',
        'buscar' => [
            ' * @version 1.5i.4 (inicio de refactorización)',
        ],
        'reemplazar' => [
            ' * @version 1.5i.7f (fix bug if(elemento) -> chequeo !== null/undefined)',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Iteradores/Iterador.js',
        'descripcion' => '_crear_interno: fix if (elemento)',
        'buscar' => [
            '        cuerpo._adyacente_en(cuerpo, "ocupado");',
            '',
            '        if (elemento) { // Nota: JS trata null, undefined, false, 0, \'\' como falsy',
            '            iterador.nodo(elemento, (nodo, esNodo) => {',
        ],
        'reemplazar' => [
            '        cuerpo._adyacente_en(cuerpo, "ocupado");',
            '',
            '        // Chequeo estricto: no descartar falsy (0, \'\', false).',
            '        if (elemento !== null && elemento !== undefined) {',
            '            iterador.nodo(elemento, (nodo, esNodo) => {',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Iteradores/Iterador.js',
        'descripcion' => '_cargar_interno: fix if (elemento)',
        'buscar' => [
            '        iterador.raiz_cuerpo = cuerpo;',
            '        cuerpo._adyacente_en(cuerpo, "ocupado");',
            '',
            '        if (elemento) {',
            '            let es_nodo = false;',
            '            const es_valido = iterador.constructor.es_elemento_valido(elemento, (el, es) => { es_nodo = es; });',
            '            if (!es_valido) {',
            '                Iterador._error(`Iterador._cargar_interno: el elemento que intenta asignar con la carga de ${nombre} no es valido`);',
        ],
        'reemplazar' => [
            '        iterador.raiz_cuerpo = cuerpo;',
            '        cuerpo._adyacente_en(cuerpo, "ocupado");',
            '',
            '        // Chequeo estricto: no descartar falsy (0, \'\', false).',
            '        if (elemento !== null && elemento !== undefined) {',
            '            let es_nodo = false;',
            '            const es_valido = iterador.constructor.es_elemento_valido(elemento, (el, es) => { es_nodo = es; });',
            '            if (!es_valido) {',
            '                Iterador._error(`Iterador._cargar_interno: el elemento que intenta asignar con la carga de ${nombre} no es valido`);',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Iteradores/Iterador.js',
        'descripcion' => '_iterador_interno rama carga: fix if (elemento)',
        'buscar' => [
            '                        iterador.raiz_cuerpo = cuerpo;',
            '                        cuerpo._adyacente_en(cuerpo, "ocupado");',
            '',
            '                        if (elemento) {',
            '                            let es_nodo = false;',
            '                            const es_valido = iterador.constructor.es_elemento_valido(elemento, (el, es) => { es_nodo = es; });',
            '                            if (!es_valido) {',
            '                                Iterador._error(`Iterador._iterador_interno: el elemento no es valido`);',
        ],
        'reemplazar' => [
            '                        iterador.raiz_cuerpo = cuerpo;',
            '                        cuerpo._adyacente_en(cuerpo, "ocupado");',
            '',
            '                        // Chequeo estricto: no descartar falsy (0, \'\', false).',
            '                        if (elemento !== null && elemento !== undefined) {',
            '                            let es_nodo = false;',
            '                            const es_valido = iterador.constructor.es_elemento_valido(elemento, (el, es) => { es_nodo = es; });',
            '                            if (!es_valido) {',
            '                                Iterador._error(`Iterador._iterador_interno: el elemento no es valido`);',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Iteradores/Iterador.js',
        'descripcion' => '_iterador_interno rama creacion: fix if (elemento)',
        'buscar' => [
            '        cuerpo._adyacente_en(cuerpo, "ocupado");',
            '',
            '        if (elemento) {',
            '            let es_nodo = false;',
            '            const es_valido = iterador.constructor.es_elemento_valido(elemento, (el, es) => { es_nodo = es; });',
            '            if (!es_valido) {',
            '                Iterador._error(`Iterador._iterador_interno: el elemento no es valido`);',
            '                Iterador._destruir_interno(iterador);',
        ],
        'reemplazar' => [
            '        cuerpo._adyacente_en(cuerpo, "ocupado");',
            '',
            '        // Chequeo estricto: no descartar falsy (0, \'\', false).',
            '        if (elemento !== null && elemento !== undefined) {',
            '            let es_nodo = false;',
            '            const es_valido = iterador.constructor.es_elemento_valido(elemento, (el, es) => { es_nodo = es; });',
            '            if (!es_valido) {',
            '                Iterador._error(`Iterador._iterador_interno: el elemento no es valido`);',
            '                Iterador._destruir_interno(iterador);',
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