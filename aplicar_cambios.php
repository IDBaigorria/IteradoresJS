<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda V1.5plugin.5u (C2 — cobertura de fixes v75a):
 *   - Prueba 54: bloqueo de autenticación conmutable (2s en modo
 *     pruebas). Verifica el comportamiento del rate limiting.
 *   - Prueba 55: reemplazo de foto de vehículo (fix v75a de
 *     `foto`). Mide huérfanos con grafo/resumen.
 *   - El fix de `metodo_pago` del cupón queda como excepción
 *     justificada (no alcanzable desde la API pública).
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
    // ConfPlugin/ConfiguracionApli — bump a 5u
    // ------------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfiguracionApli.js',
        'descripcion' => 'ConfiguracionApli: @version y VERSION_APP a 5u',
        'todos' => true,
        'buscar' => ['1.5plugin.5t'],
        'reemplazar' => ['1.5plugin.5u'],
    ],

    // ------------------------------------------------------------
    // catalogo.js — imports + secciones
    // ------------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: bump @version a 5u',
        'buscar' => [' * @version 1.5plugin.5s'],
        'reemplazar' => [' * @version 1.5plugin.5u'],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: agregar imports de pruebas 54 y 55',
        'buscar' => [
            'import { prueba as dj_pasajero_eliminar } from "./prueba_53_dj_pasajero_eliminar.js";',
        ],
        'reemplazar' => [
            'import { prueba as dj_pasajero_eliminar } from "./prueba_53_dj_pasajero_eliminar.js";',
            'import { prueba as bloqueo_expirado_permite_login } from "./prueba_54_bloqueo_expirado_permite_login.js";',
            'import { prueba as subir_foto_reemplazo_limpia_nodos } from "./prueba_55_subir_foto_reemplazo_limpia_nodos.js";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: agregar sección autenticacion',
        'buscar' => [
            '    {',
            '        id: "empresas",',
        ],
        'reemplazar' => [
            '    {',
            '        id: "autenticacion",',
            '        nombre: "Autenticación",',
            '        pruebas: [',
            '            bloqueo_expirado_permite_login',
            '        ]',
            '    },',
            '    {',
            '        id: "empresas",',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: sumar prueba 55 a sección vehiculos',
        'buscar' => [
            '        pruebas: [',
            '            alta_vehiculo,',
            '            vehiculo_patente_vacia,',
            '            vehiculo_cancelar',
            '        ]',
            '    },',
            '    {',
            '        id: "declaraciones_juradas",',
        ],
        'reemplazar' => [
            '        pruebas: [',
            '            alta_vehiculo,',
            '            vehiculo_patente_vacia,',
            '            vehiculo_cancelar,',
            '            subir_foto_reemplazo_limpia_nodos',
            '        ]',
            '    },',
            '    {',
            '        id: "declaraciones_juradas",',
        ],
    ],

    // ------------------------------------------------------------
    // Prueba 54: bloqueo conmutable
    // ------------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_54_bloqueo_expirado_permite_login.js',
        'descripcion' => 'Prueba 54: bloqueo expira y permite login',
        'contenido' => [
            '/**',
            ' * Prueba: bloqueo por intentos fallidos y expiración.',
            ' *',
            ' * Verifica el rate limiting de autenticación con el tiempo',
            ' * de bloqueo conmutable (ConfiguracionApli::',
            ' * bloqueo_autenticacion_segundos() = 2s en modo pruebas).',
            ' *',
            ' * Flujo:',
            ' *   1. Crear un usuario de prueba con contraseña conocida.',
            ' *   2. Hacer 5 intentos fallidos consecutivos (llega al máximo).',
            ' *   3. Verificar que el login correcto falla (bloqueado).',
            ' *   4. Esperar 3s a que expire el bloqueo.',
            ' *   5. Verificar que el login correcto ahora pasa.',
            ' *   6. Limpiar: eliminar el usuario de prueba.',
            ' *',
            ' * No mide huérfanos: el fix de `bloqueado_hasta` vive en',
            ' * el grafo de credenciales, y `grafo/resumen` solo mide la',
            ' * app. La verificación de que la hoja se destruye queda',
            ' * pendiente (requiere endpoint de credenciales).',
            ' *',
            ' * @version 1.5plugin.5u',
            ' * @since 1.5plugin.5u',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfiguracionApli.js";',
            'import { cerrar_modales_si_abiertos } from "./_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "bloqueo_expirado_permite_login",',
            '    nombre: "Autenticación: bloqueo expira y permite login",',
            '    descripcion: "Verifica que tras N intentos fallidos el usuario queda bloqueado, y que tras el tiempo de bloqueo (2s en modo pruebas) puede loguearse de nuevo.",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '        await cerrar_modales_si_abiertos(ctx);',
            '',
            '        const r_nombre = await ctx.nombre_usuario_actual();',
            '        if (!r_nombre || !r_nombre.exito) {',
            '            throw new Error("No se pudo leer el nombre del admin");',
            '        }',
            '        const nombre_admin = r_nombre.nombre_usuario;',
            '',
            '        const sufijo = String(Date.now()).slice(-8);',
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
            '                accion: "administrador/agregar_usuario",',
            '                nombre_solicitante: nombre_admin,',
            '                nombre_usuario: nombre_prueba,',
            '                contrasena: contrasena_correcta,',
            '                nivel: "dueno",',
            '                nombre_real: "Prueba Bloqueo"',
            '            });',
            '            ctx.assert(r_crear && r_crear.exito && r_crear.json && r_crear.json.exito,',
            '                "No se pudo crear el usuario de prueba: "',
            '                + (r_crear && r_crear.json && r_crear.json.error ? r_crear.json.error : "(sin detalle)"));',
            '',
            '            // 2. Cinco intentos fallidos consecutivos.',
            '            const intentos_maximos = 5;',
            '            for (let i = 0; i < intentos_maximos; i++) {',
            '                const r = await ctx.pedir_post("index.php", {',
            '                    accion: "autenticar/verificar",',
            '                    usuario: nombre_prueba,',
            '                    contrasena: "mala_" + i + "_" + sufijo',
            '                });',
            '                ctx.assert(r && r.exito && r.json && r.json.exito === false,',
            '                    "El intento fallido " + (i + 1) + " no devolvió error.");',
            '            }',
            '',
            '            // 3. Con el bloqueo activo, el login correcto debe fallar.',
            '            const r_bloqueado = await ctx.pedir_post("index.php", {',
            '                accion: "autenticar/verificar",',
            '                usuario: nombre_prueba,',
            '                contrasena: contrasena_correcta',
            '            });',
            '            ctx.assert(r_bloqueado && r_bloqueado.exito && r_bloqueado.json && r_bloqueado.json.exito === false,',
            '                "El usuario bloqueado pudo loguearse: el rate limiting no funciona.");',
            '',
            '            // 4. Esperar a que expire el bloqueo (2s + margen).',
            '            await ctx.pausa(3000);',
            '',
            '            // 5. Ahora sí, el login correcto debe pasar.',
            '            const r_ok = await ctx.pedir_post("index.php", {',
            '                accion: "autenticar/verificar",',
            '                usuario: nombre_prueba,',
            '                contrasena: contrasena_correcta',
            '            });',
            '            ctx.assert(r_ok && r_ok.exito && r_ok.json && r_ok.json.exito === true,',
            '                "El login falló tras esperar el bloqueo: "',
            '                + (r_ok && r_ok.json && r_ok.json.error ? r_ok.json.error : "(sin detalle)"));',
            '',
            '        } finally {',
            '            // 6. Limpieza.',
            '            try {',
            '                await ctx.pedir_post("index.php", {',
            '                    accion: "administrador/eliminar_usuario",',
            '                    nombre_solicitante: nombre_admin,',
            '                    nombre_usuario: nombre_prueba',
            '                });',
            '            } catch (e) {',
            '                console.warn("No se pudo eliminar el usuario de prueba:", e);',
            '            }',
            '            await ctx.restaurar_alertas();',
            '            await ctx.desactivar_modo_prueba();',
            '        }',
            '    }',
            '};',
        ],
    ],

    // ------------------------------------------------------------
    // Prueba 55: reemplazo de foto de vehículo
    // ------------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_55_subir_foto_reemplazo_limpia_nodos.js',
        'descripcion' => 'Prueba 55: reemplazo de foto de vehículo',
        'contenido' => [
            '/**',
            ' * Prueba: subir foto a un vehículo y reemplazarla.',
            ' *',
            ' * Verifica el fix v75a: al subir una foto nueva a un',
            ' * vehículo que ya tenía una, la hoja `foto` vieja se',
            ' * destruye (no queda huérfana).',
            ' *',
            ' * Flujo:',
            ' *   1. Crear empresa + vehículo de prueba.',
            ' *   2. Subir foto A (PNG).',
            ' *   3. Medir huérfanos (H1).',
            ' *   4. Subir foto B (otro PNG).',
            ' *   5. Medir huérfanos (H2). H2 debe ser == H1.',
            ' *   6. Verificar que el vehículo tiene la foto B.',
            ' *   7. Limpieza: eliminar la empresa (arrastra el vehículo).',
            ' *',
            ' * @version 1.5plugin.5u',
            ' * @since 1.5plugin.5u',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfiguracionApli.js";',
            'import { cerrar_modales_si_abiertos } from "./_helpers.js";',
            'import { PNG_TRANSPARENTE_B64, PNG_ALTERNATIVO_B64 } from "./_pasajeros_helpers.js";',
            'import { ir_a_micros_y_elegir_dueno, eliminar_empresa_por_post } from "./_empresas_helpers.js";',
            '',
            'async function _contar_huerfanos(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen",',
            '        nombre_solicitante',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo consultar grafo/resumen: "',
            '            + (r && r.json && r.json.error ? r.json.error : "(sin detalle)"));',
            '    }',
            '    return r.json.resumen.huerfanos;',
            '}',
            '',
            'export const prueba = {',
            '    id: "subir_foto_reemplazo_limpia_nodos",',
            '    nombre: "Vehículos: reemplazo de foto destruye la vieja",',
            '    descripcion: "Verifica que subir una foto nueva destruye la hoja `foto` vieja (fix v75a).",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '        await cerrar_modales_si_abiertos(ctx);',
            '',
            '        const r_nombre = await ctx.nombre_usuario_actual();',
            '        if (!r_nombre || !r_nombre.exito) {',
            '            throw new Error("No se pudo leer el nombre del admin");',
            '        }',
            '        const nombre_admin = r_nombre.nombre_usuario;',
            '',
            '        const { nombre_dueno } = await ir_a_micros_y_elegir_dueno(ctx);',
            '',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_empresa = "fotoauto" + sufijo;',
            '        const nombre_vehiculo = "FOTO" + sufijo;',
            '',
            '        const r_emp = await ctx.pedir_post("index.php", {',
            '            accion: "empresas/agregar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_empresa,',
            '            nombre_real: "Empresa Foto Test"',
            '        });',
            '        ctx.assert(r_emp && r_emp.exito && r_emp.json && r_emp.json.exito,',
            '            "No se pudo crear la empresa: "',
            '            + (r_emp && r_emp.json && r_emp.json.error ? r_emp.json.error : "(sin detalle)"));',
            '',
            '        try {',
            '            const r_veh = await ctx.pedir_post("index.php", {',
            '                accion: "vehiculos/agregar",',
            '                nombre_solicitante: nombre_admin,',
            '                nombre_dueno,',
            '                nombre_empresa,',
            '                nombre_vehiculo,',
            '                nombre_real: "Vehiculo Foto Test"',
            '            });',
            '            ctx.assert(r_veh && r_veh.exito && r_veh.json && r_veh.json.exito,',
            '                "No se pudo crear el vehículo: "',
            '                + (r_veh && r_veh.json && r_veh.json.error ? r_veh.json.error : "(sin detalle)"));',
            '',
            '            // 1. Subir foto A.',
            '            const r_foto_a = await ctx.subir_archivo(',
            '                "vehiculos/subir_foto",',
            '                { nombre_empresa, nombre_vehiculo },',
            '                { nombre: "fotoA_" + sufijo + ".png", tipo: "image/png", contenido_base64: PNG_TRANSPARENTE_B64 }',
            '            );',
            '            ctx.assert(r_foto_a && r_foto_a.exito && r_foto_a.json && r_foto_a.json.exito,',
            '                "Falló la subida de la foto A: "',
            '                + (r_foto_a && r_foto_a.json && r_foto_a.json.error ? r_foto_a.json.error : "(sin detalle)"));',
            '',
            '            const H1 = await _contar_huerfanos(ctx, nombre_admin);',
            '',
            '            // 2. Subir foto B (reemplaza la A).',
            '            const r_foto_b = await ctx.subir_archivo(',
            '                "vehiculos/subir_foto",',
            '                { nombre_empresa, nombre_vehiculo },',
            '                { nombre: "fotoB_" + sufijo + ".png", tipo: "image/png", contenido_base64: PNG_ALTERNATIVO_B64 }',
            '            );',
            '            ctx.assert(r_foto_b && r_foto_b.exito && r_foto_b.json && r_foto_b.json.exito,',
            '                "Falló la subida de la foto B: "',
            '                + (r_foto_b && r_foto_b.json && r_foto_b.json.error ? r_foto_b.json.error : "(sin detalle)"));',
            '',
            '            const H2 = await _contar_huerfanos(ctx, nombre_admin);',
            '            ctx.assert(H2 === H1,',
            '                "Reemplazar la foto dejó huérfanos (el nodo viejo no se destruyó). "',
            '                + "H1=" + H1 + ", H2=" + H2 + ", dif=" + (H2 - H1));',
            '',
            '            // 3. Verificar que el vehículo tiene la foto B.',
            '            const r_listar = await ctx.pedir_post("index.php", {',
            '                accion: "vehiculos/listar",',
            '                nombre_empresa',
            '            });',
            '            ctx.assert(r_listar && r_listar.exito && r_listar.json && r_listar.json.exito,',
            '                "No se pudieron listar los vehículos: "',
            '                + (r_listar && r_listar.json && r_listar.json.error ? r_listar.json.error : "(sin detalle)"));',
            '            const veh = (r_listar.json.vehiculos || []).find(v => v.nombre_vehiculo === nombre_vehiculo);',
            '            ctx.assert(veh && veh.foto,',
            '                "El vehículo no tiene foto tras la subida.");',
            '            ctx.assert(veh.foto.indexOf("fotoB_") !== -1,',
            '                "La foto del vehículo no es la B. Ruta: " + veh.foto);',
            '',
            '        } finally {',
            '            await eliminar_empresa_por_post(ctx, nombre_dueno, nombre_empresa);',
            '        }',
            '    }',
            '};',
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