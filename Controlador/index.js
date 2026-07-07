/**
 * Punto de entrada del módulo Controlador.
 *
 * Reexporta las clases principales del sistema de control:
 * {@link Controlador} (orquestador), {@link RegistroGlobal}
 * (buzón de autoencolación) y las nuevas incorporaciones
 * de la versión 1.4.6: {@link Senal}, {@link Antena},
 * {@link ProcesadorDeDominio}, {@link AplanadorSenal} y
 * {@link MapeoBytesMatrices}.
 *
 * @namespace Controlador
 * @since 1.3.0
 * @version 1.4.6
 */
export { Controlador } from './Controlador.js';
export { RegistroGlobal } from './RegistroGlobal.js';
export { Senal } from './Senal.js';
export { Antena } from './Antena.js';
export { ProcesadorDeDominio } from './ProcesadorDeDominio.js';
export { AplanadorSenal } from './AplanadorSenal.js';
export { MapeoBytesMatrices } from './MapeoBytesMatrices.js';