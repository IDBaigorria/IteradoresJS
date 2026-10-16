/**
 * Arranque del framework Iteradores en el service worker.
 *
 * Responsabilidades:
 * - Configurar Conf y Entorno ANTES de que el Controlador
 *   se inicialice. Eso lo hace `arranque_config.js` (efecto
 *   de lado), que se importa PRIMERO.
 * - Exponer `obtener_controlador()`, que espera activamente
 *   a que el Controlador termine de inicializar y fuerza el
 *   método de persistencia a IndexedDB una sola vez.
 *
 * IMPORTANTE: los imports son ESTÁTICOS. Chrome MV3 no
 * permite `import()` dinámico en el ServiceWorkerGlobalScope
 * (spec: "import() is disallowed on ServiceWorkerGlobalScope
 * by the HTML specification", w3c/ServiceWorker#1356).
 * El prompt §3.2 lo documenta.
 *
 * @version 1.5plugin.8d
 * @since 1.5plugin.5t
 */

// Efecto de lado: configura Conf y Entorno ANTES de que
// se evalúe el módulo del Controlador. El ORDEN de los
// imports importa: ES evalúa depth-first en orden de
// aparición. NO mover esta línea.
import "./arranque_config.js";
import { Controlador } from "../Controlador/index.js";

let _metodo_forzado = false;

/**
 * Devuelve el Controlador ya inicializado. Espera activamente
 * a que `clase_actual` quede seteada como señal de que la
 * inicialización terminó. Después fuerza el método de
 * persistencia a `IndexedDB` una sola vez.
 *
 * @returns {Promise<typeof Controlador>}
 */
export async function obtener_controlador() {
    const inicio = Date.now();
    while (!Controlador.clase_actual) {
        if (Date.now() - inicio > 5000) {
            throw new Error("El Controlador no terminó de inicializar en 5s");
        }
        await new Promise((r) => setTimeout(r, 20));
    }

    if (!_metodo_forzado) {
        try {
            Controlador.establecer_metodo("IndexedDB");
        } catch (e) {
            console.warn("No se pudo forzar IndexedDB:", e);
        }
        _metodo_forzado = true;
    }

    return Controlador;
}