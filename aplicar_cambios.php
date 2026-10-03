<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda v1.5plugin.2b — fix del nombre de arranque.js.
 *
 * El archivo se creó como `arranqu.js` (sin la "e") pero todos los
 * imports apuntaban a `arranque.js`. Chrome no podía resolver el
 * árbol del service worker y abortaba con el error genérico
 * "unknown error when fetching the script".
 *
 * Se crea el archivo con el nombre correcto, se elimina el mal
 * nombrado, se corrige el import en servicio.js y se limpian
 * referencias residuales.
 *
 * Uso (parado en iteradoresJS/):
 *   php aplicar_cambios.php
 *
 * Si PHP no está en el PATH del sistema:
 *   C:\xampp\php\php.exe aplicar_cambios.php
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
    // Aplicacion/arranque.js — crear con el nombre correcto
    // ============================================================

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/arranque.js',
        'descripcion' => 'arranque.js (nombre correcto, era arranqu.js)',
        'contenido' => [
            '/**',
            ' * Arranque del framework Iteradores en el service worker.',
            ' *',
            ' * Responsabilidades:',
            ' * - Forzar salida en modo consola (el SW no tiene document).',
            ' * - Fijar modo desarrollo (habilita `permite_pruebas`).',
            ' * - Configurar `Conf` con valores propios del plugin.',
            ' * - Cargar el Controlador dinamicamente despues de configurar',
            ' *   Conf, para que la persistencia tome el nombre correcto',
            ' *   de la BD IndexedDB.',
            ' *',
            ' * @version 1.5plugin.2b',
            ' */',
            '',
            'import { Conf, Entorno } from "../Configuracion/index.js";',
            'import { configurar_conf } from "./ConfPlugin.js";',
            '',
            '// Salida consola: los caminos HTML del framework tocan document,',
            '// que no existe en el service worker.',
            'Entorno.establecer_salida(Entorno.SALIDA_CONSOLA);',
            'Entorno.establecer_modo(Entorno.MODO_DESARROLLO);',
            '',
            '// Config propia del plugin.',
            'configurar_conf(Conf);',
            '',
            'let _controlador = null;',
            '',
            '/**',
            ' * Devuelve el Controlador ya inicializado. La primera llamada',
            ' * dispara el import dinamico del modulo `Controlador`, que',
            ' * a su vez llama a `Controlador.inicializar()` al final de su',
            ' * evaluacion.',
            ' *',
            ' * Espera activamente a que `clase_actual` quede seteada como',
            ' * senal de que la inicializacion termino. Despues fuerza el',
            ' * metodo de persistencia a `IndexedDB` (el framework por',
            ' * defecto usa `EIndexedDB`).',
            ' *',
            ' * @returns {Promise<typeof Controlador>}',
            ' */',
            'export async function obtener_controlador() {',
            '    if (_controlador && _controlador.clase_actual) return _controlador;',
            '',
            '    const mod = await import("../Controlador/index.js");',
            '    _controlador = mod.Controlador;',
            '',
            '    const inicio = Date.now();',
            '    while (!_controlador.clase_actual) {',
            '        if (Date.now() - inicio > 5000) {',
            '            throw new Error("El Controlador no termino de inicializar en 5s");',
            '        }',
            '        await new Promise((r) => setTimeout(r, 20));',
            '    }',
            '',
            '    try {',
            '        _controlador.establecer_metodo("IndexedDB");',
            '    } catch (e) {',
            '        console.warn("No se pudo forzar IndexedDB:", e);',
            '    }',
            '',
            '    return _controlador;',
            '}',
        ],
    ],

    // ============================================================
    // Aplicacion/servicio.js — corregir el import
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: import de arranque.js (no arranqu.js)',
        'buscar' => [
            'import { obtener_controlador } from "./arranqu.js";',
        ],
        'reemplazar' => [
            'import { obtener_controlador } from "./arranque.js";',
        ],
    ],

    // ============================================================
    // Aplicacion/ConfPlugin.js — corregir comentario
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: comentario apunta a arranque.js',
        'buscar' => [
            ' * por el framework. Se llama desde `bootstrap.js` *antes* de',
        ],
        'reemplazar' => [
            ' * por el framework. Se llama desde `arranque.js` *antes* de',
        ],
    ],

    // ============================================================
    // manifest.json — bump de version
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'manifest.json',
        'descripcion' => 'manifest.json: version 1.5.4',
        'buscar' => [
            '  "version": "1.5.3",',
        ],
        'reemplazar' => [
            '  "version": "1.5.4",',
        ],
    ],

    // ============================================================
    // Eliminaciones
    // ============================================================

    [
        'tipo' => 'eliminar',
        'archivo' => 'Aplicacion/arranqu.js',
        'descripcion' => 'Nombre mal escrito, reemplazado por arranque.js',
    ],

    [
        'tipo' => 'eliminar',
        'archivo' => 'Aplicacion/prueba_import.js',
        'descripcion' => 'Archivo de diagnostico temporal',
    ],

    // ============================================================
    // prompts/prompt_plugin_piloto.md
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: ultima actualizacion a v1.5plugin.2b',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.2a (fix del',
            'import de `GrafoPlugin.js`: apuntaba a `./bootstrap.js`, que en',
            'v1.5plugin.2 se había renombrado a `./arranque.js`. Chrome no',
            'podía resolver el árbol del service worker y abortaba con el',
            'error genérico "unknown error when fetching the script".',
            'Regla aprendida: cuando se renombra un archivo del plugin, hay',
            'que buscar **todas** las referencias al nombre viejo, no solo',
            'en los archivos que se tocan en la tanda. Un grep del nombre',
            'viejo en todo `Aplicacion/` debería ser parte del checklist.).',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.2b (fix del',
            'nombre de `arranque.js`: el archivo se había creado como',
            '`arranqu.js`, sin la "e". Chrome no podía resolver el árbol',
            'del service worker y abortaba con el error genérico "unknown',
            'error when fetching the script". Se creó el archivo con el',
            'nombre correcto, se eliminó el mal nombrado, y se corrigió',
            'el import en `servicio.js`.).',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: lecciones ampliadas',
        'buscar' => [
            '**Lecciones aprendidas:**',
            '',
            '- Al renombrar un archivo del plugin, hacer un grep del nombre',
            '  viejo en todo `Aplicacion/` y actualizar **todas** las',
            '  referencias, no solo las de los archivos que se tocan en la',
            '  tanda. `GrafoPlugin.js` quedó apuntando a `./bootstrap.js`',
            '  tras el rename de v1.5plugin.2.',
            '- Si Chrome muestra "unknown error when fetching the script" al',
            '  registrar un service worker module, casi siempre es un import',
            '  que no se puede resolver en la cadena. Diagnóstico rápido:',
            '  reducir `servicio.js` a un `console.log` y agregar imports',
            '  de a uno hasta que rompa.',
        ],
        'reemplazar' => [
            '**Lecciones aprendidas:**',
            '',
            '- Al renombrar un archivo del plugin, hacer un grep del nombre',
            '  viejo en todo `Aplicacion/` y actualizar **todas** las',
            '  referencias, no solo las de los archivos que se tocan en la',
            '  tanda. `GrafoPlugin.js` quedó apuntando a `./bootstrap.js`',
            '  tras el rename de v1.5plugin.2.',
            '- **Verificar el nombre exacto del archivo en disco antes de',
            '  commitear.** `arranque.js` se creó como `arranqu.js` (sin la',
            '  "e") y los imports apuntaban al nombre correcto. Chrome no',
            '  podía resolver la cadena y daba el mismo error genérico que',
            '  un import roto.',
            '- **Correr `auditar_plugin.php` tras cada tanda que agregue o',
            '  renombre archivos.** Detecta imports rotos, paths del',
            '  manifest que no resuelven, y referencias a nombres viejos',
            '  en comentarios y strings. Es rápido y evita perder tiempo',
            '  con el error genérico de Chrome.',
            '- Si Chrome muestra "unknown error when fetching the script" al',
            '  registrar un service worker module, casi siempre es un import',
            '  que no se puede resolver en la cadena (nombre mal escrito,',
            '  archivo faltante, o comentario que menciona un nombre viejo',
            '  no es la causa, pero ayuda descartar). Diagnóstico rápido:',
            '  reducir `servicio.js` a un `console.log` y agregar imports',
            '  de a uno hasta que rompa.',
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