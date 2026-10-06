<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda V1.5plugin.5v:
 *   - Prueba 54 extendida: ahora mide huérfanos del grafo de
 *     credenciales con el nuevo endpoint `grafo/resumen_credenciales`.
 *     Verifica que el ciclo de bloqueo no deja huérfanos (fix v75a).
 *   - Bump de versiones.
 *
 * Uso:
 *   php aplicar_cambios.php
 *
 * Correr parado en la raíz de iteradoresJS/.
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

    // ------------------------------------------------------------
    // ConfiguracionApli.js — bump
    // ------------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'ConfiguracionApli: bump a 5v',
        'todos' => true,
        'buscar' => ['1.5plugin.5u'],
        'reemplazar' => ['1.5plugin.5v'],
    ],

    // ------------------------------------------------------------
    // catalogo.js — bump
    // ------------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: bump @version a 5v',
        'buscar' => [' * @version 1.5plugin.5u'],
        'reemplazar' => [' * @version 1.5plugin.5v'],
    ],

    // ------------------------------------------------------------
    // Prueba 54 — agregar helper de conteo
    // ------------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_54_bloqueo_expirado_permite_login.js',
        'descripcion' => 'prueba_54: bump a 5v',
        'buscar' => [' * @version 1.5plugin.5u'],
        'reemplazar' => [' * @version 1.5plugin.5v'],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_54_bloqueo_expirado_permite_login.js',
        'descripcion' => 'prueba_54: agregar helper _contar_huerfanos_credenciales',
        'buscar' => [
            'import { CODIGO_ADMIN } from "../ConfiguracionApli.js";',
            'import { cerrar_modales_si_abiertos } from "./_helpers.js";',
            '',
            'export const prueba = {',
        ],
        'reemplazar' => [
            'import { CODIGO_ADMIN } from "../ConfiguracionApli.js";',
            'import { cerrar_modales_si_abiertos } from "./_helpers.js";',
            '',
            'async function _contar_huerfanos_credenciales(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen_credenciales",',
            '        nombre_solicitante',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo consultar grafo/resumen_credenciales: "',
            '            + (r && r.json && r.json.error ? r.json.error : "(sin detalle)"));',
            '    }',
            '    return r.json.resumen.huerfanos;',
            '}',
            '',
            'export const prueba = {',
        ],
    ],

    // ------------------------------------------------------------
    // Prueba 54 — H0 antes de crear el usuario
    // ------------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_54_bloqueo_expirado_permite_login.js',
        'descripcion' => 'prueba_54: H0 antes de crear usuario',
        'buscar' => [
            '        const nombre_prueba = "bloq" + sufijo;',
            '        const contrasena_correcta = "testpass1234";',
            '',
            '        // El alta de usuario puede disparar alert() con el',
            '        // código asignado. Activar modo prueba + override.',
            '        await ctx.sobrescribir_alertas();',
            '        await ctx.activar_modo_prueba();',
            '',
            '        try {',
            '            // 1. Crear usuario de prueba.',
            '            const r_crear = await ctx.pedir_post("index.php", {',
        ],
        'reemplazar' => [
            '        const nombre_prueba = "bloq" + sufijo;',
            '        const contrasena_correcta = "testpass1234";',
            '',
            '        // Medir huérfanos en credenciales antes de crear el',
            '        // usuario. La prueba verifica que el ciclo de bloqueo',
            '        // no deja nodos huérfanos (fix v75a de `bloqueado_hasta`).',
            '        const H0 = await _contar_huerfanos_credenciales(ctx, nombre_admin);',
            '',
            '        // El alta de usuario puede disparar alert() con el',
            '        // código asignado. Activar modo prueba + override.',
            '        await ctx.sobrescribir_alertas();',
            '        await ctx.activar_modo_prueba();',
            '',
            '        try {',
            '            // 1. Crear usuario de prueba.',
            '            const r_crear = await ctx.pedir_post("index.php", {',
        ],
    ],

    // ------------------------------------------------------------
    // Prueba 54 — H1 tras crear el usuario
    // ------------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_54_bloqueo_expirado_permite_login.js',
        'descripcion' => 'prueba_54: H1 tras crear usuario',
        'buscar' => [
            '                "No se pudo crear el usuario de prueba: "',
            '                + (r_crear && r_crear.json && r_crear.json.error ? r_crear.json.error : "(sin detalle)"));',
            '',
            '            // 2. Cinco intentos fallidos consecutivos.',
        ],
        'reemplazar' => [
            '                "No se pudo crear el usuario de prueba: "',
            '                + (r_crear && r_crear.json && r_crear.json.error ? r_crear.json.error : "(sin detalle)"));',
            '',
            '            const H1 = await _contar_huerfanos_credenciales(ctx, nombre_admin);',
            '            ctx.assert(H1 === H0,',
            '                "Crear un usuario dejó huérfanos en credenciales. H0=" + H0 + ", H1=" + H1);',
            '',
            '            // 2. Cinco intentos fallidos consecutivos.',
        ],
    ],

    // ------------------------------------------------------------
    // Prueba 54 — H2 tras los intentos fallidos
    // ------------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_54_bloqueo_expirado_permite_login.js',
        'descripcion' => 'prueba_54: H2 tras 5 intentos',
        'buscar' => [
            '            // 3. Con el bloqueo activo, el login correcto debe fallar.',
        ],
        'reemplazar' => [
            '            const H2 = await _contar_huerfanos_credenciales(ctx, nombre_admin);',
            '            ctx.assert(H2 === H0,',
            '                "Los 5 intentos fallidos dejaron huérfanos. H0=" + H0 + ", H2=" + H2);',
            '',
            '            // 3. Con el bloqueo activo, el login correcto debe fallar.',
        ],
    ],

    // ------------------------------------------------------------
    // Prueba 54 — H3 tras login exitoso
    // ------------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/prueba_54_bloqueo_expirado_permite_login.js',
        'descripcion' => 'prueba_54: H3 tras login OK (verifica fix v75a)',
        'buscar' => [
            '                "El login falló tras esperar el bloqueo: "',
            '                + (r_ok && r_ok.json && r_ok.json.error ? r_ok.json.error : "(sin detalle)"));',
            '',
            '        } finally {',
        ],
        'reemplazar' => [
            '                "El login falló tras esperar el bloqueo: "',
            '                + (r_ok && r_ok.json && r_ok.json.error ? r_ok.json.error : "(sin detalle)"));',
            '',
            '            // 6. Verificar que la hoja `bloqueado_hasta` se destruyó',
            '            //    (fix v75a). Sin el fix, quedaría huérfana y H3 > H0.',
            '            const H3 = await _contar_huerfanos_credenciales(ctx, nombre_admin);',
            '            ctx.assert(H3 === H0,',
            '                "El ciclo de bloqueo dejó huérfanos (la hoja `bloqueado_hasta` no se destruyó). "',
            '                + "H0=" + H0 + ", H3=" + H3);',
            '',
            '        } finally {',
        ],
    ],

    // ------------------------------------------------------------
    // prompt_plugin_piloto.md
    // ------------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: documentar endpoint resumen_credenciales',
        'buscar' => [
            '- `ctx.subir_archivo(accion, campos, archivo_info)` → sube un',
        ],
        'reemplazar' => [
            '- `ctx.subir_archivo(accion, campos, archivo_info)` → sube un',
            '  archivo por multipart al piloto. `archivo_info` es',
            '  `{nombre, tipo, contenido_base64, nombre_campo}`. El fetch lo',
            '  hace el content script (las cookies del piloto solo viajan',
            '  desde el origen del piloto).',
            '',
            '**Endpoint de diagnóstico:**',
            '- `grafo/resumen_credenciales` → mismo resumen que',
            '  `grafo/resumen` pero del grafo de credenciales. Solo en modo',
            '  pruebas. Requiere `nombre_solicitante` con nivel admin o',
            '  soporte. Se usa en `bloqueo_expirado_permite_login` para',
            '  verificar que el ciclo de bloqueo no deja huérfanos en',
            '  credenciales (fix v75a de `bloqueado_hasta`).',
            '',
            '- `ctx.subir_archivo(accion, campos, archivo_info)` → sube un',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: última actualización a 5v',
        'buscar' => ['**Última actualización de este prompt:** v1.5plugin.5s'],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.5v',
            '(prueba 54 extendida: mide huérfanos del grafo de',
            'credenciales con el endpoint `grafo/resumen_credenciales`',
            'del piloto. Verifica el fix v75a de `bloqueado_hasta`.).',
            'Antes: v1.5plugin.5s',
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
        $es_todos = !empty($cambio['todos']);

        $ocurrencias = contar_ocurrencias($contenido, $buscar_str);
        if ($ocurrencias === 0) {
            $bloques_fallidos[] = "$archivo_rel: bloque no encontrado - {$cambio['descripcion']}";
            $hubo_error = true; continue;
        }
        if (!$es_todos && $ocurrencias > 1) {
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