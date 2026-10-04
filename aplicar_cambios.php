<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda v1.5plugin.4n (v3) — progreso en vivo al correr una sección.
 *
 * Corrección sobre v2: la lección se agrega al final de la sección 8.8,
 * con el ancla del item 24 que es única.
 *
 * Uso (parado en iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    // ============================================================
    // Aplicacion/ventana.html
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.html',
        'descripcion' => 'ventana.html: estilos de corriendo',
        'buscar' => [
            '    .estado { font-size: 11px; color: #888; margin-bottom: 6px; }',
        ],
        'reemplazar' => [
            '    .estado { font-size: 11px; color: #888; margin-bottom: 6px; }',
            '    li.corriendo { background: #fff8e1; }',
            '    li.corriendo .prueba-nombre::after {',
            '      content: " (corriendo...)";',
            '      font-weight: 400;',
            '      color: #b06000;',
            '      font-size: 11px;',
            '    }',
            '    li.corriendo .resultado { background: #fff3cd; color: #7a4f00; }',
        ],
    ],

    // ============================================================
    // Aplicacion/ventana.js
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.js',
        'descripcion' => 'ventana.js: bump a 1.5plugin.4n',
        'buscar' => [
            ' * @version 1.5plugin.4m',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4n',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ventana.js',
        'descripcion' => 'ventana.js: correr_seccion itera las pruebas en el popup',
        'buscar' => [
            '    async function correr_seccion(seccion, resumen_el) {',
            '        const boton = seccion.querySelector(".btn-correr-todas");',
            '        const botones_prueba = seccion.querySelectorAll(".btn-correr-prueba");',
            '        boton.disabled = true;',
            '        botones_prueba.forEach((b) => { b.disabled = true; });',
            '        resumen_el.textContent = "Corriendo...";',
            '        resumen_el.className = "seccion-resumen";',
            '',
            '        let resp;',
            '        try {',
            '            resp = await enviar({ tipo: "correr_seccion", id_seccion: seccion.dataset.idSeccion });',
            '        } catch (e) {',
            '            resumen_el.textContent = "Error: " + e.message;',
            '            resumen_el.className = "seccion-resumen fallo";',
            '            boton.disabled = false;',
            '            botones_prueba.forEach((b) => { b.disabled = false; });',
            '            return;',
            '        }',
            '',
            '        if (!resp || !resp.exito) {',
            '            resumen_el.textContent = "Error: " + (resp && resp.error ? resp.error : "desconocido");',
            '            resumen_el.className = "seccion-resumen fallo";',
            '            boton.disabled = false;',
            '            botones_prueba.forEach((b) => { b.disabled = false; });',
            '            return;',
            '        }',
            '',
            '        (resp.resultados || []).forEach((r) => {',
            '            const li = seccion.querySelector(`li[data-id-prueba="${r.id_prueba}"]`);',
            '            if (!li) return;',
            '            const el = li.querySelector(".resultado");',
            '            aplicar_resultado(el, r);',
            '        });',
            '',
            '        resumen_el.textContent = resp.ok + "/" + resp.total + " OK";',
            '        resumen_el.className = "seccion-resumen " + (resp.fallo === 0 ? "ok" : "fallo");',
            '        boton.disabled = false;',
            '        botones_prueba.forEach((b) => { b.disabled = false; });',
            '    }',
        ],
        'reemplazar' => [
            '    async function correr_seccion(seccion, resumen_el) {',
            '        const boton = seccion.querySelector(".btn-correr-todas");',
            '        const botones_prueba = seccion.querySelectorAll(".btn-correr-prueba");',
            '        boton.disabled = true;',
            '        botones_prueba.forEach((b) => { b.disabled = true; });',
            '',
            '        const lis = Array.from(seccion.querySelectorAll("li[data-id-prueba]"));',
            '        let ok = 0;',
            '        let fallo = 0;',
            '        const total = lis.length;',
            '',
            '        lis.forEach((li) => {',
            '            const el = li.querySelector(".resultado");',
            '            el.textContent = "—";',
            '            el.className = "resultado";',
            '            li.classList.remove("corriendo");',
            '        });',
            '',
            '        for (let i = 0; i < lis.length; i++) {',
            '            const li = lis[i];',
            '            const id_prueba = li.dataset.idPrueba;',
            '            const el = li.querySelector(".resultado");',
            '',
            '            li.classList.add("corriendo");',
            '            el.textContent = "Corriendo...";',
            '            el.className = "resultado";',
            '            resumen_el.textContent = `Corriendo ${i + 1}/${total}...`;',
            '            resumen_el.className = "seccion-resumen";',
            '',
            '            let resp;',
            '            try {',
            '                resp = await enviar({ tipo: "correr_prueba", id_prueba });',
            '            } catch (e) {',
            '                el.textContent = "Error: " + e.message;',
            '                el.className = "resultado resultado-error";',
            '                li.classList.remove("corriendo");',
            '                fallo++;',
            '                continue;',
            '            }',
            '',
            '            aplicar_resultado(el, resp);',
            '            li.classList.remove("corriendo");',
            '',
            '            if (resp && resp.exito && resp.resultado === "ok") ok++;',
            '            else fallo++;',
            '        }',
            '',
            '        resumen_el.textContent = ok + "/" + total + " OK";',
            '        resumen_el.className = "seccion-resumen " + (fallo === 0 ? "ok" : "fallo");',
            '        boton.disabled = false;',
            '        botones_prueba.forEach((b) => { b.disabled = false; });',
            '    }',
        ],
    ],

    // ============================================================
    // Aplicacion/servicio.js
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: bump a 1.5plugin.4n',
        'buscar' => [
            ' * @version 1.5plugin.4m',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4n',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: eliminar _correr_seccion',
        'buscar' => [
            'async function _correr_seccion(id_seccion) {',
            '    const seccion = SECCIONES.find((s) => s.id === id_seccion);',
            '    if (!seccion) {',
            '        return { exito: false, error: "Seccion no encontrada: " + id_seccion };',
            '    }',
            '    const resultados = [];',
            '    let ok = 0;',
            '    let fallo = 0;',
            '    for (const prueba of seccion.pruebas) {',
            '        const r = await _correr_prueba(prueba.id);',
            '        resultados.push({ id_prueba: prueba.id, nombre: prueba.nombre, ...r });',
            '        if (r.exito && r.resultado === "ok") ok++;',
            '        else fallo++;',
            '    }',
            '    return {',
            '        exito: true,',
            '        id_seccion,',
            '        total: seccion.pruebas.length,',
            '        ok,',
            '        fallo,',
            '        resultados',
            '    };',
            '}',
            '',
            'async function _correr_prueba(id_prueba) {',
        ],
        'reemplazar' => [
            'async function _correr_prueba(id_prueba) {',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: eliminar caso correr_seccion',
        'buscar' => [
            '                case "correr_seccion":',
            '                    sendResponse(await _correr_seccion(mensaje.id_seccion));',
            '                    break;',
            '',
        ],
        'reemplazar' => [
        ],
    ],

    // ============================================================
    // Bumps
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: bump @version a 1.5plugin.4n',
        'buscar' => [
            ' * @version 1.5plugin.4',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4n',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_APP a 1.5plugin.4n',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.4',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.4n',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_PLUGIN a 1.5plugin.4n',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4n',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'contenido.js: bump a 1.5plugin.4n',
        'buscar' => [
            ' * @version 1.5plugin.4',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4n',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: bump a 1.5plugin.4n',
        'buscar' => [
            ' * @version 1.5plugin.4',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4n',
        ],
    ],

    // ============================================================
    // prompts/prompt_plugin_piloto.md
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: bump a v1.5plugin.4n',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.4m (secciones',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.4n (progreso',
            'en vivo al correr una sección: la ventana itera las pruebas',
            'y manda `correr_prueba` una por una, actualizando el estado',
            'después de cada una. El SW ya no corre la sección entera;',
            'el caso `correr_seccion` se eliminó. Se agrega estilo',
            '`.corriendo` para la prueba en curso).',
            'Antes: v1.5plugin.4m (secciones',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: nota de secciones actualizada',
        'buscar' => [
            'La ventana renderiza cada sección con un botón "Correr todas".',
            'Para agregar una sección nueva, sumar un objeto a `SECCIONES`.',
        ],
        'reemplazar' => [
            'La ventana renderiza cada sección con un botón "Correr todas".',
            'Cuando se aprieta, la ventana itera las pruebas de la',
            'sección y manda `correr_prueba` una por una, mostrando el',
            'progreso en vivo: la prueba en curso se resalta y el',
            'resumen dice "Corriendo N/total...". El SW no tiene un caso',
            '`correr_seccion`; simplemente ejecuta cada prueba individual.',
            'Para agregar una sección nueva, sumar un objeto a `SECCIONES`.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: leccion 24 reemplazada por dos items',
        'buscar' => [
            '24. **Cuando un bloque `buscar` falla, copiarlo textual del',
            '    archivo real, no de memoria.**',
        ],
        'reemplazar' => [
            '24. **Cuando un bloque `buscar` falla, copiarlo textual del',
            '    archivo real, no de memoria.**',
            '25. **Cuando un flujo largo necesita progreso, iterarlo desde',
            '    el lado que dibuja la UI.** Al correr una sección completa,',
            '    la ventana itera las pruebas y manda `correr_prueba` una',
            '    por una, actualizando el estado después de cada respuesta.',
            '    Si el SW corriera todo y devolviera al final, la UI no',
            '    podría mostrar progreso intermedio sin mensajería',
            '    bidireccional. Bug en v1.5plugin.4m: "Correr todas"',
            '    mostraba todo recién al final. Fix en v1.5plugin.4n.',
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