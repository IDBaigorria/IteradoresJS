/**
 * Define el contrato mínimo que debe cumplir un comunicador.
 *
 * A partir de la versión 1.4.7, los métodos de entrada/salida trabajan
 * directamente con {@link Senal}, eliminando parámetros genéricos.
 * Cada implementación es responsable de la conversión entre el medio
 * nativo y la representación canónica de señales.
 *
 * @author Ignacio David Baigorria
 * 
 * @interface
 * @memberof Comunicadores
 * @since 1.3.3
 * @version 1.4.7
 */
class Comunicador {
    /**
     * Nombre único del comunicador (ej. 'http', 'archivo').
     * @returns {string}
     * @since 1.3.3
     */
    static nombre() {
        throw new Error("Método nombre() debe ser implementado.");
    }

    /**
     * Indica si el comunicador solo debe estar disponible en desarrollo.
     * @returns {boolean}
     * @since 1.3.3
     */
    static solo_desarrollo() {
        throw new Error("Método solo_desarrollo() debe ser implementado.");
    }

    /**
     * Breve descripción del comunicador.
     * @returns {string}
     * @since 1.3.3
     */
    static descripcion() {
        throw new Error("Método descripcion() debe ser implementado.");
    }

    /**
     * Envía una señal a un destino.
     *
     * @param {string} destino Identificador del destino (ruta, URL…).
     * @param {Senal}  senal   Señal a transmitir.
     * @returns {void|Promise<void>}
     * @since 1.3.3
     * @version 1.4.7
     */
    enviar(destino, senal) {
        throw new Error("Método enviar() debe ser implementado.");
    }

    /**
     * Solicita datos desde una fuente y los devuelve como señal.
     *
     * Las implementaciones en entornos asíncronos (navegador, Node.js)
     * devolverán una `Promise` que resuelve a la `Senal`. En entornos
     * síncronos (PHP) la devolución es directa.
     *
     * @param {string} fuente Identificador de la fuente (ruta, URL…).
     * @returns {Senal|Promise<Senal>}
     * @since 1.3.3
     * @version 1.4.7
     */
    solicitar(fuente) {
        throw new Error("Método solicitar() debe ser implementado.");
    }

    /**
     * Escucha eventos o mensajes entrantes (modo suscripción).
     *
     * @param {Function} callback Función que se ejecutará al recibir un mensaje.
     * @returns {void}
     * @since 1.3.3
     */
    escuchar(callback) {
        throw new Error("Método escuchar() debe ser implementado.");
    }

    /**
     * Cierra los recursos del comunicador.
     * @returns {void}
     * @since 1.3.3
     */
    cerrar() {
        throw new Error("Método cerrar() debe ser implementado.");
    }

    /**
     * Devuelve el estado actual del comunicador.
     * @returns {string}
     * @since 1.3.3
     */
    estado() {
        throw new Error("Método estado() debe ser implementado.");
    }

    /**
     * Configura la autenticación del comunicador.
     *
     * @param {Object} opciones Opciones que se pasarán a enviar/solicitar.
     * @returns {void}
     * @since 1.3.3
     */
    autenticar(opciones) {
        // Implementación opcional.
    }

    /**
     * Establece credenciales u otros parámetros de autenticación.
     *
     * @param {Object} credenciales Datos necesarios para autenticarse.
     * @returns {void}
     * @since 1.3.3
     */
    establecer_credenciales(credenciales) {
        // Implementación opcional.
    }
}

export { Comunicador };