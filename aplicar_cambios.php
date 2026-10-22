<?php
/**
 * Aplicador — v1.5plugin.9b: manifest + fix del case
 * listar_pasos_migracion + URLs por entorno + documentación.
 *
 * Uso (raíz de iteradoresJS/): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.9b';
$htmls_a_bumpear = [];

$cambios = [

    // ============================================================
    // 1. manifest.json: dominios de pruebas y producción
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'manifest.json',
        'descripcion' => 'manifest.json: host_permissions con dominios remotos',
        'buscar' => [
            '  "host_permissions": [',
            '    "http://localhost/*",',
            '    "http://127.0.0.1/*"',
            '  ],',
        ],
        'reemplazar' => [
            '  "host_permissions": [',
            '    "http://localhost/*",',
            '    "http://127.0.0.1/*",',
            '    "*://viajesdelcarmen.rf.gd/*",',
            '    "*://viajesdelcarmen.click.gd/*"',
            '  ],',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'manifest.json',
        'descripcion' => 'manifest.json: content_scripts.matches con dominios remotos',
        'buscar' => [
            '      "matches": [',
            '        "http://localhost/*",',
            '        "http://127.0.0.1/*"',
            '      ],',
        ],
        'reemplazar' => [
            '      "matches": [',
            '        "http://localhost/*",',
            '        "http://127.0.0.1/*",',
            '        "*://viajesdelcarmen.rf.gd/*",',
            '        "*://viajesdelcarmen.click.gd/*"',
            '      ],',
        ],
    ],

    // ============================================================
    // 2. ConfiguracionApli.js: tres URLs + default
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'ConfiguracionApli.js: tres URLs de entorno',
        'buscar' => [
            '// URL del piloto PHP. Debe estar cubierta por host_permissions',
            '// y content_scripts.matches en manifest.json.',
            'export const URL_PILOTO = "http://localhost/iteradores/codigo.worktrees/v1.5i/";',
        ],
        'reemplazar' => [
            '// URLs de los tres entornos del piloto. Cambiar `URL_PILOTO`',
            '// (al final de este bloque) a la constante correspondiente',
            '// antes de recargar la extension. El popup todavia no tiene',
            '// selector de entorno; se agrega en una proxima tanda.',
            '//',
            '// Importante: la URL que se elija aca tiene que estar',
            '// cubierta por `host_permissions` y',
            '// `content_scripts.matches` en `manifest.json`. Si no, el',
            '// plugin no puede encontrar la pestana del piloto ni hacer',
            '// fetch.',
            'export const URL_PILOTO_LOCAL = "http://localhost/iteradores/codigo.worktrees/v1.5i/";',
            'export const URL_PILOTO_PRUEBAS = "https://viajesdelcarmen.rf.gd/";',
            'export const URL_PILOTO_PRODUCCION = "https://viajesdelcarmen.click.gd/";',
            '',
            '// URL activa. Cambiar a URL_PILOTO_PRUEBAS o',
            '// URL_PILOTO_PRODUCCION segun donde se vaya a probar.',
            'export const URL_PILOTO = URL_PILOTO_LOCAL;',
        ],
    ],

    // ============================================================
    // 3. servicio.js: URLS_PILOTO extendido
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: URLS_PILOTO con dominios remotos',
        'buscar' => [
            'const URLS_PILOTO = ["http://localhost/", "http://127.0.0.1/"];',
        ],
        'reemplazar' => [
            '// URLs del piloto validas. `_es_url_piloto` las usa para',
            '// identificar la pestana del piloto. NO depende de la URL',
            '// activa configurada en ConfiguracionApli.js: es la lista',
            '// de dominios donde el plugin puede actuar.',
            'const URLS_PILOTO = [',
            '    "http://localhost/",',
            '    "http://127.0.0.1/",',
            '    "https://viajesdelcarmen.rf.gd/",',
            '    "http://viajesdelcarmen.rf.gd/",',
            '    "https://viajesdelcarmen.click.gd/",',
            '    "http://viajesdelcarmen.click.gd/",',
            '];',
        ],
    ],

    // ============================================================
    // 4. servicio.js: case listar_pasos_migracion
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: case listar_pasos_migracion',
        'buscar' => [
            '                case "estado_migracion": {',
        ],
        'reemplazar' => [
            '                case "listar_pasos_migracion": {',
            '                    sendResponse({',
            '                        exito: true,',
            '                        pasos: PASOS_MIGRACION.map(p => ({',
            '                            id: p.id,',
            '                            nombre: p.nombre,',
            '                            peligroso: !!p.peligroso,',
            '                            default: !!p.default,',
            '                            tooltip: p.tooltip || "",',
            '                        })),',
            '                    });',
            '                    break;',
            '                }',
            '',
            '                case "estado_migracion": {',
        ],
    ],

    // ============================================================
    // 5. estructura_plugin.md: árbol de archivos
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/estructura_plugin.md',
        'descripcion' => 'estructura_plugin.md: Migraciones.js en árbol',
        'buscar' => [
            '- `LimpiezaPrueba.js` — limpieza de datos de prueba.',
            '- `CopiarPasajeros.js` — copia la tabla del micro abierto.',
        ],
        'reemplazar' => [
            '- `LimpiezaPrueba.js` — limpieza de datos de prueba.',
            '- `CopiarPasajeros.js` — copia la tabla del micro abierto.',
            '- `Migraciones.js` — secuencia de migraciones del piloto',
            '  (botón "🔧 Migraciones"). Ver §7.',
        ],
    ],

    // ============================================================
    // 6. estructura_plugin.md: responsabilidades
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/estructura_plugin.md',
        'descripcion' => 'estructura_plugin.md: responsabilidades de Migraciones.js',
        'buscar' => [
            '**`GrafoPlugin.js`**:',
            '',
            '- Carga / guarda el grafo del plugin.',
            '- API: `asegurar_grafo_cargado()`, `registrar_corrida()`,',
            '  `marcar_en_vivo()`, `limpiar_en_vivo()`,',
            '  `limpiar_autoenlaces_colgados()`,',
            '  `obtener_estado_por_prueba()`.',
            '- Migración automática desde el contenedor viejo `corridas`.',
        ],
        'reemplazar' => [
            '**`GrafoPlugin.js`**:',
            '',
            '- Carga / guarda el grafo del plugin.',
            '- API de pruebas: `asegurar_grafo_cargado()`,',
            '  `registrar_corrida()`, `marcar_en_vivo()`,',
            '  `limpiar_en_vivo()`, `limpiar_autoenlaces_colgados()`,',
            '  `obtener_estado_por_prueba()`.',
            '- API de migraciones (v1.5plugin.9a):',
            '  `registrar_migracion()`, `actualizar_paso_migracion()`,',
            '  `finalizar_migracion()`, `obtener_estado_migracion()`.',
            '- Migración automática desde el contenedor viejo `corridas`.',
            '',
            '**`Migraciones.js`**:',
            '',
            '- Lista de pasos (`PASOS_MIGRACION`): los 9 del piloto.',
            '- `ejecutar_migracion(ctx, opciones, al_progreso, debe_cancelar,',
            '  pasos_ya_ok)`: itera los pasos seleccionados, hace GET',
            '  a cada endpoint, parsea el output, persiste el resultado.',
            '- `drenar_buzon(ctx)`: login dueño → Vendidos → esperar →',
            '  logout.',
            '- GET dentro del page context (para enviar cookies del piloto).',
        ],
    ],

    // ============================================================
    // 7. estructura_plugin.md: grafo persistido + mensajes
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/estructura_plugin.md',
        'descripcion' => 'estructura_plugin.md: agregar migraciones al grafo',
        'buscar' => [
            '## 3. GRAFO PERSISTIDO',
            '',
            '```',
            'plugin (especial)',
            '└── pruebas (contenedor principal)',
        ],
        'reemplazar' => [
            '## 3. GRAFO PERSISTIDO',
            '',
            '### 3.1 Corridas de pruebas',
            '',
            '```',
            'plugin (especial)',
            '└── pruebas (contenedor principal)',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/estructura_plugin.md',
        'descripcion' => 'estructura_plugin.md: bloque de migraciones al final del grafo',
        'buscar' => [
            '- Las corridas se insertan como `hmi` (la más nueva primero).',
            '- El último nodo de la cadena apunta al contenedor vía `hd`.',
            '- El autoenlace `corriendo` sirve doble: marca visual +',
            '  protección contra eliminación accidental.',
        ],
        'reemplazar' => [
            '- Las corridas se insertan como `hmi` (la más nueva primero).',
            '- El último nodo de la cadena apunta al contenedor vía `hd`.',
            '- El autoenlace `corriendo` sirve doble: marca visual +',
            '  protección contra eliminación accidental.',
            '',
            '### 3.2 Migraciones (v1.5plugin.9a)',
            '',
            '```',
            'plugin (especial)',
            '└── migraciones (contenedor)',
            '    ├── actual → corrida_<ts>   (autoenlace, la más reciente)',
            '    └── corrida_<ts>',
            '        ├── fecha_inicio        ISO',
            '        ├── fecha_fin           ISO (opcional)',
            '        ├── entorno             "local" | "remoto"',
            '        ├── estado_global       "en_curso" | "completa" |',
            '        │                       "error" | "cancelada" | "abandonada"',
            '        ├── opciones → (sub-nodo con un hijo por paso)',
            '        │   ├── migrar_a_sql64 → "1"/"0"',
            '        │   ├── ...',
            '        │   └── drenar_buzon → "1"/"0"',
            '        └── paso_<id> → (sub-nodo por cada paso)',
            '            ├── estado         "pendiente" | "corriendo" |',
            '            │                  "ok" | "saltado" | "error" |',
            '            │                  "ambiguo"',
            '            ├── mensaje        (texto corto)',
            '            ├── output         (primeros 2000 chars del response)',
            '            └── duracion_ms',
            '```',
            '',
            'Se conservan las últimas 10 corridas. El autoenlace `actual`',
            'facilita el lookup de la corrida en curso sin recorrer el',
            'contenedor.',
            '',
            'Si una corrida queda con `estado_global = "en_curso"` (el SW',
            'se reinició a mitad, o el usuario cerró el popup), el popup',
            'ofrece "Continuar" al reabrirse.',
        ],
    ],

    // ============================================================
    // 8. estructura_plugin.md: mensajes del SW
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/estructura_plugin.md',
        'descripcion' => 'estructura_plugin.md: mensajes de migraciones',
        'buscar' => [
            '- `copiar_tabla_pasajeros` →',
            '  `{exito, tabla, cantidad_filas}`.',
            '- `refrescar_asientos_pagina`.',
        ],
        'reemplazar' => [
            '- `copiar_tabla_pasajeros` →',
            '  `{exito, tabla, cantidad_filas}`.',
            '- `refrescar_asientos_pagina`.',
            '- `listar_pasos_migracion` → `{exito, pasos}` (v9a-v9b).',
            '- `estado_migracion` → `{exito, estado: {actual, historial}}` (v9a).',
            '- `entorno_actual` → `{exito, entorno: "local"|"remoto"}` (v9a).',
            '- `correr_migraciones {opciones, pasos_ya_ok}` →',
            '  `{exito, id_corrida, estado_global, resultados}` (v9a).',
            '- `cancelar_migracion` → `{exito}` (v9a).',
            '- `abandonar_migracion {id_corrida}` → `{exito}` (v9a).',
        ],
    ],
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/estructura_plugin.md',
        'descripcion' => 'estructura_plugin.md: broadcasts de migraciones',
        'buscar' => [
            '- `corrida_iniciada {id_prueba}`.',
            '- `corrida_terminada {id_prueba, resultado, fecha_hora,',
            '  duracion_ms, detalle}`.',
        ],
        'reemplazar' => [
            '- `corrida_iniciada {id_prueba}`.',
            '- `corrida_terminada {id_prueba, resultado, fecha_hora,',
            '  duracion_ms, detalle}`.',
            '- `migracion_iniciada {id_corrida, opciones, entorno}` (v9a).',
            '- `migracion_progreso {id_corrida, paso_id, estado,',
            '  mensaje, duracion_ms}` (v9a).',
            '- `migracion_terminada {id_corrida, estado_global,',
            '  resultados, error?}` (v9a).',
        ],
    ],

    // ============================================================
    // 9. estructura_plugin.md: bump versión + mención
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/estructura_plugin.md',
        'descripcion' => 'estructura_plugin.md: bump versión de la última actualización',
        'buscar' => [
            'Última actualización: v1.5plugin.8g.',
        ],
        'reemplazar' => [
            'Última actualización: v1.5plugin.9b.',
        ],
    ],

    // ============================================================
    // 10. prompt_plugin_piloto.md: nueva sección §11 (migraciones)
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt_plugin_piloto.md: agregar §11 migraciones antes de §10',
        'buscar' => [
            '## 10. REGLAS DE TRABAJO',
            '',
            'Reglas del método que aplican específicamente a este',
            'proyecto.',
        ],
        'reemplazar' => [
            '## 11. MIGRACIONES (v1.5plugin.9a-9b)',
            '',
            'El plugin tiene un botón **🔧 Migraciones** en la barra de',
            'acciones globales del popup. Corre la secuencia de',
            'migraciones del piloto PHP (9 pasos + drenado del buzón) y',
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
            'Los pasos peligrosos muestran un ⚠️ y un tooltip:',
            '',
            '- **1.** Reemplaza SQL64 con lo que hay en SQL. Solo en un',
            '  reset fresco.',
            '- **7.** Crea `soporte` singular legacy. No correr si ya hay',
            '  soportes con `soportes` plural. El admin link lo cubre el',
            '  paso 8 (`reparar_topologia`).',
            '',
            '### 11.2 Confirmación por entorno',
            '',
            '`entorno_actual` se calcula comparando `URL_PILOTO` con',
            '`localhost`/`127.0.0.1`:',
            '',
            '- **Local**: `confirm()` estándar.',
            '- **Remoto** (pruebas o producción): `prompt()` que exige',
            '  escribir `MIGRAR` en mayúsculas.',
            '',
            'No se distingue pruebas de producción. El usuario tiene que',
            'saber en qué servidor está.',
            '',
            '### 11.3 Persistencia y reanudación',
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
            '### 11.4 Drenar buzón',
            '',
            'El paso 10 hace:',
            '',
            '1. `ctx.asegurar_login(CODIGO_DUENO)` — login como dueño',
            '   con el código de `ConfiguracionApli.js`.',
            '2. `ctx.activar_pestana_piloto("vendidos")` — abre la',
            '   pestaña Vendidos. El piloto drena el buzón al cargar.',
            '3. `ctx.esperar("#lista_ventas", 30000)` — espera que',
            '   cargue la lista.',
            '4. `ctx.cerrar_sesion()` — logout.',
            '',
            '**Al terminar, el usuario queda deslogueado.** Si el paso',
            'falla (por ejemplo, el código de dueño cambió), el panel',
            'sugiere drenar a mano.',
            '',
            '### 11.5 Cancelación',
            '',
            'El botón "Cancelar" se habilita entre pasos. Manda',
            '`cancelar_migracion` al SW, que activa un flag que el',
            'ejecutor consulta entre pasos. Los pasos ya corridos no se',
            'deshacen; los pendientes quedan en `pendiente`.',
            '',
            'Si el usuario cierra el popup en medio de una corrida, el',
            'SW sigue ejecutando. Al reabrir el popup, el panel detecta',
            '`en_curso` y ofrece "Continuar" o "Abandonar".',
            '',
            '### 11.6 URLs de los tres entornos',
            '',
            '`ConfiguracionApli.js` tiene tres constantes:',
            '',
            '- `URL_PILOTO_LOCAL` = `http://localhost/iteradores/codigo.worktrees/v1.5i/`',
            '- `URL_PILOTO_PRUEBAS` = `https://viajesdelcarmen.rf.gd/`',
            '- `URL_PILOTO_PRODUCCION` = `https://viajesdelcarmen.click.gd/`',
            '',
            '`URL_PILOTO` apunta a la activa (hoy: LOCAL). Para probar en',
            'otro entorno, se cambia a mano y se recarga la extensión.',
            '**Pendiente próxima tanda:** selector de entorno en el',
            'popup para no tener que editar código.',
            '',
            '### 11.7 Pendientes detectados',
            '',
            '- Selector de entorno en el popup (local/pruebas/producción).',
            '- Botón "Probar conexión" antes de correr (verifica que el',
            '  piloto responde en `URL_PILOTO`).',
            '- Export/import del estado de migraciones (backup del grafo',
            '  del plugin).',
            '- Modo dry-run: mostrar qué haría cada paso sin ejecutarlo.',
            '',
            '## 10. REGLAS DE TRABAJO',
            '',
            'Reglas del método que aplican específicamente a este',
            'proyecto.',
        ],
    ],

    // ============================================================
    // 11. prompt_plugin_piloto.md: bump versión + estado actual
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt_plugin_piloto.md: bump versión al cierre',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.8h.',
            'Cierre de la línea del grafo del plugin + 3 pruebas',
            'nuevas de rendiciones/liquidaciones (v8h).',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.9b.',
            'Botón "🔧 Migraciones" en el plugin (v9a-9b). Corre los',
            '9 pasos del piloto + drenado del buzón. Estado persistido',
            'en el grafo. Reanudable. Manifest con dominios de pruebas',
            'y producción. Ver §11.',
        ],
    ],

];

// ============================================================
// Runner v2
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

if (!isset($htmls_a_bumpear) || !is_array($htmls_a_bumpear)) {
    $htmls_a_bumpear = [];
}
if (!isset($version_nueva)) $version_nueva = '';
$version_nueva = trim((string)$version_nueva);
$bumpear = ($version_nueva !== '');

$creaciones = [];
$eliminaciones = [];
$reemplazos_por_archivo = [];

foreach ($cambios as $cambio) {
    $tipo = $cambio['tipo'] ?? 'reemplazar';
    if ($tipo === 'crear') { $creaciones[] = $cambio; continue; }
    if ($tipo === 'eliminar') { $eliminaciones[] = $cambio; continue; }
    if (!isset($cambio['archivo']) || !isset($cambio['buscar']) || !isset($cambio['reemplazar'])) {
        echo "[FALLO] Cambio mal formado.\n"; exit(1);
    }
    $reemplazos_por_archivo[$cambio['archivo']][] = $cambio;
}

$total_reemplazos = 0;
foreach ($reemplazos_por_archivo as $l) $total_reemplazos += count($l);
echo "[INFO] " . count($reemplazos_por_archivo) . " archivo(s) a reemplazar, "
    . count($creaciones) . " a crear, " . count($eliminaciones) . " a eliminar.\n\n";

$archivos_a_escribir = [];
$bloques_ok = 0;
$bloques_fallidos = [];

foreach ($reemplazos_por_archivo as $archivo_rel => $lista) {
    $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
    if (!file_exists($ruta_abs)) { $bloques_fallidos[] = "Archivo no encontrado: $archivo_rel"; continue; }
    $contenido_original = file_get_contents($ruta_abs);
    if ($contenido_original === false) { $bloques_fallidos[] = "No se pudo leer: $archivo_rel"; continue; }
    $eol = detectar_eol($contenido_original);
    $contenido = normalizar_a_unix($contenido_original);
    $contenido_antes = $contenido;
    $hubo_error = false;
    foreach ($lista as $cambio) {
        $buscar_str = implode("\n", $cambio['buscar']);
        $reemplazar_str = implode("\n", $cambio['reemplazar']);
        $n = contar_ocurrencias($contenido, $buscar_str);
        if ($n === 0) { $bloques_fallidos[] = "$archivo_rel: no encontrado - {$cambio['descripcion']}"; $hubo_error = true; continue; }
        if ($n > 1) { $bloques_fallidos[] = "$archivo_rel: ambiguo ($n) - {$cambio['descripcion']}"; $hubo_error = true; continue; }
        $contenido = str_replace($buscar_str, $reemplazar_str, $contenido);
        $bloques_ok++;
    }
    if (!$hubo_error && $contenido !== $contenido_antes) {
        $archivos_a_escribir[$ruta_abs] = [$contenido, $eol];
    }
}

if ($modo_estricto && !empty($bloques_fallidos)) {
    echo "=== ABORTADO ===\n";
    foreach ($bloques_fallidos as $f) echo "  [FALLO] $f\n";
    exit(1);
}

$archivos_bump_php_js = [];
$archivos_bump_js_css = [];
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    $rel = substr($ruta_abs, strlen($raiz_proyecto) + 1);
    $ext = strtolower(pathinfo($ruta_abs, PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump_php_js[] = $rel;
    if ($ext === 'js' || $ext === 'css') $archivos_bump_js_css[] = $rel;
}
foreach ($creaciones as $cr) {
    $ext = strtolower(pathinfo($cr['archivo'], PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump_php_js[] = $cr['archivo'];
    if ($ext === 'js' || $ext === 'css') $archivos_bump_js_css[] = $cr['archivo'];
}

$bumps_atversion = 0;
$bumps_qv = 0;
$bumps_detalle = [];
$info_bumps = [];

if ($bumpear) {
    foreach (array_unique($archivos_bump_php_js) as $archivo_rel) {
        $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
        if (!file_exists($ruta_abs)) continue;
        if (isset($archivos_a_escribir[$ruta_abs])) {
            list($contenido, $eol) = $archivos_a_escribir[$ruta_abs];
        } else {
            $contenido_original = file_get_contents($ruta_abs);
            $eol = detectar_eol($contenido_original);
            $contenido = normalizar_a_unix($contenido_original);
        }
        $patron = '/(\*\s+@version\s+)(\S+)/';
        $viejo = '';
        $nuevo = preg_replace_callback($patron, function($m) use ($version_nueva, &$viejo) {
            $viejo = $m[2];
            return $m[1] . $version_nueva;
        }, $contenido, 1, $count);
        if ($count === 0) { $info_bumps[] = "$archivo_rel (sin @version)"; continue; }
        if ($viejo === $version_nueva) { continue; }
        $archivos_a_escribir[$ruta_abs] = [normalizar_a_unix($nuevo), $eol];
        $bumps_atversion++;
        $bumps_detalle[] = "$archivo_rel  @version $viejo → $version_nueva";
    }
}

$archivos_escritos = 0;
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    list($contenido_unix, $eol) = $info;
    $contenido_final = normalizar_a_original($contenido_unix, $eol);
    if (file_put_contents($ruta_abs, $contenido_final) === false) {
        echo "[FALLO] No se pudo escribir: " . substr($ruta_abs, strlen($raiz_proyecto) + 1) . "\n";
        continue;
    }
    $archivos_escritos++;
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
    if (!file_exists($ruta_abs)) { echo "[INFO] " . $elim['archivo'] . " no existía.\n"; continue; }
    if (unlink($ruta_abs)) echo "[OK] " . $elim['archivo'] . " (eliminado)\n";
    else echo "[FALLO] No se pudo eliminar: " . $elim['archivo'] . "\n";
}

if ($bumpear && (!empty($bumps_detalle) || !empty($info_bumps))) {
    echo "\n--- Bumps ---\n";
    foreach ($bumps_detalle as $d) echo "[BUMP] $d\n";
    foreach ($info_bumps as $i) echo "[INFO] $i\n";
}

echo "\n=== Resumen ===\n";
echo "Bloques aplicados: $bloques_ok\n";
echo "Archivos escritos: $archivos_escritos\n";
if ($bumpear) {
    echo "Bumps @version:    $bumps_atversion\n";
    echo "Bumps ?v=:         $bumps_qv\n";
}
if (!empty($bloques_fallidos)) {
    echo "Fallos: " . count($bloques_fallidos) . "\n";
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";