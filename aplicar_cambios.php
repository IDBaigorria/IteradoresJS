<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda v1.5plugin.4g — refrescar asientos sin inline script.
 *
 * Problema: el intento de inyectar un `<script>` inline para
 * actualizar el croquis en el page context chocaba con el CSP de la
 * pagina: "Executing inline script violates the following Content
 * Security Policy directive". El navegador bloquea el script.
 *
 * Fix: usar `chrome.scripting.executeScript` con `world: "MAIN"`
 * desde el service worker. Chrome ejecuta la funcion en el page
 * context, sin pasar por el DOM y sin tocar el CSP.
 *
 * Requiere agregar el permiso `scripting` al manifest.
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
    // manifest.json: agregar permiso scripting
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'manifest.json',
        'descripcion' => 'manifest.json: agregar permiso scripting',
        'buscar' => [
            '  "permissions": ["tabs", "activeTab"],',
        ],
        'reemplazar' => [
            '  "permissions": ["tabs", "activeTab", "scripting"],',
        ],
    ],

    // ============================================================
    // Aplicacion/servicio.js: bump + refrescar_asientos_pagina
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: bump a 1.5plugin.4g',
        'buscar' => [
            ' * @version 1.5plugin.4f',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4g',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: helper _refresh_asientos_main_world',
        'buscar' => [
            'function _crear_ctx(pestana_id) {',
        ],
        'reemplazar' => [
            '// Funcion que se ejecuta en el page context (main world) via',
            '// `chrome.scripting.executeScript`. Tiene que ser autocontenida:',
            '// no puede referenciar variables del service worker. Lee y',
            '// escribe los globales del page (window.viaje_seleccionado,',
            '// window.estados_asientos_actuales, etc.).',
            'function _refresh_asientos_main_world() {',
            '    return (async function () {',
            '        try {',
            '            if (!window.viaje_seleccionado || !window.micro_seleccionado) {',
            '                return { exito: false, error: "sin viaje o micro abierto" };',
            '            }',
            '            const viaje = window.viaje_seleccionado;',
            '            const micro = window.micro_seleccionado;',
            '            const resp = await fetch("index.php", {',
            '                method: "POST",',
            '                headers: { "Content-Type": "application/x-www-form-urlencoded" },',
            '                body: new URLSearchParams({',
            '                    accion: "viajes/estado_asientos",',
            '                    nombre_viaje: viaje.nombre_viaje,',
            '                    nombre_micro: micro,',
            '                    nombre_dueno: viaje.dueno',
            '                })',
            '            });',
            '            const datos = await resp.json();',
            '            if (datos.exito && Array.isArray(datos.asientos)) {',
            '                window.estados_asientos_actuales = datos.asientos;',
            '                if (typeof window.actualizar_colores_asientos === "function") {',
            '                    window.actualizar_colores_asientos(datos.asientos);',
            '                }',
            '                if (typeof window.refrescar_info_asientos_propios === "function") {',
            '                    window.refrescar_info_asientos_propios(true);',
            '                }',
            '                return { exito: true };',
            '            }',
            '            return { exito: false, error: "respuesta inesperada" };',
            '        } catch (e) {',
            '            return { exito: false, error: String(e) };',
            '        }',
            '    })();',
            '}',
            '',
            'function _crear_ctx(pestana_id) {',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: ctx.refrescar_asientos_pagina',
        'buscar' => [
            '        pedir_post: (url, body) => enviar("pedir_post", { url, body }),',
        ],
        'reemplazar' => [
            '        pedir_post: (url, body) => enviar("pedir_post", { url, body }),',
            '        refrescar_asientos_pagina: async () => {',
            '            try {',
            '                const r = await chrome.scripting.executeScript({',
            '                    target: { tabId: pestana_id },',
            '                    world: "MAIN",',
            '                    func: _refresh_asientos_main_world',
            '                });',
            '                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };',
            '            } catch (e) {',
            '                return { exito: false, error: e.message };',
            '            }',
            '        },',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: handler refrescar_asientos_pagina por si llega por mensaje',
        'buscar' => [
            '                case "listar_corridas":',
            '                    const corridas = await listar_ultimas_corridas(mensaje.limite || 20);',
            '                    sendResponse({ exito: true, corridas });',
            '                    break;',
        ],
        'reemplazar' => [
            '                case "listar_corridas":',
            '                    const corridas = await listar_ultimas_corridas(mensaje.limite || 20);',
            '                    sendResponse({ exito: true, corridas });',
            '                    break;',
            '',
            '                case "refrescar_asientos_pagina": {',
            '                    const pestana = await _obtener_pestana_piloto();',
            '                    if (!pestana) { sendResponse({ exito: false, error: "no hay pestaña del piloto" }); break; }',
            '                    try {',
            '                        const r = await chrome.scripting.executeScript({',
            '                            target: { tabId: pestana.id },',
            '                            world: "MAIN",',
            '                            func: _refresh_asientos_main_world',
            '                        });',
            '                        sendResponse((r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" });',
            '                    } catch (e) {',
            '                        sendResponse({ exito: false, error: e.message });',
            '                    }',
            '                    break;',
            '                }',
        ],
    ],

    // ============================================================
    // Aplicacion/contenido.js: sacar el helper inline y el caso
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'contenido.js: bump a 1.5plugin.4g',
        'buscar' => [
            ' * @version 1.5plugin.4f',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4g',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'contenido.js: quitar el helper de inyeccion inline',
        'buscar' => [
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
        ],
        'reemplazar' => [
            '    async function _manejar(tipo, datos) {',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'contenido.js: quitar el caso refrescar_asientos_pagina',
        'buscar' => [
            '            case "refrescar_asientos_pagina":',
            '                return await _refrescar_asientos_pagina();',
            '',
            '            default:',
        ],
        'reemplazar' => [
            '            default:',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/_helpers.js: usar ctx.refrescar_asientos_pagina
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: bump a 1.5plugin.4g',
        'buscar' => [
            ' * @version 1.5plugin.4f',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4g',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: cancelar_venta usa ctx.refrescar_asientos_pagina',
        'buscar' => [
            '    // Refrescar el croquis del page para que no quede congelado',
            '    // mostrando el asiento como vendido. Es no bloqueante: si',
            '    // falla, la venta ya esta cancelada, solo se ve el croquis',
            '    // viejo hasta el proximo polling.',
            '    const rf = await ctx.enviar("refrescar_asientos_pagina", {});',
            '    if (!rf || !rf.exito) {',
            '        console.warn("No se pudo refrescar el croquis tras cancelar:", rf && rf.error ? rf.error : "(sin detalle)");',
            '    }',
            '    return r.json;',
        ],
        'reemplazar' => [
            '    // Refrescar el croquis del page para que no quede congelado',
            '    // mostrando el asiento como vendido. Es no bloqueante: si',
            '    // falla, la venta ya esta cancelada, solo se ve el croquis',
            '    // viejo hasta el proximo polling.',
            '    const rf = await ctx.refrescar_asientos_pagina();',
            '    if (!rf || !rf.exito) {',
            '        console.warn("No se pudo refrescar el croquis tras cancelar:", rf && rf.error ? rf.error : "(sin detalle)");',
            '    }',
            '    return r.json;',
        ],
    ],

    // ============================================================
    // Bumps varios
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: bump a 1.5plugin.4g',
        'buscar' => [
            ' * @version 1.5plugin.4f',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4g',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_APP a 1.5plugin.4g',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.4f";',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.4g";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_PLUGIN a 1.5plugin.4g',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4f";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4g";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo.js: bump a 1.5plugin.4g',
        'buscar' => [
            ' * @version 1.5plugin.4f',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4g',
        ],
    ],

    // ============================================================
    // prompts/prompt_plugin_piloto.md
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: bump a v1.5plugin.4g',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.4f (no',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.4g (cambio',
            'de técnica para refrescar el croquis: el `<script>` inline',
            'chocaba con el CSP de la página. Ahora se usa',
            '`chrome.scripting.executeScript` con `world: "MAIN"` desde',
            'el service worker, que no pasa por el DOM y no lo bloquea',
            'el CSP. Requiere el permiso `scripting` en el manifest).',
            'Antes: v1.5plugin.4f (no',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: leccion sobre CSP',
        'buscar' => [
            '- **Para refrescar el croquis tras una cancelación, inyectar un',
            '  `<script>` en el page context.** El content script no puede',
            '  tocar las variables globales del page (`estados_asientos_actuales`,',
            '  `viaje_seleccionado`, etc.) por el aislamiento de mundos.',
            '  La forma más simple sin tocar el manifest es inyectar un',
            '  `<script>` en el DOM que corre en el page context, hace el',
            '  fetch y actualiza las variables y el croquis.',
        ],
        'reemplazar' => [
            '- **Para ejecutar código en el page context, usar',
            '  `chrome.scripting.executeScript` con `world: "MAIN"`.**',
            '  El content script no puede tocar las variables globales',
            '  del page por el aislamiento de mundos. La opción de',
            '  inyectar un `<script>` inline en el DOM falla si la página',
            '  tiene CSP (bug en v1.5plugin.4f: "Executing inline script',
            '  violates the following Content Security Policy directive").',
            '  Fix en v1.5plugin.4g: `chrome.scripting.executeScript` con',
            '  `world: "MAIN"` desde el service worker, que no pasa por',
            '  el DOM. Requiere el permiso `scripting` en el manifest.',
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