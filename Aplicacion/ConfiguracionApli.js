/**
 * Configuración propia de la aplicación plugin de pruebas.
 *
 * Espejo de `Aplicacion/ConfiguracionApli.php` del proyecto PHP.
 * Contiene las constantes que describen a la aplicación concreta
 * (nombre, credenciales, rate limiting de autenticación, prefijo
 * de sesión) más las constantes específicas del plugin
 * (nombre del grafo, URL del piloto, códigos de acceso).
 *
 * El plugin no usa el rate limiting de autenticación (no tiene
 * login propio), pero las constantes se mantienen por espejo
 * con el piloto PHP.
 *
 * La función `configurar_conf(Conf)` aplica al `Conf` del
 * framework los valores que el framework sí necesita conocer
 * (nombre de la app, método de persistencia, nombre de la BD).
 *
 * @version 1.5plugin.5v
 * @since 1.5plugin.5v
 */

import { Entorno } from "../Configuracion/Entorno.js";

// ═══════════════════════════════════════════════════════════
// CONSTANTES DEL PILOTO (espejo del ConfiguracionApli.php)
// ═══════════════════════════════════════════════════════════

export const NOMBRE_APP = "IteradoresPluginPruebas";
export const NOMBRE_APP_CREDENCIALES = "IteradoresPluginPruebas_credenciales";
export const VERSION_APP = "1.5plugin.5v";
export const AUTOR_APP = "Ignacio David Baigorria";
export const PREFIJO_SESSION = "IteradoresPluginPruebas_";

export const INTENTOS_MAXIMOS_AUTENTICACION = 5;
export const BLOQUEO_AUTENTICACION_SEGUNDOS = 900;
export const INTENTOS_MAXIMOS_AUTENTICACION_PRUEBAS = 5;
export const BLOQUEO_AUTENTICACION_SEGUNDOS_PRUEBAS = 2;
export const HASH_DUMMY_AUTENTICACION = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
export const NOMBRE_ADMIN = "Administrador";

/**
 * Devuelve el máximo de intentos fallidos según el modo actual.
 * @returns {number}
 * @since 1.5plugin.5v
 */
export function intentos_maximos_autenticacion() {
    return Entorno.es_pruebas()
        ? INTENTOS_MAXIMOS_AUTENTICACION_PRUEBAS
        : INTENTOS_MAXIMOS_AUTENTICACION;
}

/**
 * Devuelve la duración del bloqueo (segundos) según el modo
 * actual.
 * @returns {number}
 * @since 1.5plugin.5v
 */
export function bloqueo_autenticacion_segundos() {
    return Entorno.es_pruebas()
        ? BLOQUEO_AUTENTICACION_SEGUNDOS_PRUEBAS
        : BLOQUEO_AUTENTICACION_SEGUNDOS;
}

// ═══════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL FRAMEWORK
// ═══════════════════════════════════════════════════════════

/**
 * Aplica al `Conf` del framework los valores que necesita
 * conocer. Se llama desde `arranque.js` ANTES de importar
 * el Controlador, para que la persistencia tome el nombre
 * de la BD correcto.
 *
 * @param {typeof Conf} Conf Clase `Conf` del framework.
 * @returns {void}
 */
export function configurar_conf(Conf) {
    Conf.NOMBRE_APP = NOMBRE_APP;
    Conf.VERSION_APP = VERSION_APP;
    Conf.NOMBRE_BD_INDEXEDDB = NOMBRE_APP;
    Conf.SUPERESTRUCTURA_NOMBRE_BD_INDEXEDDB = NOMBRE_APP;
    Conf.SUPERESTRUCTURA_METODO_PERDURAR = "IndexedDB";
}

// ═══════════════════════════════════════════════════════════
// CONSTANTES PROPIAS DEL PLUGIN
// ═══════════════════════════════════════════════════════════

export const NOMBRE_GRAFO = "plugin_pruebas";
export const VERSION_PLUGIN = "1.5plugin.5v";

// URL del piloto PHP. Debe estar cubierta por host_permissions
// y content_scripts.matches en manifest.json.
export const URL_PILOTO = "http://localhost/iteradores/codigo.worktrees/v1.5i/";

// Códigos de acceso de los usuarios del piloto, para las pruebas.
export const CODIGO_ADMIN     = "IDB";
export const CODIGO_DUENO     = "carmen1";
export const CODIGO_TERMINAL1 = "carmen2";
export const CODIGO_TERMINAL2 = "lujan2";
export const CODIGO_SOPORTE   = "manolo3";

// El nombre de usuario del dueño de las terminales de prueba
// no se conoce de antemano. Para crear pasajeros de prueba se
// resuelve desde el page (`window.usuario_actual.dueno`), ver
// `ctx.crear_pasajero_de_prueba` en `servicio.js`.