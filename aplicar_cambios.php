<?php
/**
 * Aplicador — Fase 2c.1: migracion de helpers auxiliares a _post.
 *
 * Migra _compartidos_helpers.js, _empresas_helpers.js y
 * _pasajeros_helpers.js para que usen el wrapper _post en lugar
 * de ctx.pedir_post directo. Sin cambio de comportamiento
 * observable en las pruebas.
 *
 * Uso (raiz del proyecto plugin): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.7d';

$htmls_a_bumpear = [];

$cambios = [

    // ============================================================
    // 1. _compartidos_helpers.js: agregar import de _post.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_compartidos_helpers.js',
        'descripcion' => '_compartidos_helpers.js: import de _post',
        'buscar' => [
            ' */',
            '',
            '// ============================================================',
            '// Resolución de nombres de usuario',
            '// ============================================================',
        ],
        'reemplazar' => [
            ' */',
            '',
            'import { _post } from "./_helpers.js";',
            '',
            '// ============================================================',
            '// Resolución de nombres de usuario',
            '// ============================================================',
        ],
    ],

    // ============================================================
    // 2. _compartidos_helpers.js: crear_viaje_vacio.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_compartidos_helpers.js',
        'descripcion' => '_compartidos_helpers.js: crear_viaje_vacio con _post',
        'buscar' => [
            'export async function crear_viaje_vacio(ctx, nombre_dueno, prefijo = "viajeauto") {',
            '    const nombre_viaje = prefijo + "_" + Date.now();',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "viajes/guardar",',
            '        nombre_dueno: nombre_dueno,',
            '        nombre_viaje: nombre_viaje,',
            '        nombre: "Viaje de prueba " + nombre_viaje,',
            '        fecha: "a confirmar",',
            '        hora: "a confirmar",',
            '        origen: "Origen de prueba",',
            '        destino: "Destino de prueba"',
            '    });',
            '    if (!r || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo crear el viaje: " + JSON.stringify(r && r.json ? r.json : r));',
            '    }',
            '    return nombre_viaje;',
            '}',
        ],
        'reemplazar' => [
            'export async function crear_viaje_vacio(ctx, nombre_dueno, prefijo = "viajeauto") {',
            '    const nombre_viaje = prefijo + "_" + Date.now();',
            '    await _post(ctx, "viajes/guardar", {',
            '        nombre_dueno: nombre_dueno,',
            '        nombre_viaje: nombre_viaje,',
            '        nombre: "Viaje de prueba " + nombre_viaje,',
            '        fecha: "a confirmar",',
            '        hora: "a confirmar",',
            '        origen: "Origen de prueba",',
            '        destino: "Destino de prueba"',
            '    }, { lanzar_en_error_backend: true });',
            '    return nombre_viaje;',
            '}',
        ],
    ],

    // ============================================================
    // 3. _compartidos_helpers.js: eliminar_viaje_si_existe.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_compartidos_helpers.js',
        'descripcion' => '_compartidos_helpers.js: eliminar_viaje_si_existe con _post',
        'buscar' => [
            'export async function eliminar_viaje_si_existe(ctx, nombre_dueno, nombre_viaje) {',
            '    if (!nombre_viaje) return;',
            '    try {',
            '        await ctx.pedir_post("index.php", {',
            '            accion: "viajes/eliminar",',
            '            nombre_dueno: nombre_dueno,',
            '            nombre_viaje: nombre_viaje',
            '        });',
            '    } catch (e) { /* best-effort */ }',
            '}',
        ],
        'reemplazar' => [
            'export async function eliminar_viaje_si_existe(ctx, nombre_dueno, nombre_viaje) {',
            '    if (!nombre_viaje) return;',
            '    try {',
            '        await _post(ctx, "viajes/eliminar", {',
            '            nombre_dueno: nombre_dueno,',
            '            nombre_viaje: nombre_viaje',
            '        });',
            '    } catch (e) { /* best-effort */ }',
            '}',
        ],
    ],

    // ============================================================
    // 4. _compartidos_helpers.js: autorizar_terminal.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_compartidos_helpers.js',
        'descripcion' => '_compartidos_helpers.js: autorizar_terminal con _post',
        'buscar' => [
            'export async function autorizar_terminal(ctx, nombre_dueno, nombre_viaje, nombre_terminal) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "viajes/agregar_terminal",',
            '        nombre_dueno: nombre_dueno,',
            '        nombre_viaje: nombre_viaje,',
            '        nombre_terminal: nombre_terminal',
            '    });',
            '    if (!r || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo autorizar: " + JSON.stringify(r && r.json ? r.json : r));',
            '    }',
            '}',
        ],
        'reemplazar' => [
            'export async function autorizar_terminal(ctx, nombre_dueno, nombre_viaje, nombre_terminal) {',
            '    await _post(ctx, "viajes/agregar_terminal", {',
            '        nombre_dueno: nombre_dueno,',
            '        nombre_viaje: nombre_viaje,',
            '        nombre_terminal: nombre_terminal',
            '    }, { lanzar_en_error_backend: true });',
            '}',
        ],
    ],

    // ============================================================
    // 5. _compartidos_helpers.js: desautorizar_terminal.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_compartidos_helpers.js',
        'descripcion' => '_compartidos_helpers.js: desautorizar_terminal con _post',
        'buscar' => [
            'export async function desautorizar_terminal(ctx, nombre_dueno, nombre_viaje, nombre_terminal) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "viajes/eliminar_terminal",',
            '        nombre_dueno: nombre_dueno,',
            '        nombre_viaje: nombre_viaje,',
            '        nombre_terminal: nombre_terminal',
            '    });',
            '    if (!r || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo desautorizar: " + JSON.stringify(r && r.json ? r.json : r));',
            '    }',
            '}',
        ],
        'reemplazar' => [
            'export async function desautorizar_terminal(ctx, nombre_dueno, nombre_viaje, nombre_terminal) {',
            '    await _post(ctx, "viajes/eliminar_terminal", {',
            '        nombre_dueno: nombre_dueno,',
            '        nombre_viaje: nombre_viaje,',
            '        nombre_terminal: nombre_terminal',
            '    }, { lanzar_en_error_backend: true });',
            '}',
        ],
    ],

    // ============================================================
    // 6. _compartidos_helpers.js: terminal_ve_viaje.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_compartidos_helpers.js',
        'descripcion' => '_compartidos_helpers.js: terminal_ve_viaje con _post',
        'buscar' => [
            'export async function terminal_ve_viaje(ctx, nombre_terminal, nombre_viaje) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "viajes/listar_por_terminal",',
            '        nombre_terminal: nombre_terminal',
            '    });',
            '    if (!r || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo listar viajes del terminal: "',
            '            + JSON.stringify(r && r.json ? r.json : r));',
            '    }',
            '    const viajes = r.json.viajes || [];',
            '    return viajes.some(v => v && v.nombre_viaje === nombre_viaje);',
            '}',
        ],
        'reemplazar' => [
            'export async function terminal_ve_viaje(ctx, nombre_terminal, nombre_viaje) {',
            '    const r = await _post(ctx, "viajes/listar_por_terminal", {',
            '        nombre_terminal: nombre_terminal',
            '    }, { lanzar_en_error_backend: true });',
            '    const viajes = r.viajes || [];',
            '    return viajes.some(v => v && v.nombre_viaje === nombre_viaje);',
            '}',
        ],
    ],

    // ============================================================
    // 7. _compartidos_helpers.js: listar_empresas_del_terminal.
    //    Caso especial: admin opera "como" el terminal.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_compartidos_helpers.js',
        'descripcion' => '_compartidos_helpers.js: listar_empresas_del_terminal con _post',
        'buscar' => [
            'export async function listar_empresas_del_terminal(ctx, nombre_dueno, nombre_terminal) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "empresas/listar",',
            '        nombre_dueno: nombre_dueno,',
            '        nombre_solicitante: nombre_terminal',
            '    });',
            '    if (!r || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo listar empresas: "',
            '            + JSON.stringify(r && r.json ? r.json : r));',
            '    }',
            '    return (r.json.empresas || []).map(e => (e && e.nombre_empresa) || "");',
            '}',
        ],
        'reemplazar' => [
            'export async function listar_empresas_del_terminal(ctx, nombre_dueno, nombre_terminal) {',
            '    // Caso especial: el admin opera "como" el terminal. Pasamos',
            '    // `nombre_solicitante` explicito y `sin_solicitante: true`',
            '    // para que post_accion no lo pise con el del logueado.',
            '    const r = await _post(ctx, "empresas/listar", {',
            '        nombre_dueno: nombre_dueno,',
            '        nombre_solicitante: nombre_terminal',
            '    }, { sin_solicitante: true, lanzar_en_error_backend: true });',
            '    return (r.empresas || []).map(e => (e && e.nombre_empresa) || "");',
            '}',
        ],
    ],

    // ============================================================
    // 8. _compartidos_helpers.js: buscar_empresa_con_vehiculo_configurado.
    //    Silencioso: try/catch que devuelve null.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_compartidos_helpers.js',
        'descripcion' => '_compartidos_helpers.js: buscar_empresa_con_vehiculo_configurado con _post',
        'buscar' => [
            'export async function buscar_empresa_con_vehiculo_configurado(ctx, nombre_dueno, excluir = []) {',
            '    const r_emp = await ctx.pedir_post("index.php", {',
            '        accion: "empresas/listar",',
            '        nombre_dueno: nombre_dueno',
            '    });',
            '    if (!r_emp || !r_emp.json || !r_emp.json.exito) return null;',
            '    const empresas = r_emp.json.empresas || [];',
            '    for (const e of empresas) {',
            '        const nombre_emp = e && e.nombre_empresa;',
            '        if (!nombre_emp) continue;',
            '        if (excluir.includes(nombre_emp)) continue;',
            '        const r_veh = await ctx.pedir_post("index.php", {',
            '            accion: "vehiculos/listar",',
            '            nombre_dueno: nombre_dueno,',
            '            nombre_empresa: nombre_emp',
            '        });',
            '        if (!r_veh || !r_veh.json || !r_veh.json.exito) continue;',
            '        const vehiculos = r_veh.json.vehiculos || [];',
            '        for (const v of vehiculos) {',
            '            if (v && v.nombre_vehiculo && v.asientos && parseInt(v.asientos) > 0) {',
            '                return { nombre_empresa: nombre_emp, nombre_vehiculo: v.nombre_vehiculo };',
            '            }',
            '        }',
            '    }',
            '    return null;',
            '}',
        ],
        'reemplazar' => [
            'export async function buscar_empresa_con_vehiculo_configurado(ctx, nombre_dueno, excluir = []) {',
            '    // Silencioso: cualquier error devuelve null, para que el',
            '    // llamador siga con la logica de "precondicion no cumplida".',
            '    try {',
            '        const r_emp = await _post(ctx, "empresas/listar", {',
            '            nombre_dueno: nombre_dueno',
            '        });',
            '        if (!r_emp || !r_emp.exito) return null;',
            '        const empresas = r_emp.empresas || [];',
            '        for (const e of empresas) {',
            '            const nombre_emp = e && e.nombre_empresa;',
            '            if (!nombre_emp) continue;',
            '            if (excluir.includes(nombre_emp)) continue;',
            '            const r_veh = await _post(ctx, "vehiculos/listar", {',
            '                nombre_dueno: nombre_dueno,',
            '                nombre_empresa: nombre_emp',
            '            });',
            '            if (!r_veh || !r_veh.exito) continue;',
            '            const vehiculos = r_veh.vehiculos || [];',
            '            for (const v of vehiculos) {',
            '                if (v && v.nombre_vehiculo && v.asientos && parseInt(v.asientos) > 0) {',
            '                    return { nombre_empresa: nombre_emp, nombre_vehiculo: v.nombre_vehiculo };',
            '                }',
            '            }',
            '        }',
            '    } catch (e) {',
            '        return null;',
            '    }',
            '    return null;',
            '}',
        ],
    ],

    // ============================================================
    // 9. _empresas_helpers.js: agregar import de _post.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_empresas_helpers.js',
        'descripcion' => '_empresas_helpers.js: import de _post',
        'buscar' => [
            ' */',
            '',
            '/**',
            ' * Va a la pestaña Micros, elige el primer dueño, espera a que',
        ],
        'reemplazar' => [
            ' */',
            '',
            'import { _post } from "./_helpers.js";',
            '',
            '/**',
            ' * Va a la pestaña Micros, elige el primer dueño, espera a que',
        ],
    ],

    // ============================================================
    // 10. _empresas_helpers.js: eliminar_empresa_por_post.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_empresas_helpers.js',
        'descripcion' => '_empresas_helpers.js: eliminar_empresa_por_post con _post',
        'buscar' => [
            'export async function eliminar_empresa_por_post(ctx, nombre_dueno, nombre_empresa) {',
            '    try {',
            '        await ctx.pedir_post("index.php", {',
            '            accion: "empresas/eliminar",',
            '            nombre_dueno,',
            '            nombre_empresa',
            '        });',
            '    } catch (e) {',
            '        console.warn("No se pudo eliminar la empresa de prueba:", e);',
            '    }',
            '}',
        ],
        'reemplazar' => [
            'export async function eliminar_empresa_por_post(ctx, nombre_dueno, nombre_empresa) {',
            '    try {',
            '        await _post(ctx, "empresas/eliminar", {',
            '            nombre_dueno,',
            '            nombre_empresa',
            '        });',
            '    } catch (e) {',
            '        console.warn("No se pudo eliminar la empresa de prueba:", e);',
            '    }',
            '}',
        ],
    ],

    // ============================================================
    // 11. _pasajeros_helpers.js: agregar import de _post.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_pasajeros_helpers.js',
        'descripcion' => '_pasajeros_helpers.js: import de _post',
        'buscar' => [
            ' */',
            '',
            '// PNG 1x1 transparente (67 bytes). Sirve para las pruebas de',
            '// subida de archivo.',
        ],
        'reemplazar' => [
            ' */',
            '',
            'import { _post } from "./_helpers.js";',
            '',
            '// PNG 1x1 transparente (67 bytes). Sirve para las pruebas de',
            '// subida de archivo.',
        ],
    ],

    // ============================================================
    // 12. _pasajeros_helpers.js: primer_dueno_para_pruebas.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_pasajeros_helpers.js',
        'descripcion' => '_pasajeros_helpers.js: primer_dueno_para_pruebas con _post',
        'buscar' => [
            'export async function primer_dueno_para_pruebas(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "administrador/listar_duenos",',
            '        nombre_solicitante',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo listar dueños: "',
            '            + ((r && r.json && r.json.error) ? r.json.error : "(sin detalle)"));',
            '    }',
            '    const lista = r.json.duenos || [];',
        ],
        'reemplazar' => [
            'export async function primer_dueno_para_pruebas(ctx, nombre_solicitante) {',
            '    const r = await _post(ctx, "administrador/listar_duenos",',
            '        { nombre_solicitante },',
            '        { sin_solicitante: true, lanzar_en_error_backend: true });',
            '    const lista = r.duenos || [];',
        ],
    ],

    // ============================================================
    // 13. _pasajeros_helpers.js: crear_pasajero_de_prueba_admin.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_pasajeros_helpers.js',
        'descripcion' => '_pasajeros_helpers.js: crear_pasajero_de_prueba_admin con _post',
        'buscar' => [
            'export async function crear_pasajero_de_prueba_admin(ctx, nombre_solicitante, nombre_dueno, dni) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "pasajeros/crear",',
            '        nombre_solicitante,',
            '        nombre_dueno,',
            '        dni,',
            '        apellido: "Djtest",',
            '        nombres: "Pasajero",',
            '        email: "dj_" + dni + "@test.local",',
            '        celular: "2983555123",',
            '        celular_emergencia: "2983555222",',
            '        fecha_nacimiento: "1990-06-15",',
            '        direccion: "Calle Dj 1",',
            '        localidad: "Tres Arroyos"',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo crear el pasajero: "',
            '            + ((r && r.json && r.json.error) ? r.json.error : "(sin detalle)"));',
            '    }',
            '}',
        ],
        'reemplazar' => [
            'export async function crear_pasajero_de_prueba_admin(ctx, nombre_solicitante, nombre_dueno, dni) {',
            '    await _post(ctx, "pasajeros/crear", {',
            '        nombre_solicitante,',
            '        nombre_dueno,',
            '        dni,',
            '        apellido: "Djtest",',
            '        nombres: "Pasajero",',
            '        email: "dj_" + dni + "@test.local",',
            '        celular: "2983555123",',
            '        celular_emergencia: "2983555222",',
            '        fecha_nacimiento: "1990-06-15",',
            '        direccion: "Calle Dj 1",',
            '        localidad: "Tres Arroyos"',
            '    }, { sin_solicitante: true, lanzar_en_error_backend: true });',
            '}',
        ],
    ],

    // ============================================================
    // 14. _pasajeros_helpers.js: eliminar_pasajero_por_post.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_pasajeros_helpers.js',
        'descripcion' => '_pasajeros_helpers.js: eliminar_pasajero_por_post con _post',
        'buscar' => [
            'export async function eliminar_pasajero_por_post(ctx, nombre_solicitante, nombre_dueno, dni) {',
            '    try {',
            '        await ctx.pedir_post("index.php", {',
            '            accion: "pasajeros/eliminar",',
            '            nombre_solicitante,',
            '            nombre_dueno,',
            '            dni',
            '        });',
            '    } catch (e) {',
            '        console.warn("No se pudo eliminar el pasajero de prueba:", e);',
            '    }',
            '}',
        ],
        'reemplazar' => [
            'export async function eliminar_pasajero_por_post(ctx, nombre_solicitante, nombre_dueno, dni) {',
            '    try {',
            '        await _post(ctx, "pasajeros/eliminar", {',
            '            nombre_solicitante,',
            '            nombre_dueno,',
            '            dni',
            '        }, { sin_solicitante: true });',
            '    } catch (e) {',
            '        console.warn("No se pudo eliminar el pasajero de prueba:", e);',
            '    }',
            '}',
        ],
    ],

    // ============================================================
    // 15. _pasajeros_helpers.js: leer_pasajero.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_pasajeros_helpers.js',
        'descripcion' => '_pasajeros_helpers.js: leer_pasajero con _post',
        'buscar' => [
            'export async function leer_pasajero(ctx, nombre_solicitante, nombre_dueno, dni) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "pasajeros/obtener",',
            '        nombre_solicitante,',
            '        nombre_dueno,',
            '        dni',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo leer el pasajero " + dni + ": "',
            '            + ((r && r.json && r.json.error) ? r.json.error : "(sin detalle)"));',
            '    }',
            '    return r.json.pasajero;',
            '}',
        ],
        'reemplazar' => [
            'export async function leer_pasajero(ctx, nombre_solicitante, nombre_dueno, dni) {',
            '    const r = await _post(ctx, "pasajeros/obtener", {',
            '        nombre_solicitante,',
            '        nombre_dueno,',
            '        dni',
            '    }, { sin_solicitante: true, lanzar_en_error_backend: true });',
            '    return r.pasajero;',
            '}',
        ],
    ],

    // ============================================================
    // 16. _pasajeros_helpers.js: contar_huerfanos.
    // ============================================================
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/_pasajeros_helpers.js',
        'descripcion' => '_pasajeros_helpers.js: contar_huerfanos con _post',
        'buscar' => [
            'export async function contar_huerfanos(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen",',
            '        nombre_solicitante',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) {',
            '        throw new Error("No se pudo consultar grafo/resumen: "',
            '            + ((r && r.json && r.json.error) ? r.json.error : "(sin detalle)"));',
            '    }',
            '    return r.json.resumen.huerfanos;',
            '}',
        ],
        'reemplazar' => [
            'export async function contar_huerfanos(ctx, nombre_solicitante) {',
            '    const r = await _post(ctx, "grafo/resumen",',
            '        { nombre_solicitante },',
            '        { sin_solicitante: true, lanzar_en_error_backend: true });',
            '    return r.resumen.huerfanos;',
            '}',
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
    $htmls_a_bumpear = ['aplicacion_GET.html'];
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
foreach ($archivos_a_escribir as $ruta_abs => $info) {
    $rel = substr($ruta_abs, strlen($raiz_proyecto) + 1);
    $ext = strtolower(pathinfo($ruta_abs, PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump_php_js[] = $rel;
}

$bumps_atversion = 0;
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
        $bumps_detalle[] = "$archivo_rel  @version $viejo -> $version_nueva";
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

if ($bumpear && (!empty($bumps_detalle) || !empty($info_bumps))) {
    echo "\n--- Bumps ---\n";
    foreach ($bumps_detalle as $d) echo "[BUMP] $d\n";
    foreach ($info_bumps as $i) echo "[INFO] $i\n";
}

echo "\n=== Resumen ===\n";
echo "Bloques aplicados: $bloques_ok\n";
echo "Archivos escritos: $archivos_escritos\n";
if ($bumpear) echo "Bumps @version:    $bumps_atversion\n";
if (!empty($bloques_fallidos)) {
    echo "Fallos: " . count($bloques_fallidos) . "\n";
    foreach ($bloques_fallidos as $f) echo "  - $f\n";
}
echo "\nListo.\n";