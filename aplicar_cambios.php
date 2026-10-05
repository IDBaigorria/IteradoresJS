<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda V1.5plugin.5g:
 *   - Prueba espejo de v1.5piloto.74s (Fase 2 del grafo, segundo
 *     flujo): eliminar_micro_limpia_nodos. Verifica que eliminar
 *     un micro destruye el subárbol completo.
 *   - Sección "grafo" pasa a tener 2 pruebas.
 *   - Bump de ConfPlugin, catálogo y prompt.
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

    // --------------------------------------------------------
    // ConfPlugin.js
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'Bump VERSION_APP a 5g',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.5f";',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.5g";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'Bump VERSION_PLUGIN a 5g',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5f";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5g";',
        ],
    ],

    // --------------------------------------------------------
    // catalogo.js
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Bump @version de catalogo.js a 5g',
        'buscar' => [
            ' * @version 1.5plugin.5f',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.5g',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar import de la prueba 31',
        'buscar' => [
            'import { prueba as eliminar_viaje_limpia_nodos } from "./prueba_30_eliminar_viaje_limpia_nodos.js";',
            '',
            'export const SECCIONES = [',
        ],
        'reemplazar' => [
            'import { prueba as eliminar_viaje_limpia_nodos } from "./prueba_30_eliminar_viaje_limpia_nodos.js";',
            'import { prueba as eliminar_micro_limpia_nodos } from "./prueba_31_eliminar_micro_limpia_nodos.js";',
            '',
            'export const SECCIONES = [',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar prueba 31 a la sección grafo',
        'buscar' => [
            '        id: "grafo",',
            '        nombre: "Grafo",',
            '        pruebas: [',
            '            eliminar_viaje_limpia_nodos',
            '        ]',
            '    }',
            '];',
        ],
        'reemplazar' => [
            '        id: "grafo",',
            '        nombre: "Grafo",',
            '        pruebas: [',
            '            eliminar_viaje_limpia_nodos,',
            '            eliminar_micro_limpia_nodos',
            '        ]',
            '    }',
            '];',
        ],
    ],

    // --------------------------------------------------------
    // Prompt del plugin
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: estado a 5g con 31 pruebas',
        'buscar' => [
            '**Proyecto en v1.5plugin.5e.** El esqueleto del plugin está',
            'armado y funcional, tiene 30 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + grafo) y las agrupa',
            'en secciones.',
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.5g.** El esqueleto del plugin está',
            'armado y funcional, tiene 31 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + grafo) y las agrupa',
            'en secciones.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: agregar prueba 31 a la lista grafo',
        'buscar' => [
            '- `grafo`: 1 prueba. `eliminar_viaje_limpia_nodos`',
            '  verifica que `eliminar_viaje` del piloto (v1.5piloto.74r)',
            '  destruye el subárbol completo del viaje. Mide nodos',
            '  antes y después con `grafo/resumen` y compara.',
        ],
        'reemplazar' => [
            '- `grafo`: 2 pruebas. `eliminar_viaje_limpia_nodos`',
            '  verifica que `eliminar_viaje` del piloto (v1.5piloto.74r)',
            '  destruye el subárbol completo del viaje.',
            '  `eliminar_micro_limpia_nodos` verifica que',
            '  `eliminar_micro_de_viaje` del piloto (v1.5piloto.74s)',
            '  destruye el micro completo (copia de vehículo, pisos,',
            '  asientos, campos). Ambas miden nodos con',
            '  `grafo/resumen` antes y después, y comparan.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: Última actualización a 5g',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.5f',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.5g',
            '(prueba espejo de v1.5piloto.74s: `eliminar_micro_limpia_nodos`.',
            'Verifica que eliminar un micro destruye el subárbol completo',
            '(copia de vehículo, pisos, asientos, campos). Mide nodos',
            'en tres estados: antes de crear nada (N0), después de crear',
            'el viaje (N1), después de agregar el micro (N2), después de',
            'eliminar el micro (N3), y después de eliminar el viaje (N4).',
            'Asserts: N2 > N1, N3 === N1, N4 === N0. La prueba itera',
            'empresas × vehículos del dueño hasta encontrar uno con',
            'asientos configurados. Si ninguno anda, falla con mensaje',
            'claro.).',
            'Antes: v1.5plugin.5f',
        ],
    ],

    // --------------------------------------------------------
    // Nueva prueba
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_31_eliminar_micro_limpia_nodos.js',
        'descripcion' => 'Prueba 31: eliminar micro limpia nodos',
        'contenido' => [
            '/**',
            ' * Prueba: eliminar_micro_de_viaje limpia el subárbol completo.',
            ' *',
            ' * Verifica la Fase 2 del plan de optimización del grafo',
            ' * (v1.5piloto.74s). Antes, `eliminar_micro_de_viaje` solo',
            ' * desenlazaba el micro del contenedor `micros` del viaje:',
            ' * el nodo micro, su copia de vehículo, sus pisos y todos',
            ' * sus asientos quedaban huérfanos (~100 nodos por micro).',
            ' * Ahora los destruye reutilizando `_destruir_micro`.',
            ' *',
            ' * Mide cuatro estados con `grafo/resumen`:',
            ' *   N0: antes de crear nada.',
            ' *   N1: después de crear el viaje.',
            ' *   N2: después de agregar el micro. Assert N2 > N1.',
            ' *   N3: después de eliminar el micro. Assert N3 === N1.',
            ' *   N4: después de eliminar el viaje. Assert N4 === N0.',
            ' *',
            ' * Requisito de entorno: el dueño elegido (el primero de',
            ' * `administrador/listar_duenos`) debe tener al menos una',
            ' * empresa con al menos un vehículo con asientos configurados.',
            ' * La prueba itera empresas × vehículos intentando agregar',
            ' * el micro; si ninguno anda, falla con mensaje claro.',
            ' *',
            ' * @version 1.5plugin.5g',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            '',
            '// ============================================================',
            '// Helpers internos',
            '// ============================================================',
            '',
            '// Pide grafo/resumen y devuelve el total de nodos.',
            'async function _contar_nodos(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "grafo/resumen",',
            '        nombre_solicitante',
            '    });',
            '    if (!r || !r.exito) {',
            '        throw new Error("Error de red al consultar grafo/resumen: " + (r && r.error ? r.error : "(sin detalle)"));',
            '    }',
            '    if (!r.json || !r.json.exito) {',
            '        throw new Error("grafo/resumen devolvió error: " + (r.json && r.json.error ? r.json.error : "(sin detalle)"));',
            '    }',
            '    const j = r.json;',
            '    let total = null;',
            '    if (j.resumen && typeof j.resumen.total_nodos === "number") total = j.resumen.total_nodos;',
            '    else if (typeof j.resumen.total === "number") total = j.resumen.total;',
            '    else if (typeof j.total_nodos === "number") total = j.total_nodos;',
            '    else if (typeof j.total === "number") total = j.total;',
            '    if (total === null || total <= 0) {',
            '        throw new Error("No se pudo leer el total de nodos. Respuesta: " + JSON.stringify(j).slice(0, 200));',
            '    }',
            '    return total;',
            '}',
            '',
            '// Pide administrador/listar_duenos y devuelve el nombre del',
            '// primer dueño.',
            'async function _primer_dueno(ctx, nombre_solicitante) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "administrador/listar_duenos",',
            '        nombre_solicitante',
            '    });',
            '    if (!r || !r.exito) {',
            '        throw new Error("Error de red al listar dueños: " + (r && r.error ? r.error : "(sin detalle)"));',
            '    }',
            '    if (!r.json || !r.json.exito) {',
            '        throw new Error("administrador/listar_duenos devolvió error: "',
            '            + (r.json && r.json.error ? r.json.error : "(sin detalle)"));',
            '    }',
            '    const lista = r.json.duenos || r.json.usuarios || r.json.lista || [];',
            '    if (!Array.isArray(lista) || lista.length === 0) {',
            '        throw new Error("No hay dueños disponibles para la prueba.");',
            '    }',
            '    const primero = lista[0];',
            '    const nombre = typeof primero === "string"',
            '        ? primero',
            '        : (primero.nombre_usuario || primero.nombre || primero.usuario);',
            '    if (!nombre) {',
            '        throw new Error("No se pudo determinar el nombre del dueño. Formato inesperado: "',
            '            + JSON.stringify(primero).slice(0, 200));',
            '    }',
            '    return nombre;',
            '}',
            '',
            '// Pide empresas/listar y devuelve el array de empresas.',
            '// Cada empresa puede ser un string o un objeto; se normaliza.',
            'async function _empresas_del_dueno(ctx, nombre_solicitante, nombre_dueno) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "empresas/listar",',
            '        nombre_solicitante,',
            '        nombre_dueno',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) {',
            '        return [];',
            '    }',
            '    const lista = r.json.empresas || [];',
            '    return lista.map(function (e) {',
            '        if (typeof e === "string") return e;',
            '        return e.nombre_usuario || e.nombre_empresa || e.nombre || null;',
            '    }).filter(function (n) { return !!n; });',
            '}',
            '',
            '// Pide vehiculos/listar para una empresa y devuelve el',
            '// array de patentes.',
            'async function _vehiculos_de_empresa(ctx, nombre_solicitante, nombre_empresa) {',
            '    const r = await ctx.pedir_post("index.php", {',
            '        accion: "vehiculos/listar",',
            '        nombre_solicitante,',
            '        nombre_empresa',
            '    });',
            '    if (!r || !r.exito || !r.json || !r.json.exito) {',
            '        return [];',
            '    }',
            '    const lista = r.json.vehiculos || [];',
            '    return lista.map(function (v) {',
            '        if (typeof v === "string") return v;',
            '        return v.patente || v.nombre_vehiculo || v.nombre || null;',
            '    }).filter(function (n) { return !!n; });',
            '}',
            '',
            '// Arma una fecha YYYY-MM-DD para mañana.',
            'function _fecha_manana() {',
            '    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);',
            '    return d.getFullYear() + "-"',
            '        + String(d.getMonth() + 1).padStart(2, "0") + "-"',
            '        + String(d.getDate()).padStart(2, "0");',
            '}',
            '',
            '// ============================================================',
            '// Prueba',
            '// ============================================================',
            '',
            'export const prueba = {',
            '    id: "eliminar_micro_limpia_nodos",',
            '    nombre: "Grafo: eliminar micro limpia los nodos",',
            '    descripcion: "Verifica que eliminar un micro destruye el subárbol completo (copia de vehículo, pisos, asientos, campos). Fase 2 del plan de optimización, v1.5piloto.74s. Mide nodos en 4 estados con grafo/resumen.",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '',
            '        const r_nombre = await ctx.nombre_usuario_actual();',
            '        if (!r_nombre || !r_nombre.exito) {',
            '            throw new Error("No se pudo leer el nombre de usuario del admin: "',
            '                + (r_nombre && r_nombre.error ? r_nombre.error : "(sin detalle)"));',
            '        }',
            '        const nombre_admin = r_nombre.nombre_usuario;',
            '',
            '        const nombre_dueno = await _primer_dueno(ctx, nombre_admin);',
            '        const N0 = await _contar_nodos(ctx, nombre_admin);',
            '',
            '        // Crear viaje de prueba.',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_viaje = "viajemicrograf" + sufijo;',
            '',
            '        const rc = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/guardar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje,',
            '            nombre: "Viaje de prueba (eliminar micro)",',
            '            fecha: _fecha_manana(),',
            '            hora: "08:00",',
            '            origen: "Origen Test",',
            '            destino: "Destino Test",',
            '            restriccion_edad: "0",',
            '            edad_minima: "18",',
            '            edad_maxima: "80",',
            '            permite_efectivo: "1",',
            '            cuotas_efectivo_max: "3",',
            '            permite_transferencia: "1",',
            '            cuotas_transferencia_max: "1",',
            '            mostrar_dj_en_terminales: "0"',
            '        });',
            '        if (!rc || !rc.exito || !rc.json || !rc.json.exito) {',
            '            throw new Error("No se pudo crear el viaje: "',
            '                + ((rc && rc.json && rc.json.error) ? rc.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const N1 = await _contar_nodos(ctx, nombre_admin);',
            '        ctx.assert(N1 > N0, "Crear el viaje no agregó nodos (N0=" + N0 + ", N1=" + N1 + ").");',
            '',
            '        // Buscar una empresa con un vehículo con asientos. Se',
            '        // itera intentando agregar el micro hasta que uno pase.',
            '        const empresas = await _empresas_del_dueno(ctx, nombre_admin, nombre_dueno);',
            '        if (empresas.length === 0) {',
            '            throw new Error("El dueño " + nombre_dueno + " no tiene empresas. Creá una antes de correr esta prueba.");',
            '        }',
            '',
            '        let nombre_micro = null;',
            '        let ultimo_error = "";',
            '        let intentos = 0;',
            '        for (const empresa of empresas) {',
            '            const vehiculos = await _vehiculos_de_empresa(ctx, nombre_admin, empresa);',
            '            for (const patente of vehiculos) {',
            '                intentos++;',
            '                const r_ag = await ctx.pedir_post("index.php", {',
            '                    accion: "viajes/agregar_micro",',
            '                    nombre_solicitante: nombre_admin,',
            '                    nombre_dueno,',
            '                    nombre_viaje,',
            '                    nombre_empresa: empresa,',
            '                    nombre_vehiculo: patente,',
            '                    monto: "1000"',
            '                });',
            '                if (r_ag && r_ag.json && r_ag.json.exito) {',
            '                    nombre_micro = r_ag.json.nombre_micro;',
            '                    break;',
            '                }',
            '                const err = (r_ag && r_ag.json && r_ag.json.error) ? r_ag.json.error : "(sin detalle)";',
            '                ultimo_error = err;',
            '                // Si el error es "no tiene asientos configurados",',
            '                // seguir con el próximo vehículo. Si es otro,',
            '                // probablemente sea algo que rompe la prueba.',
            '                if (!/asientos configurados/i.test(err)) {',
            '                    // Otros errores: seguimos intentando por si',
            '                    // es un vehículo particular. Pero guardamos',
            '                    // el error para reportarlo si ninguno anda.',
            '                }',
            '            }',
            '            if (nombre_micro) break;',
            '        }',
            '',
            '        if (!nombre_micro) {',
            '            throw new Error("Ningún vehículo del dueño " + nombre_dueno + " pudo agregarse como micro."',
            '                + " Probados " + intentos + " vehículos."',
            '                + " Último error: " + ultimo_error',
            '                + " — Asegurate de que el dueño tenga al menos una empresa con un vehículo con asientos configurados.");',
            '        }',
            '',
            '        const N2 = await _contar_nodos(ctx, nombre_admin);',
            '        ctx.assert(N2 > N1,',
            '            "Agregar el micro no agregó nodos (N1=" + N1 + ", N2=" + N2 + ").");',
            '',
            '        // Eliminar el micro.',
            '        const re = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/eliminar_micro",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje,',
            '            nombre_micro',
            '        });',
            '        if (!re || !re.exito || !re.json || !re.json.exito) {',
            '            throw new Error("No se pudo eliminar el micro: "',
            '                + ((re && re.json && re.json.error) ? re.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const N3 = await _contar_nodos(ctx, nombre_admin);',
            '        const dif_micro = N3 - N1;',
            '        ctx.assert(N3 === N1,',
            '            "eliminar_micro_de_viaje no limpió todos los nodos del micro. "',
            '            + "N1=" + N1 + ", N2=" + N2 + ", N3=" + N3',
            '            + ", diferencia vs N1=" + dif_micro + "."',
            '            + (dif_micro > 0 ? " Quedaron " + dif_micro + " nodos huérfanos del micro." : " Algo inesperado."));',
            '',
            '        // Eliminar el viaje para dejar el entorno limpio.',
            '        const rv = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/eliminar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje',
            '        });',
            '        if (!rv || !rv.exito || !rv.json || !rv.json.exito) {',
            '            throw new Error("No se pudo eliminar el viaje de limpieza: "',
            '                + ((rv && rv.json && rv.json.error) ? rv.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const N4 = await _contar_nodos(ctx, nombre_admin);',
            '        const dif_viaje = N4 - N0;',
            '        ctx.assert(N4 === N0,',
            '            "El flujo completo (crear viaje + agregar micro + eliminar micro + eliminar viaje) no volvió al estado inicial. "',
            '            + "N0=" + N0 + ", N4=" + N4 + ", diferencia=" + dif_viaje + ".");',
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