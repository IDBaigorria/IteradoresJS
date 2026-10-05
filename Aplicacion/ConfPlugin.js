/**
 * Configuracion propia del plugin de pruebas.
 *
 * Modifica los valores estaticos de la clase `Conf` compartida
 * por el framework. Se llama desde `arranque.js` *antes* de
 * importar el Controlador, para que la persistencia tome el
 * nombre de la BD correcto.
 *
 * @version 1.5plugin.4nml
 */

export function configurar_conf(Conf) {
    Conf.NOMBRE_APP = "IteradoresPluginPruebas";
    Conf.VERSION_APP = "1.5plugin.5i";
    Conf.NOMBRE_BD_INDEXEDDB = "IteradoresPluginPruebas";
    Conf.SUPERESTRUCTURA_NOMBRE_BD_INDEXEDDB = "IteradoresPluginPruebas";
    Conf.SUPERESTRUCTURA_METODO_PERDURAR = "IndexedDB";
}

export const NOMBRE_GRAFO = "plugin_pruebas";
export const VERSION_PLUGIN = "1.5plugin.5i";

// URL del piloto PHP. Debe estar cubierta por host_permissions
// y content_scripts.matches en manifest.json.
export const URL_PILOTO = "http://localhost/iteradores/codigo.worktrees/v1.5i/";

// Codigos de acceso de los usuarios del piloto, para las pruebas.
export const CODIGO_ADMIN     = "IDB";
export const CODIGO_DUENO     = "carmen1";
export const CODIGO_TERMINAL1 = "carmen2";
export const CODIGO_TERMINAL2 = "lujan2";
export const CODIGO_SOPORTE   = "manolo3";

// El nombre de usuario del dueño de las terminales de prueba
// no se conoce de antemano. Para crear pasajeros de prueba se
// resuelve desde el page (`window.usuario_actual.dueno`), ver
// `ctx.crear_pasajero_de_prueba` en `servicio.js`.