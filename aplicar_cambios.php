<?php
/**
 * Aplicador — Tanda D.2 v3 (JS): prompt_plugin_piloto.md + estructura_plugin.md.
 *
 * Corrige:
 *   1. La tabla de migraciones aparece DOS veces en prompt_plugin_piloto.md.
 *      Cada bloque se desambigua con su header (uno es "## 11. MIGRACIONES
 *      (v1.5plugin.9a-9b)", otro es "## 11. ARCO DEL BOTÓN DE MIGRACIONES
 *      (v1.5plugin.9a-9m)").
 *   2. El `buscar` del §12 tampoco matcheaba porque `**FIN DEL PROMPT**`
 *      aparece dos veces. Se usa "Modo dry-run" como ancla (único en §11.4).
 *
 * Uso (raíz del repo iteradoresJS/): php aplicar_cambios_d2_js_v3.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '';
$htmls_a_bumpear = [];

$cambios = [

// ============================================================
// 1. Primera tabla de migraciones (sección §11 original)
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'prompts/prompt_plugin_piloto.md',
    'descripcion' => 'Plugin: primera tabla §11.1 (10 -> 12 pasos)',
    'buscar' => [
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
    ],
    'reemplazar' => [
        '## 11. MIGRACIONES (v1.5plugin.9a-9b)',
        '',
        'El plugin tiene un botón **🔧 Migraciones** en la barra de',
        'acciones globales del popup. Corre la secuencia de',
        'migraciones del piloto PHP (11 pasos + drenado del buzón) y',
        'persiste el estado en el grafo.',
        '',
        '### 11.1 Los 12 pasos',
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
        '| 10 | `?reparar_cancelaciones=1` | ON | no |',
        '| 11 | `?reparar_cancelaciones_arboles=1` | ON | no |',
        '| 12 | Drenar buzón (login dueño → Vendidos → logout) | ON | no |',
        '',
        'Los pasos 10 y 11 (agregados en v1.5plugin.9p) cierran el',
        'arco de cancelaciones en compartidos. Ambos idempotentes,',
        'seguros, con `default: true`. Ver `prompt_piloto.md` §5.17',
        'del proyecto PHP.',
        '',
        'Los pasos peligrosos muestran un ⚠️ y un tooltip:',
    ],
],

// ============================================================
// 2. Segunda tabla de migraciones (sección §11 del arco final)
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'prompts/prompt_plugin_piloto.md',
    'descripcion' => 'Plugin: segunda tabla §11.1 (10 -> 12 pasos)',
    'buscar' => [
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
    ],
    'reemplazar' => [
        '## 11. ARCO DEL BOTÓN DE MIGRACIONES (v1.5plugin.9a-9p)',
        '',
        'El plugin tiene un botón **🔧 Migraciones** en la barra',
        'de acciones globales del popup. Corre la secuencia de',
        'migraciones del piloto (11 pasos + drenado del buzón) y',
        'persiste el estado en el grafo.',
        '',
        '### 11.1 Los 12 pasos',
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
        '| 10 | `?reparar_cancelaciones=1` | ON | no |',
        '| 11 | `?reparar_cancelaciones_arboles=1` | ON | no |',
        '| 12 | Drenar buzón (login dueño → Vendidos → logout) | ON | no |',
        '',
        'Los pasos 10 y 11 (agregados en v1.5plugin.9p) cierran el',
        'arco de cancelaciones en compartidos. Los pasos peligrosos',
        'muestran un ⚠️ y un tooltip. El paso 12 tiene un input',
        'editable para el código del dueño (con `carmen1` como',
        'default).',
    ],
],

// ============================================================
// 3. Lecciones 68-70
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'prompts/prompt_plugin_piloto.md',
    'descripcion' => 'Plugin: 3 lecciones nuevas (68-70)',
    'buscar' => [
        '    efecto en el DOM (modal abierto con contenido) es',
        '    parte del contrato.',
        '',
        '---',
        '',
        '## 11. MIGRACIONES (v1.5plugin.9a-9b)',
    ],
    'reemplazar' => [
        '    efecto en el DOM (modal abierto con contenido) es',
        '    parte del contrato.',
        '',
        '68. **Un grafo persistido por feature, no todo en uno.**',
        '    Al principio el plugin guardaba todo (corridas,',
        '    migraciones, auditorías) en un único grafo',
        '    (`plugin_pruebas`). Con el tiempo, ese grafo acumuló',
        '    ~2500 nodos, y cualquier operación que lo cargara',
        '    tardaba segundos (el framework recorre todo el grafo',
        '    en cada `cargar`). La carga de auditorías colgaba el',
        '    popup. **Regla: cada feature con su propio grafo**',
        '    (`plugin_pruebas`, `plugin_auditorias`,',
        '    `plugin_<futuro>`). `GrafoPlugin.js` mantiene',
        '    `_grafo_cargado_actual` (string|null) para saber qué',
        '    grafo tiene cargado y recargar si cambia.',
        '',
        '69. **Guardar reportes completos como JSON string en un',
        '    solo nodo, no como sub-árbol.** Al principio cada',
        '    auditoría creaba ~58 nodos (9 campos + 3 contenedores',
        '    + 15 items + 30 campos). Con 10 auditorías, el grafo',
        '    tenía 5000 nodos. Reemplazado por un único nodo',
        '    `auditoria_<ts>` con el reporte serializado a JSON en',
        '    el `dato`. Se conservan solo los primeros 5 items por',
        '    severidad en el JSON; el resto se trunca. **Ventajas:**',
        '    (a) menos nodos, carga más rápida; (b) el nodo no',
        '    tiene hijos, no hay que recorrerlos para destruirlo.',
        '    **Desventaja:** si el reporte crece mucho (e.g.',
        '    1000 items por severidad), el JSON puede pesar varios',
        '    KB. Solución: truncar al guardar, mostrar completo',
        '    solo en la UI en vivo.',
        '',
        '70. **Los bloques `buscar` con estructura repetida',
        '    necesitan desambiguación por header.** El prompt tiene',
        '    DOS tablas de migraciones idénticas (una en §11 y otra',
        '    en el arco del final). Un `buscar` que arranca en',
        '    "### 11.1 Los 10 pasos" matchea las dos y aborta por',
        '    ambigüedad. **Regla: incluir el header `## 11. <título',
        '    único>` en el `buscar`** para anclar la sección. Lo',
        '    mismo con `**FIN DEL PROMPT**`, que aparece dos veces',
        '    (final del bloque grande y final del arco). Usar la',
        '    última línea del archivo como ancla específica.',
        '',
        '---',
        '',
        '## 11. MIGRACIONES (v1.5plugin.9a-9b)',
    ],
],

// ============================================================
// 4. Bump "última actualización" (§9 DISCUSIÓN ACTUAL)
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'prompts/prompt_plugin_piloto.md',
    'descripcion' => 'Plugin: bump última actualización',
    'buscar' => [
        '**Última actualización de este prompt:** v1.5plugin.9m.',
        'Botón "🔧 Migraciones" en el plugin (v9a-v9m). Corre los',
        '9 pasos del piloto + drenado del buzón. Estado persistido',
        'en el grafo, reanudable. `asegurar_login` 100%',
        '`executeScript` (v9k). `URLS_PILOTO` estricta (v9l).',
        'URLs de pruebas y producción actualizadas (v9m). Ver §11.',
    ],
    'reemplazar' => [
        '**Última actualización de este prompt:** v1.5plugin.9p.',
        'Cierre de la línea de auditoría topológica y del arco de',
        'cancelaciones:',
        '- v9o: botón "🔍 Auditar topología" + panel + grafo',
        '  `plugin_auditorias` con 1 nodo JSON por auditoría. Ver §12.',
        '- v9p: secuencia de migración ampliada de 10 a 12 pasos',
        '  (`reparar_cancelaciones` y `reparar_cancelaciones_arboles`',
        '  entre `reparar_arboles` y `drenar_buzon`). Ver §11.1.',
        '',
        'Antes (v9m): botón "🔧 Migraciones" con los 9 pasos del',
        'piloto + drenado. Ver §11.',
    ],
],

// ============================================================
// 5. §12 nueva (auditoría topológica)
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'prompts/prompt_plugin_piloto.md',
    'descripcion' => 'Plugin: §12 auditoría topológica',
    'buscar' => [
        '- Modo dry-run: mostrar qué haría cada paso sin ejecutarlo.',
        '',
        '**FIN DEL PROMPT**',
    ],
    'reemplazar' => [
        '- Modo dry-run: mostrar qué haría cada paso sin ejecutarlo.',
        '',
        '---',
        '',
        '## 12. AUDITORÍA TOPOLÓGICA (v1.5plugin.9o-9p)',
        '',
        'El plugin tiene un botón **🔍 Auditar topología** en la barra de',
        'acciones globales del popup. Corre el endpoint del piloto',
        '`?auditar_topologia=1` y muestra el reporte en un panel',
        'colapsable.',
        '',
        '### 12.1 Qué hace',
        '',
        '- Hace un GET a `index.php?auditar_topologia=1&nombre_solicitante=<nombre>`',
        '  dentro del page context (para que viajen las cookies del piloto).',
        '- El nombre del solicitante se resuelve con',
        '  `ctx.nombre_usuario_actual()` (lee `usuario_actual.nombre_usuario`',
        '  del page). En local, si no se resuelve, el endpoint lo permite.',
        '- Parsea el JSON de respuesta. Si `exito: true`, persiste la',
        '  auditoría en el grafo del plugin.',
        '- Muestra el reporte agrupado por severidad (críticos, errores,',
        '  warnings) con colores.',
        '- Muestra el historial de las últimas 10 auditorías.',
        '',
        '### 12.2 Persistencia: grafo propio `plugin_auditorias`',
        '',
        '**Las auditorías no comparten el grafo con las pruebas ni con las',
        'migraciones.** Viven en un grafo separado (`plugin_auditorias`).',
        'Motivo: el grafo de pruebas (`plugin_pruebas`) acumula ~2500 nodos',
        'entre corridas y migraciones viejas. Cargar ese grafo para leer',
        'auditorías tardaba segundos y colgaba el popup.',
        '',
        '**1 nodo JSON por auditoría.** Cada auditoría se guarda como un',
        'único nodo `auditoria_<ts>` con el reporte serializado a JSON en el',
        '`dato`. Antes se creaban ~58 nodos por corrida (9 campos + 3',
        'contenedores + 15 items + 30 campos). Con 10 auditorías, el grafo',
        'crecía a 5000 nodos y la carga se volvía lenta.',
        '',
        '**Estructura:**',
        '',
        '```',
        'plugin',
        '└── auditorias',
        '    ├── actual → auditoria_<ts>   (autoenlace, la última)',
        '    └── auditoria_<ts>',
        '        └── dato = JSON con { fecha_hora, entorno, duracion_ms,',
        '                              nodos_total, aristas_total,',
        '                              criticos_count, errores_count,',
        '                              warnings_count,',
        '                              criticos: [...], errores: [...],',
        '                              warnings: [...] }',
        '```',
        '',
        'Se conservan las últimas 10 auditorías. El autoenlace `actual`',
        'facilita el lookup de la última.',
        '',
        '### 12.3 UI',
        '',
        '- Botón "🔍 Auditar topología" al lado de "🔧 Migraciones" en la',
        '  barra de acciones globales.',
        '- Panel colapsable que se abre al clickear el botón.',
        '- Dentro del panel:',
        '  - Contadores coloreados (rojo/naranja/amarillo).',
        '  - Primeros 5 items por severidad (el resto, truncado).',
        '  - Botón "🔍 Auditar ahora" con confirmación por entorno:',
        '    `confirm()` en local, `prompt("AUDITAR")` en remoto.',
        '  - Historial de las últimas 5 auditorías con fecha, entorno y',
        '    contadores.',
        '',
        '### 12.4 Módulos tocados',
        '',
        '- `Aplicacion/Auditoria.js` (nuevo): cliente del endpoint.',
        '- `Aplicacion/servicio.js`: cases `auditar_topologia` y',
        '  `estado_auditorias`.',
        '- `Aplicacion/GrafoPlugin.js`: `registrar_auditoria` y',
        '  `obtener_estado_auditorias` sobre `plugin_auditorias`.',
        '- `Aplicacion/ventana.js`: botón + panel + render del reporte.',
        '- `Aplicacion/ConfiguracionApli.js`: `NOMBRE_GRAFO_AUDITORIAS`.',
        '',
        '---',
        '',
        '**FIN DEL PROMPT**',
    ],
],

// ============================================================
// 6. estructura_plugin: Aplicacion/Auditoria.js
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'prompts/estructura_plugin.md',
    'descripcion' => 'estructura_plugin: Aplicacion/Auditoria.js',
    'buscar' => [
        '- `LimpiezaPrueba.js` — limpieza de datos de prueba.',
        '- `CopiarPasajeros.js` — copia la tabla del micro abierto.',
        '- `Migraciones.js` — secuencia de migraciones del piloto',
        '  (botón "🔧 Migraciones"). Ver §7.',
    ],
    'reemplazar' => [
        '- `LimpiezaPrueba.js` — limpieza de datos de prueba.',
        '- `CopiarPasajeros.js` — copia la tabla del micro abierto.',
        '- `Migraciones.js` — secuencia de migraciones del piloto',
        '  (botón "🔧 Migraciones"). Ver §7.',
        '- `Auditoria.js` — cliente del endpoint',
        '  `?auditar_topologia=1` del piloto. GET dentro del page',
        '  context, parseo del JSON, validación de 403. Lo usa',
        '  `servicio.js` en `_ejecutar_auditoria`. Ver',
        '  `prompt_plugin_piloto.md` §12.',
    ],
],

// ============================================================
// 7. estructura_plugin: plugin_auditorias
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'prompts/estructura_plugin.md',
    'descripcion' => 'estructura_plugin: plugin_auditorias',
    'buscar' => [
        'Se conservan las últimas 10 corridas. El autoenlace `actual`',
        'facilita el lookup de la corrida en curso sin recorrer el',
        'contenedor.',
        '',
        'Si una corrida queda con `estado_global = "en_curso"` (el SW',
        'se reinició a mitad, o el usuario cerró el popup), el popup',
        'ofrece "Continuar" al reabrirse.',
    ],
    'reemplazar' => [
        'Se conservan las últimas 10 corridas. El autoenlace `actual`',
        'facilita el lookup de la corrida en curso sin recorrer el',
        'contenedor.',
        '',
        'Si una corrida queda con `estado_global = "en_curso"` (el SW',
        'se reinició a mitad, o el usuario cerró el popup), el popup',
        'ofrece "Continuar" al reabrirse.',
        '',
        '### 3.3 Auditorías topológicas (v1.5plugin.9o)',
        '',
        'Las auditorías viven en un **grafo separado** del de pruebas.',
        'Nombre: `plugin_auditorias` (`NOMBRE_GRAFO_AUDITORIAS` en',
        '`ConfiguracionApli.js`).',
        '',
        'Estructura:',
        '',
        '```',
        'plugin (especial)',
        '└── auditorias (contenedor)',
        '    ├── actual → auditoria_<ts>   (autoenlace, la última)',
        '    └── auditoria_<ts>',
        '        └── dato = JSON con { fecha_hora, entorno, duracion_ms,',
        '                              nodos_total, aristas_total,',
        '                              criticos_count, errores_count,',
        '                              warnings_count,',
        '                              criticos: [...], errores: [...],',
        '                              warnings: [...] }',
        '```',
        '',
        'Cada auditoría es **1 solo nodo** con el reporte serializado',
        'a JSON en el `dato`. No tiene hijos. Se conservan las últimas',
        '10. Los items por severidad se truncan a 5 al guardar (para',
        'no inflar el JSON). El autoenlace `actual` apunta a la última.',
        '',
        'Motivo del grafo separado: `plugin_pruebas` acumula ~2500',
        'nodos entre corridas y migraciones viejas. Cargarlo para leer',
        'auditorías tardaba segundos y colgaba el popup. Con el grafo',
        'propio (13 nodos máximo), la carga es instantánea.',
    ],
],

// ============================================================
// 8. Bump "última actualización" estructura_plugin
// ============================================================
[
    'tipo' => 'reemplazar',
    'archivo' => 'prompts/estructura_plugin.md',
    'descripcion' => 'estructura_plugin: bump última actualización',
    'buscar' => [
        'Última actualización: v1.5plugin.9m.',
    ],
    'reemplazar' => [
        'Última actualización: v1.5plugin.9p.',
    ],
],

];

// Runner
echo "=== Aplicador — Tanda D.2 v3 (JS) ===\n\n";

function detectar_eol(string $c): string { return (strpos($c, "\r\n") !== false) ? "\r\n" : "\n"; }
function normalizar_a_unix(string $c): string { return str_replace("\r\n", "\n", $c); }
function normalizar_a_original(string $c, string $e): string { return $e === "\n" ? $c : str_replace("\n", "\r\n", $c); }
function contar_ocurrencias(string $c, string $b): int {
    if ($b === '') return 0;
    $n = 0; $o = 0;
    while (($p = strpos($c, $b, $o)) !== false) { $n++; $o = $p + strlen($b); }
    return $n;
}

$reemplazos_por_archivo = [];
foreach ($cambios as $cambio) {
    if (!isset($cambio['archivo']) || !isset($cambio['buscar']) || !isset($cambio['reemplazar'])) {
        echo "[FALLO] Cambio mal formado.\n"; exit(1);
    }
    $reemplazos_por_archivo[$cambio['archivo']][] = $cambio;
}

echo "[INFO] " . count($reemplazos_por_archivo) . " archivo(s) a reemplazar.\n\n";

$archivos_a_escribir = []; $bloques_ok = 0; $bloques_fallidos = [];

foreach ($reemplazos_por_archivo as $archivo_rel => $lista) {
    $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
    if (!file_exists($ruta_abs)) { $bloques_fallidos[] = "Archivo no encontrado: $archivo_rel"; continue; }
    $contenido_original = file_get_contents($ruta_abs);
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

echo "\n=== Resumen ===\n";
echo "Bloques aplicados: $bloques_ok\n";
echo "Archivos escritos: $archivos_escritos\n";
if (!empty($bloques_fallidos)) {
    echo "Fallos: " . count($bloques_fallidos) . "\n";
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";