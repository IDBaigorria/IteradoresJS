<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda V1.5plugin.5f:
 *   - Fix de la prueba eliminar_viaje_limpia_nodos:
 *     * Nuevo helper ctx.nombre_usuario_actual() en servicio.js
 *       (lee usuario_actual.nombre_usuario del page via MAIN world).
 *     * Los POST a administrador/listar_duenos, grafo/resumen,
 *       viajes/guardar y viajes/eliminar pasan nombre_solicitante.
 *     * Se cambia viajes/agregar por viajes/guardar (la acción real
 *       del enrutador).
 *   - Bump de ConfPlugin, catálogo y prompt.
 *
 * Uso:
 *   php aplicar_cambios.php
 *
 * Si PHP no está en el PATH del sistema:
 *   C:\xampp\php\php.exe aplicar_cambios.php
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
        'descripcion' => 'Bump VERSION_APP a 5f',
        'buscar' => [
            '    Conf.VERSION_APP = "1.5plugin.5e";',
        ],
        'reemplazar' => [
            '    Conf.VERSION_APP = "1.5plugin.5f";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'Bump VERSION_PLUGIN a 5f',
        'buscar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5e";',
        ],
        'reemplazar' => [
            'export const VERSION_PLUGIN = "1.5plugin.5f";',
        ],
    ],

    // --------------------------------------------------------
    // servicio.js: bump + helper nuevo
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'Bump @version de servicio.js',
        'buscar' => [
            ' * @version 1.5plugin.4z',
            ' */',
            '',
            'import { URL_PILOTO } from "./ConfPlugin.js";',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.5f',
            ' */',
            '',
            'import { URL_PILOTO } from "./ConfPlugin.js";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/servicio.js',
        'descripcion' => 'Agregar helper nombre_usuario_actual en _crear_ctx',
        'buscar' => [
            '        liberar_asientos_propios: async () => {',
        ],
        'reemplazar' => [
            '        nombre_usuario_actual: async () => {',
            '            // Lee el nombre de usuario del usuario logueado',
            '            // desde el page context. Necesario para pasar',
            '            // `nombre_solicitante` en los POST que lo exigen',
            '            // (módulos administrador y grafo, y el chequeo',
            '            // global de permiso sobre dueño).',
            '            //',
            '            // El nombre de usuario no se conoce de antemano:',
            '            // los códigos de acceso del prompt (§6) NO son',
            '            // nombres de usuario. Se resuelve desde el page,',
            '            // igual que crear_pasajero_de_prueba resuelve el',
            '            // dueño desde usuario_actual.dueno.',
            '            try {',
            '                const r = await chrome.scripting.executeScript({',
            '                    target: { tabId: pestana_id },',
            '                    world: "MAIN",',
            '                    func: () => {',
            '                        if (typeof usuario_actual === "undefined" || !usuario_actual) {',
            '                            return { exito: false, error: "sin usuario_actual en el page" };',
            '                        }',
            '                        const nombre = usuario_actual.nombre_usuario;',
            '                        if (!nombre) {',
            '                            return { exito: false, error: "usuario_actual no tiene nombre_usuario" };',
            '                        }',
            '                        return { exito: true, nombre_usuario: nombre };',
            '                    }',
            '                });',
            '                return (r && r[0] && r[0].result) ? r[0].result : { exito: false, error: "sin resultado" };',
            '            } catch (e) {',
            '                return { exito: false, error: e.message };',
            '            }',
            '        },',
            '        liberar_asientos_propios: async () => {',
        ],
    ],

    // --------------------------------------------------------
    // catalogo.js: bump
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Bump @version de catalogo.js a 5f',
        'buscar' => [
            ' * @version 1.5plugin.5e',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.5f',
        ],
    ],

    // --------------------------------------------------------
    // Prueba 30: reescribir entera (sobrescritura)
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_30_eliminar_viaje_limpia_nodos.js',
        'descripcion' => 'Prueba 30 reescrita: usa viajes/guardar y nombre_solicitante',
        'contenido' => [
            '/**',
            ' * Prueba: eliminar_viaje limpia el subárbol completo.',
            ' *',
            ' * Verifica la Fase 2 del plan de optimización del grafo',
            ' * (v1.5piloto.74r). Antes, `eliminar_viaje` solo',
            ' * desenlazaba el viaje del contenedor del dueño: el nodo',
            ' * viaje, sus micros, copias de vehículo, asientos,',
            ' * TerminalViaje, paradas, DJs y opciones avanzadas',
            ' * quedaban huérfanos. Ahora los destruye.',
            ' *',
            ' * Mide el total de nodos antes y después con',
            ' * `grafo/resumen`, y compara. Se corre entera con admin',
            ' * logueado: el admin tiene acceso al grafo y puede crear',
            ' * y eliminar viajes de cualquier dueño vía POST.',
            ' *',
            ' * Nota: la prueba crea un viaje sin micros. Alcanza para',
            ' * verificar que la destrucción del subárbol del viaje',
            ' * (contenedores, campos, DJs, opciones) funciona. La parte',
            ' * de micros + copia de vehículo + asientos se verifica',
            ' * aparte (pendiente).',
            ' *',
            ' * @version 1.5plugin.5f',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            '',
            '// ============================================================',
            '// Helpers internos',
            '// ============================================================',
            '',
            '// Pide grafo/resumen y devuelve el total de nodos.',
            '// El módulo `grafo` del enrutador exige nombre_solicitante',
            '// con nivel admin o soporte.',
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
            '// primer dueño. El módulo `administrador` exige',
            '// nombre_solicitante con nivel admin o soporte.',
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
            '    const j = r.json;',
            '    const lista = j.duenos || j.usuarios || j.lista || [];',
            '    if (!Array.isArray(lista) || lista.length === 0) {',
            '        throw new Error("No hay dueños disponibles para la prueba. Creá uno desde el panel admin.");',
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
            '    id: "eliminar_viaje_limpia_nodos",',
            '    nombre: "Grafo: eliminar viaje limpia los nodos",',
            '    descripcion: "Verifica que eliminar un viaje destruye el subárbol completo (Fase 2 del plan de optimización, v1.5piloto.74r). Mide el total de nodos con grafo/resumen antes y después, y compara.",',
            '    async ejecutar(ctx) {',
            '        await ctx.asegurar_login(CODIGO_ADMIN);',
            '',
            '        // El nombre de usuario del admin no se conoce de antemano.',
            '        // Se lee del page context (usuario_actual.nombre_usuario).',
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
            '        // Crear viaje de prueba. La acción del enrutador es',
            '        // viajes/guardar (alta o edición unificada).',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_viaje = "viajelimpia" + sufijo;',
            '',
            '        const rc = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/guardar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje,',
            '            nombre: "Viaje de prueba (limpieza de nodos)",',
            '            fecha: _fecha_manana(),',
            '            hora: "08:00",',
            '            origen: "Origen Test",',
            '            destino: "Destino Test",',
            '            // Defaults de opciones avanzadas (los exige',
            '            // guardar_viaje_completo).',
            '            restriccion_edad: "0",',
            '            edad_minima: "18",',
            '            edad_maxima: "80",',
            '            permite_efectivo: "1",',
            '            cuotas_efectivo_max: "3",',
            '            permite_transferencia: "1",',
            '            cuotas_transferencia_max: "1",',
            '            mostrar_dj_en_terminales: "0"',
            '        });',
            '        if (!rc || !rc.exito) {',
            '            throw new Error("Error de red al crear viaje: " + (rc && rc.error ? rc.error : "(sin detalle)"));',
            '        }',
            '        if (!rc.json || !rc.json.exito) {',
            '            throw new Error("viajes/guardar devolvió error: "',
            '                + (rc.json && rc.json.error ? rc.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const N1 = await _contar_nodos(ctx, nombre_admin);',
            '        ctx.assert(N1 > N0,',
            '            "Crear el viaje no agregó nodos (N0=" + N0 + ", N1=" + N1 + ")."',
            '            + " ¿La acción viajes/guardar es la correcta?");',
            '',
            '        // Eliminar el viaje.',
            '        const rd = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/eliminar",',
            '            nombre_solicitante: nombre_admin,',
            '            nombre_dueno,',
            '            nombre_viaje',
            '        });',
            '        if (!rd || !rd.exito) {',
            '            throw new Error("Error de red al eliminar viaje: " + (rd && rd.error ? rd.error : "(sin detalle)"));',
            '        }',
            '        if (!rd.json || !rd.json.exito) {',
            '            throw new Error("viajes/eliminar devolvió error: "',
            '                + (rd.json && rd.json.error ? rd.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const N2 = await _contar_nodos(ctx, nombre_admin);',
            '        const dif = N2 - N0;',
            '        ctx.assert(N2 === N0,',
            '            "eliminar_viaje no limpió todos los nodos. "',
            '            + "N0=" + N0 + ", N1=" + N1 + ", N2=" + N2',
            '            + ", diferencia=" + dif + "."',
            '            + (dif > 0',
            '                ? " Quedaron " + dif + " nodos huérfanos."',
            '                : " ¿Se creó o destruyó algo inesperado?"));',
            '    }',
            '};',
        ],
    ],

    // --------------------------------------------------------
    // Prompt del plugin
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: última actualización a 5f',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.5e',
            '(prueba espejo de v1.5piloto.74r: `eliminar_viaje_limpia_nodos`,',
            'primera prueba de la sección "grafo". Verifica que eliminar',
            'un viaje destruye el subárbol completo, midiendo nodos',
            'antes y después con `grafo/resumen`. Corre toda con admin,',
            'sin cambio de sesión, todo POST. Nuevo aprendizaje 45:',
            'los comandos del grafo permiten verificar fugas de nodos',
            'desde las pruebas del plugin.).',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.5f',
            '(fix de `eliminar_viaje_limpia_nodos`: el módulo',
            '`administrador` y el módulo `grafo` del enrutador del',
            'piloto exigen `nombre_solicitante` con nivel admin o',
            'soporte en cada POST. La prueba ahora lee el nombre de',
            'usuario del admin desde el page context con el nuevo',
            'helper `ctx.nombre_usuario_actual()` (MAIN world, lee',
            '`usuario_actual.nombre_usuario`), y lo pasa en los 4',
            'POST. Además, la acción para crear viaje es',
            '`viajes/guardar`, no `viajes/agregar`. Nuevo aprendizaje',
            '45: los módulos del enrutador con chequeo de nivel',
            'exigen `nombre_solicitante`; sin él, responden',
            '"Permiso denegado" aunque haya sesión activa.).',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: agregar aprendizaje 45 y 46',
        'buscar' => [
            '44. **Los timeouts largos son una curita, no una solución.**',
            '    Cada vez que subimos timeouts (5b, 5c, 5d) es porque el',
            '    piloto se puso más lento por acumulación de datos en el',
            '    grafo. La causa raíz está en `formatear_viaje` del',
            '    piloto: escala con V × W (viajes × ventas), porque por',
            '    cada viaje recorre todas las ventas del dueño dos veces',
            '    (`viaje_tiene_ventas` y `vendidos_por_micro`). Con 21',
            '    viajes × 24 ventas, eso son ~500 iteraciones por cada',
            '    listado. La limpieza de viajes de prueba (v74n del',
            '    piloto) alivia el problema. La optimización real',
            '    (índice de ventas por viaje, cacheo de contadores) es',
            '    una tanda aparte del piloto. Regla del plugin: aceptar',
            '    timeouts largos como paliativo, pero anotar la causa',
            '    raíz cuando se identifique.',
        ],
        'reemplazar' => [
            '44. **Los timeouts largos son una curita, no una solución.**',
            '    Cada vez que subimos timeouts (5b, 5c, 5d) es porque el',
            '    piloto se puso más lento por acumulación de datos en el',
            '    grafo. La causa raíz está en `formatear_viaje` del',
            '    piloto: escala con V × W (viajes × ventas), porque por',
            '    cada viaje recorre todas las ventas del dueño dos veces',
            '    (`viaje_tiene_ventas` y `vendidos_por_micro`). Con 21',
            '    viajes × 24 ventas, eso son ~500 iteraciones por cada',
            '    listado. La limpieza de viajes de prueba (v74n del',
            '    piloto) alivia el problema. La optimización real',
            '    (índice de ventas por viaje, cacheo de contadores) es',
            '    una tanda aparte del piloto. Regla del plugin: aceptar',
            '    timeouts largos como paliativo, pero anotar la causa',
            '    raíz cuando se identifique.',
            '45. **Los módulos del enrutador con chequeo de nivel',
            '    exigen `nombre_solicitante`.** Los módulos',
            '    `administrador` y `grafo` del piloto leen',
            '    `$post[\'nombre_solicitante\']`, resuelven el nivel del',
            '    usuario en el grafo y, si no es admin o soporte,',
            '    responden `{"exito": false, "error": "Permiso denegado"}`.',
            '    Estar logueado NO alcanza: el enrutador no deduce el',
            '    usuario de la sesión, lo recibe por POST. Regla: cualquier',
            '    `ctx.pedir_post` a esos módulos (o a cualquier módulo',
            '    con chequeo de nivel) tiene que pasar',
            '    `nombre_solicitante`. El nombre no se conoce de antemano',
            '    (los códigos de acceso NO son nombres de usuario, ver',
            '    §6): se resuelve con `ctx.nombre_usuario_actual()`',
            '    (nuevo helper en 5f), que lee',
            '    `usuario_actual.nombre_usuario` del page context.',
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