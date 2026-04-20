/**
 * Interfaz que define el acceso a los nodos especiales
 *
 * Define los métodos que permiten interactuar con el conjunto de nodos especiales.
 * Los nodos especiales forman una colección separada de la superestructura.
 * 
 * Estos métodos son implementados por la clase {@link Nodos.Nodo Nodo}.
 *
 * @interface
 * @since V3.2.4
 * @memberof Nodos.Interfaces
 */
class AccesoAEspeciales {
    /**
     * Indica si existen nodos especiales registrados.
     * @returns {boolean} `true` si hay nodos especiales, `false` en caso contrario.
     */
    static hay_nodos_especiales(){
         throw new Error("Método hay_nodos_especiales() debe ser implementado por la clase que herede.");
    }

    /**
     * Ejecuta una función sobre cada nodo especial.
     *
     * Permite recorrer todos los nodos marcados como especiales y
     * aplicar una función personalizada sobre cada uno de ellos.
     *
     * @param {Function} funcion - Función a ejecutar por cada nodo.
     * @param {...any} parametros - Parámetros adicionales a pasar a la función.
     * @returns {?Map<string, any>} Resultados obtenidos o `null` si no hay nodos especiales.
     */
    static por_cada_nodo_especial_ejecutar(funcion, ...parametros) {
         throw new Error("Método por_cada_nodo_especial_ejecutar() debe ser implementado por la clase que herede.");
    }
}

export {AccesoAEspeciales}