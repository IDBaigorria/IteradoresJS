/**
 * Interfaz que define el acceso a los nodos en la superestructura
 *
 * Define los métodos que permiten interactuar con la superestructura global de nodos.
 * La superestructura es un contenedor estático (Map) que mantiene referencias a todos los nodos existentes.
 *
 * 
 * Estos métodos son implementados por la clase {@link Nodos.Nodo Nodo}.
 *
 * @interface
 * @since V3.2.4
 * @memberof Nodos.Interfaces
 */
class AccesoASuperestructura {
    /**
     * Determina si existen nodos en la superestructura.
     *
     * Indica si el mapa global `superestructura` contiene nodos registrados actualmente.
     *
     * @return {boolean} `true` si existen nodos, `false` si está vacía.
     */
    static hay_nodos_en_superestructura() {
        throw new Error("Método hay_nodos_en_superestructura() debe ser implementado por la clase que herede.");
    }

    /**
     * Obtiene un nodo existente por su identificador.
     *
     * Devuelve el nodo registrado con el id indicado dentro de la superestructura,  
     * o `null` si no se encuentra.
     *
     * @param {string} id Identificador del nodo que se desea recuperar.
     * @return {?Nodos.Nodo} El nodo correspondiente o `null` si no existe.
     */
    static nodo_por_id(id) {
        throw new Error("Método nodo_por_id() debe ser implementado por la clase que herede.");
    }

    /**
     * Ejecuta una función sobre cada nodo existente en la superestructura.
     * @param {Function} funcion    Función a ejecutar para cada nodo.
     * @param {...*} parametros     Parámetros adicionales opcionales.
     * @returns {?Map<string, *>}   Resultados devueltos por cada ejecución o `null` si no hay nodos.
     */
    static por_cada_nodo_ejecutar(token, funcion, ...parametros) {
        throw new Error("Método por_cada_nodo_ejecutar() debe ser implementado por la clase que herede.");
    }
    
    /**
     * Vacía la superestructura de nodos.
     * 
     * @param {symbol} token - Token de autenticación que autoriza la operación.
     * 
     * @returns {boolean|null} Devuelve `true` si la estructura fue vaciada,
     * o `null` si el acceso fue rechazado por token inválido.
     * 
     * @contract
     * - El método debe eliminar todas las referencias a nodos y enlaces actuales.
     * - Debe restablecer los contadores y colecciones internas.
     * - No debe alterar el estado si la autenticación falla.
     */
    vaciar_superestructura(token) {
        throw new Error("Método no implementado: vaciar_superestructura()");
    }
}

export {AccesoASuperestructura}