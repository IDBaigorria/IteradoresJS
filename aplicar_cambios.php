<?php
/**
 * Aplicador de cambios — Proyecto iteradoresJS (plugin de pruebas).
 *
 * Tanda V1.5plugin.6f (cierre de documentación).
 *   - prompts/prompt_plugin_piloto.md: actualizar estado (59 pruebas),
 *     agregar 4 lecciones nuevas en §8, actualizar Discusión actual.
 *
 * Uso (parado en iteradoresJS/):
 *   php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;

$cambios = [

    // ============================================================
    // prompt_plugin_piloto.md — §7 estado actual
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'plugin: estado actual a 59 pruebas',
        'buscar' => [
            '**Proyecto en v1.5plugin.5w.** El esqueleto del plugin está',
            'armado y funcional, tiene 56 pruebas (base + autocompletado',
            '+ autenticación + puntos de venta + viajes + micros +',
            'ventas + empresas + vehículos + declaraciones juradas +',
            'grafo) y las agrupa en secciones.',
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.6f.** El esqueleto del plugin está',
            'armado y funcional, tiene 59 pruebas (base + autocompletado',
            '+ autenticación + puntos de venta + viajes + micros +',
            'ventas + empresas + vehículos + declaraciones juradas +',
            'grafo) y las agrupa en secciones.',
        ],
    ],

    // ============================================================
    // prompt_plugin_piloto.md — §8 lecciones nuevas
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'plugin: agregar lecciones 47-52',
        'buscar' => [
            '46. **Verificar el nombre real de la acción antes de',
            '    escribir un POST.** `viajes/agregar` no existe en el',
            '    enrutador: la acción real es `viajes/guardar` (alta o',
            '    edición unificada, llama a `guardar_viaje_completo`).',
            '    Antes de escribir un test que toque el backend, leer',
            '    el `switch ($subaccion)` del módulo correspondiente',
            '    en `Aplicacion/Enrutador.php`. La sección 6 de este',
            '    prompt tiene los códigos de acceso, pero no las',
            '    acciones: para acciones, siempre leer el Enrutador.',
        ],
        'reemplazar' => [
            '46. **Verificar el nombre real de la acción antes de',
            '    escribir un POST.** `viajes/agregar` no existe en el',
            '    enrutador: la acción real es `viajes/guardar` (alta o',
            '    edición unificada, llama a `guardar_viaje_completo`).',
            '    Antes de escribir un test que toque el backend, leer',
            '    el `switch ($subaccion)` del módulo correspondiente',
            '    en `Aplicacion/Enrutador.php`. La sección 6 de este',
            '    prompt tiene los códigos de acceso, pero no las',
            '    acciones: para acciones, siempre leer el Enrutador.',
            '',
            '47. **Los IDs numéricos del piloto no son estables entre',
            '    POSTs.** El framework mantiene una tabla de equivalencias',
            '    solo dentro de una carga. Si un test hace dos POSTs',
            '    distintos (por ejemplo, dos `grafo/nodo`), el ID',
            '    numérico que devuelve el primero puede no existir en el',
            '    segundo, o apuntar a otro nodo. **Regla: verificar',
            '    topología entre llamadas siempre con navegación desde',
            '    una raíz en una sola consulta.** No seguir IDs, no',
            '    buscar por dato. Las pruebas 57 y 58 fallaron por',
            '    esto y se reescribieron.',
            '',
            '48. **`ventas/listar` ya navega los dos árboles paralelos',
            '    del piloto.** Con `tipo=dueno` y `nombre=<dueño>`,',
            '    recorre `usuarios → dueño → privado/ventas` con',
            '    `hmi`/`hd`/`p`. Con `tipo=terminal` y',
            '    `nombre=<terminal>`, resuelve el contexto del terminal',
            '    (post repuntado, el compartido) y recorre su árbol con',
            '    `hmi_<term>`/`hd_<term>`/`p_<term>`. La prueba 58',
            '    verifica pertenencia buscando el `id_venta` en los dos',
            '    listados.',
            '',
            '49. **En modales apilados, acotar selectores a',
            '    `#modal_apilado_contenido ...`.** El modal apilado',
            '    (por ejemplo, "Ver pasaje" → "Cambiar de asiento")',
            '    convive en el DOM con el modal genérico de atrás, que',
            '    también tiene su croquis con clase `.seat`. Sin',
            '    acotar, `querySelector(\'.seat\')` devuelve el primero',
            '    en el DOM (el de atrás) y el click dispara el flujo',
            '    de atrás (seleccionar asiento en el croquis del',
            '    viaje), no el del modal del cambio.',
            '',
            '50. **Chequear efecto visual antes que atributo booleano.**',
            '    `getAttribute(\'disabled\')` devuelve `[null]`, `[""]` o',
            '    `["disabled"]` según cómo el navegador haya serializado',
            '    el atributo — no hay un formato único. Es más robusto',
            '    chequear el efecto visible del cambio (por ejemplo,',
            '    que un asiento haya quedado con la clase',
            '    `.seat-elegido`, o que un botón haya cambiado su',
            '    `classList`), que un atributo booleano.',
            '',
            '51. **No pisar el monto pagado con `cuotas = 1`.** El',
            '    frontend del piloto autocompleta el input del monto',
            '    con el total y lo deja `disabled` cuando `cuotas = 1`.',
            '    Llamar a `setear_monto_pagado(1000)` con cuotas = 1',
            '    fuerza un valor menor al total y dispara el rechazo',
            '    del backend introducido en v1.5piloto.77m ("Con 1',
            '    sola cuota, el monto a pagar debe cubrir el total").',
            '    Regla: con `cuotas = 1`, no tocar el monto.',
            '',
            '52. **Polling activo en lugar de pausas fijas.** Los',
            '    modales del piloto hacen varios fetches en serie',
            '    antes de renderizar. Una pausa fija de 1.5s o 3s',
            '    puede quedarse corta con un grafo grande. Regla:',
            '    esperar activamente por el efecto deseado (que',
            '    aparezca el elemento, que se habilite el botón, que',
            '    la clase esperada esté presente) con un timeout',
            '    holgado (15-25s), y fallar con un mensaje claro si',
            '    no llega.',
        ],
    ],

    // ============================================================
    // prompt_plugin_piloto.md — Discusión actual
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'plugin: discusión actual a 6f',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.5w',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.6f',
            '(cierre de la fase de pruebas del aislamiento por topología).',
            '',
            '**Estado actual.** El plugin tiene **59 pruebas**, agrupadas',
            'por sección. Las nuevas (57, 58, 59) verifican la fase',
            'B2.3.5 del piloto:',
            '',
            '- **57** (`enlace_dueno_apunta_al_compartido`): después del',
            '  repuntado, el enlace `dueno` de un terminal apunta a un',
            '  nodo con `_es_compartido`. Usa el campo `destino_es_compartido`',
            '  que expone `grafo:nodo` desde v1.5piloto.77k.',
            '- **58** (`venta_terminal_arbol_dual`): una venta hecha por',
            '  un terminal aparece tanto en `ventas/listar` tipo=dueno',
            '  (árbol del dueño) como tipo=terminal (árbol del compartido).',
            '- **59** (`cambiar_asiento_desde_croquis`): flujo completo',
            '  de cambiar de asiento desde el croquis, incluyendo el',
            '  modal apilado y la verificación por `ventas/obtener`.',
            '',
            '**Pendientes del plugin:**',
            '',
            '- Prueba espejo de "cambiar de asiento" desde la pestaña',
            '  Clientes (el flujo del `ver_detalle_pasaje_individual`',
            '  en `pasajeros.js`, v77c/d).',
            '- A medida que avance B2.4 y B3, agregar pruebas espejo',
            '  para las operaciones que mantienen vivos los compartidos.',
            '',
            '**Lecciones de esta sesión:** ver las 6 nuevas (47-52)',
            'agregadas en §8. Destacan: navegar siempre desde una raíz,',
            'no seguir IDs numéricos entre POSTs, acotar selectores a',
            '`#modal_apilado_contenido`, chequear efectos visuales en',
            'vez de atributos booleanos, no tocar el monto con cuotas=1,',
            'y usar polling activo en vez de pausas fijas.',
            '',
            'Antes: v1.5plugin.5w',
        ],
    ],

];

// ============================================================
// Runner
// ============================================================
echo "=== Aplicador de cambios ===\n\n";
function detectar_eol(string $c): string { return (strpos($c, "\r\n") !== false) ? "\r\n" : "\n"; }
function normalizar_a_unix(string $c): string { return str_replace("\r\n", "\n", $c); }
function normalizar_a_original(string $c, string $e): string { if ($e === "\n") return $c; return str_replace("\n", "\r\n", $c); }
function contar_ocurrencias(string $c, string $b): int { if ($b === '') return 0; $n = 0; $o = 0; while (($p = strpos($c, $b, $o)) !== false) { $n++; $o = $p + strlen($b); } return $n; }
$creaciones = []; $eliminaciones = []; $reemplazos_por_archivo = [];
foreach ($cambios as $cambio) {
    $tipo = $cambio['tipo'] ?? 'reemplazar';
    if ($tipo === 'crear') { $creaciones[] = $cambio; continue; }
    if ($tipo === 'eliminar') { $eliminaciones[] = $cambio; continue; }
    if (!isset($cambio['archivo']) || !isset($cambio['buscar']) || !isset($cambio['reemplazar'])) { echo "[FALLO] Mal formado.\n"; exit(1); }
    $reemplazos_por_archivo[$cambio['archivo']][] = $cambio;
}
$total_reemplazos = 0;
foreach ($reemplazos_por_archivo as $lista) { $total_reemplazos += count($lista); }
echo "[INFO] $total_reemplazos reemplazo(s) en " . count($reemplazos_por_archivo) . " archivo(s), " . count($creaciones) . " a crear.\n\n";
$archivos_a_escribir = []; $bloques_ok = 0; $bloques_fallidos = [];
foreach ($reemplazos_por_archivo as $archivo_rel => $lista_cambios) {
    $ruta_abs = $raiz_proyecto . '/' . $archivo_rel;
    if (!file_exists($ruta_abs)) { $bloques_fallidos[] = "No encontrado: $archivo_rel"; foreach ($lista_cambios as $c) $bloques_fallidos[] = "  - {$c['descripcion']}"; continue; }
    $contenido_original = file_get_contents($ruta_abs);
    $eol = detectar_eol($contenido_original);
    $contenido = normalizar_a_unix($contenido_original);
    $contenido_antes = $contenido;
    $hubo_error = false;
    foreach ($lista_cambios as $cambio) {
        $buscar_str = implode("\n", $cambio['buscar']);
        $reemplazar_str = implode("\n", $cambio['reemplazar']);
        $ocurrencias = contar_ocurrencias($contenido, $buscar_str);
        if ($ocurrencias === 0) { $bloques_fallidos[] = "$archivo_rel: NO ENCONTRADO - {$cambio['descripcion']}"; $hubo_error = true; continue; }
        if ($ocurrencias > 1) { $bloques_fallidos[] = "$archivo_rel: AMBIGUO ($ocurrencias) - {$cambio['descripcion']}"; $hubo_error = true; continue; }
        $contenido = str_replace($buscar_str, $reemplazar_str, $contenido);
        $bloques_ok++;
    }
    if (!$hubo_error && $contenido !== $contenido_antes) $archivos_a_escribir[$ruta_abs] = normalizar_a_original($contenido, $eol);
}
if ($modo_estricto && !empty($bloques_fallidos)) { echo "=== ABORTADO ===\n"; foreach ($bloques_fallidos as $f) echo "  [FALLO] $f\n"; exit(1); }
foreach ($archivos_a_escribir as $ruta_abs => $contenido_final) {
    if (file_put_contents($ruta_abs, $contenido_final) === false) { echo "[FALLO] Escribir: " . substr($ruta_abs, strlen($raiz_proyecto)+1) . "\n"; continue; }
    echo "[OK] " . substr($ruta_abs, strlen($raiz_proyecto)+1) . "\n";
}
foreach ($creaciones as $c) { $r = $raiz_proyecto.'/'.$c['archivo']; if (!is_dir(dirname($r))) mkdir(dirname($r), 0777, true); if (file_put_contents($r, implode("\n", $c['contenido']))===false){echo "[FALLO] Crear: {$c['archivo']}\n";continue;} echo "[OK] {$c['archivo']} (creado)\n"; }
echo "\n=== Resumen ===\nBloques aplicados: $bloques_ok\nArchivos nuevos:   " . count($creaciones) . "\n";
if (!empty($bloques_fallidos)) { echo "Fallos: " . count($bloques_fallidos) . "\n"; foreach ($bloques_fallidos as $f) echo "  - $f\n"; }
echo "\nListo.\n";