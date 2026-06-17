/**
 * Define el contrato mínimo que debe cumplir un comunicador.
 *
 * Un comunicador es un componente capaz de enviar y recibir datos,
 * opcionalmente convertirlos en nodos (a futuro), y gestionar su
 * propia autenticación si es necesario.
 *
 * @interface
 * @memberof Comunicadores
 * @since 1.3.3
 */
class Comunicador {
    /**
     * Nombre único del comunicador (ej. 'http', 'salida_estandar').
     * @returns {string}
     */
    static nombre() {
        throw new Error("Método nombre() debe ser implementado.");
    }

    /**
     * Indica si el comunicador solo debe estar disponible en desarrollo.
     * @returns {boolean}
     */
    static solo_desarrollo() {
        throw new Error("Método solo_desarrollo() debe ser implementado.");
    }

    /**
     * Breve descripción del comunicador.
     * @returns {string}
     */
    static descripcion() {
        throw new Error("Método descripcion() debe ser implementado.");
    }

    /**
     * Envía datos al destino especificado.
     *
     * @param {string} destino   Destino del mensaje.
     * @param {*}      mensaje   Datos a enviar.
     * @param {Object} [opciones={}] Opciones adicionales.
     * @returns {void}
     */
    enviar(destino, mensaje = null, opciones = {}) {
        throw new Error("Método enviar() debe ser implementado.");
    }

    /**
     * Envía datos y espera una respuesta.
     *
     * @param {string} destino   Destino del mensaje.
     * @param {*}      mensaje   Datos a enviar.
     * @param {Object} [opciones={}] Opciones adicionales.
     * @returns {*} Respuesta recibida.
     */
    solicitar(destino, mensaje = null, opciones = {}) {
        throw new Error("Método solicitar() debe ser implementado.");
    }

    /**
     * Escucha eventos o mensajes entrantes (modo suscripción).
     *
     * @param {Function} callback Función que se ejecutará al recibir un mensaje.
     * @returns {void}
     */
    escuchar(callback) {
        throw new Error("Método escuchar() debe ser implementado.");
    }

    /**
     * Cierra los recursos del comunicador.
     * @returns {void}
     */
    cerrar() {
        throw new Error("Método cerrar() debe ser implementado.");
    }

    /**
     * Devuelve el estado actual del comunicador.
     * @returns {string}
     */
    estado() {
        throw new Error("Método estado() debe ser implementado.");
    }

    /**
     * Configura la autenticación del comunicador.
     *
     * @param {Object} opciones Opciones que se pasarán a enviar/solicitar.
     * @returns {void}
     */
    autenticar(opciones) {
        // Implementación opcional: por defecto no hace nada.
    }

    /**
     * Establece credenciales u otros parámetros de autenticación.
     *
     * @param {Object} credenciales Datos necesarios para autenticarse.
     * @returns {void}
     */
    establecer_credenciales(credenciales) {
        // Implementación opcional.
    }
}

export { Comunicador };