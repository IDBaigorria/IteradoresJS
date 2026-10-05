<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda V1.5plugin.5r-fix:
 *   - Corrige las pruebas 45 (alta_empresa) y 48 (alta_vehiculo):
 *     el modal se cierra ANTES de que se recargue la lista de
 *     empresas/vehículos. Los tests leían el selector demasiado
 *     pronto y veían las opciones viejas. Ahora usan polling para
 *     esperar a que la nueva opción aparezca.
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

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_45_alta_empresa.js',
        'descripcion' => 'Prueba 45 corregida: polling para esperar la recarga',
        'contenido' => [
            '/**',
            ' * Prueba: alta de empresa con modal genérico.',
            ' *',
            ' * Verifica el flujo feliz de v1.5piloto.76c. Abre el modal',
            ' * desde #boton_agregar_empresa_micros, llena los campos,',
            ' * guarda, y verifica que la empresa aparece en el selector.',
            ' *',
            ' * Nota: el frontend cierra el modal ANTES de recargar el',
            ' * selector de empresas. Por eso, después de guardar, hay',
            ' * que hacer polling hasta que la nueva opción aparezca.',
            ' *',
            ' * @version 1.5plugin.5r-fix',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            'import { cerrar_modales_si_abiertos } from "./_helpers.js";',
            'import {',
            '    ir_a_micros_y_elegir_dueno,',
            '    abrir_modal_agregar_empresa,',
            '    eliminar_empresa_por_post',
            '} from "./_empresas_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "alta_empresa",',
            '    nombre: "Empresas: alta con modal",',
            '    descripcion: "Verifica que el alta de empresa funciona desde el modal genérico.",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '        await cerrar_modales_si_abiertos(ctx);',
            '',
            '        const { nombre_dueno } = await ir_a_micros_y_elegir_dueno(ctx);',
            '',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_empresa = "empauto" + sufijo;',
            '',
            '        await abrir_modal_agregar_empresa(ctx);',
            '        await ctx.escribir("#modal_nueva_empresa_nombre", nombre_empresa);',
            '        await ctx.escribir("#modal_nueva_empresa_nombre_real", "Empresa automática");',
            '        await ctx.clic("#modal_btn_guardar_empresa");',
            '',
            '        const cerrado = await ctx.esperar_oculto("#modal_generico", 8000);',
            '        ctx.assert(cerrado && cerrado.exito,',
            '            "El modal no se cerró tras guardar la empresa");',
            '',
            '        // El frontend cierra el modal y DESPUÉS recarga el',
            '        // selector. Polling hasta que la empresa aparezca.',
            '        let encontrado = false;',
            '        let opciones_vistas = 0;',
            '        const inicio = Date.now();',
            '        while (Date.now() - inicio < 8000) {',
            '            const opciones = await ctx.leer_opciones("#selector_empresa_micros");',
            '            opciones_vistas = opciones.length;',
            '            if (opciones.some(o => o.valor === nombre_empresa)) {',
            '                encontrado = true;',
            '                break;',
            '            }',
            '            await ctx.pausa(300);',
            '        }',
            '        ctx.assert(encontrado,',
            '            "La empresa " + nombre_empresa + " no apareció en el selector."',
            '            + " Opciones vistas: " + opciones_vistas);',
            '',
            '        await eliminar_empresa_por_post(ctx, nombre_dueno, nombre_empresa);',
            '    }',
            '};',
        ],
    ],

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_48_alta_vehiculo.js',
        'descripcion' => 'Prueba 48 corregida: polling para esperar la recarga',
        'contenido' => [
            '/**',
            ' * Prueba: alta de vehículo con modal genérico.',
            ' *',
            ' * Verifica el flujo feliz de v1.5piloto.76c. Crea una',
            ' * empresa de setup, la selecciona, abre el modal de alta de',
            ' * vehículo, lo llena, y verifica que aparece en el selector.',
            ' *',
            ' * Nota: el frontend cierra el modal ANTES de recargar el',
            ' * selector de vehículos. Por eso hay polling.',
            ' *',
            ' * @version 1.5plugin.5r-fix',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            'import { cerrar_modales_si_abiertos } from "./_helpers.js";',
            'import {',
            '    ir_a_micros_y_elegir_dueno,',
            '    crear_empresa_de_prueba,',
            '    seleccionar_empresa_por_valor,',
            '    abrir_modal_agregar_vehiculo,',
            '    eliminar_empresa_por_post',
            '} from "./_empresas_helpers.js";',
            '',
            'export const prueba = {',
            '    id: "alta_vehiculo",',
            '    nombre: "Vehículos: alta con modal",',
            '    descripcion: "Verifica que el alta de vehículo funciona desde el modal genérico.",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '        await cerrar_modales_si_abiertos(ctx);',
            '',
            '        const { nombre_dueno } = await ir_a_micros_y_elegir_dueno(ctx);',
            '',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_empresa = "empveh" + sufijo;',
            '        await crear_empresa_de_prueba(ctx, nombre_empresa);',
            '        await seleccionar_empresa_por_valor(ctx, nombre_empresa);',
            '',
            '        const nombre_vehiculo = "patauto" + sufijo;',
            '        await abrir_modal_agregar_vehiculo(ctx);',
            '        await ctx.escribir("#modal_nuevo_vehiculo_nombre", nombre_vehiculo);',
            '        await ctx.escribir("#modal_nuevo_vehiculo_nombre_real", "Vehículo automático");',
            '        await ctx.clic("#modal_btn_guardar_vehiculo");',
            '',
            '        const cerrado = await ctx.esperar_oculto("#modal_generico", 8000);',
            '        ctx.assert(cerrado && cerrado.exito,',
            '            "El modal no se cerró tras guardar el vehículo");',
            '',
            '        // El frontend cierra el modal y DESPUÉS recarga el',
            '        // selector. Polling hasta que el vehículo aparezca.',
            '        let encontrado = false;',
            '        let opciones_vistas = 0;',
            '        const inicio = Date.now();',
            '        while (Date.now() - inicio < 8000) {',
            '            const opciones = await ctx.leer_opciones("#selector_vehiculo_micros");',
            '            opciones_vistas = opciones.length;',
            '            if (opciones.some(o => o.valor === nombre_vehiculo)) {',
            '                encontrado = true;',
            '                break;',
            '            }',
            '            await ctx.pausa(300);',
            '        }',
            '        ctx.assert(encontrado,',
            '            "El vehículo " + nombre_vehiculo + " no apareció en el selector."',
            '            + " Opciones vistas: " + opciones_vistas);',
            '',
            '        // Limpieza: eliminar la empresa arrastra el vehículo.',
            '        await eliminar_empresa_por_post(ctx, nombre_dueno, nombre_empresa);',
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