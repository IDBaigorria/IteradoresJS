<?php
/**
 * Aplicador de cambios automáticos — Proyecto JS (framework + plugin).
 *
 * Tanda V1.5i.7h (framework) / V1.5plugin.5t (plugin):
 *   - Separar la configuración del framework (`Conf`) de la
 *     configuración del plugin (`ConfiguracionApli`).
 *   - Renombrar `Aplicacion/ConfPlugin.js` a
 *     `Aplicacion/ConfiguracionApli.js`.
 *   - Espejar las constantes del piloto + métodos conmutados
 *     de auth.
 *   - Actualizar imports en 41 archivos.
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

// Lista de archivos del plugin que importan ConfPlugin.js.
// Generada desde el Select-String del usuario.
$archivos_con_import_confplugin = [
    'Aplicacion/arranque.js',
    'Aplicacion/GrafoPlugin.js',
    'Aplicacion/servicio.js',
    'Aplicacion/pruebas/_helpers.js',
    'Aplicacion/pruebas/prueba_02_login.js',
    'Aplicacion/pruebas/prueba_18_autocompletado_dni_terminal_clientes.js',
    'Aplicacion/pruebas/prueba_19_alta_terminal.js',
    'Aplicacion/pruebas/prueba_20_alta_viaje.js',
    'Aplicacion/pruebas/prueba_21_alta_micro.js',
    'Aplicacion/pruebas/prueba_22_micro_sin_empresa.js',
    'Aplicacion/pruebas/prueba_23_micro_sin_vehiculo.js',
    'Aplicacion/pruebas/prueba_24_micro_monto_vacio.js',
    'Aplicacion/pruebas/prueba_25_micro_monto_negativo.js',
    'Aplicacion/pruebas/prueba_26_micro_cancelar.js',
    'Aplicacion/pruebas/prueba_27_micro_mismo_vehiculo.js',
    'Aplicacion/pruebas/prueba_28_micro_vehiculo_sin_asientos.js',
    'Aplicacion/pruebas/prueba_29_micro_colision_numeracion.js',
    'Aplicacion/pruebas/prueba_30_eliminar_viaje_limpia_nodos.js',
    'Aplicacion/pruebas/prueba_31_eliminar_micro_limpia_nodos.js',
    'Aplicacion/pruebas/prueba_32_eliminar_terminal_limpia_nodos.js',
    'Aplicacion/pruebas/prueba_33_editar_paradas_limpia_nodos.js',
    'Aplicacion/pruebas/prueba_34_cancelar_venta_limpia_nodos.js',
    'Aplicacion/pruebas/prueba_35_deseleccionar_asiento_limpia_nodos.js',
    'Aplicacion/pruebas/prueba_36_cambiar_micro_a_mitad_limpia_nodos.js',
    'Aplicacion/pruebas/prueba_37_eliminar_vehiculo_limpia_nodos.js',
    'Aplicacion/pruebas/prueba_38_eliminar_empresa_limpia_nodos.js',
    'Aplicacion/pruebas/prueba_39_limpiar_viajes_prueba_limpia_nodos.js',
    'Aplicacion/pruebas/prueba_40_eliminar_usuario_limpia_nodos.js',
    'Aplicacion/pruebas/prueba_41_eliminar_pasajero_limpia_nodos.js',
    'Aplicacion/pruebas/prueba_42_editar_paradas_sin_hora_limpia_nodos.js',
    'Aplicacion/pruebas/prueba_43_listar_viajes_indice_comportamiento.js',
    'Aplicacion/pruebas/prueba_44_cerrar_sesion_cierra_modales.js',
    'Aplicacion/pruebas/prueba_45_alta_empresa.js',
    'Aplicacion/pruebas/prueba_46_empresa_nombre_vacio.js',
    'Aplicacion/pruebas/prueba_47_empresa_cancelar.js',
    'Aplicacion/pruebas/prueba_48_alta_vehiculo.js',
    'Aplicacion/pruebas/prueba_49_vehiculo_patente_vacia.js',
    'Aplicacion/pruebas/prueba_50_vehiculo_cancelar.js',
    'Aplicacion/pruebas/prueba_51_dj_pasajero_subir.js',
    'Aplicacion/pruebas/prueba_52_dj_pasajero_reemplazar.js',
    'Aplicacion/pruebas/prueba_53_dj_pasajero_eliminar.js',
];

// ============================================================
// Cambios a aplicar
// ============================================================

$cambios = [];

// ------------------------------------------------------------
// FRAMEWORK — Configuracion/Configuracion.js
// ------------------------------------------------------------

$cambios[] = [
    'tipo' => 'reemplazar',
    'archivo' => 'Configuracion/Configuracion.js',
    'descripcion' => 'Configuracion.js: agregar header + bump a 1.5i.7h',
    'buscar' => [
        '/**',
        ' * Clase de configuración global de la aplicación.',
        ' * Todas las propiedades son estáticas e inmutables.',
        ' *',
        ' * @author Ignacio David Baigorria',
        ' * ',
        ' * @class',
        ' * @memberof Configuracion',
        ' *',
        ' */',
        'class Conf {',
    ],
    'reemplazar' => [
        '/**',
        ' * Clase de configuración del framework.',
        ' * Todas las propiedades son estáticas.',
        ' *',
        ' * Solo contiene constantes propias del framework. Las constantes',
        ' * específicas de una aplicación viven en su propio módulo de',
        ' * configuración (por ejemplo, `Aplicacion/ConfiguracionApli.js`).',
        ' *',
        ' * @author Ignacio David Baigorria',
        ' * @version 1.5i.7h',
        ' * @since 1.5i.7h',
        ' * @class',
        ' * @memberof Configuracion',
        ' */',
        'class Conf {',
    ],
];

$cambios[] = [
    'tipo' => 'reemplazar',
    'archivo' => 'Configuracion/Configuracion.js',
    'descripcion' => 'Configuracion.js: quitar constantes del piloto',
    'buscar' => [
        '  /**',
        '   * Nombre de la aplicación ',
        '   * @type {string}  */',
        '  static NOMBRE_APP = "MiSuperApp";',
        '',
        '  /**',
        '   * Versión de la aplicación ',
        '   * @type {string}  */',
        '  static VERSION_APP = "0.0.0";',
        '',
        '  /**',
        '   * Autor de la aplicación  ',
        '   * @type {string}*/',
        '  static AUTOR_APP = "Ignacio David Baigorria";',
        '',
        '  /**',
        '   * Prefijo de sesión basado en el nombre de la app',
        '   *  @type {string}  */',
        '  static PREFIJO_SESSION = Conf.NOMBRE_APP + "_";',
        '',
        '  /** ',
        '   * Si se ejecuta en localhost',
        '   * @type {boolean}  */',
        '  static LOCAL = true;',
    ],
    'reemplazar' => [
        '  /** ',
        '   * Si se ejecuta en localhost',
        '   * @type {boolean}  */',
        '  static LOCAL = true;',
        '',
        '  // Nota (v1.5plugin.5t): las constantes propias de la',
        '  // aplicación (NOMBRE_APP, VERSION_APP, AUTOR_APP,',
        '  // PREFIJO_SESSION, NOMBRE_APP_CREDENCIALES) se movieron al',
        '  // módulo `Aplicacion/ConfiguracionApli.js`. Este archivo',
        '  // contiene solo las del framework.',
    ],
];

// ------------------------------------------------------------
// FRAMEWORK — Configuracion/Entorno.js
// ------------------------------------------------------------

$cambios[] = [
    'tipo' => 'reemplazar',
    'archivo' => 'Configuracion/Entorno.js',
    'descripcion' => 'Entorno.js: bump a 1.3.7',
    'buscar' => [
        ' * @author Ignacio David Baigorria',
        ' * @version 1.3.6',
        ' * @since 1.2.6',
    ],
    'reemplazar' => [
        ' * @author Ignacio David Baigorria',
        ' * @version 1.3.7',
        ' * @since 1.2.6',
    ],
];

$cambios[] = [
    'tipo' => 'reemplazar',
    'archivo' => 'Configuracion/Entorno.js',
    'descripcion' => 'Entorno.js: agregar prefijo_sesion (getter/setter)',
    'buscar' => [
        '    /**',
        '     * Verifica si la persistencia es XML.',
        '     * @returns {boolean}',
        '     */',
        '    es_persistencia_xml() {',
        '        return this.persistencia() === this.PERSISTENCIA_XML;',
        '    },',
        '',
        '   // ═══════════════════════════════════════════════════════════',
        '    // UBICACIÓN GEOGRÁFICA (v1.3.6)',
        '    // ═══════════════════════════════════════════════════════════',
    ],
    'reemplazar' => [
        '    /**',
        '     * Verifica si la persistencia es XML.',
        '     * @returns {boolean}',
        '     */',
        '    es_persistencia_xml() {',
        '        return this.persistencia() === this.PERSISTENCIA_XML;',
        '    },',
        '',
        '    // ══════════════════════════════════════════════',
        '    // PREFIJO DE SESIÓN (v1.5i.7h)',
        '    // ══════════════════════════════════════════════',
        '',
        '    /**',
        '     * Prefijo usado para las claves de sesión que el framework',
        '     * guarda. El framework no conoce el nombre de la aplicación;',
        '     * el piloto llama a `establecer_prefijo_sesion()` al arrancar',
        '     * para alinear las claves con su propio nombre.',
        '     *',
        '     * @type {string}',
        '     * @since 1.5i.7h',
        '     */',
        '    _prefijo_sesion: \'iteradores_\',',
        '',
        '    /**',
        '     * Define el prefijo de sesión que el framework usará.',
        '     *',
        '     * @param {string} prefijo',
        '     * @returns {void}',
        '     * @since 1.5i.7h',
        '     */',
        '    establecer_prefijo_sesion(prefijo) {',
        '        this._prefijo_sesion = prefijo;',
        '    },',
        '',
        '    /**',
        '     * Devuelve el prefijo de sesión actual.',
        '     *',
        '     * @returns {string}',
        '     * @since 1.5i.7h',
        '     */',
        '    prefijo_sesion() {',
        '        return this._prefijo_sesion;',
        '    },',
        '',
        '   // ═══════════════════════════════════════════════════════════',
        '    // UBICACIÓN GEOGRÁFICA (v1.3.6)',
        '    // ═══════════════════════════════════════════════════════════',
    ],
];

// ------------------------------------------------------------
// Aplicacion/arranque.js
// ------------------------------------------------------------

$cambios[] = [
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/arranque.js',
    'descripcion' => 'arranque.js: bump a 1.5plugin.5t',
    'buscar' => [' * @version 1.5plugin.2b'],
    'reemplazar' => [' * @version 1.5plugin.5t'],
];

// ------------------------------------------------------------
// Aplicacion/servicio.js
// ------------------------------------------------------------

$cambios[] = [
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/servicio.js',
    'descripcion' => 'servicio.js: bump a 1.5plugin.5t',
    'buscar' => [' * @version 1.5plugin.5s'],
    'reemplazar' => [' * @version 1.5plugin.5t'],
];

// ------------------------------------------------------------
// Aplicacion/GrafoPlugin.js
// ------------------------------------------------------------

$cambios[] = [
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/GrafoPlugin.js',
    'descripcion' => 'GrafoPlugin.js: bump a 1.5plugin.5t',
    'buscar' => [' * @version 1.5plugin.2a'],
    'reemplazar' => [' * @version 1.5plugin.5t'],
];

// ------------------------------------------------------------
// Aplicacion/pruebas/_helpers.js
// ------------------------------------------------------------

$cambios[] = [
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/pruebas/_helpers.js',
    'descripcion' => '_helpers.js: bump a 1.5plugin.5t',
    'buscar' => [' * @version 1.5plugin.5d'],
    'reemplazar' => [' * @version 1.5plugin.5t'],
];

// ------------------------------------------------------------
// Aplicacion/pruebas/prueba_45_alta_empresa.js
// ------------------------------------------------------------

$cambios[] = [
    'tipo' => 'reemplazar',
    'archivo' => 'Aplicacion/pruebas/prueba_45_alta_empresa.js',
    'descripcion' => 'prueba_45: bump a 1.5plugin.5t',
    'buscar' => [' * @version 1.5plugin.5r-fix'],
    'reemplazar' => [' * @version 1.5plugin.5t'],
];

// ------------------------------------------------------------
// Renombrar imports: ConfPlugin.js -> ConfiguracionApli.js
// (41 archivos, con 'todos' => true porque pueden aparecer
//  una sola vez en cada uno, pero es más robusto así)
// ------------------------------------------------------------

foreach ($archivos_con_import_confplugin as $arch) {
    $cambios[] = [
        'tipo' => 'reemplazar',
        'archivo' => $arch,
        'todos' => true,
        'descripcion' => "Import ConfPlugin -> ConfiguracionApli en $arch",
        'buscar' => ['ConfPlugin.js'],
        'reemplazar' => ['ConfiguracionApli.js'],
    ];
}

// ------------------------------------------------------------
// Aplicacion/ConfiguracionApli.js (nuevo)
// ------------------------------------------------------------

$cambios[] = [
    'tipo' => 'crear',
    'archivo' => 'Aplicacion/ConfiguracionApli.js',
    'descripcion' => 'ConfiguracionApli.js (nuevo, espejo del PHP)',
    'contenido' => [
        '/**',
        ' * Configuración propia de la aplicación plugin de pruebas.',
        ' *',
        ' * Espejo de `Aplicacion/ConfiguracionApli.php` del proyecto PHP.',
        ' * Contiene las constantes que describen a la aplicación concreta',
        ' * (nombre, credenciales, rate limiting de autenticación, prefijo',
        ' * de sesión) más las constantes específicas del plugin',
        ' * (nombre del grafo, URL del piloto, códigos de acceso).',
        ' *',
        ' * El plugin no usa el rate limiting de autenticación (no tiene',
        ' * login propio), pero las constantes se mantienen por espejo',
        ' * con el piloto PHP.',
        ' *',
        ' * La función `configurar_conf(Conf)` aplica al `Conf` del',
        ' * framework los valores que el framework sí necesita conocer',
        ' * (nombre de la app, método de persistencia, nombre de la BD).',
        ' *',
        ' * @version 1.5plugin.5t',
        ' * @since 1.5plugin.5t',
        ' */',
        '',
        'import { Entorno } from "../Configuracion/Entorno.js";',
        '',
        '// ═══════════════════════════════════════════════════════════',
        '// CONSTANTES DEL PILOTO (espejo del ConfiguracionApli.php)',
        '// ═══════════════════════════════════════════════════════════',
        '',
        'export const NOMBRE_APP = "IteradoresPluginPruebas";',
        'export const NOMBRE_APP_CREDENCIALES = "IteradoresPluginPruebas_credenciales";',
        'export const VERSION_APP = "1.5plugin.5t";',
        'export const AUTOR_APP = "Ignacio David Baigorria";',
        'export const PREFIJO_SESSION = "IteradoresPluginPruebas_";',
        '',
        'export const INTENTOS_MAXIMOS_AUTENTICACION = 5;',
        'export const BLOQUEO_AUTENTICACION_SEGUNDOS = 900;',
        'export const INTENTOS_MAXIMOS_AUTENTICACION_PRUEBAS = 5;',
        'export const BLOQUEO_AUTENTICACION_SEGUNDOS_PRUEBAS = 2;',
        'export const HASH_DUMMY_AUTENTICACION = \'$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi\';',
        'export const NOMBRE_ADMIN = "Administrador";',
        '',
        '/**',
        ' * Devuelve el máximo de intentos fallidos según el modo actual.',
        ' * @returns {number}',
        ' * @since 1.5plugin.5t',
        ' */',
        'export function intentos_maximos_autenticacion() {',
        '    return Entorno.es_pruebas()',
        '        ? INTENTOS_MAXIMOS_AUTENTICACION_PRUEBAS',
        '        : INTENTOS_MAXIMOS_AUTENTICACION;',
        '}',
        '',
        '/**',
        ' * Devuelve la duración del bloqueo (segundos) según el modo',
        ' * actual.',
        ' * @returns {number}',
        ' * @since 1.5plugin.5t',
        ' */',
        'export function bloqueo_autenticacion_segundos() {',
        '    return Entorno.es_pruebas()',
        '        ? BLOQUEO_AUTENTICACION_SEGUNDOS_PRUEBAS',
        '        : BLOQUEO_AUTENTICACION_SEGUNDOS;',
        '}',
        '',
        '// ═══════════════════════════════════════════════════════════',
        '// CONFIGURACIÓN DEL FRAMEWORK',
        '// ═══════════════════════════════════════════════════════════',
        '',
        '/**',
        ' * Aplica al `Conf` del framework los valores que necesita',
        ' * conocer. Se llama desde `arranque.js` ANTES de importar',
        ' * el Controlador, para que la persistencia tome el nombre',
        ' * de la BD correcto.',
        ' *',
        ' * @param {typeof Conf} Conf Clase `Conf` del framework.',
        ' * @returns {void}',
        ' */',
        'export function configurar_conf(Conf) {',
        '    Conf.NOMBRE_APP = NOMBRE_APP;',
        '    Conf.VERSION_APP = VERSION_APP;',
        '    Conf.NOMBRE_BD_INDEXEDDB = NOMBRE_APP;',
        '    Conf.SUPERESTRUCTURA_NOMBRE_BD_INDEXEDDB = NOMBRE_APP;',
        '    Conf.SUPERESTRUCTURA_METODO_PERDURAR = "IndexedDB";',
        '}',
        '',
        '// ═══════════════════════════════════════════════════════════',
        '// CONSTANTES PROPIAS DEL PLUGIN',
        '// ═══════════════════════════════════════════════════════════',
        '',
        'export const NOMBRE_GRAFO = "plugin_pruebas";',
        'export const VERSION_PLUGIN = "1.5plugin.5t";',
        '',
        '// URL del piloto PHP. Debe estar cubierta por host_permissions',
        '// y content_scripts.matches en manifest.json.',
        'export const URL_PILOTO = "http://localhost/iteradores/codigo.worktrees/v1.5i/";',
        '',
        '// Códigos de acceso de los usuarios del piloto, para las pruebas.',
        'export const CODIGO_ADMIN     = "IDB";',
        'export const CODIGO_DUENO     = "carmen1";',
        'export const CODIGO_TERMINAL1 = "carmen2";',
        'export const CODIGO_TERMINAL2 = "lujan2";',
        'export const CODIGO_SOPORTE   = "manolo3";',
        '',
        '// El nombre de usuario del dueño de las terminales de prueba',
        '// no se conoce de antemano. Para crear pasajeros de prueba se',
        '// resuelve desde el page (`window.usuario_actual.dueno`), ver',
        '// `ctx.crear_pasajero_de_prueba` en `servicio.js`.',
    ],
];

// ------------------------------------------------------------
// Eliminar ConfPlugin.js
// ------------------------------------------------------------

$cambios[] = [
    'tipo' => 'eliminar',
    'archivo' => 'Aplicacion/ConfPlugin.js',
    'descripcion' => 'ConfPlugin.js renombrado a ConfiguracionApli.js',
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