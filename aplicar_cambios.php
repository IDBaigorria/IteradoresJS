<?php
/**
 * Aplicador — Prueba 66: reiniciar seleccion al hacer login.
 *
 * Nueva prueba que verifica el fix v1.5piloto.80h: al hacer
 * login como terminal, la venta_actual colgada se limpia y
 * los asientos vuelven a "libre".
 *
 * Flujo del test:
 *   1. Login terminal + reset inicial (por las dudas).
 *   2. Ir a Viajes, abrir un micro, seleccionar 2 asientos.
 *   3. Capturar nombre_viaje / nombre_micro / nombre_dueno.
 *   4. Verificar que hay 2 asientos en "seleccionado" por
 *      este terminal (sanity check).
 *   5. Cerrar modales y cerrar sesion (sin liberar los
 *      asientos).
 *   6. Login terminal de nuevo.
 *   7. Poll: viajes/estado_asientos hasta que no quede
 *      ningun asiento "seleccionado" por este terminal.
 *
 * Uso (raiz del proyecto plugin): php aplicar_cambios.php
 */

$modo_estricto = true;
$raiz_proyecto = __DIR__;
$version_nueva = '1.5plugin.7r';
$htmls_a_bumpear = [];

$cambios = [

    // 1. Nuevo archivo prueba_66.
    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_66_reiniciar_seleccion_en_login.js',
        'descripcion' => 'Nueva prueba 66',
        'contenido' => [
            '/**',
            ' * Prueba: al hacer login como terminal, se reinicia la',
            ' * seleccion de asientos previa (por si el usuario cerro',
            ' * el navegador a mitad de una venta).',
            ' *',
            ' * Verifica el fix v1.5piloto.80h: el arranque de la app',
            ' * dispara viajes/reiniciar_seleccion_completa para',
            ' * terminales, limpiando la venta_actual colgada.',
            ' *',
            ' * @version 1.5plugin.7r',
            ' * @since 1.5plugin.7r',
            ' */',
            '',
            'import { CODIGO_TERMINAL1 } from "../ConfiguracionApli.js";',
            'import {',
            '    _post,',
            '    login_terminal,',
            '    ir_a_viajes_y_abrir_primero,',
            '    abrir_primer_micro_con_libres,',
            '    seleccionar_n_asientos,',
            '    cerrar_modales_si_abiertos',
            '} from "./_helpers.js";',
            '',
            '// Lee viaje_seleccionado y micro_seleccionado del page.',
            'async function _leer_info_micro(ctx) {',
            '    const r = await chrome.scripting.executeScript({',
            '        target: { tabId: ctx.pestana_id },',
            '        world: "MAIN",',
            '        func: () => {',
            '            if (typeof viaje_seleccionado === "undefined" || !viaje_seleccionado) return null;',
            '            if (typeof micro_seleccionado === "undefined" || !micro_seleccionado) return null;',
            '            return {',
            '                nombre_viaje: viaje_seleccionado.nombre_viaje,',
            '                nombre_dueno: viaje_seleccionado.dueno,',
            '                nombre_micro: micro_seleccionado',
            '            };',
            '        }',
            '    });',
            '    return (r && r[0] && r[0].result) ? r[0].result : null;',
            '}',
            '',
            '// Cuenta cuantos asientos estan en "seleccionado" por el',
            '// terminal dado. Devuelve -1 si falla la consulta.',
            'async function _contar_seleccionados(ctx, info, nombre_terminal) {',
            '    try {',
            '        const r = await _post(ctx, "viajes/estado_asientos", {',
            '            nombre_viaje: info.nombre_viaje,',
            '            nombre_micro: info.nombre_micro,',
            '            nombre_dueno: info.nombre_dueno',
            '        });',
            '        if (!r || !r.exito) return -1;',
            '        return (r.asientos || []).filter(',
            '            a => a.estado === "seleccionado" && a.seleccionado_por === nombre_terminal',
            '        ).length;',
            '    } catch (e) {',
            '        return -1;',
            '    }',
            '}',
            '',
            'export const prueba = {',
            '    id: "reiniciar_seleccion_en_login",',
            '    nombre: "Autenticacion: login de terminal limpia seleccion",',
            '    descripcion: "Verifica que al hacer login como terminal se reinicia la venta_actual colgada: los asientos que quedaron en estado seleccionado vuelven a libre. Cubre el caso cierre de navegador a mitad de venta.",',
            '    async ejecutar(ctx) {',
            '        // 1. Login terminal + reset inicial por las dudas.',
            '        await login_terminal(ctx);',
            '        await cerrar_modales_si_abiertos(ctx);',
            '',
            '        const r_nombre = await ctx.nombre_usuario_actual();',
            '        ctx.assert(r_nombre && r_nombre.exito,',
            '            "No se pudo leer el nombre del terminal");',
            '        const nombre_terminal = r_nombre.nombre_usuario;',
            '',
            '        // Limpieza defensiva por si una corrida anterior',
            '        // dejo asientos colgados.',
            '        await _post(ctx, "viajes/reiniciar_seleccion_completa", {',
            '            nombre_terminal',
            '        });',
            '',
            '        // 2. Ir a Viajes y seleccionar 2 asientos.',
            '        await ir_a_viajes_y_abrir_primero(ctx);',
            '        await abrir_primer_micro_con_libres(ctx);',
            '        await seleccionar_n_asientos(ctx, 2);',
            '',
            '        // 3. Capturar info del viaje/micro.',
            '        const info = await _leer_info_micro(ctx);',
            '        ctx.assert(info && info.nombre_viaje && info.nombre_micro,',
            '            "No se pudo leer el viaje/micro del page.");',
            '',
            '        // 4. Sanity: hay al menos 2 asientos seleccionados.',
            '        const n_antes = await _contar_seleccionados(ctx, info, nombre_terminal);',
            '        ctx.assert(n_antes >= 2,',
            '            "Antes de cerrar sesion deberia haber >=2 asientos seleccionados. Hay: " + n_antes);',
            '',
            '        // 5. Cerrar modales y cerrar sesion (sin liberar los',
            '        //    asientos). Los asientos quedan en estado',
            '        //    "seleccionado" en el backend.',
            '        await cerrar_modales_si_abiertos(ctx);',
            '        const cerro = await ctx.cerrar_sesion();',
            '        ctx.assert(cerro, "No se pudo cerrar la sesion.");',
            '',
            '        // 6. Login terminal de nuevo. Aca es donde corre',
            '        //    la limpieza (fix v1.5piloto.80h).',
            '        await login_terminal(ctx);',
            '',
            '        // 7. Poll: esperar a que no queden seleccionados.',
            '        const inicio = Date.now();',
            '        let n_despues = -1;',
            '        while (Date.now() - inicio < 20000) {',
            '            n_despues = await _contar_seleccionados(ctx, info, nombre_terminal);',
            '            if (n_despues === 0) break;',
            '            await ctx.pausa(500);',
            '        }',
            '        ctx.assert(n_despues === 0,',
            '            "Despues del login, los asientos deberian estar libres. "',
            '            + "Quedan " + n_despues + " asientos en estado seleccionado."',
            '            + " El fix v1.5piloto.80h no esta funcionando.");',
            '    }',
            '};',
        ],
    ],

    // 2. Registrar en catalogo.js.
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: import prueba 66',
        'buscar' => [
            'import { prueba as cambiar_asiento_desde_clientes } from "./prueba_65_cambiar_asiento_desde_clientes.js";',
        ],
        'reemplazar' => [
            'import { prueba as cambiar_asiento_desde_clientes } from "./prueba_65_cambiar_asiento_desde_clientes.js";',
            'import { prueba as reiniciar_seleccion_en_login } from "./prueba_66_reiniciar_seleccion_en_login.js";',
        ],
    ],

    // 3. Agregar a la seccion "base".
    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'catalogo: agregar prueba 66 a seccion base',
        'buscar' => [
            '            arranque,',
            '            login,',
            '            cerrar_sesion_cierra_modales',
            '        ]',
        ],
        'reemplazar' => [
            '            arranque,',
            '            login,',
            '            cerrar_sesion_cierra_modales,',
            '            reiniciar_seleccion_en_login',
            '        ]',
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
foreach ($creaciones as $cr) {
    $ext = strtolower(pathinfo($cr['archivo'], PATHINFO_EXTENSION));
    if ($ext === 'php' || $ext === 'js') $archivos_bump_php_js[] = $cr['archivo'];
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