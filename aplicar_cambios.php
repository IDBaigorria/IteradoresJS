<?php
/**
 * Aplicador — actualización de prompts del plugin a v1.5plugin.9m.
 *
 * Uso (raíz del proyecto JS, iteradoresJS/codigo.worktrees/v1.5i/):
 *   php aplicar_cambios.php
 */

$modo_estricto = false;
$raiz_proyecto = __DIR__;
$version_nueva = '';
$htmls_a_bumpear = [];

$cambios = [

    // ============================================================
    // 1. prompt_plugin_piloto.md: agregar §11 (arco v9a-v9m)
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt_plugin_piloto.md: agregar §11 (arco migraciones)',
        'buscar' => [
            '**FIN DEL PROMPT**',
        ],
        'reemplazar' => [
            '---',
            '',
            '## 11. ARCO DEL BOTÓN DE MIGRACIONES (v1.5plugin.9a-9m)',
            '',
            'El plugin tiene un botón **🔧 Migraciones** en la barra',
            'de acciones globales del popup. Corre la secuencia de',
            'migraciones del piloto (9 pasos + drenado del buzón) y',
            'persiste el estado en el grafo.',
            '',
            '### 11.1 Los 10 pasos',
            '',
            '| # | Endpoint | Default | Peligroso |',
            '|---|---|---|---|',
            '| 1 | `?migrar_a_sql64=1` | ON | sí |',
            '| 2 | `?migrar_usuarios_especiales=1` | ON | no |',
            '| 3 | `?migrar_niveles_usuario=1` | ON | no |',
            '| 4 | `?migrar_compartidos_terminal=1` | ON | no |',
            '| 5 | `?construir_arboles_compartidos=1` | ON | no |',
            '| 6 | `?repuntar_terminales_compartido=1` | ON | no |',
            '| 7 | `?migrar_topologia=1` | OFF | sí |',
            '| 8 | `?reparar_topologia=1` | ON | no |',
            '| 9 | `?reparar_arboles=1` | ON | no |',
            '| 10 | Drenar buzón (login dueño → Vendidos → logout) | ON | no |',
            '',
            'Los pasos peligrosos muestran un ⚠️ y un tooltip. El paso',
            '10 tiene un input editable para el código del dueño (con',
            '`carmen1` como default).',
            '',
            '### 11.2 Persistencia y reanudación',
            '',
            'Cada corrida se guarda en `plugin → migraciones →',
            'corrida_<ts>` (ver `estructura_plugin.md` §3.2). Al abrir',
            'el panel:',
            '',
            '- Si la corrida `actual` está en `en_curso`, ofrece',
            '  "▶ Continuar" (usa los pasos ya OK como saltados y retoma',
            '  desde el primero pendiente).',
            '- Si no, muestra el formulario de configuración con los',
            '  checkboxes (defaults de §11.1) y el historial de las',
            '  últimas corridas.',
            '',
            '### 11.3 Estado del arco',
            '',
            '- **v9a**: módulo `Migraciones.js`, persistencia en',
            '  IndexedDB, panel de UI.',
            '- **v9b**: manifest con dominios, case',
            '  `listar_pasos_migracion` faltante, tres URLs de entorno',
            '  (`URL_PILOTO_LOCAL`, `URL_PILOTO_PRUEBAS`,',
            '  `URL_PILOTO_PRODUCCION`).',
            '- **v9c**: capturador de errores en el popup.',
            '- **v9d**: propagación del error + output en el panel.',
            '- **v9e**: parser de output corregido (`saltados => N`',
            '  no matcheaba, `errores:` matcheaba como error).',
            '- **v9f**: resumen final persistente en el panel.',
            '- **v9g**: código de drenado configurable, drenado como',
            '  advertencia.',
            '- **v9h**: fix de race condition entre `salir()` y',
            '  escribir el código.',
            '- **v9i**: mensaje del drenado visible en advertencias.',
            '- **v9j**: `asegurar_login` con `executeScript` (elimina',
            '  content script para el logout + login).',
            '- **v9k**: `asegurar_login` 100% `executeScript`, logout',
            '  incondicional (sin chequear `esta_visible`, que fallaba',
            '  después del logout).',
            '- **v9l**: `URLS_PILOTO` estricta (en localhost, solo',
            '  `/iteradores/`), chequeo de pestaña en `asegurar_login`',
            '  y `_ejecutar_migraciones`.',
            '- **v9m**: URLs nuevas de pruebas',
            '  (`https://viajespquiadelcarmen.rf.gd/`) y producción',
            '  (`https://viajespquiadelcarmen.infy.click/`).',
            '',
            '### 11.4 Pendientes del arco',
            '',
            '- Selector de entorno en el popup (local/pruebas/producción)',
            '  para no tener que editar `ConfiguracionApli.js` a mano.',
            '- Botón "Probar conexión" antes de correr.',
            '- Export/import del grafo del plugin (backup del estado',
            '  de migraciones).',
            '- Modo dry-run: mostrar qué haría cada paso sin ejecutarlo.',
            '',
            '**FIN DEL PROMPT**',
        ],
    ],

    // ============================================================
    // 2. prompt_plugin_piloto.md: bump versión de la última actualización
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt_plugin_piloto.md: bump versión al cierre',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.9b.',
            'Botón "🔧 Migraciones" en el plugin (v9a-9b). Corre los',
            '9 pasos del piloto + drenado del buzón. Estado persistido',
            'en el grafo. Reanudable. Manifest con dominios de pruebas',
            'y producción. Ver §11.',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.9m.',
            'Botón "🔧 Migraciones" en el plugin (v9a-v9m). Corre los',
            '9 pasos del piloto + drenado del buzón. Estado persistido',
            'en el grafo, reanudable. `asegurar_login` 100%',
            '`executeScript` (v9k). `URLS_PILOTO` estricta (v9l).',
            'URLs de pruebas y producción actualizadas (v9m). Ver §11.',
        ],
    ],

    // ============================================================
    // 3. estructura_plugin.md: bump versión
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/estructura_plugin.md',
        'descripcion' => 'estructura_plugin.md: bump versión a 9m',
        'buscar' => [
            'Última actualización: v1.5plugin.9b.',
        ],
        'reemplazar' => [
            'Última actualización: v1.5plugin.9m.',
        ],
    ],

];

// ============================================================
// Runner v2 (corregido: escribe cambios parciales en no estricto)
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

if (!isset($htmls_a_bumpear) || !is_array($htmls_a_bumpear)) $htmls_a_bumpear = [];
if (!isset($version_nueva)) $version_nueva = '';
$version_nueva = trim((string)$version_nueva);
$bumpear = ($version_nueva !== '');

$creaciones = []; $eliminaciones = []; $reemplazos_por_archivo = [];
foreach ($cambios as $cambio) {
    $tipo = $cambio['tipo'] ?? 'reemplazar';
    if ($tipo === 'crear') { $creaciones[] = $cambio; continue; }
    if ($tipo === 'eliminar') { $eliminaciones[] = $cambio; continue; }
    if (!isset($cambio['buscar']) || !isset($cambio['reemplazar'])) continue;
    $reemplazos_por_archivo[$cambio['archivo']][] = $cambio;
}

echo "[INFO] " . count($reemplazos_por_archivo) . " archivo(s) a reemplazar, "
    . count($creaciones) . " a crear, " . count($eliminaciones) . " a eliminar.\n\n";

$archivos_a_escribir = []; $bloques_ok = 0; $bloques_fallidos = [];

foreach ($reemplazos_por_archivo as $archivo_rel => $lista) {
    $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
    if (!file_exists($ruta_abs)) { $bloques_fallidos[] = "Archivo no encontrado: $archivo_rel"; continue; }
    $contenido_original = file_get_contents($ruta_abs);
    $eol = detectar_eol($contenido_original);
    $contenido = normalizar_a_unix($contenido_original);
    $contenido_antes = $contenido;
    foreach ($lista as $cambio) {
        $buscar_str = implode("\n", $cambio['buscar']);
        $reemplazar_str = implode("\n", $cambio['reemplazar']);
        $n = contar_ocurrencias($contenido, $buscar_str);
        if ($n === 0) { $bloques_fallidos[] = "$archivo_rel: no encontrado - {$cambio['descripcion']}"; continue; }
        if ($n > 1) { $bloques_fallidos[] = "$archivo_rel: ambiguo ($n) - {$cambio['descripcion']}"; continue; }
        $contenido = str_replace($buscar_str, $reemplazar_str, $contenido);
        $bloques_ok++;
    }
    if ($contenido !== $contenido_antes) {
        $archivos_a_escribir[$ruta_abs] = [$contenido, $eol];
    }
}

if ($modo_estricto && !empty($bloques_fallidos)) {
    echo "=== ABORTADO ===\n";
    foreach ($bloques_fallidos as $f) echo "  [FALLO] $f\n";
    exit(1);
}

$archivos_escritos = 0;
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    list($contenido_unix, $eol) = $info;
    if (file_put_contents($ruta_abs, normalizar_a_original($contenido_unix, $eol)) === false) {
        echo "[FALLO] No se pudo escribir: " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n"; continue;
    }
    $archivos_escritos++;
    echo "[OK] " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n";
}

echo "\n=== Resumen ===\n";
echo "Bloques aplicados: $bloques_ok\n";
echo "Archivos escritos: $archivos_escritos\n";
if (!empty($bloques_fallidos)) {
    echo "Fallos: " . count($bloques_fallidos) . "\n";
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";