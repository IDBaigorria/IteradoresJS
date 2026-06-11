/**
 * Define el contrato mínimo que debe cumplir un comando ejecutable.
 *
 * Cada comando del sistema implementa esta interfaz, lo que permite
 * que el {@link Controlador} lo registre y ejecute sin conocer su
 * lógica interna.
 *
 * Un comando puede declarar si solo está disponible en desarrollo
 * y, opcionalmente, proporcionar una función de reversa para
 * deshacer sus efectos.
 *
 * @interface
 * @memberof Nucleo.Interfaces
 * @since 1.3.1
 */
class Comando {
    /**
     * Nombre único del comando (ej. 'debug:imprimir').
     * @returns {string}
     */
    static nombre() {
        throw new Error("Método nombre() debe ser implementado.");
    }

    /**
     * Indica si el comando solo debe registrarse en entorno de desarrollo.
     * @returns {boolean}
     */
    static solo_desarrollo() {
        throw new Error("Método solo_desarrollo() debe ser implementado.");
    }

    /**
     * Ejecuta la lógica del comando.
     *
     * @param {string} token Token de seguridad.
     * @param {...*} args Argumentos adicionales.
     * @returns {*} Resultado de la ejecución.
     */
    ejecutar(token, ...args) {
        throw new Error("Método ejecutar() debe ser implementado.");
    }

    /**
     * Proporciona una función de reversa, o `null` si no es reversible.
     *
     * @returns {Function|null}
     */
    reversa() {
        throw new Error("Método reversa() debe ser implementado.");
    }
}

export { Comando };