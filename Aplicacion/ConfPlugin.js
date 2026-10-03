/**
 * Configuracion propia del plugin de pruebas.
 *
 * Modifica los valores estaticos de la clase `Conf` compartida
 * por el framework. Se llama desde `arranque.js` *antes* de
 * importar el Controlador, para que la persistencia tome el
 * nombre de la BD correcto.
 *
 * @version 1.5plugin.1
 */

export function configurar_conf(Conf) {
    Conf.NOMBRE_APP = "IteradoresPluginPruebas";
    Conf.VERSION_APP = "1.5plugin.1";
    Conf.NOMBRE_BD_INDEXEDDB = "IteradoresPluginPruebas";
    Conf.SUPERESTRUCTURA_NOMBRE_BD_INDEXEDDB = "IteradoresPluginPruebas";
    Conf.SUPERESTRUCTURA_METODO_PERDURAR = "IndexedDB";
}

export const NOMBRE_GRAFO = "plugin_pruebas";
export const VERSION_PLUGIN = "1.5plugin.1";