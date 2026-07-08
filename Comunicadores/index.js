/**
 * Punto de entrada para todos los comunicadores del sistema.
 *
 * Cada import ejecuta el código del módulo, lo que provoca que el
 * comunicador se autoencole en {@link RegistroGlobal} (efecto secundario).
 * Las reexportaciones permiten acceder a las clases desde el namespace
 * `Comunicadores`.
 *
 * ## Orden de carga
 *
 * Los comunicadores de salida (consola y HTML) se cargan primero,
 * seguidos por el comunicador de archivo.
 *
 * @namespace Comunicadores
 * @since 1.3.3
 * @version 1.3.4
 */

// ─── Comunicadores de salida ────────────────────────────
import './Consola.js';
import './HTML.js';

// ─── Comunicador de archivo ─────────────────────────────
import './Archivo.js';

// ─── Reexportaciones públicas ───────────────────────────
export { Comunicador } from "./Comunicador.js";
export { Archivo } from "./Archivo.js";
export { SalidaDepuracionHTML } from "./HTML.js";
export { SalidaDepuracionConsola } from "./Consola.js";