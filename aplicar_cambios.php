<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda v1.5plugin.4f — id de venta sin navegar + refresh del croquis.
 *
 * Problema: el helper `obtener_id_ultima_venta` navegaba a la pestaña
 * Vendidos para leer el id. Eso llamaba a `ocultar_detalle_viaje`,
 * que mataba el polling del croquis. El modal del viaje quedaba
 * abierto con el croquis congelado, y después de cancelar la venta
 * el croquis no se actualizaba (bug de UX del piloto, mitigado por
 * v1.5piloto.74f).
 *
 * Fix:
 * - `obtener_id_ultima_venta` ahora pide el id por POST desde el
 *   content script (accion `ventas/listar` tipo terminal) sin
 *   cambiar de pestaña.
 * - `cancelar_venta` ahora dispara un mensaje `refrescar_asientos_pagina`
 *   que inyecta un script en el page context para actualizar
 *   `estados_asientos_actuales` y los colores del croquis.
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
    // Aplicacion/contenido.js
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'contenido.js: bump a 1.5plugin.4f',
        'buscar' => [
            ' * @version 1.5plugin.4e',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4f',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'contenido.js: helper _refrescar_asientos_pagina',
        'buscar' => [
            '    async function _manejar(tipo, datos) {',
            '        switch (tipo) {',
        ],
        'reemplazar' => [
            '    // Refresca el croquis del page context tras una cancelacion.',
            '    // No se puede tocar `window.viaje_seleccionado` ni',
            '    // `window.estados_asientos_actuales` desde el content script',
            '    // (estan aislados). Se inyecta un `<script>` en el DOM que',
            '    // corre en el page context, hace el fetch y actualiza las',
            '    // variables globales y el croquis.',
            '    function _refrescar_asientos_pagina() {',
            '        return new Promise((resolve) => {',
            '            const id_evento = "refrescar_asientos_" + Date.now() + "_" + Math.random().toString(36).slice(2);',
            '            const codigo = `(async function() {',
            '                try {',
            '                    if (!window.viaje_seleccionado || !window.micro_seleccionado) {',
            '                        window.dispatchEvent(new CustomEvent("${id_evento}_err", { detail: "sin viaje o micro abierto" }));',
            '                        return;',
            '                    }',
            '                    const viaje = window.viaje_seleccionado;',
            '                    const micro = window.micro_seleccionado;',
            '                    const resp = await fetch("index.php", {',
            '                        method: "POST",',
            '                        headers: { "Content-Type": "application/x-www-form-urlencoded" },',
            '                        body: new URLSearchParams({',
            '                            accion: "viajes/estado_asientos",',
            '                            nombre_viaje: viaje.nombre_viaje,',
            '                            nombre_micro: micro,',
            '                            nombre_dueno: viaje.dueno',
            '                        })',
            '                    });',
            '                    const datos = await resp.json();',
            '                    if (datos.exito && Array.isArray(datos.asientos)) {',
            '                        estados_asientos_actuales = datos.asientos;',
            '                        actualizar_colores_asientos(datos.asientos);',
            '                        if (typeof refrescar_info_asientos_propios === "function") {',
            '                            refrescar_info_asientos_propios(true);',
            '                        }',
            '                        window.dispatchEvent(new CustomEvent("${id_evento}_ok"));',
            '                    } else {',
            '                        window.dispatchEvent(new CustomEvent("${id_evento}_err", { detail: "respuesta inesperada" }));',
            '                    }',
            '                } catch (e) {',
            '                    window.dispatchEvent(new CustomEvent("${id_evento}_err", { detail: String(e) }));',
            '                }',
            '            })();`;',
            '',
            '            const script = document.createElement("script");',
            '            script.textContent = codigo;',
            '            document.documentElement.appendChild(script);',
            '            script.remove();',
            '',
            '            let resuelto = false;',
            '            const on_ok = () => { if (resuelto) return; resuelto = true; cleanup(); resolve({ exito: true }); };',
            '            const on_err = (e) => { if (resuelto) return; resuelto = true; cleanup(); resolve({ exito: false, error: (e && e.detail) || "error" }); };',
            '            function cleanup() {',
            '                window.removeEventListener(id_evento + "_ok", on_ok);',
            '                window.removeEventListener(id_evento + "_err", on_err);',
            '            }',
            '            window.addEventListener(id_evento + "_ok", on_ok);',
            '            window.addEventListener(id_evento + "_err", on_err);',
            '',
            '            setTimeout(() => { if (resuelto) return; resuelto = true; cleanup(); resolve({ exito: false, error: "timeout" }); }, 8000);',
            '        });',
            '    }',
            '',
            '    async function _manejar(tipo, datos) {',
            '        switch (tipo) {',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'contenido.js: casos obtener_id_ultima_venta_terminal y refrescar_asientos_pagina',
        'buscar' => [
            '            case "pedir_post": {',
            '                try {',
            '                    const resp = await fetch(datos.url, {',
            '                        method: "POST",',
            '                        headers: { "Content-Type": "application/x-www-form-urlencoded" },',
            '                        body: new URLSearchParams(datos.body || {}).toString(),',
            '                        credentials: "same-origin"',
            '                    });',
            '                    const texto = await resp.text();',
            '                    let json = null;',
            '                    try { json = JSON.parse(texto); } catch (e) { /* no era JSON */ }',
            '                    return { exito: true, status: resp.status, texto, json };',
            '                } catch (e) {',
            '                    return { exito: false, error: e.message };',
            '                }',
            '            }',
            '',
            '            default:',
        ],
        'reemplazar' => [
            '            case "pedir_post": {',
            '                try {',
            '                    const resp = await fetch(datos.url, {',
            '                        method: "POST",',
            '                        headers: { "Content-Type": "application/x-www-form-urlencoded" },',
            '                        body: new URLSearchParams(datos.body || {}).toString(),',
            '                        credentials: "same-origin"',
            '                    });',
            '                    const texto = await resp.text();',
            '                    let json = null;',
            '                    try { json = JSON.parse(texto); } catch (e) { /* no era JSON */ }',
            '                    return { exito: true, status: resp.status, texto, json };',
            '                } catch (e) {',
            '                    return { exito: false, error: e.message };',
            '                }',
            '            }',
            '',
            '            case "obtener_id_ultima_venta_terminal": {',
            '                const el_nombre = document.getElementById("nombre_usuario_actual");',
            '                const nombre = el_nombre ? el_nombre.textContent.trim() : "";',
            '                if (!nombre) return { exito: false, error: "sin usuario logueado" };',
            '                try {',
            '                    const resp = await fetch("index.php", {',
            '                        method: "POST",',
            '                        headers: { "Content-Type": "application/x-www-form-urlencoded" },',
            '                        body: new URLSearchParams({ accion: "ventas/listar", tipo: "terminal", nombre })',
            '                    });',
            '                    const datos_v = await resp.json();',
            '                    if (!datos_v.exito) return { exito: false, error: datos_v.error || "error al listar ventas" };',
            '                    const ventas = Array.isArray(datos_v.ventas) ? datos_v.ventas : [];',
            '                    if (ventas.length === 0) return { exito: false, error: "no hay ventas para la terminal" };',
            '                    return { exito: true, id_venta: ventas[0].id_venta };',
            '                } catch (e) {',
            '                    return { exito: false, error: e.message };',
            '                }',
            '            }',
            '',
            '            case "refrescar_asientos_pagina":',
            '                return await _refrescar_asientos_pagina();',
            '',
            '            default:',
        ],
    ],

    // ============================================================
    // Aplicacion/servicio.js
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: bump a 1.5plugin.4f',
        'buscar' => [
            ' * @version 1.5plugin.4e',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4f',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/_helpers.js
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: bump a 1.5plugin.4f',
        'buscar' => [
            ' * @version 1.5plugin.4e',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4f',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: obtener_id_ultima_venta sin navegar',
        'buscar' => [
            'export async function obtener_id_ultima_venta(ctx) {',
            '    const visible = await ctx.esta_visible("#opciones_impresion");',
            '    if (visible) {',
            '        await ctx.clic("#btn_cerrar_opciones");',
            '        await ctx.pausa(300);',
            '    }',
            '    await ir_a_tab(ctx, "vendidos");',
            '    const hay = await ctx.esperar(".sale-card", 8000);',
            '    if (!hay || !hay.exito) throw new Error("No hay ventas en la pestana Vendidos");',
            '    const ids = await ctx.obtener_atributos(".sale-card", "data-id-venta");',
            '    if (ids.length === 0) throw new Error("No se pudo leer el id de la venta");',
            '    return ids[0];',
            '}',
        ],
        'reemplazar' => [
            'export async function obtener_id_ultima_venta(ctx) {',
            '    // Cerrar el panel de "Venta exitosa" si esta abierto.',
            '    const visible = await ctx.esta_visible("#opciones_impresion");',
            '    if (visible) {',
            '        await ctx.clic("#btn_cerrar_opciones");',
            '        await ctx.pausa(300);',
            '    }',
            '    // Pedir al backend el id de la ultima venta de la terminal.',
            '    // Antes navegabamos a la pestaña Vendidos, pero eso cerraba',
            '    // el modal del viaje y mataba el polling del croquis,',
            '    // dejandolo congelado tras la cancelacion.',
            '    const r = await ctx.enviar("obtener_id_ultima_venta_terminal", {});',
            '    if (!r || !r.exito) {',
            '        throw new Error("No se pudo obtener el id de la ultima venta: " + (r && r.error ? r.error : "(sin detalle)"));',
            '    }',
            '    return r.id_venta;',
            '}',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: cancelar_venta refresca el croquis',
        'buscar' => [
            'export async function cancelar_venta(ctx, id_venta, motivo = "Cancelada por prueba automatica") {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "ventas/cancelar",',
            '        id_venta,',
            '        motivo',
            '    });',
            '    if (!r || !r.exito) {',
            '        throw new Error("Error de red al cancelar: " + (r && r.error ? r.error : "(sin detalle)"));',
            '    }',
            '    if (!r.json || !r.json.exito) {',
            '        throw new Error("No se pudo cancelar: " + (r.json && r.json.error ? r.json.error : "(sin detalle)"));',
            '    }',
            '    return r.json;',
            '}',
        ],
        'reemplazar' => [
            'export async function cancelar_venta(ctx, id_venta, motivo = "Cancelada por prueba automatica") {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "ventas/cancelar",',
            '        id_venta,',
            '        motivo',
            '    });',
            '    if (!r || !r.exito) {',
            '        throw new Error("Error de red al cancelar: " + (r && r.error ? r.error : "(sin detalle)"));',
            '    }',
            '    if (!r.json || !r.json.exito) {',
            '        throw new Error("No se pudo cancelar: " + (r.json && r.json.error ? r.json.error : "(sin detalle)"));',
            '    }',
            '    // Refrescar el croquis del page para que no quede congelado',
            '    // mostrando el asiento como vendido. Es no bloqueante: si',
            '    // falla, la venta ya esta cancelada, solo se ve el croquis',
            '    // viejo hasta el proximo polling.',
            '    const rf = await ctx.enviar("refrescar_asientos_pagina", {});',
            '    if (!rf || !rf.exito) {',
            '        console.warn("No se pudo refrescar el croquis tras cancelar:", rf && rf.error ? rf.error : "(sin detalle)");',
            '    }',
            '    return r.json;',
            '}',
        ],
    ],

    // ============================================================
    // Bumps varios
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: bump a 1.5plugin.4f',
        'buscar' => [
            ' * @version 1.5plugin.4e',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4f',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_APP a 1.5plugin.4f',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.4e";',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.4f";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_PLUGIN a 1.5plugin.4f',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4e";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4f";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo.js: bump a 1.5plugin.4f',
        'buscar' => [
            ' * @version 1.5plugin.4e',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4f',
        ],
    ],

    // ============================================================
    // prompts/prompt_plugin_piloto.md
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: bump a v1.5plugin.4f',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.4e (reintento',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.4f (no',
            'navegar a la pestaña Vendidos desde el helper',
            '`obtener_id_ultima_venta`: ahora pide el id por POST. Antes',
            'navegar cerraba el modal del viaje y mataba el polling,',
            'dejando el croquis congelado tras cancelar. Además,',
            '`cancelar_venta` ahora dispara un mensaje',
            '`refrescar_asientos_pagina` que inyecta un script en el',
            'page context para actualizar los colores del croquis).',
            'Antes: v1.5plugin.4e (reintento',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: leccion sobre no navegar de pestaña',
        'buscar' => [
            '- **Cuando un clic puede perderse por condiciones de carrera**',
        ],
        'reemplazar' => [
            '- **No navegar de pestaña durante una prueba.** `activar_pestana`',
            '  en el piloto llama a `ocultar_detalle_viaje`, que cierra el',
            '  modal del viaje y mata el polling. Si una prueba necesita',
            '  leer datos de otra pestaña, mejor pedirlos por POST desde',
            '  el content script. Bug en v1.5plugin.4: el helper',
            '  `obtener_id_ultima_venta` navegaba a Vendidos y dejaba el',
            '  croquis congelado. Fix en v1.5plugin.4f: pedir el id por',
            '  POST.',
            '- **Para refrescar el croquis tras una cancelación, inyectar un',
            '  `<script>` en el page context.** El content script no puede',
            '  tocar las variables globales del page (`estados_asientos_actuales`,',
            '  `viaje_seleccionado`, etc.) por el aislamiento de mundos.',
            '  La forma más simple sin tocar el manifest es inyectar un',
            '  `<script>` en el DOM que corre en el page context, hace el',
            '  fetch y actualiza las variables y el croquis.',
            '- **Cuando un clic puede perderse por condiciones de carrera**',
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