<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda v1.5plugin.4k — crear pasajero de prueba sin nombre de dueño fijo.
 *
 * Problema: `NOMBRE_DUENO_PRUEBA = "carmen1"` estaba mal: es el codigo
 * de acceso, no el nombre de usuario del dueño. El backend devolvia
 * "Dueno no encontrado" al crear el pasajero de prueba. El nombre de
 * usuario del dueño lo conoce el page (esta en `window.usuario_actual.dueno`
 * despues del login de terminal).
 *
 * Fix: crear el pasajero de prueba via `chrome.scripting.executeScript`
 * en MAIN world. El page resuelve el dueño y hace el POST.
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
    // Aplicacion/servicio.js — nuevo ctx.crear_pasajero_de_prueba
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: bump a 1.5plugin.4k',
        'buscar' => [
            ' * @version 1.5plugin.4j',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4k',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'servicio.js: ctx.crear_pasajero_de_prueba via MAIN world',
        'buscar' => [
            '        liberar_asientos_propios: async () => {',
        ],
        'reemplazar' => [
            '        crear_pasajero_de_prueba: async (datos) => {',
            '            // Crea un pasajero de prueba. El dueño lo resuelve el',
            '            // page (`window.usuario_actual.dueno` para terminal).',
            '            // Necesario porque el plugin no conoce el nombre de',
            '            // usuario del dueño de las terminales de prueba.',
            '            try {',
            '                const r = await chrome.scripting.executeScript({',
            '                    target: { tabId: pestana_id },',
            '                    world: "MAIN",',
            '                    func: (args) => {',
            '                        return (async () => {',
            '                            try {',
            '                                const usuario = window.usuario_actual;',
            '                                if (!usuario) return { exito: false, error: "sin usuario_actual en el page" };',
            '                                const dueno = usuario.dueno || usuario.nombre_usuario;',
            '                                if (!dueno) return { exito: false, error: "sin dueno en el usuario del page" };',
            '                                const body = Object.assign({}, args, {',
            '                                    accion: "pasajeros/crear",',
            '                                    nombre_dueno: dueno',
            '                                });',
            '                                const resp = await fetch("index.php", {',
            '                                    method: "POST",',
            '                                    headers: { "Content-Type": "application/x-www-form-urlencoded" },',
            '                                    body: new URLSearchParams(body)',
            '                                });',
            '                                const datos = await resp.json();',
            '                                return datos;',
            '                            } catch (e) {',
            '                                return { exito: false, error: String(e) };',
            '                            }',
            '                        })();',
            '                    },',
            '                    args: [datos]',
            '                });',
            '                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };',
            '            } catch (e) {',
            '                return { exito: false, error: e.message };',
            '            }',
            '        },',
            '        liberar_asientos_propios: async () => {',
        ],
    ],

    // ============================================================
    // Aplicacion/pruebas/_helpers.js
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: bump a 1.5plugin.4k',
        'buscar' => [
            ' * @version 1.5plugin.4j',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4k',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: quitar import de NOMBRE_DUENO_PRUEBA',
        'buscar' => [
            'import { CODIGO_TERMINAL1, NOMBRE_DUENO_PRUEBA } from "../ConfPlugin.js";',
        ],
        'reemplazar' => [
            'import { CODIGO_TERMINAL1 } from "../ConfPlugin.js";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_helpers.js',
        'descripcion' => '_helpers.js: crear_pasajero_de_prueba usa ctx',
        'buscar' => [
            'export async function crear_pasajero_de_prueba(ctx, dni, datos = {}) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "pasajeros/crear",',
            '        nombre_dueno: NOMBRE_DUENO_PRUEBA,',
            '        dni,',
            '        apellido: datos.apellido || "Correccion",',
            '        nombres: datos.nombres || "Auto",',
            '        email: datos.email || "",',
            '        celular: datos.celular || "2983555123",',
            '        celular_emergencia: datos.celular_emergencia || "2983555222",',
            '        fecha_nacimiento: datos.fecha_nacimiento || "1990-06-15",',
            '        direccion: datos.direccion || "Calle Correccion 1",',
            '        localidad: datos.localidad || "Tres Arroyos"',
            '    });',
            '    if (!r || !r.exito) throw new Error("Error de red al crear pasajero: " + (r && r.error ? r.error : ""));',
            '    if (!r.json || !r.json.exito) {',
            '        const msg = r.json && r.json.error ? r.json.error : "";',
            '        if (!/ya existe/i.test(msg)) {',
            '            throw new Error("No se pudo crear el pasajero: " + msg);',
            '        }',
            '    }',
            '    return r.json;',
            '}',
        ],
        'reemplazar' => [
            'export async function crear_pasajero_de_prueba(ctx, dni, datos = {}) {',
            '    // El dueño lo resuelve el page (`window.usuario_actual.dueno`',
            '    // para terminal). El plugin no conoce el nombre de usuario',
            '    // del dueño de las terminales de prueba.',
            '    const datos_envio = {',
            '        dni,',
            '        apellido: datos.apellido || "Correccion",',
            '        nombres: datos.nombres || "Auto",',
            '        email: datos.email || "",',
            '        celular: datos.celular || "2983555123",',
            '        celular_emergencia: datos.celular_emergencia || "2983555222",',
            '        fecha_nacimiento: datos.fecha_nacimiento || "1990-06-15",',
            '        direccion: datos.direccion || "Calle Correccion 1",',
            '        localidad: datos.localidad || "Tres Arroyos"',
            '    };',
            '    const r = await ctx.crear_pasajero_de_prueba(datos_envio);',
            '    if (!r) throw new Error("Sin respuesta al crear pasajero");',
            '    if (!r.exito) {',
            '        const msg = r.error || "";',
            '        if (!/ya existe/i.test(msg)) {',
            '            throw new Error("No se pudo crear el pasajero: " + msg);',
            '        }',
            '    }',
            '    return r;',
            '}',
        ],
    ],

    // ============================================================
    // Aplicacion/ConfPlugin.js — quitar NOMBRE_DUENO_PRUEBA
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: bump a 1.5plugin.4k',
        'buscar' => [
            ' * @version 1.5plugin.4j',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4k',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: eliminar NOMBRE_DUENO_PRUEBA',
        'buscar' => [
            '// Nombre de usuario del dueno de las terminales de prueba.',
            '// Se usa para crear pasajeros de prueba antes de las ventas.',
            '// Si el nombre de usuario del dueno es distinto del codigo,',
            '// cambiá este valor.',
            'export const NOMBRE_DUENO_PRUEBA = "carmen1";',
        ],
        'reemplazar' => [
            '// El nombre de usuario del dueño de las terminales de prueba',
            '// no se conoce de antemano. Para crear pasajeros de prueba se',
            '// resuelve desde el page (`window.usuario_actual.dueno`), ver',
            '// `ctx.crear_pasajero_de_prueba` en `servicio.js`.',
        ],
    ],

    // ============================================================
    // Bumps varios
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_APP a 1.5plugin.4k',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.4j";',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.4k";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'ConfPlugin.js: VERSION_PLUGIN a 1.5plugin.4k',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4j";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.4k";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/contenido.js',
        'descripcion' => 'contenido.js: bump a 1.5plugin.4k',
        'buscar' => [
            ' * @version 1.5plugin.4j',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4k',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo.js: bump a 1.5plugin.4k',
        'buscar' => [
            ' * @version 1.5plugin.4j',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4k',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_04_venta_cuotas.js',
        'descripcion' => 'prueba_04: bump a 1.5plugin.4k',
        'buscar' => [
            ' * @version 1.5plugin.4j',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4k',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_08_venta_ligadura_dni_igual.js',
        'descripcion' => 'prueba_08: bump a 1.5plugin.4k',
        'buscar' => [
            ' * @version 1.5plugin.4j',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4k',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_09_venta_comprador_lleno_pasajero_vacio.js',
        'descripcion' => 'prueba_09: bump a 1.5plugin.4k',
        'buscar' => [
            ' * @version 1.5plugin.4j',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4k',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_10_venta_dni_duplicado.js',
        'descripcion' => 'prueba_10: bump a 1.5plugin.4k',
        'buscar' => [
            ' * @version 1.5plugin.4j',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4k',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_11_venta_correccion_dni_pasajero.js',
        'descripcion' => 'prueba_11: bump a 1.5plugin.4k',
        'buscar' => [
            ' * @version 1.5plugin.4j',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4k',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_12_venta_correccion_dni_comprador.js',
        'descripcion' => 'prueba_12: bump a 1.5plugin.4k',
        'buscar' => [
            ' * @version 1.5plugin.4j',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4k',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_13_venta_monto_mayor_total.js',
        'descripcion' => 'prueba_13: bump a 1.5plugin.4k',
        'buscar' => [
            ' * @version 1.5plugin.4j',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4k',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_14_venta_monto_cero.js',
        'descripcion' => 'prueba_14: bump a 1.5plugin.4k',
        'buscar' => [
            ' * @version 1.5plugin.4j',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4k',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_15_venta_sin_comprador.js',
        'descripcion' => 'prueba_15: bump a 1.5plugin.4k',
        'buscar' => [
            ' * @version 1.5plugin.4j',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4k',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_16_venta_cancelar_reabrir.js',
        'descripcion' => 'prueba_16: bump a 1.5plugin.4k',
        'buscar' => [
            ' * @version 1.5plugin.4j',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.4k',
        ],
    ],

    // ============================================================
    // prompts/prompt_plugin_piloto.md
    // ============================================================

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: bump a v1.5plugin.4k',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.4j (limpieza',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.4k (crear',
            'pasajero de prueba sin nombre de dueño fijo:',
            '`NOMBRE_DUENO_PRUEBA = "carmen1"` estaba mal, era el código',
            'de acceso, no el nombre de usuario. El backend devolvía',
            '"Dueño no encontrado". Ahora el dueño lo resuelve el page',
            '(`window.usuario_actual.dueno`) vía `chrome.scripting.executeScript`',
            'en MAIN world. Se eliminó `NOMBRE_DUENO_PRUEBA` de',
            '`ConfPlugin.js`).',
            'Antes: v1.5plugin.4j (limpieza',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'prompt plugin: leccion sobre no adivinar datos',
        'buscar' => [
            '- **Las pruebas que cancelan el formulario de venta deben',
        ],
        'reemplazar' => [
            '- **No adivinar nombres de usuario ni datos del entorno.** El',
            '  plugin no conoce el nombre de usuario del dueño de las',
            '  terminales de prueba. Lo que el usuario pasa son los',
            '  **códigos de acceso**, no los nombres de usuario. Si un',
            '  helper necesita un dato del page, pedirlo desde el page',
            '  (`window.usuario_actual`, `window.viaje_seleccionado`,',
            '  etc.) vía `chrome.scripting.executeScript` en MAIN world,',
            '  no hardcodearlo en `ConfPlugin.js`. Bug en v1.5plugin.4j:',
            '  `NOMBRE_DUENO_PRUEBA = "carmen1"` (código de acceso, no',
            '  nombre de usuario). Fix en v1.5plugin.4k.',
            '- **Las pruebas que cancelan el formulario de venta deben',
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