/**
 * Punto de entrada del módulo Controlador.
 *
 * Reexporta las clases principales del sistema de control:
 * {@link Controlador} (orquestador) y {@link RegistroGlobal}
 * (buzón de autoencolación para dependencias circulares).
 *
 * @namespace Controlador
 * @since 1.3.0
 * @version 1.3.4
 */
export { Controlador } from './Controlador.js';
export { RegistroGlobal } from './RegistroGlobal.js';