<?php
/**
 * Aplicador de cambios automáticos — Plugin de pruebas (iteradoresJS).
 *
 * Tanda V1.5plugin.5e:
 *   - Prueba espejo de la Fase 2 del plan de optimización del piloto
 *     (v1.5piloto.74r): verifica que eliminar_viaje destruye el
 *     subárbol completo del viaje, no solo lo desenlaza.
 *   - Nueva sección "grafo" en el catálogo.
 *   - Bump de ConfPlugin, catálogo y prompt del plugin.
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
    // ConfPlugin.js: bump de versión
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'Bump VERSION_APP y VERSION_PLUGIN a 5e',
        'buscar' => [
            'export function configurar_conf(Conf) {',
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.5d";',
            '    Conf.NOMBRE_BD_INDEXEDDB = "IteradoresPluginPruebas";',
            '    Conf.SUPERESTRUCTURA_NOMBRE_BD_INDEXEDDB = "IteradoresPluginPruebas";',
            '    Conf.SUPERESTRUCTURA_METODO_PERDURAR = "IndexedDB";',
            '}',
        ],
        'reemplazar' => [
            'export function configurar_conf(Conf) {',
            '    Conf.NOMBRE_APP = "IteradoresPluginPruebas";',
            '    Conf.VERSION_APP = "1.5plugin.5e";',
            '    Conf.NOMBRE_BD_INDEXEDDB = "IteradoresPluginPruebas";',
            '    Conf.SUPERESTRUCTURA_NOMBRE_BD_INDEXEDDB = "IteradoresPluginPruebas";',
            '    Conf.SUPERESTRUCTURA_METODO_PERDURAR = "IndexedDB";',
            '}',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/ConfPlugin.js',
        'descripcion' => 'Bump VERSION_PLUGIN a 5e',
        'buscar' => [
            'export const NOMBRE_GRAFO = "plugin_pruebas";',
            'export const VERSION_PLUGIN = "1.5plugin.5d";',
        ],
        'reemplazar' => [
            'export const NOMBRE_GRAFO = "plugin_pruebas";',
            'export const VERSION_PLUGIN = "1.5plugin.5e";',
        ],
    ],

    // --------------------------------------------------------
    // catalogo.js: bump + import + sección
    // --------------------------------------------------------

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Bump @version de catalogo.js',
        'buscar' => [
            ' * @version 1.5plugin.4z',
            ' */',
            '',
            'import { prueba as arranque } from "./prueba_01_arranque.js";',
        ],
        'reemplazar' => [
            ' * @version 1.5plugin.5e',
            ' */',
            '',
            'import { prueba as arranque } from "./prueba_01_arranque.js";',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar import de la prueba 30',
        'buscar' => [
            'import { prueba as venta_sin_asientos } from "./prueba_17_venta_sin_asientos.js";',
            '',
            'export const SECCIONES = [',
        ],
        'reemplazar' => [
            'import { prueba as venta_sin_asientos } from "./prueba_17_venta_sin_asientos.js";',
            'import { prueba as eliminar_viaje_limpia_nodos } from "./prueba_30_eliminar_viaje_limpia_nodos.js";',
            '',
            'export const SECCIONES = [',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'Aplicacion/pruebas/catalogo.js',
        'descripcion' => 'Agregar sección grafo al final',
        'buscar' => [
            '            venta_cancelar_reabrir,',
            '            venta_sin_asientos',
            '        ]',
            '    }',
            '];',
        ],
        'reemplazar' => [
            '            venta_cancelar_reabrir,',
            '            venta_sin_asientos',
            '        ]',
            '    },',
            '    {',
            '        id: "grafo",',
            '        nombre: "Grafo",',
            '        pruebas: [',
            '            eliminar_viaje_limpia_nodos',
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
        'descripcion' => 'Prompt plugin: actualizar estado a 5e con 30 pruebas',
        'buscar' => [
            '**Proyecto en v1.5plugin.5d.** El esqueleto del plugin está',
            'armado y funcional, tiene 29 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas) y las agrupa',
            'en secciones.',
        ],
        'reemplazar' => [
            '**Proyecto en v1.5plugin.5e.** El esqueleto del plugin está',
            'armado y funcional, tiene 30 pruebas (base + autocompletado',
            '+ puntos de venta + viajes + micros + ventas + grafo) y las agrupa',
            'en secciones.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: agregar sección grafo a la lista',
        'buscar' => [
            '- `ventas`: 15 pruebas (básica, cuotas, transferencia,',
            '  asientos múltiples, ligaduras, duplicado, corrección de',
            '  DNI, montos inválidos, sin comprador, cancelar-reabrir,',
            '  sin asientos).',
        ],
        'reemplazar' => [
            '- `ventas`: 15 pruebas (básica, cuotas, transferencia,',
            '  asientos múltiples, ligaduras, duplicado, corrección de',
            '  DNI, montos inválidos, sin comprador, cancelar-reabrir,',
            '  sin asientos).',
            '- `grafo`: 1 prueba. `eliminar_viaje_limpia_nodos`',
            '  verifica que `eliminar_viaje` del piloto (v1.5piloto.74r)',
            '  destruye el subárbol completo del viaje. Mide nodos',
            '  antes y después con `grafo/resumen` y compara.',
        ],
    ],

    [
        'tipo' => 'reemplazar',
        'archivo' => 'prompts/prompt_plugin_piloto.md',
        'descripcion' => 'Prompt plugin: Última actualización',
        'buscar' => [
            '**Última actualización de este prompt:** v1.5plugin.5d (suben',
            'los timeouts del listado de viajes: 40s para la lista, 30s',
            'para el modal del viaje y 30s para los micros. Paliativo',
            'mientras el piloto se aliviana con la limpieza de viajes de',
            'prueba (v74n del piloto). Nuevo aprendizaje 44: la causa',
            'raíz está en `formatear_viaje` del piloto, que escala con',
            'V × W).',
        ],
        'reemplazar' => [
            '**Última actualización de este prompt:** v1.5plugin.5e',
            '(prueba espejo de v1.5piloto.74r: `eliminar_viaje_limpia_nodos`,',
            'primera prueba de la sección "grafo". Verifica que eliminar',
            'un viaje destruye el subárbol completo, midiendo nodos',
            'antes y después con `grafo/resumen`. Corre toda con admin,',
            'sin cambio de sesión, todo POST. Nuevo aprendizaje 45:',
            'los comandos del grafo permiten verificar fugas de nodos',
            'desde las pruebas del plugin.).',
        ],
    ],

    // --------------------------------------------------------
    // Nueva prueba (tipo crear)
    // --------------------------------------------------------

    [
        'tipo' => 'crear',
        'archivo' => 'Aplicacion/pruebas/prueba_30_eliminar_viaje_limpia_nodos.js',
        'descripcion' => 'Prueba 30: eliminar viaje limpia nodos',
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
            ' * @version 1.5plugin.5e',
            ' */',
            '',
            'import { CODIGO_ADMIN } from "../ConfPlugin.js";',
            '',
            '// ============================================================',
            '// Helpers internos',
            '// ============================================================',
            '',
            '// Pide grafo/resumen y devuelve el total de nodos.',
            '// Acepta varias formas de la respuesta por si el comando',
            '// devuelve el resumen anidado o plano.',
            'async function _contar_nodos(ctx) {',
            '    const r = await ctx.pedir_post("index.php", { accion: "grafo/resumen" });',
            '    if (!r || !r.exito) {',
            '        throw new Error("Error de red al consultar grafo/resumen: " + (r && r.error ? r.error : "(sin detalle)"));',
            '    }',
            '    if (!r.json || !r.json.exito) {',
            '        throw new Error("grafo/resumen devolvió error: " + (r.json && r.json.error ? r.json.error : "(sin detalle)")',
            '            + " — ¿está logueado el admin?");',
            '    }',
            '    const j = r.json;',
            '    let total = null;',
            '    if (typeof j.total_nodos === "number") total = j.total_nodos;',
            '    else if (j.resumen && typeof j.resumen.total_nodos === "number") total = j.resumen.total_nodos;',
            '    else if (typeof j.total === "number") total = j.total;',
            '    if (total === null || total <= 0) {',
            '        throw new Error("No se pudo leer el total de nodos. Respuesta: " + JSON.stringify(j).slice(0, 200));',
            '    }',
            '    return total;',
            '}',
            '',
            '// Pide administrador/listar_duenos y devuelve el nombre del',
            '// primer dueño. Acepta varias formas de la respuesta.',
            'async function _primer_dueno(ctx) {',
            '    const r = await ctx.pedir_post("index.php", { accion: "administrador/listar_duenos" });',
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
            '        : (primero.nombre || primero.usuario || primero.nombre_usuario);',
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
            '        const nombre_dueno = await _primer_dueno(ctx);',
            '        const N0 = await _contar_nodos(ctx);',
            '',
            '        // Crear viaje de prueba.',
            '        const sufijo = String(Date.now()).slice(-8);',
            '        const nombre_viaje = "viajelimpia" + sufijo;',
            '',
            '        const rc = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/agregar",',
            '            nombre_dueno,',
            '            nombre_viaje,',
            '            nombre: "Viaje de prueba (limpieza de nodos)",',
            '            fecha: _fecha_manana(),',
            '            hora: "08:00",',
            '            origen: "Origen Test",',
            '            destino: "Destino Test"',
            '        });',
            '        if (!rc || !rc.exito) {',
            '            throw new Error("Error de red al crear viaje: " + (rc && rc.error ? rc.error : "(sin detalle)"));',
            '        }',
            '        if (!rc.json || !rc.json.exito) {',
            '            throw new Error("viajes/agregar devolvió error: "',
            '                + (rc.json && rc.json.error ? rc.json.error : "(sin detalle)"));',
            '        }',
            '',
            '        const N1 = await _contar_nodos(ctx);',
            '        ctx.assert(N1 > N0,',
            '            "Crear el viaje no agregó nodos (N0=" + N0 + ", N1=" + N1 + ")."',
            '            + " ¿La acción viajes/agregar es la correcta?");',
            '',
            '        // Eliminar el viaje.',
            '        const rd = await ctx.pedir_post("index.php", {',
            '            accion: "viajes/eliminar",',
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
            '        const N2 = await _contar_nodos(ctx);',
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