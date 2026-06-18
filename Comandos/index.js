/**
 * Punto de entrada para todos los comandos del sistema.
 *
 * Cada import ejecuta el código del módulo, lo que provoca que el comando
 * se autoencole en {@link RegistroGlobal} (efecto secundario).
 * Las reexportaciones permiten acceder a las clases desde el namespace
 * `Comandos`.
 *
 * ## Orden de carga
 *
 * El orden de los imports no es crítico, pero se agrupan por categoría
 * (Depuración, Prueba) para facilitar el mantenimiento.
 *
 * @namespace Comandos
 * @since 1.3.0
 * @version 1.3.4
 */

// ─── Comandos de depuración ─────────────────────────────
import './Depuracion/imprimir.js';
import './Depuracion/limpiar.js';
import './Depuracion/recoleccion.js';

// ─── Comandos de prueba ─────────────────────────────────
import './Prueba/CrearNodo.js';

// ─── Reexportaciones públicas ───────────────────────────
export { Comando } from "./Comando.js";
export { ComandoDepuracionImprimir } from "./Depuracion/imprimir.js";
export { ComandoDepuracionLimpiar } from "./Depuracion/limpiar.js";
export { ComandoDepuracionRecoleccion } from "./Depuracion/recoleccion.js";
export { ComandoPruebaCrearNodo } from "./Prueba/CrearNodo.js";