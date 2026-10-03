/**
 * Arranque del framework Iteradores en el service worker.
 *
 * Responsabilidades:
 * - Forzar salida en modo consola (el SW no tiene document).
 * - Fijar modo desarrollo (habilita `permite_pruebas`).
 * - Configurar `Conf` con valores propios del plugin.
 * - Cargar el Controlador dinamicamente despues de configurar
 *   Conf, para que la persistencia tome el nombre correcto
 *   de la BD IndexedDB.
 *
 * @version 1.5plugin.2b
 */

import { Conf, Entorno } from "../Configuracion/index.js";
import { configurar_conf } from "./ConfPlugin.js";

// Salida consola: los caminos HTML del framework tocan document,
// que no existe en el service worker.
Entorno.establecer_salida(Entorno.SALIDA_CONSOLA);
Entorno.establecer_modo(Entorno.MODO_DESARROLLO);

// Config propia del plugin.
configurar_conf(Conf);

let _controlador = null;

/**
 * Devuelve el Controlador ya inicializado. La primera llamada
 * dispara el import dinamico del modulo `Controlador`, que
 * a su vez llama a `Controlador.inicializar()` al final de su
 * evaluacion.
 *
 * Espera activamente a que `clase_actual` quede seteada como
 * senal de que la inicializacion termino. Despues fuerza el
 * metodo de persistencia a `IndexedDB` (el framework por
 * defecto usa `EIndexedDB`).
 *
 * @returns {Promise<typeof Controlador>}
 */
export async function obtener_controlador() {
    if (_controlador && _controlador.clase_actual) return _controlador;

    const mod = await import("../Controlador/index.js");
    _controlador = mod.Controlador;

    const inicio = Date.now();
    while (!_controlador.clase_actual) {
        if (Date.now() - inicio > 5000) {
            throw new Error("El Controlador no termino de inicializar en 5s");
        }
        await new Promise((r) => setTimeout(r, 20));
    }

    try {
        _controlador.establecer_metodo("IndexedDB");
    } catch (e) {
        console.warn("No se pudo forzar IndexedDB:", e);
    }

    return _controlador;
}