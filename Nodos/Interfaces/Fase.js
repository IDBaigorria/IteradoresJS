/**
 * Interfaz que define el manejo de fase en un nodo.
 *
 *
 * @interface
 * @since V1.2.0
 * @memberof Nodos.Interfaces
 */
class Fase {
    // ================== ESTÁTICOS ==================
    /**
     * Establece la fase en la que van a trabajar todos los nodos.
     * Se necesita acceso autorizado por token.
     *
     * @param {String} token Token de autorización
     * @param {String} fase  Nombre de la nueva fase
     * @throws {Error} Debe ser implementado por la clase que herede.
     */
    static _fase(token, fase) {
        throw new Error("Método _fase() debe ser implementado por la clase que herede.");
    }

    /**
     * Devuelve la fase actual de trabajo (global).
     * No requiere token.
     *
     * @returns {String}
     * @throws {Error} Debe ser implementado por la clase que herede.
     */
    static fase() {
        throw new Error("Método fase() debe ser implementado por la clase que herede.");
    }

    /**
     * Ejecuta una función por cada fase registrada en el sistema (global).
     * Requiere token de seguridad.
     *
     * @param {string} token   Token de autorización
     * @param {Function} funcion Función que recibe (fase: string) => void
     * @returns {void}
     * @throws {Error} Debe ser implementado por la clase que herede.
     * @since V1.2.6
     */
    static por_cada_fase_global_ejecutar(token, funcion) {
        throw new Error("Método por_cada_fase_global_ejecutar() debe ser implementado por la clase que herede.");
    }

    // ================== INSTANCIA ==================
    /**
     * Ejecuta una función por cada fase en la que el nodo tiene actividad.
     * Requiere token de seguridad.
     *
     * @param {String} token   Token de autorización
     * @param {Function} funcion Función a ejecutar en cada fase (recibe el nombre de la fase)
     * @returns {void}
     * @throws {Error} Debe ser implementado por la clase que herede.
     */
    por_cada_fase_ejecutar(token, funcion) {
        throw new Error("Método por_cada_fase_ejecutar() debe ser implementado por la clase que herede.");
    }
}

export { Fase };